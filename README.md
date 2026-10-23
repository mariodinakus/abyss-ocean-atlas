# ABYSS — The world below

Interactive, cinematic ocean exploration app: a draggable **3D globe**, **real GEBCO_2026 shaded-relief bathymetry**, 15 curated research locations, scientific notes, five ocean depth zones, guided dive simulation, expedition timeline, local bookmarks and responsive design.

![License: MIT](https://img.shields.io/badge/license-MIT-97f2e8)

## What works

- 3D WebGL globe that supports drag-to-rotate, zoom and clickable location markers. The globe attempts to apply the **official GEBCO WMS image as a real texture**. A stylized globe remains if WebGL or image-texture loading is blocked.
- Direct **2D GEBCO WMS map** with local marker overlays, zoom/pan and location selection. Imagery is requested live from GEBCO; this is not a live camera feed or live sonar observation.
- Atlas search, category filters, facts, approximate reported depths and source links.
- Dive simulation from 0 to 11,000 metres, auto-descent, zones, approximate hydrostatic pressure and darkness progression.
- Saved discoveries are kept in browser localStorage; no account or personal data leaves the app.
- Curated timeline, educational data-source documentation and mobile-responsive navigation.

## Build locally

Requires Node.js 20 or higher; **zero npm packages** are necessary to build.

```bash
npm run dev
# http://localhost:4173
npm test
npm run build
```

The app uses vanilla JavaScript, CSS and a dynamically imported Three.js module from jsDelivr. A network connection to jsDelivr is required for the full interactive WebGL globe; the rest of the interface and procedural fallback work without that library. The GEBCO WMS host must be reachable for official bathymetry imagery.

## GitHub repository

Source repository: https://github.com/mariodinakus/abyss-ocean-atlas

## Render deployment (Static Site)

1. Create GitHub repository `abyss-ocean-atlas` and upload the contents of this folder to the root of its `main` branch.
2. Go to **Render → New → Static Site** and connect `mariodinakus/abyss-ocean-atlas`.
3. **Build command:** `npm run build`.
4. **Publish directory:** `dist`.
5. Enable auto-deploy on new commits. No API keys or environment variables are required.

A matching `render.yaml` Blueprint is included, for optional Infrastructure-as-Code deployment. The `repo` URL in this template assumes the named repository is created under `mariodinakus` first.

## Methodology and accuracy

- **Terrain imagery:** the [`GEBCO_2026 Grid`](https://www.gebco.net/data-products/gebco-web-services/web-map-service) via public Web Map Service (`gebco_latest`). The GEBCO grid uses direct sonar measurements along survey tracks plus interpolations/model-based estimates elsewhere. The ocean floor is not directly imaged through the water by satellites.
- **Reported place depths:** curated reference values in `src/data.js`; **not extracted pixel-by-pixel from the WMS image**, so treat values explicitly labelled *approximate* or *representative* accordingly. For Challenger Deep, NOAA's published depth measurement is 10,935m ±6m; NOAA reports Titanic at approximately 3,800m.
- **Dive visualization:** artistic animation; pressure approximated as `1 atm + depth / 10.06m`, not measured environmental data.
- **Site coordinates:** approximate marker centres/general sites. Never use this for navigation.
- **Not real-time:** the 2026 reference terrain grid is historical compiled data. This app is a science atlas, **not a live feed**.

### Credits

Ocean terrain imagery: GEBCO Compilation Group (2026), GEBCO_2026 Grid, via https://www.gebco.net/.
Ocean science references: NOAA Ocean Exploration, NOAA Office of National Marine Sanctuaries, USGS. Geographic source links are included in the product interface.

## Privacy / operational limitations

No account, authentication, backend or API key is needed. Local bookmarks persist only in the visitor's browser. Third-party requests occur for the web font (Google Fonts), 3D library (jsDelivr) and bathymetry map image (GEBCO). Public hosts may throttle or change access; a network or WMS CORS failure can disable the remote texture, in which case the stylized globe fallback remains. This platform must not be used for maritime navigation or diving safety decisions.