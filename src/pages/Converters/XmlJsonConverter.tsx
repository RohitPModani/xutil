import { TwoWayConverter, type Format } from '../../components/TwoWayConverter';
import type { JsonObject, JsonValue } from '../../types/json';
import { describeJsonError } from '../../utils/json';
import { looksLikeJson } from '../../utils/text';

const ATTRS = '@attributes';
const TEXT = '#text';

/**
 * Attributes go under `@attributes`, text that sits beside child elements
 * or attributes under `#text`, repeated siblings become an array, and an
 * element with nothing but text becomes that text.
 */
function xmlToJson(input: string): string {
  const doc = new DOMParser().parseFromString(input, 'text/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    // Chromium wraps the message in a <div>; Firefox puts it straight in the element.
    const detail = (parserError.querySelector('div') ?? parserError).textContent?.trim() ?? '';
    throw new Error(detail.replace(/^error on /, 'Error on ').split('\n')[0] || 'Invalid XML.');
  }

  const parseNode = (node: Element): JsonValue => {
    const children = Array.from(node.childNodes).filter((c): c is Element => c.nodeType === Node.ELEMENT_NODE);
    const text = Array.from(node.childNodes)
      .filter((c) => c.nodeType === Node.TEXT_NODE || c.nodeType === Node.CDATA_SECTION_NODE)
      .map((c) => c.nodeValue?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
    if (children.length === 0 && node.attributes.length === 0) return text;

    const obj: JsonObject = {};
    if (node.attributes.length > 0) {
      const attrs: JsonObject = {};
      for (const attr of Array.from(node.attributes)) attrs[attr.name] = attr.value;
      obj[ATTRS] = attrs;
    }
    const groups: Record<string, Element[]> = {};
    for (const child of children) (groups[child.nodeName] ??= []).push(child);
    for (const [name, group] of Object.entries(groups)) obj[name] = group.length === 1 ? parseNode(group[0]) : group.map(parseNode);
    if (text) obj[TEXT] = text;
    return obj;
  };

  const root = doc.documentElement;
  return JSON.stringify({ [root.nodeName]: parseNode(root) }, null, 2);
}

const escapeXml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// XML Name production, ASCII plus any non-ASCII letter-ish code point.
const NAME_RE = /^[A-Za-z_:À-￿][\w.\-:·À-￿]*$/;
const xmlName = (name: string, what = 'element') => {
  if (!NAME_RE.test(name)) throw new Error(`"${name}" is not a valid XML ${what} name.`);
  return name;
};

/**
 * One top-level key whose value is not an array becomes the root element;
 * anything else is wrapped in `<root>`. An `@attributes` object becomes
 * attributes, `#text` the element text, `null` an empty element and an
 * array repeats the element once per item.
 */
function jsonToXml(input: string): string {
  let data: JsonValue;
  try {
    data = JSON.parse(input) as JsonValue;
  } catch (e) {
    throw new Error(describeJsonError(e, input));
  }

  const serialize = (name: string, value: JsonValue, indent: string): string => {
    xmlName(name);
    if (Array.isArray(value)) return value.map((item) => serialize(name, item, indent)).join('\n');
    if (value === null) return `${indent}<${name}/>`;
    if (typeof value !== 'object') return `${indent}<${name}>${escapeXml(String(value))}</${name}>`;

    let open = `${indent}<${name}`;
    const attrs = value[ATTRS];
    if (attrs && typeof attrs === 'object' && !Array.isArray(attrs)) {
      for (const [k, v] of Object.entries(attrs)) open += ` ${xmlName(k, 'attribute')}="${escapeXml(v === null ? '' : String(v))}"`;
    }
    const text = value[TEXT];
    const textLine = text === undefined || text === null ? '' : escapeXml(typeof text === 'object' ? JSON.stringify(text) : String(text));
    const childKeys = Object.keys(value).filter((k) => k !== ATTRS && k !== TEXT);
    if (childKeys.length === 0) return textLine ? `${open}>${textLine}</${name}>` : `${open}/>`;

    const inner = indent + '  ';
    const lines = childKeys.map((k) => serialize(k, value[k], inner));
    if (textLine) lines.unshift(inner + textLine);
    return `${open}>\n${lines.join('\n')}\n${indent}</${name}>`;
  };

  const keys = data !== null && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data) : [];
  const single = keys.length === 1 && !Array.isArray((data as JsonObject)[keys[0]]);
  const body = single ? serialize(keys[0], (data as JsonObject)[keys[0]], '') : serialize('root', Array.isArray(data) ? { item: data } : data, '');
  return `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
}

const FORMATS: [Format, Format] = [
  { label: 'XML', ext: 'xml', mime: 'application/xml' },
  { label: 'JSON', ext: 'json', mime: 'application/json', json: true },
];

const detect = (input: string): 0 | 1 => (looksLikeJson(input) ? 1 : 0);

const convert = (input: string, from: 0 | 1) => (from === 1 ? jsonToXml(input) : xmlToJson(input));

export default function XmlJsonConverter() {
  return <TwoWayConverter id="xml_json" formats={FORMATS} accept=".xml,.json" detect={detect} convert={convert} wrapOutput={false} placeholder={'<note id="1">\n  <to>Ada</to>\n  <body>Hello</body>\n</note>'} />;
}
