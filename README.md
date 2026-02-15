<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-8b5cf6?style=for-the-badge&logo=vercel&logoColor=white)](https://subash-dev-portfolio.zeabur.app)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.160-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

<br/>

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&duration=3000&pause=1000&color=8B5CF6&center=true&vCenter=true&multiline=true&repeat=true&width=600&height=80&lines=Full-Stack+Developer+%7C+MERN+%2B+AI;Building+immersive+digital+products" alt="Typing SVG" />

</div>

---

## ✨ Highlights

- **Cosmic Dark Theme** — Deep void backgrounds (`#08080f`), violet/blue/cyan gradients, and glass-panel UI  
- **3D Hero Scene** — Interactive Three.js scene with `@react-three/fiber` and `@react-three/drei`  
- **Smooth Animations** — GSAP ScrollTrigger, Framer Motion transitions, text scramble effects  
- **Custom Cursor & Grain Overlay** — Signature visual touches for an immersive experience  
- **Neural Pathways Background** — Animated SVG neural network canvas behind sections  
- **Responsive Email Templates** — Dark-themed HTML emails matching the portfolio aesthetic  
- **Contact Form with Backend** — Express API with Resend + Nodemailer dual email delivery  
- **Docker-Ready** — Multi-stage Alpine Linux Dockerfile for production deployment  

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Framer Motion, GSAP, Three.js |
| **3D Graphics** | @react-three/fiber, @react-three/drei |
| **Backend** | Node.js, Express.js, Resend, Nodemailer |
| **Database** | MongoDB, MySQL, PostgreSQL *(across projects)* |
| **Styling** | Tailwind CSS, Custom CSS Gradients, Glass Morphism |
| **Deployment** | Docker (Alpine), Render, Zeabur |
| **Version Control** | Git, GitHub |

---

## 📁 Project Structure

```
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── Hero.jsx         # 3D hero with typing effects
│   │   │   ├── About.jsx        # Bio, stats, neural background
│   │   │   ├── Projects.jsx     # Project showcase with 3D tilt
│   │   │   ├── Skills.jsx       # Animated skill bars + orbit
│   │   │   ├── Contact.jsx      # Contact form + social links
│   │   │   ├── HeroScene.jsx    # Three.js 3D scene
│   │   │   ├── CustomCursor.jsx # Custom cursor component
│   │   │   ├── NeuralPathways.jsx # Animated neural canvas
│   │   │   └── ...
│   │   ├── data/                # Content data files
│   │   │   ├── personal.js      # Bio, social links, contact info
│   │   │   ├── projects.js      # Project details & APK configs
│   │   │   └── skills.js        # Skill groups & highlights
│   │   ├── config/
│   │   │   └── api.js           # API base URL config
│   │   └── hooks/
│   │       └── useMousePosition.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── server.js                # Express API + email handlers
│   ├── email-template.html      # Cosmic-themed email template
│   └── env.example              # Environment variables template
├── Android app/                 # APK downloads
│   ├── Expense Tracker.apk
│   └── Fair Split.apk
├── Dockerfile                   # Root multi-stage Docker build
├── render.yaml                  # Render deployment config
└── package.json                 # Monorepo root dependencies
```

---

## 🚀 Featured Projects

| # | Project | Description | Stack |
|---|---------|-------------|-------|
| 1 | **BOLT & BROOK** | Full-stack e-commerce platform with Razorpay payments | React, Node.js, Express, MySQL, Razorpay |
| 2 | **SERVIFY** | Real-time freelance bidding platform | MongoDB, Express, React, Node.js |
| 3 | **EXPENSE TRACKER** | SMS-based finance tracker with chart analytics | React, Flask, Python, Recharts |
| 4 | **FAIRSHARE** | Debt management with split-bill workflows (Web + Mobile) | React, TypeScript, Node.js, MongoDB, Capacitor |
| 5 | **ISL TRANSLATOR** | Real-time Indian Sign Language AI translator | React, FastAPI, WebSocket, PyTorch, ONNX |

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** >= 18.x  
- **npm** >= 9.x  

### Installation

```bash
# Clone the repository
git clone https://github.com/Subash-S-66/subash-s-portfolio-Cosmic-AI-Universe.git
cd subash-s-portfolio-Cosmic-AI-Universe

# Install dependencies
npm install

# Start the frontend dev server
npm run dev

# Start the backend server (in a separate terminal)
npm run server

# Or run both concurrently
npm run dev:full
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Email (SMTP / Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

NOTIFICATION_EMAIL=your-email@gmail.com
```

### Docker

```bash
# Build the Docker image
docker build -t subash-portfolio .

# Run the container
docker run -p 5000:5000 subash-portfolio
```

---

## 🎨 Theme

The portfolio uses a custom **Cosmic Dark** theme:

| Element | Color | Hex |
|---------|-------|-----|
| Cosmic Violet | 🟣 | `#8b5cf6` |
| Cosmic Blue | 🔵 | `#3b82f6` |
| Cosmic Cyan | 🔵 | `#06b6d4` |
| Dark Void | ⚫ | `#08080f` |
| Deep Surface | ⚫ | `#0e0e1a` |
| Card Background | ⚫ | `#13132a` |

---

## 📧 Contact

<div align="center">

| Channel | Details |
|---------|---------|
| 📧 **Email** | [subash.93450@gmail.com](mailto:subash.93450@gmail.com) |
| 📞 **Phone** | [+91-9345081127](tel:+919345081127) |
| 💼 **LinkedIn** | [Subash S](https://www.linkedin.com/in/subash-s-514aa9373) |
| 🐙 **GitHub** | [@Subash-S-66](https://github.com/Subash-S-66) |
| 📍 **Location** | Chennai, India |

</div>

---

## 📄 License

This project is for portfolio and educational purposes. All rights reserved.

---

<div align="center">

**Built with 💜 by [Subash S](https://github.com/Subash-S-66)**

*B.Tech Computer Science • Dr. M.G.R. Educational and Research Institute*

</div>
