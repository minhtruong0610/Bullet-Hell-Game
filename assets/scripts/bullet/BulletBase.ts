import { _decorator, Component, Node, Vec2, Vec3, Graphics } from "cc";
import { DrawHelper } from "../system/DrawHelper";
import ViewController from "../extensions/ViewController";

const { ccclass, property } = _decorator;

@ccclass("BulletBase")
export class BulletBase extends ViewController {
    protected _velocity: Vec2 = new Vec2();
    protected _damage: number = 1;
    protected _radius: number = 6;
    protected _fillColor: string = "#ffffff";

    private _active: boolean = true;
    get isActive() {
        return this._active;
    }

    init(pos: Vec3, dir: Vec2, speed: number, damage: number, radius: number, color: string): void {
        this.node.setWorldPosition(pos);
        Vec2.multiplyScalar(this._velocity, dir.normalize(), speed);
        this._damage = damage;
        this._radius = radius;
        this._fillColor = color;
        this._active = true;
        this.drawSelf();
    }

    protected drawSelf(): void {
        let g = this.node.getComponent(Graphics);
        if (!g) g = this.node.addComponent(Graphics);
        DrawHelper.circle(g, this._radius, this._fillColor);
    }

    update(dt: number): void {
        if (!this._active) return;
        const p = this.node.getWorldPosition();
        this.node.setWorldPosition(p.x + this._velocity.x * dt, p.y + this._velocity.y * dt, 0);
    }

    overlapsCircle(other: Node, otherRadius: number): boolean {
        const a = this.node.getWorldPosition();
        const b = other.getWorldPosition();
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist2 = dx * dx + dy * dy;
        const r = this._radius + otherRadius;
        return dist2 < r * r;
    }

    get damage(): number {
        return this._damage;
    }
    get radius(): number {
        return this._radius;
    }

    recycle(): void {
        this._active = false;
        this.node.active = false;
    }
}
