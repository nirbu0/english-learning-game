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
    },
    
    /**
     * Populate progress tab
     */
    populateProgress() {
        const container = document.getElementById('user-progress-cards');
        if (!container) return;
        
        const users = ['explorer', 'adventurer'];
        const themes = GameScenes.getThemes();
        
        container.innerHTML = users.map(userId => {
            const user = GameStorage.getUser(userId);
            const totalStars = GameStorage.getTotalStars(userId);
            const completedThemes = themes.filter(t => 
                GameStorage.getThemeProgress(userId, t.id).completed
            ).length;
            
            return `
                <div class="user-progress-card">
                    <div class="user-header">
                        <span class="user-avatar-large">${user.avatar}</span>
                        <div class="user-info">
                            <h3>${user.name}</h3>
                            <p>${user.ageRange}</p>
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
                </div>
            `;
        }).join('');
    },
    
    /**
     * Populate statistics tab
     */
    populateStatistics() {
        const container = document.getElementById('statistics-container');
        if (!container) return;
        
        const users = ['explorer', 'adventurer'];
        const themes = GameScenes.getThemes();
        
        // Calculate overall statistics
        let totalPlayTime = 0;
        let totalCorrectAnswers = 0;
        let totalQuestions = 0;
        let wordsLearned = new Set();
        
        users.forEach(userId => {
            const userProgress = GameStorage.getUserProgress(userId);
            themes.forEach(theme => {
                const progress = userProgress[theme.id];
                if (progress) {
                    totalCorrectAnswers += progress.correctAnswers || 0;
                    totalQuestions += progress.totalQuestions || 0;
                    if (progress.wordsLearned) {
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
                        <div class="stat-value">${GameStorage.getTotalStars('explorer') + GameStorage.getTotalStars('adventurer')}</div>
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
        
        const users = ['explorer', 'adventurer'];
        const themes = GameScenes.getThemes();
        
        container.innerHTML = `
            <div class="certificates-intro">
                <h3>🏆 Achievement Certificates</h3>
                <p>Print certificates for completed themes!</p>
            </div>
            
            <div class="certificates-list">
                ${users.map(userId => {
                    const user = GameStorage.getUser(userId);
                    const completedThemes = themes.filter(t => 
                        GameStorage.getThemeProgress(userId, t.id).completed
                    );
                    
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
                                    const progress = GameStorage.getThemeProgress(userId, theme.id);
                                    return `
                                        <div class="certificate-card">
                                            <div class="cert-theme">${theme.emoji}</div>
                                            <div class="cert-name">${theme.name}</div>
                                            <div class="cert-stars">${'⭐'.repeat(progress.stars)}</div>
                                            <button class="btn btn-primary btn-small" onclick="ParentDashboard.printCertificate('${userId}', '${theme.id}')">
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
