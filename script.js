
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

// crossfade background helper: create a full-screen overlay with the new
// background, fade it in, then set the body's background and remove overlay.
function crossfadeBackground(newBg, duration = 600, options = {}) {
  // options.behind: place the overlay behind page content so text stays visible
  const behind = !!options.behind;

  // create overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.background = newBg;
  overlay.style.opacity = 0;
  overlay.style.transition = `opacity ${duration}ms ease`;

  // if we want the overlay behind content, set a low z-index and temporarily
  // raise all body children above it so the overlay sits visually behind text.
  let saved = null;
  if (behind) {
    overlay.style.zIndex = 0;
    saved = [];
    Array.from(document.body.children).forEach((el) => {
      if (el === overlay) return;
      // save previous inline values so we can restore them
      saved.push({ el, pos: el.style.position || "", z: el.style.zIndex || "" });
      // bring element above overlay
      el.style.position = el.style.position || "relative";
      el.style.zIndex = 1;
    });
  } else {
    overlay.style.zIndex = 9998;
  }

  // mark overlay so it can be skipped when iterating children elsewhere
  overlay.dataset.bgOverlay = "true";
  document.body.appendChild(overlay);

  // force reflow then fade in
  // eslint-disable-next-line no-unused-expressions
  overlay.offsetHeight;
  overlay.style.opacity = 1;

  // when transition ends, apply background to body and remove overlay
  const cleanup = () => {
    // set body background to the final value
    document.body.style.background = newBg;

    // restore any saved element styles
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

  // safety: if transitionend doesn't fire, ensure cleanup after duration+50ms
  setTimeout(() => {
    if (document.body.style.background !== newBg) cleanup();
  }, duration + 50);
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
  // hide the main Play button while the game is in progress
  playBtn.style.display = "none";
  playBtn.disabled = true;
  // ensure we start with the original (blue) background when a new round begins
  document.body.style.background = "linear-gradient(-45deg, #020024, #090979, #00d4ff, #001d3d)";
  giveUp.disabled = false;
  guessBtn.disabled = false;
  guess.disabled = false;
  guess.focus();
  // keep background as-is during guessing; only fade on win
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
    // when the player gives up, show the main Play button again so they can restart
    playBtn.style.display = "";
    playBtn.disabled = false;
  }

function winGame() {
  const endMs = new Date().getTime();
  const roundTime = (endMs - startMs) / 1000;
  totalTime += roundTime;
  totalGames++;
  if (roundTime < fastestTime) fastestTime = roundTime;

  const rating = score <= level / 3 ? "good" : score > level / 1.5 ? "bad" : "ok";
  msg.innerHTML = `${playerName}, you got it correct in <b>${score}</b> tries (${rating.toUpperCase()})!<br>Time: ${roundTime.toFixed(2)}s 🎉`;

  // update score/timers now (do not call endGame/reset here — we'll handle reset after the black fade)
  updateScore();
  updateTimers();

  // 1) fade background to red behind the text (text stays visible)
  crossfadeBackground("radial-gradient(circle at 40% 20%, crimson, purple, black)", 600, { behind: true });
  confetti();
  flash(msg, "lime");

  // create a Play Again button only for wins
  if (!replayBtn || !document.body.contains(replayBtn)) {
    replayBtn = document.createElement("button");
    replayBtn.textContent = "Play Again?";
    replayBtn.classList.add("replay");
    // insert the replay button next to the guess button so it's visually close
    if (guessBtn && guessBtn.parentNode) {
      guessBtn.parentNode.insertBefore(replayBtn, guessBtn.nextSibling);
      // make it sit inline near the guess button (override.default margins)
      replayBtn.style.display = "inline-block";
      replayBtn.style.margin = "0 0 0 8px";
      replayBtn.style.verticalAlign = "middle";
    } else {
      document.body.appendChild(replayBtn);
    }
    replayBtn.addEventListener("click", () => {
      replayBtn.remove();
      replayBtn = null;
      play();
    });
  }

  // 2) after 2s, fade the background to black (also behind the text)
  setTimeout(() => {
    crossfadeBackground("linear-gradient(120deg, #000, #000)", 700, { behind: true });

    // after the black fade completes, run reset but do not change the background
    setTimeout(() => {
      reset(true); // skip background restore so black remains until next play
    }, 700 + 50);
  }, 2000);
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
  // keep play button visibility managed by play/giveUp/win flows
  for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = false;
  // restore a neutral background without fading (fades happen only on win)
  if (!skipBg) setTimeout(() => document.body.style.background = "linear-gradient(120deg, #222, #111)", 1500);
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
  // immediate background change for feedback (no fade)
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



