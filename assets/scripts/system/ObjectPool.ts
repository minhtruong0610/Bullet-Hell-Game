import { Node, instantiate } from "cc";

export class ObjectPool {
    private _pool: Node[] = [];
    private _template: Node;
    private _parent: Node;

    constructor(template: Node, parent: Node, preAllocate = 0) {
        this._template = template;
        this._parent = parent;
        for (let i = 0; i < preAllocate; i++) {
            this._pool.push(this._createNew());
        }
    }

    private _createNew(): Node {
        const n = instantiate(this._template);
        n.active = false;
        this._parent.addChild(n);
        return n;
    }

    get(): Node {
        for (const n of this._pool) {
            if (!n.active) {
                n.active = true;
                return n;
            }
        }

        const n = this._createNew();
        this._pool.push(n);
        n.active = true;
        return n;
    }

    put(n: Node): void {
        n.active = false;
    }

    recycleAll(): void {
        this._pool.forEach((n) => (n.active = false));
    }

    get all(): Node[] {
        return this._pool;
    }
}
