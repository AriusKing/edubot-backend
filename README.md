# EduBot Super App – Backend API

> Production‑ready Express.js backend for the EduBot Super App: a unified platform for HKDSE, A‑Level, and GCSE exam preparation.

![GitHub License](https://img.shields.io/github/license/AriusKing/edubot-backend)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![Express](https://img.shields.io/badge/express-4.x-blue)
![GitHub Actions](https://img.shields.io/github/actions/workflow/status/AriusKing/edubot-backend/node.js.yml?branch=main)

**Live Demo:** [https://edubot-backend.onrender.com](https://edubot-backend.onrender.com) (deploying soon)  
**Frontend:** [EduBot Frontend](https://github.com/AriusKing/edubot-frontend)  
**Full Documentation:** [API Docs](#api-documentation)

---

## 🚀 Features

- **RESTful API** for question banks, student progress, and AI‑powered tutoring
- **SQLite database** with schema‑first design – zero‑config local development
- **Teacher Dashboard** – real‑time analytics, student performance tracking
- **Multi‑subject support** – HKDSE, A‑Level, GCSE (13+ subjects)
- **Modular routes** – questions, progress, tutoring, paper management
- **CORS‑enabled** – ready for cross‑origin frontend integration
- **Health monitoring** – built‑in `/api/health` endpoint
- **Production‑ready** – follows 12‑factor app principles

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js (≥14) |
| **Framework** | Express.js |
| **Database** | SQLite (better‑sqlite3) |
| **API** | RESTful JSON |
| **Testing** | Jest (coming soon) |
| **CI/CD** | GitHub Actions |
| **Deployment** | Render, Railway, Docker |

## 📦 Quick Start

### Prerequisites

- Node.js 14+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/AriusKing/edubot-backend.git
cd edubot-backend

# Install dependencies
npm install

# Initialize the database
npm run init-db

# (Optional) Migrate sample question banks
npm run migrate-questions
```

### Running the Server

**Development (with hot reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:3000`.  
Visit `http://localhost:3000/api/health` to verify.

## 🧪 API Documentation

### Health Check
```
GET /api/health
```
Returns server status and timestamp.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026‑03‑31T12:34:56.789Z"
}
```

### Question Banks
```
GET /api/questions?subject=math&difficulty=medium&limit=10
```
Returns filtered questions from the database.

**Response:**
```json
[
  {
    "id": 1,
    "subject": "math",
    "topic": "Algebra",
    "difficulty": "medium",
    "question": "Solve for x: 2x + 5 = 15",
    "answer": "5",
    "explanation": "Subtract 5 from both sides, then divide by 2."
  }
]
```

### Student Progress
```
POST /api/progress
Content‑Type: application/json

{
  "studentId": "stu_001",
  "subject": "chemistry",
  "score": 85,
  "timeSpent": 1200
}
```

See the full [API.md](API.md) for detailed endpoint documentation.

## 🗂️ Project Structure

```
edubot-backend/
├── src/
│   ├── server.js          # Main entry point
│   ├── routes/            # API routes (questions, progress, tutor, papers)
│   ├── db/                # SQLite initialization & models
│   └── utils/             # Helper functions
├── scripts/               # Database migration & maintenance
├── public/                # Static frontend assets (served by Express)
├── package.json
├── README.md
└── LICENSE
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing‑feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing‑feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- **HKDSE Examination Authority** for public syllabus documents
- **OpenAI** for inspiration on AI‑powered tutoring
- **The EduBot Team** – building the future of education

---

**Built with ❤️ by [AriusKing](https://github.com/AriusKing)**  
*Part of the EduBot Super App ecosystem.*