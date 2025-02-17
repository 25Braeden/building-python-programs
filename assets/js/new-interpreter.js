let pyodide;
let editor;

async function initializePyodide() {
  pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" });
  await pyodide.loadPackage("micropip");

  // Redirect Python's stdout/stderr so that print() and errors appear in our terminal.
  pyodide.runPython(`
import sys
from js import outputToTerminal
class Stdout:
    def write(self, s):
        if s.strip():
            outputToTerminal(s)
    def flush(self):
        pass
sys.stdout = sys.stderr = Stdout()
  `);

  outputToTerminal("Python runtime initialized!\n");
}

function outputToTerminal(text, isError = false) {
  const terminal = document.getElementById("terminal-output");
  const line = document.createElement("div");
  line.className = isError ? "terminal-error" : "terminal-line";
  line.textContent = text;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

document.addEventListener("DOMContentLoaded", async () => {
  // Initially hide the editor panel (we toggle via CSS display)
  const editorPanel = document.querySelector(".editor-panel");
  editorPanel.style.display = "none";

  // Toggle "Open Editor" button click
  const toggleEditorButton = document.getElementById("toggle-editor-button");
  toggleEditorButton.addEventListener("click", () => {
    editorPanel.style.display = "flex";
    document.getElementById("main-container").classList.add("split-view");
  });

  // Close editor button inside the editor panel
  const closeEditorButton = document.getElementById("close-editor-button");
  closeEditorButton.addEventListener("click", () => {
    editorPanel.style.display = "none";
    document.getElementById("main-container").classList.remove("split-view");
  });

  // Initialize Pyodide
  await initializePyodide();

  // Initialize CodeMirror editor in the #code-editor element
  editor = CodeMirror(document.getElementById("code-editor"), {
    mode: "python",
    theme: "material-darker",
    lineNumbers: true,
    value: "# Write your Python code here\n",
  });

  // Run button functionality
  document.getElementById("run-button").addEventListener("click", async () => {
    const code = editor.getValue();
    outputToTerminal(">>> " + code);
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

  // Clear terminal output
  document.getElementById("clear-button").addEventListener("click", () => {
    document.getElementById("terminal-output").innerHTML = "";
  });
});
