import { _decorator, Component, Vec3 } from "cc";
import { GameConfig } from "../core/GameConfig";
import ViewController from "../extensions/ViewController";

const { ccclass } = _decorator;
const cfg = GameConfig.SPAWNER;
const map = GameConfig.MAP;

export type SpawnEnemyFn = (pos: Vec3, type: "chaser" | "shooter") => void;

@ccclass("EnemySpawner")
export class EnemySpawner extends ViewController {
    private _timer: number = 0;
    private _interval: number = cfg.INITIAL_INTERVAL;
    private _running: boolean = false;
    private spawnFn: SpawnEnemyFn | null = null;

    startSpawning(fn: SpawnEnemyFn): void {
        this.spawnFn = fn;
        this._running = true;
        this._timer = 0;
        this._interval = cfg.INITIAL_INTERVAL;
    }

    stop(): void {
        this._running = false;
    }

    update(dt: number): void {
        if (!this._running) return;

        // Increase the difficulty
        this._interval = Math.max(cfg.MIN_INTERVAL, this._interval - cfg.SPEED_UP_RATE * dt);

        this._timer += dt;
        if (this._timer >= this._interval) {
            this._timer = 0;
            this._doSpawn();
        }
    }

    private _doSpawn(): void {
        const pos = this.randomEdgePos();
        const type = Math.random() < cfg.CHASER_RATIO ? "chaser" : "shooter";
        this.spawnFn?.(pos, type);
    }

    // Choose a random location on the four edges of the map
    private randomEdgePos(): Vec3 {
        const hw = map.WIDTH / 2 - cfg.SPAWN_MARGIN;
        const hh = map.HEIGHT / 2 - cfg.SPAWN_MARGIN;
        const side = Math.floor(Math.random() * 4);

        switch (side) {
            case 0:
                return new Vec3(Math.random() * map.WIDTH - hw, hh, 0);
            case 1:
                return new Vec3(Math.random() * map.WIDTH - hw, -hh, 0);
            case 2:
                return new Vec3(hw, Math.random() * map.HEIGHT - hh, 0);
            default:
                return new Vec3(-hw, Math.random() * map.HEIGHT - hh, 0);
        }
    }
}
