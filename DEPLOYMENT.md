# Deployment Guide

This guide will help you deploy Memoria Vault to various hosting platforms.

## 📦 Build for Production

First, create an optimized production build:

```bash
npm run build
```

This creates a `dist` folder with optimized static files ready for deployment.

## 🚀 Deployment Options

### Option 1: Netlify (Recommended)

**Via Netlify CLI:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Via Netlify Website:**
1. Sign up at [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

**Custom Domain:**
- Go to Site settings → Domain management
- Add your custom domain
- Configure DNS records as instructed

---

### Option 2: Vercel

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Via Vercel Website:**
1. Sign up at [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Framework Preset: Vite
5. Click "Deploy"

---

### Option 3: GitHub Pages

1. **Install gh-pages:**
```bash
npm install --save-dev gh-pages
```

2. **Update package.json:**
```json
{
  "homepage": "https://yourusername.github.io/memoria-vault-react",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Update vite.config.js:**
```javascript
export default defineConfig({
  base: '/memoria-vault-react/',
  // ... rest of config
})
```

4. **Deploy:**
```bash
npm run deploy
```

---

### Option 4: Firebase Hosting

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase:**
```bash
firebase login
```

3. **Initialize Firebase:**
```bash
firebase init hosting
```

4. **Configure firebase.json:**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

5. **Build and Deploy:**
```bash
npm run build
firebase deploy
```

---

### Option 5: Traditional Web Hosting (cPanel, etc.)

1. **Build the project:**
```bash
npm run build
```

2. **Upload files:**
   - Upload contents of `dist` folder to your web host
   - Typically to `public_html` or `www` directory

3. **Configure:**
   - Ensure your hosting supports SPA (Single Page Applications)
   - Set up URL rewriting to point all routes to `index.html`

**.htaccess example (Apache):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## ⚙️ Environment Variables

If you use environment variables:

1. **Create `.env.production`:**
```env
VITE_APP_NAME=Memoria Vault
VITE_API_URL=https://api.example.com
```

2. **Access in code:**
```javascript
const appName = import.meta.env.VITE_APP_NAME;
```

3. **Platform-specific:**
   - **Netlify:** Add in Site settings → Environment variables
   - **Vercel:** Add in Project settings → Environment Variables
   - **Firebase:** Use `firebase functions:config:set`

---

## 🔧 Post-Deployment Checklist

- [ ] Test all features in production
- [ ] Verify responsive design on mobile
- [ ] Check browser console for errors
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify IndexedDB works (not in private mode)
- [ ] Test upload/download functionality
- [ ] Check theme switching
- [ ] Verify all routes work
- [ ] Test import/export
- [ ] Check charts render correctly

---

## 📊 Performance Optimization

After deployment:

1. **Enable Compression:**
   - Most hosts enable gzip/brotli automatically
   - Verify with browser dev tools

2. **CDN (Optional):**
   - Netlify and Vercel include CDN
   - For others, use Cloudflare or similar

3. **Caching:**
   - Set appropriate cache headers
   - Vite handles asset hashing automatically

4. **Monitoring:**
   - Use Lighthouse for performance audits
   - Check PageSpeed Insights
   - Monitor with Google Analytics (optional)

---

## 🐛 Troubleshooting

**Blank page after deployment:**
- Check browser console for errors
- Verify `base` in `vite.config.js` matches your deployment path
- Ensure all assets are uploaded

**Routes not working:**
- Configure server to redirect all routes to `index.html`
- Check `.htaccess` or equivalent configuration

**Assets not loading:**
- Verify `base` path in `vite.config.js`
- Check if assets are in correct directory
- Look for CORS issues

**IndexedDB not working:**
- Ensure HTTPS (required for some features)
- Check browser compatibility
- Verify not in incognito/private mode

---

## 🔒 Security Considerations

- Always use HTTPS in production
- Don't commit `.env` files with secrets
- Implement Content Security Policy (CSP) headers
- Keep dependencies updated (`npm audit`)
- Use environment variables for sensitive data

---

## 📈 Analytics (Optional)

Add Google Analytics:

1. **Install:**
```bash
npm install react-ga4
```

2. **Initialize in App.jsx:**
```javascript
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
ReactGA.send('pageview');
```

---

## 🎉 You're Live!

Your Memoria Vault is now deployed! Share it with the world! 🚀

For issues or questions, refer to the [main README](README.md) or open an issue on GitHub.
