# ShikshaSetu AI — SIH 2026 Prototype

AI-powered vernacular pedagogy and real-time translation prototype for mother-tongue-based primary education.

## Stack
- Frontend: React + Vite + plain CSS
- Backend: Node.js + Express
- No database
- Demo AI responses are deterministic/mock so the prototype works without API keys.
- Browser Web Speech API is used for speech recognition/text-to-speech when supported.

## Run

### Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on http://localhost:5000

### Frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on the Vite URL, normally http://localhost:5173

## Demo flow
1. Open the frontend. The new modern login screen appears first.
2. Enter any valid email and a password with at least 4 characters (hackathon demo authentication).
3. After login, the teacher dashboard opens. Use Logout to return to the login screen.
4. Select Class 3, Science and Santhali.
5. Type or use the microphone and enter: "Why do plants need sunlight?"
6. Click Translate.
7. Use "Explain for children" to generate a simple lesson.
8. Use "Play audio" for browser text-to-speech.
9. Try Student Mode: it now contains 5 plant-science questions with next-question navigation, hints, speech input and answer checking. Then open the progress dashboard.

## Production direction
Replace the mock backend translation/pedagogy services with validated Indic-language ASR, translation, LLM pedagogy and TTS models. For a real deployment, add authentication, secure storage, audit logs, consent/privacy controls and curriculum/content validation.


## Authentication
The app now includes real backend authentication: signup/login with bcrypt password hashing and 7-day JWTs, plus password reset tokens that expire after 30 minutes. User records are persisted in `backend/data/users.json` for this prototype.

### Run locally
1. `cd backend && npm install && npm run dev`
2. In another terminal: `cd frontend && npm install && npm run dev`
3. For production, set a strong `JWT_SECRET`. Configure SMTP using `backend/.env.example` to send real password-reset emails. Without SMTP, development mode returns the reset URL in the API response for hackathon testing.

## Mother-tongue audio
Teacher Mode now assigns a BCP-47 locale to the selected language and waits for browser voices to load before speaking. Hindi, Telugu, Bengali, Odia and Kannada use their native browser voice when installed. Santhali (`sat-IN`), Mundari (`unr-IN`) and Ho (`hoc-IN`) are requested with their language locales; if the browser has no native voice for one of these languages, the prototype uses a demo phonetic voice and clearly labels it as demo audio rather than claiming native TTS.
