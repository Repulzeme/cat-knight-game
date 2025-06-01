
let XP = 0;
let spells = 1;
let clearedZones = JSON.parse(sessionStorage.getItem('clearedZones') || '{}');
let currentZone = '';
let currentQ = 0;
let questions = [];

const zoneData = {
  maps: {
    name: "🗺️ Mountain of Maps",
    questions: [
      { q: "Which continent is the Sahara Desert on?", a: "Africa", options: ["Asia", "Africa", "Australia"], fact: "The Sahara is in northern Africa." },
      { q: "What ocean borders the east coast of the US?", a: "Atlantic", options: ["Pacific", "Indian", "Atlantic"], fact: "The Atlantic Ocean is on the east coast." },
      { q: "Which country has the most time zones?", a: "France", options: ["USA", "Russia", "France"], fact: "France has 12 due to overseas territories." },
      { q: "Where is the Great Barrier Reef?", a: "Australia", options: ["South Africa", "USA", "Australia"], fact: "It’s off the coast of Queensland, Australia." },
      { q: "What is the capital of Canada?", a: "Ottawa", options: ["Toronto", "Vancouver", "Ottawa"], fact: "Ottawa is the capital, not Toronto." },
      { q: "Which continent is Greenland on?", a: "North America", options: ["Europe", "Asia", "North America"], fact: "Geographically, it belongs to North America." }
    ]
  },
  history: {
    name: "🏛️ Ruins of Time",
    questions: [
      { q: "Who was the first US president?", a: "George Washington", options: ["Abraham Lincoln", "George Washington", "John Adams"], fact: "Washington served 1789–1797." },
      { q: "What year did WW2 end?", a: "1945", options: ["1945", "1939", "1918"], fact: "WW2 ended in 1945." },
      { q: "Who discovered America?", a: "Christopher Columbus", options: ["Leif Erikson", "Christopher Columbus", "Vasco da Gama"], fact: "Columbus arrived in 1492." },
      { q: "When was the Berlin Wall torn down?", a: "1989", options: ["1979", "1989", "1991"], fact: "It fell in 1989." },
      { q: "What empire was ruled by Julius Caesar?", a: "Roman Empire", options: ["Greek", "Byzantine", "Roman Empire"], fact: "Caesar ruled in Rome." }
    ]
  },
  sports: {
    name: "🏟️ Arena of Motion",
    questions: [
      { q: "What sport uses a shuttlecock?", a: "Badminton", options: ["Tennis", "Squash", "Badminton"], fact: "Badminton uses a feathered shuttle." },
      { q: "Which country won the 2018 FIFA World Cup?", a: "France", options: ["Brazil", "France", "Germany"], fact: "France beat Croatia in the final." },
      { q: "How many players on a soccer team?", a: "11", options: ["9", "10", "11"], fact: "11 players per side." },
      { q: "What sport does Serena Williams play?", a: "Tennis", options: ["Golf", "Tennis", "Volleyball"], fact: "She’s a tennis legend." },
      { q: "In what sport would you find a 'slam dunk'?", a: "Basketball", options: ["Football", "Basketball", "Baseball"], fact: "It’s a powerful basketball move." }
    ]
  },
  entertainment: {
    name: "🎭 Grand Stage of Screens",
    questions: [
      { q: "Who played Jack in Titanic?", a: "Leonardo DiCaprio", options: ["Tom Hanks", "Leonardo DiCaprio", "Brad Pitt"], fact: "Leo was Jack Dawson." },
      { q: "Which movie features 'May the Force be with you'?", a: "Star Wars", options: ["Star Wars", "Star Trek", "Dune"], fact: "Iconic Star Wars quote." },
      { q: "Who wrote Harry Potter?", a: "J.K. Rowling", options: ["J.R.R. Tolkien", "J.K. Rowling", "Stephen King"], fact: "She wrote all 7 books." },
      { q: "Which superhero is Bruce Wayne?", a: "Batman", options: ["Superman", "Iron Man", "Batman"], fact: "Bruce Wayne = Batman." },
      { q: "Which film won Best Picture in 1994?", a: "Forrest Gump", options: ["Pulp Fiction", "The Shawshank Redemption", "Forrest Gump"], fact: "Run, Forrest, run!" }
    ]
  },
  daily: {
    name: "🔮 Crystal Spire",
    questions: [
      { q: "How many continents are there?", a: "7", options: ["5", "6", "7"], fact: "They are: Africa, Antarctica, Asia, Australia, Europe, North America, South America." },
      { q: "What gas do plants absorb?", a: "Carbon dioxide", options: ["Oxygen", "Carbon dioxide", "Nitrogen"], fact: "Photosynthesis uses CO₂." },
      { q: "How many legs does a spider have?", a: "8", options: ["6", "8", "10"], fact: "Spiders are arachnids." },
      { q: "What is H2O?", a: "Water", options: ["Oxygen", "Hydrogen", "Water"], fact: "H2O = 2 hydrogen, 1 oxygen." }
    ]
  }
};

function updateXPDisplay() {
  document.getElementById('xp-banner').textContent = `XP: ${XP} | Spells: ${spells}`;
}

function renderZones() {
  let html = '';
  for (const [key, data] of Object.entries(zoneData)) {
    const cleared = clearedZones[key];
    html += `<div>
      <button class="zone-button ${cleared ? 'cleared' : ''}" onclick="enterZone('${key}')">
        ${data.name} ${cleared ? '✅' : ''}
      </button>
      ${cleared ? `<button class="replay-btn" onclick="enterZone('${key}', true)">🔁 Replay</button>` : ''}
    </div>`;
  }
  document.getElementById('zones').innerHTML = html;
}

function enterZone(zone, isReplay = false) {
  currentZone = zone;
  questions = [...zoneData[zone].questions].sort(() => 0.5 - Math.random()).slice(0, 3);
  currentQ = 0;
  renderQuestion();
}

function renderQuestion() {
  let q = questions[currentQ];
  document.body.innerHTML = `
    <h2>${q.q}</h2>
    ${q.options.map(opt => `<button onclick="answer('${opt}', '${q.a}', '${q.fact}')">${opt}</button>`).join("<br><br>")}
    <div style="margin-top:20px;" id="xp-banner">XP: ${XP} | Spells: ${spells}</div>
  `;
}

function answer(given, correct, fact) {
  if (given === correct) {
    XP += 10;
    alert("✅ Correct! " + fact);
  } else {
    alert("❌ Incorrect!");
  }
  currentQ++;
  updateXPDisplay();
  if (currentQ < questions.length) {
    setTimeout(() => renderQuestion(), 200);
  } else {
    clearedZones[currentZone] = true;
    sessionStorage.setItem('clearedZones', JSON.stringify(clearedZones));
    setTimeout(() => returnToMap(), 500);
  }
}

function returnToMap() {
  document.body.innerHTML = document.body.innerHTML = `
    <h1>🐱 Cat Knight Adventure</h1>
    <img src="icon-192.png" class="avatar" />
    <div id="xp-banner" style="font-weight:bold; margin-bottom:20px;">XP: ${XP} | Spells: ${spells}</div>
    <div id="zones"></div>
    <script src="script.js"></script>
  `;
  renderZones();
  updateXPDisplay();
}

window.onload = () => {
  renderZones();
  updateXPDisplay();
};
