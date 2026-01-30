/**
 * Scenes Module - Handles rendering game scenes and activities
 */

const GameScenes = {
    vocabulary: null,
    currentTheme: null,
    currentActivity: null,
    currentActivityIndex: 0,
    currentItemIndex: 0,
    collectedItems: [],
    correctAnswers: 0,
    totalQuestions: 0,
    
    /**
     * Initialize scenes with vocabulary data
     */
    async init() {
        try {
            const response = await fetch('data/vocabulary.json');
            this.vocabulary = await response.json();
            console.log('Vocabulary loaded from JSON file');
            return true;
        } catch (error) {
            console.warn('Could not load vocabulary.json, using embedded data:', error);
            // Use embedded fallback data when fetch fails (e.g., file:// protocol)
            this.vocabulary = this.getEmbeddedVocabulary();
            return true;
        }
    },
    
    /**
     * Get embedded vocabulary data (fallback for when fetch fails)
     */
    getEmbeddedVocabulary() {
        return {
            "themes": [
                {
                    "id": "supermarket",
                    "name": "Supermarket Adventure",
                    "emoji": "🛒",
                    "description": "Help Max fill his shopping cart!",
                    "background": "supermarket",
                    "character": "👦",
                    "unlocked": true,
                    "activities": {
                        "explorer": [
                            { "type": "tap-to-learn", "instruction": "Tap each item to learn its name!", "items": ["apple", "banana", "orange", "milk", "bread"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["apple", "banana", "orange", "milk", "bread"] },
                            { "type": "collect-items", "instruction": "Put the {word} in the cart!", "items": ["apple", "banana", "orange"] },
                            { "type": "match-sound", "instruction": "Which one did I say?", "words": ["apple", "banana", "orange", "milk"] }
                        ],
                        "adventurer": [
                            { "type": "tap-to-learn", "instruction": "Tap each item to learn its name!", "items": ["apple", "banana", "orange", "carrot", "tomato", "milk", "bread", "cheese", "eggs"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["apple", "banana", "orange", "carrot", "tomato", "milk", "bread", "cheese"] },
                            { "type": "spelling", "instruction": "Spell the word: {word}", "words": ["apple", "milk", "bread"] },
                            { "type": "collect-items", "instruction": "Put the {word} in the cart!", "items": ["apple", "banana", "orange", "milk"] }
                        ]
                    }
                },
                {
                    "id": "bakery",
                    "name": "Birthday Cake",
                    "emoji": "🎂",
                    "description": "Bake a birthday cake!",
                    "background": "kitchen",
                    "character": "👨‍🍳",
                    "activities": {
                        "explorer": [
                            { "type": "tap-to-learn", "instruction": "Tap each ingredient!", "items": ["egg", "milk", "flour", "sugar", "butter"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["egg", "milk", "flour", "sugar", "butter"] },
                            { "type": "collect-items", "instruction": "Put the {word} in the bowl!", "items": ["egg", "milk", "flour"] }
                        ],
                        "adventurer": [
                            { "type": "tap-to-learn", "instruction": "Tap each ingredient!", "items": ["egg", "milk", "flour", "sugar", "butter", "chocolate", "vanilla", "cream"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["egg", "milk", "flour", "sugar", "butter", "chocolate"] },
                            { "type": "spelling", "instruction": "Spell the word: {word}", "words": ["egg", "milk", "cake"] }
                        ]
                    }
                },
                {
                    "id": "zoo",
                    "name": "Safari Zoo",
                    "emoji": "🦁",
                    "description": "Be a zookeeper for a day!",
                    "background": "zoo",
                    "character": "🧑‍🌾",
                    "activities": {
                        "explorer": [
                            { "type": "tap-to-learn", "instruction": "Tap each animal!", "items": ["lion", "elephant", "monkey", "giraffe", "zebra"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["lion", "elephant", "monkey", "giraffe", "zebra"] },
                            { "type": "match-sound", "instruction": "Which animal did I say?", "words": ["lion", "elephant", "monkey", "giraffe"] }
                        ],
                        "adventurer": [
                            { "type": "tap-to-learn", "instruction": "Tap each animal!", "items": ["lion", "elephant", "monkey", "giraffe", "zebra", "tiger", "hippo", "penguin"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["lion", "elephant", "monkey", "giraffe", "zebra", "tiger"] },
                            { "type": "spelling", "instruction": "Spell the word: {word}", "words": ["lion", "zebra", "monkey"] }
                        ]
                    }
                },
                {
                    "id": "space",
                    "name": "Space Mission",
                    "emoji": "🚀",
                    "description": "Become an astronaut!",
                    "background": "space",
                    "character": "👨‍🚀",
                    "activities": {
                        "explorer": [
                            { "type": "tap-to-learn", "instruction": "Tap to explore space!", "items": ["rocket", "star", "moon", "planet", "sun"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["rocket", "star", "moon", "planet", "sun"] },
                            { "type": "match-sound", "instruction": "Which one did I say?", "words": ["rocket", "star", "moon", "sun"] }
                        ],
                        "adventurer": [
                            { "type": "tap-to-learn", "instruction": "Tap to explore space!", "items": ["rocket", "star", "moon", "planet", "sun", "astronaut"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["rocket", "star", "moon", "planet", "sun", "astronaut"] },
                            { "type": "spelling", "instruction": "Spell the word: {word}", "words": ["star", "moon", "sun"] }
                        ]
                    }
                },
                {
                    "id": "pirate",
                    "name": "Pirate Treasure",
                    "emoji": "🏴‍☠️",
                    "description": "Find the hidden treasure!",
                    "background": "island",
                    "character": "🏴‍☠️",
                    "activities": {
                        "explorer": [
                            { "type": "tap-to-learn", "instruction": "Tap to discover pirate items!", "items": ["ship", "treasure", "map", "parrot", "island"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["ship", "treasure", "map", "parrot", "gold"] },
                            { "type": "match-sound", "instruction": "Which one did I say?", "words": ["ship", "treasure", "map", "gold"] }
                        ],
                        "adventurer": [
                            { "type": "tap-to-learn", "instruction": "Tap to discover pirate items!", "items": ["ship", "treasure", "map", "parrot", "island", "chest", "sword", "compass"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["ship", "treasure", "map", "parrot", "chest", "sword"] },
                            { "type": "spelling", "instruction": "Spell the word: {word}", "words": ["ship", "gold", "map"] }
                        ]
                    }
                },
                {
                    "id": "dinosaur",
                    "name": "Dinosaur Discovery",
                    "emoji": "🦕",
                    "description": "Explore the dinosaur world!",
                    "background": "prehistoric",
                    "character": "🔍",
                    "activities": {
                        "explorer": [
                            { "type": "tap-to-learn", "instruction": "Tap each dinosaur!", "items": ["t-rex", "egg", "bone", "fossil"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["t-rex", "egg", "bone", "fossil"] },
                            { "type": "match-sound", "instruction": "Which one did I say?", "words": ["t-rex", "egg", "bone"] }
                        ],
                        "adventurer": [
                            { "type": "tap-to-learn", "instruction": "Tap each dinosaur!", "items": ["t-rex", "egg", "bone", "fossil"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["t-rex", "egg", "bone", "fossil"] },
                            { "type": "spelling", "instruction": "Spell the word: {word}", "words": ["bone", "egg", "big"] }
                        ]
                    }
                },
                {
                    "id": "construction",
                    "name": "Construction Site",
                    "emoji": "🏗️",
                    "description": "Build a house!",
                    "background": "construction",
                    "character": "👷",
                    "activities": {
                        "explorer": [
                            { "type": "tap-to-learn", "instruction": "Tap the tools and vehicles!", "items": ["hammer", "truck", "crane", "brick", "wood"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["hammer", "truck", "crane", "brick", "wood"] },
                            { "type": "match-sound", "instruction": "Which one did I say?", "words": ["hammer", "truck", "brick", "wood"] }
                        ],
                        "adventurer": [
                            { "type": "tap-to-learn", "instruction": "Tap the tools and vehicles!", "items": ["hammer", "truck", "crane", "brick", "wood", "nail", "saw", "helmet"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["hammer", "truck", "crane", "brick", "wood", "nail"] },
                            { "type": "spelling", "instruction": "Spell the word: {word}", "words": ["brick", "wood", "nail"] }
                        ]
                    }
                },
                {
                    "id": "racing",
                    "name": "Racing Day",
                    "emoji": "🏎️",
                    "description": "Get ready to race!",
                    "background": "racetrack",
                    "character": "🏁",
                    "activities": {
                        "explorer": [
                            { "type": "tap-to-learn", "instruction": "Tap to learn racing words!", "items": ["car", "wheel", "helmet", "flag", "trophy"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["car", "wheel", "helmet", "flag", "trophy"] },
                            { "type": "match-sound", "instruction": "Which one did I say?", "words": ["car", "wheel", "flag", "trophy"] }
                        ],
                        "adventurer": [
                            { "type": "tap-to-learn", "instruction": "Tap to learn racing words!", "items": ["car", "wheel", "helmet", "flag", "trophy", "engine", "tire"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["car", "wheel", "helmet", "flag", "trophy", "engine"] },
                            { "type": "spelling", "instruction": "Spell the word: {word}", "words": ["car", "fast", "win"] }
                        ]
                    }
                },
                {
                    "id": "firefighter",
                    "name": "Firefighter Hero",
                    "emoji": "🚒",
                    "description": "Save the day!",
                    "background": "city",
                    "character": "👨‍🚒",
                    "activities": {
                        "explorer": [
                            { "type": "tap-to-learn", "instruction": "Tap the firefighter items!", "items": ["fire", "water", "truck", "ladder", "hose"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["fire", "water", "truck", "ladder", "hose"] },
                            { "type": "match-sound", "instruction": "Which one did I say?", "words": ["fire", "water", "truck", "hose"] }
                        ],
                        "adventurer": [
                            { "type": "tap-to-learn", "instruction": "Tap the firefighter items!", "items": ["fire", "water", "truck", "ladder", "hose", "helmet", "boots", "alarm"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["fire", "water", "truck", "ladder", "hose", "helmet"] },
                            { "type": "spelling", "instruction": "Spell the word: {word}", "words": ["fire", "water", "help"] }
                        ]
                    }
                },
                {
                    "id": "ocean",
                    "name": "Ocean Exploration",
                    "emoji": "🐠",
                    "description": "Dive into the deep sea!",
                    "background": "underwater",
                    "character": "🤿",
                    "activities": {
                        "explorer": [
                            { "type": "tap-to-learn", "instruction": "Tap the sea creatures!", "items": ["fish", "whale", "octopus", "crab", "starfish"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["fish", "whale", "octopus", "crab", "starfish"] },
                            { "type": "match-sound", "instruction": "Which one did I say?", "words": ["fish", "whale", "crab", "octopus"] }
                        ],
                        "adventurer": [
                            { "type": "tap-to-learn", "instruction": "Tap the sea creatures!", "items": ["fish", "whale", "octopus", "crab", "starfish", "shark", "dolphin", "turtle"] },
                            { "type": "find-item", "instruction": "Find the {word}!", "targetWords": ["fish", "whale", "octopus", "crab", "shark", "dolphin"] },
                            { "type": "spelling", "instruction": "Spell the word: {word}", "words": ["fish", "crab", "swim"] }
                        ]
                    }
                }
            ],
            "vocabulary": {
                "apple": {"emoji": "🍎", "category": "food"},
                "banana": {"emoji": "🍌", "category": "food"},
                "orange": {"emoji": "🍊", "category": "food"},
                "milk": {"emoji": "🥛", "category": "food"},
                "bread": {"emoji": "🍞", "category": "food"},
                "carrot": {"emoji": "🥕", "category": "food"},
                "tomato": {"emoji": "🍅", "category": "food"},
                "cheese": {"emoji": "🧀", "category": "food"},
                "eggs": {"emoji": "🥚", "category": "food"},
                "egg": {"emoji": "🥚", "category": "food"},
                "flour": {"emoji": "🌾", "category": "food"},
                "sugar": {"emoji": "🍬", "category": "food"},
                "butter": {"emoji": "🧈", "category": "food"},
                "chocolate": {"emoji": "🍫", "category": "food"},
                "vanilla": {"emoji": "🧁", "category": "food"},
                "cream": {"emoji": "🍦", "category": "food"},
                "cake": {"emoji": "🎂", "category": "food"},
                "lion": {"emoji": "🦁", "category": "animal"},
                "elephant": {"emoji": "🐘", "category": "animal"},
                "monkey": {"emoji": "🐵", "category": "animal"},
                "giraffe": {"emoji": "🦒", "category": "animal"},
                "zebra": {"emoji": "🦓", "category": "animal"},
                "tiger": {"emoji": "🐯", "category": "animal"},
                "hippo": {"emoji": "🦛", "category": "animal"},
                "penguin": {"emoji": "🐧", "category": "animal"},
                "parrot": {"emoji": "🦜", "category": "animal"},
                "fish": {"emoji": "🐟", "category": "animal"},
                "whale": {"emoji": "🐳", "category": "animal"},
                "octopus": {"emoji": "🐙", "category": "animal"},
                "crab": {"emoji": "🦀", "category": "animal"},
                "starfish": {"emoji": "⭐", "category": "animal"},
                "shark": {"emoji": "🦈", "category": "animal"},
                "dolphin": {"emoji": "🐬", "category": "animal"},
                "turtle": {"emoji": "🐢", "category": "animal"},
                "rocket": {"emoji": "🚀", "category": "space"},
                "star": {"emoji": "⭐", "category": "space"},
                "moon": {"emoji": "🌙", "category": "space"},
                "planet": {"emoji": "🪐", "category": "space"},
                "sun": {"emoji": "☀️", "category": "space"},
                "astronaut": {"emoji": "👨‍🚀", "category": "space"},
                "ship": {"emoji": "🚢", "category": "vehicle"},
                "treasure": {"emoji": "💎", "category": "object"},
                "map": {"emoji": "🗺️", "category": "object"},
                "island": {"emoji": "🏝️", "category": "place"},
                "chest": {"emoji": "📦", "category": "object"},
                "sword": {"emoji": "⚔️", "category": "object"},
                "compass": {"emoji": "🧭", "category": "object"},
                "gold": {"emoji": "🪙", "category": "object"},
                "t-rex": {"emoji": "🦖", "category": "dinosaur"},
                "bone": {"emoji": "🦴", "category": "object"},
                "fossil": {"emoji": "🪨", "category": "object"},
                "big": {"emoji": "📏", "category": "adjective"},
                "hammer": {"emoji": "🔨", "category": "tool"},
                "truck": {"emoji": "🚚", "category": "vehicle"},
                "crane": {"emoji": "🏗️", "category": "vehicle"},
                "brick": {"emoji": "🧱", "category": "material"},
                "wood": {"emoji": "🪵", "category": "material"},
                "nail": {"emoji": "🔩", "category": "tool"},
                "saw": {"emoji": "🪚", "category": "tool"},
                "helmet": {"emoji": "⛑️", "category": "clothing"},
                "car": {"emoji": "🚗", "category": "vehicle"},
                "wheel": {"emoji": "🛞", "category": "object"},
                "flag": {"emoji": "🏁", "category": "object"},
                "trophy": {"emoji": "🏆", "category": "object"},
                "engine": {"emoji": "⚙️", "category": "object"},
                "tire": {"emoji": "🛞", "category": "object"},
                "fast": {"emoji": "💨", "category": "adjective"},
                "win": {"emoji": "🥇", "category": "verb"},
                "fire": {"emoji": "🔥", "category": "element"},
                "water": {"emoji": "💧", "category": "element"},
                "ladder": {"emoji": "🪜", "category": "object"},
                "hose": {"emoji": "🔫", "category": "object"},
                "boots": {"emoji": "👢", "category": "clothing"},
                "alarm": {"emoji": "🚨", "category": "object"},
                "help": {"emoji": "🆘", "category": "verb"},
                "swim": {"emoji": "🏊", "category": "verb"}
            }
        };
    },
    
    /**
     * Get all themes
     */
    getThemes() {
        return this.vocabulary?.themes || [];
    },
    
    /**
     * Get theme by ID
     */
    getTheme(themeId) {
        return this.getThemes().find(t => t.id === themeId);
    },
    
    /**
     * Get word data (emoji, etc.)
     */
    getWordData(word) {
        return this.vocabulary?.vocabulary[word] || { emoji: '❓', category: 'unknown' };
    },
    
    /**
     * Start a theme
     */
    startTheme(themeId, userType) {
        this.currentTheme = this.getTheme(themeId);
        if (!this.currentTheme) return false;
        
        this.currentActivityIndex = 0;
        this.collectedItems = [];
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        
        const activities = this.currentTheme.activities[userType];
        if (!activities || activities.length === 0) return false;
        
        this.currentActivity = activities[this.currentActivityIndex];
        this.currentItemIndex = 0;
        
        return true;
    },
    
    /**
     * Get current activity
     */
    getCurrentActivity() {
        return this.currentActivity;
    },
    
    /**
     * Get activities for current theme and user type
     */
    getActivities(userType) {
        if (!this.currentTheme) return [];
        return this.currentTheme.activities[userType] || [];
    },
    
    /**
     * Move to next activity
     */
    nextActivity(userType) {
        const activities = this.getActivities(userType);
        this.currentActivityIndex++;
        
        if (this.currentActivityIndex >= activities.length) {
            return null; // Theme completed
        }
        
        this.currentActivity = activities[this.currentActivityIndex];
        this.currentItemIndex = 0;
        return this.currentActivity;
    },
    
    /**
     * Calculate stars based on performance
     */
    calculateStars() {
        if (this.totalQuestions === 0) return 3;
        const percentage = (this.correctAnswers / this.totalQuestions) * 100;
        if (percentage >= 90) return 3;
        if (percentage >= 70) return 2;
        return 1;
    },
    
    /**
     * Render scene based on theme
     */
    renderScene(sceneArea, theme) {
        const background = theme?.background || 'default';
        
        switch (background) {
            case 'supermarket':
                return this.renderSupermarketScene(sceneArea);
            case 'kitchen':
                return this.renderKitchenScene(sceneArea);
            case 'zoo':
                return this.renderZooScene(sceneArea);
            case 'space':
                return this.renderSpaceScene(sceneArea);
            case 'island':
                return this.renderIslandScene(sceneArea);
            case 'prehistoric':
                return this.renderPrehistoricScene(sceneArea);
            case 'construction':
                return this.renderConstructionScene(sceneArea);
            case 'racetrack':
                return this.renderRacetrackScene(sceneArea);
            case 'city':
                return this.renderCityScene(sceneArea);
            case 'underwater':
                return this.renderUnderwaterScene(sceneArea);
            default:
                return this.renderDefaultScene(sceneArea);
        }
    },
    
    /**
     * Render supermarket scene
     */
    renderSupermarketScene(sceneArea) {
        sceneArea.innerHTML = `
            <div class="scene-background supermarket-scene">
                <div class="scene-sky"></div>
                <div class="scene-store">
                    <div class="store-sign">🏪 SUPERMARKET</div>
                    <div class="store-shelf" id="store-shelf">
                        <!-- Items will be added here -->
                    </div>
                </div>
                <div class="character" id="scene-character">👦</div>
                <div class="shopping-cart" id="shopping-cart">
                    🛒
                    <div class="cart-badge" id="cart-badge">0</div>
                    <div class="cart-items" id="cart-items"></div>
                </div>
            </div>
        `;
    },
    
    /**
     * Render kitchen scene
     */
    renderKitchenScene(sceneArea) {
        sceneArea.innerHTML = `
            <div class="scene-background kitchen-scene" style="background: linear-gradient(180deg, #FFF8DC 0%, #FAEBD7 100%);">
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 1.5rem; font-family: var(--font-title); color: #8B4513; margin-bottom: 15px;">
                        🍳 Kitchen 🍳
                    </div>
                    <div class="store-shelf" id="store-shelf" style="background: rgba(210, 180, 140, 0.3);">
                        <!-- Items will be added here -->
                    </div>
                    <div style="margin-top: 20px; font-size: 4rem;">
                        🥣
                    </div>
                    <div style="font-size: 0.9rem; color: #666;">Mixing Bowl</div>
                </div>
                <div class="character" id="scene-character">👨‍🍳</div>
            </div>
        `;
    },
    
    /**
     * Render zoo scene
     */
    renderZooScene(sceneArea) {
        sceneArea.innerHTML = `
            <div class="scene-background zoo-scene" style="background: linear-gradient(180deg, #87CEEB 0%, #90EE90 50%, #228B22 100%);">
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 1.5rem; font-family: var(--font-title); color: #2E8B57; margin-bottom: 15px;">
                        🦁 Safari Zoo 🐘
                    </div>
                    <div class="store-shelf" id="store-shelf" style="background: rgba(34, 139, 34, 0.2);">
                        <!-- Animals will be added here -->
                    </div>
                </div>
                <div class="character" id="scene-character">🧑‍🌾</div>
            </div>
        `;
    },
    
    /**
     * Render space scene
     */
    renderSpaceScene(sceneArea) {
        sceneArea.innerHTML = `
            <div class="scene-background space-scene" style="background: linear-gradient(180deg, #0a0a2e 0%, #1a1a4e 50%, #2a2a6e 100%);">
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 1.5rem; font-family: var(--font-title); color: #fff; margin-bottom: 15px; text-shadow: 0 0 10px #fff;">
                        🚀 Space Mission ⭐
                    </div>
                    <div style="position: absolute; top: 10%; left: 10%; font-size: 1.5rem;">⭐</div>
                    <div style="position: absolute; top: 20%; right: 15%; font-size: 1rem;">✨</div>
                    <div style="position: absolute; top: 15%; left: 50%; font-size: 2rem;">🌙</div>
                    <div class="store-shelf" id="store-shelf" style="background: rgba(255, 255, 255, 0.1);">
                        <!-- Items will be added here -->
                    </div>
                </div>
                <div class="character" id="scene-character">👨‍🚀</div>
            </div>
        `;
    },
    
    /**
     * Render island/pirate scene
     */
    renderIslandScene(sceneArea) {
        sceneArea.innerHTML = `
            <div class="scene-background island-scene" style="background: linear-gradient(180deg, #87CEEB 0%, #00CED1 50%, #F4A460 100%);">
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 1.5rem; font-family: var(--font-title); color: #8B4513; margin-bottom: 15px;">
                        🏴‍☠️ Pirate Island 🏝️
                    </div>
                    <div class="store-shelf" id="store-shelf" style="background: rgba(244, 164, 96, 0.3);">
                        <!-- Items will be added here -->
                    </div>
                </div>
                <div class="character" id="scene-character">🏴‍☠️</div>
            </div>
        `;
    },
    
    /**
     * Render prehistoric/dinosaur scene
     */
    renderPrehistoricScene(sceneArea) {
        sceneArea.innerHTML = `
            <div class="scene-background prehistoric-scene" style="background: linear-gradient(180deg, #FFA07A 0%, #DEB887 50%, #8B4513 100%);">
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 1.5rem; font-family: var(--font-title); color: #8B4513; margin-bottom: 15px;">
                        🦕 Dinosaur World 🦖
                    </div>
                    <div style="position: absolute; top: 20%; right: 10%; font-size: 2rem;">🌋</div>
                    <div class="store-shelf" id="store-shelf" style="background: rgba(139, 69, 19, 0.2);">
                        <!-- Items will be added here -->
                    </div>
                </div>
                <div class="character" id="scene-character">🔍</div>
            </div>
        `;
    },
    
    /**
     * Render construction scene
     */
    renderConstructionScene(sceneArea) {
        sceneArea.innerHTML = `
            <div class="scene-background construction-scene" style="background: linear-gradient(180deg, #87CEEB 0%, #D2691E 70%, #8B4513 100%);">
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 1.5rem; font-family: var(--font-title); color: #FF8C00; margin-bottom: 15px;">
                        🏗️ Construction Site 👷
                    </div>
                    <div class="store-shelf" id="store-shelf" style="background: rgba(210, 105, 30, 0.2);">
                        <!-- Items will be added here -->
                    </div>
                </div>
                <div class="character" id="scene-character">👷</div>
            </div>
        `;
    },
    
    /**
     * Render racetrack scene
     */
    renderRacetrackScene(sceneArea) {
        sceneArea.innerHTML = `
            <div class="scene-background racetrack-scene" style="background: linear-gradient(180deg, #87CEEB 0%, #228B22 50%, #333 100%);">
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 1.5rem; font-family: var(--font-title); color: #FF4500; margin-bottom: 15px;">
                        🏎️ Racing Day 🏁
                    </div>
                    <div class="store-shelf" id="store-shelf" style="background: rgba(50, 50, 50, 0.3);">
                        <!-- Items will be added here -->
                    </div>
                </div>
                <div class="character" id="scene-character">🏁</div>
            </div>
        `;
    },
    
    /**
     * Render city/firefighter scene
     */
    renderCityScene(sceneArea) {
        sceneArea.innerHTML = `
            <div class="scene-background city-scene" style="background: linear-gradient(180deg, #87CEEB 0%, #A9A9A9 70%, #696969 100%);">
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 1.5rem; font-family: var(--font-title); color: #DC143C; margin-bottom: 15px;">
                        🚒 Fire Station 👨‍🚒
                    </div>
                    <div style="position: absolute; top: 15%; left: 10%; font-size: 2rem;">🏢</div>
                    <div style="position: absolute; top: 20%; right: 15%; font-size: 2rem;">🏠</div>
                    <div class="store-shelf" id="store-shelf" style="background: rgba(220, 20, 60, 0.1);">
                        <!-- Items will be added here -->
                    </div>
                </div>
                <div class="character" id="scene-character">👨‍🚒</div>
            </div>
        `;
    },
    
    /**
     * Render underwater/ocean scene
     */
    renderUnderwaterScene(sceneArea) {
        sceneArea.innerHTML = `
            <div class="scene-background underwater-scene" style="background: linear-gradient(180deg, #00CED1 0%, #1E90FF 50%, #000080 100%);">
                <div style="padding: 20px; text-align: center;">
                    <div style="font-size: 1.5rem; font-family: var(--font-title); color: #00FFFF; margin-bottom: 15px; text-shadow: 0 0 10px rgba(0,0,0,0.5);">
                        🐠 Ocean Adventure 🌊
                    </div>
                    <div style="position: absolute; top: 10%; left: 15%; font-size: 1.5rem; animation: floatCloud 3s ease-in-out infinite;">💧</div>
                    <div style="position: absolute; top: 25%; right: 10%; font-size: 1.5rem; animation: floatCloud 4s ease-in-out infinite reverse;">💧</div>
                    <div class="store-shelf" id="store-shelf" style="background: rgba(0, 0, 128, 0.2);">
                        <!-- Items will be added here -->
                    </div>
                </div>
                <div class="character" id="scene-character">🤿</div>
            </div>
        `;
    },
    
    /**
     * Render default scene
     */
    renderDefaultScene(sceneArea) {
        sceneArea.innerHTML = `
            <div class="scene-background default-scene" style="background: linear-gradient(180deg, #87CEEB 0%, #98FB98 100%);">
                <div style="padding: 20px; text-align: center;">
                    <div class="store-shelf" id="store-shelf">
                        <!-- Items will be added here -->
                    </div>
                </div>
                <div class="character" id="scene-character">👦</div>
            </div>
        `;
    },
    
    /**
     * Populate shelf/scene with items
     */
    populateItems(items, onItemClick) {
        const shelf = document.getElementById('store-shelf');
        if (!shelf) return;
        
        shelf.innerHTML = '';
        
        items.forEach((item, index) => {
            const wordData = this.getWordData(item);
            const itemElement = document.createElement('div');
            itemElement.className = 'shelf-item';
            itemElement.dataset.word = item;
            itemElement.dataset.index = index;
            itemElement.innerHTML = wordData.emoji;
            itemElement.title = item;
            
            if (this.collectedItems.includes(item)) {
                itemElement.classList.add('collected');
            }
            
            itemElement.addEventListener('click', () => {
                if (!itemElement.classList.contains('collected')) {
                    onItemClick(item, itemElement);
                }
            });
            
            shelf.appendChild(itemElement);
        });
    },
    
    /**
     * Show item as collected
     */
    markItemCollected(word) {
        if (!this.collectedItems.includes(word)) {
            this.collectedItems.push(word);
        }
        
        const item = document.querySelector(`.shelf-item[data-word="${word}"]`);
        if (item) {
            item.classList.add('collected');
        }
        
        // Play collect sound
        if (typeof GameSounds !== 'undefined') {
            GameSounds.collect();
        }
        
        // Update cart
        const cartItems = document.getElementById('cart-items');
        const cartBadge = document.getElementById('cart-badge');
        if (cartItems) {
            const wordData = this.getWordData(word);
            cartItems.innerHTML += `<span>${wordData.emoji}</span>`;
        }
        if (cartBadge) {
            cartBadge.textContent = this.collectedItems.length;
        }
    },
    
    /**
     * Show correct feedback on item
     */
    showCorrectFeedback(element) {
        element.classList.add('correct');
        setTimeout(() => element.classList.remove('correct'), 500);
    },
    
    /**
     * Show wrong feedback on item
     */
    showWrongFeedback(element) {
        element.classList.add('wrong');
        setTimeout(() => element.classList.remove('wrong'), 500);
    },
    
    /**
     * Get shuffled array of items including target
     */
    getShuffledOptions(targetWord, allItems, count = 4) {
        const options = [targetWord];
        const otherItems = allItems.filter(item => item !== targetWord);
        
        // Shuffle other items
        for (let i = otherItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherItems[i], otherItems[j]] = [otherItems[j], otherItems[i]];
        }
        
        // Add items until we have enough
        while (options.length < count && otherItems.length > 0) {
            options.push(otherItems.pop());
        }
        
        // Shuffle final options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        return options;
    },
    
    /**
     * Reset scene state
     */
    reset() {
        this.currentTheme = null;
        this.currentActivity = null;
        this.currentActivityIndex = 0;
        this.currentItemIndex = 0;
        this.collectedItems = [];
        this.correctAnswers = 0;
        this.totalQuestions = 0;
    }
};

// Export for use in other modules
window.GameScenes = GameScenes;
