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
  it('should accept empty attributes and empty children', () => {
    let element = new ElementNode('div', [], []);
    expect(element.nodeType).toBe(NODE_TYPE_ELEMENT);
    expect(element.nodeName).toBe('div');
    expect(element.attributes).toBeAn(Array);
    expect(element.attributes.length).toBe(0);
    expect(element.childNodes).toEqual([]);
  });

  it('should accept null attributes and some children', () => {
    let textNode = new TextNode('Hello World');
    let element = new ElementNode('div', null, [textNode]);
    expect(element.attributes).toBeAn(Array);
    expect(element.attributes.length).toBe(0);
    expect(element.toString()).toBe('<div>Hello World</div>');
  });

  it('should accept null attributes and null children', () => {
    let element = new ElementNode('div');
    expect(element.attributes).toBeAn(Array);
    expect(element.attributes.length).toBe(0);
    expect(element.toString()).toBe('<div></div>');
  });

  it('should ignore children for self-closing (void) tags', () => {
    let p = new ElementNode('p');
    let element = new ElementNode('hr', null, [p]);
    expect(element.childNodes.length).toBe(0);
    expect(element.toString()).toBe('<hr>');
  });

  it('should stringify correctly', () => {
    let br = new ElementNode('br');
    let p = new ElementNode('p', null, [br, br]);
    let attrs = [{name: 'className', value: 'foo'}];
    let element = new ElementNode('div', attrs, [p]);
    expect(element.childNodes.length).toBe(1);
    let firstChild = element.childNodes[0];
    // Weird branching to make Flow happy.
    if (firstChild instanceof ElementNode) {
      expect(firstChild.childNodes.length).toBe(2);
    } else {
      expect(firstChild).toBeAn(ElementNode);
    }
    expect(element.toString()).toBe('<div className="foo"><p><br><br></p></div>');
    expect(element.toString(true)).toBe('<div className="foo"><p><br/><br/></p></div>');
  });
});
