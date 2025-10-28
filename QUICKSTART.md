# Quick Start Guide

## Installation

If you have Node.js installed, follow these steps:

1. **Navigate to the project directory**:
   ```bash
   cd memoria-vault-react
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to the URL shown in the terminal (usually `http://localhost:5173`)

## If Node.js is not installed

1. **Download Node.js**: Visit https://nodejs.org/
2. **Install Node.js**: Choose the LTS (Long Term Support) version
3. **Verify installation**: Open a terminal and run:
   ```bash
   node --version
   npm --version
   ```
4. **Follow the installation steps above**

## Key Features

- **Dashboard**: Quick overview and recent memories
- **Gallery**: Browse all memories with search and filtering
- **Timeline**: Chronological view of your memories
- **Statistics**: Analytics about your memory collection
- **Settings**: Theme customization and data management

## Differences from Original

### Architecture
- **Original**: Single JavaScript class with vanilla JS
- **React Version**: Component-based architecture with modern React patterns

### Key Improvements
1. **Reusable Components**: Each UI element is a separate, reusable component
2. **State Management**: Uses React Context API for global state
3. **Hooks**: Custom hooks for common functionality (toast notifications)
4. **Better Organization**: Clear separation of concerns with folders for components, pages, contexts, hooks, and utilities
5. **Hot Module Replacement**: Instant updates during development with Vite
6. **Developer Experience**: Better debugging and error messages

### File Structure Comparison

**Original**:
```
- index.html (272 lines)
- app.js (879 lines)
- style.css (1569 lines)
```

**React Version**:
```
- Organized into 20+ focused files
- Each component ~40-100 lines
- Better maintainability and scalability
```

## Next Steps

After getting the app running, you can:

1. **Upload your first memory**
2. **Explore different views** (Gallery, Timeline, Statistics)
3. **Try the theme toggle** (light/dark mode)
4. **Export your data** for backup

## Troubleshooting

### Port Already in Use
If you see an error about port 5173 being in use, Vite will automatically try the next available port.

### Module Not Found
Make sure you ran `npm install` before `npm run dev`.

### Browser Compatibility
Use a modern browser (Chrome, Firefox, Safari, or Edge) for the best experience.

## Support

For issues or questions, check the README.md file for more detailed information.
