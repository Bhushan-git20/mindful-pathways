# MindMate v2.0 Design System

## 1. Visual Style & Theme
- **Theme**: Clean, minimalist, and deeply calming. Avoid over-stimulation. Focus on being an "intelligent companion" rather than a dashboard.
- **Color Palette**:
  - Primary: Deep calming blue (`#2A5C82`)
  - Secondary: Soft teal (`#5C9EAD`)
  - Accent: Sage green (`#8FBC8F`) for success/positive states
  - Background: Off-white/pearl (`#F8F9FA`) for light mode, deep charcoal (`#121212`) for dark mode.
  - Surface: White (`#FFFFFF`) / Dark Gray (`#1E1E1E`) for cards.
- **Typography**: Inter or similar clean sans-serif. High readability, generous line height.
- **Spacing**: Spacious and breathable. Generous padding around all conversational elements.

## 2. Layout Approach
- Focus primarily on a single-column, centered "chat-first" or "companion-first" layout.
- Use glassmorphism subtly for floating headers or navigation, but keep the core interface flat and crisp.
- Remove dense multi-column dashboards in favor of focused, full-screen interactive cards.

## 3. Platform
- Responsive web, optimized primarily for mobile-first interaction (375px) but gracefully expanding for desktop.

## 4. Components
- **Buttons**: Soft rounded corners (8px radius), subtle hover states.
- **Cards**: Minimal border, soft shadow.
- **Conversational Bubbles**: Clear distinction between user and AI, utilizing primary colors.
- **Forms**: Floating labels, clean underlines, or soft padded inputs.

## 5. Interaction
- Smooth, calming transitions. No jarring pop-ups or harsh alerts unless absolutely necessary for safety. 
- Elements should fade in softly.

## 6. Design System Notes for Stitch Generation
*When generating new screens in Stitch, use this block:*
**Design Theme:**
- Style: Minimalist, calming, intelligent companion.
- Colors: Deep blue primary (#2A5C82), soft teal secondary, off-white background.
- Typography: Inter (sans-serif), high legibility.
- Corners: 8px border radius on cards and buttons.
- Aesthetics: Subtle glassmorphism for nav, flat and soft UI for main content. Avoid visual clutter.
