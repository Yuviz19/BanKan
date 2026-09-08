# BanKan — V1 Product Requirements Document (PRD)

**Document Version:** 1.0  
**Status:** Approved for Implementation  
**Target Architecture:** Modular Monolith (Node.js / Express / MongoDB)  

---

## 1. Product Vision & Executive Summary

BanKan is a streamlined, collaborative Kanban and project-management platform designed for small teams and developers. It provides a structured workspace where teams can create organizations, manage project workflows visually, assign responsibilities, and collaborate directly on tasks.

### Core Value Proposition
Go from *"We need to organize this project"* to *"Everyone knows what they are working on, what is pending, and what is completed"* with zero onboarding friction.

### Explicitly Out of Scope for V1
To guarantee a solid foundation and fast shipping, the following features are deferred to V2+:
- Real-time WebSockets / Chat channels
- WebRTC Audio/Video calls
- Complex Gantt charts / Time tracking
- Native Email or Push notifications (In-app history only)
- AI assistants / Third-party app integrations

---

## 2. Platform Architecture & Data Topology

BanKan follows a **Modular Monolith** pattern. Permission checks are enforced strictly at the API layer based on Organization-level memberships.

```
User ───────┐
            ├──< Membership >─── Organization
User ───────┘                        │
                                     └─── Project (contains embedded Columns)
                                            │
                                            └─── Card
                                                  │
                                                  ├─── Comment
                                                  └─── Activity
                                                  
Invitations (standalone onboarding lifecycle)
```

---

## 3. Core Systems & Requirements

### 3.1 Authentication & Session Management
- **Registration:** Accepts `name`, `email`, and `password`. Passwords must be hashed using `bcrypt` or `Argon2`.
- **JWT Strategy:** 
  - **Access Token:** Short-lived (e.g., 15 mins) for stateless API route protection.
  - **Refresh Token:** Long-lived (e.g., 7 days) stored securely to issue new access tokens.
- **User Profile:** Support profile updates (`name`, `avatar` via Cloudinary), password changes, and explicit session invalidation (`/logout`).

---

### 3.2 Organizations & Authorization Model
Organizations act as the top-level isolation boundary for teams.

#### Roles & Permissions Matrix
| Action | Owner | Admin | Member |
| :--- | :---: | :---: | :---: |
| Edit / Delete Organization | ✓ | ✗ | ✗ |
| Invite / Remove Members | ✓ | ✓ | ✗ |
| Change Member Roles | ✓ | ✗ | ✗ |
| Create / Delete Projects | ✓ | ✓ | Configurable |
| Manage Columns & Cards | ✓ | ✓ | ✓ |
| Comment & View History | ✓ | ✓ | ✓ |

#### Onboarding & Invitations
1. Admin generates an invite specifying target `email` and initial `role`.
2. System generates a secure, unique token (`expiresAt` = 48 hours).
3. Target user accepts via invitation link (`/invite/<token>`).
4. Invitation states: `PENDING`, `ACCEPTED`, `EXPIRED`, `CANCELLED`.

---

### 3.3 Projects & Board Workflows
- Projects belong to exactly one Organization.
- For V1 simplicity, **Project and Board are unified**: each Project manages its own set of workflow states directly via embedded `columns`.

#### Column Management
- Default column configuration on creation: `TODO`, `IN PROGRESS`, `DONE`.
- Dynamic actions: Create, rename, delete, and reorder (`position` numeric ordering).

---

### 3.4 Cards (Tasks)
The atomic unit of work within BanKan.

- **Attributes:** `title`, `description`, `columnId`, `position`, `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), `dueDate`, `assignedTo`, `createdBy`.
- **Card Operations:**
  - Create, view, update, and soft/hard delete.
  - **Card Movement:** Moving a card between columns updates its `columnId` and `position`. Server remains authoritative on state validation.
  - **Assignment Validation:** An assignee *must* have an active `Membership` within the project's parent Organization.

---

### 3.5 Collaboration & Audit Stream

#### Card Comments
- Authors can create, edit, and delete their own comments.
- Organization Owners/Admins retain moderation deletion rights.

#### Activity History (Audit Log)
- Immutable event stream logging critical project actions:
  - Card movement (`CARD_MOVED`: column A → column B)
  - Assignments (`CARD_ASSIGNED`)
  - Priority changes (`PRIORITY_CHANGED`)
- Serves as the primary feed for team visibility and in-app notifications.

---

## 4. API Endpoints Specification

All protected routes require a valid `Bearer <Access_Token>` in the authorization header.

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/users/me
PATCH  /api/v1/users/me
PATCH  /api/v1/users/me/password

POST   /api/v1/organizations
GET    /api/v1/organizations
GET    /api/v1/organizations/:id
PATCH  /api/v1/organizations/:id
DELETE /api/v1/organizations/:id

GET    /api/v1/organizations/:id/members
PATCH  /api/v1/organizations/:id/members/:memberId
DELETE /api/v1/organizations/:id/members/:memberId

POST   /api/v1/invitations
POST   /api/v1/invitations/:token/accept
DELETE /api/v1/invitations/:id

POST   /api/v1/projects
GET    /api/v1/projects?organizationId=:id
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id

PATCH  /api/v1/projects/:id/columns/reorder

POST   /api/v1/cards
GET    /api/v1/cards/:id
PATCH  /api/v1/cards/:id
DELETE /api/v1/cards/:id
PATCH  /api/v1/cards/:id/move

GET    /api/v1/cards/:id/comments
POST   /api/v1/cards/:id/comments
PATCH  /api/v1/comments/:id
DELETE /api/v1/comments/:id

GET    /api/v1/activities?projectId=:id
GET    /api/v1/search?q=:query
```

---

## 5. Security & Non-Functional Requirements

1. **Strict Authorization Checks:** Controllers must verify user membership and permissions on every protected resource request.
2. **Input Validation:** All incoming payloads must be strictly validated (e.g., using Zod schemas) before hitting service layers.
3. **Rate Limiting:** Mandatory strict limits on sensitive endpoints (`/auth/login`, `/auth/register`, `/auth/refresh`).
4. **Pagination:** Cursor-based pagination (`limit`, `cursor`) implemented for heavy collections (`Cards`, `Comments`, `Activities`).
5. **Standardized Error Handling:** All API errors follow a uniform contract:
   ```json
   {
     "success": false,
     "statusCode": 403,
     "message": "You do not have permission to modify this resource"
   }
   ```

---

## 6. Phase Implementation Plan

1. **Phase 1: Foundation & Infrastructure**
   Setup Express server, MongoDB connection, global error handler, Zod middleware, and logging configuration.

2. **Phase 2: Authentication & User Profiles**
   Implement registration, login, double JWT token rotation, bcrypt hashing, avatar uploading, and user profile endpoints.

3. **Phase 3: Organizations & Access Control**
   Build Organization CRUD, Membership relationships, RBAC middleware, and invitation token generation/acceptance.

4. **Phase 4: Projects & Kanban Core**
   Implement Project creation, embedded column structures, Card CRUD, card movement logic, and position re-ordering algorithms.

5. **Phase 5: Collaboration & Audit Stream**
   Add card comment threads, event logging for activity tracking, and basic MongoDB text-indexed search.

6. **Phase 6: Hardening & Testing**
   Add MongoDB query indexes, rate-limiting rules, cursor pagination, unit/integration test suites, and Dockerization.
