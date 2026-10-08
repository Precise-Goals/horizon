# Agent Rules and Configuration

This document defines the rules, roles, and boundaries for AI agents operating within the Horizon development and runtime environments.

## 1. Agent Roles

*   **Researcher:** Investigates errors, explores APIs, gathers context.
*   **Planner:** Creates step-by-step execution plans and architectural designs.
*   **Implementer:** Writes code, creates files, and executes development tasks.
*   **Tester:** Writes and runs unit, integration, and E2E tests.
*   **Reviewer:** Analyzes code for security, performance, and style compliance.
*   **Migration Agent:** Handles database schema changes and data migrations.
*   **Deployment Agent:** Manages CI/CD pipelines and infrastructure deployments.

## 2. Permission Levels

*   **Read-only:** Can only view files and metrics. (Researcher, Reviewer)
*   **Read/Write Source:** Can modify application source code but not configuration or infrastructure. (Implementer, Tester)
*   **Read + Execute:** Can run tests and read results. (Tester)
*   **Restricted Write:** Can only modify specific scoped directories.
*   **Human Approval Required:** Must request manual confirmation before executing actions (Deployment Agent, Migration Agent for production).

## 3. Scope Policies

Agents are restricted to specific directories based on their assigned task:
*   Frontend tasks MUST ONLY touch `/frontend` or `/Docs`.
*   Backend tasks MUST ONLY touch `/backend` or `/Docs`.
*   Infrastructure tasks MUST ONLY touch `/infra`, `/docker`, or `/k8s`.
*   Agents attempting to write outside their scope will trigger a `SCOPE_DRIFT` exception.

## 4. Coding Standards

*   All agents MUST follow constraints defined in `CONSTRAINTS.md`.
*   Always preserve existing comments and documentation unless instructed otherwise.
*   Ensure all new functions/classes have appropriate type definitions (TypeScript/Python) and docstrings.

## 5. Task Execution Rules

*   **Single Context:** One task per context.
*   **Fresh Context:** Use a fresh context session for each new discrete task to prevent hallucination bleed-over.
*   **Bounded Scope:** Tasks must be small and bounded. Complex features must be broken down by the Planner before execution.

## 6. Verification Requirements

Before a task is considered complete, an agent must verify:
1.  All relevant tests pass.
2.  Type checking passes (`tsc` or `mypy`).
3.  Linting passes (`eslint` or `ruff`).
4.  No unrelated files were modified (clean git status outside of target scope).

## 7. Stop Conditions

Agents must automatically halt execution under the following conditions:
*   `MAX_ITERATIONS = 10`: Do not exceed 10 tool calls per discrete task.
*   `MAX_RETRIES_PER_TASK = 3`: If a test/build fails 3 times for the same reason, stop and request human help.
*   `STOP_ON_REPEATED_FAILURE = true`: Prevent infinite loops.
*   `STOP_ON_SCOPE_DRIFT = true`: Immediately stop if instructed or attempting to modify files outside the assigned scope.

## 8. Review Process

1.  **Deterministic Checks:** Code must pass all automated CI pipelines (build, test, lint).
2.  **AI Review:** The Reviewer agent checks for architectural consistency and style constraints.
3.  **Human Approval:** Final merge or high-risk execution requires explicit human authorization.
