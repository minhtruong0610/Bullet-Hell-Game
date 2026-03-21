import { _decorator, Component, Node, Vec2, Vec3, input, Input, KeyCode, EventKeyboard, Graphics, EventTarget } from "cc";
import { DrawHelper } from "../system/DrawHelper";
import { GameConfig } from "../core/GameConfig";
import { GameEvents, GameLogic } from "../core/GameLogic";
import ViewController from "../extensions/ViewController";
import { AudioManager } from "../core/AudioManager";
import { SFX } from "../utils/Enum";

const { ccclass } = _decorator;
const cfg = GameConfig.PLAYER;

@ccclass("PlayerController")
export class PlayerController extends ViewController {
    private _spawnBullet: ((pos: Vec3, dir: Vec2) => void) | null = null;
    private _getEnemies: (() => Node[]) | null = null;

    private _hp: number = cfg.MAX_HP;
    private _keys: Set<string> = new Set();
    private _shootTimer: number = 0;
    private _dashTimer: number = 0;
    private _dashCooldown: number = 0;
    private _isDashing: boolean = false;
    private _dashDir: Vec2 = new Vec2();
    private _invincibleTimer: number = 0;
    private _enabledState: boolean = true;

    private _mapMinX: number = -GameConfig.MAP.WIDTH / 2;
    private _mapMaxX: number = GameConfig.MAP.WIDTH / 2;
    private _mapMinY: number = -GameConfig.MAP.HEIGHT / 2;
    private _mapMaxY: number = GameConfig.MAP.HEIGHT / 2;

    get hp() {
        return this._hp;
    }
    get maxHp() {
        return cfg.MAX_HP;
    }
    get radius() {
        return cfg.RADIUS;
    }

    onLoad(): void {
        this._drawSelf();
    }

    onEnable(): void {
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    onDisable(): void {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    private _drawSelf(): void {
        let g = this.node.getComponent(Graphics);
        if (!g) g = this.node.addComponent(Graphics);
        DrawHelper.circle(g, cfg.RADIUS, cfg.COLOR, "#FFFFFF");
    }

    init(spawnBullet: (pos: Vec3, dir: Vec2) => void, getEnemies: () => Node[], mapBounds?: { minX: number; maxX: number; minY: number; maxY: number }): void {
        this._spawnBullet = spawnBullet;
        this._getEnemies = getEnemies;
        this._hp = cfg.MAX_HP;
        this._enabledState = true;

        if (mapBounds) {
            this._mapMinX = mapBounds.minX;
            this._mapMaxX = mapBounds.maxX;
            this._mapMinY = mapBounds.minY;
            this._mapMaxY = mapBounds.maxY;
        }
    }

    private _onKeyDown(e: EventKeyboard): void {
        this._keys.add(e.keyCode.toString());
        if (e.keyCode === KeyCode.SPACE) {
            AudioManager.Instance.play(SFX.SWOOSH);
            this._tryDash();
        }
    }

    private _onKeyUp(e: EventKeyboard): void {
        this._keys.delete(e.keyCode.toString());
    }

    private _isDown(...codes: KeyCode[]): boolean {
        return codes.some((c) => this._keys.has(c.toString()));
    }

    update(dt: number): void {
        if (!this._enabledState) return;
        if (this._invincibleTimer > 0) this._invincibleTimer -= dt;
        if (this._dashCooldown > 0) this._dashCooldown -= dt;
        this._handleMovement(dt);
        this._handleShooting(dt);
        this._clampToMap();
    }

    private _handleMovement(dt: number): void {
        if (this._isDashing) {
            this._dashTimer -= dt;
            const pos = this.node.getWorldPosition();
            this.node.setWorldPosition(pos.x + this._dashDir.x * cfg.DASH_SPEED * dt, pos.y + this._dashDir.y * cfg.DASH_SPEED * dt, 0);
            if (this._dashTimer <= 0) this._isDashing = false;
            return;
        }

        const dir = new Vec2(0, 0);
        if (this._isDown(KeyCode.KEY_W, KeyCode.ARROW_UP)) dir.y += 1;
        if (this._isDown(KeyCode.KEY_S, KeyCode.ARROW_DOWN)) dir.y -= 1;
        if (this._isDown(KeyCode.KEY_A, KeyCode.ARROW_LEFT)) dir.x -= 1;
        if (this._isDown(KeyCode.KEY_D, KeyCode.ARROW_RIGHT)) dir.x += 1;

        if (dir.length() === 0) return;

        dir.normalize();
        const pos = this.node.getWorldPosition();
        this.node.setWorldPosition(pos.x + dir.x * cfg.MOVE_SPEED * dt, pos.y + dir.y * cfg.MOVE_SPEED * dt, 0);
    }

    private _tryDash(): void {
        if (this._isDashing || this._dashCooldown > 0) return;

        const dir = new Vec2(0, 0);
        if (this._isDown(KeyCode.KEY_W, KeyCode.ARROW_UP)) dir.y += 1;
        if (this._isDown(KeyCode.KEY_S, KeyCode.ARROW_DOWN)) dir.y -= 1;
        if (this._isDown(KeyCode.KEY_A, KeyCode.ARROW_LEFT)) dir.x -= 1;
        if (this._isDown(KeyCode.KEY_D, KeyCode.ARROW_RIGHT)) dir.x += 1;

        if (dir.length() === 0) return;

        this._dashDir = dir.normalize();
        this._isDashing = true;
        this._invincibleTimer = cfg.DASH_DURATION;
        this._dashTimer = cfg.DASH_DURATION;
        this._dashCooldown = cfg.DASH_COOLDOWN;
    }

    private _handleShooting(dt: number): void {
        this._shootTimer += dt;
        if (this._shootTimer < cfg.SHOOT_INTERVAL) return;

        const target = this._findNearestEnemy();
        if (!target) return;

        AudioManager.Instance.play(SFX.PLAYER_SHOOT);

        this._shootTimer = 0;
        const pos = this.node.getWorldPosition();
        const tp = target.getWorldPosition();
        const dir = new Vec2(tp.x - pos.x, tp.y - pos.y).normalize();
        this._spawnBullet?.(pos, dir);
    }

    private _findNearestEnemy(): Node | null {
        const enemies = this._getEnemies?.() ?? [];
        const pos = this.node.getWorldPosition();
        let nearest: Node | null = null;
        let minDist2 = cfg.SHOOT_RANGE * cfg.SHOOT_RANGE;

        for (const e of enemies) {
            if (!e.active) continue;
            const ep = e.getWorldPosition();
            const dx = ep.x - pos.x,
                dy = ep.y - pos.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < minDist2) {
                minDist2 = d2;
                nearest = e;
            }
        }

        return nearest;
    }

    private _clampToMap(): void {
        const r = cfg.RADIUS;
        const p = this.node.getWorldPosition();
        this.node.setWorldPosition(Math.max(this._mapMinX + r, Math.min(this._mapMaxX - r, p.x)), Math.max(this._mapMinY + r, Math.min(this._mapMaxY - r, p.y)), 0);
    }

    receiveDamage(amount: number): void {
        if (!this._enabledState) return;
        if (this._invincibleTimer > 0) return;

        this._hp -= amount;
        this._invincibleTimer = GameConfig.GAME.INVINCIBLE_TIME;

        GameLogic.Instance.dispatchEvent(new Event(GameEvents.PLAYER_HIT), amount);

        if (this._hp <= 0) {
            this._hp = 0;
            this._enabledState = false;

            GameLogic.Instance.dispatchEvent(new Event(GameEvents.PLAYER_DIED));
        }
    }

    disableMovement(): void {
        this._enabledState = false;
    }
}
