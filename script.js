let level, answer, score;
const levelArr = document.getElementsByName("level");
const scoreArr = [];
let playerName = "";
let startMs = 0;
let totalTime = 0;
let totalGames = 0;
let fastestTime = 999999;

guess.disabled = true;
guessBtn.disabled = true;
giveUp.disabled = true;

setInterval(function() {
date.textContent = time();
}, 1000);

playBtn.addEventListener("click", function() {
play();
});
guessBtn.addEventListener("click", function() {
makeGuess();
});
giveUp.addEventListener("click", function() {
giveUp();
});

function play() {
let nameBox = document.getElementById("playerName");
if (playerName === "") {
    playerName = nameBox.value;
    if (playerName === "" || !isNaN(playerName)) {
    msg.textContent = "Please enter your name before playing.";
    return;
    }
    playerName = playerName[0].toUpperCase() + playerName.slice(1).toLowerCase();
}

score = 0;
playBtn.disabled = true;
giveUp.disabled = false;
guessBtn.disabled = false;
guess.disabled = false;

for (let i = 0; i < levelArr.length; i++) {
    if (levelArr[i].checked) {
    level = levelArr[i].value;
    }
    levelArr[i].disabled = true;
}

msg.textContent = playerName + ", guess a number from 1-" + level;
answer = Math.floor(Math.random() * level) + 1;
startMs = new Date().getTime();
}

function makeGuess() {
let userGuess = Number(guess.value);
if (isNaN(userGuess) || userGuess < 1 || userGuess > level) {
    msg.textContent = "Enter a valid number from 1-" + level;
    return;
}

score++;
let diff = Math.abs(userGuess - answer);

if (userGuess > answer) {
if (diff <= level / 10) msg.textContent = "Too high! Hot!";
else if (diff <= level / 4) msg.textContent = "Too high! Warm!";
else if (diff <= level / 2) msg.textContent = "Too high! Cool!";
else msg.textContent = "Too high! Cold!";
    } 
else if (userGuess < answer) {
if (diff <= level / 10) msg.textContent = "Too low! Hot!";
else if (diff <= level / 4) msg.textContent = "Too low! Warm!";
else if (diff <= level / 2) msg.textContent = "Too low! Cool!";
else msg.textContent = "Too low! Cold!";
}
else {
    const endMs = new Date().getTime();
    const roundTime = (endMs - startMs) / 1000;
    totalTime += roundTime;
    totalGames++;
    if (roundTime < fastestTime) {
    fastestTime = roundTime;
    }

    let rating = "ok";
    if (score <= level / 3) rating = "good";
    else if (score > level / 1.5) rating = "bad";

    if (score == 1) {
        msg.textContent = playerName + ", you got it correct in 1 try (EXTRAORDINARY!) Time: " + roundTime.toFixed(2) + "s";
    }
    else {
        msg.textContent = playerName + ", you got it correct in " + score + " tries (" +
        rating + ")! Time: " + roundTime.toFixed(2) + "s";
    }

    updateScore();
    updateTimers();
    reset();
}
}

function giveUp() {
msg.textContent = playerName + ", you gave up! The answer was " + answer;
score = Number(level);
const endMs = new Date().getTime();
totalTime += (endMs - startMs) / 1000;
totalGames++;
updateScore();
updateTimers();
reset();
}

function reset() {
guessBtn.disabled = true;
guess.disabled = true;
giveUp.disabled = true;
guess.value = "";
playBtn.disabled = false;

for (let i = 0; i < levelArr.length; i++) {
    levelArr[i].disabled = false;
}
}

function updateScore() {
scoreArr.push(score);
scoreArr.sort(function(a, b) {
    return a - b;
});
let lb = document.getElementsByName("leaderboard");
wins.textContent = "Total wins: " + scoreArr.length;
let sum = 0;
for (let i = 0; i < scoreArr.length; i++) {
    sum += scoreArr[i];
    if (i < lb.length) {
    if (scoreArr[i] == 1) {
        lb[i].textContent = scoreArr[i] + " try";
    } else {
        lb[i].textContent = scoreArr[i] + " tries";
    }
    }
}
let avg = sum / scoreArr.length;
avgScore.textContent = "Average Score: " + avg.toFixed(2);
}

function updateTimers() {
  let avgT = totalTime / totalGames;
  let fastP = document.getElementById("fastest");
  let avgP = document.getElementById("avgTime");

  if (fastP) {
    fastP.textContent = "Fastest game: " + fastestTime.toFixed(2) + "s";
  }
  if (avgP) {
    avgP.textContent = "Average time: " + avgT.toFixed(2) + "s";
  }
}


function time() {
let d = new Date();
let months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
let month = months[d.getMonth()];
let day = d.getDate();
let suffix = "th";
if (day == 1 || day == 21 || day == 31) suffix = "st";
else if (day == 2 || day == 22) suffix = "nd";
else if (day == 3 || day == 23) suffix = "rd";
let year = d.getFullYear();
let hour = d.getHours();
let min = d.getMinutes();
let sec = d.getSeconds();
let ampm = "AM";
if (hour >= 12) {
    ampm = "PM";
    if (hour > 12) hour = hour - 12;
}
if (min < 10) min = "0" + min;
if (sec < 10) sec = "0" + sec;
return month + " " + day + suffix + ", " + year + ", " + hour + ":" + min + ":" + sec + " " + ampm;
}