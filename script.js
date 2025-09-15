// === GAME CONFIGURATION ===
const QUESTIONS = [
  "如果我掉进河里，你会跳下去救吗？",
  "要不要一起吃饭？（你买单 😏）",
  "要不要一起减肥？还是继续吃宵夜？",
  "分手后还能当朋友吗？",
  "最后一次机会，你会珍惜吗？"
];

const resultImageUrl = "./d5387bc40d.gif";
const bgmUrl = "./bgm.mp3";
let backgroundMusic = null;

// === GAME STATE ===
let currentQuestionIndex = 0;
let answers = []; // Store "okay" or "no" for each question
let soundEnabled = false;
let balanceTilt = 0; // Track the balance tilt

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    // Initialize background music
    initializeBackgroundMusic();
    
    // Load saved sound preference
    soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    updateSoundToggle();
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    // Setup evasive start button
    setupEvasiveStartButton();
    
    // Ensure we start on the correct screen
    showScreen('startScreen');
});

// === SCREEN MANAGEMENT ===
function showScreen(screenId) {
    // Clean up any evasive last question button before switching screens
    if (screenId !== 'questionsScreen') {
        const evasiveLastButton = document.querySelector('#questionsScreen .evasive-last-btn');
        if (evasiveLastButton) {
            cleanupEvasiveLastButton(evasiveLastButton);
        }
    }
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
    
    // Focus management for accessibility
    setTimeout(() => {
        const activeScreen = document.getElementById(screenId);
        const firstFocusable = activeScreen.querySelector('button, [tabindex="0"]');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }, 100);
}

// === QUIZ LOGIC ===
function startQuiz() {
    playSound();
    currentQuestionIndex = 0;
    answers = [];
    balanceTilt = 0;
    updateBalanceVisual();
    loadQuestion();
    showScreen('questionsScreen');
}

function loadQuestion() {
    // Update progress
    const progressText = document.getElementById('progressText');
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${QUESTIONS.length}`;
    
    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    const progressPercent = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
    progressFill.style.width = `${progressPercent}%`;
    
    // Update question text
    const questionText = document.getElementById('questionText');
    questionText.textContent = QUESTIONS[currentQuestionIndex];
    
    // Update navigation buttons
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    backBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = !answers[currentQuestionIndex];
    
    // Reset balance to current state
    updateBalanceVisual();
    
    // Setup evasive behavior for No button on last question ONLY
    const noButton = document.querySelector('#questionsScreen .no-btn');
    if (!noButton) return;
    
    if (currentQuestionIndex === QUESTIONS.length - 1) {
        // Last question - make No button evasive
        noButton.classList.add('evasive-last-btn');
        // Remove the original onclick to prevent normal behavior
        noButton.removeAttribute('onclick');
        noButton.onclick = null;
        setupEvasiveLastQuestionButton();
    } else {
        // Not last question - ensure normal behavior
        cleanupEvasiveLastButton(noButton);
        // Restore original onclick behavior
        noButton.setAttribute('onclick', "selectAnswer('no')");
        noButton.onclick = function() { selectAnswer('no'); };
    }
}

function cleanupEvasiveLastButton(button) {
    if (!button) return;
    
    // Remove evasive classes and styles
    button.classList.remove('evasive-last-btn', 'evasive-mode');
    button.style.cssText = '';
    
    // Remove any existing placeholder
    const existingPlaceholder = document.querySelector('.evasive-last-placeholder');
    if (existingPlaceholder) {
        existingPlaceholder.remove();
    }
    
    // Remove all evasive event listeners by cloning the button
    const newButton = button.cloneNode(true);
    newButton.className = button.className.replace('evasive-last-btn', '').replace('evasive-mode', '').trim();
    newButton.onclick = function() { selectAnswer('no'); };
    newButton.setAttribute('onclick', "selectAnswer('no')");
    button.parentNode.replaceChild(newButton, button);
}

function cleanupEvasiveStartButton() {
    const startButton = document.querySelector('.evasive-start-btn');
    if (!startButton) return;
    
    // Remove evasive mode class and reset styles
    startButton.classList.remove('evasive-mode');
    startButton.style.cssText = '';
    
    // Remove any existing placeholder
    const existingPlaceholder = document.querySelector('.evasive-start-placeholder');
    if (existingPlaceholder) {
        existingPlaceholder.remove();
    }
    
    // Reset the button to its original position and behavior
    // Remove all event listeners by cloning the button
    const newButton = startButton.cloneNode(true);
    newButton.className = startButton.className.replace('evasive-mode', '').trim();
    newButton.onclick = function() { showMessage('呵呵~ 😏 你以为点得到？'); };
    newButton.setAttribute('onclick', "showMessage('呵呵~ 😏 你以为点得到？')");
    startButton.parentNode.replaceChild(newButton, startButton);
    
    // Re-setup the evasive behavior for the new button
    setupEvasiveStartButton();
}

function selectAnswer(answer) {
    playSound();
    
    // Prevent multiple rapid clicks on the same question
    if (answers[currentQuestionIndex] === answer) {
        return;
    }
    
    // If there was a previous answer, revert its balance effect
    const previousAnswer = answers[currentQuestionIndex];
    if (previousAnswer === 'okay') {
        balanceTilt += 1;
    } else if (previousAnswer === 'no') {
        balanceTilt -= 1;
    }
    
    // Store the new answer
    answers[currentQuestionIndex] = answer;
    
    // Apply balance tilt for new answer
    if (answer === 'okay') {
        balanceTilt -= 1;
    } else {
        balanceTilt += 1;
    }
    
    // Update visual
    updateBalanceVisual();
    
    // Enable next button
    document.getElementById('nextBtn').disabled = false;
    
    // Auto-advance immediately to next question
    if (currentQuestionIndex < QUESTIONS.length - 1) {
        nextQuestion();
    } else {
        // On last question, finish immediately
        finishQuiz();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        finishQuiz();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        // Revert balance tilt for the current answer we're leaving
        const currentAnswer = answers[currentQuestionIndex];
        if (currentAnswer === 'okay') {
            balanceTilt += 1;
        } else if (currentAnswer === 'no') {
            balanceTilt -= 1;
        }
        
        currentQuestionIndex--;
        loadQuestion();
    }
}

function updateBalanceVisual() {
    const balanceBar = document.getElementById('balanceBar');
    const maxTilt = 15;
    const tiltDegrees = Math.max(-maxTilt, Math.min(maxTilt, balanceTilt * 3));
    balanceBar.style.transform = `rotate(${tiltDegrees}deg)`;
}

function finishQuiz() {
    // Ensure we have answers for all questions
    if (answers.length < QUESTIONS.length) {
        showMessage('Please answer all questions before finishing.');
        return;
    }
    
    // Check for any undefined answers
    for (let i = 0; i < QUESTIONS.length; i++) {
        if (!answers[i]) {
            showMessage('Please answer all questions before finishing.');
            return;
        }
    }
    
    playSound();
    calculateAndShowResult();
    showScreen('resultScreen');
}

// === RESULT CALCULATION ===
function calculateAndShowResult() {
    const okayCount = answers.filter(answer => answer === 'okay').length;
    const noCount = answers.filter(answer => answer === 'no').length;
    
    const resultHeadline = document.getElementById('resultHeadline');
    const resultImageContainer = document.getElementById('resultImageContainer');
    const resultImage = document.getElementById('resultImage');
    const resultSummary = document.getElementById('resultSummary');
    
    // Apply logic as specified
    if (noCount === QUESTIONS.length) {
        // All answers are "No"
        resultHeadline.textContent = "那我走？";
        resultImageContainer.style.display = 'none';
        resultSummary.textContent = `你选择了 ${noCount} 次“拒绝”。`;
    } else {
        // At least one "Okay" answer
        resultHeadline.textContent = "再给一次机会？";
        resultImageContainer.style.display = 'block';
        resultImage.src = resultImageUrl;
        resultSummary.textContent = `你选择了 ${okayCount} 次“好”和 ${noCount} 次“拒绝”。`;
    }
}

// === ACTIONS ===
function restartQuiz() {
    playSound();
    
    // Clean up any evasive last question button
    const evasiveLastButton = document.querySelector('#questionsScreen .evasive-last-btn');
    if (evasiveLastButton) {
        cleanupEvasiveLastButton(evasiveLastButton);
    }
    
    // Clean up any evasive start button
    cleanupEvasiveStartButton();
    
    showScreen('startScreen');
}

// === SOUND SYSTEM ===
function initializeBackgroundMusic() {
    backgroundMusic = new Audio(bgmUrl);
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    
    // Handle loading errors gracefully
    backgroundMusic.addEventListener('error', function() {
        backgroundMusic = null;
    });
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled.toString());
    updateSoundToggle();
    
    if (soundEnabled) {
        playBackgroundMusic();
    } else {
        pauseBackgroundMusic();
    }
}

function updateSoundToggle() {
    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');
    
    if (soundEnabled) {
        soundIcon.textContent = '🔊';
        soundToggle.title = 'Music: On - Click to pause';
        soundToggle.setAttribute('aria-label', 'Background music is playing. Click to pause.');
    } else {
        soundIcon.textContent = '🔇';
        soundToggle.title = 'Music: Off - Click to play';
        soundToggle.setAttribute('aria-label', 'Background music is paused. Click to play.');
    }
}

function playSound() {
    if (!soundEnabled || !backgroundMusic) return;
    
    // If music isn't playing, start it
    if (backgroundMusic.paused) {
        playBackgroundMusic();
    }
}

function playBackgroundMusic() {
    if (!backgroundMusic) return;
    
    try {
        backgroundMusic.play().catch(function(error) {
            // If autoplay is blocked, we'll try again on next user interaction
        });
    } catch (error) {
        // Handle playback errors silently
    }
}

function pauseBackgroundMusic() {
    if (backgroundMusic && !backgroundMusic.paused) {
        backgroundMusic.pause();
    }
}

// === MESSAGE OVERLAY ===
function showMessage(text) {
    const messageOverlay = document.getElementById('messageOverlay');
    const messageText = document.getElementById('messageText');
    
    messageText.textContent = text;
    messageOverlay.classList.add('show');
}

function hideMessage() {
    const messageOverlay = document.getElementById('messageOverlay');
    messageOverlay.classList.remove('show');
}

// === KEYBOARD NAVIGATION ===
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // Close message overlay with Escape key
        if (event.key === 'Escape') {
            hideMessage();
            return;
        }
        
        // Handle navigation on questions screen
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen && activeScreen.id === 'questionsScreen') {
            if (event.key === 'ArrowLeft' && !document.getElementById('backBtn').disabled) {
                event.preventDefault();
                previousQuestion();
            } else if (event.key === 'ArrowRight' && !document.getElementById('nextBtn').disabled) {
                event.preventDefault();
                nextQuestion();
            } else if (event.key === '1' || event.key === 'o' || event.key === 'O') {
                event.preventDefault();
                selectAnswer('okay');
            } else if (event.key === '2' || event.key === 'n' || event.key === 'N') {
                event.preventDefault();
                selectAnswer('no');
            }
        }
        
        // Space bar for primary actions
        if (event.key === ' ') {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.tagName === 'BUTTON') {
                event.preventDefault();
                focusedElement.click();
            }
        }
    });
}

// === EVASIVE LAST QUESTION BUTTON ===
function setupEvasiveLastQuestionButton() {
    const lastButton = document.querySelector('#questionsScreen .evasive-last-btn');
    if (!lastButton) return;
    
    let isEvasive = false;
    
    // Remove any existing event listeners by cloning
    const newButton = lastButton.cloneNode(true);
    lastButton.parentNode.replaceChild(newButton, lastButton);
    
    // Get reference to the new button
    const button = document.querySelector('#questionsScreen .evasive-last-btn');
    if (!button) return;
    
    // Desktop: hover detection
    button.addEventListener('mouseenter', function() {
        if (!isEvasive) {
            startEvasiveLastMode(this);
            isEvasive = true;
        }
        moveLastButtonAnywhere(this);
    });
    
    // Mobile: touch detection
    button.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (!isEvasive) {
            startEvasiveLastMode(this);
            isEvasive = true;
        }
        moveLastButtonAnywhere(this);
    });
    
    // Also move on touch move
    button.addEventListener('touchmove', function(e) {
        e.preventDefault();
        moveLastButtonAnywhere(this);
    });
    
    // Completely prevent any clicking
    button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        moveLastButtonAnywhere(this);
        showMessage("最后一次机会都不要？😤 真的要错过吗？");
        return false;
    }, true);
}

function startEvasiveLastMode(button) {
    // Create placeholder to maintain layout
    const placeholder = document.createElement('div');
    placeholder.className = 'evasive-last-placeholder';
    placeholder.textContent = '最后的机会在逃跑! 😱';
    placeholder.style.display = 'block';
    
    // Insert placeholder before removing button from flow
    button.parentElement.insertBefore(placeholder, button);
    
    // Make button fixed position so it can move anywhere on screen
    button.classList.add('evasive-mode');
    
    // Store reference to placeholder
    button.placeholder = placeholder;
}

function moveLastButtonAnywhere(button) {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonWidth = button.offsetWidth;
    const buttonHeight = button.offsetHeight;
    
    // Calculate safe boundaries (keep button fully visible)
    const margin = 20;
    const maxX = viewportWidth - buttonWidth - margin;
    const maxY = viewportHeight - buttonHeight - margin;
    
    // Generate random position anywhere on screen
    const randomX = Math.random() * maxX + margin/2;
    const randomY = Math.random() * maxY + margin/2;
    
    // Move the button to the new position
    button.style.left = randomX + 'px';
    button.style.top = randomY + 'px';
    
    // Add visual feedback with random colors
    const colors = [
        'rgba(254, 178, 178, 0.6)',
        'rgba(187, 154, 247, 0.6)', 
        'rgba(147, 197, 253, 0.6)',
        'rgba(251, 211, 141, 0.6)'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    button.style.boxShadow = `0 8px 25px ${randomColor}`;
    button.style.transform = 'scale(1.1) rotate(5deg)';
    
    // Reset transform after a moment
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
    
    // Update placeholder with random teasing messages
    if (button.placeholder) {
        const messages = [
            "最后机会也不要？😢",       // Don't want the last chance?
            "真的要放弃吗？💔",         // Really want to give up?
            "再想想吧！🤔",             // Think again!
            "别这样嘛～😭",             // Don't be like this~
            "我会想你的！😢",           // I'll miss you!
            "最后的最后...😔",          // The very last...
            "还有挽回的余地！💕",       // There's still hope!
            "不要轻易说再见！😰",       // Don't say goodbye easily!
            "珍惜眼前人～💝",           // Cherish the person in front of you~
            "后悔来不及了！⏰",         // Too late for regrets!
            "这真的是最后了...😭",      // This is really the last time...
            "给个机会好不好？🥺"        // Give me a chance, please?
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        button.placeholder.textContent = randomMessage;
    }
}
function setupEvasiveStartButton() {
    const startButton = document.querySelector('.evasive-start-btn');
    if (!startButton) return;
    
    let isEvasive = false;
    
    // Desktop: hover detection
    startButton.addEventListener('mouseenter', function() {
        if (!isEvasive) {
            startEvasiveMode(this);
            isEvasive = true;
        }
        moveButtonAnywhere(this);
    });
    
    // Mobile: touch detection
    startButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (!isEvasive) {
            startEvasiveMode(this);
            isEvasive = true;
        }
        moveButtonAnywhere(this);
    });
    
    // Also move on touch move
    startButton.addEventListener('touchmove', function(e) {
        e.preventDefault();
        moveButtonAnywhere(this);
    });
    
    // Prevent actual clicking
    startButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        moveButtonAnywhere(this);
        showMessage("呵呵~ 😏 你以为点得到？");
        return false;
    });
}

function startEvasiveMode(button) {
    // Create placeholder to maintain layout
    const placeholder = document.createElement('div');
    placeholder.className = 'evasive-start-placeholder';
    placeholder.textContent = 'Try to catch me! 😈';
    placeholder.style.display = 'block';
    
    // Insert placeholder before removing button from flow
    button.parentElement.insertBefore(placeholder, button);
    
    // Make button fixed position so it can move anywhere on screen
    button.classList.add('evasive-mode');
    
    // Store reference to placeholder
    button.placeholder = placeholder;
}

function moveButtonAnywhere(button) {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonWidth = button.offsetWidth;
    const buttonHeight = button.offsetHeight;
    
    // Calculate safe boundaries (keep button fully visible)
    const margin = 20;
    const maxX = viewportWidth - buttonWidth - margin;
    const maxY = viewportHeight - buttonHeight - margin;
    
    // Generate random position anywhere on screen
    const randomX = Math.random() * maxX + margin/2;
    const randomY = Math.random() * maxY + margin/2;
    
    // Move the button to the new position
    button.style.left = randomX + 'px';
    button.style.top = randomY + 'px';
    
    // Add visual feedback with random colors
    const colors = [
        'rgba(254, 178, 178, 0.6)',
        'rgba(187, 154, 247, 0.6)', 
        'rgba(147, 197, 253, 0.6)',
        'rgba(251, 211, 141, 0.6)'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    button.style.boxShadow = `0 8px 25px ${randomColor}`;
    button.style.transform = 'scale(1.1) rotate(5deg)';
    
    // Reset transform after a moment
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
    
    // Update placeholder with random teasing messages
    if (button.placeholder) {
        const messages = [
    "还在努力吗？😏",       // Still trying?
    "太慢啦！🏃‍♂️",         // Too slow!
    "来追我呀！🤪",         // Catch me if you can!
    "没门！😆",             // Nope!
    "继续试吧！😈",         // Keep trying!
    "差一点…才怪！😜",       // Almost there... NOT!
    "想得美！🤭",           // Dream on!
    "别想了！🤨",           // Don’t even think about it
    "再点也没用哦～😂",       // Clicking won’t help
    "别白费力气啦！🙃",       // Don’t waste your effort
    "嘿嘿，没那么容易！😏",   // Hehe, not that easy
    "抓不到我吧？😜",        // Can’t catch me, right?
    "就差一点点～再试试？🤪"   // So close... try again?
];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        button.placeholder.textContent = randomMessage;
    }
}