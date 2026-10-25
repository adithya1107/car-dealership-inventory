# AI Prompt Logs

Raw, unedited conversations with Claude (claude.ai). Nothing in this file is summarised.


Share links: one per session below. Full text is included as a backup in case a link breaks.

---

## Session 1: Understanding the assessment

**Me:**

```
TDD Kata: Car Dealership Inventory System
[TODO: paste the complete assessment text exactly as you sent it]

I'm doing a TDD assessment: a car dealership inventory system. Backend is Node + TypeScript + Express 5 + Prisma 6 with MongoDB, Jest and Supertest for tests. Frontend is React + Vite + Tailwind v4 + Vitest. I'll ask phase by phase. For every file, give me the full code, then the commands to run, then the git commits I should make. Write the failing tests first as a "red" commit, then the code as a "green" commit. Commit messages should be conventional commits with a Co-authored-by trailer after two blank lines. Don't add anything I didn't ask for.
```

**Claude:**

You’re building a full-stack Car Dealership Inventory System using Test-Driven Development, while being fully transparent about how you use AI. The evaluators care about three things at once: working software, a disciplined process (visible in Git history), and honest, thoughtful AI usage.

1. The Backend (REST API)

Stack (pick one): Node.js/TypeScript (Express or NestJS), Python (Django or FastAPI), or Ruby (Rails).

Database: A real database MongoDB. An in-memory DB is explicitly not accepted.

Authentication: Register and login, with JWT or similar token-based auth protecting certain endpoints.

Endpoints:

Area	Endpoint	Notes
Auth	POST /api/auth/register, POST /api/auth/login	Public
Vehicles	POST /api/vehicles	Protected, add vehicle
	GET /api/vehicles	Protected, list available vehicles
	GET /api/vehicles/search	Search by make, model, category, price range
	PUT /api/vehicles/:id	Update details
	DELETE /api/vehicles/:id	Admin only
Inventory	POST /api/vehicles/:id/purchase	Decreases quantity
	POST /api/vehicles/:id/restock	Increases quantity, Admin only

Vehicle fields: unique ID, make, model, category, price, quantity in stock.

Note that you need role-based access (admin vs. regular user), even though the spec doesn’t spell out how admins are created. You’ll need to decide that yourself (e.g., a role field, a seed script).

2. The Frontend

Stack (mandatory): HTML5, CSS3, Tailwind, and React, as a single-page app.

Required features:

Registration and login forms
Dashboard showing all available vehicles
Search and filter
A Purchase button per vehicle, disabled when quantity is 0
Admin-only UI to add, update, and delete vehicles

Design: They explicitly want creativity: visually appealing, responsive, good UX. This is where you can stand out.

3. Process Requirements (this is where many people lose points)

TDD: Write tests before the code. Your commit history should visibly show Red → Green → Refactor (failing test commit, passing implementation commit, cleanup commit), especially on the backend. Aim for high coverage with meaningful tests.

Clean code: Follow SOLID, use clear naming, add meaningful comments, and keep code readable and maintainable.

Git: Frequent commits with descriptive messages that tell the story of your development.

AI usage policy (important):

Using AI is encouraged, but you must be transparent.
Every commit where AI helped needs a co-author trailer at the end of the message, after two blank lines:
  Co-authored-by: AI Tool Name <AI@users.noreply.github.com>
Your README needs a detailed “My AI Usage” section covering which tools you used, how you used them, and your reflection on the impact.
You’ll be asked about it in the interview.
4. Deliverables Checklist
 Public Git repo (GitHub/GitLab)
 README.md containing:
 Project explanation
 Local setup instructions (backend and frontend)
 Screenshots of the working app
 “My AI Usage” section
 Test report (test results, ideally with coverage)
 PROMPTS.md in the repo root with raw, unedited AI chat logs or public share links (no AI-written summaries)
 (Optional bonus) Live deployment on Vercel, Netlify, Heroku, AWS, etc.
...
---

## Session 2: Phase 1, backend scaffolding


**Me:**

```
Let's start phase 1, backend scaffolding, in /backend. Set up TypeScript, Express, Jest with ts-jest and Supertest, and Prisma with MongoDB. Prisma needs a User model (email unique, passwordHash, role defaulting to USER) and a Vehicle model (make, model, category, price in cents, quantity). Then do a health check endpoint at /api/health the TDD way, with the failing test first. Keep app.ts and server.ts separate. Give me every file, the commands, and the commits in order.
```

**Claude:[SUMMARISED RESPONSE]**

By the end you’ll have a TypeScript + Express backend with Jest and Supertest, a Prisma + MongoDB database with migrations, and a health-check endpoint built with red→green TDD. It should take about 1-2 hours and produce 6 commits.

Phase 1: Backend scaffolding (~1-2 hours)
bash
cd backend
npm init -y
npm i express zod bcrypt jsonwebtoken @prisma/client cors dotenv
npm i -D typescript ts-node-dev jest ts-jest supertest prisma \
  @types/express @types/node @types/jest @types/supertest \
  @types/bcrypt @types/jsonwebtoken
npx tsc --init
npx ts-jest config:init
npx prisma init --datasource-provider 

Architecture (this is what shows SOLID):

src/
  app.ts              # builds the Express app (no listen)
  server.ts           # calls app.listen
  config/
  middleware/         # authenticate.ts, requireRole.ts, errorHandler.ts
  modules/
    auth/       auth.routes.ts, auth.controller.ts, auth.service.ts, auth.schema.ts
    vehicles/   vehicle.routes.ts, controller, service, repository, schema
  errors/       AppError classes (NotFound, Forbidden, OutOfStock...)
tests/
  auth.test.ts, vehicles.test.ts, inventory.test.ts, search.test.ts
Routes → Controller → Service → Repository. Controllers handle HTTP only, services hold business rules, and the repository talks to Prisma. This gives you single responsibility and dependency inversion, which you can unit-test with a mocked repository.
Separate app.ts and server.ts so Supertest can import the app.
Use a separate test database (DATABASE_URL=file:./test.db in .env.test), and reset tables in beforeEach.

Prisma schema:

prisma
model User {
  id           String @id @default(uuid())
  email        String @unique
  passwordHash String
  role         String @default("USER") // USER | ADMIN
}
model Vehicle {
  id       String @id @default(uuid())
  make     String
  model    String
  category String
  price    Int      // cents
  quantity Int @default(0)
  createdAt DateTime @default(now())
}

Commit: chore: scaffold backend with TypeScript, Jest, Prisma



---

## Session 3: Phase 2, backend features via TDD

**Me:**

```
Now phase 2, the backend features, all TDD (red commit, green commit, refactor where it makes sense). I want: a central error handler with a consistent { error: { code, message } } format, register and login with JWT, authenticate and requireRole middleware, vehicle CRUD (create, update, delete and restock are admin only, anyone logged in can list, search and purchase), search by make/model/category/price range, and purchase and restock. Registration must never let someone make themselves admin, and login errors should be identical for a wrong password and an unknown email. Purchase must never oversell. Write the naive version first, then a concurrency test that fails, then fix it with an atomic update. Also add a seed script with an admin user and about 15 sample cars, and a coverage threshold around 85%. Use layers: routes, controller, service, repository.
```

**Claude:[SUMMARISED RESPONSE]**

Phase 2: Backend features via strict TDD

For every feature, make three commits:

Step	Commit message example
🔴 Red	test: add failing tests for user registration
🟢 Green	feat: implement user registration
🔵 Refactor	refactor: extract password hashing into its own service

Only the red commit should have failing tests. Never bundle tests and implementation in one commit.

2.1 Auth

Red tests to write:

Register with valid data returns 201, and the response has no password hash
Duplicate email returns 409
Invalid email or short password returns 400
Login with correct credentials returns 200 and a JWT
Wrong password or unknown email returns 401 (same message for both, to avoid user enumeration)
Registering with role: "ADMIN" in the body does not create an admin
2.2 Auth middleware
No token returns 401, a malformed or expired token returns 401
requireRole('ADMIN') returns 403 for a USER and passes for an ADMIN
2.3 Vehicle CRUD
POST /api/vehicles: 201 with valid data, 400 for a negative price or quantity, 401 without a token
GET /api/vehicles: returns vehicles, requires a token, supports pagination
PUT /api/vehicles/:id: updates, 404 if missing, 400 if invalid
DELETE /api/vehicles/:id: admin only, so 403 for a user, 204 for an admin, 404 if missing
2.4 Search

GET /api/vehicles/search?make=&model=&category=&minPrice=&maxPrice=

Each filter alone, filters combined, case-insensitive partial match
Price range is inclusive, minPrice > maxPrice returns 400, no match returns an empty array (not an error)
Define search route before /:id routes, or Express will treat “search” as an ID.
2.5 Purchase and restock
Purchase decrements quantity by 1 (optionally accept { quantity: n })
Purchase at quantity 0 returns 409 or 400 with a clear message, and quantity never goes negative
Purchase of a nonexistent vehicle returns 404
Restock is admin only (403 for a user), amount must be a positive integer, and quantity increases
Concurrency test: fire 5 parallel purchases at a vehicle with quantity 3. Exactly 3 should succeed and quantity should end at 0.
Implement atomically, not read-then-write:
ts
  const result = await prisma.vehicle.updateMany({
    where: { id, quantity: { gte: amount } },
    data: { quantity: { decrement: amount } },
  });
  if (result.count === 0) throw new OutOfStockError();
2.6 Cross-cutting
Central error handler returning consistent JSON ({ error: { code, message } })
Zod validation middleware
Rate limiting on login (optional bonus)
Seed script: npm run seed creates an admin plus ~15 sample vehicles

Check coverage with jest --coverage and aim for 85%+ on services and controllers.

---

## Session 4: Phase 3, frontend

**Me:**

```
[Uploaded images: Component.png, Home.png]

Now phase 3, the frontend, in /frontend with React, Vite, TypeScript and Tailwind v4. I've attached my Figma design, so please make the landing page match it. Pages I need: login, register, a protected inventory page with search and filters (kept in the URL, debounced), pagination, and a Purchase button that's disabled when stock is 0. Admins also get add, edit, restock and delete with a modal form and a confirm dialog. Prices come from the API in cents. Do the tests first for the price formatting, the login form, the protected route and the vehicle card (Vitest, Testing Library, MSW). Give me full files, in order, with commits.
```

**Claude:[SUMMARISED RESPONSE]**

Phase 3: Frontend (~1.5-2 days)
bash
cd frontend
npm create vite@latest . -- --template react-ts
npm i react-router-dom axios
npm i tailwindcss @tailwindcss/vite   # follow current Tailwind + Vite docs
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom msw

Structure:

src/
  api/          client.ts (axios + token interceptor), auth.ts, vehicles.ts
  context/      AuthContext.tsx (user, token, login, logout)
  components/   VehicleCard, SearchFilters, VehicleForm, ConfirmDialog, Navbar, Toast
  pages/        Login, Register, Dashboard, (Admin panel or admin controls on Dashboard)
  routes/       ProtectedRoute.tsx, AdminRoute.tsx

Build in this order:

Tailwind working, then base layout and navbar
Auth context, then Login and Register pages with validation and error messages
Protected routes (redirect to login if there’s no token)
Dashboard with a responsive grid of VehicleCards (image placeholder, make/model, category badge, price, “X in stock”)
Search and filter bar (make, model, category dropdown, min/max price), debounced, synced to URL query params
Purchase button: disabled and labeled “Out of Stock” when quantity is 0, with a loading state, a toast on success or failure, and an optimistic or refetched quantity update
Admin UI (shown only if user.role === 'ADMIN'): Add/Edit modal with a form, Delete with a confirm dialog, and a Restock input
Polish: loading skeletons, empty state (“No vehicles match”), dark/light feel, hover animations, mobile-first layout, accessible labels and focus states

Important: hiding admin buttons is only UX. The backend is the real enforcement, which you already test.

A few frontend tests are worthwhile: the Purchase button is disabled at quantity 0, admin controls are hidden for users, and the login form shows errors (use Vitest + Testing Library + MSW).

Commit per component or feature, with small commits.

---

## Session 5: Phase 4, finishing deliverables

**Me:**

```
Now phase 4, documentation. Help me write the README with an overview, setup steps, API table, design decisions, a TDD section, the test report, screenshots and a "My AI Usage" section. I'll paste my real coverage output, my git log and my notes on what went wrong. Please don't invent any numbers, commit hashes or stories, and use TODO where you don't have the facts. Also make a PROMPTS.md skeleton with one section per chat, where I'll paste the raw conversations myself.
```

**Claude:[SUMMARISED RESPONSE]**

Phase 4: Documentation and deliverables (~half a day)

README must contain:

Project overview and features
Tech stack and architecture diagram or folder tree
Setup instructions that work from a fresh clone:
   cd backend && cp .env.example .env && npm i
   npx prisma migrate dev && npm run seed && npm run dev
   cd frontend && cp .env.example .env && npm i && npm run dev

Include the seeded admin credentials.
4. API reference table (endpoints, auth requirement, request and response examples)
5. Design decisions (the ambiguities from Phase 0)
6. Screenshots: login, dashboard, search results, out-of-stock card, admin forms, mobile view
7. Test report: paste the Jest output and coverage table (or a screenshot), and include the frontend test results
8. “My AI Usage”: tools used, specific examples of how you used them (e.g., “generated boilerplate for the repository layer, then rewrote the purchase logic myself after finding a race condition”), and an honest reflection covering where AI helped, where it was wrong, and what you verified

PROMPTS.md: raw logs or links only, no summaries.

Test the setup instructions by cloning your repo to a fresh folder and following the README exactly.

---

## Session 6: Phase 5, deployment


**Me:**

```
Last one, phase 5, deployment. I want the frontend on Vercel, the backend on Railway. Guide me through the deployment.
```

**Claude:[SUMMARISED RESPONSE]**

Phase 5: Optional deployment (bonus)
Frontend on Vercel or Netlify (set VITE_API_URL)
Backend on Railway, using Mongodb.
Add the live link at the top of the README, and enable CORS for your frontend’s domain.

---

