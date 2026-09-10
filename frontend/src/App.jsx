import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BookOpen, Brain, CheckCircle2, ChevronDown, Globe2,
  GraduationCap, Headphones, Home, Languages, Menu, Mic, Play,
  ShieldCheck, Sparkles, Star, Trophy, UserRound, Volume2, X, Sun, Moon, Info
} from "lucide-react";

const API = "https://shikshasetu-ai-prototype1.onrender.com";

const TTS_LOCALES = { hindi:"hi-IN", telugu:"te-IN", bengali:"bn-IN", odia:"or-IN", kannada:"kn-IN", santhali:"sat-IN", mundari:"unr-IN", ho:"hoc-IN" };

const languages = [
  { id: "hindi", label: "Hindi", native: "हिन्दी" },
  { id: "telugu", label: "Telugu", native: "తెలుగు" },
  { id: "bengali", label: "Bengali", native: "বাংলা" },
  { id: "odia", label: "Odia", native: "ଓଡ଼ିଆ" },
  { id: "kannada", label: "Kannada", native: "ಕನ್ನಡ" },
  { id: "santhali", label: "Santhali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { id: "mundari", label: "Mundari", native: "Mundari" },
  { id: "ho", label: "Ho", native: "Ho" }
];

const demoProgress = [
  { subject: "Science", value: 80, icon: "🌱" },
  { subject: "Mathematics", value: 65, icon: "🔢" },
  { subject: "Language", value: 90, icon: "📖" }
];

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [page, setPage] = useState("home");
  const [mobile, setMobile] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("shikshasetu_token"));
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("shikshasetu_user") || "null"); } catch { return null; } });
  const authenticated = Boolean(token && user);
  const [dark, setDark] = useState(() => localStorage.getItem("shikshasetu_theme") === "dark");

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 2800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("shikshasetu_theme", dark ? "dark" : "light");
  }, [dark]);

  async function login(email, password) {
    const r = await fetch(`${API}/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password}) });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Unable to sign in");
    localStorage.setItem("shikshasetu_token", data.token);
    localStorage.setItem("shikshasetu_user", JSON.stringify(data.user));
    setToken(data.token); setUser(data.user); setPage("dashboard");
  }

  function logout() {
    localStorage.removeItem("shikshasetu_token");
    localStorage.removeItem("shikshasetu_user");
    setToken(null); setUser(null); setPage("home");
  }

  if (showIntro) {
    return <IntroSplash dark={dark} />;
  }

  if (!authenticated) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="app">
      <header className="nav">
        <div className="brand" onClick={() => setPage("home")}>
          <div className="brand-mark">🌱</div>
          <div>
            <div className="brand-name">ShikshaSetu <span>AI</span></div>
            <div className="brand-tag">Learning in every child's language</div>
          </div>
        </div>
        <button className="mobile-menu" onClick={() => setMobile(!mobile)}>
          {mobile ? <X size={21}/> : <Menu size={21}/>}
        </button>
        <nav className={mobile ? "nav-links open" : "nav-links"}>
          <button className={page === "home" ? "active" : ""} onClick={() => {setPage("home");setMobile(false)}}><Home size={16}/> Home</button>
          <button className={page === "dashboard" ? "active" : ""} onClick={() => {setPage("dashboard");setMobile(false)}}><BookOpen size={16}/> Teach</button>
          <button className={page === "student" ? "active" : ""} onClick={() => {setPage("student");setMobile(false)}}><GraduationCap size={16}/> Student</button>
          <button className={page === "progress" ? "active" : ""} onClick={() => {setPage("progress");setMobile(false)}}><Trophy size={16}/> Progress</button>
          <button className={page === "info" ? "active" : ""} onClick={() => {setPage("info");setMobile(false)}}><Info size={16}/> Project Info</button>
        </nav>
        <div className="nav-actions"><button className="theme-toggle" aria-label="Toggle dark mode" onClick={() => setDark(v => !v)}>{dark ? <Sun size={16}/> : <Moon size={16}/>}<span>{dark ? "Light" : "Dark"}</span></button><div className="nav-user"><div className="avatar"><UserRound size={15}/></div><span>{user?.name || "Teacher"}</span><button className="logout-btn" onClick={logout}>Logout</button></div></div>
      </header>

      {page === "home" && <HomePage onStart={() => setPage("dashboard")} />}
      {page === "dashboard" && <TeacherDashboard />}
      {page === "student" && <StudentMode />}
      {page === "progress" && <ProgressPage />}
      {page === "info" && <ProjectInfoPage />}

      <footer>
        <div>
          <div className="footer-brand">🌱 ShikshaSetu AI</div>
          <p>Bridging classrooms through language, AI and inclusive education.</p>
        </div>
        <div className="footer-right">SIH 2026 • Prototype</div>
      </footer>
    </div>
  );
}

function IntroSplash({ dark }) {
  return (
    <div className="intro-splash" role="status" aria-label="Loading ShikshaSetu AI">
      <div className="intro-orbit orbit-a"></div>
      <div className="intro-orbit orbit-b"></div>
      <div className="intro-orbit orbit-c"></div>
      <div className="intro-glow"></div>
      <div className="intro-particles" aria-hidden="true">
        <span className="particle p1">📖</span><span className="particle p2">Aa</span>
        <span className="particle p3">ᱥᱟ</span><span className="particle p4">अ</span>
        <span className="particle p5">AI</span><span className="particle p6">🎧</span>
      </div>
      <div className="intro-network" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div className="intro-mark">🌱<b>✦</b></div>
      <div className="intro-copy">
        <div className="intro-name"><span className="intro-shiksha">Shiksha</span><span>Setu AI</span></div>
        <div className="intro-tag">Learning in every child's language</div>
        <div className="intro-loader"><i></i><i></i><i></i></div>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try {
      if (mode === "forgot") {
        const r = await fetch(`${API}/auth/forgot-password`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
        const d = await r.json(); if (!r.ok) throw new Error(d.error);
        setMessage(d.message + (d.resetUrl ? `

Demo reset link: ${d.resetUrl}` : ""));
      } else if (mode === "signup") {
        const r = await fetch(`${API}/auth/signup`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password})});
        const d = await r.json(); if (!r.ok) throw new Error(d.error);
        localStorage.setItem("shikshasetu_token", d.token); localStorage.setItem("shikshasetu_user", JSON.stringify(d.user));
        window.location.reload();
      } else { await onLogin(email,password); }
    } catch (err) { setError(err.message || "Something went wrong"); }
    finally { setBusy(false); }
  }

  const title = mode === "login" ? "Welcome back." : mode === "signup" ? "Create your account." : "Reset your password.";
  return (
    <div className="login-shell">
      <div className="login-decoration decoration-one"></div><div className="login-decoration decoration-two"></div>
      <div className="login-panel">
        <div className="login-brand"><div className="brand-mark">🌱</div><div><div className="brand-name">ShikshaSetu <span>AI</span></div><div className="brand-tag">Inclusive learning, powered by AI</div></div></div>
        <div className="login-content">
          <div className="login-kicker"><ShieldCheck size={15}/> SECURE TEACHER PORTAL</div>
          <h1>{title}</h1>
          <p className="login-subtitle">{mode === "forgot" ? "Enter your email and we'll send a secure password reset link." : mode === "signup" ? "Join the workspace and start building mother-tongue learning experiences." : "Sign in to access your teaching dashboard and create mother-tongue learning experiences."}</p>
          <form onSubmit={submit} className="login-form">
            {mode === "signup" && <label><span>Full name</span><div className="field"><UserRound size={18}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name" required/></div></label>}
            <label><span>Email address</span><div className="field"><UserRound size={18}/><input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError("");setMessage("")}} placeholder="teacher@example.com" autoComplete="email" required/></div></label>
            {mode !== "forgot" && <label><span>Password</span><div className="field"><ShieldCheck size={18}/><input minLength={8} type={showPassword ? "text" : "password"} value={password} onChange={e=>{setPassword(e.target.value);setError("")}} placeholder="At least 8 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"} required/><button type="button" className="show-password" onClick={()=>setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></div></label>}
            {error && <div className="login-error">{error}</div>}
            {message && <div className="login-success">{message}</div>}
            <button className="primary login-button" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in to dashboard" : mode === "signup" ? "Create secure account" : "Send reset link"} {!busy && <ArrowRight size={18}/>}</button>
          </form>
          <div className="auth-links">{mode === "login" && <button onClick={()=>{setMode("forgot");setError("")}}>Forgot password?</button>}{mode !== "login" && <button onClick={()=>{setMode("login");setError("");setMessage("")}}>Back to sign in</button>}<span>•</span>{mode === "signup" ? <button onClick={()=>setMode("login")}>Already have an account</button> : <button onClick={()=>setMode("signup")}>Create account</button>}</div>
          {mode === "login" && <div className="login-demo"><div className="demo-icon">✦</div><div><b>Hackathon-ready authentication</b><span>Passwords are hashed on the server and sessions use signed JWTs.</span></div></div>}
        </div>
        <div className="login-footer"><span>🌿 Built for SIH 2026</span><span>JWT • Secure • Vernacular</span></div>
      </div>
      <div className="login-showcase">
        <div className="showcase-top"><span className="live-dot"></span> Secure AI learning workspace</div>
        <div className="showcase-copy"><p className="eyebrow light"><Sparkles size={15}/> MOTHER-TONGUE EDUCATION</p><h2>Make every lesson feel <em>closer to home.</em></h2><p>Translate, simplify and speak lessons in languages children understand naturally — now with secure accounts.</p></div>
        <div className="showcase-card"><div className="showcase-card-head"><span>Today's lesson</span><span className="mini-status">● Protected</span></div><b>Why do plants need sunlight?</b><div className="showcase-wave">{[18,32,24,44,27,50,30,40,22,35,18,29].map((h,i)=><i style={{height:h}} key={i}></i>)}</div><div className="showcase-tags"><span>ᱥᱟᱱᱛᱟᱲᱤ Santhali</span><span>JWT secured</span></div></div>
        <div className="showcase-stats"><div><b>8</b><span>Languages</span></div><div><b>JWT</b><span>Auth</span></div><div><b>∞</b><span>Possibilities</span></div></div>
      </div>
    </div>
  );
}

function HomePage({ onStart }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15}/> AI-powered vernacular education</div>
          <h1>Every child deserves to <em>learn in their own language.</em></h1>
          <p className="hero-text">
            ShikshaSetu helps teachers turn everyday lessons into simple, engaging
            mother-tongue learning experiences with translation, voice and AI pedagogy.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={onStart}>Start teaching <ArrowRight size={18}/></button>
            <button className="secondary" onClick={() => document.getElementById("how").scrollIntoView({behavior:"smooth"})}>See how it works</button>
          </div>
          <div className="language-row">
            <span>Designed for</span>
            {languages.map(l => <span className="lang-chip" key={l.id}><Languages size={14}/>{l.label}</span>)}
          </div>
        </div>
        <div className="hero-visual">
          <div className="glow"></div>
          <div className="floating-card card-top"><span className="dot green"></span> Mother-tongue ready</div>
          <div className="teacher-card">
            <div className="mini-label">TODAY'S LESSON</div>
            <div className="lesson-title">Why do plants need sunlight?</div>
            <div className="wave">
              {[16,30,22,40,26,48,20,34,27,44,18,31,25].map((h,i)=><i style={{height:h}} key={i}></i>)}
            </div>
            <div className="audio-row"><button className="play"><Play size={15} fill="currentColor"/></button><span>AI lesson audio</span><span className="time">0:18</span></div>
            <div className="translated-box"><div><span>Translated to</span><strong>Santhali</strong></div><span className="native-script">ᱥᱟᱱᱛᱟᱲᱤ</span></div>
          </div>
          <div className="floating-card card-bottom"><Brain size={17}/> <b>AI pedagogy</b><span>•</span> child-friendly</div>
        </div>
      </section>

      <section id="how" className="section">
        <div className="section-heading">
          <div className="eyebrow">ONE SIMPLE WORKFLOW</div>
          <h2>From teacher's words to a child's understanding.</h2>
        </div>
        <div className="steps">
          <Step n="01" icon={<Mic/>} title="Speak or type" text="Teachers can speak naturally in Hindi or English."/>
          <Step n="02" icon={<Languages/>} title="Translate" text="Convert the lesson into the selected mother tongue."/>
          <Step n="03" icon={<Brain/>} title="Make it simple" text="AI reshapes the content for the child's grade level."/>
          <Step n="04" icon={<Headphones/>} title="Listen & learn" text="Students hear, answer and practice interactively."/>
        </div>
      </section>

      <section className="impact">
        <div><div className="impact-number">8</div><div>Supported languages</div></div>
        <div><div className="impact-number">1</div><div>AI teaching assistant</div></div>
        <div><div className="impact-number">∞</div><div>Learning possibilities</div></div>
      </section>
    </main>
  );
}

function Step({n,icon,title,text}) {
  return <div className="step"><div className="step-number">{n}</div><div className="step-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>
}

function TeacherDashboard() {
  const [grade, setGrade] = useState("Class 3");
  const [subject, setSubject] = useState("Science");
  const [language, setLanguage] = useState("santhali");
  const [text, setText] = useState("Why do plants need sunlight?");
  const [translated, setTranslated] = useState("");
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedLanguage = languages.find(l => l.id === language);

  async function translate() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/translate`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,targetLanguage:language})});
      const data = await r.json();
      setTranslated(data.translated);
      setNotice("AI translation generated");
    } catch {
      setTranslated(`[${selectedLanguage.label} demo translation] ${text}`);
      setNotice("Demo mode: backend not running");
    } finally { setLoading(false); }
  }

  async function explain() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/lesson`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,grade,targetLanguage:language})});
      setLesson(await r.json());
    } catch {
      setLesson({
        topic:"Why plants need sunlight",
        explanation:"Plants need sunlight to make their own food and grow healthy.",
        localExample:"Think about crops growing in a field. Without enough sunlight, plants cannot grow properly.",
        question:"What do plants need from the Sun?",
        options:["Water","Sunlight","A pencil"], answer:"Sunlight"
      });
    } finally { setLoading(false); }
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNotice("Speech recognition is not supported in this browser. You can type instead.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.onstart = () => {setListening(true);setNotice("Listening… speak your lesson");};
    recognition.onresult = e => {setText(e.results[0][0].transcript);};
    recognition.onerror = () => setNotice("Could not hear that. Please try again.");
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  function speak() {
    if (!translated && !lesson?.explanation) return;
    const value = translated || lesson.explanation;
    if (!("speechSynthesis" in window)) {
      setNotice("Audio is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const locale = TTS_LOCALES[language] || "en-IN";
    const synth = window.speechSynthesis;
    synth.cancel();

    // Voices are loaded asynchronously in many browsers. Wait briefly so
    // the correct mother-tongue voice can be selected when one is installed.
    const play = () => {
      const voices = synth.getVoices();
      const base = locale.toLowerCase().split("-")[0];
      const voice = voices.find(v => v.lang?.toLowerCase() === locale.toLowerCase())
        || voices.find(v => v.lang?.toLowerCase().startsWith(base + "-"))
        || voices.find(v => v.lang?.toLowerCase().startsWith(base));

      const utterance = new SpeechSynthesisUtterance(value);
      utterance.lang = locale;
      if (voice) utterance.voice = voice;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onstart = () => setNotice(voice ? `Playing ${selectedLanguage.label} audio` : `Playing ${selectedLanguage.label} demo audio`);
      utterance.onerror = () => setNotice(`Could not play ${selectedLanguage.label} audio. Try another browser voice.`);
      synth.speak(utterance);
    };

    // Chrome/Android can populate voices after the first call.
    if (synth.getVoices().length) play();
    else {
      const handler = () => { synth.removeEventListener("voiceschanged", handler); play(); };
      synth.addEventListener("voiceschanged", handler);
      setTimeout(() => { synth.removeEventListener("voiceschanged", handler); if (!synth.speaking) play(); }, 700);
    }
  }

  return (
    <main className="dashboard page">
      <div className="page-title-row">
        <div><div className="eyebrow">TEACHER WORKSPACE</div><h1>Good morning, Teacher 👋</h1><p>Turn your lesson into a mother-tongue learning experience.</p></div>
        <div className="status"><span className="status-dot"></span> Prototype AI online</div>
      </div>

      <div className="controls card">
        <Select label="Class" value={grade} onChange={setGrade} options={["Class 1","Class 2","Class 3","Class 4","Class 5"]}/>
        <Select label="Subject" value={subject} onChange={setSubject} options={["Science","Mathematics","Language","EVS"]}/>
        <Select label="Mother tongue" value={language} onChange={setLanguage} options={languages.map(l=>l.id)} labels={Object.fromEntries(languages.map(l=>[l.id,l.label]))}/>
      </div>

      <div className="workspace-grid">
        <section className="card input-card">
          <div className="card-header"><div><span className="small-label">STEP 1</span><h2>Speak or type your lesson</h2></div><button className={listening?"mic listening":"mic"} onClick={startListening}><Mic size={19}/>{listening?"Listening":"Use microphone"}</button></div>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Type your lesson here…"/>
          <div className="input-bottom"><span>{text.length} characters</span><button className="primary" onClick={translate} disabled={loading}>{loading?"Working…":"Translate"} <ArrowRight size={17}/></button></div>
        </section>

        <section className="card result-card">
          <div className="card-header"><div><span className="small-label">STEP 2</span><h2>Mother-tongue output</h2></div><span className="target-badge">{selectedLanguage.label}</span></div>
          {translated ? <><div className="translation">{translated}</div><button className="audio-button" onClick={speak}><Volume2 size={18}/> Play audio</button><div className="confidence"><CheckCircle2 size={16}/><span>AI confidence</span><b>94%</b></div></> : <div className="empty"><Languages size={35}/><p>Your translation will appear here.</p><small>Choose a language and click Translate.</small></div>}
        </section>
      </div>

      <section className="card pedagogy-card">
        <div className="pedagogy-header"><div><span className="small-label">STEP 3 • AI PEDAGOGY</span><h2>Make it easy for children</h2><p>Transform the lesson into an age-appropriate explanation with a local example and a quick question.</p></div><button className="primary" onClick={explain} disabled={loading}><Sparkles size={17}/> Explain for children</button></div>
        {lesson && <div className="lesson-grid">
          <div><span className="lesson-tag">🌱 SIMPLE EXPLANATION</span><p className="big-copy">{lesson.explanation}</p></div>
          <div><span className="lesson-tag">🏡 LOCAL EXAMPLE</span><p>{lesson.localExample}</p></div>
          <div><span className="lesson-tag">❓ QUICK CHECK</span><p className="question">{lesson.question}</p><div className="options">{lesson.options.map(o=><button key={o} onClick={()=>setNotice(o===lesson.answer?"Correct! ⭐":"Try again!")}>{o}</button>)}</div></div>
        </div>}
      </section>
      {notice && <div className="toast">{notice}</div>}
    </main>
  );
}

function Select({label,value,onChange,options,labels={}}) {
  return <label className="select-wrap"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o} value={o}>{labels[o] || o}</option>)}</select><ChevronDown size={15}/></label>
}

function StudentMode() {
  const questions = [
    {q:"Why do plants need sunlight?", topic:"SCIENCE • PLANTS", answer:"Sunlight", hint:"Think about what helps plants make their food."},
    {q:"What do plants need to make their food?", topic:"SCIENCE • PLANTS", answer:"Sunlight", hint:"It comes from the Sun."},
    {q:"Which part of a plant usually absorbs water from the soil?", topic:"SCIENCE • PLANTS", answer:"Roots", hint:"They are usually under the soil."},
    {q:"What gas do plants take in from the air?", topic:"SCIENCE • PLANTS", answer:"Carbon dioxide", hint:"Plants use this gas during photosynthesis."},
    {q:"Why is water important for plants?", topic:"SCIENCE • PLANTS", answer:"Growth", hint:"It helps plants stay healthy and grow."}
  ];
  const [current,setCurrent] = useState(0);
  const [answer,setAnswer] = useState("");
  const [feedback,setFeedback] = useState("");
  const [recording,setRecording] = useState(false);
  const question = questions[current];

  function listen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setFeedback("Speech recognition is not supported here.");
    const r = new SR();
    r.lang = "en-IN";
    r.onstart=()=>setRecording(true);
    r.onresult=e=>setAnswer(e.results[0][0].transcript);
    r.onend=()=>setRecording(false);
    r.start();
  }

  async function check() {
    try {
      const r = await fetch(`${API}/quiz`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answer,expected:question.answer})});
      const d=await r.json(); setFeedback(`${d.correct?"⭐ ":""}${d.feedback}`);
    } catch {
      const correct = answer.trim().toLowerCase()===question.answer.toLowerCase();
      setFeedback(correct ? "⭐ Great job! You understood the concept." : `Good try. The answer is ${question.answer}.`);
    }
  }

  function nextQuestion() {
    setCurrent((current + 1) % questions.length);
    setAnswer("");
    setFeedback("");
  }

  function playQuestion() {
    if ("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance(question.q));
  }

  return <main className="student page">
    <div className="student-top">
      <div className="eyebrow">STUDENT MODE • CLASS 3</div>
      <div className="streak"><Star size={16} fill="currentColor"/> 4 day learning streak</div>
    </div>
    <div className="student-card">
      <div className="plant-illustration">🌱</div>
      <span className="lesson-tag">{question.topic}</span>
      <div className="question-progress">Question {current + 1} of {questions.length}</div>
      <h1>{question.q}</h1>
      <p className="student-sub">Listen to the question in your learning language, then tell us your answer.</p>
      <button className="listen-question" onClick={playQuestion}><Volume2 size={19}/> Listen to question</button>
      <div className="answer-box">
        <div className="answer-head"><span>Your answer</span><button className={recording?"recording":"record"} onClick={listen}><Mic size={18}/>{recording?"Listening…":"Speak"}</button></div>
        <input value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type or speak your answer…"/>
        <button className="primary full" onClick={check}>Check my answer <ArrowRight size={17}/></button>
        {feedback && <button className="next-question" onClick={nextQuestion}>Next question <ArrowRight size={17}/></button>}
      </div>
      {feedback && <div className="feedback"><CheckCircle2 size={22}/><span>{feedback}</span></div>}
      <p className="question-hint">💡 Hint: {question.hint}</p>
    </div>
  </main>
}
function ProgressPage() {
  return <main className="page progress-page">
    <div className="eyebrow">LEARNING ANALYTICS</div><h1>Student progress</h1><p className="muted">A simple view for teachers to see where students are growing.</p>
    <div className="stat-grid">
      <Stat icon="🔥" value="4 days" label="Learning streak"/>
      <Stat icon="⭐" value="82%" label="Average score"/>
      <Stat icon="📚" value="12" label="Lessons completed"/>
    </div>
    <div className="progress-grid">
      <div className="card progress-card"><div className="card-header"><div><span className="small-label">SUBJECT PROGRESS</span><h2>Learning journey</h2></div><span className="target-badge">This month</span></div>{demoProgress.map(p=><div className="progress-item" key={p.subject}><div className="progress-line"><span>{p.icon} {p.subject}</span><b>{p.value}%</b></div><div className="bar"><i style={{width:`${p.value}%`}}></i></div></div>)}</div>
      <div className="card achievement"><div className="trophy">🏆</div><h2>Great progress!</h2><p>Keep learning in a language that feels natural. Consistent practice builds strong foundations.</p><div className="achievement-row"><div>🌟<b>8</b><span>badges</span></div><div>🎯<b>24</b><span>questions</span></div><div>📖<b>12</b><span>lessons</span></div></div></div>
    </div>
  </main>
}

function ProjectInfoPage() {
  return <main className="page project-info-page">
    <div className="project-info-hero">
      <div>
        <div className="eyebrow"><Info size={15}/> PROJECT INFORMATION</div>
        <h1>ShikshaSetu AI</h1>
        <p className="muted">AI-powered vernacular pedagogy and real-time translation for mother-tongue-based primary education.</p>
      </div>
      <div className="info-badge">SIH 2026 • Prototype</div>
    </div>

    <section className="card info-overview">
      <div className="info-copy">
        <span className="small-label">ABOUT THE PROJECT</span>
        <h2>Bridging languages. Building futures.</h2>
        <p>ShikshaSetu AI connects teachers and students through real-time speech recognition, translation and child-friendly explanations. It is designed so the teacher can use one main device while the whole classroom learns together through a shared display, speaker and microphones.</p>
        <div className="info-points">
          <div><CheckCircle2 size={18}/><span>Mother-tongue learning for underserved and tribal-language classrooms.</span></div>
          <div><CheckCircle2 size={18}/><span>Teacher microphone for teaching mode and student microphone for questions.</span></div>
          <div><CheckCircle2 size={18}/><span>AI pedagogy, text, voice and visual outputs with low-connectivity support.</span></div>
        </div>
      </div>
      <div className="info-image-frame">
        <img src="/project-info.jpg" alt="ShikshaSetu AI project overview and system architecture" />
      </div>
    </section>

    <section className="info-section-grid">
      <div className="card info-mini-card"><div className="info-mini-icon">🌐</div><h3>Core capabilities</h3><p>Translation, speech recognition, text-to-speech, AI-powered pedagogy, educational knowledge and visual learning.</p></div>
      <div className="card info-mini-card"><div className="info-mini-icon">🎙️</div><h3>Two-microphone model</h3><p>Teachers explain naturally while students can ask questions and interact without needing individual smartphones.</p></div>
      <div className="card info-mini-card"><div className="info-mini-icon">📶</div><h3>Built for real classrooms</h3><p>Offline or low-connectivity support, cached models and local resources help learning continue when internet access is limited.</p></div>
    </section>

    <section className="card vision-banner">
      <div><span className="small-label">OUR VISION</span><h2>Every child should be able to learn, ask questions and understand education in the language they know best.</h2></div>
      <div className="vision-mark">🌱</div>
    </section>
  </main>
}

function Stat({icon,value,label}) { return <div className="card stat"><div className="stat-icon">{icon}</div><div><b>{value}</b><span>{label}</span></div></div> }

export default App;
