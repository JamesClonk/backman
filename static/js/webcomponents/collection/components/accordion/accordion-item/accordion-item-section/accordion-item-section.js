export class Section {
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-accordion-item-section"; }
    static get encapsulation() { return "shadow"; }
    static get style() { return "/**style-placeholder:sdx-accordion-item-section:**/"; }
}
