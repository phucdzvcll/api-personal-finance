# Backend Architecture & Technology Document
## Personal Finance Management System (NestJS)

---

## 1. Purpose

This document describes the **backend architecture**, **technology stack**, and **usage conventions** of the Personal Finance Management System.

The goals of this document are:
- Provide a clear and shared understanding of backend structure
- Explain why each technology and library is used
- Define architectural rules and boundaries
- Serve as a long-term reference for future development and maintenance

This document focuses **only on the Backend (NestJS)**.

---

## 2. Technology Stack Overview

### 2.1 Core Platform

| Technology | Description |
|-----------|-------------|
| Node.js | JavaScript runtime |
| TypeScript | Static typing and scalability |
| NestJS | Backend framework |

NestJS is chosen because it provides:
- Opinionated architecture
- Built-in dependency injection
- Strong modular structure
- Long-term maintainability

---

### 2.2 Database & ORM

| Technology | Description |
|-----------|-------------|
| PostgreSQL | Relational database |
| Prisma ORM | Type-safe database access |

Prisma is used for:
- Centralized schema definition
- Type-safe queries
- Reliable migration system
- Better developer experience

---

### 2.3 API & Communication

| Technology | Description |
|-----------|-------------|
| REST API | Client-server communication |
| JSON | Data exchange format |

---

### 2.4 Authentication & Security

| Technology | Description |
|-----------|-------------|
| JWT | Stateless authentication |
| bcrypt | Password hashing |
| Passport.js | Authentication strategy |

---

### 2.5 Validation & Utilities

| Library | Purpose |
|-------|---------|
| class-validator | Input validation |
| class-transformer | Data transformation |
| @nestjs/config | Configuration management |

---

## 3. Architectural Style

The backend follows a **Modular Layered Architecture**, aligned with NestJS best practices.

---

## 4. Project Structure

```text
src/
├── main.ts
├── app.module.ts
├── modules/
├── common/
├── prisma/
└── config/
```

---

## 5. Module-Based Design

Each business domain is implemented as a **feature module**.

---

## 6. Layer Responsibilities

Controllers handle HTTP, Services handle business logic, Prisma handles data access.

---

## 7. Authentication & Authorization

JWT-based authentication with guards and user scoping.

---

## 8. Validation Strategy

DTO validation at controller level and business validation at service level.

---

## 9. Error Handling

Centralized global exception filters with consistent response format.

---

## 10. Configuration Management

Environment-based configuration with validation at startup.

---

## 11. Logging & Observability

Interceptors for logging and future monitoring integrations.

---

## 12. Security Best Practices

Hashed passwords, token expiration, strict validation.

---

## 13. API Versioning

Versioned REST endpoints (`/api/v1`).

---

## 14. Extensibility Guidelines

Module-first, low coupling, reusable common utilities.

---

## 15. Conclusion

This architecture ensures clarity, scalability, and long-term maintainability.

---
