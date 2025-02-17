/* main.js */

let editor;  // Monaco Editor instance
let pyodide; // Pyodide instance

// Initialize Monaco Editor using AMD loader
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs' } });
require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("editor"), {
    value: "# Write your Python code here\nprint('Hello, Python!')",
    language: "python",
    theme: "vs-dark"
  });
});

// Initialize Pyodide and redirect Python stdout/stderr
async function initPyodide() {
  pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" });
  
  // Redirect Python stdout/stderr to our terminal
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
  
  outputToTerminal("Python runtime initialized!\\n");
}

// Function to display text in the terminal
function outputToTerminal(text) {
  const terminal = document.getElementById("terminal");
  terminal.innerText += text;
  terminal.scrollTop = terminal.scrollHeight;
}

// Run code when the run button is clicked
document.getElementById("runBtn").addEventListener("click", async () => {
  const code = editor.getValue();
  // Clear the terminal before running the code
  document.getElementById("terminal").innerText = "";
  try {
    await pyodide.runPythonAsync(code);
  } catch (err) {
    outputToTerminal(err.message + "\\n");
  }
});

// Start Pyodide
initPyodide();
