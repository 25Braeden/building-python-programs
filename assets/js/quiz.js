document.addEventListener("DOMContentLoaded", function() {
    // Get the quiz JSON file name from the data attribute on the <html> element.
    const quizFile = document.documentElement.dataset.quiz; // e.g., "unit-0_quiz.json"
    
    // Load quiz questions from the JSON file.
    fetch(`../assets/data/quiz/${quizFile}`)
      .then(response => response.json())
      .then(data => {
        const quizData = data.questions; // JSON should be structured with a "questions" array.
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
          quizFeedbackEl.textContent = "";
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
        
        // Check the selected answer and provide immediate feedback.
        function checkAnswer(selected, button) {
          const currentData = quizData[currentQuestionIndex];
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
        
        // Advance to the next question or finish the quiz.
        nextBtn.addEventListener("click", () => {
          currentQuestionIndex++;
          if (currentQuestionIndex < quizData.length) {
            loadQuestion();
          } else {
            quizFeedbackEl.textContent = "Quiz completed! Great work!";
            nextBtn.style.display = "none";
            // Optionally, redirect to the next lesson page:
            // window.location.href = "next_lesson.html";
          }
        });
        
        // Load the first question.
        loadQuestion();
      })
      .catch(err => {
        console.error("Error loading quiz data:", err);
      });
  });
  