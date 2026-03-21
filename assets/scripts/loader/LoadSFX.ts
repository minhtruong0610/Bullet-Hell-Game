import { _decorator, AudioClip, Component } from "cc";
import { AudioManager } from "../core/AudioManager";
const { ccclass, property } = _decorator;

@ccclass
export default class LoadSFX extends Component {
    @property(AudioClip) buttonAudioClip: AudioClip = null!;
    @property(AudioClip) gameEndAudioClip: AudioClip = null!;
    @property(AudioClip) playerShootAudioClip: AudioClip = null!;
    @property(AudioClip) swooshAudioClip: AudioClip = null!;
    @property(AudioClip) scorePointsAudioClip: AudioClip = null!;

    // LIFE-CYCLE CALLBACKS:

    start() {
        const { buttonAudioClip, swooshAudioClip, gameEndAudioClip, playerShootAudioClip, scorePointsAudioClip } = this;

        AudioManager.Instance.setup({
            button: buttonAudioClip,
            game_end: gameEndAudioClip,
            player_shoot: playerShootAudioClip,
            swoosh: swooshAudioClip,
            score_points: scorePointsAudioClip,
        });
    }
}
