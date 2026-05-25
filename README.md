# PromptUWheel

A keyword brainstorming tool for CS students. Spin the wheel, get a random keyword from your selected topics, and test how much you know about it — optionally with AI-generated brainstorming questions.

## Features

- **11 CS topics**: OOP, OS, DBMS, Networks, C++, Backend Engineering, System Design, LLD, Distributed Systems, Software Engineering, Computer Architecture
- **Difficulty filter**: Beginner / Intermediate / Advanced
- **Spin animation**: Slot-machine style reveal with bounce animation
- **AI Brainstorm Helper**: Paste your API key (OpenAI, Anthropic, or Google Gemini) to get 5 targeted brainstorming questions per keyword
- **Session history**: Track what you've seen, marked as known, or skipped — deduplication so you don't repeat keywords
- **Mobile responsive**: Works on phones and desktops

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket)
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your repo — Vercel auto-detects Next.js, no config needed
4. Click **Deploy**

That's it. Every `git push` to `main` will auto-redeploy.

## AI Helper — API keys

API keys are stored only in your browser's memory (never sent to this app's server — calls go directly to the provider).

| Provider | Where to get a key |
|---|---|
| OpenAI | platform.openai.com → API keys |
| Anthropic | console.anthropic.com → API keys |
| Google Gemini | aistudio.google.com → Get API key |

## Data

Keywords live in `/data/*.json`. Each file is a topic with entries shaped as:

```json
{ "keyword": "Deadlock", "category": "Synchronization", "difficulty": "intermediate" }
```

Add new topics by creating a new JSON file and registering it in `lib/keywords.ts`.
