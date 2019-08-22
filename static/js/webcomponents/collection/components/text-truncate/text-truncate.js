import * as wcHelpers from "../../core/helpers/webcomponent-helpers";
export class TextTruncate {
    doesSlotContainHTML() {
        return wcHelpers.getAllSlotChildNodes(this.el).some((node) => node.nodeType === 1);
    }
    getComponentClassNames() {
        return {
            component: true,
            ellipsis: !this.doesSlotContainHTML()
        };
    }
    render() {
        return (h("div", { class: this.getComponentClassNames() },
            h("div", { class: "slot" },
                h("slot", null))));
    }
    static get is() { return "sdx-text-truncate"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "el": {
            "elementRef": true
        }
    }; }
    static get style() { return "/**style-placeholder:sdx-text-truncate:**/"; }
}
