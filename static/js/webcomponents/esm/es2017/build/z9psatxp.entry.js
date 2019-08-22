/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

class Arrow {
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
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}:host{display:none}:host([hover=true]){position:relative}:host([hover=true]):after,:host([hover=true]):before{position:absolute;top:50%;-webkit-transition:all .2s cubic-bezier(.4,0,.2,1);transition:all .2s cubic-bezier(.4,0,.2,1);border-radius:2px;background:#0851da;width:10px;height:2px;-webkit-backface-visibility:hidden;backface-visibility:hidden;content:\"\"}:host([hover=true]):before{left:0}:host([hover=true]):after{left:6px}:host([arrow-position=center]),:host([arrow-position=left]),:host([arrow-position=right]){position:relative;top:4px;left:0;width:35px;height:16px;-webkit-transform:scale(.68);transform:scale(.68);pointer-events:none;-webkit-transform-origin:50% 50%;transform-origin:50% 50%}:host([arrow-position=center]):after,:host([arrow-position=center]):before,:host([arrow-position=left]):after,:host([arrow-position=left]):before,:host([arrow-position=right]):after,:host([arrow-position=right]):before{position:absolute;top:50%;-webkit-transition:all .2s cubic-bezier(.4,0,.2,1);transition:all .2s cubic-bezier(.4,0,.2,1);border-radius:3px;background:#1781e3;width:20px;height:3px;-webkit-backface-visibility:hidden;backface-visibility:hidden;content:\"\"}:host([arrow-position=center]):before,:host([arrow-position=left]):before,:host([arrow-position=right]):before{left:0}:host([arrow-position=center]):after,:host([arrow-position=left]):after,:host([arrow-position=right]):after{left:15px}:host([arrow-position=center]):before,:host([arrow-position=left]):before,:host([arrow-position=right]):before{-webkit-transform:rotate(35deg);transform:rotate(35deg)}:host([arrow-position=center]):after,:host([arrow-position=left]):after,:host([arrow-position=right]):after{-webkit-transform:rotate(-35deg);transform:rotate(-35deg)}:host([hover=true][arrow-position=center]),:host([hover=true][arrow-position=left]),:host([hover=true][arrow-position=right]){position:relative}:host([hover=true][arrow-position=center]):after,:host([hover=true][arrow-position=center]):before,:host([hover=true][arrow-position=left]):after,:host([hover=true][arrow-position=left]):before,:host([hover=true][arrow-position=right]):after,:host([hover=true][arrow-position=right]):before{position:absolute;top:50%;-webkit-transition:all .2s cubic-bezier(.4,0,.2,1);transition:all .2s cubic-bezier(.4,0,.2,1);border-radius:3px;background:#0851da;width:20px;height:3px;-webkit-backface-visibility:hidden;backface-visibility:hidden;content:\"\"}:host([hover=true][arrow-position=center]):before,:host([hover=true][arrow-position=left]):before,:host([hover=true][arrow-position=right]):before{left:0}:host([hover=true][arrow-position=center]):after,:host([hover=true][arrow-position=left]):after,:host([hover=true][arrow-position=right]):after{left:15px}:host([direction=up][arrow-position=center]):before,:host([direction=up][arrow-position=left]):before,:host([direction=up][arrow-position=right]):before{-webkit-transform:rotate(-35deg);transform:rotate(-35deg)}:host([direction=up][arrow-position=center]):after,:host([direction=up][arrow-position=left]):after,:host([direction=up][arrow-position=right]):after{-webkit-transform:rotate(35deg);transform:rotate(35deg)}:host([arrow-position=right]){display:inline-block;float:right}:host([arrow-position=left]){display:inline-block;float:left}:host([arrow-position=center]){display:table;margin:-13px auto 0;float:none}"; }
}

const DEFAULT_ARROW_POSITION = "none";
class Header {
    constructor() {
        this.arrowPosition = "none";
        this.expand = false;
        this.toggle = () => "";
    }
    arrowPositionChanged() {
        this.setArrowPosition();
    }
    activeItemChanged() {
        this.setArrowDirection();
    }
    componentDidLoad() {
        this.setChildElementsReferences();
        this.setArrowPosition();
        this.setArrowDirection();
    }
    onClick() {
        this.toggle();
    }
    onMouseOver() {
        this.setArrowHover("true");
    }
    onMouseOut() {
        this.setArrowHover("false");
    }
    closeItem() {
        if (this.expand) {
            this.toggle();
        }
    }
    openItem() {
        if (!this.expand) {
            this.toggle();
        }
    }
    setChildElementsReferences() {
        if (this.el.shadowRoot) {
            this.arrowEl = this.el.shadowRoot.querySelector("sdx-accordion-arrow");
        }
    }
    setArrowPosition() {
        if (this.arrowEl) {
            this.arrowEl.setAttribute("arrow-position", this.arrowPosition);
        }
    }
    setArrowDirection() {
        if (this.arrowEl) {
            this.arrowEl.setAttribute("direction", this.expand ? "up" : "down");
        }
    }
    setArrowHover(value) {
        if (this.arrowEl && DEFAULT_ARROW_POSITION !== this.arrowPosition) {
            this.arrowEl.setAttribute("hover", value);
        }
    }
    render() {
        return (h("button", { class: "content", "aria-expanded": this.expand.toString() },
            h("div", { class: "header" },
                h("slot", null)),
            h("sdx-accordion-arrow", null)));
    }
    static get is() { return "sdx-accordion-item-header"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "arrowPosition": {
            "type": String,
            "attr": "arrow-position",
            "watchCallbacks": ["arrowPositionChanged"]
        },
        "closeItem": {
            "method": true
        },
        "el": {
            "elementRef": true
        },
        "expand": {
            "type": Boolean,
            "attr": "expand",
            "watchCallbacks": ["activeItemChanged"]
        },
        "openItem": {
            "method": true
        },
        "toggle": {
            "type": "Any",
            "attr": "toggle"
        }
    }; }
    static get listeners() { return [{
            "name": "click",
            "method": "onClick"
        }, {
            "name": "mouseover",
            "method": "onMouseOver",
            "passive": true
        }, {
            "name": "mouseout",
            "method": "onMouseOut",
            "passive": true
        }]; }
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}:host .header{width:100%}:host .content{color:#333;display:block;margin:0;padding:13px 13px 14px 19px;border:0;width:100%;cursor:pointer;outline:none}:host button{font-family:inherit;margin:0;background:transparent;text-align:left}:host([arrow-position=left]) .header{padding-left:10px}:host([arrow-position=left]) .header,:host([arrow-position=right]) .header{width:calc(100% - 35px);margin:0;display:inline-block;position:relative}:host([arrow-position=center]) .header{display:none}:host([arrow-position=center]) .content{width:100%;min-height:32px;border-top:1px solid #d6d6d6}"; }
}

export { Arrow as SdxAccordionArrow, Header as SdxAccordionItemHeader };
