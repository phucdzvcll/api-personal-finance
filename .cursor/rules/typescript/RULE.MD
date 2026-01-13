---
description: "TypeScript coding standards: explicit type annotations"
alwaysApply: true
---

# TypeScript Type Annotation Rule

## Rule: Explicit Type Annotations Required

All variables, function parameters, and return types **MUST** have explicit type annotations when they are not immediately obvious from the assignment or context.

## Requirements

### 1. Variable Declarations

**Always use explicit type annotations** for variables, especially when:
- Getting services from dependency injection containers
- Receiving values from configuration services
- Working with complex types or generics

**✅ Correct:**
```typescript
const configService: ConfigService = app.get<ConfigService>(ConfigService);
const port: number = configService.get('port') as number;
const apiPrefix: string = configService.get('api.prefix') as string;
```

**❌ Incorrect:**
```typescript
const configService = app.get<ConfigService>(ConfigService);
const port = configService.get('port') as number;
const apiPrefix = configService.get('api.prefix') as string;
```

### 2. Function Parameters

**Always annotate function parameters:**
```typescript
function processUser(user: User, options: ProcessOptions): void {
  // ...
}
```

### 3. Return Types

**Always annotate function return types:**
```typescript
function getUserById(id: number): User {
  // ...
}
```

### 4. Service Injection

**Always annotate injected services:**
```typescript
constructor(
  private readonly userService: UserService,
  private readonly configService: ConfigService,
) {}
```

## Exceptions

Type annotations may be omitted only when:
1. The type is **trivially obvious** from the immediate assignment (e.g., `const count = 0`)
2. Type inference is **unambiguous** and the type is simple (e.g., `const name = 'John'`)

However, when in doubt, **always prefer explicit annotations**.

## Rationale

- **Clarity**: Makes code more readable and self-documenting
- **Type Safety**: Prevents accidental type errors
- **Maintainability**: Easier to refactor and understand code
- **IDE Support**: Better autocomplete and error detection
- **Team Consistency**: Ensures all developers follow the same pattern
