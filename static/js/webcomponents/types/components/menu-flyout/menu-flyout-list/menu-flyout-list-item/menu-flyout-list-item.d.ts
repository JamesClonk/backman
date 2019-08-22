import '../../../../stencil.core';
import { MenuFlyoutState } from "../../menu-flyout-store";
export declare class MenuFlyoutListItem {
    private store?;
    private unsubscribe;
    private arrowEl?;
    el: HTMLSdxMenuFlyoutElement;
    directionState: MenuFlyoutState["directionState"];
    /**
     * If the item is not selectable, it is neither highlighted nor has it cursor: pointer.
     */
    selectable: boolean;
    /**
     * The URL this item should link to (if it’s a regular link not handled by JS).
     */
    href: string;
    /**
     * Whether the item is disabled.
     */
    disabled: boolean;
    componentWillLoad(): void;
    componentDidLoad(): void;
    componentDidUnload(): void;
    private dispatch;
    hostData(): {
        class: {
            [x: string]: boolean;
            selectable: boolean;
            disabled: boolean;
        };
    };
    render(): JSX.Element;
}
