# 💻 CodeBridges Web Client — Frontend Application

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Bakong KHQR](https://img.shields.io/badge/Payment-Bakong_KHQR-E02424?style=for-the-badge)](https://bakong.nbc.gov.kh/)
[![CI](https://github.com/Codebridge404/codebridgesfront/actions/workflows/nextjs.yml/badge.svg)](https://github.com/Codebridge404/codebridgesfront/actions/workflows/nextjs.yml)

The modern, ultra-responsive web frontend and Point-of-Sale (POS) management suite for **CodeBridges Multi-Tenant SaaS**.

---

## ✨ Features & Modules

- **🛒 Point of Sale (POS) Suite**:
  - Real-time product selection, variant support, discounts, and barcode scanning.
  - **KDS (Kitchen Display System)**: Dedicated sub-terminal for kitchen order status tracking.
  - **CFD (Customer-Facing Display)**: Live bill projection and QR payment display for shoppers.
  - **Shift & Register Control**: Cash drawer reconciliation and shift tracking.
- **💳 Unified Payment Gateway (Bakong KHQR)**:
  - Centralized tenant-wide Bakong KHQR payment credentials in Organization Settings.
  - Auto-fallback profile synchronization across all POS registers in the organization.
  - Real-time MD5 verification, dynamic USD/KHR QR generation, and sound feedback.
- **🏢 Organization & Outlet Administration**:
  - Transparent glassmorphic settings sub-navigation (`Profile`, `Regional & Currency`, `Payment Gateway`, `SMS Notifications`, `Hardware`).
  - Modular enablement/disablement of features per tenant.
  - Multi-outlet and cashier assignment management.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphic Design System
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations & Physics Engine**: [Framer Motion](https://www.framer.com/motion/) + Apple Fluid Spring Physics (`appleSpring`, `momentumSpring`, `rubberband()`)
- **QR & Payment Processing**: `bakong-khqr`, `qrcode`

---

## 🎨 Apple Fluid Design System Architecture

CodeBridges adopts Apple's fluid interface design principles (*WWDC Designing Fluid Interfaces*):
- **Critically Damped Springs ($\zeta = 1.0$)**: Eliminates linear easing curves. Found in [`lib/animations.ts`](lib/animations.ts) with `stiffness: 380, damping: 38`. Used for modals, sheets, and view transitions.
- **Underdamped Momentum Springs ($\zeta \approx 0.8$)**: Natural bounce for interactive micro-actions (`whileTap={{ scale: 0.96 }}`).
- **Translucent Materials**: Multi-layer frosted glass chrome (`backdrop-filter: blur(24px) saturate(190%)`) with light-catching edge borders.
- **Direct 1:1 Touch Manipulation**: Continuous finger tracking and boundary rubber-banding via [`lib/motion/gesturePhysics.ts`](lib/motion/gesturePhysics.ts).
- **Zero Mock Data Standard**: 100% dynamic integration with live backend microservices and MySQL 8.4 database engines; multi-tenant scoping (`tenant_id`) enforced across all queries.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 1. Installation
```bash
git clone https://github.com/Codebridge404/codebridgesfront.git
cd codebridgesfront

npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8080/api/v1
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build & Verification
```bash
# Type check and lint
npx tsc --noEmit
npm run lint

# Production build test
npm run build
```

---

## 🌿 GitFlow & Branching Guidelines

- **`master` (Production)**: Protected. Releases managed by Admin [@VibolSen](https://github.com/VibolSen).
- **`demo` (Staging / Integration)**: Protected. Integration branch for upcoming features.
- **`feature/*` / `fix/*`**: All developers branch off `demo` and open Pull Requests targeting `demo`.

```bash
git checkout demo
git pull origin demo
git checkout -b feature/your-feature-name

# Work, commit, and push
git push -u origin feature/your-feature-name
```

---

## 👥 Organization
- **Owner**: [@VibolSen](https://github.com/VibolSen)
- **Team**: [@Codebridge404/developers](https://github.com/orgs/Codebridge404/teams/developers)
