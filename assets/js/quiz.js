document.addEventListener("DOMContentLoaded", function() {
    // Get the quiz JSON file name from the data attribute on the <html> element.
    const quizFile = document.documentElement.dataset.quiz; // e.g., "unit-0_quiz.json"
    // Use the document title as the quiz name.
    const quizName = document.title;
  
    // Load quiz questions from the JSON file.
    fetch(`../assets/data/quiz/${quizFile}`)
      .then(response => response.json())
      .then(data => {
        const quizData = data.questions; // JSON should be structured with a "questions" array.
        // Initialize each question with an attempts counter.
        quizData.forEach(q => q.attempts = 0);
        
        let currentQuestionIndex = 0;
        
        const quizQuestionEl = document.getElementById("quiz-question");
        const quizOptionsEl = document.getElementById("quiz-options");
        const quizFeedbackEl = document.getElementById("quiz-feedback");
        const nextBtn = document.getElementById("nextBtn");
        
        // Load and display the current question.
        function loadQuestion() {
          const currentData = quizData[currentQuestionIndex];
          quizQuestionEl.textContent = currentData.question;
          quizOptionsEl.innerHTML = "";
          quizFeedbackEl.innerHTML = ""; // clear feedback area
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
        
        // Check the selected answer, increment attempts, and provide immediate feedback.
        function checkAnswer(selected, button) {
          const currentData = quizData[currentQuestionIndex];
          // Increment the attempts counter for this question
          currentData.attempts++;
          
          if (selected === currentData.correctAnswer) {
            button.classList.add("correct");
            quizFeedbackEl.textContent = "Correct! Look at that, great job!";
            // Disable all options after a correct answer.
            document.querySelectorAll(".quiz-option").forEach(btn => btn.disabled = true);
            nextBtn.style.display = "block";
          } else {
            button.classList.add("incorrect");
            quizFeedbackEl.textContent = "Oops! That's not correct. Try again.";
          }
        }
        
        // When all questions are done, display a detailed score report.
        function displayScoreReport() {
          let totalAttempts = 0;
          // Start the report with the quiz name.
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
        
          // Display the score report in the feedback container.
          quizFeedbackEl.innerHTML = reportHTML;
        
          // Create a Download PDF button to prompt a download of the score report.
          const downloadBtn = document.createElement("button");
          downloadBtn.id = "downloadPdfBtn";
          downloadBtn.textContent = "Download PDF Report";
          downloadBtn.classList.add("next-button"); // Reuse existing styling
          downloadBtn.style.display = "block";
          downloadBtn.style.marginTop = "1rem";
        
          downloadBtn.addEventListener("click", function () {
            generatePdfScoreReport(reportText);
          });
        
          quizFeedbackEl.appendChild(downloadBtn);
        }
            
        function generatePdfScoreReport(reportText) {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
        
          // Add a title.
          doc.setFontSize(16);
          doc.text(`Score Report for "${quizName}"`, 10, 20);
        
          // Split the report text into lines that fit within the page width.
          const lines = doc.splitTextToSize(reportText, 180);
          doc.setFontSize(12);
          doc.text(lines, 10, 30);
        
          // Trigger the PDF download.
          doc.save("score-report.pdf");
        }          
        
        // Advance to the next question or finish the quiz.
        nextBtn.addEventListener("click", () => {
          currentQuestionIndex++;
          if (currentQuestionIndex < quizData.length) {
            loadQuestion();
          } else {
            // All questions completed; show score report.
            quizFeedbackEl.innerHTML = "";
            displayScoreReport();
            nextBtn.style.display = "none";
          }
        });
        
        // Load the first question.
        loadQuestion();
      })
      .catch(err => {
        console.error("Error loading quiz data:", err);
      });
  });
  