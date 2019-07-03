declare module "react-native-markdown-view" {
    import * as React from "react";
    import { ViewStyle, ImageStyle, TextStyle } from "react-native";

    interface MarkdownStyles {
        [key: string]: TextStyle | ImageStyle | ViewStyle;
        blockQuote?: TextStyle;
        codeBlock?: TextStyle;
        del?: TextStyle;
        em?: TextStyle;
        heading?: TextStyle;
        heading1?: TextStyle;
        heading2?: TextStyle;
        heading3?: TextStyle;
        heading4?: TextStyle;
        heading5?: TextStyle;
        heading6?: TextStyle;
        hr?: TextStyle;
        imageWrapper?: ViewStyle;
        image?: ImageStyle;
        inlineCode?: TextStyle;
        link?: TextStyle;
        list?: ViewStyle;
        listItem?: ViewStyle;
        listItemNumber?: ViewStyle;
        listItemBullet?: TextStyle;
        listItemOrderedContent?: TextStyle;
        listItemUnorderedContent?: TextStyle;
        paragraph?: TextStyle;
        strong?: TextStyle;
        table?: ViewStyle;
        tableHeaderCell?: ViewStyle;
        tableHeaderCellContent?: ViewStyle;
        tableCell?: ViewStyle;
        tableCellOddRow?: ViewStyle;
        tableCellEvenRow?: ViewStyle;
        tableCellLastRow?: ViewStyle;
        tableCellOddColumn?: ViewStyle;
        tableCellEvenColumn?: ViewStyle;
        tableCellLastColumn?: ViewStyle;
        tableCellContent?: ViewStyle;
        tableCellContentOddRow?: ViewStyle;
        tableCellContentEvenRow?: ViewStyle;
        tableCellContentLastRow?: ViewStyle;
        tableCellContentOddColumn?: ViewStyle;
        tableCellContentEvenColumn?: ViewStyle;
        tableCellContentLastColumn?: ViewStyle;
        u?: TextStyle;
    }

    type RegexComponents = string[]
    type NestedParseFunction = (x: string, s: any) => any
    type ParseState = any

    type NodeKey = string
    type OutputFunction = (node: Node, s: any) => any

    interface RenderState {
      key: string,
      onLinkPress?: (url: string) => void
    }

    type RenderStyle = object;

    interface RenderStyles {
        [key: string]: RenderStyle
    }

    interface MarkdownRule {
        match?: (x: string, state: RenderState, list: string[]) => RegExp | undefined | null
        parse?: (components: RegexComponents, parse: NestedParseFunction, state: ParseState) => any,
        render: (node: Node, output: OutputFunction, state: RenderState, style: RenderStyle) => any
    }

    interface MarkdownRules {
        [key: string]: MarkdownRule
    }

    /**
     * Set of properties applied to a MarkdownView
     * 
     * @see MarkdownView
     */
    interface MarkdownViewProps {
        rules?: MarkdownRules;
        /**
         * An object providing styles to be passed to a corresponding rule render method. Keys are
         * rule/node names and values are React Native style objects. If a style is defined here and a
         * default style exists, they will me merged, with style properties defined here taking
         * precedence.
         */
        styles?: MarkdownStyles;
        style?: ViewStyle | TextStyle | ImageStyle;
        /**
         * Callback function for when a link is pressed. The callback receives the URL of the link as a
         * string (first and only argument).
         */
        onLinkPress?: (url: string) => void;
    }

    /**
     * View hosting markdown text.
     */
    class MarkdownView extends React.Component<MarkdownViewProps> {}

    export { MarkdownView, MarkdownStyles, MarkdownRules };
}
