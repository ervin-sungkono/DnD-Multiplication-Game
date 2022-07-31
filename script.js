_id = (id) => {
    return document.getElementById(id);
}

_class = (className) => {
    return document.getElementsByClassName(className);
}

// Compute Score Functions
const scoreText = _id('score');
const highScoreText= _id('high-score');

let highScore = localStorage.getItem('highscore') || 0;
highScoreText.innerHTML = `Highscore: ${highScore}`;
let score = 0;
let livesRemaining = 3;

updateScore = () => {
    scoreText.innerHTML = `Your Score: ${score}`;
}
updateScore();

computeScore = () => {
    alert(`Your Final Score: ${score}`);
    if(score > highScore) {
        highScore = score;
        highScoreText.innerHTML = `Highscore: ${highScore}`;
        localStorage.setItem('highscore', highScore);
    }
    score = 0;
    updateScore();
}

// Generate Question and Compute Answer Functions
getRandomNumber = (number) => {return Math.floor(Math.random() * number) + 1;}
let firstNumber, secondNumber, resultNumber;
const question = _id('question');
const optionList = _class('option');
const answerBox = _id('answer-box');

let valueDict = {
    "number1": 1,
    "number2": 2,
    "number3": 3,
    "number4": 4,
    "number5": 5,
    "number6": 6,
    "number7": 7,
    "number8": 8,
    "number9": 9,
    "number10": 10
};

const numberArray = [1,2,3,4,5,6,7,8,9,10];
setOptions = () => {
    let shuffledArray = [...numberArray].sort(() => Math.random() - 0.5);
    const index = shuffledArray.findIndex(number => number === firstNumber);
    if(index >= 3) shuffledArray.splice(Math.random() * 3, 0, firstNumber);
    shuffledArray = shuffledArray.slice(0,3);
 
    Array.from(optionList).forEach((option, index) => {
        if(!shuffledArray.includes(index + 1)){
            option.style.display = 'none';
        }else{
            option.style.display = 'block';
        }
    });
    setEventListener();
}

disableOptions = (activeElement) => {
    Array.from(optionList).forEach((el) => {
        const option = el.firstElementChild;
        if(option.id != activeElement.id){
            option.removeEventListener('mousedown', pointerStart);
            option.removeEventListener('touchstart', mobilePointerStart);
            option.classList.add('disabled');
        }
    });
}

setQuestion = () => {
    firstNumber = getRandomNumber(10);
    secondNumber = getRandomNumber(10);
    resultNumber = firstNumber * secondNumber;
    question.innerHTML = `${firstNumber} x ${secondNumber} = `;
    setOptions();
}

setQuestion();

updateAnswer = () => {
    const answerList = _class('answer');
    let sum = 0;
    for(let i = 0; i < answerList.length; i++){
        sum += valueDict[answerList[i].firstElementChild.id];
    }
    answerBox.value = sum > 0 ? sum : "";
}
updateAnswer();

clearAnswer = () => {
    const dropzone = _id('answer-dropzone');
    dropzone.classList.add('empty-state');
    dropzone.innerHTML = `
        <img src="./assets/empty-state-img.png" alt="Empty State">
        <p>Drag and drop here to answer!</p>`;
    setEventListener();
    updateAnswer();
}
clearAnswer();

const hearts = _class('heart');
const correctSound = new Audio('/assets/correct-answer-sound.mp3');
const wrongSound = new Audio('/assets/wrong-answer-sound.mp3');
const gameOverSound = new Audio('/assets/game-over-sound.mp3');

setLives = () => {
    livesRemaining = 3;
    for(let i = 0; i < hearts.length; i++){
        hearts[i].classList.remove('fade');
    };
}

let isSubmitting = false;
const gameCard = document.querySelector('#game-section .game-card');
computeAnswer = () => {
    isSubmitting = true;
    if(answerBox.value == 0) return;
    if(answerBox.value == resultNumber) {
        score++;
        updateScore();
        correctSound.play();
        gameCard.classList.add('correct','active');
    }
    else{
        if(--livesRemaining === 0) {
            gameOverSound.play();
            computeScore();
            setTimeout(setLives, 2000);
        }
        else{
            wrongSound.play();
        }
        hearts[livesRemaining].classList.add('fade');
        answerBox.value = resultNumber;
        gameCard.classList.add('wrong','active');
    }
    setTimeout(() => gameCard.classList.add('fade-out'), 2000);
    setTimeout(() => {
        clearAnswer();
        updateAnswer();
        setQuestion();
        gameCard.classList.remove('correct','wrong','active','fade-out');
        gameCard.classList.add('fade-in');
        setTimeout(() => gameCard.classList.remove('fade-in'),1000);
        isSubmitting = false;
    },3000);
}
const clearButton = _id('clear-btn');
const submitButton = _id('submit-btn');

clearButton.addEventListener('click', clearAnswer);
submitButton.addEventListener('click', computeAnswer);

// Drag And Drop Functions
const dropzone = _id('answer-dropzone');

detectTouchEnd = (x1, y1, x2, y2, w, h) => {
    return (x2 - x1 > w || x2 - x1 < 0) ? false : (y2 - y1 > h || y2 - y1 < 0) ? false : true;
}

function pointerEnd(element){
    const pageX = parseInt(element.style.left);
    const pageY = parseInt(element.style.top);
    const box = dropzone.getBoundingClientRect();
    element.removeAttribute('style');

    const answerList = _class('answer');
    if(answerList.length >= 10){
        element.remove();
        return;
    }
    
    const parentNode = document.createElement('div');
    parentNode.setAttribute("class","answer");
    if(detectTouchEnd(box.left, box.top, pageX, pageY, dropzone.offsetWidth, dropzone.offsetHeight)){
        const cloneParentNode = parentNode.cloneNode(false);
        cloneParentNode.appendChild(element.cloneNode(false));
        if(answerList.length === 0){
            dropzone.innerHTML = "";
            dropzone.classList.remove('empty-state');
            disableOptions(element);
        }
        dropzone.appendChild(cloneParentNode);
        updateAnswer();
    }
    element.remove();
}

function pointerStart(e){
    if(isSubmitting) return;
    e.preventDefault();

    const element = e.target.cloneNode(false);
    element.style.position = 'absolute';
    element.style.zIndex = 999;

    document.body.append(element);
    
    function moveAt(pageX, pageY) {
        element.style.left = pageX - element.offsetWidth / 2 + 'px';
        element.style.top = pageY - element.offsetHeight / 2 + 'px';
    }
    moveAt(e.pageX, e.pageY);
    
    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }
    document.addEventListener('mousemove', onMouseMove);
 
    function onMouseUp(e){
        pointerEnd(e.target);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mouseup', onMouseUp);
}

function mobilePointerStart(e){
    if(isSubmitting) return;
    e.preventDefault();

    const element = e.targetTouches[0].target.cloneNode(false);
    element.style.position = 'absolute';
    element.style.zIndex = 999;
    element.id=`${element.id}-clone`;

    document.body.append(element);

    function moveAt(pageX, pageY) {
        element.style.left = pageX - element.offsetWidth + 'px';
        element.style.top = pageY - element.offsetHeight + 'px';
    }
    let touchLocation = e.targetTouches[0];
    moveAt(touchLocation.pageX,touchLocation.pageY);

    function onTouchMove(e){
        touchLocation = e.targetTouches[0];
        moveAt(touchLocation.pageX,touchLocation.pageY);   
    }
    document.addEventListener('touchmove', onTouchMove);

    function onTouchEnd(){
        const targetElement = _id(element.id);
        _id(element.id).setAttribute('id',element.id.split('-')[0]);
        pointerEnd(targetElement);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);   
    }
    document.addEventListener('touchend', onTouchEnd);
}

function setEventListener(){
    const optionList = _class('option');
    Array.from(optionList).forEach((el) => {
        const option = el.firstElementChild;
        option.addEventListener('mousedown', pointerStart);
        option.addEventListener('touchstart', mobilePointerStart);
        option.classList.remove('disabled');
    });
}

// Volume Functions
const volumeButton = _id('volume-icon');
const muteButton = _id('volume-mute-icon');
const volumeSlider = _id('volume-slider');

let isMute = false;

let volumeLevel = 1;
const soundLibrary = [correctSound, wrongSound, gameOverSound];

handleVolume = () => {
    isMute = (volumeLevel === 0) ? true : false;
    if(isMute){
        muteButton.style.display = 'block';
        volumeButton.style.display = 'none';
    }else{
        volumeButton.style.display = 'block'
        muteButton.style.display = 'none';
    }
}

setVolume = () => {
    volumeLevel = volumeSlider.value/100;
    soundLibrary.forEach(sound => sound.volume = volumeLevel);
    handleVolume();
}
setVolume();

let timeout;
volumeSlider.oninput = () =>{
    clearTimeout(timeout);
    timeout = setTimeout(() => volumeSlider.style.display = 'none', 1000);
}
// Show and Hide volume slider
showVolumeSlider = () => {
    volumeSlider.style.display = 'block';
    clearTimeout(timeout);
    timeout = setTimeout(() => volumeSlider.style.display = 'none', 1000);
}

volumeButton.addEventListener('click', showVolumeSlider);
muteButton.addEventListener('click', showVolumeSlider);

// Show and Hide Info Box
const overlay = _id('overlay');
const infoButton = _id('info-icon');
const closeButton = _id('close-btn');

toggleInfoBox = () => {
    overlay.classList.toggle('active');
}

infoButton.addEventListener('click', toggleInfoBox);
closeButton.addEventListener('click', toggleInfoBox);

// Toggle Dark Mode
const toggleBtn = _id('toggle-btn-circle');
toggleDarkMode = () => {
    document.body.classList.toggle('dark-theme');
    toggleBtn.classList.toggle('active');
}