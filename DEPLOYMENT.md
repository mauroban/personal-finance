# 🚀 Deployment Guide

This guide covers deploying the Simple Budget Tracker to various free hosting platforms.

## 🆓 Free Hosting Options

All options below are **100% FREE** for this app since it's purely frontend.

---

## ✅ GitHub Pages (Recommended - Already Configured!)

**Cost:** $0/month forever
**Setup time:** 2 minutes
**Your URL:** `https://mauroban.github.io/personal-finance/`

### Quick Deploy

```bash
# Deploy in one command!
npm run deploy
```

That's it! Your app will be live in 1-2 minutes.

### First-Time Setup

1. **Deploy the app:**
   ```bash
   npm run deploy
   ```

2. **Enable GitHub Pages:**
   - Go to: https://github.com/mauroban/personal-finance/settings/pages
   - Under "Source", select: `gh-pages` branch
   - Click "Save"
   - Wait 1-2 minutes

3. **Access your app:**
   - Visit: https://mauroban.github.io/personal-finance/
   - Bookmark it!

### Future Updates

Every time you want to deploy changes:

```bash
npm run deploy
```

### Custom Domain (Optional)

If you own a domain (e.g., `mybudget.com`):

1. Go to GitHub repo settings → Pages
2. Add your custom domain
3. Update DNS records (see GitHub's instructions)
4. Update `vite.config.ts`: change `base: '/'`

---

## 🔷 Alternative: Netlify

**Cost:** $0/month (100GB bandwidth)
**Your URL:** `https://YOUR-SITE-NAME.netlify.app`

### Option A: Drag & Drop (Easiest)

1. Build your app:
   ```bash
   npm run build
   ```

2. Go to: https://app.netlify.com/drop

3. Drag the `dist/` folder to the page

4. Done! You'll get a URL instantly

### Option B: GitHub Integration (Automatic Updates)

1. Go to: https://app.netlify.com/
2. Click "Add new site" → "Import from Git"
3. Connect your GitHub account
4. Select the `personal-finance` repository
5. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Environment variables:** (leave empty)
6. Click "Deploy"

**Benefit:** Every time you push to GitHub, Netlify auto-deploys!

---

## ⚡ Alternative: Vercel

**Cost:** $0/month
**Your URL:** `https://YOUR-SITE-NAME.vercel.app`

### Setup

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts (accept defaults)

### Or use GitHub integration:

1. Go to: https://vercel.com/
2. Click "Add New Project"
3. Import from GitHub
4. Select `personal-finance`
5. Click "Deploy"

---

## ☁️ Alternative: Cloudflare Pages

**Cost:** $0/month (unlimited bandwidth!)
**Your URL:** `https://YOUR-SITE-NAME.pages.dev`

### Setup

1. Go to: https://pages.cloudflare.com/
2. Click "Create a project"
3. Connect to GitHub
4. Select `personal-finance` repository
5. Configure:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Click "Save and Deploy"

---

## 📊 Comparison Table

| Platform | Cost | Bandwidth | Custom Domain | Auto Deploy | Best For |
|----------|------|-----------|---------------|-------------|----------|
| **GitHub Pages** | Free | Fair use | ✅ Yes | ✅ Yes | **Easiest setup** |
| **Netlify** | Free | 100GB/mo | ✅ Yes | ✅ Yes | **Best features** |
| **Vercel** | Free | 100GB/mo | ✅ Yes | ✅ Yes | **Zero config** |
| **Cloudflare** | Free | **Unlimited** | ✅ Yes | ✅ Yes | **High traffic** |

---

## 🔒 Important Notes

### Data Privacy

- **All user data stays local** - stored in browser's IndexedDB
- **No data is sent to servers** - the app is 100% client-side
- **Each user's data is private** - no sharing between devices
- **Backups:** Users should use the Export feature regularly

### HTTPS

All platforms provide **free HTTPS** automatically - no configuration needed!

### Browser Compatibility

The app works on:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS/Android)

Requires IndexedDB support (all modern browsers).

---

## 🛠️ Troubleshooting

### "404 Page Not Found" after refresh

**Solution:** Your hosting needs SPA (Single Page Application) redirect rules.

**For Netlify/Vercel:** Create `public/_redirects`:
```
/*    /index.html   200
```

**For GitHub Pages:** This is already handled by the routing configuration.

### Build fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Custom domain not working

1. Check DNS records (A record or CNAME)
2. Wait for DNS propagation (can take 24-48 hours)
3. Enable HTTPS in platform settings

---

## 📈 Monitoring (Optional)

Want to know how many people use your app?

- **Netlify Analytics:** Built-in (paid, $9/mo)
- **Google Analytics:** Free, add to `index.html`
- **Plausible:** Privacy-friendly, $9/mo
- **Umami:** Self-hosted, free

---

## 🚀 Recommended: GitHub Pages

For your use case, I recommend **GitHub Pages** because:

1. ✅ Already configured (just run `npm run deploy`)
2. ✅ Free forever
3. ✅ Automatic HTTPS
4. ✅ Good performance
5. ✅ No bandwidth concerns for personal use
6. ✅ Connected to your repo

**Deploy now:** `npm run deploy`

---

## 📞 Need Help?

- GitHub Pages: https://docs.github.com/pages
- Netlify: https://docs.netlify.com/
- Vercel: https://vercel.com/docs
- Cloudflare: https://developers.cloudflare.com/pages/

---

**Made with ❤️ - Deploy in seconds, free forever!**
