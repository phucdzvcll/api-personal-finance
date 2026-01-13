# TypeORM Usage & Architecture Document  
## Personal Finance Management System (NestJS)

---

## 1. Purpose

This document describes how **TypeORM** is used within the backend system, including:
- The role of TypeORM in the architecture
- How entities, repositories, and migrations are organized
- Best practices and conventions when working with TypeORM

This document serves as a **long-term technical reference** for developers working on the backend.

---

## 2. Why TypeORM

TypeORM is chosen as an ORM for the following reasons:

- Tight integration with NestJS
- Decorator-based entity definitions
- Strong support for PostgreSQL
- Active ecosystem and documentation
- Supports both Data Mapper and Active Record patterns

In this project, **Data Mapper pattern** is used.

---

## 3. Role of TypeORM in Backend Architecture

TypeORM belongs to the **Data Access Layer**.

```text
Controller → Service → Repository (TypeORM) → PostgreSQL
```

Responsibilities:
- Map database tables to TypeScript classes
- Execute database queries
- Manage transactions
- Handle migrations

TypeORM does **not** contain business logic.

---

## 4. Project Structure with TypeORM

```text
src/
├── database/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── transaction.entity.ts
│   │   └── category.entity.ts
│   │
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   └── transaction.repository.ts
│   │
│   ├── migrations/
│   └── database.module.ts
```

---

## 5. Entity Design

### 5.1 Entity Responsibilities

Entities:
- Represent database tables
- Define column types and constraints
- Define relationships

Rules:
- No business logic
- No service calls
- Minimal helper methods only

---

### 5.2 Example Entity

```ts
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 6. Repository Pattern

Repositories encapsulate database queries.

Responsibilities:
- Query construction
- Data persistence
- Transaction boundaries

Rules:
- One repository per entity
- No business logic
- Always scoped by user ownership where applicable

---

## 7. Using Repositories in Services

Services inject repositories via dependency injection.

```ts
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}
}
```

Rules:
- Services never access `DataSource` directly
- All DB access goes through repositories

---

## 8. Transaction Management

Transactions are handled using `QueryRunner`.

Guidelines:
- Use transactions for multi-step operations
- Keep transactions short
- Avoid nested transactions

---

## 9. Migration Strategy

### 9.1 Migration Rules

- Never modify an existing migration
- Always create a new migration for schema changes
- Migrations must be committed to source control

---

### 9.2 Migration Commands

```bash
typeorm migration:generate
typeorm migration:run
typeorm migration:revert
```

---

## 10. Naming Conventions

### Tables
- snake_case
- plural nouns

### Columns
- snake_case
- descriptive names

### Entities
- PascalCase
- Singular nouns

---

## 11. Performance Best Practices

- Use indexes on frequently queried columns
- Avoid eager loading by default
- Use pagination for list queries
- Prefer query builder for complex queries

---

## 12. Error Handling

- Database errors are translated into application-level exceptions
- No raw database errors are exposed to clients
- Use try/catch at service level when needed

---

## 13. Configuration

TypeORM configuration is handled via:
- Environment variables
- Centralized config module

Example:
```ts
TypeOrmModule.forRootAsync(...)
```

---

## 14. Extensibility Guidelines

When adding new entities:
1. Create entity file
2. Create repository
3. Register in database module
4. Write migration
5. Update related services

---

## 15. Conclusion

TypeORM provides:
- A clear data access abstraction
- Strong integration with NestJS
- Flexible querying capabilities

When used with strict architectural rules, it ensures:
- Maintainable codebase
- Predictable data flow
- Scalable backend architecture

---
