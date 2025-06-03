const gameData = JSON.parse(localStorage.getItem("gameData")) || {
  xp: 0,
  streak: 0,
  dailyXp: 0,
  dailyXpDate: "",
  completedZones: {},
  spells: {},
  hasHat: false,
  hasCloak: false
};

const zoneSubjects = {
  root: "geography",
  tome: "history",
  flickers: "stage",
  arena: "sports",
  mirror: "daily"
};

const zoneNames = {
  root: "Realm of Roots",
  tome: "Tomevault",
  flickers: "Forest of Flickers",
  arena: "Colosseum of Claws",
  mirror: "Mirrorpath"
};

function saveProgress() {
  localStorage.setItem("gameData", JSON.stringify(gameData));
}

function updateUI() {
  const root = document.getElementById("game-root");
  const zones = Object.keys(zoneSubjects).map(id => {
    const subject = zoneSubjects[id];
    const completed = gameData.completedZones[subject + "_novice"];
    return `<div><button id="${id}">🌌 ${zoneNames[id]}</button> ${
      completed ? "✅" : ""
    }</div>`;
  });

  root.innerHTML = `
    <h1>🐱🧠 Cat Knight: Realm 1</h1>
    <div>🔥 XP: ${gameData.xp} 🧊 Streak: ${gameData.streak}</div>
    <h2>🌟 Choose Your Path</h2>
    ${zones.join("")}
  `;

  setupZoneButtons();
}

function zoneDone(key) {
  return gameData.completedZones[key] ? "✅" : "";
}

function setupZoneButtons() {
  Object.keys(zoneSubjects).forEach(zoneId => {
    const btn = document.getElementById(zoneId);
    if (btn) {
      btn.addEventListener("click", () => {
        const subject = zoneSubjects[zoneId];
        showDifficultyOptions(subject);
      });
    }
  });
}

function showDifficultyOptions(subject) {
  const root = document.getElementById("game-root");
  const noviceKey = subject + "_novice";
  const scholarKey = subject + "_scholar";
  const wizardKey = subject + "_wizard";

  const noviceDone = zoneDone(noviceKey);
  const scholarDone = zoneDone(scholarKey);
  const wizardDone = zoneDone(wizardKey);

  const scholarUnlocked = gameData.completedZones[noviceKey];
  const wizardUnlocked = gameData.completedZones[scholarKey];

  root.innerHTML = `
    <h2>Choose difficulty for ${zoneNames[getZoneId(subject)]}</h2>
    <button onclick="startQuiz('${subject}', 'novice')">🟢 Novice ${noviceDone}</button>
    <button ${!scholarUnlocked ? "disabled style='opacity:0.5'" : ""} onclick="startQuiz('${subject}', 'scholar')">🟡 Scholar ${scholarDone}</button>
    <button ${!wizardUnlocked ? "disabled style='opacity:0.5'" : ""} onclick="startQuiz('${subject}', 'wizard')">🔴 Wizard ${wizardDone}</button>
    <br><br><button onclick="updateUI()">🔙 Back to map</button>
  `;
}

function getZoneId(subject) {
  return Object.keys(zoneSubjects).find(k => zoneSubjects[k] === subject);
}

function startQuiz(subject, difficulty) {
  const key = subject + "_" + difficulty;
  const unlockRules = {
    scholar: "novice",
    wizard: "scholar"
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

      renderSpellUI(q, correct);
      renderQuestion(q, correct, subject, difficulty, qIndex);
    });
}

function renderSpellUI(questionObj, correctAnswer) {
  const spellDiv = document.createElement("div");
  spellDiv.id = "spell-buttons";
  spellDiv.innerHTML = "<strong>Spells:</strong><br>";

  if (gameData.spells.eliminate) {
    const btn = document.createElement("button");
    btn.innerText = "💥 Eliminate";
    btn.onclick = () => {
      const incorrect = questionObj.options.filter(opt => opt !== correctAnswer);
      const toRemove = incorrect[Math.floor(Math.random() * incorrect.length)];
      questionObj.options = questionObj.options.filter(opt => opt !== toRemove);
      renderQuestion(questionObj, correctAnswer);
    };
    spellDiv.appendChild(btn);
  }

  if (gameData.spells.hint) {
    const btn = document.createElement("button");
    btn.innerText = "💡 Hint";
    btn.onclick = () => {
      alert("Clue: " + (questionObj.hint || "No hint available."));
    };
    spellDiv.appendChild(btn);
  }

  if (gameData.spells.freeze) {
    const btn = document.createElement("button");
    btn.innerText = "🧊 Freeze";
    btn.onclick = () => {
      alert("⏸️ Time is frozen... (not implemented yet)");
    };
    spellDiv.appendChild(btn);
  }

  document.getElementById("game-root").appendChild(spellDiv);
}

function renderQuestion(question, correct, subject, difficulty, qIndex) {
  const root = document.getElementById("game-root");
  root.innerHTML += `<h3>${question.question}</h3>`;

  question.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(subject, difficulty, correct, opt, qIndex);
    root.appendChild(btn);
  });
}

function handleAnswer(subject, difficulty, correct, selected, qIndex) {
  const xp = 10;
  if (selected === correct) {
    gameData.xp += xp;

    // Daily tracking
    const today = new Date().toISOString().split("T")[0];
    if (gameData.dailyXpDate !== today) {
      gameData.dailyXp = 0;
      gameData.dailyXpDate = today;
      gameData.spells = {};
    }

    gameData.dailyXp += xp;

    // Spell unlocks
    if (gameData.dailyXp >= 30 && !gameData.spells.eliminate) {
      gameData.spells.eliminate = true;
      alert("💥 You unlocked the 'Eliminate' spell!");
    }
    if (gameData.dailyXp >= 60 && !gameData.spells.hint) {
      gameData.spells.hint = true;
      alert("💡 You unlocked the 'Hint' spell!");
    }
    if (gameData.dailyXp >= 90 && !gameData.spells.freeze) {
      gameData.spells.freeze = true;
      alert("🧊 You unlocked the 'Freeze' spell!");
    }

    const zoneKey = subject + "_" + difficulty;
    gameData.completedZones[zoneKey] = true;

    saveProgress();

    alert("✅ Correct!");
    updateUI();
  } else {
    alert("❌ Wrong! Try again.");
  }
}

window.onload = () => {
  updateUI();
};
