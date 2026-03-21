import { _decorator, Component, Node } from "cc";
import ChildrenLookup from "./ChildrenLookup";

const { ccclass } = _decorator;

@ccclass("ViewController")
export default class ViewController extends Component {
    private _childrenLookup: ChildrenLookup;

    public get initialized(): boolean {
        return this._initialized;
    }

    private _initialized = false;
    private destroyHandlers: Array<() => void> = null;

    protected onLoad() {
        this._childrenLookup = new ChildrenLookup(this.node);
        this._initialized = true;

        this.destroyHandlers = [];
    }

    protected onDestroy() {
        for (const handler of this.destroyHandlers) {
            handler();
        }

        this.destroyHandlers.length = 0;
    }

    protected start() {}

    protected slowUpdateRate = 0;

    private _requestImmediateSlowUpdate = false;
    private _timeElapsedFromLastSlowUpdate = 0;

    protected update(dt: number) {
        if (this.slowUpdateRate > 0) {
            this._timeElapsedFromLastSlowUpdate += dt;

            if (this._timeElapsedFromLastSlowUpdate >= this.slowUpdateRate || this._requestImmediateSlowUpdate) {
                this._timeElapsedFromLastSlowUpdate = 0;
                this._requestImmediateSlowUpdate = false;

                if (typeof (this as any)["slowUpdate"] === "function") {
                    (this as any)["slowUpdate"]();
                }
            }
        }
    }

    public requestSlowUpdate() {
        this._requestImmediateSlowUpdate = true;
    }

    public get(name: string): Node | undefined {
        return this._childrenLookup.get(name);
    }

    public addDestroyHandler(destroyHandler: () => void) {
        if (this.destroyHandlers) {
            this.destroyHandlers.push(destroyHandler);
        }
    }
}
