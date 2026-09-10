import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "shikshasetu-dev-secret-change-me";
const DB_FILE = process.env.AUTH_DB || path.join(__dirname, "data", "users.json");
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({users:[]}, null, 2));
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const writeDB = db => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
const safeUser = u => ({id:u.id,name:u.name,email:u.email});
const tokenFor = u => jwt.sign({sub:u.id,email:u.email,name:u.name}, JWT_SECRET, {expiresIn:"7d"});
const emailValid = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||""));

const app = express();
app.use(cors()); app.use(express.json());

async function sendResetEmail(to, resetUrl) {
  if (!process.env.SMTP_HOST) return false;
  const transporter = nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE === "true",auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
  await transporter.sendMail({from:process.env.SMTP_FROM || process.env.SMTP_USER,to,subject:"Reset your ShikshaSetu AI password",text:`Reset your password: ${resetUrl}\nThis link expires in 30 minutes.`});
  return true;
}

app.get("/api/health", (_req,res)=>res.json({ok:true,service:"ShikshaSetu AI backend",auth:"jwt"}));
app.post("/api/auth/signup", async (req,res)=>{
  const {name,email,password}=req.body||{};
  if (!name?.trim() || !emailValid(email) || String(password||"").length < 8) return res.status(400).json({error:"Enter a name, valid email and password with at least 8 characters."});
  const db=readDB(), normalized=email.toLowerCase().trim();
  if (db.users.some(u=>u.email===normalized)) return res.status(409).json({error:"An account with this email already exists."});
  const user={id:crypto.randomUUID(),name:name.trim(),email:normalized,passwordHash:await bcrypt.hash(password,12),createdAt:new Date().toISOString()};
  db.users.push(user); writeDB(db); res.status(201).json({token:tokenFor(user),user:safeUser(user)});
});
app.post("/api/auth/login", async (req,res)=>{
  const {email,password}=req.body||{}; const db=readDB(); const user=db.users.find(u=>u.email===String(email||"").toLowerCase().trim());
  if (!user || !(await bcrypt.compare(String(password||""),user.passwordHash))) return res.status(401).json({error:"Invalid email or password."});
  res.json({token:tokenFor(user),user:safeUser(user)});
});
app.get("/api/auth/me", (req,res)=>{ try { const p=jwt.verify((req.headers.authorization||"").replace(/^Bearer\s+/i,""),JWT_SECRET); const u=readDB().users.find(x=>x.id===p.sub); if(!u) throw Error(); res.json({user:safeUser(u)}); } catch { res.status(401).json({error:"Unauthorized"}); }});
app.post("/api/auth/forgot-password", async (req,res)=>{
  const email=String(req.body?.email||"").toLowerCase().trim(); if(!emailValid(email)) return res.status(400).json({error:"Enter a valid email address."});
  const db=readDB(), user=db.users.find(u=>u.email===email); // Avoid account enumeration.
  if(!user) return res.json({message:"If an account exists, a password reset link has been sent."});
  const raw=crypto.randomBytes(32).toString("hex"); user.resetTokenHash=crypto.createHash("sha256").update(raw).digest("hex"); user.resetExpires=Date.now()+30*60*1000; writeDB(db);
  const base=process.env.FRONTEND_URL || "http://localhost:5173"; const resetUrl=`${base}/reset-password?token=${raw}&email=${encodeURIComponent(email)}`;
  let sent=false; try { sent=await sendResetEmail(email,resetUrl); } catch (e) { console.error("SMTP error",e.message); }
  res.json({message:"If an account exists, a password reset link has been sent.", ...(process.env.NODE_ENV !== "production" && !sent ? {resetUrl}: {})});
});
app.post("/api/auth/reset-password", async (req,res)=>{
  const {email,token,password}=req.body||{}; if(!emailValid(email)||!token||String(password||"").length<8) return res.status(400).json({error:"Invalid reset details. Password must be at least 8 characters."});
  const db=readDB(), hash=crypto.createHash("sha256").update(token).digest("hex"), user=db.users.find(u=>u.email===String(email).toLowerCase().trim() && u.resetTokenHash===hash && u.resetExpires>Date.now());
  if(!user) return res.status(400).json({error:"This reset link is invalid or expired."});
  user.passwordHash=await bcrypt.hash(password,12); delete user.resetTokenHash; delete user.resetExpires; writeDB(db); res.json({message:"Password updated successfully. You can sign in now."});
});

const languageNames={english:"English",hindi:"Hindi",telugu:"Telugu",bengali:"Bengali",odia:"Odia",kannada:"Kannada",santhali:"Santhali",mundari:"Mundari",ho:"Ho"};
const demoLessons={plants:{topic:"Why plants need sunlight",explanation:"Plants need sunlight to make their own food. Sunlight gives plants the energy they need to grow healthy.",localExample:"Think about crops growing in a field. Without enough sunlight, plants cannot grow properly.",question:"What do plants need from the Sun?",options:["Water","Sunlight","A pencil"],answer:"Sunlight"},water:{topic:"Why water is important",explanation:"Water is needed by people, animals and plants. It helps living things grow and stay healthy.",localExample:"Farmers give water to crops so the plants can grow.",question:"Which living things need water?",options:["Only plants","Only people","People, animals and plants"],answer:"People, animals and plants"},default:{topic:"Learning through simple examples",explanation:"Let's understand the idea using a simple example from everyday life. Small examples can make difficult lessons easier to understand.",localExample:"Connect the lesson to things children see at home, school or in their village.",question:"How can an example help us learn?",options:["It makes ideas easier","It makes learning impossible","It removes the lesson"],answer:"It makes ideas easier"}};
function detectLesson(text=""){const t=text.toLowerCase();if(t.includes("plant")||t.includes("sunlight")||t.includes("photosynthesis"))return demoLessons.plants;if(t.includes("water"))return demoLessons.water;return demoLessons.default;}
function demoTranslation(text,language){
  const t=text.trim().toLowerCase().replace(/[?!.]+$/g,"");
  const translations={
    hindi:{
      "why do plants need sunlight":"पौधों को सूर्य के प्रकाश की आवश्यकता क्यों होती है?",
      "what do plants need to make their food":"पौधों को अपना भोजन बनाने के लिए किन चीज़ों की आवश्यकता होती है?",
      "which part of a plant usually absorbs water from the soil":"पौधे का कौन सा भाग आमतौर पर मिट्टी से पानी सोखता है?",
      "what gas do plants take in from the air":"पौधे हवा से कौन सी गैस लेते हैं?",
      "why is water important for plants":"पौधों के लिए पानी क्यों महत्वपूर्ण है?",
      "plants need sunlight to make their own food":"पौधों को अपना भोजन बनाने के लिए सूर्य के प्रकाश की आवश्यकता होती है।",
      "water is very important for people, animals and plants":"पानी मनुष्यों, जानवरों और पौधों के लिए बहुत महत्वपूर्ण है।"
    },
    telugu:{
      "why do plants need sunlight":"మొక్కలకు సూర్యకాంతి ఎందుకు అవసరం?",
      "what do plants need to make their food":"మొక్కలు తమ ఆహారాన్ని తయారు చేసుకోవడానికి ఏమి అవసరం?",
      "which part of a plant usually absorbs water from the soil":"మొక్కలోని ఏ భాగం సాధారణంగా నేల నుండి నీటిని పీల్చుకుంటుంది?",
      "what gas do plants take in from the air":"మొక్కలు గాలి నుండి ఏ వాయువును తీసుకుంటాయి?",
      "why is water important for plants":"మొక్కలకు నీరు ఎందుకు ముఖ్యమైనది?",
      "plants need sunlight to make their own food":"మొక్కలు తమ ఆహారాన్ని తయారు చేసుకోవడానికి సూర్యకాంతి అవసరం.",
      "water is very important for people, animals and plants":"మనుషులకు, జంతువులకు మరియు మొక్కలకు నీరు చాలా ముఖ్యమైనది."
    },
    bengali:{
      "why do plants need sunlight":"গাছের সূর্যের আলো কেন প্রয়োজন?",
      "what do plants need to make their food":"গাছের নিজের খাবার তৈরি করতে কী কী প্রয়োজন?",
      "which part of a plant usually absorbs water from the soil":"গাছের কোন অংশ সাধারণত মাটি থেকে জল শোষণ করে?",
      "what gas do plants take in from the air":"গাছ বাতাস থেকে কোন গ্যাস গ্রহণ করে?",
      "why is water important for plants":"গাছের জন্য জল কেন গুরুত্বপূর্ণ?",
      "plants need sunlight to make their own food":"গাছের নিজের খাবার তৈরি করতে সূর্যের আলো দরকার।",
      "water is very important for people, animals and plants":"মানুষ, প্রাণী ও উদ্ভিদের জন্য জল খুবই গুরুত্বপূর্ণ।"
    },
    odia:{
      "why do plants need sunlight":"ଗଛଗୁଡ଼ିକୁ ସୂର୍ଯ୍ୟାଲୋକ କାହିଁକି ଆବଶ୍ୟକ?",
      "what do plants need to make their food":"ଗଛଗୁଡ଼ିକ ନିଜର ଖାଦ୍ୟ ତିଆରି କରିବା ପାଇଁ କଣ କଣ ଆବଶ୍ୟକ କରନ୍ତି?",
      "which part of a plant usually absorbs water from the soil":"ଗଛର କେଉଁ ଅଂଶ ସାଧାରଣତଃ ମାଟିରୁ ପାଣି ଶୋଷଣ କରେ?",
      "what gas do plants take in from the air":"ଗଛଗୁଡ଼ିକ ବାୟୁରୁ କେଉଁ ଗ୍ୟାସ ଗ୍ରହଣ କରନ୍ତି?",
      "why is water important for plants":"ଗଛ ପାଇଁ ପାଣି କାହିଁକି ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ?",
      "plants need sunlight to make their own food":"ଗଛଗୁଡ଼ିକ ନିଜର ଖାଦ୍ୟ ତିଆରି କରିବା ପାଇଁ ସୂର୍ଯ୍ୟାଲୋକ ଆବଶ୍ୟକ କରନ୍ତି।",
      "water is very important for people, animals and plants":"ମଣିଷ, ପଶୁ ଏବଂ ଉଦ୍ଭିଦ ପାଇଁ ପାଣି ବହୁତ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ।"
    },
    kannada:{
      "why do plants need sunlight":"ಸಸ್ಯಗಳಿಗೆ ಸೂರ್ಯನ ಬೆಳಕು ಏಕೆ ಅಗತ್ಯವಿದೆ?",
      "what do plants need to make their food":"ಸಸ್ಯಗಳು ತಮ್ಮ ಆಹಾರವನ್ನು ತಯಾರಿಸಲು ಏನು ಅಗತ್ಯವಿದೆ?",
      "which part of a plant usually absorbs water from the soil":"ಸಸ್ಯದ ಯಾವ ಭಾಗವು ಸಾಮಾನ್ಯವಾಗಿ ಮಣ್ಣಿನಿಂದ ನೀರನ್ನು ಹೀರಿಕೊಳ್ಳುತ್ತದೆ?",
      "what gas do plants take in from the air":"ಸಸ್ಯಗಳು ಗಾಳಿಯಿಂದ ಯಾವ ಅನಿಲವನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತವೆ?",
      "why is water important for plants":"ಸಸ್ಯಗಳಿಗೆ ನೀರು ಏಕೆ ಮುಖ್ಯವಾಗಿದೆ?",
      "plants need sunlight to make their own food":"ಸಸ್ಯಗಳು ತಮ್ಮ ಆಹಾರವನ್ನು ತಯಾರಿಸಿಕೊಳ್ಳಲು ಸೂರ್ಯನ ಬೆಳಕು ಅಗತ್ಯವಿದೆ.",
      "water is very important for people, animals and plants":"ಮನುಷ್ಯರು, ಪ್ರಾಣಿಗಳು ಮತ್ತು ಸಸ್ಯಗಳಿಗೆ ನೀರು ಬಹಳ ಮುಖ್ಯ."
    },
    santhali:{
      "why do plants need sunlight":"Bir ko suruj ren alo kinate lagit kana?",
      "what do plants need to make their food":"Bir ko nijer khana banate chena chena lagit kana?",
      "which part of a plant usually absorbs water from the soil":"Bir ren oka ang mati khon daka seba kana?",
      "what gas do plants take in from the air":"Bir ko hor hawa khon oka gas in kana?",
      "why is water important for plants":"Bir ko daka kinate gurutpurna kana?"
    },
    mundari:{
      "why do plants need sunlight":"Singi hor ko suruj ren alo kana lagi jaruri kana?",
      "what do plants need to make their food":"Singi hor ko nijer jom khana banate kana lagit kana?",
      "which part of a plant usually absorbs water from the soil":"Singi hor ren oka ang mati khon daka seba kana?",
      "what gas do plants take in from the air":"Singi hor ko hawa khon oka gas in kana?",
      "why is water important for plants":"Singi hor ko daka kana lagi jaruri kana?"
    },
    ho:{
      "why do plants need sunlight":"Bir ko suruj ren alo kana lagi jaruri kana?",
      "what do plants need to make their food":"Bir ko nijer jom khana banate kana lagit kana?",
      "which part of a plant usually absorbs water from the soil":"Bir ren oka ang mati khon daka seba kana?",
      "what gas do plants take in from the air":"Bir ko hawa khon oka gas in kana?",
      "why is water important for plants":"Bir ko daka kana lagi jaruri kana?"
    }
  };
  const lang=languageNames[language]||language;
  if(translations[language]?.[t]) return translations[language][t];
  return `[${lang} demo translation] ${text}`;
}
app.post("/api/translate",(req,res)=>{const{text,targetLanguage="santhali"}=req.body||{};if(!text?.trim())return res.status(400).json({error:"Text is required."});res.json({original:text.trim(),targetLanguage:languageNames[targetLanguage]||targetLanguage,translated:demoTranslation(text.trim(),targetLanguage),confidence:94,demo:true,note:"Prototype translation response. Connect a validated language model for production."});});
app.post("/api/lesson",(req,res)=>{const{text,grade="Class 3",targetLanguage="santhali"}=req.body||{};res.json({grade,language:languageNames[targetLanguage]||targetLanguage,...detectLesson(text||""),demo:true});});
app.post("/api/quiz",(req,res)=>{const{answer,expected="Sunlight"}=req.body||{},correct=String(answer||"").trim().toLowerCase()===String(expected).trim().toLowerCase();res.json({correct,score:correct?100:35,feedback:correct?"Great job! You understood the concept.":`Good try. The expected answer is ${expected}.`});});
app.listen(PORT,()=>console.log(`ShikshaSetu backend running at http://localhost:${PORT}`));
