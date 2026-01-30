# 🎮 English Adventure - Learn English for Kids!

An interactive English learning game designed for children ages 4-9 who are beginning to learn English. The game uses contextual learning through fun, story-based adventures.

## ✨ Features

- **Two User Profiles**: 
  - 🧒 **Explorer** (Ages 4-5): Simple tap-to-learn, picture matching, audio-based activities
  - 👦 **Adventurer** (Ages 6-9): More complex activities including spelling, reading, and sentences

- **10 Adventure Themes**:
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

## 🛠️ Future Enhancements

Planned features:
- [ ] Drag-and-drop interactions
- [ ] Sound effects and music
- [ ] Custom image assets (Kenney.nl)
- [ ] More themes and vocabulary
- [ ] Multi-language support for instructions
- [ ] Parent/teacher dashboard
- [ ] Printable certificates

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
