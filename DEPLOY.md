# Deployment Guide for KSVC Connect

This guide provides instructions for deploying the KSVC Connect application using Docker or manual Node.js setup.

## Prerequisites

- **Docker** and **Docker Compose** (recommended)
- OR **Node.js** (v18+) and **PostgreSQL** (v14+)

## Option 1: Docker Deployment (Recommended)

1.  **Configure Environment Variables**:
    -   Copy `backend/.env.example` to `backend/.env` and update values.
    -   Copy `frontend/.env.production` to `frontend/.env` and update values.

2.  **Build and Run**:
    ```bash
    docker-compose up --build -d
    ```

3.  **Access the Application**:
    -   Frontend: `http://localhost:3000`
    -   Backend API: `http://localhost:4001`

## Option 2: Manual Deployment

### Backend

1.  Navigate to `backend` directory.
2.  Install dependencies: `npm install --production`
3.  Set environment variables (see `backend/.env.example`).
4.  Run Prisma migrations: `npx prisma migrate deploy`
5.  Start the server: `npm start`

### Frontend

1.  Navigate to `frontend` directory.
2.  Install dependencies: `npm install`
3.  Set environment variables (see `frontend/.env.production`).
4.  Build the app: `npm run build`
5.  Serve the `dist` folder using a static server (e.g., `serve -s dist` or Nginx).

## Production Considerations

-   **HTTPS**: Ensure SSL certificates are configured.
-   **Database**: Use a managed PostgreSQL database service for better reliability.
-   **Security**: Change all default passwords and secrets in `.env` files.
-   **Backups**: Regularly backup your PostgreSQL database.

## Troubleshooting

-   **403 Forbidden**: Ensure your user role is correct. If using mock auth, check `AuthContext.jsx`.
-   **Connection Refused**: Check if the database container is healthy and ports are correctly mapped.
