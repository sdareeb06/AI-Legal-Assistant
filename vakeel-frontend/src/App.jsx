import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scale, Mail, Lock, User, ArrowRight, MessageSquare, Send, LogOut, CheckCircle2, Mic, Paperclip, FileText, Gavel, FileWarning, Radio, PhoneOff, Settings, X, ShieldCheck, FileSearch, FolderOpen, Briefcase, FileSignature, Search, Download, HeartHandshake, Loader2, Globe, AlertCircle, BrainCircuit, TrendingUp, ListChecks, FileUp, UploadCloud, Stethoscope, BookOpen, ShieldAlert, Languages, Eye, EyeOff, FileX, ArrowLeft, MessageCircle, RefreshCw, PanelLeftClose, PanelLeftOpen, Plus, Users, Trash2, CalendarDays, Siren, Key, LockKeyhole, FileEdit, PhoneCall, MapPin, Save, Clock, AlertTriangle, Bell, ChevronDown } from 'lucide-react';
import HologramAvatar from './components/HologramAvatar';

// ─── LANGUAGE DETECTION ─────────────────────────────────────
const detectUserLang = (text) => {
  if (!text) return 'english';
  const urduChars = /[\u0600-\u06FF]/;
  const romanUrduWords = ['kya','hai','mujhe','aap','hoon','nahi','karein','mere','apna','yeh','woh','main','hum','tum','iska','uska','teri','meri','phir','baat','case','qanoon','masla','wakeel','fir','aur','tha','tha','thi','gaya','gai','raha','rahi','karo','suno','batao','lagao','likhna','poochna'];
  const lower = text.toLowerCase();
  if (urduChars.test(text)) return 'roman_urdu';
  const words = lower.split(/\s+/);
  const hits = romanUrduWords.filter(w => words.includes(w)).length;
  return hits >= 2 ? 'roman_urdu' : 'english';
};

// ─── TYPING EFFECT ──────────────────────────────────────────
const TypingEffect = ({ text, onComplete, forceStop }) => {
  const [displayed, setDisplayed] = useState('');
  const iRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    iRef.current = 0;
    setDisplayed('');
    timerRef.current = setInterval(() => {
      setDisplayed(text.slice(0, iRef.current + 1));
      iRef.current++;
      if (iRef.current > text.length) { 
        clearInterval(timerRef.current); 
        if (onComplete) onComplete(text); 
      }
    }, 15); 
    return () => clearInterval(timerRef.current);
  }, [text]);

  useEffect(() => {
     if (forceStop && timerRef.current) {
         clearInterval(timerRef.current);
         if (onComplete) onComplete(text.slice(0, iRef.current));
     }
  }, [forceStop, text, onComplete]);

  return <>{displayed}</>;
};

// ─── AI MESSAGE CARD ────────────────────────────────────────
const AiMessageCard = ({ msg, onOptionClick, forceStop, onTypingComplete }) => {
  const [typingDone, setTypingDone] = useState(!msg.animate);
  const [stoppedText, setStoppedText] = useState(null);

  useEffect(() => {
    if (!msg.animate && onTypingComplete) {
      onTypingComplete();
    }
  }, [msg.animate, onTypingComplete]);

  return (
    <div className="p-6 rounded-2xl text-[13px] leading-relaxed shadow-xl max-w-[85%] bg-zinc-900/80 text-zinc-300 border border-zinc-800 rounded-tl-none">
      <div className="whitespace-pre-wrap">
        {msg.status === 'loading' ? (
           <span className="flex items-center gap-2 text-[#B8860B] font-bold tracking-widest uppercase text-[10px] animate-pulse">
             <Loader2 size={16} className="animate-spin"/> {msg.text}
           </span>
        ) : msg.animate && !typingDone ? (
          <TypingEffect 
            text={msg.text} 
            forceStop={forceStop}
            onComplete={(finalText) => {
              setTypingDone(true);
              setStoppedText(finalText);
              if (onTypingComplete) onTypingComplete();
            }} 
          />
        ) : (
          stoppedText || msg.text
        )}
        {msg.animate && !typingDone && msg.status !== 'loading' && <span className="animate-pulse text-[#B8860B] ml-1">|</span>}
      </div>
      
      {typingDone && msg.status !== 'loading' && (
        <div className="mt-5 space-y-4 animate-[fadeInUp_0.4s_ease-out]">
          {msg.type === 'draft_options' && msg.options && (
            <div className="flex flex-wrap gap-3 mt-4">
              {msg.options.map((opt, idx) => (
                <button key={idx} onClick={() => onOptionClick(opt)} className="flex items-center gap-2 px-5 py-3 bg-zinc-950 border border-zinc-700 hover:border-[#B8860B] text-zinc-300 hover:text-[#B8860B] rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 group">
                  <FileText size={14} className="group-hover:animate-pulse" /> {opt}
                </button>
              ))}
            </div>
          )}
          {msg.sections && msg.sections.length > 0 && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <h4 className="text-blue-400 font-bold text-xs uppercase mb-2 flex items-center gap-2"><BrainCircuit size={16} /> Matched Laws & Sections</h4>
              <div className="flex flex-wrap gap-2">{msg.sections.map((s, idx) => <span key={idx} className="px-2 py-1 bg-zinc-800 rounded text-[10px] text-zinc-300 border border-zinc-700">{s}</span>)}</div>
            </div>
          )}
          
          {msg.caseStrength && (
             <div className="p-5 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-4 shadow-inner">
                 <div className="flex justify-between items-center">
                     <h4 className="text-purple-400 font-bold text-xs uppercase flex items-center gap-2"><TrendingUp size={16} /> Case Win Probability</h4>
                     <span className="text-purple-400 font-black text-lg">{msg.caseStrength}%</span>
                 </div>
                 <div className="w-full bg-zinc-800 rounded-full h-2">
                     <div className="bg-purple-500 h-2 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-all duration-1000" style={{ width: `${msg.caseStrength}%` }}></div>
                 </div>
                 
                 {msg.breakdown && (
                     <div className="grid grid-cols-3 gap-3 mt-3">
                         <div className="bg-black/40 p-3 rounded-xl text-center border border-purple-500/20">
                             <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Evidence</p>
                             <p className="text-sm font-black text-purple-300">{msg.breakdown.evidence_score || 0}/10</p>
                         </div>
                         <div className="bg-black/40 p-3 rounded-xl text-center border border-purple-500/20">
                             <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Witnesses</p>
                             <p className="text-sm font-black text-purple-300">{msg.breakdown.witness_score || 0}/10</p>
                         </div>
                         <div className="bg-black/40 p-3 rounded-xl text-center border border-purple-500/20">
                             <p className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Procedure</p>
                             <p className="text-sm font-black text-purple-300">{msg.breakdown.delay_score || 0}/10</p>
                         </div>
                     </div>
                 )}

                 {msg.weaknesses && msg.weaknesses.length > 0 && (
                     <div className="mt-3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                        <h4 className="text-red-400 font-black text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2"><AlertTriangle size={12}/> Case Weaknesses</h4>
                        <ul className="text-[11px] text-zinc-300 list-none space-y-2">
                            {msg.weaknesses.map((w, i) => (
                                <li key={i} className="flex gap-2 items-start"><X size={14} className="text-red-500 shrink-0 mt-0.5" /> <span className="leading-relaxed">{w}</span></li>
                            ))}
                        </ul>
                     </div>
                 )}

                 {msg.recommendations && msg.recommendations.length > 0 && (
                     <div className="mt-3 bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                        <h4 className="text-green-400 font-black text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2"><ArrowRight size={12}/> How to Improve Score</h4>
                        <ul className="text-[11px] text-zinc-300 list-none space-y-2">
                            {msg.recommendations.map((r, i) => (
                                <li key={i} className="flex gap-2 items-start"><CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" /> <span className="leading-relaxed">{r}</span></li>
                            ))}
                        </ul>
                     </div>
                 )}
             </div>
          )}
          {msg.document && (
            <div className="p-5 bg-zinc-950 border border-zinc-800 hover:border-[#B8860B]/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group cursor-default shadow-lg">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="p-3 bg-[#B8860B]/10 text-[#B8860B] rounded-lg shrink-0"><FileSignature size={24} /></div>
                <div className="min-w-0">
                  <p className="font-bold text-zinc-200 text-sm truncate">{msg.document.title}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 truncate">System Generated Legal Draft • Editable</p>
                </div>
              </div>
              <button onClick={() => {
                   if (msg.document.base64) {
                       fetch(`data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${msg.document.base64}`)
                           .then(res => res.blob())
                           .then(blob => {
                               const url = window.URL.createObjectURL(blob);
                               const link = document.createElement('a');
                               link.href = url;
                               link.download = msg.document.title;
                               document.body.appendChild(link);
                               link.click();
                               document.body.removeChild(link);
                               window.URL.revokeObjectURL(url);
                           });
                   }
                }} 
                className="shrink-0 flex items-center justify-center gap-2 px-4 py-3 bg-[#B8860B]/10 border border-[#B8860B]/50 hover:bg-[#B8860B] text-[#B8860B] hover:text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 w-full sm:w-auto">
                <Download size={14} /> Download
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('lawyer'); 
  const [userEmail, setUserEmail] = useState(''); 
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const session =
      localStorage.getItem('ai_legal_session') ||
      sessionStorage.getItem('ai_legal_session');

    if (session) {
      try {
        const userData = JSON.parse(session);
        setUserRole(userData.role);
        setUserEmail(userData.email);
        setIsAuthenticated(true);
      } catch (_) {
        localStorage.removeItem('ai_legal_session');
        sessionStorage.removeItem('ai_legal_session');
      }
    }
    setTimeout(() => setIsCheckingAuth(false), 800);
  }, []);

  const handleLogin = (role, email, rememberMe = false) => {
    setUserRole(role);
    setUserEmail(email);
    setIsAuthenticated(true);

    const sessionData = JSON.stringify({ role, email });
    if (rememberMe) {
      localStorage.setItem('ai_legal_session', sessionData);
    } else {
      sessionStorage.setItem('ai_legal_session', sessionData);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('lawyer');
    setUserEmail('');
    localStorage.removeItem('ai_legal_session');
    sessionStorage.removeItem('ai_legal_session');
  };

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen bg-[#050505] flex flex-col items-center justify-center space-y-4">
         <Loader2 size={40} className="text-[#B8860B] animate-spin" />
         <p className="text-[#B8860B] text-xs font-bold tracking-[0.3em] uppercase animate-pulse">Verifying Secure Session...</p>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmerText { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes fadeInUp { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes fadeInDown { 0% { transform: translateY(-20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes slideInRight { 0% { transform: translateX(100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes floatLogo { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes ring { 0% { transform: rotate(0deg); } 25% { transform: rotate(15deg); } 50% { transform: rotate(0deg); } 75% { transform: rotate(-15deg); } 100% { transform: rotate(0deg); } }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes scrollBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes sosGlow { 0%, 100% { box-shadow: 0 0 20px rgba(220,38,38,0.3), 0 0 60px rgba(220,38,38,0.1); } 50% { box-shadow: 0 0 40px rgba(220,38,38,0.5), 0 0 80px rgba(220,38,38,0.2); } }
      `}} />
      {!isAuthenticated
        ? <LoginPage onLogin={handleLogin} />
        : <Dashboard userRole={userRole} userEmail={userEmail} onLogout={handleLogout} />
      }
    </>
  );
}

const LoginPage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login'); 
  const [role, setRole] = useState('lawyer');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const [email, setEmail] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [toast, setToast] = useState(null); 
  const [resetData, setResetData] = useState({ uid: null, token: null });

  const showToast = (message, type = 'error') => { 
      setToast({ message, type }); 
      setTimeout(() => setToast(null), 5000); 
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      showToast("IDENTITY VERIFIED: Security lock removed. You may now login.", "success");
      window.history.replaceState({}, document.title, "/");
    } else if (params.get('verified') === 'false') {
      showToast("SECURITY ERROR: Activation link expired or corrupted.", "error");
      window.history.replaceState({}, document.title, "/");
    } else if (params.get('reset') === 'true') {
      setResetData({ uid: params.get('uid'), token: params.get('token') });
      setAuthMode('reset');
      showToast("SECURE SESSION: Enter your new access key.", "warning");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const switchMode = (mode) => {
      setAuthMode(mode);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);

    try {
        if (authMode === 'register') {
            if (password !== confirmPassword) {
              showToast("SECURITY WARNING: Passwords do not match.", "error");
              setIsAuthenticating(false);
              return;
            }
            const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passRegex.test(password)) {
              showToast("WEAK KEY: Min 8 chars, 1 Upper, 1 Number, 1 Symbol required.", "error");
              setIsAuthenticating(false);
              return;
            }

            const res = await fetch('http://127.0.0.1:8000/api/ai/register-db/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                setVerifyingEmail(email);
                setAuthMode('verify_pending');
                showToast("SECURE LINK DISPATCHED: Awaiting Identity Confirmation.", "success");
            } else if (data.status === 'exists') {
                showToast("IDENTITY CONFLICT: Email already registered.", "error");
            } else {
                showToast(data.message || "Registration failed.", "error");
            }
        } 
        
        else if (authMode === 'login') {
            const res = await fetch('http://127.0.0.1:8000/api/ai/login-db/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            const data = await res.json();

            if (data.status === 'success') {
                showToast("IDENTITY CONFIRMED: Initializing secure dashboard...", "success");
                setTimeout(() => {
                  onLogin(data.role, email, rememberMe);
                }, 1500);
            } else if (data.status === 'unverified') {
                showToast(data.message, "warning");
            } else {
                showToast(data.message || "Login failed. Please check your credentials.", "error");
            }
        }

        else if (authMode === 'forgot') {
            const res = await fetch('http://127.0.0.1:8000/api/ai/forgot-password/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            showToast(data.message, "success");
            switchMode('login');
        }

        else if (authMode === 'reset') {
            if (password !== confirmPassword) {
              showToast("SECURITY WARNING: Keys do not match.", "error");
              setIsAuthenticating(false);
              return;
            }
            const res = await fetch('http://127.0.0.1:8000/api/ai/reset-password/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: resetData.uid, token: resetData.token, password })
            });
            const data = await res.json();
            if (data.status === 'success') {
                showToast(data.message, "success");
                switchMode('login');
            } else {
                showToast(data.message, "error");
            }
        }
    } catch (err) {
        showToast("NETWORK ERROR: Secure servers are currently unreachable.", "error");
    }
    
    setIsAuthenticating(false);
  };

  return (
    <div className="h-screen w-screen bg-[#050505] flex flex-col lg:flex-row font-sans text-white overflow-hidden relative">
      {toast && (
        <div className={`fixed top-6 right-6 flex items-center gap-4 px-6 py-4 rounded-xl border backdrop-blur-md shadow-2xl z-[1000] animate-[fadeInRight_0.4s_ease-out] border-l-4 ${toast.type === 'error' ? 'bg-zinc-900/90 border-red-500' : toast.type === 'warning' ? 'bg-zinc-900/90 border-yellow-500' : 'bg-zinc-900/90 border-[#B8860B]'}`}>
          <div className={toast.type === 'error' ? 'text-red-500' : toast.type === 'warning' ? 'text-yellow-500' : 'text-[#B8860B]'}>
              <AlertCircle size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
              {toast.type === 'error' ? 'Security Alert' : toast.type === 'warning' ? 'Authorization Notice' : 'System Notification'}
            </span>
            <span className="text-sm font-semibold text-white tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:w-7/12 relative border-r border-[#B8860B]/15 p-16 flex-col h-full justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,rgba(184,134,11,0.08)_0%,rgba(5,5,5,1)_65%)] pointer-events-none"></div>

        <div className="relative z-10 flex justify-center items-center mb-10 h-64 animate-[floatLogo_6s_ease-in-out_infinite]">
            <div className="absolute w-32 h-32 bg-[#B8860B] blur-[90px] opacity-25 rounded-full animate-pulse"></div>
            <div className="absolute w-64 h-64 border border-[#B8860B]/10 rounded-full animate-[spin_40s_linear_infinite]"></div>
            <div className="absolute w-[120%] h-[120%] border border-dashed border-[#B8860B]/15 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>
            <div className="relative p-8 bg-black/60 backdrop-blur-xl rounded-full border border-[#B8860B]/40 shadow-[0_0_50px_rgba(184,134,11,0.15)] cursor-default">
              <Scale className="text-[#B8860B] drop-shadow-[0_0_20px_rgba(184,134,11,0.7)] scale-110" size={76} strokeWidth={1.2} />
            </div>
        </div>

        <div className="relative z-10 text-center">
          <div className="animate-[fadeInUp_0.8s_cubic-bezier(0.175,0.885,0.32,1.27)_forwards]">
            <h2 className="text-3xl xl:text-4xl font-light tracking-[0.3em] uppercase text-zinc-400 mb-2">AI Legal</h2>

            <div className="flex items-center justify-center gap-10 mb-4">
              <h1 className="text-6xl xl:text-8xl font-black tracking-tighter uppercase leading-none">
                <span className="bg-gradient-to-r from-[#8B6508] via-[#CFB53B] to-[#8B6508] text-transparent bg-clip-text drop-shadow-[0_0_25px_rgba(184,134,11,0.25)] bg-[length:200%_auto] animate-[shimmerText_4s_linear_infinite]">
                  ASSISTANT
                </span>
              </h1>
            </div>

            <p className="text-xl text-zinc-200 font-medium tracking-wider mb-6 drop-shadow-md">Enterprise Legal Intelligence</p>
          </div>

          <div className="flex flex-col items-center justify-center mt-8">
            <div className="flex items-center gap-5 text-[#B8860B] text-sm font-bold tracking-[0.5em] uppercase opacity-0 animate-[fadeInUp_1s_ease-out_0.6s_both]">
              <span>Faith</span><span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] shadow-[0_0_8px_#B8860B]"></span>
              <span>Unity</span><span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] shadow-[0_0_8px_#B8860B]"></span>
              <span>Discipline</span>
            </div>
            <div dir="rtl" className="text-2xl sm:text-3xl text-zinc-200 font-extrabold tracking-widest drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] mt-4 opacity-0 animate-[fadeInUp_1s_ease-out_0.9s_both]">
              ایمان، اتحاد، تنظیم
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 w-full flex justify-center gap-10 opacity-0 animate-[fadeInUp_1s_ease-out_1.2s_both]">
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest cursor-default hover:text-[#B8860B] transition-all duration-300"><ShieldCheck size={16} className="text-[#B8860B]"/> Secure</div>
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest cursor-default hover:text-[#B8860B] transition-all duration-300"><Lock size={16} className="text-[#B8860B]"/> Confidential</div>
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest cursor-default hover:text-[#B8860B] transition-all duration-300"><CheckCircle2 size={16} className="text-[#B8860B]"/> AI Powered</div>
        </div>
      </div>

      <div className="w-full lg:w-5/12 bg-transparent flex flex-col justify-center items-center p-4 sm:p-8 h-full relative z-10 overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/80 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-[fadeInUp_0.8s_ease-out_0.3s_both] my-auto">
          
          {authMode === 'verify_pending' ? (
            <div className="text-center animate-[fadeIn_0.4s_ease-out] py-4">
              <div className="w-24 h-24 bg-[#B8860B]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#B8860B]/30 animate-pulse relative">
                  <Mail size={40} className="text-[#B8860B]" />
                  <div className="absolute top-0 right-0 bg-zinc-950 rounded-full p-1 border border-zinc-800">
                      <ShieldCheck size={16} className="text-green-500" />
                  </div>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-4">Action Required</h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  An encrypted verification link has been dispatched to <br/>
                  <span className="text-[#B8860B] font-bold text-base block mt-2">{verifyingEmail}</span>
              </p>
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl mb-8 shadow-inner">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold leading-relaxed">
                      To establish a secure connection and activate your clearance, please navigate to your inbox and confirm your identity.
                  </p>
              </div>
              <button onClick={() => switchMode('login')} className="w-full bg-transparent border border-zinc-700 hover:border-[#B8860B] hover:bg-[#B8860B]/10 text-zinc-300 hover:text-[#B8860B] px-6 py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-lg active:scale-95">
                  Return to Secure Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-1">
                {authMode === 'login' ? 'SECURE LOGIN' : authMode === 'register' ? 'INITIALIZE KEY' : authMode === 'forgot' ? 'RECOVER ACCESS' : 'RESET SECURITY KEY'}
              </h2>
              <p className="text-xs text-zinc-400 mb-6 font-medium">
                {authMode === 'login' ? 'Authenticate your credentials to enter the network.' : 
                  authMode === 'register' ? 'Create an encrypted profile for AI guidance.' :
                  authMode === 'forgot' ? 'Enter email to receive a secure recovery link.' : 'Set your new end-to-end encrypted access key.'}
              </p>
              
              <form className="space-y-4" onSubmit={handleAuthSubmit}>
                {(authMode === 'login' || authMode === 'register') && (
                    <div className="group relative">
                    <label className="block text-[10px] font-bold text-[#B8860B] uppercase mb-1.5 tracking-widest">Jurisdiction Role</label>
                    <div className="relative group-hover:scale-[1.01] transition-transform duration-300">
                      <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-5 py-4 bg-zinc-950/90 border border-zinc-800 rounded-xl text-white outline-none cursor-pointer focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/30 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] hover:border-zinc-700 appearance-none">
                          <option value="lawyer">Practicing Lawyer — Pro Access</option>
                          <option value="victim">Victim Mode — Free Legal Aid</option>
                      </select>
                    </div>
                    </div>
                )}

                {authMode !== 'reset' && (
                    <div className="group relative">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-widest">Email Address</label>
                    <div className="relative flex items-center group-hover:scale-[1.01] transition-transform duration-300">
                        <Mail className="absolute left-4 text-zinc-500 group-focus-within:text-[#B8860B] transition-colors duration-300" size={18} />
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-zinc-950/90 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/30 transition-all placeholder:text-zinc-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] hover:border-zinc-700" placeholder="user@domain.com" />
                    </div>
                    </div>
                )}

                {authMode !== 'forgot' && (
                    <div className="group relative">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-widest">{authMode === 'reset' ? 'New Security Key' : 'Security Access Key'}</label>
                    <div className="relative flex items-center group-hover:scale-[1.01] transition-transform duration-300">
                        <Lock className="absolute left-4 text-zinc-500 group-focus-within:text-[#B8860B] transition-colors duration-300" size={18} />
                        <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 bg-zinc-950/90 border border-zinc-800 rounded-xl text-white outline-none focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/30 transition-all placeholder:text-zinc-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] hover:border-zinc-700" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-zinc-500 hover:text-[#B8860B] transition-colors outline-none">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    </div>
                )}

                {(authMode === 'register' || authMode === 'reset') && (
                  <div className="group relative animate-[fadeInDown_0.3s_ease-out]">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 tracking-widest">Confirm Access Key</label>
                    <div className="relative flex items-center group-hover:scale-[1.01] transition-transform duration-300">
                        <CheckCircle2 className={`absolute left-4 transition-colors duration-300 ${confirmPassword.length > 0 && password === confirmPassword ? 'text-green-500' : 'text-zinc-500 group-focus-within:text-[#B8860B]'}`} size={18} />
                        <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full pl-12 pr-12 py-4 bg-zinc-950/90 border rounded-xl text-white outline-none focus:ring-2 focus:ring-[#B8860B]/30 transition-all placeholder:text-zinc-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] hover:border-zinc-700 ${confirmPassword.length > 0 && password !== confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-[#B8860B]'}`} placeholder="Re-enter key" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 text-zinc-500 hover:text-[#B8860B] transition-colors outline-none">
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="flex items-center justify-between px-1 pt-1">
                      <label className="flex items-center gap-3 text-[11px] text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors group">
                          <div className="relative flex items-center justify-center">
                              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer appearance-none w-4 h-4 rounded border border-zinc-700 bg-zinc-900 checked:bg-[#B8860B] checked:border-[#B8860B] transition-colors cursor-pointer" />
                              <CheckCircle2 size={12} className="absolute text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                          Remember identity
                      </label>
                      <button type="button" onClick={() => switchMode('forgot')} className="text-[11px] text-[#B8860B] hover:text-white transition-colors font-medium hover:underline hover:drop-shadow-[0_0_8px_rgba(184,134,11,0.8)]">Forgot Key?</button>
                  </div>
                )}

                <button type="submit" disabled={isAuthenticating} className="relative w-full bg-gradient-to-r from-[#996B00] via-[#C59B27] to-[#996B00] text-black font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(184,134,11,0.2)] hover:shadow-[0_0_35px_rgba(184,134,11,0.5)] flex items-center justify-center gap-3 disabled:opacity-80 disabled:cursor-wait mt-4 overflow-hidden group">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmerText_1.5s_infinite]"></div>
                  <div className="relative z-10 flex items-center gap-3">
                      {isAuthenticating ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : 
                      <>{authMode === 'login' ? 'Access Dashboard' : authMode === 'register' ? 'Register Securely' : authMode === 'forgot' ? 'Send Recovery Link' : 'Update Security Key'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                  </div>
                </button>
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold flex justify-center items-center gap-1 mt-2">
                    <Lock size={10} className="text-green-600"/> End-to-End Encrypted Access
                </p>
              </form>
              
              {authMode !== 'reset' && (
                <div className="text-center mt-6">
                    <button type="button" onClick={() => switchMode(authMode === 'login' ? 'register' : 'login')} className="text-zinc-500 text-[10px] hover:text-[#B8860B] transition-all tracking-[0.2em] uppercase font-bold border-b border-transparent hover:border-[#B8860B] pb-1 hover:drop-shadow-[0_0_8px_rgba(184,134,11,0.5)]">
                        {authMode === 'login' ? "Don't have an account? Sign Up" : "Back to Secure Login"}
                    </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};


const Dashboard = ({ userRole, userEmail, onLogout }) => {
  const username = userEmail.split('@')[0];
  const abortControllerRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const messagesRef = useRef([]);

  // ─ State: Basic ─
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem(`ai_legal_dp_${userEmail}`) || null);
  const [hasSeenHelp, setHasSeenHelp] = useState(() => localStorage.getItem(`ai_legal_help_seen_${userEmail}`) === 'true');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [globalStop, setGlobalStop] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // ─ Scroll Arrow State ─
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  // ─ State: Specific Modals ─
  const [showClientManager, setShowClientManager] = useState(false);
  const [showUploadUI, setShowUploadUI] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveState, setLiveState] = useState('idle'); 
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveVoiceLang, setLiveVoiceLang] = useState('en');
  const [isDictating, setIsDictating] = useState(false);
  const [showVictimGuide, setShowVictimGuide] = useState(false);
  const [guideLang, setGuideLang] = useState('en'); 
  const [showHelp, setShowHelp] = useState(false);
  const [helpLang, setHelpLang] = useState('en');
  
  // ─ State: Lawyer Features ─
  const [clients, setClients] = useState(() => JSON.parse(localStorage.getItem(`ai_legal_clients_${userEmail}`)) || [{ id: 'default', name: 'General Workspace' }]);
  const [activeClient, setActiveClient] = useState('default');
  const [newClientName, setNewClientName] = useState('');
  const [editingClientId, setEditingClientId] = useState(null);
  const [editingClientName, setEditingClientName] = useState('');
  
  const [showCaseManager, setShowCaseManager] = useState(false);
  const [cases, setCases] = useState(() => JSON.parse(localStorage.getItem(`lawyer_cases_${userEmail}`)) || []);
  const [showHearings, setShowHearings] = useState(false);
  const [hearings, setHearings] = useState(() => JSON.parse(localStorage.getItem(`lawyer_hearings_${userEmail}`)) || []);
  const [editingHearingId, setEditingHearingId] = useState(null);
  const [editingHearingNotes, setEditingHearingNotes] = useState('');
  const [draftNotice, setDraftNotice] = useState(null);

  // ─ State: Victim Features ─
  const [showVault, setShowVault] = useState(false);
  const [vaultPin, setVaultPin] = useState(() => localStorage.getItem(`victim_vault_pin_${userEmail}`) || '');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultFiles, setVaultFiles] = useState(() => JSON.parse(localStorage.getItem(`victim_vault_files_${userEmail}`)) || []);
  const [pinInput, setPinInput] = useState('');

  const [showSOS, setShowSOS] = useState(false);
  const [trustedContacts, setTrustedContacts] = useState(() => JSON.parse(localStorage.getItem(`victim_sos_contacts_${userEmail}`)) || ['', '', '']);

  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState(() => JSON.parse(localStorage.getItem(`victim_timeline_${userEmail}`)) || []);
  const [editingTimelineId, setEditingTimelineId] = useState(null);
  const [editingTimelineData, setEditingTimelineData] = useState({ date: '', title: '', story: '', location: '', firRef: '' });

  // ─ UseEffects for Storage Sync ─
  useEffect(() => {
      const saved = localStorage.getItem(`ai_legal_chat_${userEmail}_${activeClient}`);
      if (saved) setMessages(JSON.parse(saved));
      else {
          const greetingText = userRole === 'lawyer' 
            ? "Main AI Legal Assistant hoon. Case analysis aur drafting ke liye facts batayein." 
            : "Assalamualaikum! Main AI Legal Assistant hoon. Aapka legal masla kya hai?";
          setMessages([{ id: 1, role: 'ai', text: greetingText, animate: true, status: 'success' }]);
      }
  }, [activeClient, userEmail, userRole]);

  useEffect(() => { messagesRef.current = messages; if(messages.length > 0) localStorage.setItem(`ai_legal_chat_${userEmail}_${activeClient}`, JSON.stringify(messages)); }, [messages, userEmail, activeClient]);
  useEffect(() => { localStorage.setItem(`ai_legal_clients_${userEmail}`, JSON.stringify(clients)); }, [clients, userEmail]);
  useEffect(() => { localStorage.setItem(`lawyer_cases_${userEmail}`, JSON.stringify(cases)); }, [cases, userEmail]);
  useEffect(() => { localStorage.setItem(`lawyer_hearings_${userEmail}`, JSON.stringify(hearings)); }, [hearings, userEmail]);
  useEffect(() => { localStorage.setItem(`victim_vault_pin_${userEmail}`, vaultPin); }, [vaultPin, userEmail]);
  useEffect(() => { localStorage.setItem(`victim_vault_files_${userEmail}`, JSON.stringify(vaultFiles)); }, [vaultFiles, userEmail]);
  useEffect(() => { localStorage.setItem(`victim_sos_contacts_${userEmail}`, JSON.stringify(trustedContacts)); }, [trustedContacts, userEmail]);
  useEffect(() => { localStorage.setItem(`victim_timeline_${userEmail}`, JSON.stringify(timelineEvents)); }, [timelineEvents, userEmail]);

  // ─ Scroll Arrow Logic ─
  const handleScroll = useCallback(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollArrow(distanceFromBottom > 120);
  }, []);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 300) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ─ Base Functions ─
  const addClient = (e) => {
      e.preventDefault();
      if(!newClientName.trim()) return;
      const newClient = { id: Date.now().toString(), name: newClientName };
      setClients([...clients, newClient]);
      setNewClientName('');
      setActiveClient(newClient.id);
      setShowClientManager(false);
  };

  const saveClientEdit = (id) => {
      setClients(clients.map(c => c.id === id ? { ...c, name: editingClientName } : c));
      setEditingClientId(null);
  };

  const deleteClient = (e, idToRemove) => {
    e.stopPropagation();
    if (clients.length <= 1) { alert("At least one workspace must remain active."); return; }
    const confirmDelete = window.confirm("Are you sure you want to delete this workspace? All associated chats will be permanently removed.");
    if (confirmDelete) {
        const updatedClients = clients.filter(c => c.id !== idToRemove);
        setClients(updatedClients);
        if (activeClient === idToRemove) setActiveClient(updatedClients[0].id);
        localStorage.removeItem(`ai_legal_chat_${userEmail}_${idToRemove}`);
    }
  };

  const saveHearingEdit = (id) => {
      setHearings(hearings.map(h => h.id === id ? { ...h, notes: editingHearingNotes } : h));
      setEditingHearingId(null);
  };

  const addTimelineEvent = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const newEvent = { 
          id: Date.now(), 
          date: formData.get('date'), 
          title: formData.get('title'), 
          story: formData.get('story'), 
          location: formData.get('location'), 
          firRef: formData.get('firRef') 
      };
      setTimelineEvents([...timelineEvents, newEvent].sort((a,b) => new Date(a.date) - new Date(b.date)));
      e.target.reset();
  };

  const saveTimelineEdit = (id) => {
      setTimelineEvents(timelineEvents.map(ev => ev.id === id ? { ...ev, ...editingTimelineData } : ev).sort((a,b) => new Date(a.date) - new Date(b.date)));
      setEditingTimelineId(null);
  };

  const handleHelpClick = () => {
    setShowHelp(true);
    if (!hasSeenHelp) { setHasSeenHelp(true); localStorage.setItem(`ai_legal_help_seen_${userEmail}`, 'true'); }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        localStorage.setItem(`ai_legal_dp_${userEmail}`, reader.result);
        setShowProfileMenu(false); 
      };
      reader.readAsDataURL(file);
    }
  };

  const getSidebarAvatarState = () => {
    if (isDictating || liveState === 'listening') return 'listening';
    if (isTyping || liveState === 'thinking') return 'thinking';
    if (liveState === 'speaking') return 'speaking';
    return 'idle';
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Voice recognition is not supported in this browser.");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; 
    recognition.onstart = () => setIsDictating(true);
    recognition.onerror = (e) => { console.error(e); setIsDictating(false); alert("Microphone error. Please allow permissions."); };
    recognition.onresult = (event) => setInputValue(event.results[0][0].transcript);
    recognition.onend = () => setIsDictating(false);
    recognition.start();
  };

  // ─ Chat Logic ─
  const stopResponse = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setGlobalStop(true); setIsGenerating(false); setIsTyping(false);
    window.speechSynthesis.cancel();
  };

  const handleStopAndEdit = () => {
      stopResponse();
      const currentMsgs = messagesRef.current;
      const userMsgs = currentMsgs.filter(m => m.role === 'user');
      if (userMsgs.length > 0) {
          const lastMsg = userMsgs[userMsgs.length - 1];
          if (!lastMsg.text.startsWith("Uploaded Document:") && !lastMsg.text.startsWith("[Voice]")) {
              setInputValue(lastMsg.text);
          }
      }
      setMessages(prev => {
          const newMsgs = [...prev];
          if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'ai') newMsgs.pop();
          if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'user') newMsgs.pop();
          return newMsgs;
      });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setShowUploadUI(false);
    
    const userMsgId = Date.now();
    const loadingMsgId = userMsgId + 1;

    // FE FIX: Show "Processing..." message so user knows what's happening
    setMessages(prev => [
      ...prev, 
      { id: userMsgId, role: 'user', type: 'text', text: `Uploaded Document: ${file.name}`, status: 'success' },
      { id: loadingMsgId, role: 'ai', type: 'text', text: 'Document received. Extracting text and running Legal Analysis... Please wait ⏳', animate: false, status: 'loading' }
    ]);
    setIsTyping(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/ai/upload-fir/', { method: 'POST', body: formData });
      
      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== loadingMsgId));

      if (data.status === 'success') {
        setMessages(prev => [...prev, { 
          id: Date.now()+2, role: 'ai', type: 'legal_analysis', 
          text: data.ai_advice, sections: data.matched_sections, animate: true, status: 'success' 
        }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now()+2, role: 'ai', type: 'text', text: `Error: ${data.message || 'Unknown error'}`, status: 'success' }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => prev.filter(m => m.id !== loadingMsgId)); // Remove loader on error
      setMessages(prev => [...prev, { id: Date.now()+2, role: 'ai', type: 'text', text: "Connection error. Make sure your Django server is running and urls.py is configured correctly.", status: 'success' }]);
    } finally { setIsTyping(false); }
  };

  const handleLiveVoiceAction = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Not supported in this browser."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => { setLiveState('listening'); setLiveTranscript("Listening..."); };
    recognition.onerror = () => { setLiveState('idle'); alert("Microphone access denied."); };
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setLiveTranscript(transcript);
      setLiveState('thinking');
      try {
        const response = await fetch('http://127.0.0.1:8000/api/ai/chat/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: transcript, is_live: true, role: userRole, lang: liveVoiceLang })
        });
        const data = await response.json();
        if (data.status === 'success') {
          const aiResponse = data.ai_advice;
          setLiveState('speaking');
          setMessages(prev => [
            ...prev,
            { id: Date.now(), role: 'user', type: 'text', text: transcript, status: 'success' },
            { id: Date.now() + 1, role: 'ai', type: 'legal_analysis', text: aiResponse, sections: data.matched_sections, animate: true, status: 'success' }
          ]);
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(aiResponse.replace(/\*/g, '').replace(/#/g, ''));
          utterance.lang = 'en-GB';
          utterance.onend = () => setLiveState('idle');
          synth.speak(utterance);
        }
      } catch (e) { setLiveState('idle'); }
    };
    recognition.start();
  };

  const processUserMessage = async (text, msgId, currentLen) => {
    setIsTyping(true); setIsGenerating(true); setGlobalStop(false);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const isScoringRequest = text.toLowerCase().includes("win probability") || text.toLowerCase().includes("strength");

    if (isScoringRequest && currentLen <= 1) {
        setTimeout(() => {
            if(signal.aborted) { setIsGenerating(false); return; }
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'success' } : m));
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, role: 'ai', type: 'text', 
                text: "Kindly pehle apna qanooni masla (facts aur evidence) tafseel se discuss karein taake main usay analyze kar ke case win probability nikal sakoon.", 
                animate: true, status: 'success' 
            }]);
            setIsTyping(false); setIsGenerating(false);
        }, 1000); 
        return;
    }

    let apiQuery = text;
    if (text.startsWith("Drafting: ")) {
        const userMsgs = messages.filter(m => m.role === 'user' && !m.text.includes('Drafting:'));
        const lastContext = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].text : '';
        if (lastContext) apiQuery = `${text}. Strictly use these Case Facts to fill the draft: ${lastContext}`;
    }

    const recentHistory = messages.slice(-3).map(m => `${m.role === 'user' ? 'Client' : 'Assistant'}: ${m.text}`).join('\n');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/ai/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: apiQuery, history: recentHistory, is_live: false, role: userRole, is_scoring: isScoringRequest }),
        signal: signal
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'success' } : m));
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, role: 'ai', type: data.type === 'draft' ? 'legal_analysis' : 'legal_analysis',
          text: data.ai_advice, sections: data.matched_sections || [], 
          caseStrength: data.caseStrength || null, breakdown: data.breakdown || data.data?.breakdown || null,
          weaknesses: data.weaknesses || data.data?.weaknesses || [],
          recommendations: data.recommendations || data.data?.recommendations || [],
          document: data.document || null, animate: true, status: 'success' 
        }]);
      } else {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'failed' } : m));
        setIsGenerating(false);
      }
    } catch (error) { 
      if (error.name !== 'AbortError') {
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'failed' } : m));
          setIsGenerating(false);
      }
    } finally { 
        setIsTyping(false); 
    }
  };

  const addMessage = (text, role, specialAction = null) => {
    if (specialAction === 'upload') { setShowUploadUI(true); return; }
    const msgId = Date.now();
    const currentLen = messages.length; 
    setMessages(prev => [...prev, { id: msgId, role, type: 'text', text, status: role === 'user' ? 'sending' : 'success' }]);
    if (role === 'user') processUserMessage(text, msgId, currentLen);
  };

  const retryMessage = (msgId, text) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'sending' } : m));
    processUserMessage(text, msgId, messages.length);
  };

  // ─ Features Actions ─
  const triggerSOS = (action) => {
      if(action === 'police') window.location.href = "tel:15";
      if(action === 'ambulance') window.location.href = "tel:1122";
      if(action === 'sms') {
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(pos => {
                  const loc = `http://googleusercontent.com/maps.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
                  const msg = `EMERGENCY! I need help. My current location: ${loc}`;
                  const numbers = trustedContacts.filter(n => n.trim() !== '').join(',');
                  if(numbers) window.location.href = `sms:${numbers}?body=${encodeURIComponent(msg)}`;
                  else alert("Please add trusted contacts first.");
              }, () => alert("Location access denied. Cannot send map link."));
          } else {
              alert("Geolocation not supported.");
          }
      }
  };

  const handleVaultUpload = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
          const newFile = { id: Date.now(), name: file.name, type: file.type, data: reader.result };
          setVaultFiles([...vaultFiles, newFile]);
      };
      reader.readAsDataURL(file);
  };

  const generateNoticeTemplate = (caseObj) => {
      return `LEGAL NOTICE\n\nTo: ${caseObj.parties.split('vs')[1]?.trim() || '[Accused Name]'}\n\nSubject: Formal Notice regarding Case No. ${caseObj.caseNo} / FIR No. ${caseObj.firNo}\n\nUnder the instructions of my client, ${caseObj.parties.split('vs')[0]?.trim() || '[Client Name]'}, you are hereby notified that legal proceedings have been initiated against you in the Honorable Court of ${caseObj.court}.\n\nYou are advised to respond to this notice within 14 days, failing which strict legal action will be pursued as per the laws of Pakistan.\n\nRegards,\nAdvocate [Your Name]\nDate: ${new Date().toLocaleDateString()}`;
  };

  const downloadNotice = () => {
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Legal Notice</title></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + "<div style='font-family: Arial, sans-serif; white-space: pre-wrap;'>" + draftNotice.text.replace(/\n/g, '<br>') + "</div>" + footer;
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      const fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = `Legal_Notice_${draftNotice.caseNo}.doc`;
      fileDownload.click();
      document.body.removeChild(fileDownload);
  };

  // ─ Dictionaries ─
  const activeHelpContent = userRole === 'lawyer' ? {
    en: {
        title: "Pro Lawyer System Tutorial",
        subtitle: "Master Your AI Legal Assistant Workspace",
        intro: "Welcome, Counsel! This advanced portal is designed to streamline your case preparations, client management, and legal drafting. Here is how to maximize your workflow.",
        sections: [
            { icon: <Users className="text-blue-400" size={28} />, title: "Client Workspaces", content: "Manage multiple clients effortlessly. Click 'Client Workspaces' to add a new client. Each client gets an isolated, secure chat history." },
            { icon: <Briefcase className="text-[#B8860B]" size={28} />, title: "Case Management", content: "Add, edit, and track your cases. Easily generate and download editable Legal Notices directly from your case repository." },
            { icon: <CalendarDays className="text-purple-400" size={28} />, title: "Hearing Calendar", content: "Schedule upcoming court dates and add notes. The system will automatically highlight any hearings scheduled for today." },
            { icon: <Radio className="text-red-400" size={28} />, title: "Live Voice Chamber", content: "Step into the secure voice chamber for hands-free, real-time legal brainstorming. Speak to the AI naturally." }
        ]
    },
    ru: {
        title: "Pro Lawyer System Tutorial",
        subtitle: "Apne AI Legal Assistant Ko Master Karein",
        intro: "Khush Aamdeed, Counsel! Yeh advanced portal aapki case preparation, client management, aur legal drafting ko asaan banayega. Yahan dekhein isay kaise istamal karna hai.",
        sections: [
            { icon: <Users className="text-blue-400" size={28} />, title: "Client Workspaces", content: "Click 'Client Workspaces' kar ke naye clients add karein. Har client ka data, chat aur history bilkul alag aur mehfooz rahay gi." },
            { icon: <Briefcase className="text-[#B8860B]" size={28} />, title: "Case Management", content: "Apne cases add aur track karein. Kisi bhi case par ek click kar ke editable Legal Notice generate aur download karein." },
            { icon: <CalendarDays className="text-purple-400" size={28} />, title: "Hearing Calendar", content: "Apni aane wali peshi ki dates save karein. System khud aapko aaj ki peshiyon (Today's Hearings) ka batayega." },
            { icon: <Radio className="text-red-400" size={28} />, title: "Live Voice Chamber", content: "Real-time qanooni mashware ke liye Live Voice Chamber use karein. AI se aam zaban mein baat karein." }
        ]
    }
  } : {
    en: {
        title: "System Tutorial & Support",
        subtitle: "Master Your AI Legal Assistant",
        intro: "Welcome! This system is designed to provide you with instant, accurate, and secure legal assistance. Here is how you can use all the features effectively.",
        sections: [
            { icon: <LockKeyhole className="text-blue-400" size={28} />, title: "Secure Evidence Vault", content: "Setup a 4-digit PIN to securely hide your sensitive photos, videos, and documents directly in your browser. This is strictly local and safe." },
            { icon: <Siren className="text-red-400" size={28} />, title: "Emergency SOS", content: "In danger? Use the SOS button to instantly call Police (15), Ambulance (1122), or send your Live Location via SMS to 3 trusted contacts." },
            { icon: <UploadCloud className="text-green-400" size={28} />, title: "Upload F.I.R (PDF Analysis)", content: "Got an FIR document? Click the Upload button in the sidebar or the attachment icon in the chat. The AI will extract relevant sections." },
            { icon: <FileSignature className="text-[#B8860B]" size={28} />, title: "Drafting Complaints & Docs", content: "Need legal documents? Click 'Draft Complaint' to generate custom Bail Applications, Witness Statements, or Police Complaints instantly." }
        ]
    },
    ru: {
        title: "System Tutorial Aur Rehnumai",
        subtitle: "Apne AI Legal Assistant Ko Istamal Karne Ka Tarika",
        intro: "Khush Aamdeed! Ye system apko fori aur mehfooz qanooni madad faraham karne ke liye banaya gaya hai. Yahan janiye ke tamam features ko asani se kaise istamal karna hai.",
        sections: [
            { icon: <LockKeyhole className="text-blue-400" size={28} />, title: "Secure Evidence Vault", content: "Apna 4-digit PIN lagayein aur apni zaroori tasweerein aur saboot hide karein. Yeh data sirf aapke apne browser mein mehfooz rahega." },
            { icon: <Siren className="text-red-400" size={28} />, title: "Emergency SOS", content: "Khuda na khasta khatre mein SOS dabayein. Ek click par Police (15) bulayein ya apne doston ko Live Location SMS karein." },
            { icon: <UploadCloud className="text-green-400" size={28} />, title: "F.I.R Upload Karein (PDF)", content: "Kya aapke paas FIR ki copy hai? Upload dabayein. System usay parh kar batayega ke kon se qawaneen lagaye gaye hain." },
            { icon: <FileSignature className="text-[#B8860B]" size={28} />, title: "Draft Complaint (Dastawezat)", content: "Qanooni kaghzat chahiye? Bail Application (Zamanat) ya Police Complaint khud-ba-khud banwane ke liye is button par click karein." }
        ]
    }
  };

  const guideContent = {
    en: {
        title: "Victim Survival & Legal Guidance",
        subtitle: "A Comprehensive Guide to Your Rights under Pakistani Law",
        intro: "Facing a legal issue, harassment, or a false accusation can be deeply distressing. This AI assistant is here to guide you, but it is crucial to understand your fundamental rights and standard court procedures under the Criminal Procedure Code (CrPC) and Pakistan Penal Code (PPC).",
        sections: [
            { icon: <ShieldAlert className="text-red-400" size={28} />, title: "1. Immediate Actions (FIR & Arrests)", content: "If a false FIR is registered against you, do not panic or evade the police. Immediately contact a lawyer to file for Pre-Arrest Bail in the Session Court." },
            { icon: <Gavel className="text-[#B8860B]" size={28} />, title: "2. Court Hearings & Protocols", content: "Always attend your court hearings on time. Dress formally and respectfully. Only speak when the Judge directly addresses you." },
            { icon: <FileX className="text-blue-400" size={28} />, title: "3. Quashment of False FIRs", content: "If the case is entirely baseless or malicious, you have the right under Section 561-A of the CrPC to file a petition in the High Court for Quashment." },
            { icon: <Eye className="text-green-400" size={28} />, title: "4. Evidence & Counter-Action", content: "Preserve all physical and digital evidence. Under Section 182 of the PPC, you can file a criminal counter-case for false information." }
        ]
    },
    ru: {
        title: "Qanooni Rahnumai Aur Hifazati Tadabeer",
        subtitle: "Pakistani Qanoon ke Mutabiq Aapke Haqooq",
        intro: "Kisi qanooni maslay, harassment, ya jhootay ilzam ka samna karna pareshan kun ho sakta hai. Ye AI assistant aapki madad ke liye hai, lekin aapko CrPC aur PPC ke tehat apne haqooq aur adalti tareeqakar samajhna zaroori hai.",
        sections: [
            { icon: <ShieldAlert className="text-red-400" size={28} />, title: "1. Fori Iqdamat (FIR aur Giriftari)", content: "Agar aap par jhooti FIR kat jaye, toh bhagein mat. Foran wakeel ke zariye Session Court se Qabl-az-Giriftari Zamanat len." },
            { icon: <Gavel className="text-[#B8860B]" size={28} />, title: "2. Court Ki Peshi Aur Adab", content: "Apni peshi par hamesha waqt par hazir hon. Saaf suthre kapray pehnein aur sirf tab baat karein jab Judge aapse sawal kare." },
            { icon: <FileX className="text-blue-400" size={28} />, title: "3. Jhooti FIR Khatam Karwana", content: "Agar case be-bunyaad hai, toh aap CrPC ke Section 561-A ke tehat High Court mein FIR kharij (Quash) karwane ki darkhwast de sakte hain." },
            { icon: <Eye className="text-green-400" size={28} />, title: "4. Saboot Aur Jawabi Karwai", content: "Apne saboot mehfooz rakhein. PPC Section 182 ke tehat, jis ne jhooti FIR karwai hai aap us par jawabi case kar sakte hain." }
        ]
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex font-sans text-white overflow-hidden relative">

      {/* ─── LIVE VOICE CHAMBER ─── */}
      {isLiveMode && (
        <div className="absolute inset-0 z-[300] bg-[#020202] flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
          <div className="flex-shrink-0 flex items-center justify-between px-8 py-5 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${liveState === 'listening' ? 'bg-red-500 animate-pulse' : liveState === 'thinking' ? 'bg-[#B8860B] animate-pulse' : liveState === 'speaking' ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></div>
              <span className={`text-xs font-black uppercase tracking-[0.3em] ${liveState === 'listening' ? 'text-red-400' : liveState === 'thinking' ? 'text-[#B8860B]' : liveState === 'speaking' ? 'text-green-400' : 'text-zinc-400'} transition-colors duration-500`}>
                {liveState === 'listening' ? 'Listening...' : liveState === 'thinking' ? 'Analyzing...' : liveState === 'speaking' ? 'Speaking Response' : 'Ready to Listen'}
              </span>
            </div>
            <div className="flex items-center bg-zinc-950 p-1 rounded-full border border-zinc-800">
              <button onClick={() => setLiveVoiceLang('en')} className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${liveVoiceLang === 'en' ? 'bg-[#B8860B] text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>English</button>
              <button onClick={() => setLiveVoiceLang('roman_urdu')} className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${liveVoiceLang === 'roman_urdu' ? 'bg-[#B8860B] text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Roman Urdu</button>
            </div>
            <button onClick={() => { window.speechSynthesis.cancel(); setIsLiveMode(false); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:text-red-400 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              <X size={14} /> Exit Chamber
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-full" style={{ minHeight: '220px' }}><HologramAvatar state={liveState} /></div>
            <div className="w-full max-w-2xl space-y-3 flex-shrink-0">
              {liveTranscript && (
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl animate-[fadeInUp_0.3s_ease-out]">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1.5">You Said</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{liveTranscript}</p>
                </div>
              )}
              {liveState === 'thinking' && (
                <div className="flex items-center gap-3 p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                  <Loader2 size={14} className="text-[#B8860B] animate-spin" /><p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Analyzing Legal Context...</p>
                </div>
              )}
              {!liveTranscript && liveState !== 'thinking' && (
                <div className="text-center py-4">
                  <p className="text-xs text-zinc-600 uppercase tracking-[0.3em] font-bold">{liveVoiceLang === 'en' ? 'Press the button and speak your legal question' : 'Button dabayein aur apna qanooni masla bolein'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center justify-center gap-6 py-8 border-t border-zinc-900">
            <button onClick={handleLiveVoiceAction} disabled={liveState === 'listening' || liveState === 'thinking'} className={`relative flex items-center gap-4 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${liveState === 'idle' || liveState === 'speaking' ? 'bg-gradient-to-r from-[#996B00] via-[#C59B27] to-[#996B00] text-black hover:scale-105 shadow-[0_0_40px_rgba(184,134,11,0.3)]' : 'bg-zinc-900 border border-zinc-700 text-zinc-500 cursor-not-allowed'}`}>
              {liveState === 'listening' ? (<><div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div> Listening</>) : liveState === 'thinking' ? (<><Loader2 size={18} className="animate-spin" /> Processing</>) : (<><Mic size={20} /> {liveVoiceLang === 'en' ? 'Speak Now' : 'Baat Karein'}</>)}
            </button>
          </div>
        </div>
      )}

      {/* ─── SIDEBAR ─── */}
      {isSidebarOpen && !isLiveMode && (
        <div className="w-72 bg-[#050505] border-r border-zinc-900 flex flex-col h-screen flex-shrink-0 transition-all duration-300">
          <div className="p-4 flex-shrink-0 border-b border-zinc-900/50">
            <div className="flex items-center gap-3 px-2">
                <Scale className="text-[#B8860B]" size={24} strokeWidth={1.5} />
                <div className="flex flex-col">
                   <span className="font-black text-xs uppercase tracking-widest text-zinc-100 leading-tight truncate">AI LEGAL ASSISTANT</span>
                   <span className="font-bold text-[9px] uppercase tracking-[0.2em] text-[#B8860B] mt-0.5 truncate">{userRole === 'lawyer' ? 'Practicing Lawyer' : 'Victim'} Mode</span>
                </div>
            </div>
            <div className="mt-4 flex justify-center items-center pointer-events-none h-28 relative">
                 <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ${userRole === 'lawyer' ? 'scale-[0.40]' : 'scale-[0.35]'}`}>
                     <HologramAvatar state={getSidebarAvatarState()} />
                 </div>
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col justify-center gap-2 z-20">
               <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-2 mb-1">Dashboard Tools</p>
               
               {userRole === 'lawyer' ? (
                  <div className="flex flex-col gap-1.5 h-full justify-evenly">
                    <button onClick={() => setIsLiveMode(true)} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-red-500/5 text-red-500 text-[11px] font-bold border border-red-500/20 hover:bg-red-500/10 transition-all truncate shadow-[0_0_15px_rgba(239,68,68,0.1)]"><Radio size={14} /> Live Voice Chamber</button>
                    <button onClick={() => setShowClientManager(true)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-[11px] font-bold transition-all truncate border border-transparent hover:border-zinc-800"><Users size={14} className="text-blue-400"/> Client Workspaces</button>
                    <button onClick={() => setShowCaseManager(true)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-[11px] font-bold transition-all truncate border border-transparent hover:border-zinc-800"><Briefcase size={14} className="text-[#B8860B]"/> Case Management</button>
                    <button onClick={() => setShowHearings(true)} className="relative w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-[11px] font-bold transition-all truncate border border-transparent hover:border-zinc-800">
                        {hearings.some(h => new Date().toDateString() === new Date(h.date).toDateString()) && (
                          <span className="absolute top-2 right-2 flex h-3.5 w-3.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span><span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 items-center justify-center"><span className="text-[7px] text-white font-black leading-none">{hearings.filter(h => new Date().toDateString() === new Date(h.date).toDateString()).length}</span></span></span>
                        )}
                        <CalendarDays size={14} className="text-purple-400"/> Hearing Calendar
                    </button>
                    <button onClick={() => addMessage("", "user", "upload")} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-[#B8860B]/10 text-[#B8860B] text-[11px] border border-[#B8860B]/30 hover:bg-[#B8860B]/20 transition-all font-bold truncate"><UploadCloud size={14} /> Upload F.I.R (PDF)</button>
                    <button onClick={() => addMessage("Analyze current facts and provide win probability.", "user")} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-[11px] font-bold transition-all truncate border border-transparent hover:border-zinc-800"><TrendingUp size={14} className="text-purple-400" /> Case Strength Analysis</button>
                    <button onClick={handleHelpClick} className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-[11px] font-bold transition-all truncate mt-auto border ${!hasSeenHelp ? 'bg-[#B8860B]/10 border-[#B8860B]/40 text-[#B8860B] shadow-[0_0_15px_rgba(184,134,11,0.2)] animate-[pulse_2s_infinite]' : 'bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white border-transparent'}`}><HeartHandshake size={14} /> Help & Support</button>
                  </div>
               ) : (
                  <div className="flex flex-col gap-1.5 h-full justify-evenly">
                    <button onClick={() => setShowVault(true)} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-[11px] font-bold transition-all shadow-sm truncate"><LockKeyhole size={14} /> Secure Evidence Vault</button>
                    <button onClick={() => setShowTimeline(true)} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-[#B8860B]/10 border border-[#B8860B]/40 text-[#B8860B] hover:bg-[#B8860B]/20 text-[11px] font-bold transition-all shadow-[0_0_15px_rgba(184,134,11,0.3)] animate-pulse truncate"><Clock size={14} /> Case Timeline Report</button>
                    <button onClick={() => setShowSOS(true)} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 text-[11px] font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse truncate"><Siren size={14} /> Emergency SOS</button>
                    <button onClick={() => addMessage("", "user", "upload")} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-[11px] font-bold transition-all border border-transparent hover:border-zinc-800 truncate"><UploadCloud size={14} className="text-[#B8860B]" /> Upload F.I.R (PDF)</button>
                    <button onClick={() => { setMessages(prev => [...prev, { id: Date.now(), role: 'ai', type: 'draft_options', text: "Aap kya draft karwana chahte hain? Neeche diye gaye options mein se intekhab karein:", options: ["Witness Statement", "Bail Application", "Police Complaint"], animate: true, status: 'success' }]); }} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-[11px] font-bold transition-all border border-transparent hover:border-zinc-800 truncate"><FileSignature size={14} className="text-purple-400"/> Draft Complaint</button>
                    <button onClick={() => setShowVictimGuide(true)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-300 text-[11px] font-bold transition-all border border-transparent hover:border-zinc-800 truncate"><BookOpen size={14} className="text-green-500"/> Victim Guidance & Rights</button>
                    <button onClick={handleHelpClick} className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-[11px] font-bold transition-all truncate mt-auto border ${!hasSeenHelp ? 'bg-[#B8860B]/10 border-[#B8860B]/40 text-[#B8860B] shadow-[0_0_15px_rgba(184,134,11,0.2)] animate-[pulse_2s_infinite]' : 'bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white border-transparent'}`}><HeartHandshake size={14} /> Help & Support</button>
                  </div>
               )}
          </div>
          
          <div className="p-4 border-t border-zinc-900 flex-shrink-0 bg-[#050505] z-20">
            <button onClick={onLogout} className="w-full text-zinc-600 hover:text-red-500 text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors"><LogOut size={14} /> EXIT SYSTEM</button>
          </div>
        </div>
      )}

      {/* ─── MAIN CHAT AREA ─── */}
      {!isLiveMode && (
        <div className="flex-1 flex flex-col bg-[#080808] relative h-screen">
          
          <div className="absolute top-0 left-0 w-full p-6 z-40 flex items-center justify-between bg-gradient-to-b from-[#080808] to-transparent pointer-events-none">
              <div className="flex items-center gap-4 pointer-events-auto">
                  <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 text-zinc-400 hover:text-[#B8860B] hover:border-[#B8860B]/40 transition-all shadow-lg outline-none">
                    {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                  </button>
                  {userRole === 'lawyer' && (
                     <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 shadow-sm backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest truncate max-w-[150px]">{clients.find(c=>c.id===activeClient)?.name}</span>
                     </div>
                  )}
              </div>
              
              <div className="pointer-events-auto">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-full border border-zinc-700 hover:border-[#B8860B] transition-all overflow-hidden flex items-center justify-center bg-zinc-900 shadow-xl outline-none">
                      {profilePic ? <img src={profilePic} className="w-full h-full object-cover" alt="profile" /> : <User size={18} className="text-zinc-400" />}
                  </button>
              </div>
          </div>

          {showProfileMenu && (
              <div className="absolute top-20 right-8 z-50 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-5 animate-[fadeInDown_0.2s_ease-out]">
                  <div className="flex flex-col items-center border-b border-zinc-800 pb-5 mb-4">
                      <div className="w-16 h-16 rounded-full mb-3 flex items-center justify-center overflow-hidden border-2 border-[#B8860B]/50 bg-zinc-950 shadow-inner">
                          {profilePic ? <img src={profilePic} className="w-full h-full object-cover" alt="profile" /> : <User size={24} className="text-[#B8860B]" />}
                      </div>
                      <h4 className="text-white text-sm font-bold truncate w-full text-center tracking-wide">{username}</h4>
                      <p className="text-zinc-500 text-[10px] truncate w-full text-center mt-1">{userEmail}</p>
                      <span className="mt-3 px-3 py-1 bg-[#B8860B]/10 text-[#B8860B] text-[9px] uppercase tracking-widest font-black rounded-md border border-[#B8860B]/20">
                          {userRole === 'lawyer' ? 'Practicing Lawyer Profile' : 'Victim Profile'}
                      </span>
                  </div>
                  <label className="flex items-center justify-center gap-2 w-full py-3 mb-2 bg-zinc-950 hover:bg-[#B8860B]/10 text-zinc-300 hover:text-[#B8860B] rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-800 hover:border-[#B8860B]/50">
                      <Settings size={14} /> Update Display Picture
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                  </label>
                  <button onClick={onLogout} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-all border border-red-500/20 flex items-center justify-center gap-2">
                      <LogOut size={14}/> Exit System
                  </button>
              </div>
          )}

          {/* ─── CHAT MESSAGES ─── */}
          <div 
            ref={chatScrollRef}
            className="flex-1 pt-24 px-8 pb-4 overflow-y-auto space-y-6 scrollbar-hide z-10"
            onScroll={handleScroll}
          >
            {(() => {
            const lastAiMsgId = [...messages].reverse().find(m => m.role === 'ai')?.id;
            return messages.map((msg) => (
              <div key={msg.id} className={`max-w-4xl mx-auto flex gap-4 animate-[fadeInUp_0.3s_ease-out] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${msg.role === 'user' ? 'bg-[#B8860B]/10 border border-[#B8860B]/40 shadow-[0_0_15px_rgba(184,134,11,0.3)] rounded-full overflow-hidden p-0.5' : 'bg-[#B8860B]/20 border border-[#B8860B]/40 rounded-lg shadow-lg overflow-hidden'}`}>
                  {msg.role === 'user' ? (
                     profilePic ? <img src={profilePic} className="w-full h-full object-cover rounded-full" alt="user" /> : <User size={18} className="text-[#B8860B]" />
                  ) : (
                     <Scale size={18} className="text-[#B8860B]" />
                  )}
                </div>
                
                {msg.role === 'user' ? (
                  <div className="flex flex-col items-end max-w-[85%]">
                    <div className={`p-5 sm:p-6 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xl bg-zinc-800 text-zinc-200 rounded-tr-none border transition-colors duration-300 ${msg.status === 'failed' ? 'border-red-500/50 bg-red-950/20' : 'border-zinc-700/50'}`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.status === 'failed' && (
                      <button onClick={() => retryMessage(msg.id, msg.text)} className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-[10px] text-red-500 hover:text-red-400 hover:bg-red-500/20 font-bold uppercase tracking-widest transition-all shadow-sm">
                        <RefreshCw size={12} className={isTyping ? "animate-spin text-zinc-500" : ""} /> {isTyping ? 'Retrying...' : 'Network Issue - Click to Retry'}
                      </button>
                    )}
                  </div>
                ) : (
                  <AiMessageCard 
                      msg={msg.id === lastAiMsgId ? msg : { ...msg, animate: false }} 
                      onOptionClick={(opt) => addMessage(`Drafting: ${opt}`, 'user')} 
                      forceStop={globalStop}
                      onTypingComplete={() => {
                          if (msg.id === lastAiMsgId) {
                              setIsGenerating(false);
                          }
                      }}
                  /> 
                )}

              </div>
            ));
          })()}
            {isTyping && <div className="max-w-4xl mx-auto flex gap-4"><Loader2 className="animate-spin text-zinc-800" size={18} /></div>}
            <div ref={chatEndRef} />
          </div>

          {/* ─── SCROLL TO BOTTOM ARROW ─── */}
          {showScrollArrow && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-32 right-8 z-30 w-11 h-11 flex items-center justify-center bg-zinc-900/95 border border-zinc-700 hover:border-[#B8860B] hover:bg-[#B8860B]/10 text-zinc-400 hover:text-[#B8860B] rounded-full shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm animate-[fadeInUp_0.2s_ease-out]"
              title="Jump to latest message"
            >
              <ChevronDown size={20} className="animate-[scrollBounce_1.5s_ease-in-out_infinite]" />
            </button>
          )}

          {/* ─── INPUT BAR ─── */}
          <div className="px-8 pb-8 pt-4 z-10 border-t border-zinc-900/80 bg-[#080808]/90 backdrop-blur-md relative flex-shrink-0">
            
            {isGenerating && (
                <div className="absolute -top-16 left-0 right-0 flex justify-center z-20 animate-[fadeInUp_0.3s_ease-out]">
                    <button type="button" onClick={handleStopAndEdit} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-red-500/50 text-red-500 hover:text-white hover:bg-red-600 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl outline-none hover:scale-105 active:scale-95">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> STOP & EDIT
                    </button>
                </div>
            )}

            <form onSubmit={(e) => { 
                e.preventDefault(); 
                if (inputValue.trim()) { 
                    if (isGenerating) stopResponse(); 
                    setTimeout(() => addMessage(inputValue, 'user'), 300);
                    setInputValue(''); 
                } 
            }} className="max-w-4xl mx-auto flex gap-3 items-end">
              <div className="relative flex-1 group">
                  <textarea 
                      value={inputValue} 
                      onChange={(e) => setInputValue(e.target.value)} 
                      placeholder={isDictating ? "Listening..." : isGenerating ? "Editing question..." : "Type your legal issue in English or Roman Urdu..."} 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-6 pr-28 outline-none text-sm focus:border-[#B8860B] transition-all shadow-inner resize-none scrollbar-hide block" 
                      rows="1"
                      style={{ minHeight: '56px', maxHeight: '150px' }}
                      onInput={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = (e.target.scrollHeight < 150 ? e.target.scrollHeight : 150) + 'px';
                      }}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (inputValue.trim()) {
                                  if (isGenerating) stopResponse();
                                  setTimeout(() => addMessage(inputValue, 'user'), 300);
                                  setInputValue('');
                                  e.target.style.height = 'auto';
                              }
                          }
                      }}
                  />
                  <button type="button" onClick={() => setShowUploadUI(true)} className="absolute right-14 bottom-3 p-2 text-zinc-500 hover:text-[#B8860B] outline-none"><Paperclip size={18} /></button>
                  <button type="button" onClick={startVoiceRecognition} className={`absolute right-4 bottom-3 p-2 transition-all outline-none ${isDictating ? 'text-[#B8860B] animate-pulse' : 'text-zinc-500 hover:text-white'}`}><Mic size={20} /></button>
              </div>
              <button type="submit" className="flex items-center justify-center h-[56px] w-[56px] shrink-0 bg-[#B8860B] text-black rounded-2xl hover:scale-105 transition-all shadow-lg outline-none"><Send size={22} className="ml-1" /></button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 👨‍⚖️ LAWYER MODAL 1: CASE MANAGEMENT */}
      {/* ────────────────────────────────────────────────────────── */}
      {showCaseManager && (
        <div className="absolute inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2rem] max-w-4xl w-full h-[85vh] flex flex-col relative shadow-[0_0_100px_rgba(184,134,11,0.05)]">
            <button onClick={() => {setShowCaseManager(false); setDraftNotice(null);}} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><X size={24} /></button>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                <div className="w-14 h-14 bg-[#B8860B]/10 rounded-full flex items-center justify-center border border-[#B8860B]/30"><Briefcase size={24} className="text-[#B8860B]" /></div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">Case Management</h3>
                    <p className="text-[10px] text-zinc-500 tracking-widest uppercase">Client Records & Notice Drafting</p>
                </div>
            </div>

            {draftNotice ? (
                <div className="flex-1 flex flex-col animate-[fadeInUp_0.3s_ease-out]">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-[#B8860B] uppercase tracking-widest flex items-center gap-2"><FileEdit size={16}/> Edit Legal Notice</h4>
                        <button onClick={downloadNotice} className="bg-[#B8860B] text-black px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:scale-105 transition-transform"><Download size={14}/> Download .DOC</button>
                    </div>
                    <textarea 
                        value={draftNotice.text} 
                        onChange={(e) => setDraftNotice({...draftNotice, text: e.target.value})}
                        className="flex-1 w-full bg-zinc-900 border border-zinc-700 rounded-xl p-6 text-sm text-zinc-300 outline-none focus:border-[#B8860B] leading-relaxed resize-none scrollbar-hide"
                    />
                    <button onClick={() => setDraftNotice(null)} className="mt-4 text-zinc-500 text-xs hover:text-white uppercase font-bold self-start">← Back to Cases</button>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col md:flex-row gap-8 scrollbar-hide">
                    <form className="w-full md:w-1/3 space-y-4" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const newCase = { id: Date.now(), court: formData.get('court'), caseNo: formData.get('caseNo'), firNo: formData.get('firNo'), parties: formData.get('parties'), status: 'Active' };
                        setCases([...cases, newCase]);
                        e.target.reset();
                    }}>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Register New Case</h4>
                        <input name="parties" placeholder="Parties (e.g. Ali vs State)" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#B8860B]" />
                        <input name="court" placeholder="Court Name" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#B8860B]" />
                        <div className="flex gap-2">
                            <input name="caseNo" placeholder="Case No." required className="w-1/2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#B8860B]" />
                            <input name="firNo" placeholder="FIR No." className="w-1/2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#B8860B]" />
                        </div>
                        <button type="submit" className="w-full bg-zinc-800 hover:bg-[#B8860B] text-white hover:text-black py-3 rounded-xl text-xs font-bold uppercase transition-colors">Add Case</button>
                    </form>

                    <div className="w-full md:w-2/3 space-y-3">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Active Cases Repository</h4>
                        {cases.length === 0 ? <p className="text-zinc-600 text-xs italic">No cases registered yet.</p> : cases.map(c => (
                            <div key={c.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center group hover:border-[#B8860B]/50 transition-colors">
                                <div>
                                    <h5 className="font-bold text-white text-sm">{c.parties}</h5>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-1">{c.court} • Case: {c.caseNo} • FIR: {c.firNo || 'N/A'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setDraftNotice({caseNo: c.caseNo, text: generateNoticeTemplate(c)})} className="px-3 py-1.5 bg-[#B8860B]/10 text-[#B8860B] hover:bg-[#B8860B] hover:text-black rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-[#B8860B]/30"><FileText size={12} className="inline mr-1"/> Draft Notice</button>
                                    <button onClick={() => setCases(cases.filter(x => x.id !== c.id))} className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 👨‍⚖️ LAWYER MODAL 2: HEARING CALENDAR */}
      {/* ────────────────────────────────────────────────────────── */}
      {showHearings && (
        <div className="absolute inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2rem] max-w-3xl w-full h-[80vh] flex flex-col relative shadow-[0_0_100px_rgba(168,85,247,0.05)]">
            <button onClick={() => setShowHearings(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><X size={24} /></button>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                <div className="w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/30"><CalendarDays size={24} className="text-purple-400" /></div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">Hearing Calendar</h3>
                    <p className="text-[10px] text-zinc-500 tracking-widest uppercase">Schedule & Reminders</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col md:flex-row gap-8 scrollbar-hide">
                <form className="w-full md:w-1/3 space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const newHearing = { id: Date.now(), caseName: formData.get('caseName'), date: formData.get('date'), notes: formData.get('notes') };
                    setHearings([...hearings, newHearing].sort((a,b) => new Date(a.date) - new Date(b.date)));
                    e.target.reset();
                }}>
                    <input name="caseName" placeholder="Case / Parties" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500" />
                    <input type="date" name="date" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400 outline-none focus:border-purple-500" />
                    <textarea name="notes" placeholder="Notes (e.g. Submit evidence)" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 resize-none h-24" />
                    <button type="submit" className="w-full bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white py-3 rounded-xl text-xs font-bold uppercase transition-colors border border-purple-500/30">Save Date</button>
                </form>

                <div className="w-full md:w-2/3 space-y-3">
                    {hearings.length === 0 ? <p className="text-zinc-600 text-xs italic">No upcoming hearings.</p> : hearings.map(h => {
                        const isToday = new Date().toDateString() === new Date(h.date).toDateString();
                        const isEditing = editingHearingId === h.id;
                        return (
                        <div key={h.id} className={`p-4 rounded-xl flex justify-between items-start border transition-colors ${isToday ? 'bg-purple-500/10 border-purple-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-white text-sm">{h.caseName}</h5>
                                    {isToday && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full uppercase font-black tracking-widest flex items-center gap-1 animate-pulse"><Bell size={10} className="animate-[ring_1s_infinite]"/> Today</span>}
                                </div>
                                <p className="text-xs text-zinc-400 mt-1">{new Date(h.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                
                                {isEditing ? (
                                    <div className="mt-3 flex gap-2">
                                        <textarea value={editingHearingNotes} onChange={e=>setEditingHearingNotes(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none resize-none" rows="3"/>
                                        <div className="flex flex-col gap-2">
                                            <button onClick={()=>saveHearingEdit(h.id)} className="bg-green-500/20 text-green-500 p-2 rounded-lg hover:bg-green-500 hover:text-white transition-colors"><Save size={14}/></button>
                                            <button onClick={()=>setEditingHearingId(null)} className="bg-red-500/20 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><X size={14}/></button>
                                        </div>
                                    </div>
                                ) : (
                                    h.notes && <p className="text-[11px] text-zinc-300 mt-2 bg-black/50 p-3 rounded-lg border border-zinc-800/50 leading-relaxed whitespace-pre-wrap">{h.notes}</p>
                                )}
                            </div>
                            {!isEditing && (
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => { setEditingHearingId(h.id); setEditingHearingNotes(h.notes || ''); }} className="text-zinc-600 hover:text-blue-400 transition-colors"><FileEdit size={14}/></button>
                                    <button onClick={() => setHearings(hearings.filter(x => x.id !== h.id))} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                </div>
                            )}
                        </div>
                    )})}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 🛡️ VICTIM MODAL 1: SECURE VAULT */}
      {/* ────────────────────────────────────────────────────────── */}
      {showVault && (
        <div className="absolute inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2rem] max-w-2xl w-full h-[70vh] flex flex-col relative shadow-[0_0_100px_rgba(59,130,246,0.1)]">
            <button onClick={() => {setShowVault(false); setIsVaultUnlocked(false); setPinInput('');}} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><X size={24} /></button>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30"><LockKeyhole size={24} className="text-blue-400" /></div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">Secure Evidence Vault</h3>
                    <p className="text-[10px] text-zinc-500 tracking-widest uppercase">Local Encrypted Storage</p>
                </div>
            </div>

            {!vaultPin ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-[fadeInUp_0.3s_ease-out]">
                    <Key size={48} className="text-blue-500 mb-4 opacity-50" />
                    <h4 className="text-white text-lg font-bold mb-2">Setup Vault PIN</h4>
                    <p className="text-xs text-zinc-500 mb-6 max-w-xs">Create a 4-digit PIN to secure your evidence. This data stays only on your device.</p>
                    <input type="password" maxLength="4" value={pinInput} onChange={(e)=>setPinInput(e.target.value.replace(/\D/g, ''))} className="w-32 bg-zinc-900 border border-zinc-700 rounded-xl text-center text-2xl tracking-[0.5em] py-4 text-white outline-none focus:border-blue-500" placeholder="••••" />
                    <button onClick={() => { if(pinInput.length===4) { setVaultPin(pinInput); setIsVaultUnlocked(true); } else alert("PIN must be 4 digits.") }} className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-blue-500">Lock Vault</button>
                </div>
            ) : !isVaultUnlocked ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-[fadeInUp_0.3s_ease-out]">
                    <Lock size={48} className="text-blue-500 mb-4 opacity-50" />
                    <h4 className="text-white text-lg font-bold mb-6">Vault Locked</h4>
                    <input type="password" maxLength="4" value={pinInput} onChange={(e)=>setPinInput(e.target.value.replace(/\D/g, ''))} className="w-32 bg-zinc-900 border border-zinc-700 rounded-xl text-center text-2xl tracking-[0.5em] py-4 text-white outline-none focus:border-blue-500" placeholder="••••" />
                    <button onClick={() => { if(pinInput === vaultPin) setIsVaultUnlocked(true); else { alert("Incorrect PIN!"); setPinInput(''); } }} className="mt-4 bg-zinc-800 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-blue-500 border border-zinc-700 hover:border-blue-500">Unlock</button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col animate-[fadeIn_0.3s_ease-out] overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-xs text-green-500 font-bold tracking-widest uppercase flex items-center gap-2"><ShieldCheck size={14}/> Unlocked & Secured</p>
                        <label className="bg-blue-600/20 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-xs font-bold uppercase cursor-pointer hover:bg-blue-600 hover:text-white transition-colors">
                            + Add Evidence
                            <input type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleVaultUpload} />
                        </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 scrollbar-hide">
                        {vaultFiles.length === 0 ? <p className="text-zinc-600 text-xs italic col-span-full text-center mt-10">Vault is empty. Upload photos, videos, or PDFs.</p> : vaultFiles.map(f => (
                            <div key={f.id} className="relative group bg-zinc-900 border border-zinc-800 rounded-xl p-2 aspect-square flex flex-col items-center justify-center text-center overflow-hidden">
                                {f.type.startsWith('image/') ? <img src={f.data} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt="evidence"/> : <FileText size={32} className="text-zinc-600 mb-2"/>}
                                <span className="relative z-10 text-[10px] text-white bg-black/70 px-2 py-1 rounded w-11/12 truncate mt-auto">{f.name}</span>
                                <button onClick={() => setVaultFiles(vaultFiles.filter(x => x.id !== f.id))} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 🛡️ VICTIM MODAL 2: CASE TIMELINE REPORT */}
      {/* ────────────────────────────────────────────────────────── */}
      {showTimeline && (
        <div className="absolute inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2rem] max-w-4xl w-full h-[85vh] flex flex-col relative shadow-[0_0_100px_rgba(184,134,11,0.15)]">
            <button onClick={() => setShowTimeline(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><X size={24} /></button>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
                <div className="w-14 h-14 bg-[#B8860B]/10 rounded-full flex items-center justify-center border border-[#B8860B]/30"><Clock size={24} className="text-[#B8860B]" /></div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">Case Timeline Report</h3>
                    <p className="text-[10px] text-zinc-500 tracking-widest uppercase">Chronological Incident History</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col md:flex-row gap-8 scrollbar-hide">
                <form className="w-full md:w-1/3 space-y-4" onSubmit={addTimelineEvent}>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Log New Event</h4>
                    <input type="date" name="date" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400 outline-none focus:border-[#B8860B]" />
                    <input name="title" placeholder="Event Title (e.g. Incident Occurred)" required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#B8860B]" />
                    <textarea name="story" placeholder="Diary Notes / What Happened?" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#B8860B] resize-none h-24" />
                    <input name="location" placeholder="Location Address" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#B8860B]" />
                    <input name="firRef" placeholder="FIR / Reference No (Optional)" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#B8860B]" />
                    <button type="submit" className="w-full bg-zinc-800 hover:bg-[#B8860B] text-white hover:text-black py-3 rounded-xl text-xs font-bold uppercase transition-colors">Add to Timeline</button>
                </form>

                <div className="w-full md:w-2/3 overflow-y-auto pl-2 scrollbar-hide">
                    {timelineEvents.length === 0 ? <p className="text-zinc-600 text-xs italic">Timeline is empty. Log your first event.</p> : (
                        <div className="relative border-l-2 border-zinc-800 ml-4 space-y-8 pb-4">
                            {timelineEvents.map(ev => {
                                const isEditing = editingTimelineId === ev.id;
                                return (
                                <div key={ev.id} className="pl-6 relative group">
                                    <div className="absolute w-4 h-4 bg-zinc-950 border-2 border-[#B8860B] rounded-full -left-[9px] top-1 group-hover:bg-[#B8860B] transition-colors shadow-[0_0_10px_rgba(184,134,11,0.5)]"></div>
                                    <div className="bg-zinc-900/50 border border-zinc-800/80 p-5 rounded-xl hover:border-[#B8860B]/50 transition-colors">
                                        
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <input type="date" value={editingTimelineData.date} onChange={e=>setEditingTimelineData({...editingTimelineData, date: e.target.value})} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none" />
                                                <input type="text" value={editingTimelineData.title} onChange={e=>setEditingTimelineData({...editingTimelineData, title: e.target.value})} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none" />
                                                <textarea value={editingTimelineData.story} onChange={e=>setEditingTimelineData({...editingTimelineData, story: e.target.value})} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none resize-none" rows="3" />
                                                <input type="text" value={editingTimelineData.location} onChange={e=>setEditingTimelineData({...editingTimelineData, location: e.target.value})} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none" placeholder="Location" />
                                                <input type="text" value={editingTimelineData.firRef} onChange={e=>setEditingTimelineData({...editingTimelineData, firRef: e.target.value})} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none" placeholder="FIR Ref" />
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => saveTimelineEdit(ev.id)} className="bg-[#B8860B] text-black px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">Save</button>
                                                    <button onClick={() => setEditingTimelineId(null)} className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-700 transition-colors">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[10px] text-[#B8860B] font-black tracking-widest uppercase">{new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    <div className="flex gap-3">
                                                        <button onClick={() => { setEditingTimelineId(ev.id); setEditingTimelineData(ev); }} className="text-zinc-600 hover:text-blue-400 transition-colors"><FileEdit size={14}/></button>
                                                        <button onClick={() => setTimelineEvents(timelineEvents.filter(x => x.id !== ev.id))} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                                    </div>
                                                </div>
                                                <h4 className="text-white font-bold text-sm mb-3">{ev.title}</h4>
                                                {ev.story && <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-lg border border-zinc-800 mb-3 whitespace-pre-wrap">{ev.story}</p>}
                                                <div className="flex flex-wrap gap-2">
                                                    {ev.location && <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-[9px] uppercase font-bold"><MapPin size={10}/> {ev.location}</span>}
                                                    {ev.firRef && <span className="flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded text-[9px] uppercase font-bold"><FileSearch size={10}/> REF: {ev.firRef}</span>}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 🛡️ VICTIM MODAL 3: EMERGENCY SOS — REDESIGNED DESKTOP UI  */}
      {/* ────────────────────────────────────────────────────────── */}
      {showSOS && (
        <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-[fadeIn_0.15s_ease-out]">
          <div className="relative w-full max-w-3xl animate-[fadeInUp_0.25s_ease-out]">
            
            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-red-600/5 blur-3xl scale-110 pointer-events-none animate-[sosGlow_3s_ease-in-out_infinite]"></div>
            
            <div className="relative bg-zinc-950 border border-red-900/40 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.15)]">
              
              {/* Header bar */}
              <div className="flex items-center justify-between px-8 py-5 bg-red-950/30 border-b border-red-900/30">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center border border-red-600/40">
                      <Siren size={20} className="text-red-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                  <div>
                    <h2 className="text-white font-black text-lg uppercase tracking-widest leading-none">Emergency Dispatch</h2>
                    <p className="text-red-400/70 text-[10px] uppercase tracking-[0.25em] font-bold mt-0.5">Immediate Assistance Protocol</p>
                  </div>
                </div>
                <button onClick={() => setShowSOS(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left — Emergency dispatch buttons */}
                <div className="space-y-4">
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-5">Direct Dispatch Lines</p>
                  
                  {/* Police */}
                  <button
                    onClick={() => triggerSOS('police')}
                    className="group w-full flex items-center gap-5 p-5 bg-blue-950/30 border border-blue-800/40 hover:border-blue-500/70 hover:bg-blue-950/60 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg"
                  >
                    <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-600/30 group-hover:border-blue-500/60 group-hover:bg-blue-600/30 transition-all flex-shrink-0">
                      <PhoneCall size={24} className="text-blue-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-white font-black text-base tracking-wide leading-none">Police</p>
                      <p className="text-blue-400/70 text-xs mt-1 font-medium">Law Enforcement & Security</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-blue-400 font-black text-2xl leading-none">15</span>
                      <p className="text-blue-400/50 text-[9px] uppercase tracking-wider font-bold mt-0.5">Dial Now</p>
                    </div>
                  </button>

                  {/* Ambulance */}
                  <button
                    onClick={() => triggerSOS('ambulance')}
                    className="group w-full flex items-center gap-5 p-5 bg-green-950/30 border border-green-800/40 hover:border-green-500/70 hover:bg-green-950/60 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg"
                  >
                    <div className="w-14 h-14 bg-green-600/20 rounded-xl flex items-center justify-center border border-green-600/30 group-hover:border-green-500/60 group-hover:bg-green-600/30 transition-all flex-shrink-0">
                      <Stethoscope size={24} className="text-green-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-white font-black text-base tracking-wide leading-none">Rescue / Medical</p>
                      <p className="text-green-400/70 text-xs mt-1 font-medium">Ambulance & Emergency Medical</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-green-400 font-black text-2xl leading-none">1122</span>
                      <p className="text-green-400/50 text-[9px] uppercase tracking-wider font-bold mt-0.5">Dial Now</p>
                    </div>
                  </button>

                  {/* SMS Location */}
                  <button
                    onClick={() => triggerSOS('sms')}
                    className="group w-full flex items-center gap-5 p-5 bg-red-950/40 border border-red-800/50 hover:border-red-500/80 hover:bg-red-950/70 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg animate-[sosGlow_3s_ease-in-out_infinite]"
                  >
                    <div className="w-14 h-14 bg-red-600/20 rounded-xl flex items-center justify-center border border-red-600/40 group-hover:bg-red-600/30 group-hover:border-red-500 transition-all flex-shrink-0">
                      <MapPin size={24} className="text-red-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-white font-black text-base tracking-wide leading-none">Broadcast Location</p>
                      <p className="text-red-400/70 text-xs mt-1 font-medium">Send live GPS to all trusted contacts</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 bg-red-600/20 border border-red-500/40 rounded-lg flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-500 transition-all">
                        <Send size={14} className="text-red-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Right — Trusted contacts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em]">Emergency Contacts</p>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">SMS Recipients</span>
                  </div>

                  <div className="space-y-3">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="relative group/input">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black ${trustedContacts[i] ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'bg-zinc-800 text-zinc-600 border border-zinc-700'}`}>
                            {i + 1}
                          </div>
                        </div>
                        <input
                          type="tel"
                          value={trustedContacts[i]}
                          placeholder={`Contact ${i + 1} — Phone Number`}
                          onChange={(e) => {
                            const newContacts = [...trustedContacts];
                            newContacts[i] = e.target.value;
                            setTrustedContacts(newContacts);
                          }}
                          className="w-full bg-zinc-900/60 border border-zinc-800 group-hover/input:border-zinc-700 focus:border-red-500/60 rounded-xl pl-14 pr-4 py-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600"
                        />
                        {trustedContacts[i] && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <CheckCircle2 size={14} className="text-green-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
                    <p className="text-[9px] text-zinc-500 leading-relaxed font-medium uppercase tracking-wider">
                      Numbers saved here will receive your precise GPS coordinates via SMS when you tap <span className="text-red-400 font-black">Broadcast Location</span>. Contacts are stored locally on your device only.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-zinc-800/50 rounded-xl">
                      <ShieldCheck size={16} className="text-green-500 flex-shrink-0" />
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-tight">Data stored locally only</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-zinc-900/40 border border-zinc-800/50 rounded-xl">
                      <Lock size={16} className="text-blue-400 flex-shrink-0" />
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider leading-tight">No server transmission</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CLIENT MANAGER ─── */}
      {showClientManager && (
        <div className="absolute inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2rem] text-center max-w-md w-full relative shadow-[0_0_100px_rgba(184,134,11,0.05)]">
            <button onClick={() => setShowClientManager(false)} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><X size={20} /></button>
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30"><Users size={28} className="text-blue-500" /></div>
            <h3 className="text-xl font-bold mb-1 uppercase tracking-tight text-white">Client Workspaces</h3>
            <p className="text-[10px] text-zinc-500 mb-6 tracking-widest uppercase">Select, Add or Edit Client Records.</p>
            
            <div className="max-h-48 overflow-y-auto space-y-2 mb-6 scrollbar-hide text-left">
                {clients.map(client => {
                    const isEditing = editingClientId === client.id;
                    return (
                    <div key={client.id} className={`w-full flex items-center justify-between p-2 pl-4 rounded-xl border transition-all ${activeClient === client.id ? 'bg-[#B8860B]/10 border-[#B8860B]/50 text-[#B8860B]' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-zinc-300'}`}>
                        {isEditing ? (
                            <div className="flex-1 flex gap-2 items-center pr-2">
                                <input value={editingClientName} onChange={e => setEditingClientName(e.target.value)} onClick={e => e.stopPropagation()} className="w-full bg-black border border-zinc-700 text-white px-3 py-1 rounded outline-none text-xs" />
                                <button onClick={(e) => { e.stopPropagation(); saveClientEdit(client.id); }} className="text-green-500 hover:scale-110"><Save size={14}/></button>
                                <button onClick={(e) => { e.stopPropagation(); setEditingClientId(null); }} className="text-zinc-500 hover:scale-110"><X size={14}/></button>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => { setActiveClient(client.id); setShowClientManager(false); }} className="flex-1 flex items-center justify-between text-left py-2 outline-none">
                                    <span className="text-sm font-bold truncate pr-4">{client.name}</span>
                                    {activeClient === client.id && <CheckCircle2 size={16} className="mr-2" />}
                                </button>
                                {client.id !== 'default' && (
                                    <div className="flex gap-2 shrink-0 pr-2">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingClientId(client.id); setEditingClientName(client.name); }} className="p-1.5 text-zinc-600 hover:text-blue-400 transition-colors"><FileEdit size={14}/></button>
                                        <button onClick={(e) => deleteClient(e, client.id)} className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )})}
            </div>

            <form onSubmit={addClient} className="flex items-center gap-2 pt-4 border-t border-zinc-800">
                <input type="text" placeholder="Enter New Client Name..." value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-xs text-white focus:border-[#B8860B]" />
                <button type="submit" disabled={!newClientName.trim()} className="p-3 bg-[#B8860B] text-black rounded-xl hover:scale-105 transition-all disabled:opacity-50"><Plus size={18}/></button>
            </form>
          </div>
        </div>
      )}

      {showUploadUI && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-zinc-950 border border-zinc-800 p-12 rounded-[3rem] text-center max-w-lg w-full relative shadow-[0_0_100px_rgba(184,134,11,0.05)]">
            <button onClick={() => setShowUploadUI(false)} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>
            <div className="w-20 h-20 bg-[#B8860B]/10 rounded-full flex items-center justify-center mx-auto mb-6"><UploadCloud size={32} className="text-[#B8860B]" /></div>
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Upload Document</h3>
            <p className="text-xs text-zinc-500 mb-10 tracking-[0.2em] uppercase font-bold">Secure PDF Analysis</p>
            <label className="block w-full bg-zinc-900 border border-zinc-800 hover:border-[#B8860B] py-5 rounded-2xl cursor-pointer text-xs font-black transition-all uppercase tracking-[0.3em] hover:bg-[#B8860B]/5">
              Browse PDF
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload}/>
            </label>
          </div>
        </div>
      )}

      {/* ─── VICTIM GUIDE FULL SCREEN ─── */}
      {showVictimGuide && (
        <div className="absolute inset-0 z-[200] bg-[#050505] flex flex-col animate-[slideInRight_0.4s_ease-out] overflow-hidden">
            <div className="flex-shrink-0 sticky top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-800/80 px-6 py-4 flex justify-between items-center shadow-xl">
               <button onClick={() => setShowVictimGuide(false)} className="flex items-center gap-3 text-zinc-400 hover:text-[#B8860B] transition-colors group text-[10px] font-black tracking-widest uppercase">
                  <div className="p-2 bg-zinc-900 rounded-full group-hover:bg-[#B8860B]/20 border border-zinc-800 group-hover:border-[#B8860B]/50 transition-all">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-white group-hover:text-[#B8860B]" />
                  </div>
                  <span className="hidden md:inline">Return to Dashboard</span>
               </button>
               <div className="flex items-center bg-zinc-950 p-1.5 rounded-full border border-zinc-800 shadow-inner">
                   <button onClick={() => setGuideLang('en')} className={`px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${guideLang === 'en' ? 'bg-[#B8860B] text-black shadow-lg scale-100' : 'text-zinc-500 hover:text-zinc-300 scale-95'}`}>English</button>
                   <button onClick={() => setGuideLang('ru')} className={`px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${guideLang === 'ru' ? 'bg-[#B8860B] text-black shadow-lg scale-100' : 'text-zinc-500 hover:text-zinc-300 scale-95'}`}>Roman Urdu</button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
                <div className="max-w-5xl mx-auto px-6 pt-12 md:pt-16">
                   <div className="text-center mb-12 md:mb-16 animate-[fadeInUp_0.5s_ease-out]">
                       <div className="w-20 h-20 md:w-24 md:h-24 bg-[#B8860B]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#B8860B]/30 shadow-[0_0_30px_rgba(184,134,11,0.15)] relative">
                          <div className="absolute inset-0 rounded-full border border-[#B8860B] animate-ping opacity-20"></div>
                          <BookOpen size={32} className="text-[#B8860B] w-8 h-8 md:w-10 md:h-10" />
                       </div>
                       <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4 drop-shadow-md">{guideContent[guideLang].title}</h1>
                       <p className="text-xs md:text-sm text-[#B8860B] tracking-[0.3em] uppercase font-bold max-w-2xl mx-auto px-4">{guideContent[guideLang].subtitle}</p>
                   </div>
                   <div className="p-6 md:p-8 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl text-zinc-300 leading-relaxed text-sm md:text-base italic mb-10 md:mb-12 shadow-2xl relative overflow-hidden animate-[fadeInUp_0.6s_ease-out]">
                       <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#B8860B]"></div>
                       "{guideContent[guideLang].intro}"
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                       {guideContent[guideLang].sections.map((sec, idx) => (
                           <div key={idx} className="p-6 md:p-8 bg-[#0a0a0a] border border-zinc-800 hover:border-[#B8860B]/50 rounded-3xl transition-all duration-300 shadow-xl hover:shadow-[0_10px_40px_rgba(184,134,11,0.1)] group hover:-translate-y-1">
                               <div className="flex items-center gap-4 md:gap-5 mb-5 md:mb-6">
                                   <div className="p-3 md:p-4 bg-zinc-900 rounded-2xl border border-zinc-800 group-hover:scale-110 transition-transform duration-300 shadow-inner group-hover:border-[#B8860B]/30 group-hover:bg-[#B8860B]/10">{sec.icon}</div>
                                   <h3 className="font-black text-white tracking-wide text-base md:text-lg group-hover:text-[#B8860B] transition-colors">{sec.title}</h3>
                               </div>
                               <p className="text-zinc-400 text-xs md:text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">{sec.content}</p>
                           </div>
                       ))}
                   </div>
                </div>
            </div>
        </div>
      )}

      {/* ─── HELP FULL SCREEN ─── */}
      {showHelp && (
        <div className="absolute inset-0 z-[200] bg-[#050505] flex flex-col animate-[slideInRight_0.4s_ease-out] overflow-hidden">
            <div className="flex-shrink-0 sticky top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-800/80 px-6 py-4 flex justify-between items-center shadow-xl">
               <button onClick={() => setShowHelp(false)} className="flex items-center gap-3 text-zinc-400 hover:text-[#B8860B] transition-colors group text-[10px] font-black tracking-widest uppercase">
                  <div className="p-2 bg-zinc-900 rounded-full group-hover:bg-[#B8860B]/20 border border-zinc-800 group-hover:border-[#B8860B]/50 transition-all">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-white group-hover:text-[#B8860B]" />
                  </div>
                  <span className="hidden md:inline">Return to Dashboard</span>
               </button>
               <div className="flex items-center bg-zinc-950 p-1.5 rounded-full border border-zinc-800 shadow-inner">
                   <button onClick={() => setHelpLang('en')} className={`px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${helpLang === 'en' ? 'bg-[#B8860B] text-black shadow-lg scale-100' : 'text-zinc-500 hover:text-zinc-300 scale-95'}`}>English</button>
                   <button onClick={() => setHelpLang('ru')} className={`px-4 py-2 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${helpLang === 'ru' ? 'bg-[#B8860B] text-black shadow-lg scale-100' : 'text-zinc-500 hover:text-zinc-300 scale-95'}`}>Roman Urdu</button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
                <div className="max-w-5xl mx-auto px-6 pt-12 md:pt-16">
                   <div className="text-center mb-12 md:mb-16 animate-[fadeInUp_0.5s_ease-out]">
                       <div className="w-20 h-20 md:w-24 md:h-24 bg-[#B8860B]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#B8860B]/30 shadow-[0_0_30px_rgba(184,134,11,0.15)] relative">
                          <div className="absolute inset-0 rounded-full border border-[#B8860B] animate-ping opacity-20"></div>
                          <HeartHandshake size={32} className="text-[#B8860B] w-8 h-8 md:w-10 md:h-10" />
                       </div>
                       <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4 drop-shadow-md">{activeHelpContent[helpLang].title}</h1>
                       <p className="text-xs md:text-sm text-[#B8860B] tracking-[0.3em] uppercase font-bold max-w-2xl mx-auto px-4">{activeHelpContent[helpLang].subtitle}</p>
                   </div>
                   <div className="p-6 md:p-8 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl text-zinc-300 leading-relaxed text-sm md:text-base italic mb-10 md:mb-12 shadow-2xl relative overflow-hidden animate-[fadeInUp_0.6s_ease-out]">
                       <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#B8860B]"></div>
                       "{activeHelpContent[helpLang].intro}"
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                       {activeHelpContent[helpLang].sections.map((sec, idx) => (
                           <div key={idx} className="p-6 md:p-8 bg-[#0a0a0a] border border-zinc-800 hover:border-[#B8860B]/50 rounded-3xl transition-all duration-300 shadow-xl hover:shadow-[0_10px_40px_rgba(184,134,11,0.1)] group hover:-translate-y-1">
                               <div className="flex items-center gap-4 md:gap-5 mb-5 md:mb-6">
                                   <div className="p-3 md:p-4 bg-zinc-900 rounded-2xl border border-zinc-800 group-hover:scale-110 transition-transform duration-300 shadow-inner group-hover:border-[#B8860B]/30 group-hover:bg-[#B8860B]/10">{sec.icon}</div>
                                   <h3 className="font-black text-white tracking-wide text-base md:text-lg group-hover:text-[#B8860B] transition-colors">{sec.title}</h3>
                               </div>
                               <p className="text-zinc-400 text-xs md:text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">{sec.content}</p>
                           </div>
                       ))}
                   </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;