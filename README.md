# 🎮 English Adventure - Learn English for Kids!

An interactive English learning game designed for children ages 4-9 who are beginning to learn English. The game uses contextual learning through fun, story-based adventures.

🎮 **Play Now**: [https://nirbu0.github.io/english-learning-game/](https://nirbu0.github.io/english-learning-game/)

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
  11. 🐄 Farm Friends - Farm animals and farming
  12. 🏥 Doctor's Office - Body parts and health
  13. 🌦️ Weather Station - Weather and seasons

- **Interactive Activities**:
  - Tap-to-Learn: Tap items to hear their names
  - Find the Item: Identify objects by name
  - Collect Items: Drag items to cart/basket
  - Match Sound: Hear a word, find the picture
  - Spelling: Spell words letter by letter
  - Match Pairs: Memory-style word-picture matching

- **Text-to-Speech**: All words and instructions are spoken aloud
- **Progress Tracking**: Stars, badges, and saved progress
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge).

### Option 2: Local Server (Recommended)
For the best experience (especially for audio), run a local server:

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
│   ├── scenes.js           # Scene rendering & activities
│   ├── speech.js           # Text-to-speech
│   ├── sounds.js           # Sound effects (Web Audio API)
│   ├── storage.js          # Progress saving (localStorage)
│   ├── i18n.js             # Internationalization
│   ├── dashboard.js        # Parent dashboard
│   └── firebase-sync.js    # Cloud sync (optional)
├── data/
│   └── vocabulary.json     # All themes and vocabulary
├── assets/
│   └── samples/            # Sample custom images
├── docs/
│   └── KENNEY_INTEGRATION_GUIDE.md
└── README.md               # This file
```

---

## 🛠️ Implemented Features

### ✅ Core Game Features
- [x] **Sound effects system** - Web Audio API (no external files needed!)
- [x] **Multi-language support** - Hebrew/English instructions (Settings → Language)
- [x] **Drag-and-drop interactions** - Touch-friendly with mouse and touch support
- [x] **Match-pairs memory game** - Word-picture matching activity
- [x] **Parent/teacher dashboard** - View progress, statistics, and manage profiles
- [x] **Printable certificates** - Print achievement certificates for completed themes!
- [x] **13 Adventure Themes** - Wide variety of learning contexts
- [x] **100+ vocabulary words** - Expanded vocabulary across all categories
- [x] **Cloud sync ready** - Firebase module for cross-device progress sync
- [x] **Voice accent options** - US, UK, or Australian English voices
- [x] **Voice gender options** - Male or female voice selection

### ✅ Profile & Personalization
- [x] **✏️ Edit Profile Button** - Edit button on each user card
- [x] **Custom name input** - Kids can enter their real name (up to 15 characters)
- [x] **Avatar picker** - 16 avatar options (kids, fantasy characters, animals)
- [x] **Age selection** - Select age 4-9, affects difficulty level
- [x] **Profile persistence** - Profiles saved in localStorage

### ✅ Hint System
- [x] **💡 Hint Button** - Always visible during gameplay
- [x] **Repeats instructions** - Speaks the current instruction again
- [x] **Subtle visual hints** - Golden pulsing highlight on target items
- [x] **Activity-specific hints** - Different hint behavior for each activity type
- [x] **Non-intrusive design** - Highlights only, no pointing hands

### ✅ Reward & Motivation System  
- [x] **🎊 Confetti explosions** - Colorful confetti on achievements
- [x] **⭐ Flying star animations** - Stars fly across screen on correct answers
- [x] **🔥 Streak tracking** - Shows "X in a row!" for consecutive correct answers
- [x] **💃 Character dancing** - Character celebrates on streaks
- [x] **Star earning system** - 1-3 stars based on accuracy
- [x] **Theme unlocking** - Complete themes to unlock new ones

### ✅ Settings & Customization
- [x] **Sound effects toggle** - Enable/disable sound effects
- [x] **Background music toggle** - Enable/disable ambient music
- [x] **Speech speed control** - Slow, Normal, or Fast speech
- [x] **Voice accent selection** - US, UK, or Australian English
- [x] **Voice gender selection** - Male or Female voice
- [x] **Language selection** - English or Hebrew instructions
- [x] **Reset progress option** - Clear all data and start fresh

---

## 📋 Future Enhancements (TODO)

Below are potential improvements organized by priority and category.

---

### 🔴 High Priority - Fix & Polish

| Feature | Description | Status |
|---------|-------------|--------|
| 🔊 **Debug sound issues** | Some browsers have audio context issues | 🔧 In Progress |
| 🗣️ **Speech synthesis stability** | Fix "canceled" speech errors | 🔧 In Progress |

---

### 🟡 Medium Priority - New Features

#### 📚 Learning Enhancements

| Feature | Description | Effort |
|---------|-------------|--------|
| 🔄 **Spaced repetition** | Review words from previous themes periodically | Medium |
| 📈 **Adaptive difficulty** | Automatically adjust based on performance | Hard |
| 🎯 **Focus weak words** | Extra practice for words often missed | Medium |
| 📖 **Simple sentences** | Progress from words to "The apple is red" | Medium |
| 🔤 **Phonics mode** | Sound out letters before spelling | Medium |
| 🎧 **Listening-only mode** | Audio-only challenges without visual text | Medium |

#### 🎮 New Activity Types

| Activity | Description |
|----------|-------------|
| 🧩 **Jigsaw puzzle** | Assemble a picture, learn the word |
| 🎨 **Coloring page** | Color an item, learn its name |
| 🔢 **Counting game** | "How many apples?" (number learning) |
| 🎵 **Sing-along** | Karaoke-style word songs |
| 🏃 **Speed round** | Timed quick-fire word recognition |
| 🎭 **Story mode** | Simple interactive story with choices |

---

### 🟢 Nice to Have - Future Vision

#### 🎮 Mini-Games Between Themes
Quick bonus games to break up learning:
- **Catch falling letters** - Spell words by catching letters
- **Word bubbles** - Pop bubbles with correct words
- **Memory match** - Classic card matching game

#### 👪 Family Mode
- Multiple kids compete on same device
- Shared leaderboard between siblings
- See each other's progress and badges

#### 📱 QR Code Progress Sharing
- Parent scans QR code to see child's progress
- Shareable progress reports
- No app required for parents

#### 🎨 Draw-the-Word
- Kid draws what they hear
- Parent/game confirms the drawing
- Creative expression meets learning

#### 🏠 Real-World Challenges
- "Find something RED in your house!"
- "Take a photo of a fruit!"
- Bridge between game and real life

#### 📚 Storybook Unlocks
- Complete themes to unlock illustrated stories
- Simple sentences using learned vocabulary
- Read-along with audio support

#### 🎵 Vocabulary Songs
- Short catchy songs for word groups
- Colors song, animals song, food song
- Repetition through music

#### 🌍 Cultural Mini-Lessons
- Fun facts about English-speaking countries
- "In England, they call it a 'lorry' not a 'truck'!"
- Geography awareness

---

### 📱 Technical Improvements

| Feature | Description | Effort |
|---------|-------------|--------|
| 📲 **PWA / Offline mode** | Install as app, works without internet | Medium |
| 🔄 **Auto-save** | Save progress every few seconds | Easy |
| 📊 **Analytics** | Track which words are hardest | Medium |
| 🌐 **More languages** | Arabic, Russian, Spanish instructions | Easy |
| ♿ **Accessibility** | Screen reader support, high contrast | Medium |

---

### 🎨 Visual Improvements

| Feature | Description | Effort |
|---------|-------------|--------|
| 🌙 **Dark mode** | Easier on eyes, especially at night | Easy |
| 🎭 **Animated backgrounds** | Moving clouds, swimming fish, etc. | Medium |
| 🖼️ **Kenney.nl integration** | Replace emoji with cartoon graphics | Medium |
| ✨ **More CSS animations** | Additional hover/interaction effects | Easy |

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

See `docs/KENNEY_INTEGRATION_GUIDE.md` for detailed instructions.

---

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

---

## 🔊 Text-to-Speech Notes

- Uses the browser's built-in Web Speech API
- Works best in Chrome (Google voices)
- Speech speed can be adjusted in Settings
- Falls back gracefully if TTS is unavailable
- Some browsers require user interaction before audio can play

---

## 📱 Mobile Support

The game is fully responsive and works on:
- Desktop browsers
- Tablets (iPad, Android tablets)
- Mobile phones (touch-friendly interface)

---

## 🤝 Contributing

Contributions are welcome! Ideas for improvement:
- New themes and activities
- Better graphics and animations  
- Additional languages
- Accessibility improvements
- Bug fixes

---

## 📄 License

This project is for educational purposes. Feel free to modify and use it for your children's learning!

---

Made with ❤️ for young English learners!
