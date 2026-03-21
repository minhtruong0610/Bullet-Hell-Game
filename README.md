# Bullet-Hell-Game

# Run project

## How to run:

1. Open a terminal in the build/web-desktop folder
2. Run:

npx http-server

3. Open your browser:
   http://localhost:8080

=====================#======================

# Game Flow

Startup
│
▼
reset() ──▶ buildPools → setupPlayer → spawner.start()
│
▼
update() every frame
├─ countdown timer
├─ PlayerController.update() (move + shoot + dash)
├─ EnemySpawner.update() (spawn enemies, increase rate)
├─ Enemy[].update() (AI behavior)
├─ checkCollisions()
└─ recycleBulletsOutOfBounds()
│
▼
Game End (time's up or player dies)
└─ endGame() → freeze all → dispatch GAME_OVER → UIManager show result
│
▼
Restart → UIManager dispatch GAME_RESTART → GameManager.reset()
