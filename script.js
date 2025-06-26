let xp = parseInt(localStorage.getItem("xp")) || 0;
let lastPlayedDate = localStorage.getItem("lastPlayedDate") || "";
let streak = parseInt(localStorage.getItem("streak")) || 0;
let questionsData = {};
let currentZone = "";
let currentDifficulty = "";
let currentQuestion = null;
let usedEliminate = false;
let usedHint = false;
let usedHintThisQuestion = false;
let usedEliminateThisQuestion = false;
let remainingQuestions = [];
let attemptCount = 0;
let unlockedSpells = JSON.parse(localStorage.getItem("unlockedSpells")) || [];
let bossQuestions = [];
let bossIndex = 0;

const xpDisplay = document.getElementById("xp-stats");
const zoneButtons = document.getElementById("zone-buttons");
const difficultyScreen = document.getElementById("difficulty-screen");
const questionScreen = document.getElementById("question-screen");
const mainScreen = document.getElementById("main-screen");
const difficultyButtons = document.getElementById("difficulty-buttons");
const zoneTitle = document.getElementById("zone-title");
const questionContainer = document.getElementById("question-container");
const hintBtn = document.getElementById("hint-btn");
const eliminateBtn = document.getElementById("eliminate-btn");
const hintMsg = document.getElementById("hint-msg");
const eliminateMsg = document.getElementById("eliminate-msg");

const castleBossQuestions = [
  {
    question: "Which city is known as the City of Light?",
    answers: ["Rome", "Paris", "Vienna", "Madrid"],
    correct: "Paris",
    fact: "Paris earned this nickname because it was one of the first cities to adopt street lighting."
  },
  {
    question: "Who wrote the play 'Hamlet'?",
    answers: ["Charles Dickens", "Oscar Wilde", "William Shakespeare", "Jane Austen"],
    correct: "William Shakespeare",
    fact: "'Hamlet' is one of Shakespeare's most famous tragedies, written around 1600."
  },
  {
    question: "What is the capital city of Canada?",
    answers: ["Toronto", "Ottawa", "Vancouver", "Montreal"],
    correct: "Ottawa",
    fact: "Ottawa was chosen as a compromise capital, located between English-speaking Toronto and French-speaking Montreal."
  },
  {
    question: "Which sport has positions called 'point guard' and 'center'?",
    answers: ["Football", "Baseball", "Basketball", "Hockey"],
    correct: "Basketball",
    fact: "Basketball was invented by Dr. James Naismith in 1891 to keep students active indoors."
  },
  {
    question: "Which planet is known as the 'Morning Star'?",
    answers: ["Venus", "Mars", "Jupiter", "Mercury"],
    correct: "Venus",
    fact: "Venus is called the 'Morning Star' due to its brightness and visibility just before sunrise."
  }
];

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

function hideAllScreens() {
  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("difficulty-screen").classList.add("hidden");
  document.getElementById("question-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.add("hidden");
  document.getElementById("castle-screen").classList.add("hidden");
}

function updateXPDisplay() {
  xpDisplay.textContent = `🔥 Streak: ${streak} 🧠 Knowledge: ${xp}`;
}

function addCastleButton() {
const castleZone = document.getElementById("castle-zone");
if (castleZone) {
  castleZone.classList.remove("hidden");
  triggerCastleShake();
}
}

function triggerCastleShake() {
  const body = document.body;
  body.classList.add("shake");

  setTimeout(() => {
    body.classList.remove("shake");
  }, 400); // Match animation duration
}

function checkAllZonesCompleted(difficulty) {
  const completedZones = JSON.parse(localStorage.getItem("completedZones")) || {};
  const zones = Object.keys(questionsData);
  return zones.every(zone => completedZones[zone]?.includes(difficulty));
}

function checkCastleUnlock() {
  const allCompleted = Object.values(playerProgress).every(
    zone => zone.novice && zone.scholar && zone.wizard
  );

  if (allCompleted) {
    document.getElementById("castle-screen").classList.remove("hidden");
    console.log("🏰 Castle unlocked!");
  }
}

function startCastleBattle() {
  hideAllScreens();
  document.getElementById("castle-screen").classList.remove("hidden");
  bossIndex = 0;
  renderBossQuestion();
}

function goBackToZones() {
  document.getElementById("castle-screen").classList.add("hidden");
  mainScreen.classList.remove("hidden");
}

function showMessage(text, type) {
  const bossContainer = document.getElementById("castle-screen");
  const msg = document.createElement("div");
  msg.className = `boss-msg ${type}`; // Add type for styling (e.g. "correct" or "wrong")
  msg.textContent = text;
  bossContainer.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 2000);
}

function renderBossQuestion() {
  // Disable spells during boss fight
  hintBtn.classList.add("hidden");
  eliminateBtn.classList.add("hidden");
  hintMsg.classList.add("hidden");
  eliminateMsg.classList.add("hidden");

  const question = bossQuestions[bossIndex];
  document.getElementById("boss-question-text").textContent = question.question;

  const answersContainer = document.getElementById("boss-answers-container");
  answersContainer.innerHTML = "";

  question.answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.classList.add("answer-btn");

    btn.addEventListener("click", () => {
      if (index === question.correct) {
        xp += 30;
        localStorage.setItem("xp", xp);
        xpDisplay.textContent = `Streak: ${streak} 💡 Knowledge: ${xp}`;

        bossIndex++;
        if (bossIndex >= bossQuestions.length) {
          showCastleVictory();
        } else {
          renderBossQuestion();
        }
      } else {
        showFeedback("Wrong! Try again!", "wrong");
      }
    });

    answersContainer.appendChild(btn);
  });
}

function handleBossAnswer(selectedIndex) {
  const question = bossQuestions[bossIndex];
  if (selectedIndex === question.correct) {
    bossIndex++;
    if (bossIndex < bossQuestions.length) {
      renderBossQuestion();
    } else {
      showCastleVictory();
    }
  } else {
    // Optional: Add incorrect feedback here
    alert("Wrong! Try again.");
  }
}

function checkBossAnswer(selectedAnswer) {
document.querySelectorAll('.boss-msg').forEach(el => el.remove());
  const questionObj = castleBossQuestions[bossIndex];
  if (selectedAnswer === questionObj.correct) {
    xp += 30;
    localStorage.setItem("xp", xp);
    updateXPDisplay();
    showMessage(`✅ Correct! ${questionObj.fact}`, "correct");
    bossIndex++;
    if (bossIndex < castleBossQuestions.length) {
      setTimeout(renderBossQuestion, 2000);
    } else {
      setTimeout(showCastleVictory, 2000);
    }
  } else {
    showMessage("❌ Wrong! Try again...", "wrong");
  }
}

function showCastleVictory() {
  hideAllScreens();
  document.getElementById("boss-victory").classList.remove("hidden");

  // Save wizard hat cosmetic unlock
  localStorage.setItem("hasWizardHat", "true");

  // Optional: Give big XP reward
  let currentXP = parseInt(localStorage.getItem("knowledgeXP") || "0", 10);
  currentXP += 100; // Reward 100 XP
  localStorage.setItem("knowledgeXP", currentXP);

  // Optional: Show XP float
  showXPFloat("+100 Knowledge");

  // Optional: Update XP bar or other UI elements
  updateXPDisplay();
hintBtn.style.display = "";
eliminateBtn.style.display = "";
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

  // Check if all zones have that specific difficulty completed
  const hasCompletedDifficultyInAllZones = allZones.every(zone =>
    Array.isArray(completedZones[zone]) && completedZones[zone].includes(condition.zonesCompleted)
  );

  return hasXP || hasCompletedDifficultyInAllZones;
}

function updateSpellDisplay() {
  const hintBtn = document.getElementById("hint-btn");
  const eliminateBtn = document.getElementById("eliminate-btn");

  const hintMsg = document.getElementById("hint-msg");
  const eliminateMsg = document.getElementById("eliminate-msg");

// HINT
if (isSpellUnlocked("hint")) {
  hintBtn.classList.remove("hidden");
  hintBtn.disabled = false;
  hintMsg.classList.add("hidden"); // Hide redundant "unlocked!" msg

  // 🔽 Hide condition text
  document.getElementById("hint-static-msg").classList.add("hidden");
} else {
  hintBtn.classList.add("hidden");
  hintBtn.disabled = true;
  document.getElementById("hint-static-msg").classList.remove("hidden");
}

// ELIMINATE
if (isSpellUnlocked("eliminate")) {
  eliminateBtn.classList.remove("hidden");
  eliminateBtn.disabled = false;
  eliminateMsg.classList.add("hidden");

  document.getElementById("eliminate-static-msg").classList.add("hidden");
} else {
  eliminateBtn.classList.add("hidden");
  eliminateBtn.disabled = true;
  document.getElementById("eliminate-static-msg").classList.remove("hidden");
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

      // ✅ NEW: Check if Castle should be available
      if (checkAllZonesCompleted("novice") && checkAllZonesCompleted("scholar") && checkAllZonesCompleted("wizard")) {
        addCastleButton();
        triggerCastleShake();
      }
    });
}

function isCastleUnlocked() {
  const requiredZones = ["geography", "history", "sports", "entertainment", "daily"];
  return requiredZones.every(zone =>
    isDifficultyUnlocked("wizard", zone)
  );
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

  // ✅ Add Castle zone button at the end if unlocked
  if (isCastleUnlocked()) {
    const castleBtn = document.createElement("button");
    castleBtn.textContent = "🏰 Enter the Castle of Oblivion";
    castleBtn.onclick = startCastleBattle;
    zoneButtons.appendChild(castleBtn);
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

function checkSpellUnlocks(zone) {
  const xp = parseInt(localStorage.getItem("xp") || "0", 10);
  const completedZones = JSON.parse(localStorage.getItem("completedZones")) || {};
  const unlockedDifficulties = JSON.parse(localStorage.getItem("unlockedDifficulties")) || [];

  const allZones = Object.keys(questionsData);
const scholarZonesCompleted = allZones.every(zone =>
  (completedZones[zone] || []).includes("scholar")
);
const noviceZonesCompleted = allZones.every(zone =>
  (completedZones[zone] || []).includes("novice")
);

  const hintUnlocked = xp >= 200 || noviceZonesCompleted;
  const eliminateUnlocked = xp >= 500 || allZones.every(zone =>
  completedZones[zone] && completedZones[zone].includes("scholar")
);

// 🧙‍♂️ HINT
if (hintUnlocked) {
  hintBtn.classList.remove("hidden");
  hintBtn.disabled = false;
  hintMsg.classList.add("hidden");
} else {
  hintBtn.classList.add("hidden");
  hintMsg.textContent = "🧠 The Hint Spell unlocks at 200 Knowledge or after all Novice difficulties are completed";
  hintMsg.classList.remove("hidden");
}

// ⚔️ ELIMINATE
if (eliminateUnlocked) {
  eliminateBtn.classList.remove("hidden");
  eliminateBtn.disabled = false;
  eliminateMsg.classList.add("hidden");
} else {
  eliminateBtn.classList.add("hidden");
  eliminateMsg.textContent = "❌ The Eliminate Spell unlocks at 500 Knowledge or after all Scholar difficulties are completed";
  eliminateMsg.classList.remove("hidden");
}

// ✅ Show spell unlock messages only once
if (hintUnlocked && !localStorage.getItem("hintPopupShown")) {
  showFeedback("✅ Hint spell unlocked!", false);
  localStorage.setItem("hintPopupShown", "true");
}

if (eliminateUnlocked && !localStorage.getItem("eliminatePopupShown")) {
  showFeedback("✅ Eliminate spell unlocked!", false);
  localStorage.setItem("eliminatePopupShown", "true");
}

  // ✅ Only show buttons when unlocked — messages stay visible
if (hintUnlocked) {
  hintBtn.classList.remove("hidden");
  hintBtn.disabled = false;
} else {
  hintBtn.classList.add("hidden");
}

  if (eliminateUnlocked) {
    localStorage.setItem("eliminateUnlocked", "true");
    eliminateBtn.classList.remove("hidden");
  } else {
    eliminateBtn.classList.add("hidden");
  }
const unlockedScholar = completedZones[zone] && completedZones[zone].includes("scholar");
const unlockedWizard = completedZones[zone] && completedZones[zone].includes("wizard");
return { unlockedScholar, unlockedWizard, hintUnlocked, eliminateUnlocked };
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

  currentQuestion = unansweredPool[Math.floor(Math.random() * unansweredPool.length)];
  usedHint = false;
  usedEliminate = false;

  // 🔁 Add this line right before rendering the question
const { unlockedScholar, unlockedWizard, hintUnlocked, eliminateUnlocked } = checkSpellUnlocks(zone);

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
const { unlockedScholar, unlockedWizard, hintUnlocked, eliminateUnlocked } = checkSpellUnlocks();
  const q = currentQuestion;
  attemptCount = 0;
  usedHint = false;
  usedEliminate = false;
  usedHintThisQuestion = false;
  usedEliminateThisQuestion = false;

  const xp = parseInt(localStorage.getItem("xp") || "0", 10);
  const allZones = Object.keys(questionsData);
  const completedZones = JSON.parse(localStorage.getItem("completedZones")) || {};

if (usedHintThisQuestion) {
  hintMsg.textContent = "☑️ Hint used!";
  hintMsg.classList.remove("hidden");
} else {
  // Only show unlock message if just now unlocked
  if (!unlockedSpells.includes("hint") && hintUnlocked) {
    hintMsg.textContent = "✅ Hint unlocked!";
    hintMsg.classList.remove("hidden");
  } else {
    hintMsg.classList.add("hidden");
  }
}

// ✅ Show Eliminate message per state
const elimMsg = document.getElementById("eliminate-msg");
const visibleOptions = Array.from(document.querySelectorAll("#answers-container button"))
  .filter(btn => btn.style.display != "none");
// ✅ Hide Eliminate unlock tooltip once Eliminate is actually usable
const eliminateInfoMsg = document.getElementById("eliminate-msg");
if (eliminateUnlocked && visibleOptions.length >= 3 && !usedEliminate) {
  eliminateInfoMsg.classList.add("hidden");
}

if (eliminateUnlocked && !usedEliminate && visibleOptions.length >= 3) {
  elimMsg.textContent = "✅ Eliminate unlocked!";
  elimMsg.classList.remove("hidden");
} else if (usedEliminate) {
  elimMsg.textContent = "✅ Eliminate used!";
  elimMsg.classList.remove("hidden");
} else {
  elimMsg.classList.add("hidden");
}

  // 🎯 Enable spell buttons if unlocked
  const hintBtn = document.getElementById("hint-btn");
  const eliminateBtn = document.getElementById("eliminate-btn");

if (hintUnlocked) {
  hintBtn.classList.remove("hidden");
} else {
  hintBtn.classList.add("hidden");
}

// 🧼 Hide static unlock messages if spell is unlocked
document.getElementById("hint-static-msg").classList.toggle("hidden", hintUnlocked);
document.getElementById("eliminate-static-msg").classList.toggle("hidden", eliminateUnlocked);

 const visibleEliminateOptions = Array.from(document.querySelectorAll("#answers-container button"))
    .filter(btn => btn.style.display !== "none");

if (eliminateUnlocked && visibleEliminateOptions.length >= 3) {
  eliminateBtn.classList.remove("hidden");
  eliminateBtn.disabled = false;

  // Save unlocked eliminate spell
  if (!unlockedSpells.includes("eliminate")) {
    unlockedSpells.push("eliminate");
    localStorage.setItem("unlockedSpells", JSON.stringify(unlockedSpells));
  }

} else {
  eliminateBtn.classList.add("hidden");
  eliminateBtn.disabled = true;
}

  // ✅ continue your normal question rendering below here...
  const questionTextDiv = document.getElementById("question-text");
  questionTextDiv.textContent = q.question;

  const hintDiv = document.getElementById("hint-container");
  hintDiv.textContent = "";
  hintDiv.classList.add("hidden");

// 🧼 Hide old unlock messages
document.getElementById("hint-msg")?.classList.add("hidden");
document.getElementById("eliminate-msg")?.classList.add("hidden");

  const answersHTML = q.options
    .map(opt => {
      const isCorrect = opt === q.answer;
      return `<button onclick="selectAnswer(event)" class="answer-btn" data-answer="${opt}" data-correct="${isCorrect}">${opt}</button>`;
    })
    .join("");

  document.getElementById("answers-container").innerHTML = answersHTML;
}

function renderBossQuestion() {
  const questionObj = castleBossQuestions[bossIndex];

  const questionTextEl = document.getElementById("boss-question-text");
  const answersContainer = document.getElementById("boss-answers-container");
  const victoryScreen = document.getElementById("boss-victory");

  questionTextEl.textContent = questionObj.question;
  answersContainer.innerHTML = "";

questionObj.answers.forEach(answer => {
  const btn = document.createElement("button");
  btn.textContent = answer;
  btn.classList.add("answer-btn");

  btn.onclick = () => {
    checkBossAnswer(answer);
  };

  answersContainer.appendChild(btn);
});

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

if (
  checkAllZonesCompleted("novice") &&
  checkAllZonesCompleted("scholar") &&
  checkAllZonesCompleted("wizard")
) {
  addCastleButton(); // Shows the castle button
}

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
  selectedBtn.style.transition = "opacity 0.6s ease";
  selectedBtn.style.opacity = "0";
  selectedBtn.disabled = true;
  setTimeout(() => {
    selectedBtn.style.display = "none";
  }, 600);

 // ❌ Hide spell buttons AND their messages after first wrong try
document.getElementById("hint-btn").classList.add("hidden");
document.getElementById("eliminate-btn").classList.add("hidden");
document.getElementById("hint-msg").classList.add("hidden");
document.getElementById("eliminate-msg").classList.add("hidden");

if (attemptCount === 2 && !usedHint) {
  showFeedback("💡 Here's a hint!", false);
  autoShowHint();
} else if (attemptCount >= 3) {
showFeedback(`❌ The correct answer was: ${correctAnswer}`, false);

allButtons.forEach(btn => {
  btn.disabled = true;
  if (btn.style.display === "none") return;

  if (btn.dataset.answer !== correctAnswer) {
    btn.style.transition = "opacity 0.6s ease";
    btn.style.opacity = "0";
    setTimeout(() => {
      btn.style.display = "none";
    }, 600);
  } else {
    btn.classList.add("correct-reveal");
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
  const container = document.getElementById("feedback-container");
  container.innerHTML = ""; // Clear previous messages

  const msg = document.createElement("div");
  msg.classList.add("feedback-msg");
  msg.classList.add(isCorrect ? "correct" : "wrong");
  msg.textContent = message;

  container.appendChild(msg);

  // Optional: fade out after 2s
  setTimeout(() => {
    msg.classList.add("fade-out");
    setTimeout(() => {
      container.removeChild(msg);
    }, 500);
  }, 2000);
}

function goToMain() {
  document.getElementById("main-screen").classList.remove("hidden");
  document.getElementById("difficulty-screen").classList.add("hidden");
  document.getElementById("question-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.add("hidden");
  document.getElementById("castle-screen").classList.add("hidden");
  document.getElementById("boss-victory").classList.add("hidden");
}

function useHint() {
  const hintContainer = document.getElementById("hint-container");
  const currentHint = currentQuestion.hint || "No hint available.";
  hintContainer.textContent = `🪄 Hint: ${currentHint}`;
  hintContainer.classList.remove("hidden");

  const hintBtn = document.getElementById("hint-btn");
  hintBtn.classList.add("hidden"); // 👈 Hide after use
  document.getElementById("hint-msg").textContent = "✅ Hint used!";
  usedHint = true;
  usedHintThisQuestion = true;
}

function useEliminate() {
  const allButtons = document.querySelectorAll("#answers-container button");
  let removed = 0;

  allButtons.forEach(btn => {
    if (!btn.dataset.answer.includes(currentQuestion.answer) && removed < 2) {
      btn.classList.add("fade-out");
      setTimeout(() => btn.style.display = "none", 600);
      removed++;
    }
  });

  const eliminateBtn = document.getElementById("eliminate-btn");
  eliminateBtn.classList.add("hidden"); // 👈 Hide after use
  document.getElementById("eliminate-msg").textContent = "✅ Eliminate used!";
  usedEliminate = true;
  usedEliminateThisQuestion = true;
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

  return { unlockedScholar, unlockedWizard, hintUnlocked, eliminateUnlocked };
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
