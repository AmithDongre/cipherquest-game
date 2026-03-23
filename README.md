# 🔐 CipherQuest: The IT Odyssey

A full-stack browser-based IT quiz game built for **Techotsav** — the inter-college IT fest at Alva's College, Moodbidri. Teams navigate four themed worlds of IT knowledge, compete on a live leaderboard, and race against time and each other.

🔗 **Live Demo:** [cipherquest-game.vercel.app](https://cipherquest-game.vercel.app)

---

## 🌍 Game Overview

Players navigate four worlds in order, answering IT questions to unlock the next world. Each world has a unique theme and progressively harder questions. The final question in every world is a **Boss Question**.

| World | Theme |
|-------|-------|
| 🌿 Binary Jungle | Computer fundamentals & binary logic |
| 🌐 Network Nebula | Networking & protocols |
| ⚙️ Code Citadel | Programming & algorithms |
| 🤖 AI Realm | Artificial intelligence & emerging tech |

---

## ⚔️ Difficulty Modes

All three modes produce the **same maximum score (315 pts)** — mathematically equal in every hint scenario.

| Mode | Questions | Pts/Question | Hint Cost | Cooldown |
|------|-----------|-------------|-----------|----------|
| 🌱 Rookie | 30 | 10 pts | 5 pts | 10s |
| ⚔️ Pro | 25 | 12 pts | 6 pts | 25s |
| 👑 Legend | 10 | 30 pts | 15 pts | 30s |

**Score scenarios (any mode):**

| Hints Used | Final Score |
|------------|-------------|
| No hints | 315 pts |
| 1 hint per question | 165 pts |
| 2 hints per question | 15 pts |

---

## 🎮 Game Mechanics

- **World Progression** — Complete all questions in a world to unlock the next. Worlds must be completed in order.
- **Hints** — Up to 2 hints available per question. Each hint deducts points from your score.
- **Wrong Answer Cooldown** — No point deduction for wrong answers, but the cooldown timer starts immediately.
- **Boss Questions** — The final question in each world is harder than the rest but earns the same points.
- **Live Leaderboard** — Scores sync to Firebase in real time. Every team can see the standings update live.
- **Tiebreaker** — Equal scores are broken by fastest completion time.
- **No Reset** — Once a game starts, it cannot be restarted.

---

## 📊 Question Bank

- **90 questions total** — 30 per difficulty tier (Rookie, Pro, Legend)
- **3 tiers × 4 worlds × ~7–8 questions per world**
- Each world always ends with 1 Boss Question
- Questions are shuffled on every game start

---

## 🏆 Host / Leaderboard View

A separate host dashboard is available for competition organisers via the **Open Host / Projector Leaderboard** link on the landing page. It shows:

- Live ranked leaderboard with scores and completion times
- Race progress bar for every team
- Real-time score updates via Firebase

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Database | Firebase Realtime Database |
| Hosting | Vercel |
| Audio | Web Audio API (custom sound system) |

---

## 📁 Project Structure

```
cipherquest-game/
├── index.html       # Main game UI and all screens
├── game.js          # Game logic, question bank, Firebase sync
├── styles.css       # All styling and animations
└── assets/          # Any static assets
```

---

## 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/AmithDongre/cipherquest-game.git
   cd cipherquest-game
   ```

2. Open `index.html` in your browser directly, or use a local server:
   ```bash
   npx serve .
   # or
   python3 -m http.server 5500
   ```

3. The game connects to Firebase automatically. No additional setup needed for read access.

> **Note:** To use your own Firebase instance, replace the Firebase config object in `game.js` with your own project credentials.

---

## 🏫 Used At

**Techotsav** — Inter-College IT Fest
Alva's College, Moodbidri, Karnataka
March 2026

---

## 💡 How It Was Built

CipherQuest was built entirely through **structured prompt engineering** using Claude — no manual coding. Every design decision, scoring system, fairness audit, and bug fix was directed through carefully crafted prompts. The project demonstrates how AI-assisted development can produce production-ready, competition-grade software when combined with strong product thinking.

Key design challenges solved:
- Mathematically equal max scores across all difficulty modes in every hint scenario
- Option length bias audit — correct answers rebalanced so they are never consistently the longest option
- Cooldown timer bug fix — timers clear correctly on game reset
- Real-time Firebase sync with tiebreaker logic (score then completion time)

---

## 👤 Author

**Amith Dongre**
BCA Student, Alva's College, Moodbidri
[linkedin.com/in/amith-dongre](https://www.linkedin.com/in/amith-dongre) · [github.com/AmithDongre](https://github.com/AmithDongre)

---

⭐ If you find this useful or interesting, feel free to star the repository!
