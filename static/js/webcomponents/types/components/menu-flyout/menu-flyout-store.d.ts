import { Reducer } from "redux";
import { Direction } from "./types";
import { Display } from "../../core/types/types";
export declare enum MenuFlyoutActionTypes {
    setDisplay = "SET_DISPLAY",
    setDirectionState = "SET_DIRECTION_STATE",
    setToggle = "SET_TOGGLE",
    setContentEl = "SET_CONTENT_EL",
    setToggleEl = "SET_TOGGLE_EL",
    toggleArrowEl = "TOGGLE_ARROW_EL"
}
export interface MenuFlyoutState {
    display: Display;
    directionState: Direction;
    toggle: () => Promise<void>;
    contentEl: HTMLSdxMenuFlyoutListElement | HTMLSdxMenuFlyoutCtaElement | undefined;
    toggleEl: HTMLSdxMenuFlyoutToggleElement | undefined;
    arrowEls: HTMLElement[];
}
export interface SetDisplayAction {
    type: MenuFlyoutActionTypes.setDisplay;
    display: MenuFlyoutState["display"];
}
export interface SetDirectionStateAction {
    type: MenuFlyoutActionTypes.setDirectionState;
    directionState: MenuFlyoutState["directionState"];
}
export interface SetToggleAction {
    type: MenuFlyoutActionTypes.setToggle;
    toggle: MenuFlyoutState["toggle"];
}
export interface SetContentElAction {
    type: MenuFlyoutActionTypes.setContentEl;
    contentEl: MenuFlyoutState["contentEl"];
}
export interface SetToggleElAction {
    type: MenuFlyoutActionTypes.setToggleEl;
    toggleEl: MenuFlyoutState["toggleEl"];
}
export interface ToggleArrowElArrow {
    type: MenuFlyoutActionTypes.toggleArrowEl;
    arrowEl: HTMLElement;
}
export declare type MenuFlyoutActions = SetDisplayAction | SetDirectionStateAction | SetToggleAction | SetContentElAction | SetToggleElAction | ToggleArrowElArrow;
export declare const menuFlyoutReducer: Reducer<MenuFlyoutState, MenuFlyoutActions>;
