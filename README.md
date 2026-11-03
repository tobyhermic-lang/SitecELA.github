# English Learning Hub — GitHub Pages demo

## Files
- `index.html`: the app interface and demo data.
- `manifest.json`: installable web-app settings.
- `sw.js`: service worker for offline caching.

## Publish with GitHub Pages
1. Open your GitHub repository.
2. Upload these three files to the repository's root folder.
3. Commit the changes.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select your main branch and `/ (root)`, then Save.
7. Wait for GitHub Pages to publish, then open the site URL.

## Test it
- Open the published URL once while online.
- Refresh once so the service worker can install and cache the app.
- Then try turning off internet and reopening the site.
- On iPhone, open the site in Safari → Share → Add to Home Screen.
- On Android, open the site in Chrome → menu → Install app / Add to Home screen.

## Important notes
- GitHub Pages serves static files. It does not provide a database or user accounts.
- The eight lessons are sample data in `index.html`.
- The Open buttons are placeholders until you add your actual PDF/JPG/MP3 files and connect their file paths.
- QR lookup currently accepts lesson IDs manually. Camera scanning is a later feature.
- Offline access works after the app has been opened online and cached. Individual lesson files must also be added to the cache strategy or opened once while online.
- GitHub Pages requires HTTPS for service workers; its published site uses HTTPS.
