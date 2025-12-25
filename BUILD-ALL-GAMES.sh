#!/bin/bash

# Build all 3 games for production deployment

echo "🎮 Building all 3 games for production..."
echo ""

# Game 1
echo "🎸 Building Backstage Mayhem..."
cd backstage-mayhem
npm run build
echo "✅ Backstage Mayhem built! (see backstage-mayhem/dist/)"
echo ""

# Game 2
cd ..
echo "🎤 Building Air Guitar Hero..."
cd air-guitar-hero
npm run build
echo "✅ Air Guitar Hero built! (see air-guitar-hero/dist/)"
echo ""

# Game 3
cd ..
echo "🏄‍♂️ Building Crowd Surfer Commander..."
cd crowd-surfer-commander
npm run build
echo "✅ Crowd Surfer Commander built! (see crowd-surfer-commander/dist/)"
echo ""

echo "🎉 ALL GAMES BUILT!"
echo ""
echo "📦 Production files are in each game's 'dist' folder:"
echo "   - backstage-mayhem/dist/"
echo "   - air-guitar-hero/dist/"
echo "   - crowd-surfer-commander/dist/"
echo ""
echo "🌐 Deploy by dragging these folders to:"
echo "   - Netlify: https://app.netlify.com/drop"
echo "   - Vercel: https://vercel.com/new"
echo ""
echo "Ready to ship! 🚀"
