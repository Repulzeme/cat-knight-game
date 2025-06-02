
let xp = 0;
let currentQuestionIndex = 0;
let currentQuestions = [];

function updateXPDisplay() {
  document.getElementById('xp').innerText = 'XP: ' + xp;
}

function startQuiz(subject, level) {
  fetch('questions.json')
    .then(response => response.json())
    .then(data => {
      currentQuestions = data[subject][level];
      const xpReward = level === 'novice' ? 10 : level === 'scholar' ? 15 : 20;
      displayQuestion(currentQuestions[0], 0, xpReward);
    });
}

function displayQuestion(questionObj, index, xpReward) {
  const quizDiv = document.getElementById('quiz');
  quizDiv.innerHTML = '';

  const qText = document.createElement('h3');
  qText.innerText = questionObj.question;
  quizDiv.appendChild(qText);

  questionObj.options.forEach(option => {
    const btn = document.createElement('button');
    btn.innerText = option;
    btn.className = 'button';
    btn.onclick = () => {
      const result = option === questionObj.answer;
      alert(result ? '✅ Correct!' : '❌ Incorrect. The correct answer was: ' + questionObj.answer);
      if (result) xp += xpReward;
      updateXPDisplay();
      quizDiv.innerHTML = '';
    };
    quizDiv.appendChild(btn);
  });
}
