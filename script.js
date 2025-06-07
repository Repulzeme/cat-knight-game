let xp = parseInt(localStorage.getItem("xp")) || 0;
let lastPlayedDate = localStorage.getItem("lastPlayedDate") || "";
let streak = parseInt(localStorage.getItem("streak")) || 0;
let questionsData = {};
let currentZone = "";
let currentDifficulty = "";
let currentQuestion = null;
let usedEliminate = false;
let usedHint = false;
let remainingQuestions = [];


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

function isDifficultyUnlocked(difficulty, zone) {
  const completedZones = JSON.parse(localStorage.getItem("completedZones") || "{}");
  const levels = completedZones[zone] || [];

  if (difficulty === "scholar") {
    return levels.includes("novice");
  } else if (difficulty === "wizard") {
    return levels.includes("scholar");
  }

  return true; // Novice is always unlocked
}

function isSpellUnlocked(spellName) {
  const condition = unlockConditions[spellName];
  if (!condition) return false;

  const hasXP = xp >= condition.xp;

  const completedZones = JSON.parse(localStorage.getItem("completedZones") || "{}");
  const allZones = Object.keys(questionsData);

  const hasCompletedAll = allZones.every(zone =>
    completedZones[zone]?.includes(condition.zonesCompleted)
  );

  return hasXP || hasCompletedAll;
}

function updateSpellDisplay() {
  const hintBtn = document.getElementById("hint-btn");
  const eliminateBtn = document.getElementById("eliminate-btn");

  const hintMsg = document.getElementById("hint-msg");
  const eliminateMsg = document.getElementById("eliminate-msg");

  if (isSpellUnlocked("hint")) {
    hintBtn.disabled = false;
    hintMsg.textContent = "✅ Hint unlocked!";
  } else {
    hintBtn.disabled = true;
    hintMsg.textContent = "🔒 Hint unlocks at 200 XP or all Novice zones";
  }

  if (isSpellUnlocked("eliminate")) {
    eliminateBtn.disabled = false;
    eliminateMsg.textContent = "✅ Eliminate unlocked!";
  } else {
    eliminateBtn.disabled = true;
    eliminateMsg.textContent = "🔒 Eliminate unlocks at 500 XP or all Scholar zones";
  }
}

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
      updateSpellDisplay();
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
if (!isDifficultyUnlocked(level.toLowerCase(), zone)) {
  btn.disabled = true;
  btn.classList.add("locked");
}
    btn.onclick = () => startQuiz(zone, level.toLowerCase());
    difficultyButtons.appendChild(btn);
  });
}

function hasCompletedLevel(zone, difficulty, questionText) {
  const completed = JSON.parse(localStorage.getItem("completedQuestions") || "{}");
  return completed?.[zone]?.[difficulty]?.includes(questionText);
}

function startQuiz(zone, difficulty) {
  const questions = questionsData[zone][difficulty];

  const pool = questions; // ✅ Define the missing variable

  // Filter out already completed questions
  const unansweredPool = pool.filter(q => !hasCompletedLevel(zone, difficulty, q.question));

  if (unansweredPool.length === 0) {
    document.getElementById("question-container").innerHTML = "<p>No more questions available for this difficulty.</p>";
    return;
  }

  // Pick random question from the remaining ones
  currentQuestion = unansweredPool[Math.floor(Math.random() * unansweredPool.length)];

  showScreen("question-screen");
  renderQuestion();
}

function loadNextQuestion() {
  if (remainingQuestions.length === 0) {
    alert("You've answered all questions in this set!");
    goToMain();
    return;
  }

  const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
  currentQuestion = remainingQuestions.splice(randomIndex, 1)[0]; // remove from pool
  renderQuestion();
}

function renderQuestion() {
  const q = currentQuestion;

  const questionTextDiv = document.getElementById("question-text");
  questionTextDiv.textContent = q.question;

  const answersHTML = q.options
    .map(opt => {
      const isCorrect = opt === q.answer;
      return `<button onclick="selectAnswer(this, '${opt.replace(/'/g, "\\'")}')" class="answer-btn" data-correct="${isCorrect}">${opt}</button>`;
    })
    .join("");

  const container = document.getElementById("question-container");
  container.innerHTML = `
    <div class="answers">${answersHTML}</div>
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

  const selectedBtn = button;
  const allAnswers = Array.from(document.querySelectorAll("#question-container button"));

  // Hide unselected buttons
  allAnswers.forEach(btn => {
    if (btn !== selectedBtn) {
      btn.style.display = "none";
    }
  });

  selectedBtn.classList.add("bounce-answer");

  if (isCorrect) {
    selectedBtn.classList.add("correct");
    const xpGain = getXPGain(currentDifficulty);
    xp += xpGain;
    showXPGainBubble(xpGain);
    showFeedback("✅ Correct!", true);
    updateSpellDisplay();
  } else {
    selectedBtn.classList.add("wrong");
    showFeedback("❌ Wrong!", false);
  }

  // Hide back button (optional, you can skip this if you want it to stay)
  document.getElementById("back-btn").style.display = "none";

  // Save completed question
  const completed = JSON.parse(localStorage.getItem("completedQuestions") || "{}");
  if (!completed[currentZone]) completed[currentZone] = {};
  if (!completed[currentZone][currentDifficulty]) completed[currentZone][currentDifficulty] = [];
  if (!completed[currentZone][currentDifficulty].includes(currentQuestion.question)) {
    completed[currentZone][currentDifficulty].push(currentQuestion.question);
    localStorage.setItem("completedQuestions", JSON.stringify(completed));
  }

  checkStreak();
}
    
function showFeedback(message, isCorrect) {
  const feedback = document.getElementById("feedback-message");
  feedback.textContent = message;

  feedback.classList.remove("correct", "wrong", "show");
  feedback.offsetWidth; // Force reflow for animation reset

  if (isCorrect) {
    feedback.classList.add("correct");
  } else {
    feedback.classList.add("wrong");
  }

  feedback.classList.add("show");

  setTimeout(() => {
    feedback.classList.remove("show");
  }, 2900);
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

function showScreen(screenId) {
  const screens = document.querySelectorAll("section");
  screens.forEach(screen => {
    if (screen.id === screenId) {
      screen.classList.remove("hidden");
    } else {
      screen.classList.add("hidden");
    }
  });
}

window.onload = () => {
  loadQuestions();

  // Define your global functions here if needed
  window.startQuiz = startQuiz;
  window.showScreen = showScreen;
  window.renderQuestion = renderQuestion;
  window.selectAnswer = selectAnswer;
};
