import { MenuFlyoutActionTypes } from "../menu-flyout-store";
import { mapStateToProps, getStore } from "../../../core/helpers/store-helpers";
export class MenuFlyoutList {
    componentWillLoad() {
        this.store = getStore(this);
        this.unsubscribe = mapStateToProps(this, this.store, []);
        this.dispatch({ type: MenuFlyoutActionTypes.setContentEl, contentEl: this.el });
    }
    componentDidUnload() {
        this.dispatch({ type: MenuFlyoutActionTypes.setContentEl, contentEl: undefined });
        this.unsubscribe();
    }
    dispatch(action) {
        if (this.store) {
            this.store.dispatch(action);
        }
    }
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-menu-flyout-list"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "el": {
            "elementRef": true
        }
    }; }
    static get style() { return "/**style-placeholder:sdx-menu-flyout-list:**/"; }
}
