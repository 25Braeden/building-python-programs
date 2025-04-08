// assets/js/challenges.js
import { getFirestore, doc, updateDoc, arrayUnion, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { app } from "./firebase-init.js";

const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("challenges-container");
  if (!container) return;

  // The unit id is determined by the data attribute on the body tag.
  const unitId = document.body.dataset.unit;
  console.log("Unit ID:", unitId);

  // Fetch configuration for the unit.
  // If your unit-config.json is in the project root, change the path to "../unit-config.json"
  const configResponse = await fetch(`../assets/data/config/unit-config.json`);
  const configData = await configResponse.json();
  const NEXT_BUTTON_TARGET = configData[unitId] ? configData[unitId].next : null;

  try {
    const response = await fetch(`../assets/data/challenges/${unitId}.json`);
    const challengeData = await response.json();

    // Wait for authentication state to be ready.
    let savedChallenges = [];
    const user = await new Promise(resolve => {
      onAuthStateChanged(auth, (user) => resolve(user));
    });

    if (user) {
      const uid = user.uid;
      const userDocRef = doc(db, "userProgress", uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists() && docSnap.data().challenges && docSnap.data().challenges[unitId]) {
        savedChallenges = docSnap.data().challenges[unitId];
        console.log("Saved challenges for unit", unitId, ":", savedChallenges);
      } else {
        console.log("No saved challenges found for unit", unitId);
      }
    } else {
      console.warn("No authenticated user found.");
    }

    // Process JSON to create challenge objects.
    const challenges = challengeData.map(challenge => ({
      id: challenge.id,
      prompt: challenge.prompt,
      solved: savedChallenges.includes(challenge.id),
      check: async function () {
        try {
          let outputCheck = true;
          let varCheck = true;
          let patternCheck = true;
          const conditions = [];
          
          // Check expected printed output.
          if (challenge.expectedOutput) {
            const output = (window.capturedOutput || "")
              .replace(/\r?\n>>> /g, "")
              .trim();
            outputCheck = (output === challenge.expectedOutput);
            conditions.push(outputCheck);
          }
          
          // Check expected variable value.
          if (challenge.expectedVar) {
            const expected = challenge.expectedOutput || challenge.expected;
            const variableName = challenge.expectedVar;
            const value = await window.pyodide.globals.get(variableName);
            varCheck = (value != null && value.toString() === expected.toString());
            conditions.push(varCheck);
          }
          
          // Check required code pattern.
          if (challenge.requiredPattern) {
            const code = window.editor.getValue() || "";
            const regex = new RegExp(challenge.requiredPattern, "s");
            patternCheck = regex.test(code);
            conditions.push(patternCheck);
          }
          
          if (conditions.length > 0) {
            return conditions.every(cond => cond === true);
          }
          
          // Fallback check.
          const varRegex = /variable\s+(?:named|called)\s+['"]([^'"]+)['"]/i;
          const match = challenge.prompt.match(varRegex);
          if (match && match[1]) {
            const variableName = match[1];
            const value = await window.pyodide.globals.get(variableName);
            return value.toString() === (challenge.expected || "");
          } else {
            return false;
          }
        } catch (e) {
          console.error("Error in challenge check:", e);
          return false;
        }
      }
    }));

    // Save challenge progress helper.
    async function saveChallengeProgress(challengeId) {
      const user = auth.currentUser;
      if (!user) return;
      const uid = user.uid;
      const userDocRef = doc(db, "userProgress", uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, { challenges: {} });
      }
      await updateDoc(userDocRef, {
        [`challenges.${unitId}`]: arrayUnion(challengeId)
      });
      console.log(`Saved challenge ${challengeId} for unit ${unitId}`);
    }

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
            await saveChallengeProgress(challenges[i].id);
          }
        }
      }
      renderChallenges();
      checkAllChallengesComplete();
    }

    function checkAllChallengesComplete() {
      if (challenges.every(challenge => challenge.solved)) {
        let nextButton = document.getElementById("nextBtn");
        if (!nextButton && NEXT_BUTTON_TARGET) {
          nextButton = document.createElement("button");
          nextButton.id = "nextBtn";
          nextButton.textContent = "Next";
          nextButton.classList.add("button", "next-button");
          nextButton.addEventListener("click", function () {
            window.location.href = NEXT_BUTTON_TARGET;
          });
          container.appendChild(nextButton);
        } else if (!NEXT_BUTTON_TARGET) {
          console.warn("No next target defined in configuration.");
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
    checkAllChallengesComplete();
  } catch (error) {
    console.error("Error loading challenge data:", error);
  }
});
