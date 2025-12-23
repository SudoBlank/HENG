# Contributing
This is a solo project made by SudoBlank on github.

Thanks for your interest in contributing to this toy language project! The repository is simple, but the following guidelines will keep contributions smooth.

## Quick workflow

1. Fork the repository and create a feature branch (e.g., `feature/add-syntax`).
2. Make changes in a small, reviewable PR with a clear description of the problem and your solution.
3. Add or update an example in `examples/` to demonstrate language changes where relevant.
4. Add tests (or a short script under `scripts/`) to validate behavior when appropriate.

## Testing locally

- Run the example build scripts:

```powershell
npm run build:examples
```

- Run the simple compile test (created in this project):

```powershell
npm test
```

## Style & review

- Keep commits small and focused.
- Add a short explanation of functional changes in the PR description.
- If changing language semantics, include at least one example showing old vs new behavior.
