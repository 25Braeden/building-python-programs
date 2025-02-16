# Building Python Programs

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An interactive web-based Python programming course designed for high school students, inspired by "The Rust Programming Language" book.

![Screenshot of Course Interface](./assets/screenshots/screenshot.png)

## Features

- 📖 **Structured Curriculum**: Progressive units from basic syntax to control flow
- ✨ **Interactive Code Examples**: 
  - Real-time syntax highlighting with Prism.js
  - Custom Python variable/operator highlighting
- 🌓 **Theme Switching**: Light/dark mode with persistent settings
- 📱 **Responsive Design**: Mobile-friendly sidebar navigation
- ➡️ **Navigation System**: Chapter-based progression with Previous/Next buttons

## Tech Stack

- **Frontend**: 
  - HTML5 Semantic Markup
  - CSS3 Variables + Modern Layout (Flexbox/Grid)
  - Vanilla JavaScript
- **Syntax Highlighting**: 
  - [Prism.js](https://prismjs.com/) with custom Python grammar
- **Fonts**: 
  - [Fira Sans](https://fonts.google.com/specimen/Fira+Sans)
  - [Fira Mono](https://fonts.google.com/specimen/Fira+Mono)

## Directory Structure

```
building-python-programs/
├── assets/
│   ├── css/
│   │   └── style.css          # Main styles + theme variables
│   ├── js/
│   │   └── main.js            # Theme/Sidebar functionality
│   └── template.html          # New unit template
├── units/
│   ├── unit-0.html            # Getting Started
│   └── unit-1.html            # Python Basics
├── index.html                 # Homepage
└── README.md                  # This file
```

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/building-python-programs.git
   ```
2. Open in browser:
   ```bash
   cd building-python-programs
   open index.html  # Or double-click in file explorer
   ```

### Usage

1. Navigate through units using sidebar
2. Click code examples to copy to clipboard
3. Toggle theme using moon/sun icon (bottom-right)
4. Use Previous/Next buttons for linear progression

## Customization

### Theming

Modify CSS variables in `:root` and `[data-theme="dark"]`:
```css
/* assets/css/style.css */
:root {
  --rust-accent: #f74c00;       /* Light mode accent */
  --rust-code-bg: #f5f2f0;      /* Code block background */
}

[data-theme="dark"] {
  --rust-accent: #ff8c00;       /* Dark mode accent */
  --rust-code-bg: #2d2d4d;      /* Dark code background */
}
```

### Adding Content

1. Use template:
   ```bash
   cp assets/template.html units/unit-2.html
   ```
2. Update:
   - `<title>` tag
   - Navigation button URLs
   - Section content with `<pre><code>` blocks

## Contributing

Contributions welcome! Please follow these steps:
1. Open an issue describing proposed changes
2. Fork the repository
3. Create a feature branch (`git checkout -b feature/amazing-feature`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgments

- Prism.js syntax highlighting library
- Google Fonts for Fira typeface
- Inspired by "The Rust Programming Language" book
