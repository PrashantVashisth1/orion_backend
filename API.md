# OrionEduverse Backend — Extended API Documentation

Version: 1.0.0
Server: Node.js + Express + PostgreSQL
Auth: JWT (Bearer) with database-backed user verification

- Base URL (local): http://localhost:4000
- Static files: `/uploads/*` (served directly by Express)
- All protected endpoints require header: `Authorization: Bearer <JWT>`

## 1. Getting Started

### 1.1. Requirements
- Node.js 18+
- PostgreSQL 13+
- Environment variables in `.env`:
  - `DATABASE_URL` (PostgreSQL connection string)
  - `JWT_SECRET` (strong secret for JWT signing)

### 1.2. Install & Run
```bash
npm install
npm run dev   # starts nodemon on http://localhost:4000
# or
npm start
```

### 1.3. Health Check
- GET `/` → returns "🚀 API is running"

### 1.4. Logging, CORS, Rate Limits
- CORS: enabled globally (default allow all origins; customize as needed)
- Request logs: `morgan('dev')`
- Global rate-limiter: 100 req / 15min per IP
- Winston logger for centralized error handling

## 2. Authentication

Routes base: `/api/auth`

### 2.1. Signup
- POST `/api/auth/signup`
- Request body:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "mobile": "",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```
- Responses:
  - 201 Created
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 12,
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "mobile": "",
      "createdAt": "2025-08-25T06:55:00.000Z",
      "updatedAt": "2025-08-25T06:55:00.000Z"
    },
    "token": "<JWT>"
  },
  "message": "User registered successfully"
}
```
  - 400 Validation error
  - 409 Email already exists
  - 429 Too many attempts (per-route limiter: 10 req / 15min)

Validation notes:
- `password` must include uppercase, lowercase, and digit (min length 8)

### 2.2. Login
- POST `/api/auth/login`
- Request body:
```json
{ "email": "jane@example.com", "password": "Password123!" }
```
- Responses:
  - 200 OK with `{ user, token }`
  - 400 Validation error
  - 401 Invalid credentials
  - 429 Rate limited

### 2.3. Current User Profile (Protected Example)
- GET `/api/profile`
- Headers: `Authorization: Bearer <JWT>`
- Responses:
  - 200 OK with current user
  - 401 Missing/invalid token
  - 404 User not found (if token references a non-existent user)

Auth behavior:
- Middleware verifies token AND checks the referenced user exists in DB.
- If user not found, returns 401 `{"error":"User not found"}`.

## 3. Startup Profile

Routes base: `/api/startup` (all are protected with JWT + per-route rate-limiter: 100 req / hour)

Data model (PostgreSQL via SQL + Prisma schema):
- `startup_profiles` is owned by a `users` row; most sections are 1:1 by `startup_profile_id`.
- Sections: `personal_info`, `business_details`, `company_details`, `offerings`, `interests`, `technology_interests`, `partnership_interests`, `innovation_focus`.

### 3.1. Get Full Profile
- GET `/api/startup/profile`
- Response:
```json
{
  "success": true,
  "data": {
    "id": 3,
    "user_id": 12,
    "is_complete": false,
    "completion_percentage": 40,
    "created_at": "2025-08-25T06:55:00.000Z",
    "updated_at": "2025-08-25T07:10:00.000Z",
    "personal_info": { /* nullable if not filled */ },
    "business_details": { /* ... */ },
    "company_details": { /* ... */ },
    "offerings": { /* ... */ },
    "interests": { /* ... */ },
    "technology_interests": { /* ... */ },
    "partnership_interests": { /* ... */ },
    "innovation_focus": { /* ... */ }
  },
  "message": "Profile retrieved successfully"
}
```
- Errors: 404 if profile not found (create it or patch a section to auto-create).

### 3.2. Create Profile
- POST `/api/startup/profile`
- Creates an empty profile for the authenticated user (no body required).
- Errors: 409 if a profile already exists for the user.

### 3.3. Delete Profile
- DELETE `/api/startup/profile`
- Removes the profile and its dependent sections.

### 3.4. Completion Status
- GET `/api/startup/profile/completion`
- Response:
```json
{
  "success": true,
  "data": { "completion_percentage": 60, "is_complete": false },
  "message": "Completion status retrieved successfully"
}
```

### 3.5. File Uploads
- POST `/api/startup/upload` (multipart/form-data)
  - Returns stored filename/path
- DELETE `/api/startup/upload/:filename`

### 3.6. Section Update Endpoints (PATCH)

All PATCH endpoints auto-create the startup profile for the user if it does not exist.

#### 3.6.1. Personal Info — `/api/startup/profile/personal-info`
Body fields (Joi):
- `profile_picture?` (uri string)
- `first_name` (2–50)
- `last_name` (2–50)
- `email` (email)
- `phone` (8–20)
- `location` (2–100)
- `website?` (uri)
- `birth_date?` (date)
- `bio?` (<=1000)

Example:
```bash
curl -X PATCH http://localhost:4000/api/startup/profile/personal-info \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"Jane","last_name":"Doe","email":"jane@example.com",
    "phone":"9998887777","location":"NYC","bio":"Founder"
  }'
```

#### 3.6.2. Business Details — `/api/startup/profile/business-details`
Body fields:
- `job_title` (required), `company?`, `industry` (required), `experience?`,
  `business_type?`, `team_size?`, `revenue?`, `funding_stage?`, `skills?`, `goals?`,
  `linkedin_profile?`, `twitter_profile?`, `github_profile?`, `portfolio_website?`

#### 3.6.3. Company Details — `/api/startup/profile/company-details`
Body fields:
- `company_logo?`, `company_name` (required), `founded_year` (1900..current),
  `company_email` (email), `company_phone`, `company_location`, `company_website?`,
  `company_description` (10..1000), `vision` (10..500), `mission` (10..500),
  `team_size?`, `company_type?`, `industry` (required), `revenue_range?`,
  `legal_name?`, `tax_id?`, `registration_date?`, `business_license?`

#### 3.6.4. Offerings — `/api/startup/profile/offerings`
Body fields:
- `products?` array<string>, `services?` array<string>, `pricing_model?`, `price_range?`,
  `target_customers?`, `revenue_streams?`, `unique_value_proposition?`,
  `competitive_advantage?`, `support_model?`, `onboarding_process?`,
  `customer_success_strategy?`, `future_offerings?`

#### 3.6.5. Interests — `/api/startup/profile/interests`
Body fields:
- `primary_industry` (required), `secondary_industry?`, `primary_target_market?`,
  `geographic_focus?`, `market_description?`, `partnership_goals?`,
  `innovation_description?`, `future_goals?`

#### 3.6.6. Technology Interests — `/api/startup/profile/technology-interests`
Body fields (booleans + `other_tech?` string):
- `ai_ml?`, `blockchain?`, `cloud_computing?`, `cybersecurity?`, `iot?`,
  `fintech?`, `healthtech?`, `edtech?`, `sustainability_tech?`, `other_tech?`

#### 3.6.7. Partnership Interests — `/api/startup/profile/partnership-interests`
Body fields (booleans):
- `startup_partnerships?`, `enterprise_partnerships?`, `research_collaborations?`,
  `academic_partnerships?`, `government_contracts?`, `nonprofit_collaborations?`

#### 3.6.8. Innovation Focus — `/api/startup/profile/innovation-focus`
Body fields (booleans):
- `product_development?`, `process_innovation?`, `business_model_innovation?`,
  `sustainability_innovation?`, `social_impact?`, `disruptive_technology?`

#### 3.6.9. Combined Sections — `/api/startup/profile/combined-sections`
Use when sending a mixed payload (e.g., interests + technology + innovation) in a single request.
- Accepts any subset of fields from 3.6.5–3.6.8
- Validates the entire payload and updates only the sections present
- Returns updated section fragments and new completion percentage

Example:
```bash
curl -X PATCH http://localhost:4000/api/startup/profile/combined-sections \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "primary_industry":"Finance",
    "ai_ml": true,
    "startup_partnerships": false,
    "product_development": true
  }'
```

### 3.7. Completion Calculation
- The backend updates `completion_percentage` after each section upsert.
- A section is considered complete if required fields for that section are present (exact logic in `updateCompletionPercentage`).

## 4. Needs

Routes base: `/api/needs`

### 4.1. Create Need (Protected)
- POST `/api/needs/`
- Body fields: see controller (`createNeed`) for the exact schema used in your app context.
- Responses: 201 on success; 400 on validation errors; 401 on missing/invalid token.

### 4.2. List Needs (Public)
- GET `/api/needs/`
- Query params: optional filters may be added in future.

## 5. Host Sessions

Routes base: `/api/host-sessions`

### 5.1. Create Host Session (Protected)
- POST `/api/host-sessions/`
- Body fields: see controller (`createHostSession`) for your exact schema.

### 5.2. List Host Sessions (Public)
- GET `/api/host-sessions/`

## 6. Uploads

Under startup routes (protected by the same middlewares):
- POST `/api/startup/upload` — multipart file upload; stores file on disk under `/uploads`; returns path/filename
- DELETE `/api/startup/upload/:filename` — deletes file

Frontend should use multipart form data and preserve returned filenames for referencing later in profile sections.

## 7. Frontend Integration Guide

### 7.1. Axios Client
```javascript
import axios from 'axios';

export const api = axios.create({ baseURL: 'http://localhost:4000' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 7.2. Auth Flow
```javascript
// Signup
const { data: signupRes } = await api.post('/api/auth/signup', {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  mobile: '',
  password: 'Password123!',
  confirmPassword: 'Password123!'
});
localStorage.setItem('token', signupRes.data.token);

// Login (if needed later)
const { data: loginRes } = await api.post('/api/auth/login', {
  email: 'jane@example.com',
  password: 'Password123!'
});
localStorage.setItem('token', loginRes.data.token);
```

### 7.3. Using Startup Profile APIs
```javascript
// Ensure profile exists (optional, auto-created by PATCH endpoints anyway)
await api.post('/api/startup/profile');

// Get full profile
const profile = (await api.get('/api/startup/profile')).data.data;

// Update interests only
await api.patch('/api/startup/profile/interests', {
  primary_industry: 'Finance',
  market_description: 'Enterprise fintech tools'
});

// Update multiple sections at once
await api.patch('/api/startup/profile/combined-sections', {
  primary_industry: 'Finance',
  ai_ml: true,
  product_development: true
});

// Completion status
const completion = (await api.get('/api/startup/profile/completion')).data.data;
```

### 7.4. Needs and Host Sessions
```javascript
// Create a need
await api.post('/api/needs', { title: 'Looking for data engineer', description: '...' });

// List needs (public)
const needs = (await api.get('/api/needs')).data;

// Create host session
await api.post('/api/host-sessions', { topic: 'AI in EdTech', time: '2025-09-01T10:00:00Z' });

// List host sessions (public)
const sessions = (await api.get('/api/host-sessions')).data;
```

### 7.5. Handling Tokens
- Always use the latest token from login/signup.
- If you get 401 "User not found": the token’s subject references a deleted/non-existent user. Re-auth to get a fresh token.
- On 403 "Invalid or expired token": refresh by logging in again.

## 8. Error Conventions

Structure for validation errors:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "<field>", "message": "<detail>" }
    ]
  }
}
```

Other common errors:
- 401 `{"error":"User not found"}` when token is valid but user is missing
- 404 `PROFILE_NOT_FOUND` for missing startup profile
- 409 `PROFILE_EXISTS` when creating a duplicate profile
- 429 rate limiters (global and per-route)

## 9. Security Notes
- JWT secret should be strong and never committed.
- Auth middleware verifies user existence; do not rely on tokens alone.
- Consider HTTPS and CORS restrictions in production.

## 10. Rate Limits Summary
- Global: 100 requests / 15 minutes per IP
- Auth endpoints: 10 requests / 15 minutes per IP
- Startup profile endpoints: 100 requests / hour per IP

---
If you need Swagger/OpenAPI JSON/YAML or Postman collection, ask and I’ll generate it from this spec.
