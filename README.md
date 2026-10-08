# Horizon ⚡

<p align="center">
  <img src="./public/logo.png" alt="Horizon Logo" width="220" />
</p>

**Horizon** is an advanced AI-powered automated recovery engine. It continuously monitors your infrastructure, diagnoses problems, and executes automated recovery playbooks to maintain high availability and reliability. 

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🏗️ Directory Structure

```text
horizon/
├── apps/                 # Applications
│   ├── web/              # React Frontend App
│   └── api/              # Python FastAPI Backend Services
├── packages/             # Shared local packages
│   └── shared/           # Shared types and utilities
├── infra/                # Infrastructure configurations
│   ├── docker/           # Docker setup
│   ├── k8s/              # Kubernetes manifests
│   └── simulated/        # Simulated infrastructure for testing
├── contracts/            # Smart contracts and Web3
├── Docs/                 # Project documentation
└── README.md             # This file
```

## 🚀 Quick Start

> **Note**: Comprehensive instructions are coming soon.

### Prerequisites
- [Bun](https://bun.sh/) (Package Manager)
- [Python 3.11+](https://www.python.org/)
- [Docker](https://www.docker.com/)

### Setup

```bash
# Clone the repository
git clone https://github.com/Precise-Goals/horizon.git
cd horizon

# Install dependencies (using Bun ONLY)
bun install

# Start development servers
bun run dev
```

## 📚 Documentation
Detailed documentation is available in the [`Docs/`](./Docs) directory.

## 🤝 Contributing
We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) (coming soon) for more details.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
