import * as yaml from 'js-yaml';
import { TwoWayConverter, type Format } from '../../components/TwoWayConverter';
import { describeJsonError } from '../../utils/json';
import { looksLikeJson } from '../../utils/text';

/**
 * The core schema keeps `2024-01-01` a string and `0o17` an integer (the
 * default schema turns the first into a Date). A stream of several `---`
 * documents becomes a JSON array.
 */
function yamlToJson(input: string): string {
  let docs: unknown[];
  try {
    docs = yaml.loadAll(input, null, { schema: yaml.CORE_SCHEMA });
  } catch (e) {
    if (e instanceof yaml.YAMLException && e.mark) {
      // An end-of-stream error is marked one past the last line.
      const line = Math.min(e.mark.line + 1, input.split('\n').length);
      throw new Error(`Line ${line}, column ${e.mark.column + 1}: ${e.reason}`);
    }
    throw e;
  }
  return JSON.stringify(docs.length > 1 ? docs : (docs[0] ?? null), null, 2);
}

function jsonToYaml(input: string): string {
  try {
    return yaml.dump(JSON.parse(input), { lineWidth: -1 });
  } catch (e) {
    throw new Error(describeJsonError(e, input));
  }
}

const isJson = (input: string) => {
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
};

const FORMATS: [Format, Format] = [
  { label: 'YAML', ext: 'yaml', mime: 'application/x-yaml' },
  { label: 'JSON', ext: 'json', mime: 'application/json', json: true },
];

/** Flow-style YAML such as `{a: 1}` looks like JSON but is not; only real JSON goes to the JSON side. */
const detect = (input: string): 0 | 1 => (looksLikeJson(input) && isJson(input) ? 1 : 0);

const convert = (input: string, from: 0 | 1) => (from === 1 ? jsonToYaml(input) : yamlToJson(input));

export default function YamlJsonConverter() {
  return <TwoWayConverter id="yaml_json" formats={FORMATS} accept=".yaml,.yml,.json" detect={detect} convert={convert} placeholder={'name: xutil\ntools:\n  - jwt\n  - yaml'} />;
}
