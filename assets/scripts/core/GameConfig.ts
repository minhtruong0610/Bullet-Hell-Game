export const GameConfig = {
    // Scene
    SCENE_NAMES: {
        MAIN: "main",
        LOBBY: "lobby",
    },

    // Map
    MAP: {
        WIDTH: 800,
        HEIGHT: 600,
    },

    // Player
    PLAYER: {
        RADIUS: 16,
        MAX_HP: 5,
        MOVE_SPEED: 220,
        DASH_SPEED: 600,
        DASH_DURATION: 0.18, // second
        DASH_COOLDOWN: 1.2, // second
        SHOOT_RANGE: 260, // px – auto-aim radius
        SHOOT_INTERVAL: 0.25, // second
        BULLET_SPEED: 480,
        BULLET_RADIUS: 6,
        BULLET_DAMAGE: 1,
        COLOR: "#4DA6FF", // blue
        BULLET_COLOR: "#00E676", // green
    },

    // Enemy Chasing
    CHASER: {
        RADIUS: 18,
        MAX_HP: 2,
        MOVE_SPEED: 130,
        CONTACT_DAMAGE: 1,
        SCORE: 10,
        COLOR: "#FF3D3D",
    },

    // Enemy Shooter
    SHOOTER: {
        RADIUS: 18,
        MAX_HP: 3,
        SHOOT_INTERVAL: 1.8, // second
        BULLET_SPEED: 260,
        BULLET_RADIUS: 8,
        BULLET_DAMAGE: 1,
        SCORE: 20,
        COLOR: "#FF7043",
        BULLET_COLOR: "#FF1744",
    },

    // Spawner
    SPAWNER: {
        INITIAL_INTERVAL: 2.0,
        MIN_INTERVAL: 0.6,
        SPEED_UP_RATE: 0.05,
        SPAWN_MARGIN: 30,
        CHASER_RATIO: 0.6,
    },

    // Game
    GAME: {
        DURATION: 60, // second
        INVINCIBLE_TIME: 1.0, // second
    },
} as const;
