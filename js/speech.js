/**
 * Speech Module - Handles text-to-speech functionality
 */

const GameSpeech = {
    synth: window.speechSynthesis,
    speaking: false,
    voices: [],
    preferredVoice: null,
    rate: 1,
    
    /**
     * Initialize speech synthesis
     */
    init() {
        // Get voices when they're loaded
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
        this.loadVoices();
        
        // Load speech rate from settings
        const settings = GameStorage.getSettings();
        this.rate = settings.speechSpeed || 1;
    },
    
    /**
     * Load available voices
     */
    loadVoices() {
        this.voices = this.synth.getVoices();
        
        // Try to find a good English voice
        // Prefer US English child-friendly voices
        const preferredVoices = [
            'Google US English',
            'Samantha', // macOS US English female
            'Alex',     // macOS US English male
            'Google UK English Female',
            'Karen',
            'Daniel'
        ];
        
        for (const name of preferredVoices) {
            const voice = this.voices.find(v => v.name.includes(name));
            if (voice) {
                this.preferredVoice = voice;
                break;
            }
        }
        
        // Fallback to first English voice
        if (!this.preferredVoice) {
            this.preferredVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
        }
    },
    
    /**
     * Set speech rate
     */
    setRate(rate) {
        this.rate = rate;
        GameStorage.saveSettings({ speechSpeed: rate });
    },
    
    /**
     * Speak text
     */
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            // Cancel any ongoing speech
            this.cancel();
            
            if (!this.synth) {
                console.warn('Speech synthesis not supported');
                resolve();
                return;
            }
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set voice
            utterance.voice = options.voice || this.preferredVoice;
            
            // Set rate (slower for kids)
            utterance.rate = options.rate || this.rate;
            
            // Set pitch (slightly higher for friendliness)
            utterance.pitch = options.pitch || 1.1;
            
            // Set volume
            utterance.volume = options.volume || 1;
            
            // Event handlers
            utterance.onstart = () => {
                this.speaking = true;
                if (options.onStart) options.onStart();
            };
            
            utterance.onend = () => {
                this.speaking = false;
                if (options.onEnd) options.onEnd();
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.speaking = false;
                console.warn('Speech error:', event);
                if (options.onError) options.onError(event);
                resolve(); // Resolve instead of reject to not break game flow
            };
            
            // Speak
            this.synth.speak(utterance);
        });
    },
    
    /**
     * Speak a word with emphasis
     */
    speakWord(word, options = {}) {
        return this.speak(word, {
            ...options,
            rate: (options.rate || this.rate) * 0.8, // Slower for individual words
            pitch: 1.2
        });
    },
    
    /**
     * Speak an instruction
     */
    speakInstruction(instruction, options = {}) {
        return this.speak(instruction, {
            ...options,
            rate: options.rate || this.rate
        });
    },
    
    /**
     * Speak encouragement
     */
    speakEncouragement(correct = true) {
        const correctPhrases = [
            'Great job!',
            'Excellent!',
            'Well done!',
            'Perfect!',
            'Amazing!',
            'You got it!',
            'Fantastic!'
        ];
        
        const wrongPhrases = [
            'Try again!',
            'Almost!',
            'Not quite!',
            'Keep trying!'
        ];
        
        const phrases = correct ? correctPhrases : wrongPhrases;
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        
        return this.speak(phrase, {
            rate: this.rate * 1.1,
            pitch: correct ? 1.3 : 1
        });
    },
    
    /**
     * Speak a number
     */
    speakNumber(number) {
        return this.speak(number.toString(), {
            rate: this.rate * 0.9
        });
    },
    
    /**
     * Cancel ongoing speech
     */
    cancel() {
        if (this.synth) {
            this.synth.cancel();
            this.speaking = false;
        }
    },
    
    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.speaking;
    },
    
    /**
     * Get available voices
     */
    getVoices() {
        return this.voices;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    GameSpeech.init();
});

// Export for use in other modules
window.GameSpeech = GameSpeech;
