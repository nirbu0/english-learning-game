/**
 * Storage Module - Handles saving and loading game progress
 * Supports multiple users per class (explorer/adventurer)
 */

const GameStorage = {
    STORAGE_KEY: 'english_adventure_game',
    VERSION: 2, // Storage version for migration

    // Default data structure (v2 - multi-user support)
    defaultData: {
        version: 2,
        settings: {
            soundEffects: true,
            musicEnabled: false,
            speechSpeed: 1,
            language: 'en',
            unlockAll: false
        },
        // Users are now stored as array with unique IDs
        users: [],
        currentUserId: null
    },

    /**
     * Generate unique user ID
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Create a new user
     */
    createUser(name, avatar, userType, age) {
        return {
            id: this.generateUserId(),
            name: name || (userType === 'explorer' ? 'Explorer' : 'Adventurer'),
            avatar: avatar || (userType === 'explorer' ? '🧒' : '👦'),
            userType: userType, // 'explorer' or 'adventurer'
            age: age || (userType === 'explorer' ? 5 : 7),
            ageRange: userType === 'explorer' ? 'Ages 4-5' : 'Ages 6-9',
            totalStars: 0,
            completedThemes: [],
            themeProgress: {},
            stickers: [],
            createdAt: Date.now()
        };
    },

    /**
     * Get all stored data
     */
    getData() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                // Migrate old data format if needed
                return this.migrateData(data);
            }
        } catch (e) {
            console.warn('Error reading from localStorage:', e);
        }
        return { ...this.defaultData, users: [] };
    },

    /**
     * Migrate data from old format to new format
     */
    migrateData(data) {
        // Already v2 format
        if (data.version === 2 && Array.isArray(data.users)) {
            return data;
        }

        // Migrate from v1 (object-based users) to v2 (array-based users)
        console.log('Migrating storage from v1 to v2...');
        
        const newData = {
            version: 2,
            settings: data.settings || this.defaultData.settings,
            users: [],
            currentUserId: null
        };

        // Convert old user objects to array format
        if (data.users && typeof data.users === 'object' && !Array.isArray(data.users)) {
            ['explorer', 'adventurer'].forEach(userType => {
                const oldUser = data.users[userType];
                if (oldUser) {
                    const newUser = {
                        id: this.generateUserId(),
                        name: oldUser.name || (userType === 'explorer' ? 'Explorer' : 'Adventurer'),
                        avatar: oldUser.avatar || (userType === 'explorer' ? '🧒' : '👦'),
                        userType: userType,
                        age: oldUser.age || (userType === 'explorer' ? 5 : 7),
                        ageRange: oldUser.ageRange || (userType === 'explorer' ? 'Ages 4-5' : 'Ages 6-9'),
                        totalStars: oldUser.totalStars || 0,
                        completedThemes: oldUser.completedThemes || [],
                        themeProgress: oldUser.themeProgress || {},
                        stickers: oldUser.stickers || [],
                        createdAt: Date.now()
                    };
                    newData.users.push(newUser);

                    // Set current user if it was the old current user
                    if (data.currentUser === userType) {
                        newData.currentUserId = newUser.id;
                    }
                }
            });
        }

        // Save migrated data
        this.saveData(newData);
        console.log('Storage migration complete!');
        
        return newData;
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
     * Get all users
     */
    getAllUsers() {
        const data = this.getData();
        return data.users || [];
    },

    /**
     * Get users by type (explorer or adventurer)
     */
    getUsersByType(userType) {
        return this.getAllUsers().filter(u => u.userType === userType);
    },

    /**
     * Get user by ID
     */
    getUser(userId) {
        const users = this.getAllUsers();
        return users.find(u => u.id === userId);
    },

    /**
     * Add a new user
     */
    addUser(name, avatar, userType, age) {
        const data = this.getData();
        const newUser = this.createUser(name, avatar, userType, age);
        data.users.push(newUser);
        this.saveData(data);
        return newUser;
    },

    /**
     * Update user data
     */
    saveUser(userId, userData) {
        const data = this.getData();
        const userIndex = data.users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            data.users[userIndex] = { ...data.users[userIndex], ...userData };
            return this.saveData(data);
        }
        return false;
    },

    /**
     * Delete a user
     */
    deleteUser(userId) {
        const data = this.getData();
        const userIndex = data.users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            data.users.splice(userIndex, 1);
            
            // Clear current user if it was deleted
            if (data.currentUserId === userId) {
                data.currentUserId = null;
            }
            
            return this.saveData(data);
        }
        return false;
    },

    /**
     * Get theme progress for a user
     */
    getThemeProgress(userId, themeId) {
        const user = this.getUser(userId);
        return user?.themeProgress?.[themeId] || {};
    },

    /**
     * Get all user progress (for dashboard)
     */
    getUserProgress(userId) {
        const user = this.getUser(userId);
        return user?.themeProgress || {};
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
     * Get current user ID
     */
    getCurrentUser() {
        const data = this.getData();
        return data.currentUserId;
    },

    /**
     * Set current user
     */
    setCurrentUser(userId) {
        const data = this.getData();
        data.currentUserId = userId;
        return this.saveData(data);
    },

    /**
     * Add stars to user
     */
    addStars(userId, stars) {
        const user = this.getUser(userId);
        if (user) {
            return this.saveUser(userId, {
                totalStars: (user.totalStars || 0) + stars
            });
        }
        return false;
    },

    /**
     * Get user's total stars
     */
    getTotalStars(userId) {
        const user = this.getUser(userId);
        return user?.totalStars || 0;
    },

    /**
     * Save theme progress
     */
    saveThemeProgress(userId, themeId, progress) {
        const user = this.getUser(userId);
        if (user) {
            const themeProgress = { ...user.themeProgress, [themeId]: progress };
            return this.saveUser(userId, { themeProgress });
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
            if (user?.themeProgress?.[themeId]?.levels?.[level]) {
                return { ...user.themeProgress[themeId].levels[level], unlocked: true };
            }
            return { completed: false, stars: 0, unlocked: true };
        }

        const user = this.getUser(userId);
        if (!user?.themeProgress?.[themeId]?.levels) {
            return { completed: false, stars: 0, unlocked: level === 1 };
        }
        return user.themeProgress[themeId].levels[level] || { completed: false, stars: 0, unlocked: level === 1 };
    },

    /**
     * Complete a level
     * @param {string} userId - User ID
     * @param {string} themeId - Theme ID
     * @param {number} level - Level number
     * @param {number} stars - Stars earned (1-3)
     * @param {Object} stats - Optional statistics object { correctAnswers, totalQuestions, wordsLearned }
     */
    completeLevel(userId, themeId, level, stars, stats = {}) {
        const user = this.getUser(userId);
        if (!user) return false;

        const themeProgress = { ...user.themeProgress };
        
        if (!themeProgress[themeId]) {
            themeProgress[themeId] = { levels: {}, totalCorrectAnswers: 0, totalQuestions: 0, wordsLearned: [] };
        }
        if (!themeProgress[themeId].levels) {
            themeProgress[themeId].levels = {};
        }

        // Save current level
        const currentLevel = themeProgress[themeId].levels[level] || { stars: 0 };
        themeProgress[themeId].levels[level] = {
            completed: true,
            stars: Math.max(currentLevel.stars || 0, stars),
            unlocked: true,
            correctAnswers: stats.correctAnswers || 0,
            totalQuestions: stats.totalQuestions || 0
        };

        // Accumulate theme-level statistics
        themeProgress[themeId].totalCorrectAnswers = (themeProgress[themeId].totalCorrectAnswers || 0) + (stats.correctAnswers || 0);
        themeProgress[themeId].totalQuestions = (themeProgress[themeId].totalQuestions || 0) + (stats.totalQuestions || 0);
        
        // Track words learned (merge and dedupe)
        if (stats.wordsLearned && Array.isArray(stats.wordsLearned)) {
            const existingWords = themeProgress[themeId].wordsLearned || [];
            const allWords = [...new Set([...existingWords, ...stats.wordsLearned])];
            themeProgress[themeId].wordsLearned = allWords;
        }

        // Unlock next level
        const nextLevel = level + 1;
        if (!themeProgress[themeId].levels[nextLevel]) {
            themeProgress[themeId].levels[nextLevel] = {
                completed: false,
                stars: 0,
                unlocked: true
            };
        } else {
            themeProgress[themeId].levels[nextLevel].unlocked = true;
        }

        // Update completed themes list
        let completedThemes = [...(user.completedThemes || [])];
        if (level === 1 && !completedThemes.includes(themeId)) {
            completedThemes.push(themeId);
        }

        // Calculate new stars to add
        const oldStars = currentLevel.stars || 0;
        const newStarsToAdd = Math.max(0, stars - oldStars);

        return this.saveUser(userId, {
            themeProgress,
            completedThemes,
            totalStars: (user.totalStars || 0) + newStarsToAdd
        });
    },

    /**
     * Get user stickers
     */
    getStickers(userId) {
        const user = this.getUser(userId);
        return user?.stickers || [];
    },

    /**
     * Add sticker to user
     */
    addSticker(userId, sticker) {
        const user = this.getUser(userId);
        if (user) {
            const stickers = [...(user.stickers || [])];
            if (!stickers.includes(sticker)) {
                stickers.push(sticker);
                return this.saveUser(userId, { stickers });
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
            return user?.completedThemes?.includes(previousTheme.id) || false;
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
    },

    /**
     * Reset progress for a specific user
     */
    resetUserProgress(userId) {
        const user = this.getUser(userId);
        if (user) {
            return this.saveUser(userId, {
                totalStars: 0,
                completedThemes: [],
                themeProgress: {},
                stickers: []
            });
        }
        return false;
    }
};

// Export for use in other modules
window.GameStorage = GameStorage;
