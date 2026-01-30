/**
 * Main Application - English Adventure Game
 */

const Game = {
    currentUser: null,
    currentTheme: null,
    isInitialized: false,
    
    // DOM Elements
    elements: {},
    
    // Profile setup state
    profileSetup: {
        editingUser: null,
        selectedAvatar: '🧒',
        selectedAge: 5
    },
    
    // Streak tracking for rewards
    streak: {
        count: 0,
        lastCorrect: false
    },
    
    /**
     * Initialize the game
     */
    async init() {
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize modules
        await GameScenes.init();
        GameSpeech.init();
        GameSounds.init();
        GameI18n.init();
        
        // Load settings
        this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize profile setup
        this.initProfileSetup();
        
        // Initialize hint button
        this.initHintButton();
        
        // Check for returning user
        const savedUser = GameStorage.getCurrentUser();
        if (savedUser) {
            this.currentUser = savedUser;
        }
        
        // Load saved user profiles to welcome screen
        this.loadUserProfiles();
        
        // Apply initial translations
        GameI18n.updateUI();
        
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
            musicToggle: document.getElementById('music-toggle'),
            speechSpeed: document.getElementById('speech-speed'),
            voiceAccent: document.getElementById('voice-accent'),
            voiceGender: document.getElementById('voice-gender'),
            languageSelect: document.getElementById('language-select'),
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
            card.addEventListener('click', (e) => {
                // Don't select user if edit button was clicked
                if (e.target.classList.contains('edit-profile-btn')) return;
                GameSounds.click();
                this.selectUser(card.dataset.user);
            });
        });
        
        // Edit profile buttons
        document.querySelectorAll('.edit-profile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card selection
                GameSounds.click();
                this.showProfileSetup(btn.dataset.user);
            });
        });
        
        // Back buttons
        this.elements.backBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                GameSounds.navigate();
                const target = btn.dataset.target;
                if (target === 'welcome-screen') {
                    GameSpeech.cancel();
                    GameScenes.reset();
                    GameSounds.stopMusic();
                }
                this.showScreen(target);
            });
        });
        
        // Speak instruction button
        this.elements.speakInstructionBtn.addEventListener('click', () => {
            GameSounds.click();
            this.speakCurrentInstruction();
        });
        
        // Settings
        this.elements.settingsBtn.addEventListener('click', () => {
            GameSounds.click();
            this.showSettings();
        });
        this.elements.settingsCloseBtn.addEventListener('click', () => {
            GameSounds.click();
            this.hideSettings();
        });
        this.elements.soundEffectsToggle.addEventListener('change', (e) => {
            GameSounds.setEnabled(e.target.checked);
            GameStorage.saveSettings({ soundEffects: e.target.checked });
            if (e.target.checked) GameSounds.click();
        });
        this.elements.musicToggle.addEventListener('change', (e) => {
            GameSounds.setMusicEnabled(e.target.checked);
            GameStorage.saveSettings({ musicEnabled: e.target.checked });
            if (e.target.checked && this.currentTheme) {
                GameSounds.startMusic();
            }
        });
        this.elements.speechSpeed.addEventListener('change', (e) => {
            GameSpeech.setRate(parseFloat(e.target.value));
        });
        this.elements.voiceAccent.addEventListener('change', (e) => {
            GameSpeech.setAccent(e.target.value);
            GameSounds.click();
            // Test the new voice
            GameSpeech.speak('Hello!');
        });
        this.elements.voiceGender.addEventListener('change', (e) => {
            GameSpeech.setGender(e.target.value);
            GameSounds.click();
            // Test the new voice
            GameSpeech.speak('Hello!');
        });
        this.elements.languageSelect.addEventListener('change', (e) => {
            GameI18n.setLanguage(e.target.value);
            GameSounds.click();
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
            GameSounds.click();
            this.hideCelebration();
            this.startTheme(this.currentTheme.id);
        });
        this.elements.chooseThemeBtn.addEventListener('click', () => {
            GameSounds.click();
            this.hideCelebration();
            // Re-render themes to show newly unlocked themes
            this.renderThemes();
            this.showScreen('theme-screen');
        });
    },
    
    /**
     * Load settings from storage
     */
    loadSettings() {
        const settings = GameStorage.getSettings();
        // Sound effects default to ON, but music defaults to OFF
        const soundEnabled = settings.soundEffects !== false;
        const musicEnabled = settings.musicEnabled === true; // Must be explicitly true, defaults to false
        
        this.elements.soundEffectsToggle.checked = soundEnabled;
        this.elements.musicToggle.checked = musicEnabled;
        this.elements.speechSpeed.value = settings.speechSpeed || 1;
        this.elements.voiceAccent.value = settings.voiceAccent || 'us';
        this.elements.voiceGender.value = settings.voiceGender || 'female';
        this.elements.languageSelect.value = settings.language || 'en';
        
        GameSpeech.setRate(settings.speechSpeed || 1);
        GameSounds.setEnabled(soundEnabled);
        GameSounds.setMusicEnabled(musicEnabled);
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
     * Load saved user profiles to welcome screen
     */
    loadUserProfiles() {
        ['explorer', 'adventurer'].forEach(userId => {
            const user = GameStorage.getUser(userId);
            const card = document.querySelector(`.user-card[data-user="${userId}"]`);
            if (card && user) {
                card.querySelector('.user-avatar').textContent = user.avatar || (userId === 'explorer' ? '🧒' : '👦');
                card.querySelector('.user-name').textContent = user.name || (userId === 'explorer' ? 'Explorer' : 'Adventurer');
                
                // Update stars display
                const starsDiv = card.querySelector('.user-stars');
                const totalStars = user.totalStars || 0;
                if (totalStars > 0) {
                    starsDiv.textContent = '⭐'.repeat(Math.min(totalStars, 5));
                }
            }
        });
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
        
        // Play start sound and music
        GameSounds.whoosh();
        GameSounds.startMusic();
        
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
            case 'drag-and-drop':
                this.runDragAndDropActivity(activity);
                break;
            case 'match-pairs':
                this.runMatchPairsActivity(activity);
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
     * Collect-items activity - drag items to cart (drag-and-drop)
     */
    runCollectItemsActivity(activity) {
        const items = activity.items;
        GameScenes.currentItemIndex = 0;
        let collectedCount = 0;
        
        // Set initial instruction
        const updateInstruction = () => {
            if (GameScenes.currentItemIndex >= items.length) return;
            const targetWord = items[GameScenes.currentItemIndex];
            const instruction = activity.instruction.replace('{word}', targetWord.toUpperCase());
            this.setInstruction(instruction, targetWord);
            GameSpeech.speakInstruction(`Drag the ${targetWord} to the cart!`);
        };
        
        // Create drag and drop UI with cart
        this.elements.interactionArea.innerHTML = `
            <div class="collect-activity">
                <div class="drag-items-row" id="drag-items">
                    <!-- Draggable items will be added here -->
                </div>
                <div class="cart-drop-zone" id="cart-drop">
                    <div class="cart-icon">🛒</div>
                    <div class="cart-label">Drop here!</div>
                    <div class="cart-items" id="cart-items"></div>
                </div>
            </div>
        `;
        
        const dragContainer = document.getElementById('drag-items');
        const cartDrop = document.getElementById('cart-drop');
        const cartItems = document.getElementById('cart-items');
        
        // Shuffle items for display
        const shuffledItems = [...items].sort(() => Math.random() - 0.5);
        
        // Create draggable items
        shuffledItems.forEach((item) => {
            const wordData = GameScenes.getWordData(item);
            const dragItem = document.createElement('div');
            dragItem.className = 'drag-item';
            dragItem.draggable = true;
            dragItem.dataset.item = item;
            dragItem.innerHTML = `
                <span class="drag-emoji">${wordData.emoji}</span>
                <span class="drag-label">${item}</span>
            `;
            
            // Mouse drag events
            dragItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item);
                dragItem.classList.add('dragging');
                GameSounds.click();
            });
            
            dragItem.addEventListener('dragend', () => {
                dragItem.classList.remove('dragging');
            });
            
            // Touch support
            let touchStartX, touchStartY, touchOffsetX, touchOffsetY;
            dragItem.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                const rect = dragItem.getBoundingClientRect();
                touchOffsetX = touch.clientX - rect.left;
                touchOffsetY = touch.clientY - rect.top;
                dragItem.classList.add('dragging');
                GameSounds.click();
            });
            
            dragItem.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                dragItem.style.position = 'fixed';
                dragItem.style.left = (touch.clientX - touchOffsetX) + 'px';
                dragItem.style.top = (touch.clientY - touchOffsetY) + 'px';
                dragItem.style.zIndex = '1000';
            });
            
            dragItem.addEventListener('touchend', (e) => {
                const touch = e.changedTouches[0];
                const dropElement = document.elementFromPoint(touch.clientX, touch.clientY);
                
                // Check if dropped on cart
                if (dropElement && (dropElement.id === 'cart-drop' || dropElement.closest('#cart-drop'))) {
                    handleDrop(item, dragItem);
                }
                
                dragItem.style.position = '';
                dragItem.style.left = '';
                dragItem.style.top = '';
                dragItem.style.zIndex = '';
                dragItem.classList.remove('dragging');
            });
            
            dragContainer.appendChild(dragItem);
        });
        
        // Cart drop zone events
        cartDrop.addEventListener('dragover', (e) => {
            e.preventDefault();
            cartDrop.classList.add('drag-over');
        });
        
        cartDrop.addEventListener('dragleave', () => {
            cartDrop.classList.remove('drag-over');
        });
        
        cartDrop.addEventListener('drop', (e) => {
            e.preventDefault();
            cartDrop.classList.remove('drag-over');
            const item = e.dataTransfer.getData('text/plain');
            const dragItem = document.querySelector(`.drag-item[data-item="${item}"]`);
            handleDrop(item, dragItem);
        });
        
        const handleDrop = (item, dragItem) => {
            const targetWord = items[GameScenes.currentItemIndex];
            GameScenes.totalQuestions++;
            
            if (item === targetWord) {
                // Correct!
                GameScenes.correctAnswers++;
                collectedCount++;
                
                GameSounds.correct();
                this.showFeedback(true);
                GameSpeech.speak(`${item}!`);
                
                // Move item to cart visually
                dragItem.classList.add('matched');
                const wordData = GameScenes.getWordData(item);
                cartItems.innerHTML += `<span class="cart-item">${wordData.emoji}</span>`;
                
                GameScenes.currentItemIndex++;
                
                // Check if all collected
                if (collectedCount >= items.length) {
                    GameSpeech.speak('Great job! You collected everything!');
                    setTimeout(() => this.nextActivity(), 1500);
                } else {
                    setTimeout(updateInstruction, 1000);
                }
            } else {
                // Wrong item
                GameSounds.wrong();
                this.showFeedback(false);
                GameSpeech.speak(`That's the ${item}. Drag the ${targetWord}!`);
                
                cartDrop.classList.add('wrong');
                setTimeout(() => cartDrop.classList.remove('wrong'), 500);
            }
        };
        
        // Hide shelf
        const shelf = document.getElementById('store-shelf');
        if (shelf) shelf.style.display = 'none';
        
        // Start with first instruction
        updateInstruction();
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
     * Drag-and-drop activity - drag items to matching targets
     */
    runDragAndDropActivity(activity) {
        const pairs = activity.pairs || [];
        let matchedCount = 0;
        
        this.setInstruction(activity.instruction || 'Drag each item to its place!');
        GameSpeech.speakInstruction(activity.instruction || 'Drag each item to its place!');
        
        // Create drag and drop area
        this.elements.interactionArea.innerHTML = `
            <div class="drag-drop-container">
                <div class="drag-items" id="drag-items">
                    <!-- Draggable items will be added here -->
                </div>
                <div class="drop-targets" id="drop-targets">
                    <!-- Drop targets will be added here -->
                </div>
            </div>
        `;
        
        const dragContainer = document.getElementById('drag-items');
        const dropContainer = document.getElementById('drop-targets');
        
        // Shuffle pairs for draggable items
        const shuffledItems = [...pairs].sort(() => Math.random() - 0.5);
        
        // Create draggable items
        shuffledItems.forEach((pair, index) => {
            const wordData = GameScenes.getWordData(pair.item);
            const dragItem = document.createElement('div');
            dragItem.className = 'drag-item';
            dragItem.draggable = true;
            dragItem.dataset.item = pair.item;
            dragItem.innerHTML = `
                <span class="drag-emoji">${wordData.emoji}</span>
                <span class="drag-label">${pair.item}</span>
            `;
            
            // Touch/mouse events for dragging
            dragItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', pair.item);
                dragItem.classList.add('dragging');
                GameSounds.click();
            });
            
            dragItem.addEventListener('dragend', () => {
                dragItem.classList.remove('dragging');
            });
            
            // Touch support - use getBoundingClientRect for accurate positioning
            let touchOffsetX, touchOffsetY;
            dragItem.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent scrolling while dragging
                const touch = e.touches[0];
                const rect = dragItem.getBoundingClientRect();
                touchOffsetX = touch.clientX - rect.left;
                touchOffsetY = touch.clientY - rect.top;
                dragItem.classList.add('dragging');
                GameSounds.click();
            }, { passive: false });
            
            dragItem.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                dragItem.style.position = 'fixed';
                dragItem.style.left = (touch.clientX - touchOffsetX) + 'px';
                dragItem.style.top = (touch.clientY - touchOffsetY) + 'px';
                dragItem.style.zIndex = '1000';
            }, { passive: false });
            
            dragItem.addEventListener('touchend', (e) => {
                const touch = e.changedTouches[0];
                // Temporarily hide the dragged element to find what's underneath
                dragItem.style.visibility = 'hidden';
                const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
                dragItem.style.visibility = '';
                
                if (dropTarget && dropTarget.classList.contains('drop-target')) {
                    handleDrop(dropTarget, pair.item, dragItem);
                }
                dragItem.style.position = '';
                dragItem.style.left = '';
                dragItem.style.top = '';
                dragItem.style.zIndex = '';
                dragItem.classList.remove('dragging');
            });
            
            dragContainer.appendChild(dragItem);
        });
        
        // Create drop targets
        pairs.forEach((pair) => {
            const dropTarget = document.createElement('div');
            dropTarget.className = 'drop-target';
            dropTarget.dataset.target = pair.target;
            dropTarget.innerHTML = `
                <span class="target-label">${pair.targetLabel || pair.target}</span>
                <span class="target-hint">${pair.targetEmoji || '📦'}</span>
            `;
            
            dropTarget.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropTarget.classList.add('drag-over');
            });
            
            dropTarget.addEventListener('dragleave', () => {
                dropTarget.classList.remove('drag-over');
            });
            
            dropTarget.addEventListener('drop', (e) => {
                e.preventDefault();
                dropTarget.classList.remove('drag-over');
                const item = e.dataTransfer.getData('text/plain');
                const dragItem = document.querySelector(`.drag-item[data-item="${item}"]`);
                handleDrop(dropTarget, item, dragItem);
            });
            
            dropContainer.appendChild(dropTarget);
        });
        
        const handleDrop = (dropTarget, item, dragItem) => {
            const expectedPair = pairs.find(p => p.item === item);
            GameScenes.totalQuestions++;
            
            if (expectedPair && expectedPair.target === dropTarget.dataset.target) {
                // Correct match!
                GameScenes.correctAnswers++;
                matchedCount++;
                
                GameSounds.correct();
                this.showFeedback(true);
                GameSpeech.speak(`${item}!`);
                
                // Mark as matched
                dragItem.classList.add('matched');
                dropTarget.classList.add('matched');
                dropTarget.innerHTML = `
                    <span class="matched-emoji">${GameScenes.getWordData(item).emoji}</span>
                    <span class="matched-label">${item}</span>
                `;
                
                // Check if all matched
                if (matchedCount >= pairs.length) {
                    setTimeout(() => this.nextActivity(), 1500);
                }
            } else {
                // Wrong match
                GameSounds.wrong();
                this.showFeedback(false);
                GameSpeech.speak('Try again!');
                
                dropTarget.classList.add('wrong');
                setTimeout(() => dropTarget.classList.remove('wrong'), 500);
            }
        };
        
        // Hide shelf
        const shelf = document.getElementById('store-shelf');
        if (shelf) shelf.style.display = 'none';
    },
    
    /**
     * Match-pairs activity - match words with pictures
     */
    runMatchPairsActivity(activity) {
        const items = activity.items || [];
        let selectedFirst = null;
        let matchedCount = 0;
        
        this.setInstruction(activity.instruction || 'Match the pairs!');
        GameSpeech.speakInstruction(activity.instruction || 'Match the pairs!');
        
        // Create cards (words and pictures mixed)
        const cards = [];
        items.forEach(item => {
            const wordData = GameScenes.getWordData(item);
            cards.push({ type: 'word', value: item, display: item.toUpperCase() });
            cards.push({ type: 'picture', value: item, display: wordData.emoji });
        });
        
        // Shuffle cards
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        
        // Create game grid
        this.elements.interactionArea.innerHTML = `
            <div class="match-pairs-grid" id="match-pairs-grid">
                <!-- Cards will be added here -->
            </div>
        `;
        
        const grid = document.getElementById('match-pairs-grid');
        
        cards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'match-card';
            cardEl.dataset.type = card.type;
            cardEl.dataset.value = card.value;
            cardEl.innerHTML = `<span>${card.display}</span>`;
            
            cardEl.addEventListener('click', () => {
                if (cardEl.classList.contains('matched') || cardEl.classList.contains('selected')) return;
                
                GameSounds.click();
                cardEl.classList.add('selected');
                
                if (card.type === 'word') {
                    GameSpeech.speakWord(card.value);
                }
                
                if (!selectedFirst) {
                    selectedFirst = { element: cardEl, card };
                } else {
                    GameScenes.totalQuestions++;
                    
                    // Check for match (word + picture of same item)
                    if (selectedFirst.card.value === card.value && selectedFirst.card.type !== card.type) {
                        // Match!
                        GameScenes.correctAnswers++;
                        matchedCount++;
                        
                        GameSounds.correct();
                        this.showFeedback(true);
                        
                        selectedFirst.element.classList.add('matched');
                        cardEl.classList.add('matched');
                        
                        if (matchedCount >= items.length) {
                            setTimeout(() => this.nextActivity(), 1500);
                        }
                    } else {
                        // No match
                        GameSounds.wrong();
                        this.showFeedback(false);
                        
                        const first = selectedFirst.element;
                        setTimeout(() => {
                            first.classList.remove('selected');
                            cardEl.classList.remove('selected');
                        }, 800);
                    }
                    
                    selectedFirst = null;
                }
            });
            
            grid.appendChild(cardEl);
        });
        
        // Hide shelf
        const shelf = document.getElementById('store-shelf');
        if (shelf) shelf.style.display = 'none';
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
        if (stars === 3) return GameI18n.t('celebration.perfect');
        if (stars === 2) return GameI18n.t('celebration.great');
        return GameI18n.t('celebration.good');
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
        
        // Play sound effect
        if (correct) {
            GameSounds.correct();
            content.innerHTML = `
                <div class="feedback-emoji">✅</div>
                <div class="feedback-text">${GameI18n.t('feedback.correct')}</div>
            `;
            content.classList.remove('wrong');
        } else {
            GameSounds.wrong();
            content.innerHTML = `
                <div class="feedback-emoji">❌</div>
                <div class="feedback-text">${GameI18n.t('feedback.tryAgain')}</div>
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
        GameSounds.celebrate();
        GameSounds.stopMusic();
        this.elements.celebrationOverlay.classList.remove('hidden');
        
        // Play star sounds with delay
        setTimeout(() => GameSounds.star(), 500);
        setTimeout(() => GameSounds.star(), 800);
        setTimeout(() => GameSounds.star(), 1100);
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
    },
    
    // ===========================================
    // PROFILE SETUP SYSTEM
    // ===========================================
    
    /**
     * Show profile setup modal
     */
    showProfileSetup(userId) {
        this.profileSetup.editingUser = userId;
        const user = GameStorage.getUser(userId);
        
        // Pre-fill existing data
        document.getElementById('profile-name-input').value = user.name || '';
        this.profileSetup.selectedAvatar = user.avatar || '🧒';
        this.profileSetup.selectedAge = parseInt(user.ageRange?.match(/\d+/)?.[0]) || 5;
        
        // Update UI selections
        document.querySelectorAll('.avatar-option').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.avatar === this.profileSetup.selectedAvatar);
        });
        document.querySelectorAll('.age-option').forEach(btn => {
            btn.classList.toggle('selected', parseInt(btn.dataset.age) === this.profileSetup.selectedAge);
        });
        
        document.getElementById('profile-modal').classList.remove('hidden');
    },
    
    /**
     * Hide profile setup modal
     */
    hideProfileSetup() {
        document.getElementById('profile-modal').classList.add('hidden');
        this.profileSetup.editingUser = null;
    },
    
    /**
     * Save profile and start playing
     */
    saveProfile() {
        const userId = this.profileSetup.editingUser;
        if (!userId) return;
        
        const name = document.getElementById('profile-name-input').value.trim() || 
            (userId === 'explorer' ? 'Explorer' : 'Adventurer');
        const avatar = this.profileSetup.selectedAvatar;
        const age = this.profileSetup.selectedAge;
        
        // Determine user type based on age
        const userType = age <= 5 ? 'explorer' : 'adventurer';
        const ageRange = age <= 5 ? 'Ages 4-5' : 'Ages 6-9';
        
        // Save user data
        GameStorage.saveUser(userId, {
            name,
            avatar,
            age,
            ageRange
        });
        
        // Update welcome screen card
        const card = document.querySelector(`.user-card[data-user="${userId}"]`);
        if (card) {
            card.querySelector('.user-avatar').textContent = avatar;
            card.querySelector('.user-name').textContent = name;
        }
        
        this.hideProfileSetup();
        
        // Select this user and start playing
        this.selectUser(userId);
    },
    
    /**
     * Initialize profile setup event listeners
     */
    initProfileSetup() {
        // Avatar picker
        document.querySelectorAll('.avatar-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.profileSetup.selectedAvatar = btn.dataset.avatar;
                GameSounds.click();
            });
        });
        
        // Age picker
        document.querySelectorAll('.age-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.age-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.profileSetup.selectedAge = parseInt(btn.dataset.age);
                GameSounds.click();
            });
        });
        
        // Save button
        document.getElementById('save-profile-btn')?.addEventListener('click', () => {
            GameSounds.click();
            this.saveProfile();
        });
        
        // Cancel button
        document.getElementById('cancel-profile-btn')?.addEventListener('click', () => {
            GameSounds.click();
            this.hideProfileSetup();
        });
    },
    
    // ===========================================
    // CONFETTI & REWARD ANIMATIONS
    // ===========================================
    
    /**
     * Create confetti explosion
     */
    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3'];
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            
            // Random shapes
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            } else {
                confetti.style.width = '8px';
                confetti.style.height = '15px';
            }
            
            container.appendChild(confetti);
        }
        
        // Remove after animation
        setTimeout(() => container.remove(), 4000);
    },
    
    /**
     * Create flying star animation
     */
    createFlyingStar(x, y) {
        const star = document.createElement('div');
        star.className = 'flying-star';
        star.textContent = '⭐';
        star.style.left = x + 'px';
        star.style.top = y + 'px';
        document.body.appendChild(star);
        
        setTimeout(() => star.remove(), 1000);
    },
    
    /**
     * Show streak indicator
     */
    showStreak(count) {
        // Remove existing streak
        document.querySelector('.streak-indicator')?.remove();
        
        if (count < 3) return;
        
        const streak = document.createElement('div');
        streak.className = 'streak-indicator';
        streak.innerHTML = `🔥 ${count} in a row!`;
        document.body.appendChild(streak);
        
        setTimeout(() => streak.remove(), 2000);
    },
    
    /**
     * Track correct/wrong answers for streaks
     */
    trackAnswer(correct) {
        if (correct) {
            this.streak.count++;
            this.streak.lastCorrect = true;
            
            // Show streak indicator
            if (this.streak.count >= 3) {
                this.showStreak(this.streak.count);
            }
            
            // Make character dance on streaks
            if (this.streak.count >= 3) {
                const character = document.querySelector('.character');
                if (character) {
                    character.classList.add('dancing');
                    setTimeout(() => character.classList.remove('dancing'), 2000);
                }
            }
        } else {
            this.streak.count = 0;
            this.streak.lastCorrect = false;
        }
    },
    
    // ===========================================
    // HINT SYSTEM
    // ===========================================
    
    /**
     * Current hint state
     */
    hintState: {
        active: false,
        target: null,
        elements: []
    },
    
    /**
     * Show hint for current activity
     */
    showHint() {
        // Remove any existing hints
        this.clearHints();
        
        const activity = GameScenes.getCurrentActivity();
        if (!activity) return;
        
        GameSounds.click();
        
        // Repeat instruction based on activity type
        switch (activity.type) {
            case 'find-item':
                this.showFindItemHint(activity);
                break;
            case 'match-sound':
                this.showMatchSoundHint(activity);
                break;
            case 'collect-items':
                this.showCollectHint(activity);
                break;
            case 'spelling':
                this.showSpellingHint(activity);
                break;
            case 'tap-to-learn':
                this.showTapHint(activity);
                break;
            default:
                this.showGenericHint();
        }
    },
    
    /**
     * Show hint for find-item activities
     */
    showFindItemHint(activity) {
        const targetWords = activity.targetWords || activity.words;
        const targetWord = targetWords[GameScenes.currentItemIndex];
        
        // Repeat instruction
        GameSpeech.speakInstruction(`Find the ${targetWord}!`);
        
        // Find the target item element
        const targetElement = document.querySelector(`.shelf-item[data-word="${targetWord}"]`);
        if (targetElement) {
            // Just pulse/highlight the target - subtle hint
            targetElement.classList.add('hint-pulse');
            this.hintState.elements.push(targetElement);
            
            // Clear after 3 seconds
            setTimeout(() => this.clearHints(), 3000);
        }
    },
    
    /**
     * Show hint for match-sound activities
     */
    showMatchSoundHint(activity) {
        const words = activity.words;
        const targetWord = words[GameScenes.currentItemIndex];
        
        // Repeat the word - this is the main hint for this activity
        GameSpeech.speakWord(targetWord);
        
        // Find the target item element
        const targetElement = document.querySelector(`.shelf-item[data-word="${targetWord}"]`);
        if (targetElement) {
            // Pulse the target after a delay
            setTimeout(() => {
                targetElement.classList.add('hint-pulse');
                this.hintState.elements.push(targetElement);
                
                // Clear after 3 seconds
                setTimeout(() => this.clearHints(), 3000);
            }, 1000);
        }
    },
    
    /**
     * Show hint for collect activities
     */
    showCollectHint(activity) {
        const items = activity.items;
        const targetWord = items[GameScenes.currentItemIndex];
        
        // Repeat instruction
        GameSpeech.speakInstruction(`Drag the ${targetWord} to the cart!`);
        
        // Find the target drag item
        const targetElement = document.querySelector(`.drag-item[data-item="${targetWord}"]`);
        const cart = document.getElementById('cart-drop');
        
        if (targetElement && cart) {
            // Pulse/highlight the target item - subtle hint
            targetElement.classList.add('hint-pulse');
            this.hintState.elements.push(targetElement);
            
            // Add downward arrow pointing to cart
            const arrow = document.createElement('div');
            arrow.className = 'hint-arrow-down';
            arrow.innerHTML = '⬇️';
            arrow.style.cssText = `
                position: fixed;
                font-size: 2rem;
                animation: arrowBounceDown 0.8s ease-in-out infinite;
                z-index: 100;
                pointer-events: none;
            `;
            
            const cartRect = cart.getBoundingClientRect();
            arrow.style.left = cartRect.left + cartRect.width / 2 - 20 + 'px';
            arrow.style.top = cartRect.top - 50 + 'px';
            document.body.appendChild(arrow);
            this.hintState.elements.push(arrow);
            
            // Also pulse the cart
            cart.classList.add('hint-pulse');
            this.hintState.elements.push(cart);
            
            // Clear after 3 seconds
            setTimeout(() => this.clearHints(), 3000);
        }
    },
    
    /**
     * Show hint for spelling activities
     */
    showSpellingHint(activity) {
        const words = activity.words;
        const targetWord = words[GameScenes.currentItemIndex];
        const answerEl = document.getElementById('spelling-answer');
        
        if (answerEl) {
            const currentAnswer = answerEl.textContent.replace(/\s/g, '').replace(/_/g, '');
            const nextLetter = targetWord[currentAnswer.length]?.toUpperCase();
            
            if (nextLetter) {
                const letterBtn = document.querySelector(`#letter-buttons button[data-letter="${nextLetter}"]:not([disabled])`);
                if (letterBtn) {
                    letterBtn.classList.add('hint-pulse');
                    this.hintState.elements.push(letterBtn);
                    
                    setTimeout(() => this.clearHints(), 2000);
                }
            }
        }
    },
    
    /**
     * Show tap hint
     */
    showTapHint() {
        // Speak instruction
        GameSpeech.speakInstruction("Tap each item to learn its name!");
        
        const items = document.querySelectorAll('.shelf-item:not(.collected)');
        if (items.length > 0) {
            // Just highlight the first uncollected item - subtle hint
            const item = items[0];
            item.classList.add('hint-pulse');
            this.hintState.elements.push(item);
            
            setTimeout(() => this.clearHints(), 3000);
        }
    },
    
    /**
     * Show generic hint
     */
    showGenericHint() {
        GameSpeech.speak("Look at the highlighted items and try to find the right answer!");
    },
    
    /**
     * Clear all hint elements
     */
    clearHints() {
        this.hintState.elements.forEach(el => {
            if (el && el.classList) {
                el.classList.remove('hint-pulse');
            }
            // Remove dynamically added hint elements
            if (el && (el.className === 'hint-hand' || el.className === 'hint-arrow' || el.className?.includes('hint-arrow-down'))) {
                el.remove();
            }
        });
        this.hintState.elements = [];
        this.hintState.active = false;
    },
    
    /**
     * Initialize hint button
     */
    initHintButton() {
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.showHint());
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

// Export for debugging
window.Game = Game;
