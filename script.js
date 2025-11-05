
const levelArr = document.getElementsByName("level");
const scoreArr = [];
let level, answer, score, playerName = "";
let startMs = 0, totalTime = 0, totalGames = 0, fastestTime = 999999;

const guess = document.getElementById("guess");
const guessBtn = document.getElementById("guessBtn");
const giveUp = document.getElementById("giveUp");
const msg = document.getElementById("msg");
const playBtn = document.getElementById("playBtn");
const date = document.getElementById("date");
const playerInput = document.getElementById("playerName");

guess.disabled = true;
guessBtn.disabled = true;
giveUp.disabled = true;

setInterval(() => { date.textContent = time(); }, 1000);

playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);
giveUp.addEventListener("click", giveUpGame);

let replayBtn;

function time() {
  let d = new Date();
  return d.toLocaleString();
}

// some gameplay func
function play() {
  if (!playerInput.value || !isNaN(playerInput.value)) {
    msg.textContent = "Please enter your name before playing.";
    flash(msg, "red");
    return;
  }
  playerName = playerInput.value[0].toUpperCase() + playerInput.value.slice(1).toLowerCase();

  for (let i = 0; i < levelArr.length; i++) {
    if (levelArr[i].checked) level = levelArr[i].value;
    levelArr[i].disabled = true;
  }

  score = 0;
  playBtn.disabled = true;
  giveUp.disabled = false;
  guessBtn.disabled = false;
  guess.disabled = false;
  guess.focus();

  document.body.style.background = "linear-gradient(135deg, #444, #111)";
  msg.textContent = `${playerName}, guess a number from 1-${level}`;
  fadeIn(msg);
  answer = Math.floor(Math.random() * level) + 1;
  startMs = new Date().getTime();
}

function makeGuess() {
  const userGuess = Number(guess.value);
  if (isNaN(userGuess) || userGuess < 1 || userGuess > level) {
    msg.textContent = `Enter a valid number from 1-${level}`;
    flash(msg, "red");
    return;
  }

  score++;
  const diff = Math.abs(userGuess - answer);

  if (userGuess > answer) feedback("high", diff);
  else if (userGuess < answer) feedback("low", diff);
  else winGame();
}

function giveUpGame() {
  msg.textContent = `${playerName}, you gave up! The answer was ${answer}`;
  flash(msg, "orange");
  score = Number(level);
  endGame();
}

function winGame() {
  const endMs = new Date().getTime();
  const roundTime = (endMs - startMs) / 1000;
  totalTime += roundTime;
  totalGames++;
  if (roundTime < fastestTime) fastestTime = roundTime;

  const rating = score <= level / 3 ? "good" : score > level / 1.5 ? "bad" : "ok";
  msg.innerHTML = `${playerName}, you got it correct in <b>${score}</b> tries (${rating.toUpperCase()})!<br>Time: ${roundTime.toFixed(2)}s 🎉`;
  confetti();
  flash(msg, "lime");
  endGame();
}

function feedback(direction, diff) {
  let feedbackMsg = `Too ${direction}! `;
  if (diff <= level / 10) feedbackMsg += "🔥 Hot!";
  else if (diff <= level / 4) feedbackMsg += "🌡️ Warm!";
  else if (diff <= level / 2) feedbackMsg += "🧊 Cool!";
  else feedbackMsg += "🥶 Cold!";
  msg.textContent = feedbackMsg;
  colorTemperature(diff);
  bounce(msg);
}

function endGame() {
  updateScore();
  updateTimers();
  reset();

// replay btn
  replayBtn = document.createElement("button");
  replayBtn.textContent = "Play Again?";
  replayBtn.classList.add("replay");
  document.body.appendChild(replayBtn);
  replayBtn.addEventListener("click", () => {
    replayBtn.remove();
    play();
  });
}

function reset() {
  guessBtn.disabled = true;
  guess.disabled = true;
  giveUp.disabled = true;
  guess.value = "";
  playBtn.disabled = false;
  for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = false;
  setTimeout(() => document.body.style.background = "linear-gradient(120deg, #222, #111)", 1500);
}

// lb improve
function updateScore() {
  scoreArr.push(score);
  scoreArr.sort((a, b) => a - b);
  const lb = document.getElementsByName("leaderboard");
  wins.textContent = "Total wins: " + scoreArr.length;

  let sum = 0;
  for (let i = 0; i < scoreArr.length; i++) {
    sum += scoreArr[i];
    if (i < lb.length) lb[i].textContent = scoreArr[i] + (scoreArr[i] === 1 ? " try" : " tries");
  }
  const avg = sum / scoreArr.length;
  avgScore.textContent = "Average Score: " + avg.toFixed(2);
}

function updateTimers() {
  const avgT = totalTime / totalGames;
  document.getElementById("fastest").textContent = "Fastest game: " + fastestTime.toFixed(2) + "s";
  document.getElementById("avgTime").textContent = "Average time: " + avgT.toFixed(2) + "s";
}

// vis animation
function colorTemperature(diff) {
  const base = document.body;
  if (diff <= level / 10) base.style.background = "radial-gradient(circle, crimson, black)";
  else if (diff <= level / 4) base.style.background = "radial-gradient(circle, orange, black)";
  else if (diff <= level / 2) base.style.background = "radial-gradient(circle, dodgerblue, black)";
  else base.style.background = "radial-gradient(circle, darkslateblue, black)";
}

function flash(el, color) {
  el.style.color = color;
  el.style.transition = "color 0.3s ease";
  setTimeout(() => (el.style.color = "white"), 400);
}

function bounce(el) {
  el.style.transform = "scale(1.2)";
  el.style.transition = "transform 0.2s ease";
  setTimeout(() => (el.style.transform = "scale(1)"), 200);
}

function fadeIn(el) {
  el.style.opacity = 0;
  el.style.transition = "opacity 0.8s";
  setTimeout(() => (el.style.opacity = 1), 50);
}

// confetti!!
function confetti() {
  for (let i = 0; i < 40; i++) {
    const c = document.createElement("div");
    c.classList.add("confetti");
    c.style.left = Math.random() * 100 + "vw";
    c.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 60%)`;
    c.style.animationDuration = 2 + Math.random() * 3 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}



