import { useState, useEffect, useRef } from 'react'
import './App.css'

// Rock song chord sequences
const CHORD_PROGRESSIONS = [
  ['G', 'D', 'Em', 'C'],
  ['Am', 'F', 'C', 'G'],
  ['E', 'A', 'D', 'E'],
  ['C', 'G', 'Am', 'F']
]

const TRUMP_ROCK_PHRASES = [
  "TREMENDOUS SOLO!",
  "ROCK STAR!",
  "THE BEST RIFF!",
  "YUUGE SHRED!",
  "BELIEVE ME!",
  "FANTASTIC!"
]

const POSES = ['🎸', '🤘', '🎤', '🔥']

function App() {
  const [gameState, setGameState] = useState('menu') // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [notes, setNotes] = useState([])
  const [pressedKeys, setPressedKeys] = useState(new Set())
  const [particles, setParticles] = useState([])
  const [currentPose, setCurrentPose] = useState('🎸')
  const [stageIntensity, setStageIntensity] = useState(0)

  const canvasRef = useRef(null)
  const gameLoopRef = useRef(null)
  const noteIdCounter = useRef(0)
  const particleIdCounter = useRef(0)

  const LANE_KEYS = ['a', 's', 'd', 'f']
  const CHORD_LABELS = ['G', 'D', 'E', 'C']
  const NOTE_SPEED = 4
  const HIT_ZONE_Y = 500
  const HIT_TOLERANCE = 60

  // Start game
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setCombo(0)
    setNotes([])
    setParticles([])
    setStageIntensity(0)
    noteIdCounter.current = 0
  }

  // Create hit particles
  const createHitParticles = (x, y, isGreat) => {
    const numParticles = isGreat ? 20 : 12
    const newParticles = []
    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: particleIdCounter.current++,
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 4,
        life: 1.0,
        color: isGreat ? '#FFD700' : '#FF4444',
        size: Math.random() * 6 + 2
      })
    }
    setParticles(prev => [...prev, ...newParticles])

    // Change pose and boost stage intensity on great hits
    if (isGreat) {
      setCurrentPose(POSES[Math.floor(Math.random() * POSES.length)])
      setStageIntensity(1.0)
    }
  }

  // Spawn notes randomly
  useEffect(() => {
    if (gameState !== 'playing') return

    const spawnInterval = setInterval(() => {
      const lane = Math.floor(Math.random() * 4)
      const progression = CHORD_PROGRESSIONS[Math.floor(Math.random() * CHORD_PROGRESSIONS.length)]

      const newNote = {
        id: noteIdCounter.current++,
        lane,
        y: -50,
        chord: progression[lane],
        phrase: TRUMP_ROCK_PHRASES[Math.floor(Math.random() * TRUMP_ROCK_PHRASES.length)]
      }
      setNotes(prev => [...prev, newNote])
    }, 800)

    return () => clearInterval(spawnInterval)
  }, [gameState])

  // Game loop - move notes and update particles
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      setNotes(prev => {
        const updated = prev.map(note => ({
          ...note,
          y: note.y + NOTE_SPEED
        }))

        // Remove missed notes
        let shouldGameOver = false
        const filtered = updated.filter(note => {
          if (note.y > 650) {
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
          vy: p.vy + 0.4,
          life: p.life - 0.02
        })).filter(p => p.life > 0)
      })

      // Decay stage intensity
      setStageIntensity(prev => Math.max(0, prev - 0.02))

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState])

  // Handle input
  const hitLane = (laneIndex) => {
    if (gameState !== 'playing') return

    const hitNote = notes.find(note =>
      note.lane === laneIndex &&
      Math.abs(note.y - HIT_ZONE_Y) < HIT_TOLERANCE
    )

    if (hitNote) {
      const distance = Math.abs(hitNote.y - HIT_ZONE_Y)
      const isGreat = distance < HIT_TOLERANCE / 2
      const points = isGreat ? 200 : 100

      setNotes(prev => prev.filter(n => n.id !== hitNote.id))
      setScore(prev => prev + (points * (combo + 1)))
      setCombo(prev => prev + 1)

      const laneWidth = 800 / 4
      const x = laneIndex * laneWidth + laneWidth / 2
      createHitParticles(x, HIT_ZONE_Y, isGreat)
    } else {
      setCombo(0)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return

      const key = e.key.toLowerCase()
      if (!LANE_KEYS.includes(key)) return
      if (pressedKeys.has(key)) return

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

    // Stage background with intensity
    const stageGradient = ctx.createLinearGradient(0, 0, 0, 600)
    stageGradient.addColorStop(0, `rgba(26, 0, 26, ${1 - stageIntensity * 0.3})`)
    stageGradient.addColorStop(0.5, `rgba(51, 0, 51, ${1 - stageIntensity * 0.3})`)
    stageGradient.addColorStop(1, `rgba(13, 0, 13, ${1 - stageIntensity * 0.3})`)
    ctx.fillStyle = stageGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Stage lights
    const time = Date.now() * 0.002
    for (let i = 0; i < 5; i++) {
      const x = i * 200 + 100
      const lightIntensity = 0.3 + Math.sin(time + i) * 0.2 + stageIntensity * 0.5
      const lightGradient = ctx.createRadialGradient(x, 0, 0, x, 300, 400)
      lightGradient.addColorStop(0, `rgba(255, 100, 200, ${lightIntensity})`)
      lightGradient.addColorStop(1, 'rgba(255, 100, 200, 0)')
      ctx.fillStyle = lightGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Draw lanes (guitar strings)
    const laneWidth = canvas.width / 4
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = pressedKeys.has(LANE_KEYS[i]) ? '#FFD700' : '#444'
      ctx.lineWidth = pressedKeys.has(LANE_KEYS[i]) ? 4 : 2
      ctx.strokeRect(i * laneWidth, 0, laneWidth, canvas.height)
    }

    // Hit zone (stage platform)
    const hitZoneGradient = ctx.createLinearGradient(0, HIT_ZONE_Y - HIT_TOLERANCE, 0, HIT_ZONE_Y + HIT_TOLERANCE)
    hitZoneGradient.addColorStop(0, 'rgba(255, 68, 68, 0.1)')
    hitZoneGradient.addColorStop(0.5, 'rgba(255, 68, 68, 0.3)')
    hitZoneGradient.addColorStop(1, 'rgba(255, 68, 68, 0.1)')
    ctx.fillStyle = hitZoneGradient
    ctx.fillRect(0, HIT_ZONE_Y - HIT_TOLERANCE, canvas.width, HIT_TOLERANCE * 2)

    // Draw notes (guitar picks/chords)
    notes.forEach(note => {
      const x = note.lane * laneWidth + laneWidth / 2

      // Chord circle
      ctx.fillStyle = '#FF4444'
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, note.y, 35, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Chord label
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(note.chord, x, note.y)
    })

    // Draw key prompts
    for (let i = 0; i < 4; i++) {
      const x = i * laneWidth + laneWidth / 2
      const isPressed = pressedKeys.has(LANE_KEYS[i])

      // Key background
      ctx.fillStyle = isPressed ? '#FFD700' : 'rgba(0, 0, 0, 0.7)'
      ctx.beginPath()
      ctx.arc(x, HIT_ZONE_Y, 40, 0, Math.PI * 2)
      ctx.fill()

      // Key letter
      ctx.fillStyle = isPressed ? '#000' : '#FFD700'
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(LANE_KEYS[i].toUpperCase(), x, HIT_ZONE_Y)

      // Chord label
      ctx.fillStyle = '#FFF'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(CHORD_LABELS[i], x, HIT_ZONE_Y + 60)
    }

    // Draw particles
    particles.forEach(particle => {
      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.life
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1.0

  }, [notes, pressedKeys, particles, stageIntensity])

  return (
    <div className="app">
      {gameState === 'menu' && (
        <div className="menu">
          <h1 className="title">AIR GUITAR<br/>HERO</h1>
          <div className="pose-display">{currentPose}</div>
          <p className="subtitle">Shred like a rock star!</p>
          <button className="start-button" onClick={startGame}>
            START ROCKING
          </button>
          <div className="instructions">
            <p><strong>Desktop:</strong> Use keys <span className="key-badge">A</span> <span className="key-badge">S</span> <span className="key-badge">D</span> <span className="key-badge">F</span></p>
            <p><strong>Mobile:</strong> Tap the chord buttons!</p>
            <p className="tip">💡 Perfect hits = TREMENDOUS combos!</p>
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
          <h2 className="gameover-title">ENCORE!</h2>
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
            <div className="pose-indicator">{currentPose}</div>
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

          {/* Mobile controls */}
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
                <div className="chord-label">{CHORD_LABELS[i]}</div>
                <div className="key-label">{key.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
