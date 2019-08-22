import '../../stencil.core';
export declare class StickerCircle {
    private wrapperEl?;
    private stickerEl?;
    private resizeTimer?;
    /**
     * The size (diameter) in px.
     */
    size: number;
    /**
     * The content width at which the sticker should be normal size (nonscaled).
     */
    contentWidth?: number;
    /**
     * SDX predefined color class for the text and border.
     */
    colorClass: string;
    /**
     * SDX predefined color class (or transparent) for the sticker background.
     */
    bgColorClass: string;
    /**
     * Offset from the top edge, in % of the content's height.
     */
    top?: number;
    /**
     * Offset from the bottom edge, in % of the content's height.
     */
    bottom?: number;
    /**
     * Offset from the left edge, in % of the content's width.
     */
    left?: number;
    /**
     * Offset from the right edge, in % of the content's width.
     */
    right?: number;
    /**
     * Description text read by the screen reader.
     */
    srHint: string;
    /**
     * Listen to window resize events, and resize sticker accordingly
     */
    onWindowResizeThrottled(): void;
    componentDidLoad(): void;
    private resize;
    private getClasses;
    private getStyles;
    render(): JSX.Element[];
}
