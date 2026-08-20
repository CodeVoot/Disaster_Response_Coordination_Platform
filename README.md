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
   
   - Routes & Middleware: Handles endpoints, auth token validation, and Role-Based Access Control (RBAC).
   - Controllers: Parses/validates incoming data (using Zod) and formats HTTP responses.
   - Services: Contains the core business logic, caching, and external API calls.
   - Database: Direct queries using pg to maximize PostGIS performance.
   - Real-Time: Socket.IO server attached to Express to broadcast mutation events.
  
5. **Technical Decisiions**

   - Database & Geospatial: I chose PostgreSQL with PostGIS. Doing radius math (Haversine) in Node.js for thousands of points is slow. PostGIS uses GIST spatial indexes to offload this math       to the database layer, making geospatial queries extremely fast.
   
   - Caching: Used node-cache (in-memory) for the external API integration. It caches external reports with a TTL to prevent third-party rate limits and reduce latency.
   
   - External API Failures: Wrapped external fetches in a try/catch. If the third-party API times out or fails, the endpoint gracefully degrades—returning the disaster data with an empty          reports array instead of crashing.
  
6. **Tradeoffs and Simplification**
   To focus on core functionality and keep local setup simple, I made a few shortcuts:

      - Authentication: Skipped building a full JWT/bcrypt user system. I used hardcoded mock tokens (admin-secret-token) to demonstrate RBAC middleware without the database overhead.
      - Caching Infrastructure: Used in-memory caching instead of Redis so reviewers don't need to spin up a Redis Docker container to test the app.
  
7. **AI Usage**
   - Tool used: Google Gemini
   - What it helped with: Generating initial boilerplate (like jest.config.js and TypeScript setup) and resolving a few strict TS type mismatch errors.
   - What was manually implemented: The system design, database schema, PostGIS query logic, RBAC implementation, and overall service architecture.
