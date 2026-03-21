import { _decorator, Component, Node, Vec3, Graphics, EventTarget } from "cc";
import { DrawHelper } from "../system/DrawHelper";
import { GameEvents, GameLogic } from "../core/GameLogic";
import ViewController from "../extensions/ViewController";
import { AudioManager } from "../core/AudioManager";
import { SFX } from "../utils/Enum";

const { ccclass } = _decorator;

@ccclass("EnemyBase")
export class EnemyBase extends ViewController {
    protected _hp: number = 1;
    protected _maxHp: number = 1;
    protected _score: number = 10;
    protected _radius: number = 18;
    protected _color: string = "#FF3D3D";
    protected _playerNode: Node | null = null;
    protected _active: boolean = true;

    protected _bus: EventTarget | null = null;

    get isActive() {
        return this._active;
    }
    get radius() {
        return this._radius;
    }
    get score() {
        return this._score;
    }

    setup(playerNode: Node): void {
        this._playerNode = playerNode;
        this._hp = this._maxHp;
        this._active = true;
        this.node.active = true;
        this.drawSelf();
    }

    protected drawSelf(): void {
        let g = this.node.getComponent(Graphics);
        if (!g) g = this.node.addComponent(Graphics);
        DrawHelper.triangle(g, this._radius * 2, this._color, "#FFFFFF");
    }

    takeDamage(amount: number): void {
        if (!this._active) return;

        this._hp -= amount;
        if (this._hp <= 0) this._die();
    }

    protected _die(): void {
        this._active = false;
        this.node.active = false;
        AudioManager.Instance.play(SFX.SCORE_POINTS);

        GameLogic.Instance.dispatchEvent(new Event(GameEvents.ENEMY_DIED), this._score);
    }

    update(dt: number): void {
        if (!this._active) return;
        this._behaviorUpdate(dt);
    }

    protected _behaviorUpdate(_dt: number): void {}

    protected _dirToPlayer(): Vec3 {
        if (!this._playerNode) return Vec3.ZERO.clone();
        const ep = this.node.getWorldPosition();
        const pp = this._playerNode.getWorldPosition();
        return new Vec3(pp.x - ep.x, pp.y - ep.y, 0).normalize();
    }

    recycle(): void {
        this._active = false;
        this.node.active = false;
    }
}
