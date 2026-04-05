# EduBot Backend – API Reference

This document describes the RESTful API endpoints provided by the EduBot Super App backend.

All endpoints return JSON. Base URL: `http://localhost:3000/api` (or your deployed URL).

## Health

### `GET /api/health`
Check server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026‑03‑31T12:34:56.789Z"
}
```

## Questions

### `GET /api/questions`
Fetch questions with optional filters.

**Query Parameters:**
- `subject` (string) – e.g., `math`, `chemistry`, `english`
- `difficulty` (string) – `easy`, `medium`, `hard`
- `topic` (string) – specific topic within subject
- `limit` (number) – maximum number of questions (default: 20)

**Example:**
```
GET /api/questions?subject=math&difficulty=medium&limit=10
```

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

### `GET /api/questions/:id`
Get a single question by ID.

## Progress Tracking

### `POST /api/progress`
Record a student’s practice session result.

**Request Body:**
```json
{
  "studentId": "stu_001",
  "subject": "chemistry",
  "score": 85,
  "timeSpent": 1200,
  "metadata": { "topic": "Organic Chemistry", "correct": 17, "total": 20 }
}
```

**Response:**
```json
{
  "id": 123,
  "studentId": "stu_001",
  "timestamp": "2026‑03‑31T12:34:56.789Z"
}
```

### `GET /api/progress/:studentId`
Retrieve progress history for a student.

## AI‑Powered Tutoring

### `POST /api/tutor/analyze`
Analyze a student’s answer and provide feedback.

**Request Body:**
```json
{
  "studentId": "stu_001",
  "questionId": 42,
  "studentAnswer": "The mitochondria is the powerhouse of the cell.",
  "language": "en"
}
```

**Response:**
```json
{
  "score": 8,
  "feedback": "Correct! The mitochondria produces ATP through cellular respiration.",
  "suggestions": ["Consider mentioning the inner membrane cristae."]
}
```

### `GET /api/tutor/history/:studentId`
Get tutoring session history.

## Exam Papers

### `GET /api/papers`
List available exam papers (HKDSE, A‑Level, GCSE).

**Query Parameters:**
- `subject` (string)
- `year` (number)
- `board` (string) – e.g., `hkeaa`, `cie`, `aqa`

### `GET /api/papers/:id`
Get a specific paper’s metadata and question list.

### `POST /api/papers/scan`
(Admin) Scan a new PDF paper and extract questions (requires authentication).

## Error Handling

All endpoints follow a consistent error format:

```json
{
  "error": "Invalid request",
  "message": "Missing required field: studentId",
  "statusCode": 400
}
```

Common status codes:

- `200` – Success
- `201` – Created
- `400` – Bad Request
- `404` – Not Found
- `500` – Internal Server Error

## Authentication & Authorization

*Currently the API operates in trusted‑local mode. Future versions will support JWT‑based authentication for teachers and students.*

---

*For questions or suggestions, open an issue on [GitHub](https://github.com/AriusKing/edubot-backend/issues).*