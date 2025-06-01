
let XP = 0;
let spells = 0;
let streak = 3; // Simulated streak for test
let usedSpell = false;

document.addEventListener("DOMContentLoaded", () => {
  if (streak >= 3) {
    spells++;
  }

  updateXPDisplay();
});

function updateXPDisplay() {
  const xpBanner = document.getElementById('xp-banner');
  if (xpBanner) xpBanner.textContent = `XP: ${XP} | Spells: ${spells}`;
}

function enterZone(zone) {
  let questions = [
    { q: "Which planet is known as the Red Planet?", a: "Mars", options: ["Mars", "Jupiter", "Venus"], fact: "Mars is red due to iron oxide." },
    { q: "What year did WW2 end?", a: "1945", options: ["1945", "1939", "1918"], fact: "WW2 ended in 1945 with the Allied victory." },
    { q: "How many continents are there?", a: "7", options: ["5", "6", "7"], fact: "The 7 continents are Africa, Antarctica, Asia, Australia, Europe, North America, South America." }
  ];
  let quiz = [...questions].slice(0, 3); // Use first 3 questions
  let container = document.body;
  container.innerHTML = "<h2>" + zone.toUpperCase() + " Quiz</h2>";
  quiz.forEach((q, i) => {
    let btns = q.options.map(opt => `<button onclick="answer('${opt}', '${q.a}', '${q.fact}', this)">${opt}</button>`).join("<br>");
    container.innerHTML += `<p>${q.q}</p>${btns}<hr>`;
  });
  if (spells > 0) {
    container.innerHTML += '<div class="spell-bar"><button onclick="useSpell()">✨ Use Spell</button></div>';
  }
}

function answer(given, correct, fact, el) {
  if (given === correct) {
    XP += 10;
    alert("✅ Correct! " + fact);
  } else {
    alert("❌ Incorrect. Try again!");
  }
  updateXPDisplay();
  checkCastleUnlock();
}

function useSpell() {
  if (spells > 0 && !usedSpell) {
    alert("🪄 A wrong answer has been removed!");
    spells--;
    usedSpell = true;
  } else {
    alert("No spells left!");
  }
  updateXPDisplay();
}

function checkCastleUnlock() {
  if (XP >= 50) {
    const container = document.body;
    container.innerHTML += '<br><button onclick="enterCastle()">🏰 Enter the Castle</button>';
  }
}

function enterCastle() {
  document.body.innerHTML = "<h2>🏰 The Final Battle Begins!</h2><p>You face the Shadow Sage. Answer wisely...</p>";
}
