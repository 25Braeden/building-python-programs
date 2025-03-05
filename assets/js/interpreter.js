document.addEventListener("DOMContentLoaded", function () {
  // --- Initialize Monaco Editor via require.js ---
  require.config({
    paths: {
      vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs",
    },
  });
  require(["vs/editor/editor.main"], function () {
    var editorInstance = monaco.editor.create(
      document.getElementById("editor"),
      {
        value: '# Your python code here\nprint("Hello, World!")',
        language: "python",
        theme: "vs-dark",
      }
    );
    window.editor = editorInstance; // Expose globally for splitter.js
    console.log("Monaco Editor initialized");
  });

  // --- Initialize xterm.js Terminal ---
  function initTerminal() {
    if (typeof Terminal === "undefined") {
      console.error(
        "Terminal library not loaded. Ensure xterm.js is loaded properly."
      );
      return;
    }
    var terminalInstance = new Terminal({
      cursorBlink: true,
      convertEol: true,
    });
    terminalInstance.open(document.getElementById("terminal"));
    window.term = terminalInstance; // Expose globally if needed
    console.log("xterm Terminal initialized");
    showPrompt();
  }

  // --- Terminal Output Functions ---
  function outputToTerminal(text) {
    if (window.term) {
      window.term.write(text);
      window.capturedOutput = (window.capturedOutput || "") + text;
    } else {
      console.error("Terminal not initialized");
    }
  }

  // Expose outputToTerminal so Pyodide can import it from 'js'
  window.outputToTerminal = outputToTerminal;

  function showPrompt() {
    outputToTerminal("\r\n>>> ");
  }

  // --- Global Input Handling via Async Promise ---
  // This function returns a Promise that resolves when the user enters input.
  function getTerminalInput() {
    return new Promise((resolve) => {
      window.inputResolve = resolve;
    });
  }
  window.getTerminalInput = getTerminalInput; // Expose to Python via js

  // --- Terminal Key Handling ---
  // When Enter is pressed, if a Promise is waiting, resolve it with the current line.
  function setupTerminalInput() {
    let currentLine = "";
    window.term.onKey((e) => {
      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
      if (ev.keyCode === 13) {
        // Enter key
        window.term.write("\r\n");
        if (typeof window.inputResolve === "function") {
          window.inputResolve(currentLine);
          window.inputResolve = undefined;
        } else {
          runReplCommand(currentLine);
        }
        currentLine = "";
      } else if (ev.keyCode === 8) {
        // Backspace
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
      window.pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
      });
      console.log("Pyodide loaded");
      await window.pyodide.runPythonAsync(`
import sys
from js import outputToTerminal, getTerminalInput
class Stdout:
    def write(self, s):
        if s:
            outputToTerminal(s)
    def flush(self):
        pass
sys.stdout = sys.stderr = Stdout()

import builtins
# Override input() as an async function that awaits getTerminalInput()
async def py_input(prompt=""):
    outputToTerminal(prompt)
    return await getTerminalInput()
builtins.input = py_input
      `);
      outputToTerminal("Python runtime initialized!\r\n");
      showPrompt();
      console.log("Pyodide initialized and IO overridden");
    } catch (e) {
      console.error("Error initializing Pyodide:", e);
    }
  }

  // --- Run Code Button Handler ---
  document.getElementById("runBtn").addEventListener("click", async function () {
    if (window.term && typeof window.term.clear === "function") {
      window.term.clear();
    }
    let code = window.editor.getValue();

    // Code to clear the Python global namespace
    const clearingCode = `
for key in list(globals().keys()):
    if key not in (
        '__builtins__', '__name__', '__doc__', '__package__',
        'outputToTerminal', 'getTerminalInput', 'pyodide'
    ):
        del globals()[key]
`;

    // Auto-wrap code in an async __main__ if it contains input()
    if (code.indexOf("input(") !== -1) {
      code = code.replace(/input\(/g, "await input(");
      let indented = code.split("\n").map((line) => "    " + line).join("\n");
      code = "async def __main__():\n" + indented + "\n\nawait __main__()";
    }
    try {
      // Clear previous state
      await window.pyodide.runPythonAsync(clearingCode);
      // Execute the new code
      await window.pyodide.runPythonAsync(code);
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
