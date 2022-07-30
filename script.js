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
const optionBox = _id('options-wrapper');
const answerBox = _id('answer-box');

const srcDict = {
    1: "./assets/answer-1.svg",
    2: "./assets/answer-2.svg",
    3: "./assets/answer-3.svg",
    4: "./assets/answer-4.svg",
    5: "./assets/answer-5.svg",
    6: "./assets/answer-6.svg",
    7: "./assets/answer-7.svg",
    8: "./assets/answer-8.svg",
    9: "./assets/answer-9.svg",
    10: "./assets/answer-10.svg"
};

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
    optionBox.innerHTML = "";
    let shuffledArray = [...numberArray].sort(() => Math.random() - 0.5);
    const index = shuffledArray.findIndex(number => number === firstNumber);
    if(index >= 3) shuffledArray.splice(Math.random() * 3, 0, firstNumber);
    shuffledArray = shuffledArray.slice(0,3);

    const parentNode = document.createElement('div');
    parentNode.setAttribute("class","option");
 
    shuffledArray.forEach((number) => {
        const cloneParentNode = parentNode.cloneNode(false);
        const childNode = document.createElement('img');

        childNode.setAttribute("src",srcDict[number]);
        childNode.setAttribute("alt",`Number ${number}`);
        childNode.setAttribute("id",`number${number}`);
        childNode.setAttribute("draggable",false);

        cloneParentNode.appendChild(childNode);
        optionBox.appendChild(cloneParentNode);
    });
    setEventListener();
}

disableOptions = (activeElement) => {
    const optionList = _class('option');
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

const gameCard = document.querySelector('#game-section .game-card');
computeAnswer = () => {
    if(answerBox.value == 0) return;
    if(answerBox.value == resultNumber) {
        score++;
        updateScore();
        correctSound.play();
        gameCard.classList.add('correct','active');
    }
    else{
        if(--livesRemaining === 0) {
            computeScore();
            gameOverSound.play();
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
const volumeSlider = _id('volume-slider');

const mutedVolumeSVG = 
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.66699 18.6666C2.66699 21.3333 4.00033 22.6666 6.66699 22.6666H9.33366" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20.0003 11.16V9.88C20.0003 5.90667 17.2403 4.38667 13.8803 6.49334L9.98699 8.93334C9.56033 9.18667 9.06699 9.33334 8.57366 9.33334H6.66699C4.00033 9.33334 2.66699 10.6667 2.66699 13.3333" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.8799 25.5067C17.2399 27.6134 19.9999 26.0801 19.9999 22.1201V17.2667" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M25.08 12.5601C26.28 15.4267 25.92 18.7734 24 21.3334" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M27.7065 22.6666C27.3465 23.36 26.9331 24.0266 26.4531 24.6666" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M28.2002 10.4C29.3069 13.0267 29.6002 15.9067 29.0802 18.6667" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M29.3337 2.66663L2.66699 29.3333" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
const volumeSVG = 
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.0003 9.88C20.0003 5.90667 17.2403 4.38667 13.8803 6.49334L9.98699 8.93334C9.56033 9.18667 9.06699 9.33334 8.57366 9.33334H6.66699C4.00033 9.33334 2.66699 10.6667 2.66699 13.3333V18.6667C2.66699 21.3333 4.00033 22.6667 6.66699 22.6667H8.57366C9.06699 22.6667 9.56033 22.8133 9.98699 23.0667L13.8803 25.5067C17.2403 27.6133 20.0003 26.08 20.0003 22.12V15.2933" stroke="#2B2B2B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M24 10.6667C26.3733 13.8267 26.3733 18.1734 24 21.3334" stroke="#2B2B2B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M26.4404 24.6667C28.3738 22.0933 29.3338 19.0533 29.3338 16" stroke="#2B2B2B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M26.4404 7.33331C27.2271 8.37331 27.8404 9.49331 28.3071 10.6666" stroke="#2B2B2B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
let isMute = false;

let volumeLevel = 1;
const soundLibrary = [correctSound, wrongSound, gameOverSound];

handleVolume = () => {
    isMute = volumeLevel === 0 ? true : false;
    volumeButton.innerHTML = isMute ? mutedVolumeSVG : volumeSVG;
    volumeLevel = isMute ? 1 : 0;
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

volumeButton.addEventListener('click',showVolumeSlider);

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