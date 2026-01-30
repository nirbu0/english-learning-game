/**
 * Internationalization Module - Multi-language support for instructions
 * Supports Hebrew and English for instructions (English words are always taught)
 */

const GameI18n = {
    currentLanguage: 'en',
    
    // Available languages
    languages: {
        en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
        he: { name: 'עברית', flag: '🇮🇱', dir: 'rtl' }
    },
    
    // Translations
    translations: {
        en: {
            // Welcome screen
            'welcome.title': 'English Adventure!',
            'welcome.subtitle': 'Learn English through fun stories!',
            'welcome.whoPlaying': "Who's playing today?",
            'welcome.explorer': 'Explorer',
            'welcome.adventurer': 'Adventurer',
            'welcome.ages45': 'Ages 4-5',
            'welcome.ages69': 'Ages 6-9',
            
            // Theme screen
            'theme.chooseAdventure': 'Choose Your Adventure!',
            'theme.back': '← Back',
            
            // Game screen
            'game.back': '← Back',
            'game.nextActivity': 'Next Activity →',
            'game.hearAgain': '🔊 Hear Again',
            
            // Activities
            'activity.tapToLearn': 'Tap each item to learn its name!',
            'activity.findThe': 'Find the {word}!',
            'activity.putInCart': 'Put the {word} in the cart!',
            'activity.whichOne': 'Which one did I say?',
            'activity.spellWord': 'Spell the word: {word}',
            
            // Feedback
            'feedback.correct': 'Correct!',
            'feedback.tryAgain': 'Try again!',
            'feedback.greatJob': 'Great Job!',
            'feedback.amazing': 'Amazing! You earned {stars} stars!',
            
            // Celebration
            'celebration.perfect': "Perfect! You're a superstar! 🌟",
            'celebration.great': 'Great job! Keep practicing! 💪',
            'celebration.good': 'Good try! You can do even better! 🎯',
            'celebration.playAgain': 'Play Again',
            'celebration.chooseTheme': 'Choose Theme',
            
            // Settings
            'settings.title': '⚙️ Settings',
            'settings.soundEffects': '🔊 Sound Effects',
            'settings.backgroundMusic': '🎵 Background Music',
            'settings.speechSpeed': '🗣️ Speech Speed',
            'settings.language': '🌐 Instructions Language',
            'settings.resetProgress': '🗑️ Reset Progress',
            'settings.resetAll': 'Reset All',
            'settings.done': 'Done',
            'settings.slow': 'Slow',
            'settings.normal': 'Normal',
            'settings.fast': 'Fast',
            
            // Speech encouragement
            'speech.hello': 'Hello {name}! Choose your adventure!',
            'speech.findThe': 'Find the {word}!',
            'speech.putInCart': 'Put the {word} in the cart!',
            'speech.thatsThe': "That's the {wrong}. Find the {correct}!",
            'speech.tryAgain': 'Try again!',
            'speech.spellWord': 'Spell the word: {word}'
        },
        
        he: {
            // Welcome screen
            'welcome.title': 'הרפתקת אנגלית!',
            'welcome.subtitle': 'ללמוד אנגלית דרך סיפורים כיפיים!',
            'welcome.whoPlaying': 'מי משחק היום?',
            'welcome.explorer': 'חוקר',
            'welcome.adventurer': 'הרפתקן',
            'welcome.ages45': 'גילאי 4-5',
            'welcome.ages69': 'גילאי 6-9',
            
            // Theme screen
            'theme.chooseAdventure': 'בחר את ההרפתקה שלך!',
            'theme.back': 'חזרה ←',
            
            // Game screen
            'game.back': 'חזרה ←',
            'game.nextActivity': '→ פעילות הבאה',
            'game.hearAgain': '🔊 שמע שוב',
            
            // Activities
            'activity.tapToLearn': 'לחץ על כל פריט כדי ללמוד את השם שלו!',
            'activity.findThe': 'מצא את ה-{word}!',
            'activity.putInCart': 'שים את ה-{word} בעגלה!',
            'activity.whichOne': 'על מה אמרתי?',
            'activity.spellWord': 'איית את המילה: {word}',
            
            // Feedback
            'feedback.correct': 'נכון!',
            'feedback.tryAgain': 'נסה שוב!',
            'feedback.greatJob': 'עבודה מצוינת!',
            'feedback.amazing': 'מדהים! הרווחת {stars} כוכבים!',
            
            // Celebration
            'celebration.perfect': 'מושלם! אתה כוכב-על! 🌟',
            'celebration.great': 'עבודה מצוינת! המשך להתאמן! 💪',
            'celebration.good': 'ניסיון טוב! אפשר להשתפר עוד! 🎯',
            'celebration.playAgain': 'שחק שוב',
            'celebration.chooseTheme': 'בחר נושא',
            
            // Settings
            'settings.title': '⚙️ הגדרות',
            'settings.soundEffects': '🔊 אפקטים קוליים',
            'settings.backgroundMusic': '🎵 מוזיקת רקע',
            'settings.speechSpeed': '🗣️ מהירות דיבור',
            'settings.language': '🌐 שפת ההוראות',
            'settings.resetProgress': '🗑️ איפוס התקדמות',
            'settings.resetAll': 'איפוס הכל',
            'settings.done': 'סיום',
            'settings.slow': 'איטי',
            'settings.normal': 'רגיל',
            'settings.fast': 'מהיר',
            
            // Speech encouragement (still in English for learning)
            'speech.hello': 'Hello {name}! Choose your adventure!',
            'speech.findThe': 'Find the {word}!',
            'speech.putInCart': 'Put the {word} in the cart!',
            'speech.thatsThe': "That's the {wrong}. Find the {correct}!",
            'speech.tryAgain': 'Try again!',
            'speech.spellWord': 'Spell the word: {word}'
        }
    },
    
    /**
     * Initialize with saved language preference
     */
    init() {
        const settings = GameStorage.getSettings();
        if (settings.language && this.languages[settings.language]) {
            this.currentLanguage = settings.language;
        }
        this.updateDocumentDirection();
        console.log(`🌐 Language initialized: ${this.currentLanguage}`);
    },
    
    /**
     * Set the current language
     */
    setLanguage(lang) {
        if (this.languages[lang]) {
            this.currentLanguage = lang;
            GameStorage.saveSettings({ language: lang });
            this.updateDocumentDirection();
            this.updateUI();
        }
    },
    
    /**
     * Update document direction for RTL languages
     */
    updateDocumentDirection() {
        const langInfo = this.languages[this.currentLanguage];
        document.documentElement.dir = langInfo.dir;
        document.documentElement.lang = this.currentLanguage;
    },
    
    /**
     * Get a translation
     * @param {string} key - Translation key
     * @param {object} params - Parameters to replace in the string
     */
    t(key, params = {}) {
        let text = this.translations[this.currentLanguage]?.[key] 
            || this.translations['en']?.[key] 
            || key;
        
        // Replace parameters
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        
        return text;
    },
    
    /**
     * Get available languages
     */
    getLanguages() {
        return Object.entries(this.languages).map(([code, info]) => ({
            code,
            ...info
        }));
    },
    
    /**
     * Get current language info
     */
    getCurrentLanguage() {
        return {
            code: this.currentLanguage,
            ...this.languages[this.currentLanguage]
        };
    },
    
    /**
     * Check if current language is RTL
     */
    isRTL() {
        return this.languages[this.currentLanguage]?.dir === 'rtl';
    },
    
    /**
     * Update all UI elements with translations
     */
    updateUI() {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        // Update elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        
        // Update elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
    }
};

// Export for use in other modules
window.GameI18n = GameI18n;
