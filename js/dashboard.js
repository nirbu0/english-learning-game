/**
 * Parent/Teacher Dashboard Module
 * Progress tracking, statistics, and certificates
 */

const ParentDashboard = {
    /**
     * Show the parent dashboard modal
     */
    show() {
        // Create dashboard modal if not exists
        let modal = document.getElementById('parent-dashboard-modal');
        if (!modal) {
            modal = this.createDashboardModal();
            document.body.appendChild(modal);
        }

        // Populate with data
        this.populateData();

        // Show modal
        modal.classList.remove('hidden');
        GameSounds.click();
    },

    /**
     * Hide the dashboard
     */
    hide() {
        const modal = document.getElementById('parent-dashboard-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    /**
     * Create the dashboard modal HTML
     */
    createDashboardModal() {
        const modal = document.createElement('div');
        modal.id = 'parent-dashboard-modal';
        modal.className = 'modal hidden';

        modal.innerHTML = `
            <div class="dashboard-content">
                <div class="dashboard-header">
                    <h2>👨‍👩‍👧‍👦 Parent Dashboard</h2>
                    <button class="close-dashboard-btn" onclick="ParentDashboard.hide()">✕</button>
                </div>
                
                <div class="dashboard-tabs">
                    <button class="tab-btn active" data-tab="progress">📊 Progress</button>
                    <button class="tab-btn" data-tab="statistics">📈 Statistics</button>
                    <button class="tab-btn" data-tab="certificates">🏆 Certificates</button>
                    <button class="tab-btn" data-tab="settings">⚙️ Settings</button>
                </div>
                
                <div class="tab-content" id="progress-tab">
                    <div class="user-progress-cards" id="user-progress-cards">
                        <!-- User progress cards will be inserted here -->
                    </div>
                </div>
                
                <div class="tab-content hidden" id="statistics-tab">
                    <div class="statistics-container" id="statistics-container">
                        <!-- Statistics will be inserted here -->
                    </div>
                </div>
                
                <div class="tab-content hidden" id="certificates-tab">
                    <div class="certificates-container" id="certificates-container">
                        <!-- Certificates will be inserted here -->
                    </div>
                </div>

                <div class="tab-content hidden" id="settings-tab">
                    <div class="settings-container" id="settings-container">
                        <!-- Settings will be inserted here -->
                    </div>
                </div>
            </div>
        `;

        // Add tab switching
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                modal.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
                btn.classList.add('active');
                document.getElementById(`${btn.dataset.tab}-tab`).classList.remove('hidden');
                GameSounds.click();
            });
        });

        return modal;
    },

    /**
     * Populate dashboard with data
     */
    populateData() {
        this.populateProgress();
        this.populateStatistics();
        this.populateCertificates();
        this.populateSettings();
    },

    /**
     * Populate progress tab
     */
    populateProgress() {
        const container = document.getElementById('user-progress-cards');
        if (!container) return;

        // Get all users from storage (new multi-user system)
        const allUsers = GameStorage.getAllUsers ? GameStorage.getAllUsers() : [];
        const themes = GameScenes.getThemes();

        if (allUsers.length === 0) {
            container.innerHTML = `
                <div class="no-data" style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 4rem; margin-bottom: 15px;">👶</div>
                    <p>No users created yet. Add an Explorer or Adventurer to start tracking progress!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = allUsers.map(user => {
            const userId = user.id;
            const totalStars = user.totalStars || 0;
            // Check completed themes - a theme is complete if level 1 is completed or it's in completedThemes
            const completedThemes = themes.filter(t => {
                const progress = GameStorage.getThemeProgress(userId, t.id);
                return progress?.levels?.[1]?.completed || user.completedThemes?.includes(t.id);
            }).length;
            const ageRange = user.userType === 'explorer' ? 'Ages 4-5' : 'Ages 6-9';

            return `
                <div class="user-progress-card">
                    <div class="user-header">
                        <span class="user-avatar-large">${user.avatar}</span>
                        <div class="user-info">
                            <h3>${user.name}</h3>
                            <p>${ageRange} (${user.userType})</p>
                        </div>
                        <div class="user-total-stars">
                            <span class="star-count">${totalStars}</span>
                            <span>⭐</span>
                        </div>
                    </div>
                    
                    <div class="progress-summary">
                        <div class="progress-stat">
                            <span class="stat-value">${completedThemes}</span>
                            <span class="stat-label">Themes Completed</span>
                        </div>
                        <div class="progress-stat">
                            <span class="stat-value">${themes.length}</span>
                            <span class="stat-label">Total Themes</span>
                        </div>
                        <div class="progress-stat">
                            <span class="stat-value">${Math.round((completedThemes / themes.length) * 100)}%</span>
                            <span class="stat-label">Overall Progress</span>
                        </div>
                    </div>
                    
                    <div class="themes-progress">
                        <h4>Theme Progress</h4>
                        <div class="themes-grid-mini">
                            ${themes.map(theme => {
                const progress = GameStorage.getThemeProgress(userId, theme.id);
                return `
                                    <div class="theme-progress-item ${progress.completed ? 'completed' : ''}">
                                        <span class="theme-emoji-mini">${theme.emoji}</span>
                                        <span class="theme-stars-mini">${'⭐'.repeat(progress.stars || 0)}${'☆'.repeat(3 - (progress.stars || 0))}</span>
                                    </div>
                                `;
            }).join('')}
                        </div>
                    </div>
                    
                    <div class="user-actions">
                        <button class="btn btn-secondary btn-small migrate-user-btn" data-user-id="${userId}" data-current-type="${user.userType}">
                            ${user.userType === 'explorer' ? '⬆️ Upgrade to Adventurer' : '⬇️ Change to Explorer'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for migrate buttons
        setTimeout(() => {
            document.querySelectorAll('.migrate-user-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const userId = btn.dataset.userId;
                    const currentType = btn.dataset.currentType;
                    this.showMigrateUserModal(userId, currentType);
                });
            });
        }, 0);
    },

    /**
     * Show modal to migrate user between Explorer and Adventurer
     */
    showMigrateUserModal(userId, currentType) {
        const user = GameStorage.getUser(userId);
        if (!user) return;

        const newType = currentType === 'explorer' ? 'adventurer' : 'explorer';
        const newTypeLabel = newType === 'explorer' ? 'Explorer (Ages 4-5)' : 'Adventurer (Ages 6-9)';
        const currentTypeLabel = currentType === 'explorer' ? 'Explorer (Ages 4-5)' : 'Adventurer (Ages 6-9)';

        // Create or reuse modal
        let modal = document.getElementById('migrate-user-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'migrate-user-modal';
            modal.className = 'modal hidden';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content migrate-modal-content">
                <h2>🔄 Change User Level</h2>
                <div class="migrate-user-info">
                    <div class="migrate-avatar">${user.avatar}</div>
                    <div class="migrate-name">${user.name}</div>
                </div>
                <div class="migrate-direction">
                    <div class="migrate-from">
                        <span class="migrate-type-emoji">${currentType === 'explorer' ? '🧒' : '👦'}</span>
                        <span class="migrate-type-label">${currentTypeLabel}</span>
                    </div>
                    <div class="migrate-arrow">➡️</div>
                    <div class="migrate-to">
                        <span class="migrate-type-emoji">${newType === 'explorer' ? '🧒' : '👦'}</span>
                        <span class="migrate-type-label">${newTypeLabel}</span>
                    </div>
                </div>
                <div class="migrate-info">
                    <h4>✅ What will be kept:</h4>
                    <ul>
                        <li>⭐ ${user.totalStars || 0} stars earned</li>
                        <li>📓 ${(user.stickers || []).length} stickers collected</li>
                        <li>📊 All theme progress</li>
                    </ul>
                    <h4>🔄 What will change:</h4>
                    <ul>
                        <li>Activity difficulty level</li>
                        <li>User will appear in ${newType === 'explorer' ? 'Explorers' : 'Adventurers'} section</li>
                    </ul>
                </div>
                <div class="migrate-buttons">
                    <button class="btn btn-secondary" id="migrate-cancel-btn">Cancel</button>
                    <button class="btn btn-primary" id="migrate-confirm-btn">
                        ${newType === 'adventurer' ? '⬆️ Upgrade' : '⬇️ Change'} to ${newType === 'explorer' ? 'Explorer' : 'Adventurer'}
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('migrate-cancel-btn').addEventListener('click', () => {
            modal.classList.add('hidden');
            GameSounds.click();
        });

        document.getElementById('migrate-confirm-btn').addEventListener('click', () => {
            this.migrateUser(userId, newType);
            modal.classList.add('hidden');
            GameSounds.click();
        });

        modal.classList.remove('hidden');
        GameSounds.click();
    },

    /**
     * Migrate a user to a new type (explorer/adventurer)
     */
    migrateUser(userId, newType) {
        const user = GameStorage.getUser(userId);
        if (!user) return;

        // Update user type and age range
        const newAge = newType === 'explorer' ? Math.min(user.age || 5, 5) : Math.max(user.age || 7, 6);
        const newAgeRange = newType === 'explorer' ? 'Ages 4-5' : 'Ages 6-9';

        GameStorage.saveUser(userId, {
            userType: newType,
            age: newAge,
            ageRange: newAgeRange
        });

        // Refresh the dashboard
        this.populateProgress();
        
        // Refresh welcome screen if Game object is available
        if (typeof Game !== 'undefined' && Game.loadUserProfiles) {
            Game.loadUserProfiles();
        }

        // Show success message
        alert(`✅ ${user.name} is now ${newType === 'explorer' ? 'an Explorer' : 'an Adventurer'}! All progress and rewards have been kept.`);
    },

    /**
     * Populate statistics tab
     */
    populateStatistics() {
        const container = document.getElementById('statistics-container');
        if (!container) return;

        const allUsers = GameStorage.getAllUsers ? GameStorage.getAllUsers() : [];
        const themes = GameScenes.getThemes();

        // Calculate overall statistics
        let totalCorrectAnswers = 0;
        let totalQuestions = 0;
        let wordsLearned = new Set();
        let totalStars = 0;

        allUsers.forEach(user => {
            totalStars += user.totalStars || 0;
            const userProgress = GameStorage.getUserProgress(user.id);
            themes.forEach(theme => {
                const progress = userProgress[theme.id];
                if (progress) {
                    // Read accumulated statistics from theme progress
                    totalCorrectAnswers += progress.totalCorrectAnswers || 0;
                    totalQuestions += progress.totalQuestions || 0;
                    
                    // Collect words learned
                    if (progress.wordsLearned && Array.isArray(progress.wordsLearned)) {
                        progress.wordsLearned.forEach(w => wordsLearned.add(w));
                    }
                }
            });
        });

        const accuracy = totalQuestions > 0 ? Math.round((totalCorrectAnswers / totalQuestions) * 100) : 0;

        container.innerHTML = `
            <div class="stats-overview">
                <h3>📊 Learning Statistics</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📚</div>
                        <div class="stat-value">${wordsLearned.size}</div>
                        <div class="stat-label">Words Learned</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value">${accuracy}%</div>
                        <div class="stat-label">Accuracy</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-value">${totalCorrectAnswers}</div>
                        <div class="stat-label">Correct Answers</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${totalStars}</div>
                        <div class="stat-label">Total Stars</div>
                    </div>
                </div>
            </div>
            
            <div class="vocabulary-learned">
                <h3>📖 Vocabulary Learned</h3>
                <div class="words-cloud">
                    ${Array.from(wordsLearned).slice(0, 30).map(word => {
            const wordData = GameScenes.getWordData(word);
            return `<span class="word-tag">${wordData.emoji} ${word}</span>`;
        }).join('')}
                    ${wordsLearned.size === 0 ? '<p class="no-data">Start playing to learn words!</p>' : ''}
                </div>
            </div>
            
            <div class="learning-tips">
                <h3>💡 Learning Tips</h3>
                <ul>
                    <li>🎯 Practice consistently - 10-15 minutes daily is better than long sessions</li>
                    <li>🗣️ Encourage kids to repeat words out loud</li>
                    <li>🏆 Celebrate achievements to build confidence</li>
                    <li>🔄 Review completed themes to reinforce learning</li>
                </ul>
            </div>
        `;
    },

    /**
     * Populate certificates tab
     */
    populateCertificates() {
        const container = document.getElementById('certificates-container');
        if (!container) return;

        const allUsers = GameStorage.getAllUsers ? GameStorage.getAllUsers() : [];
        const themes = GameScenes.getThemes();

        if (allUsers.length === 0) {
            container.innerHTML = `
                <div class="certificates-intro">
                    <h3>🏆 Achievement Certificates</h3>
                    <p>Print certificates for completed themes!</p>
                </div>
                <div class="no-data" style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 4rem; margin-bottom: 15px;">🎓</div>
                    <p>No users created yet. Add an Explorer or Adventurer to start earning certificates!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="certificates-intro">
                <h3>🏆 Achievement Certificates</h3>
                <p>Print certificates for completed themes!</p>
            </div>
            
            <div class="certificates-list">
                ${allUsers.map(user => {
            // Check completed themes - a theme is complete if level 1 is completed or it's in completedThemes
            const completedThemes = themes.filter(t => {
                const progress = GameStorage.getThemeProgress(user.id, t.id);
                return progress?.levels?.[1]?.completed || user.completedThemes?.includes(t.id);
            });

            if (completedThemes.length === 0) {
                return `
                            <div class="user-certificates">
                                <h4>${user.avatar} ${user.name}</h4>
                                <p class="no-certificates">No certificates yet. Complete themes to earn certificates!</p>
                            </div>
                        `;
            }

            return `
                        <div class="user-certificates">
                            <h4>${user.avatar} ${user.name}</h4>
                            <div class="certificate-cards">
                                ${completedThemes.map(theme => {
                const progress = GameStorage.getThemeProgress(user.id, theme.id);
                return `
                                        <div class="certificate-card">
                                            <div class="cert-theme">${theme.emoji}</div>
                                            <div class="cert-name">${theme.name}</div>
                                            <div class="cert-stars">${'⭐'.repeat(progress.stars || 0)}</div>
                                            <button class="btn btn-primary btn-small" onclick="ParentDashboard.printCertificate('${user.id}', '${theme.id}')">
                                                🖨️ Print
                                            </button>
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    /**
     * Populate settings tab
     */
    populateSettings() {
        const container = document.getElementById('settings-container');
        if (!container) return;

        const settings = GameStorage.getSettings();

        container.innerHTML = `
            <div class="settings-intro">
                <h3>🛠️ Dashboard Settings & QA</h3>
                <p>Manage game settings and debug tools.</p>
            </div>
            
            <div class="setting-group">
                <div class="setting-row">
                    <div class="setting-info">
                        <label>🔓 Unlock All Content (QA Mode)</label>
                        <p class="setting-desc">Unlocks all levels and themes for testing purposes.</p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="dashboard-unlock-all" ${settings.unlockAll ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
            
            <div class="danger-zone">
                <h4>⚠️ Danger Zone</h4>
                <button class="btn btn-danger" onclick="if(confirm('Reset ALL game data? This cannot be undone.')) { GameStorage.resetAll(); location.reload(); }">
                    🗑️ Factory Reset Game
                </button>
            </div>
        `;

        // Add event listener
        setTimeout(() => {
            const toggle = document.getElementById('dashboard-unlock-all');
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    GameStorage.saveSettings({ unlockAll: e.target.checked });
                    if (GameScenes.currentTheme) {
                        alert("Settings saved. Please return to main menu or restart theme to see changes.");
                    }
                });
            }
        }, 0);
    },

    /**
     * Print a certificate
     */
    printCertificate(userId, themeId) {
        const user = GameStorage.getUser(userId);
        const theme = GameScenes.getTheme(themeId);
        const progress = GameStorage.getThemeProgress(userId, themeId);
        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Create certificate HTML
        const certWindow = window.open('', '_blank');
        certWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Certificate - ${user.name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Nunito', sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background: #f5f5f5;
                        padding: 20px;
                    }
                    .certificate {
                        width: 800px;
                        background: white;
                        border: 15px solid #FFD700;
                        border-radius: 20px;
                        padding: 50px;
                        text-align: center;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                        position: relative;
                    }
                    .certificate::before {
                        content: '';
                        position: absolute;
                        top: 10px; left: 10px; right: 10px; bottom: 10px;
                        border: 3px solid #4CAF50;
                        border-radius: 10px;
                        pointer-events: none;
                    }
                    .ribbon { font-size: 4rem; margin-bottom: 20px; }
                    .title {
                        font-family: 'Fredoka One', cursive;
                        font-size: 3rem;
                        color: #4CAF50;
                        margin-bottom: 10px;
                    }
                    .subtitle {
                        font-size: 1.5rem;
                        color: #666;
                        margin-bottom: 30px;
                    }
                    .recipient {
                        font-family: 'Fredoka One', cursive;
                        font-size: 2.5rem;
                        color: #333;
                        margin-bottom: 10px;
                    }
                    .achievement {
                        font-size: 1.3rem;
                        color: #555;
                        margin-bottom: 20px;
                    }
                    .theme-badge {
                        font-size: 5rem;
                        margin: 20px 0;
                    }
                    .theme-name {
                        font-family: 'Fredoka One', cursive;
                        font-size: 1.8rem;
                        color: #FF9800;
                        margin-bottom: 10px;
                    }
                    .stars { font-size: 3rem; margin: 20px 0; }
                    .date {
                        font-size: 1rem;
                        color: #999;
                        margin-top: 30px;
                    }
                    .footer {
                        margin-top: 20px;
                        display: flex;
                        justify-content: space-around;
                        color: #888;
                    }
                    @media print {
                        body { background: white; }
                        .certificate { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="ribbon">🎖️</div>
                    <div class="title">Certificate of Achievement</div>
                    <div class="subtitle">English Adventure Learning Game</div>
                    
                    <div class="recipient">${user.name}</div>
                    <div class="achievement">has successfully completed</div>
                    
                    <div class="theme-badge">${theme.emoji}</div>
                    <div class="theme-name">${theme.name}</div>
                    <div class="stars">${'⭐'.repeat(progress.stars)}</div>
                    
                    <div class="date">${date}</div>
                    
                    <div class="footer">
                        <span>🌟 English Adventure 🌟</span>
                    </div>
                </div>
                <script>
                    window.onload = () => window.print();
                </script>
            </body>
            </html>
        `);
        certWindow.document.close();
    }
};

// Export for global use
window.ParentDashboard = ParentDashboard;
