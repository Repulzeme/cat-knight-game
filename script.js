let gameData = {
  spells: JSON.parse(localStorage.getItem("spells")) || {},
  xp: parseInt(localStorage.getItem("xp")) || 0,
  streak: parseInt(localStorage.getItem("streak")) || 0,
  lastPlayedDate: localStorage.getItem("lastPlayedDate") || null,
  completedZones: JSON.parse(localStorage.getItem("completedZones")) || {}
};

function saveProgress() {
  localStorage.setItem("spells", JSON.stringify(gameData.spells));
  localStorage.setItem("xp", gameData.xp);
  localStorage.setItem("streak", gameData.streak);
  localStorage.setItem("lastPlayedDate", gameData.lastPlayedDate);
  localStorage.setItem("completedZones", JSON.stringify(gameData.completedZones));
}

function updateUI() {
  document.getElementById("xp").textContent = gameData.xp;
  document.getElementById("streak").textContent = gameData.streak;
  renderZoneButtons();
  document.getElementById("difficulty-buttons").innerHTML = "";
  document.getElementById("game-content").innerHTML = "";
}

const subjects = {
  arena: "geography",
  theater: "entertainment",
  library: "history",
  stadium: "sports",
  daily: "daily"
};

function renderZoneButtons() {
  const container = document.getElementById("zone-buttons");
  container.innerHTML = "";
  for (const [zone, subject] of Object.entries(subjects)) {
    const btn = document.createElement("button");
    btn.textContent = subject.charAt(0).toUpperCase() + subject.slice(1);
    btn.onclick = () => showDifficultyOptions(subject);
    container.appendChild(btn);
  }
}

function showDifficultyOptions(subject) {
  const container = document.getElementById("difficulty-buttons");
  container.innerHTML = "";

  const noviceKey = subject + "_novice";
  const scholarKey = subject + "_scholar";
  const wizardKey = subject + "_wizard";

  const scholarUnlocked = !!gameData.completedZones[noviceKey];
  const wizardUnlocked = !!gameData.completedZones[scholarKey];

  container.appendChild(createDifficultyButton("Novice", subject, "novice", true));
  container.appendChild(createDifficultyButton("Scholar", subject, "scholar", scholarUnlocked));
  container.appendChild(createDifficultyButton("Wizard", subject, "wizard", wizardUnlocked));
}

function createDifficultyButton(label, subject, difficulty, unlocked) {
  const btn = document.createElement("button");
  btn.textContent = label;
  if (!unlocked) btn.classList.add("locked");
  btn.onclick = () => startQuiz(subject, difficulty);
  return btn;
}

function startQuiz(subject, difficulty) {
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      const questionSet = data[subject]?.[difficulty];
      if (!questionSet || questionSet.length === 0) {
        alert("No questions available.");
        return;
      }

      const q = questionSet[Math.floor(Math.random() * questionSet.length)];
      renderQuestion(q, subject, difficulty);
    });
}

function renderQuestion(q, subject, difficulty) {
  const container = document.getElementById("game-content");
  container.innerHTML = `
    <h3>${q.question}</h3>
    ${q.options.map((opt, i) => `<button onclick="handleAnswer('${opt}', '${q.answer}', '${subject}', '${difficulty}', \`${q.fact || ""}\`)">${opt}</button>`).join("<br><br>")}
  `;
}

window.handleAnswer = function(choice, correct, subject, difficulty, fact) {
  const container = document.getElementById("game-content");
  const today = new Date().toISOString().split("T")[0];

  if (choice.toLowerCase() === correct.toLowerCase()) {
    gameData.xp += 10;

    if (gameData.lastPlayedDate !== today) {
      gameData.streak++;
      gameData.lastPlayedDate = today;
    }

    const zoneKey = subject + "_" + difficulty;
    gameData.completedZones[zoneKey] = true;

    // Spell unlock logic
    if (gameData.xp >= 30 && !gameData.spells.eliminate) {
      gameData.spells.eliminate = true;
      alert("🪄 Spell unlocked: Eliminate");
    }

    saveProgress();

    container.innerHTML = `
      <p><strong>✅ Correct!</strong></p>
      ${fact ? `<div class="fact">📘 ${fact}</div>` : ""}
      <br><button onclick="updateUI()">🔙 Back</button>
    `;
  } else {
    alert("❌ Wrong!");
  }
}

window.onload = () => {
  updateUI();
};
