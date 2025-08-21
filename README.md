# PyDataPRO

**PyDataPRO** is an intelligent data-driven career companion built with a Python + FastAPI backend and a modern React frontend. It serves as the central analytics and recommendation engine within a three-app ecosystem that includes:

- [**CVitaePRO.com**](https://www.cvitaepro.com) – a smart resume builder with PDF/DOCX export
- [**CareerGistPRO.com**](https://www.careergistpro.com) – a job discovery engine with AI summaries, search analytics, and favorites
- [**PyDataPRO.com**](https://www.pydatapro.com) – an AI-powered career analysis and learning platform that unifies data from both systems

---

## 🚀 Project Intent

The intent of PyDataPRO is to **turn passive career data into actionable insights**.

By ingesting resume content, job searches, favorited jobs, and keyword trends from both CVitaePRO and CareerGistPRO, PyDataPRO creates a centralized knowledge hub where users can:

- Visualize patterns in their job activity
- Receive personalized career guidance
- Discover learning resources and interview prep
- Track skill development and progress over time

---

## 🎯 Purpose

- **Unify** fragmented data from multiple career tools into a single, centralized dashboard
- **Analyze** resume skills, job behaviors, and user preferences using AI/NLP
- **Recommend** concrete next steps like learning courses, practice questions, and career paths
- **Visualize** important career trends with interactive charts and smart widgets

---

## ✅ Current Capabilities

### 🔹 1. Cross-App User Dashboard
- Displays combined data from **CVitaePRO** (resumes) and **CareerGistPRO** (favorites, searches)
- Responsive UI styled with TailwindCSS
- Sections include:
  - Resumes
  - Favorite jobs
  - Keywords from job summaries
  - Recent search terms

### 🔹 2. AI-Powered Career Suggestions
- Extracts only from the **"Skills" section** of resumes using `spaCy` and `en_core_web_sm`
- Matches skills to relevant job roles via OpenAI
- Saves user suggestions with timestamp in a shared PostgreSQL table

### 🔹 3. Interview Generator
- Uses OpenAI to return **10 custom questions** for any job title
- Rate-limited by user session for controlled generation
- Designed for on-demand interview prep with title-based prompts

### 🔹 4. Learning Resources
- Generates **Coursera-based** learning paths from resume skills
- Falls back to OpenAI if API yields no results
- Lets users browse courses filtered by relevance and platform
- Displays both extracted skills and recommended courses

---

## 📊 Additional Features Across the Stack

- **JWT Inactivity Timeout System**:
  - Monitors user activity and refreshes tokens 15 min before expiration
  - Shows a 2-minute fullscreen countdown modal on inactivity
  - Modal buttons lock at 0:02, and auto-logout occurs at 0:00
- **Integrated Analytics**:
  - Salary insights, regional job distributions, company histograms
  - Powered by historical favorites and search data
- **Career Suggestions Card**:
  - Fully modular React component appearing in the user profile
  - Refreshable, async, and styled in PyDataPRO's dark theme
- **Course Recommendations Tracker** (upcoming):
  - Planned feature to track completion and progress through suggested resources

---

## 🧭 Roadmap

### 🔄 In Progress

- 🔍 **Skill Gap Analysis**: Detect missing skills for target roles
- 🌱 **Course Tracker**: Track learning history and course completion
- 🧠 **Interactive Skill Tree**: Visualize user strengths and learning pathways
- ✅ **Job Readiness Meter**: Quantify match quality between user profile and saved jobs
- 📄 **Resume Optimization Feedback**: Use OpenAI to suggest resume improvements
- 🔐 **OAuth Login**: Future plan for Google, GitHub, LinkedIn login support

---

## ⚙️ Tech Stack

| Layer       | Stack                                              |
|-------------|----------------------------------------------------|
| **Frontend** | React, Vite, TailwindCSS                           |
| **Backend**  | FastAPI, Python 3.11, `python-jose`, dotenv        |
| **AI/NLP**   | OpenAI GPT-4, spaCy (transformer model), LangChain |
| **Database** | PostgreSQL (shared between all three apps)         |
| **Hosting**  | Render.com (backend + DB + frontend)               |

---

## 🌐 Ecosystem Integration

[**PyDataPRO**](https://www.pydatapro.com) is designed to sit at the intersection of:

- 📄 [**CVitaePRO**](https://www.cvitaepro.com) – for resume generation and parsing
- 🔍 [**CareerGistPRO**](https://www.careergistpro.com) – for job search activity, favorites, and trends

It pulls, processes, and presents this data in one unified view, acting as the user's **career brain**.

---

## ✨ Vision

PyDataPRO is not just a dashboard — it’s a **career co-pilot**.

By uniting user career history with AI-powered insights and smart visualization, PyDataPRO helps users:

- Identify where they stand
- Understand where they want to go
- Take the clearest path to get there

It is the **intelligent center of your career journey**, combining data, direction, and decisions.

---
