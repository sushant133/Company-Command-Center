# Contributing to Multi-Company Command Center

Thank you for considering contributing! 🎉

## Code Standards
- **Backend**: ES Modules, ESLint + Prettier (Husky auto-fixes)
- **Frontend**: ESLint + Prettier + Tailwind
- **Commits**: Conventional (`feat:`, `fix:`, `docs:`, etc.)
- **Branches**: `feature/xyz`, `fix/issue-123`

## Development Setup
```bash
git clone <repo>
cd \"Company Command Center\"
npm install  # Both dirs have own package.json
cd Backend && npm run seed  # Test data
cd ../Frontend && npm run dev
```

## Pre-Commit Workflow
1. `git checkout -b feature/your-feature`
2. Code → `npm run lint -- --fix` + `npm run format`
3. Husky runs automatically on `git commit`
4. Push → Create PR

## Pull Request Guidelines
1. **Single Purpose**: One feature/fix per PR
2. **Tests**: Backend Jest tests for new logic
3. **Docs**: Update README.md or Swagger if API changes
4. **Lint**: Passes `npm run lint && npm run format:check`
5. **PR Template**:
   ```
   **Changes**: [summary]
   **Issue**: #123
   **Tests**: [manual/Jest]
   **Breaking**: No/Yes
   ```

## Testing New Code
```bash
# Backend
cd Backend
npm test
npm run test:coverage  # 80%+ coverage

# Frontend  
cd Frontend
npm run lint
npm run type-check
```

## Common Tasks
| Task | Command |
|------|---------|
| Seed DB | `cd Backend && npm run seed` |
| Lint All | `npm run lint` (both) |
| API Docs | http://localhost:5000/api-docs |
| Full Stack | Backend dev + Frontend dev |

## Security Issues
Report privately: [security@companycenter.com] or GitHub SECURITY.md template.

## License
By contributing, you agree MIT license applies to your work.

