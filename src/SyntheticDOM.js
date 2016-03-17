/* @flow */

type Attr = [string, string];
type MapList = {[key: string]: boolean};

export const NODE_TYPE_ELEMENT = 1;
export const NODE_TYPE_TEXT = 3;
export const NODE_TYPE_FRAGMENT = 11;
export const SELF_CLOSING: MapList = {
  area: true, base: true, br: true, col: true, embed: true, hr: true, img: true,
  input: true, keygen: true, link: true, meta: true, param: true, source: true,
  track: true, wbr: true,
};

export class Node {
  nodeType: number;
  nodeName: string;
  nodeValue: string;
}

export class TextNode extends Node {
  constructor(value: string) {
    super(...arguments);
    this.nodeType = NODE_TYPE_TEXT;
    this.nodeName = '#text';
    this.nodeValue = value;
  }

  toString(): string {
    return escape(this.nodeValue);
  }
}

export class ElementNode extends Node {
  childNodes: Array<Node>;
  attributes: Map<string, string>;
  isSelfClosing: boolean;

  constructor(name: string, attributes: ?Array<Attr>, childNodes: ?Array<Node>) {
    super(...arguments);
    let isSelfClosing = (SELF_CLOSING[name] === true);
    this.nodeType = NODE_TYPE_ELEMENT;
    this.nodeName = name;
    this.attributes = (attributes == null) ? new Map() : new Map(attributes);
    this.childNodes = [];
    this.isSelfClosing = isSelfClosing;
    if (!isSelfClosing && childNodes) {
      childNodes.forEach(this.appendChild, this);
    }
  }

  appendChild(node: Node) {
    if (node.nodeType === NODE_TYPE_FRAGMENT) {
      if (node.childNodes != null) {
        this.childNodes.push(...node.childNodes);
      }
    } else {
      this.childNodes.push(node);
    }
  }

  getAttribute(name: string): ?string {
    return this.attributes.get(name);
  }

  toString(isXHTML: ?boolean): string {
    let attributes = [];
    for (let [name, value] of this.attributes.entries()) {
      attributes.push(name + (value ? '="' + escapeAttr(value) + '"' : ''));
    }
    let attrString = attributes.length ? ' ' + attributes.join(' ') : '';
    if (this.isSelfClosing) {
      return '<' + this.nodeName + attrString + (isXHTML ? '/>' : '>');
    }
    let childNodes = this.childNodes.map((node) => node.toString(isXHTML)).join('');
    return '<' + this.nodeName + attrString + '>' + childNodes + '</' + this.nodeName + '>';
  }
}

export class FragmentNode extends Node {
  childNodes: Array<Node>;

  constructor(childNodes: Array<Node>) {
    super(...arguments);
    this.nodeType = NODE_TYPE_FRAGMENT;
    this.childNodes = [];
    if (childNodes) {
      childNodes.forEach(this.appendChild, this);
    }
  }

  appendChild(node: Node) {
    if (node.nodeType === NODE_TYPE_FRAGMENT) {
      if (node.childNodes != null) {
        this.childNodes.push(...node.childNodes);
      }
    } else {
      this.childNodes.push(node);
    }
  }

  toString(isXHTML: boolean): string {
    return this.childNodes.map((node) => node.toString(isXHTML)).join('');
  }
}

function escape(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
