import '../../../stencil.core';
import { MenuFlyoutState } from "../menu-flyout-store";
export declare class MenuFlyoutCta {
    private store?;
    private unsubscribe;
    el: HTMLSdxMenuFlyoutListElement;
    directionState: MenuFlyoutState["directionState"];
    /**
     * Width of the flyout. If none is set, the Flyout grows dynamically (up to a certain point) based on the content.
     */
    size: "small" | "medium" | "large" | "auto";
    componentWillLoad(): void;
    componentDidUnload(): void;
    private dispatch;
    hostData(): {
        class: {
            [x: string]: boolean;
        };
    };
    render(): JSX.Element;
}
