# Monthly Summary – Business Specification

## 1. Purpose
The Monthly Summary feature provides users with a clear, high-level understanding of their financial status for a selected month.

It answers three core questions:
1. How much did I earn?
2. How much did I spend?
3. What is my remaining balance?

---

## 2. Business Definition

**Monthly Summary** is an aggregated view calculated from transactions within a given month, based on `transactionDate`.

It includes:
- Total income
- Total expense
- Net balance (income − expense)
- Expense breakdown by category

---

## 3. Business Rules

1. Summary is calculated **per user**
2. Only non-deleted transactions are included
3. Transactions are filtered by `transactionDate`
4. Income and expense are calculated independently
5. Balance = Total Income − Total Expense
6. Category breakdown applies only to **expense** transactions
7. Category percentages are calculated based on total expense

---

## 4. Edge Cases

| Scenario | Expected Result |
|--------|----------------|
| No transactions | All values = 0 |
| Only income | Expense = 0, Balance > 0 |
| Only expense | Income = 0, Balance < 0 |
| Category deleted | Historical transactions remain valid |

---

## 5. Success Criteria

- Data accuracy is guaranteed
- Calculations are deterministic
- Results are consistent across platforms

---

## 6. Out of Scope

- Budget comparison
- Forecasting
- Yearly aggregation

