# SigeCafe - Production Readiness TODO

This document outlines the remaining tasks, broken down atomically and ordered logically, to bring the SigeCafe application to a production-ready state.

## Phase 1: Foundational Backend & Data Structure

1.  **[ ] Define Final Data Models:**
    *   *Description:* Review and confirm all necessary entities (Usuario, Cooperativa, Associado [Produtor/Comprador], Colaborador [Internal Staff?], Transacao, Notificacao, Permissao, PreferenciasUsuario, PrecoCafeHistorico) and their attributes/relationships based on `context.md`. Clarify the exact role/definition of `Colaborador` vs `Associado`.
2.  **[ ] Finalize Prisma Schema (`schema.prisma`):**
    *   *Description:* Translate the confirmed data models into a finalized `schema.prisma` file, defining types, relations (one-to-many, many-to-many), constraints, and indexes.
3.  **[ ] Generate & Apply Final Database Migrations:**
    *   *Description:* Use `prisma migrate dev` (or appropriate command) to generate SQL migrations based on the final schema and apply them to the development database. Ensure migration history is clean.
4.  **[ ] Create Seed Data Script (`prisma/seeds/`):**
    *   *Description:* Develop a script to populate the database with realistic sample data (users with different roles, associados, transactions, coffee prices) for development, testing, and demo purposes. Use `prisma db seed`.
5.  **[ ] Resolve Core Typing Issues:**
    *   *Description:* Fix all outstanding TypeScript errors across the backend codebase, paying special attention to areas identified previously (`CooperativaStore.ts`, API types). Enforce strict type checking (`tsconfig.json`).
6.  **[ ] Standardize Store and API Implementations:**
    *   *Description:* Ensure all Pinia stores and API endpoints follow a consistent pattern using DTOs for type safety and maintainability.

## Phase 2: API Development & Integration

7.  **[ ] Authentication API (`/server/api/auth/`):**
    *   [ ] Implement Telefone/Senha Login Endpoint.
    *   [ ] Implement User Registration Endpoint (if applicable, or handled by Admin).
    *   [ ] Implement Logout Endpoint (token invalidation if using JWT statefully, or client-side removal).
    *   [ ] Implement Password Recovery Request Endpoint (generate & send token/link).
    *   [ ] Implement Password Reset Endpoint (validate token & update password).
    *   [ ] Implement Middleware for Authentication Checks on protected routes.
8.  **[ ] Associado Management API (`/server/api/associado/`):**
    *   *Description:* Admin-only endpoints.
    *   [ ] Implement Create Associado Endpoint (Distinguish Buyer/Seller type).
    *   [ ] Implement Read Associado Endpoint (List with filtering/pagination, Get by ID).
    *   [ ] Implement Update Associado Endpoint.
    *   [ ] Implement Delete Associado Endpoint.
    *   [ ] Ensure proper authorization (Admin role required).
9.  **[ ] Colaborador Management API (`/server/api/colaborador/`):**
    *   *Description:* Admin and Cooperativa-only endpoints for managing internal staff.
    *   [ ] Implement Create Colaborador Endpoint.
    *   [ ] Implement Read Colaborador Endpoint (List with filtering/pagination, Get by ID).
    *   [ ] Implement Update Colaborador Endpoint.
    *   [ ] Implement Delete Colaborador Endpoint (Admin only).
    *   [ ] Ensure proper authorization (Admin and Cooperativa roles).
10. **[ ] Transações API (`/server/api/transacoes/`):**
    *   *Description:* Endpoints for managing transactions between buyers and sellers.
    *   [ ] Implement Create Transação Endpoint (Link Buyer, Seller, record details).
    *   [ ] Implement Read Transação Endpoint (List with filtering by user role/ID, date range, pagination; Get by ID).
    *   [ ] Implement Update Transação Endpoint (Define who can update - Admin? Involved parties?).
    *   [ ] Implement Delete Transação Endpoint (Define who can delete - Admin?).
    *   [ ] Implement role-based access control (Users see their transactions, Admin sees all).
11. **[ ] Permissões/Roles API (`/server/api/permissoes/`):**
    *   *Description:* Admin-only endpoints.
    *   [ ] Implement Read Roles/Permissions Endpoint (List available roles/permissions).
    *   [ ] Implement Assign Role to User Endpoint.
    *   [ ] Implement Remove Role from User Endpoint.
    *   [ ] (Optional) Implement CRUD for the roles/permissions themselves if they are dynamic.
12. **[ ] User Preferences API (`/server/api/preferences/`):**
    *   [ ] Implement Get Preferences Endpoint (for logged-in user).
    *   [ ] Implement Update Preferences Endpoint (Theme, Font Size - for logged-in user).
13. **[ ] Notificacao API (`/server/api/notificacao/`):**
    *   [ ] Implement Get Notifications Endpoint (for logged-in user, unread/all).
    *   [ ] Implement Mark Notification as Read Endpoint (single/all).
    *   [ ] Implement Create Notification Endpoint (for system/Admin triggered notifications).
14. **[ ] Coffee Prices API (`/server/api/coffee-prices/`):**
    *   [ ] Ensure endpoint fetches latest CEPEA/ESALQ data.
    *   [ ] Implement historical data retrieval (if needed for dashboard charts).
    *   [ ] Consider caching mechanism to avoid excessive external calls.

## Phase 3: Frontend UI Implementation & Integration

15. **[ ] Authentication Flow UI (`/app/pages/auth/`, `/app/components/Auth/`):**
    *   [ ] Build Login Form (Telefone/Senha) & integrate with API.
    *   [ ] Build Logout Button/Mechanism & integrate with API.
    *   [ ] Build Password Recovery Request Form & integrate with API.
    *   [ ] Build Password Reset Form & integrate with API.
    *   [ ] Implement routing guards/middleware for protected pages.
16. **[ ] Core App Layout & Navigation (`/app/layouts/`, `/app/components/App/`):**
    *   [ ] Finalize main layout structure (Header, SideNav, Footer).
    *   [ ] Implement dynamic navigation based on user role.
    *   [ ] Integrate User Profile/Logout access in Header.
    *   [ ] Integrate Notification display area (e.g., dropdown in Header).
17. **[ ] Dashboard UI (`/app/pages/app/index.vue` or similar):**
    *   [ ] Integrate Coffee Price display (fetch from `/api/coffee-prices`).
    *   [ ] Design & Implement display for price variation charts (using historical data).
    *   [ ] Define User Performance Benchmark metrics.
    *   [ ] Implement display for user performance benchmarks (fetch relevant data).
    *   [ ] Display summary statistics or recent activity relevant to the user role.
18. **[ ] Transaction Management UI (`/app/pages/app/transacoes/` - New):**
    *   [ ] Build Transaction List View (Table/Cards) with filtering, sorting, pagination.
    *   [ ] Build Create Transaction Form.
    *   [ ] Build Edit Transaction Form (if applicable).
    *   [ ] Build View Transaction Details Page/Modal.
    *   [ ] Integrate all views/forms with Transações API endpoints.
    *   [ ] Implement UI logic based on user role (Admin sees all, users see theirs).
19. **[ ] Associado Management UI (`/app/pages/app/associados/` - New - Admin Only):**
    *   [ ] Build Associado List View (Table/Cards) with filtering, sorting, pagination.
    *   [ ] Build Create Associado Form (Distinguish Buyer/Seller).
    *   [ ] Build Edit Associado Form.
    *   [ ] Integrate all views/forms with Associado Management API endpoints.
20. **[ ] Permissions Management UI (`/app/pages/app/permissoes/` - Admin Only):**
    *   [ ] Build UI to list users and their current roles.
    *   [ ] Build UI to assign/change user roles.
    *   [ ] Integrate with Permissões/Roles API endpoints.
21. **[ ] User Profile & Preferences UI (`/app/pages/app/perfil/`):**
    *   [ ] Display User Information.
    *   [ ] Implement Theme Selector (Light/Dark) & integrate with Preferences API.
    *   [ ] Implement Font Size Selector & integrate with Preferences API.
    *   [ ] Allow editing of profile details (if applicable) & integrate with relevant API.
22. **[ ] Notification Display UI (Integrated into Layout/Header):**
    *   [ ] Display unread notification count.
    *   [ ] Build Notification Panel/Dropdown to list recent notifications.
    *   [ ] Implement "Mark as Read" interaction (single/all) & integrate with API.
23. **[ ] Cooperativa Information Page (`/app/pages/app/cooperativa/` - New):**
    *   [ ] Add static content about the Cooperativa.
    *   [ ] Ensure page is accessible via main navigation.
24. **[ ] Adapt/Remove Residual UI Components:**
    *   [ ] Remove academic-related components under `/app/components/App/Tab/` (Alunos, Turmas, Disciplinas, Ocorrencias).
    *   [ ] Update help page content (`app/pages/app/ajuda.vue`) to remove references to academic contexts.
    *   [ ] Remove or refactor legacy test files like `tests/unit/repositories/AlunoRepository.test.ts`.
    *   [ ] Review and clean up any other components that are not relevant to the coffee trading platform.

## Phase 4: Features & Enhancements

25. **[ ] Reporting Module (`/app/pages/app/relatorios/` - New):**
    *   [ ] Design Report Generation UI (filters for date range, user type, etc.).
    *   [ ] Implement backend logic/API endpoint(s) to aggregate data for reports.
    *   [ ] Integrate UI with backend to display generated reports.
    *   [ ] Implement logic for comparing data between periods.
    *   [ ] Implement PDF Export functionality for reports.
26. **[ ] Iconography Implementation:**
    *   [ ] Select a consistent icon library (e.g., `nuxt-icon` with a specific set like `lucide`).
    *   [ ] Replace placeholder icons and add icons throughout the UI for clarity and visual appeal.
27. **[ ] Global Search (Optional - Post-MVP):**
    *   [ ] Choose and set up a search service (e.g., Algolia, Meilisearch) or implement basic DB search.
    *   [ ] Implement backend API endpoint(s) for searching across relevant models (Transactions, Associados).
    *   [ ] Build Search Bar UI component.
    *   [ ] Integrate UI with search API and display results.
28. **[ ] Climate Information Display (Optional - Post-MVP):**
    *   [ ] Identify reliable API/source for local climate data.
    *   [ ] Implement backend logic to fetch/cache climate data.
    *   [ ] Design and implement UI element (on Dashboard?) to display climate info.

## Phase 5: Quality Assurance, Documentation & Deployment

29. **[ ] Unit & Integration Testing (`/tests/unit/`):**
    *   [ ] Write tests for critical backend utility functions and repository methods.
    *   [ ] Write tests for API endpoint logic (validation, authorization, core functionality).
    *   [ ] Write tests for frontend composables and stores (Pinia).
    *   [ ] Write tests for critical UI components (props, events, slots).
    *   [ ] Configure and aim for adequate code coverage targets.
30. **[ ] End-to-End (E2E) Testing (`/tests/e2e/`):**
    *   [ ] Set up E2E testing framework (e.g., Playwright, Cypress).
    *   [ ] Write E2E tests for critical user flows (Login, Create Transaction, View Dashboard, Admin manages Associado, Generate Report).
31. **[ ] Full Responsiveness Testing:**
    *   *Description:* Manually test UI on various viewport sizes (Chrome DevTools, real devices if possible). Fix layout bugs for desktop, tablet, and mobile.
32. **[ ] Accessibility Audit & Fixes:**
    *   [ ] Perform checks using browser tools (Lighthouse, Axe DevTools).
    *   [ ] Test keyboard-only navigation through the entire application.
    *   [ ] Test with a screen reader (e.g., NVDA, VoiceOver).
    *   [ ] Verify sufficient color contrast ratios.
    *   [ ] Ensure ARIA attributes are used correctly where needed.
    *   [ ] Fix any identified accessibility issues.
33. **[ ] Documentation:**
    *   [ ] Update `README.md` (setup, run, build, test instructions, environment variables).
    *   [ ] Review and update `context.md` if project scope/goals evolved.
    *   [ ] Generate API documentation (e.g., using Swagger/OpenAPI if annotations were added).
    *   [ ] Add high-level architecture overview document if helpful.
34. **[ ] Production Build & Optimization:**
    *   [ ] Configure Nuxt build options for production (minification, tree-shaking).
    *   [ ] Analyze bundle size and optimize where possible.
35. **[ ] Logging & Monitoring Setup:**
    *   [ ] Integrate a logging library for backend API logs.
    *   [ ] Set up basic monitoring (uptime, resource usage) in Coolify or external service.
    *   [ ] Consider client-side error tracking (e.g., Sentry).
36. **[ ] Deployment Environment Configuration (Coolify):**
    *   [ ] Define production environment variables (database URL, API keys, secrets).
    *   [ ] Configure production database service.
    *   [ ] Configure Coolify deployment source (Git repo, branch).
    *   [ ] Set up build packs or Dockerfile (`Dockerfile`, `docker-compose.yaml`) for the Nuxt app.
    *   [ ] Configure necessary network settings and domains.
37. **[ ] Staging Deployment & UAT:**
    *   [ ] Deploy the application to a staging environment mirroring production.
    *   [ ] Perform thorough testing in staging.
    *   [ ] Conduct User Acceptance Testing (UAT) with key stakeholders (Cooperativa representative).
38. **[ ] Production Deployment & Monitoring:**
    *   [ ] Execute the production deployment via Coolify.
    *   [ ] Monitor initial application logs and performance metrics closely.
    *   [ ] Have a rollback plan ready if needed.

---
*Self-Note: This list attempts to be comprehensive based on `context.md`. Adjust based on ongoing decisions.*
