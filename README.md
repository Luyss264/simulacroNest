# Commercial Requests API

A REST API built with NestJS, TypeScript, PostgreSQL, and TypeORM to manage commercial requests. It uses a DAO layer for database access, a service layer for business rules, DTO validation, and API-key/user headers for protected endpoints.

## Requirements

- Node.js and npm
- Docker with Docker Compose
- Postman (optional)

## 1. Configure the environment

Create a `.env` file in the project root, next to `package.json` and `docker-compose.yml`:

```dotenv
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=change_this_password
DATABASE_NAME=solicitudes_db
PORT=3000
API_KEYS=dev-key-001,dev-key-002
```

Use the same PostgreSQL credentials in Docker Compose. Keep `.env` private and do not commit it to Git.

## 2. Start the database and API

Run these commands from the project root:

```bash
npm install
docker compose up -d
npm run build
npm run start:dev
```

The API runs at `http://localhost:3000`. If the global prefix `api` is enabled, the requests use `/api`, for example `http://localhost:3000/api/solicitudes`.

Stop PostgreSQL without deleting its data:

```bash
docker compose down
```

## Authentication

Send these headers with every protected request:

| Header | Example |
|---|---|
| `x-api-key` | `dev-key-001` |
| `x-user` | `admin1` |

`x-api-key` must match one of the comma-separated values in `API_KEYS`. Example test users:

- `admin1` — administrator
- `supervisor1` — supervisor
- `asesor1` — advisor
- `asesor2` — advisor

These are demo users for testing, not production accounts.

## Test with Swagger

1. Start the database and API.
2. Open `http://localhost:3000/docs`.
3. Click **Authorize** and enter an API key from `API_KEYS`.
4. For each request, provide the `x-user` header with a test username if Swagger does not already show it.
5. Open an endpoint, click **Try it out**, enter the required values/body, then click **Execute**.

## Test with Postman

1. Create a request and use the base URL `http://localhost:3000/api` (if the `api` prefix is enabled).
2. Add the headers `x-api-key: dev-key-001` and `x-user: admin1`.
3. Test these endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/solicitudes` | Create a request |
| `GET` | `/solicitudes` | List requests |
| `GET` | `/solicitudes/1` | Get a request by ID |
| `PATCH` | `/solicitudes/1/estado` | Update its status |

For the POST request, select **Body → raw → JSON** and send:

```json
{
  "cliente": "Acme Ltd.",
  "descripcion": "Prepare a commercial proposal."
}
```

For the PATCH request, send:

```json
{
  "estado": "EN_GESTION"
}
```

Allowed status transitions are `PENDIENTE` → `EN_GESTION` → `RESUELTA`. Replace `1` with an ID returned by the API.

## Architecture

- **Controller:** HTTP endpoints.
- **Service:** business rules, ownership checks, and status transitions.
- **DAO:** TypeORM repository access and database operations.
- **Entity and DTOs:** database mapping and request validation.

## evidency

![](./Captura%20de%20pantalla%202026-10-09%20123605.png)
![](./Captura%20de%20pantalla%202026-10-09%20123741.png)