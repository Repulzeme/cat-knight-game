// Core Game Logic
// XP, Streak, Rewards, Difficulty Levels, Map Return, Sound, Spells (basic)

let gameData = {
    xp: parseInt(localStorage.getItem('xp')) || 0,
    streak: parseInt(localStorage.getItem('streak')) || 0,
    lastPlayedDate: localStorage.getItem('lastPlayedDate') || null,
    hasHat: localStorage.getItem('hasHat') === 'true',
    hasCloak: localStorage.getItem('hasCloak') === 'true',
    completedZones: JSON.parse(localStorage.getItem('completedZones')) || {}
};

function saveProgress() {
    localStorage.setItem('xp', gameData.xp);
    localStorage.setItem('streak', gameData.streak);
    localStorage.setItem('lastPlayedDate', gameData.lastPlayedDate);
    localStorage.setItem('hasHat', gameData.hasHat);
    localStorage.setItem('hasCloak', gameData.hasCloak);
    localStorage.setItem('completedZones', JSON.stringify(gameData.completedZones));
}

function updateUI() {
    let root = document.getElementById('game-root');
    root.innerHTML = `
      <div>🧙‍♂️ Cat Knight</div>
      <div>🔥 Streak: ${gameData.streak}</div>
      <div>🌟 XP: ${gameData.xp}</div>
      <div>${gameData.hasHat ? '🎩 Hat earned!' : ''} ${gameData.hasCloak ? '🧥 Cloak earned!' : ''}</div>
      <h2>Geography — Choose Your Challenge</h2>
      <button onclick="startQuiz('geography', 'novice')">📘 Novice</button>
      <button onclick="startQuiz('geography', 'scholar')">📚 Scholar</button>
      <button onclick="startQuiz('geography', 'wizard')">🧠 Wizard</button>
    `;
}

function startQuiz(subject, difficulty) {
    fetch('questions.json')
      .then(response => response.json())
      .then(data => {
          const questionSet = data[subject][difficulty];
          if (!questionSet || questionSet.length === 0) {
              alert("No questions available for this difficulty.");
              return;
          }
          const q = questionSet[Math.floor(Math.random() * questionSet.length)];
          renderQuestion(q, subject, difficulty);
      });
}

function renderQuestion(q, subject, difficulty) {
    const root = document.getElementById('game-root');
    root.innerHTML = `
      <div><strong>${q.question}</strong></div>
      ${q.options.map(opt => `<button onclick="handleAnswer('${opt}', '${q.answer}', '${difficulty}')">${opt}</button>`).join('<br>')}
    `;
}

function handleAnswer(selected, correct, difficulty) {
    if (selected === correct) {
        let xpGained = 10;
        if (difficulty === 'scholar') xpGained = 15;
        if (difficulty === 'wizard') xpGained = 20;
        gameData.xp += xpGained;
        if (!gameData.lastPlayedDate || new Date(gameData.lastPlayedDate).toDateString() !== new Date().toDateString()) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (gameData.lastPlayedDate && new Date(gameData.lastPlayedDate).toDateString() === yesterday.toDateString()) {
                gameData.streak += 1;
            } else {
                gameData.streak = 1;
            }
            gameData.lastPlayedDate = new Date().toISOString();
        }

        if (gameData.xp >= 100) gameData.hasHat = true;
        if (gameData.streak >= 7) gameData.hasCloak = true;

        saveProgress();
        updateUI();
    } else {
        alert("Wrong! Try again.");
        updateUI();
    }
}

window.onload = () => {
    updateUI();
};
