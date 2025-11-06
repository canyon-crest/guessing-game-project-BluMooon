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
let confettiActive = false;

function time() {
  let d = new Date();
  return d.toLocaleString();
}

function crossfadeBackground(newBg, duration = 600, options = {}) {
  const behind = !!options.behind;
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.background = newBg;
  overlay.style.opacity = 0;
  overlay.style.transition = `opacity ${duration}ms ease`;
  let saved = null;
  if (behind) {
    overlay.style.zIndex = 0;
    saved = [];
    Array.from(document.body.children).forEach((el) => {
      if (el === overlay) return;
      saved.push({ el, pos: el.style.position || "", z: el.style.zIndex || "" });
      el.style.position = el.style.position || "relative";
      el.style.zIndex = 1;
    });
  } else {
    overlay.style.zIndex = 9998;
  }
  overlay.dataset.bgOverlay = "true";
  document.body.appendChild(overlay);
  overlay.offsetHeight;
  overlay.style.opacity = 1;
  const cleanup = () => {
    document.body.style.background = newBg;
    if (saved) {
      saved.forEach(({ el, pos, z }) => {
        el.style.position = pos;
        el.style.zIndex = z;
      });
    }
    overlay.removeEventListener("transitionend", cleanup);
    overlay.remove();
  };
  overlay.addEventListener("transitionend", cleanup);
  setTimeout(() => {
    if (document.body.style.background !== newBg) cleanup();
  }, duration + 50);
}

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
  msg.textContent = `${playerName}, guess a number from 1-${level}`;
  fadeIn(msg);
  answer = Math.floor(Math.random() * level) + 1;
  startMs = new Date().getTime();
  document.body.style.animation = "gradientShift 15s ease infinite"; // ensure animation stays
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
  playBtn.disabled = false;
  playBtn.textContent = "Play Again?";
}

function winGame() {
  const endMs = new Date().getTime();
  const roundTime = (endMs - startMs) / 1000;
  totalTime += roundTime;
  totalGames++;
  if (roundTime < fastestTime) fastestTime = roundTime;
  const rating = score <= level / 3 ? "good" : score > level / 1.5 ? "bad" : "ok";
  msg.innerHTML = `${playerName}, you got it correct in <b>${score}</b> tries (${rating.toUpperCase()})!<br>Time: ${roundTime.toFixed(2)}s 🎉`;
  updateScore();
  updateTimers();
  crossfadeBackground("radial-gradient(circle at 40% 20%, crimson, purple, black)", 800, { behind: true });
  confetti();
  flash(msg, "lime");
  setTimeout(() => {
    crossfadeBackground("linear-gradient(120deg, #000, #000)", 1500, { behind: true });
    setTimeout(() => {
      reset(true);
      playBtn.disabled = false;
      playBtn.textContent = "Play Again?";
    }, 1550);
  }, 2500);
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
}

function reset(skipBg = false) {
  guessBtn.disabled = true;
  guess.disabled = true;
  giveUp.disabled = true;
  guess.value = "";
  for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = false;
  if (!skipBg) setTimeout(() => document.body.style.background = "linear-gradient(-45deg, #020024, #090979, #00d4ff, #001d3d)", 1500);
  confettiActive = false;
}

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

function confetti() {
  if (confettiActive) return;
  confettiActive = true;
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
