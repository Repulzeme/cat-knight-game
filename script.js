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
let attemptCount = 0;
let unlockedSpells = JSON.parse(localStorage.getItem("unlockedSpells")) || [];

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

function checkAllZonesCompleted(difficulty) {
  const completedZones = JSON.parse(localStorage.getItem("completedZones")) || {};
  const zones = Object.keys(questionsData);
  return zones.every(zone => completedZones[zone]?.includes(difficulty));
}

function isDifficultyUnlocked(difficulty, zone) {
  const completedZones = JSON.parse(localStorage.getItem("completedZones") || "{}");
  const levels = completedZones[zone] || [];

  const unlockedDifficulties = JSON.parse(localStorage.getItem("unlockedDifficulties")) || [];

  if (difficulty === "scholar") {
    return levels.includes("novice") || unlockedDifficulties.includes("scholar");
  } else if (difficulty === "wizard") {
    return levels.includes("scholar") || unlockedDifficulties.includes("wizard");
  }

  return true; // Novice always unlocked
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
    hintMsg.textContent = "🔒 Hint unlocks at 200 Knowledge or all Novice zones";
  }

  if (isSpellUnlocked("eliminate")) {
    eliminateBtn.disabled = false;
    eliminateMsg.textContent = "✅ Eliminate unlocked!";
  } else {
    eliminateBtn.disabled = true;
    eliminateMsg.textContent = "🔒 Eliminate unlocks at 500 Knowledge or all Scholar zones";
  }
}

function updateStats() {
  xpDisplay.textContent = `📚 Knowledge: ${xp} 🔥 Streak: ${streak}`;
  localStorage.setItem("xp", xp);
  localStorage.setItem("streak", streak);
}

function loadQuestions() {
  // ♻️ Reset spell buttons and messages
  document.getElementById("hint-btn").classList.remove("hidden");
  document.getElementById("eliminate-btn").classList.remove("hidden");
  document.getElementById("hint-msg").classList.remove("hidden");
  document.getElementById("eliminate-msg").classList.remove("hidden");
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
    btn.setAttribute("onclick", `startQuiz('${zone}', '${level.toLowerCase()}')`);
    difficultyButtons.appendChild(btn);
  });
}

function hasCompletedLevel(zone, difficulty, questionText) {
  const completed = JSON.parse(localStorage.getItem("completedQuestions") || "{}");
  return completed?.[zone]?.[difficulty]?.includes(questionText);
}

function startQuiz(zone, difficulty) {
  currentZone = zone;
  currentDifficulty = difficulty;

  const questions = questionsData[zone][difficulty];
  const pool = questions;
  
  const unansweredPool = pool.filter(q => !hasCompletedLevel(zone, difficulty, q.question));

  if (unansweredPool.length === 0) {
    document.getElementById("question-container").innerHTML = "<p>No more questions available for this difficulty.</p>";
    return;
  }

  // Pick random question from the remaining ones
  currentQuestion = unansweredPool[Math.floor(Math.random() * unansweredPool.length)];
  usedHint = false;
  usedEliminate = false;
  
  showScreen("question-screen");
  renderQuestion();
  
  console.log("Quiz started with difficulty:", difficulty);
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
  attemptCount = 0;

  const questionTextDiv = document.getElementById("question-text");
  questionTextDiv.textContent = q.question;

  const hintDiv = document.getElementById("hint-container");
  hintDiv.textContent = "";
  hintDiv.classList.add("hidden");

  const answersHTML = q.options
    .map(opt => {
      const isCorrect = opt === q.answer;
      return `<button onclick="selectAnswer(event)" class="answer-btn" data-answer="${opt}" data-correct="${isCorrect}">${opt}</button>`;
    })
    .join("");

  const answersContainer = document.getElementById("answers-container");
  answersContainer.innerHTML = answersHTML;
}

function getXPGain(difficulty) {
  switch (difficulty) {
    case 'novice': return 10;
    case 'scholar': return 20;
    case 'wizard': return 30;
    default: return 0;
  }
}

function gainXP(amount) {
  xp += amount;
  updateStats();
  showXPGainBubble(amount);
}

function autoShowHint() {
  const q = currentQuestion;
  const hint = q.hint || "Think carefully!"; // fallback if no hint field exists
  const hintDiv = document.getElementById("hint-container");
  hintDiv.textContent = `💡 Hint: ${hint}`;
  hintDiv.classList.remove("hidden");
}

function showXPGainBubble(xp) {
  const bubble = document.createElement("div");
  bubble.className = "xp-float";
  bubble.textContent = `+${xp} Knowledge`;
  document.body.appendChild(bubble);

  // Trigger animation
  setTimeout(() => bubble.classList.add("show"), 10);

  // Remove after animation
  setTimeout(() => {
    bubble.remove();
  }, 2000);
}

function selectAnswer(event) {
  const selectedBtn = event.target;
  const selectedAnswer = selectedBtn.dataset.answer;
  const correctAnswer = currentQuestion.answer;
  const allButtons = document.querySelectorAll("#answers-container button");

  attemptCount++;

  const isCorrect = selectedAnswer === correctAnswer;

  if (isCorrect) {
    selectedBtn.classList.add("correct");

    const xpEarned = (
      attemptCount === 1 ? getXPGain(currentDifficulty) :
      attemptCount === 2 ? Math.floor(getXPGain(currentDifficulty) / 2) :
      Math.floor(getXPGain(currentDifficulty) / 3)
    );
    gainXP(xpEarned);
    checkSpellUnlocks();

    const completedZones = JSON.parse(localStorage.getItem("completedZones")) || {};
    if (!completedZones[currentZone]) completedZones[currentZone] = [];
    if (!completedZones[currentZone].includes(currentDifficulty)) {
      completedZones[currentZone].push(currentDifficulty);
      localStorage.setItem("completedZones", JSON.stringify(completedZones));
    }

    let unlockedDifficulties = JSON.parse(localStorage.getItem("unlockedDifficulties")) || [];
    const unlockedScholar = currentDifficulty === "novice" && checkAllZonesCompleted("novice");
    const unlockedWizard = currentDifficulty === "scholar" && checkAllZonesCompleted("scholar");

    if (unlockedScholar && !unlockedDifficulties.includes("scholar")) unlockedDifficulties.push("scholar");
    if (unlockedWizard && !unlockedDifficulties.includes("wizard")) unlockedDifficulties.push("wizard");

    localStorage.setItem("unlockedDifficulties", JSON.stringify(unlockedDifficulties));

    const streakIncreased = attemptCount === 1;

    showResultScreen(
      true,
      currentQuestion,
      xpEarned,
      streakIncreased,
      unlockedScholar,
      unlockedWizard
    );

} else {
  selectedBtn.classList.add("incorrect");
  selectedBtn.disabled = true;
  selectedBtn.classList.add("fade-out");

 // ❌ Hide spell buttons AND their messages after first wrong try
document.getElementById("hint-btn").classList.add("hidden");
document.getElementById("eliminate-btn").classList.add("hidden");
document.getElementById("hint-msg").classList.add("hidden");
document.getElementById("eliminate-msg").classList.add("hidden");

  if (attemptCount === 2) {
    showFeedback("💡 Here's a hint!", false);
    autoShowHint();
} else if (attemptCount >= 3) {
  showFeedback(`❌ The correct answer was: ${correctAnswer}`, false);

  allButtons.forEach(btn => {
    btn.disabled = true;
    if (btn.classList.contains("incorrect")) {
      btn.style.transition = "opacity 1s ease";
      btn.style.opacity = "0.3";
    }
  });

    // Auto-return to difficulty menu after 2.5s
    setTimeout(() => {
      goToMain();
    }, 2500);
  } else {
    showFeedback("❌ Try again!", false);
  }
  }
}

function showFeedback(message, isCorrect) {
  const feedback = document.getElementById("feedback-message");
  feedback.textContent = message;

  feedback.classList.remove("correct", "wrong", "show", "hidden");
  void feedback.offsetWidth; // 🔁 Force reflow for animation

  if (isCorrect) {
    feedback.classList.add("correct");
  } else {
    feedback.classList.add("wrong");
  }

  feedback.classList.add("show");

  // Optional: auto-hide after delay
  setTimeout(() => {
    feedback.classList.add("hidden");
    feedback.classList.remove("show");
  }, 3000);
}

function goToMain() {
  document.getElementById("main-screen").classList.remove("hidden");
  document.getElementById("difficulty-screen").classList.add("hidden");
  document.getElementById("question-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.add("hidden");
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

function unlockNextDifficulty(zone, difficulty) {
  const completedZones = JSON.parse(localStorage.getItem("completedZones") || "{}");
  if (!completedZones[zone]) completedZones[zone] = [];

  let unlockedScholar = false;
  let unlockedWizard = false;

  if (!completedZones[zone].includes(difficulty)) {
    completedZones[zone].push(difficulty);
    localStorage.setItem("completedZones", JSON.stringify(completedZones));
  }

  if (difficulty === "novice" && !completedZones[zone].includes("scholar")) {
    unlockedScholar = true;
    completedZones[zone].push("scholar");
  }

  if (difficulty === "scholar" && !completedZones[zone].includes("wizard")) {
    unlockedWizard = true;
    completedZones[zone].push("wizard");
  }

  localStorage.setItem("completedZones", JSON.stringify(completedZones));

  return { unlockedScholar, unlockedWizard };
}

function checkSpellUnlocks() {
  const xp = parseInt(localStorage.getItem("xp") || "0", 10);
  const completedZones = JSON.parse(localStorage.getItem("completedZones")) || {};
  const unlockedDifficulties = JSON.parse(localStorage.getItem("unlockedDifficulties")) || [];

  const allZones = ["geography", "history", "sports", "stage", "daily"];
  const scholarZonesCompleted = allZones.every(zone =>
    completedZones[zone] && completedZones[zone].includes("scholar")
  );

  const eliminateUnlocked = xp >= 500 || scholarZonesCompleted;
  const eliminateBtn = document.getElementById("eliminate-btn");
  const eliminateMsg = document.getElementById("eliminate-msg");

  if (eliminateUnlocked) {
    eliminateBtn.classList.remove("hidden");
    eliminateMsg.textContent = "🗑️ Eliminate unlocked!";
    eliminateMsg.classList.remove("hidden");
  } else {
    eliminateBtn.classList.add("hidden");
    eliminateMsg.textContent = "🔒 Eliminate unlocks at 500 Knowledge or all Scholar zones";
    eliminateMsg.classList.remove("hidden");
  }
}

function showResultScreen(isCorrect, questionObj, xpEarned, streakIncreased, unlockedScholar, unlockedWizard) {
  document.getElementById("question-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  document.getElementById("result-feedback").textContent = isCorrect ? "✅ Correct!" : "❌ Wrong!";
  document.getElementById("result-question").textContent = questionObj.question;
  document.getElementById("result-answer").textContent = `Answer: ${questionObj.answer}`;
  document.getElementById("result-knowledge").textContent = xpEarned > 0 ? `📘 +${xpEarned} Knowledge!` : "";

  document.getElementById("result-streak").textContent = streakIncreased ? "🔥 Daily Streak increased!" : "";

  // Optional: rotate fun facts
  const funFacts = [
    "The Eiffel Tower can be 15 cm taller during hot days!",
    "Sharks predate trees by over 200 million years.",
    "Honey never spoils. You could eat 3000-year-old honey!",
    "Octopuses have three hearts and blue blood.",
    "Bananas are berries, but strawberries are not."
  ];
const fact = funFacts.length > 0
  ? funFacts[Math.floor(Math.random() * funFacts.length)]
  : "Did you know? The Cat Knight learns something every day!";
document.getElementById("result-funfact").innerHTML = `💡 <span class="fun-fact-text">Fun Fact: ${fact}</span>`;
document.getElementById("result-unlock").textContent = "";
  
// Show unlock message if any new difficulty was unlocked
if (unlockedScholar || unlockedWizard) {
  const unlocked = [];
  if (unlockedScholar) unlocked.push("Scholar");
  if (unlockedWizard) unlocked.push("Wizard");
  document.getElementById("result-unlock").textContent = `🎉 ${unlocked.join(" & ")} difficulty unlocked!`;
} else {
  document.getElementById("result-unlock").textContent = "";
  
}
setTimeout(() => goToMain(), 7000);
 
}
window.onload = () => {
  loadQuestions();

  // Define your global functions here if needed
  window.startQuiz = startQuiz;
  window.showScreen = showScreen;
  window.renderQuestion = renderQuestion;
  window.selectAnswer = selectAnswer;
};
