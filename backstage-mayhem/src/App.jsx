import { useState, useEffect, useRef } from 'react'
import './App.css'

// Mini-game types
const MINI_GAMES = [
  { id: 'rhythm', name: 'RALLY RHYTHM', emoji: '🎸' },
  { id: 'crowd', name: 'CROWD CONTROL', emoji: '👥' },
  { id: 'heckler', name: 'HECKLER BATTLE', emoji: '🗣️' },
  { id: 'photo', name: 'PHOTO OP', emoji: '📸' }
]

const TRUMP_PHRASES = [
  "TREMENDOUS!",
  "WINNING!",
  "THE BEST!",
  "YUGE!",
  "BELIEVE ME!",
  "FANTASTIC!"
]

function App() {
  const [gameState, setGameState] = useState('menu') // 'menu', 'playing', 'gameover'
  const [currentGame, setCurrentGame] = useState(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [combo, setCombo] = useState(0)

  // Rhythm mini-game state
  const [notes, setNotes] = useState([])
  const [pressedKeys, setPressedKeys] = useState(new Set())

  // Crowd control state
  const [fans, setFans] = useState([])

  // Heckler battle state
  const [hecklers, setHecklers] = useState([])

  // Photo op state
  const [cameras, setCameras] = useState([])
  const [playerPos, setPlayerPos] = useState({ x: 400, y: 300 })

  const canvasRef = useRef(null)
  const gameLoopRef = useRef(null)
  const noteIdCounter = useRef(0)
  const fanIdCounter = useRef(0)

  const LANE_KEYS = ['d', 'f', 'j', 'k']

  // Start random mini-game
  const startGame = () => {
    const randomGame = MINI_GAMES[Math.floor(Math.random() * MINI_GAMES.length)]
    setCurrentGame(randomGame)
    setGameState('playing')
    setScore(0)
    setCombo(0)
    setTimeLeft(30)
    setNotes([])
    setFans([])
    setHecklers([])
    setCameras([])
    setPlayerPos({ x: 400, y: 300 })
  }

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameover')
          if (score > highScore) setHighScore(score)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, score, highScore])

  // === RHYTHM MINI-GAME ===
  useEffect(() => {
    if (gameState !== 'playing' || currentGame?.id !== 'rhythm') return

    const spawnInterval = setInterval(() => {
      const lane = Math.floor(Math.random() * 4)
      setNotes(prev => [...prev, {
        id: noteIdCounter.current++,
        lane,
        y: -50,
        phrase: TRUMP_PHRASES[Math.floor(Math.random() * TRUMP_PHRASES.length)]
      }])
    }, 700)

    return () => clearInterval(spawnInterval)
  }, [gameState, currentGame])

  const hitLane = (laneIndex) => {
    if (gameState !== 'playing') return
    const hitNote = notes.find(n => n.lane === laneIndex && Math.abs(n.y - 500) < 60)

    if (hitNote) {
      setNotes(prev => prev.filter(n => n.id !== hitNote.id))
      const points = 100 * (combo + 1)
      setScore(prev => prev + points)
      setCombo(prev => prev + 1)
    } else {
      setCombo(0)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing' || currentGame?.id !== 'rhythm') return
      const key = e.key.toLowerCase()
      if (!LANE_KEYS.includes(key) || pressedKeys.has(key)) return

      setPressedKeys(prev => new Set([...prev, key]))
      hitLane(LANE_KEYS.indexOf(key))
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
  }, [gameState, currentGame, notes, combo, pressedKeys])

  // === CROWD CONTROL MINI-GAME ===
  useEffect(() => {
    if (gameState !== 'playing' || currentGame?.id !== 'crowd') return

    const spawnInterval = setInterval(() => {
      const side = Math.random() > 0.5 ? 'left' : 'right'
      setFans(prev => [...prev, {
        id: fanIdCounter.current++,
        side,
        x: side === 'left' ? 0 : 800,
        y: Math.random() * 500 + 50,
        vx: side === 'left' ? 2 : -2,
        angry: false
      }])
    }, 1000)

    return () => clearInterval(spawnInterval)
  }, [gameState, currentGame])

  const tapFan = (fanId) => {
    setFans(prev => prev.filter(f => f.id !== fanId))
    setScore(prev => prev + 50)
    setCombo(prev => prev + 1)
  }

  // === HECKLER BATTLE MINI-GAME ===
  useEffect(() => {
    if (gameState !== 'playing' || currentGame?.id !== 'heckler') return

    const spawnInterval = setInterval(() => {
      setHecklers(prev => [...prev, {
        id: Math.random(),
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50,
        size: 40,
        destroyed: false
      }])
    }, 1200)

    return () => clearInterval(spawnInterval)
  }, [gameState, currentGame])

  const destroyHeckler = (id) => {
    setHecklers(prev => prev.filter(h => h.id !== id))
    setScore(prev => prev + 75)
  }

  // === PHOTO OP MINI-GAME ===
  useEffect(() => {
    if (gameState !== 'playing' || currentGame?.id !== 'photo') return

    const spawnInterval = setInterval(() => {
      setCameras(prev => [...prev, {
        id: Math.random(),
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50,
        active: true
      }])
    }, 1500)

    return () => clearInterval(spawnInterval)
  }, [gameState, currentGame])

  const collectCamera = (camera) => {
    const dist = Math.hypot(playerPos.x - camera.x, playerPos.y - camera.y)
    if (dist < 50) {
      setCameras(prev => prev.filter(c => c.id !== camera.id))
      setScore(prev => prev + 100)
    }
  }

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const loop = () => {
      // Update rhythm notes
      if (currentGame?.id === 'rhythm') {
        setNotes(prev => prev.map(n => ({ ...n, y: n.y + 3 })).filter(n => n.y < 650))
      }

      // Update crowd fans
      if (currentGame?.id === 'crowd') {
        setFans(prev => {
          const updated = prev.map(f => ({ ...f, x: f.x + f.vx }))
          const offscreen = updated.filter(f => f.x < -50 || f.x > 850)
          if (offscreen.length > 0) setCombo(0)
          return updated.filter(f => f.x >= -50 && f.x <= 850)
        })
      }

      // Check photo op collection
      if (currentGame?.id === 'photo') {
        cameras.forEach(c => collectCamera(c))
      }

      gameLoopRef.current = requestAnimationFrame(loop)
    }

    gameLoopRef.current = requestAnimationFrame(loop)
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, currentGame])

  // Render to canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || gameState !== 'playing') return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600)
    gradient.addColorStop(0, '#1a0000')
    gradient.addColorStop(0.5, '#330000')
    gradient.addColorStop(1, '#1a0000')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 600)

    // Stars background
    const time = Date.now() * 0.001
    for (let i = 0; i < 30; i++) {
      const x = (i * 83) % 800
      const y = (i * 137 + time * 15) % 600
      ctx.fillStyle = `rgba(255, 215, 0, ${0.3 + Math.sin(time + i) * 0.2})`
      ctx.fillRect(x, y, 2, 2)
    }

    // === RHYTHM GAME RENDERING ===
    if (currentGame?.id === 'rhythm') {
      const laneWidth = 800 / 4

      // Draw lanes
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = pressedKeys.has(LANE_KEYS[i]) ? '#FFD700' : '#444'
        ctx.lineWidth = 2
        ctx.strokeRect(i * laneWidth, 0, laneWidth, 600)
      }

      // Hit zone
      ctx.fillStyle = 'rgba(255, 68, 68, 0.2)'
      ctx.fillRect(0, 450, 800, 100)

      // Notes
      notes.forEach(note => {
        const x = note.lane * laneWidth + laneWidth / 2
        ctx.fillStyle = '#FF4444'
        ctx.beginPath()
        ctx.arc(x, note.y, 25, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 8px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(note.phrase, x, note.y)
      })

      // Key prompts
      for (let i = 0; i < 4; i++) {
        const x = i * laneWidth + laneWidth / 2
        ctx.fillStyle = pressedKeys.has(LANE_KEYS[i]) ? '#FFD700' : '#FFF'
        ctx.font = 'bold 36px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(LANE_KEYS[i].toUpperCase(), x, 500)
      }
    }

    // === CROWD CONTROL RENDERING ===
    if (currentGame?.id === 'crowd') {
      fans.forEach(fan => {
        ctx.fillStyle = fan.angry ? '#FF0000' : '#FFD700'
        ctx.beginPath()
        ctx.arc(fan.x, fan.y, 20, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#000'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('👤', fan.x, fan.y + 5)
      })
    }

    // === HECKLER BATTLE RENDERING ===
    if (currentGame?.id === 'heckler') {
      hecklers.forEach(h => {
        ctx.fillStyle = '#FF0000'
        ctx.fillRect(h.x - h.size / 2, h.y - h.size / 2, h.size, h.size)
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('😠', h.x, h.y + 5)
      })
    }

    // === PHOTO OP RENDERING ===
    if (currentGame?.id === 'photo') {
      // Player
      ctx.fillStyle = '#FFD700'
      ctx.beginPath()
      ctx.arc(playerPos.x, playerPos.y, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#000'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🤵', playerPos.x, playerPos.y + 8)

      // Cameras
      cameras.forEach(cam => {
        ctx.fillStyle = '#00FF00'
        ctx.beginPath()
        ctx.arc(cam.x, cam.y, 15, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#FFF'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('📸', cam.x, cam.y + 4)
      })
    }

  }, [notes, fans, hecklers, cameras, playerPos, pressedKeys, currentGame, gameState])

  // Photo op movement
  useEffect(() => {
    if (gameState !== 'playing' || currentGame?.id !== 'photo') return

    const handleKeyMove = (e) => {
      const speed = 10
      setPlayerPos(prev => {
        let { x, y } = prev
        if (e.key === 'ArrowLeft' || e.key === 'a') x -= speed
        if (e.key === 'ArrowRight' || e.key === 'd') x += speed
        if (e.key === 'ArrowUp' || e.key === 'w') y -= speed
        if (e.key === 'ArrowDown' || e.key === 's') y += speed

        x = Math.max(30, Math.min(770, x))
        y = Math.max(30, Math.min(570, y))
        return { x, y }
      })
    }

    window.addEventListener('keydown', handleKeyMove)
    return () => window.removeEventListener('keydown', handleKeyMove)
  }, [gameState, currentGame])

  return (
    <div className="app">
      {gameState === 'menu' && (
        <div className="menu">
          <h1 className="title">BACKSTAGE<br/>MAYHEM</h1>
          <p className="subtitle">Survive the chaos behind the scenes!</p>
          <button className="start-button" onClick={startGame}>
            START GAME
          </button>
          <div className="instructions">
            <p><strong>4 Random Mini-Games:</strong></p>
            <p>🎸 Rally Rhythm - Hit the notes!</p>
            <p>👥 Crowd Control - Tap the fans!</p>
            <p>🗣️ Heckler Battle - Click to destroy!</p>
            <p>📸 Photo Op - Collect cameras with WASD/Arrows!</p>
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
          <h2 className="gameover-title">TIME'S UP!</h2>
          <div className="final-stats">
            <div className="stat">
              <div className="stat-label">Final Score</div>
              <div className="stat-value">{score.toLocaleString()}</div>
            </div>
            {score > highScore && (
              <div className="new-record">🏆 NEW HIGH SCORE! 🏆</div>
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
            <div className="game-name">{currentGame?.emoji} {currentGame?.name}</div>
            <div className="score">SCORE: {score.toLocaleString()}</div>
            <div className="timer">⏱️ {timeLeft}s</div>
            {combo > 0 && <div className="combo">COMBO x{combo}!</div>}
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={(e) => {
              const rect = e.target.getBoundingClientRect()
              const x = ((e.clientX - rect.left) / rect.width) * 800
              const y = ((e.clientY - rect.top) / rect.height) * 600

              if (currentGame?.id === 'crowd') {
                fans.forEach(fan => {
                  if (Math.hypot(fan.x - x, fan.y - y) < 25) {
                    tapFan(fan.id)
                  }
                })
              }

              if (currentGame?.id === 'heckler') {
                hecklers.forEach(h => {
                  if (x >= h.x - h.size/2 && x <= h.x + h.size/2 &&
                      y >= h.y - h.size/2 && y <= h.y + h.size/2) {
                    destroyHeckler(h.id)
                  }
                })
              }
            }}
            onTouchStart={(e) => {
              e.preventDefault()
              const rect = e.target.getBoundingClientRect()
              const touch = e.touches[0]
              const x = ((touch.clientX - rect.left) / rect.width) * 800
              const y = ((touch.clientY - rect.top) / rect.height) * 600

              if (currentGame?.id === 'crowd') {
                fans.forEach(fan => {
                  if (Math.hypot(fan.x - x, fan.y - y) < 25) {
                    tapFan(fan.id)
                  }
                })
              }

              if (currentGame?.id === 'heckler') {
                hecklers.forEach(h => {
                  if (x >= h.x - h.size/2 && x <= h.x + h.size/2 &&
                      y >= h.y - h.size/2 && y <= h.y + h.size/2) {
                    destroyHeckler(h.id)
                  }
                })
              }
            }}
          />

          {/* Mobile controls for rhythm game */}
          {currentGame?.id === 'rhythm' && (
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
          )}

          {/* Mobile controls for photo op */}
          {currentGame?.id === 'photo' && (
            <div className="movement-controls">
              <button className="move-btn" onTouchStart={() => setPlayerPos(p => ({ ...p, y: Math.max(30, p.y - 20) }))}>↑</button>
              <div className="horiz-controls">
                <button className="move-btn" onTouchStart={() => setPlayerPos(p => ({ ...p, x: Math.max(30, p.x - 20) }))}>←</button>
                <button className="move-btn" onTouchStart={() => setPlayerPos(p => ({ ...p, y: Math.min(570, p.y + 20) }))}>↓</button>
                <button className="move-btn" onTouchStart={() => setPlayerPos(p => ({ ...p, x: Math.min(770, p.x + 20) }))}>→</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
