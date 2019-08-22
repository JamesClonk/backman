import * as wcHelpers from "../../../core/helpers/webcomponent-helpers";
export class ProgressFullStep {
    constructor() {
        this.invokeStepClickCallback = () => null;
        this.value = 0;
        this.status = "none";
        this.position = "none";
    }
    stepClickCallbackChanged() {
        this.setInvokeStepClickCallback();
    }
    componentWillLoad() {
        this.setInvokeStepClickCallback();
    }
    clicked() {
        if (this.status === "completed") {
            this.invokeStepClickCallback();
        }
    }
    setInvokeStepClickCallback() {
        this.invokeStepClickCallback = wcHelpers.parseFunction(this.stepClickCallback);
    }
    render() {
        return (h("div", { class: "step-container" },
            h("div", { class: "progress-line-right" }),
            h("div", { class: "progress-line-left" }),
            h("div", { class: "button-container" },
                h("button", { onClick: () => this.clicked() }, this.value)),
            h("br", { class: "br-hide" }),
            h("div", { onClick: () => this.clicked(), class: "progress-content" },
                h("slot", null))));
    }
    static get is() { return "sdx-progress-full-step"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "el": {
            "elementRef": true
        },
        "position": {
            "type": String,
            "attr": "position"
        },
        "status": {
            "type": String,
            "attr": "status"
        },
        "stepClickCallback": {
            "type": String,
            "attr": "step-click-callback",
            "watchCallbacks": ["stepClickCallbackChanged"]
        },
        "value": {
            "type": Number,
            "attr": "value"
        }
    }; }
    static get style() { return "/**style-placeholder:sdx-progress-full-step:**/"; }
}
