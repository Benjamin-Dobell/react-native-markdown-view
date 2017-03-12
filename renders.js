/* @flow */

import React from 'react'

import {
  Image,
  Text,
  View,
} from 'react-native'

import type {
  CodeBlockNode,
  EmptyNode,
  HeadingNode,
  ImageNode,
  InlineContentNode,
  LinkNode,
  ListNode,
  TableNode,
  TextNode,
  OutputFunction,
  RenderState,
  RenderStyles,
} from './types'

const blockWrapStyle = Object.freeze({
  lineHeight: 0,
  includeFontPadding: false,
})

function renderTextBlock(styleName, styleName2) {
  return (node: InlineContentNode, output: OutputFunction, state: RenderState, styles: RenderStyles) => (
    <Text key={state.key}>
      <Text style={blockWrapStyle}>{'\n'}</Text>
      <Text style={styleName2 ? [styles[styleName], styles[styleName2]] : styles[styleName]}>
        {typeof node.content === 'string' ? node.content : output(node.content, state)}
      </Text>
      <Text style={blockWrapStyle}>{'\n'}</Text>
    </Text>
  )
}

function renderTextContent(styleName) {
  return (node: InlineContentNode, output: OutputFunction, state: RenderState, styles: RenderStyles) => (
    <Text key={state.key} style={styles[styleName]}>
      {typeof node.content === 'string' ? node.content : output(node.content, state)}
    </Text>
  )
}

function paddedSize(size, style) {
  function either(a, b) {
    return a === undefined ? b : a
  }

  const {
    padding = 0,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
  } = style

  return {
    width: size.width + either(paddingLeft, padding) + either(paddingRight, padding),
    height: size.height + either(paddingTop, padding) + either(paddingBottom, padding)
  }
}

export default Object.freeze({
  blockQuote: renderTextBlock('blockQuote'),
  br: (node: EmptyNode, output: OutputFunction, state: RenderState, styles: RenderStyles) => (
    <Text key={state.key} style={styles.br}>
      {'\n\n'}
    </Text>
  ),
  codeBlock: renderTextBlock('codeBlock'),
  del: renderTextContent('del'),
  em: renderTextContent('em'),
  heading: (node: InlineContentNode, output: OutputFunction, state: RenderState, styles: RenderStyles) => (
    renderTextBlock('heading', 'heading' + node.level)(node, output, state, styles)
  ),
  hr: (node: EmptyNode, output: OutputFunction, state: RenderState, styles: RenderStyles) => (
    <View key={state.key} style={styles.hr}/>
  ),
  image: (node: ImageNode, output: OutputFunction, state: RenderState, styles: RenderStyles) => {
    const {imageWrapper: wrapperStyle, image: imageStyle} = styles
    return (
      <View key={state.key} style={node.width && node.height ? [wrapperStyle, paddedSize(node, wrapperStyle)] : wrapperStyle}>
        <Image source={{uri: node.target}} style={imageStyle}/>
      </View>
    )
  },
  inlineCode: renderTextContent('inlineCode'),
  link: renderTextContent('link'),
  // TODO: Implement
  list: (node: ListNode, output: OutputFunction, state: RenderState, styles: RenderStyles) => (
    <View key={state.key} style={styles.list}>
      {node.items.map((item, i) => (
        <View key={i} style={styles.listItem}>
          {
            node.ordered ?
              <Text style={styles.listItemNumber}>{`${i + 1}.`}</Text>
              :
              <Text style={styles.listItemBullet}>
                {styles.listItemBullet && styles.listItemBullet.content ? styles.listItemBullet.content : '\u2022'}
              </Text>
          }
          <Text style={node.ordered ? styles.listItemOrderedContent : styles.listItemUnorderedContent}>
            {output(item, state)}
          </Text>
        </View>
      ))}
    </View>
  ),
  newline: (node: EmptyNode, output: OutputFunction, state: RenderState, styles: RenderStyles) => (
    <Text key={state.key} style={styles.newline}>
      {'\n'}
    </Text>
  ),
  paragraph: renderTextContent('paragraph'),
  strong: renderTextContent('strong'),
  // TODO: Implement
  table: (node: TableNode, output: OutputFunction, state: RenderState, styles: RenderStyles) => (
    null
  ),
  text: renderTextContent('text'),
  u: renderTextContent('u')
})
