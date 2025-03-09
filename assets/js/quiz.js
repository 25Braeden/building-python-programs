// assets/js/quiz.js
import { getFirestore, doc, updateDoc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { app } from "./firebase-init.js";

const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
  const quizFile = document.documentElement.dataset.quiz; // e.g., "unit-0_quiz.json"
  const quizKey = quizFile.replace('.json', ''); // use "unit-0_quiz" as the key
  const quizName = document.title;
  console.log("Quiz file from data attribute:", quizFile);
  
  // Fetch the quiz JSON data.
  fetch(`../assets/data/quiz/${quizFile}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch quiz data.");
      }
      return response.json();
    })
    .then(async data => {
      const quizData = data.questions;
      // Initialize each question with an attempts counter.
      quizData.forEach(q => (q.attempts = 0));
      
      let currentQuestionIndex = 0;
      
      const quizQuestionEl = document.getElementById("quiz-question");
      const quizOptionsEl = document.getElementById("quiz-options");
      const quizFeedbackEl = document.getElementById("quiz-feedback");
      const nextBtn = document.getElementById("nextBtn");
      
      // Hide the next button initially.
      nextBtn.style.display = "none";
      
      // Wait for the authentication state to be ready.
      const user = await new Promise(resolve => {
        onAuthStateChanged(auth, (user) => resolve(user));
      });
      
      if (user) {
        const uid = user.uid;
        const userDocRef = doc(db, "userProgress", uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().quizProgress && docSnap.data().quizProgress[quizKey]) {
          const stored = docSnap.data().quizProgress[quizKey];
          console.log("Loaded quiz progress:", stored);
          currentQuestionIndex = stored.currentQuestionIndex;
          // Restore attempt counts for each question.
          if (stored.attempts && Array.isArray(stored.attempts)) {
            quizData.forEach((q, i) => {
              if (stored.attempts[i] !== undefined) {
                q.attempts = stored.attempts[i];
              }
            });
          }
          if (stored.complete) {
            // If quiz is complete, show the score report immediately.
            displayScoreReport();
            return;
          }
        }
      } else {
        console.warn("No authenticated user found.");
      }
      
      // --- Function to save quiz progress ---
      async function saveQuizProgress() {
        const progress = {
          currentQuestionIndex,
          attempts: quizData.map(q => q.attempts),
          complete: false
        };
        const user = auth.currentUser;
        if (!user) return;
        const uid = user.uid;
        const userDocRef = doc(db, "userProgress", uid);
        // Ensure the document exists with a quizProgress field.
        await setDoc(userDocRef, { quizProgress: {} }, { merge: true });
        await updateDoc(userDocRef, {
          [`quizProgress.${quizKey}`]: progress
        })
          .then(() => {
            console.log("Quiz progress saved:", progress);
          })
          .catch(err => {
            console.error("Error saving quiz progress:", err);
          });
      }
      
      // --- Function to load a question ---
      function loadQuestion() {
        console.log("Loading question at index:", currentQuestionIndex);
        const currentData = quizData[currentQuestionIndex];
        if (!currentData) {
          console.error("No question found at index:", currentQuestionIndex);
          return;
        }
        quizQuestionEl.textContent = currentData.question;
        quizOptionsEl.innerHTML = "";
        quizFeedbackEl.innerHTML = "";
        nextBtn.style.display = "none";
        
        currentData.options.forEach(option => {
          const li = document.createElement("li");
          const button = document.createElement("button");
          button.textContent = option;
          button.className = "quiz-option";
          button.addEventListener("click", () => checkAnswer(option, button));
          li.appendChild(button);
          quizOptionsEl.appendChild(li);
        });
      }
      
      // --- Function to check the answer ---
      function checkAnswer(selected, button) {
        const currentData = quizData[currentQuestionIndex];
        currentData.attempts++;
        saveQuizProgress(); // Save progress after each attempt.
        if (selected === currentData.correctAnswer) {
          button.classList.add("correct");
          quizFeedbackEl.textContent = "Correct! Look at that, great job!";
          document.querySelectorAll(".quiz-option").forEach(btn => btn.disabled = true);
          nextBtn.style.display = "block";
        } else {
          button.classList.add("incorrect");
          quizFeedbackEl.textContent = "Oops! That's not correct. Try again.";
        }
      }
      
      // --- Function to display the score report ---
      function displayScoreReport() {
        let totalAttempts = 0;
        let reportHTML = `<h3>Score Report for "${quizName}"</h3><ul>`;
        let reportText = `Score Report for "${quizName}"\n\n`;
        
        quizData.forEach((q, index) => {
          totalAttempts += q.attempts;
          reportHTML += `<li>Question ${index + 1}: Correct in ${q.attempts} attempt${q.attempts > 1 ? "s" : ""}.</li>`;
          reportText += `Question ${index + 1}: Correct in ${q.attempts} attempt${q.attempts > 1 ? "s" : ""}.\n`;
        });
        reportHTML += "</ul>";
        const avgAttempts = (totalAttempts / quizData.length).toFixed(2);
        reportHTML += `<p><strong>Total Attempts:</strong> ${totalAttempts}</p>`;
        reportHTML += `<p><strong>Average Attempts per Question:</strong> ${avgAttempts}</p>`;
        reportText += `\nTotal Attempts: ${totalAttempts}\nAverage Attempts per Question: ${avgAttempts}\n`;
        
        quizFeedbackEl.innerHTML = reportHTML;
        saveQuizGrade(avgAttempts);
        
        const downloadBtn = document.createElement("button");
        downloadBtn.id = "downloadPdfBtn";
        downloadBtn.textContent = "Download PDF Report";
        downloadBtn.classList.add("next-button");
        downloadBtn.style.display = "block";
        downloadBtn.style.marginTop = "1rem";
        downloadBtn.addEventListener("click", function () {
          generatePdfScoreReport(reportText);
        });
        quizFeedbackEl.appendChild(downloadBtn);
        
        // Mark the quiz progress as complete.
        markQuizComplete();
      }
      
      // --- Function to mark quiz as complete in Firestore ---
      async function markQuizComplete() {
        const user = auth.currentUser;
        if (!user) return;
        const uid = user.uid;
        const userDocRef = doc(db, "userProgress", uid);
        // Ensure the document exists with a quizProgress field.
        await setDoc(userDocRef, { quizProgress: {} }, { merge: true });
        await updateDoc(userDocRef, {
          [`quizProgress.${quizKey}.complete`]: true
        })
          .then(() => {
            console.log("Quiz marked as complete.");
          })
          .catch(err => {
            console.error("Error marking quiz complete:", err);
          });
      }
      
      // --- Function to save quiz grade (final score) ---
      async function saveQuizGrade(avgAttempts) {
        const user = auth.currentUser;
        if (!user) return;
        const uid = user.uid;
        const userDocRef = doc(db, "userProgress", uid);
        // Ensure the document exists with a quizzes field.
        await setDoc(userDocRef, { quizzes: {} }, { merge: true });
        await updateDoc(userDocRef, {
          "quizzes.unit-0": avgAttempts
        });
      }
      
      // --- Function to generate a PDF score report ---
      function generatePdfScoreReport(reportText) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Score Report for "${quizName}"`, 10, 20);
        const lines = doc.splitTextToSize(reportText, 180);
        doc.setFontSize(12);
        doc.text(lines, 10, 30);
        doc.save("score-report.pdf");
      }
      
      // --- Next button event listener ---
      nextBtn.addEventListener("click", () => {
        currentQuestionIndex++;
        saveQuizProgress();
        if (currentQuestionIndex < quizData.length) {
          loadQuestion();
        } else {
          displayScoreReport();
          nextBtn.style.display = "none";
        }
      });
      
      // --- Start the quiz ---
      if (currentQuestionIndex < quizData.length) {
        loadQuestion();
      } else {
        displayScoreReport();
      }
    })
    .catch(err => {
      console.error("Error loading quiz data:", err);
    });
});
