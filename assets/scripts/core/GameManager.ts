import { _decorator, Component, Node, Vec2, Vec3, Graphics, Color } from "cc";
import { GameConfig } from "./GameConfig";
import { UIManager } from "../ui/UIManager";
import { EnemySpawner } from "../enemy/EnemySpawner";
import { ObjectPool } from "../system/ObjectPool";
import { PlayerController } from "../player/PlayerController";
import { PlayerBullet } from "../player/PlayerBullet";
import { EnemyBullet } from "../enemy/EnemyBullet";
import { ChasingEnemy } from "../enemy/ChasingEnemy";
import { ShootingEnemy } from "../enemy/ShootingEnemy";
import { DrawHelper } from "../system/DrawHelper";
import { BulletBase } from "../bullet/BulletBase";
import { EnemyBase } from "../enemy/EnemyBase";
import { GameEvents, GameLogic } from "./GameLogic";
import ViewController from "../extensions/ViewController";
import { AudioManager } from "./AudioManager";
import { SFX } from "../utils/Enum";

const { ccclass, property } = _decorator;
const mapCfg = GameConfig.MAP;
const PLAYER_BULLET_POOL_SIZE = 40;
const ENEMY_BULLET_POOL_SIZE = 60;
const CHASER_POOL_SIZE = 20;
const SHOOTER_POOL_SIZE = 10;

@ccclass("GameManager")
export class GameManager extends ViewController {
    @property(Node) playerNode!: Node;
    @property(Node) bulletLayer!: Node; // empty Node, parent cho bullets
    @property(Node) enemyLayer!: Node; // empty Node, parent cho enemies
    @property(UIManager) uiManager!: UIManager;
    @property(EnemySpawner) spawner!: EnemySpawner;

    private _playerCtrl!: PlayerController;
    private _pBulletPool!: ObjectPool;
    private _eBulletPool!: ObjectPool;
    private _chaserPool!: ObjectPool;
    private _shooterPool!: ObjectPool;

    private _remainTime: number = GameConfig.GAME.DURATION;
    private _gameRunning: boolean = false;

    onLoad(): void {
        this.reset();

        //events
        GameLogic.Instance.subscribe(GameEvents.PLAYER_DIED, this.onPlayerDied.bind(this));
        GameLogic.Instance.subscribe(GameEvents.GAME_RESTART, this.onGameRestart.bind(this));
    }

    private onPlayerDied() {
        this.endGame(false);
    }

    private onGameRestart() {
        this.reset();
    }

    private reset() {
        this.buildPools();
        this.setupPlayer();
        this.setupMap();
        this.uiManager.init();
        this.spawner.startSpawning(this.spawnEnemy.bind(this));
        this._gameRunning = true;
        this._remainTime = GameConfig.GAME.DURATION;
        this._playerCtrl.node.setPosition(0, 0, 0);
    }

    update(dt: number): void {
        if (!this._gameRunning) return;

        // Countdown
        this._remainTime -= dt;
        if (this._remainTime <= 0) {
            this._remainTime = 0;
            this.endGame(true);
            return;
        }

        // HUD update
        this.uiManager.updateHUD(this._remainTime, this._playerCtrl.hp, this._playerCtrl.maxHp);

        this.checkCollisions();
        this.recycleBulletsOutOfBounds();
    }

    private buildPools(): void {
        // Player bullet template
        const pbTemplate = this.makeNode("PBullet", PlayerBullet);
        this._pBulletPool = new ObjectPool(pbTemplate, this.bulletLayer, PLAYER_BULLET_POOL_SIZE);

        // Enemy bullet template
        const ebTemplate = this.makeNode("EBullet", EnemyBullet);
        this._eBulletPool = new ObjectPool(ebTemplate, this.bulletLayer, ENEMY_BULLET_POOL_SIZE);

        // Chaser template
        const chaserTemplate = this.makeNode("Chaser", ChasingEnemy);
        this._chaserPool = new ObjectPool(chaserTemplate, this.enemyLayer, CHASER_POOL_SIZE);

        // Shooter template
        const shooterTemplate = this.makeNode("Shooter", ShootingEnemy);
        this._shooterPool = new ObjectPool(shooterTemplate, this.enemyLayer, SHOOTER_POOL_SIZE);
    }

    private makeNode<T extends Component>(name: string, CompClass: new () => T): Node {
        const n = new Node(name);
        n.addComponent(CompClass);
        n.active = false;
        return n;
    }

    // Player setup
    private setupPlayer(): void {
        this._playerCtrl = this.playerNode.getComponent(PlayerController) ?? this.playerNode.addComponent(PlayerController);

        const origin = this.node.getWorldPosition();
        const mapBounds = {
            minX: origin.x - mapCfg.WIDTH / 2,
            maxX: origin.x + mapCfg.WIDTH / 2,
            minY: origin.y - mapCfg.HEIGHT / 2,
            maxY: origin.y + mapCfg.HEIGHT / 2,
        };

        this._playerCtrl.init(
            (pos, dir) => this.spawnPlayerBullet(pos, dir),
            () => this._getActiveEnemyNodes(),
            mapBounds,
        );

        let g = this.playerNode.getComponent(Graphics);
        if (!g) g = this.playerNode.addComponent(Graphics);
        DrawHelper.circle(g, GameConfig.PLAYER.RADIUS, GameConfig.PLAYER.COLOR, "#FFFFFF");
    }

    private setupMap(): void {
        const mapNode = new Node("MapBorder");
        this.node.addChild(mapNode);
        const g = mapNode.addComponent(Graphics);
        g.lineWidth = 4;
        g.strokeColor = new Color("#546E7A");
        g.rect(-mapCfg.WIDTH / 2, -mapCfg.HEIGHT / 2, mapCfg.WIDTH, mapCfg.HEIGHT);
        g.stroke();
    }

    private spawnPlayerBullet(pos: Vec3, dir: Vec2): void {
        const n = this._pBulletPool.get();
        const b = n.getComponent(PlayerBullet)!;
        b.init(pos, dir, GameConfig.PLAYER.BULLET_SPEED, GameConfig.PLAYER.BULLET_DAMAGE, GameConfig.PLAYER.BULLET_RADIUS, GameConfig.PLAYER.BULLET_COLOR);
    }

    private spawnEnemyBullet(pos: Vec3, dir: Vec2, speed: number, damage: number, radius: number, color: string): void {
        const n = this._eBulletPool.get();
        const b = n.getComponent(EnemyBullet)!;
        b.init(pos, dir, speed, damage, radius, color);
    }

    private spawnEnemy(pos: Vec3, type: "chaser" | "shooter"): void {
        const origin = this.node.getWorldPosition();
        const worldPos = new Vec3(origin.x + pos.x, origin.y + pos.y, 0);

        if (type === "chaser") {
            const n = this._chaserPool.get();
            const e = n.getComponent(ChasingEnemy)!;
            n.setWorldPosition(worldPos);
            e.setup(this.playerNode);
        } else {
            const n = this._shooterPool.get();
            const e = n.getComponent(ShootingEnemy)!;
            n.setWorldPosition(worldPos);
            e.setSpawnBulletFn(this.spawnEnemyBullet.bind(this));
            e.setup(this.playerNode);
        }
    }

    private checkCollisions(): void {
        const playerPos = this.playerNode.getWorldPosition();
        const pRadius = this._playerCtrl.radius;

        // Enemy bullet → Player
        for (const bn of this._eBulletPool.all) {
            if (!bn.active) continue;

            const b = bn.getComponent(EnemyBullet)!;
            if (!b.isActive) continue;

            const bp = bn.getWorldPosition();

            const dx = bp.x - playerPos.x,
                dy = bp.y - playerPos.y;
            const r = b.radius + pRadius;

            if (dx * dx + dy * dy < r * r) {
                b.recycle();
                this._playerCtrl.receiveDamage(b.damage);
            }
        }

        // Chasing enemy → Player (contact damage)
        for (const en of this._chaserPool.all) {
            if (!en.active) continue;

            const e = en.getComponent(ChasingEnemy)!;
            if (!e.isActive) continue;

            const ep = en.getWorldPosition();

            const dx = ep.x - playerPos.x,
                dy = ep.y - playerPos.y;
            const r = e.radius + pRadius;

            if (dx * dx + dy * dy < r * r) {
                this._playerCtrl.receiveDamage(e.contactDamage);
            }
        }

        // Player bullet → Enemies
        for (const bn of this._pBulletPool.all) {
            if (!bn.active) continue;

            const b = bn.getComponent(PlayerBullet)!;
            if (!b.isActive) continue;

            let hit = this.bulletHitPool(b, this._chaserPool, ChasingEnemy);
            if (!hit) this.bulletHitPool(b, this._shooterPool, ShootingEnemy);
        }
    }

    private bulletHitPool<T extends EnemyBase>(bullet: BulletBase, pool: ObjectPool, Comp: new () => T): boolean {
        for (const en of pool.all) {
            if (!en.active) continue;
            const e = en.getComponent(Comp)!;
            if (!e.isActive) continue;
            if (bullet.overlapsCircle(en, e.radius)) {
                bullet.recycle();
                e.takeDamage(bullet.damage);
                return true;
            }
        }
        return false;
    }

    private recycleBulletsOutOfBounds(): void {
        const origin = this.node.getWorldPosition();
        const hw = mapCfg.WIDTH / 2 + 50;
        const hh = mapCfg.HEIGHT / 2 + 50;
        const check = (pool: ObjectPool, Comp: typeof BulletBase) => {
            for (const n of pool.all) {
                if (!n.active) continue;
                const p = n.getWorldPosition();
                if (Math.abs(p.x - origin.x) > hw || Math.abs(p.y - origin.y) > hh) {
                    n.getComponent(Comp)?.recycle();
                }
            }
        };
        check(this._pBulletPool, PlayerBullet);
        check(this._eBulletPool, EnemyBullet);
    }

    private endGame(isWin: boolean): void {
        AudioManager.Instance.play(SFX.GAME_END);

        GameLogic.Instance.dispatchEvent(new Event(GameEvents.GAME_OVER), isWin);

        if (!this._gameRunning) return;
        this._gameRunning = false;
        this.spawner.stop();

        // Freeze
        [...this._chaserPool.all, ...this._shooterPool.all].forEach((n) => {
            n.getComponent(EnemyBase)?.recycle();
        });
        [...this._pBulletPool.all, ...this._eBulletPool.all].forEach((n) => {
            n.getComponent(BulletBase)?.recycle();
        });
        if (isWin) {
            this._playerCtrl.disableMovement();
        }
    }

    private _getActiveEnemyNodes(): Node[] {
        return [...this._chaserPool.all.filter((n) => n.active), ...this._shooterPool.all.filter((n) => n.active)];
    }
}
