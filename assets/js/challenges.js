document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("challenges-container");
  if (!container) return;

  // Determine which unit is active; here we assume unit-0 as an example.
  const unitId = "unit-0";
  try {
    const response = await fetch(`../assets/data/challenges/${unitId}.json`);
    const challengeData = await response.json();

    // Process JSON to create challenge objects.
    const challenges = challengeData.map(challenge => ({
      id: challenge.id,
      prompt: challenge.prompt,
      // Define a check function that uses the expected value.
      check: async function () {
        try {
          const value = await window.pyodide.globals.get(challenge.prompt.includes("x") ? "x" : "message");
          return value.toString() === challenge.expected;
        } catch (e) {
          return false;
        }
      },
      solved: false
    }));

    // Render the challenges.
    function renderChallenges() {
      container.innerHTML = "<h3>Challenges</h3>";
      challenges.forEach((challenge, index) => {
        const challengeDiv = document.createElement("div");
        challengeDiv.className = "challenge";
        if (index > 0 && !challenges[index - 1].solved) {
          challengeDiv.classList.add("locked");
        }
        if (challenge.solved) {
          challengeDiv.classList.add("completed");
        }
        const statusIndicator = document.createElement("span");
        statusIndicator.className = "status-indicator";
        statusIndicator.innerHTML = challenge.solved ? "✓" : (challengeDiv.classList.contains("locked") ? "🔒" : "○");
        challengeDiv.appendChild(statusIndicator);

        const promptSpan = document.createElement("span");
        promptSpan.className = "prompt";
        promptSpan.textContent = challenge.prompt;
        challengeDiv.appendChild(promptSpan);

        const messageSpan = document.createElement("span");
        messageSpan.className = "challenge-message";
        messageSpan.textContent = challenge.solved ? "Completed!" : (challengeDiv.classList.contains("locked") ? "Locked" : "Pending...");
        challengeDiv.appendChild(messageSpan);

        container.appendChild(challengeDiv);
      });
    }

    async function checkChallenges() {
      for (let i = 0; i < challenges.length; i++) {
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

    const runBtn = document.getElementById("runBtn");
    if (runBtn) {
      runBtn.addEventListener("click", function () {
        window.capturedOutput = "";
        setTimeout(checkChallenges, 500);
      });
    }
    renderChallenges();
  } catch (error) {
    console.error("Error loading challenge data:", error);
  }
});
