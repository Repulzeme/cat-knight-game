
let xp = 0;
let streak = parseInt(localStorage.getItem('streak') || '0');
let lastDate = localStorage.getItem('lastDate') || null;

let selectedZone = '';
let selectedDifficulty = '';

function todayStr() {
  const override = localStorage.getItem('currentDateOverride');
  return override || new Date().toISOString().slice(0, 10);
}

function updateStreak() {
  const today = todayStr();
  if (!lastDate) {
    streak = 1;
  } else {
    const yesterday = new Date(new Date(today).getTime() - 86400000).toISOString().slice(0, 10);
    if (lastDate === yesterday) {
      streak++;
    } else if (lastDate !== today) {
      streak = 1;
    }
  }
  lastDate = today;
  localStorage.setItem('streak', streak);
  localStorage.setItem('lastDate', lastDate);
  document.getElementById('streak').textContent = '🔥 Streak: ' + streak;
}

function updateXP(amount) {
  xp += amount;
  document.getElementById('xp').textContent = '📘 XP: ' + xp;
  updateAvatar();
}

function updateAvatar() {
  let text = '🛡️ Cat Knight';
  if (streak >= 7) text += ' 🧥';
  if (xp >= 100) text += ' 🎩';
  document.getElementById('avatar').textContent = text;
}

function selectZone(zone) {
  selectedZone = zone;
  document.getElementById('zone-menu').style.display = 'none';
  document.getElementById('difficulty-select').style.display = 'block';
  document.getElementById('difficulty-zone-title').textContent = zone + ' — Choose Your Challenge';
}

function startQuiz(difficulty) {
  selectedDifficulty = difficulty;
  document.getElementById('difficulty-select').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  document.getElementById('back-button').style.display = 'inline-block';
  beginDummyQuiz();
}

function beginDummyQuiz() {
  const qText = `(${selectedDifficulty}) ${selectedZone}: Sample Question?`;
  const options = ['Answer A', 'Answer B', 'Answer C', 'Answer D'];
  document.getElementById('question-text').textContent = qText;
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(opt);
    btn.style.display = 'block';
    btn.style.margin = '0.5rem';
    answersDiv.appendChild(btn);
  });
}

function handleAnswer(answer) {
  alert('You chose: ' + answer);
  updateXP(selectedDifficulty === 'Wizard' ? 20 : selectedDifficulty === 'Scholar' ? 15 : 10);
  updateStreak();
  returnToZones();
}

function returnToZones() {
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('back-button').style.display = 'none';
  document.getElementById('zone-menu').style.display = 'block';
}

document.getElementById('zone-menu').style.display = 'block';
updateAvatar();
updateXP(0);
document.getElementById('streak').textContent = '🔥 Streak: ' + streak;


let questions = {};
fetch("questions.json")
  .then(res => res.json())
  .then(data => { questions = data; });

function beginDummyQuiz() {
  const set = questions[selectedZone]?.[selectedDifficulty];
  if (!set || set.length === 0) {
    document.getElementById('question-text').textContent = 'No questions available yet.';
    return;
  }

  const q = set[Math.floor(Math.random() * set.length)];
  document.getElementById('question-text').textContent = `(${selectedDifficulty}) ${q.question}`;
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = '';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => {
      const correct = (opt === q.answer);
      alert((correct ? "✅ Correct!" : "❌ Incorrect!") + "\n" + q.explanation);
      updateXP(selectedDifficulty === 'Wizard' ? 20 : selectedDifficulty === 'Scholar' ? 15 : 10);
      updateStreak();
      returnToZones();
    };
    btn.style.display = 'block';
    btn.style.margin = '0.5rem';
    answersDiv.appendChild(btn);
  });
}
