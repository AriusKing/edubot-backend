# Contributing to EduBot Backend

Thank you for your interest in contributing to the EduBot Super App backend! This document outlines the process for contributing code, documentation, and ideas.

## 📋 Code of Conduct

We expect all contributors to be respectful, inclusive, and collaborative. Harassment or exclusionary behavior will not be tolerated.

## 🚀 How to Contribute

### 1. Reporting Bugs

- Check the [Issues](https://github.com/AriusKing/edubot-backend/issues) page to see if the bug has already been reported.
- If not, open a new issue with a clear title, description, and steps to reproduce.
- Include relevant logs, screenshots, or error messages.

### 2. Suggesting Features

- Open an issue with the **enhancement** label.
- Describe the feature, why it’s valuable, and any implementation ideas you have.
- We’ll discuss it and, if approved, tag it as `help wanted` or `good first issue`.

### 3. Submitting Code Changes

1. **Fork** the repository.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/edubot-backend.git
   ```
3. **Create a branch** for your change:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes**, following the [coding standards](#-coding-standards).
5. **Test your changes** (see [Testing](#-testing)).
6. **Commit** with a descriptive message:
   ```bash
   git commit -m "feat: add progress tracking endpoint"
   ```
   Use [Conventional Commits](https://www.conventionalcommits.org/) style.
7. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request** against the `main` branch of the original repository.

## 🧪 Testing

- All new features should include tests (unit and/or integration).
- Run the existing test suite before submitting:
  ```bash
  npm test
  ```
- Ensure the server starts without errors:
  ```bash
  npm start
  ```
- Verify API endpoints with `curl` or Postman.

## 📏 Coding Standards

### JavaScript/Node.js

- Use **ES6+** syntax where possible.
- Follow the existing code style (2‑space indentation, semicolons, single quotes).
- Use meaningful variable and function names.
- Comment complex logic, but strive for self‑documenting code.

### API Design

- RESTful principles: nouns for resources, HTTP verbs for actions.
- Consistent error responses (see `src/utils/errorHandler.js`).
- Use JSON for request/response bodies.
- Include appropriate HTTP status codes.

### Database

- Keep SQLite migrations idempotent.
- Use parameterized queries to prevent SQL injection.
- Document schema changes in `db/README.md`.

### Git

- Write clear, concise commit messages.
- Keep commits focused (one logical change per commit).
- Rebase your branch on `main` before opening a PR.

## 🛠 Development Setup

See the main [README.md](README.md) for installation and running instructions.

## 📬 Questions?

- Open a **Discussion** on GitHub for general questions.
- Tag maintainers in issues or PRs with `@AriusKing`.

---

We appreciate every contribution, big or small. Together we’re building a better platform for education! 🎓