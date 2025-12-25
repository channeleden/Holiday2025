import { useState, useEffect, useRef } from 'react'
import './App.css'

const TRUMP_PHRASES = [
  "TREMENDOUS!",
  "WINNING!",
  "UNBELIEVABLE!",
  "THE BEST!",
  "FANTASTIC!",
  "YUGE!"
]

function App() {
  const [gameState, setGameState] = useState('menu') // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [playerX, setPlayerX] = useState(400)
  const [tilt, setTilt] = useState(0)
  const [fans, setFans] = useState([])
  const [obstacles, setObstacles] = useState([])
  const [multiplier, setMultiplier] = useState(1)
  const [comboTimer, setComboTimer] = useState(0)
  const [particles, setParticles] = useState([])

  const canvasRef = useRef(null)
  const gameLoopRef = useRef(null)
  const keysPressed = useRef({ left: false, right: false })
  const fanIdCounter = useRef(0)
  const obstacleIdCounter = useRef(0)
  const particleIdCounter = useRef(0)

  const PLAYER_SPEED = 6
  const PLAYER_Y = 200
  const FAN_SPEED = 3
  const OBSTACLE_SPEED = 4

  // Start game
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setPlayerX(400)
    setTilt(0)
    setFans([])
    setObstacles([])
    setParticles([])
    setMultiplier(1)
    setComboTimer(0)
  }

  // Create particles
  const createParticles = (x, y, color) => {
    const newParticles = []
    for (let i = 0; i < 10; i++) {
      newParticles.push({
        id: particleIdCounter.current++,
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 3,
        life: 1.0,
        color,
        size: Math.random() * 4 + 2
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }

  // Spawn fans and obstacles
  useEffect(() => {
    if (gameState !== 'playing') return

    // Spawn fans
    const fanInterval = setInterval(() => {
      const newFan = {
        id: fanIdCounter.current++,
        x: Math.random() * 700 + 50,
        y: 650,
        type: Math.random() > 0.7 ? 'gold' : 'normal'
      }
      setFans(prev => [...prev, newFan])
    }, 1500)

    // Spawn obstacles
    const obstacleInterval = setInterval(() => {
      const newObstacle = {
        id: obstacleIdCounter.current++,
        x: Math.random() * 700 + 50,
        y: 650,
        type: Math.random() > 0.5 ? 'beer' : 'phone'
      }
      setObstacles(prev => [...prev, newObstacle])
    }, 2000)

    return () => {
      clearInterval(fanInterval)
      clearInterval(obstacleInterval)
    }
  }, [gameState])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      // Move player based on keys
      setPlayerX(prev => {
        let next = prev
        if (keysPressed.current.left) next -= PLAYER_SPEED
        if (keysPressed.current.right) next += PLAYER_SPEED
        return Math.max(50, Math.min(750, next))
      })

      // Calculate tilt based on position
      setTilt(prev => {
        const targetTilt = (playerX - 400) * 0.15
        return prev + (targetTilt - prev) * 0.1
      })

      // Move fans up
      setFans(prev => {
        const updated = prev.map(fan => ({ ...fan, y: fan.y - FAN_SPEED }))

        // Check collisions
        updated.forEach(fan => {
          const dist = Math.hypot(fan.x - playerX, fan.y - PLAYER_Y)
          if (dist < 40 && fan.y > 0) {
            const points = fan.type === 'gold' ? 100 : 50
            setScore(s => s + (points * multiplier))
            setComboTimer(2)
            setMultiplier(m => Math.min(5, m + 0.5))
            createParticles(fan.x, fan.y, fan.type === 'gold' ? '#FFD700' : '#00FF00')
            fan.y = -100 // Remove
          }
        })

        return updated.filter(fan => fan.y > -50)
      })

      // Move obstacles up
      setObstacles(prev => {
        const updated = prev.map(obs => ({ ...obs, y: obs.y - OBSTACLE_SPEED }))

        // Check collisions
        updated.forEach(obs => {
          const dist = Math.hypot(obs.x - playerX, obs.y - PLAYER_Y)
          if (dist < 40 && obs.y > 0) {
            // Hit obstacle - game over
            setGameState('gameover')
            if (score > highScore) setHighScore(score)
            createParticles(obs.x, obs.y, '#FF0000')
          }
        })

        return updated.filter(obs => obs.y > -50)
      })

      // Update combo timer
      setComboTimer(prev => {
        const next = Math.max(0, prev - 0.016)
        if (next === 0 && prev > 0) {
          setMultiplier(1)
        }
        return next
      })

      // Update particles
      setParticles(prev => {
        return prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.3,
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
  }, [gameState, playerX, score, highScore, multiplier])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return
      if (e.key === 'ArrowLeft' || e.key === 'a') keysPressed.current.left = true
      if (e.key === 'ArrowRight' || e.key === 'd') keysPressed.current.right = true
    }

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysPressed.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd') keysPressed.current.right = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState])

  // Touch controls
  useEffect(() => {
    if (gameState !== 'playing') return

    const handleTouch = (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const touchX = ((touch.clientX - rect.left) / rect.width) * 800

      setPlayerX(Math.max(50, Math.min(750, touchX)))
    }

    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('touchmove', handleTouch)
      canvas.addEventListener('touchstart', handleTouch)
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchmove', handleTouch)
        canvas.removeEventListener('touchstart', handleTouch)
      }
    }
  }, [gameState])

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 600)
    skyGradient.addColorStop(0, '#000033')
    skyGradient.addColorStop(1, '#330066')
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, 800, 600)

    // Stars
    const time = Date.now() * 0.001
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % 800
      const y = (i * 127 + time * 10) % 600
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time + i) * 0.3})`
      ctx.fillRect(x, y, 2, 2)
    }

    // Stage floor
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 550, 800, 50)

    // Crowd silhouettes
    for (let i = 0; i < 20; i++) {
      const x = i * 40 + 20
      const height = 30 + Math.sin(time + i) * 10
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(x, 580 - height / 2, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(x - 10, 580 - height, 20, height)
    }

    // Draw fans
    fans.forEach(fan => {
      ctx.fillStyle = fan.type === 'gold' ? '#FFD700' : '#00FF00'
      ctx.beginPath()
      ctx.arc(fan.x, fan.y, 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#000'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(fan.type === 'gold' ? '⭐' : '👤', fan.x, fan.y)
    })

    // Draw obstacles
    obstacles.forEach(obs => {
      ctx.fillStyle = '#FF0000'
      ctx.beginPath()
      ctx.arc(obs.x, obs.y, 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#FFF'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(obs.type === 'beer' ? '🍺' : '📱', obs.x, obs.y)
    })

    // Draw particles
    particles.forEach(particle => {
      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.life
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1.0

    // Draw player (crowd surfing character)
    ctx.save()
    ctx.translate(playerX, PLAYER_Y)
    ctx.rotate(tilt * Math.PI / 180)

    // Body
    ctx.fillStyle = '#FFD700'
    ctx.fillRect(-30, -15, 60, 30)

    // Head
    ctx.fillStyle = '#FFA500'
    ctx.beginPath()
    ctx.arc(0, -30, 20, 0, Math.PI * 2)
    ctx.fill()

    // Arms spread
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(-30, 0)
    ctx.lineTo(-50, -10)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(30, 0)
    ctx.lineTo(50, -10)
    ctx.stroke()

    // Emoji face
    ctx.fillStyle = '#000'
    ctx.font = 'bold 30px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('😎', 0, -25)

    ctx.restore()

    // HUD overlay - multiplier indicator
    if (multiplier > 1) {
      ctx.fillStyle = `rgba(255, 215, 0, ${comboTimer / 2})`
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`x${multiplier.toFixed(1)} MULTIPLIER!`, 400, 50)
    }

  }, [fans, obstacles, particles, playerX, tilt, multiplier, comboTimer])

  return (
    <div className="app">
      {gameState === 'menu' && (
        <div className="menu">
          <h1 className="title">CROWD SURFER<br/>COMMANDER</h1>
          <div className="subtitle-emoji">🏄‍♂️✨</div>
          <p className="subtitle">Ride the wave of adoration!</p>
          <button className="start-button" onClick={startGame}>
            START SURFING
          </button>
          <div className="instructions">
            <p><strong>Desktop:</strong> Use <span className="key-badge">←</span> <span className="key-badge">→</span> arrow keys or <span className="key-badge">A</span> <span className="key-badge">D</span></p>
            <p><strong>Mobile:</strong> Touch and drag to move!</p>
            <p className="tip">💡 Collect fans to build your multiplier!</p>
            <p className="tip">⚠️ Avoid beer bottles and phones!</p>
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
          <h2 className="gameover-title">WIPEOUT!</h2>
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
            SURF AGAIN
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="game">
          <div className="hud">
            <div className="score">SCORE: {score.toLocaleString()}</div>
            {multiplier > 1 && (
              <div className="multiplier">x{multiplier.toFixed(1)} COMBO!</div>
            )}
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
          />
          <div className="mobile-hint">
            Drag to move left/right
          </div>
        </div>
      )}
    </div>
  )
}

export default App
