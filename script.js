let xp = parseInt(localStorage.getItem("xp")) || 0;
let streak = parseInt(localStorage.getItem("streak")) || 0;
let currentQuestion = null;
let correctIndex = -1;

const xpDisplay = document.getElementById("xp-stats");
const mainScreen = document.getElementById("main-screen");
const questionScreen = document.getElementById("question-screen");
const questionContainer = document.getElementById("question-container");
const spellRow = document.querySelector(".spell-row");

function updateStats() {
  xpDisplay.innerHTML = `🔥 XP: ${xp} 📚 Streak: ${streak}`;
}

function showFeedback(message) {
  const fact = document.createElement("div");
  fact.className = "fact";
  fact.textContent = message;
  questionContainer.appendChild(fact);
}

function selectAnswer(index) {
  const buttons = document.querySelectorAll(".answer-btn");
  if (!buttons || !buttons[index] || !buttons[correctIndex]) return;

  if (index === correctIndex) {
    let xpGained = 10;
    const difficulty = currentQuestion.difficulty;
    if (difficulty === "scholar") xpGained = 15;
    else if (difficulty === "wizard") xpGained = 20;

    xp += xpGained;
    localStorage.setItem("xp", xp);
    streak++;
    localStorage.setItem("streak", streak);
    updateStats();

    buttons[index].classList.add("correct");
    showFeedback(`✅ Correct! You earned ${xpGained} XP.`);
  } else {
    buttons[index].classList.add("wrong");
    buttons[correctIndex].classList.add("correct");
    streak = 0;
    localStorage.setItem("streak", streak);
    updateStats();
    showFeedback("❌ Wrong answer.");
  }

  setTimeout(() => {
    questionScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");
    renderZones();
  }, 2000);
}

function loadQuestion(subject, difficulty) {
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      const questionSet = data[subject]?.[difficulty];
      if (!questionSet || questionSet.length === 0) {
        alert("No questions available.");
        return;
      }

      const question = questionSet[Math.floor(Math.random() * questionSet.length)];
      currentQuestion = question;
      currentQuestion.difficulty = difficulty;

      questionContainer.innerHTML = `<h3>${question.question}</h3>`;

      question.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.textContent = opt;
        btn.onclick = () => selectAnswer(i);
        questionContainer.appendChild(btn);
      });

      correctIndex = question.options.indexOf(question.answer);

      const backBtn = document.createElement("button");
      backBtn.innerHTML = "🧭 Back to Zones";
      backBtn.onclick = () => {
        questionScreen.classList.add("hidden");
        mainScreen.classList.remove("hidden");
        renderZones();
      };
      questionContainer.appendChild(backBtn);

      spellRow.classList.remove("hidden");
      questionScreen.classList.remove("hidden");
      mainScreen.classList.add("hidden");
    });
}
