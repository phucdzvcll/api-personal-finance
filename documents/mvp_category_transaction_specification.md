# MVP – Category Module Specification

## 1. Document Purpose
This document defines the **Category module** for the MVP phase of the Personal Finance App.

It is written from a **Business Analyst (BA)** and **Project Manager (PM)** perspective and focuses on:
- Business rules
- Functional requirements
- Delivery milestones

---

## 2. Business Definition
A **Category** represents the purpose (expense) or source (income) of money.

Examples:
- Expense: Food, Transportation, Shopping
- Income: Salary, Bonus

Categories provide semantic meaning to transactions and are mandatory.

---

## 3. Category Attributes

| Field | Type | Required | Description |
|-----|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| name | String | Yes | Category name |
| type | Enum | Yes | income / expense |
| icon | String | No | Icon identifier |
| color | String | No | Display color |
| createdAt | DateTime | Yes | Creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |

---

## 4. Business Rules
1. Category name must be unique **per user and per type**
2. Category type cannot be changed after creation
3. Income categories cannot be used for expense transactions and vice versa
4. A category cannot be deleted if it is used by any transaction
5. Default categories must be created for every new user

---

## 5. Default Categories (MVP)

### Expense
- Food
- Transportation
- Shopping
- Others

### Income
- Salary
- Other Income

---

## 6. Functional Requirements

### 6.1 Create Category
- User can create a new category
- Required fields: name, type
- Optional fields: icon, color

### 6.2 Update Category
- User can update name, icon, color
- Category type cannot be changed

### 6.3 Delete Category
- Allowed only if no transactions reference the category

### 6.4 List Categories
- User can list categories by type (income / expense)

---

## 7. Milestone – Category Module

### Goal
Establish a stable category system as the foundation for transactions.

### Tasks
- Design database table
- Implement CRUD APIs
- Seed default categories
- Implement basic UI (list + form)

### Deliverables
- Category CRUD working end-to-end
- Business rules fully enforced

---

---

# MVP – Transaction Module Specification

## 1. Document Purpose
This document defines the **Transaction module** for the MVP phase of the Personal Finance App.

It is written from a **Business Analyst (BA)** and **Project Manager (PM)** perspective and focuses on:
- Core financial flow
- Validation rules
- Delivery milestones

---

## 2. Business Definition
A **Transaction** represents a single financial movement.

Types:
- Income
- Expense

Each transaction:
- Has exactly one category
- Has one monetary amount
- Occurs at a specific date

---

## 3. Transaction Attributes

| Field | Type | Required | Description |
|-----|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| amount | Decimal | Yes | Must be > 0 |
| type | Enum | Yes | income / expense |
| categoryId | UUID | Yes | Linked category |
| transactionDate | DateTime | Yes | Date of transaction |
| note | String | No | User note |
| createdAt | DateTime | Yes | Creation timestamp |
| updatedAt | DateTime | Yes | Last update timestamp |

---

## 4. Business Rules
1. Amount must be greater than zero
2. Transaction type must match the category type
3. Transaction date cannot be in the future (MVP constraint)
4. Editing a transaction must preserve data integrity
5. Deleting a transaction must not affect other records

---

## 5. Functional Requirements

### 5.1 Create Transaction
- User can create income or expense
- Category must be valid and match type

### 5.2 Update Transaction
- User can update amount, category, date, note

### 5.3 Delete Transaction
- User can delete a transaction permanently

### 5.4 List Transactions
- Filter by date range
- Filter by type

---

## 6. Milestone – Transaction Module

### Goal
Enable users to track daily income and expenses reliably.

### Tasks
- Design database table
- Implement CRUD APIs
- Apply validation rules
- Build UI for list and add/edit

### Deliverables
- Transactions recorded correctly
- Data integrity rules enforced

---

## 7. Dependency
- Category module must be completed before Transaction module
