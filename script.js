let xp = parseInt(localStorage.getItem("xp")) || 0;
let lastPlayedDate = localStorage.getItem("lastPlayedDate") || "";
let streak = parseInt(localStorage.getItem("streak")) || 0;
let questionsData = {};
let currentZone = "";
let currentDifficulty = "";
let currentQuestion = null;
let usedEliminate = false;
let usedHint = false;

const xpDisplay = document.getElementById("xp-stats");
const zoneButtons = document.getElementById("zone-buttons");
const difficultyScreen = document.getElementById("difficulty-screen");
const questionScreen = document.getElementById("question-screen");
const mainScreen = document.getElementById("main-screen");
const difficultyButtons = document.getElementById("difficulty-buttons");
const zoneTitle = document.getElementById("zone-title");
const questionContainer = document.getElementById("question-container");

function updateStats() {
  xpDisplay.textContent = `🔥 XP: ${xp} 📚 Streak: ${streak}`;
  localStorage.setItem("xp", xp);
  localStorage.setItem("streak", streak);
}

function loadQuestions() {
  fetch("questions.json")
    .then((res) => res.json())
    .then((data) => {
      questionsData = data;
      renderZones();
      updateStats();
      checkStreak();
    });
}

function renderZones() {
  const zones = {
    geography: "🌍 The Compass Grove",
    history: "📜 The Timekeep Vault",
    sports: "🏟️ The Grand Arena",
    entertainment: "🎭 Forest of Flickers",
    daily: "✨ Daily Mix"
  };
  zoneButtons.innerHTML = "";
  for (const key in zones) {
    const btn = document.createElement("button");
    btn.textContent = zones[key];
    btn.onclick = () => showDifficulties(key);
    zoneButtons.appendChild(btn);
  }
}

function showDifficulties(zone) {
  currentZone = zone;
  mainScreen.classList.add("hidden");
  difficultyScreen.classList.remove("hidden");
  zoneTitle.textContent = `Choose your challenge in ${zone}`;
  difficultyButtons.innerHTML = "";

  const difficulties = ["Novice", "Scholar", "Wizard"];
  const xpNeeded = { Scholar: 10, Wizard: 25 };

  difficulties.forEach((level) => {
    const btn = document.createElement("button");
    btn.textContent = level;
    const requiredXP = xpNeeded[level];
    if (requiredXP && xp < requiredXP) {
      btn.disabled = true;
      btn.classList.add("locked");
    }
    btn.onclick = () => startQuiz(zone, level.toLowerCase());
    difficultyButtons.appendChild(btn);
  });
}

function startQuiz(zone, difficulty) {
  const questions = questionsData[zone]?.[difficulty];
  if (!questions || questions.length === 0) {
    alert("No questions available.");
    return;
  }
  currentDifficulty = difficulty;
  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex];
  usedEliminate = false;
  usedHint = false;
  difficultyScreen.classList.add("hidden");
  questionScreen.classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  const q = currentQuestion;
  questionContainer.innerHTML = `
    <h3>${q.question}</h3>
    <div class="answers">
      ${q.options
        .map(
          (opt, i) =>
            `<button onclick="selectAnswer(${i})" id="opt-${i}">${opt}</button>`
        )
        .join("")}
    </div>
    <div id="hint-msg"></div>
  `;
}

function selectAnswer(index) {
  const correct = currentQuestion.correct;
  const buttons = document.querySelectorAll("#question-container button");

  // Disable all buttons
  buttons.forEach((btn) => btn.disabled = true);

  // Highlight correct and selected
  if (index === correct) {
    buttons[index].classList.add("correct");
    const xpGained = currentDifficulty === "novice" ? 10 :
                     currentDifficulty === "scholar" ? 15 : 20;
    xp += xpGained;
    localStorage.setItem("xp", xp);
    updateStats();

    showFeedback(`✅ Correct! You earned ${xpGained} XP.`);
  } else {
    buttons[index].classList.add("wrong");
    buttons[correct].classList.add("correct");
    showFeedback("❌ Wrong answer.");
  }

  // Auto return to main after delay
  setTimeout(() => {
    questionScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");
    renderZones();
  }, 2000);
}

function showFeedback(message) {
  let feedback = document.getElementById("feedback-message");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.id = "feedback-message";
    const container = document.querySelector(".answers");
    if (container) {
      container.parentNode.insertBefore(feedback, container.nextSibling);
    }
  }
  feedback.textContent = message;
}

function goToMain() {
  questionScreen.classList.add("hidden");
  difficultyScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");
  renderZones();
}

function useHint() {
  if (usedHint) return;
  usedHint = true;
  const hintBox = document.getElementById("hint-msg");
  hintBox.textContent = `💡 Hint: ${currentQuestion.hint || "No hint available."}`;
}

function useEliminate() {
  if (usedEliminate) return;
  usedEliminate = true;
  const buttons = document.querySelectorAll(".answers button");
  const wrongIndexes = [...buttons]
    .map((btn, i) => i)
    .filter((i) => i !== currentQuestion.correct);
  const toHide = wrongIndexes[Math.floor(Math.random() * wrongIndexes.length)];
  buttons[toHide].style.display = "none";
}

function checkStreak() {
  const today = new Date().toISOString().split("T")[0];
  if (lastPlayedDate !== today) {
    streak += 1;
    lastPlayedDate = today;
    localStorage.setItem("lastPlayedDate", today);
    localStorage.setItem("streak", streak);
  }
}

window.onload = loadQuestions;
