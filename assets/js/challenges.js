document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("challenges-container");
  if (!container) return;

  // The unit id for the current lesson
  const unitId = document.body.dataset.unit;

  // Load configuration for the unit
  const configResponse = await fetch(`../assets/data/config/unit-config.json`);
  const configData = await configResponse.json();
  const NEXT_BUTTON_TARGET = configData[unitId].next;

  try {
    const response = await fetch(`../assets/data/challenges/${unitId}.json`);
    const challengeData = await response.json();

    // Process JSON to create challenge objects.
    const challenges = challengeData.map(challenge => ({
      id: challenge.id,
      prompt: challenge.prompt,
      check: async function () {
        try {
          if (challenge.expectedOutput || challenge.prompt.toLowerCase().includes("print")) {
            const output = (window.capturedOutput || "")
              .replace(/\r?\n>>> /g, "")
              .trim();
            return output === (challenge.expectedOutput || "");
          } else {
            const varRegex = /variable\s+(?:named|called)\s+['"]([^'"]+)['"]/i;
            const match = challenge.prompt.match(varRegex);
            if (match && match[1]) {
              const variableName = match[1];
              const value = await window.pyodide.globals.get(variableName);
              return value.toString() === (challenge.expected || "");
            } else {
              return false;
            }
          }
        } catch (e) {
          return false;
        }
      },
      solved: false
    }));

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
        statusIndicator.innerHTML = challenge.solved
          ? "✓"
          : challengeDiv.classList.contains("locked")
          ? "🔒"
          : "○";
        challengeDiv.appendChild(statusIndicator);

        const promptSpan = document.createElement("span");
        promptSpan.className = "prompt";
        promptSpan.textContent = challenge.prompt;
        challengeDiv.appendChild(promptSpan);

        const messageSpan = document.createElement("span");
        messageSpan.className = "challenge-message";
        messageSpan.textContent = challenge.solved
          ? "Completed!"
          : challengeDiv.classList.contains("locked")
          ? "Locked"
          : "Pending...";
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
      checkAllChallengesComplete();
    }

    function checkAllChallengesComplete() {
      if (challenges.every(challenge => challenge.solved)) {
        let nextButton = document.getElementById("nextBtn");
        if (!nextButton) {
          nextButton = document.createElement("button");
          nextButton.id = "nextBtn";
          nextButton.textContent = "Next";
          nextButton.classList.add("button", "next-button");
          nextButton.addEventListener("click", function () {
            window.location.href = NEXT_BUTTON_TARGET;
          });
          container.appendChild(nextButton);
        }
      }
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
