import { _decorator, Vec3 } from "cc";
import { EnemyBase } from "./EnemyBase";
import { GameConfig } from "../core/GameConfig";

const { ccclass } = _decorator;

const cfg = GameConfig.CHASER;

@ccclass("ChasingEnemy")
export class ChasingEnemy extends EnemyBase {
    constructor() {
        super();

        this._maxHp = cfg.MAX_HP;
        this._hp = cfg.MAX_HP;
        this._score = cfg.SCORE;
        this._radius = cfg.RADIUS;
        this._color = cfg.COLOR;
    }

    protected _behaviorUpdate(dt: number): void {
        const dir = this._dirToPlayer();

        if (dir.equals(Vec3.ZERO)) return;

        const p = this.node.getWorldPosition();
        this.node.setWorldPosition(p.x + dir.x * cfg.MOVE_SPEED * dt, p.y + dir.y * cfg.MOVE_SPEED * dt, 0);
        // Rotate sprite so the triangle looks towards the player
        const angle = Math.atan2(dir.y, dir.x) * (180 / Math.PI) - 90;
        this.node.angle = angle;
    }

    get contactDamage(): number {
        return cfg.CONTACT_DAMAGE;
    }
}
