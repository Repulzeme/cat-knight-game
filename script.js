
let XP = 0;
let spells = 1;
let streak = 3; // mock streak
let currentQ = 0;
let questions = [];

function updateXPDisplay() {
  const banner = document.getElementById('xp-banner');
  if (banner) banner.textContent = `XP: ${XP} | Spells: ${spells}`;
}

function enterZone(zone) {
  questions = [
    { q: "Which planet is known as the Red Planet?", a: "Mars", options: ["Mars", "Jupiter", "Venus"], fact: "Mars is red due to iron oxide." },
    { q: "What year did WW2 end?", a: "1945", options: ["1945", "1939", "1918"], fact: "WW2 ended in 1945 with the Allied victory." },
    { q: "How many continents are there?", a: "7", options: ["5", "6", "7"], fact: "The 7 continents are Africa, Antarctica, Asia, Australia, Europe, North America, South America." }
  ];
  currentQ = 0;
  loadQuestion();
}

function loadQuestion() {
  let q = questions[currentQ];
  document.body.innerHTML = `
    <h2>${q.q}</h2>
    <div>
      ${q.options.map(opt => `<button onclick="answer('${opt}', '${q.a}', '${q.fact}')">${opt}</button>`).join("<br>")}
    </div>
    <br>
    ${spells > 0 ? '<button onclick="useSpell()">✨ Use Spell</button>' : ''}
    <div id='xp-banner' style='margin-top:20px;font-weight:bold;'>XP: ${XP} | Spells: ${spells}</div>
  `;
}

function answer(given, correct, fact) {
  if (given === correct) {
    XP += 10;
    alert("✅ Correct! " + fact);
  } else {
    alert("❌ Incorrect. Try again!");
  }
  currentQ++;
  updateXPDisplay();
  if (currentQ < questions.length) {
    setTimeout(() => loadQuestion(), 200);
  } else {
    setTimeout(() => returnToMap(), 500);
  }
}

function useSpell() {
  if (spells > 0) {
    alert("🪄 Removed a wrong option!");
    spells--;
  } else {
    alert("No spells left!");
  }
  updateXPDisplay();
}

function returnToMap() {
  document.body.innerHTML = `
    <h1>🐱 Cat Knight Adventure</h1>
    <img src="icon-192.png" class="avatar" id="catAvatar" alt="Cat Knight" />
    <div id="xp-banner" style="font-weight:bold; margin-bottom:20px;">XP: ${XP} | Spells: ${spells}</div>
    <p>Select a knowledge zone to begin your journey:</p>
    <button class="zone-button" onclick="enterZone('maps')">🗺️ Mountain of Maps</button>
    <button class="zone-button" onclick="enterZone('history')">🏛️ Ruins of Time</button>
    <button class="zone-button" onclick="enterZone('sports')">🏟️ Arena of Motion</button>
    <button class="zone-button" onclick="enterZone('entertainment')">🎭 Grand Stage of Screens</button>
    <button class="zone-button" onclick="enterZone('daily')">🔮 Crystal Spire</button>
  `;
}
