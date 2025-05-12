// src/utils/jsonPythonUtils.ts
export const validateClassName = (name: string): string => {
  if (!name) return 'Class name cannot be empty';
  if (!/^[a-zA-Z_]/.test(name)) return 'Class name must start with a letter or underscore';
  if (/\s/.test(name)) return 'Class name cannot contain spaces';
  if (!/^[a-zA-Z0-9_]+$/.test(name)) return 'Class name can only contain letters, numbers, and underscores';
  return '';
};

export const EXAMPLE_JSON = `{
  "user": {
    "id": 123,
    "name": "John Doe",
    "active": true,
    "scores": [95, 88.5, 91],
    "address": {
      "street": "123 Main St",
      "zip": 10001,
      "coordinates": [40.7128, -74.0060]
    },
    "tags": ["admin", "premium", 1]
  }
}`;