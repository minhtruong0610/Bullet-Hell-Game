import { _decorator, Component, Node, Label, Button, Color } from "cc";
import { GameEvents, GameLogic } from "../core/GameLogic";
import ViewController from "../extensions/ViewController";
import { GameConfig } from "../core/GameConfig";
import { AudioManager } from "../core/AudioManager";
import { SFX } from "../utils/Enum";

const { ccclass, property } = _decorator;

const RESULT_CONFIG = {
    WIN: {
        label: "🎉 YOU SURVIVED!",
        color: new Color("#00E676"),
    },
    LOSE: {
        label: "💀 GAME OVER",
        color: new Color("#FF3D3D"),
    },
};

@ccclass("UIManager")
export class UIManager extends ViewController {
    @property(Label) timerLabel!: Label;
    @property(Label) scoreLabel!: Label;
    @property(Label) hpLabel!: Label;
    @property(Node) gameOverPanel!: Node;
    @property(Label) resultLabel!: Label;
    @property(Button) restartBtn!: Button;

    private _score: number = 0;

    protected onLoad(): void {
        GameLogic.Instance.subscribe(GameEvents.ENEMY_DIED, this.onEnemyDied.bind(this));
        GameLogic.Instance.subscribe(GameEvents.PLAYER_HIT, this.onPlayerHit);
        GameLogic.Instance.subscribe(GameEvents.GAME_OVER, this.onGameOver.bind(this));
    }

    init(): void {
        this._score = 0;
        this.gameOverPanel.active = false;
    }

    updateHUD(remainTime: number, hp: number, maxHp: number): void {
        const secs = Math.ceil(remainTime);
        this.timerLabel.string = `⏱ ${secs}s`;
        this.hpLabel.string = `❤️ ${hp} / ${maxHp}`;
        this.scoreLabel.string = `⭐ ${this._score}`;
    }

    private onEnemyDied(_, score: number): void {
        this._score += score;
    }

    private onPlayerHit(): void {}

    private onGameOver(_, isWin: boolean): void {
        const cfg = isWin ? RESULT_CONFIG.WIN : RESULT_CONFIG.LOSE;

        this.gameOverPanel.active = true;
        this.resultLabel.string = cfg.label;
        this.resultLabel.color = cfg.color;

        if (!isWin) this.hpLabel.string = `❤️ ${0} / ${GameConfig.PLAYER.MAX_HP}`;
    }

    //#region restart clicked
    onClickRestart() {
        AudioManager.Instance.play(SFX.BUTTON);

        GameLogic.Instance.dispatchEvent(new Event(GameEvents.GAME_RESTART));
        this.updateHUD(GameConfig.GAME.DURATION, GameConfig.PLAYER.MAX_HP, GameConfig.PLAYER.MAX_HP);
    }
    //#endregion
}
