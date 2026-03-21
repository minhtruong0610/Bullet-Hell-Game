import { _decorator } from "cc";
import EventDispatcher from "../extensions/EventDispatcher";
const { ccclass, property } = _decorator;

@ccclass("GameLogic")
export class GameLogic extends EventDispatcher {
    private static _instance: GameLogic;

    public static get Instance(): GameLogic {
        if (!this._instance) {
            this._instance = new GameLogic();
        }
        return this._instance;
    }

    private constructor() {
        super();
    }
}

export const GameEvents = {
    PLAYER_HIT: "player_hit", // payload: damage (number)
    PLAYER_DIED: "player_died",
    ENEMY_DIED: "enemy_died", // payload: { score: number }
    GAME_OVER: "game_over", // payload: { win: boolean }
    GAME_RESTART: "game_restart",
} as const;
