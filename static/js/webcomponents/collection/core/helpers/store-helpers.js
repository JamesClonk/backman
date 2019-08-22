import { createStore } from "redux";
const storeProperty = "__store";
export function createAndInstallStore(component, reducer, initialState) {
    let store = component.el[storeProperty];
    if (!store) {
        store = component.el[storeProperty] = createStore(reducer, initialState);
    }
    return store;
}
export function getStore(component) {
    let store = component.el[storeProperty];
    if (store) {
        return store;
    }
    let currentEl = component.el;
    while (!store) {
        const shadowRootHost = currentEl.getRootNode && currentEl.getRootNode().host;
        currentEl = currentEl.parentElement || shadowRootHost;
        if (!currentEl) {
            break;
        }
        if (currentEl[storeProperty]) {
            store = currentEl[storeProperty];
            break;
        }
    }
    return store;
}
export function mapStateToProps(component, store, properties) {
    if (!store) {
        return () => undefined;
    }
    const updateComponent = () => {
        const state = store.getState();
        properties.forEach((property) => {
            if (component.hasOwnProperty(property) && state.hasOwnProperty(property)) {
                component[property] = state[property];
            }
        });
    };
    updateComponent();
    const unsubscribe = store.subscribe(updateComponent);
    return unsubscribe;
}
