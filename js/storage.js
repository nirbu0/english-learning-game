/**
 * Storage Module - Handles saving and loading game progress
 */

const GameStorage = {
    STORAGE_KEY: 'english_adventure_game',

    // Default data structure
    defaultData: {
        settings: {
            soundEffects: true,
            musicEnabled: false,
            speechSpeed: 1,
            language: 'en',
            unlockAll: false
        },
        users: {
            explorer: {
                name: 'Explorer',
                avatar: '🧒',
                ageRange: 'Ages 4-5',
                totalStars: 0,
                completedThemes: [],
                themeProgress: {},
                stickers: []
            },
            adventurer: {
                name: 'Adventurer',
                avatar: '👦',
                ageRange: 'Ages 6-9',
                totalStars: 0,
                completedThemes: [],
                themeProgress: {},
                stickers: []
            }
        },
        currentUser: null
    },

    /**
     * Get all stored data
     */
    getData() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Error reading from localStorage:', e);
        }
        return { ...this.defaultData };
    },

    /**
     * Save all data
     */
    saveData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Error saving to localStorage:', e);
            return false;
        }
    },

    /**
     * Get theme progress for a user
     */
    getThemeProgress(userId, themeId) {
        const user = this.getUser(userId);
        return user.themeProgress?.[themeId] || {};
    },

    /**
     * Get all user progress (for dashboard)
     */
    getUserProgress(userId) {
        const user = this.getUser(userId);
        return user.themeProgress || {};
    },

    /**
     * Get settings
     */
    getSettings() {
        const data = this.getData();
        return data.settings || this.defaultData.settings;
    },

    /**
     * Save settings
     */
    saveSettings(settings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...settings };
        return this.saveData(data);
    },

    /**
     * Get user data
     */
    getUser(userId) {
        const data = this.getData();
        return data.users[userId] || this.defaultData.users[userId];
    },

    /**
     * Save user data
     */
    saveUser(userId, userData) {
        const data = this.getData();
        data.users[userId] = { ...data.users[userId], ...userData };
        return this.saveData(data);
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        const data = this.getData();
        return data.currentUser;
    },

    /**
     * Set current user
     */
    setCurrentUser(userId) {
        const data = this.getData();
        data.currentUser = userId;
        return this.saveData(data);
    },

    /**
     * Add stars to user
     */
    addStars(userId, stars) {
        const data = this.getData();
        if (data.users[userId]) {
            data.users[userId].totalStars = (data.users[userId].totalStars || 0) + stars;
            return this.saveData(data);
        }
        return false;
    },

    /**
     * Get user's total stars
     */
    getTotalStars(userId) {
        const user = this.getUser(userId);
        return user.totalStars || 0;
    },

    /**
     * Save theme progress
     */
    saveThemeProgress(userId, themeId, progress) {
        const data = this.getData();
        if (data.users[userId]) {
            if (!data.users[userId].themeProgress) {
                data.users[userId].themeProgress = {};
            }
            data.users[userId].themeProgress[themeId] = progress;
            return this.saveData(data);
        }
        return false;
    },

    /**
     * Get theme progress
     * (Overloaded method name in original file, keeping robust implementation)
     */
    getThemeProgressFull(userId, themeId) {
        const user = this.getUser(userId);
        return (user.themeProgress && user.themeProgress[themeId]) || {
            completed: false,
            stars: 0,
            currentActivity: 0
        };
    },

    /**
     * Mark theme as completed
     */
    completeTheme(userId, themeId, stars) {
        const data = this.getData();
        if (data.users[userId]) {
            // Add to completed themes if not already there
            if (!data.users[userId].completedThemes) {
                data.users[userId].completedThemes = [];
            }
            if (!data.users[userId].completedThemes.includes(themeId)) {
                data.users[userId].completedThemes.push(themeId);
            }

            // Update theme progress
            if (!data.users[userId].themeProgress) {
                data.users[userId].themeProgress = {};
            }
            const currentProgress = data.users[userId].themeProgress[themeId] || {};
            const previousStars = currentProgress.stars || 0;

            // Only add new stars (don't double count on replay)
            const newStars = Math.max(0, stars - previousStars);
            data.users[userId].totalStars = (data.users[userId].totalStars || 0) + newStars;

            data.users[userId].themeProgress[themeId] = {
                completed: true,
                stars: Math.max(previousStars, stars),
                currentActivity: 0
            };

            return this.saveData(data);
        }
        return false;
    },

    /**
     * Get level progress
     */
    getLevelProgress(userId, themeId, level) {
        // If QA mode is enabled, all levels are unlocked
        if (this.getSettings().unlockAll) {
            const user = this.getUser(userId);
            if (user.themeProgress && user.themeProgress[themeId] && user.themeProgress[themeId].levels && user.themeProgress[themeId].levels[level]) {
                return { ...user.themeProgress[themeId].levels[level], unlocked: true };
            }
            return { completed: false, stars: 0, unlocked: true };
        }

        const user = this.getUser(userId);
        if (!user.themeProgress || !user.themeProgress[themeId] || !user.themeProgress[themeId].levels) {
            return { completed: false, stars: 0, unlocked: level === 1 };
        }
        return user.themeProgress[themeId].levels[level] || { completed: false, stars: 0, unlocked: level === 1 };
    },

    /**
     * Complete a level
     */
    completeLevel(userId, themeId, level, stars) {
        const data = this.getData();
        if (data.users[userId]) {
            if (!data.users[userId].themeProgress) {
                data.users[userId].themeProgress = {};
            }
            if (!data.users[userId].themeProgress[themeId]) {
                data.users[userId].themeProgress[themeId] = { levels: {} };
            }
            if (!data.users[userId].themeProgress[themeId].levels) {
                data.users[userId].themeProgress[themeId].levels = {};
            }

            // Save current level
            const currentLevel = data.users[userId].themeProgress[themeId].levels[level] || { stars: 0 };
            data.users[userId].themeProgress[themeId].levels[level] = {
                completed: true,
                stars: Math.max(currentLevel.stars || 0, stars),
                unlocked: true
            };

            // Unlock next level
            const nextLevel = level + 1;
            if (!data.users[userId].themeProgress[themeId].levels[nextLevel]) {
                data.users[userId].themeProgress[themeId].levels[nextLevel] = {
                    completed: false,
                    stars: 0,
                    unlocked: true
                };
            } else {
                data.users[userId].themeProgress[themeId].levels[nextLevel].unlocked = true;
            }

            // If Level 1 is completed, mark theme as "completed" for sequential unlocking of NEXT theme
            if (level === 1) {
                if (!data.users[userId].completedThemes) data.users[userId].completedThemes = [];
                if (!data.users[userId].completedThemes.includes(themeId)) {
                    data.users[userId].completedThemes.push(themeId);
                }
            }

            // Add stars to total
            const oldStars = currentLevel.stars || 0;
            const newStarsToAdd = Math.max(0, stars - oldStars);
            data.users[userId].totalStars = (data.users[userId].totalStars || 0) + newStarsToAdd;

            return this.saveData(data);
        }
        return false;
    },

    /**
     * Get user stickers
     */
    getStickers(userId) {
        const user = this.getUser(userId);
        return user.stickers || [];
    },

    /**
     * Add sticker to user
     */
    addSticker(userId, sticker) {
        const data = this.getData();
        if (data.users[userId]) {
            if (!data.users[userId].stickers) {
                data.users[userId].stickers = [];
            }
            if (!data.users[userId].stickers.includes(sticker)) {
                data.users[userId].stickers.push(sticker);
                return this.saveData(data);
            }
        }
        return false;
    },

    /**
     * Check if level is unlocked
     */
    isLevelUnlocked(userId, themeId, level) {
        // Debug override
        if (this.getSettings().unlockAll) return true;

        if (level === 1) return true;
        const prevLevel = this.getLevelProgress(userId, themeId, level - 1);
        return prevLevel.completed;
    },

    /**
     * Check if theme is unlocked
     */
    isThemeUnlocked(userId, themeId, themes) {
        // Debug override
        if (this.getSettings().unlockAll) return true;

        // First theme is always unlocked
        const themeIndex = themes.findIndex(t => t.id === themeId);
        if (themeIndex === 0) return true;

        // Check if previous theme is completed
        const previousTheme = themes[themeIndex - 1];
        if (previousTheme) {
            const user = this.getUser(userId);
            return user.completedThemes && user.completedThemes.includes(previousTheme.id);
        }

        return false;
    },

    /**
     * Reset all progress
     */
    resetAll() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (e) {
            console.warn('Error resetting localStorage:', e);
            return false;
        }
    }
};

// Export for use in other modules
window.GameStorage = GameStorage;
