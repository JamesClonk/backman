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
    static get style() { return ".sc-sdx-accordion-arrow-h{-webkit-box-sizing:border-box;box-sizing:border-box}*.sc-sdx-accordion-arrow, .sc-sdx-accordion-arrow:after, .sc-sdx-accordion-arrow:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sc-sdx-accordion-arrow-h{display:none}[hover=true].sc-sdx-accordion-arrow-h{position:relative}[hover=true].sc-sdx-accordion-arrow-h:after, [hover=true].sc-sdx-accordion-arrow-h:before{position:absolute;top:50%;-webkit-transition:all .2s cubic-bezier(.4,0,.2,1);transition:all .2s cubic-bezier(.4,0,.2,1);border-radius:2px;background:#0851da;width:10px;height:2px;-webkit-backface-visibility:hidden;backface-visibility:hidden;content:\"\"}[hover=true].sc-sdx-accordion-arrow-h:before{left:0}[hover=true].sc-sdx-accordion-arrow-h:after{left:6px}[arrow-position=center].sc-sdx-accordion-arrow-h, [arrow-position=left].sc-sdx-accordion-arrow-h, [arrow-position=right].sc-sdx-accordion-arrow-h{position:relative;top:4px;left:0;width:35px;height:16px;-webkit-transform:scale(.68);transform:scale(.68);pointer-events:none;-webkit-transform-origin:50% 50%;transform-origin:50% 50%}[arrow-position=center].sc-sdx-accordion-arrow-h:after, [arrow-position=center].sc-sdx-accordion-arrow-h:before, [arrow-position=left].sc-sdx-accordion-arrow-h:after, [arrow-position=left].sc-sdx-accordion-arrow-h:before, [arrow-position=right].sc-sdx-accordion-arrow-h:after, [arrow-position=right].sc-sdx-accordion-arrow-h:before{position:absolute;top:50%;-webkit-transition:all .2s cubic-bezier(.4,0,.2,1);transition:all .2s cubic-bezier(.4,0,.2,1);border-radius:3px;background:#1781e3;width:20px;height:3px;-webkit-backface-visibility:hidden;backface-visibility:hidden;content:\"\"}[arrow-position=center].sc-sdx-accordion-arrow-h:before, [arrow-position=left].sc-sdx-accordion-arrow-h:before, [arrow-position=right].sc-sdx-accordion-arrow-h:before{left:0}[arrow-position=center].sc-sdx-accordion-arrow-h:after, [arrow-position=left].sc-sdx-accordion-arrow-h:after, [arrow-position=right].sc-sdx-accordion-arrow-h:after{left:15px}[arrow-position=center].sc-sdx-accordion-arrow-h:before, [arrow-position=left].sc-sdx-accordion-arrow-h:before, [arrow-position=right].sc-sdx-accordion-arrow-h:before{-webkit-transform:rotate(35deg);transform:rotate(35deg)}[arrow-position=center].sc-sdx-accordion-arrow-h:after, [arrow-position=left].sc-sdx-accordion-arrow-h:after, [arrow-position=right].sc-sdx-accordion-arrow-h:after{-webkit-transform:rotate(-35deg);transform:rotate(-35deg)}[hover=true][arrow-position=center].sc-sdx-accordion-arrow-h, [hover=true][arrow-position=left].sc-sdx-accordion-arrow-h, [hover=true][arrow-position=right].sc-sdx-accordion-arrow-h{position:relative}[hover=true][arrow-position=center].sc-sdx-accordion-arrow-h:after, [hover=true][arrow-position=center].sc-sdx-accordion-arrow-h:before, [hover=true][arrow-position=left].sc-sdx-accordion-arrow-h:after, [hover=true][arrow-position=left].sc-sdx-accordion-arrow-h:before, [hover=true][arrow-position=right].sc-sdx-accordion-arrow-h:after, [hover=true][arrow-position=right].sc-sdx-accordion-arrow-h:before{position:absolute;top:50%;-webkit-transition:all .2s cubic-bezier(.4,0,.2,1);transition:all .2s cubic-bezier(.4,0,.2,1);border-radius:3px;background:#0851da;width:20px;height:3px;-webkit-backface-visibility:hidden;backface-visibility:hidden;content:\"\"}[hover=true][arrow-position=center].sc-sdx-accordion-arrow-h:before, [hover=true][arrow-position=left].sc-sdx-accordion-arrow-h:before, [hover=true][arrow-position=right].sc-sdx-accordion-arrow-h:before{left:0}[hover=true][arrow-position=center].sc-sdx-accordion-arrow-h:after, [hover=true][arrow-position=left].sc-sdx-accordion-arrow-h:after, [hover=true][arrow-position=right].sc-sdx-accordion-arrow-h:after{left:15px}[direction=up][arrow-position=center].sc-sdx-accordion-arrow-h:before, [direction=up][arrow-position=left].sc-sdx-accordion-arrow-h:before, [direction=up][arrow-position=right].sc-sdx-accordion-arrow-h:before{-webkit-transform:rotate(-35deg);transform:rotate(-35deg)}[direction=up][arrow-position=center].sc-sdx-accordion-arrow-h:after, [direction=up][arrow-position=left].sc-sdx-accordion-arrow-h:after, [direction=up][arrow-position=right].sc-sdx-accordion-arrow-h:after{-webkit-transform:rotate(35deg);transform:rotate(35deg)}[arrow-position=right].sc-sdx-accordion-arrow-h{display:inline-block;float:right}[arrow-position=left].sc-sdx-accordion-arrow-h{display:inline-block;float:left}[arrow-position=center].sc-sdx-accordion-arrow-h{display:table;margin:-13px auto 0;float:none}"; }
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
    static get style() { return ".sc-sdx-accordion-item-header-h{-webkit-box-sizing:border-box;box-sizing:border-box}*.sc-sdx-accordion-item-header, .sc-sdx-accordion-item-header:after, .sc-sdx-accordion-item-header:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sc-sdx-accordion-item-header-h   .header.sc-sdx-accordion-item-header{width:100%}.sc-sdx-accordion-item-header-h   .content.sc-sdx-accordion-item-header{color:#333;display:block;margin:0;padding:13px 13px 14px 19px;border:0;width:100%;cursor:pointer;outline:none}.sc-sdx-accordion-item-header-h   button.sc-sdx-accordion-item-header{font-family:inherit;margin:0;background:transparent;text-align:left}[arrow-position=left].sc-sdx-accordion-item-header-h   .header.sc-sdx-accordion-item-header{padding-left:10px}[arrow-position=left].sc-sdx-accordion-item-header-h   .header.sc-sdx-accordion-item-header, [arrow-position=right].sc-sdx-accordion-item-header-h   .header.sc-sdx-accordion-item-header{width:calc(100% - 35px);margin:0;display:inline-block;position:relative}[arrow-position=center].sc-sdx-accordion-item-header-h   .header.sc-sdx-accordion-item-header{display:none}[arrow-position=center].sc-sdx-accordion-item-header-h   .content.sc-sdx-accordion-item-header{width:100%;min-height:32px;border-top:1px solid #d6d6d6}"; }
}

export { Arrow as SdxAccordionArrow, Header as SdxAccordionItemHeader };
