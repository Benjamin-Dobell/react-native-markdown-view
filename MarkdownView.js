/* @flow */

import React, {
  Component,
  PropTypes,
} from 'react'

import {
  View,
} from 'react-native'

import SimpleMarkdown from 'simple-markdown'

import DefaultRenders from './renders'
import DefaultStyles from './styles'

import type {
  Rules,
  Styles,
} from './types'

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

const IMAGE_LINK = "(?:\\[[^\\]]*\\]|[^\\]]|\\](?=[^\\[]*\\]))*"
const IMAGE_HREF_AND_TITLE = "\\s*<?((?:[^\\s\\\\]|\\\\.)*?)>?(?:\\s+['\"]([\\s\\S]*?)['\"])?"
const IMAGE_SIZE = "(?:\\s+=([0-9]+)x([0-9]+))?\\)\\s*"

const inlineRegex = (regex) => ((source, state) => state.inline ? regex.exec(source) : null)

const DefaultRules : Rules = Object.freeze(mergeRules(
  Object.assign(
    {},
    ...Object.entries(DefaultRenders).map(([nodeKey, render]) => ({[nodeKey]: {render: render}}))
  ),
  {
    image: {
      match: inlineRegex(new RegExp("^!\\[(" + IMAGE_LINK + ")\\]\\(" + IMAGE_HREF_AND_TITLE + IMAGE_SIZE)),
      parse: (capture, parse, state) => ({
        alt: capture[1],
        target: capture[2].replace(/\\([^0-9A-Za-z\s])/g, '$1'),
        title: capture[3],
        width: capture[4] ? parseInt(capture[4]) : undefined,
        height: capture[5] ? parseInt(capture[5]) : undefined,
      })
    }
  }
))

class MarkdownView extends Component {
  props: {
    style?: Object,
    rules?: Rules,
    styles?: Styles,
    children: string,
  }

  render() {
    const {rules = {}, styles = {}} = this.props

    const mergedStyles = mergeStyles(DefaultStyles, styles)
    const mergedRules = mergeRules(SimpleMarkdown.defaultRules, simpleMarkdownRules(mergeRules(DefaultRules, rules), mergedStyles))

    const ast = SimpleMarkdown.parserFor(mergedRules)(this.props.children + '\n\n', {inline: false})
    const render = SimpleMarkdown.reactFor(SimpleMarkdown.ruleOutput(mergedRules, 'react'))

    return (
      <View style={this.props.style}>
        {render(ast)}
      </View>
    )
  }
}

MarkdownView.propTypes = {
  ...View.propTypes,

  /**
   * An object overriding or providing additional rules for parsing and rendering Markdown. Keys
   * are rule names (you can define your own, or override existing rules), and values are an object
   * of the form:
   *
   *   {
   *     match: RegExp,
   *     parse: (match, nestedParse, state),
   *     render: (node, output, state, styles)
   *   }
   *
   * match: A Regex to be executed against the MarkdownView's text.
   *
   * parse: A function that returns an AST 'node' object to pass to the rules' render method. If
   *        the object returned has a 'type' key, rendering will be deferred to the rule matching
   *        the value of 'type'.
   *
   *   match: Return value of match.exec()
   *   nestedParse: (string, state) => object, call this to parse nested nodes.
   *   state: Parser state object, you can attach your own state properties if desirable.
   *
   * render: A function that returns the rendered node (and its children). Typically you'll return
   *         a React Native view component.
   *
   *   node: An AST node. Please refer to the Flow types in `types.js`.
   *   output: A function that can be used to render nested/children nodes. Typically you'll want
   *           call `output(node.children)` and use that as the content of the component you're
   *           returning.
   *   state: Renderer state object. You can attach your own state to this object and use it, for
   *          example, to render nodes differently depending on their parents/ancestors.
   *   styles: An object containing React Native styles that you can use for rendering components.
   *
   * Default rendering rules have keys:
   *
   *   heading, hr, codeBlock, blockQuote, list, table, newline, paragraph, link, image, em,
   *   strong, u, del, inlineCode, br, text
   *
   * Default parse-only rules (which defer rendering to another rule) have keys:
   *
   *   nptable, lheading, fence, def, escape, autolink, mailto, url, reflink, refimage,
   *
   */
  rules: PropTypes.objectOf(PropTypes.function),

  /**
   * An object providing styles to be passed to a corresponding rule render method. Keys are
   * rule/node names and values are React Native style objects. If a style is defined here and a
   * default style exists, they will me merged, with style properties defined here taking
   * precedence.
   */
  styles: PropTypes.objectOf(PropTypes.object),
}

export default MarkdownView
