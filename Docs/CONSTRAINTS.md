# Horizon Constraints

This document outlines the hard constraints and requirements for the Horizon project. Adherence to these constraints is mandatory for all development.

## 1. Technology Constraints

*   **Frontend Framework:** MUST use React + Vite + Bun. (Do NOT use npm, yarn, or pnpm).
*   **UI Libraries:** MUST use Shadcn UI (primary), along with Aceternity UI, Magic UI, DaisyUI, and Tailwind CSS.
*   **Theme & Design:**
    *   **Palette:** Light theme with Cream (`#FFF8F0`), Black (`#1A1A1A`), and Cobalt Blue (`#0047AB`) as the primary colors.
    *   **Style:** Neo-brutalistic with consistent fonts, bento grids, and glassmorphism accents.
*   **Backend:** Python (FastAPI or Flask).
*   **Authentication:** Firebase Authentication (already set up).
*   **Database:** Firebase Realtime Database (already set up).
*   **Infrastructure:** Docker or Kubernetes for orchestration and simulation.
*   **Blockchain Integration:** Web3 for NFT-based SaaS subscription plans.
*   **AI/LLM:** Optional LLM agent integration for intelligent recovery suggestions.

## 2. Coding Conventions

*   **Frontend (TypeScript):**
    *   TypeScript strict mode MUST be enabled.
    *   All components MUST expose `className` props for CSS customization.
    *   Linting & Formatting: ESLint + Prettier.
*   **Backend (Python):**
    *   Comprehensive type hints are mandatory.
    *   Linting & Formatting: Black + Ruff.
*   **Accessibility:** Every component MUST meet WCAG 2.1 AA standards.

## 3. Architecture Constraints

*   **Pattern:** Microservices architecture for the backend.
*   **Communication:** Event-driven communication between services.
*   **Auditing:** All state changes MUST be auditable and logged.
*   **Recovery Flow:** Human approval is strictly REQUIRED for high-risk infrastructure recovery actions.

## 4. Performance Requirements

*   **Dashboard Load Time:** < 2 seconds.
*   **Failure Detection Latency:** < 30 seconds.
*   **Recovery Initiation Latency:** < 60 seconds after detection.

## 5. Security Constraints

*   **API Security:** All API endpoints MUST be authenticated.
*   **Credential Storage:** Blockchain-based secure credential storage.
*   **Auditability:** Full audit trail for all system and user actions.
*   **Access Control:** Role-Based Access Control (RBAC) enforced for team access.

## 6. API Restrictions

*   DO NOT expose raw database queries through APIs.
*   DO NOT use unversioned API endpoints (e.g., use `/api/v1/...`).
*   DO NOT return sensitive information in error responses.

## 7. Dependency Management

*   Only approved packages are allowed.
*   Frontend package management MUST use `bun`.
*   Backend dependencies MUST be pinned in `requirements.txt` or `Pipfile`/`pyproject.toml`.
