import '../../../stencil.core';
import { MenuFlyoutState } from "../menu-flyout-store";
export declare class MenuFlyoutToggle {
    private store?;
    private unsubscribe;
    el: HTMLSdxMenuFlyoutToggleElement;
    display: MenuFlyoutState["display"];
    toggle: MenuFlyoutState["toggle"];
    onClick(): void;
    componentWillLoad(): void;
    componentDidUnload(): void;
    private dispatch;
    render(): JSX.Element;
}
