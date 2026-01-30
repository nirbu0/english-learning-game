# 🎨 Kenney.nl Game Assets Integration Guide

This guide explains how to replace emoji with beautiful cartoon graphics from [Kenney.nl](https://kenney.nl), a free game asset provider.

## 📦 Recommended Asset Packs

Download these FREE packs from kenney.nl:

### 1. Food & Kitchen
- **[Food Kit](https://kenney.nl/assets/food-kit)** - Fruits, vegetables, dairy, baked goods
- Perfect for: Supermarket Adventure, Birthday Cake themes

### 2. Animals
- **[Animal Pack](https://kenney.nl/assets/animal-pack-redux)** - Farm and wild animals
- Perfect for: Safari Zoo, Farm Friends themes

### 3. Characters
- **[Toon Characters 1](https://kenney.nl/assets/toon-characters-1)** - Cute kid characters
- Perfect for: Player avatars, theme characters

### 4. UI & Icons
- **[Game Icons](https://kenney.nl/assets/game-icons)** - Stars, hearts, buttons
- **[UI Pack](https://kenney.nl/assets/ui-pack)** - Buttons, panels, frames
- Perfect for: Game UI elements

### 5. Backgrounds
- **[Background Elements](https://kenney.nl/assets/background-elements-redux)** - Sky, clouds, trees
- Perfect for: Scene backgrounds

## 📥 Step 1: Download Assets

1. Go to https://kenney.nl/assets
2. Click on an asset pack (e.g., "Food Kit")
3. Click the **Download** button
4. Extract the ZIP file

## 📁 Step 2: Organize Files

Create this folder structure in your project:

```
english-learning-game/
├── assets/
│   └── images/
│       ├── food/
│       │   ├── apple.png
│       │   ├── banana.png
│       │   ├── bread.png
│       │   └── ...
│       ├── animals/
│       │   ├── lion.png
│       │   ├── elephant.png
│       │   └── ...
│       ├── characters/
│       │   ├── explorer.png
│       │   └── adventurer.png
│       └── ui/
│           ├── star.png
│           └── button.png
```

## 📝 Step 3: Update vocabulary.json

Add `image` property to each vocabulary item:

```json
"apple": {
    "emoji": "🍎",
    "image": "assets/images/food/apple.png",
    "category": "food"
},
"banana": {
    "emoji": "🍌",
    "image": "assets/images/food/banana.png",
    "category": "food"
},
"lion": {
    "emoji": "🦁",
    "image": "assets/images/animals/lion.png",
    "category": "animal"
}
```

## 💻 Step 4: Update scenes.js

Modify the `getWordData` function to return images:

```javascript
getWordData(word) {
    const data = this.vocabulary[word];
    if (!data) return { emoji: '❓', category: 'unknown' };
    
    // If image exists, create an img element
    if (data.image) {
        return {
            ...data,
            display: `<img src="${data.image}" alt="${word}" class="game-image">`,
            useImage: true
        };
    }
    
    return data;
}
```

## 💻 Step 5: Update CSS

Add styles for the game images:

```css
/* Game Images from Kenney.nl */
.game-image {
    width: 64px;
    height: 64px;
    object-fit: contain;
    image-rendering: pixelated; /* For pixel art style */
    /* Or for smooth: image-rendering: smooth; */
}

/* Larger images for shelf items */
.shelf-item .game-image {
    width: 80px;
    height: 80px;
}

/* Drag items */
.drag-item .game-image {
    width: 60px;
    height: 60px;
}

/* Cart items */
.cart-item .game-image {
    width: 40px;
    height: 40px;
}

/* Theme emoji */
.theme-emoji .game-image {
    width: 60px;
    height: 60px;
}

/* User avatar */
.user-avatar .game-image {
    width: 80px;
    height: 80px;
}

/* Animation for images */
.game-image {
    transition: transform 0.2s ease;
}

.shelf-item:hover .game-image,
.drag-item:hover .game-image {
    transform: scale(1.1);
}
```

## 💻 Step 6: Update Rendering Code

In `app.js`, update how items are displayed:

```javascript
// In runCollectItemsActivity and other activity functions
shuffledItems.forEach((item) => {
    const wordData = GameScenes.getWordData(item);
    const dragItem = document.createElement('div');
    dragItem.className = 'drag-item';
    dragItem.draggable = true;
    dragItem.dataset.item = item;
    
    // Check if using image or emoji
    const displayContent = wordData.useImage 
        ? wordData.display 
        : `<span class="drag-emoji">${wordData.emoji}</span>`;
    
    dragItem.innerHTML = `
        ${displayContent}
        <span class="drag-label">${item}</span>
    `;
    
    dragContainer.appendChild(dragItem);
});
```

## 🎯 Quick Implementation

For a quick test, you can use a helper function:

```javascript
// Add to scenes.js
renderWordVisual(word) {
    const data = this.vocabulary[word];
    if (data && data.image) {
        return `<img src="${data.image}" alt="${word}" class="game-image" onerror="this.outerHTML='${data.emoji}'">`;
    }
    return data?.emoji || '❓';
}
```

This falls back to emoji if the image fails to load!

## 📋 Asset Mapping Table

| Word | Kenney Pack | File Name |
|------|-------------|-----------|
| apple | Food Kit | apple_red.png |
| banana | Food Kit | banana.png |
| bread | Food Kit | bread.png |
| milk | Food Kit | milk.png |
| cheese | Food Kit | cheese.png |
| lion | Animal Pack | lion.png |
| elephant | Animal Pack | elephant.png |
| cow | Animal Pack | cow.png |
| pig | Animal Pack | pig.png |
| car | Racing Kit | car_red.png |
| truck | Racing Kit | truck.png |

## 🔧 Troubleshooting

### Images not showing?
1. Check the file path is correct
2. Ensure the image file exists
3. Check browser console for 404 errors
4. Make sure image format is supported (PNG recommended)

### Images look blurry?
- Use `image-rendering: crisp-edges;` for pixel art
- Use higher resolution images (128x128 or 256x256)
- Ensure images are actual size, not scaled up

### Mixed emoji and images?
That's fine! The fallback system handles this gracefully. Start by replacing a few items and expand over time.

## 📄 License

All Kenney.nl assets are **CC0 (Public Domain)**. You can:
- ✅ Use them commercially
- ✅ Modify them
- ✅ Use without attribution (but it's nice to credit!)

---

## 🚀 Next Steps

1. Download 2-3 asset packs
2. Add images for one theme (e.g., Supermarket)
3. Test the integration
4. Expand to other themes

Happy creating! 🎮
