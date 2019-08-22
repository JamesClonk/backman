export class Ribbon {
    constructor() {
        this.label = "Ribbon";
        this.design = "loop";
        this.position = "right";
        this.size = "normal";
    }
    hostData() {
        return {
            class: {
                [this.design]: true,
                [this.position]: true,
                [this.size]: true
            }
        };
    }
    render() {
        return (h("div", { class: "wrapper" },
            h("div", { class: "slot" },
                h("slot", null)),
            h("div", { class: "ribbon-container" }, this.design === "loop"
                ? (h("div", { class: "content" }, this.label))
                : (this.label))));
    }
    static get is() { return "sdx-ribbon"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "design": {
            "type": String,
            "attr": "design"
        },
        "label": {
            "type": String,
            "attr": "label"
        },
        "position": {
            "type": String,
            "attr": "position"
        },
        "size": {
            "type": String,
            "attr": "size"
        }
    }; }
    static get style() { return "/**style-placeholder:sdx-ribbon:**/"; }
}
