import '../../stencil.core';
import { Size, Flip } from "./types";
export declare class Icon {
    private iconEl?;
    private animationDuration;
    private easing;
    /**
     * Name of the SDX icon (e.g. "icon-202-clear-circle").
     */
    iconName: string;
    /**
     * SDX predefined color class.
     */
    colorClass: string;
    /**
     * The dimension of the icon.
     */
    size: Size;
    /**
     * Mirror the icon.
     */
    flip: Flip;
    /**
     * Hide the icon (animated).
     */
    hidden: boolean;
    /**
     * Description text read by the screen reader.
     */
    srHint: string;
    hiddenChanged(): void;
    componentDidLoad(): void;
    /**
     * Set initial styles for animation.
     */
    private setInitialStyles;
    private getFlipTransformStyle;
    private getClassNames;
    render(): JSX.Element[];
}
