export function bindObject(object: Record<string, string | number>): {
  bindings: Record<string, string | number>;
  placeholders: string;
} {
  let bindings: Record<string, any> = {};
  let placeholders: string = "";
  for (let [key, value] of Object.entries(object)) {
    if (!key.startsWith("$")) {
      key = `$${key}`;
    }
    bindings[key] = value;
    placeholders += `${key},`;
  }
  if (placeholders.endsWith(",")) {
    placeholders = placeholders.slice(0, -1);
  }
  return { bindings, placeholders };
}
export function bindArray(array: Array<string | number>): {
  bindings: Record<string, string | number>;
  placeholders: string;
} {
  let bindings: Record<string, any> = {};
  let placeholders: string = "";
  for (let i = 0; i < array.length; i++) {
    const key = `$${i}`;
    bindings[key] = array[i];
    placeholders += `${key},`;
  }
  if (placeholders.endsWith(",")) {
    placeholders = placeholders.slice(0, -1);
  }
  return { bindings, placeholders };
}
