import { useMemo, useState } from 'react';
import ToolPage from '../../components/ToolPage';
import { Callout, ClearButton, Field, FileDrop, Output, Panel, Segmented, TextArea, TwoPane } from '../../ui';
import type { JsonObject, JsonValue } from '../../types/json';
import { getErrorMessage } from '../../utils/errors';
import { looksLikeJson } from '../../utils/text';
import { useSourceText } from '../../hooks/useSourceText';

type Mode = 'auto' | 'xml' | 'json';

function xmlToJson(xmlString: string): string {
  const xmlDoc = new DOMParser().parseFromString(xmlString, 'text/xml');
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) throw new Error('Invalid XML format');

  const parseNode = (node: Element): JsonValue => {
    const children = Array.from(node.childNodes).filter((c): c is Element => c.nodeType === Node.ELEMENT_NODE);
    if (children.length === 0) return node.textContent?.trim() || '';

    const obj: JsonObject = {};
    if (node.attributes.length > 0) {
      const attrs: JsonObject = {};
      for (const attr of Array.from(node.attributes)) attrs[attr.name] = attr.value;
      obj['@attributes'] = attrs;
    }

    const groups: Record<string, Element[]> = {};
    for (const child of children) (groups[child.nodeName] ??= []).push(child);
    for (const [name, group] of Object.entries(groups)) {
      obj[name] = group.length === 1 ? parseNode(group[0]) : group.map(parseNode);
    }
    return obj;
  };

  const root = xmlDoc.documentElement;
  return JSON.stringify({ [root.nodeName]: parseNode(root) }, null, 2);
}

const escapeXmlText = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function jsonToXml(jsonString: string): string {
  const jsonObj = JSON.parse(jsonString);
  const rootName = Object.keys(jsonObj)[0];
  if (!rootName) throw new Error('The JSON needs one top-level key to use as the root element.');

  const serializeNode = (name: string, obj: JsonValue, indent = ''): string => {
    const newIndent = indent + '  ';
    if (typeof obj !== 'object' || obj === null) return `${indent}<${name}>${escapeXmlText(String(obj))}</${name}>`;
    // A nested array repeats the element rather than emitting numeric tags.
    if (Array.isArray(obj)) return obj.map((item) => serializeNode(name, item, indent)).join('\n');

    let xml = `${indent}<${name}`;
    const attributes = obj['@attributes'];
    if (attributes && typeof attributes === 'object' && !Array.isArray(attributes)) {
      for (const [attrName, attrValue] of Object.entries(attributes)) {
        xml += ` ${attrName}="${String(attrValue).replace(/"/g, '&quot;')}"`;
      }
    }

    const childKeys = Object.keys(obj).filter((key) => key !== '@attributes' && key !== '#text');
    if (childKeys.length === 0) {
      return obj['#text'] !== undefined ? `${xml}>${escapeXmlText(String(obj['#text']))}</${name}>` : `${xml}/>`;
    }

    xml += '>\n';
    for (const key of childKeys) {
      const value = obj[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          xml +=
            typeof item === 'object' && item !== null
              ? `${serializeNode(key, item, newIndent)}\n`
              : `${newIndent}<${key}>${escapeXmlText(String(item))}</${key}>\n`;
        }
      } else if (typeof value === 'object' && value !== null) {
        xml += `${serializeNode(key, value, newIndent)}\n`;
      } else {
        xml += `${newIndent}<${key}>${escapeXmlText(String(value))}</${key}>\n`;
      }
    }
    return `${xml}${indent}</${name}>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${serializeNode(rootName, jsonObj[rootName])}`;
}

function convert(input: string, mode: Mode): { out: string; to: 'xml' | 'json' } {
  const toXml = mode === 'json' || (mode === 'auto' && looksLikeJson(input));
  return toXml ? { out: jsonToXml(input), to: 'xml' } : { out: xmlToJson(input), to: 'json' };
}

/**
 * One pane in, one pane out. Direction is detected from the input (JSON
 * starts with { or [) and can be forced with the switch.
 */
export default function XmlJsonConverter() {
  const { text: input, setText: setInput, fileBase, loadFile, clear: clearSource } = useSourceText();
  const [mode, setMode] = useState<Mode>('auto');

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return { ...convert(input, mode), error: '' };
    } catch (e) {
      return { out: '', to: null, error: getErrorMessage(e, 'Could not parse the input.') };
    }
  }, [input, mode]);

  const to = result?.to ?? null;
  const fileName = `${fileBase || 'converted'}.${to ?? 'txt'}`;

  return (
    <ToolPage id="xml_json">
      <Panel
        title="Convert"
        actions={
          <>
            <Segmented
              size="sm"
              label="Direction"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'xml', label: 'XML → JSON' },
                { value: 'json', label: 'JSON → XML' },
              ]}
            />
            <ClearButton
              onClick={clearSource}
              disabled={!input}
            />
          </>
        }
      >
        <TwoPane>
          <Field
            label="Input"
            htmlFor="xj-input"
            hint={to ? `Detected ${to === 'json' ? 'XML' : 'JSON'}; converting to ${to.toUpperCase()}.` : 'Paste XML or JSON. Direction is detected automatically.'}
          >
            <TextArea
              id="xj-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'<note id="1">\n  <to>Ada</to>\n  <body>Hello</body>\n</note>'}
              rows={12}
              stats
              autoFocus
              aria-invalid={Boolean(result?.error) || undefined}
            />
            <FileDrop
              className="mt-3"
              accept=".xml,.json"
              label="Load a file"
              onFile={loadFile}
              onClear={clearSource}
            />
          </Field>
          <Output
            label={to ? `Output · ${to.toUpperCase()}` : 'Output'}
            value={result?.out ?? ''}
            rows={12}
            fileName={fileName}
            mime={to === 'json' ? 'application/json' : 'application/xml'}
          />
        </TwoPane>
        {result?.error && (
          <Callout tone="error" className="mt-4">
            {result.error}
          </Callout>
        )}
      </Panel>
    </ToolPage>
  );
}
