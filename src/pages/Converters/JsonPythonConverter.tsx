import { JsonTypePage } from '../../components/JsonTypePage';
import { pyFieldName, pyImports, pyType } from '../../utils/jsonPythonUtils';
import { collectObjects, type Schema } from '../../utils/jsonSchema';

/**
 * One `@dataclass` per object, dependencies first. Keys missing from some
 * array items become `Optional[T] = None` and are listed last, because a
 * dataclass field with a default cannot precede one without. A key that is
 * not a Python identifier is renamed and the original kept in a comment.
 */
function emitDataclasses(schema: Schema): string {
  const used = new Set<string>();
  const classes = collectObjects(schema).map((obj) => {
    const fields = obj.fields.map((f) => {
      const name = pyFieldName(f.key);
      const type = pyType(f.schema, used);
      const note = name === f.key ? '' : `  # ${JSON.stringify(f.key)}`;
      return f.optional ? { optional: true, line: `    ${name}: ${nullable(type)} = None${note}` } : { optional: false, line: `    ${name}: ${type}${note}` };
    });
    if (fields.some((f) => f.optional)) used.add('Optional');
    const lines = [...fields.filter((f) => !f.optional), ...fields.filter((f) => f.optional)].map((f) => f.line);
    return ['@dataclass', `class ${obj.name}:`, ...(lines.length ? lines : ['    pass'])].join('\n');
  });
  return [pyImports(used, ['from dataclasses import dataclass']).join('\n'), ...classes].join('\n\n') + '\n';
}

const nullable = (type: string) => (type.startsWith('Optional[') ? type : `Optional[${type}]`);

export default function JsonPythonConverter() {
  return (
    <JsonTypePage
      id="json_python"
      nameLabel="Root class name"
      nameHint="Nested objects become classes named after their path, for example RootAddress."
      defaultName="Root"
      outputLabel="Python dataclasses"
      fileStem="models"
      ext="py"
      mime="text/x-python"
      placeholder={'{\n  "id": 1,\n  "name": "Ada",\n  "joined": "2024-01-31"\n}'}
      emit={emitDataclasses}
    />
  );
}
