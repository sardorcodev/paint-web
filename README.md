# ProPaint

ProPaint is a React/Vite browser painting prototype with a custom canvas editor, basic drawing tools, undo/redo, color controls, simple shapes, and PNG export.

## Current Status

This project is in prototype/stabilization phase. It is not production-ready yet, and the current work is focused on making the existing editor safer and easier to evolve before larger platform features are added.

## Setup

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Run lint checks:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Known Limitations

- No project save/load yet; export is currently image-based.
- No real layers UI yet.
- No zoom or pan yet.
- No automated tests yet.
- Editor architecture is still being stabilized before a larger refactor.

## Deployment

The app builds as a static Vite site and can be deployed to Netlify or another static host by publishing the `dist` directory after running `npm run build`.
