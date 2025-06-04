// == Script for Cat Knight Game == //

const gameData = {
  xp: 0,
  streak: 0,
  lastPlayedDate: "",
  completedZones: {},
  spells: {},
  hasHat: false,
  hasCloak: false,
  dailyXpDate: "",
  dailyXp: 0,
};

const zoneSubjects = {
  arena: "geography",
  theater: "stage",
  library: "history",
  stadium: "sports",
  daily: "daily"
};

function saveProgress() {
  localStorage.setItem("gameData", JSON.stringify(gameData));
}

function loadProgress() {
  const data = localStorage.getItem("gameData");
  if (data) {
    const saved = JSON.parse(data);
    Object.assign(gameData, saved);
  }
}

function updateUI() {
  const root = document.getElementById("game-root");
  root.innerHTML = '';  // Clear the content before updating

  let zoneButtonsHTML = `
    <button onclick="showDifficultyOptions('arena')">⚔️ Arena</button>
    <button onclick="showDifficultyOptions('theater')">🎭 Theater</button>
    <button onclick="showDifficultyOptions('library')">📚 Library</button>
    <button onclick="showDifficultyOptions('stadium')">🏟️ Stadium</button>
    <button onclick="showDifficultyOptions('daily')">🌀 Daily Mix</button>
  `;

  let spellList = Object.keys(gameData.spells).filter(k => gameData.spells[k]);
  let spellText = spellList.length > 0 ? "📜 Spells: " + spellList.join(", ") : "";

  root.innerHTML = `
    <h1>🐱🧠 Cat Knight: Realm 1</h1>
    <div>🔥 XP: ${gameData.xp} 📘 Streak: ${gameData.streak}</div>

    <div style="margin-top: 10px;">
      ${zoneButtonsHTML}
    </div>

    <h2>🐱🧠 Cat Knight: Realm 1</h2>
    <div>🔥 XP: ${gameData.xp} 📘 Streak: ${gameData.streak}</div>

    <h3>🌞 Choose Your Path</h3>
    <div style="margin-top: 10px;">
      ${zoneButtonsHTML}
    </div>

    <div style="margin-top: 10px;">🔥 Daily XP: ${gameData.dailyXp} 📘 Streak: ${gameData.streak}</div>
    <div>${spellText}</div>
  `;
  setupZoneButtons();
}

function zoneDone(key) {
  return gameData.completedZones[key] ? "✅" : "";
}

function setupZoneButtons() {
  Object.keys(zoneSubjects).forEach(zoneId => {
    const subject = zoneSubjects[zoneId];
    const button = document.querySelector(`button[onclick*="${zoneId}"]`);
    if (button) {
      button.title = subject.charAt(0).toUpperCase() + subject.slice(1);
    }
  });
}

function showDifficultyOptions(zoneId) {
  const root = document.getElementById("game-root");
  const subject = zoneSubjects[zoneId];

  const noviceKey = subject + "_novice";
  const scholarKey = subject + "_scholar";
  const wizardKey = subject + "_wizard";

  const noviceDone = zoneDone(noviceKey);
  const scholarDone = zoneDone(scholarKey);
  const wizardDone = zoneDone(wizardKey);

  const scholarUnlocked = !!gameData.completedZones[noviceKey];
  const wizardUnlocked = !!gameData.completedZones[scholarKey];

  root.innerHTML = `
    <h2>Choose difficulty for ${subject.toUpperCase()}</h2>
    <button onclick="startQuiz('${subject}', 'novice')">🧩 Novice ${noviceDone}</button>
    <button ${!scholarUnlocked ? 'disabled style="opacity:0.5;"' : ''} onclick="startQuiz('${subject}', 'scholar')">📘 Scholar ${scholarDone}</button>
    <button ${!wizardUnlocked ? 'disabled style="opacity:0.5;"' : ''} onclick="startQuiz('${subject}', 'wizard')">🧠 Wizard ${wizardDone}</button>
    <br><br><button onclick="updateUI()">🔙 Back to map</button>
  `;
}

function startQuiz(subject, difficulty) {
  const key = subject + "_" + difficulty;

  const unlockRules = {
    scholar: "novice",
    wizard: "scholar",
  };

  if (difficulty !== "novice") {
    const prereq = subject + "_" + unlockRules[difficulty];
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

      renderSpellUI(q, correct); // Spells
      renderQuestion(q, correct);
    });
}

function renderQuestion(question, correct) {
  const root = document.getElementById("game-root");
  root.innerHTML += `<h3>${question.question}</h3>`;

  question.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(opt, correct, opt, question);
    root.appendChild(btn);
  });
}

function renderSpellUI(questionObj, correctAnswer) {
  const spellDiv = document.createElement("div");
  spellDiv.innerHTML = "<strong>🪄 Spells:</strong><br>";

  if (gameData.spells.eliminate) {
    const btn = document.createElement("button");
    btn.innerText = "❌ Eliminate";
    btn.onclick = () => {
      const incorrect = questionObj.options.filter(opt => opt !== correctAnswer);
      const toRemove = incorrect[Math.floor(Math.random() * incorrect.length)];
      questionObj.options = questionObj.options.filter(opt => opt !== toRemove);
      updateUI();
      renderSpellUI(questionObj, correctAnswer);
      renderQuestion(questionObj, correctAnswer);
    };
    spellDiv.appendChild(btn);
  }

  if (gameData.spells.hint) {
    const btn = document.createElement("button");
    btn.innerText = "💡 Hint";
    btn.onclick = () => {
      alert("🧠 Clue: " + (questionObj.hint || "No hint available."));
    };
    spellDiv.appendChild(btn);
  }

  if (gameData.spells.freeze) {
    const btn = document.createElement("button");
    btn.innerText = "🕒 Freeze";
    btn.onclick = () => {
      alert("⏳ Time is frozen... (not implemented yet)");
    };
    spellDiv.appendChild(btn);
  }

  document.getElementById("game-root").appendChild(spellDiv);
}

function handleAnswer(subject, difficulty, correct, selected, questionObj) {
  const xp = 10;
  if (selected === correct) {
    gameData.xp += xp;

    // Track daily
    const today = new Date().toISOString().split("T")[0];
    if (gameData.dailyXpDate !== today) {
      gameData.dailyXp = 0;
      gameData.dailyXpDate = today;
      gameData.spells = {};
    }

    gameData.dailyXp += xp;

    // Spell unlock
    if (gameData.dailyXp >= 30 && !gameData.spells.eliminate) {
      gameData.spells.eliminate = true;
      alert("✨ You unlocked 'Eliminate'!");
    }
    if (gameData.dailyXp >= 60 && !gameData.spells.hint) {
      gameData.spells.hint = true;
      alert("✨ You unlocked 'Hint'!");
    }
    if (gameData.dailyXp >= 90 && !gameData.spells.freeze) {
      gameData.spells.freeze = true;
      alert("✨ You unlocked 'Freeze'!");
    }

    const zoneKey = subject + "_" + difficulty;
    gameData.completedZones[zoneKey] = true;
    saveProgress();
    alert("✅ Correct!");
  } else {
    alert("❌ Wrong. Try again.");
  }

  updateUI();
}

window.onload = () => {
  loadProgress();
  updateUI();
};
