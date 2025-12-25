# 🎮 Quick Start Guide

## What You Have

3 complete games for Dad's Christmas gift:

1. **Backstage Mayhem** - Mini-game collection (4 different games)
2. **Air Guitar Hero** - Rhythm game with rock chords
3. **Crowd Surfer Commander** - Tilt/balance crowd surfing game

All games work on **desktop, iOS, AND Android**!

---

## ⚡ Fastest Way to Test

```bash
# Game 1
cd backstage-mayhem
npm run dev
# Opens at http://localhost:5173

# Game 2
cd ../air-guitar-hero
npm run dev
# Opens at http://localhost:5174

# Game 3
cd ../crowd-surfer-commander
npm run dev
# Opens at http://localhost:5175
```

---

## 🌐 Deploy to Web (FREE)

### Using Netlify (Easiest):

```bash
# In each game folder:
npm run build

# Then drag the 'dist' folder to netlify.com/drop
```

You'll get URLs like:
- `backstage-mayhem.netlify.app`
- `air-guitar-hero.netlify.app`
- `crowd-surfer-commander.netlify.app`

---

## 📱 Test on Your Phone

1. Start dev server: `npm run dev`
2. Find your IP address:
   - Mac: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
3. On phone, visit: `http://YOUR-IP:5173`

---

## 🎁 Ready to Gift!

Each game has:
- ✅ Mobile-friendly controls
- ✅ High score tracking
- ✅ Game over screens
- ✅ Particle effects
- ✅ Sound-ready (can add audio later)

For detailed info, see [DAD-GAMES-README.md](./DAD-GAMES-README.md)

Have fun! 🎸🎮🏄‍♂️
