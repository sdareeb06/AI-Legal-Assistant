import os
os.environ['HF_HUB_OFFLINE'] = '1'
import re
import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from groq import Groq
import json
from fpdf import FPDF
import base64
from docx import Document

# ─────────────────────────────────────────────
# 1. Groq Client Setup
# ─────────────────────────────────────────────
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)
GROQ_MODEL = "llama-3.1-8b-instant"

# ─────────────────────────────────────────────
# 2. Legal-BERT & FAISS Setup
# ─────────────────────────────────────────────
print("Loading Legal-BERT & FAISS Index...")
embedding_model = SentenceTransformer('nlpaueb/legal-bert-base-uncased')
index = faiss.read_index('ai_models/laws_index.faiss')

with open('ai_models/laws_metadata.pkl', 'rb') as f:
    metadata = pickle.load(f)['metadata']


# ─────────────────────────────────────────────
# FAISS Search — Distance Threshold
# ─────────────────────────────────────────────
def search_relevant_laws(query, top_k=5, distance_threshold=1.2):
    query_embedding = embedding_model.encode([query])
    query_array = np.array(query_embedding).astype('float32')
    faiss.normalize_L2(query_array)
    distances, indices = index.search(query_array, top_k)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx == -1:
            continue
        if dist > distance_threshold:
            continue
        meta = metadata[idx]
        results.append({
            "topic": meta.get("topic"),
            "summary": meta.get("summary"),
            "distance": float(dist)
        })

    results.sort(key=lambda x: x["distance"])
    return results[:3]


def detect_language(text):
    text = text.lower().strip()
    
    # Removed overlapping English words: 'he', 'me', 'please'
    urdu_words = [
        'hai', 'hain', 'nahi', 'nai', 'kar', 'karo', 'karna', 'kya',
        'ka', 'ki', 'ko', 'mein', 'se', 'mera', 'mere', 'meri', 'mujhe',
        'ghr', 'ghar', 'gaya', 'gayi', 'masla', 'hua', 'ho', 'aur', 'chahiye',
        'batao', 'kese', 'kaise', 'kab', 'kahan', 'kon', 'yeh', 'ye', 'wo',
        'hoga', 'saboot', 'bhai', 'yaar', 'ap', 'aap', 'tou', 'toh'
    ]
    
    words_in_text = text.split()
    score = sum(1 for word in words_in_text if word in urdu_words)
    
    # Check for actual Urdu/Arabic script OR if at least 2 Roman Urdu words are found
    if re.search(r'[\u0600-\u06FF]', text) or score >= 2:
        return "roman_urdu"
        
    return "english"

# ─────────────────────────────────────────────
# ROMAN URDU LANGUAGE RULES — SHARED
# ─────────────────────────────────────────────
URDU_LANGUAGE_RULES = """
ROMAN URDU KE QAWAID — LAAZMI, KOI EXCEPTION NAHI:

ZABAAN KA ASOOL: Yeh system Pakistani logo ke liye hai. Sirf woh alfaaz likhne hain
jo ek aam Pakistani roz bolta aur samajhta hai — Urdu/Arabic/Persian origin ke alfaaz.
Hindi ya Sanskrit ke alfaaz BILKUL MANA HAIN — chahe ek baar bhi nahi.

MANA ALFAAZ — HINDI/SANSKRIT (KABHI NAHI LIKHNA):
tathya, kripya, praman, adhikar, sambhavna, yadi, kintu, parantu,
aashwasan, avashyakta, vyakti, kshamata, vastav, sthiti, nirdesh, prastut,
nyay, suraksha, jankari, prakriya, upay, vivaran, nirpeksh, prashn,
uttardayi, samasya, nivedan, ucchit, karyvahi, avedak, pratinidhitva,
nyayalay, parivahan, parivar, sahayata, sambandh, vishay, anusandhan,
gyaan, labh, suchna, prabhavit, samajh, vichar, sthapit, nirdharan,
mukammal, aadhar, takleef → dard likhna, pareshani → mushkil likhna.

SAHIH ALFAAZ — PAKISTANI URDU (YAHI LIKHNA HAI):
saboot (evidence), madad (help), haqooq (rights), agar (if), lekin (but),
qanoon (law), adalat (court), gawah (witness), muqadma (case), sazaa (punishment),
dastawezaat (documents), ilzaam (allegation), waqia (incident), insaaf (justice),
qaid (imprisonment), muttaham (accused), darkhwast (application), jawab (response),
masla (problem), taklif (difficulty), izaazat (permission), khabar (news/information),
zimmedari (responsibility), tareeqa (method), tafseelaat (details), shikayat (complaint),
hifazat (protection), rishtedaar (family/relatives), mutaliq (related to), faisla (decision),
tajwez (suggestion), wajah (reason), farq (difference), nuksan (loss/harm), faida (benefit).

ZABAAN TEST — HAR JAWAB SE PEHLE KHUD SE PUCHHO:
"Kya yeh lafz ek Pakistani bolta hai?" — agar shak ho toh Urdu/English badal.
Agar koi legal term Roman Urdu mein mushkil lage toh seedha English likhna
(maslan: "bail", "FIR", "Section 302", "cross-examination") — Hindi NAHI.

TONE: Ek samajhdar Pakistani wakeel dost ki tarah — seedha, saaf, warm.
"""


# ─────────────────────────────────────────────
# 3. System Prompt — Fully Rewritten
# ─────────────────────────────────────────────
def get_system_prompt(language, role="victim", is_scoring=False, matched_laws=None):

    # ── SHARED CORE RULES (Dynamic Based on Language) ────────────
    if language == "roman_urdu":
        core_rules = """
LAAZMI QAWAID — KOI EXCEPTION NAHI:

[R1] REPETITION ZERO: Ek idea sirf ek baar likhna hai. Dobara likhna, paraphrase karna,
     ya alag alfaaz mein wahi baat kehna — sab mana hai. Ek bullet = ek naya point.

[R2] BULLETS: MAX 3 bullets per heading. Teesre ke baad ruk jaana.

[R3] WORD LIMIT: Poora jawab 400 words se kam hona chahiye.

[R4] NO MARKDOWN: Koi **, ##, ya * nahi. Headings CAPS mein. Bullets sirf dash (-) se.

[R5] HISTORY: "Pichli Chat" yaad rakhna. "As I said before" kabhi mat likhna.

[R6] GREETING ONLY (Hi/Hello/Kese ho): Sirf yeh likho aur ruk jao:
     "Main aapka case gehrai se dekh raha hun aur aapki privacy ka poora khyal rakh raha hun — apna masla batayein."
"""
    else:
        core_rules = """
STRICT RULES — NO EXCEPTIONS:

[R1] ZERO REPETITION: State an idea only once. Do not paraphrase or repeat the same thing in different words. One bullet = one new point.

[R2] BULLETS: MAX 3 bullets per heading. Stop after the third.

[R3] WORD LIMIT: Keep the entire response under 400 words.

[R4] NO MARKDOWN: No **, ##, or *. Headings in CAPS. Bullets use dashes (-).

[R5] HISTORY: Remember chat history. Never write "As I said before".

[R6] GREETING ONLY (Hi/Hello/How are you): Only write this and stop:
     "Hello! I specialize in Pakistani Law. Please share your legal concern and I will guide you fully."
"""

    # ── SCORING MODE ──────────────────────────────────────────────
    if is_scoring and role == "lawyer":
        lang_label = "Roman Urdu" if language == "roman_urdu" else "English"
        return f"""You are an elite Pakistani Legal AI.
{core_rules}

TASK: Case Win Probability Assessment.
OUTPUT: ONLY a strict JSON object. No preamble, no commentary, no markdown.

SCORING RULES:
- If user has mentioned specific evidence (CCTV, witnesses, medical reports, FIR copy, screenshots, documents, recordings) — evidence_score MUST be 70 or above.
- Each piece of concrete evidence mentioned adds +8 to caseStrength (max cap 95).
- No evidence mentioned = evidence_score between 20-40.
- Be realistic but reward users who share strong evidence details.

JSON FORMAT:
{{
    "caseStrength": <number 1-100>,
    "breakdown": {{
        "delay_score": <number 0-100>,
        "evidence_score": <number 0-100>,
        "witness_score": <number 0-100>
    }},
    "diagnosis": "2-line case diagnosis in {lang_label} — strengths aur weaknesses",
    "reasoning": "2-line strategic advice in {lang_label}",
    "recommendations": ["Concrete action 1", "Concrete action 2"]
}}
"""

    # ── LAW CONTEXT BLOCK (For display in prompt) ─────────────────
    law_context_hint = ""
    if matched_laws:
        law_names = [f"{law['topic']}" for law in matched_laws[:3]]
        if language == "roman_urdu":
            law_context_hint = f"\nMATCHED LAWS FROM DATABASE: {', '.join(law_names)}\nIn hawaale zaroor use karo — user ko ye dekhna pasand aata hai ke uske case se milte qawaneen mile.\n"
        else:
            law_context_hint = f"\nMATCHED LAWS FROM DATABASE: {', '.join(law_names)}\nYou must reference these laws explicitly in your response.\n"

    # ── LAWYER MODE ───────────────────────────────────────────────
    if role == "lawyer":
        if language == "roman_urdu":
            return f"""Aap aik experienced Pakistani wakeel ke "Co-Counsel" hain — unke sath saath kaam karte hain.
{core_rules}
{URDU_LANGUAGE_RULES}
{law_context_hint}

KAAM KA TARIKA:
- Pehle qanooni hawaale — PPC/CrPC sections ke naam, unke ingredients, prove karne ki zaroorat.
- Phir practical strategy — court mein kya karna, agla qadam, weaknesses kahan hain.

CASE DIAGNOSIS: Hamesha ek short diagnosis section dena — case ki strength aur weakness kya hai.
ENGAGEMENT RULE: Har response ke aakhir mein ek specific follow-up question puchho jo case ko aage le jaye.

FORMAT — BILKUL AISA LIKHO, koi heading dobara mat dohraao, koi markdown nahi:

CASE DIAGNOSIS:
- (Case ki strength ya weakness — max 2 bullets, direct aur honest)

QANOONI HAWAALE:
- (Applicable PPC/CrPC section + uska ingredient + kya prove karna hoga — max 3 bullets)

STRATEGY AUR AGLA QADAM:
- (Court process ya practical move — max 3 bullets)

ZAROORI SABOOT:
- (Jo document ya cheez abhi secure karni hai — max 3 bullets)

FOLLOW-UP SAWAL:
(Sirf ek specific question — jo case ko clarify kare ya aage le jaye)

(Yahan seedha yeh line likho, koi naya heading ya label nahi):
Agar is case se mutalliq kuch aur jaanna chahte hain ya koi baat share karni ho, zaroor batayein — aapki har baat yahan bilkul mahfooz hai.

[R-END] Upar di gayi 5 headings ke baad KUCH NAHI likhna — na "Note:", na "Remember:", na koi summary, na koi heading dobara. Sirf closing line aur bas.]
"""
        else:
            return f"""You are a Co-Counsel assisting a practicing Pakistani lawyer.
{core_rules}
{law_context_hint}

WORKING METHOD:
- Lead with law — PPC/CrPC sections, their ingredients, what must be proven.
- Follow with practical strategy — procedural moves, court steps, risk areas.

CASE DIAGNOSIS: Always include a short honest diagnosis of case strength/weakness.
ENGAGEMENT RULE: End every response with one specific follow-up question to advance the case.

FORMAT — EXACTLY THIS, do not repeat any heading, no markdown:

CASE DIAGNOSIS:
- (Case strength and weakness — max 2 bullets, direct and honest)

LEGAL REFERENCES:
- (PPC/CrPC section name + its ingredients + what must be proven — max 3 bullets)

STRATEGY & NEXT STEPS:
- (Procedural moves and practical court steps — max 3 bullets)

EVIDENCE REQUIRED:
- (Documents or items to secure immediately — max 3 bullets)

FOLLOW-UP QUESTION:
(Exactly one specific question to clarify or advance the case)

(Write this line here directly, no new heading or label):
If there is anything further you would like to discuss about this case, please do not hesitate — everything shared here remains strictly confidential.

[R-END] After the 5 headings above, write NOTHING else — no "Note:", no summary, no repeated heading. Only the closing line and stop.]
"""

    # ── VICTIM MODE ───────────────────────────────────────────────
    else:
        if language == "roman_urdu":
            return f"""Aap aik pareshan insaan ki madad kar rahe hain — shayad bohot ghabra hua ho ya dara hua ho.
Aapka kaam hai ke is insaan ko seedha, saaf, aur warm tarike se guide karo — ek trusted bhai ya chacha ki tarah.
{core_rules}
{URDU_LANGUAGE_RULES}
{law_context_hint}

KAAM KA TARIKA:
- Pehle relevant qanooni sections — FIR ka tarika, haqooq, procedure. Yahi asli madad hai.
- Phir practical steps — victim ko abhi kya karna chahiye, kahan jana hai, kya kehna hai.

CASE DIAGNOSIS: Hamesha ek diagnosis dena — victim ki situation kya hai, qanoon uski kaise madad kar sakta hai.
EMPATHY RULE: Pehli line warm honi chahiye — ek insaan ki tarah feel karo — phir seedha qanoon par aao.
ENGAGEMENT RULE: Jawab ke aakhir mein ek aisa sawal puchho jisse victim aur detail share kare — case strong hoga.
HONESTY RULE: Jhooth ummeed mat do. Agar case mein mushkil ho toh seedha bata do — lekin saath solution bhi do.

FORMAT — BILKUL AISA LIKHO, koi heading dobara mat dohraao, koi markdown nahi:

AAPKI SITUATION:
- (Victim ki baat apne alfaaz mein — max 2 bullets, warm aur clear)

CASE DIAGNOSIS:
- (Is case mein qanoon kaise help kar sakta hai — aur kya mushkil hai — max 2 bullets)

QANOONI HAQOOQ AUR RAHNUMAI:
- (Relevant PPC/CrPC sections ke naam + ek line explanation — max 3 bullets)

ABHI KYA KARO:
- (Fori actionable steps — max 3 bullets, seedhe aur practical)

ZAROORI SABOOT:
- (Jo cheez abhi sambhalni hai — max 3 bullets)

AAPKE LIYE SAWAL:
(Sirf ek warm, specific sawal — jo case ko aur clear kare)

(Yahan seedha yeh line likho, koi naya heading ya label nahi):
Agar is case se mutalliq kuch aur jaanna chahte hain ya kuch puchna chahte hain — zaroor batayein, qanoon ke mutabiq aapki privacy ka poora khyal rakha jaega.

[R-END] Upar di gayi headings ke baad KUCH NAHI likhna — na "Note:", na "Remember:", na koi summary, na koi heading dobara. Sirf closing line aur bas.]
"""
        else:
            return f"""You are helping a distressed victim — they may be scared, confused, or overwhelmed.
Your job is to guide them like a trusted advisor: warm, direct, and genuinely helpful.
{core_rules}
{law_context_hint}

WORKING METHOD:
- Lead with law — relevant PPC/CrPC sections, FIR process, legal rights. This is the real help.
- Follow with practical action — what the victim should do right now, step by step.

CASE DIAGNOSIS: Always include a diagnosis — how the law applies to their situation and what challenges exist.
EMPATHY RULE: One warm opening line, then move immediately to legal facts.
ENGAGEMENT RULE: End with one question that helps you understand the case better.
HONESTY RULE: Do not give false hope. If there are difficulties, state them clearly — but always follow with a solution path.

FORMAT — EXACTLY THIS, do not repeat any heading, no markdown:

YOUR SITUATION:
- (Restate their situation in your own words — max 2 bullets, warm and clear)

CASE DIAGNOSIS:
- (How the law applies and what challenges exist — max 2 bullets)

YOUR LEGAL RIGHTS:
- (Relevant PPC/CrPC section names + one-line explanation — max 3 bullets)

WHAT TO DO NOW:
- (Immediate practical steps — max 3 bullets, specific and actionable)

EVIDENCE TO PRESERVE:
- (What to secure right now — max 3 bullets)

ONE QUESTION FOR YOU:
(One warm, specific question to help understand the case better)

(Write this line here directly, no new heading or label):
If you have any further questions about this matter or wish to share more details, please feel free — your privacy is fully protected under our legal guidelines.

[R-END] After the headings above, write NOTHING else — no "Note:", no summary, no repeated heading. Only the closing line and stop.]
"""


# ─────────────────────────────────────────────
# 4. Main Execution Function
# ─────────────────────────────────────────────
def generate_legal_advice(query, force_english=False, role="victim", is_scoring=False):

    search_query = query
    if "Client ka Naya Message:\n" in query:
        search_query = query.split("Client ka Naya Message:\n")[-1].strip()

    language = "english" if force_english else detect_language(search_query)

    # Step B: Search & Filter Laws
    retrieved_laws = search_relevant_laws(search_query, top_k=5, distance_threshold=1.2)
    NOISE_WORDS = ['estacode', 'essay', 'viva voce', 'administrative service']
    filtered_laws = [
        law for law in retrieved_laws
        if not any(w in (str(law['topic']) + " " + str(law['summary'])).lower() for w in NOISE_WORDS)
    ]

    # Pass matched laws INTO the system prompt so AI actively uses them
    system_prompt = get_system_prompt(language, role, is_scoring, matched_laws=filtered_laws)

    # Step C: Build Context Text — Richer Format
    if not filtered_laws:
        context_text = (
            "NOTE: No direct law match found in database for this query. "
            "Use your knowledge of PPC/CrPC to provide the best general guidance."
        )
    else:
        context_text = "MATCHED LAWS FROM PAKISTAN DATABASE (Reference these by name in your response):\n"
        for i, law in enumerate(filtered_laws):
            match_quality = "STRONG MATCH" if law['distance'] < 0.6 else "RELEVANT MATCH" if law['distance'] < 0.9 else "PARTIAL MATCH"
            context_text += (
                f"\n[Law {i+1} — {match_quality}]\n"
                f"Topic: {law['topic']}\n"
                f"Summary: {law['summary']}\n"
                f"Relevance Score: {round((1 - law['distance']) * 100)}%\n"
            )

    # Step D: User Prompt
    if is_scoring:
        # Detect evidence keywords to hint the model
        evidence_keywords = ['cctv', 'witness', 'gawah', 'medical', 'report', 'screenshot',
                             'recording', 'document', 'dastawez', 'saboot', 'fir', 'photo',
                             'video', 'audio', 'receipt', 'proof', 'evidence', 'test', 'lab']
        found_evidence = [kw for kw in evidence_keywords if kw in query.lower()]
        evidence_hint = f"\nEVIDENCE DETECTED IN CASE: {', '.join(found_evidence)}" if found_evidence else "\nNO SPECIFIC EVIDENCE MENTIONED."

        user_prompt = (
            f"CASE FACTS FOR SCORING:\n{query}\n\n"
            f"{context_text}"
            f"{evidence_hint}"
        )
    else:
        user_prompt = (
            f"User Query & Conversation History:\n{query}\n\n"
            f"{context_text}\n\n"
            f"INSTRUCTION: Respond in {language.upper()}. "
            f"Mention matched law names explicitly in your response. "
            f"Follow the format in your instructions exactly."
        )

    # Step E: Groq API Call
    try:
        chat_completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            temperature=0.25,
            max_tokens=750,
            frequency_penalty=0.8,
            presence_penalty=0.6
        )
        advice = chat_completion.choices[0].message.content
        advice = advice.replace("**", "").replace("##", "").replace("*", "")

        if is_scoring:
            try:
                clean_json = advice.replace("```json", "").replace("```", "").strip()
                parsed_score = json.loads(clean_json)
                return {"is_json": True, "data": parsed_score}
            except Exception as json_e:
                print(f"JSON Parsing Error: {json_e}\nRaw: {advice}")
                advice = "Score generate karne mein masla hua. Thodi aur details dijiye."

    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        print(f"Groq API Error — {error_type}: {error_msg}")

        if "authentication" in error_msg.lower() or "401" in error_msg:
            advice = "API key expired ya galat hai. GROQ_API_KEY update karein."
        elif "rate_limit" in error_msg.lower() or "429" in error_msg:
            advice = "Rate limit aa gayi. Thodi der baad dobara try karein."
        elif "model" in error_msg.lower() or "404" in error_msg:
            advice = f"Model '{GROQ_MODEL}' nahi mila. console.groq.com check karein."
        elif "timeout" in error_msg.lower():
            advice = "Request timeout ho gayi. Internet connection check karein."
        else:
            advice = f"System Error ({error_type}): {error_msg}"

        return {
            "is_json": False,
            "advice": advice,
            "language": language if 'language' in locals() else "english",
            "matched_sections": [],
            "recommendations": []
        }

    return {
        "is_json": False,
        "advice": advice,
        "language": language,
        "matched_sections": [law['topic'] for law in filtered_laws],
        "matched_laws_detail": [
            {
                "topic": law['topic'],
                "summary": law['summary'],
                "relevance_pct": round((1 - law['distance']) * 100)
            }
            for law in filtered_laws
        ],
        "recommendations": [law['summary'] for law in filtered_laws]
    }


# ─────────────────────────────────────────────
# 5. Legal Draft Generator — Context-Aware
# ─────────────────────────────────────────────
def generate_legal_draft(draft_request_text, case_context: str = ""):
    """
    draft_request_text : What to draft (e.g. "bail application")
    case_context       : Full conversation / case summary from frontend.
    """

    context_block = ""
    if case_context and case_context.strip():
        context_block = f"""
CASE CONTEXT (Extract all facts to fill the draft):
{case_context.strip()}

Use facts from above for placeholders like [Name], [Date], [Accused Name], [Incident].
If a fact is missing, leave blank (______) — never guess or fabricate.
"""

    prompt = f"""You are an expert Pakistani lawyer drafting a formal legal document.

DOCUMENT REQUESTED: {draft_request_text}
{context_block}
STRICT RULES:
1. Use standard Pakistani court format: 'IN THE COURT OF...', 'Respectfully Sheweth', 'PRAYER'.
2. ABSOLUTELY NO MARKDOWN. No **, no ##, no *.
3. For missing information, use blanks like [Name] or _______.
4. Output ONLY the final draft. No explanation, no commentary.
5. Reflect all facts from the case context above.
6. Language: Formal legal English (standard Pakistani court language).
"""

    try:
        chat_completion = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1500
        )
        draft_text = chat_completion.choices[0].message.content
        draft_text = draft_text.replace("**", "").replace("##", "").replace("*", "")

        doc = Document()
        doc.add_paragraph(draft_text)

        temp_filename = "temp_draft.docx"
        doc.save(temp_filename)

        with open(temp_filename, "rb") as doc_file:
            doc_base64 = base64.b64encode(doc_file.read()).decode('utf-8')

        os.remove(temp_filename)

        query_lower = draft_request_text.lower()
        if "bail" in query_lower:
            doc_title = "Bail_Application"
        elif "witness" in query_lower:
            doc_title = "Witness_Statement"
        elif "complaint" in query_lower:
            doc_title = "Police_Complaint"
        elif "appeal" in query_lower:
            doc_title = "Appeal_Draft"
        elif "injunction" in query_lower:
            doc_title = "Injunction_Application"
        else:
            doc_title = "Legal_Draft"

        return {
            "status": "success",
            "title": f"{doc_title}.docx",
            "base64": doc_base64
        }

    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        print(f"Drafting Error — {error_type}: {error_msg}")
        return {"status": "error", "message": f"{error_type}: {error_msg}"}