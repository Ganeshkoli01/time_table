# 🎯 Placement Preparation Task Tracker & Timetable

A modern, responsive, full-stack web application designed for students and job aspirants to follow their daily placement preparation schedule, track progress, maintain study streaks, and permanently record completed tasks.

![Placement Preparation Tracker Logo](client/public/logo.png)

---

## 🌟 Key Features

- **Dynamic Task Tracking**: Interactive task cards that turn **Green** when completed (`[✓] Completed`) and remain **Light Red** when pending (`[✗] Pending`).
- **Permanent MongoDB Persistence**: Tasks are saved with a composite key (`date + taskId`), ensuring that past days' records are never overwritten when navigating through dates.
- **Weekly Master Timetable**: Complete Monday to Sunday schedule covering:
  - 📚 **Aptitude**
  - 🗣 **English Communication**
  - 💻 **Web Development**
  - 📊 **Data Analytics**
  - 🎓 **College & Practice Sessions**
- **Daily Dashboard**:
  - Live progress percentage bar.
  - Completed vs. Pending counters.
  - Motivational messages based on daily completion milestones.
  - Missed tasks alert section.
- **Task Details & Notes**:
  - Slide-over modal to record study notes, topics covered, what was learned, doubts faced, and time spent.
- **Custom Tasks**:
  - Add, edit, and delete custom study sessions or mock tests for any date.
- **14-Day Calendar & History View**:
  - Color-coded daily completion ratings:
    - 🟢 **80-100%**: Excellent
    - 🟡 **50-79%**: Partial
    - 🔴 **0-49%**: Poor
  - Pick any historical date to inspect or update.
- **Daily Streak System**:
  - Counts any day with **≥ 70%** completion as a successful day.
  - Tracks current streak, longest streak, and milestone badges.
- **Data Backup & Restore**:
  - Export complete data as **JSON** or **CSV**.
  - Restore history from JSON backup files.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, Date-fns
- **Backend**: Node.js, Express.js, Mongoose, CORS, Dotenv
- **Database**: MongoDB (Local or MongoDB Atlas)
- **Deployment Ready**: Configured for Vercel with Serverless API rewrites (`vercel.json`)

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/Ganeshkoli01/time_table.git
cd time_table
```

### 2. Start Backend Server
```bash
cd server
npm install
node seed.js    # Seed default Monday - Sunday schedule
node index.js   # Runs on http://localhost:5000
```

### 3. Start Frontend Client
```bash
cd ../client
npm install
npm run dev     # Runs on http://localhost:5173
```

---

## 🌐 Deploy to Vercel

1. Import this repository in [Vercel](https://vercel.com/new).
2. Set Environment Variable:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
3. Deploy!
