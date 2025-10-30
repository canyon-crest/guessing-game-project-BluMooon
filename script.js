// global variables
let level, answer, score;
const levelArr = document.getElementsByName("level");
const scoreArr = [];
date.textContent = time();

// add event listeners
playBtn.addEventListener("click", function(){
    play()
});
guessBtn.addEventListener("click", function(){
    makeGuess()
});

function play() {
    score = 0; // sets score to 0 every new game
    playBtn.disabled = true;
    guessBtn.disabled = false;
    guess.disabled = false;
    for (let i=0; i<levelArr.length; i++) {
        if (levelArr[i].checked) {
            level = levelArr[i].value;
        }
        levelArr[i].disabled = true;
    }
    msg.textContent = "Guess a number from 1-" + level;
    answer = Math.floor(Math.random()*level)+1;
    guess.placeholder = answer;
}

function makeGuess() {
    let userGuess = Number(document.getElementById("guess").value);
    if (isNaN(userGuess) || userGuess < 1 || userGuess > level) {
        msg.textContent = "Enter a valid number from 1-" + level;
        return;
    }
    score++; // valid guess add 1 to score
    if (userGuess > answer) {
        msg.textContent = "Too high!";
    }
    else if (userGuess < answer) {
        msg.textContent = "Too low!";
    }
    else {
        msg.textContent = "You're right! Total tries: " + score + " | Press play to play again";
        updateScore();
        reset();
    }
}

function reset() {
    guessBtn.disabled = true;
    guess.disabled = true;
    guess.value = "";
    guess.placeholder = "";
    playBtn.disabled = false;
    for(let i = 0; i<levelArr.length; i++) {
        levelArr[i].disabled = false;
    }
}

function updateScore() {
    scoreArr.push(score);
    scoreArr.sort((a,b)=>a-b);
    let lb = document.getElementsByName("leaderboard");
    wins.textContent = "Total wins: " + scoreArr.length;
    let sum =0;
    for(let i=0;i<scoreArr.length;i++){
        sum+=scoreArr[i];
        if(i<lb.length) {
            if (scoreArr[i]==1) {
                lb[i].textContent = scoreArr[i] + " try";
            }
            else {
                lb[i].textContent = scoreArr[i] + " tries";
            }
        }
    }
    let avg=sum/scoreArr.length;
    avgScore.textContent = "Average Score: " + avg.toFixed(2);
}

function time(){
    let d = new Date();
    // concatenate a string with all the date info...

    return d;
}