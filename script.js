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

const unlockConditions = {
  hint: {
    xp: 200,
    zonesCompleted: "novice"
  },
  eliminate: {
    xp: 500,
    zonesCompleted: "scholar"
  }
};

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
        .map(opt => {
          const isCorrect = opt === q.answer;
          return `<button onclick="selectAnswer(this, '${opt.replace(/'/g, "\\'")}')" class="answer-btn" data-correct="${isCorrect}">${opt}</button>`;
        })
        .join("")}
    </div>
    <div id="hint-msg"></div>
  `;
}

function getXPGain(difficulty) {
  switch (difficulty) {
    case 'novice': return 10;
    case 'scholar': return 20;
    case 'wizard': return 30;
    default: return 0;
  }
}

function showXPGainBubble(xp) {
  const bubble = document.createElement("div");
  bubble.className = "xp-float";
  bubble.textContent = `+${xp} XP`;
  document.body.appendChild(bubble);

  // Trigger animation
  setTimeout(() => bubble.classList.add("show"), 10);

  // Remove after animation
  setTimeout(() => {
    bubble.remove();
  }, 2000);
}

function selectAnswer(button, selectedOption) {
  const allButtons = Array.from(document.querySelectorAll("#question-container button"));
  allButtons.forEach(btn => btn.disabled = true);

  const correctOption = currentQuestion.answer;
  const isCorrect = selectedOption.trim().toLowerCase() === correctOption.trim().toLowerCase();

  if (isCorrect) {
    button.classList.add("correct");
    showFeedback("✅ Correct!");
    xp += getXPGain(currentDifficulty); // optional function
    showXPGainBubble(xp);
  } else {
    button.classList.add("wrong");
    showFeedback("❌ Wrong!");

    // Highlight the correct button
    const correctBtn = allButtons.find(btn => btn.textContent === correctOption);
    if (correctBtn) correctBtn.classList.add("correct");
  }

  updateStats();

  setTimeout(() => {
    goToMain();
  }, 1500);
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

  const buttons = Array.from(document.querySelectorAll("#question-container .answer-btn"));
  const wrongButtons = buttons.filter(btn => btn.dataset.correct !== "true");

  if (wrongButtons.length < 2) return;

  const toRemove = [];
  while (toRemove.length < 2) {
    const rand = wrongButtons[Math.floor(Math.random() * wrongButtons.length)];
    if (!toRemove.includes(rand)) toRemove.push(rand);
  }

  toRemove.forEach(btn => btn.classList.add("hidden"));
  usedEliminate = true;
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
