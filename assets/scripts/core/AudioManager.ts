import { _decorator, Component, AudioSource, AudioClip, resources, Node, game, director, error, warn } from "cc";
import { SFX } from "../utils/Enum";
const { ccclass } = _decorator;

@ccclass("AudioManager")
export class AudioManager extends Component {
    private static _instance: AudioManager;
    public static get Instance(): AudioManager {
        return this._instance;
    }

    private audioSource: AudioSource = null!;
    private sfxMap: Map<string, AudioClip> = new Map();

    private _volume: number = 1;
    private _mute: boolean = false;

    onLoad() {
        if (AudioManager._instance) {
            this.node.destroy();
            return;
        }

        AudioManager._instance = this;

        director.addPersistRootNode(this.node);
        this.audioSource = this.getComponent(AudioSource) || this.addComponent(AudioSource);
    }

    public setup(audios: { [key: string]: AudioClip }) {
        for (const key in audios) {
            const clip = audios[key];
            if (clip) {
                this.sfxMap.set(key, clip);
            }
        }
    }

    public preload(key: string, path: string) {
        resources.load(path, AudioClip, (err, clip) => {
            if (err) {
                error("Load SFX error:", path);
                return;
            }
            this.sfxMap.set(key, clip);
        });
    }

    public play(key: SFX | string, volume: number = 1) {
        if (this._mute) return;

        const clip = this.sfxMap.get(key);
        if (!clip) {
            warn("SFX not found:", key);
            return;
        }

        this.audioSource.playOneShot(clip, volume * this._volume);
    }

    public stop() {
        this.audioSource.stop();
    }

    public stopAll() {
        this.audioSource.stop();
    }

    public setVolume(volume: number) {
        this._volume = Math.max(0, Math.min(1, volume));
    }

    public getVolume(): number {
        return this._volume;
    }

    public setMute(mute: boolean) {
        this._mute = mute;
    }

    public isMute(): boolean {
        return this._mute;
    }

    public clear() {
        this.sfxMap.clear();
    }
}
