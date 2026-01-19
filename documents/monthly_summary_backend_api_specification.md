# Monthly Summary – Backend API Specification

## 1. Endpoint Definition

```
GET /api/v1/summary/monthly
```

---

## 2. Authentication

- Requires authenticated user
- Summary is scoped to the current user only

---

## 3. Query Parameters

| Name | Type | Required | Description |
|----|-----|----------|-------------|
| year | number | Yes | Calendar year (e.g. 2026) |
| month | number | Yes | Month (1–12) |

---

## 4. Response Schema

```json
{
  "year": 2026,
  "month": 1,
  "totalIncome": 15000000,
  "totalExpense": 8200000,
  "balance": 6800000,
  "expenseByCategory": [
    {
      "categoryId": "uuid",
      "categoryName": "Food",
      "totalAmount": 3200000,
      "percentage": 39
    }
  ]
}
```

---

## 5. Calculation Rules

- `totalIncome` = sum(amount) where type = income
- `totalExpense` = sum(amount) where type = expense
- `balance` = totalIncome − totalExpense
- `percentage` = categoryAmount / totalExpense * 100

---

## 6. Query Logic (Conceptual SQL)

```sql
SELECT
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
FROM transactions
WHERE user_id = :userId
  AND EXTRACT(YEAR FROM transaction_date) = :year
  AND EXTRACT(MONTH FROM transaction_date) = :month;
```

Category breakdown:
```sql
SELECT
  c.id,
  c.name,
  SUM(t.amount) AS total_amount
FROM transactions t
JOIN categories c ON c.id = t.category_id
WHERE t.user_id = :userId
  AND t.type = 'expense'
  AND EXTRACT(YEAR FROM t.transaction_date) = :year
  AND EXTRACT(MONTH FROM t.transaction_date) = :month
GROUP BY c.id, c.name
ORDER BY total_amount DESC;
```

---

## 7. Performance Considerations

- Index on (user_id, transaction_date)
- Index on (category_id)
- Consider caching per (user, month) if dataset grows

---

## 8. Error Handling

| Scenario | Status | Message |
|-------|--------|---------|
| Invalid month | 400 | Invalid month parameter |
| Unauthorized | 401 | Unauthorized |
| Server error | 500 | Internal server error |

