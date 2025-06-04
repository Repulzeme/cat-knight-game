// ====== script.js ======

const zoneSubjects = {
  arena: "sports",
  theater: "stage",
  library: "history",
  stadium: "geography",
  daily: "daily"
};

let gameData = {
  xp: 0,
  streak: 0,
  dailyXp: 0,
  dailyXpDate: "",
  completedZones: {},
  spells: {},
  hasHat: false,
  hasCloak: false
};

window.onload = () => {
  loadGameData();
  updateUI();
  setupZoneButtons();
};

function loadGameData() {
  const stored = localStorage.getItem("catKnightGame");
  if (stored) gameData = JSON.parse(stored);
  if (!gameData.spells) gameData.spells = {};
}

function saveGameData() {
  localStorage.setItem("catKnightGame", JSON.stringify(gameData));
}

function updateUI() {
  const root = document.getElementById("game-root");
  const zoneButtonsHTML = `
    <div class="zone-buttons">
      <button onclick="startZone('arena')">⚔️ Arena</button>
      <button onclick="startZone('theater')">🎭 Theater</button>
      <button onclick="startZone('library')">📚 Library</button>
      <button onclick="startZone('stadium')">🏟️ Stadium</button>
      <button onclick="startZone('daily')">🌐 Daily Mix</button>
    </div>
  `;

  root.innerHTML = `
    <h1>🐱🧠 Cat Knight: Realm 1</h1>
    <div>🔥 XP: ${gameData.xp} 📘 Streak: ${gameData.streak}</div>
    ${zoneButtonsHTML}
  `;
}

function startZone(zoneId) {
  const subject = zoneSubjects[zoneId];
  showDifficultyOptions(subject);
}

function showDifficultyOptions(subject) {
  const root = document.getElementById("game-root");
  const novice = `${subject}_novice`;
  const scholar = `${subject}_scholar`;
  const wizard = `${subject}_wizard`;

  const noviceDone = gameData.completedZones[novice];
  const scholarUnlocked = noviceDone;
  const scholarDone = gameData.completedZones[scholar];
  const wizardUnlocked = scholarDone;
  const wizardDone = gameData.completedZones[wizard];

  root.innerHTML = `
    <h2>Choose difficulty for ${capitalize(subject)}</h2>
    <button onclick="startQuiz('${subject}', 'novice')">🟢 Novice ${noviceDone ? "✅" : ""}</button>
    <button ${!scholarUnlocked ? "disabled" : ""} onclick="startQuiz('${subject}', 'scholar')">🟡 Scholar ${scholarDone ? "✅" : ""}</button>
    <button ${!wizardUnlocked ? "disabled" : ""} onclick="startQuiz('${subject}', 'wizard')">🔴 Wizard ${wizardDone ? "✅" : ""}</button>
    <br><br>
    <button onclick="updateUI()">🔙 Back to map</button>
  `;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function startQuiz(subject, difficulty) {
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      const questions = data[subject][difficulty];
      if (!questions || questions.length === 0) {
        alert("No questions available.");
        return;
      }

      const qIndex = Math.floor(Math.random() * questions.length);
      const question = questions[qIndex];
      renderQuiz(question, subject, difficulty, qIndex);
    });
}

function renderQuiz(question, subject, difficulty, qIndex) {
  const root = document.getElementById("game-root");
  const options = question.options.map(opt =>
    `<button onclick="handleAnswer('${subject}', '${difficulty}', '${question.answer}', '${opt}', ${qIndex})">${opt}</button>`
  ).join("<br>");

  const spellButtons = renderSpells(question);

  root.innerHTML = `
    <h3>${question.question}</h3>
    ${spellButtons}
    ${options}
    <br><br><button onclick="updateUI()">🔙 Back</button>
  `;
}

function handleAnswer(subject, difficulty, correct, selected, qIndex) {
  const xpGain = 10;
  const correctAnswer = correct;

  if (selected === correctAnswer) {
    alert("✅ Correct!");
    gameData.xp += xpGain;
    gameData.streak++;
    gameData.dailyXpDate = new Date().toISOString().split("T")[0];
    gameData.dailyXp += xpGain;

    // Reward spells
    if (gameData.dailyXp >= 30) gameData.spells.eliminate = true;
    if (gameData.dailyXp >= 60) gameData.spells.hint = true;
    if (gameData.dailyXp >= 90) gameData.spells.freeze = true;

    const key = `${subject}_${difficulty}`;
    gameData.completedZones[key] = true;
  } else {
    alert("❌ Wrong answer.");
    gameData.streak = 0;
  }

  saveGameData();
  updateUI();
}

function renderSpells(q) {
  let html = "<div><strong>🪄 Spells:</strong><br>";

  if (gameData.spells.eliminate) {
    html += `<button onclick="castEliminate('${q.answer}', '${q.options.join("|")}', '${q.question}')">❌ Eliminate</button>`;
  }
  if (gameData.spells.hint && q.hint) {
    html += `<button onclick="alert('💡 Hint: ${q.hint}')">💡 Hint</button>`;
  }
  if (gameData.spells.freeze) {
    html += `<button onclick="alert('🧊 Time frozen! (not implemented)')">🧊 Freeze</button>`;
  }

  html += "</div><br>";
  return html;
}

function castEliminate(correct, opts, questionText) {
  const options = opts.split("|");
  const incorrectOptions = options.filter(o => o !== correct);
  const removed = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
  const newOptions = options.filter(o => o !== removed);

  const root = document.getElementById("game-root");
  const spellButtons = renderSpells({ question: questionText, options: newOptions, answer: correct });

  root.innerHTML = `
    <h3>${questionText}</h3>
    ${spellButtons}
    ${newOptions.map(opt => `<button onclick="handleAnswer('', '', '${correct}', '${opt}', 0)">${opt}</button>`).join("<br>")}
    <br><br><button onclick="updateUI()">🔙 Back</button>
  `;
}
