/**
 * Firebase Cloud Sync Module
 * Syncs user progress across devices using Firebase Realtime Database
 */

const CloudSync = {
    // Firebase configuration - Replace with your own Firebase project config
    firebaseConfig: {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        databaseURL: "https://YOUR_PROJECT.firebaseio.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    },
    
    isInitialized: false,
    isEnabled: false,
    database: null,
    currentUserId: null,
    syncListeners: [],
    
    /**
     * Initialize Firebase
     * Call this after including Firebase SDK scripts
     */
    init() {
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK not loaded. Cloud sync disabled.');
            this.isEnabled = false;
            return false;
        }
        
        // Check if config is set
        if (this.firebaseConfig.apiKey === 'YOUR_API_KEY') {
            console.warn('⚠️ Firebase not configured. Please update firebaseConfig in firebase-sync.js');
            this.isEnabled = false;
            return false;
        }
        
        try {
            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }
            
            this.database = firebase.database();
            this.isInitialized = true;
            this.isEnabled = true;
            
            console.log('☁️ Firebase Cloud Sync initialized!');
            
            // Set up auth state listener
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.currentUserId = user.uid;
                    this.startSyncListeners();
                    console.log('☁️ Signed in:', user.uid);
                } else {
                    this.currentUserId = null;
                    this.stopSyncListeners();
                }
            });
            
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.isEnabled = false;
            return false;
        }
    },
    
    /**
     * Sign in anonymously (for easy setup without email/password)
     */
    async signInAnonymously() {
        if (!this.isInitialized) return null;
        
        try {
            const result = await firebase.auth().signInAnonymously();
            return result.user;
        } catch (error) {
            console.error('Sign in error:', error);
            return null;
        }
    },
    
    /**
     * Sign in with device ID (generates consistent ID per device)
     */
    async signInWithDeviceId() {
        if (!this.isInitialized) return null;
        
        // Get or generate device ID
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device_id', deviceId);
        }
        
        // Use custom token or anonymous sign in
        return this.signInAnonymously();
    },
    
    /**
     * Sign out
     */
    async signOut() {
        if (!this.isInitialized) return;
        
        try {
            await firebase.auth().signOut();
            this.currentUserId = null;
        } catch (error) {
            console.error('Sign out error:', error);
        }
    },
    
    /**
     * Get user's cloud data path
     */
    getUserPath(profileId = null) {
        if (!this.currentUserId) return null;
        if (profileId) {
            return `users/${this.currentUserId}/profiles/${profileId}`;
        }
        return `users/${this.currentUserId}`;
    },
    
    /**
     * Save user progress to cloud
     */
    async saveProgress(profileId, progressData) {
        if (!this.isEnabled || !this.currentUserId) {
            console.log('Cloud sync disabled or not signed in');
            return false;
        }
        
        try {
            const path = this.getUserPath(profileId);
            await this.database.ref(path).set({
                ...progressData,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP,
                deviceId: localStorage.getItem('device_id')
            });
            
            console.log('☁️ Progress saved to cloud');
            return true;
        } catch (error) {
            console.error('Cloud save error:', error);
            return false;
        }
    },
    
    /**
     * Load user progress from cloud
     */
    async loadProgress(profileId) {
        if (!this.isEnabled || !this.currentUserId) {
            return null;
        }
        
        try {
            const path = this.getUserPath(profileId);
            const snapshot = await this.database.ref(path).once('value');
            
            if (snapshot.exists()) {
                console.log('☁️ Progress loaded from cloud');
                return snapshot.val();
            }
            
            return null;
        } catch (error) {
            console.error('Cloud load error:', error);
            return null;
        }
    },
    
    /**
     * Sync local storage with cloud (merge strategy)
     */
    async syncWithCloud(profileId) {
        if (!this.isEnabled) return;
        
        try {
            // Get local data
            const localData = GameStorage.getUser(profileId);
            
            // Get cloud data
            const cloudData = await this.loadProgress(profileId);
            
            if (!cloudData) {
                // No cloud data, upload local
                await this.saveProgress(profileId, localData);
                return localData;
            }
            
            // Compare and merge (cloud wins for stars, local wins for recent activity)
            const merged = this.mergeData(localData, cloudData);
            
            // Save merged data to both
            GameStorage.saveUser(profileId, merged);
            await this.saveProgress(profileId, merged);
            
            console.log('☁️ Sync complete');
            return merged;
        } catch (error) {
            console.error('Sync error:', error);
            return null;
        }
    },
    
    /**
     * Merge local and cloud data (keeps highest stars)
     */
    mergeData(local, cloud) {
        const merged = { ...local };
        
        // Merge total stars (keep highest)
        merged.totalStars = Math.max(
            local.totalStars || 0,
            cloud.totalStars || 0
        );
        
        // Merge theme progress
        if (cloud.themeProgress) {
            merged.themeProgress = merged.themeProgress || {};
            
            for (const themeId in cloud.themeProgress) {
                const localTheme = local.themeProgress?.[themeId] || {};
                const cloudTheme = cloud.themeProgress[themeId];
                
                merged.themeProgress[themeId] = {
                    completed: localTheme.completed || cloudTheme.completed,
                    stars: Math.max(localTheme.stars || 0, cloudTheme.stars || 0),
                    currentActivity: Math.max(localTheme.currentActivity || 0, cloudTheme.currentActivity || 0)
                };
            }
        }
        
        // Merge completed themes
        const completedSet = new Set([
            ...(local.completedThemes || []),
            ...(cloud.completedThemes || [])
        ]);
        merged.completedThemes = Array.from(completedSet);
        
        return merged;
    },
    
    /**
     * Start real-time sync listeners
     */
    startSyncListeners() {
        if (!this.isEnabled || !this.currentUserId) return;
        
        // Listen for changes to user data
        const userRef = this.database.ref(this.getUserPath());
        
        const listener = userRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const cloudData = snapshot.val();
                this.notifyListeners('sync', cloudData);
            }
        });
        
        this.syncListeners.push({ ref: userRef, listener });
    },
    
    /**
     * Stop real-time sync listeners
     */
    stopSyncListeners() {
        this.syncListeners.forEach(({ ref, listener }) => {
            ref.off('value', listener);
        });
        this.syncListeners = [];
    },
    
    /**
     * Add sync event listener
     */
    onSync(callback) {
        this.syncCallbacks = this.syncCallbacks || [];
        this.syncCallbacks.push(callback);
    },
    
    /**
     * Notify listeners of sync events
     */
    notifyListeners(event, data) {
        if (this.syncCallbacks) {
            this.syncCallbacks.forEach(cb => cb(event, data));
        }
    },
    
    /**
     * Check if cloud sync is available
     */
    isAvailable() {
        return this.isEnabled && this.isInitialized && this.currentUserId;
    },
    
    /**
     * Get sync status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            enabled: this.isEnabled,
            signedIn: !!this.currentUserId,
            userId: this.currentUserId
        };
    }
};

// Export for global use
window.CloudSync = CloudSync;

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Create a Firebase project at https://console.firebase.google.com/
 * 
 * 2. Enable Realtime Database:
 *    - Go to Build > Realtime Database
 *    - Create database (start in test mode for development)
 * 
 * 3. Enable Anonymous Authentication:
 *    - Go to Build > Authentication
 *    - Enable Anonymous sign-in method
 * 
 * 4. Get your config:
 *    - Go to Project Settings > General
 *    - Scroll to "Your apps" > Web app
 *    - Copy the firebaseConfig object
 * 
 * 5. Update this file:
 *    - Replace the firebaseConfig values with your own
 * 
 * 6. Add Firebase SDK to index.html (before this script):
 *    <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js"></script>
 *    <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-auth-compat.js"></script>
 *    <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-database-compat.js"></script>
 * 
 * 7. Initialize in your app:
 *    CloudSync.init();
 *    await CloudSync.signInAnonymously();
 * 
 * 8. Use sync:
 *    // Save progress
 *    CloudSync.saveProgress('explorer', userData);
 *    
 *    // Load progress
 *    const data = await CloudSync.loadProgress('explorer');
 *    
 *    // Full sync
 *    await CloudSync.syncWithCloud('explorer');
 * 
 * SECURITY RULES for Realtime Database (set in Firebase Console):
 * {
 *   "rules": {
 *     "users": {
 *       "$uid": {
 *         ".read": "$uid === auth.uid",
 *         ".write": "$uid === auth.uid"
 *       }
 *     }
 *   }
 * }
 */
