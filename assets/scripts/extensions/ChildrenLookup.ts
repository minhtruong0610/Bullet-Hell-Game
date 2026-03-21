import { Node } from "cc";

export default class ChildrenLookup {
    private _root: Node;

    public get root(): Node {
        return this._root;
    }

    /**
     * The map to quickly grab a child node when refers by its name
     */
    private _children: { [childName: string]: Node } = {};

    public constructor(node: Node) {
        this._root = node;
        this.captureChildren(node);
    }

    /**
     * Scan through the children and cache any children with the name warped with []
     */
    private captureChildren(node: Node) {
        const children = node.children;

        for (let i = 0; i < children.length; ++i) {
            const child = children[i];
            const childName = child.name;

            // Cache if wrapped inside []
            if (childName[0] === "[" && childName[childName.length - 1] === "]") {
                this._children[childName] = child;
            }

            // Stop scanning if wrapped with _ _
            if (
                (childName[0] === "_" && childName[childName.length - 1] === "_") ||
                (childName.length > 3 && childName[0] === "[" && childName[childName.length - 1] === "]" && childName[1] === "_" && childName[childName.length - 2] === "_")
            ) {
                continue;
            }

            this.captureChildren(child);
        }
    }

    public get(name: string): Node | undefined {
        if (!this._children[name]) {
            return undefined;
        }

        return this._children[name];
    }
}
