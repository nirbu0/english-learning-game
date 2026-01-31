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
        editingUserId: null, // null means creating new user
        userType: 'explorer', // 'explorer' or 'adventurer'
        selectedAvatar: '🧒',
        selectedAge: 5
    },

    // Streak tracking for rewards
    streak: {
        count: 0,
        lastCorrect: false
    },

    // Stickers
    availableStickers: [
        "🦄", "🌈", "🎈", "🎨", "🧸", "🎉", "🦋", "🍄", "🚲", "🚀",
        "🍕", "🍩", "🎸", "⌚", "🕶️", "🧢", "🦕", "🦁", "🐧", "🐘",
        "🦉", "🐸", "🐢", "🐳", "🐬", "🐙", "🌺", "🌻", "🌲", "⛰️"
    ],

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

            // Stickers
            stickersBtn: document.getElementById('stickers-btn'),
            stickerGrid: document.getElementById('sticker-grid'),
            stickerCount: document.getElementById('sticker-count'),
            emptyStickersMsg: document.getElementById('empty-stickers-msg'),

            // Back buttons
            backBtns: document.querySelectorAll('.back-btn')
        };
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add user buttons
        document.querySelectorAll('.add-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                GameSounds.click();
                this.showProfileSetup(null, btn.dataset.userType);
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

        // Stickers button
        this.elements.stickersBtn?.addEventListener('click', () => {
            GameSounds.click();
            this.showStickers();
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
        // Render explorers
        const explorerContainer = document.getElementById('explorer-users');
        const adventurerContainer = document.getElementById('adventurer-users');
        
        if (explorerContainer) {
            explorerContainer.innerHTML = '';
            const explorers = GameStorage.getUsersByType('explorer');
            explorers.forEach(user => {
                explorerContainer.appendChild(this.createUserCard(user));
            });
        }
        
        if (adventurerContainer) {
            adventurerContainer.innerHTML = '';
            const adventurers = GameStorage.getUsersByType('adventurer');
            adventurers.forEach(user => {
                adventurerContainer.appendChild(this.createUserCard(user));
            });
        }
    },

    /**
     * Create a user card element
     */
    createUserCard(user) {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.dataset.userId = user.id;
        card.dataset.userType = user.userType;
        
        const totalStars = user.totalStars || 0;
        const starsDisplay = totalStars > 0 ? '⭐'.repeat(Math.min(totalStars, 5)) : '⭐';
        
        card.innerHTML = `
            <button class="delete-user-btn" title="Delete">🗑️</button>
            <button class="edit-profile-btn" title="Edit Profile">✏️</button>
            <div class="user-avatar">${user.avatar}</div>
            <div class="user-name">${user.name}</div>
            <div class="user-stars">${starsDisplay}</div>
        `;
        
        // Click on card to play
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-profile-btn') || 
                e.target.classList.contains('delete-user-btn')) return;
            GameSounds.click();
            this.selectUser(user.id);
        });
        
        // Edit button
        card.querySelector('.edit-profile-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            GameSounds.click();
            this.showProfileSetup(user.id, user.userType);
        });
        
        // Delete button
        card.querySelector('.delete-user-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            GameSounds.click();
            this.confirmDeleteUser(user);
        });
        
        return card;
    },

    /**
     * Confirm and delete a user
     */
    confirmDeleteUser(user) {
        if (confirm(`Are you sure you want to delete ${user.name}? All progress will be lost.`)) {
            GameStorage.deleteUser(user.id);
            this.loadUserProfiles();
        }
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
                card.addEventListener('click', () => this.handleThemeClick(theme));
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
     * Get the current user's type (explorer or adventurer)
     */
    getCurrentUserType() {
        const user = GameStorage.getUser(this.currentUser);
        return user?.userType || 'explorer';
    },

    /**
     * Handle theme click
     */
    handleThemeClick(theme) {
        // Check if theme has multiple levels
        const userType = this.getCurrentUserType();
        const activities = theme.activities[userType] || [];

        // Simple check: does level 2 exist?
        const level2 = GameScenes.filterActivitiesByLevel(activities, 2);

        if (level2.length === 0) {
            // Only one level, just start it
            this.startTheme(theme.id, 1);
        } else {
            // Multiple levels, show selection
            this.showLevelSelection(theme);
        }
    },

    /**
     * Show level selection modal
     */
    showLevelSelection(theme) {
        // Create modal if not exists (or reuse settings modal structure?)
        // Let's create a simple overlay for now
        let modal = document.getElementById('level-select-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'level-select-modal';
            modal.className = 'modal hidden';
            modal.innerHTML = `
                <div class="modal-content level-select-content">
                    <button class="modal-close-btn">&times;</button>
                    <h2 class="modal-title">Select Level</h2>
                    <div class="level-grid" id="level-list"></div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('.modal-close-btn').addEventListener('click', () => {
                modal.classList.add('hidden');
                GameSounds.click();
            });
        }

        const levelList = modal.querySelector('#level-list');
        levelList.innerHTML = '';

        // Determine available levels (up to 3 for now)
        const levels = [1, 2, 3];
        const userType = this.getCurrentUserType();

        levels.forEach(level => {
            const activities = GameScenes.filterActivitiesByLevel(theme.activities[userType] || [], level);
            if (activities.length === 0) return;

            const progress = GameStorage.getLevelProgress(this.currentUser, theme.id, level);
            const isUnlocked = progress.unlocked;

            const btn = document.createElement('button');
            btn.className = `level-btn ${isUnlocked ? '' : 'locked'} ${progress.completed ? 'completed' : ''}`;

            let icon = '🔒';
            if (isUnlocked) {
                if (level === 1) icon = '🥉';
                if (level === 2) icon = '🥈';
                if (level === 3) icon = '🥇';
            }
            if (progress.completed) icon = '✅';

            btn.innerHTML = `
                <div class="level-icon">${icon}</div>
                <div class="level-info">
                    <div class="level-name">Level ${level}</div>
                    <div class="level-stars">${this.renderStars(progress.stars)}</div>
                </div>
            `;

            if (isUnlocked) {
                btn.addEventListener('click', () => {
                    GameSounds.click();
                    modal.classList.add('hidden');
                    this.startTheme(theme.id, level);
                });
            }

            levelList.appendChild(btn);
        });

        modal.classList.remove('hidden');
    },

    /**
     * Start a theme/adventure
     */
    startTheme(themeId, level = 1) {
        const theme = GameScenes.getTheme(themeId);
        if (!theme) return;

        this.currentTheme = theme;

        // Play start sound and music
        GameSounds.whoosh();
        GameSounds.startMusic();

        // Start the theme in GameScenes (use userType, not userId)
        GameScenes.startTheme(themeId, this.getCurrentUserType(), level);

        // Update UI
        this.elements.gameThemeTitle.textContent = `${theme.name} - Level ${level}`;
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
            case 'letter-word-match':
                this.runLetterWordMatchActivity(activity);
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

        // Get theme-specific drop zone config
        const dropZoneConfig = GameScenes.getDropZoneConfig(this.currentTheme?.id);

        // Set initial instruction
        const updateInstruction = () => {
            if (GameScenes.currentItemIndex >= items.length) return;
            const targetWord = items[GameScenes.currentItemIndex];
            const instruction = activity.instruction.replace('{word}', targetWord.toUpperCase());
            this.setInstruction(instruction, targetWord);
            // Use theme-specific destination in speech
            GameSpeech.speakInstruction(`Drag the ${targetWord} to the ${dropZoneConfig.label.toLowerCase()}!`);
        };

        // Create drag and drop UI with theme-appropriate container
        this.elements.interactionArea.innerHTML = `
            <div class="collect-activity">
                <div class="drag-items-row" id="drag-items">
                    <!-- Draggable items will be added here -->
                </div>
                <div class="cart-drop-zone" id="cart-drop">
                    <div class="cart-icon">${dropZoneConfig.icon}</div>
                    <div class="cart-label">Drop in ${dropZoneConfig.label}!</div>
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

            // Touch support - improved for mobile devices
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
                
                // Highlight cart when dragging over it
                const cartRect = cartDrop.getBoundingClientRect();
                const itemRect = dragItem.getBoundingClientRect();
                const isOverCart = this.checkRectOverlap(itemRect, cartRect);
                cartDrop.classList.toggle('drag-over', isOverCart);
            }, { passive: false });

            dragItem.addEventListener('touchend', (e) => {
                const touch = e.changedTouches[0];
                
                // Hide the dragged element to find what's underneath
                dragItem.style.visibility = 'hidden';
                const dropElement = document.elementFromPoint(touch.clientX, touch.clientY);
                dragItem.style.visibility = '';

                // Also check using bounding box overlap for better touch accuracy
                const cartRect = cartDrop.getBoundingClientRect();
                const itemRect = dragItem.getBoundingClientRect();
                const isOverCart = this.checkRectOverlap(itemRect, cartRect) ||
                    (dropElement && (dropElement.id === 'cart-drop' || dropElement.closest('#cart-drop')));

                if (isOverCart) {
                    handleDrop(item, dragItem);
                }

                cartDrop.classList.remove('drag-over');
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
     * Letter-word-match activity - "A is for Apple"
     */
    runLetterWordMatchActivity(activity) {
        const letters = activity.letters || [];
        GameScenes.currentItemIndex = 0;

        const showNextLetter = () => {
            if (GameScenes.currentItemIndex >= letters.length) {
                setTimeout(() => this.nextActivity(), 1000);
                return;
            }

            const targetLetter = letters[GameScenes.currentItemIndex];
            const letterData = GameScenes.vocabulary.vocabulary[targetLetter];
            const correctWord = letterData?.word || 'apple';
            const correctEmoji = letterData?.wordEmoji || '🍎';

            // Show the letter prominently
            const shelf = document.getElementById('store-shelf');
            if (shelf) {
                shelf.innerHTML = `
                    <div style="text-align: center;">
                        <div class="letter-block" style="font-size: 4rem; width: 120px; height: 120px; margin: 0 auto;">${targetLetter}</div>
                        <div style="font-family: var(--font-title); font-size: 1.5rem; margin-top: 15px; color: #666;">
                            ${targetLetter} is for...?
                        </div>
                    </div>
                `;
            }

            // Set instruction
            const instruction = `What does ${targetLetter} stand for?`;
            this.setInstruction(instruction);
            GameSpeech.speak(`${targetLetter}! ${targetLetter} is for...?`);

            // Get wrong options from other letters
            const wrongOptions = letters
                .filter(l => l !== targetLetter)
                .map(l => {
                    const data = GameScenes.vocabulary.vocabulary[l];
                    return { word: data?.word || 'unknown', emoji: data?.wordEmoji || '❓' };
                })
                .slice(0, 3);

            // Create options array
            const options = [
                { word: correctWord, emoji: correctEmoji, correct: true },
                ...wrongOptions.map(o => ({ ...o, correct: false }))
            ];

            // Shuffle options
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }

            // Create option buttons
            this.elements.interactionArea.innerHTML = `
                <div class="letter-word-options" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
                    ${options.map((opt, idx) => `
                        <button class="btn btn-secondary letter-word-option" data-correct="${opt.correct}" data-word="${opt.word}" style="min-width: 120px; padding: 20px;">
                            <div style="font-size: 2.5rem;">${opt.emoji}</div>
                            <div style="font-family: var(--font-title); margin-top: 10px;">${opt.word}</div>
                        </button>
                    `).join('')}
                </div>
            `;

            document.querySelectorAll('.letter-word-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    GameScenes.totalQuestions++;
                    const isCorrect = btn.dataset.correct === 'true';
                    const word = btn.dataset.word;

                    if (isCorrect) {
                        GameScenes.correctAnswers++;
                        GameSounds.correct();
                        this.showFeedback(true);
                        btn.style.background = 'rgba(76, 175, 80, 0.3)';
                        btn.style.borderColor = 'var(--success-color)';
                        GameSpeech.speak(`Yes! ${targetLetter} is for ${word}!`);

                        GameScenes.currentItemIndex++;
                        setTimeout(showNextLetter, 2000);
                    } else {
                        GameSounds.wrong();
                        this.showFeedback(false);
                        btn.style.background = 'rgba(244, 67, 54, 0.3)';
                        GameSpeech.speak(`No, that's ${word}. Try again!`);
                        setTimeout(() => {
                            btn.style.background = '';
                        }, 500);
                    }
                });
            });
        };

        showNextLetter();
    },

    /**
     * Move to next activity
     */
    nextActivity() {
        const nextActivity = GameScenes.nextActivity(this.getCurrentUserType());

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
     * Complete the theme/level
     */
    completeTheme() {
        const stars = GameScenes.calculateStars();
        const level = GameScenes.currentLevel;

        // Save progress for the level
        GameStorage.completeLevel(this.currentUser, this.currentTheme.id, level, stars);

        // Check if next level exists to prompt user or just congrats
        const nextLevel = level + 1;
        const userType = this.getCurrentUserType();
        const nextActivities = GameScenes.filterActivitiesByLevel(this.currentTheme.activities[userType] || [], nextLevel);
        const hasNext = nextActivities.length > 0;

        // Get sticker choices for user to select from
        const stickerChoices = this.getStickerChoices(4);

        // Message
        const message = `Level ${level} Complete!`;
        const subMessage = hasNext ? "Next level unlocked!" : "Theme Mastered!";

        // Update UI
        this.elements.earnedStars.textContent = '⭐'.repeat(stars);
        this.elements.celebrationMessage.textContent = message;

        // Show celebration
        let celebrationHtml = `
            <div class="celebration-emoji">🎉</div>
            <h2 class="celebration-title">${GameI18n.t('feedback.greatJob')}</h2>
            <div class="earned-stars">${'⭐'.repeat(stars)}</div>
            <p class="celebration-message">${message}</p>
        `;

        // Show sticker selection if available
        if (stickerChoices.length > 0) {
            celebrationHtml += `
                <div class="sticker-selection-container">
                    <p class="sticker-selection-title">🎁 Choose your sticker reward!</p>
                    <div class="sticker-choices" id="sticker-choices">
                        ${stickerChoices.map(sticker => `
                            <button class="sticker-choice-btn" data-sticker="${sticker}" title="Choose this sticker!">
                                ${sticker}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            // User has collected all stickers!
            celebrationHtml += `
                <div class="sticker-complete-msg">
                    <p>🏆 You've collected all stickers! Amazing!</p>
                </div>
            `;
        }

        this.elements.celebrationOverlay.querySelector('.celebration-content').innerHTML = `
            ${celebrationHtml}
            <div class="celebration-buttons" id="celebration-buttons" style="${stickerChoices.length > 0 ? 'display: none;' : ''}">
                <button class="btn btn-primary" id="play-again-btn" data-i18n="celebration.playAgain">Play Again</button>
                <button class="btn btn-secondary" id="choose-theme-btn" data-i18n="celebration.chooseTheme">Choose Theme</button>
            </div>
        `;

        // Setup sticker selection handlers
        if (stickerChoices.length > 0) {
            document.querySelectorAll('.sticker-choice-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const chosenSticker = btn.dataset.sticker;
                    
                    // Award the chosen sticker
                    this.awardChosenSticker(chosenSticker);
                    
                    // Play sound and animate
                    GameSounds.celebrate();
                    btn.classList.add('chosen');
                    
                    // Hide other options
                    document.querySelectorAll('.sticker-choice-btn').forEach(b => {
                        if (b !== btn) {
                            b.classList.add('not-chosen');
                        }
                    });
                    
                    // Show the "You got!" message
                    const container = document.querySelector('.sticker-selection-container');
                    if (container) {
                        container.innerHTML = `
                            <div class="earned-sticker-container">
                                <p>🎉 You got a new sticker!</p>
                                <div class="earned-sticker bounce">${chosenSticker}</div>
                            </div>
                        `;
                    }
                    
                    // Show the action buttons after selection
                    const btnsContainer = document.getElementById('celebration-buttons');
                    if (btnsContainer) {
                        btnsContainer.style.display = 'flex';
                    }
                    
                    // Speak
                    GameSpeech.speak("Great choice! You got a new sticker!");
                });
            });
        }

        // Re-attach listeners since we overwrote HTML
        document.getElementById('play-again-btn').addEventListener('click', () => {
            GameSounds.click();
            this.hideCelebration();
            this.startTheme(this.currentTheme.id, level);
        });
        document.getElementById('choose-theme-btn').addEventListener('click', () => {
            GameSounds.click();
            this.hideCelebration();
            this.renderThemes();
            this.showScreen('theme-screen');
        });

        this.showCelebration();

        // Speak celebration
        let speakText = `Amazing! ${message} You earned ${stars} stars!`;
        if (stickerChoices.length > 0) {
            speakText += " Choose a sticker for your collection!";
        }
        GameSpeech.speak(speakText);

        // Update total stars
        this.elements.totalStarsCount.textContent = GameStorage.getTotalStars(this.currentUser);

        // Add "Next Level" button if available (after sticker selection or immediately if no stickers)
        if (hasNext) {
            const addNextButton = () => {
                const btnsContainer = document.getElementById('celebration-buttons');
                if (btnsContainer && !document.getElementById('next-level-btn')) {
                    const nextBtn = document.createElement('button');
                    nextBtn.id = 'next-level-btn';
                    nextBtn.className = 'btn btn-primary';
                    nextBtn.textContent = `Next Level →`;
                    nextBtn.addEventListener('click', () => {
                        GameSounds.click();
                        this.hideCelebration();
                        this.startTheme(this.currentTheme.id, nextLevel);
                    });
                    btnsContainer.insertBefore(nextBtn, btnsContainer.firstChild);
                }
            };
            
            if (stickerChoices.length === 0) {
                addNextButton();
            } else {
                // Add after sticker selection
                document.querySelectorAll('.sticker-choice-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        setTimeout(addNextButton, 100);
                    });
                });
            }
        }
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
        const activities = GameScenes.getActivities(this.getCurrentUserType());
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
     * @param {string|null} userId - User ID to edit, or null to create new user
     * @param {string} userType - 'explorer' or 'adventurer' (for new users)
     */
    showProfileSetup(userId, userType = 'explorer') {
        this.profileSetup.editingUserId = userId;
        this.profileSetup.userType = userType;
        
        const user = userId ? GameStorage.getUser(userId) : null;
        const defaultAge = userType === 'explorer' ? 5 : 7;
        const defaultAvatar = userType === 'explorer' ? '🧒' : '👦';

        // Pre-fill existing data or defaults
        document.getElementById('profile-name-input').value = user?.name || '';
        this.profileSetup.selectedAvatar = user?.avatar || defaultAvatar;
        this.profileSetup.selectedAge = user?.age || defaultAge;

        // Update modal title
        const modalTitle = document.querySelector('#profile-modal h2');
        if (modalTitle) {
            modalTitle.textContent = userId ? '✏️ Edit Profile' : '👋 Create Your Profile!';
        }

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
        this.profileSetup.editingUserId = null;
    },

    /**
     * Save profile and start playing
     */
    saveProfile() {
        const name = document.getElementById('profile-name-input').value.trim() ||
            (this.profileSetup.userType === 'explorer' ? 'Explorer' : 'Adventurer');
        const avatar = this.profileSetup.selectedAvatar;
        const age = this.profileSetup.selectedAge;
        const userType = this.profileSetup.userType;

        let userId;
        
        if (this.profileSetup.editingUserId) {
            // Editing existing user
            userId = this.profileSetup.editingUserId;
            GameStorage.saveUser(userId, {
                name,
                avatar,
                age,
                userType
            });
        } else {
            // Creating new user
            const newUser = GameStorage.addUser(name, avatar, userType, age);
            userId = newUser.id;
        }

        // Reload user profiles on welcome screen
        this.loadUserProfiles();
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
    // STICKER SYSTEM
    // ===========================================

    /**
     * Show stickers screen
     */
    showStickers() {
        const stickers = GameStorage.getStickers(this.currentUser);

        this.elements.stickerCount.textContent = stickers.length;
        this.elements.stickerGrid.innerHTML = '';

        if (stickers.length === 0) {
            this.elements.emptyStickersMsg?.classList.remove('hidden');
        } else {
            this.elements.emptyStickersMsg?.classList.add('hidden');

            stickers.forEach((sticker, index) => {
                const el = document.createElement('div');
                el.className = 'sticker-item';
                el.textContent = sticker;
                el.style.animationDelay = `${index * 0.05}s`;
                this.elements.stickerGrid.appendChild(el);

                el.addEventListener('click', () => {
                    GameSounds.click();
                    el.classList.add('bounce');
                    setTimeout(() => el.classList.remove('bounce'), 1000);
                });
            });
        }

        this.showScreen('stickers-screen');
    },

    /**
     * Get available stickers (ones user doesn't have yet)
     */
    getAvailableStickers() {
        const myStickers = GameStorage.getStickers(this.currentUser);
        return this.availableStickers.filter(s => !myStickers.includes(s));
    },

    /**
     * Get random selection of available stickers for user to choose
     * @param {number} count - Number of stickers to show (default 4)
     */
    getStickerChoices(count = 4) {
        const available = this.getAvailableStickers();
        
        if (available.length === 0) {
            return []; // User has all stickers!
        }

        // Shuffle and take up to 'count' stickers
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    },

    /**
     * Award a specific sticker chosen by the user
     */
    awardChosenSticker(sticker) {
        GameStorage.addSticker(this.currentUser, sticker);
        return sticker;
    },

    /**
     * Legacy: Award a random sticker (for cases where choice isn't shown)
     */
    awardSticker() {
        const available = this.getAvailableStickers();

        if (available.length === 0) {
            return null;
        }

        const randomSticker = available[Math.floor(Math.random() * available.length)];
        GameStorage.addSticker(this.currentUser, randomSticker);

        return randomSticker;
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

        // Get theme-specific drop zone config for correct speech
        const dropZoneConfig = GameScenes.getDropZoneConfig(this.currentTheme?.id);

        // Repeat instruction with theme-specific destination
        GameSpeech.speakInstruction(`Drag the ${targetWord} to the ${dropZoneConfig.label.toLowerCase()}!`);

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
    },

    // ===========================================
    // UTILITY FUNCTIONS
    // ===========================================

    /**
     * Check if two rectangles overlap (for touch drag-and-drop)
     * Uses a generous overlap check for better mobile UX
     */
    checkRectOverlap(rect1, rect2) {
        // Add some padding for more forgiving touch detection
        const padding = 20;
        
        return !(rect1.right < rect2.left - padding ||
                 rect1.left > rect2.right + padding ||
                 rect1.bottom < rect2.top - padding ||
                 rect1.top > rect2.bottom + padding);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

// Export for debugging
window.Game = Game;
