# FocusBoard – Product Requirements Document (PRD)

## 1. Product Overview
**FocusBoard** is a mobile-first diary/planner app delivering a **simple, visually engaging, and priority-driven** task management experience — without unnecessary feature bloat.

**Core Principles:**
- **Customizable Priority Boards** – Urgent, High, Medium, Low (editable)
- **Lightweight & Fast** – Offline-first with auto-sync
- **Gamified Productivity** – Streaks, focus mode, visual rewards

Goal: Make daily planning **enjoyable and habit-forming** with a minimal yet engaging interface.

---

## 2. Objectives
- Provide **clarity over clutter** in task management
- Reduce overwhelm via **focus mode**
- Drive **habitual use** with streaks, stats, rewards
- Maintain **lightweight, offline-first** architecture

---

## 3. Core Features (MVP)

### 3.1 Priority Boards
- Customizable categories (default: Urgent, High, Medium, Low)
- Drag-and-drop task organization
- Color-coded for instant recognition

### 3.2 Multiple Views
- **Daily & Weekly views**
- Minimal calendar overlay for quick navigation

### 3.3 Reminders & Recurring Tasks
- Time-based reminders
- Repeat options: daily, weekly, custom

### 3.4 Focus Mode
- Hide all but top-priority tasks
- Optional deep-work countdown timer

### 3.5 Habit Tracking & Streaks
- Create habits alongside tasks
- Visual streak counter & badges

### 3.6 Offline-First with Auto-Sync
- Full offline usability
- Auto-sync when online

### 3.7 Dark Mode & Accessibility
- Adjustable font sizes
- High-contrast themes

---

## 4. Deferred Features (Post-MVP)
- Monthly view
- Analytics dashboard
- Collaboration & task sharing
- AI-powered task suggestions

---

## 5. Technical Requirements

### Backend
- Python 3.x + Django REST Framework
- PostgreSQL
- JWT authentication
- Push notifications
- Local data store with sync queue

### Frontend
- React Native (cross-platform)
- Axios for API calls
- Local storage for offline mode

### Deployment
- Backend: AWS / Railway
- Mobile: App Store & Google Play

---

## 6. User Stories
- **As a user**, I want to quickly create and sort tasks by priority
- **As a user**, I want focus mode to hide distractions
- **As a user**, I want streaks for consistency rewards
- **As a user**, I want offline functionality

---

## 7. Monetization Plan

| Model              | Description | Target Conversion | Est. Monthly Revenue (10k MAU) |
|--------------------|-------------|------------------:|--------------------------------:|
| **Freemium → Pro** | Free core features, $3.99/mo for premium | 3% | ~$1,200 |
| **One-Time Unlock**| $15 lifetime unlock | 1% | ~$1,500 |
| **Theme Packs**    | Paid board themes & stickers | 5% | ~$1,000 |

---

## 8. Roadmap

| Phase  | Deliverables | Timeline |
|--------|-------------|----------|
| **Phase 1 (MVP)** | Priority boards, daily/weekly views, reminders, offline mode, streaks, dark mode | 4–5 weeks |
| **Phase 2** | Monthly view, analytics, premium themes, UX polish | +3 weeks |
| **Phase 3** | AI suggestions, collaboration features | +5 weeks |

---

## 9. Market Differentiators
- **No Bloat** – Minimal features, no overload
- **Focus-First** – Distraction-hiding mode
- **Gamified Habits** – Reward loop for consistency
- **Offline-First** – Reliable anywhere

---

## 10. Risks & Mitigation
- **Market Saturation** → Launch niche-first (students, freelancers)
- **Retention Drop-Off** → Gamified streaks + focus mode
- **Feature Creep** → Strict MVP scope control

---

**Estimated Launch Time:** 5–6 weeks for MVP  
**Market Viability:** ★★★★☆ (4/5)  
**Monetization Path:** Clear freemium upgrade funnel
