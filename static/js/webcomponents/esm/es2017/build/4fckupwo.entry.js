/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { a as getSlot, b as installSlotObserver, c as isNativeSlot, d as getAllSlotChildNodes, e as parseFunction, f as closest, g as getPreviousFromList, h as getNextFromList } from './chunk-c2033b1f.js';

class ProgressFullStep {
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
        this.invokeStepClickCallback = parseFunction(this.stepClickCallback);
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
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}:host .step-container{position:relative}:host([position=first]) .progress-line-right,:host([position^=middle]) .progress-line-right{-webkit-transition:all .2s ease;transition:all .2s ease;width:35%;height:1px;position:absolute;top:12px;right:0}:host([position=last]) .progress-line-left,:host([position^=middle]) .progress-line-left{-webkit-transition:all .2s ease;transition:all .2s ease;width:35%;height:1px;position:absolute;top:12px;left:0}:host{display:inline-block;overflow:hidden;vertical-align:top}:host br.br-hide{visibility:hidden}:host button{border:1px solid #1781e3;color:#1781e3;border-radius:100%;width:24px;height:24px;outline:none;background-color:transparent;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;line-height:normal;font-family:inherit}:host .progress-content,:host button{cursor:default;letter-spacing:normal;text-align:center;-webkit-transition:all .15s ease-in-out;transition:all .15s ease-in-out}:host .progress-content{font-weight:400;font-size:16px;word-wrap:break-word;white-space:normal}:host .button-container button{font-weight:600;display:-ms-inline-flexbox;display:inline-flex;font-size:14px;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;padding:0}:host([status=active]) button{color:#fff;border-color:#1781e3;background-color:#1781e3}:host([status=active]) button:hover{color:#fff;border-color:#0851da;background-color:#0851da}:host([status=completed]) .progress-content,:host([status=completed]) button{cursor:pointer}:host([status=completed]) button{color:#fff;border-color:#25b252;background-color:#25b252}:host([status=completed]) button:hover{color:#fff;border-color:#008236;background-color:#008236}:host .progress-line-left,:host .progress-line-right{background:#adadad}:host([position=first]) .progress-line-left,:host([position=last]) .progress-line-right{background:none}:host([status=active]) .progress-line-left,:host([status=completed]) .progress-line-left,:host([status=completed]) .progress-line-right{background:#25b252}"; }
}

export { ProgressFullStep as SdxProgressFullStep };
