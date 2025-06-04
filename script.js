// Full script.js with zone screen > difficulty screen > question screen

const zones = [
  { id: "geography", label: "🗺️ Geography" },
  { id: "entertainment", label: "🎬 Entertainment" },
  { id: "history", label: "📜 History" },
  { id: "sports", label: "🏀 Sports" },
  { id: "daily", label: "📅 Daily Mix" },
];

let gameData = JSON.parse(localStorage.getItem("catKnightData")) || {
  xp: 0,
  streak: 0,
  completedZones: {},
  dailyXPDate: null,
  dailyXP: 0,
  spells: {},
};

function saveGameData() {
  localStorage.setItem("catKnightData", JSON.stringify(gameData));
}

document.addEventListener("DOMContentLoaded", () => {
  updateXPDisplay();
  setupZoneButtons();
});

function updateXPDisplay() {
  const xpStats = document.getElementById("xp-stats");
  xpStats.innerHTML = `🔥 XP: ${gameData.xp} 📚 Streak: ${gameData.streak}`;
}

function setupZoneButtons() {
  const container = document.getElementById("zone-buttons");
  container.innerHTML = "";
  zones.forEach((zone) => {
    const btn = document.createElement("button");
    btn.textContent = zone.label;
    btn.onclick = () => showDifficulties(zone.id);
    container.appendChild(btn);
  });
}

function showDifficulties(subject) {
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("difficulty-screen").style.display = "block";
  document.getElementById("zone-title").textContent = subject.charAt(0).toUpperCase() + subject.slice(1);

  const container = document.getElementById("difficulty-buttons");
  container.innerHTML = "";

  const difficulties = ["novice", "scholar", "wizard"];
  const unlockRules = {
    scholar: "novice",
    wizard: "scholar",
  };

  difficulties.forEach((diff) => {
    const required = unlockRules[diff];
    const isUnlocked = !required || gameData.completedZones[`${subject}_${required}`];
    const btn = document.createElement("button");
    btn.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
    btn.disabled = !isUnlocked;
    btn.onclick = () => startQuiz(subject, diff);
    container.appendChild(btn);
  });
}

function goToMain() {
  document.getElementById("difficulty-screen").style.display = "none";
  document.getElementById("question-screen").style.display = "none";
  document.getElementById("main-screen").style.display = "block";
  updateXPDisplay();
  setupZoneButtons();
}

function startQuiz(subject, difficulty) {
  fetch("questions.json")
    .then((res) => res.json())
    .then((data) => {
      const questionSet = data[subject]?.[difficulty];
      if (!questionSet || questionSet.length === 0) {
        alert("No questions available.");
        return;
      }

      const qIndex = Math.floor(Math.random() * questionSet.length);
      const question = questionSet[qIndex];
      const correct = question.answer;

      const container = document.getElementById("question-container");
      container.innerHTML = `<h3>${question.question}</h3>`;

      question.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = () => handleAnswer(subject, difficulty, correct, opt);
        container.appendChild(btn);
      });

      document.getElementById("difficulty-screen").style.display = "none";
      document.getElementById("question-screen").style.display = "block";
    });
}

function handleAnswer(subject, difficulty, correct, selected) {
  const isCorrect = selected === correct;
  alert(isCorrect ? "✅ Correct!" : "❌ Wrong!");

  const today = new Date().toISOString().split("T")[0];
  if (gameData.dailyXPDate !== today) {
    gameData.dailyXPDate = today;
    gameData.dailyXP = 0;
    gameData.streak++;
  }

  gameData.xp += 10;
  gameData.dailyXP += 10;
  gameData.completedZones[`${subject}_${difficulty}`] = true;
  saveGameData();
  goToMain();
}
