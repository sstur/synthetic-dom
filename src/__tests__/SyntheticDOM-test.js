/* @flow */
const {describe, it} = global;
import expect from 'expect';
import {
  TextNode,
  NODE_TYPE_TEXT,
  ElementNode,
  NODE_TYPE_ELEMENT,
} from '../SyntheticDOM';

describe('Text Nodes', () => {
  let textNode = new TextNode('Hello World');
  it('should get created properly', () => {
    expect(textNode.nodeType).toBe(NODE_TYPE_TEXT);
    expect(textNode.nodeName).toBe('#text');
    expect(textNode.nodeValue).toBe('Hello World');
  });
});

describe('Elements', () => {
  let emptyAttributes = [];
  let element = new ElementNode('div', emptyAttributes, []);
  it('should get created properly', () => {
    expect(element.nodeType).toBe(NODE_TYPE_ELEMENT);
    expect(element.nodeName).toBe('div');
    expect(element.attributes).toBe(emptyAttributes);
    expect(element.childNodes).toEqual([]);
  });
});
