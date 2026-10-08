# Horizon — Project Rules

## Project Overview
Horizon is an Autonomous Enterprise Infrastructure Recovery Platform — a SaaS product that detects infrastructure failures and orchestrates recovery across connected systems in the correct dependency order. It features Web3/NFT-based subscription plans and blockchain credential security.

## Tech Stack
- **Frontend**: React 18+ with Vite, Bun as package manager/runtime
- **UI Libraries**: Shadcn UI (primary), Aceternity UI, Magic UI, DaisyUI, Tailwind CSS
- **Backend**: Python 3.11+ (FastAPI)
- **Auth**: Firebase Authentication
- **Database**: Firebase Realtime Database
- **Infrastructure**: Docker, Kubernetes
- **Blockchain**: Web3, Solidity smart contracts
- **LLM**: Optional AI agent for intelligent recovery

## Design System
- **Theme**: Light mode with cream (#FFF8F0), black (#1A1A1A), cobalt blue (#0047AB)
- **Style**: Neo-brutalistic, bento grids, glassmorphism accents
- **Typography**: Consistent font stack across all components
- **Requirement**: Every component MUST have CSS classNames for conventional CSS overrides

## Coding Standards

### Frontend (TypeScript/React)
- Use TypeScript strict mode
- Functional components only, no class components
- Use React hooks for state management
- All components must be accessible (WCAG 2.1 AA compliant)
- Use `cn()` utility from shadcn for conditional classNames
- File naming: PascalCase for components, camelCase for utilities
- Export named exports, not default exports
- Every component must accept a `className` prop for downstream styling extensibility

### Backend (Python)
- Use type hints on all functions and methods (Mypy strict mode)
- Use async/await for I/O operations (FastAPI native async)
- Follow PEP 8 with Black formatter, isort for imports, and flake8 for linting
- Use Pydantic models for data validation and API payloads
- Every endpoint must have OpenAPI documentation

### General
- Write unit tests for all new code (pytest for backend, vitest for frontend)
- Never modify unrelated files or change formatting outside the scope of work
- Always update relevant documentation when changing code
- Use conventional commits (feat:, fix:, docs:, refactor:, etc.)
- No console.log or print statements in production code. Use structured logging
- Handle all error cases explicitly and return appropriate HTTP status codes

## Directory Structure Rules
- Frontend code in `apps/web/`
- Backend code in `apps/api/`
- Shared types and utilities in `packages/shared/`
- Infrastructure configs (Docker, K8s, Terraform) in `infra/`
- Smart contracts in `contracts/`
- Documentation in `Docs/`

## DO NOT
- Use npm, yarn, or pnpm — strictly use Bun
- Use CSS-in-JS solutions (styled-components, emotion)
- Use class components in React
- Modify Firebase security rules without peer review
- Deploy without human approval step in CI/CD pipeline
- Use any package not in the approved dependencies list
- Remove existing comments or documentation unless explicitly asked to do so
