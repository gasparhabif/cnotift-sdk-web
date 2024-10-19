function deepEqual(x: any, y: any): boolean {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y;
  return x && y && tx === 'object' && tx === ty
    ? ok(x).length === ok(y).length &&
        ok(x).every((key) => deepEqual(x[key], y[key]))
    : x === y;
}

function notDeepEqual(x: any, y: any): boolean {
  return !deepEqual(x, y);
}

export const MetadataComparison = {
  areEqual: deepEqual,
  areNotEqual: notDeepEqual,
};
