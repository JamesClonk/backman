export class Item {
    constructor() {
        this.open = false;
    }
    activeItemChanged() {
        this.decideCollapseHeaderDisplay();
        this.decideCollapseBodyDisplay();
    }
    componentWillLoad() {
        this.setChildElementsReferences();
        this.decideCollapseHeaderDisplay();
    }
    componentDidLoad() {
        this.decideCollapseBodyDisplay();
    }
    setChildElementsReferences() {
        this.itemHeaderEl = this.el.querySelector("sdx-accordion-item-header");
        this.itemBodyEl = this.el.querySelector("sdx-accordion-item-body");
    }
    decideCollapseHeaderDisplay() {
        if (this.itemHeaderEl) {
            this.itemHeaderEl.setAttribute("expand", this.open.toString());
        }
    }
    decideCollapseBodyDisplay() {
        if (this.itemBodyEl) {
            this.itemBodyEl.toggle(this.open);
        }
    }
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-accordion-item"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "el": {
            "elementRef": true
        },
        "open": {
            "type": Boolean,
            "attr": "open",
            "watchCallbacks": ["activeItemChanged"]
        }
    }; }
    static get style() { return "/**style-placeholder:sdx-accordion-item:**/"; }
}
