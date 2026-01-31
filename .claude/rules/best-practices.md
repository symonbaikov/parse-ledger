# General Coding Best Practices

## Quality & Maintainability

### 1. Naming Conventions
- **Variables/Functions**: `camelCase`.
- **Classes/Models**: `PascalCase`.
- **Files**: `kebab-case.ts` (e.g., `user-details.component.tsx`).
- **Private properties**: Prefix with `_` if needed, but prefer private keywords.

### 2. Error Handling
- Never use generic `catch (e) { console.log(e) }`.
- Use custom exception filters to map internal errors to user-friendly HTTP responses.
- Always log errors with context (Correlation ID).

### 3. Testing
- **Unit Tests**: Every service method should have a corresponding test.
- **Integration Tests**: Critical API paths must be tested with a real database (Testcontainers or In-memory).
- **Mocks**: Mock external dependencies (Mailers, Bank APIs, S3).

### 4. Code Style (SOLID/DRY)
- **Single Responsibility**: One class/function does one thing.
- **Open/Closed**: Avoid large `if/else` or `switch` blocks; use polymorphism or strategy patterns for extensible logic.
- **Don't Repeat Yourself**: Extract common logic into Shared Modules or Utility libraries.

## NestJS Specifics
- Use **Pipes** for input validation.
- Use **Interceptors** for response formatting.
- Use **Guards** for authentication and permission checks.
- Keep Controllers thin; move all logic to Services.
