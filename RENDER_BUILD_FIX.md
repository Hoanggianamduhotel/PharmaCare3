# 🔧 Render Build Structure Fix

## 🚨 Root Cause Found:
**Build output mismatch** giữa Vite config và server expectations

## ❌ Current Issue:
- **Vite builds to**: `dist/public/` (có index.html và assets)
- **Server serves from**: `dist/public/` trong `serveStatic()`
- **Render expects**: files tại root của publish directory

## ✅ Solutions:

### Option 1: Update Vite Config (Recommended)
```javascript
// vite.config.ts
export default {
  build: {
    outDir: '../dist', // Build directly to dist root
    emptyOutDir: true
  }
}
```

### Option 2: Copy files after build
```bash
# In package.json build script
"build": "vite build && cp -r dist/public/* dist/ && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
```

### Option 3: Update Render config
```yaml
# render.yaml
services:
  - type: web
    buildCommand: npm run build
    staticPublishPath: ./dist/public  # Point to correct path
```

## 🔍 Current Build Output:
```
dist/
├── index.js (server)
└── public/
    ├── index.html (React app)
    ├── assets/
    │   ├── index-BL3G549E.css
    │   └── index--GlgaaSw.js
    └── _redirects
```

## 🎯 Need to Fix:
Either move React app to `dist/` root OR update server to serve from `dist/public/` correctly.

The server's `serveStatic()` function in `vite.ts` is already configured for `dist/public/`, so this should work once Render is configured properly.