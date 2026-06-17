# Simple Calculator

A client-side single-page calculator built with **HTML, CSS, and vanilla JavaScript** — no backend required.

> Implements **FR-001**: "create calculator with simple UI" per **ADR-001** (client-side JavaScript, no server).

## Features

- Addition, subtraction, multiplication, and division
- Percent and sign toggle
- Full keyboard support (digits, `+ - * /`, `Enter`/`=`, `.`, `Esc`)
- Accessible markup with live-region display
- Division-by-zero protection and floating-point noise cleanup

## Tech Stack

| Concern        | Choice                |
| -------------- | --------------------- |
| Markup         | HTML5                 |
| Styling        | CSS3 (CSS Grid)       |
| Logic          | Vanilla JS (ES modules) |
| Dev server     | Vite                  |
| Tests          | Vitest                |

This stack follows **ADR-001**, which selected a purely client-side implementation and rejected full-stack and Electron alternatives as unnecessary complexity for a depth-1 project.

## Project Structure

```
.
├── index.html            # App entry point + markup
├── src/
│   ├── main.js           # DOM wiring / event handling
│   ├── calculator.js     # Pure arithmetic engine + reducer
│   └── styles.css        # Theme and layout
├── tests/
│   └── calculator.test.js
├── package.json
├── vite.config.js
└── .github/workflows/ci.yml
```

## Getting Started

### Prerequisites

- Node.js 20+ (only for the dev server and tests; the app itself runs in any modern browser)

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open the printed local URL (typically <http://localhost:5173>).

> No build step is strictly required — you can also open `index.html` directly in a browser, since it uses native ES modules.

### Run tests

```bash
npm test
```

### Build for production

```bash
npm run build
```

Output is emitted to `dist/` and can be served by any static host (GitHub Pages, Netlify, S3, etc.).

## Keyboard Shortcuts

| Key            | Action            |
| -------------- | ----------------- |
| `0`–`9`        | Enter digit       |
| `+ - * /`      | Operator          |
| `Enter` or `=` | Equals            |
| `.`            | Decimal point     |
| `%`            | Percent           |
| `Esc`          | Clear (AC)        |

## License

MIT
