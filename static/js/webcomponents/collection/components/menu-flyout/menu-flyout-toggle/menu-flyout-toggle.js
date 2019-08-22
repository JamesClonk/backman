import { MenuFlyoutActionTypes } from "../menu-flyout-store";
import { mapStateToProps, getStore } from "../../../core/helpers/store-helpers";
export class MenuFlyoutToggle {
    onClick() {
        this.toggle();
    }
    componentWillLoad() {
        this.store = getStore(this);
        this.unsubscribe = mapStateToProps(this, this.store, [
            "display",
            "toggle"
        ]);
        this.dispatch({ type: MenuFlyoutActionTypes.setToggleEl, toggleEl: this.el });
    }
    componentDidUnload() {
        this.dispatch({ type: MenuFlyoutActionTypes.setToggleEl, toggleEl: undefined });
        this.unsubscribe();
    }
    dispatch(action) {
        if (this.store) {
            this.store.dispatch(action);
        }
    }
    render() {
        return (h("sdx-button", { theme: "transparent" },
            h("slot", null)));
    }
    static get is() { return "sdx-menu-flyout-toggle"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "display": {
            "state": true
        },
        "el": {
            "elementRef": true
        },
        "toggle": {
            "state": true
        }
    }; }
    static get listeners() { return [{
            "name": "click",
            "method": "onClick"
        }]; }
    static get style() { return "/**style-placeholder:sdx-menu-flyout-toggle:**/"; }
}
