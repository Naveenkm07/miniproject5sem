# How to Run Without npm

Since Node.js is not installed on your system, you have two options:

## Option 1: Install Node.js (Recommended)

1. **Download Node.js**
   - Visit: https://nodejs.org/
   - Download the **LTS version** (Long Term Support)
   - Run the installer and follow the installation wizard

2. **Verify Installation**
   Open PowerShell and run:
   ```powershell
   node --version
   npm --version
   ```

3. **Install and Run the Project**
   ```powershell
   npm install
   npm run dev
   ```

## Option 2: Use the Original Vanilla JS Version

The original version (in the parent directory) doesn't require any build tools and runs directly in the browser:

1. Navigate to the original directory:
   ```powershell
   cd ..
   ```

2. Open `index.html` in your browser:
   - Right-click on `index.html`
   - Select "Open with" → Your browser (Chrome, Firefox, Edge, etc.)

The original vanilla JavaScript version has all the same features and works without any installation!

## Why React Version Needs Node.js

The React version uses:
- **npm** (Node Package Manager) to install dependencies
- **Vite** as a build tool for fast development
- **Babel** to transpile JSX code to JavaScript
- **Module bundling** to combine all components into one file

These tools provide a better development experience but require Node.js to run.

## Comparison

| Feature | Original (Vanilla JS) | React Version |
|---------|----------------------|---------------|
| Installation Required | ❌ No | ✅ Yes (Node.js) |
| Runs in Browser | ✅ Immediately | ✅ After build |
| Developer Experience | Good | Excellent |
| Code Organization | Single file | Multiple modules |
| Hot Reload | ❌ No | ✅ Yes |

**For immediate use without installation, use the original version in the parent directory!**
