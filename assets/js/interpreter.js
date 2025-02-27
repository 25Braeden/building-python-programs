document.addEventListener('DOMContentLoaded', function() {
  // --- Initialize Monaco Editor via require.js ---
  require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs' } });
  require(['vs/editor/editor.main'], function () {
    var editorInstance = monaco.editor.create(document.getElementById('editor'), {
      value: "# Write your Python code here\nprint('Hello, Python!')",
      language: 'python',
      theme: 'vs-dark'
    });
    window.editor = editorInstance;  // Expose globally (for splitter.js)
    console.log("Monaco Editor initialized");
  });

  // --- Initialize xterm.js Terminal ---
  function initTerminal() {
    if (typeof Terminal === 'undefined') {
      console.error('Terminal library not loaded. Ensure xterm.js is loaded properly.');
      return;
    }
    var terminalInstance = new Terminal({
      cursorBlink: true,
      convertEol: true
    });
    terminalInstance.open(document.getElementById('terminal'));
    window.term = terminalInstance;  // Expose globally if needed
    console.log("xterm Terminal initialized");
    showPrompt();
  }

  // --- Terminal Output Functions ---
  function outputToTerminal(text) {
    if (window.term) {
      window.term.write(text);
    } else {
      console.error("Terminal not initialized");
    }
  }

  function showPrompt() {
    outputToTerminal("\r\n>>> ");
  }

  // --- Terminal Input Handling ---
  function setupTerminalInput() {
    let currentLine = "";
    let inputResolve = null;
    window.term.onKey(e => {
      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
      if (ev.keyCode === 13) { // Enter key
        window.term.write("\r\n");
        if (inputResolve) {
          inputResolve(currentLine);
          inputResolve = null;
        } else {
          runReplCommand(currentLine);
        }
        currentLine = "";
      } else if (ev.keyCode === 8) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          window.term.write("\b \b");
        }
      } else if (printable) {
        currentLine += e.key;
        window.term.write(e.key);
      }
    });
    console.log("Terminal input setup complete");
  }

  async function runReplCommand(command) {
    if (command.trim() === "") {
      showPrompt();
      return;
    }
    try {
      await window.pyodide.runPythonAsync(command);
    } catch (err) {
      outputToTerminal(err.message + "\r\n");
    }
    showPrompt();
  }

  // --- Initialize Pyodide and Bind IO ---
  async function initPyodide() {
    try {
      window.pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" });
      console.log("Pyodide loaded");
      await window.pyodide.runPythonAsync(`
import sys
from js import outputToTerminal
class Stdout:
    def write(self, s):
        if s:
            outputToTerminal(s)
    def flush(self):
        pass
sys.stdout = sys.stderr = Stdout()

import builtins
def py_input(prompt=""):
    outputToTerminal(prompt)
    return ""
builtins.input = py_input
      `);
      outputToTerminal("Python runtime initialized!\r\n");
      console.log("Pyodide initialized and IO overridden");
    } catch (e) {
      console.error("Error initializing Pyodide:", e);
    }
  }

  // --- Run Code Button Handler ---
  document.getElementById('runBtn').addEventListener('click', async function() {
    if (window.term && typeof window.term.clear === "function") {
      window.term.clear();
    }
    try {
      await window.pyodide.runPythonAsync(window.editor.getValue());
    } catch (err) {
      outputToTerminal(err.message + "\r\n");
    }
    showPrompt();
  });

  // --- Overall Initialization ---
  initTerminal();
  setupTerminalInput();
  initPyodide();
});
