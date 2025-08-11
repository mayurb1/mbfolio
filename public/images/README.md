# Images Folder

Place your static image assets here. Files in this directory are served at the site root.

- Profile photo path expected by `src/components/sections/About.jsx`:
  - `/images/profile-pic.jpg`
- Add your own photo by saving a file named `profile-pic.jpg` in this folder.
- You can add any other images as needed, e.g. `/images/project-1.png`.

Notes:

- This folder lives under Vite's `public/` so assets are copied as-is and available at runtime without imports.
- For production, prefer optimized images (compressed JPG/PNG or SVG where appropriate).
