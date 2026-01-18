# Audit Log for Transactions (NestJS Backend)

## 1. What is an Audit Log?
An Audit Log is a mechanism used to record **the history of changes made to important data** in a system.  
It helps answer the following questions:

- Who performed the action?
- What entity was affected?
- What exactly changed (before vs after)?
- When did it happen?
- (Optional) From where did the action originate?

In a **personal finance / expense management system**, audit logs are critical because:
- The data represents **money**
- Reports must be explainable and traceable
- Bugs or incorrect balances must be debuggable
- The system may later evolve into multi-user or SaaS

---

## 2. When Should You Use Audit Logs?
Not every table or action needs to be audited.

### SHOULD be audited:
- Transactions (income / expense)
- Wallets (balance-related changes)
- Categories (affects reports)

### OPTIONAL / NOT required:
- Authentication logs
- Read-only operations
- Temporary or derived data

---

## 3. Audit Scope for Transactions

### Actions to track:
- CREATE_TRANSACTION
- UPDATE_TRANSACTION
- DELETE_TRANSACTION

### Required information:
- User who performed the action
- Affected transaction
- Data before and after the change

---

## 4. Database Design

### Table: `audit_logs`

| Column | Type | Description |
|------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Actor (who did it) |
| entity_type | varchar | Entity name (e.g. "transaction") |
| entity_id | uuid | Affected entity ID |
| action | varchar | CREATE / UPDATE / DELETE |
| before_data | jsonb | State before change |
| after_data | jsonb | State after change |
| created_at | timestamp | Log creation time |

### Notes:
- `before_data` is `NULL` for CREATE
- `after_data` is `NULL` for DELETE
- Use `jsonb` for flexibility and future-proofing

---

## 5. Audit Log Flow in NestJS

### High-level flow:
1. Controller receives request
2. Service executes business logic
3. Repository performs DB operations
4. Service records audit log
5. Response is returned

```
Request
  → Controller
    → TransactionService
      → TransactionRepository
      → AuditLogService
```

---

## 6. Implementation Principles (IMPORTANT)

### 6.1 Do NOT log in Controllers
Controllers should:
- Parse input
- Return output

Audit logging is a **business concern** and must live in the **Service layer**.

---

### 6.2 Audit Log Must Be Atomic
When updating a transaction:
- Update transaction data
- Insert audit log

➡️ Both operations must run inside the **same database transaction** to guarantee consistency.

---

## 7. Audit Log Examples

### 7.1 CREATE Transaction
```json
{
  "action": "CREATE",
  "before_data": null,
  "after_data": {
    "amount": 500000,
    "category_id": "food",
    "wallet_id": "main",
    "type": "expense"
  }
}
```

---

### 7.2 UPDATE Transaction
```json
{
  "action": "UPDATE",
  "before_data": {
    "amount": 500000,
    "category_id": "food"
  },
  "after_data": {
    "amount": 450000,
    "category_id": "transport"
  }
}
```

---

### 7.3 DELETE Transaction
```json
{
  "action": "DELETE",
  "before_data": {
    "amount": 450000,
    "category_id": "transport"
  },
  "after_data": null
}
```

---

## 8. TypeScript Interface (for Cursor / IDEs)

```ts
export interface AuditLog {
  id: string;
  userId: string;
  entityType: 'transaction';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  beforeData: Record<string, any> | null;
  afterData: Record<string, any> | null;
  createdAt: Date;
}
```

---

## 9. Service-level Pseudocode

```ts
async updateTransaction(userId: string, transactionId: string, dto: UpdateTransactionDto) {
  const before = await this.transactionRepo.findById(transactionId);

  const after = await this.transactionRepo.update(transactionId, dto);

  await this.auditLogService.create({
    userId,
    entityType: 'transaction',
    entityId: transactionId,
    action: 'UPDATE',
    beforeData: before,
    afterData: after,
  });

  return after;
}
```

---

## 10. Best Practices

- Never allow audit logs to be updated or deleted
- Avoid logging unnecessary or sensitive data
- Prefer logging only changed fields (diff) in advanced stages
- Keep audit logs write-only
- Index `entity_type`, `entity_id`, and `user_id`

---

## 11. Future Extensions

- Display transaction history in the app
- Export audit logs for accounting or compliance
- Trigger notifications based on audit events

---

## 12. Conclusion
Audit logging is:
- Simple in concept
- Powerful in practice
- A strong indicator of **enterprise-level backend thinking**

Implementing it early will significantly improve the reliability and maintainability of your system.
