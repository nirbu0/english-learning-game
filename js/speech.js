/**
 * Speech Module - Handles text-to-speech functionality
 */

const GameSpeech = {
    synth: window.speechSynthesis,
    speaking: false,
    voices: [],
    preferredVoice: null,
    rate: 1,
    accent: 'us',   // us, uk, au
    gender: 'female', // female, male
    voicesLoaded: false,
    voiceLoadAttempts: 0,
    maxVoiceLoadAttempts: 20, // Try for up to 10 seconds (20 * 500ms)
    
    /**
     * Initialize speech synthesis
     */
    init() {
        // Load settings first
        const settings = GameStorage.getSettings();
        this.rate = settings.speechSpeed || 1;
        this.accent = settings.voiceAccent || 'us';
        this.gender = settings.voiceGender || 'female';
        
        // Get voices when they're loaded
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                console.log('🎤 onvoiceschanged fired');
                this.loadVoices();
            };
        }
        
        // Initial load attempt
        this.loadVoices();
        
        // On Android/mobile, voices may load late - poll for them
        this.pollForVoices();
    },
    
    /**
     * Poll for voices on mobile devices where onvoiceschanged may not fire
     */
    pollForVoices() {
        if (this.voicesLoaded || this.voiceLoadAttempts >= this.maxVoiceLoadAttempts) {
            if (!this.voicesLoaded) {
                console.warn('🎤 Voice loading timed out after', this.voiceLoadAttempts, 'attempts');
            }
            return;
        }
        
        this.voiceLoadAttempts++;
        const voices = this.synth.getVoices();
        
        if (voices.length > 0) {
            console.log('🎤 Voices loaded via polling on attempt', this.voiceLoadAttempts);
            this.voices = voices;
            this.voicesLoaded = true;
            this.selectBestVoice();
        } else {
            // Keep polling
            setTimeout(() => this.pollForVoices(), 500);
        }
    },
    
    /**
     * Load available voices
     */
    loadVoices() {
        const voices = this.synth.getVoices();
        if (voices.length > 0) {
            this.voices = voices;
            this.voicesLoaded = true;
            console.log('🎤 Loaded', voices.length, 'voices');
            this.selectBestVoice();
        }
    },
    
    /**
     * Ensure voices are loaded before performing an action
     * Returns a promise that resolves when voices are available
     */
    ensureVoicesLoaded() {
        return new Promise((resolve) => {
            if (this.voices.length > 0) {
                resolve(this.voices);
                return;
            }
            
            // Try to get voices immediately
            const voices = this.synth.getVoices();
            if (voices.length > 0) {
                this.voices = voices;
                this.voicesLoaded = true;
                this.selectBestVoice();
                resolve(this.voices);
                return;
            }
            
            // Wait for voices with timeout
            let attempts = 0;
            const maxAttempts = 20;
            
            const checkVoices = () => {
                attempts++;
                const v = this.synth.getVoices();
                if (v.length > 0) {
                    this.voices = v;
                    this.voicesLoaded = true;
                    this.selectBestVoice();
                    resolve(this.voices);
                } else if (attempts < maxAttempts) {
                    setTimeout(checkVoices, 250);
                } else {
                    console.warn('🎤 Could not load voices');
                    resolve([]);
                }
            };
            
            setTimeout(checkVoices, 250);
        });
    },
    
    /**
     * Select best voice based on accent and gender preferences
     */
    selectBestVoice() {
        if (!this.voices.length) return;
        
        // Voice preferences by accent and gender
        const voicePreferences = {
            us: {
                female: ['Samantha', 'Google US English Female', 'Microsoft Zira', 'Allison', 'Ava'],
                male: ['Alex', 'Google US English Male', 'Microsoft David', 'Tom', 'Fred']
            },
            uk: {
                female: ['Kate', 'Google UK English Female', 'Microsoft Hazel', 'Serena', 'Fiona'],
                male: ['Daniel', 'Google UK English Male', 'Microsoft George', 'Oliver', 'Arthur']
            },
            au: {
                female: ['Karen', 'Google Australian English Female', 'Catherine', 'Lee'],
                male: ['Lee', 'Google Australian English Male', 'Gordon']
            }
        };
        
        const langCodes = {
            us: ['en-US', 'en_US'],
            uk: ['en-GB', 'en_GB'],
            au: ['en-AU', 'en_AU']
        };
        
        const preferred = voicePreferences[this.accent]?.[this.gender] || [];
        
        // Try to find a voice by name
        for (const name of preferred) {
            const voice = this.voices.find(v => v.name.includes(name));
            if (voice) {
                this.preferredVoice = voice;
                console.log(`🎤 Selected voice: ${voice.name} (${voice.lang})`);
                return;
            }
        }
        
        // Fallback: find by language code and gender hint in name
        const codes = langCodes[this.accent] || langCodes.us;
        const genderHints = this.gender === 'female' 
            ? ['female', 'woman', 'girl', 'zira', 'samantha', 'karen', 'kate', 'fiona']
            : ['male', 'man', 'boy', 'david', 'alex', 'daniel', 'tom', 'fred'];
        
        for (const code of codes) {
            const voicesForLang = this.voices.filter(v => v.lang === code || v.lang.startsWith(code.split('-')[0]));
            
            // Try to match gender
            for (const voice of voicesForLang) {
                const nameLower = voice.name.toLowerCase();
                if (genderHints.some(hint => nameLower.includes(hint))) {
                    this.preferredVoice = voice;
                    console.log(`🎤 Selected voice: ${voice.name} (${voice.lang})`);
                    return;
                }
            }
            
            // Just take first voice for the accent
            if (voicesForLang.length) {
                this.preferredVoice = voicesForLang[0];
                console.log(`🎤 Selected voice: ${this.preferredVoice.name} (fallback)`);
                return;
            }
        }
        
        // Ultimate fallback: any English voice
        this.preferredVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
        if (this.preferredVoice) {
            console.log(`🎤 Selected voice: ${this.preferredVoice.name} (ultimate fallback)`);
        }
    },
    
    /**
     * Set voice accent
     */
    async setAccent(accent) {
        this.accent = accent;
        GameStorage.saveSettings({ voiceAccent: accent });
        
        // Ensure voices are loaded before selecting
        await this.ensureVoicesLoaded();
        this.selectBestVoice();
        
        console.log(`🎤 Accent changed to: ${accent}, voice: ${this.preferredVoice?.name || 'none'}`);
    },
    
    /**
     * Set voice gender
     */
    async setGender(gender) {
        this.gender = gender;
        GameStorage.saveSettings({ voiceGender: gender });
        
        // Ensure voices are loaded before selecting
        await this.ensureVoicesLoaded();
        this.selectBestVoice();
        
        console.log(`🎤 Gender changed to: ${gender}, voice: ${this.preferredVoice?.name || 'none'}`);
    },
    
    /**
     * Get available voices grouped by accent
     */
    getVoicesByAccent() {
        const grouped = { us: [], uk: [], au: [], other: [] };
        
        for (const voice of this.voices) {
            if (voice.lang.includes('US') || voice.lang === 'en-US') {
                grouped.us.push(voice);
            } else if (voice.lang.includes('GB') || voice.lang === 'en-GB') {
                grouped.uk.push(voice);
            } else if (voice.lang.includes('AU') || voice.lang === 'en-AU') {
                grouped.au.push(voice);
            } else if (voice.lang.startsWith('en')) {
                grouped.other.push(voice);
            }
        }
        
        return grouped;
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
    async speak(text, options = {}) {
        // Cancel any ongoing speech
        this.cancel();
        
        if (!this.synth) {
            console.warn('Speech synthesis not supported');
            return;
        }
        
        // Ensure voices are loaded before speaking (important for Android)
        if (!this.preferredVoice && this.voices.length === 0) {
            await this.ensureVoicesLoaded();
        }
        
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set voice - use preferred voice or try to get one now
            utterance.voice = options.voice || this.preferredVoice;
            
            // Android Chrome workaround: if no voice set, try to get default English voice
            if (!utterance.voice && this.voices.length > 0) {
                utterance.voice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
            }
            
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
            
            // Android Chrome bug fix: speech can get stuck, use resume/pause trick
            // This helps when the browser has been in background
            if (this.synth.paused) {
                this.synth.resume();
            }
            
            // Speak
            this.synth.speak(utterance);
            
            // Android workaround: sometimes speech doesn't start, force with timeout
            setTimeout(() => {
                if (this.synth.pending && !this.synth.speaking) {
                    console.log('🎤 Forcing speech start (Android workaround)');
                    this.synth.pause();
                    this.synth.resume();
                }
            }, 100);
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
