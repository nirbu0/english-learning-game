/**
 * Storage Module - Handles saving and loading game progress
 */

const GameStorage = {
    STORAGE_KEY: 'english_adventure_game',
    
    // Default data structure
    defaultData: {
        settings: {
            soundEffects: true,
            speechSpeed: 1
        },
        users: {
            explorer: {
                name: 'Explorer',
                avatar: '🧒',
                totalStars: 0,
                completedThemes: [],
                themeProgress: {}
            },
            adventurer: {
                name: 'Adventurer',
                avatar: '👦',
                totalStars: 0,
                completedThemes: [],
                themeProgress: {}
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
     */
    getThemeProgress(userId, themeId) {
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
     * Check if theme is unlocked
     */
    isThemeUnlocked(userId, themeId, themes) {
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
