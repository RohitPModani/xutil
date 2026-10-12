import { JsonTypePage } from '../../components/JsonTypePage';
import { pyFieldName, pyImports, pyType } from '../../utils/jsonPythonUtils';
import { collectObjects, type Schema } from '../../utils/jsonSchema';

/**
 * One `BaseModel` per object, dependencies first. Keys missing from some
 * array items become `Optional[T] = None`; a key that is not a Python
 * identifier is renamed with `Field(alias=...)` so the JSON still loads.
 * No validators: Pydantic parses ISO dates and datetimes on its own.
 */
function emitPydantic(schema: Schema): string {
  const used = new Set<string>();
  let needsField = false;
  const classes = collectObjects(schema).map((obj) => {
    const lines = obj.fields.map((f) => {
      const name = pyFieldName(f.key);
      let type = pyType(f.schema, used);
      if (f.optional && !type.startsWith('Optional[')) {
        used.add('Optional');
        type = `Optional[${type}]`;
      }
      const alias = name === f.key ? '' : `alias=${JSON.stringify(f.key)}`;
      if (alias) needsField = true;
      const def = alias ? ` = Field(${f.optional ? 'None, ' : ''}${alias})` : f.optional ? ' = None' : '';
      return `    ${name}: ${type}${def}`;
    });
    return [`class ${obj.name}(BaseModel):`, ...(lines.length ? lines : ['    pass'])].join('\n');
  });
  const header = pyImports(used, [`from pydantic import BaseModel${needsField ? ', Field' : ''}`]);
  return [header.join('\n'), ...classes].join('\n\n') + '\n';
}

export default function JsonPydanticConverter() {
  return (
    <JsonTypePage
      id="json_pydantic"
      nameLabel="Root model name"
      nameHint="Nested objects become models named after their path, for example RootAddress."
      defaultName="Root"
      outputLabel="Pydantic models"
      fileStem="models"
      ext="py"
      mime="text/x-python"
      placeholder={'{\n  "id": 1,\n  "name": "Ada",\n  "joined": "2024-01-31"\n}'}
      emit={emitPydantic}
    />
  );
}
