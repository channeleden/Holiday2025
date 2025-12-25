import { useState, useEffect, useRef } from 'react'
import './App.css'

// Presidential quotes/phrases for the rhythm notes
const PHRASES = [
  "MAKE AMERICA GREAT",
  "TREMENDOUS",
  "WINNING",
  "THE BEST",
  "YUGE",
  "BELIEVE ME"
]

// Game configuration
const LANES = 4
const NOTE_SPEED = 3 // pixels per frame
const HIT_ZONE_Y = 550 // Y position where notes should be hit
const HIT_TOLERANCE = 50 // pixels tolerance for hitting notes

function App() {
  const [gameState, setGameState] = useState('menu') // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [notes, setNotes] = useState([])
  const [pressedKeys, setPressedKeys] = useState(new Set())
  const [particles, setParticles] = useState([])
  const canvasRef = useRef(null)
  const gameLoopRef = useRef(null)
  const noteIdCounter = useRef(0)
  const particleIdCounter = useRef(0)

  // Key mappings (D, F, J, K for 4 lanes)
  const LANE_KEYS = ['d', 'f', 'j', 'k']

  // Start game
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setCombo(0)
    setNotes([])
    setParticles([])
    noteIdCounter.current = 0
  }

  // Create hit particles
  const createHitParticles = (x, y, isGreat) => {
    const numParticles = isGreat ? 15 : 8
    const newParticles = []
    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: particleIdCounter.current++,
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        life: 1.0,
        color: isGreat ? '#FFD700' : '#FFA500'
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }

  // Spawn notes randomly
  useEffect(() => {
    if (gameState !== 'playing') return

    const spawnInterval = setInterval(() => {
      const lane = Math.floor(Math.random() * LANES)
      const newNote = {
        id: noteIdCounter.current++,
        lane,
        y: -50, // Start above screen
        phrase: PHRASES[Math.floor(Math.random() * PHRASES.length)]
      }
      setNotes(prev => [...prev, newNote])
    }, 800) // Spawn note every 800ms

    return () => clearInterval(spawnInterval)
  }, [gameState])

  // Game loop - move notes down and update particles
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      setNotes(prev => {
        const updated = prev.map(note => ({
          ...note,
          y: note.y + NOTE_SPEED
        }))

        // Remove notes that went off screen (missed) - also triggers game over
        let shouldGameOver = false
        const filtered = updated.filter(note => {
          if (note.y > 650) {
            // Missed note - reset combo and trigger game over after 3 misses
            setCombo(0)
            shouldGameOver = true
            return false
          }
          return true
        })

        if (shouldGameOver) {
          setGameState('gameover')
          if (score > highScore) setHighScore(score)
        }

        return filtered
      })

      // Update particles
      setParticles(prev => {
        return prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.3, // Gravity
          life: p.life - 0.02
        })).filter(p => p.life > 0)
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState])

  // Handle input (keyboard + touch)
  const hitLane = (laneIndex) => {
    if (gameState !== 'playing') return

    // Check if note is in hit zone
    const hitNote = notes.find(note =>
      note.lane === laneIndex &&
      Math.abs(note.y - HIT_ZONE_Y) < HIT_TOLERANCE
    )

    if (hitNote) {
      // Calculate accuracy
      const distance = Math.abs(hitNote.y - HIT_ZONE_Y)
      const isGreat = distance < HIT_TOLERANCE / 2
      const points = isGreat ? 200 : 100

      // HIT!
      setNotes(prev => prev.filter(n => n.id !== hitNote.id))
      setScore(prev => prev + (points * (combo + 1)))
      setCombo(prev => prev + 1)

      // Create particles at hit location
      const laneWidth = 800 / LANES
      const x = laneIndex * laneWidth + laneWidth / 2
      createHitParticles(x, HIT_ZONE_Y, isGreat)
    } else {
      // MISS
      setCombo(0)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return

      const key = e.key.toLowerCase()
      if (!LANE_KEYS.includes(key)) return
      if (pressedKeys.has(key)) return // Prevent key repeat

      setPressedKeys(prev => new Set([...prev, key]))

      const laneIndex = LANE_KEYS.indexOf(key)
      hitLane(laneIndex)
    }

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase()
      setPressedKeys(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, notes, combo, pressedKeys])

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600)
    gradient.addColorStop(0, '#001a33')
    gradient.addColorStop(0.5, '#002244')
    gradient.addColorStop(1, '#001a33')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw animated stars background
    const time = Date.now() * 0.001
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % 800
      const y = (i * 127 + time * 20) % 600
      const size = (i % 3) + 1
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time + i) * 0.3})`
      ctx.fillRect(x, y, size, size)
    }

    // Draw lanes
    const laneWidth = canvas.width / LANES
    for (let i = 0; i < LANES; i++) {
      ctx.strokeStyle = pressedKeys.has(LANE_KEYS[i]) ? '#FFD700' : '#2a4d69'
      ctx.lineWidth = 2
      ctx.strokeRect(i * laneWidth, 0, laneWidth, canvas.height)
    }

    // Draw hit zone
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)'
    ctx.fillRect(0, HIT_ZONE_Y - HIT_TOLERANCE, canvas.width, HIT_TOLERANCE * 2)

    // Draw notes
    notes.forEach(note => {
      const x = note.lane * laneWidth + laneWidth / 2

      // Note body
      ctx.fillStyle = '#FF4444'
      ctx.beginPath()
      ctx.arc(x, note.y, 30, 0, Math.PI * 2)
      ctx.fill()

      // Note text
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const words = note.phrase.split(' ')
      words.forEach((word, i) => {
        ctx.fillText(word, x, note.y + (i - words.length / 2 + 0.5) * 12)
      })
    })

    // Draw key prompts in hit zone
    for (let i = 0; i < LANES; i++) {
      const x = i * laneWidth + laneWidth / 2
      ctx.fillStyle = pressedKeys.has(LANE_KEYS[i]) ? '#FFD700' : '#FFFFFF'
      ctx.font = 'bold 40px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(LANE_KEYS[i].toUpperCase(), x, HIT_ZONE_Y)
    }

    // Draw particles
    particles.forEach(particle => {
      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.life
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1.0

  }, [notes, pressedKeys, particles])

  return (
    <div className="app">
      {gameState === 'menu' && (
        <div className="menu">
          <h1 className="title">PRESIDENTIAL<br/>RHYTHM HERO</h1>
          <p className="subtitle">Hit the notes to the presidential beat!</p>
          <button className="start-button" onClick={startGame}>
            START GAME
          </button>
          <div className="instructions">
            <p><strong>Desktop:</strong> Use keys <span className="key-badge">D</span> <span className="key-badge">F</span> <span className="key-badge">J</span> <span className="key-badge">K</span></p>
            <p><strong>Mobile:</strong> Tap the buttons at the bottom!</p>
            <p className="tip">💡 Hit perfect for 2x points!</p>
          </div>
          {highScore > 0 && (
            <div className="high-score-display">
              Best Score: <span>{highScore.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="menu gameover-menu">
          <h2 className="gameover-title">GAME OVER!</h2>
          <div className="final-stats">
            <div className="stat">
              <div className="stat-label">Final Score</div>
              <div className="stat-value">{score.toLocaleString()}</div>
            </div>
            {score > highScore && (
              <div className="new-record">🏆 NEW HIGH SCORE! 🏆</div>
            )}
            {highScore > 0 && score <= highScore && (
              <div className="stat">
                <div className="stat-label">Best Score</div>
                <div className="stat-value">{highScore.toLocaleString()}</div>
              </div>
            )}
          </div>
          <button className="start-button" onClick={startGame}>
            PLAY AGAIN
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="game">
          <div className="hud">
            <div className="score">SCORE: {score.toLocaleString()}</div>
            <div className="combo">
              {combo > 0 && `COMBO x${combo}!`}
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
          />

          {/* Mobile touch buttons */}
          <div className="mobile-controls">
            {LANE_KEYS.map((key, i) => (
              <button
                key={key}
                className={`lane-button ${pressedKeys.has(key) ? 'active' : ''}`}
                onTouchStart={(e) => {
                  e.preventDefault()
                  setPressedKeys(prev => new Set([...prev, key]))
                  hitLane(i)
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  setPressedKeys(prev => {
                    const next = new Set(prev)
                    next.delete(key)
                    return next
                  })
                }}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App