let pyodide;
let editor; // CodeMirror instance
let splitView = false; // Track split view state

async function initializePyodide() {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
  });
  await pyodide.loadPackage("micropip");

  // Redirect Python stdout and stderr to our JS function so print() outputs appear in the terminal.
  pyodide.runPython(`
import sys
from js import outputToTerminal

class Stdout:
    def write(self, s):
        # Only output non-empty strings (avoid stray newlines)
        if s.strip():
            outputToTerminal(s)
    def flush(self):
        pass

sys.stdout = sys.stderr = Stdout()
  `);

  outputToTerminal("Python runtime initialized!\n");
}

function outputToTerminal(text, isError = false) {
  const outputDiv = document.getElementById("terminal-output");
  const line = document.createElement("div");
  line.className = `terminal-line ${isError ? "error" : ""}`;
  line.textContent = text;
  outputDiv.appendChild(line);
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

document.addEventListener("DOMContentLoaded", async () => {
  await initializePyodide();

  // Initialize CodeMirror
  editor = CodeMirror(document.getElementById("code-editor"), {
    mode: "python",
    theme: "material-darker", // Or your chosen theme
    lineNumbers: true,
    indentUnit: 4,
    indentWithTabs: true,
    autofocus: true,
    value: "# Write your code here!\n", // Initial content
  });

  const terminalOutput = document.getElementById("terminal-output");
  const runButton = document.getElementById("run-button");
  const clearButton = document.getElementById("clear-button");
  const splitToggle = document.getElementById("split-toggle");
  const editorContainer = document.querySelector(".editor-container");

  // Create and insert the expand/collapse button with Material Icon
  const collapseEditorButton = document.createElement("button");
  collapseEditorButton.id = "collapse-editor-button";
  // Initially show the "fullscreen" icon (for expanding)
  collapseEditorButton.innerHTML = '<span class="material-icons">fullscreen</span>';
  collapseEditorButton.addEventListener("click", () => {
    const body = document.querySelector("body");
    body.classList.toggle("editor-expanded"); // Toggle the class on the body

    if (body.classList.contains("editor-expanded")) {
      collapseEditorButton.innerHTML = '<span class="material-icons">fullscreen_exit</span>';
    } else {
      collapseEditorButton.innerHTML = '<span class="material-icons">fullscreen</span>';
    }
  });
  document.querySelector(".editor-buttons").appendChild(collapseEditorButton);

  // Run button functionality: execute Python code from CodeMirror
  runButton.addEventListener("click", async () => {
    const code = editor.getValue();
    outputToTerminal(`>>> ${code}`);

    try {
      const result = await pyodide.runPythonAsync(code);
      if (result !== undefined) {
        outputToTerminal(String(result));
      }
    } catch (err) {
      outputToTerminal(err.message, true);
      console.error(err);
    }
  });

  // Clear button functionality: clear the terminal output
  clearButton.addEventListener("click", () => {
    terminalOutput.innerHTML = "";
  });

  // Split view toggle functionality: change the editor layout
  splitToggle.addEventListener("click", () => {
    splitView = !splitView;
    editorContainer.classList.toggle("split", splitView);
    splitToggle.textContent = splitView ? "Full Editor" : "Split View";
    editor.refresh(); // Refresh CodeMirror to adjust layout
  });
});
