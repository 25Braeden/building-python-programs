# Building Python Programs: An Interactive Web-Based Python Course

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Building Python Programs is an immersive, web-based Python programming course designed primarily for high school students. Inspired by "The Rust Programming Language" book, the project combines a structured curriculum with interactive code examples, enabling learners to experiment with Python directly in the browser.

![Screenshot of Course Interface](./assets/screenshots/screenshot.png)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Structured Curriculum**: Step-by-step units covering everything from basic syntax to advanced concepts.
- **Interactive Code Editor**:
  - Powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/) for a rich coding experience.
  - Executes Python code in-browser using [Pyodide](https://pyodide.org/) (see [interpreter.js](./assets/js/interpreter.js) :contentReference[oaicite:0]{index=0}).
- **Real-Time Syntax Highlighting**: Enhanced code examples with [Prism.js](https://prismjs.com/) and custom Python grammar tweaks (refer to [unit.html](./assets/template.html) :contentReference[oaicite:1]{index=1}).
- **Dynamic Theming and Layout**:
  - Toggle between light and dark modes with persistent user settings (see [main.js](./assets/js/main.js) :contentReference[oaicite:2]{index=2} and [style.css](./assets/css/style.css) :contentReference[oaicite:3]{index=3}).
  - Responsive sidebar navigation with a resizable lesson/code view using a custom splitter (see [splitter.js](./assets/js/splitter.js) :contentReference[oaicite:4]{index=4}).

## Tech Stack

- **Frontend Technologies**:
  - HTML5 Semantic Markup
  - CSS3 with Custom Properties & Responsive Layout (Flexbox/Grid)
  - Vanilla JavaScript for interactivity and DOM manipulation
- **Code Editor & Execution**:
  - [Monaco Editor](https://microsoft.github.io/monaco-editor/) for editing Python code
  - [Pyodide](https://pyodide.org/) for running Python in the browser
- **Syntax Highlighting**:
  - [Prism.js](https://prismjs.com/) with custom enhancements for Python
- **Fonts**:
  - [Fira Sans](https://fonts.google.com/specimen/Fira+Sans)
  - [Fira Mono](https://fonts.google.com/specimen/Fira+Mono)

## Directory Structure

```
building-python-programs/
├── assets/
│   ├── css/
│   │   └── style.css          # Main styles, theming, and responsive layout :contentReference[oaicite:5]{index=5}
│   ├── js/
│   │   ├── main.js            # Theme and sidebar toggle functionality :contentReference[oaicite:6]{index=6}
│   │   ├── interpreter.js     # Python code execution with Pyodide :contentReference[oaicite:7]{index=7}
│   │   └── splitter.js        # Resizable lesson and code area functionality :contentReference[oaicite:8]{index=8}
│   └── template.html          # Template for new course units (unit pages)
├── units/
│   ├── unit-0.html            # Getting Started Unit
│   └── unit-1.html            # Python Basics Unit
├── index.html                 # Homepage integrating lesson content and interactive code editor :contentReference[oaicite:9]{index=9}
└── README.md                  # Project documentation (this file)
```

## Getting Started

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/building-python-programs.git
   ```
2. **Open the Project:**
   ```bash
   cd building-python-programs
   open index.html  # Or double-click index.html in your file explorer to launch in your browser.
   ```

### Prerequisites

- A modern web browser with JavaScript enabled.
- No additional installations required—everything runs client-side!

## Usage

- **Navigation:** Use the sidebar to navigate between different course units.
- **Interactive Code Execution:**
  - Write or modify Python code in the Monaco Editor integrated on the homepage.
  - Click the **Run Code** button to execute your code using Pyodide.
- **Theme and Layout Controls:**
  - Toggle between light and dark themes using the theme button (bottom-right).
  - Adjust the lesson and code area widths with the draggable divider.

## Customization

### Theming

Customize the appearance by modifying CSS variables in `assets/css/style.css`. For example:

```css
:root {
  --rust-accent: #f74c00; /* Accent color for light mode */
  --rust-code-bg: #f5f2f0; /* Code block background for light mode */
}

[data-theme="dark"] {
  --rust-accent: #ff8c00; /* Accent color for dark mode */
  --rust-code-bg: #2d2d4d; /* Code block background for dark mode */
}
```

### Adding New Content

1. **Create a New Unit:**
   ```bash
   cp assets/template.html units/unit-2.html
   ```
2. **Update the Unit:**
   - Modify the `<title>` and header to reflect the new unit's title.
   - Adjust navigation links in both the new unit and the sidebar (see [index.html](./index.html) :contentReference[oaicite:10]{index=10}).
   - Populate the content sections with your lesson materials and code examples.

## Contributing

Contributions are welcome! To contribute:

1. **Open an Issue:** Describe your proposed changes.
2. **Fork the Repository.**
3. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Commit Your Changes:**
   ```bash
   git commit -m 'Describe your feature or fix'
   ```
5. **Push the Branch:**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** describing your changes for review.

## License

This project is distributed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- [Prism.js](https://prismjs.com/) for syntax highlighting.
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the interactive code editor.
- [Pyodide](https://pyodide.org/) for running Python in the browser.
- Google Fonts for Fira Sans and Fira Mono typefaces.
- Inspiration from "The Rust Programming Language" book.
