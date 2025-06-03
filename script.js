// Core Game Logic — With Map + Repeat Flow

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
  
  fetch("questions.json")
    .then(res => res.json())

function renderSpellsUI(questionObj, correctAnswer) {
  const spellDiv = document.createElement("div");
  spellDiv.id = "spell-buttons";
  spellDiv.innerHTML = "<strong>Spells:</strong><br>";

  if (gameData.spells.eliminate) {
    const btn = document.createElement("button");
    btn.innerText = "🪄 Eliminate";
    btn.onclick = () => {
      const incorrect = questionObj.options.filter(opt => opt !== correctAnswer);
      const toRemove = incorrect[Math.floor(Math.random() * incorrect.length)];
      questionObj.options = questionObj.options.filter(opt => opt !== toRemove);
      renderQuestion(questionObj, correctAnswer); // re-render question with one less option
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
    btn.innerText = "❄️ Freeze";
    btn.onclick = () => {
      alert("⏸️ Time is frozen... (not implemented)");
    };
    spellDiv.appendChild(btn);
  }

  document.getElementById("game-root").appendChild(spellDiv);
}

    
    .then(data => {


      const questionSet = data[subject][difficulty];
      if (!questionSet || questionSet.length === 0) {
        alert("No questions available.");
        return;
      }

      const qIndex = Math.floor(Math.random() * questionSet.length);
      const q = questionSet[qIndex];
      const correct = q.answer;

      let optionsHTML = q.options.map(option => `
  <button onclick="handleAnswer('${subject}', '${difficulty}', '${correct}', '${option}', ${qIndex})">${option}</button>
`).join("<br>");

const root = document.getElementById("game-root");
root.innerHTML = `
  <h2>${q.question}</h2>
  ${renderSpellsForQuestion(correct, subject, difficulty, qIndex, q)}
  ${optionsHTML}
  <br><button onclick="updateUI()">🔙 Back to map</button>
`;
    });
}

function handleAnswer(subject, difficulty, correct, selected, qIndex) {
  const xp = 10;

  if (selected === correct) {
    gameData.xp += xp;

    // Track daily XP
    const today = new Date().toISOString().split("T")[0];
    if (gameData.dailyXpDate !== today) {
      gameData.dailyXp = 0;
      gameData.dailyXpDate = today;
      gameData.spells = {};
    }

    gameData.dailyXp += xp;

    // Spell rewards
    if (gameData.dailyXp >= 30 && !gameData.spells.eliminate) {
      gameData.spells.eliminate = true;
      alert("🪄 You unlocked the 'Eliminate' spell! Removes 1 wrong answer.");
    }
    if (gameData.dailyXp >= 60 && !gameData.spells.hint) {
      gameData.spells.hint = true;
      alert("💡 You unlocked the 'Hint' spell! Reveals a clue.");
    }
    if (gameData.dailyXp >= 90 && !gameData.spells.freeze) {
      gameData.spells.freeze = true;
      alert("❄️ You unlocked the 'Freeze' spell! Time stops!");
    }

    const zoneKey = subject + "_" + difficulty;
    gameData.completedZones[zoneKey] = true;
    saveProgress();

    fetch("questions.json")
      .then(res => res.json())
      .then(data => {
        const q = data[subject][difficulty][qIndex];
        const fact = q.fact || "";
        const root = document.getElementById("game-root");
        root.innerHTML = `
          <div><strong>✅ Correct!</strong></div>
          ${fact ? `<div class="fact">📘 ${fact}</div>` : ""}
          <br><button onclick="updateUI()">🔙 Back to map</button>
        `;
      })
      .catch(error => {
        console.error("Error loading fact:", error);
      });

  } else {
    // Reload same question after wrong answer
    alert("❌ Wrong! Try again.");
    fetch("questions.json")
      .then(res => res.json())
      .then(data => {
        const q = data[subject][difficulty][qIndex];
        const correct = q.answer;

        let optionsHTML = q.options.map(option => `
          <button onclick="handleAnswer('${subject}', '${difficulty}', '${correct}', '${option}', ${qIndex})">${option}</button>
        `).join("<br>");

        const root = document.getElementById("game-root");
        root.innerHTML = `
          <h2>${q.question}</h2>
          ${optionsHTML}
          <br><button onclick="updateUI()">🔙 Back to map</button>
        `;
      });
  }
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

function renderQuestion(q, correct) {
  const root = document.getElementById("game-root");
  root.innerHTML = `<h3>${q.question}</h3>`;
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(opt, correct, q);
    root.appendChild(btn);
  });
  renderSpellsUI(q, correct); // show spells if any
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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderSpellsForQuestion(correct, subject, difficulty, qIndex, q) {
  let html = "";

  if (gameData.spells.eliminate) {
    html += `<button onclick="useEliminate('${correct}', '${subject}', '${difficulty}', ${qIndex})">🪄 Eliminate</button> `;
  }
  if (gameData.spells.hint && q.hint) {
    html += `<button onclick="useHint('${correct}', '${q.hint}')">💡 Hint</button> `;
  }
  if (gameData.spells.freeze) {
    html += `<button disabled title='Not implemented yet'>❄️ Freeze</button>`;
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

      const reducedOptions = q.options.filter(opt => opt !== toRemove);

      let optionsHTML = reducedOptions.map(option => `
        <button onclick="handleAnswer('${subject}', '${difficulty}', '${correct}', '${option}', ${qIndex})">${option}</button>
      `).join("<br>");

      const root = document.getElementById("game-root");
      root.innerHTML = `
        <h2>${q.question}</h2>
        ${renderSpellsForQuestion(correct, subject, difficulty, qIndex, q)}
        ${optionsHTML}
        <br><button onclick="updateUI()">🔙 Back to map</button>
      `;
    });
}

function useHint(correct, hint) {
  alert("💡 Hint: " + hint);
}

window.onload = () => {
  updateUI();
  setupZoneButtons();
};
