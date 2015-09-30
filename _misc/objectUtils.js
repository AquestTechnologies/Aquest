export function copy(a) {
  const o = {};
  for (let k in a) {
    if (a.hasOwnProperty(k)) {
      o[k] = a[k];
    }
  }
  return o;
}

export function deepCopy(a) {
  if (typeof a === 'object') {
    if (a === null) return null;
    else if (a instanceof Date) return new Date(a);
    else if (a instanceof RegExp) return new RegExp(a);
    else if (Array.isArray(a)) return a.map(i => deepCopy(i));
    else {
      const b = {};
      for (let k in a) {
        if (a.hasOwnProperty(k)) {
          b[k] = deepCopy(a[k]);
        }
      }
      return b;
    }
  } 
  else return a;
}

export function merge(t, s) {
  for (let k in s) {
    if (s.hasOwnProperty(k)) t[k] = s[k];
  }
  return t;
}

export function deepMerge(t, s) {

  for (let k in s) {
    if (s.hasOwnProperty(k)) {
      const val = s[k];
      if (typeof val === 'object' && Object.getPrototypeOf(val) === Object.prototype) t[k] = deepMerge(t[k], val);
      else t[k] = val;
    }
  }

  return t;
}

export function fuse(a, b) {
  const o = {};
  for (let k in a) {
    if (a.hasOwnProperty(k)) o[k] = a[k];
  }
  for (let k in b) {
    if (b.hasOwnProperty(k)) o[k] = b[k];
  }
  return o;
}
