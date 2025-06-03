let gameData = {
  spells: JSON.parse(localStorage.getItem("spells")) || {},
  dailyXp: parseInt(localStorage.getItem("dailyXp")) || 0,
  dailyXpDate: localStorage.getItem("dailyXpDate") || null,
  xp: parseInt(localStorage.getItem("xp")) || 0,
  streak: parseInt(localStorage.getItem("streak")) || 0,
  lastPlayedDate: localStorage.getItem("lastPlayedDate") || null,
  hasHat: localStorage.getItem("hasHat") === "true",
  hasCloak: localStorage.getItem("hasCloak") === "true",
  completedZones: JSON.parse(localStorage.getItem("completedZones")) || {}
};

function saveProgress() {
  localStorage.setItem("spells", JSON.stringify(gameData.spells));
  localStorage.setItem("dailyXp", gameData.dailyXp);
  localStorage.setItem("dailyXpDate", gameData.dailyXpDate);
  localStorage.setItem("xp", gameData.xp);
  localStorage.setItem("streak", gameData.streak);
  localStorage.setItem("lastPlayedDate", gameData.lastPlayedDate);
  localStorage.setItem("hasHat", gameData.hasHat);
  localStorage.setItem("hasCloak", gameData.hasCloak);
  localStorage.setItem("completedZones", JSON.stringify(gameData.completedZones));
}

function updateUI() {
  let spellList = Object.keys(gameData.spells).filter(key => gameData.spells[key]);
  let spellsText = spellList.length ? "Spells: " + spellList.map(s => `🧙 ${s}`).join(", ") : "";
  let root = document.getElementById("game-root");
  root.innerHTML = `
    <div>🔥 XP: ${gameData.xp} 🧊 Streak: ${gameData.streak}</div>
    <div>${spellsText}</div>
    <div>${gameData.hasHat ? "🎩 Hat unlocked! " : ""} ${gameData.hasCloak ? "🧥 Cloak unlocked! " : ""}</div>
  `;
  setupZoneButtons();
}

function zoneDone(key) {
  return gameData.completedZones[key] ? "✅" : "";
}

function renderQuestion(q, correct, subject, difficulty, qIndex, usage = {}) {
  const root = document.getElementById("game-root");
  const buttons = q.options.map(option => {
    return `<button onclick="handleAnswer('${option}', '${correct}', '${subject}', '${difficulty}', ${qIndex}, ${JSON.stringify(usage)})">${option}</button>`;
  }).join("<br>");

  root.innerHTML = `
    <h3>${q.question}</h3>
    ${buttons}
    <br><br>
    ${renderSpellsForQuestion(correct, subject, difficulty, qIndex, q, usage)}
    <button onclick="updateUI()">🔙 Back to map</button>
  `;
}

function handleAnswer(selected, correct, subject, difficulty, qIndex, usage = {}) {
  const zoneKey = subject + "_" + difficulty;
  if (selected.toLowerCase() === correct.toLowerCase()) {
    gameData.xp += 10;

    const today = new Date().toISOString().split("T")[0];
    if (gameData.dailyXpDate !== today) {
      gameData.dailyXp = 0;
      gameData.dailyXpDate = today;
      gameData.spells = {};
    }

    gameData.dailyXp += 10;
    if (gameData.dailyXp >= 30 && !gameData.spells.eliminate) {
      gameData.spells.eliminate = true;
      alert("🪄 Spell unlocked: Eliminate");
    }
    if (gameData.dailyXp >= 60 && !gameData.spells.hint) {
      gameData.spells.hint = true;
      alert("💡 Spell unlocked: Hint");
    }
    if (gameData.dailyXp >= 90 && !gameData.spells.freeze) {
      gameData.spells.freeze = true;
      alert("❄️ Spell unlocked: Freeze");
    }

    gameData.completedZones[zoneKey] = true;
    saveProgress();

    fetch("questions.json")
      .then(res => res.json())
      .then(data => {
        const fact = data[subject][difficulty][qIndex]?.fact || "";
        const root = document.getElementById("game-root");
        root.innerHTML = `
          <div><strong>✅ Correct!</strong></div>
          ${fact ? `<div class="fact">📚 ${fact}</div>` : ""}
          <br><button onclick="updateUI()">🔙 Back to map</button>
        `;
      });
  } else {
    alert("❌ Wrong! Try again.");
  }
}

function renderSpellsForQuestion(correct, subject, difficulty, qIndex, q, usage) {
  let html = "";

  if (gameData.spells.eliminate && !usage.eliminateUsed) {
    html += `<button onclick="useEliminate('${correct}', '${subject}', '${difficulty}', ${qIndex})">🪄 Eliminate</button> `;
  }

  if (gameData.spells.hint && q.hint && !usage.hintUsed) {
    html += `<button onclick="useHint('${correct}', '${q.hint}')">💡 Hint</button> `;
  }

  if (gameData.spells.freeze && !usage.freezeUsed) {
    html += `<button onclick="useFreeze('${subject}', '${difficulty}', ${qIndex}, ${JSON.stringify(q)}, ${JSON.stringify(usage)})">❄️ Freeze</button>`;
  }

  return html ? `<div id="spell-buttons">${html}</div><br>` : "";
}

function useEliminate(correct, subject, difficulty, qIndex) {
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      const q = data[subject][difficulty][qIndex];
      const wrongOptions = q.options.filter(opt => opt !== correct);
      const toRemove = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
      q.options = q.options.filter(opt => opt !== toRemove);
      renderQuestion(q, correct, subject, difficulty, qIndex, { eliminateUsed: true });
    });
}

function useHint(correct, hint) {
  alert("💡 Hint: " + hint);
}

function useFreeze(subject, difficulty, qIndex, q, usage) {
  const root = document.getElementById("game-root");
  const buttons = document.querySelectorAll("#game-root button");
  buttons.forEach(btn => btn.disabled = true);

  const freezeMsg = document.createElement("div");
  freezeMsg.innerHTML = "❄️ Time frozen! You can answer in 3 seconds...";
  root.prepend(freezeMsg);

  setTimeout(() => {
    freezeMsg.remove();
    buttons.forEach(btn => {
      if (!btn.innerHTML.includes("Back to map")) {
        btn.disabled = false;
      }
    });

    renderQuestion(q, q.answer, subject, difficulty, qIndex, {
      eliminateUsed: usage.eliminateUsed || false,
      hintUsed: usage.hintUsed || false,
      freezeUsed: true
    });
  }, 3000);
}

const zoneSubjects = {
  arena: "geography",
  theater: "stage",
  library: "history",
  stadium: "sports",
  daily: "daily"
};

function setupZoneButtons() {
  Object.keys(zoneSubjects).forEach((zoneId) => {
    const zone = document.getElementById(zoneId);
    if (zone) {
      zone.addEventListener("click", () => {
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

  const scholarUnlocked = noviceDone;
  const wizardUnlocked = scholarDone;

  root.innerHTML = `
    <h2>Choose difficulty for ${capitalize(subject)}</h2>
    <button onclick="startQuiz('${subject}', 'novice')">🟢 Novice ${noviceDone ? "✅" : ""}</button>
    <button ${!scholarUnlocked ? "disabled style='opacity:0.5'" : ""} onclick="startQuiz('${subject}', 'scholar')">🟡 Scholar ${scholarDone ? "✅" : ""} ${!scholarUnlocked ? "🔒" : ""}</button>
    <button ${!wizardUnlocked ? "disabled style='opacity:0.5'" : ""} onclick="startQuiz('${subject}', 'wizard')">🔴 Wizard ${wizardDone ? "✅" : ""} ${!wizardUnlocked ? "🔒" : ""}</button>
    <br><br>
    <button onclick="updateUI()">🔙 Back to map</button>
  `;
}

function startQuiz(subject, difficulty) {
  const key = subject + "_" + difficulty;

  const unlockRules = { scholar: "novice", wizard: "scholar" };
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
      renderQuestion(q, q.answer, subject, difficulty, qIndex);
    });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

window.onload = () => {
  updateUI();
};
