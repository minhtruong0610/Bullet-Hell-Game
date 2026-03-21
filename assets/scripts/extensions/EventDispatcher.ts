import ViewController from "./ViewController";

export default class EventDispatcher implements EventTarget {
    public constructor() {}

    private _listeners: { [type: string]: Array<EventListenerType> } = undefined;

    public addEventListener(type: string, handler: EventListenerType) {
        if (!this._listeners) this._listeners = {};

        if (!(type in this._listeners)) {
            this._listeners[type] = [handler];
        } else {
            const handlers = this._listeners[type];
            if (handlers.indexOf(handler) < 0) handlers.push(handler);
        }
    }

    public subscribe(type: string, handler: EventListenerType, component?: ViewController) {
        if (!this._listeners) this._listeners = {};

        if (!(type in this._listeners)) {
            this._listeners[type] = [handler];
        } else {
            const handlers = this._listeners[type];
            if (handlers.indexOf(handler) < 0) handlers.push(handler);
        }

        if (component) {
            component.addDestroyHandler(() => {
                this.removeEventListener(type, handler);
            });
        }
    }

    public removeEventListener(type: string, handler: EventListenerType) {
        if (!this._listeners) return;
        if (!(type in this._listeners)) return;

        const handlers = this._listeners[type];
        const index = handlers.indexOf(handler);

        if (index >= 0) {
            if (handlers.length === 1) delete this._listeners[type];
            else handlers.splice(index, 1);
        }
    }

    public dispatchEvent(event: Event, data?: any): boolean {
        if (!this._listeners) return true;

        const type = event.type;
        let prevented = false;

        if (type in this._listeners) {
            const handlers = this._listeners[type].concat();

            for (let i = 0, handler; (handler = handlers[i]); i++) {
                if ((handler as any).handleEvent) {
                    const p = (handler as any).handleEvent.call(handler, event, data) === false;
                    prevented = prevented || p;
                } else {
                    const p = (handler as any).call(handler, event, data) === false;
                    prevented = prevented || p;
                }
            }
        }

        return !prevented && !event.defaultPrevented;
    }
}

type EventListenerType = EventListener | ((event: Event, data?: any) => void);
