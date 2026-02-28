import { useState, useEffect, useRef } from "react";

const CRIMSON = "#C4122F";
const LIME = "#D4FF00";
const DARK = "#1A1A1A";
const WA_GREEN = "#25D366";
const WA_DARK = "#075E54";
const WA_CHAT_BG = "#E4DDD6";
const G50 = "#F9FAFB";
const G100 = "#F3F4F6";
const G200 = "#E5E7EB";
const G400 = "#9CA3AF";
const G500 = "#6B7280";
const G700 = "#374151";
const G900 = "#111827";

const profileFields = [
  { key: "name", label: "Full Name", icon: "👤" },
  { key: "university", label: "University", icon: "🎓" },
  { key: "degree", label: "Degree & Year", icon: "📚" },
  { key: "skills", label: "Skills", icon: "⚡" },
  { key: "languages", label: "Languages", icon: "🌍" },
  { key: "workExp", label: "Work Experience", icon: "💼" },
  { key: "workAuth", label: "Work Authorisation", icon: "📋" },
  { key: "gender", label: "Gender", icon: "👤" },
  { key: "ethnicity", label: "Ethnicity", icon: "🌐" },
  { key: "careerInterests", label: "Career Interests", icon: "🎯" },
];

const jobMatches = [
  { company: "Google", role: "ML Engineer Intern", match: 94, logo: "🟢", deadline: "Mar 15", reason: "Strong Python/TensorFlow + Imperial + ML interest" },
  { company: "Revolut", role: "Data Scientist", match: 91, logo: "🟣", deadline: "Mar 22", reason: "Prior Revolut intern + SQL/Python + fintech fit" },
  { company: "McKinsey", role: "Business Analyst Intern", match: 85, logo: "🔵", deadline: "Rolling", reason: "Top uni + analytical skills + bilingual" },
  { company: "DeepMind", role: "Research Engineer Intern", match: 82, logo: "🔷", deadline: "Apr 1", reason: "ML/TensorFlow + Imperial computing" },
];

const cvFeedbackMessages = [
  { text: "I've reviewed your CV against this role. Here's my analysis:" },
  { text: "✅ Strengths\n• Revolut internship directly relevant — quantify your impact (e.g. \"reduced churn prediction error by 12%\")\n• Technical stack matches 5/6 required skills\n• Imperial College carries weight with this employer" },
  { text: "⚠️ Gaps to address\n• No mention of large-scale data pipelines — add coursework if relevant\n• Missing collaboration/team examples — add 1 bullet on group projects\n• Add your Mandarin — Google values multilingual for EMEA" },
  { text: "📝 Suggested CV edits:\n\n1. Headline → \"MEng Computing | ML & Data Science\"\n\n2. Revolut bullet → \"Built ML models reducing churn prediction error by X%, processing 2M+ daily transactions\"\n\n3. New bullet → \"Collaborated in team of 5 on distributed systems coursework, top 10% grade\"\n\n4. Skills → Reorder to: Python, TensorFlow, SQL, ML (matches their JD order)" },
  { text: "Want me to generate a tailored version of your CV for this role? Ready in 30 seconds 📄" },
];

// Shared data for WA demo
const waInitialMessages = [
  { from: "bot", text: "Hey! 👋 This is Handshake — you just signed up and we're excited to have you.", delay: 800 },
  { from: "bot", text: "I'm an AI assistant that can help you complete your profile in under 2 minutes so top employers like Goldman Sachs, Google, and McKinsey can find you.", delay: 1200 },
  { from: "bot", text: "Students with complete profiles get 3× more employer messages. Want to get set up now?", delay: 1000 },
];
const waChoiceMessage = { buttons: ["📱 Text chat here", "📞 Quick AI call", "📄 I'll upload my CV"], delay: 600 };
const textChatFlow = [
  { text: "Let's do it! First — what's your full name?", field: "name", delay: 700 },
  { text: "Nice to meet you, {name}! Which university are you at?", field: "university", delay: 600 },
  { text: "Great school 🎓 What are you studying and what year?", field: "degree", delay: 600 },
  { text: "Top skills? Technical, tools, anything you'd want employers to know.", field: "skills", delay: 600 },
  { text: "Languages you speak?", field: "languages", delay: 500 },
  { text: "Any work experience or internships?", field: "workExp", delay: 500 },
];
const sharedOptions = [
  { text: "Are you authorised to work in:", field: "workAuth", options: ["🇬🇧 UK only", "🇪🇺 EU only", "🇬🇧🇪🇺 UK & EU", "Other"], delay: 600 },
  { text: "Optionally — how do you identify?", field: "gender", options: ["Woman", "Man", "Non-binary", "Prefer not to say"], delay: 600 },
  { text: "Ethnicity? (optional)", field: "ethnicity", options: ["I'll share", "Prefer not to say"], delay: 500 },
  { text: "Last one! What roles excite you most?", field: "careerInterests", options: ["Software Eng", "Data Science", "Product", "Consulting", "Finance", "Research"], delay: 500 },
];
const callTranscript = [
  { speaker: "ai", text: "Hi! This is Handshake AI. I'd love to help complete your profile — only 90 seconds. Shall we?" },
  { speaker: "user", text: "Yeah sure, go ahead." },
  { speaker: "ai", text: "Great! Full name?" }, { speaker: "user", text: "Sarah Chen." },
  { speaker: "ai", text: "Which university?" }, { speaker: "user", text: "Imperial College London." },
  { speaker: "ai", text: "What are you studying and what year?" }, { speaker: "user", text: "MEng Computing, third year." },
  { speaker: "ai", text: "Top technical skills?" }, { speaker: "user", text: "Python, ML, SQL, React, TensorFlow." },
  { speaker: "ai", text: "Languages?" }, { speaker: "user", text: "English native, Mandarin fluent." },
  { speaker: "ai", text: "Work experience?" }, { speaker: "user", text: "Data science intern at Revolut last summer." },
  { speaker: "ai", text: "Authorised to work UK, EU, or both?" }, { speaker: "user", text: "UK and EU." },
  { speaker: "ai", text: "What roles excite you most?" }, { speaker: "user", text: "Data science and ML." },
  { speaker: "ai", text: "Profile complete! Sending your top job matches on WhatsApp now. Talk soon!" },
];

// ===== COMPONENTS =====
function TypingDots({ color = G400 }) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "4px 0", alignItems: "center" }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: `dotBounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />)}
    </div>
  );
}

function ProgressRing({ percent, size = 72 }) {
  const r = (size / 2) - 6, circ = 2 * Math.PI * r, offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={G200} strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={percent === 100 ? "#22C55E" : CRIMSON} strokeWidth="4" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" style={{ fontSize: size * 0.22, fontWeight: 700, fill: G900 }}>{percent}%</text>
    </svg>
  );
}

function ProfileSidebar({ profile }) {
  const filled = Object.values(profile).filter(Boolean).length;
  const percent = Math.round((filled / profileFields.length) * 100);
  return (
    <div style={{ width: 260, flexShrink: 0 }}>
      <div style={{ position: "sticky", top: 85 }}>
        <div style={{ background: "white", borderRadius: 16, padding: "20px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${G200}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <ProgressRing percent={percent} size={64} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: G900 }}>Profile</div>
              <div style={{ fontSize: 12, color: G500 }}>{filled}/{profileFields.length} fields</div>
              {percent === 100 && <div style={{ fontSize: 11, fontWeight: 600, color: "#16A34A", background: "#F0FDF4", padding: "2px 8px", borderRadius: 20, display: "inline-block", marginTop: 3 }}>✓ Visible</div>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {profileFields.map((f) => (
              <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 6, background: profile[f.key] ? "#F0FDF4" : G50, transition: "all 0.4s ease" }}>
                <span style={{ fontSize: 12 }}>{f.icon}</span>
                <span style={{ fontSize: 11, color: profile[f.key] ? G700 : G400, flex: 1, fontWeight: profile[f.key] ? 500 : 400 }}>{f.label}</span>
                {profile[f.key] ? <span style={{ fontSize: 11, color: "#16A34A" }}>✓</span> : <span style={{ fontSize: 9, color: G400 }}>—</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, isTop, onSelect }) {
  return (
    <div onClick={() => onSelect?.(job)} style={{ background: isTop ? "linear-gradient(135deg, #FFFBEB, #FEF3C7)" : "white", border: isTop ? "1.5px solid #F59E0B" : `1px solid ${G200}`, borderRadius: 12, padding: "12px 14px", cursor: onSelect ? "pointer" : "default", transition: "all 0.2s ease" }}
      onMouseOver={(e) => onSelect && (e.currentTarget.style.transform = "translateY(-1px)")}
      onMouseOut={(e) => onSelect && (e.currentTarget.style.transform = "translateY(0)")}>
      {isTop && <div style={{ fontSize: 10, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>⭐ Top match — apply now</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>{job.logo}</span>
        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: G900 }}>{job.company}</div><div style={{ fontSize: 12, color: G700 }}>{job.role}</div></div>
        <div style={{ background: job.match >= 90 ? "#DCFCE7" : "#FEF9C3", color: job.match >= 90 ? "#166534" : "#854D0E", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{job.match}%</div>
      </div>
      <div style={{ fontSize: 11, color: G500, lineHeight: 1.4 }}>{job.reason}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <span style={{ fontSize: 10, color: G400 }}>📅 {job.deadline}</span>
        {onSelect && <span style={{ fontSize: 11, color: CRIMSON, fontWeight: 600 }}>Get CV tailored →</span>}
      </div>
    </div>
  );
}

// ===== WEB CHATBOT (the main new addition) =====
function WebChatbot() {
  const [messages, setMessages] = useState([]);
  const [profile, setProfile] = useState({});
  const [typing, setTyping] = useState(false);
  const [currentQ, setCurrentQ] = useState(null);
  const [questionQueue, setQuestionQueue] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [phase, setPhase] = useState("init"); // init, choice, upload, manual, shared, jobs, cvreview, tailored, done
  const [jobCards, setJobCards] = useState(false);
  const [showTailoredCV, setShowTailoredCV] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  useEffect(() => { if (currentQ?.freeText) setTimeout(() => inputRef.current?.focus(), 100); }, [currentQ]);

  const addMsg = (msg, delay = 500) => new Promise((resolve) => {
    setTyping(true);
    setTimeout(() => { setTyping(false); setMessages((p) => [...p, msg]); resolve(); }, delay);
  });

  // Start
  useEffect(() => {
    (async () => {
      await addMsg({ from: "bot", text: "Hey, welcome to Handshake! 👋" }, 600);
      await addMsg({ from: "bot", text: "I'm here to help you set up your profile so top employers can find you. It'll only take a couple of minutes — and I'll show you your best job matches as soon as we're done." }, 900);
      await addMsg({ from: "bot", text: "To get started — do you have a CV or LinkedIn you'd like to import?" }, 700);
      setPhase("choice");
      setCurrentQ({ field: "_choice", options: ["📄 Upload my CV", "🔗 Connect LinkedIn", "✍️ I'll fill it in manually"] });
      await addMsg({ from: "bot", type: "question", field: "_choice", question: "How would you like to get started?", options: ["📄 Upload my CV", "🔗 Connect LinkedIn", "✍️ I'll fill it in manually"] }, 500);
    })();
  }, []);

  const cvData = { name: "Sarah Chen", university: "Imperial College London", degree: "MEng Computing, 3rd Year", skills: "Python, Machine Learning, SQL, React, TensorFlow", languages: "English (Native), Mandarin (Fluent)", workExp: "Data Science Intern @ Revolut (Summer 2025)" };

  const manualQs = [
    { field: "name", question: "What's your full name?", freeText: true },
    { field: "university", question: "Which university are you studying at?", freeText: true },
    { field: "degree", question: "What are you studying, and what year?", freeText: true },
    { field: "skills", question: "What are your top skills? Technical, tools, languages — anything you'd want an employer to know.", freeText: true },
    { field: "languages", question: "What languages do you speak?", freeText: true },
    { field: "workExp", question: "Any work experience, internships, or projects?", freeText: true },
  ];

  const optionQs = [
    { field: "workAuth", question: "Are you authorised to work in the UK, EU, or both?", options: ["UK only", "EU only", "UK & EU", "Other"] },
    { field: "gender", question: "Optionally, how do you identify? Helps diversity-focused employers connect with you.", options: ["Woman", "Man", "Non-binary", "Prefer not to say"] },
    { field: "ethnicity", question: "Ethnicity? (optional — many employers actively seek diverse talent)", options: ["I'll share this", "Prefer not to say"] },
    { field: "careerInterests", question: "Last one — what kind of roles excite you most?", options: ["Software Engineering", "Data Science / ML", "Product Management", "Consulting", "Finance / Banking", "Research"] },
  ];

  const advanceQueue = async (queue, enc) => {
    if (queue.length === 0) {
      // Profile complete → job matching
      setPhase("jobs");
      await addMsg({ from: "bot", text: "🎉 Profile complete! Nice one." }, 600);
      await addMsg({ from: "bot", text: "Now the exciting part — I've matched your profile against 2,400+ live roles. Here are your top matches:" }, 900);
      setJobCards(true);
      return;
    }
    const next = queue[0];
    setQuestionQueue(queue.slice(1));
    setCurrentQ(next);
    if (enc) await addMsg({ from: "bot", text: enc }, 350);
    await addMsg({ from: "bot", type: "question", ...next }, 500);
  };

  const handleInitialChoice = async (choice) => {
    setMessages((p) => [...p, { from: "user", text: choice }]);
    setCurrentQ(null);
    if (choice.includes("manually")) {
      setPhase("manual");
      await addMsg({ from: "bot", text: "No worries! I'll walk you through it — just answer a few quick questions." }, 700);
      const allQs = [...manualQs, ...optionQs];
      setQuestionQueue(allQs.slice(1));
      setCurrentQ(allQs[0]);
      await addMsg({ from: "bot", type: "question", ...allQs[0] }, 500);
    } else {
      // CV or LinkedIn path
      setPhase("upload");
      await addMsg({ from: "bot", text: choice.includes("LinkedIn") ? "Great! Pulling your details from LinkedIn..." : "Perfect! Parsing your CV now..." }, 700);
      await addMsg({ from: "bot", text: "✅ Found 6 fields automatically:" }, 1200);
      setProfile({ ...cvData });
      await addMsg({ from: "bot", type: "summary", data: { "🎓 University": "Imperial College London", "📚 Degree": "MEng Computing, 3rd Year", "⚡ Skills": "Python, ML, SQL, React, TensorFlow", "🌍 Languages": "English, Mandarin", "💼 Experience": "Data Science Intern @ Revolut" } }, 800);
      await addMsg({ from: "bot", text: "6/10 fields done! Just 4 quick questions to go:" }, 600);
      setPhase("shared");
      const q = [...optionQs];
      setQuestionQueue(q.slice(1));
      setCurrentQ(q[0]);
      await addMsg({ from: "bot", type: "question", ...q[0] }, 500);
    }
  };

  const handleOptionSelect = async (field, value) => {
    setMessages((p) => [...p, { from: "user", text: value }]);
    setProfile((p) => ({ ...p, [field]: value }));
    setCurrentQ(null);
    const encs = ["Got it!", "Perfect!", "Thanks!", "Noted!"];
    const enc = encs[Math.floor(Math.random() * encs.length)];
    await advanceQueue([...questionQueue], questionQueue.length > 0 ? enc : null);
  };

  const handleFreeTextSubmit = async () => {
    if (!inputVal.trim() || !currentQ) return;
    const val = inputVal.trim();
    setInputVal("");
    setMessages((p) => [...p, { from: "user", text: val }]);
    setProfile((p) => ({ ...p, [currentQ.field]: val }));
    setCurrentQ(null);
    const encs = ["Nice!", "Got it!", "Great!", "Noted!", "Awesome!"];
    await advanceQueue([...questionQueue], questionQueue.length > 0 ? encs[Math.floor(Math.random() * encs.length)] : null);
  };

  const handleJobSelect = async (job) => {
    setJobCards(false);
    setMessages((p) => [...p, { from: "user", text: `Tell me about ${job.company} — ${job.role}` }]);
    setPhase("cvreview");
    for (const msg of cvFeedbackMessages) {
      await addMsg({ from: "bot", text: msg.text }, 900);
    }
    setCurrentQ({ field: "_cvaction", options: ["✅ Generate tailored CV", "🔄 Show another role", "👋 I'm good for now"] });
    await addMsg({ from: "bot", type: "question", field: "_cvaction", question: "", options: ["✅ Generate tailored CV", "🔄 Show another role", "👋 I'm good for now"] }, 400);
  };

  const handleCVAction = async (choice) => {
    setMessages((p) => [...p, { from: "user", text: choice }]);
    setCurrentQ(null);
    if (choice.includes("Generate")) {
      await addMsg({ from: "bot", text: "Generating your tailored CV..." }, 1000);
      await addMsg({ from: "bot", text: "Done! Here's your optimised CV:" }, 1000);
      setShowTailoredCV(true);
      setPhase("tailored");
      setTimeout(async () => {
        await addMsg({ from: "bot", text: "📄 Saved as PDF to your Handshake profile. Apply directly from the app!\n\nGood luck — you've got a strong shot 💪" }, 1200);
      }, 800);
    } else if (choice.includes("another")) {
      await addMsg({ from: "bot", text: "Here are your matches again:" }, 600);
      setJobCards(true);
      setPhase("jobs");
    } else {
      await addMsg({ from: "bot", text: "No worries! Your matches are saved on Handshake. I'll message you when new roles go live 🚀" }, 800);
      setPhase("done");
    }
  };

  const handleAnyOption = (field, value) => {
    if (field === "_choice") handleInitialChoice(value);
    else if (field === "_cvaction") handleCVAction(value);
    else handleOptionSelect(field, value);
  };

  return (
    <div style={{ display: "flex", gap: 24, animation: "fadeUp 0.5s ease", alignItems: "flex-start" }}>
      {/* Chat */}
      <div style={{ flex: 1, maxWidth: 600 }}>
        <div style={{ background: "white", borderRadius: 20, border: `1px solid ${G200}`, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", minHeight: 500 }}>
          {/* Header */}
          <div style={{ padding: "16px 22px", background: `linear-gradient(135deg, ${CRIMSON}, #E8354F)`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, background: LIME, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, fontStyle: "italic", color: DARK }}>H</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>Handshake Assistant</div>
              <div style={{ fontSize: 11, color: "#FFFFFF99" }}>AI Profile Setup + Career Coach</div>
            </div>
            <div style={{ marginLeft: "auto", width: 10, height: 10, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 8px #4ADE8088" }} />
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 10, background: G50 }}>
            {messages.map((msg, i) => {
              if (msg.from === "user") return (
                <div key={i} style={{ alignSelf: "flex-end", background: CRIMSON, color: "white", padding: "10px 16px", borderRadius: "18px 18px 4px 18px", fontSize: 14, maxWidth: "80%", animation: "fadeUp 0.25s ease", lineHeight: 1.45 }}>{msg.text}</div>
              );
              if (msg.type === "summary") return (
                <div key={i} style={{ background: "white", border: `1px solid ${G200}`, borderRadius: 14, padding: 16, maxWidth: "88%", animation: "fadeUp 0.25s ease" }}>
                  {Object.entries(msg.data).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, fontSize: 13, padding: "3px 0", color: G700 }}>
                      <span style={{ minWidth: 100, fontWeight: 600 }}>{k}</span><span style={{ color: G500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              );
              if (msg.type === "question") {
                const isActive = currentQ?.field === msg.field;
                return (
                  <div key={i} style={{ maxWidth: "88%", animation: "fadeUp 0.25s ease" }}>
                    {msg.question && <div style={{ background: "white", padding: "11px 16px", borderRadius: "18px 18px 18px 4px", fontSize: 14, color: G700, marginBottom: 8, lineHeight: 1.5, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>{msg.question}</div>}
                    {isActive && msg.options && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {msg.options.map((opt) => (
                          <button key={opt} onClick={() => handleAnyOption(msg.field, opt)}
                            style={{ background: "white", border: `1.5px solid ${G200}`, borderRadius: 22, padding: "8px 16px", fontSize: 13, fontWeight: 500, color: G700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s ease", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
                            onMouseOver={(e) => { e.target.style.borderColor = CRIMSON; e.target.style.color = CRIMSON; e.target.style.background = `${CRIMSON}06`; }}
                            onMouseOut={(e) => { e.target.style.borderColor = G200; e.target.style.color = G700; e.target.style.background = "white"; }}>{opt}</button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <div key={i} style={{ background: "white", padding: "11px 16px", borderRadius: "18px 18px 18px 4px", fontSize: 14, color: G700, maxWidth: "88%", lineHeight: 1.5, whiteSpace: "pre-line", animation: "fadeUp 0.25s ease", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>{msg.text}</div>
              );
            })}

            {/* Job cards */}
            {jobCards && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeUp 0.4s ease", maxWidth: "92%" }}>
                {jobMatches.map((job, i) => <JobCard key={i} job={job} isTop={i === 0} onSelect={handleJobSelect} />)}
              </div>
            )}

            {/* Tailored CV */}
            {showTailoredCV && (
              <div style={{ background: "white", borderRadius: 14, padding: 16, border: `1.5px solid ${CRIMSON}25`, maxWidth: "88%", animation: "fadeUp 0.4s ease" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: CRIMSON, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>📄 Tailored CV Preview</div>
                <div style={{ background: G50, borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: G900 }}>Sarah Chen</div>
                  <div style={{ fontSize: 12, color: CRIMSON, fontWeight: 600, marginBottom: 6 }}>MEng Computing | ML & Data Science</div>
                  <div style={{ fontSize: 11, color: G500 }}>Imperial College London · English & Mandarin · UK & EU</div>
                  <div style={{ borderTop: `1px solid ${G200}`, margin: "10px 0", paddingTop: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: G700, marginBottom: 4 }}>EXPERIENCE</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: G900 }}>Data Science Intern — Revolut</div>
                    <div style={{ fontSize: 11, color: G500, lineHeight: 1.5 }}>• Built ML models reducing churn prediction error by 15%, processing 2M+ transactions/day</div>
                    <div style={{ fontSize: 11, color: G500, lineHeight: 1.5 }}>• Collaborated cross-functionally across engineering and product</div>
                  </div>
                  <div style={{ borderTop: `1px solid ${G200}`, margin: "10px 0", paddingTop: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: G700, marginBottom: 4 }}>SKILLS</div>
                    <div style={{ fontSize: 11, color: G500 }}>Python · TensorFlow · SQL · Machine Learning · React · Data Pipelines</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: CRIMSON, fontWeight: 600, marginTop: 10, textAlign: "center" }}>✅ Optimised for: Google ML Engineer Intern</div>
              </div>
            )}

            {typing && <div style={{ background: "white", padding: "10px 16px", borderRadius: "18px 18px 18px 4px", maxWidth: 70, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}><TypingDots color="#bbb" /></div>}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          {currentQ?.freeText && (
            <div style={{ padding: "14px 22px", borderTop: `1px solid ${G200}`, display: "flex", gap: 8, flexShrink: 0, background: "white" }}>
              <input ref={inputRef} value={inputVal} onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFreeTextSubmit()}
                placeholder="Type your answer..."
                style={{ flex: 1, border: `1.5px solid ${G200}`, borderRadius: 14, padding: "11px 16px", fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "border-color 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = CRIMSON} onBlur={(e) => e.target.style.borderColor = G200} />
              <button onClick={handleFreeTextSubmit}
                style={{ background: CRIMSON, color: "white", border: "none", borderRadius: 14, padding: "11px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", opacity: inputVal.trim() ? 1 : 0.4 }}>Send</button>
            </div>
          )}
        </div>
      </div>

      <ProfileSidebar profile={profile} />
    </div>
  );
}

// ===== WA MOCK (compact for reuse) =====
function WAMock({ messages, typing, options, onOption, onText, waitText, jobCards, onJobSelect, showCV }) {
  const ref = useRef(null);
  const [val, setVal] = useState("");
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }); }, [messages, typing, jobCards, showCV]);
  return (
    <div style={{ width: 360, flexShrink: 0 }}>
      <div style={{ background: "#000", borderRadius: 36, padding: "12px 8px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ width: 100, height: 4, background: "#333", borderRadius: 4, margin: "0 auto 8px" }} />
        <div style={{ background: WA_DARK, padding: "10px 12px", borderRadius: "24px 24px 0 0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: LIME, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, fontStyle: "italic", color: DARK }}>H</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Handshake</div></div>
        </div>
        <div ref={ref} style={{ background: WA_CHAT_BG, height: 460, overflowY: "auto", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}><span style={{ background: "#E1F2FB", color: "#5A7A8A", fontSize: 11, padding: "3px 12px", borderRadius: 8 }}>TODAY</span></div>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
              <div style={{ background: m.from === "user" ? "#D9FDD3" : "white", padding: "7px 10px 4px", borderRadius: m.from === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", boxShadow: "0 1px 1px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 13, color: "#303030", lineHeight: 1.45, whiteSpace: "pre-line" }}>{m.text}</div>
              </div>
            </div>
          ))}
          {jobCards && <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>{jobMatches.map((j, i) => <JobCard key={i} job={j} isTop={i === 0} onSelect={onJobSelect} />)}</div>}
          {showCV && (
            <div style={{ background: "white", borderRadius: 12, padding: 14, border: `1.5px solid ${CRIMSON}30`, marginTop: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: CRIMSON, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>📄 Tailored CV</div>
              <div style={{ background: G50, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: G900 }}>Sarah Chen</div>
                <div style={{ fontSize: 11, color: CRIMSON, fontWeight: 600 }}>MEng Computing | ML & Data Science</div>
                <div style={{ fontSize: 10, color: G500, marginTop: 4 }}>Imperial · Python · TensorFlow · SQL · ML</div>
              </div>
              <div style={{ fontSize: 11, color: WA_DARK, fontWeight: 600, marginTop: 8, textAlign: "center" }}>✅ Optimised for Google ML Intern</div>
            </div>
          )}
          {options && <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>{options.map((o) => (
            <button key={o} onClick={() => onOption(o)} style={{ background: "white", border: `1px solid ${WA_GREEN}40`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: WA_DARK, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, textAlign: "left" }}
              onMouseOver={(e) => e.target.style.background = `${WA_GREEN}15`} onMouseOut={(e) => e.target.style.background = "white"}>{o}</button>
          ))}</div>}
          {typing && <div style={{ alignSelf: "flex-start", background: "white", padding: "8px 14px", borderRadius: "10px 10px 10px 2px" }}><TypingDots color="#999" /></div>}
        </div>
        <div style={{ background: "#F0F0F0", padding: "6px 8px", borderRadius: "0 0 24px 24px", display: "flex", alignItems: "center", gap: 6 }}>
          {waitText ? (<>
            <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onText(val.trim()); setVal(""); }}} placeholder="Type a message" style={{ flex: 1, border: "none", background: "white", borderRadius: 20, padding: "8px 14px", fontSize: 13, outline: "none" }} />
            <div onClick={() => { if (val.trim()) { onText(val.trim()); setVal(""); }}} style={{ width: 34, height: 34, background: WA_GREEN, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><span style={{ color: "white", fontSize: 16 }}>➤</span></div>
          </>) : (
            <div style={{ flex: 1, background: "white", borderRadius: 20, padding: "8px 14px", fontSize: 13, color: "#999" }}>Type a message</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== WA TEXT DEMO (state machine) =====
function WATextDemo() {
  const [msgs, setMsgs] = useState([]);
  const [typing, setTp] = useState(false);
  const [opts, setOpts] = useState(null);
  const [waitText, setWaitText] = useState(false);
  const [profile, setProfile] = useState({});
  const [jobCards, setJobCards] = useState(false);
  const [showCV, setShowCV] = useState(false);
  const [cvPhase, setCvPhase] = useState(false);
  const flowRef = useRef(null);

  const add = (msg, delay = 600) => new Promise((r) => { setTp(true); setTimeout(() => { setTp(false); setMsgs((p) => [...p, msg]); r(); }, delay); });

  useEffect(() => {
    (async () => {
      for (const m of waInitialMessages) await add({ from: "bot", text: m.text }, m.delay);
      await add({ from: "bot", text: "How would you prefer to do this?" }, 600);
      setOpts(waChoiceMessage.buttons);
    })();
  }, []);

  const askShared = async (q) => { flowRef.current = { queue: q.slice(1), field: q[0].field }; await add({ from: "bot", text: q[0].text }, q[0].delay); setOpts(q[0].options); };

  const handleChoice = async (c) => {
    setOpts(null); setMsgs((p) => [...p, { from: "user", text: c }]);
    if (c.includes("call")) { await add({ from: "bot", text: "Calling you now — 90 seconds! 📞" }, 700); return; }
    if (c.includes("CV")) {
      await add({ from: "bot", text: "Send your CV here! 📄" }, 700);
      setTimeout(async () => {
        setMsgs((p) => [...p, { from: "user", text: "📎 Sarah_Chen_CV.pdf" }]);
        await add({ from: "bot", text: "Parsing..." }, 800);
        await add({ from: "bot", text: "✅ Found 6 fields! 4 quick questions left:" }, 1200);
        setProfile({ name: "Sarah Chen", university: "Imperial College London", degree: "MEng Computing, 3rd Year", skills: "Python, ML, SQL, React, TF", languages: "English, Mandarin", workExp: "DS Intern @ Revolut" });
        await askShared([...sharedOptions]);
      }, 800);
      return;
    }
    await add({ from: "bot", text: textChatFlow[0].text }, textChatFlow[0].delay);
    setWaitText(true); flowRef.current = { type: "manual", step: 0, field: textChatFlow[0].field };
  };

  const handleText = async (t) => {
    setMsgs((p) => [...p, { from: "user", text: t }]); setWaitText(false);
    const f = flowRef.current; setProfile((p) => ({ ...p, [f.field]: t }));
    const next = f.step + 1;
    if (next < textChatFlow.length) {
      await add({ from: "bot", text: textChatFlow[next].text.replace("{name}", t) }, textChatFlow[next].delay);
      setWaitText(true); flowRef.current = { type: "manual", step: next, field: textChatFlow[next].field };
    } else { await add({ from: "bot", text: "Nearly there!" }, 500); await askShared([...sharedOptions]); }
  };

  const handleOpt = async (o) => {
    if (cvPhase) { handleCVAction(o); return; }
    setOpts(null); setMsgs((p) => [...p, { from: "user", text: o }]);
    const f = flowRef.current; setProfile((p) => ({ ...p, [f.field]: o }));
    const q = f.queue || [];
    if (q.length > 0) { flowRef.current = { queue: q.slice(1), field: q[0].field }; await add({ from: "bot", text: q[0].text }, q[0].delay); setOpts(q[0].options); }
    else {
      await add({ from: "bot", text: "🎉 Profile complete!" }, 600);
      await add({ from: "bot", text: "Here are your top job matches:" }, 800);
      setJobCards(true);
    }
  };

  const handleJobSelect = async (job) => {
    setJobCards(false); setMsgs((p) => [...p, { from: "user", text: `${job.company} — ${job.role}` }]); setCvPhase(true);
    for (const m of cvFeedbackMessages) await add({ from: "bot", text: m.text }, 900);
    setOpts(["✅ Generate tailored CV", "🔄 Another role", "👋 I'm done"]);
  };

  const handleCVAction = async (c) => {
    setOpts(null); setMsgs((p) => [...p, { from: "user", text: c }]); setCvPhase(false);
    if (c.includes("Generate")) { await add({ from: "bot", text: "Generating..." }, 1000); await add({ from: "bot", text: "Done!" }, 1000); setShowCV(true); }
    else if (c.includes("Another")) { await add({ from: "bot", text: "Here are your matches:" }, 600); setJobCards(true); }
    else await add({ from: "bot", text: "Saved to Handshake! I'll ping you for new roles 🚀" }, 800);
  };

  return <WAMock messages={msgs} typing={typing} options={opts} onOption={(o) => opts === waChoiceMessage.buttons ? handleChoice(o) : handleOpt(o)} onText={handleText} waitText={waitText} jobCards={jobCards} onJobSelect={handleJobSelect} showCV={showCV} />;
}

// ===== VOICE CALL DEMO =====
function VoiceCallDemo() {
  const [idx, setIdx] = useState(0);
  const [time, setTime] = useState(0);
  const [profile, setProfile] = useState({});
  const timer = useRef(null);
  const ref = useRef(null);
  useEffect(() => { timer.current = setInterval(() => setTime((t) => t + 1), 1000); return () => clearInterval(timer.current); }, []);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" }); }, [idx]);
  useEffect(() => {
    if (idx < callTranscript.length) {
      const d = callTranscript[idx].speaker === "ai" ? 2200 : 1400;
      const t = setTimeout(() => {
        if (idx >= 3) setProfile((p) => ({ ...p, name: "Sarah" })); if (idx >= 5) setProfile((p) => ({ ...p, university: "Imperial" }));
        if (idx >= 7) setProfile((p) => ({ ...p, degree: "MEng" })); if (idx >= 9) setProfile((p) => ({ ...p, skills: "Python..." }));
        if (idx >= 11) setProfile((p) => ({ ...p, languages: "EN, ZH" })); if (idx >= 13) setProfile((p) => ({ ...p, workExp: "Revolut" }));
        if (idx >= 15) setProfile((p) => ({ ...p, workAuth: "UK&EU" })); if (idx >= 17) setProfile((p) => ({ ...p, careerInterests: "DS" }));
        if (idx >= 18) { setProfile((p) => ({ ...p, gender: "–", ethnicity: "–" })); clearInterval(timer.current); }
        setIdx(idx + 1);
      }, d);
      return () => clearTimeout(t);
    }
  }, [idx]);
  const filled = Object.values(profile).filter(Boolean).length;
  const percent = Math.round((filled / profileFields.length) * 100);
  const m = Math.floor(time / 60), s = String(time % 60).padStart(2, "0");
  return (
    <div style={{ width: 360 }}>
      <div style={{ background: "#000", borderRadius: 36, padding: "12px 8px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ width: 100, height: 4, background: "#333", borderRadius: 4, margin: "0 auto 8px" }} />
        <div style={{ background: "linear-gradient(180deg, #1a1a2e, #0f0f1a)", borderRadius: 24, padding: "30px 16px 20px", minHeight: 460, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 72, height: 72, background: LIME, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 32, fontStyle: "italic", color: DARK, marginBottom: 12, boxShadow: `0 0 30px ${LIME}44` }}>H</div>
          <div style={{ color: "white", fontSize: 18, fontWeight: 600 }}>Handshake AI</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 20px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", animation: "pulse 1.5s infinite" }} />
            <span style={{ color: "#22C55E", fontSize: 14, fontFamily: "monospace" }}>{m}:{s}</span>
          </div>
          <div ref={ref} style={{ background: "#FFFFFF0A", borderRadius: 12, padding: "12px 14px", width: "100%", flex: 1, overflowY: "auto", maxHeight: 260 }}>
            <div style={{ fontSize: 10, color: "#FFFFFF44", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Live Transcript</div>
            {callTranscript.slice(0, idx).map((l, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: l.speaker === "ai" ? LIME : "#88CCFF", textTransform: "uppercase" }}>{l.speaker === "ai" ? "Handshake" : "You"}</span>
                <div style={{ fontSize: 12, color: "#FFFFFFCC", lineHeight: 1.4 }}>{l.text}</div>
              </div>
            ))}
            {idx < callTranscript.length && <TypingDots color="#666" />}
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
            {["🔇", "📱", "🔊"].map((ic, i) => <div key={i} style={{ width: 44, height: 44, background: "#FFFFFF15", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{ic}</div>)}
            <div style={{ width: 44, height: 44, background: "#EF4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📞</div>
          </div>
        </div>
      </div>
      {filled > 0 && (
        <div style={{ marginTop: 16, background: "white", borderRadius: 12, padding: "14px 16px", border: `1px solid ${G200}`, display: "flex", alignItems: "center", gap: 12 }}>
          <ProgressRing percent={percent} size={52} />
          <div><div style={{ fontSize: 13, fontWeight: 600, color: G900 }}>{filled}/{profileFields.length}</div><div style={{ fontSize: 11, color: percent === 100 ? "#16A34A" : G500 }}>{percent === 100 ? "✓ Complete!" : "Filling..."}</div></div>
        </div>
      )}
    </div>
  );
}

// ===== ARCHITECTURE =====
function ArchView() {
  const nodes = [
    { id: "trigger", label: "Webhook Trigger", sub: "New signup", x: 40, y: 160, color: "#6366F1", icon: "⚡" },
    { id: "check", label: "Check Profile", sub: "< 100%?", x: 220, y: 160, color: "#F59E0B", icon: "🔍" },
    { id: "wa", label: "WhatsApp / Web", sub: "Twilio / Widget", x: 400, y: 160, color: WA_GREEN, icon: "💬" },
    { id: "wait", label: "Wait Reply", sub: "Listener", x: 400, y: 50, color: "#8B5CF6", icon: "⏳" },
    { id: "route", label: "Route Choice", sub: "Text/Call/CV", x: 580, y: 160, color: "#EC4899", icon: "🔀" },
    { id: "text", label: "AI Text Agent", sub: "Claude / GPT", x: 760, y: 70, color: "#3B82F6", icon: "🤖" },
    { id: "voice", label: "AI Voice Agent", sub: "Vapi / Bland", x: 760, y: 160, color: "#EF4444", icon: "📞" },
    { id: "cv", label: "CV Parser", sub: "Document AI", x: 760, y: 250, color: "#10B981", icon: "📄" },
    { id: "update", label: "Update Profile", sub: "Handshake API", x: 940, y: 160, color: CRIMSON, icon: "✅" },
    { id: "match", label: "Job Matcher", sub: "AI engine", x: 940, y: 50, color: "#F59E0B", icon: "🎯" },
    { id: "review", label: "CV Coach", sub: "Tailored feedback", x: 940, y: 270, color: "#7C3AED", icon: "📝" },
    { id: "send", label: "Send Results", sub: "WA / Web push", x: 1120, y: 160, color: WA_GREEN, icon: "📲" },
  ];
  const edges = [
    ["trigger","check"],["check","wa"],["wa","wait"],["wait","route"],
    ["route","text","Text"],["route","voice","Call"],["route","cv","CV"],
    ["text","update"],["voice","update"],["cv","update"],
    ["update","match"],["update","review"],["match","send"],["review","send"],
  ];
  const g = (id) => nodes.find((n) => n.id === id);
  return (
    <div style={{ background: "#1E1E2E", borderRadius: 16, padding: "28px 20px", overflowX: "auto" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#A0A0C0", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1.5 }}>n8n Workflow Architecture</div>
      <svg width="1260" height="330" viewBox="0 0 1260 330" style={{ display: "block", minWidth: 1260 }}>
        <defs><marker id="arr" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse"><polygon points="0 0,10 3.5,0 7" fill="#555577" /></marker></defs>
        {edges.map((e, i) => { const f = g(e[0]), t = g(e[1]); const x1=f.x+80,y1=f.y+22,x2=t.x,y2=t.y+22,mx=(x1+x2)/2; const p = Math.abs(y1-y2)>10?`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`:`M${x1},${y1} L${x2},${y2}`; return <g key={i}><path d={p} fill="none" stroke="#555577" strokeWidth="2" markerEnd="url(#arr)" />{e[2]&&<text x={mx} y={Math.min(y1,y2)-8} textAnchor="middle" style={{fontSize:10,fill:"#888"}}>{e[2]}</text>}</g>; })}
        {nodes.map((n) => <g key={n.id}><rect x={n.x} y={n.y} width={160} height={44} rx="10" fill={n.color+"22"} stroke={n.color} strokeWidth="1.5" /><text x={n.x+12} y={n.y+18} style={{fontSize:16}}>{n.icon}</text><text x={n.x+32} y={n.y+18} style={{fontSize:11,fontWeight:600,fill:"#E0E0F0"}}>{n.label}</text><text x={n.x+32} y={n.y+33} style={{fontSize:9.5,fill:"#888899"}}>{n.sub}</text></g>)}
      </svg>
    </div>
  );
}

// ===== MAIN =====
export default function App() {
  const [view, setView] = useState("chatbot");
  const [waKey, setWaKey] = useState(0);
  const [callKey, setCallKey] = useState(0);
  const [chatKey, setChatKey] = useState(0);

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes dotBounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}`}</style>

      <div style={{ background: "white", borderBottom: `1px solid ${G200}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: LIME, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, fontStyle: "italic", color: DARK }}>H</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: DARK, fontFamily: "'DM Serif Display',serif" }}>Handshake</span>
          <span style={{ fontSize: 12, color: G400, marginLeft: 4 }}>AI Onboarding + CV Coach</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "chatbot", label: "💬 Web Chatbot", accent: CRIMSON },
            { id: "text", label: "📱 WhatsApp Demo", accent: WA_GREEN },
            { id: "call", label: "📞 Call Demo", accent: "#EF4444" },
            { id: "arch", label: "⚙️ Architecture", accent: "#6366F1" },
          ].map((tab) => (
            <button key={tab.id}
              onClick={() => {
                setView(tab.id);
                if (tab.id === "text") setWaKey((k) => k + 1);
                if (tab.id === "call") setCallKey((k) => k + 1);
                if (tab.id === "chatbot") setChatKey((k) => k + 1);
              }}
              style={{
                background: view === tab.id ? tab.accent : "white",
                color: view === tab.id ? "white" : G700,
                border: `1px solid ${view === tab.id ? tab.accent : G200}`,
                borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
              }}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        {view === "chatbot" && <WebChatbot key={chatKey} />}

        {view === "text" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: G900, margin: "0 0 4px", fontFamily: "'DM Serif Display',serif" }}>WhatsApp Demo</h2>
            <p style={{ fontSize: 13, color: G500, margin: "0 0 20px" }}>Full journey: Profile → Jobs → CV Review → Tailored CV</p>
            <WATextDemo key={waKey} />
          </div>
        )}

        {view === "call" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: G900, margin: "0 0 4px", fontFamily: "'DM Serif Display',serif" }}>AI Voice Call Demo</h2>
            <p style={{ fontSize: 13, color: G500, margin: "0 0 20px" }}>Profile completed in ~90 seconds via natural conversation.</p>
            <VoiceCallDemo key={callKey} />
          </div>
        )}

        {view === "arch" && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: G900, margin: "0 0 6px", fontFamily: "'DM Serif Display',serif" }}>Pipeline <span style={{ color: CRIMSON }}>Architecture</span></h1>
            <p style={{ fontSize: 15, color: G500, margin: "0 0 28px", lineHeight: 1.6 }}>n8n workflow: signup → AI profile completion → job matching → CV coaching. Works across web chatbot, WhatsApp, and voice.</p>
            <ArchView />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 24 }}>
              {[
                { icon: "💬", title: "Web / WhatsApp Chat", desc: "AI walks through profile fields via quick replies and free text. Same agent, multiple surfaces.", color: CRIMSON },
                { icon: "📞", title: "Voice Call Agent", desc: "AI calls and fills profile through conversation in ~90 seconds. Vapi / Bland.ai powered.", color: "#EF4444" },
                { icon: "📄", title: "CV / LinkedIn Import", desc: "Upload CV or connect LinkedIn. AI parses and auto-fills 6/10 fields instantly.", color: "#3B82F6" },
              ].map((c) => (
                <div key={c.title} style={{ background: "white", borderRadius: 14, padding: "22px 20px", border: `1px solid ${G200}` }}>
                  <div style={{ width: 40, height: 40, background: c.color + "18", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{c.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: G900, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: G500, lineHeight: 1.5 }}>{c.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)", borderRadius: 16, padding: "24px", border: "1.5px solid #F59E0B40" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#92400E", marginBottom: 16 }}>🎯 Post-Completion: CV Coach & Job Matching</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {[
                  { s: "1", t: "Instant Job Matching", d: "AI matches profile against live roles. Top 4 sent with fit scores.", i: "🎯" },
                  { s: "2", t: "CV Review & Feedback", d: "Tap a role → AI reviews CV. Strengths, gaps, specific edits.", i: "📝" },
                  { s: "3", t: "Tailored CV Generation", d: "One tap generates role-optimised CV. Saved as PDF.", i: "📄" },
                ].map((x) => (
                  <div key={x.s} style={{ background: "white", borderRadius: 12, padding: "18px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 28, height: 28, background: "#F59E0B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white" }}>{x.s}</div>
                      <span style={{ fontSize: 20 }}>{x.i}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: G900, marginBottom: 4 }}>{x.t}</div>
                    <div style={{ fontSize: 12, color: G500, lineHeight: 1.5 }}>{x.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
