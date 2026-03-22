# M-Navy: The Ultimate Merchant Navy Platform
**Technical Documentation & Architecture Overview**

Welcome to the comprehensive breakdown of the M-Navy platform. This document explains every feature, how the systems interact, and the entire technology stack that powers the platform, tailored explicitly for Vercel deployment.

---

## 🏗 Technology Stack
- **Frontend Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with Lucide React icons, featuring a custom variable-driven "abyssal-gradient" for dark/light mode responsiveness.
- **Backend Infrastructure:** Supabase (PostgreSQL for Database, Auth for Authentication, and Storage for files).
- **AI Engine:** Google Gemini 2.5 Flash via `@google/genai` SDK.
- **Deployment Strategy:** 100% Serverless architecture (Vercel-ready). The legacy Node/Express backend was entirely deleted to eliminate hosting complexities and CORS issues.

---

## 🔒 1. Authentication System
**How it works:**
The platform uses **Supabase Auth** to manage user sessions securely. 
- **Providers:** Users can sign up via standard Email/Password or use the seamless **Google OAuth** Single Sign-On (SSO).
- **Session Handling:** The auth token is stored securely in your browser. A global `<AuthRequired>` guard protects the inner pages (Forum, Vault, Chat, Profile), immediately kicking unauthenticated users back to the `/login` screen.
- **The "Google Override" Fix:** Supabase's Google OAuth natively overwrites a user's avatar on every login. To protect custom uploaded M-Navy avatars, the Profile page runs a silent background sync that detects Google's override, fetches your true Avatar from the isolated `public.profiles` database table, and injects it back into your active session.

---

## 👤 2. Officer Profiles & The Database Sync
**How it works:**
When a new user signs up, a secure Supabase SQL Trigger (`handle_new_user`) automatically fires and creates a permanent row in the `public.profiles` table.
- **Profile Fields:** Users can assign themselves a maritime Rank (e.g., Chief Officer, ETO), a Primary Vessel Designation (e.g., Gas Carrier), and a Tactical Biography.
- **Custom Profile Pictures:** When an officer clicks the Camera icon to upload a photo, the image is shipped to the `avatars` Supabase Storage Bucket. 
- **The Source of Truth:** Crucially, the image URL is then permanently written directly into the `public.profiles` table. This ensures that whenever the officer posts on the forum, every other user on the ship sees their updated picture!

---

## 💬 3. Forum (Mission Intel)
**How it works:**
The forum operates entirely via direct client-to-database communication to eliminate server bottlenecks.
- **Fetching Posts:** The page queries the `posts` table directly, executing a SQL `JOIN` (via PostgREST) to seamlessly attach the author's `username` and `avatar_url` from the `profiles` table to every single post. 
- **Creating Posts:** When clicking "New Topic", the application inserts a new row into the `posts` table, attaching the user's secure Auth ID as the `author_id`.
- **Discussion View:** Clicking a post redirects to `/post/[id]`. This page rapidly fetches the main post, and then fetches all related comments from the `replies` table that match that exact `post_id`.

---

## 🤖 4. AI Chat Assistant (Maritime Expert)
**How it works:**
The Chat Assistant is powered by the Google Gemini API, highly constrained by strict System Instructions to answer *only* maritime-related questions (refusing coding or general queries) and behaving like a certified maritime compliance officer.
- **Next.js API Route:** The chat messages are sent securely to `app/api/chat/route.ts`. This acts as a middleman so your secret `GEMINI_API_KEY` is never exposed to the public browser.
- **Live Streaming:** The API Route utilizes `generateContentStream`, sending the text back to the frontend chunk-by-chunk over a fast Server-Sent Events (SSE) connection so the officer doesn't have to wait 10 seconds for a response.
- **Cross-Device Memory (Cloud Sync):** Local storage memory was ripped out and replaced with a highly-advanced Cloud Sync. Every time the chat updates, the UI silently packages the entire conversation history into a `chat_history.json` file and securely uploads it into the user's private Supabase Vault folder. If you log into M-Navy on your phone, it downloads that JSON and immediately restores your exact conversation!

---

## 📂 5. Secure Document Vault
**How it works:**
The Document Vault handles high-level operational manuals, medical certificates, and technical drawings.
- **Upload Isolation:** Instead of a chaotic global file system, whenever an officer uploads a PDF, the application forces the file path to be `[User_ID]/[Timestamp]_[Filename]`. This guarantees every single upload is mathematically isolated to that specific user.
- **Retrieval:** The `list()` command explicitly only asks Supabase for files residing in the currently logged-in user's `[User_ID]` folder. This means you will never see someone else's files, and they will never see yours.
- **Inline Modal Viewer:** Clicking the "Eye" icon to view a document executes `supabase.storage.getPublicUrl()`. Instead of bouncing the user to a disruptive new browser tab, the application dims the background and renders the PDF flawlessly inside an integrated `<iframe/>` overlay modal. The user can hit the "Close" button to instantly return to their vault.

---

## 🚀 Final Deployment Walkthrough
To push this project live to the world on **Vercel**:
1. Commit all code to your `main` branch on GitHub.
2. Go to Vercel.com, click "Add New Project", and select your M-Navy GitHub repository.
3. **CRITICAL STEP:** Add your Environment Variables! Copy everything from your `frontend/.env.local` file into Vercel's Environment Variables panel before clicking Deploy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. Click Deploy. Vercel will build the `frontend` folder seamlessly since we deleted the custom backend!

---

## 💡 Key Learnings & Project Reflections

### 1. What We Learned
- **Next.js App Router Mastery:** Transitioning to the App Router significantly reduced client-side overhead by allowing us to push logic like routing and component mounting to the server where appropriate.
- **Serverless Backend Modernization:** Scrapping the legacy Express.js backend in favor of an API-less Supabase SDK + Next.js Route Handlers taught us how powerful direct database client architecture is for scaling rapidly.
- **Security & RLS (Row Level Security):** We learned how to mathematically lock down private storage so that even on a public platform, isolated data remains completely inaccessible to third parties.

### 2. How AI is Utilized in M-Navy
**The "Mission Intel" Chatbot (Powered by Gemini 2.5 Flash)**
- **Strict Role Prompting:** The AI isn't a general-purpose chatbot. It is constrained via advanced system instructions to act *only* as a certified Merchant Navy compliance officer. It explicitly refuses out-of-scope interactions (like coding or entertainment) to guarantee professional safety standards.
- **Streaming Response Architecture:** Because AI generation takes several seconds, we engineered a Server-Sent Events (SSE) system to stream chunks of text back to the browser in real-time, resulting in immediate UI feedback.
- **Contextual Cloud Memory:** Instead of forcing the AI to remember interactions via local browser cache, we integrated an automatic Cloud Sync. The AI seamlessly writes encrypted conversation histories (`chat_history.json`) into the user's secure Supabase Vault, ensuring the AI retains continuous, intelligent context about the officer's specific queries regardless of what device they log in from.

### 3. Challenges Overcome
- **The "Google OAuth Override" Bug:** A massive challenge arose when Google's Single Sign-On began forcibly wiping our custom maritime profile pictures out of the active user session. We engineered a highly unique "Background Sync Restoration" hook that intercepts this wipe, queries the immutable `public.profiles` table, and securely injects the Custom Avatar back into the live authentication session without the user ever noticing.
- **Cross-Component Reactivity:** Connecting real-time updates across decoupled components (like the Profile, Sidebar, and Chat windows) without relying heavily on bloated state-management libraries like Redux.

### 4. Issues Addressed by M-Navy
The maritime industry has historically relied on fragmented communication networks.
- **Security Flaws in Standard Chat:** Standard communication apps easily mix personal and professional data. M-Navy resolves this with strict user-authenticated barriers and "Duty Status" clearances.
- **Isolated Documentation:** Officers usually struggle to carry massive PDF manuals between assignments. The **Document Vault** secures necessary compliance documentation to their digital identity on the cloud.
- **Lack of Rapid Intelligence:** Waiting for shore-management to clarify a SOLAS regulation can delay operations by days. With the M-Navy AI, officers get ultra-fast, highly accurate tactical references securely on-demand.
