# MindMate v2.0 Roadmap

## Phase 1: Foundation & Stitch UI Redesign
**Goal:** Strip out old features, establish the new Stitch Design System, and rebuild the core shell.
- [ ] Remove old Resource Directory, Breathing UI, and History Tables
- [ ] Initialize `.stitch/DESIGN.md` for the new minimalist aesthetic
- [ ] Build the new global App Shell and Navigation

## Phase 2: Conversational Assessments (Gemini)
**Goal:** Replace hardcoded assessments with dynamic ML.
- [ ] Build Edge Function for Conversational Assessment logic (Gemini)
- [ ] Implement conversational UI frontend
- [ ] Map ML outputs to accurate risk scores (Low/Medium/High)

## Phase 3: Smart Habit Tracking & Journaling
**Goal:** Upgrade habits and journaling to be context-aware.
- [ ] Rebuild Habit Tracker UI
- [ ] Connect Habit Tracker to Gemini to receive proactive suggestions
- [ ] Integrate Journal with new conversational flow

## Phase 4: AI-Moderated Community
**Goal:** Build a safe, AI-supervised social feed.
- [ ] Build new Community Feed UI
- [ ] Implement Edge Function moderation (auto-flagging/hiding crisis keywords)

## Phase 5: Clinical Handoff Protocol
**Goal:** Securely bridge high-risk users to real help.
- [ ] Build escalation UI (prompting crisis lines)
- [ ] Implement clinical summary generator for counselors
