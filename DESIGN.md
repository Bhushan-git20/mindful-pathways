---
version: 1.0.0
theme:
  colors:
    primary:
      default:
        value: "#2A5C82"
        description: "Deep calming blue used for primary actions, user chat bubbles, and major brand elements."
    secondary:
      default:
        value: "#5C9EAD"
        description: "Soft teal used for secondary actions, borders, and subtle highlights."
    accent:
      default:
        value: "#8FBC8F"
        description: "Sage green utilized for success states, wellness metrics, and positive reinforcement."
    background:
      default:
        value: "#F8F9FA"
        description: "Crisp pearl/off-white used as the primary canvas in light mode."
      dark:
        value: "#121212"
        description: "Deep charcoal used as the primary canvas in dark mode."
    surface:
      default:
        value: "#FFFFFF"
        description: "Pure white for floating cards and chat bubbles."
      dark:
        value: "#1E1E1E"
        description: "Dark gray for elevated surfaces in dark mode."
    destructive:
      default:
        value: "#EF4444"
        description: "Standard red for critical alerts and emergency interventions."
  typography:
    fonts:
      display:
        value: "'Plus Jakarta Sans', 'Inter', sans-serif"
        description: "Used for large headers, dashboard greetings, and prominent metrics."
      sans:
        value: "'Lato', sans-serif"
        description: "Used for body text, chat messages, and all interactive elements."
  spacing:
    container:
      value: "2rem"
    element:
      value: "1rem"
  radii:
    sm:
      value: "4px"
    md:
      value: "8px"
      description: "Standard border radius for buttons and inner components."
    lg:
      value: "16px"
      description: "Border radius for outer cards and dashboard widgets."
    full:
      value: "9999px"
      description: "Pill shape for action buttons, input fields, and chat avatars."
  shadows:
    sm:
      value: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    md:
      value: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
    glow:
      value: "0 0 25px rgba(42, 92, 130, 0.3)"
      description: "A soft, colored aura used to gently highlight key actions without harsh borders."
  effects:
    glass:
      value: "backdrop-blur(12px) background-color(rgba(255, 255, 255, 0.6))"
      description: "Glassmorphic overlay used for top navigation, sticky panels, and card backgrounds."
---

# MindMate v2.0 Visual Identity

MindMate is an AI-driven mental wellness companion. The design system is built to minimize cognitive load, reduce anxiety, and feel like a supportive digital friend. We actively avoid the sterile, clinical look of traditional medical software in favor of a warm, engaging, and highly personalized experience.

## Design Principles

1. **Calming Minimalism (Glassmorphism)**
   - The interface heavily relies on soft glassmorphism (`backdrop-blur`) instead of solid cards. 
   - Thick, harsh borders are completely eliminated. Depth is created using subtle shadows and colored glows (`shadow-glow`).

2. **Conversational First**
   - The core interaction model of MindMate revolves around AI conversation (the Chatbot and conversational Journaling).
   - Chat bubbles use distinct, calming colors (`primary` for the user, a soft muted tint for the AI).
   - Input fields are completely rounded (`radii: full`) and heavily padded to invite comfortable text entry.

3. **Intelligent Companion Aesthetics**
   - Instead of a massive wall of charts, the Dashboard relies on spaced-out, large typography.
   - We use fluid layout stagger animations (`framer-motion`) when components enter the screen, mimicking an interface that "wakes up" to greet the user.

4. **Strategic Urgency**
   - Destructive colors (`#EF4444`) are strictly reserved for emergency actions (e.g., Suicide & Crisis Lifeline triggers) and are never used for minor UI errors.
   - Validation errors use muted orange/warning colors instead of aggressive red.

## Typography Guidelines
- **Headings (Plus Jakarta Sans):** Keep line heights tight (`1.2`) and tracking slightly negative (`-0.02em`) for a bold, modern appearance.
- **Body Text (Lato):** Keep line heights generous (`1.6`) to ensure high readability for long-form journaling and chat reading.

## Interaction & Motion
- **Hover States:** Elements should never snap or jump. Use a `300ms ease-out` transition for color and shadow changes.
- **Floating Effect:** Use subtle vertical translation (`-translate-y-1`) accompanied by a shadow expansion for clickable cards, giving a physical, tactile feel to the dashboard.
