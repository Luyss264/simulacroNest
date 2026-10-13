# Commercial Requests API

A REST API built with **NestJS**, **TypeScript**, **PostgreSQL**, and **TypeORM** to manage commercial requests. It uses a DAO layer for database access, a service layer for business rules, DTO validation, and API-key / user headers for access control.

---

## Requirements

- Node.js ≥ 18 and npm
- Docker with Docker Compose
- Postman or a browser (for Swagger UI)

---

## 1. Configure environment variables

Create a `.env` file in the project root (next to `package.json` and `docker-compose.yml`):

```dotenv
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=change_this_password
DATABASE_NAME=solicitudes_db
PORT=3000
API_KEYS=dev-key-001,dev-key-002
```

> **Note:** Use the same PostgreSQL credentials in `docker-compose.yml`. Never commit `.env` to Git.

---

## 2. Start the project

Run these commands from the project root:

```bash
npm install
docker compose up -d      # starts PostgreSQL in background
npm run start:dev         # starts NestJS in watch mode
```

The API will be available at `http://localhost:3000`.
Swagger UI is at `http://localhost:3000/docs`.

To stop the database without losing data:

```bash
docker compose down
```

---

## 3. Authentication

Every request must include these two headers:

| Header      | Example value  | Description                              |
|-------------|----------------|------------------------------------------|
| `x-api-key` | `dev-key-001`  | Must match a value in the `API_KEYS` env |
| `x-user`    | `admin1`       | Username that determines the role        |

### Available test users

| Username      | Role         |
|---------------|--------------|
| `admin1`      | `admin`      |
| `supervisor1` | `supervisor` |
| `asesor1`     | `asesor`     |
| `asesor2`     | `asesor`     |

These are demo users for testing only — not production accounts.

---

## 4. Test with Swagger UI

1. Start the database and the API (`npm run start:dev`).
2. Open **`http://localhost:3000/docs`** in your browser.
3. Click **Authorize** (top-right) → enter an API key (e.g. `dev-key-001`) → click **Authorize**.
4. For every request, add `x-user` in the header field shown on each endpoint (e.g. `admin1`).
5. Expand an endpoint → click **Try it out** → select one of the pre-filled **examples** from the dropdown → click **Execute**.

> **Tip:** Each endpoint already has named examples that match the expected DTOs. Just pick one and hit Execute.

---

## 5. Test with Postman

Set the following headers on every request:

```
x-api-key: dev-key-001
x-user: admin1
```

### Endpoint reference

| Method  | Path                        | Required role(s)        | Body / Params |
|---------|-----------------------------|-------------------------|---------------|
| `POST`  | `/solicitudes`              | `admin`, `asesor`       | JSON body     |
| `GET`   | `/solicitudes`              | `admin`, `supervisor`, `asesor` | Query params  |
| `GET`   | `/solicitudes/:id`          | `admin`, `supervisor`, `asesor` | Path param    |
| `GET`   | `/solicitudes/:id/historial`| `admin`, `supervisor`   | Path param    |
| `PATCH` | `/solicitudes/:id/estado`   | `admin`, `supervisor`   | JSON body     |
| `PATCH` | `/solicitudes/:id/asesor`   | `admin`, `supervisor`   | JSON body     |

---

### POST `/solicitudes` — Create a request

**Role:** `admin` or `asesor`

**As an advisor** (asesor fills itself automatically from `x-user`):
```json
{
  "cliente": "Acme Ltd.",
  "descripcion": "Prepare a commercial proposal for Q4."
}
```

**As an admin** (explicitly assigns an advisor):
```json
{
  "cliente": "Globex Corp.",
  "descripcion": "Follow up on contract renewal.",
  "asesor": "asesor1"
}
```

| Field        | Type    | Required | Constraints                                 |
|--------------|---------|----------|---------------------------------------------|
| `cliente`    | string  | ✅       | max 150 characters                          |
| `descripcion`| string  | ✅       | any non-empty text                          |
| `asesor`     | string  | ❌       | must be `asesor1` or `asesor2` (advisors only) |

---

### GET `/solicitudes` — List requests

**Role:** `admin`, `supervisor`, `asesor` (advisors see only their own)

All query parameters are optional:

| Param   | Type    | Example        | Description                          |
|---------|---------|----------------|--------------------------------------|
| `estado`| enum    | `PENDIENTE`    | Filter by status                     |
| `asesor`| string  | `asesor1`      | Filter by advisor username           |
| `cliente`| string | `Acme Ltd.`   | Filter by client name                |
| `desde` | date    | `2026-01-01`   | Filter from date (ISO 8601)          |
| `hasta` | date    | `2026-12-31`   | Filter to date (ISO 8601)            |
| `page`  | integer | `1`            | Page number (default: 1)             |
| `limit` | integer | `10`           | Results per page, max 100 (default: 10) |

Example URL:
```
GET /solicitudes?estado=PENDIENTE&asesor=asesor1&page=1&limit=10
```

---

### GET `/solicitudes/:id` — Get a single request

**Role:** `admin`, `supervisor`, `asesor` (advisors can only access their own)

```
GET /solicitudes/1
```

---

### GET `/solicitudes/:id/historial` — Get status history

**Role:** `admin`, `supervisor`

```
GET /solicitudes/1/historial
```

Returns every state transition recorded for the given request.

---

### PATCH `/solicitudes/:id/estado` — Update status

**Role:** `admin`, `supervisor`

Allowed transitions: `PENDIENTE` → `EN_GESTION` → `RESUELTA`

**Move to EN_GESTION:**
```json
{ "estado": "EN_GESTION" }
```

**Move to RESUELTA:**
```json
{ "estado": "RESUELTA" }
```

| Field   | Type | Required | Allowed values                       |
|---------|------|----------|--------------------------------------|
| `estado`| enum | ✅       | `PENDIENTE`, `EN_GESTION`, `RESUELTA`|

---

### PATCH `/solicitudes/:id/asesor` — Reassign advisor

**Role:** `admin`, `supervisor`  
Cannot reassign a request with status `RESUELTA`.

**Assign to asesor1:**
```json
{ "asesor": "asesor1" }
```

**Assign to asesor2:**
```json
{ "asesor": "asesor2" }
```

| Field   | Type   | Required | Allowed values         |
|---------|--------|----------|------------------------|
| `asesor`| string | ✅       | `asesor1`, `asesor2`   |

---

## Architecture

```
Controller  →  Service  →  DAO  →  TypeORM / PostgreSQL
```

| Layer          | Responsibility                                             |
|----------------|------------------------------------------------------------|
| **Controller** | HTTP routing, Swagger docs, header extraction              |
| **Service**    | Business rules: role checks, ownership, state transitions  |
| **DAO**        | TypeORM repository queries and database operations         |
| **Entities**   | Database table mapping (`solicitud`, `solicitud_historial`) |
| **DTOs**       | Request validation with `class-validator`                  |

---

## Evidence

![](./Captura%20de%20pantalla%202026-10-09%20123605.png)
![](./Captura%20de%20pantalla%202026-10-09%20123741.png)

## REPOSITORY

https://github.com/Luyss264/simulacroNest.git