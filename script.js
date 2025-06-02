// Core Game Logic — With Map + Repeat Flow

let gameData = {
  xp: parseInt(localStorage.getItem("xp")) || 0,
  streak: parseInt(localStorage.getItem("streak")) || 0,
  lastPlayedDate: localStorage.getItem("lastPlayedDate") || null,
  hasHat: localStorage.getItem("hasHat") === "true",
  hasCloak: localStorage.getItem("hasCloak") === "true",
  completedZones: JSON.parse(localStorage.getItem("completedZones")) || {}
};

function saveProgress() {
  localStorage.setItem("xp", gameData.xp);
  localStorage.setItem("streak", gameData.streak);
  localStorage.setItem("lastPlayedDate", gameData.lastPlayedDate);
  localStorage.setItem("hasHat", gameData.hasHat);
  localStorage.setItem("hasCloak", gameData.hasCloak);
  localStorage.setItem("completedZones", JSON.stringify(gameData.completedZones));
}

function updateUI() {
  let root = document.getElementById("game-root");
  root.innerHTML = `
    <div>🔥 XP: ${gameData.xp} | 🔁 Streak: ${gameData.streak}</div>
    <div>${gameData.hasHat ? "🎩 Hat unlocked!" : ""} ${gameData.hasCloak ? "🧥 Cloak unlocked!" : ""}</div>
    <h2>Choose your zone</h2>
    <button onclick="startQuiz('geography', 'novice')">🌍 Geography: Novice ${zoneDone('geography_novice')}</button>
    <button onclick="startQuiz('geography', 'scholar')">🌍 Geography: Scholar ${zoneDone('geography_scholar')}</button>
    <button onclick="startQuiz('geography', 'wizard')">🌍 Geography: Wizard ${zoneDone('geography_wizard')}</button>
  `;
}

function zoneDone(key) {
  return gameData.completedZones[key] ? "✅" : "";
}

function startQuiz(subject, difficulty) {
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      const questionSet = data[subject][difficulty];
      if (!questionSet || questionSet.length === 0) {
        alert("No questions for this level.");
        return;
      }
      const q = questionSet[Math.floor(Math.random() * questionSet.length)];
      renderQuestion(q, subject, difficulty);
    });
}

function renderQuestion(q, subject, difficulty) {
  let root = document.getElementById("game-root");
  root.innerHTML = `
  <div><strong>${q.question}</strong></div>
  ${q.options.map(opt => `<button onclick="handleAnswer('${opt}', '${q.answer}', '${subject}', '${difficulty}')">${opt}</button>`).join("<br>")}
`;
}

function handleAnswer(selected, correct, subject, difficulty) {
  if (selected === correct) {
    let xp = 10;
    if (difficulty === "scholar") xp = 15;
    if (difficulty === "wizard") xp = 20;
    gameData.xp += xp;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yString = yesterday.toISOString().split("T")[0];

    if (!gameData.lastPlayedDate || gameData.lastPlayedDate !== today) {
      gameData.streak = (gameData.lastPlayedDate === yString) ? gameData.streak + 1 : 1;
      gameData.lastPlayedDate = today;
    }

    if (gameData.xp >= 100) gameData.hasHat = true;
    if (gameData.streak >= 7) gameData.hasCloak = true;

    const key = subject + "_" + difficulty;
    gameData.completedZones[key] = true;

    saveProgress();
    updateUI();
  } else {
    alert("Wrong! Try again.");
  }
}

window.onload = () => updateUI();
// Step C: Zone click logic to load quiz subject and show difficulty options

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
  root.innerHTML = `
    <h2>Choose difficulty for ${capitalize(subject)}</h2>
    <button onclick="startQuiz('${subject}', 'novice')">🟢 Novice</button>
    <button onclick="startQuiz('${subject}', 'scholar')">🟡 Scholar</button>
    <button onclick="startQuiz('${subject}', 'wizard')">🔴 Wizard</button>
    <br><br>
    <button onclick="updateUI()">⬅️ Back to map</button>
  `;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Ensure this is called when window loads
window.onload = () => {
  updateUI();
  setupZoneButtons();
};
