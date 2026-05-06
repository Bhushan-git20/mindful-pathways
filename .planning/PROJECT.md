# MindMate v2.0

## What This Is
A student mental health application serving as an intelligent, proactive AI companion. It features dynamic ML-powered conversational assessments (replacing static questionnaires), smart habit tracking, and an AI-moderated community feed, wrapped in a minimalist UI.

## Core Value
Accurate, personalized conversational mental health assessments that reduce false positives and act as a reliable bridge to real clinical care when high risk is detected.

## Requirements

### Validated
- ✓ Basic Supabase Auth & DB connection
- ✓ React/Vite development environment

### Active
- [ ] Implement new minimalist Stitch Design System (.stitch/DESIGN.md)
- [ ] Build Conversational Onboarding using Gemini
- [ ] Replace static PHQ-9/GAD-7 with dynamic Gemini conversational assessments
- [ ] Implement Smart Habit Tracking (AI-suggested habits based on context)
- [ ] Build AI-Moderated Community Feed (auto-flagging crisis posts)
- [ ] Build Secure Telehealth/Clinical Handoff protocol

### Out of Scope
- [Standalone Resources Directory] — The AI will provide links dynamically in chat instead of a bulky UI.
- [Guided Breathing UI animations] — We will use conversational/audio cues instead of complex CSS animations.
- [Standalone History Tables] — Historical data will be folded natively into Trends and Journal.

## Context
We are pivoting from a cluttered dashboard with hardcoded PHQ-9/GAD-7 questions to a conversational, AI-first companion app. The static questions were yielding false "high risk" flags even on positive input. We will use Google Stitch for UI redesign and Gemini for ML integration.

## Constraints
- **Tech Stack**: Must use React 18, Vite, Tailwind CSS, Supabase Edge Functions.
- **AI**: Must use Gemini 1.5 Flash (via Supabase Edge Functions) for logic.
- **UI**: Must utilize Google Stitch outputs for all new visual components.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Total UI Redesign via Stitch | Current UI is too cluttered; we need a minimalist, focused aesthetic. | — Pending |
| Conversational Assessments | Static scoring is broken; we need dynamic ML to understand context and sentiment accurately. | — Pending |

---
*Last updated: 2026-05-03 after new milestone initialization*
