// ✅ Fully Restored and Cleaned script.js for Cat Knight Game
// Keeps all features: XP, spells, daily tracking, answer logic, cleaned UI

const zoneSubjects = {
  zone1: "geography",
  zone2: "history",
  zone3: "entertainment",
  zone4: "sports",
  zone5: "daily"
};

let gameData = JSON.parse(localStorage.getItem("catKnightGameData")) || {
  XP: 0,
  streak: 0,
  spells: {},
  dailyXP: 0,
  dailyXPDate: null,
  completedZones: {},
  hasCloak: false,
  hasHat: false
};

function saveGameData() {
  localStorage.setItem("catKnightGameData", JSON.stringify(gameData));
}

function zoneDone(key) {
  return gameData.completedZones[key] ? "✅" : "";
}

function updateUI() {
  const root = document.getElementById("game-root");
  root.innerHTML = `
    <h1>🐱🧠 Cat Knight: Realm 1</h1>
    <p>🔥 XP: ${gameData.XP} 📘 Streak: ${gameData.streak}</p>
    <div class="zone-buttons">
      <button onclick="showDifficultyOptions('geography')">⚔️ Arena ${zoneDone("geography-novice")}</button>
      <button onclick="showDifficultyOptions('history')">🎭 Theater ${zoneDone("history-novice")}</button>
      <button onclick="showDifficultyOptions('entertainment')">📚 Library ${zoneDone("entertainment-novice")}</button>
      <button onclick="showDifficultyOptions('sports')">🏟️ Stadium ${zoneDone("sports-novice")}</button>
      <button onclick="showDifficultyOptions('daily')">🌀 Daily Mix</button>
    </div>
  `;
}

function showDifficultyOptions(subject) {
  const root = document.getElementById("game-root");
  root.innerHTML = `
    <h2>${subject.charAt(0).toUpperCase() + subject.slice(1)}</h2>
    <button onclick="startQuiz('${subject}', 'novice')">Novice</button>
    <button onclick="startQuiz('${subject}', 'scholar')">Scholar</button>
    <button onclick="startQuiz('${subject}', 'wizard')">Wizard</button>
    <button onclick="updateUI()">⬅️ Back</button>
  `;
}

function startQuiz(subject, difficulty) {
  const key = subject + "-" + difficulty;
  const unlockRules = { scholar: "novice", wizard: "scholar" };
  if (difficulty !== "novice") {
    const prereq = subject + "-" + unlockRules[difficulty];
    if (!gameData.completedZones[prereq]) {
      alert(`You must complete ${unlockRules[difficulty]} first.`);
      return;
    }
  }

  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      const questionSet = data[subject][difficulty];
      if (!questionSet || questionSet.length === 0) {
        alert("No questions available.");
        return;
      }
      const qIndex = Math.floor(Math.random() * questionSet.length);
      const q = questionSet[qIndex];
      const correct = q.answer;
      renderSpellUI(q, correct);
      renderQuestion(q, correct, subject, difficulty, qIndex);
    });
}

function renderQuestion(q, correct, subject, difficulty, qIndex) {
  const root = document.getElementById("game-root");
  root.innerHTML += `<h3>${q.question}</h3>`;
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(subject, difficulty, correct, opt, qIndex);
    root.appendChild(btn);
  });
}

function renderSpellUI(q, correct) {
  const root = document.getElementById("game-root");
  const spellDiv = document.createElement("div");
  spellDiv.innerHTML = "<strong>Spells:</strong><br>";

  if (gameData.spells.eliminate) {
    const btn = document.createElement("button");
    btn.textContent = "🔥 Eliminate";
    btn.onclick = () => {
      const incorrect = q.options.filter(o => o !== correct);
      const toRemove = incorrect[Math.floor(Math.random() * incorrect.length)];
      q.options = q.options.filter(o => o !== toRemove);
      updateUI();
      renderSpellUI(q, correct);
      renderQuestion(q, correct);
    };
    spellDiv.appendChild(btn);
  }

  if (gameData.spells.hint) {
    const btn = document.createElement("button");
    btn.textContent = "💡 Hint";
    btn.onclick = () => alert("Clue: " + (q.hint || "No hint available."));
    spellDiv.appendChild(btn);
  }

  if (gameData.spells.freeze) {
    const btn = document.createElement("button");
    btn.textContent = "🧊 Freeze";
    btn.onclick = () => alert("⏳ Time frozen! (not implemented)");
    spellDiv.appendChild(btn);
  }

  root.appendChild(spellDiv);
}

function handleAnswer(subject, difficulty, correct, selected, qIndex) {
  const xp = 10;
  const today = new Date().toISOString().split("T")[0];

  if (selected === correct) {
    gameData.XP += xp;
    if (gameData.dailyXPDate !== today) {
      gameData.dailyXP = 0;
      gameData.dailyXPDate = today;
      gameData.spells = {};
    }
    gameData.dailyXP += xp;
    gameData.streak++;

    if (gameData.dailyXP >= 30 && !gameData.spells.eliminate) {
      gameData.spells.eliminate = true;
      alert("🎉 You unlocked the 'Eliminate' spell!");
    }
    if (gameData.dailyXP >= 60 && !gameData.spells.hint) {
      gameData.spells.hint = true;
      alert("🧠 You unlocked the 'Hint' spell!");
    }
    if (gameData.dailyXP >= 90 && !gameData.spells.freeze) {
      gameData.spells.freeze = true;
      alert("❄️ You unlocked the 'Freeze' spell!");
    }

    gameData.completedZones[subject + "-" + difficulty] = true;
    alert("✅ Correct!");
  } else {
    gameData.streak = 0;
    alert("❌ Wrong!");
  }

  saveGameData();
  updateUI();
}

window.onload = updateUI;
