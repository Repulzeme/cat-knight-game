// === Cat Knight Quiz Game — Phase 1: Zone Unlock & Portal System === //

const gameData = {
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

const zoneSubjects = {
  arena: "geography",
  library: "history",
  theater: "stage",
  stadium: "sports",
  daily: "daily"
};

const orderedZones = ["arena", "library", "theater", "stadium", "daily"];

function isZoneUnlocked(zoneId) {
  const index = orderedZones.indexOf(zoneId);
  if (index === 0) return true;
  const prevZoneKey = zoneSubjects[orderedZones[index - 1]] + "_wizard";
  return gameData.completedZones[prevZoneKey];
}

function zoneDone(key) {
  return gameData.completedZones[key] ? "✅" : "";
}

function updateUI() {
  const root = document.getElementById("game-root");
  root.innerHTML = `
    <h2>🌟 Choose Your Path</h2>
    <div class="zone-container">
      ${orderedZones.map(zone => renderZoneTile(zone)).join("")}
    </div>
    ${isFinalZoneUnlocked() ? '<div class="zone-tile boss" onclick="startBossBattle()">🏰 Enter the Castle</div>' : ''}
    <div>🔥 XP: ${gameData.xp} 🧊 Streak: ${gameData.streak}</div>
  `;
}

function renderZoneTile(zoneId) {
  const unlocked = isZoneUnlocked(zoneId);
  const subject = zoneSubjects[zoneId];
  const displayName = subject.charAt(0).toUpperCase() + subject.slice(1);
  return `<div class="zone-tile ${unlocked ? 'unlocked' : 'locked'}" ${unlocked ? `onclick=\"showDifficultyOptions('${subject}')\"` : ''}>🌀 ${displayName}</div>`;
}

function isFinalZoneUnlocked() {
  return orderedZones.every(zoneId => {
    const key = zoneSubjects[zoneId] + "_wizard";
    return gameData.completedZones[key];
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
    <h2>Choose difficulty for ${subject.charAt(0).toUpperCase() + subject.slice(1)}</h2>
    <button onclick="startQuiz('${subject}', 'novice')">🟢 Novice ${noviceDone}</button>
    <button ${!scholarUnlocked ? "disabled style='opacity:0.5'" : ""} onclick="startQuiz('${subject}', 'scholar')">🟡 Scholar ${scholarDone} ${!scholarUnlocked ? "🔒" : ""}</button>
    <button ${!wizardUnlocked ? "disabled style='opacity:0.5'" : ""} onclick="startQuiz('${subject}', 'wizard')">🔴 Wizard ${wizardDone} ${!wizardUnlocked ? "🔒" : ""}</button>
    <br><br>
    <button onclick="updateUI()">🔙 Back to map</button>
  `;
}

function startQuiz(subject, difficulty) {
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      const qList = data[subject][difficulty];
      if (!qList || qList.length === 0) {
        alert("No questions found.");
        return;
      }

      const question = qList[Math.floor(Math.random() * qList.length)];
      showQuestionUI(subject, difficulty, question);
    });
}

function showQuestionUI(subject, difficulty, question) {
  const root = document.getElementById("game-root");
  root.innerHTML = `
    <div><strong>${question.question}</strong></div>
    ${question.options.map(opt => `<button onclick="handleAnswer('${subject}', '${difficulty}', '${question.answer}', '${opt}', ${JSON.stringify(question.fact)})">${opt}</button>`).join("<br>")}
    <br><button onclick="updateUI()">🔙 Back</button>
  `;
}

function handleAnswer(subject, difficulty, correct, selected, fact) {
  const root = document.getElementById("game-root");
  const correctMatch = correct.toLowerCase() === selected.toLowerCase();

  if (correctMatch) {
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
      alert("🪄 You unlocked the 'Eliminate' spell!");
    }
    if (gameData.dailyXp >= 60 && !gameData.spells.hint) {
      gameData.spells.hint = true;
      alert("💡 You unlocked the 'Hint' spell!");
    }
    if (gameData.dailyXp >= 90 && !gameData.spells.freeze) {
      gameData.spells.freeze = true;
      alert("❄️ You unlocked the 'Freeze' spell!");
    }

    const key = subject + "_" + difficulty;
    gameData.completedZones[key] = true;
    saveProgress();

    root.innerHTML = `
      <div><strong>✅ Correct!</strong></div>
      ${fact ? `<div class='fact'>📘 ${fact}</div>` : ""}
      <br><button onclick="updateUI()">🔙 Back to map</button>
    `;
  } else {
    alert("❌ Wrong answer. Try again!");
  }
}

window.onload = () => {
  updateUI();
};
