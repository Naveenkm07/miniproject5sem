# Contributing to Memoria Vault

First off, thank you for considering contributing to Memoria Vault! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and expected**
- **Include screenshots if applicable**
- **Specify browser and OS version**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a step-by-step description**
- **Explain why this enhancement would be useful**
- **List examples of where this enhancement exists elsewhere**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code, add tests if applicable
3. Ensure the code follows the existing style
4. Update documentation as needed
5. Write clear commit messages
6. Open a Pull Request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/memoria-vault-react.git

# Install dependencies
cd memoria-vault-react
npm install

# Start dev server
npm run dev
```

## Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing patterns in the codebase
- Use ES6+ features (arrow functions, destructuring, etc.)

### File Organization
- Components in `src/components/`
- Pages in `src/pages/`
- Utilities in `src/utils/`
- Contexts in `src/contexts/`

### Naming Conventions
- Components: PascalCase (e.g., `MemoryCard.jsx`)
- Functions: camelCase (e.g., `handleUpload`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- CSS classes: kebab-case (e.g., `memory-card`)

## Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

Examples:
```
feat: Add bulk delete functionality
fix: Resolve thumbnail generation error
docs: Update installation instructions
style: Format code with Prettier
refactor: Simplify upload logic
```

## Testing

Before submitting:
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test responsive design on different screen sizes
- Verify no console errors
- Check accessibility

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

Thank you for contributing! 🚀
