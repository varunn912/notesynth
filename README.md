# NoteSynth

**NoteSynth** is a modern, AI-assisted research and note-synthesis web application that helps users turn sources, conversations, and data into structured insights, visualizations, and shareable knowledge artifacts.

Built with **React + TypeScript**, **Vite**, and **Tailwind CSS**, NoteSynth focuses on a clean UX, modular architecture, and production-ready frontend practices.

---

## ✨ Key Features

* **AI-Assisted Chat & Synthesis**

  * Interactive chat interface for querying and synthesizing notes
  * Modular chat components for extensibility

* **Source Management**

  * Collect, display, and reference multiple sources
  * Clear separation between sources and synthesized output

* **Data Visualizations**

  * Auto-generated and suggested visualizations
  * Geographic visualizations via interactive world maps

* **Note Boards**

  * Card-based noteboards for organizing insights
  * Scalable layout for research workflows

* **Authentication & OTP Flow**

  * Secure authentication screen
  * OTP modal support

* **Media Support**

  * Built-in podcast/audio player for content review

* **Modern UI & Performance**

  * Tailwind-based design system
  * Vite for fast builds and hot reloads

---

## 🧱 Tech Stack

**Frontend**

* React 18
* TypeScript
* Vite
* Tailwind CSS

**State & Services**

* Modular service layer (`services/`)
* AI integration abstraction (`geminiService.ts`)
* Database abstraction (`dbService.ts`)

**Tooling**

* PostCSS
* ESLint / TypeScript config
* Environment-based configuration

---

## 📁 Project Structure

```text
NOTESYNTH/
├── components/                # Reusable UI components
│   ├── AuthScreen.tsx
│   ├── ChatPanel.tsx
│   ├── ChatMessage.tsx
│   ├── DataVisualizations.tsx
│   ├── SuggestedVisualizations.tsx
│   ├── SourcePanel.tsx
│   ├── SourceItem.tsx
│   ├── NoteboardPanel.tsx
│   ├── NoteboardCard.tsx
│   ├── PodcastPlayer.tsx
│   ├── OtpModal.tsx
│   ├── WorldMapSVG.tsx
│   └── icons.tsx
│
├── services/                  # External service abstractions
│   ├── dbService.ts
│   └── geminiService.ts
│
├── utils/                     # Shared utilities
│   └── time.ts
│
├── src/                       # App source entry (legacy/utility split)
│
├── dist/                      # Production build output
│   ├── assets/
│   └── index.html
│
├── App.tsx                    # Root application component
├── index.tsx                  # Application entry point
├── types.ts                   # Shared TypeScript types
├── index.html                 # Vite HTML entry
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js **18+**
* npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file at the project root:

```env
VITE_API_KEY=your_api_key_here
```

> Additional environment variables may be required depending on AI or database configuration.

### Development

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

### Production Build

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

---

## 🧠 Architecture Notes (Recruiter-Friendly)

* **Component-Driven Design** – Each UI feature is encapsulated as a reusable, testable component.
* **Service Abstraction Layer** – External dependencies (AI, database) are isolated from UI logic.
* **Scalable Folder Structure** – Clear separation between components, services, utilities, and configuration.
* **Type Safety** – Shared `types.ts` ensures consistency across the application.
* **Performance-First Tooling** – Vite + Tailwind for fast iteration and optimized builds.

---

## 📸 Screenshots / Demo

> Add screenshots or a short demo GIF/video here to showcase the UI and workflows.

---

## 🛣️ Roadmap (Optional)

* Enhanced visualization presets
* Exportable noteboards (PDF / Markdown)
* Collaborative real-time editing
* Advanced source citation and linking

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**kamshetty varun**
Frontend / Full-Stack Developer

* GitHub: (https://github.com/varunn912)

*NoteSynth is designed to demonstrate production

DEMO: https://drive.google.com/file/d/13vxZJzq9z2b3LUZ3E9GeAMZGQ7coWysJ/view?usp=drive_link
