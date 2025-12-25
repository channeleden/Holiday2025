import { useState, useEffect, useRef } from 'react'
import './App.css'

// Game constants
const GRAVITY = 0.6
const JUMP_STRENGTH = -10
const PIPE_SPEED = 3
const PIPE_GAP = 200
const PIPE_WIDTH = 80

function App() {
  const [gameState, setGameState] = useState('menu') // 'menu', 'playing', 'gameover'
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  // Player (sister's face) state
  const [playerY, setPlayerY] = useState(250)
  const [playerVelocity, setPlayerVelocity] = useState(0)

  // Obstacles (pipes)
  const [pipes, setPipes] = useState([])

  const canvasRef = useRef(null)
  const gameLoopRef = useRef(null)
  const pipeIdCounter = useRef(0)

  const PLAYER_SIZE = 60
  const PLAYER_X = 150

  // Start game
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setPlayerY(250)
    setPlayerVelocity(0)
    setPipes([
      { id: pipeIdCounter.current++, x: 800, gapY: 250 }
    ])
  }

  // Jump (flap)
  const jump = () => {
    if (gameState === 'playing') {
      setPlayerVelocity(JUMP_STRENGTH)
    } else if (gameState === 'menu') {
      startGame()
    } else if (gameState === 'gameover') {
      startGame()
    }
  }

  // Handle input
  useEffect(() => {
    const handleClick = () => jump()
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
    }
    }
    const handleTouch = (e) => {
      e.preventDefault()
      jump()
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('touchstart', handleTouch)

    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('touchstart', handleTouch)
    }
  }, [gameState])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      // Update player physics
      setPlayerVelocity(v => v + GRAVITY)
      setPlayerY(y => {
        const newY = y + playerVelocity

        // Check ground/ceiling collision
        if (newY > 550 || newY < 0) {
          setGameState('gameover')
          if (score > highScore) setHighScore(score)
          return y
        }

        return newY
      })

      // Update pipes
      setPipes(prevPipes => {
        let newPipes = prevPipes.map(pipe => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED
        }))

        // Check collision with pipes
        newPipes.forEach(pipe => {
          if (
            PLAYER_X + PLAYER_SIZE > pipe.x &&
            PLAYER_X < pipe.x + PIPE_WIDTH &&
            (playerY < pipe.gapY - PIPE_GAP / 2 ||
             playerY + PLAYER_SIZE > pipe.gapY + PIPE_GAP / 2)
          ) {
            setGameState('gameover')
            if (score > highScore) setHighScore(score)
          }

          // Score when passing pipe
          if (pipe.x + PIPE_WIDTH < PLAYER_X && !pipe.scored) {
            pipe.scored = true
            setScore(s => s + 1)
          }
        })

        // Remove off-screen pipes
        newPipes = newPipes.filter(pipe => pipe.x > -PIPE_WIDTH)

        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 500) {
          newPipes.push({
            id: pipeIdCounter.current++,
            x: 800,
            gapY: 150 + Math.random() * 300,
            scored: false
          })
        }

        return newPipes
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, playerVelocity, playerY, score, highScore])

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600)
    gradient.addColorStop(0, '#FFE5EC')
    gradient.addColorStop(0.5, '#FFC5D9')
    gradient.addColorStop(1, '#FFB5CC')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 600)

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    for (let i = 0; i < 5; i++) {
      const x = (i * 200 + Date.now() * 0.02) % 900 - 100
      ctx.beginPath()
      ctx.arc(x, 80 + i * 40, 40, 0, Math.PI * 2)
      ctx.arc(x + 30, 80 + i * 40, 50, 0, Math.PI * 2)
      ctx.arc(x + 60, 80 + i * 40, 40, 0, Math.PI * 2)
      ctx.fill()
    }

    if (gameState === 'playing') {
      // Draw pipes (as hearts/obstacles)
      pipes.forEach(pipe => {
        ctx.fillStyle = '#FF69B4'
        ctx.strokeStyle = '#FF1493'
        ctx.lineWidth = 4

        // Top heart
        const topY = pipe.gapY - PIPE_GAP / 2
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topY)
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, topY)

        // Bottom heart
        const bottomY = pipe.gapY + PIPE_GAP / 2
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, 600 - bottomY)
        ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, 600 - bottomY)
      })

      // Draw player (sister's face or placeholder)
      ctx.fillStyle = '#FFD700'
      ctx.strokeStyle = '#FFA500'
      ctx.lineWidth = 3

      // Circle for face placeholder
      ctx.beginPath()
      ctx.arc(PLAYER_X + PLAYER_SIZE / 2, playerY + PLAYER_SIZE / 2, PLAYER_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Cute face
      ctx.fillStyle = '#333'
      // Eyes
      ctx.beginPath()
      ctx.arc(PLAYER_X + 20, playerY + 20, 4, 0, Math.PI * 2)
      ctx.arc(PLAYER_X + 40, playerY + 20, 4, 0, Math.PI * 2)
      ctx.fill()

      // Smile
      ctx.beginPath()
      ctx.arc(PLAYER_X + 30, playerY + 25, 15, 0, Math.PI)
      ctx.stroke()

      // Score
      ctx.fillStyle = '#FF1493'
      ctx.font = 'bold 40px Arial'
      ctx.fillText(score, 30, 50)
    }

  }, [gameState, playerY, pipes, score])

  return (
    <div className="app">
      {gameState === 'menu' && (
        <div className="menu overlay">
          <h1 className="title">✨ Flappy Sister ✨</h1>
          <p className="subtitle">Tap or press space to flap!</p>
          <div className="instructions">
            <p>🎮 Click, Tap, or Press SPACE to play</p>
            <p className="upload-hint">💡 Add your face at <code>/public/sister-face.png</code></p>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="gameover overlay">
          <h2 className="gameover-title">Game Over!</h2>
          <p className="final-score">Score: {score}</p>
          <p className="high-score">Best: {highScore}</p>
          <p className="retry">Tap to try again!</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
    </div>
  )
}

export default App
