# Example: Configuring CLAUDE.md for Your Project

This shows how to fill in the PROJECT-SPECIFIC section of CLAUDE.md using a real example.

---

## Example Project: E-commerce API

Let's say you're building a Node.js API for an e-commerce store.

### Quick Reference (filled in)

```markdown
## Quick Reference

| Command | Value |
|---------|-------|
| **Run** | npm run dev |
| **Test** | npm test |
| **Build** | npm run build |
| **Auto-Proceed** | NORMAL |
```

### Project Overview (filled in)

```markdown
## Project Overview

**Purpose:** REST API for an e-commerce store. Handles products, orders, users, and payments.

**Users:** Frontend web app and mobile app consume this API.

**Status:** building
```

### Tech Stack (filled in)

```markdown
## Tech Stack

- **Language:** TypeScript 5.3
- **Framework:** Express.js with Prisma ORM
- **Database:** PostgreSQL 15
- **Key Libraries:**
  - zod (validation)
  - jsonwebtoken (auth)
  - stripe (payments)
  - jest (testing)
```

### Project Structure (filled in)

```markdown
## Project Structure

\`\`\`
ecommerce-api/
├── src/
│   ├── routes/        # API endpoint handlers
│   ├── services/      # Business logic
│   ├── models/        # Prisma models
│   ├── middleware/    # Auth, logging, errors
│   └── utils/         # Helpers
├── tests/             # Jest test files
├── prisma/            # Database schema & migrations
└── .claude/           # Orchestrator state files
\`\`\`
```

### Code Patterns (filled in)

```markdown
## Code Patterns

- Routes: `src/routes/[resource].routes.ts` (e.g., products.routes.ts)
- Services: `src/services/[resource].service.ts`
- All functions use async/await
- Errors thrown as custom ApiError class
- Request validation with zod schemas in `src/schemas/`
- Use Prisma for all database operations (no raw SQL)
- Response format: `{ success: true, data: {...} }` or `{ success: false, error: {...} }`
```

### DO NOTs (filled in)

```markdown
## DO NOTs

- Do NOT use `var` - always `const` or `let`
- Do NOT commit .env files (use .env.example as template)
- Do NOT store passwords in plain text - use bcrypt
- Do NOT call Stripe API without rate limiting
- Do NOT modify migration files after they've been run
- Do NOT use console.log - use the logger service
- Do NOT return full user objects (exclude password hash)
```

### Key Files (filled in)

```markdown
## Key Files to Know

- `src/middleware/auth.ts` - JWT verification, attaches user to req
- `src/services/payment.service.ts` - All Stripe integration
- `prisma/schema.prisma` - Database schema (source of truth)
- `src/utils/logger.ts` - Winston logger config
- `.env.example` - Required environment variables
```

### Dependencies & External Systems (filled in)

```markdown
## Dependencies & External Systems

- **Database:** PostgreSQL at DATABASE_URL env var
- **Stripe:** Uses STRIPE_SECRET_KEY for payments
- **Redis:** Optional, for rate limiting (REDIS_URL)
- **Email:** SendGrid for transactional emails
```

### Known Issues (filled in)

```markdown
## Known Issues / Tech Debt

- [ ] Order service needs pagination for large order histories
- [ ] Product search is basic - need to add Elasticsearch
- [ ] Missing rate limiting on public endpoints
- [ ] Test coverage below 70% on payment service
```

### Decision Log (filled in)

```markdown
## Decision Log

- **2024-01-10:** Chose Prisma over TypeORM
  - Reasoning: Better TypeScript integration, cleaner migrations
  - Tradeoff: Less flexible for complex queries

- **2024-01-15:** Decided against GraphQL
  - Reasoning: REST is simpler, team knows it well
  - Tradeoff: Multiple requests needed for some views

- **2024-01-20:** Using zod instead of joi for validation
  - Reasoning: Native TypeScript types, smaller bundle
```

---

## Tips for Your Own Project

### Be Specific in Code Patterns
Instead of "use good naming", say "functions: camelCase, files: kebab-case"

### Make DO NOTs Actionable
Instead of "don't write bad code", say "do NOT use magic numbers - define constants"

### Keep Decision Log Updated
Every time you choose A over B, write it down. You'll forget why in 2 months.

### Start Small, Add Over Time
You don't need to fill everything on day 1. Add patterns as you discover them.

---

## Minimal Starter

If you want to start with the bare minimum:

```markdown
## Quick Reference
- **Run:** [your command]
- **Test:** [your command]
- **Auto-Proceed:** NORMAL

## DO NOTs
- Do NOT hardcode secrets
- Do NOT skip tests

## Code Patterns
- [Add as you go]
```

That's enough to get started. Build up from there.
