const DEFAULT_ARROW_POSITION = "none";
export class Header {
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
    static get style() { return "/**style-placeholder:sdx-accordion-item-header:**/"; }
}
