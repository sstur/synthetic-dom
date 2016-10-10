/* @flow */

type Attr = {name: string; value: string};
type AttrList = Array<Attr>;
type MapList = {[key: string]: boolean};

const EMPTY_ATTR_LIST: AttrList = [];

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
  attributes: AttrList;
  attrMap: Map<string, Attr>;
  isSelfClosing: boolean;

  constructor(name: string, attributes: ?AttrList, childNodes: ?Array<Node>) {
    super(...arguments);
    if (attributes == null) {
      attributes = EMPTY_ATTR_LIST;
    }
    let isSelfClosing = (SELF_CLOSING[name] === true);
    this.nodeType = NODE_TYPE_ELEMENT;
    this.nodeName = name;
    this.attributes = attributes;
    this.attrMap = new Map(attributes.map((attr) => [attr.name, attr]));
    this.childNodes = [];
    this.isSelfClosing = isSelfClosing;
    if (!isSelfClosing && childNodes) {
      childNodes.forEach(this.appendChild, this);
    }
  }

  appendChild(node: Node) {
    if (node.nodeType === NODE_TYPE_FRAGMENT) {
      if (node.childNodes != null) {
        // $FlowIssue - Flow doesn't realize that node is a FragmentNode.
        let childNodes: Array<Node> = node.childNodes;
        this.childNodes.push(...childNodes);
      }
    } else {
      this.childNodes.push(node);
    }
  }

  getAttribute(name: string): ?string {
    let attr = this.attrMap.get(name);
    if (attr) {
      return attr.value;
    }
  }

  toString(isXHTML: ?boolean): string {
    let attributes = [];
    for (let {name, value} of this.attributes) {
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
        // $FlowIssue - Flow doesn't realize that node is a FragmentNode.
        let childNodes: Array<Node> = node.childNodes;
        this.childNodes.push(...childNodes);
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
