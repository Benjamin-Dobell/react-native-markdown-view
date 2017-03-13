/* @flow */

// AST Nodes

export type CodeBlockNode = {
  lang: ?string,
  content: string,
}

export type EmptyNode = {
}

export type HeadingNode = {
  level: number,
  content: InlineNode,
}

export type ImageNode = {
  alt: string,
  target: string,
  title: string,
  width?: number,
  height?: number,
}

export type InlineContentNode = {
  content: InlineNode,
}

export type LinkNode = {
  content: Node,
  target: string,
  title?: ?string,
}

export type ListNode = {
  ordered: boolean,
  start: number,
  items: InlineNode[],
}

export type TableAlign = 'right' | 'center' | 'left' | null

export type TableNode = {
  header: InlineNode[],
  align: TableAlign,
  cells: InlineNode[][],
}

export type TextNode = {
  content: string,
}

export type InlineNode = EmptyNode |
  ImageNode |
  InlineContentNode |
  LinkNode |
  TextNode

export type Node = InlineNode |
  CodeBlockNode |
  HeadingNode |
  ListNode |
  TableNode

// Rules

export type RegexComponents = string[]
export type NestedParseFunction = (string, any) => ?Object
export type ParseState = Object

export type ParseFunction = (RegexComponents, NestedParseFunction, ParseState) => any

export type NodeKey = string
export type OutputFunction = (Node, Object) => ?any
export type RenderState = {
  key: string,
  onLinkPress: ?(string) => void
}
export type RenderStyle = Object
export type RenderStyles = {[key: NodeKey]: RenderStyle}

export type RenderFunction = (Node, OutputFunction, RenderState, RenderStyle) => ?any

export type Rule = {match?: (string, RenderState, string[]) => ?RegExp, parse?: ParseFunction, render?: RenderFunction}
export type Rules = {[key: NodeKey]: Rule}

// Styles

export type Styles = {[key: NodeKey]: ?Object}
