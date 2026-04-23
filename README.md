# Inkwell - AI-Assisted Blogging Platform

A next-generation blogging platform built with Next.js, Supabase, and Gemini 2.5 Flash. It automatically distills long-form content into quick ~200-word summaries for lightning-fast skimming.

## 🚀 Tech Stack
* **Frontend**: Next.js App Router, Tailwind CSS, Lucide React
* **Backend Framework**: Next.js Server Actions
* **Database & Auth**: Supabase
* **AI Integration**: Google Generative AI (Gemini 2.5 Flash)

## 🛠️ Project Setup & Local Running Instructions

1. **Clone the repository**
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
Copy `.env.example` to `.env.local` and fill in your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

4. **Initialize Supabase Database**
Head to the [Supabase SQL Editor](https://app.supabase.com/) for your project, and execute the SQL query found in the `schema.sql` file. This creates the `profiles`, `posts`, and `comments` tables along with all necessary Row Level Security (RLS) policies and triggers.

5. **Start the Development Server**
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## ☁️ Deployment Steps (Vercel)

1. Push this code to a GitHub repository.
2. Log into [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In the Environment Variables section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
5. Click **Deploy**. Vercel will build the Next.js app seamlessly.

---

## 📝 Technical Responses

### 1. AI Tools
**Which tool(s) you used and why you selected them:**
I heavily utilized the **@google/generative-ai SDK** pointing towards **Gemini-2.5-Flash**. Gemini Flash was selected primarily for its incredible speed-to-token ratio, guaranteeing that the server action generating the summary never exceeds the standard edge-function latency limits. I also used AI assistance to style the beautiful landing page and scaffold boilerplate logic for the backend configuration.

### 2. Feature Logic
**Authentication flow & Role-based access:**
We integrated Supabase Auth using client-side listeners. During Sign-Up, a Supabase Postgres Trigger automatically populates our custom `profiles` schema with `role` = `VIEWER`. 
Within the application UI, conditionals protect edit rights. If a user tries to POST/DELETE/UPDATE without permissions, the Row Level Security (RLS) defined in `schema.sql` intrinsically blocks the action, ensuring 100% backend security. Admin designation requires manually updating a user's role to 'ADMIN' in the Postgres Table.

**Post creation & AI summary flow:**
Post creation handles basic inputs in state. Upon the user clicking submit, the Frontend hits a Next.js **Server Action** (`getAiSummaryAction`). By dispatching the generation process server-side, we hide the API key from the browser. The response is returned to the client and appended to the payload which is dispatched to Supabase via `supabase.from('posts').insert()`.

### 3. Cost Optimization
**Token reduction strategies:**
1. **Model Selection**: Utilizing `gemini-2.5-flash` instead of `gemini-1.5-pro` drastically cuts cost-per-token.
2. **"Generate-Once" Architecture**: By storing the resulting `summary` text in the Postgres `posts` table at the exact time of creation, subsequent page views (including the public feed and detail views) require **zero** additional AI queries.
3. **Change Detection**: Inside the dashboard, when editing a post, the code first checks `if (current.body !== newBody)`. The API is exclusively hit if the actual content body was modified. Otherwise, it simply retains the old summary, preserving tokens on routine title/image edits.

### 4. Development Understanding
**A bug encountered and resolved:**
*Bug*: Fetching user profiles alongside comment lists resulted in "violates RLS" or null returns, breaking the comments section UI.
*Resolution*: Fixed by adding explicitly defined `SELECT` policies for public viewing of `profiles`. By defaulting `profiles` to be readable by everyone (`CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT`), foreign-key relations like `profiles:user_id(name)` instantly started mapping properly.

**Key architectural decisions:**
Taking advantage of Next.js Server Actions explicitly for sensitive API hand-offs (Gemini), while utilizing Client-side data fetching directly for Supabase data to seamlessly weave dynamic user-authentication states without needing costly Server-Side-Rendering roundtrips per feed scroll.
