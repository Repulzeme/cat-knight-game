
let xp = 0;
let streak = parseInt(localStorage.getItem('streak') || '0');
let lastDate = localStorage.getItem('lastDate') || null;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak() {
  const today = todayStr();
  if (lastDate && lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === yesterday) {
      streak++;
    } else {
      streak = 1;
    }
  } else if (!lastDate) {
    streak = 1;
  }
  lastDate = today;
  localStorage.setItem('streak', streak);
  localStorage.setItem('lastDate', lastDate);
  document.getElementById('streak').textContent = '🔥 Streak: ' + streak;
  updateAvatar();
}

function updateXP(amount) {
  xp += amount;
  document.getElementById('xp').textContent = '📘 XP: ' + xp;
}

function updateAvatar() {
  let text = '🛡️ Cat Knight';
  if (streak >= 7) text += ' 🧥';
  if (xp >= 100) text += ' 🎩';
  document.getElementById('avatar').textContent = text;
}

function completeZone(name) {
  updateXP(20);
  alert(name + ' quiz completed! +20 XP');
  updateStreak();
}

function simulateNextDay() {
  const fakeDate = new Date(Date.now() + 86400000);
  localStorage.setItem('lastDate', fakeDate.toISOString().slice(0, 10));
  alert('Next day simulated');
  updateStreak();
}

function resetStreak() {
  localStorage.removeItem('streak');
  localStorage.removeItem('lastDate');
  streak = 0;
  document.getElementById('streak').textContent = '🔥 Streak: 0';
  updateAvatar();
}

function forceCloak() {
  streak = 7;
  localStorage.setItem('streak', 7);
  localStorage.setItem('lastDate', todayStr());
  updateStreak();
}

updateStreak();
updateXP(0);
