export class Dummy {
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-dummy"; }
    static get encapsulation() { return "shadow"; }
}
