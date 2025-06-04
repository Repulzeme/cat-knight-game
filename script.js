let gameData = JSON.parse(localStorage.getItem("catKnightData")) || {
  xp: 0,
  streak: 0,
  dailyDate: "",
  completedZones: {},
  spells: {},
};

function saveGame() {
  localStorage.setItem("catKnightData", JSON.stringify(gameData));
}

function updateHeader() {
  document.getElementById("xp").textContent = gameData.xp;
  document.getElementById("streak").textContent = gameData.streak;
}

const zones = [
  { id: "arena", label: "⚔️ Arena" },
  { id: "theater", label: "🎭 Theater" },
  { id: "library", label: "📚 Library" },
  { id: "stadium", label: "🏟️ Stadium" },
  { id: "daily", label: "🌀 Daily Mix" },
];

function setupZoneButtons() {
  const container = document.getElementById("zone-buttons");
  container.innerHTML = "";
  zones.forEach((zone) => {
    const btn = document.createElement("button");
    btn.textContent = zone.label;
    btn.onclick = () => showDifficultyOptions(zone.id);
    container.appendChild(btn);
  });
}

function showDifficultyOptions(subject) {
  const container = document.getElementById("difficulty-buttons");
  const gameArea = document.getElementById("game-content");
  container.innerHTML = "";
  gameArea.innerHTML = "";

  ["novice", "scholar", "wizard"].forEach((level) => {
    const prereq = level === "novice" ? null :
      level === "scholar" ? `${subject}_novice` : `${subject}_scholar`;

    const unlocked = !prereq || gameData.completedZones[prereq];
    const btn = document.createElement("button");
    btn.textContent = level[0].toUpperCase() + level.slice(1);
    if (!unlocked) btn.classList.add("locked");
    btn.disabled = !unlocked;

    btn.onclick = () => startQuiz(subject, level);
    container.appendChild(btn);
  });

  const backBtn = document.createElement("button");
  backBtn.textContent = "⬅️ Back";
  backBtn.onclick = () => {
    container.innerHTML = "";
  };
  container.appendChild(backBtn);
}

function startQuiz(subject, difficulty) {
  fetch("questions.json")
    .then((res) => res.json())
    .then((data) => {
      const questions = data[subject]?.[difficulty];
      if (!questions || questions.length === 0) {
        alert("No questions available.");
        return;
      }
      const q = questions[Math.floor(Math.random() * questions.length)];
      renderQuestion(q, subject, difficulty);
    });
}

function renderQuestion(q, subject, difficulty) {
  const gameArea = document.getElementById("game-content");
  gameArea.innerHTML = `<h3>${q.question}</h3>`;

  const spellBar = document.createElement("div");
  spellBar.className = "spell-buttons";

  if (gameData.spells.eliminate) {
    const btn = document.createElement("button");
    btn.textContent = "❌ Eliminate";
    btn.onclick = () => {
      const wrongs = q.options.filter(o => o !== q.answer);
      const remove = wrongs[Math.floor(Math.random() * wrongs.length)];
      q.options = q.options.filter(o => o !== remove);
      renderQuestion(q, subject, difficulty);
    };
    spellBar.appendChild(btn);
  }

  if (gameData.spells.hint && q.hint) {
    const btn = document.createElement("button");
    btn.textContent = "💡 Hint";
    btn.onclick = () => alert("Hint: " + q.hint);
    spellBar.appendChild(btn);
  }

  gameArea.appendChild(spellBar);

  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(subject, difficulty, opt, q.answer);
    gameArea.appendChild(btn);
  });
}

function handleAnswer(subject, difficulty, selected, correct) {
  const today = new Date().toISOString().split("T")[0];
  if (selected === correct) {
    alert("✅ Correct!");
    gameData.xp += 10;

    if (gameData.dailyDate !== today) {
      gameData.streak += 1;
      gameData.dailyDate = today;
    }

    if (gameData.xp >= 30 && !gameData.spells.eliminate) {
      gameData.spells.eliminate = true;
      alert("✨ You unlocked the 'Eliminate' spell!");
    }
    if (gameData.xp >= 60 && !gameData.spells.hint) {
      gameData.spells.hint = true;
      alert("🕵️ You unlocked the 'Hint' spell!");
    }

    gameData.completedZones[`${subject}_${difficulty}`] = true;
  } else {
    alert("❌ Wrong!");
  }

  saveGame();
  updateHeader();
  document.getElementById("game-content").innerHTML = "";
}

updateHeader();
setupZoneButtons();
