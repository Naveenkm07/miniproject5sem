# 📋 Quick Reference Guide

## Common Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173 or 5174)

# Production
npm run build        # Build for production (creates /dist folder)
npm run preview      # Preview production build locally

# Deployment
netlify deploy --prod --dir=dist    # Deploy to Netlify
vercel                               # Deploy to Vercel
npm run deploy                       # Deploy to GitHub Pages (if configured)
```

## Project Structure Quick Map

```
src/
├── components/      → Reusable UI components (modals, cards, etc.)
├── pages/          → Full page components (Dashboard, Gallery, etc.)
├── contexts/       → State management (Memory, Album, Theme)
├── utils/          → Helper functions (indexedDB, thumbnail, helpers)
└── hooks/          → Custom React hooks (useToast)
```

## Key Files

- `App.jsx` - Main app component, routing logic
- `main.jsx` - Entry point, providers
- `vite.config.js` - Build configuration
- `package.json` - Dependencies and scripts
- `UPGRADE-LOG.md` - Feature documentation

## State Management

### MemoryContext
```javascript
import { useMemories } from './contexts/MemoryContext';

const { memories, addMemory, updateMemory, deleteMemory, 
        toggleFavorite, importMemory, exportAllData } = useMemories();
```

### AlbumContext
```javascript
import { useAlbums } from './contexts/AlbumContext';

const { albums, createAlbum, updateAlbum, deleteAlbum,
        addMemoryToAlbum, removeMemoryFromAlbum } = useAlbums();
```

### ThemeContext
```javascript
import { useTheme } from './contexts/ThemeContext';

const { theme, setTheme, toggleTheme } = useTheme();
```

## Component Patterns

### Memory Card
```javascript
<MemoryCard
  memory={memory}
  onClick={onOpenMemoryDetail}
  onToggleFavorite={toggleFavorite}
/>
```

### Modals
```javascript
<UploadModal isOpen={open} onClose={handleClose} onSave={handleSave} />
<EditMemoryModal isOpen={open} memory={memory} onClose={handleClose} onSave={handleSave} />
<ImportModal isOpen={open} onClose={handleClose} onImport={handleImport} />
```

## IndexedDB Functions

```javascript
import * as indexedDB from './utils/indexedDB';

// CRUD operations
await indexedDB.getAllMemories();
await indexedDB.addMemory(memory);
await indexedDB.updateMemory(memory);
await indexedDB.deleteMemory(id);
await indexedDB.clearAllMemories();

// Storage info
await indexedDB.getStorageEstimate();
```

## Thumbnail Generation

```javascript
import { generateThumbnail } from './utils/thumbnail';

const thumbnail = await generateThumbnail(file); // Returns data URL
```

## Memory Object Structure

```javascript
{
  id: "unique-id",
  title: "Beach Vacation",
  description: "Summer 2024",
  category: "Photos",
  tags: ["beach", "summer", "vacation"],
  dateCreated: "2024-07-15",
  dateAdded: "2024-10-28T12:00:00.000Z",
  fileName: "beach.jpg",
  fileType: "image/jpeg",
  fileSize: 2048000,
  fileData: "data:image/jpeg;base64,...",
  thumbnail: "data:image/jpeg;base64,...",  // Optional
  isFavorite: false
}
```

## Album Object Structure

```javascript
{
  id: "unique-id",
  name: "Summer 2024",
  description: "Vacation memories",
  dateCreated: "2024-10-28T12:00:00.000Z",
  memoryIds: ["mem-id-1", "mem-id-2"],
  coverImage: null  // Or custom image URL
}
```

## CSS Variables

```css
/* Theme colors */
--color-primary: Primary accent color
--color-secondary: Secondary background
--color-surface: Card/surface background
--color-text: Primary text color
--color-text-secondary: Secondary text color
--color-border: Border color
--color-success: Success green
--color-error: Error red
--color-warning: Warning orange

/* Spacing */
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-base: 16px
--spacing-lg: 24px
--spacing-xl: 32px

/* Border radius */
--radius-sm: 4px
--radius-base: 8px
--radius-lg: 12px
--radius-full: 9999px
```

## Environment Variables

Create `.env` file:
```env
VITE_APP_NAME=Memoria Vault
VITE_DEFAULT_THEME=system
```

Access in code:
```javascript
const appName = import.meta.env.VITE_APP_NAME;
```

## Performance Tips

1. **Thumbnails** - Always generate for images/videos
2. **useMemo** - Use for expensive calculations
3. **Lazy Loading** - Load components on demand
4. **IndexedDB** - Use async operations
5. **Code Splitting** - Keep bundles small

## Troubleshooting Quick Fixes

```bash
# Port in use
npm run dev -- --port 3000

# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev

# PowerShell execution policy (Windows)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Browser DevTools Tips

- **React DevTools** - Inspect component tree
- **Network Tab** - Check file uploads
- **Application Tab** → IndexedDB - View stored data
- **Console** - Check for errors
- **Lighthouse** - Performance audit

## Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "feat: Add new feature"

# Push
git push origin main

# Create branch
git checkout -b feature/new-feature
```

## Documentation Links

- [Full README](README.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Feature Changelog](UPGRADE-LOG.md)
- [Project Summary](PROJECT-SUMMARY.md)

## Support

- Issues: GitHub Issues
- Email: support@memoriavault.com
- Docs: Project Wiki

---

**Pro Tip:** Keep this file bookmarked for quick reference! 📌
