import edge_tts
import asyncio
import os
import uuid
import speech_recognition as sr
from django.conf import settings

# 1. Voice to Text (Browser se aayi hui audio ko text mein badalna)
def convert_audio_to_text(audio_path, language_code='ur-PK'):
    r = sr.Recognizer()
    with sr.AudioFile(audio_path) as source:
        audio = r.record(source)
    try:
        return r.recognize_google(audio, language=language_code)
    except:
        return None

# 2. Text to Voice (Reply ko MP3 banana)
async def text_to_speech_file(text, language):
    voice = "ur-PK-AsadNeural" if language == "roman_urdu" else "en-GB-RyanNeural"
    file_name = f"voice_{uuid.uuid4().hex}.mp3"
    # Media folder mein save karna
    file_path = os.path.join(settings.MEDIA_ROOT, file_name)
    
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(file_path)
    
    return f"{settings.MEDIA_URL}{file_name}"