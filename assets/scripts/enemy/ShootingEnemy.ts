import { _decorator, Vec2, Vec3 } from "cc";
import { EnemyBase } from "./EnemyBase";
import { GameConfig } from "../core/GameConfig";

const { ccclass } = _decorator;

const cfg = GameConfig.SHOOTER;

export type SpawnBulletFn = (pos: Vec3, dir: Vec2, speed: number, damage: number, radius: number, color: string) => void;

@ccclass("ShootingEnemy")
export class ShootingEnemy extends EnemyBase {
    private _shootTimer: number = 0;
    private _spawnBullet: SpawnBulletFn | null = null;

    constructor() {
        super();
        this._maxHp = cfg.MAX_HP;
        this._hp = cfg.MAX_HP;
        this._score = cfg.SCORE;
        this._radius = cfg.RADIUS;
        this._color = cfg.COLOR;
    }

    setSpawnBulletFn(fn: SpawnBulletFn): void {
        this._spawnBullet = fn;
    }

    protected _behaviorUpdate(dt: number): void {
        // rotate towards the player (cosmetic)
        const dir3 = this._dirToPlayer();
        if (!dir3.equals(Vec3.ZERO)) {
            const angle = Math.atan2(dir3.y, dir3.x) * (180 / Math.PI) - 90;
            this.node.angle = angle;
        }

        this._shootTimer += dt;
        if (this._shootTimer >= cfg.SHOOT_INTERVAL) {
            this._shootTimer = 0;
            this._tryShoot(dir3);
        }
    }

    private _tryShoot(dir3: Vec3): void {
        if (!this._spawnBullet) return;
        const dir2 = new Vec2(dir3.x, dir3.y);
        this._spawnBullet(this.node.getWorldPosition(), dir2, cfg.BULLET_SPEED, cfg.BULLET_DAMAGE, cfg.BULLET_RADIUS, cfg.BULLET_COLOR);
    }

    // Override setup to reset timer
    override setup(...args: Parameters<EnemyBase["setup"]>): void {
        super.setup(...args);
        this._shootTimer = 0;
    }
}
