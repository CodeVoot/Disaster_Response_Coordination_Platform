# Disaster Response Coordination API

A real-time REST API for disaster response coordination, built with Node.js, Express, and PostgreSQL. 

## Setup 

**Prerequisites:** Node.js (v18+) and PostgreSQL with **PostGIS** enabled.

1. **Environment:**
   ```bash
   cp .env.example .env

(Update .env with your local Postgres credentials).

2. **Install & Run:**
   npm install
   npm run dev

3. **Testing command:**
npx jest

4. **Architecture**

I went with a clean layered monolithic structure to separate concerns:

Routes & Middleware: Handles endpoints, auth token validation, and Role-Based Access Control (RBAC).

Controllers: Parses/validates incoming data (using Zod) and formats HTTP responses.

Services: Contains the core business logic, caching, and external API calls.

Database: Direct queries using pg to maximize PostGIS performance.

Real-Time: Socket.IO server attached to Express to broadcast mutation events.
