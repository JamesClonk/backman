export class Arrow {
    constructor() {
        this.direction = "down";
        this.hover = false;
        this.arrowPosition = "none";
    }
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-accordion-arrow"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "arrowPosition": {
            "type": String,
            "attr": "arrow-position"
        },
        "direction": {
            "type": String,
            "attr": "direction"
        },
        "hover": {
            "type": Boolean,
            "attr": "hover"
        }
    }; }
    static get style() { return "/**style-placeholder:sdx-accordion-arrow:**/"; }
}
