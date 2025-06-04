// Core Data
let gameData = {
  xp: 0,
  dailyXp: 0,
  dailyXpDate: "",
  streak: 0,
  spells: {},
  completedZones: {},
  hasHat: false,
  hasCloak: false,
};

// Save & Load
function saveProgress() {
  localStorage.setItem("xp", gameData.xp);
  localStorage.setItem("dailyXp", gameData.dailyXp);
  localStorage.setItem("dailyXpDate", gameData.dailyXpDate);
  localStorage.setItem("streak", gameData.streak);
  localStorage.setItem("spells", JSON.stringify(gameData.spells));
  localStorage.setItem("completedZones", JSON.stringify(gameData.completedZones));
  localStorage.setItem("hasHat", gameData.hasHat);
  localStorage.setItem("hasCloak", gameData.hasCloak);
}

function loadProgress() {
  gameData.xp = parseInt(localStorage.getItem("xp")) || 0;
  gameData.dailyXp = parseInt(localStorage.getItem("dailyXp")) || 0;
  gameData.dailyXpDate = localStorage.getItem("dailyXpDate") || "";
  gameData.streak = parseInt(localStorage.getItem("streak")) || 0;
  gameData.spells = JSON.parse(localStorage.getItem("spells")) || {};
  gameData.completedZones = JSON.parse(localStorage.getItem("completedZones")) || {};
  gameData.hasHat = localStorage.getItem("hasHat") === "true";
  gameData.hasCloak = localStorage.getItem("hasCloak") === "true";
}

// Main UI
function updateUI() {
  loadProgress();
  const root = document.getElementById("game-root");
  let spellList = Object.keys(gameData.spells).filter(k => gameData.spells[k]);
  let spellString = spellList.length ? `🪄 Spells: ${spellList.join(", ")}` : "";

  root.innerHTML = `
    <h2>🐱🧠 Cat Knight: Realm 1</h2>
    <div>🔥 XP: ${gameData.xp} 📘 Streak: ${gameData.streak}</div>
    <br>
    <button onclick="startQuiz('geography')">⚔️ Arena</button>
    <button onclick="startQuiz('stage')">🎭 Theater</button>
    <button onclick="startQuiz('history')">📚 Library</button>
    <button onclick="startQuiz('sports')">🏟️ Stadium</button>
    <button onclick="startQuiz('daily')">🧪 Daily Mix</button>
    <br><br>
    🔥 Daily XP: ${gameData.dailyXp} 📘 Streak: ${gameData.streak}
    <br><br>
    ${spellString}
  `;
}

// Spells UI
function renderSpellsUI(q, correct) {
  const spellDiv = document.createElement("div");
  spellDiv.id = "spell-buttons";
  spellDiv.innerHTML = `<strong>🪄 Spells:</strong><br>`;

  if (gameData.spells.eliminate) {
    const btn = document.createElement("button");
    btn.innerText = "❌ Eliminate";
    btn.onclick = () => {
      const incorrect = q.options.filter(opt => opt !== correct);
      const toRemove = incorrect[Math.floor(Math.random() * incorrect.length)];
      q.options = q.options.filter(opt => opt !== toRemove);
      renderQuestion(q, correct); // Refresh
    };
    spellDiv.appendChild(btn);
  }

  if (gameData.spells.hint) {
    const btn = document.createElement("button");
    btn.innerText = "💡 Hint";
    btn.onclick = () => alert("Clue: " + (q.hint || "No hint available."));
    spellDiv.appendChild(btn);
  }

  if (gameData.spells.freeze) {
    const btn = document.createElement("button");
    btn.innerText = "🧊 Freeze";
    btn.onclick = () => alert("⏳ Time is frozen... (not implemented)");
    spellDiv.appendChild(btn);
  }

  document.getElementById("game-root").appendChild(spellDiv);
}

// Question Renderer
function renderQuestion(question, correct) {
  const root = document.getElementById("game-root");
  root.innerHTML = `<h3>${question.question}</h3>`;
  question.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(opt, correct, question);
    root.appendChild(btn);
  });
}

// Answer Handler
function handleAnswer(selected, correct, q) {
  const isCorrect = selected === correct;
  const root = document.getElementById("game-root");

  if (isCorrect) {
    gameData.xp += 10;

    // Daily XP and streak
    const today = new Date().toISOString().split("T")[0];
    if (gameData.dailyXpDate !== today) {
      gameData.dailyXpDate = today;
      gameData.dailyXp = 0;
      gameData.spells = {};
    }
    gameData.dailyXp += 10;

    // Spell rewards
    let unlocked = [];
    if (gameData.dailyXp >= 30 && !gameData.spells.eliminate) {
      gameData.spells.eliminate = true;
      unlocked.push("❌ Eliminate");
    }
    if (gameData.dailyXp >= 60 && !gameData.spells.hint) {
      gameData.spells.hint = true;
      unlocked.push("💡 Hint");
    }
    if (gameData.dailyXp >= 90 && !gameData.spells.freeze) {
      gameData.spells.freeze = true;
      unlocked.push("🧊 Freeze");
    }

    saveProgress();

    root.innerHTML = `
      <div><strong>✅ Correct!</strong></div>
      <div class="fact">${q.fact || ""}</div>
      <br><button onclick="updateUI()">🔙 Back to map</button>
    `;

    // Alert after success UI is drawn
    if (unlocked.length) {
      setTimeout(() => alert(`🎁 You unlocked: ${unlocked.join(", ")}`), 100);
    }

  } else {
    alert("❌ Wrong! Try again.");
  }
}

// Quiz Starter
function startQuiz(subject) {
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      const questionSet = data[subject]?.novice || [];
      if (questionSet.length === 0) return alert("No questions available.");
      const q = questionSet[Math.floor(Math.random() * questionSet.length)];
      const correct = q.answer;
      renderSpellsUI(q, correct);
      renderQuestion(q, correct);
    });
}

// Entry point
window.onload = () => updateUI();


// Launch
window.onload = () => updateUI();
