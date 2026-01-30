/**
 * Sound Effects Module - Generates sounds using Web Audio API
 * No external audio files needed!
 */

const GameSounds = {
    audioContext: null,
    enabled: true,
    musicEnabled: true,
    musicGain: null,
    musicOscillators: [],
    isMusicPlaying: false,
    
    /**
     * Initialize the audio context
     */
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🔊 Sound system initialized');
            return true;
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            return false;
        }
    },
    
    /**
     * Resume audio context (required after user interaction)
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },
    
    /**
     * Enable/disable sound effects
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    },
    
    /**
     * Enable/disable music
     */
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        if (!enabled) {
            this.stopMusic();
        }
    },
    
    /**
     * Play a simple tone
     */
    playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;
        
        this.resume();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    },
    
    /**
     * Play a sequence of tones (melody)
     */
    playMelody(notes, tempo = 200) {
        if (!this.enabled || !this.audioContext) return;
        
        notes.forEach((note, index) => {
            setTimeout(() => {
                if (note.frequency) {
                    this.playTone(note.frequency, note.duration || 0.2, note.type || 'sine', note.volume || 0.3);
                }
            }, index * tempo);
        });
    },
    
    // ==================== Sound Effects ====================
    
    /**
     * Button click sound
     */
    click() {
        this.playTone(800, 0.1, 'sine', 0.2);
    },
    
    /**
     * Correct answer sound - happy ascending melody
     */
    correct() {
        this.playMelody([
            { frequency: 523.25, duration: 0.15 },  // C5
            { frequency: 659.25, duration: 0.15 },  // E5
            { frequency: 783.99, duration: 0.3 }    // G5
        ], 100);
    },
    
    /**
     * Wrong answer sound - descending tone
     */
    wrong() {
        this.playMelody([
            { frequency: 311.13, duration: 0.2, type: 'triangle' },  // Eb4
            { frequency: 233.08, duration: 0.3, type: 'triangle' }   // Bb3
        ], 150);
    },
    
    /**
     * Item collected sound - coin-like
     */
    collect() {
        this.playMelody([
            { frequency: 987.77, duration: 0.1 },   // B5
            { frequency: 1318.51, duration: 0.2 }   // E6
        ], 80);
    },
    
    /**
     * Level complete / celebration sound
     */
    celebrate() {
        this.playMelody([
            { frequency: 523.25, duration: 0.15 },  // C5
            { frequency: 587.33, duration: 0.15 },  // D5
            { frequency: 659.25, duration: 0.15 },  // E5
            { frequency: 698.46, duration: 0.15 },  // F5
            { frequency: 783.99, duration: 0.15 },  // G5
            { frequency: 880.00, duration: 0.15 },  // A5
            { frequency: 987.77, duration: 0.15 },  // B5
            { frequency: 1046.50, duration: 0.4 }   // C6
        ], 100);
    },
    
    /**
     * Star earned sound
     */
    star() {
        this.playMelody([
            { frequency: 1046.50, duration: 0.1 },  // C6
            { frequency: 1318.51, duration: 0.1 },  // E6
            { frequency: 1567.98, duration: 0.2 }   // G6
        ], 100);
    },
    
    /**
     * Theme unlocked sound
     */
    unlock() {
        this.playMelody([
            { frequency: 392.00, duration: 0.1 },   // G4
            { frequency: 523.25, duration: 0.1 },   // C5
            { frequency: 659.25, duration: 0.1 },   // E5
            { frequency: 783.99, duration: 0.3 }    // G5
        ], 120);
    },
    
    /**
     * Word spoken sound (before TTS)
     */
    wordSpoken() {
        this.playTone(440, 0.05, 'sine', 0.1);
    },
    
    /**
     * Navigation / page transition sound
     */
    navigate() {
        this.playTone(600, 0.1, 'triangle', 0.15);
    },
    
    /**
     * Pop sound for animations
     */
    pop() {
        this.playTone(1200, 0.08, 'sine', 0.2);
    },
    
    /**
     * Whoosh sound for transitions
     */
    whoosh() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    },
    
    // ==================== Background Music ====================
    
    /**
     * Start background music (simple ambient melody)
     */
    startMusic(theme = 'default') {
        if (!this.musicEnabled || !this.audioContext || this.isMusicPlaying) return;
        
        this.resume();
        this.isMusicPlaying = true;
        
        // Create master gain for music
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = 0.1;
        this.musicGain.connect(this.audioContext.destination);
        
        // Play ambient music loop
        this.playAmbientLoop(theme);
    },
    
    /**
     * Play ambient music loop
     */
    playAmbientLoop(theme) {
        if (!this.musicEnabled || !this.isMusicPlaying) return;
        
        // Different melodies for different themes
        const melodies = {
            default: [
                { note: 'C4', duration: 800 },
                { note: 'E4', duration: 800 },
                { note: 'G4', duration: 800 },
                { note: 'E4', duration: 800 }
            ],
            adventure: [
                { note: 'G3', duration: 600 },
                { note: 'C4', duration: 600 },
                { note: 'E4', duration: 600 },
                { note: 'G4', duration: 600 },
                { note: 'E4', duration: 600 },
                { note: 'C4', duration: 600 }
            ],
            space: [
                { note: 'A3', duration: 1000 },
                { note: 'E4', duration: 1000 },
                { note: 'B3', duration: 1000 },
                { note: 'F4', duration: 1000 }
            ]
        };
        
        const noteFrequencies = {
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
        };
        
        const melody = melodies[theme] || melodies.default;
        let totalDuration = 0;
        
        melody.forEach((noteData, index) => {
            setTimeout(() => {
                if (this.isMusicPlaying && this.musicGain) {
                    const oscillator = this.audioContext.createOscillator();
                    oscillator.connect(this.musicGain);
                    oscillator.type = 'sine';
                    oscillator.frequency.value = noteFrequencies[noteData.note] || 261.63;
                    
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + (noteData.duration / 1000) * 0.9);
                    
                    this.musicOscillators.push(oscillator);
                }
            }, totalDuration);
            
            totalDuration += noteData.duration;
        });
        
        // Loop the melody
        setTimeout(() => {
            if (this.isMusicPlaying) {
                this.playAmbientLoop(theme);
            }
        }, totalDuration);
    },
    
    /**
     * Stop background music
     */
    stopMusic() {
        this.isMusicPlaying = false;
        
        // Stop all oscillators
        this.musicOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Already stopped
            }
        });
        this.musicOscillators = [];
        
        // Disconnect gain
        if (this.musicGain) {
            this.musicGain.disconnect();
            this.musicGain = null;
        }
    },
    
    /**
     * Toggle background music
     */
    toggleMusic() {
        if (this.isMusicPlaying) {
            this.stopMusic();
        } else {
            this.startMusic();
        }
        return this.isMusicPlaying;
    },
    
    /**
     * Set music volume (0-1)
     */
    setMusicVolume(volume) {
        if (this.musicGain) {
            this.musicGain.gain.value = volume;
        }
    }
};

// Export for use in other modules
window.GameSounds = GameSounds;
