# Database Design Document
## Personal Finance Management System

---

## 1. Overview

This document describes the database design for a **Personal Finance Management System**.  
The system is intended for personal use and learning purposes, with a strong focus on scalability, maintainability, and clarity.

Primary objectives:
- Track **income and expenses**
- Manage **categories**
- Handle **debts, installments, and credit cards**
- Support **financial reports by time period**
- Allow **future feature expansion** without major refactoring

Technology stack:
- **PostgreSQL** as the relational database
- **TypeORM** for schema management and migrations
- **NestJS** as the backend framework

---

## 2. Design Principles

The database design follows these core principles:

### 2.1 Single Responsibility Principle
Each table represents **one clear business concept**.  
Avoid mixing unrelated responsibilities in a single table.

### 2.2 Normalization (3NF)
- No duplicated data
- No derived or redundant fields
- Relationships are expressed using foreign keys

### 2.3 Data Integrity
- Use foreign key constraints
- Use enums for fixed domain values
- Avoid storing derived or calculated data where possible

### 2.4 Scalability & Extensibility
The schema is designed to:
- Support additional features (budgets, shared wallets, analytics)
- Allow future multi-user or group-based usage
- Minimize breaking changes when extending

---

## 3. Core Entities

### 3.1 User

Represents an authenticated system user.

#### Fields
| Field | Type | Description |
|------|------|-------------|
| id | Integer (PK) | Unique identifier |
| username | String | Unique username |
| email | String | Unique email address |
| password_hash | String | Hashed password |
| created_at | DateTime | Account creation timestamp |

#### Notes
- Passwords must **never** be stored in plain text
- `username` and `email` must be unique

---

### 3.2 Category

Represents a user-defined classification for transactions.

#### Fields
| Field   | Type | Description |
|---------|------|-------------|
| id      | Integer (PK) | Unique identifier |
| user_id | Integer (FK) | Owner of the category |
| name    | String | Category name |
| type    | Enum | INCOME or EXPENSE |
| icon    | String (optional) | UI icon reference |
| color   | String (optional) | |

#### Notes
- Categories are user-specific
- Transaction type is determined by the category type

---

### 3.3 Transaction

Represents a single income or expense record.

#### Fields
| Field | Type | Description |
|------|------|-------------|
| id | Integer (PK) | Unique identifier |
| user_id | Integer (FK) | Owner of the transaction |
| category_id | Integer (FK) | Associated category |
| amount | Integer | Always positive |
| note | String (optional) | Description or note |
| transaction_date | DateTime | Actual transaction date |
| created_at | DateTime | Record creation time |

#### Notes
- The transaction type (income/expense) is inferred from the category
- Amounts should **never be negative**

---

## 4. Debt Management

### 4.1 Debt

Represents a borrowing or lending agreement.

#### Fields
| Field | Type | Description |
|------|------|-------------|
| id | Integer (PK) | Unique identifier |
| user_id | Integer (FK) | Owner |
| name | String | Debt name |
| total_amount | Integer | Total debt value |
| interest_rate | Float (optional) | Interest rate |
| start_date | Date | Start date |
| type | Enum | BORROW or LEND |

---

### 4.2 DebtPayment

Represents an individual payment toward a debt.

#### Fields
| Field | Type | Description |
|------|------|-------------|
| id | Integer (PK) | Unique identifier |
| debt_id | Integer (FK) | Associated debt |
| amount | Integer | Payment amount |
| paid_date | Date | Payment date |

#### Notes
- Debt payments are **not merged** with general transactions
- This allows precise tracking of remaining balances

---

## 5. Credit Card Management

### 5.1 CreditCard

Represents a credit card account.

#### Fields
| Field | Type | Description |
|------|------|-------------|
| id | Integer (PK) | Unique identifier |
| user_id | Integer (FK) | Owner |
| name | String | Card name |
| limit_amount | Integer | Credit limit |
| billing_day | Integer | Statement generation day |
| due_day | Integer | Payment due day |

---

### 5.2 CreditCardTransaction

Represents a transaction made using a credit card.

#### Fields
| Field | Type | Description |
|------|------|-------------|
| id | Integer (PK) | Unique identifier |
| credit_card_id | Integer (FK) | Credit card |
| amount | Integer | Transaction amount |
| transaction_date | Date | Transaction date |
| note | String (optional) | Description |

---

## 6. Relationships Overview

- A **User** can have multiple Categories
- A **User** can have multiple Transactions
- A **Category** can be used in multiple Transactions
- A **Debt** can have multiple DebtPayments
- A **CreditCard** can have multiple CreditCardTransactions

---

## 7. Migration Strategy (Prisma)

### 7.1 Schema Management
- All schema changes must be defined in `schema.prisma`
- Prisma Migrate is used for versioning database changes

### 7.2 Rollback Philosophy
- Traditional rollback is avoided
- Reverting changes is done by **creating a new migration**
- This ensures migration history remains consistent

---

## 8. Performance Considerations

Recommended indexes:
- `transaction_date`
- `user_id`
- Composite index: `(user_id, transaction_date)`

Benefits:
- Faster monthly/yearly reports
- Efficient filtering by user and time range

---

## 9. Extensibility Roadmap

Potential future extensions:
- Budget tracking
- Shared wallets / group accounts
- Recurring transactions
- Advanced analytics & forecasting
- Audit logs

The current schema supports these features without requiring major structural changes.

---

## 10. Conclusion

This database design prioritizes:
- Clarity
- Data integrity
- Maintainability
- Long-term extensibility

It is suitable for both **personal use** and **production-ready applications** with minimal modification.

---
