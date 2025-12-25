# 🎮 Dad's Rock & Roll Christmas Games 🎸

Three awesome games built for your dad this Christmas! All games work perfectly on desktop AND mobile (both iOS and Android).

---

## 🎯 The Games

### 1. 🎸 **BACKSTAGE MAYHEM**
**Location:** `backstage-mayhem/`

A mini-game collection with 4 rotating challenges! Survive 30 seconds of backstage chaos:

- **🎸 Rally Rhythm** - Hit the notes with D, F, J, K keys
- **👥 Crowd Control** - Tap the fans before they escape
- **🗣️ Heckler Battle** - Click to destroy hecklers
- **📸 Photo Op** - Collect cameras using WASD/Arrows

**Controls:**
- Desktop: Keyboard (D/F/J/K for rhythm, WASD for movement)
- Mobile: Touch buttons + on-screen controls

---

### 2. 🎤 **AIR GUITAR HERO**
**Location:** `air-guitar-hero/`

Rock out with air guitar! Hit the chords as they fall and watch the rock star poses change:

- Dynamic stage lights that pulse with great hits
- Particle explosions on successful notes
- Animated rock poses (🎸🤘🎤🔥)
- Perfect timing = 2x points!

**Controls:**
- Desktop: A, S, D, F keys
- Mobile: Touch the chord buttons

---

### 3. 🏄‍♂️ **CROWD SURFER COMMANDER**
**Location:** `crowd-surfer-commander/`

Crowd surf and collect fans while avoiding obstacles! Build your multiplier by catching fans in a row:

- Collect regular fans (👤) for 50 points
- Collect gold star fans (⭐) for 100 points
- Avoid beer bottles (🍺) and phones (📱)
- Character tilts as you move!

**Controls:**
- Desktop: Arrow keys or A/D
- Mobile: Touch and drag to move

---

## 🚀 Quick Start

### Setup Each Game

```bash
# For each game, run these commands:
cd backstage-mayhem
npm install
npm run dev

# Then open http://localhost:5173 in your browser
```

Repeat for `air-guitar-hero` and `crowd-surfer-commander`.

---

## 📦 Building for Deployment

To create production builds that can be hosted online:

```bash
# In each game folder:
npm run build

# This creates a 'dist' folder with your game
```

---

## 🌐 Hosting Options

### Option 1: Netlify (EASIEST - Free)

1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag and drop the `dist` folder from each game
3. Get instant URLs like `backstage-mayhem.netlify.app`
4. **BONUS:** You can connect custom domains!

### Option 2: Vercel (Also Free)

```bash
# Install Vercel CLI
npm install -g vercel

# In each game folder:
vercel --prod
```

### Option 3: GitHub Pages

1. Push each game to a GitHub repo
2. Go to Settings > Pages
3. Set source to the `dist` folder
4. Get URLs like `username.github.io/backstage-mayhem`

---

## 📱 Mobile Testing

All games are fully mobile-compatible:

- ✅ Works on iOS (iPhone/iPad)
- ✅ Works on Android phones
- ✅ Touch controls automatically appear on mobile
- ✅ Prevents accidental zoom on double-tap
- ✅ Responsive layouts

Test on your phone by:
1. Running `npm run dev`
2. Finding your local IP (run `ifconfig` or `ipconfig`)
3. Opening `http://YOUR-IP:5173` on your phone

---

## 🎨 Customization Ideas

### Change Difficulty
Edit these values in each game's `App.jsx`:

**Backstage Mayhem:**
```javascript
const timeLeft = 30  // Change to 45 for easier, 20 for harder
```

**Air Guitar Hero:**
```javascript
const NOTE_SPEED = 4  // Lower = easier, higher = harder
```

**Crowd Surfer Commander:**
```javascript
const PLAYER_SPEED = 6  // Higher = easier to dodge
```

### Change Colors
Edit the `App.css` file in each game - look for color codes like `#FFD700` (gold) and change them!

---

## 🎁 Gift Presentation Ideas

1. **Host all 3 games** on Netlify and create a simple landing page
2. **Print cards** with QR codes linking to each game
3. **Create custom domain names** like `dadsrockgames.com`
4. **Record yourself** playing and send the video with the links

---

## 🛠️ Troubleshooting

### Game won't start?
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use?
```bash
# Vite will automatically try the next port (5174, 5175, etc.)
# Or specify a port:
npm run dev -- --port 3000
```

### Mobile controls not working?
- Make sure you're testing on an actual device, not desktop
- Try refreshing the page
- Check that you're not zoomed in on the page

---

## 📝 Tech Stack

- **React** - UI framework
- **Vite** - Build tool (super fast!)
- **Canvas API** - Game rendering
- **Pure JavaScript** - No complex libraries needed

---

## 🎸 Credits

Built with love for Dad's Christmas 2024!

Rock on! 🤘

---

## 📞 Need Help?

If you need to modify anything or run into issues:
1. Check the console for error messages (F12 in browser)
2. Make sure Node.js is installed: `node --version`
3. Verify you're in the right folder: `pwd` or `cd`

Merry Christmas! 🎄
