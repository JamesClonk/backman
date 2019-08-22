export class LoadingSpinner {
    render() {
        return (h("div", { class: "component" }));
    }
    static get is() { return "sdx-loading-spinner"; }
    static get encapsulation() { return "shadow"; }
    static get style() { return "/**style-placeholder:sdx-loading-spinner:**/"; }
}
