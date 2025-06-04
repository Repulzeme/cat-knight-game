// Full game logic preserving all features
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
  document.getElementById("xp").textContent = `XP: ${gameData.xp}`;
  document.getElementById("streak").textContent = `Streak: ${gameData.streak}`;
}

const zones = [
  { id: "arena", label: "⚔️ Arena" },
  { id: "theater", label: "🎭 Theater" },
  { id: "library", label: "📚 Library" },
  { id: "stadium", label: "🏋️ Stadium" },
  { id: "daily", label: "📅 Daily Mix" },
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
  const root = document.getElementById("difficulty-buttons");
  root.innerHTML = `<h2>${capitalize(subject)}</h2>`;
  ["novice", "scholar", "wizard"].forEach((level) => {
    const prereq = level === "novice" ? null :
      level === "scholar" ? `${subject}_novice` : `${subject}_scholar`;

    const btn = document.createElement("button");
    btn.textContent = capitalize(level);

    const unlocked = !prereq || gameData.completedZones[prereq];
    if (!unlocked) btn.classList.add("locked");
    btn.disabled = !unlocked;

    btn.onclick = () => startQuiz(subject, level);
    root.appendChild(btn);
  });

  const back = document.createElement("button");
  back.textContent = "⬅️ Back";
  back.onclick = () => {
    root.innerHTML = "";
  };
  root.appendChild(back);
}

function startQuiz(subject, difficulty) {
  fetch("questions.json")
    .then((res) => res.json())
    .then((data) => {
      const qList = data[subject]?.[difficulty];
      if (!qList || qList.length === 0) {
        alert("No questions available.");
        return;
      }
      const q = qList[Math.floor(Math.random() * qList.length)];
      renderQuestion(q, subject, difficulty);
    });
}

function renderQuestion(q, subject, difficulty) {
  const root = document.getElementById("game-root");
  root.innerHTML = `<h3>${q.question}</h3>`;

  const spellDiv = document.createElement("div");
  spellDiv.className = "spell-buttons";
  if (gameData.spells.eliminate) {
    const btn = document.createElement("button");
    btn.textContent = "❌ Eliminate";
    btn.onclick = () => {
      const wrongOpts = q.options.filter(opt => opt !== q.answer);
      const toRemove = wrongOpts[Math.floor(Math.random() * wrongOpts.length)];
      q.options = q.options.filter(opt => opt !== toRemove);
      renderQuestion(q, subject, difficulty);
    };
    spellDiv.appendChild(btn);
  }
  if (gameData.spells.hint && q.hint) {
    const btn = document.createElement("button");
    btn.textContent = "🕵️ Hint";
    btn.onclick = () => alert("Hint: " + q.hint);
    spellDiv.appendChild(btn);
  }
  root.appendChild(spellDiv);

  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(subject, difficulty, opt, q.answer);
    root.appendChild(btn);
  });
}

function handleAnswer(subject, difficulty, selected, correct) {
  if (selected === correct) {
    alert("✅ Correct!");
    gameData.xp += 10;

    const today = new Date().toISOString().split("T")[0];
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
    alert("❌ Wrong answer.");
  }

  saveGame();
  updateHeader();
  document.getElementById("game-root").innerHTML = "";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

updateHeader();
setupZoneButtons();
