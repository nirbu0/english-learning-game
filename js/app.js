/**
 * Main Application - English Adventure Game
 */

const Game = {
    currentUser: null,
    currentTheme: null,
    isInitialized: false,
    
    // DOM Elements
    elements: {},
    
    /**
     * Initialize the game
     */
    async init() {
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize modules
        await GameScenes.init();
        GameSpeech.init();
        
        // Load settings
        this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check for returning user
        const savedUser = GameStorage.getCurrentUser();
        if (savedUser) {
            this.currentUser = savedUser;
        }
        
        this.isInitialized = true;
        console.log('🎮 English Adventure Game initialized!');
    },
    
    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            // Screens
            welcomeScreen: document.getElementById('welcome-screen'),
            themeScreen: document.getElementById('theme-screen'),
            gameScreen: document.getElementById('game-screen'),
            
            // Welcome screen
            userCards: document.querySelectorAll('.user-card'),
            settingsBtn: document.getElementById('settings-btn'),
            
            // Theme screen
            themeGrid: document.getElementById('theme-grid'),
            currentUserAvatar: document.getElementById('current-user-avatar'),
            currentUserName: document.getElementById('current-user-name'),
            totalStarsCount: document.getElementById('total-stars-count'),
            
            // Game screen
            sceneArea: document.getElementById('scene-area'),
            instructionArea: document.getElementById('instruction-area'),
            instructionText: document.getElementById('instruction-text'),
            speakInstructionBtn: document.getElementById('speak-instruction-btn'),
            interactionArea: document.getElementById('interaction-area'),
            progressBar: document.getElementById('progress-bar'),
            progressText: document.getElementById('progress-text'),
            gameThemeTitle: document.getElementById('game-theme-title'),
            gameStars: document.getElementById('game-stars'),
            
            // Overlays
            celebrationOverlay: document.getElementById('celebration-overlay'),
            feedbackOverlay: document.getElementById('feedback-overlay'),
            feedbackContent: document.getElementById('feedback-content'),
            earnedStars: document.getElementById('earned-stars'),
            celebrationMessage: document.getElementById('celebration-message'),
            playAgainBtn: document.getElementById('play-again-btn'),
            chooseThemeBtn: document.getElementById('choose-theme-btn'),
            
            // Settings modal
            settingsModal: document.getElementById('settings-modal'),
            soundEffectsToggle: document.getElementById('sound-effects-toggle'),
            speechSpeed: document.getElementById('speech-speed'),
            resetProgressBtn: document.getElementById('reset-progress-btn'),
            settingsCloseBtn: document.getElementById('settings-close-btn'),
            
            // Back buttons
            backBtns: document.querySelectorAll('.back-btn')
        };
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // User selection
        this.elements.userCards.forEach(card => {
            card.addEventListener('click', () => this.selectUser(card.dataset.user));
        });
        
        // Back buttons
        this.elements.backBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                if (target === 'welcome-screen') {
                    GameSpeech.cancel();
                    GameScenes.reset();
                }
                this.showScreen(target);
            });
        });
        
        // Speak instruction button
        this.elements.speakInstructionBtn.addEventListener('click', () => {
            this.speakCurrentInstruction();
        });
        
        // Settings
        this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        this.elements.settingsCloseBtn.addEventListener('click', () => this.hideSettings());
        this.elements.soundEffectsToggle.addEventListener('change', (e) => {
            GameStorage.saveSettings({ soundEffects: e.target.checked });
        });
        this.elements.speechSpeed.addEventListener('change', (e) => {
            GameSpeech.setRate(parseFloat(e.target.value));
        });
        this.elements.resetProgressBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress?')) {
                GameStorage.resetAll();
                this.hideSettings();
                location.reload();
            }
        });
        
        // Celebration buttons
        this.elements.playAgainBtn.addEventListener('click', () => {
            this.hideCelebration();
            this.startTheme(this.currentTheme.id);
        });
        this.elements.chooseThemeBtn.addEventListener('click', () => {
            this.hideCelebration();
            this.showScreen('theme-screen');
        });
    },
    
    /**
     * Load settings from storage
     */
    loadSettings() {
        const settings = GameStorage.getSettings();
        this.elements.soundEffectsToggle.checked = settings.soundEffects;
        this.elements.speechSpeed.value = settings.speechSpeed;
        GameSpeech.setRate(settings.speechSpeed);
    },
    
    /**
     * Show a screen
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    },
    
    /**
     * Select a user profile
     */
    selectUser(userId) {
        this.currentUser = userId;
        GameStorage.setCurrentUser(userId);
        
        const user = GameStorage.getUser(userId);
        
        // Update header
        this.elements.currentUserAvatar.textContent = user.avatar;
        this.elements.currentUserName.textContent = user.name;
        this.elements.totalStarsCount.textContent = user.totalStars || 0;
        
        // Render themes
        this.renderThemes();
        
        // Show theme screen
        this.showScreen('theme-screen');
        
        // Welcome message
        GameSpeech.speak(`Hello ${user.name}! Choose your adventure!`);
    },
    
    /**
     * Render theme selection grid
     */
    renderThemes() {
        const themes = GameScenes.getThemes();
        this.elements.themeGrid.innerHTML = '';
        
        themes.forEach((theme, index) => {
            const progress = GameStorage.getThemeProgress(this.currentUser, theme.id);
            const isUnlocked = index === 0 || GameStorage.isThemeUnlocked(this.currentUser, theme.id, themes);
            
            const card = document.createElement('div');
            card.className = 'theme-card';
            if (!isUnlocked) card.classList.add('locked');
            if (progress.completed) card.classList.add('completed');
            
            card.innerHTML = `
                <div class="theme-emoji">${theme.emoji}</div>
                <div class="theme-name">${theme.name}</div>
                <div class="theme-stars">${this.renderStars(progress.stars || 0)}</div>
                ${progress.completed ? '' : `
                    <div class="theme-progress">
                        <div class="theme-progress-fill" style="width: ${this.calculateThemeProgress(progress)}%"></div>
                    </div>
                `}
            `;
            
            if (isUnlocked) {
                card.addEventListener('click', () => this.startTheme(theme.id));
            }
            
            this.elements.themeGrid.appendChild(card);
        });
    },
    
    /**
     * Calculate theme progress percentage
     */
    calculateThemeProgress(progress) {
        if (progress.completed) return 100;
        return (progress.currentActivity || 0) * 25; // Rough estimate
    },
    
    /**
     * Render stars display
     */
    renderStars(count) {
        return '⭐'.repeat(count) + '☆'.repeat(3 - count);
    },
    
    /**
     * Start a theme/adventure
     */
    startTheme(themeId) {
        const theme = GameScenes.getTheme(themeId);
        if (!theme) return;
        
        this.currentTheme = theme;
        
        // Start the theme in GameScenes
        GameScenes.startTheme(themeId, this.currentUser);
        
        // Update UI
        this.elements.gameThemeTitle.textContent = theme.name;
        this.elements.gameStars.textContent = this.renderStars(0);
        
        // Render the scene
        GameScenes.renderScene(this.elements.sceneArea, theme);
        
        // Show game screen
        this.showScreen('game-screen');
        
        // Start first activity
        this.startActivity();
    },
    
    /**
     * Start an activity
     */
    startActivity() {
        const activity = GameScenes.getCurrentActivity();
        if (!activity) {
            this.completeTheme();
            return;
        }
        
        this.updateProgress();
        
        switch (activity.type) {
            case 'tap-to-learn':
                this.runTapToLearnActivity(activity);
                break;
            case 'find-item':
                this.runFindItemActivity(activity);
                break;
            case 'collect-items':
                this.runCollectItemsActivity(activity);
                break;
            case 'match-sound':
                this.runMatchSoundActivity(activity);
                break;
            case 'spelling':
                this.runSpellingActivity(activity);
                break;
            default:
                // For unimplemented activities, skip to next
                this.nextActivity();
        }
    },
    
    /**
     * Tap-to-learn activity - tap items to hear their names
     */
    runTapToLearnActivity(activity) {
        this.setInstruction(activity.instruction);
        GameSpeech.speakInstruction(activity.instruction);
        
        // Populate items
        GameScenes.populateItems(activity.items, (word, element) => {
            // Speak the word
            GameSpeech.speakWord(word);
            
            // Visual feedback
            GameScenes.showCorrectFeedback(element);
            
            // Show word name temporarily
            this.showWordLabel(word, element);
        });
        
        // Add "Next" button to interaction area
        this.elements.interactionArea.innerHTML = `
            <button class="btn btn-primary" id="next-activity-btn">Next Activity →</button>
        `;
        
        document.getElementById('next-activity-btn').addEventListener('click', () => {
            this.nextActivity();
        });
    },
    
    /**
     * Find-item activity - find the spoken word
     */
    runFindItemActivity(activity) {
        const targetWords = activity.targetWords;
        GameScenes.currentItemIndex = 0;
        
        const showNextItem = () => {
            if (GameScenes.currentItemIndex >= targetWords.length) {
                // Activity complete
                setTimeout(() => this.nextActivity(), 1000);
                return;
            }
            
            const targetWord = targetWords[GameScenes.currentItemIndex];
            const wordData = GameScenes.getWordData(targetWord);
            
            // Set instruction
            const instruction = activity.instruction.replace('{word}', targetWord.toUpperCase());
            this.setInstruction(instruction, targetWord);
            
            // Speak the instruction
            GameSpeech.speakInstruction(`Find the ${targetWord}!`);
            
            // Get shuffled options
            const options = GameScenes.getShuffledOptions(targetWord, targetWords, 4);
            
            // Populate items
            GameScenes.populateItems(options, (word, element) => {
                GameScenes.totalQuestions++;
                
                if (word === targetWord) {
                    // Correct!
                    GameScenes.correctAnswers++;
                    GameScenes.showCorrectFeedback(element);
                    this.showFeedback(true);
                    GameSpeech.speakEncouragement(true);
                    
                    GameScenes.currentItemIndex++;
                    setTimeout(showNextItem, 1500);
                } else {
                    // Wrong
                    GameScenes.showWrongFeedback(element);
                    this.showFeedback(false);
                    GameSpeech.speakEncouragement(false);
                }
            });
        };
        
        // Clear interaction area
        this.elements.interactionArea.innerHTML = '';
        
        showNextItem();
    },
    
    /**
     * Collect-items activity - put items in cart
     */
    runCollectItemsActivity(activity) {
        const items = activity.items;
        GameScenes.currentItemIndex = 0;
        GameScenes.collectedItems = [];
        
        const showNextItem = () => {
            if (GameScenes.currentItemIndex >= items.length) {
                // Activity complete
                setTimeout(() => this.nextActivity(), 1000);
                return;
            }
            
            const targetWord = items[GameScenes.currentItemIndex];
            
            // Set instruction
            const instruction = activity.instruction.replace('{word}', targetWord.toUpperCase());
            this.setInstruction(instruction, targetWord);
            
            // Speak the instruction
            GameSpeech.speakInstruction(`Put the ${targetWord} in the cart!`);
        };
        
        // Populate all items
        GameScenes.populateItems(items, (word, element) => {
            const targetWord = items[GameScenes.currentItemIndex];
            GameScenes.totalQuestions++;
            
            if (word === targetWord) {
                // Correct!
                GameScenes.correctAnswers++;
                GameScenes.showCorrectFeedback(element);
                GameScenes.markItemCollected(word);
                this.showFeedback(true);
                GameSpeech.speakEncouragement(true);
                
                GameScenes.currentItemIndex++;
                setTimeout(showNextItem, 1500);
            } else {
                // Wrong
                GameScenes.showWrongFeedback(element);
                this.showFeedback(false);
                GameSpeech.speak(`That's the ${word}. Find the ${targetWord}!`);
            }
        });
        
        // Clear interaction area
        this.elements.interactionArea.innerHTML = '';
        
        showNextItem();
    },
    
    /**
     * Match-sound activity - hear a word and tap the correct item
     */
    runMatchSoundActivity(activity) {
        const words = activity.words;
        GameScenes.currentItemIndex = 0;
        // Clear collected items so all options are clickable
        GameScenes.collectedItems = [];
        
        const showNextWord = () => {
            if (GameScenes.currentItemIndex >= words.length) {
                // Activity complete
                setTimeout(() => this.nextActivity(), 1000);
                return;
            }
            
            const targetWord = words[GameScenes.currentItemIndex];
            
            // Set instruction
            this.setInstruction(activity.instruction);
            
            // Speak the word (this is the main interaction)
            setTimeout(() => {
                GameSpeech.speakWord(targetWord);
            }, 500);
            
            // Get shuffled options
            const options = GameScenes.getShuffledOptions(targetWord, words, 4);
            
            // Populate items
            GameScenes.populateItems(options, (word, element) => {
                GameScenes.totalQuestions++;
                
                if (word === targetWord) {
                    // Correct!
                    GameScenes.correctAnswers++;
                    GameScenes.showCorrectFeedback(element);
                    this.showFeedback(true);
                    GameSpeech.speakEncouragement(true);
                    
                    GameScenes.currentItemIndex++;
                    setTimeout(showNextWord, 1500);
                } else {
                    // Wrong
                    GameScenes.showWrongFeedback(element);
                    this.showFeedback(false);
                    GameSpeech.speak('Try again!');
                    // Repeat the word
                    setTimeout(() => GameSpeech.speakWord(targetWord), 1000);
                }
            });
        };
        
        // Add replay button
        this.elements.interactionArea.innerHTML = `
            <button class="btn btn-secondary" id="replay-word-btn">🔊 Hear Again</button>
        `;
        
        document.getElementById('replay-word-btn').addEventListener('click', () => {
            const targetWord = words[GameScenes.currentItemIndex];
            GameSpeech.speakWord(targetWord);
        });
        
        showNextWord();
    },
    
    /**
     * Spelling activity - spell the word
     */
    runSpellingActivity(activity) {
        const words = activity.words;
        GameScenes.currentItemIndex = 0;
        
        const showNextWord = () => {
            if (GameScenes.currentItemIndex >= words.length) {
                // Activity complete
                setTimeout(() => this.nextActivity(), 1000);
                return;
            }
            
            const targetWord = words[GameScenes.currentItemIndex];
            const wordData = GameScenes.getWordData(targetWord);
            
            // Set instruction
            const instruction = activity.instruction.replace('{word}', '');
            this.setInstruction(`${instruction} ${wordData.emoji}`, targetWord);
            
            // Speak the word
            setTimeout(() => {
                GameSpeech.speak(`Spell the word: ${targetWord}`);
            }, 500);
            
            // Create letter buttons
            const letters = targetWord.toUpperCase().split('');
            const shuffledLetters = [...letters].sort(() => Math.random() - 0.5);
            let currentPosition = 0;
            
            // Create answer display
            const answerDisplay = letters.map(() => '_').join(' ');
            
            this.elements.interactionArea.innerHTML = `
                <div style="text-align: center; width: 100%;">
                    <div style="font-size: 2rem; font-family: var(--font-title); margin-bottom: 20px; letter-spacing: 10px;" id="spelling-answer">
                        ${answerDisplay}
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;" id="letter-buttons">
                        ${shuffledLetters.map((letter, i) => `
                            <button class="btn btn-secondary" data-letter="${letter}" data-index="${i}" style="min-width: 50px; font-size: 1.5rem; font-family: var(--font-title);">
                                ${letter}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            
            const answerEl = document.getElementById('spelling-answer');
            const letterBtns = document.querySelectorAll('#letter-buttons button');
            let currentAnswer = [];
            
            letterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const letter = btn.dataset.letter;
                    GameScenes.totalQuestions++;
                    
                    if (letter === letters[currentPosition]) {
                        // Correct letter
                        GameScenes.correctAnswers++;
                        currentAnswer.push(letter);
                        answerEl.textContent = currentAnswer.join(' ') + ' ' + letters.slice(currentPosition + 1).map(() => '_').join(' ');
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                        
                        GameSpeech.speak(letter);
                        
                        currentPosition++;
                        
                        if (currentPosition >= letters.length) {
                            // Word complete!
                            this.showFeedback(true);
                            GameSpeech.speak(`Great job! ${targetWord}!`);
                            GameScenes.currentItemIndex++;
                            setTimeout(showNextWord, 2000);
                        }
                    } else {
                        // Wrong letter
                        this.showFeedback(false);
                        btn.classList.add('wrong');
                        setTimeout(() => btn.classList.remove('wrong'), 500);
                    }
                });
            });
        };
        
        // Show word image in scene
        const shelf = document.getElementById('store-shelf');
        if (shelf) {
            const word = words[GameScenes.currentItemIndex];
            const wordData = GameScenes.getWordData(word);
            shelf.innerHTML = `<div style="font-size: 5rem;">${wordData.emoji}</div>`;
        }
        
        showNextWord();
    },
    
    /**
     * Move to next activity
     */
    nextActivity() {
        const nextActivity = GameScenes.nextActivity(this.currentUser);
        
        if (nextActivity) {
            // Re-render scene if needed
            GameScenes.renderScene(this.elements.sceneArea, this.currentTheme);
            this.startActivity();
        } else {
            // Theme completed!
            this.completeTheme();
        }
    },
    
    /**
     * Complete the theme
     */
    completeTheme() {
        const stars = GameScenes.calculateStars();
        
        // Save progress
        GameStorage.completeTheme(this.currentUser, this.currentTheme.id, stars);
        
        // Update UI
        this.elements.earnedStars.textContent = '⭐'.repeat(stars);
        this.elements.celebrationMessage.textContent = this.getCelebrationMessage(stars);
        
        // Show celebration
        this.showCelebration();
        
        // Speak celebration
        GameSpeech.speak(`Amazing! You earned ${stars} stars!`);
        
        // Update total stars
        this.elements.totalStarsCount.textContent = GameStorage.getTotalStars(this.currentUser);
    },
    
    /**
     * Get celebration message based on stars
     */
    getCelebrationMessage(stars) {
        if (stars === 3) return "Perfect! You're a superstar! 🌟";
        if (stars === 2) return "Great job! Keep practicing! 💪";
        return "Good try! You can do even better! 🎯";
    },
    
    /**
     * Set instruction text
     */
    setInstruction(text, highlightWord = null) {
        if (highlightWord) {
            text = text.replace(
                highlightWord.toUpperCase(),
                `<span class="word-highlight">${highlightWord.toUpperCase()}</span>`
            );
        }
        this.elements.instructionText.innerHTML = text;
    },
    
    /**
     * Speak current instruction
     */
    speakCurrentInstruction() {
        const text = this.elements.instructionText.textContent;
        
        // Add speaking animation
        this.elements.speakInstructionBtn.classList.add('speaking');
        
        GameSpeech.speakInstruction(text, {
            onEnd: () => {
                this.elements.speakInstructionBtn.classList.remove('speaking');
            }
        });
    },
    
    /**
     * Show word label near an element
     */
    showWordLabel(word, element) {
        // Create label
        const label = document.createElement('div');
        label.className = 'word-label';
        label.textContent = word.toUpperCase();
        label.style.cssText = `
            position: absolute;
            background: var(--secondary-color);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-family: var(--font-title);
            font-size: 1rem;
            z-index: 50;
            animation: feedbackPop 0.3s ease;
            pointer-events: none;
        `;
        
        // Position near element
        const rect = element.getBoundingClientRect();
        const sceneRect = this.elements.sceneArea.getBoundingClientRect();
        label.style.left = `${rect.left - sceneRect.left + rect.width / 2}px`;
        label.style.top = `${rect.top - sceneRect.top - 30}px`;
        label.style.transform = 'translateX(-50%)';
        
        this.elements.sceneArea.appendChild(label);
        
        // Remove after delay
        setTimeout(() => label.remove(), 2000);
    },
    
    /**
     * Update progress bar
     */
    updateProgress() {
        const activities = GameScenes.getActivities(this.currentUser);
        const current = GameScenes.currentActivityIndex + 1;
        const total = activities.length;
        const percentage = (current / total) * 100;
        
        this.elements.progressBar.style.setProperty('--progress', `${percentage}%`);
        this.elements.progressText.textContent = `${current}/${total}`;
    },
    
    /**
     * Show feedback overlay
     */
    showFeedback(correct) {
        const overlay = this.elements.feedbackOverlay;
        const content = this.elements.feedbackContent;
        
        if (correct) {
            content.innerHTML = `
                <div class="feedback-emoji">✅</div>
                <div class="feedback-text">Correct!</div>
            `;
            content.classList.remove('wrong');
        } else {
            content.innerHTML = `
                <div class="feedback-emoji">❌</div>
                <div class="feedback-text">Try again!</div>
            `;
            content.classList.add('wrong');
        }
        
        overlay.classList.remove('hidden');
        
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 800);
    },
    
    /**
     * Show celebration overlay
     */
    showCelebration() {
        this.elements.celebrationOverlay.classList.remove('hidden');
    },
    
    /**
     * Hide celebration overlay
     */
    hideCelebration() {
        this.elements.celebrationOverlay.classList.add('hidden');
    },
    
    /**
     * Show settings modal
     */
    showSettings() {
        this.elements.settingsModal.classList.remove('hidden');
    },
    
    /**
     * Hide settings modal
     */
    hideSettings() {
        this.elements.settingsModal.classList.add('hidden');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

// Export for debugging
window.Game = Game;
