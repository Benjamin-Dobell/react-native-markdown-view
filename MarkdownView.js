/* @flow */

import React, {memo, useMemo} from 'react'

import {View} from 'react-native'

import SimpleMarkdown from 'simple-markdown'

import DefaultRenders from './renders'
import DefaultStyles from './styles'

import type {ImageNode, Rules, Styles} from './types'

function simpleMarkdownRule(rule, styles) {
  const {render, ...properties} = rule
  const reactRender = render ? {react: (node, output, state) => render(node, output, state, styles)} : null
  return {...properties, ...reactRender}
}

function simpleMarkdownRules(rules, styles) {
  const markdownRules = {}
  Object.keys(rules).forEach(nodeKey => markdownRules[nodeKey] = simpleMarkdownRule(rules[nodeKey], styles))
  return markdownRules
}

function mergeStyles(baseStyles, styles) {
  const mergedStyles = {...styles}
  Object.keys(baseStyles).forEach(nodeKey => mergedStyles[nodeKey] = styles[nodeKey] ? [baseStyles[nodeKey], styles[nodeKey]] : baseStyles[nodeKey])
  return mergedStyles
}

function mergeRules(baseRules, rules) {
  const mergedRules = {...rules}
  Object.keys(baseRules).forEach(nodeKey => mergedRules[nodeKey] = {...baseRules[nodeKey], ...rules[nodeKey]})
  return mergedRules
}

const IMAGE_LINK = "(?:\\[[^\\]]*\\]|[^\\[\\]]|\\](?=[^\\[]*\\]))*";
const IMAGE_HREF_AND_TITLE = "\\s*<?((?:[^\\s\\\\]|\\\\.)*?)>?(?:\\s+['\"]([\\s\\S]*?)['\"])?"
const IMAGE_SIZE = "(?:\\s+=([0-9]+)?x([0-9]+)?)?\\)\\s*"

const inlineRegex = (regex) => ((source, state) => state.inline ? regex.exec(source) : null)
const unescapeUrl = (url) => url.replace(/\\([^0-9A-Za-z\s])/g, '$1')

const DefaultRules : Rules = Object.freeze(mergeRules(
  Object.assign(
    {},
    ...Object.entries(DefaultRenders).map(([nodeKey, render]) => ({[nodeKey]: {render: render}}))
  ),
  {
    heading: {
      match: SimpleMarkdown.blockRegex(/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n *)*\n/),
    },
    image: {
      match: inlineRegex(new RegExp("^!\\[(" + IMAGE_LINK + ")\\]\\(" + IMAGE_HREF_AND_TITLE + IMAGE_SIZE)),
      parse: (capture, parse, state): ImageNode => ({
        alt: capture[1],
        target: unescapeUrl(capture[2]),
        title: capture[3],
        width: capture[4] ? parseInt(capture[4]) : undefined,
        height: capture[5] ? parseInt(capture[5]) : undefined,
      })
    }
  }
))

const emptyObject = {};

const MarkdownView = ({style, rules = emptyObject, onLinkPress, changeParsingResult, styles = emptyObject, children}: {
  style?: Object,
  rules?: Rules,
  onLinkPress?: (string) => void,
  changeParsingResult?: (any) => any,
  styles?: Styles,
  children: string,
}) => {
  const content = useMemo(() => {
    const mergedStyles = mergeStyles(DefaultStyles, styles);
    const mergedRules = mergeRules(SimpleMarkdown.defaultRules, simpleMarkdownRules(mergeRules(DefaultRules, rules), mergedStyles));

    const markdown = (Array.isArray(children) ? children.join('') : children) + '\n\n'

    let ast = SimpleMarkdown.parserFor(mergedRules)(markdown, {inline: false})
    if(changeParsingResult) {
      ast = changeParsingResult(ast);
    }
    const render = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(mergedRules, 'react'))
    const initialRenderState = {onLinkPress: onLinkPress};

    return render(ast, initialRenderState);
  }, [styles, rules, onLinkPress, children, changeParsingResult]);

  return (
    <View style={style}>
      {content}
    </View>
  )
}

export default memo(MarkdownView);
