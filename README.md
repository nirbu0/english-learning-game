# 🎮 English Adventure - Learn English for Kids!

An interactive English learning game designed for children ages 4-9 who are beginning to learn English. The game uses contextual learning through fun, story-based adventures.

## ✨ Features

- **Two User Profiles**: 
  - 🧒 **Explorer** (Ages 4-5): Simple tap-to-learn, picture matching, audio-based activities
  - 👦 **Adventurer** (Ages 6-9): More complex activities including spelling, reading, and sentences

- **13 Adventure Themes**:
  1. 🛒 Supermarket Adventure - Learn food vocabulary
  2. 🎂 Birthday Cake - Baking ingredients and actions
  3. 🦁 Safari Zoo - Animals and feeding
  4. 🚀 Space Mission - Space exploration vocabulary
  5. 🏴‍☠️ Pirate Treasure - Adventure and directions
  6. 🦕 Dinosaur Discovery - Prehistoric exploration
  7. 🏗️ Construction Site - Tools and building
  8. 🏎️ Racing Day - Vehicles and colors
  9. 🚒 Firefighter Hero - Emergency vocabulary
  10. 🐠 Ocean Exploration - Sea creatures
  11. 🐄 Farm Friends - Farm animals and farming **NEW!**
  12. 🏥 Doctor's Office - Body parts and health **NEW!**
  13. 🌦️ Weather Station - Weather and seasons **NEW!**

- **Interactive Activities**:
  - Tap-to-Learn: Tap items to hear their names
  - Find the Item: Identify objects by name
  - Collect Items: Put items in cart/bowl
  - Match Sound: Hear a word, find the picture
  - Spelling: Spell words letter by letter

- **Text-to-Speech**: All words and instructions are spoken aloud
- **Progress Tracking**: Stars, badges, and saved progress
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge).

### Option 2: Local Server (Recommended)
For the best experience, run a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📁 Project Structure

```
english-learning-game/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styling
├── js/
│   ├── app.js              # Main game logic
│   ├── scenes.js           # Scene rendering
│   ├── speech.js           # Text-to-speech
│   └── storage.js          # Progress saving
├── data/
│   └── vocabulary.json     # All themes and vocabulary
└── README.md               # This file
```

## 🎨 Customization

### Adding New Vocabulary
Edit `data/vocabulary.json` to add new words:

```json
"vocabulary": {
    "newword": {"emoji": "🆕", "category": "example"}
}
```

### Adding New Themes
Add a new theme object to the `themes` array in `vocabulary.json`:

```json
{
    "id": "my-theme",
    "name": "My New Theme",
    "emoji": "🌟",
    "description": "Theme description",
    "background": "default",
    "character": "👦",
    "activities": {
        "explorer": [...],
        "adventurer": [...]
    }
}
```

### Using Custom Images
To replace emoji with custom images (e.g., from Kenney.nl):

1. Download assets from [kenney.nl/assets](https://kenney.nl/assets)
2. Place images in `assets/images/`
3. Update `vocabulary.json` to reference image paths
4. Modify `scenes.js` to render images instead of emoji

## 🔊 Text-to-Speech Notes

- Uses the browser's built-in Web Speech API
- Works best in Chrome (Google voices)
- Speech speed can be adjusted in Settings
- Falls back gracefully if TTS is unavailable

## 📱 Mobile Support

The game is fully responsive and works on:
- Desktop browsers
- Tablets (iPad, Android tablets)
- Mobile phones (touch-friendly interface)

## 🛠️ All Features Implemented! ✅

- [x] **Sound effects and music** - Web Audio API (no external files needed!)
- [x] **Multi-language support** - Hebrew/English instructions (Settings → Language)
- [x] **Drag-and-drop interactions** - New activity types with touch support
- [x] **Match-pairs memory game** - Word-picture matching activity
- [x] **Parent/teacher dashboard** - View progress, statistics, and manage profiles
- [x] **Printable certificates** - Print achievement certificates for completed themes!
- [x] **13 Adventure Themes** - 3 new themes added (Farm, Doctor, Weather)
- [x] **100+ vocabulary words** - Expanded vocabulary across all categories
- [x] **Cloud sync ready** - Firebase module for cross-device progress sync

---

## ☁️ Cloud Sync Setup (Optional)

To enable progress syncing across devices using Firebase:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Realtime Database** (Build → Realtime Database)
4. Enable **Anonymous Authentication** (Build → Authentication → Sign-in methods)

### 2. Get Your Config
1. Go to Project Settings → General
2. Add a Web app
3. Copy the `firebaseConfig` object

### 3. Update the Code
1. Edit `js/firebase-sync.js`
2. Replace the placeholder config with your Firebase config

### 4. Add Firebase SDK to `index.html`
Add these scripts before the other JS files:
```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-database-compat.js"></script>
```

### 5. Initialize Cloud Sync
```javascript
// In your app initialization
CloudSync.init();
await CloudSync.signInAnonymously();

// Sync on user selection
await CloudSync.syncWithCloud('explorer');
```

---

## 🖼️ Using Custom Images (Kenney.nl)

Replace emoji with beautiful cartoon graphics:

### 1. Download Assets
Get free game assets from [kenney.nl/assets](https://kenney.nl/assets):
- **Animal Pack** - Farm and zoo animals
- **Food Kit** - Fruits, vegetables, groceries  
- **Toon Characters** - Cute character sprites
- **Game Icons** - Tools, objects, UI elements

### 2. Create Assets Directory
```
assets/
└── images/
    ├── animals/
    │   ├── cow.png
    │   ├── pig.png
    │   └── ...
    ├── food/
    │   ├── apple.png
    │   └── ...
    └── objects/
```

### 3. Update Vocabulary
In `data/vocabulary.json`, add image paths:
```json
"apple": {
    "emoji": "🍎",
    "image": "assets/images/food/apple.png",
    "category": "food"
}
```

### 4. Modify Scene Rendering
In `js/scenes.js`, update `getWordData()` to return images:
```javascript
getWordData(word) {
    const data = this.vocabulary[word];
    if (data && data.image) {
        return { ...data, display: `<img src="${data.image}" alt="${word}">` };
    }
    return data || { emoji: '❓', category: 'unknown' };
}
```

## 📄 License

This project is for educational purposes. Feel free to modify and use it for your children's learning!

## 🤝 Contributing

Contributions are welcome! Ideas for improvement:
- New themes and activities
- Better graphics and animations
- Additional languages
- Accessibility improvements

---

Made with ❤️ for young English learners!
