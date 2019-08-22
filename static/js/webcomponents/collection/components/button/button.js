export class Button {
    constructor() {
        this.theme = "primary";
        this.size = "standard";
        this.srHint = "";
    }
    hostData() {
        return {
            class: {
                [this.theme]: true,
                [this.size]: true
            }
        };
    }
    render() {
        return (h("button", null,
            h("slot", null),
            h("span", { class: "sr-only" }, this.srHint)));
    }
    static get is() { return "sdx-button"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "size": {
            "type": String,
            "attr": "size"
        },
        "srHint": {
            "type": String,
            "attr": "sr-hint"
        },
        "theme": {
            "type": String,
            "attr": "theme"
        }
    }; }
    static get style() { return "/**style-placeholder:sdx-button:**/"; }
}
