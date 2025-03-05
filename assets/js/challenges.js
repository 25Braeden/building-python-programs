document.addEventListener("DOMContentLoaded", function () {
  // Allow each lesson to define its own challenges by setting window.unitChallenges.
  // If not defined, default challenges for this unit will be used.
  const challenges = window.unitChallenges || [
    {
      id: 1,
      prompt: "Create a variable named 'x' and assign it the value 10.",
      check: async function () {
        try {
          const x = await window.pyodide.globals.get("x");
          return x.toString() === "10";
        } catch (e) {
          return false;
        }
      },
      solved: false,
    },
    {
      id: 2,
      prompt:
        "Create a variable named 'message' and assign it the value 'Hello, Python!'.",
      check: async function () {
        try {
          const message = await window.pyodide.globals.get("message");
          return message.toString() === "Hello, Python!";
        } catch (e) {
          return false;
        }
      },
      solved: false,
    },
    {
      id: 3,
      prompt: "Print the message variable from the previous question.",
      check: async function () {
        try {
          // Check that the global captured output includes the expected text.
          return (
            window.capturedOutput &&
            window.capturedOutput.includes("Hello, Python!")
          );
        } catch (e) {
          return false;
        }
      },
      solved: false,
    },
  ];

  function renderChallenges() {
    const container = document.getElementById("challenges-container");
    if (!container) return;
    container.innerHTML = "<h3>Challenges</h3>";
    challenges.forEach((challenge, index) => {
      const challengeDiv = document.createElement("div");
      challengeDiv.className = "challenge";
      // Lock challenge if the previous challenge isn't solved (except for the first challenge)
      if (index > 0 && !challenges[index - 1].solved) {
        challengeDiv.classList.add("locked");
      }
      // If the challenge is solved, add the completed class for green styling.
      if (challenge.solved) {
        challengeDiv.classList.add("completed");
      }
      // Create a status indicator element
      const statusIndicator = document.createElement("span");
      statusIndicator.className = "status-indicator";
      if (challenge.solved) {
        statusIndicator.innerHTML = "✓"; // checkmark for completed
      } else if (challengeDiv.classList.contains("locked")) {
        statusIndicator.innerHTML = "🔒"; // locked icon
      } else {
        statusIndicator.innerHTML = "○"; // pending icon
      }
      challengeDiv.appendChild(statusIndicator);
      // Create a span element for the challenge prompt
      const promptSpan = document.createElement("span");
      promptSpan.className = "prompt";
      promptSpan.textContent = challenge.prompt;
      challengeDiv.appendChild(promptSpan);
      // Add an inline status message
      const messageSpan = document.createElement("span");
      messageSpan.className = "challenge-message";
      if (challenge.solved) {
        messageSpan.textContent = "Completed!";
      } else if (challengeDiv.classList.contains("locked")) {
        messageSpan.textContent = "Locked";
      } else {
        messageSpan.textContent = "Pending...";
      }
      challengeDiv.appendChild(messageSpan);
      container.appendChild(challengeDiv);
    });
  }

  async function checkChallenges() {
    // Check each challenge sequentially
    for (let i = 0; i < challenges.length; i++) {
      // Skip challenges that are locked (i.e. previous one not solved)
      if (i > 0 && !challenges[i - 1].solved) continue;
      if (!challenges[i].solved) {
        const result = await challenges[i].check();
        if (result) {
          challenges[i].solved = true;
        }
      }
    }
    renderChallenges();
  }

  // Auto-check challenges after code execution.
  const runBtn = document.getElementById("runBtn");
  if (runBtn) {
    runBtn.addEventListener("click", function () {
      // Reset captured output before each run.
      window.capturedOutput = "";
      // Delay slightly to allow Pyodide to process the executed code.
      setTimeout(checkChallenges, 500);
    });
  }

  // Initial render of challenges on page load.
  renderChallenges();
});

