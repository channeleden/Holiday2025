#!/bin/bash

# Dad's Christmas Games - Test All Script
# This will open all 3 games at once in separate terminal windows

echo "🎮 Starting all 3 games..."
echo ""

# Game 1 - Backstage Mayhem
echo "🎸 Starting Backstage Mayhem on port 5173..."
cd backstage-mayhem && npm run dev &

# Game 2 - Air Guitar Hero
echo "🎤 Starting Air Guitar Hero on port 5174..."
cd air-guitar-hero && npm run dev &

# Game 3 - Crowd Surfer Commander
echo "🏄‍♂️ Starting Crowd Surfer Commander on port 5175..."
cd crowd-surfer-commander && npm run dev &

echo ""
echo "✅ All games starting!"
echo ""
echo "Open these URLs in your browser:"
echo "  🎸 Backstage Mayhem: http://localhost:5173"
echo "  🎤 Air Guitar Hero: http://localhost:5174"
echo "  🏄 Crowd Surfer: http://localhost:5175"
echo ""
echo "Press Ctrl+C to stop all games"
echo ""

wait
