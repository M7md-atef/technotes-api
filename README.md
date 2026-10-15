# 📝 techNotes API — Notes and User Management Backend

[![Node.js](https://img.shields.io/badge/Node.js-CommonJS-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

> **techNotes API** is the Express and MongoDB backend for the techNotes application. It provides JWT-based authentication, refresh-token cookies, and protected user and note management endpoints.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [🌐 API Routes](#-api-routes)

---

## ✨ Features

- User login with bcrypt password comparison and JWT access tokens.
- HTTP-only, secure refresh-token cookies for renewing access tokens.
- JWT-protected user and note management endpoints.
- Login rate limiting: up to five login attempts per IP per minute.
- MongoDB connection reuse, including across warm Vercel function invocations.
- CORS configured for the production frontend origin.
- Root status page showing whether the backend can connect to MongoDB.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| Runtime | Node.js |
| HTTP API | Express 5 |
| Database | MongoDB Atlas with Mongoose |
| Authentication | JSON Web Tokens and bcrypt |
| Cookies and CORS | `cookie-parser`, `cors` |
| Deployment | Vercel Node.js Functions |

## 📁 Project Structure

```text
.
├── config/
│   ├── allowedOrigin.js   # Frontend origins allowed to call the API
│   ├── corsOptions.js     # CORS rules, including credentialed requests
│   └── dbConn.js          # Reusable, shared MongoDB connection promise
├── controllers/
│   ├── authController.js  # Login, refresh-token, and logout handlers
│   ├── notesController.js # Note CRUD operations
│   └── usersController.js # User CRUD operations
├── middleware/
│   ├── errorHandler.js    # Logs errors and sends JSON error responses
│   ├── logger.js          # Request/event logging (console on Vercel)
│   ├── loginLimiter.js    # Limits login attempts per IP
│   └── verifyJWT.js       # Verifies bearer access tokens
├── models/
│   ├── Note.js            # Note schema and auto-incrementing ticket number
│   └── User.js            # User schema, roles, active state, and password hash
├── public/
│   └── CSS/
│       └── style.css      # Styles for the backend status page
├── routes/
│   ├── authRoutes.js      # /auth endpoints
│   ├── noteRoutes.js      # Protected /notes endpoints
│   ├── root.js            # Status page and /health endpoint
│   └── userRoutes.js      # Protected /users endpoints
├── views/
│   ├── 404.html           # HTML response for unknown browser routes
│   └── index.html         # Root page; fetches /health and displays DB status
├── .gitignore             # Excludes local dependencies, logs, and secrets
├── package.json           # Dependencies and npm scripts
├── package-lock.json      # Exact dependency versions for reproducible installs
├── README.md              # Project documentation
├── server.js              # Express setup, middleware, routes, and app export
└── vercel.json            # Routes Vercel requests to the Express function
```

### What each part does

#### Configuration

- **`config/allowedOrigin.js`** contains the exact frontend origin(s) accepted by CORS. Add a new deployed frontend origin here if the frontend domain changes.
- **`config/corsOptions.js`** applies that allowlist and allows credentialed browser requests, which are needed for the refresh-token cookie.
- **`config/dbConn.js`** connects Mongoose to `DATABASE_URL`. It reuses an in-progress connection attempt and an already-open connection so concurrent requests and warm serverless invocations do not create duplicate clients.

#### Controllers

- **`controllers/authController.js`**
  - `login` checks the submitted username and password, compares the password hash, returns a short-lived access token, and sets a secure HTTP-only refresh cookie.
  - `refresh` verifies the refresh cookie and returns a new access token.
  - `logout` clears the refresh cookie.
- **`controllers/usersController.js`**
  - `getAllUsers` returns users without their password field.
  - `createNewUser` checks required fields and duplicate usernames, hashes the password, then creates the user.
  - `updateUser` changes a user's username, roles, active state, and optionally password.
  - `deleteUser` refuses to delete a user who still has notes, then removes the user.
- **`controllers/notesController.js`**
  - `getAllNotes` returns notes with their owner's username.
  - `createNewNote` checks required fields and duplicate titles before creating a note.
  - `updateNote` changes a note's owner, title, text, and completion state.
  - `deleteNote` removes a note by its MongoDB ID.

#### Middleware

- **`middleware/verifyJWT.js`** reads the `Authorization: Bearer <token>` header, verifies the access token, and places the username and roles on the request for downstream handlers. The user and note routers apply it to their endpoints.
- **`middleware/loginLimiter.js`** allows up to five login attempts per IP within one minute and returns a rate-limit response after that.
- **`middleware/logger.js`** logs incoming requests and application events. On Vercel it writes to the function console rather than trying to persist logs to the deployment filesystem.
- **`middleware/errorHandler.js`** logs uncaught route errors and returns a JSON response with an appropriate error status.

#### Models

- **`models/User.js`** defines a user with a required username and password hash, a `roles` string array defaulting to `Employee`, and an `active` flag defaulting to `true`.
- **`models/Note.js`** defines a note with a required user reference, title, and text; `completed` defaults to `false`. Mongoose adds creation/update timestamps, and `mongoose-sequence` assigns `ticket` numbers starting at `500`.

#### Routes, views, and application entry

- **`routes/authRoutes.js`** maps `POST /auth`, `GET /auth/refresh`, and `POST /auth/logout` to the authentication controller; login requests pass through the rate limiter.
- **`routes/userRoutes.js`** maps `GET`, `POST`, `PATCH`, and `DELETE /users` to the user controller and requires a valid access token.
- **`routes/noteRoutes.js`** maps `GET`, `POST`, `PATCH`, and `DELETE /notes` to the notes controller and requires a valid access token.
- **`routes/root.js`** serves the home page and provides `GET /health`, which attempts to connect to MongoDB and reports `ON` or `OFF`.
- **`views/index.html`** is the backend home/status page. It requests `/health` and displays the database connection state.
- **`views/404.html`** is the HTML not-found page used for unknown browser requests; requests expecting JSON receive a JSON 404 instead.
- **`public/CSS/style.css`** centers and styles the black status page and its green/red status indicator.
- **`server.js`** configures Express middleware and mounts the routes. It exports the app for Vercel; outside Vercel it connects to MongoDB and starts the local HTTP listener.
- **`vercel.json`** configures Vercel to run `server.js` with `@vercel/node` and route incoming requests to the Express app.
- **`package.json`** declares runtime/development dependencies and the `start` and `dev` npm scripts. **`package-lock.json`** records the resolved package versions used by npm.
- **`.gitignore`** keeps `node_modules`, local log files, and `.env` out of version control.

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB database (for example, MongoDB Atlas)

### Installation

```bash
git clone https://github.com/M7md-atef/technotes-api.git
cd technotes-api
npm install
```

Create a `.env` file in the project root with the variables listed below.

### Run locally

```bash
npm run dev
```

The API listens on `http://localhost:5000` by default. To use another port, set `PORT`. The root page is at `/`; the API endpoints are listed below.

Run the non-watch server with:

```bash
npm start
```

## 🔐 Environment Variables

Set these in your local `.env` file for development and in the backend deployment environment for production:

| Variable | Required | Purpose |
| :--- | :---: | :--- |
| `DATABASE_URL` | Yes | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | Yes | Secret used to sign access tokens |
| `REFRESH_TOKEN_SECRET` | Yes | Secret used to sign refresh tokens |
| `PORT` | No | Local HTTP port; defaults to `5000` |

Example `.env` (replace the placeholders with your own values):

```env
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster>/<database>
ACCESS_TOKEN_SECRET=<long-random-secret>
REFRESH_TOKEN_SECRET=<another-long-random-secret>
PORT=5000
```

## 🌐 API Routes

| Method | Path | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Status page; shows whether MongoDB is connected |
| `GET` | `/health` | Public | Returns MongoDB connection status as JSON |
| `POST` | `/auth` | Public, rate limited | Log in; returns an access token and sets a refresh cookie |
| `GET` | `/auth/refresh` | Public, refresh cookie required | Issue a new access token |
| `POST` | `/auth/logout` | Public | Clear the refresh-token cookie |
| `GET` | `/users` | Bearer access token | List users |
| `POST` | `/users` | Bearer access token | Create a user |
| `PATCH` | `/users` | Bearer access token | Update a user |
| `DELETE` | `/users` | Bearer access token | Delete a user |
| `GET` | `/notes` | Bearer access token | List notes |
| `POST` | `/notes` | Bearer access token | Create a note |
| `PATCH` | `/notes` | Bearer access token | Update a note |
| `DELETE` | `/notes` | Bearer access token | Delete a note |

Protected requests must include:

```http
Authorization: Bearer <access-token>
```

The login body accepts `username` and `password`. User and note create/update/delete requests use JSON bodies; see the controllers for their required fields.

---

<div align="center">
  <sub>Developed with ❤️ and built for the techNotes application.</sub>
</div>
