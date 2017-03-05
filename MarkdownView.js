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

const DefaultRules : Rules = Object.freeze(Object.assign({},
  ...Object.entries(DefaultRenders).map(([nodeKey, render]) => ({[nodeKey]: {render: render}}))
))

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
   * are rule/node names (you can define your own, and values are an object of the form:
   *
   *   {
   *     match: RegExp,
   *     parse: (capture, nestedParse, state),
   *     render: (node, output, state, styles)
   *   }
   *
   *   match: A Regex to matched against the Markdown string that activates the rule.
   *   parse: A function that returns an object to parse to the rules' render method.
   *     capture: Return value of match.exec()
   *     nestedParse: (string, state) => object, call this to parse nested nodes.
   *     state: Parser state object, you can attach your own state properties if desirable.
   *
   * Default rules are provided with rule names:
   *
   *   heading, hr, codeBlock, blockQuote, list, table, newline, paragraph, link, image, em,
   *   strong, u, del, inlineCode, br, text
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
