---
description: "ESLint compliance: automatically fix and follow all ESLint rules"
alwaysApply: true
---

# ESLint Compliance Rule

## Rule: Always Follow ESLint Rules

**All code changes MUST comply with ESLint rules defined in `eslint.config.mjs`.**

## Requirements

### 1. Automatic ESLint Fixes

When making code changes, you MUST:
- **Automatically fix** any ESLint violations
- **Verify** code passes ESLint checks before completing
- **Never leave** ESLint errors or warnings in the codebase

### 2. Key ESLint Rules to Follow

#### Type Safety (CRITICAL)
- ✅ `@typescript-eslint/no-unsafe-assignment`: No unsafe `any` assignments
- ✅ `@typescript-eslint/no-unsafe-call`: No unsafe function calls
- ✅ `@typescript-eslint/no-unsafe-member-access`: No unsafe property access
- ✅ `@typescript-eslint/no-unsafe-return`: No unsafe return values
- ✅ `@typescript-eslint/no-explicit-any`: No explicit `any` types

#### Async Safety
- ✅ `@typescript-eslint/no-floating-promises`: All promises must be handled
- ✅ `@typescript-eslint/await-thenable`: Proper async/await usage

#### Code Quality
- ✅ `@typescript-eslint/no-unused-vars`: No unused variables (except prefixed with `_`)
- ✅ `@typescript-eslint/no-empty-object-type`: No empty interfaces/types (use type aliases instead)
- ✅ `@typescript-eslint/require-await`: Remove `async` if no `await` is used
- ✅ `prettier/prettier`: Code formatting must match Prettier rules

### 3. Fixing Common Issues

#### Unsafe `any` Assignments
**❌ Incorrect:**
```typescript
const request: any = ctx.switchToHttp().getRequest();
const user = request.user;
```

**✅ Correct:**
```typescript
interface RequestWithUser extends Request {
  user: UserEntity;
}
const request: RequestWithUser = ctx.switchToHttp().getRequest<RequestWithUser>();
const user: UserEntity = request.user;
```

#### Floating Promises
**❌ Incorrect:**
```typescript
bootstrap();
```

**✅ Correct:**
```typescript
void bootstrap().catch((error: unknown) => {
  console.error("Failed to start:", error);
  process.exit(1);
});
```

#### Unused Variables
**❌ Incorrect:**
```typescript
catch (error) {
  // error not used
}
```

**✅ Correct:**
```typescript
catch (_error) {
  // Prefix with _ if unused
}
```

#### Empty Interfaces
**❌ Incorrect:**
```typescript
interface MyType extends BaseType {}
```

**✅ Correct:**
```typescript
type MyType = BaseType;
```

#### Unnecessary Async
**❌ Incorrect:**
```typescript
async getProfile(): Promise<UserDto> {
  return { id: 1, name: "John" };
}
```

**✅ Correct:**
```typescript
getProfile(): UserDto {
  return { id: 1, name: "John" };
}
```

### 4. Verification Process

After making changes:
1. **Check linter errors** using `read_lints` tool
2. **Fix all errors** before completing the task
3. **Ensure no warnings** remain (unless explicitly acceptable)
4. **Verify type safety** - all types must be explicit and safe

### 5. Prettier Integration

All code MUST also follow Prettier formatting rules defined in `.prettierrc`:
- ESLint will automatically enforce Prettier rules
- Code formatting must match Prettier configuration

## Enforcement

- **Always run** `read_lints` after code changes
- **Never commit** code with ESLint errors
- **Automatically fix** violations as part of code changes
- **Verify** compliance before marking tasks complete

## Exceptions

Only acceptable exceptions:
- Variables prefixed with `_` for intentionally unused parameters
- Console.log statements (allowed by `no-console: off`)

---

**This rule ensures code quality, type safety, and maintainability across the entire codebase.**
