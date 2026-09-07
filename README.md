# Home + Retro Fitness Workout Tracker (PWA)

A Windows-friendly Progressive Web App for iPhone and desktop browsers.

## What it includes
- 12-week / 3-block Full Body, Upper, Lower program
- Home and Retro Fitness modes
- Home equivalent shown under every Retro Fitness exercise
- Separate proper-form video links for Retro and Home equivalents where available
- Expandable exercise cards with muscles worked, equipment, form cues, last logged set, and best logged set
- Weight, reps, RPE, and completed-set tracking
- Workout history and bike-cardio logging
- Local backup export/import
- Offline app shell after first load (video links still require internet)

## Important: how to use on iPhone
A PWA must be served from a web address (HTTPS) to install properly. Opening `index.html` directly from Files will not behave like an installed iPhone app.

### Easiest Windows setup: GitHub Pages
1. Create a free GitHub account if needed.
2. Create a new repository, e.g. `workout-tracker`.
3. Upload all files from this folder to the repository root.
4. Open **Settings > Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and `/ (root)`, then Save.
7. GitHub will give you an HTTPS website address.
8. Open that address in Safari on your iPhone.
9. Tap **Share > Add to Home Screen > Add**.

### Alternative: Netlify Drop
You can also deploy the folder with a static-site hosting service such as Netlify. The important part is that the site is served over HTTPS.

## Data storage
Workout history is stored in the browser on that device using local storage. Use **Export data** periodically to save a JSON backup. Use **Import data** to restore it.

## Updating the app
Replace the files on your hosted site. The service worker will cache the new app version after refresh/reload.

## Notes
- No server account or subscription is required for the app itself.
- Form-video links open externally and need internet access.
- This is a personal workout tracker, not a medical or coaching service.
