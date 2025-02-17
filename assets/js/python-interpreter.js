let pyodide;

async function initializePyodide() {
  pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
  });
  await pyodide.loadPackage("micropip");
  outputToTerminal("Python runtime initialized!\n");
}

function outputToTerminal(text, isError = false) {
  const outputDiv = document.getElementById('terminal-output');
  const line = document.createElement('div');
  line.className = `terminal-line ${isError ? 'error' : ''}`;
  line.textContent = text;
  outputDiv.appendChild(line);
  outputDiv.scrollTop = outputDiv.scrollHeight;
}

document.addEventListener('DOMContentLoaded', async () => {
  await initializePyodide();
  
  const terminalInput = document.getElementById('terminal-input');
  terminalInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const code = terminalInput.value.trim();
      terminalInput.value = '';
      outputToTerminal(`>>> ${code}`);
      
      try {
        const result = await pyodide.runPythonAsync(code);
        if (result !== undefined) {
          outputToTerminal(String(result));
        }
      } catch (err) {
        outputToTerminal(err.message, true);
      }
    }
  });
});