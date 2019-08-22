export var MenuFlyoutActionTypes;
(function (MenuFlyoutActionTypes) {
    MenuFlyoutActionTypes["setDisplay"] = "SET_DISPLAY";
    MenuFlyoutActionTypes["setDirectionState"] = "SET_DIRECTION_STATE";
    MenuFlyoutActionTypes["setToggle"] = "SET_TOGGLE";
    MenuFlyoutActionTypes["setContentEl"] = "SET_CONTENT_EL";
    MenuFlyoutActionTypes["setToggleEl"] = "SET_TOGGLE_EL";
    MenuFlyoutActionTypes["toggleArrowEl"] = "TOGGLE_ARROW_EL";
})(MenuFlyoutActionTypes || (MenuFlyoutActionTypes = {}));
export const menuFlyoutReducer = (state = {}, action) => {
    switch (action.type) {
        case MenuFlyoutActionTypes.setDisplay:
            return Object.assign({}, state, { display: action.display });
        case MenuFlyoutActionTypes.setDirectionState:
            return Object.assign({}, state, { directionState: action.directionState });
        case MenuFlyoutActionTypes.setToggle:
            return Object.assign({}, state, { toggle: action.toggle });
        case MenuFlyoutActionTypes.setContentEl:
            return Object.assign({}, state, { contentEl: action.contentEl });
        case MenuFlyoutActionTypes.setToggleEl:
            return Object.assign({}, state, { toggleEl: action.toggleEl });
        case MenuFlyoutActionTypes.toggleArrowEl:
            if (state.arrowEls.indexOf(action.arrowEl) === -1) {
                return Object.assign({}, state, { arrowEls: [...state.arrowEls, action.arrowEl] });
            }
            return Object.assign({}, state, { arrowEls: state.arrowEls.filter((arrowEl) => arrowEl !== action.arrowEl) });
        default:
            return state;
    }
};
