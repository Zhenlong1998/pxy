// === GAME CONFIGURATION ===
const QUESTIONS = [
  "如果我掉进河里，你会跳下去救吗？",
  "要不要一起吃饭？（你买单 😏）",
  "要不要一起减肥？我指导你呗",
  "如果真的最后一次，你会珍惜吗？",
  "我们还能当朋友吗？"
];

const resultImageUrl = "./d5387bc40d.gif";
const bgmUrl = "./bgm.mp3";
let backgroundMusic = null;

// Romantic Chinese phrases for floating text background
const ROMANTIC_PHRASES = [
    "想你 💕", "想见你 🥺", "好想你 💖", "爱你 ❤️", "喜欢 😍",
    "想念 💭", "思念 🌙", "牵挂 💝", "陪伴 👫", "守护 🛡️",
    "心动 💗", "心跳 💓", "心意 💌", "真心 ❤️‍🔥", "用心 💘",
    "温柔 🌸", "甜蜜 🍯", "浪漫 🌹", "美好 ✨", "幸福 😊",
    "永远 ♾️", "一生 👰‍♀️", "一世 💒", "一辈子 🤝", "此生 🌟",
    "缘分 🧵", "命运 🎭", "注定 💫", "天意 🙏", "心有灵犀 💞",
    "月亮 🌙", "星星 ⭐", "花朵 🌺", "春天 🌷", "阳光 ☀️",
    "梦里 😴", "梦中 💤", "梦境 🌈", "美梦 🦄", "甜梦 🧸",
    "等你 ⏰", "等待 ⌛", "盼望 🤗", "期待 🎁", "希望 🌠",
    "珍惜 💎", "呵护 🤲", "宠爱 👑", "疼爱 🥰", "关怀 🫶"
];
let floatingTextInterval = null;

// === GAME STATE ===
let currentQuestionIndex = 0;
let answers = []; // Store "okay" or "no" for each question
let soundEnabled = true; // Enable by default for autoplay
let balanceTilt = 0; // Track the balance tilt

// === PERFORMANCE OPTIMIZATION ===
let activeTimeouts = new Set();
let activeIntervals = new Set();
let activeAnimationFrames = new Set();

// Enhanced timeout with tracking
function setTrackedTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
        activeTimeouts.delete(timeoutId);
        callback();
    }, delay);
    activeTimeouts.add(timeoutId);
    return timeoutId;
}

// === INTERACTIVE SNOWFLAKES ===
function initializeInteractiveSnowflakes() {
    const snowflakes = document.querySelectorAll('.snowflake');
    
    snowflakes.forEach((snowflake, index) => {
        // Add click/touch event listener
        snowflake.addEventListener('click', (e) => {
            handleSnowflakeClick(snowflake, e);
        });
        
        // Add touch event for mobile
        snowflake.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleSnowflakeClick(snowflake, e);
        });
    });
}

function handleSnowflakeClick(snowflake, event) {
    // Play sound if enabled
    playSound();
    
    // Get click position for effects
    const rect = snowflake.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Random reaction type
    const reactions = ['explode', 'multiply', 'bounce', 'colorChange'];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    
    // Create ripple effect at click position
    createRippleEffect(x, y);
    
    // Apply reaction
    switch(reaction) {
        case 'explode':
            explodeSnowflake(snowflake);
            break;
        case 'multiply':
            multiplySnowflake(snowflake);
            break;
        case 'bounce':
            bounceSnowflake(snowflake);
            break;
        case 'colorChange':
            changeSnowflakeColor(snowflake);
            break;
    }
}

function explodeSnowflake(snowflake) {
    snowflake.classList.add('clicked');
    
    
    
    // Remove snowflake after animation
    setTimeout(() => {
        if (snowflake.parentNode) {
            snowflake.parentNode.removeChild(snowflake);
            
            // Respawn after 3 seconds
            setTimeout(() => {
                respawnSnowflake();
            }, 3000);
        }
    }, 800);
}

function multiplySnowflake(snowflake) {
    snowflake.classList.add('multiply');
    
    // Create 2-3 new snowflakes nearby
    const numNew = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < numNew; i++) {
        setTimeout(() => {
            createTemporarySnowflake(snowflake);
        }, i * 200);
    }
    
    // Remove multiply class
    setTimeout(() => {
        snowflake.classList.remove('multiply');
    }, 1000);
}

function bounceSnowflake(snowflake) {
    const originalAnimation = snowflake.style.animation;
    snowflake.style.animation = 'snowflakeBounce 0.6s ease-out';
    
    setTimeout(() => {
        snowflake.style.animation = originalAnimation;
    }, 600);
}

function changeSnowflakeColor(snowflake) {
    const colors = [
        'rgba(255, 192, 203, 0.9)', // Pink
        'rgba(173, 216, 230, 0.9)', // Light blue
        'rgba(255, 215, 0, 0.9)',   // Gold
        'rgba(152, 251, 152, 0.9)', // Light green
        'rgba(255, 160, 122, 0.9)'  // Light coral
    ];
    
    const originalColor = snowflake.style.color;
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    
    snowflake.style.color = newColor;
    snowflake.style.textShadow = `0 0 10px ${newColor}`;
    
    // Revert after 2 seconds
    setTimeout(() => {
        snowflake.style.color = originalColor;
        snowflake.style.textShadow = '';
    }, 2000);
}

function createRippleEffect(x, y) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: fixed;
        left: ${x - 25}px;
        top: ${y - 25}px;
        width: 50px;
        height: 50px;
        border: 2px solid rgba(135, 206, 250, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        animation: rippleExpand 0.6s ease-out forwards;
    `;
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

function createSnowflakeBurst(sourceSnowflake) {
    const rect = sourceSnowflake.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 5; i++) {
        const miniFlake = document.createElement('div');
        miniFlake.textContent = '❄';
        miniFlake.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            color: rgba(255, 215, 0, 0.8);
            font-size: 10px;
            pointer-events: none;
            z-index: 999;
            animation: burstOut${i} 1s ease-out forwards;
        `;
        
        document.body.appendChild(miniFlake);
        
        setTimeout(() => {
            if (miniFlake.parentNode) {
                miniFlake.parentNode.removeChild(miniFlake);
            }
        }, 1000);
    }
}

function createTemporarySnowflake(sourceSnowflake) {
    const rect = sourceSnowflake.getBoundingClientRect();
    const newFlake = document.createElement('div');
    newFlake.textContent = '❄';
    newFlake.classList.add('snowflake');
    
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 50;
    
    newFlake.style.cssText = `
        position: fixed;
        left: ${rect.left + offsetX}px;
        top: ${rect.top + offsetY}px;
        color: rgba(173, 216, 230, 0.8);
        font-size: ${Math.random() * 8 + 10}px;
        animation: fall linear ${Math.random() * 3 + 4}s;
    `;
    
    document.body.appendChild(newFlake);
    
    // Make it interactive too
    newFlake.addEventListener('click', (e) => {
        handleSnowflakeClick(newFlake, e);
    });
    
    // Remove after falling
    setTimeout(() => {
        if (newFlake.parentNode) {
            newFlake.parentNode.removeChild(newFlake);
        }
    }, 7000);
}

function respawnSnowflake() {
    const snowContainer = document.querySelector('.snow-container');
    if (!snowContainer) return;
    
    const newFlake = document.createElement('div');
    newFlake.textContent = '❄';
    newFlake.classList.add('snowflake');
    
    newFlake.style.cssText = `
        left: ${Math.random() * 90 + 5}%;
        font-size: ${Math.random() * 8 + 12}px;
        animation-duration: ${Math.random() * 4 + 6}s;
        animation-delay: 0s;
        top: -200px;
    `;
    
    snowContainer.appendChild(newFlake);
    
    // Make it interactive
    newFlake.addEventListener('click', (e) => {
        handleSnowflakeClick(newFlake, e);
    });
}

// === FLOATING ROMANTIC TEXT ===
function initializeFloatingText() {
    // Stop any existing floating text first to prevent duplicates
    stopFloatingText();
    
    // Start spawning floating text periodically
    floatingTextInterval = setTrackedInterval(() => {
        createFloatingText();
    }, 3000 + Math.random() * 2000); // Random interval between 2-5 seconds
    
    // Create initial text immediately
    setTimeout(() => {
        createFloatingText();
    }, 1000);
}

function createFloatingText() {
    const container = document.querySelector('.floating-text-container');
    if (!container) return;
    
    // Select random phrase
    const phrase = ROMANTIC_PHRASES[Math.floor(Math.random() * ROMANTIC_PHRASES.length)];
    
    // Create text element
    const textElement = document.createElement('div');
    textElement.textContent = phrase;
    textElement.classList.add('floating-text');
    
    // Random color theme
    const themes = ['pink', 'blue', 'gold', 'purple'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    textElement.classList.add(randomTheme);
    
    // Random position (horizontal)
    const leftPosition = Math.random() * 80 + 10; // 10% to 90%
    
    // Random font size
    const fontSize = Math.random() * 20 + 16; // 16px to 36px
    
    // Random animation duration
    const duration = Math.random() * 4 + 6; // 6 to 10 seconds
    
    // Apply styles
    textElement.style.cssText = `
        left: ${leftPosition}%;
        top: calc(100vh + 50px);
        font-size: ${fontSize}px;
        animation-duration: ${duration}s;
    `;
    
    // Add to container
    container.appendChild(textElement);
    
    // Remove element after animation completes
    setTimeout(() => {
        if (textElement.parentNode) {
            textElement.parentNode.removeChild(textElement);
        }
    }, duration * 1000);
}

function stopFloatingText() {
    if (floatingTextInterval) {
        clearInterval(floatingTextInterval);
        floatingTextInterval = null;
    }
    
    // Clear existing floating text
    const container = document.querySelector('.floating-text-container');
    if (container) {
        container.innerHTML = '';
    }
}

// Enhanced interval with tracking
function setTrackedInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    activeIntervals.add(intervalId);
    return intervalId;
}

// Enhanced requestAnimationFrame with tracking
function setTrackedAnimationFrame(callback) {
    const frameId = requestAnimationFrame(() => {
        activeAnimationFrames.delete(frameId);
        callback();
    });
    activeAnimationFrames.add(frameId);
    return frameId;
}

// Global cleanup function
function cleanupAllAnimations() {
    // Clear all tracked timeouts
    activeTimeouts.forEach(id => clearTimeout(id));
    activeTimeouts.clear();
    
    // Clear all tracked intervals
    activeIntervals.forEach(id => clearInterval(id));
    activeIntervals.clear();
    
    // Cancel all tracked animation frames
    activeAnimationFrames.forEach(id => cancelAnimationFrame(id));
    activeAnimationFrames.clear();
    
    // Stop floating text
    stopFloatingText();
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    // Reset all buttons to original state first
    resetAllButtonsToOriginalState();
    
    // Initialize background music
    initializeBackgroundMusic();
    
    // Load saved sound preference (but default to true now)
    const savedSoundPreference = localStorage.getItem('soundEnabled');
    soundEnabled = savedSoundPreference !== null ? savedSoundPreference === 'true' : true;
    updateSoundToggle();
    
    // Try to autoplay music
    if (soundEnabled) {
        // Small delay to ensure audio is loaded
        setTimeout(() => {
            playBackgroundMusic();
        }, 500);
    }
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    // Setup evasive start button
    setupEvasiveStartButton();
    
    // Initialize interactive snowflakes
    setTimeout(() => {
        initializeInteractiveSnowflakes();
    }, 1000);
    
    // Initialize floating romantic text
    setTimeout(() => {
        initializeFloatingText();
    }, 2000);
    
    // Ensure we start on the correct screen
    showScreen('startScreen');
});

// === BUTTON STATE RESET ===
function resetAllButtonsToOriginalState() {
    // Reset all buttons to clean state
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        // Clear all inline styles
        button.style.cssText = '';
        
        // Remove evasive-mode class but preserve evasive-start-btn and evasive-last-btn classes
        button.classList.remove('evasive-mode');
        
        // Reset positioning only for buttons that have evasive-mode
        button.style.position = '';
        button.style.left = '';
        button.style.top = '';
        button.style.transform = '';
        button.style.boxShadow = '';
        
        // Enable all buttons initially
        button.disabled = false;
    });
    
    // Remove any placeholder elements that might have persisted
    const placeholders = document.querySelectorAll('.evasive-start-placeholder, .evasive-last-placeholder');
    placeholders.forEach(placeholder => placeholder.remove());
    
    // Specifically reset answer buttons to their original onclick handlers
    const okayBtn = document.querySelector('.okay-btn');
    const noBtn = document.querySelector('.no-btn');
    if (okayBtn) {
        okayBtn.onclick = function() { selectAnswer('okay'); };
        okayBtn.setAttribute('onclick', "selectAnswer('okay')");
    }
    if (noBtn) {
        noBtn.onclick = function() { selectAnswer('no'); };
        noBtn.setAttribute('onclick', "selectAnswer('no')");
    }
}

// === SCREEN MANAGEMENT ===
function showScreen(screenId) {
    // Clean up all animations and effects when changing screens
    cleanupAllAnimations();
    
    // Clean up any evasive last question button before switching screens
    if (screenId !== 'questionsScreen') {
        const evasiveLastButton = document.querySelector('#questionsScreen .evasive-last-btn');
        if (evasiveLastButton) {
            cleanupEvasiveLastButton(evasiveLastButton);
        }
    }
    
    // Get current active screen for transition
    const currentScreen = document.querySelector('.screen.active');
    const targetScreen = document.getElementById(screenId);
    
    if (currentScreen && currentScreen !== targetScreen) {
        // Add fade out animation to current screen
        currentScreen.classList.add('fadeOut');
        
        // After fade out completes, hide current and show target
        setTimeout(() => {
            currentScreen.classList.remove('active', 'fadeOut');
            targetScreen.classList.add('active');
            
            // Add fade in animation to target screen
            setTimeout(() => {
                targetScreen.classList.add('fadeIn');
                
                // Remove animation class after completion
                setTimeout(() => {
                    targetScreen.classList.remove('fadeIn');
                }, 400);
            }, 50);
            
        }, 300);
    } else {
        // No current screen or same screen - simple transition
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        targetScreen.classList.add('active');
        targetScreen.classList.add('fadeIn');
        
        // Remove animation class after completion
        setTimeout(() => {
            targetScreen.classList.remove('fadeIn');
        }, 400);
    }
    
    // Focus management for accessibility
    setTimeout(() => {
        const activeScreen = document.getElementById(screenId);
        const firstFocusable = activeScreen.querySelector('button, [tabindex="0"]');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Restart floating text after screen transition
        setTimeout(() => {
            initializeFloatingText();
        }, 1000);
    }, 400);
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
    
    // Update progress bar with animations
    const progressFill = document.getElementById('progressFill');
    const progressPercent = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
    
    // Add glow animation
    progressFill.classList.add('progressGlow');
    
    // Animate width change
    progressFill.style.width = `${progressPercent}%`;
    
    // Add shimmer effect overlay if it doesn't exist
    if (!progressFill.querySelector('.shimmer')) {
        const shimmer = document.createElement('div');
        shimmer.classList.add('shimmer');
        progressFill.appendChild(shimmer);
    }
    
    // Trigger shimmer animation
    const shimmer = progressFill.querySelector('.shimmer');
    if (shimmer) {
        shimmer.style.animation = 'none';
        setTimeout(() => {
            shimmer.style.animation = 'shimmer 1s ease-out';
        }, 100);
    }
    
    // Remove glow after animation
    setTimeout(() => {
        progressFill.classList.remove('progressGlow');
    }, 1000);
    
    // Update question text immediately
    const questionText = document.getElementById('questionText');
    questionText.textContent = QUESTIONS[currentQuestionIndex];
    
    // Update navigation buttons
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    backBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = !answers[currentQuestionIndex];
    
    // Recalculate balance based on all previous answers
    balanceTilt = 0;
    for (let i = 0; i < answers.length; i++) {
        if (answers[i] === 'okay') {
            balanceTilt -= 1;
        } else if (answers[i] === 'no') {
            balanceTilt += 1;
        }
    }
    
    // Update balance visual
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

// === ANSWER SELECTION ===
function selectAnswer(answer) {
    playSound();
    
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
            // If autoplay is blocked, show a subtle notification
            console.log('Autoplay blocked - music will start on user interaction');
            // Try again on any user interaction
            document.addEventListener('click', function tryAgain() {
                if (soundEnabled) {
                    backgroundMusic.play().catch(() => {});
                    document.removeEventListener('click', tryAgain);
                }
            }, { once: true });
        });
    } catch (error) {
        // Handle playback errors silently
        console.log('Audio playback error:', error);
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