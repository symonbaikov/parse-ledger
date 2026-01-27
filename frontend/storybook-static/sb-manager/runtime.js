const Nd = Object.create;
const tn = Object.defineProperty;
const Rd = Object.getOwnPropertyDescriptor;
const Fd = Object.getOwnPropertyNames;
const Hd = Object.getPrototypeOf;
const Bd = Object.prototype.hasOwnProperty;
const a = (e, t) => tn(e, 'name', { value: t, configurable: !0 });
const ro = /* @__PURE__ */ (e =>
  typeof require < 'u'
    ? require
    : typeof Proxy < 'u'
      ? new Proxy(e, {
          get: (t, o) => (typeof require < 'u' ? require : t)[o],
        })
      : e)(function (e) {
  if (typeof require < 'u') return require.apply(this, arguments);
  throw Error(`Dynamic require of "${e}" is not supported`);
});
const Ee = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
const zd = (e, t, o, i) => {
  if ((t && typeof t === 'object') || typeof t === 'function')
    for (const n of Fd(t))
      !Bd.call(e, n) &&
        n !== o &&
        tn(e, n, { get: () => t[n], enumerable: !(i = Rd(t, n)) || i.enumerable });
  return e;
};
const ze = (e, t, o) => (
  (o = e != null ? Nd(Hd(e)) : {}),
  zd(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    t || !e || !e.__esModule ? tn(o, 'default', { value: e, enumerable: !0 }) : o,
    e,
  )
);

// ../node_modules/prop-types/lib/ReactPropTypesSecret.js
const ya = Ee((yw, ga) => {
  const jd = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
  ga.exports = jd;
});

// ../node_modules/prop-types/factoryWithThrowingShims.js
const Sa = Ee((bw, xa) => {
  const Vd = ya();
  function ba() {}
  a(ba, 'emptyFunction');
  function va() {}
  a(va, 'emptyFunctionWithReset');
  va.resetWarningCache = ba;
  xa.exports = () => {
    function e(i, n, r, l, u, c) {
      if (c !== Vd) {
        const p = new Error(
          'Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. \
Read more at http://fb.me/use-check-prop-types',
        );
        throw ((p.name = 'Invariant Violation'), p);
      }
    }
    a(e, 'shim'), (e.isRequired = e);
    function t() {
      return e;
    }
    a(t, 'getShim');
    const o = {
      array: e,
      bigint: e,
      bool: e,
      func: e,
      number: e,
      object: e,
      string: e,
      symbol: e,
      any: e,
      arrayOf: t,
      element: e,
      elementType: e,
      instanceOf: t,
      node: e,
      objectOf: t,
      oneOf: t,
      oneOfType: t,
      shape: t,
      exact: t,
      checkPropTypes: va,
      resetWarningCache: ba,
    };
    return (o.PropTypes = o), o;
  };
});

// ../node_modules/prop-types/index.js
const pn = Ee((Iw, Ia) => {
  Ia.exports = Sa()();
  let xw;
  let Sw;
});

// ../node_modules/react-fast-compare/index.js
const _a = Ee((Ew, Ea) => {
  const Kd = typeof Element < 'u';
  const $d = typeof Map === 'function';
  const Ud = typeof Set === 'function';
  const Gd = typeof ArrayBuffer === 'function' && !!ArrayBuffer.isView;
  function jo(e, t) {
    if (e === t) return !0;
    if (e && t && typeof e === 'object' && typeof t === 'object') {
      if (e.constructor !== t.constructor) return !1;
      let o;
      let i;
      let n;
      if (Array.isArray(e)) {
        if (((o = e.length), o !== t.length)) return !1;
        for (i = o; i-- !== 0; ) if (!jo(e[i], t[i])) return !1;
        return !0;
      }
      let r;
      if ($d && e instanceof Map && t instanceof Map) {
        if (e.size !== t.size) return !1;
        for (r = e.entries(); !(i = r.next()).done; ) if (!t.has(i.value[0])) return !1;
        for (r = e.entries(); !(i = r.next()).done; )
          if (!jo(i.value[1], t.get(i.value[0]))) return !1;
        return !0;
      }
      if (Ud && e instanceof Set && t instanceof Set) {
        if (e.size !== t.size) return !1;
        for (r = e.entries(); !(i = r.next()).done; ) if (!t.has(i.value[0])) return !1;
        return !0;
      }
      if (Gd && ArrayBuffer.isView(e) && ArrayBuffer.isView(t)) {
        if (((o = e.length), o !== t.length)) return !1;
        for (i = o; i-- !== 0; ) if (e[i] !== t[i]) return !1;
        return !0;
      }
      if (e.constructor === RegExp) return e.source === t.source && e.flags === t.flags;
      if (
        e.valueOf !== Object.prototype.valueOf &&
        typeof e.valueOf === 'function' &&
        typeof t.valueOf === 'function'
      )
        return e.valueOf() === t.valueOf();
      if (
        e.toString !== Object.prototype.toString &&
        typeof e.toString === 'function' &&
        typeof t.toString === 'function'
      )
        return e.toString() === t.toString();
      if (((n = Object.keys(e)), (o = n.length), o !== Object.keys(t).length)) return !1;
      for (i = o; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(t, n[i])) return !1;
      if (Kd && e instanceof Element) return !1;
      for (i = o; i-- !== 0; )
        if (
          !((n[i] === '_owner' || n[i] === '__v' || n[i] === '__o') && e.$$typeof) &&
          !jo(e[n[i]], t[n[i]])
        )
          return !1;
      return !0;
    }
    return e !== e && t !== t;
  }
  a(jo, 'equal');
  Ea.exports = /* @__PURE__ */ a((t, o) => {
    try {
      return jo(t, o);
    } catch (i) {
      if ((i.message || '').match(/stack|recursion/i))
        return console.warn('react-fast-compare cannot handle circular refs'), !1;
      throw i;
    }
  }, 'isEqual');
});

// ../node_modules/invariant/browser.js
const Ta = Ee((ww, wa) => {
  const Yd = /* @__PURE__ */ a((e, t, o, i, n, r, l, u) => {
    if (!e) {
      let c;
      if (t === void 0)
        c = new Error(
          'Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.',
        );
      else {
        const p = [o, i, n, r, l, u];
        let d = 0;
        (c = new Error(t.replace(/%s/g, () => p[d++]))), (c.name = 'Invariant Violation');
      }
      throw ((c.framesToPop = 1), c);
    }
  }, 'invariant');
  wa.exports = Yd;
});

// ../node_modules/shallowequal/index.js
const ka = Ee((Cw, Ca) => {
  Ca.exports = /* @__PURE__ */ a((t, o, i, n) => {
    let r = i ? i.call(n, t, o) : void 0;
    if (r !== void 0) return !!r;
    if (t === o) return !0;
    if (typeof t !== 'object' || !t || typeof o !== 'object' || !o) return !1;
    const l = Object.keys(t);
    const u = Object.keys(o);
    if (l.length !== u.length) return !1;
    for (let c = Object.prototype.hasOwnProperty.bind(o), p = 0; p < l.length; p++) {
      const d = l[p];
      if (!c(d)) return !1;
      const g = t[d];
      const h = o[d];
      if (((r = i ? i.call(n, g, h, d) : void 0), r === !1 || (r === void 0 && g !== h))) return !1;
    }
    return !0;
  }, 'shallowEqual');
});

// ../node_modules/memoizerific/memoizerific.js
const zn = Ee((El, Bn) => {
  (function (e) {
    if (typeof El === 'object' && typeof Bn < 'u') Bn.exports = e();
    else if (typeof define === 'function' && define.amd) define([], e);
    else {
      let t;
      typeof window < 'u'
        ? (t = window)
        : typeof global < 'u'
          ? (t = global)
          : typeof self < 'u'
            ? (t = self)
            : (t = this),
        (t.memoizerific = e());
    }
  })(() => {
    let e;
    let t;
    let o;
    return /* @__PURE__ */ a(function i(n, r, l) {
      function u(d, g) {
        if (!r[d]) {
          if (!n[d]) {
            const h = typeof ro === 'function' && ro;
            if (!g && h) return h(d, !0);
            if (c) return c(d, !0);
            const y = new Error(`Cannot find module '${d}'`);
            throw ((y.code = 'MODULE_NOT_FOUND'), y);
          }
          const f = (r[d] = { exports: {} });
          n[d][0].call(
            f.exports,
            b => {
              const I = n[d][1][b];
              return u(I || b);
            },
            f,
            f.exports,
            i,
            n,
            r,
            l,
          );
        }
        return r[d].exports;
      }
      a(u, 's');
      for (let c = typeof ro === 'function' && ro, p = 0; p < l.length; p++) u(l[p]);
      return u;
    }, 'e')(
      {
        1: [
          (i, n, r) => {
            n.exports = l => {
              if (typeof Map !== 'function' || l) {
                const u = i('./similar');
                return new u();
              }
              return /* @__PURE__ */ new Map();
            };
          },
          { './similar': 2 },
        ],
        2: [
          (i, n, r) => {
            function l() {
              return (this.list = []), (this.lastItem = void 0), (this.size = 0), this;
            }
            a(l, 'Similar'),
              (l.prototype.get = function (u) {
                let c;
                if (this.lastItem && this.isEqual(this.lastItem.key, u)) return this.lastItem.val;
                if (((c = this.indexOf(u)), c >= 0))
                  return (this.lastItem = this.list[c]), this.list[c].val;
              }),
              (l.prototype.set = function (u, c) {
                let p;
                return this.lastItem && this.isEqual(this.lastItem.key, u)
                  ? ((this.lastItem.val = c), this)
                  : ((p = this.indexOf(u)),
                    p >= 0
                      ? ((this.lastItem = this.list[p]), (this.list[p].val = c), this)
                      : ((this.lastItem = { key: u, val: c }),
                        this.list.push(this.lastItem),
                        this.size++,
                        this));
              }),
              (l.prototype.delete = function (u) {
                let c;
                if (
                  (this.lastItem && this.isEqual(this.lastItem.key, u) && (this.lastItem = void 0),
                  (c = this.indexOf(u)),
                  c >= 0)
                )
                  return this.size--, this.list.splice(c, 1)[0];
              }),
              (l.prototype.has = function (u) {
                let c;
                return this.lastItem && this.isEqual(this.lastItem.key, u)
                  ? !0
                  : ((c = this.indexOf(u)), c >= 0 ? ((this.lastItem = this.list[c]), !0) : !1);
              }),
              (l.prototype.forEach = function (u, c) {
                let p;
                for (p = 0; p < this.size; p++)
                  u.call(c || this, this.list[p].val, this.list[p].key, this);
              }),
              (l.prototype.indexOf = function (u) {
                let c;
                for (c = 0; c < this.size; c++) if (this.isEqual(this.list[c].key, u)) return c;
                return -1;
              }),
              (l.prototype.isEqual = (u, c) => u === c || (u !== u && c !== c)),
              (n.exports = l);
          },
          {},
        ],
        3: [
          (i, n, r) => {
            const l = i('map-or-similar');
            n.exports = d => {
              const g = new l(!1);
              const h = [];
              return y => {
                const f = /* @__PURE__ */ a(() => {
                  let b = g;
                  let I;
                  let _;
                  const m = arguments.length - 1;
                  const v = Array(m + 1);
                  let S = !0;
                  let E;
                  if ((f.numArgs || f.numArgs === 0) && f.numArgs !== m + 1)
                    throw new Error(
                      'Memoizerific functions should always be called with the same number of arguments',
                    );
                  for (E = 0; E < m; E++) {
                    if (
                      ((v[E] = {
                        cacheItem: b,
                        arg: arguments[E],
                      }),
                      b.has(arguments[E]))
                    ) {
                      b = b.get(arguments[E]);
                      continue;
                    }
                    (S = !1), (I = new l(!1)), b.set(arguments[E], I), (b = I);
                  }
                  return (
                    S && (b.has(arguments[m]) ? (_ = b.get(arguments[m])) : (S = !1)),
                    S || ((_ = y.apply(null, arguments)), b.set(arguments[m], _)),
                    d > 0 &&
                      ((v[m] = {
                        cacheItem: b,
                        arg: arguments[m],
                      }),
                      S ? u(h, v) : h.push(v),
                      h.length > d && c(h.shift())),
                    (f.wasMemoized = S),
                    (f.numArgs = m + 1),
                    _
                  );
                }, 'memoizerific');
                return (f.limit = d), (f.wasMemoized = !1), (f.cache = g), (f.lru = h), f;
              };
            };
            function u(d, g) {
              const h = d.length;
              const y = g.length;
              let f;
              let b;
              let I;
              for (b = 0; b < h; b++) {
                for (f = !0, I = 0; I < y; I++)
                  if (!p(d[b][I].arg, g[I].arg)) {
                    f = !1;
                    break;
                  }
                if (f) break;
              }
              d.push(d.splice(b, 1)[0]);
            }
            a(u, 'moveToMostRecentLru');
            function c(d) {
              const g = d.length;
              let h = d[g - 1];
              let y;
              let f;
              for (
                h.cacheItem.delete(h.arg), f = g - 2;
                f >= 0 && ((h = d[f]), (y = h.cacheItem.get(h.arg)), !y || !y.size);
                f--
              )
                h.cacheItem.delete(h.arg);
            }
            a(c, 'removeCachedResult');
            function p(d, g) {
              return d === g || (d !== d && g !== g);
            }
            a(p, 'isEqual');
          },
          { 'map-or-similar': 1 },
        ],
      },
      {},
      [3],
    )(3);
  });
});

// ../node_modules/picoquery/lib/string-util.js
const jn = Ee(Wn => {
  Object.defineProperty(Wn, '__esModule', { value: !0 });
  Wn.encodeString = xm;
  const rt = Array.from(
    { length: 256 },
    (e, t) => `%${((t < 16 ? '0' : '') + t.toString(16)).toUpperCase()}`,
  );
  const vm = new Int8Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0,
  ]);
  function xm(e) {
    const t = e.length;
    if (t === 0) return '';
    let o = '';
    let i = 0;
    let n = 0;
    e: for (; n < t; n++) {
      let r = e.charCodeAt(n);
      while (r < 128) {
        if ((vm[r] !== 1 && (i < n && (o += e.slice(i, n)), (i = n + 1), (o += rt[r])), ++n === t))
          break e;
        r = e.charCodeAt(n);
      }
      if ((i < n && (o += e.slice(i, n)), r < 2048)) {
        (i = n + 1), (o += rt[192 | (r >> 6)] + rt[128 | (r & 63)]);
        continue;
      }
      if (r < 55296 || r >= 57344) {
        (i = n + 1), (o += rt[224 | (r >> 12)] + rt[128 | ((r >> 6) & 63)] + rt[128 | (r & 63)]);
        continue;
      }
      if ((++n, n >= t)) throw new Error('URI malformed');
      const l = e.charCodeAt(n) & 1023;
      (i = n + 1),
        (r = 65536 + (((r & 1023) << 10) | l)),
        (o +=
          rt[240 | (r >> 18)] +
          rt[128 | ((r >> 12) & 63)] +
          rt[128 | ((r >> 6) & 63)] +
          rt[128 | (r & 63)]);
    }
    return i === 0 ? e : i < t ? o + e.slice(i) : o;
  }
  a(xm, 'encodeString');
});

// ../node_modules/picoquery/lib/shared.js
const ur = Ee(nt => {
  Object.defineProperty(nt, '__esModule', { value: !0 });
  nt.defaultOptions = nt.defaultShouldSerializeObject = nt.defaultValueSerializer = void 0;
  const Vn = jn();
  const Sm = /* @__PURE__ */ a(e => {
    switch (typeof e) {
      case 'string':
        return (0, Vn.encodeString)(e);
      case 'bigint':
      case 'boolean':
        return `${e}`;
      case 'number':
        if (Number.isFinite(e)) return e < 1e21 ? `${e}` : (0, Vn.encodeString)(`${e}`);
        break;
    }
    return e instanceof Date ? (0, Vn.encodeString)(e.toISOString()) : '';
  }, 'defaultValueSerializer');
  nt.defaultValueSerializer = Sm;
  const Im = /* @__PURE__ */ a(e => e instanceof Date, 'defaultShouldSerializeObject');
  nt.defaultShouldSerializeObject = Im;
  const wl = /* @__PURE__ */ a(e => e, 'identityFunc');
  nt.defaultOptions = {
    nesting: !0,
    nestingSyntax: 'dot',
    arrayRepeat: !1,
    arrayRepeatSyntax: 'repeat',
    delimiter: 38,
    valueDeserializer: wl,
    valueSerializer: nt.defaultValueSerializer,
    keyDeserializer: wl,
    shouldSerializeObject: nt.defaultShouldSerializeObject,
  };
});

// ../node_modules/picoquery/lib/object-util.js
const Kn = Ee(cr => {
  Object.defineProperty(cr, '__esModule', { value: !0 });
  cr.getDeepObject = wm;
  cr.stringifyObject = Tl;
  const Ot = ur();
  const Em = jn();
  function _m(e) {
    return e === '__proto__' || e === 'constructor' || e === 'prototype';
  }
  a(_m, 'isPrototypeKey');
  function wm(e, t, o, i, n) {
    if (_m(t)) return e;
    const r = e[t];
    return typeof r === 'object' && r !== null
      ? r
      : !i &&
          (n ||
            typeof o === 'number' ||
            (typeof o === 'string' && o * 0 === 0 && o.indexOf('.') === -1))
        ? (e[t] = [])
        : (e[t] = {});
  }
  a(wm, 'getDeepObject');
  const Tm = 20;
  const Cm = '[]';
  const km = '[';
  const Om = ']';
  const Pm = '.';
  function Tl(e, t, o, i, n) {
    const {
      nestingSyntax: r = Ot.defaultOptions.nestingSyntax,
      arrayRepeat: l = Ot.defaultOptions.arrayRepeat,
      arrayRepeatSyntax: u = Ot.defaultOptions.arrayRepeatSyntax,
      nesting: c = Ot.defaultOptions.nesting,
      delimiter: p = Ot.defaultOptions.delimiter,
      valueSerializer: d = Ot.defaultOptions.valueSerializer,
      shouldSerializeObject: g = Ot.defaultOptions.shouldSerializeObject,
    } = t;
    const h = typeof p === 'number' ? String.fromCharCode(p) : p;
    const y = n === !0 && l;
    const f = r === 'dot' || (r === 'js' && !n);
    if (o > Tm) return '';
    let b = '';
    let I = !0;
    let _ = !1;
    for (const m in e) {
      const v = e[m];
      let S;
      i
        ? ((S = i),
          y
            ? u === 'bracket' && (S += Cm)
            : f
              ? ((S += Pm), (S += m))
              : ((S += km), (S += m), (S += Om)))
        : (S = m),
        I || (b += h),
        typeof v === 'object' && v !== null && !g(v)
          ? ((_ = v.pop !== void 0), (c || (l && _)) && (b += Tl(v, t, o + 1, S, _)))
          : ((b += (0, Em.encodeString)(S)), (b += '='), (b += d(v, m))),
        I && (I = !1);
    }
    return b;
  }
  a(Tl, 'stringifyObject');
});

// ../node_modules/fast-decode-uri-component/index.js
const Pl = Ee((JO, Ol) => {
  const Cl = 12;
  const Am = 0;
  const $n = [
    // The first part of the table maps bytes to character to a transition.
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
    4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7, 10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4,
    // The second part of the table maps a state to a new state when adding a
    // transition.
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96, 0, 12, 12, 12,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 24, 24, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 48, 48, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    // The third part maps the current transition to a mask that needs to apply
    // to the byte.
    127, 63, 63, 63, 0, 31, 15, 15, 15, 7, 7, 7,
  ];
  function Dm(e) {
    let t = e.indexOf('%');
    if (t === -1) return e;
    for (let o = e.length, i = '', n = 0, r = 0, l = t, u = Cl; t > -1 && t < o; ) {
      const c = kl(e[t + 1], 4);
      const p = kl(e[t + 2], 0);
      const d = c | p;
      const g = $n[d];
      if (((u = $n[256 + u + g]), (r = (r << 6) | (d & $n[364 + g])), u === Cl))
        (i += e.slice(n, l)),
          (i +=
            r <= 65535
              ? String.fromCharCode(r)
              : String.fromCharCode(55232 + (r >> 10), 56320 + (r & 1023))),
          (r = 0),
          (n = t + 3),
          (t = l = e.indexOf('%', n));
      else {
        if (u === Am) return null;
        if (((t += 3), t < o && e.charCodeAt(t) === 37)) continue;
        return null;
      }
    }
    return i + e.slice(n);
  }
  a(Dm, 'decodeURIComponent');
  const Mm = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    a: 10,
    A: 10,
    b: 11,
    B: 11,
    c: 12,
    C: 12,
    d: 13,
    D: 13,
    e: 14,
    E: 14,
    f: 15,
    F: 15,
  };
  function kl(e, t) {
    const o = Mm[e];
    return o === void 0 ? 255 : o << t;
  }
  a(kl, 'hexCodeToInt');
  Ol.exports = Dm;
});

// ../node_modules/picoquery/lib/parse.js
const Ll = Ee(ct => {
  const Lm = ct?.__importDefault || (e => (e?.__esModule ? e : { default: e }));
  Object.defineProperty(ct, '__esModule', { value: !0 });
  ct.numberValueDeserializer = ct.numberKeyDeserializer = void 0;
  ct.parse = Fm;
  const pr = Kn();
  const Pt = ur();
  const Al = Lm(Pl());
  const Nm = /* @__PURE__ */ a(e => {
    const t = Number(e);
    return Number.isNaN(t) ? e : t;
  }, 'numberKeyDeserializer');
  ct.numberKeyDeserializer = Nm;
  const Rm = /* @__PURE__ */ a(e => {
    const t = Number(e);
    return Number.isNaN(t) ? e : t;
  }, 'numberValueDeserializer');
  ct.numberValueDeserializer = Rm;
  const Dl = /\+/g;
  const Ml = /* @__PURE__ */ a(() => {}, 'Empty');
  Ml.prototype = /* @__PURE__ */ Object.create(null);
  function dr(e, t, o, i, n) {
    let r = e.substring(t, o);
    return i && (r = r.replace(Dl, ' ')), n && (r = (0, Al.default)(r) || r), r;
  }
  a(dr, 'computeKeySlice');
  function Fm(e, t) {
    const {
      valueDeserializer: o = Pt.defaultOptions.valueDeserializer,
      keyDeserializer: i = Pt.defaultOptions.keyDeserializer,
      arrayRepeatSyntax: n = Pt.defaultOptions.arrayRepeatSyntax,
      nesting: r = Pt.defaultOptions.nesting,
      arrayRepeat: l = Pt.defaultOptions.arrayRepeat,
      nestingSyntax: u = Pt.defaultOptions.nestingSyntax,
      delimiter: c = Pt.defaultOptions.delimiter,
    } = t ?? {};
    const p = typeof c === 'string' ? c.charCodeAt(0) : c;
    const d = u === 'js';
    const g = new Ml();
    if (typeof e !== 'string') return g;
    const h = e.length;
    let y = '';
    let f = -1;
    let b = -1;
    let I = -1;
    let _ = g;
    let m;
    let v = '';
    let S = '';
    let E = !1;
    let T = !1;
    let C = !1;
    let k = !1;
    let w = !1;
    let O = !1;
    let P = !1;
    let D = 0;
    let M = -1;
    let N = -1;
    let Q = -1;
    for (let V = 0; V < h + 1; V++) {
      if (((D = V !== h ? e.charCodeAt(V) : p), D === p)) {
        if (
          ((P = b > f),
          P || (b = V),
          I !== b - 1 &&
            ((S = dr(e, I + 1, M > -1 ? M : b, C, E)),
            (v = i(S)),
            m !== void 0 && (_ = (0, pr.getDeepObject)(_, m, v, d && w, d && O))),
          P || v !== '')
        ) {
          P &&
            ((y = e.slice(b + 1, V)),
            k && (y = y.replace(Dl, ' ')),
            T && (y = (0, Al.default)(y) || y));
          const X = o(y, v);
          if (l) {
            const H = _[v];
            H === void 0
              ? M > -1
                ? (_[v] = [X])
                : (_[v] = X)
              : H.pop
                ? H.push(X)
                : (_[v] = [H, X]);
          } else _[v] = X;
        }
        (y = ''),
          (f = V),
          (b = V),
          (E = !1),
          (T = !1),
          (C = !1),
          (k = !1),
          (w = !1),
          (O = !1),
          (M = -1),
          (I = V),
          (_ = g),
          (m = void 0),
          (v = '');
      } else
        D === 93
          ? (l && n === 'bracket' && Q === 91 && (M = N),
            r &&
              (u === 'index' || d) &&
              b <= f &&
              (I !== N &&
                ((S = dr(e, I + 1, V, C, E)),
                (v = i(S)),
                m !== void 0 && (_ = (0, pr.getDeepObject)(_, m, v, void 0, d)),
                (m = v),
                (C = !1),
                (E = !1)),
              (I = V),
              (O = !0),
              (w = !1)))
          : D === 46
            ? r &&
              (u === 'dot' || d) &&
              b <= f &&
              (I !== N &&
                ((S = dr(e, I + 1, V, C, E)),
                (v = i(S)),
                m !== void 0 && (_ = (0, pr.getDeepObject)(_, m, v, d)),
                (m = v),
                (C = !1),
                (E = !1)),
              (w = !0),
              (O = !1),
              (I = V))
            : D === 91
              ? r &&
                (u === 'index' || d) &&
                b <= f &&
                (I !== N &&
                  ((S = dr(e, I + 1, V, C, E)),
                  (v = i(S)),
                  d && m !== void 0 && (_ = (0, pr.getDeepObject)(_, m, v, d)),
                  (m = v),
                  (C = !1),
                  (E = !1),
                  (w = !1),
                  (O = !0)),
                (I = V))
              : D === 61
                ? b <= f
                  ? (b = V)
                  : (T = !0)
                : D === 43
                  ? b > f
                    ? (k = !0)
                    : (C = !0)
                  : D === 37 && (b > f ? (T = !0) : (E = !0));
      (N = V), (Q = D);
    }
    return g;
  }
  a(Fm, 'parse');
});

// ../node_modules/picoquery/lib/stringify.js
const Nl = Ee(Un => {
  Object.defineProperty(Un, '__esModule', { value: !0 });
  Un.stringify = Bm;
  const Hm = Kn();
  function Bm(e, t) {
    if (e === null || typeof e !== 'object') return '';
    const o = t ?? {};
    return (0, Hm.stringifyObject)(e, o);
  }
  a(Bm, 'stringify');
});

// ../node_modules/picoquery/lib/main.js
const Rl = Ee(Ze => {
  const zm =
    Ze?.__createBinding ||
    (Object.create
      ? (e, t, o, i) => {
          i === void 0 && (i = o);
          let n = Object.getOwnPropertyDescriptor(t, o);
          (!n || ('get' in n ? !t.__esModule : n.writable || n.configurable)) &&
            (n = { enumerable: !0, get: /* @__PURE__ */ a(() => t[o], 'get') }),
            Object.defineProperty(e, i, n);
        }
      : (e, t, o, i) => {
          i === void 0 && (i = o), (e[i] = t[o]);
        });
  const Wm =
    Ze?.__exportStar ||
    ((e, t) => {
      for (const o in e)
        o !== 'default' && !Object.prototype.hasOwnProperty.call(t, o) && zm(t, e, o);
    });
  Object.defineProperty(Ze, '__esModule', { value: !0 });
  Ze.stringify = Ze.parse = void 0;
  const jm = Ll();
  Object.defineProperty(Ze, 'parse', {
    enumerable: !0,
    get: /* @__PURE__ */ a(() => jm.parse, 'get'),
  });
  const Vm = Nl();
  Object.defineProperty(Ze, 'stringify', {
    enumerable: !0,
    get: /* @__PURE__ */ a(() => Vm.stringify, 'get'),
  });
  Wm(ur(), Ze);
});

// ../node_modules/toggle-selection/index.js
const jl = Ee((EP, Wl) => {
  Wl.exports = () => {
    const e = document.getSelection();
    if (!e.rangeCount) return () => {};
    for (let t = document.activeElement, o = [], i = 0; i < e.rangeCount; i++)
      o.push(e.getRangeAt(i));
    switch (t.tagName.toUpperCase()) {
      // .toUpperCase handles XHTML
      case 'INPUT':
      case 'TEXTAREA':
        t.blur();
        break;
      default:
        t = null;
        break;
    }
    return (
      e.removeAllRanges(),
      () => {
        e.type === 'Caret' && e.removeAllRanges(),
          e.rangeCount ||
            o.forEach(n => {
              e.addRange(n);
            }),
          t?.focus();
      }
    );
  };
});

// ../node_modules/copy-to-clipboard/index.js
const $l = Ee((_P, Kl) => {
  const qm = jl();
  const Vl = {
    'text/plain': 'Text',
    'text/html': 'Url',
    default: 'Text',
  };
  const Qm = 'Copy to clipboard: #{key}, Enter';
  function Xm(e) {
    const t = `${/mac os x/i.test(navigator.userAgent) ? '\u2318' : 'Ctrl'}+C`;
    return e.replace(/#{\s*key\s*}/g, t);
  }
  a(Xm, 'format');
  function Zm(e, t) {
    let o;
    let i;
    let n;
    let r;
    let l;
    let u;
    let c = !1;
    t || (t = {}), (o = t.debug || !1);
    try {
      (n = qm()),
        (r = document.createRange()),
        (l = document.getSelection()),
        (u = document.createElement('span')),
        (u.textContent = e),
        (u.ariaHidden = 'true'),
        (u.style.all = 'unset'),
        (u.style.position = 'fixed'),
        (u.style.top = 0),
        (u.style.clip = 'rect(0, 0, 0, 0)'),
        (u.style.whiteSpace =
          'p\
re'),
        (u.style.webkitUserSelect = 'text'),
        (u.style.MozUserSelect = 'text'),
        (u.style.msUserSelect = 'text'),
        (u.style.userSelect = 'text'),
        u.addEventListener('copy', d => {
          if ((d.stopPropagation(), t.format))
            if ((d.preventDefault(), typeof d.clipboardData > 'u')) {
              o && console.warn('unable to use e.clipboardData'),
                o && console.warn('trying IE specific stuff'),
                window.clipboardData.clearData();
              const g = Vl[t.format] || Vl.default;
              window.clipboardData.setData(g, e);
            } else d.clipboardData.clearData(), d.clipboardData.setData(t.format, e);
          t.onCopy && (d.preventDefault(), t.onCopy(d.clipboardData));
        }),
        document.body.appendChild(u),
        r.selectNodeContents(u),
        l.addRange(r);
      const p = document.execCommand('copy');
      if (!p) throw new Error('copy command was unsuccessful');
      c = !0;
    } catch (d) {
      o && console.error('unable to copy using execCommand: ', d),
        o && console.warn('trying IE specific stuff');
      try {
        window.clipboardData.setData(t.format || 'text', e),
          t.onCopy?.(window.clipboardData),
          (c = !0);
      } catch (g) {
        o && console.error('unable to copy using clipboardData: ', g),
          o && console.error('falling back to prompt'),
          (i = Xm('message' in t ? t.message : Qm)),
          window.prompt(i, e);
      }
    } finally {
      l && (typeof l.removeRange === 'function' ? l.removeRange(r) : l.removeAllRanges()),
        u && document.body.removeChild(u),
        n();
    }
    return c;
  }
  a(Zm, 'copy');
  Kl.exports = Zm;
});

// ../node_modules/downshift/node_modules/react-is/cjs/react-is.production.min.js
const Uc = Ee(pe => {
  const ni = Symbol.for('react.element');
  const ii = Symbol.for('react.portal');
  const Tr = Symbol.for('react.fragment');
  const Cr =
    Symbol.for(
      'react.strict_mo\
de',
    );
  const kr = Symbol.for('react.profiler');
  const Or = Symbol.for('react.provider');
  const Pr = Symbol.for('react.context');
  const Xg =
    Symbol.for(
      'react.server_\
context',
    );
  const Ar = Symbol.for('react.forward_ref');
  const Dr = Symbol.for('react.suspense');
  const Mr = Symbol.for('react.suspense_list');
  const Lr = Symbol.for('react.memo');
  const Nr = Symbol.for('react.lazy');
  const Zg = Symbol.for('react.offscreen');
  let $c;
  $c = Symbol.for('react.module.reference');
  function Ke(e) {
    if (typeof e === 'object' && e !== null) {
      const t = e.$$typeof;
      switch (t) {
        case ni:
          switch (((e = e.type), e)) {
            case Tr:
            case kr:
            case Cr:
            case Dr:
            case Mr:
              return e;
            default:
              switch (((e = e?.$$typeof), e)) {
                case Xg:
                case Pr:
                case Ar:
                case Nr:
                case Lr:
                case Or:
                  return e;
                default:
                  return t;
              }
          }
        case ii:
          return t;
      }
    }
  }
  a(Ke, 'v');
  pe.ContextConsumer = Pr;
  pe.ContextProvider = Or;
  pe.Element = ni;
  pe.ForwardRef = Ar;
  pe.Fragment = Tr;
  pe.Lazy = Nr;
  pe.Memo = Lr;
  pe.Portal = ii;
  pe.Profiler = kr;
  pe.StrictMode = Cr;
  pe.Suspense = Dr;
  pe.SuspenseList = Mr;
  pe.isAsyncMode = () => !1;
  pe.isConcurrentMode = () => !1;
  pe.isContextConsumer = e => Ke(e) === Pr;
  pe.isContextProvider = e => Ke(e) === Or;
  pe.isElement = e => typeof e === 'object' && e !== null && e.$$typeof === ni;
  pe.isForwardRef = e => Ke(e) === Ar;
  pe.isFragment = e => Ke(e) === Tr;
  pe.isLazy = e => Ke(e) === Nr;
  pe.isMemo = e => Ke(e) === Lr;
  pe.isPortal = e => Ke(e) === ii;
  pe.isProfiler = e => Ke(e) === kr;
  pe.isStrictMode = e => Ke(e) === Cr;
  pe.isSuspense = e => Ke(e) === Dr;
  pe.isSuspenseList = e => Ke(e) === Mr;
  pe.isValidElementType = e =>
    typeof e === 'string' ||
    typeof e === 'function' ||
    e === Tr ||
    e === kr ||
    e === Cr ||
    e === Dr ||
    e === Mr ||
    e === Zg ||
    (typeof e === 'object' &&
      e !== null &&
      (e.$$typeof === Nr ||
        e.$$typeof === Lr ||
        e.$$typeof === Or ||
        e.$$typeof === Pr ||
        e.$$typeof === Ar ||
        e.$$typeof === $c ||
        e.getModuleId !== void 0));
  pe.typeOf = Ke;
});

// ../node_modules/downshift/node_modules/react-is/index.js
const Yc = Ee((oR, Gc) => {
  Gc.exports = Uc();
});

// ../node_modules/fuse.js/dist/fuse.js
const od = Ee((wo, Qi) => {
  ((e, t) => {
    typeof wo === 'object' && typeof Qi === 'object'
      ? (Qi.exports = t())
      : typeof define === 'function' && define.amd
        ? define('Fuse', [], t)
        : typeof wo === 'object'
          ? (wo.Fuse = t())
          : (e.Fuse = t());
  })(wo, () =>
    (e => {
      const t = {};
      function o(i) {
        if (t[i]) return t[i].exports;
        const n = (t[i] = { i, l: !1, exports: {} });
        return e[i].call(n.exports, n, n.exports, o), (n.l = !0), n.exports;
      }
      return (
        a(o, 'r'),
        (o.m = e),
        (o.c = t),
        (o.d = (i, n, r) => {
          o.o(i, n) || Object.defineProperty(i, n, { enumerable: !0, get: r });
        }),
        (o.r = i => {
          typeof Symbol < 'u' &&
            Symbol.toStringTag &&
            Object.defineProperty(i, Symbol.toStringTag, { value: 'Module' }),
            Object.defineProperty(i, '__esModule', { value: !0 });
        }),
        (o.t = (i, n) => {
          if ((1 & n && (i = o(i)), 8 & n || (4 & n && typeof i === 'object' && i && i.__esModule)))
            return i;
          const r = /* @__PURE__ */ Object.create(null);
          if (
            (o.r(r),
            Object.defineProperty(r, 'default', { enumerable: !0, value: i }),
            2 & n && typeof i !== 'string')
          )
            for (const l in i) o.d(r, l, (u => i[u]).bind(null, l));
          return r;
        }),
        (o.n = i => {
          const n = i?.__esModule ? () => i.default : () => i;
          return o.d(n, 'a', n), n;
        }),
        (o.o = (i, n) => Object.prototype.hasOwnProperty.call(i, n)),
        (o.p = ''),
        o((o.s = 0))
      );
    })([
      (e, t, o) => {
        function i(d) {
          return (i =
            typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
              ? g => typeof g
              : g =>
                  g &&
                  typeof Symbol === 'function' &&
                  g.constructor === Symbol &&
                  g !== Symbol.prototype
                    ? 'symbol'
                    : typeof g)(d);
        }
        a(i, 'n');
        function n(d, g) {
          for (let h = 0; h < g.length; h++) {
            const y = g[h];
            (y.enumerable = y.enumerable || !1),
              (y.configurable = !0),
              'value' in y && (y.writable = !0),
              Object.defineProperty(d, y.key, y);
          }
        }
        a(n, 'o');
        const r = o(1);
        const l = o(7);
        const u = l.get;
        const c = (l.deepValue, l.isArray);
        const p = (() => {
          function d(f, b) {
            const I = b.location;
            const _ = I === void 0 ? 0 : I;
            const m = b.distance;
            const v = m === void 0 ? 100 : m;
            const S = b.threshold;
            const E = S === void 0 ? 0.6 : S;
            const T = b.maxPatternLength;
            const C = T === void 0 ? 32 : T;
            const k = b.caseSensitive;
            const w = k !== void 0 && k;
            const O = b.tokenSeparator;
            const P = O === void 0 ? / +/g : O;
            const D = b.findAllMatches;
            const M = D !== void 0 && D;
            const N = b.minMatchCharLength;
            const Q = N === void 0 ? 1 : N;
            const V = b.id;
            const X = V === void 0 ? null : V;
            const H = b.keys;
            const U = H === void 0 ? [] : H;
            const z = b.shouldSort;
            const re = z === void 0 || z;
            const R = b.getFn;
            const F = R === void 0 ? u : R;
            const L = b.sortFn;
            const W = L === void 0 ? (fe, Ie) => fe.score - Ie.score : L;
            const J = b.tokenize;
            const ie = J !== void 0 && J;
            const ee = b.matchAllTokens;
            const de = ee !== void 0 && ee;
            const ae = b.includeMatches;
            const ce = ae !== void 0 && ae;
            const ue = b.includeScore;
            const Se = ue !== void 0 && ue;
            const ye = b.verbose;
            const Oe = ye !== void 0 && ye;
            ((fe, Ie) => {
              if (!(fe instanceof Ie)) throw new TypeError('Cannot call a class as a function');
            })(this, d),
              (this.options = {
                location: _,
                distance: v,
                threshold: E,
                maxPatternLength: C,
                isCaseSensitive: w,
                tokenSeparator: P,
                findAllMatches: M,
                minMatchCharLength: Q,
                id: X,
                keys: U,
                includeMatches: ce,
                includeScore: Se,
                shouldSort: re,
                getFn: F,
                sortFn: W,
                verbose: Oe,
                tokenize: ie,
                matchAllTokens: de,
              }),
              this.setCollection(f),
              this._processKeys(U);
          }
          a(d, 'e');
          let g;
          let h;
          let y;
          return (
            (g = d),
            (h = [
              {
                key: 'setCollection',
                value: /* @__PURE__ */ a(function (f) {
                  return (this.list = f), f;
                }, 'value'),
              },
              {
                key: '_processKeys',
                value: /* @__PURE__ */ a(function (f) {
                  if (
                    ((this._keyWeights = {}),
                    (this._keyNames = []),
                    f.length && typeof f[0] === 'string')
                  )
                    for (let b = 0, I = f.length; b < I; b += 1) {
                      const _ = f[b];
                      (this._keyWeights[_] = 1), this._keyNames.push(_);
                    }
                  else {
                    for (let m = null, v = null, S = 0, E = 0, T = f.length; E < T; E += 1) {
                      const C = f[E];
                      if (!C.hasOwnProperty('name'))
                        throw new Error('Missing "name" property in key object');
                      const k = C.name;
                      if ((this._keyNames.push(k), !C.hasOwnProperty('weight')))
                        throw new Error('Missing "weight" property in key object');
                      const w = C.weight;
                      if (w < 0 || w > 1)
                        throw new Error('"weight" property in key must bein the range of [0, 1)');
                      (v = v == null ? w : Math.max(v, w)),
                        (m = m == null ? w : Math.min(m, w)),
                        (this._keyWeights[k] = w),
                        (S += w);
                    }
                    if (S > 1) throw new Error('Total of weights cannot exceed 1');
                  }
                }, 'value'),
              },
              {
                key: 'search',
                value: /* @__PURE__ */ a(function (f) {
                  const b =
                    arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : { limit: !1 };
                  this._log(
                    `---------
Search pattern: "`.concat(f, '"'),
                  );
                  const I = this._prepareSearchers(f);
                  const _ = I.tokenSearchers;
                  const m = I.fullSearcher;
                  let v = this._search(_, m);
                  return (
                    this._computeScore(v),
                    this.options.shouldSort && this._sort(v),
                    b.limit && typeof b.limit === 'number' && (v = v.slice(0, b.limit)),
                    this._format(v)
                  );
                }, 'value'),
              },
              {
                key: '_prepareSearchers',
                value: /* @__PURE__ */ a(function () {
                  const f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : '';
                  const b = [];
                  if (this.options.tokenize)
                    for (
                      let I = f.split(this.options.tokenSeparator), _ = 0, m = I.length;
                      _ < m;
                      _ += 1
                    )
                      b.push(new r(I[_], this.options));
                  return { tokenSearchers: b, fullSearcher: new r(f, this.options) };
                }, 'value'),
              },
              {
                key: '_search',
                value: /* @__PURE__ */ a(function () {
                  const f = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
                  const b = arguments.length > 1 ? arguments[1] : void 0;
                  const I = this.list;
                  const _ = {};
                  const m = [];
                  if (typeof I[0] === 'string') {
                    for (let v = 0, S = I.length; v < S; v += 1)
                      this._analyze(
                        { key: '', value: I[v], record: v, index: v },
                        { resultMap: _, results: m, tokenSearchers: f, fullSearcher: b },
                      );
                    return m;
                  }
                  for (let E = 0, T = I.length; E < T; E += 1)
                    for (let C = I[E], k = 0, w = this._keyNames.length; k < w; k += 1) {
                      const O = this._keyNames[k];
                      this._analyze(
                        { key: O, value: this.options.getFn(C, O), record: C, index: E },
                        { resultMap: _, results: m, tokenSearchers: f, fullSearcher: b },
                      );
                    }
                  return m;
                }, 'value'),
              },
              {
                key: '_analyze',
                value: /* @__PURE__ */ a(function (f, b) {
                  const I = this;
                  const _ = f.key;
                  const m = f.arrayIndex;
                  const v = m === void 0 ? -1 : m;
                  const S = f.value;
                  const E = f.record;
                  const T = f.index;
                  const C = b.tokenSearchers;
                  const k = C === void 0 ? [] : C;
                  const w = b.fullSearcher;
                  const O = b.resultMap;
                  const P = O === void 0 ? {} : O;
                  const D = b.results;
                  const M = D === void 0 ? [] : D;
                  /* @__PURE__ */ a(function N(Q, V, X, H) {
                    if (V != null) {
                      if (typeof V === 'string') {
                        let U = !1;
                        let z = -1;
                        let re = 0;
                        I._log(
                          `
Key: `.concat(_ === '' ? '--' : _),
                        );
                        const R = w.search(V);
                        if (
                          (I._log('Full text: "'.concat(V, '", score: ').concat(R.score)),
                          I.options.tokenize)
                        ) {
                          for (
                            let F = V.split(I.options.tokenSeparator),
                              L = F.length,
                              W = [],
                              J = 0,
                              ie = k.length;
                            J < ie;
                            J += 1
                          ) {
                            const ee = k[J];
                            I._log(
                              `
Pattern: "`.concat(ee.pattern, '"'),
                            );
                            for (let de = !1, ae = 0; ae < L; ae += 1) {
                              const ce = F[ae];
                              const ue = ee.search(ce);
                              const Se = {};
                              ue.isMatch
                                ? ((Se[ce] = ue.score), (U = !0), (de = !0), W.push(ue.score))
                                : ((Se[ce] = 1), I.options.matchAllTokens || W.push(1)),
                                I._log('Token: "'.concat(ce, '", score: ').concat(Se[ce]));
                            }
                            de && (re += 1);
                          }
                          z = W[0];
                          for (let ye = W.length, Oe = 1; Oe < ye; Oe += 1) z += W[Oe];
                          (z /= ye), I._log('Token score average:', z);
                        }
                        let fe = R.score;
                        z > -1 && (fe = (fe + z) / 2), I._log('Score average:', fe);
                        const Ie =
                          !I.options.tokenize || !I.options.matchAllTokens || re >= k.length;
                        if (
                          (I._log(
                            `
Check Matches: `.concat(Ie),
                          ),
                          (U || R.isMatch) && Ie)
                        ) {
                          const Ce = { key: _, arrayIndex: Q, value: V, score: fe };
                          I.options.includeMatches && (Ce.matchedIndices = R.matchedIndices);
                          const Le = P[H];
                          Le
                            ? Le.output.push(Ce)
                            : ((P[H] = { item: X, output: [Ce] }), M.push(P[H]));
                        }
                      } else if (c(V))
                        for (let tt = 0, De = V.length; tt < De; tt += 1) N(tt, V[tt], X, H);
                    }
                  }, 'e')(v, S, E, T);
                }, 'value'),
              },
              {
                key: '_computeScore',
                value: /* @__PURE__ */ a(function (f) {
                  this._log(`

Computing score:
`);
                  for (
                    let b = this._keyWeights, I = !!Object.keys(b).length, _ = 0, m = f.length;
                    _ < m;
                    _ += 1
                  ) {
                    for (let v = f[_], S = v.output, E = S.length, T = 1, C = 0; C < E; C += 1) {
                      const k = S[C];
                      const w = k.key;
                      const O = I ? b[w] : 1;
                      const P = k.score === 0 && b && b[w] > 0 ? Number.EPSILON : k.score;
                      T *= P ** O;
                    }
                    (v.score = T), this._log(v);
                  }
                }, 'value'),
              },
              {
                key: '_sort',
                value: /* @__PURE__ */ a(function (f) {
                  this._log(`

Sorting....`),
                    f.sort(this.options.sortFn);
                }, 'value'),
              },
              {
                key: '_format',
                value: /* @__PURE__ */ a(function (f) {
                  const b = [];
                  if (this.options.verbose) {
                    let I = [];
                    this._log(
                      `

Output:

`,
                      JSON.stringify(
                        f,
                        (k, w) => {
                          if (i(w) === 'object' && w !== null) {
                            if (I.indexOf(w) !== -1) return;
                            I.push(w);
                          }
                          return w;
                        },
                        2,
                      ),
                    ),
                      (I = null);
                  }
                  const _ = [];
                  this.options.includeMatches &&
                    _.push((k, w) => {
                      const O = k.output;
                      w.matches = [];
                      for (let P = 0, D = O.length; P < D; P += 1) {
                        const M = O[P];
                        if (M.matchedIndices.length !== 0) {
                          const N = { indices: M.matchedIndices, value: M.value };
                          M.key && (N.key = M.key),
                            M.hasOwnProperty('arrayIndex') &&
                              M.arrayIndex > -1 &&
                              (N.arrayIndex = M.arrayIndex),
                            w.matches.push(N);
                        }
                      }
                    }),
                    this.options.includeScore &&
                      _.push((k, w) => {
                        w.score = k.score;
                      });
                  for (let m = 0, v = f.length; m < v; m += 1) {
                    const S = f[m];
                    if (
                      (this.options.id && (S.item = this.options.getFn(S.item, this.options.id)[0]),
                      _.length)
                    ) {
                      for (let E = { item: S.item }, T = 0, C = _.length; T < C; T += 1) _[T](S, E);
                      b.push(E);
                    } else b.push(S.item);
                  }
                  return b;
                }, 'value'),
              },
              {
                key: '_log',
                value: /* @__PURE__ */ a(function () {
                  let f;
                  this.options.verbose && (f = console).log.apply(f, arguments);
                }, 'value'),
              },
            ]) && n(g.prototype, h),
            y && n(g, y),
            d
          );
        })();
        e.exports = p;
      },
      (e, t, o) => {
        function i(c, p) {
          for (let d = 0; d < p.length; d++) {
            const g = p[d];
            (g.enumerable = g.enumerable || !1),
              (g.configurable = !0),
              'value' in g && (g.writable = !0),
              Object.defineProperty(c, g.key, g);
          }
        }
        a(i, 'n');
        const n = o(2);
        const r = o(3);
        const l = o(6);
        const u = (() => {
          function c(h, y) {
            const f = y.location;
            const b = f === void 0 ? 0 : f;
            const I = y.distance;
            const _ = I === void 0 ? 100 : I;
            const m = y.threshold;
            const v = m === void 0 ? 0.6 : m;
            const S = y.maxPatternLength;
            const E = S === void 0 ? 32 : S;
            const T = y.isCaseSensitive;
            const C = T !== void 0 && T;
            const k = y.tokenSeparator;
            const w = k === void 0 ? / +/g : k;
            const O = y.findAllMatches;
            const P = O !== void 0 && O;
            const D = y.minMatchCharLength;
            const M = D === void 0 ? 1 : D;
            const N = y.includeMatches;
            const Q = N !== void 0 && N;
            ((V, X) => {
              if (!(V instanceof X)) throw new TypeError('Cannot call a class as a function');
            })(this, c),
              (this.options = {
                location: b,
                distance: _,
                threshold: v,
                maxPatternLength: E,
                isCaseSensitive: C,
                tokenSeparator: w,
                findAllMatches: P,
                includeMatches: Q,
                minMatchCharLength: M,
              }),
              (this.pattern = C ? h : h.toLowerCase()),
              this.pattern.length <= E && (this.patternAlphabet = l(this.pattern));
          }
          a(c, 'e');
          let p;
          let d;
          let g;
          return (
            (p = c),
            (d = [
              {
                key: 'search',
                value: /* @__PURE__ */ a(function (h) {
                  const y = this.options;
                  const f = y.isCaseSensitive;
                  const b = y.includeMatches;
                  if ((f || (h = h.toLowerCase()), this.pattern === h)) {
                    const I = { isMatch: !0, score: 0 };
                    return b && (I.matchedIndices = [[0, h.length - 1]]), I;
                  }
                  const _ = this.options;
                  const m = _.maxPatternLength;
                  const v = _.tokenSeparator;
                  if (this.pattern.length > m) return n(h, this.pattern, v);
                  const S = this.options;
                  const E = S.location;
                  const T = S.distance;
                  const C = S.threshold;
                  const k = S.findAllMatches;
                  const w = S.minMatchCharLength;
                  return r(h, this.pattern, this.patternAlphabet, {
                    location: E,
                    distance: T,
                    threshold: C,
                    findAllMatches: k,
                    minMatchCharLength: w,
                    includeMatches: b,
                  });
                }, 'value'),
              },
            ]) && i(p.prototype, d),
            g && i(p, g),
            c
          );
        })();
        e.exports = u;
      },
      (e, t) => {
        const o = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
        e.exports = (i, n) => {
          const r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : / +/g;
          const l = new RegExp(n.replace(o, '\\$&').replace(r, '|'));
          const u = i.match(l);
          const c = !!u;
          const p = [];
          if (c)
            for (let d = 0, g = u.length; d < g; d += 1) {
              const h = u[d];
              p.push([i.indexOf(h), h.length - 1]);
            }
          return { score: c ? 0.5 : 1, isMatch: c, matchedIndices: p };
        };
      },
      (e, t, o) => {
        const i = o(4);
        const n = o(5);
        e.exports = (r, l, u, c) => {
          for (
            let p = c.location,
              d = p === void 0 ? 0 : p,
              g = c.distance,
              h = g === void 0 ? 100 : g,
              y = c.threshold,
              f = y === void 0 ? 0.6 : y,
              b = c.findAllMatches,
              I = b !== void 0 && b,
              _ = c.minMatchCharLength,
              m = _ === void 0 ? 1 : _,
              v = c.includeMatches,
              S = v !== void 0 && v,
              E = d,
              T = r.length,
              C = f,
              k = r.indexOf(l, E),
              w = l.length,
              O = [],
              P = 0;
            P < T;
            P += 1
          )
            O[P] = 0;
          if (k !== -1) {
            const D = i(l, { errors: 0, currentLocation: k, expectedLocation: E, distance: h });
            if (((C = Math.min(D, C)), (k = r.lastIndexOf(l, E + w)) !== -1)) {
              const M = i(l, { errors: 0, currentLocation: k, expectedLocation: E, distance: h });
              C = Math.min(M, C);
            }
          }
          k = -1;
          for (
            let N = [], Q = 1, V = w + T, X = 1 << (w <= 31 ? w - 1 : 30), H = 0;
            H < w;
            H += 1
          ) {
            for (let U = 0, z = V; U < z; )
              i(l, { errors: H, currentLocation: E + z, expectedLocation: E, distance: h }) <= C
                ? (U = z)
                : (V = z),
                (z = Math.floor((V - U) / 2 + U));
            V = z;
            let re = Math.max(1, E - z + 1);
            const R = I ? T : Math.min(E + z, T) + w;
            const F = Array(R + 2);
            F[R + 1] = (1 << H) - 1;
            for (let L = R; L >= re; L -= 1) {
              const W = L - 1;
              const J = u[r.charAt(W)];
              if (
                (J && (O[W] = 1),
                (F[L] = ((F[L + 1] << 1) | 1) & J),
                H !== 0 && (F[L] |= ((N[L + 1] | N[L]) << 1) | 1 | N[L + 1]),
                F[L] & X &&
                  (Q = i(l, { errors: H, currentLocation: W, expectedLocation: E, distance: h })) <=
                    C)
              ) {
                if (((C = Q), (k = W) <= E)) break;
                re = Math.max(1, 2 * E - k);
              }
            }
            if (i(l, { errors: H + 1, currentLocation: E, expectedLocation: E, distance: h }) > C)
              break;
            N = F;
          }
          const ie = { isMatch: k >= 0, score: Q === 0 ? 1e-3 : Q };
          return S && (ie.matchedIndices = n(O, m)), ie;
        };
      },
      (e, t) => {
        e.exports = (o, i) => {
          const n = i.errors;
          const r = n === void 0 ? 0 : n;
          const l = i.currentLocation;
          const u = l === void 0 ? 0 : l;
          const c = i.expectedLocation;
          const p = c === void 0 ? 0 : c;
          const d = i.distance;
          const g = d === void 0 ? 100 : d;
          const h = r / o.length;
          const y = Math.abs(p - u);
          return g ? h + y / g : y ? 1 : h;
        };
      },
      (e, t) => {
        e.exports = () => {
          for (
            let o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [],
              i = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1,
              n = [],
              r = -1,
              l = -1,
              u = 0,
              c = o.length;
            u < c;
            u += 1
          ) {
            const p = o[u];
            p && r === -1
              ? (r = u)
              : p || r === -1 || ((l = u - 1) - r + 1 >= i && n.push([r, l]), (r = -1));
          }
          return o[u - 1] && u - r >= i && n.push([r, u - 1]), n;
        };
      },
      (e, t) => {
        e.exports = o => {
          for (let i = {}, n = o.length, r = 0; r < n; r += 1) i[o.charAt(r)] = 0;
          for (let l = 0; l < n; l += 1) i[o.charAt(l)] |= 1 << (n - l - 1);
          return i;
        };
      },
      (e, t) => {
        const o = /* @__PURE__ */ a(
          l =>
            Array.isArray
              ? Array.isArray(l)
              : Object.prototype.toString.call(l) === '[object Array]',
          'r',
        );
        const i = /* @__PURE__ */ a(
          l =>
            l == null
              ? ''
              : (u => {
                  if (typeof u === 'string') return u;
                  const c = `${u}`;
                  return c === '0' && 1 / u === -1 / 0 ? '-0' : c;
                })(l),
          'n',
        );
        const n = /* @__PURE__ */ a(l => typeof l === 'string', 'o');
        const r = /* @__PURE__ */ a(l => typeof l === 'number', 'i');
        e.exports = {
          get: /* @__PURE__ */ a((l, u) => {
            const c = [];
            return (
              /* @__PURE__ */ a(function p(d, g) {
                if (g) {
                  const h = g.indexOf('.');
                  let y = g;
                  let f = null;
                  h !== -1 && ((y = g.slice(0, h)), (f = g.slice(h + 1)));
                  const b = d[y];
                  if (b != null)
                    if (f || (!n(b) && !r(b)))
                      if (o(b)) for (let I = 0, _ = b.length; I < _; I += 1) p(b[I], f);
                      else f && p(b, f);
                    else c.push(i(b));
                } else c.push(d);
              }, 'e')(l, u),
              c
            );
          }, 'get'),
          isArray: o,
          isString: n,
          isNum: r,
          toString: i,
        };
      },
    ]),
  );
});

// ../node_modules/store2/dist/store2.js
const md = Ee((Xr, Zr) => {
  ((e, t) => {
    const o = {
      version: '2.14.2',
      areas: {},
      apis: {},
      nsdelim: '.',
      // utilities
      inherit: /* @__PURE__ */ a((n, r) => {
        for (const l in n)
          r.hasOwnProperty(l) || Object.defineProperty(r, l, Object.getOwnPropertyDescriptor(n, l));
        return r;
      }, 'inherit'),
      stringify: /* @__PURE__ */ a(
        (n, r) =>
          n === void 0 || typeof n === 'function' ? `${n}` : JSON.stringify(n, r || o.replace),
        'stringify',
      ),
      parse: /* @__PURE__ */ a((n, r) => {
        try {
          return JSON.parse(n, r || o.revive);
        } catch {
          return n;
        }
      }, 'parse'),
      // extension hooks
      fn: /* @__PURE__ */ a((n, r) => {
        o.storeAPI[n] = r;
        for (const l in o.apis) o.apis[l][n] = r;
      }, 'fn'),
      get: /* @__PURE__ */ a((n, r) => n.getItem(r), 'get'),
      set: /* @__PURE__ */ a((n, r, l) => {
        n.setItem(r, l);
      }, 'set'),
      remove: /* @__PURE__ */ a((n, r) => {
        n.removeItem(r);
      }, 'remove'),
      key: /* @__PURE__ */ a((n, r) => n.key(r), 'key'),
      length: /* @__PURE__ */ a(n => n.length, 'length'),
      clear: /* @__PURE__ */ a(n => {
        n.clear();
      }, 'clear'),
      // core functions
      Store: /* @__PURE__ */ a((n, r, l) => {
        const u = o.inherit(o.storeAPI, (p, d, g) =>
          arguments.length === 0
            ? u.getAll()
            : typeof d === 'function'
              ? u.transact(p, d, g)
              : d !== void 0
                ? u.set(p, d, g)
                : typeof p === 'string' || typeof p === 'number'
                  ? u.get(p)
                  : typeof p === 'function'
                    ? u.each(p)
                    : p
                      ? u.setAll(p, d)
                      : u.clear(),
        );
        u._id = n;
        try {
          const c = '__store2_test';
          r.setItem(c, 'ok'), (u._area = r), r.removeItem(c);
        } catch {
          u._area = o.storage('fake');
        }
        return (
          (u._ns = l || ''),
          o.areas[n] || (o.areas[n] = u._area),
          o.apis[u._ns + u._id] || (o.apis[u._ns + u._id] = u),
          u
        );
      }, 'Store'),
      storeAPI: {
        // admin functions
        area: /* @__PURE__ */ a(function (n, r) {
          let l = this[n];
          return (!l || !l.area) && ((l = o.Store(n, r, this._ns)), this[n] || (this[n] = l)), l;
        }, 'area'),
        namespace: /* @__PURE__ */ a(function (n, r, l) {
          if (((l = l || this._delim || o.nsdelim), !n))
            return this._ns ? this._ns.substring(0, this._ns.length - l.length) : '';
          const u = n;
          let c = this[u];
          if (
            (!c || !c.namespace) &&
            ((c = o.Store(this._id, this._area, this._ns + u + l)),
            (c._delim = l),
            this[u] || (this[u] = c),
            !r)
          )
            for (const p in o.areas) c.area(p, o.areas[p]);
          return c;
        }, 'namespace'),
        isFake: /* @__PURE__ */ a(function (n) {
          return (
            n
              ? ((this._real = this._area), (this._area = o.storage('fake')))
              : n === !1 && (this._area = this._real || this._area),
            this._area.name === 'fake'
          );
        }, 'isFake'),
        toString: /* @__PURE__ */ a(function () {
          return `store${this._ns ? `.${this.namespace()}` : ''}[${this._id}]`;
        }, 'toString'),
        // storage functions
        has: /* @__PURE__ */ a(function (n) {
          return this._area.has ? this._area.has(this._in(n)) : this._in(n) in this._area;
        }, 'has'),
        size: /* @__PURE__ */ a(function () {
          return this.keys().length;
        }, 'size'),
        each: /* @__PURE__ */ a(function (n, r) {
          for (let l = 0, u = o.length(this._area); l < u; l++) {
            const c = this._out(o.key(this._area, l));
            if (c !== void 0 && n.call(this, c, this.get(c), r) === !1) break;
            u > o.length(this._area) && (u--, l--);
          }
          return r || this;
        }, 'each'),
        keys: /* @__PURE__ */ a(function (n) {
          return this.each((r, l, u) => {
            u.push(r);
          }, n || []);
        }, 'keys'),
        get: /* @__PURE__ */ a(function (n, r) {
          const l = o.get(this._area, this._in(n));
          let u;
          return (
            typeof r === 'function' && ((u = r), (r = null)), l !== null ? o.parse(l, u) : (r ?? l)
          );
        }, 'get'),
        getAll: /* @__PURE__ */ a(function (n) {
          return this.each((r, l, u) => {
            u[r] = l;
          }, n || {});
        }, 'getAll'),
        transact: /* @__PURE__ */ a(function (n, r, l) {
          const u = this.get(n, l);
          const c = r(u);
          return this.set(n, c === void 0 ? u : c), this;
        }, 'transact'),
        set: /* @__PURE__ */ a(function (n, r, l) {
          const u = this.get(n);
          let c;
          return u != null && l === !1
            ? r
            : (typeof l === 'function' && ((c = l), (l = void 0)),
              o.set(this._area, this._in(n), o.stringify(r, c), l) || u);
        }, 'set'),
        setAll: /* @__PURE__ */ a(function (n, r) {
          let l;
          let u;
          for (const c in n) (u = n[c]), this.set(c, u, r) !== u && (l = !0);
          return l;
        }, 'setAll'),
        add: /* @__PURE__ */ a(function (n, r, l) {
          const u = this.get(n);
          if (Array.isArray(u)) r = u.concat(r);
          else if (u !== null) {
            const c = typeof u;
            if (c === typeof r && c === 'object') {
              for (const p in r) u[p] = r[p];
              r = u;
            } else r = u + r;
          }
          return o.set(this._area, this._in(n), o.stringify(r, l)), r;
        }, 'add'),
        remove: /* @__PURE__ */ a(function (n, r) {
          const l = this.get(n, r);
          return o.remove(this._area, this._in(n)), l;
        }, 'remove'),
        clear: /* @__PURE__ */ a(function () {
          return (
            this._ns
              ? this.each(function (n) {
                  o.remove(this._area, this._in(n));
                }, 1)
              : o.clear(this._area),
            this
          );
        }, 'clear'),
        clearAll: /* @__PURE__ */ a(function () {
          const n = this._area;
          for (const r in o.areas)
            o.areas.hasOwnProperty(r) && ((this._area = o.areas[r]), this.clear());
          return (this._area = n), this;
        }, 'clearAll'),
        // internal use functions
        _in: /* @__PURE__ */ a(function (n) {
          return typeof n !== 'string' && (n = o.stringify(n)), this._ns ? this._ns + n : n;
        }, '_in'),
        _out: /* @__PURE__ */ a(function (n) {
          return this._ns
            ? n && n.indexOf(this._ns) === 0
              ? n.substring(this._ns.length)
              : void 0
            : // so each() knows to skip it
              n;
        }, '_out'),
      },
      // end _.storeAPI
      storage: /* @__PURE__ */ a(n => o.inherit(o.storageAPI, { items: {}, name: n }), 'storage'),
      storageAPI: {
        length: 0,
        has: /* @__PURE__ */ a(function (n) {
          return this.items.hasOwnProperty(n);
        }, 'has'),
        key: /* @__PURE__ */ a(function (n) {
          let r = 0;
          for (const l in this.items) if (this.has(l) && n === r++) return l;
        }, 'key'),
        setItem: /* @__PURE__ */ a(function (n, r) {
          this.has(n) || this.length++, (this.items[n] = r);
        }, 'setItem'),
        removeItem: /* @__PURE__ */ a(function (n) {
          this.has(n) && (delete this.items[n], this.length--);
        }, 'removeItem'),
        getItem: /* @__PURE__ */ a(function (n) {
          return this.has(n) ? this.items[n] : null;
        }, 'getItem'),
        clear: /* @__PURE__ */ a(function () {
          for (const n in this.items) this.removeItem(n);
        }, 'clear'),
      },
      // end _.storageAPI
    };
    const i =
      // safely set this up (throws error in IE10/32bit mode for local files)
      o.Store(
        'local',
        (() => {
          try {
            return localStorage;
          } catch {}
        })(),
      );
    (i.local = i),
      (i._ = o),
      i.area(
        'session',
        (() => {
          try {
            return sessionStorage;
          } catch {}
        })(),
      ),
      i.area('page', o.storage('page')),
      typeof t === 'function' && t.amd !== void 0
        ? t('store2', [], () => i)
        : typeof Zr < 'u' && Zr.exports
          ? (Zr.exports = i)
          : (e.store && (o.conflict = e.store), (e.store = i));
  })(Xr, Xr?.define);
});

// global-externals:react
const s = __REACT__;
const {
  Children: H0,
  Component: Re,
  Fragment: _e,
  Profiler: B0,
  PureComponent: z0,
  StrictMode: W0,
  Suspense: j0,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: V0,
  cloneElement: us,
  createContext: jt,
  createElement: K0,
  createFactory: $0,
  createRef: U0,
  forwardRef: cs,
  isValidElement: G0,
  lazy: Y0,
  memo: no,
  startTransition: q0,
  unstable_act: Q0,
  useCallback: A,
  useContext: ko,
  useDebugValue: X0,
  useDeferredValue: ps,
  useEffect: j,
  useId: Z0,
  useImperativeHandle: J0,
  useInsertionEffect: ev,
  useLayoutEffect: ft,
  useMemo: K,
  useReducer: Vt,
  useRef: Y,
  useState: $,
  useSyncExternalStore: tv,
  useTransition: ds,
  version: ov,
} = __REACT__;

// global-externals:@storybook/core/channels
const rv = __STORYBOOK_CHANNELS__;
const {
  Channel: nv,
  HEARTBEAT_INTERVAL: iv,
  HEARTBEAT_MAX_LATENCY: sv,
  PostMessageTransport: av,
  WebsocketTransport: lv,
  createBrowserChannel: fs,
} = __STORYBOOK_CHANNELS__;

// ../node_modules/@storybook/global/dist/index.mjs
const se = (() => {
  let e;
  return (
    typeof window < 'u'
      ? (e = window)
      : typeof globalThis < 'u'
        ? (e = globalThis)
        : typeof global < 'u'
          ? (e = global)
          : typeof self < 'u'
            ? (e = self)
            : (e = {}),
    e
  );
})();

// global-externals:@storybook/icons
const pv = __STORYBOOK_ICONS__;
const {
  AccessibilityAltIcon: dv,
  AccessibilityIcon: fv,
  AccessibilityIgnoredIcon: mv,
  AddIcon: hv,
  AdminIcon: gv,
  AlertAltIcon: yv,
  AlertIcon: Oo,
  AlignLeftIcon: bv,
  AlignRightIcon: vv,
  AppleIcon: xv,
  ArrowBottomLeftIcon: Sv,
  ArrowBottomRightIcon: Iv,
  ArrowDownIcon: Ev,
  ArrowLeftIcon: ms,
  ArrowRightIcon: _v,
  ArrowSolidDownIcon: wv,
  ArrowSolidLeftIcon: Tv,
  ArrowSolidRightIcon: Cv,
  ArrowSolidUpIcon: kv,
  ArrowTopLeftIcon: Ov,
  ArrowTopRightIcon: Pv,
  ArrowUpIcon: Av,
  AzureDevOpsIcon: Dv,
  BackIcon: Mv,
  BasketIcon: Lv,
  BatchAcceptIcon: Nv,
  BatchDenyIcon: Rv,
  BeakerIcon: Fv,
  BellIcon: Hv,
  BitbucketIcon: Bv,
  BoldIcon: zv,
  BookIcon: Wv,
  BookmarkHollowIcon: jv,
  BookmarkIcon: Vv,
  BottomBarIcon: Po,
  BottomBarToggleIcon: hs,
  BoxIcon: Kv,
  BranchIcon: $v,
  BrowserIcon: Uv,
  ButtonIcon: Gv,
  CPUIcon: Yv,
  CalendarIcon: qv,
  CameraIcon: Qv,
  CameraStabilizeIcon: Xv,
  CategoryIcon: Zv,
  CertificateIcon: Jv,
  ChangedIcon: ex,
  ChatIcon: tx,
  CheckIcon: We,
  ChevronDownIcon: Kt,
  ChevronLeftIcon: ox,
  ChevronRightIcon: gs,
  ChevronSmallDownIcon: rx,
  ChevronSmallLeftIcon: nx,
  ChevronSmallRightIcon: ix,
  ChevronSmallUpIcon: ys,
  ChevronUpIcon: sx,
  ChromaticIcon: ax,
  ChromeIcon: lx,
  CircleHollowIcon: ux,
  CircleIcon: bs,
  ClearIcon: cx,
  CloseAltIcon: Ao,
  CloseIcon: Ge,
  CloudHollowIcon: px,
  CloudIcon: dx,
  CogIcon: on,
  CollapseIcon: vs,
  CommandIcon: fx,
  CommentAddIcon: mx,
  CommentIcon: hx,
  CommentsIcon: gx,
  CommitIcon: yx,
  CompassIcon: bx,
  ComponentDrivenIcon: vx,
  ComponentIcon: rn,
  ContrastIcon: xx,
  ContrastIgnoredIcon: Sx,
  ControlsIcon: Ix,
  CopyIcon: Ex,
  CreditIcon: _x,
  CrossIcon: wx,
  DashboardIcon: Tx,
  DatabaseIcon: Cx,
  DeleteIcon: kx,
  DiamondIcon: Ox,
  DirectionIcon: Px,
  DiscordIcon: Ax,
  DocChartIcon: Dx,
  DocListIcon: Mx,
  DocumentIcon: $t,
  DownloadIcon: Lx,
  DragIcon: Nx,
  EditIcon: Rx,
  EllipsisIcon: xs,
  EmailIcon: Fx,
  ExpandAltIcon: Ss,
  ExpandIcon: Is,
  EyeCloseIcon: Es,
  EyeIcon: _s,
  FaceHappyIcon: Hx,
  FaceNeutralIcon: Bx,
  FaceSadIcon: zx,
  FacebookIcon: Wx,
  FailedIcon: ws,
  FastForwardIcon: jx,
  FigmaIcon: Vx,
  FilterIcon: Ts,
  FlagIcon: Kx,
  FolderIcon: $x,
  FormIcon: Ux,
  GDriveIcon: Gx,
  GithubIcon: Do,
  GitlabIcon: Yx,
  GlobeIcon: nn,
  GoogleIcon: qx,
  GraphBarIcon: Qx,
  GraphLineIcon: Xx,
  GraphqlIcon: Zx,
  GridAltIcon: Jx,
  GridIcon: eS,
  GrowIcon: tS,
  HeartHollowIcon: oS,
  HeartIcon: Cs,
  HomeIcon: rS,
  HourglassIcon: nS,
  InfoIcon: ks,
  ItalicIcon: iS,
  JumpToIcon: sS,
  KeyIcon: aS,
  LightningIcon: Os,
  LightningOffIcon: lS,
  LinkBrokenIcon: uS,
  LinkIcon: Ps,
  LinkedinIcon: cS,
  LinuxIcon: pS,
  ListOrderedIcon: dS,
  ListUnorderedIcon: fS,
  LocationIcon: mS,
  LockIcon: Mo,
  MarkdownIcon: hS,
  MarkupIcon: As,
  MediumIcon: gS,
  MemoryIcon: yS,
  MenuIcon: Lo,
  MergeIcon: bS,
  MirrorIcon: vS,
  MobileIcon: xS,
  MoonIcon: SS,
  NutIcon: IS,
  OutboxIcon: ES,
  OutlineIcon: _S,
  PaintBrushIcon: wS,
  PaperClipIcon: TS,
  ParagraphIcon: CS,
  PassedIcon: kS,
  PhoneIcon: OS,
  PhotoDragIcon: PS,
  PhotoIcon: AS,
  PhotoStabilizeIcon: DS,
  PinAltIcon: MS,
  PinIcon: LS,
  PlayAllHollowIcon: Ds,
  PlayBackIcon: NS,
  PlayHollowIcon: Ms,
  PlayIcon: RS,
  PlayNextIcon: FS,
  PlusIcon: Ls,
  PointerDefaultIcon: HS,
  PointerHandIcon: BS,
  PowerIcon: zS,
  PrintIcon: WS,
  ProceedIcon: jS,
  ProfileIcon: VS,
  PullRequestIcon: KS,
  QuestionIcon: $S,
  RSSIcon: US,
  RedirectIcon: GS,
  ReduxIcon: YS,
  RefreshIcon: qS,
  ReplyIcon: QS,
  RepoIcon: XS,
  RequestChangeIcon: ZS,
  RewindIcon: JS,
  RulerIcon: eI,
  SaveIcon: tI,
  SearchIcon: No,
  ShareAltIcon: at,
  ShareIcon: oI,
  ShieldIcon: rI,
  SideBySideIcon: nI,
  SidebarAltIcon: Ro,
  SidebarAltToggleIcon: iI,
  SidebarIcon: sI,
  SidebarToggleIcon: aI,
  SpeakerIcon: lI,
  StackedIcon: uI,
  StarHollowIcon: cI,
  StarIcon: pI,
  StatusFailIcon: Ns,
  StatusIcon: dI,
  StatusPassIcon: Rs,
  StatusWarnIcon: Fs,
  StickerIcon: fI,
  StopAltHollowIcon: mI,
  StopAltIcon: Hs,
  StopIcon: hI,
  StorybookIcon: Bs,
  StructureIcon: gI,
  SubtractIcon: yI,
  SunIcon: bI,
  SupportIcon: vI,
  SweepIcon: xI,
  SwitchAltIcon: SI,
  SyncIcon: mt,
  TabletIcon: II,
  ThumbsUpIcon: EI,
  TimeIcon: zs,
  TimerIcon: _I,
  TransferIcon: wI,
  TrashIcon: Ws,
  TwitterIcon: TI,
  TypeIcon: CI,
  UbuntuIcon: kI,
  UndoIcon: OI,
  UnfoldIcon: PI,
  UnlockIcon: AI,
  UnpinIcon: DI,
  UploadIcon: MI,
  UserAddIcon: LI,
  UserAltIcon: NI,
  UserIcon: RI,
  UsersIcon: FI,
  VSCodeIcon: HI,
  VerifiedIcon: BI,
  VideoIcon: zI,
  WandIcon: js,
  WatchIcon: WI,
  WindowsIcon: jI,
  WrenchIcon: VI,
  XIcon: KI,
  YoutubeIcon: $I,
  ZoomIcon: Vs,
  ZoomOutIcon: Ks,
  ZoomResetIcon: $s,
  iconList: UI,
} = __STORYBOOK_ICONS__;

// global-externals:@storybook/theming
const YI = __STORYBOOK_THEMING__;
const {
  CacheProvider: qI,
  ClassNames: QI,
  Global: XI,
  ThemeProvider: ZI,
  background: JI,
  color: Us,
  convert: eE,
  create: tE,
  createCache: oE,
  createGlobal: rE,
  createReset: nE,
  css: iE,
  darken: sE,
  ensure: aE,
  ignoreSsrWarning: lE,
  isPropValid: uE,
  jsx: cE,
  keyframes: pE,
  lighten: dE,
  styled: fE,
  themes: mE,
  typography: hE,
  useTheme: gE,
  withTheme: yE,
} = __STORYBOOK_THEMING__;

// global-externals:@storybook/core/core-events
const vE = __STORYBOOK_CORE_EVENTS__;
const {
  ARGTYPES_INFO_REQUEST: Gs,
  ARGTYPES_INFO_RESPONSE: Ys,
  CHANNEL_CREATED: qs,
  CHANNEL_WS_DISCONNECT: Qs,
  CONFIG_ERROR: xE,
  CREATE_NEW_STORYFILE_REQUEST: Xs,
  CREATE_NEW_STORYFILE_RESPONSE: Zs,
  CURRENT_STORY_WAS_SET: SE,
  DOCS_PREPARED: IE,
  DOCS_RENDERED: EE,
  FILE_COMPONENT_SEARCH_REQUEST: Js,
  FILE_COMPONENT_SEARCH_RESPONSE: Fo,
  FORCE_REMOUNT: sn,
  FORCE_RE_RENDER: _E,
  GLOBALS_UPDATED: wE,
  NAVIGATE_URL: TE,
  PLAY_FUNCTION_THREW_EXCEPTION: CE,
  PRELOAD_ENTRIES: St,
  PREVIEW_BUILDER_PROGRESS: ea,
  PREVIEW_KEYDOWN: kE,
  REGISTER_SUBSCRIPTION: OE,
  REQUEST_WHATS_NEW_DATA: PE,
  RESET_STORY_ARGS: AE,
  RESULT_WHATS_NEW_DATA: DE,
  SAVE_STORY_REQUEST: ta,
  SAVE_STORY_RESPONSE: oa,
  SELECT_STORY: ME,
  SET_CONFIG: LE,
  SET_CURRENT_STORY: ra,
  SET_FILTER: NE,
  SET_GLOBALS: RE,
  SET_INDEX: FE,
  SET_STORIES: HE,
  SET_WHATS_NEW_CACHE: BE,
  SHARED_STATE_CHANGED: zE,
  SHARED_STATE_SET: WE,
  STORIES_COLLAPSE_ALL: io,
  STORIES_EXPAND_ALL: an,
  STORY_ARGS_UPDATED: jE,
  STORY_CHANGED: VE,
  STORY_ERRORED: KE,
  STORY_FINISHED: $E,
  STORY_INDEX_INVALIDATED: UE,
  STORY_MISSING: GE,
  STORY_PREPARED: YE,
  STORY_RENDERED: qE,
  STORY_RENDER_PHASE_CHANGED: QE,
  STORY_SPECIFIED: XE,
  STORY_THREW_EXCEPTION: ZE,
  STORY_UNCHANGED: JE,
  TELEMETRY_ERROR: e_,
  TESTING_MODULE_CANCEL_TEST_RUN_REQUEST: t_,
  TESTING_MODULE_CANCEL_TEST_RUN_RESPONSE: o_,
  TESTING_MODULE_CRASH_REPORT: ln,
  TESTING_MODULE_PROGRESS_REPORT: un,
  TESTING_MODULE_RUN_ALL_REQUEST: r_,
  TESTING_MODULE_RUN_REQUEST: n_,
  TOGGLE_WHATS_NEW_NOTIFICATIONS: i_,
  UNHANDLED_ERRORS_WHILE_PLAYING: s_,
  UPDATE_GLOBALS: a_,
  UPDATE_QUERY_PARAMS: l_,
  UPDATE_STORY_ARGS: u_,
} = __STORYBOOK_CORE_EVENTS__;

// global-externals:@storybook/core/manager-api
const p_ = __STORYBOOK_API__;
const {
  ActiveTabs: d_,
  Consumer: he,
  ManagerContext: f_,
  Provider: na,
  RequestResponseError: m_,
  addons: Ye,
  combineParameters: h_,
  controlOrMetaKey: g_,
  controlOrMetaSymbol: y_,
  eventMatchesShortcut: b_,
  eventToShortcut: ia,
  experimental_MockUniversalStore: v_,
  experimental_UniversalStore: x_,
  experimental_requestResponse: Ho,
  experimental_useUniversalStore: S_,
  isMacLike: I_,
  isShortcutTaken: E_,
  keyToSymbol: __,
  merge: Bo,
  mockChannel: w_,
  optionOrAltSymbol: T_,
  shortcutMatchesShortcut: sa,
  shortcutToHumanString: qe,
  types: ve,
  useAddonState: C_,
  useArgTypes: k_,
  useArgs: O_,
  useChannel: aa,
  useGlobalTypes: P_,
  useGlobals: A_,
  useParameter: D_,
  useSharedState: M_,
  useStoryPrepared: L_,
  useStorybookApi: oe,
  useStorybookState: Pe,
} = __STORYBOOK_API__;

// global-externals:react-dom/client
const R_ = __REACT_DOM_CLIENT__;
const { createRoot: la, hydrateRoot: F_ } = __REACT_DOM_CLIENT__;

// global-externals:@storybook/core/router
const B_ = __STORYBOOK_ROUTER__;
const {
  BaseLocationProvider: z_,
  DEEPLY_EQUAL: W_,
  Link: zo,
  Location: Wo,
  LocationProvider: ua,
  Match: ca,
  Route: so,
  buildArgsParam: j_,
  deepDiff: V_,
  getMatch: K_,
  parsePath: $_,
  queryFromLocation: U_,
  stringifyQuery: G_,
  useNavigate: pa,
} = __STORYBOOK_ROUTER__;

// global-externals:@storybook/core/theming
const q_ = __STORYBOOK_THEMING__;
const {
  CacheProvider: Q_,
  ClassNames: X_,
  Global: Ut,
  ThemeProvider: cn,
  background: Z_,
  color: J_,
  convert: ew,
  create: tw,
  createCache: ow,
  createGlobal: da,
  createReset: rw,
  css: nw,
  darken: iw,
  ensure: fa,
  ignoreSsrWarning: sw,
  isPropValid: aw,
  jsx: lw,
  keyframes: It,
  lighten: uw,
  styled: x,
  themes: cw,
  typography: pw,
  useTheme: Ae,
  withTheme: ma,
} = __STORYBOOK_THEMING__;

// global-externals:@storybook/core/manager-errors
const fw = __STORYBOOK_CORE_EVENTS_MANAGER_ERRORS__;
const {
  Category: mw,
  ProviderDoesNotExtendBaseProviderError: ha,
  UncaughtManagerError: hw,
} = __STORYBOOK_CORE_EVENTS_MANAGER_ERRORS__;

// ../node_modules/react-helmet-async/lib/index.module.js
const ne = ze(pn());
const Na = ze(_a());
const gn = ze(Ta());
const Ra = ze(ka());
function xe() {
  return (
    (xe =
      Object.assign ||
      (e => {
        for (let t = 1; t < arguments.length; t++) {
          const o = arguments[t];
          for (const i in o) Object.prototype.hasOwnProperty.call(o, i) && (e[i] = o[i]);
        }
        return e;
      })),
    xe.apply(this, arguments)
  );
}
a(xe, 'a');
function xn(e, t) {
  (e.prototype = Object.create(t.prototype)), (e.prototype.constructor = e), yn(e, t);
}
a(xn, 's');
function yn(e, t) {
  return (yn = Object.setPrototypeOf || ((o, i) => ((o.__proto__ = i), o))), yn(e, t);
}
a(yn, 'c');
function Oa(e, t) {
  if (e == null) return {};
  let o;
  let i;
  const n = {};
  const r = Object.keys(e);
  for (i = 0; i < r.length; i++) t.indexOf((o = r[i])) >= 0 || (n[o] = e[o]);
  return n;
}
a(Oa, 'u');
const Z = {
  BASE: 'base',
  BODY: 'body',
  HEAD: 'head',
  HTML: 'html',
  LINK: 'link',
  META: 'meta',
  NOSCRIPT: 'noscript',
  SCRIPT: 'script',
  STYLE:
    '\
style',
  TITLE: 'title',
  FRAGMENT: 'Symbol(react.fragment)',
};
const qd = { rel: ['amphtml', 'canonical', 'alternate'] };
const Qd = {
  type: [
    'applicatio\
n/ld+json',
  ],
};
const Xd = {
  charset: '',
  name: ['robots', 'description'],
  property: [
    'og:type',
    'og:title',
    'og:url',
    'og:image',
    'og:image:alt',
    '\
og:description',
    'twitter:url',
    'twitter:title',
    'twitter:description',
    'twitter:image',
    'twitter:image:alt',
    'twitter:card',
    'twitter:site',
  ],
};
const Pa = Object.keys(Z).map(e => Z[e]);
const $o = {
  accesskey: 'accessKey',
  charset: 'charSet',
  class: 'className',
  contenteditable: 'contentEditable',
  contextmenu: 'contextMenu',
  '\
http-equiv': 'httpEquiv',
  itemprop: 'itemProp',
  tabindex: 'tabIndex',
};
const Zd = Object.keys($o).reduce((e, t) => ((e[$o[t]] = t), e), {});
const Yt = /* @__PURE__ */ a((e, t) => {
  for (let o = e.length - 1; o >= 0; o -= 1) {
    const i = e[o];
    if (Object.prototype.hasOwnProperty.call(i, t)) return i[t];
  }
  return null;
}, 'T');
const Jd = /* @__PURE__ */ a(e => {
  let t = Yt(e, Z.TITLE);
  const o = Yt(e, 'titleTemplate');
  if ((Array.isArray(t) && (t = t.join('')), o && t)) return o.replace(/%s/g, () => t);
  const i = Yt(e, 'defaultTitle');
  return t || i || void 0;
}, 'g');
const ef = /* @__PURE__ */ a(e => Yt(e, 'onChangeClientState') || (() => {}), 'b');
const dn = /* @__PURE__ */ a(
  (e, t) =>
    t
      .filter(o => o[e] !== void 0)
      .map(o => o[e])
      .reduce((o, i) => xe({}, o, i), {}),
  'v',
);
const tf = /* @__PURE__ */ a(
  (e, t) =>
    t
      .filter(o => o[Z.BASE] !== void 0)
      .map(o => o[Z.BASE])
      .reverse()
      .reduce((o, i) => {
        if (!o.length)
          for (let n = Object.keys(i), r = 0; r < n.length; r += 1) {
            const l = n[r].toLowerCase();
            if (e.indexOf(l) !== -1 && i[l]) return o.concat(i);
          }
        return o;
      }, []),
  'A',
);
const ao = /* @__PURE__ */ a((e, t, o) => {
  const i = {};
  return o
    .filter(
      n =>
        !!Array.isArray(n[e]) ||
        (n[e] !== void 0 &&
          console &&
          typeof console.warn === 'function' &&
          console.warn(
            `Helmet: ${e} shou\
ld be of type "Array". Instead found type "${typeof n[e]}"`,
          ),
        !1),
    )
    .map(n => n[e])
    .reverse()
    .reduce((n, r) => {
      const l = {};
      r.filter(g => {
        for (let h, y = Object.keys(g), f = 0; f < y.length; f += 1) {
          const b = y[f];
          const I = b.toLowerCase();
          t.indexOf(I) === -1 ||
            (h === 'rel' && g[h].toLowerCase() === 'canonical') ||
            (I === 'rel' && g[I].toLowerCase() === 'stylesheet') ||
            (h = I),
            t.indexOf(b) === -1 ||
              (b !== 'innerHTML' && b !== 'cssText' && b !== 'itemprop') ||
              (h = b);
        }
        if (!h || !g[h]) return !1;
        const _ = g[h].toLowerCase();
        return i[h] || (i[h] = {}), l[h] || (l[h] = {}), !i[h][_] && ((l[h][_] = !0), !0);
      })
        .reverse()
        .forEach(g => n.push(g));
      for (let u = Object.keys(l), c = 0; c < u.length; c += 1) {
        const p = u[c];
        const d = xe({}, i[p], l[p]);
        i[p] = d;
      }
      return n;
    }, [])
    .reverse();
}, 'C');
const of = /* @__PURE__ */ a((e, t) => {
  if (Array.isArray(e) && e.length) {
    for (let o = 0; o < e.length; o += 1) if (e[o][t]) return !0;
  }
  return !1;
}, 'O');
const Fa = /* @__PURE__ */ a(e => (Array.isArray(e) ? e.join('') : e), 'S');
const fn = /* @__PURE__ */ a(
  (e, t) =>
    Array.isArray(e)
      ? e.reduce(
          (o, i) => (
            ((n, r) => {
              for (let l = Object.keys(n), u = 0; u < l.length; u += 1)
                if (r[l[u]] && r[l[u]].includes(n[l[u]])) return !0;
              return !1;
            })(i, t)
              ? o.priority.push(i)
              : o.default.push(i),
            o
          ),
          { priority: [], default: [] },
        )
      : { default: e },
  'E',
);
const Aa = /* @__PURE__ */ a((e, t) => {
  let o;
  return xe({}, e, (((o = {})[t] = void 0), o));
}, 'I');
const rf = [Z.NOSCRIPT, Z.SCRIPT, Z.STYLE];
const mn = /* @__PURE__ */ a(
  (e, t) => (
    t === void 0 && (t = !0),
    t === !1
      ? String(e)
      : String(e)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
  ),
  'w',
);
const Da = /* @__PURE__ */ a(
  e =>
    Object.keys(e).reduce((t, o) => {
      const i = e[o] !== void 0 ? `${o}="${e[o]}"` : `${o}`;
      return t ? `${t} ${i}` : i;
    }, ''),
  'x',
);
const Ma = /* @__PURE__ */ a(
  (e, t) => (
    t === void 0 && (t = {}), Object.keys(e).reduce((o, i) => ((o[$o[i] || i] = e[i]), o), t)
  ),
  'L',
);
const Ko = /* @__PURE__ */ a(
  (e, t) =>
    t.map((o, i) => {
      let n;
      const r = (((n = { key: i })['data-rh'] = !0), n);
      return (
        Object.keys(o).forEach(l => {
          const u = $o[l] || l;
          u === 'innerHTML' || u === 'cssText'
            ? (r.dangerouslySetInnerHTML = { __html: o.innerHTML || o.cssText })
            : (r[u] = o[l]);
        }),
        s.createElement(e, r)
      );
    }),
  'j',
);
const je = /* @__PURE__ */ a((e, t, o) => {
  switch (e) {
    case Z.TITLE:
      return {
        toComponent: /* @__PURE__ */ a(
          () => (
            (n = t.titleAttributes),
            ((r = { key: (i = t.title) })['data-rh'] = !0),
            (l = Ma(n, r)),
            [s.createElement(Z.TITLE, l, i)]
          ),
          'toComponent',
        ),
        toString: /* @__PURE__ */ a(
          () =>
            ((i, n, r, l) => {
              const u = Da(r);
              const c = Fa(n);
              return u
                ? `<${i} data-rh="true" ${u}>${mn(c, l)}</${i}>`
                : `<${i} data-rh="true">${mn(c, l)}</${i}>`;
            })(e, t.title, t.titleAttributes, o),
          'toString',
        ),
      };
    case 'bodyAttributes':
    case 'htmlAttributes':
      return {
        toComponent: /* @__PURE__ */ a(() => Ma(t), 'toComponent'),
        toString: /* @__PURE__ */ a(() => Da(t), 'toString'),
      };
    default:
      return {
        toComponent: /* @__PURE__ */ a(() => Ko(e, t), 'toComponent'),
        toString: /* @__PURE__ */ a(
          () =>
            ((i, n, r) =>
              n.reduce((l, u) => {
                const c = Object.keys(u)
                  .filter(g => !(g === 'innerHTML' || g === 'cssText'))
                  .reduce((g, h) => {
                    const y = u[h] === void 0 ? h : `${h}="${mn(u[h], r)}"`;
                    return g ? `${g} ${y}` : y;
                  }, '');
                const p = u.innerHTML || u.cssText || '';
                const d = rf.indexOf(i) === -1;
                return `${l}<${i} data-rh="true" ${c}${d ? '/>' : `>${p}</${i}>`}`;
              }, ''))(e, t, o),
          'toString',
        ),
      };
  }
}, 'M');
const bn = /* @__PURE__ */ a(e => {
  const t = e.baseTag;
  const o = e.bodyAttributes;
  const i = e.encode;
  const n = e.htmlAttributes;
  const r = e.noscriptTags;
  const l = e.styleTags;
  const u = e.title;
  const c = u === void 0 ? '' : u;
  const p = e.titleAttributes;
  let d = e.linkTags;
  let g = e.metaTags;
  let h = e.scriptTags;
  let y = {
    toComponent: /* @__PURE__ */ a(() => {}, 'toComponent'),
    toString: /* @__PURE__ */ a(() => '', 'toString'),
  };
  if (e.prioritizeSeoTags) {
    const f = (b => {
      const I = b.linkTags;
      const _ = b.scriptTags;
      const m = b.encode;
      const v = fn(b.metaTags, Xd);
      const S = fn(I, qd);
      const E = fn(_, Qd);
      return {
        priorityMethods: {
          toComponent: /* @__PURE__ */ a(
            () =>
              [].concat(Ko(Z.META, v.priority), Ko(Z.LINK, S.priority), Ko(Z.SCRIPT, E.priority)),
            'toComponent',
          ),
          toString: /* @__PURE__ */ a(
            () =>
              `${je(Z.META, v.priority, m)} ${je(Z.LINK, S.priority, m)} ${je(Z.SCRIPT, E.priority, m)}`,
            'toString',
          ),
        },
        metaTags: v.default,
        linkTags: S.default,
        scriptTags: E.default,
      };
    })(e);
    (y = f.priorityMethods), (d = f.linkTags), (g = f.metaTags), (h = f.scriptTags);
  }
  return {
    priority: y,
    base: je(Z.BASE, t, i),
    bodyAttributes: je('bodyAttributes', o, i),
    htmlAttributes: je('htmlAttributes', n, i),
    link: je(Z.LINK, d, i),
    meta: je(Z.META, g, i),
    noscript: je(Z.NOSCRIPT, r, i),
    script: je(Z.SCRIPT, h, i),
    style: je(Z.STYLE, l, i),
    title: je(Z.TITLE, { title: c, titleAttributes: p }, i),
  };
}, 'k');
const Vo = [];
const vn = /* @__PURE__ */ a(function (e, t) {
  t === void 0 && (t = typeof document < 'u'),
    (this.instances = []),
    (this.value = {
      setHelmet: /* @__PURE__ */ a(i => {
        this.context.helmet = i;
      }, 'setHelmet'),
      helmetInstances: {
        get: /* @__PURE__ */ a(() => (this.canUseDOM ? Vo : this.instances), 'get'),
        add: /* @__PURE__ */ a(i => {
          (this.canUseDOM ? Vo : this.instances).push(i);
        }, 'add'),
        remove: /* @__PURE__ */ a(i => {
          const n = (this.canUseDOM ? Vo : this.instances).indexOf(i);
          (this.canUseDOM ? Vo : this.instances).splice(n, 1);
        }, 'remove'),
      },
    }),
    (this.context = e),
    (this.canUseDOM = t),
    t ||
      (e.helmet = bn({
        baseTag: [],
        bodyAttributes: {},
        encodeSpecialCharacters: !0,
        htmlAttributes: {},
        linkTags: [],
        metaTags: [],
        noscriptTags: [],
        scriptTags: [],
        styleTags: [],
        title: '',
        titleAttributes: {},
      }));
}, 'N');
const Ha = s.createContext({});
const nf = ne.default.shape({
  setHelmet: ne.default.func,
  helmetInstances: ne.default.shape({
    get: ne.default.func,
    add: ne.default.func,
    remove: ne.default.func,
  }),
});
const sf = typeof document < 'u';
const ht = /* @__PURE__ */ (e => {
  function t(o) {
    let i;
    return ((i = e.call(this, o) || this).helmetData = new vn(i.props.context, t.canUseDOM)), i;
  }
  return (
    a(t, 'r'),
    xn(t, e),
    (t.prototype.render = function () {
      return s.createElement(Ha.Provider, { value: this.helmetData.value }, this.props.children);
    }),
    t
  );
})(Re);
(ht.canUseDOM = sf),
  (ht.propTypes = {
    context: ne.default.shape({ helmet: ne.default.shape() }),
    children: ne.default.node.isRequired,
  }),
  (ht.defaultProps = { context: {} }),
  (ht.displayName = 'HelmetProvider');
const Gt = /* @__PURE__ */ a((e, t) => {
  let o;
  const i = document.head || document.querySelector(Z.HEAD);
  const n = i.querySelectorAll(`${e}[data-rh]`);
  const r = [].slice.call(n);
  const l = [];
  return (
    t?.length &&
      t.forEach(u => {
        const c = document.createElement(e);
        for (const p in u)
          Object.prototype.hasOwnProperty.call(u, p) &&
            (p === 'innerHTML'
              ? (c.innerHTML = u.innerHTML)
              : p === 'cssText'
                ? c.styleSheet
                  ? (c.styleSheet.cssText = u.cssText)
                  : c.appendChild(document.createTextNode(u.cssText))
                : c.setAttribute(p, u[p] === void 0 ? '' : u[p]));
        c.setAttribute('data-rh', 'true'),
          r.some((d, g) => ((o = g), c.isEqualNode(d))) ? r.splice(o, 1) : l.push(c);
      }),
    r.forEach(u => u.parentNode.removeChild(u)),
    l.forEach(u => i.appendChild(u)),
    { oldTags: r, newTags: l }
  );
}, 'Y');
const hn = /* @__PURE__ */ a((e, t) => {
  const o = document.getElementsByTagName(e)[0];
  if (o) {
    for (
      let i = o.getAttribute('data-rh'),
        n = i ? i.split(',') : [],
        r = [].concat(n),
        l = Object.keys(t),
        u = 0;
      u < l.length;
      u += 1
    ) {
      const c = l[u];
      const p = t[c] || '';
      o.getAttribute(c) !== p && o.setAttribute(c, p), n.indexOf(c) === -1 && n.push(c);
      const d = r.indexOf(c);
      d !== -1 && r.splice(d, 1);
    }
    for (let g = r.length - 1; g >= 0; g -= 1) o.removeAttribute(r[g]);
    n.length === r.length
      ? o.removeAttribute('data-rh')
      : o.getAttribute('data-rh') !== l.join(',') && o.setAttribute('data-rh', l.join(','));
  }
}, 'B');
const La = /* @__PURE__ */ a((e, t) => {
  const o = e.baseTag;
  const i = e.htmlAttributes;
  const n = e.linkTags;
  const r = e.metaTags;
  const l = e.noscriptTags;
  const u = e.onChangeClientState;
  const c = e.scriptTags;
  const p = e.styleTags;
  const d = e.title;
  const g = e.titleAttributes;
  hn(Z.BODY, e.bodyAttributes),
    hn(Z.HTML, i),
    ((b, I) => {
      b !== void 0 && document.title !== b && (document.title = Fa(b)), hn(Z.TITLE, I);
    })(d, g);
  const h = {
    baseTag: Gt(Z.BASE, o),
    linkTags: Gt(Z.LINK, n),
    metaTags: Gt(Z.META, r),
    noscriptTags: Gt(Z.NOSCRIPT, l),
    scriptTags: Gt(Z.SCRIPT, c),
    styleTags: Gt(Z.STYLE, p),
  };
  const y = {};
  const f = {};
  Object.keys(h).forEach(b => {
    const I = h[b];
    const _ = I.newTags;
    const m = I.oldTags;
    _.length && (y[b] = _), m.length && (f[b] = h[b].oldTags);
  }),
    t?.(),
    u(e, y, f);
}, 'K');
let lo = null;
const Uo = /* @__PURE__ */ (e => {
  function t() {
    for (let i, n = arguments.length, r = new Array(n), l = 0; l < n; l++) r[l] = arguments[l];
    return ((i = e.call.apply(e, [this].concat(r)) || this).rendered = !1), i;
  }
  a(t, 'e'), xn(t, e);
  const o = t.prototype;
  return (
    (o.shouldComponentUpdate = function (i) {
      return !(0, Ra.default)(i, this.props);
    }),
    (o.componentDidUpdate = function () {
      this.emitChange();
    }),
    (o.componentWillUnmount = function () {
      this.props.context.helmetInstances.remove(this), this.emitChange();
    }),
    (o.emitChange = function () {
      let i;
      let n;
      const r = this.props.context;
      const l = r.setHelmet;
      let u = null;
      const c =
        ((i = r.helmetInstances.get().map(p => {
          const d = xe({}, p.props);
          return (d.context = undefined), d;
        })),
        {
          baseTag: tf(['href'], i),
          bodyAttributes: dn('bodyAttributes', i),
          defer: Yt(i, 'defer'),
          encode: Yt(i, 'encodeSpecialCharacters'),
          htmlAttributes: dn('htmlAttributes', i),
          linkTags: ao(Z.LINK, ['rel', 'href'], i),
          metaTags: ao(Z.META, ['name', 'charset', 'http-equiv', 'property', 'itemprop'], i),
          noscriptTags: ao(Z.NOSCRIPT, ['innerHTML'], i),
          onChangeClientState: ef(i),
          scriptTags: ao(Z.SCRIPT, ['src', 'innerHTML'], i),
          styleTags: ao(Z.STYLE, ['cssText'], i),
          title: Jd(i),
          titleAttributes: dn('titleAttributes', i),
          prioritizeSeoTags: of(i, 'prioritizeSeoTags'),
        });
      ht.canUseDOM
        ? ((n = c),
          lo && cancelAnimationFrame(lo),
          n.defer
            ? (lo = requestAnimationFrame(() => {
                La(n, () => {
                  lo = null;
                });
              }))
            : (La(n), (lo = null)))
        : bn && (u = bn(c)),
        l(u);
    }),
    (o.init = function () {
      this.rendered ||
        ((this.rendered = !0), this.props.context.helmetInstances.add(this), this.emitChange());
    }),
    (o.render = function () {
      return this.init(), null;
    }),
    t
  );
})(Re);
(Uo.propTypes = { context: nf.isRequired }), (Uo.displayName = 'HelmetDispatcher');
const af = ['children'];
const lf = ['children'];
const uo = /* @__PURE__ */ (e => {
  function t() {
    return e.apply(this, arguments) || this;
  }
  a(t, 'r'), xn(t, e);
  const o = t.prototype;
  return (
    (o.shouldComponentUpdate = function (i) {
      return !(0, Na.default)(Aa(this.props, 'helmetData'), Aa(i, 'helmetData'));
    }),
    (o.mapNestedChildrenToProps = (i, n) => {
      if (!n) return null;
      switch (i.type) {
        case Z.SCRIPT:
        case Z.NOSCRIPT:
          return { innerHTML: n };
        case Z.STYLE:
          return { cssText: n };
        default:
          throw new Error(
            `<${i.type} /> elements are self-closing and can not contain children. Refer to our API for more information.`,
          );
      }
    }),
    (o.flattenArrayTypeChildren = function (i) {
      let n;
      const r = i.child;
      const l = i.arrayTypeChildren;
      return xe(
        {},
        l,
        (((n = {})[r.type] = [].concat(l[r.type] || [], [
          xe({}, i.newChildProps, this.mapNestedChildrenToProps(r, i.nestedChildren)),
        ])),
        n),
      );
    }),
    (o.mapObjectTypeChildren = i => {
      let n;
      let r;
      const l = i.child;
      const u = i.newProps;
      const c = i.newChildProps;
      const p = i.nestedChildren;
      switch (l.type) {
        case Z.TITLE:
          return xe({}, u, (((n = {})[l.type] = p), (n.titleAttributes = xe({}, c)), n));
        case Z.BODY:
          return xe({}, u, { bodyAttributes: xe({}, c) });
        case Z.HTML:
          return xe({}, u, { htmlAttributes: xe({}, c) });
        default:
          return xe({}, u, (((r = {})[l.type] = xe({}, c)), r));
      }
    }),
    (o.mapArrayTypeChildrenToProps = (i, n) => {
      let r = xe({}, n);
      return (
        Object.keys(i).forEach(l => {
          let u;
          r = xe({}, r, (((u = {})[l] = i[l]), u));
        }),
        r
      );
    }),
    (o.warnOnInvalidChildren = (i, n) => (
      (0, gn.default)(
        Pa.some(r => i.type === r),
        typeof i.type === 'function'
          ? 'You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to o\
ur API for more information.'
          : `Only elements types ${Pa.join(', ')} are allowed. Helmet does not support rendering <${i.type}> e\
lements. Refer to our API for more information.`,
      ),
      (0, gn.default)(
        !n || typeof n === 'string' || (Array.isArray(n) && !n.some(r => typeof r !== 'string')),
        `Helmet expects a string as a child of <${i.type}>. Did you forget to wrap your children in braces? ( <${i.type}>{\`\`}</${i.type}> ) Refer to our API for more information.`,
      ),
      !0
    )),
    (o.mapChildrenToProps = function (i, n) {
      let l = {};
      return (
        s.Children.forEach(i, u => {
          if (u?.props) {
            const c = u.props;
            const p = c.children;
            const d = Oa(c, af);
            const g = Object.keys(d).reduce((y, f) => ((y[Zd[f] || f] = d[f]), y), {});
            let h = u.type;
            switch (
              (typeof h === 'symbol' ? (h = h.toString()) : this.warnOnInvalidChildren(u, p), h)
            ) {
              case Z.FRAGMENT:
                n = this.mapChildrenToProps(p, n);
                break;
              case Z.LINK:
              case Z.META:
              case Z.NOSCRIPT:
              case Z.SCRIPT:
              case Z.STYLE:
                l = this.flattenArrayTypeChildren({
                  child: u,
                  arrayTypeChildren: l,
                  newChildProps: g,
                  nestedChildren: p,
                });
                break;
              default:
                n = this.mapObjectTypeChildren({
                  child: u,
                  newProps: n,
                  newChildProps: g,
                  nestedChildren: p,
                });
            }
          }
        }),
        this.mapArrayTypeChildrenToProps(l, n)
      );
    }),
    (o.render = function () {
      const i = this.props;
      const n = i.children;
      const r = Oa(i, lf);
      let l = xe({}, r);
      let u = r.helmetData;
      return (
        n && (l = this.mapChildrenToProps(n, l)),
        !u || u instanceof vn || (u = new vn(u.context, u.instances)),
        u
          ? /* @__PURE__ */ s.createElement(Uo, xe({}, l, { context: u.value, helmetData: void 0 }))
          : /* @__PURE__ */ s.createElement(Ha.Consumer, null, c =>
              s.createElement(Uo, xe({}, l, { context: c })),
            )
      );
    }),
    t
  );
})(Re);
(uo.propTypes = {
  base: ne.default.object,
  bodyAttributes: ne.default.object,
  children: ne.default.oneOfType([ne.default.arrayOf(ne.default.node), ne.default.node]),
  defaultTitle: ne.default.string,
  defer: ne.default.bool,
  encodeSpecialCharacters: ne.default.bool,
  htmlAttributes: ne.default.object,
  link: ne.default.arrayOf(ne.default.object),
  meta: ne.default.arrayOf(ne.default.object),
  noscript: ne.default.arrayOf(ne.default.object),
  onChangeClientState: ne.default.func,
  script: ne.default.arrayOf(ne.default.object),
  style: ne.default.arrayOf(ne.default.object),
  title: ne.default.string,
  titleAttributes: ne.default.object,
  titleTemplate: ne.default.string,
  prioritizeSeoTags: ne.default.bool,
  helmetData: ne.default.object,
}),
  (uo.defaultProps = { defer: !0, encodeSpecialCharacters: !0, prioritizeSeoTags: !1 }),
  (uo.displayName = 'Helmet');

// src/manager/constants.ts
const Qe = '@media (min-width: 600px)';

// src/manager/components/hooks/useMedia.tsx
function Ba(e) {
  const t = /* @__PURE__ */ a(
    r => (typeof window < 'u' ? window.matchMedia(r).matches : !1),
    'getMatches',
  );
  const [o, i] = $(t(e));
  function n() {
    i(t(e));
  }
  return (
    a(n, 'handleChange'),
    j(() => {
      const r = window.matchMedia(e);
      return (
        n(),
        r.addEventListener('change', n),
        () => {
          r.removeEventListener('change', n);
        }
      );
    }, [e]),
    o
  );
}
a(Ba, 'useMediaQuery');

// src/manager/components/layout/LayoutProvider.tsx
const za = jt({
  isMobileMenuOpen: !1,
  setMobileMenuOpen: /* @__PURE__ */ a(() => {}, 'setMobileMenuOpen'),
  isMobileAboutOpen: !1,
  setMobileAboutOpen: /* @__PURE__ */ a(() => {}, 'setMobileAboutOpen'),
  isMobilePanelOpen: !1,
  setMobilePanelOpen: /* @__PURE__ */ a(() => {}, 'setMobilePanelOpen'),
  isDesktop: !1,
  isMobile: !1,
});
const Wa = /* @__PURE__ */ a(({ children: e }) => {
  const [t, o] = $(!1);
  const [i, n] = $(!1);
  const [r, l] = $(!1);
  const u = Ba(`(min-width: ${600}px)`);
  const c = !u;
  const p = K(
    () => ({
      isMobileMenuOpen: t,
      setMobileMenuOpen: o,
      isMobileAboutOpen: i,
      setMobileAboutOpen: n,
      isMobilePanelOpen: r,
      setMobilePanelOpen: l,
      isDesktop: u,
      isMobile: c,
    }),
    [t, o, i, n, r, l, u, c],
  );
  return /* @__PURE__ */ s.createElement(za.Provider, { value: p }, e);
}, 'LayoutProvider');
const ge = /* @__PURE__ */ a(() => ko(za), 'useLayout');

// global-externals:@storybook/core/components
const Ww = __STORYBOOK_COMPONENTS__;
const {
  A: jw,
  ActionBar: Vw,
  AddonPanel: Kw,
  Badge: Go,
  Bar: $w,
  Blockquote: Uw,
  Button: me,
  ClipboardCode: Gw,
  Code: Yw,
  DL: qw,
  Div: Qw,
  DocumentWrapper: Xw,
  EmptyTabContent: ja,
  ErrorFormatter: Va,
  FlexBar: Zw,
  Form: Yo,
  H1: Jw,
  H2: eT,
  H3: tT,
  H4: oT,
  H5: rT,
  H6: nT,
  HR: iT,
  IconButton: te,
  IconButtonSkeleton: sT,
  Icons: Ka,
  Img: aT,
  LI: lT,
  Link: Me,
  ListItem: uf,
  Loader: qo,
  Modal: Et,
  OL: uT,
  P: cT,
  Placeholder: pT,
  Pre: dT,
  ProgressSpinner: $a,
  ResetWrapper: fT,
  ScrollArea: Qo,
  Separator: qt,
  Spaced: lt,
  Span: mT,
  StorybookIcon: hT,
  StorybookLogo: Xo,
  Symbols: gT,
  SyntaxHighlighter: yT,
  TT: bT,
  TabBar: Zo,
  TabButton: Jo,
  TabWrapper: vT,
  Table: xT,
  Tabs: Ua,
  TabsState: ST,
  TooltipLinkList: gt,
  TooltipMessage: IT,
  TooltipNote: Xe,
  UL: ET,
  WithTooltip: be,
  WithTooltipPure: _T,
  Zoom: Ga,
  codeCommon: wT,
  components: TT,
  createCopyToClipboardFunction: CT,
  getStoryHref: Qt,
  icons: kT,
  interleaveSeparators: OT,
  nameSpaceClassNames: PT,
  resetComponents: AT,
  withReset: DT,
} = __STORYBOOK_COMPONENTS__;

// ../node_modules/@babel/runtime/helpers/esm/extends.js
function G() {
  return (
    (G = Object.assign
      ? Object.assign.bind()
      : e => {
          for (let t = 1; t < arguments.length; t++) {
            const o = arguments[t];
            for (const i in o) ({}).hasOwnProperty.call(o, i) && (e[i] = o[i]);
          }
          return e;
        }),
    G.apply(null, arguments)
  );
}
a(G, '_extends');

// ../node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function Ya(e) {
  if (e === void 0)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
a(Ya, '_assertThisInitialized');

// ../node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function yt(e, t) {
  return (
    (yt = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : (o, i) => ((o.__proto__ = i), o)),
    yt(e, t)
  );
}
a(yt, '_setPrototypeOf');

// ../node_modules/@babel/runtime/helpers/esm/inheritsLoose.js
function Xt(e, t) {
  (e.prototype = Object.create(t.prototype)), (e.prototype.constructor = e), yt(e, t);
}
a(Xt, '_inheritsLoose');

// ../node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function er(e) {
  return (
    (er = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : t => t.__proto__ || Object.getPrototypeOf(t)),
    er(e)
  );
}
a(er, '_getPrototypeOf');

// ../node_modules/@babel/runtime/helpers/esm/isNativeFunction.js
function qa(e) {
  try {
    return Function.toString.call(e).indexOf('[native code]') !== -1;
  } catch {
    return typeof e === 'function';
  }
}
a(qa, '_isNativeFunction');

// ../node_modules/@babel/runtime/helpers/esm/isNativeReflectConstruct.js
function Sn() {
  try {
    const e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], () => {}));
  } catch {}
  return (Sn = /* @__PURE__ */ a(() => !!e, '_isNativeReflectConstruct'))();
}
a(Sn, '_isNativeReflectConstruct');

// ../node_modules/@babel/runtime/helpers/esm/construct.js
function Qa(e, t, o) {
  if (Sn()) return Reflect.construct.apply(null, arguments);
  const i = [null];
  i.push.apply(i, t);
  const n = new (e.bind.apply(e, i))();
  return o && yt(n, o.prototype), n;
}
a(Qa, '_construct');

// ../node_modules/@babel/runtime/helpers/esm/wrapNativeSuper.js
function tr(e) {
  const t = typeof Map === 'function' ? /* @__PURE__ */ new Map() : void 0;
  return (
    (tr = /* @__PURE__ */ a(i => {
      if (i === null || !qa(i)) return i;
      if (typeof i !== 'function')
        throw new TypeError('Super expression must either be null or a function');
      if (t !== void 0) {
        if (t.has(i)) return t.get(i);
        t.set(i, n);
      }
      function n() {
        return Qa(i, arguments, er(this).constructor);
      }
      return (
        a(n, 'Wrapper'),
        (n.prototype = Object.create(i.prototype, {
          constructor: {
            value: n,
            enumerable: !1,
            writable: !0,
            configurable: !0,
          },
        })),
        yt(n, i)
      );
    }, '_wrapNativeSuper')),
    tr(e)
  );
}
a(tr, '_wrapNativeSuper');

// ../node_modules/polished/dist/polished.esm.js
const ot = /* @__PURE__ */ (e => {
  Xt(t, e);
  function t(o) {
    let i;
    if (1)
      i =
        e.call(
          this,
          `An error occurred. See https://github.com/styled-components/polished/blob/main/src/internalHelpers/errors.md#${o} for more information.`,
        ) || this;
    else for (let n, r, l; l < n; l++);
    return Ya(i);
  }
  return a(t, 'PolishedError'), t;
})(/* @__PURE__ */ tr(Error));
function In(e) {
  return Math.round(e * 255);
}
a(In, 'colorToInt');
function cf(e, t, o) {
  return `${In(e)},${In(t)},${In(o)}`;
}
a(cf, 'convertToInt');
function co(e, t, o, i) {
  if ((i === void 0 && (i = cf), t === 0)) return i(o, o, o);
  const n = (((e % 360) + 360) % 360) / 60;
  const r = (1 - Math.abs(2 * o - 1)) * t;
  const l = r * (1 - Math.abs((n % 2) - 1));
  let u = 0;
  let c = 0;
  let p = 0;
  n >= 0 && n < 1
    ? ((u = r), (c = l))
    : n >= 1 && n < 2
      ? ((u = l), (c = r))
      : n >= 2 && n < 3
        ? ((c = r), (p = l))
        : n >= 3 && n < 4
          ? ((c = l), (p = r))
          : n >= 4 && n < 5
            ? ((u = l), (p = r))
            : n >= 5 && n < 6 && ((u = r), (p = l));
  const d = o - r / 2;
  const g = u + d;
  const h = c + d;
  const y = p + d;
  return i(g, h, y);
}
a(co, 'hslToRgb');
const Xa = {
  aliceblue: 'f0f8ff',
  antiquewhite: 'faebd7',
  aqua: '00ffff',
  aquamarine: '7fffd4',
  azure: 'f0ffff',
  beige: 'f5f5dc',
  bisque: 'ffe4c4',
  black: '000',
  blanchedalmond: 'ffebcd',
  blue: '0000ff',
  blueviolet: '8a2be2',
  brown: 'a52a2a',
  burlywood: 'deb887',
  cadetblue: '5f9ea0',
  chartreuse: '7fff00',
  chocolate: 'd2691e',
  coral: 'ff7f50',
  cornflowerblue: '6495ed',
  cornsilk: 'fff8dc',
  crimson: 'dc143c',
  cyan: '00ffff',
  darkblue: '00008b',
  darkcyan: '008b8b',
  darkgoldenrod: 'b8860b',
  darkgray: 'a9a9a9',
  darkgreen: '006400',
  darkgrey: 'a9a9a9',
  darkkhaki: 'bdb76b',
  darkmagenta: '8b008b',
  darkolivegreen: '556b2f',
  darkorange: 'ff8c00',
  darkorchid: '9932cc',
  darkred: '8b0000',
  darksalmon: 'e9967a',
  darkseagreen: '8fbc8f',
  darkslateblue: '483d8b',
  darkslategray: '2f4f4f',
  darkslategrey: '2f4f4f',
  darkturquoise: '00ced1',
  darkviolet: '9400d3',
  deeppink: 'ff1493',
  deepskyblue: '00bfff',
  dimgray: '696969',
  dimgrey: '696969',
  dodgerblue: '1e90ff',
  firebrick: 'b22222',
  floralwhite: 'fffaf0',
  forestgreen: '228b22',
  fuchsia: 'ff00ff',
  gainsboro: 'dcdcdc',
  ghostwhite: 'f8f8ff',
  gold: 'ffd700',
  goldenrod: 'daa520',
  gray: '808080',
  green: '008000',
  greenyellow: 'adff2f',
  grey: '808080',
  honeydew: 'f0fff0',
  hotpink: 'ff69b4',
  indianred: 'cd5c5c',
  indigo: '4b0082',
  ivory: 'fffff0',
  khaki: 'f0e68c',
  lavender: 'e6e6fa',
  lavenderblush: 'fff0f5',
  lawngreen: '7cfc00',
  lemonchiffon: 'fffacd',
  lightblue: 'add8e6',
  lightcoral: 'f08080',
  lightcyan: 'e0ffff',
  lightgoldenrodyellow: 'fafad2',
  lightgray: 'd3d3d3',
  lightgreen: '90ee90',
  lightgrey: 'd3d3d3',
  lightpink: 'ffb6c1',
  lightsalmon: 'ffa07a',
  lightseagreen: '20b2aa',
  lightskyblue: '87cefa',
  lightslategray: '789',
  lightslategrey: '789',
  lightsteelblue: 'b0c4de',
  lightyellow: 'ffffe0',
  lime: '0f0',
  limegreen: '32cd32',
  linen: 'faf0e6',
  magenta: 'f0f',
  maroon: '800000',
  mediumaquamarine: '66cdaa',
  mediumblue: '0000cd',
  mediumorchid: 'ba55d3',
  mediumpurple: '9370db',
  mediumseagreen: '3cb371',
  mediumslateblue: '7b68ee',
  mediumspringgreen: '00fa9a',
  mediumturquoise: '48d1cc',
  mediumvioletred: 'c71585',
  midnightblue: '191970',
  mintcream: 'f5fffa',
  mistyrose: 'ffe4e1',
  moccasin: 'ffe4b5',
  navajowhite: 'ffdead',
  navy: '000080',
  oldlace: 'fdf5e6',
  olive: '808000',
  olivedrab: '6b8e23',
  orange: 'ffa500',
  orangered: 'ff4500',
  orchid: 'da70d6',
  palegoldenrod: 'eee8aa',
  palegreen: '98fb98',
  paleturquoise: 'afeeee',
  palevioletred: 'db7093',
  papayawhip: 'ffefd5',
  peachpuff: 'ffdab9',
  peru: 'cd853f',
  pink: 'ffc0cb',
  plum: 'dda0dd',
  powderblue: 'b0e0e6',
  purple: '800080',
  rebeccapurple: '639',
  red: 'f00',
  rosybrown: 'bc8f8f',
  royalblue: '4169e1',
  saddlebrown: '8b4513',
  salmon: 'fa8072',
  sandybrown: 'f4a460',
  seagreen: '2e8b57',
  seashell: 'fff5ee',
  sienna: 'a0522d',
  silver: 'c0c0c0',
  skyblue: '87ceeb',
  slateblue: '6a5acd',
  slategray: '708090',
  slategrey: '708090',
  snow: 'fffafa',
  springgreen: '00ff7f',
  steelblue: '4682b4',
  tan: 'd2b48c',
  teal: '008080',
  thistle: 'd8bfd8',
  tomato: 'ff6347',
  turquoise: '40e0d0',
  violet: 'ee82ee',
  wheat: 'f5deb3',
  white: 'fff',
  whitesmoke: 'f5f5f5',
  yellow: 'ff0',
  yellowgreen: '9acd32',
};
function pf(e) {
  if (typeof e !== 'string') return e;
  const t = e.toLowerCase();
  return Xa[t] ? `#${Xa[t]}` : e;
}
a(pf, 'nameToHex');
const df = /^#[a-fA-F0-9]{6}$/;
const ff = /^#[a-fA-F0-9]{8}$/;
const mf = /^#[a-fA-F0-9]{3}$/;
const hf = /^#[a-fA-F0-9]{4}$/;
const En = /^rgb\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*\)$/i;
const gf =
  /^rgb(?:a)?\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;
const yf =
  /^hsl\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*\)$/i;
const bf =
  /^hsl(?:a)?\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;
function Cn(e) {
  if (typeof e !== 'string') throw new ot(3);
  const t = pf(e);
  if (t.match(df))
    return {
      red: Number.parseInt(`${t[1]}${t[2]}`, 16),
      green: Number.parseInt(`${t[3]}${t[4]}`, 16),
      blue: Number.parseInt(`${t[5]}${t[6]}`, 16),
    };
  if (t.match(ff)) {
    const o = Number.parseFloat((Number.parseInt(`${t[7]}${t[8]}`, 16) / 255).toFixed(2));
    return {
      red: Number.parseInt(`${t[1]}${t[2]}`, 16),
      green: Number.parseInt(`${t[3]}${t[4]}`, 16),
      blue: Number.parseInt(`${t[5]}${t[6]}`, 16),
      alpha: o,
    };
  }
  if (t.match(mf))
    return {
      red: Number.parseInt(`${t[1]}${t[1]}`, 16),
      green: Number.parseInt(`${t[2]}${t[2]}`, 16),
      blue: Number.parseInt(`${t[3]}${t[3]}`, 16),
    };
  if (t.match(hf)) {
    const i = Number.parseFloat((Number.parseInt(`${t[4]}${t[4]}`, 16) / 255).toFixed(2));
    return {
      red: Number.parseInt(`${t[1]}${t[1]}`, 16),
      green: Number.parseInt(`${t[2]}${t[2]}`, 16),
      blue: Number.parseInt(`${t[3]}${t[3]}`, 16),
      alpha: i,
    };
  }
  const n = En.exec(t);
  if (n)
    return {
      red: Number.parseInt(`${n[1]}`, 10),
      green: Number.parseInt(`${n[2]}`, 10),
      blue: Number.parseInt(`${n[3]}`, 10),
    };
  const r = gf.exec(t.substring(0, 50));
  if (r)
    return {
      red: Number.parseInt(`${r[1]}`, 10),
      green: Number.parseInt(`${r[2]}`, 10),
      blue: Number.parseInt(`${r[3]}`, 10),
      alpha:
        Number.parseFloat(`${r[4]}`) > 1
          ? Number.parseFloat(`${r[4]}`) / 100
          : Number.parseFloat(`${r[4]}`),
    };
  const l = yf.exec(t);
  if (l) {
    const u = Number.parseInt(`${l[1]}`, 10);
    const c = Number.parseInt(`${l[2]}`, 10) / 100;
    const p = Number.parseInt(`${l[3]}`, 10) / 100;
    const d = `rgb(${co(u, c, p)})`;
    const g = En.exec(d);
    if (!g) throw new ot(4, t, d);
    return {
      red: Number.parseInt(`${g[1]}`, 10),
      green: Number.parseInt(`${g[2]}`, 10),
      blue: Number.parseInt(`${g[3]}`, 10),
    };
  }
  const h = bf.exec(t.substring(0, 50));
  if (h) {
    const y = Number.parseInt(`${h[1]}`, 10);
    const f = Number.parseInt(`${h[2]}`, 10) / 100;
    const b = Number.parseInt(`${h[3]}`, 10) / 100;
    const I = `rgb(${co(y, f, b)})`;
    const _ = En.exec(I);
    if (!_) throw new ot(4, t, I);
    return {
      red: Number.parseInt(`${_[1]}`, 10),
      green: Number.parseInt(`${_[2]}`, 10),
      blue: Number.parseInt(`${_[3]}`, 10),
      alpha:
        Number.parseFloat(`${h[4]}`) > 1
          ? Number.parseFloat(`${h[4]}`) / 100
          : Number.parseFloat(`${h[4]}`),
    };
  }
  throw new ot(5);
}
a(Cn, 'parseToRgb');
function vf(e) {
  const t = e.red / 255;
  const o = e.green / 255;
  const i = e.blue / 255;
  const n = Math.max(t, o, i);
  const r = Math.min(t, o, i);
  const l = (n + r) / 2;
  if (n === r)
    return e.alpha !== void 0
      ? {
          hue: 0,
          saturation: 0,
          lightness: l,
          alpha: e.alpha,
        }
      : {
          hue: 0,
          saturation: 0,
          lightness: l,
        };
  let u;
  const c = n - r;
  const p = l > 0.5 ? c / (2 - n - r) : c / (n + r);
  switch (n) {
    case t:
      u = (o - i) / c + (o < i ? 6 : 0);
      break;
    case o:
      u = (i - t) / c + 2;
      break;
    default:
      u = (t - o) / c + 4;
      break;
  }
  return (
    (u *= 60),
    e.alpha !== void 0
      ? {
          hue: u,
          saturation: p,
          lightness: l,
          alpha: e.alpha,
        }
      : {
          hue: u,
          saturation: p,
          lightness: l,
        }
  );
}
a(vf, 'rgbToHsl');
function Za(e) {
  return vf(Cn(e));
}
a(Za, 'parseToHsl');
const xf = /* @__PURE__ */ a(
  t =>
    t.length === 7 && t[1] === t[2] && t[3] === t[4] && t[5] === t[6]
      ? `#${t[1]}${t[3]}${t[5]}`
      : t,
  'reduceHexValue',
);
const wn = xf;
function _t(e) {
  const t = e.toString(16);
  return t.length === 1 ? `0${t}` : t;
}
a(_t, 'numberToHex');
function _n(e) {
  return _t(Math.round(e * 255));
}
a(_n, 'colorToHex');
function Sf(e, t, o) {
  return wn(`#${_n(e)}${_n(t)}${_n(o)}`);
}
a(Sf, 'convertToHex');
function or(e, t, o) {
  return co(e, t, o, Sf);
}
a(or, 'hslToHex');
function If(e, t, o) {
  if (typeof e === 'number' && typeof t === 'number' && typeof o === 'number') return or(e, t, o);
  if (typeof e === 'object' && t === void 0 && o === void 0)
    return or(e.hue, e.saturation, e.lightness);
  throw new ot(1);
}
a(If, 'hsl');
function Ef(e, t, o, i) {
  if (
    typeof e === 'number' &&
    typeof t === 'number' &&
    typeof o === 'number' &&
    typeof i === 'number'
  )
    return i >= 1 ? or(e, t, o) : `rgba(${co(e, t, o)},${i})`;
  if (typeof e === 'object' && t === void 0 && o === void 0 && i === void 0)
    return e.alpha >= 1
      ? or(e.hue, e.saturation, e.lightness)
      : `rgba(${co(e.hue, e.saturation, e.lightness)},${e.alpha})`;
  throw new ot(2);
}
a(Ef, 'hsla');
function Tn(e, t, o) {
  if (typeof e === 'number' && typeof t === 'number' && typeof o === 'number')
    return wn(`#${_t(e)}${_t(t)}${_t(o)}`);
  if (typeof e === 'object' && t === void 0 && o === void 0)
    return wn(`#${_t(e.red)}${_t(e.green)}${_t(e.blue)}`);
  throw new ot(6);
}
a(Tn, 'rgb');
function rr(e, t, o, i) {
  if (typeof e === 'string' && typeof t === 'number') {
    const n = Cn(e);
    return `rgba(${n.red},${n.green},${n.blue},${t})`;
  }
  if (
    typeof e === 'number' &&
    typeof t === 'number' &&
    typeof o === 'number' &&
    typeof i === 'number'
  )
    return i >= 1 ? Tn(e, t, o) : `rgba(${e},${t},${o},${i})`;
  if (typeof e === 'object' && t === void 0 && o === void 0 && i === void 0)
    return e.alpha >= 1
      ? Tn(e.red, e.green, e.blue)
      : `rgba(${e.red},${e.green},${e.blue},${e.alpha})`;
  throw new ot(7);
}
a(rr, 'rgba');
const _f = /* @__PURE__ */ a(
  t =>
    typeof t.red === 'number' &&
    typeof t.green === 'number' &&
    typeof t.blue === 'number' &&
    (typeof t.alpha !== 'number' || typeof t.alpha > 'u'),
  'isRgb',
);
const wf = /* @__PURE__ */ a(
  t =>
    typeof t.red === 'number' &&
    typeof t.green === 'number' &&
    typeof t.blue === 'number' &&
    typeof t.alpha === 'number',
  'isRgba',
);
const Tf = /* @__PURE__ */ a(
  t =>
    typeof t.hue === 'number' &&
    typeof t.saturation === 'number' &&
    typeof t.lightness === 'number' &&
    (typeof t.alpha !== 'number' || typeof t.alpha > 'u'),
  'isHsl',
);
const Cf = /* @__PURE__ */ a(
  t =>
    typeof t.hue === 'number' &&
    typeof t.saturation === 'number' &&
    typeof t.lightness === 'number' &&
    typeof t.alpha === 'number',
  'isHsla',
);
function Ja(e) {
  if (typeof e !== 'object') throw new ot(8);
  if (wf(e)) return rr(e);
  if (_f(e)) return Tn(e);
  if (Cf(e)) return Ef(e);
  if (Tf(e)) return If(e);
  throw new ot(8);
}
a(Ja, 'toColorString');
function el(e, t, o) {
  return /* @__PURE__ */ a(function () {
    const n = o.concat(Array.prototype.slice.call(arguments));
    return n.length >= t ? e.apply(this, n) : el(e, t, n);
  }, 'fn');
}
a(el, 'curried');
function kn(e) {
  return el(e, e.length, []);
}
a(kn, 'curry');
function On(e, t, o) {
  return Math.max(e, Math.min(t, o));
}
a(On, 'guard');
function kf(e, t) {
  if (t === 'transparent') return t;
  const o = Za(t);
  return Ja(
    G({}, o, {
      lightness: On(0, 1, o.lightness - Number.parseFloat(e)),
    }),
  );
}
a(kf, 'darken');
const Of = /* @__PURE__ */ kn(kf);
const nr = Of;
function Pf(e, t) {
  if (t === 'transparent') return t;
  const o = Za(t);
  return Ja(
    G({}, o, {
      lightness: On(0, 1, o.lightness + Number.parseFloat(e)),
    }),
  );
}
a(Pf, 'lighten');
const Af = /* @__PURE__ */ kn(Pf);
const po = Af;
function Df(e, t) {
  if (t === 'transparent') return t;
  const o = Cn(t);
  const i = typeof o.alpha === 'number' ? o.alpha : 1;
  const n = G({}, o, {
    alpha: On(0, 1, +(i * 100 - Number.parseFloat(e) * 100).toFixed(2) / 100),
  });
  return rr(n);
}
a(Df, 'transparentize');
const Mf = /* @__PURE__ */ kn(Df);
const we = Mf;

// src/manager/components/notifications/NotificationItem.tsx
const Lf = It({
  '0%': {
    opacity: 0,
    transform: 'translateY(30px)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateY(0)',
  },
});
const Nf = It({
  '0%': {
    width: '0%',
  },
  '100%': {
    width: '100%',
  },
});
const tl = x.div(
  ({ theme: e }) => ({
    position: 'relative',
    display: 'flex',
    border: `1px solid ${e.appBorderColor}`,
    padding: '12px 6px 12px 12px',
    borderRadius: e.appBorderRadius + 1,
    alignItems: 'center',
    animation: `${Lf} 500ms`,
    background: e.base === 'light' ? 'hsla(203, 50%, 20%, .97)' : 'hsla(203, 30%, 95%, .97)',
    boxShadow: '0 2px 5px 0 rgba(0, 0, 0, 0.05), 0 5px 15px 0 rgba(0, 0, 0, 0.1)',
    color: e.color.inverseText,
    textDecoration: 'none',
    overflow: 'hidden',
    [Qe]: {
      boxShadow: `0 1px 2px 0 rgba(0, 0, 0, 0.05), 0px -5px 20px 10px ${e.background.app}`,
    },
  }),
  ({ duration: e, theme: t }) =>
    e && {
      '&::after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 3,
        background: t.color.secondary,
        animation: `${Nf} ${e}ms linear forwards reverse`,
      },
    },
);
const ol = x(tl)({
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  textAlign: 'left',
  transition: 'all 150ms ease-out',
  transform: 'translate3d(0, 0, 0)',
  '&:hover': {
    transform: 'translate3d(0, -3px, 0)',
    boxShadow:
      '0 1px 3px 0 rgba(30,167,253,0.5), 0 2px 5px 0 rgba(0,0,0,0.05), 0 5px 15px 0 rgba(0,0,0,0.1)',
  },
  '&:active': {
    transform: 'translate3d(0, 0, 0)',
    boxShadow:
      '0 1px 3px 0 rgba(30,167,253,0.5), 0 2px 5px 0 rgba(0,0,0,0.05), 0 5px 15px 0 rgba(0,0,0,0.1)',
  },
  '&:focus': {
    boxShadow:
      'rgba(2,156,253,1) 0 0 0 1px inset, 0 1px 3px 0 rgba(30,167,253,0.5), 0 2px 5px 0 rgba(0,0,0,0.05), 0 5px 15px 0 rgba(0,0,0,0\
.1)',
  },
});
const Rf = ol.withComponent('div');
const Ff = ol.withComponent(zo);
const Hf = x.div({
  display: 'flex',
  marginRight: 10,
  alignItems: 'center',
  svg: {
    width: 16,
    height: 16,
  },
});
const Bf = x.div(({ theme: e }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: e.base === 'dark' ? e.color.mediumdark : e.color.mediumlight,
}));
const zf = x.div(({ theme: e, hasIcon: t }) => ({
  height: '100%',
  alignItems: 'center',
  whiteSpace: 'balance',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: e.typography.size.s1,
  lineHeight: '16px',
  fontWeight: e.typography.weight.bold,
}));
const Wf = x.div(({ theme: e }) => ({
  color: we(0.25, e.color.inverseText),
  fontSize: e.typography.size.s1 - 1,
  lineHeight: '14px',
  marginTop: 2,
  whiteSpace: 'balance',
}));
const Pn = /* @__PURE__ */ a(({ icon: e, content: { headline: t, subHeadline: o } }) => {
  const i = Ae();
  const n = i.base === 'dark' ? i.color.mediumdark : i.color.mediumlight;
  return /* @__PURE__ */ s.createElement(
    s.Fragment,
    null,
    !e ||
      /* @__PURE__ */ s.createElement(
        Hf,
        null,
        s.isValidElement(e)
          ? e
          : typeof e === 'object' &&
              'name' in e &&
              /* @__PURE__ */ s.createElement(Ka, { icon: e.name, color: e.color || n }),
      ),
    /* @__PURE__ */ s.createElement(
      Bf,
      null,
      /* @__PURE__ */ s.createElement(zf, { title: t, hasIcon: !!e }, t),
      o && /* @__PURE__ */ s.createElement(Wf, null, o),
    ),
  );
}, 'ItemContent');
const jf = x(te)(({ theme: e }) => ({
  width: 28,
  alignSelf: 'center',
  marginTop: 0,
  color: e.base === 'light' ? 'rgba(255,255,255,0.7)' : ' #999999',
}));
const An = /* @__PURE__ */ a(
  ({ onDismiss: e }) =>
    /* @__PURE__ */ s.createElement(
      jf,
      {
        title: 'Dismiss notification',
        onClick: t => {
          t.preventDefault(), t.stopPropagation(), e();
        },
      },
      /* @__PURE__ */ s.createElement(Ao, { size: 12 }),
    ),
  'DismissNotificationItem',
);
const IC = x.div({
  height: 48,
});
const Vf = /* @__PURE__ */ a(
  ({
    notification: { content: e, duration: t, link: o, onClear: i, onClick: n, id: r, icon: l },
    onDismissNotification: u,
    zIndex: c,
  }) => {
    const p = A(() => {
      u(r), i?.({ dismissed: !1, timeout: !0 });
    }, [r, u, i]);
    const d = Y(null);
    j(() => {
      if (t) return (d.current = setTimeout(p, t)), () => clearTimeout(d.current);
    }, [t, p]);
    const g = A(() => {
      clearTimeout(d.current), u(r), i?.({ dismissed: !0, timeout: !1 });
    }, [r, u, i]);
    return o
      ? /* @__PURE__ */ s.createElement(
          Ff,
          { to: o, duration: t, style: { zIndex: c } },
          /* @__PURE__ */ s.createElement(Pn, { icon: l, content: e }),
          /* @__PURE__ */ s.createElement(An, { onDismiss: g }),
        )
      : n
        ? /* @__PURE__ */ s.createElement(
            Rf,
            {
              duration: t,
              onClick: () => n({ onDismiss: g }),
              style: { zIndex: c },
            },
            /* @__PURE__ */ s.createElement(Pn, { icon: l, content: e }),
            /* @__PURE__ */ s.createElement(An, { onDismiss: g }),
          )
        : /* @__PURE__ */ s.createElement(
            tl,
            { duration: t, style: { zIndex: c } },
            /* @__PURE__ */ s.createElement(Pn, { icon: l, content: e }),
            /* @__PURE__ */ s.createElement(An, { onDismiss: g }),
          );
  },
  'NotificationItem',
);
const rl = Vf;

// src/manager/components/notifications/NotificationList.tsx
const ir = /* @__PURE__ */ a(({ notifications: e, clearNotification: t }) => {
  const { isMobile: o } = ge();
  return /* @__PURE__ */ s.createElement(
    Kf,
    { isMobile: o },
    e?.map((i, n) =>
      /* @__PURE__ */ s.createElement(rl, {
        key: i.id,
        onDismissNotification: r => t(r),
        notification: i,
        zIndex: e.length - n,
      }),
    ),
  );
}, 'NotificationList');
const Kf = x.div(
  {
    zIndex: 200,
    '> * + *': {
      marginTop: 12,
    },
    '&:empty': {
      display: 'none',
    },
  },
  ({ isMobile: e }) =>
    e && {
      position: 'fixed',
      bottom: 40,
      margin: 20,
    },
);

// src/manager/container/Notifications.tsx
const $f = /* @__PURE__ */ a(
  ({ state: e, api: t }) => ({
    notifications: e.notifications,
    clearNotification: t.clearNotification,
  }),
  'mapper',
);
const nl = /* @__PURE__ */ a(
  e =>
    /* @__PURE__ */ s.createElement(he, { filter: $f }, t =>
      /* @__PURE__ */ s.createElement(ir, {
        ...e,
        ...t,
      }),
    ),
  'Notifications',
);

// src/manager/components/mobile/navigation/MobileAddonsDrawer.tsx
const Uf = x.div(({ theme: e }) => ({
  position: 'relative',
  boxSizing: 'border-box',
  width: '100%',
  background: e.background.content,
  height: '42vh',
  zIndex: 11,
  overflow: 'hidden',
}));
const il = /* @__PURE__ */ a(
  ({ children: e }) => /* @__PURE__ */ s.createElement(Uf, null, e),
  'MobileAddonsDrawer',
);

// ../node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
function ke(e, t) {
  if (e == null) return {};
  const o = {};
  for (const i in e)
    if ({}.hasOwnProperty.call(e, i)) {
      if (t.indexOf(i) >= 0) continue;
      o[i] = e[i];
    }
  return o;
}
a(ke, '_objectWithoutPropertiesLoose');

// global-externals:react-dom
const fo = __REACT_DOM__;
const {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: jC,
  createPortal: VC,
  createRoot: KC,
  findDOMNode: $C,
  flushSync: mo,
  hydrate: UC,
  hydrateRoot: GC,
  render: YC,
  unmountComponentAtNode: qC,
  unstable_batchedUpdates: QC,
  unstable_renderSubtreeIntoContainer: XC,
  version: ZC,
} = __REACT_DOM__;

// ../node_modules/react-transition-group/esm/config.js
const Dn = {
  disabled: !1,
};

// ../node_modules/react-transition-group/esm/TransitionGroupContext.js
const Mn = s.createContext(null);

// ../node_modules/react-transition-group/esm/utils/reflow.js
const sl = /* @__PURE__ */ a(t => t.scrollTop, 'forceReflow');

// ../node_modules/react-transition-group/esm/Transition.js
const ho = 'unmounted';
const wt = 'exited';
const Tt = 'entering';
const Jt = 'entered';
const Ln = 'exiting';
const ut = /* @__PURE__ */ (e => {
  Xt(t, e);
  function t(i, n) {
    let r;
    r = e.call(this, i, n) || this;
    const l = n;
    const u = l && !l.isMounting ? i.enter : i.appear;
    let c;
    return (
      (r.appearStatus = null),
      i.in
        ? u
          ? ((c = wt), (r.appearStatus = Tt))
          : (c = Jt)
        : i.unmountOnExit || i.mountOnEnter
          ? (c = ho)
          : (c = wt),
      (r.state = {
        status: c,
      }),
      (r.nextCallback = null),
      r
    );
  }
  a(t, 'Transition'),
    (t.getDerivedStateFromProps = /* @__PURE__ */ a((n, r) => {
      const l = n.in;
      return l && r.status === ho
        ? {
            status: wt,
          }
        : null;
    }, 'getDerivedStateFromProps'));
  const o = t.prototype;
  return (
    (o.componentDidMount = /* @__PURE__ */ a(function () {
      this.updateStatus(!0, this.appearStatus);
    }, 'componentDidMount')),
    (o.componentDidUpdate = /* @__PURE__ */ a(function (n) {
      let r = null;
      if (n !== this.props) {
        const l = this.state.status;
        this.props.in ? l !== Tt && l !== Jt && (r = Tt) : (l === Tt || l === Jt) && (r = Ln);
      }
      this.updateStatus(!1, r);
    }, 'componentDidUpdate')),
    (o.componentWillUnmount = /* @__PURE__ */ a(function () {
      this.cancelNextCallback();
    }, 'componentWillUnmount')),
    (o.getTimeouts = /* @__PURE__ */ a(function () {
      const n = this.props.timeout;
      let r;
      let l;
      let u;
      return (
        (r = l = u = n),
        n != null &&
          typeof n !== 'number' &&
          ((r = n.exit), (l = n.enter), (u = n.appear !== void 0 ? n.appear : l)),
        {
          exit: r,
          enter: l,
          appear: u,
        }
      );
    }, 'getTimeouts')),
    (o.updateStatus = /* @__PURE__ */ a(function (n, r) {
      if ((n === void 0 && (n = !1), r !== null))
        if ((this.cancelNextCallback(), r === Tt)) {
          if (this.props.unmountOnExit || this.props.mountOnEnter) {
            const l = this.props.nodeRef ? this.props.nodeRef.current : fo.findDOMNode(this);
            l && sl(l);
          }
          this.performEnter(n);
        } else this.performExit();
      else
        this.props.unmountOnExit &&
          this.state.status === wt &&
          this.setState({
            status: ho,
          });
    }, 'updateStatus')),
    (o.performEnter = /* @__PURE__ */ a(function (n) {
      const l = this.props.enter;
      const u = this.context ? this.context.isMounting : n;
      const c = this.props.nodeRef ? [u] : [fo.findDOMNode(this), u];
      const p = c[0];
      const d = c[1];
      const g = this.getTimeouts();
      const h = u ? g.appear : g.enter;
      if ((!n && !l) || Dn.disabled) {
        this.safeSetState(
          {
            status: Jt,
          },
          () => {
            this.props.onEntered(p);
          },
        );
        return;
      }
      this.props.onEnter(p, d),
        this.safeSetState(
          {
            status: Tt,
          },
          () => {
            this.props.onEntering(p, d),
              this.onTransitionEnd(h, () => {
                this.safeSetState(
                  {
                    status: Jt,
                  },
                  () => {
                    this.props.onEntered(p, d);
                  },
                );
              });
          },
        );
    }, 'performEnter')),
    (o.performExit = /* @__PURE__ */ a(function () {
      const r = this.props.exit;
      const l = this.getTimeouts();
      const u = this.props.nodeRef ? void 0 : fo.findDOMNode(this);
      if (!r || Dn.disabled) {
        this.safeSetState(
          {
            status: wt,
          },
          () => {
            this.props.onExited(u);
          },
        );
        return;
      }
      this.props.onExit(u),
        this.safeSetState(
          {
            status: Ln,
          },
          () => {
            this.props.onExiting(u),
              this.onTransitionEnd(l.exit, () => {
                this.safeSetState(
                  {
                    status: wt,
                  },
                  () => {
                    this.props.onExited(u);
                  },
                );
              });
          },
        );
    }, 'performExit')),
    (o.cancelNextCallback = /* @__PURE__ */ a(function () {
      this.nextCallback !== null && (this.nextCallback.cancel(), (this.nextCallback = null));
    }, 'cancelNextCallback')),
    (o.safeSetState = /* @__PURE__ */ a(function (n, r) {
      (r = this.setNextCallback(r)), this.setState(n, r);
    }, 'safeSetState')),
    (o.setNextCallback = /* @__PURE__ */ a(function (n) {
      let l = !0;
      return (
        (this.nextCallback = u => {
          l && ((l = !1), (this.nextCallback = null), n(u));
        }),
        (this.nextCallback.cancel = () => {
          l = !1;
        }),
        this.nextCallback
      );
    }, 'setNextCallback')),
    (o.onTransitionEnd = /* @__PURE__ */ a(function (n, r) {
      this.setNextCallback(r);
      const l = this.props.nodeRef ? this.props.nodeRef.current : fo.findDOMNode(this);
      const u = n == null && !this.props.addEndListener;
      if (!l || u) {
        setTimeout(this.nextCallback, 0);
        return;
      }
      if (this.props.addEndListener) {
        const c = this.props.nodeRef ? [this.nextCallback] : [l, this.nextCallback];
        const p = c[0];
        const d = c[1];
        this.props.addEndListener(p, d);
      }
      n != null && setTimeout(this.nextCallback, n);
    }, 'onTransitionEnd')),
    (o.render = /* @__PURE__ */ a(function () {
      const n = this.state.status;
      if (n === ho) return null;
      const r = this.props;
      const l = r.children;
      const u = r.in;
      const c = r.mountOnEnter;
      const p = r.unmountOnExit;
      const d = r.appear;
      const g = r.enter;
      const h = r.exit;
      const y = r.timeout;
      const f = r.addEndListener;
      const b = r.onEnter;
      const I = r.onEntering;
      const _ = r.onEntered;
      const m = r.onExit;
      const v = r.onExiting;
      const S = r.onExited;
      const E = r.nodeRef;
      const T = ke(r, [
        'children',
        'in',
        'mountOnEnter',
        'unmountOnExit',
        'appear',
        'enter',
        'exit',
        'timeout',
        'addEndListener',
        'onEnter',
        'onEntering',
        '\
onEntered',
        'onExit',
        'onExiting',
        'onExited',
        'nodeRef',
      ]);
      return (
        // allows for nested Transitions
        /* @__PURE__ */ s.createElement(
          Mn.Provider,
          {
            value: null,
          },
          typeof l === 'function' ? l(n, T) : s.cloneElement(s.Children.only(l), T),
        )
      );
    }, 'render')),
    t
  );
})(s.Component);
ut.contextType = Mn;
ut.propTypes = {};
function Zt() {}
a(Zt, 'noop');
ut.defaultProps = {
  in: !1,
  mountOnEnter: !1,
  unmountOnExit: !1,
  appear: !1,
  enter: !0,
  exit: !0,
  onEnter: Zt,
  onEntering: Zt,
  onEntered: Zt,
  onExit: Zt,
  onExiting: Zt,
  onExited: Zt,
};
ut.UNMOUNTED = ho;
ut.EXITED = wt;
ut.ENTERING = Tt;
ut.ENTERED = Jt;
ut.EXITING = Ln;
const Ct = ut;

// src/manager/components/upgrade/UpgradeBlock.tsx
const sr = /* @__PURE__ */ a(({ onNavigateToWhatsNew: e }) => {
  const t = oe();
  const [o, i] = $('npm');
  return /* @__PURE__ */ s.createElement(
    Gf,
    null,
    /* @__PURE__ */ s.createElement(
      'strong',
      null,
      'You are on Storybook ',
      t.getCurrentVersion().version,
    ),
    /* @__PURE__ */ s.createElement(
      'p',
      null,
      'Run the following script to check for updates and upgrade to the latest version.',
    ),
    /* @__PURE__ */ s.createElement(
      Yf,
      null,
      /* @__PURE__ */ s.createElement(Nn, { active: o === 'npm', onClick: () => i('npm') }, 'npm'),
      /* @__PURE__ */ s.createElement(
        Nn,
        { active: o === 'yarn', onClick: () => i('yarn') },
        'yarn',
      ),
      /* @__PURE__ */ s.createElement(
        Nn,
        { active: o === 'pnpm', onClick: () => i('pnpm') },
        'pnpm',
      ),
    ),
    /* @__PURE__ */ s.createElement(
      qf,
      null,
      o === 'npm'
        ? 'npx storybook@latest upgrade'
        : `${o} dlx storybook@latest u\
pgrade`,
    ),
    e && // eslint-disable-next-line jsx-a11y/anchor-is-valid
      /* @__PURE__ */ s.createElement(Me, { onClick: e }, "See what's new in Storybook"),
  );
}, 'UpgradeBlock');
const Gf = x.div(({ theme: e }) => ({
  border: '1px solid',
  borderRadius: 5,
  padding: 20,
  marginTop: 0,
  borderColor: e.appBorderColor,
  fontSize: e.typography.size.s2,
  width: '100%',
  [Qe]: {
    maxWidth: 400,
  },
}));
const Yf = x.div({
  display: 'flex',
  gap: 2,
});
const qf = x.pre(({ theme: e }) => ({
  background: e.base === 'light' ? 'rgba(0, 0, 0, 0.05)' : e.appBorderColor,
  fontSize: e.typography.size.s2 - 1,
  margin: '4px 0 16px',
}));
const Nn = x.button(({ theme: e, active: t }) => ({
  all: 'unset',
  alignItems: 'center',
  gap: 10,
  color: e.color.defaultText,
  fontSize: e.typography.size.s2 - 1,
  borderBottom: '2px solid transparent',
  borderBottomColor: t ? e.color.secondary : 'none',
  padding: '0 10px 5px',
  marginBottom: '5px',
  cursor: 'pointer',
}));

// src/manager/components/mobile/about/MobileAbout.tsx
const ul = /* @__PURE__ */ a(() => {
  const { isMobileAboutOpen: e, setMobileAboutOpen: t } = ge();
  const o = Y(null);
  return /* @__PURE__ */ s.createElement(
    Ct,
    {
      nodeRef: o,
      in: e,
      timeout: 300,
      appear: !0,
      mountOnEnter: !0,
      unmountOnExit: !0,
    },
    i =>
      /* @__PURE__ */ s.createElement(
        Qf,
        { ref: o, state: i, transitionDuration: 300 },
        /* @__PURE__ */ s.createElement(
          Jf,
          { onClick: () => t(!1), title: 'Close about section' },
          /* @__PURE__ */ s.createElement(ms, null),
          'Back',
        ),
        /* @__PURE__ */ s.createElement(
          Xf,
          null,
          /* @__PURE__ */ s.createElement(
            al,
            { href: 'https://github.com/storybookjs/storybook', target: '_blank' },
            /* @__PURE__ */ s.createElement(
              ll,
              null,
              /* @__PURE__ */ s.createElement(Do, null),
              /* @__PURE__ */ s.createElement('span', null, 'Github'),
            ),
            /* @__PURE__ */ s.createElement(at, { width: 12 }),
          ),
          /* @__PURE__ */ s.createElement(
            al,
            {
              href: 'https://storybook.js.org/docs/react/get-started/install/',
              target: '_blank',
            },
            /* @__PURE__ */ s.createElement(
              ll,
              null,
              /* @__PURE__ */ s.createElement(Bs, null),
              /* @__PURE__ */ s.createElement(
                'span',
                null,
                'Do\
cumentation',
              ),
            ),
            /* @__PURE__ */ s.createElement(at, { width: 12 }),
          ),
        ),
        /* @__PURE__ */ s.createElement(sr, null),
        /* @__PURE__ */ s.createElement(
          Zf,
          null,
          'Open source software maintained by',
          ' ',
          /* @__PURE__ */ s.createElement(
            Me,
            { href: 'https://chromatic.com', target: '_blank' },
            'Chromatic',
          ),
          ' ',
          'and the',
          ' ',
          /* @__PURE__ */ s.createElement(
            Me,
            { href: 'https://github.com/storybookjs/storybook/graphs/contributors' },
            'Storybook Community',
          ),
        ),
      ),
  );
}, 'MobileAbout');
const Qf = x.div(({ theme: e, state: t, transitionDuration: o }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: 11,
  transition: `all ${o}ms ease-in-out`,
  overflow: 'scroll',
  padding: '25px 10px 10px',
  color: e.color.defaultText,
  background: e.background.content,
  opacity: `${(() => {
    switch (t) {
      case 'entering':
      case 'entered':
        return 1;
      case 'exiting':
      case 'exited':
        return 0;
      default:
        return 0;
    }
  })()}`,
  transform: `${(() => {
    switch (t) {
      case 'entering':
      case 'entered':
        return 'translateX(0)';
      case 'exiting':
      case 'exited':
        return 'translateX(20px)';
      default:
        return 'translateX(0)';
    }
  })()}`,
}));
const Xf = x.div({
  marginTop: 20,
  marginBottom: 20,
});
const al = x.a(({ theme: e }) => ({
  all: 'unset',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: e.typography.size.s2 - 1,
  height: 52,
  borderBottom: `1px solid ${e.appBorderColor}`,
  cursor: 'pointer',
  padding: '0 10px',
  '&:last-child': {
    borderBottom: 'none',
  },
}));
const ll = x.div(({ theme: e }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: e.typography.size.s2 - 1,
  height: 40,
  gap: 5,
}));
const Zf = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2 - 1,
  marginTop: 30,
}));
const Jf = x.button(({ theme: e }) => ({
  all: 'unset',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  color: 'currentColor',
  fontSize: e.typography.size.s2 - 1,
  padding: '0 10px',
}));

// src/manager/components/mobile/navigation/MobileMenuDrawer.tsx
const cl = /* @__PURE__ */ a(({ children: e }) => {
  const t = Y(null);
  const o = Y(null);
  const i = Y(null);
  const {
    isMobileMenuOpen: n,
    setMobileMenuOpen: r,
    isMobileAboutOpen: l,
    setMobileAboutOpen: u,
  } = ge();
  return /* @__PURE__ */ s.createElement(
    s.Fragment,
    null,
    /* @__PURE__ */ s.createElement(
      Ct,
      {
        nodeRef: t,
        in: n,
        timeout: 300,
        mountOnEnter: !0,
        unmountOnExit: !0,
        onExited: () => u(!1),
      },
      c =>
        /* @__PURE__ */ s.createElement(
          em,
          { ref: t, state: c },
          /* @__PURE__ */ s.createElement(
            Ct,
            {
              nodeRef: o,
              in: !l,
              timeout: 300,
            },
            p => /* @__PURE__ */ s.createElement(tm, { ref: o, state: p }, e),
          ),
          /* @__PURE__ */ s.createElement(ul, null),
        ),
    ),
    /* @__PURE__ */ s.createElement(
      Ct,
      {
        nodeRef: i,
        in: n,
        timeout: 300,
        mountOnEnter: !0,
        unmountOnExit: !0,
      },
      c =>
        /* @__PURE__ */ s.createElement(om, {
          ref: i,
          state: c,
          onClick: () => r(!1),
          'aria-label': 'Close navigation menu',
        }),
    ),
  );
}, 'MobileMenuDrawer');
const em = x.div(({ theme: e, state: t }) => ({
  position: 'fixed',
  boxSizing: 'border-box',
  width: '100%',
  background: e.background.content,
  height: '80%',
  bottom: 0,
  left: 0,
  zIndex: 11,
  borderRadius: '10px 10px 0 0',
  transition: `all ${300}ms ease-in-out`,
  overflow: 'hidden',
  transform: `${
    t === 'entering' || t === 'entered'
      ? 'translateY(0)'
      : t === 'exiting' || t === 'exited'
        ? 'translateY(100%)'
        : 'translateY\
(0)'
  }`,
}));
const tm = x.div(({ theme: e, state: t }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: 1,
  transition: `all ${300}ms ease-in-out`,
  overflow: 'hidden',
  opacity: `${t === 'entered' || t === 'entering' ? 1 : t === 'exiting' || t === 'exited' ? 0 : 1}`,
  transform: `${(() => {
    switch (t) {
      case 'entering':
      case 'entered':
        return 'translateX(0)';
      case 'exiting':
      case 'exited':
        return 'translateX(-20px)';
      default:
        return 'translateX(0)';
    }
  })()}`,
}));
const om = x.div(({ state: e }) => ({
  position: 'fixed',
  boxSizing: 'border-box',
  background: 'rgba(0, 0, 0, 0.5)',
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  zIndex: 10,
  transition: `all ${300}ms ease-in-out`,
  cursor: 'pointer',
  opacity: `${(() => {
    switch (e) {
      case 'entering':
      case 'entered':
        return 1;
      case 'exiting':
      case 'exited':
        return 0;
      default:
        return 0;
    }
  })()}`,
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.6)',
  },
}));

// src/manager/components/mobile/navigation/MobileNavigation.tsx
function rm(e, t) {
  const o = { ...(e || {}) };
  return (
    Object.values(t).forEach(i => {
      i.index && Object.assign(o, i.index);
    }),
    o
  );
}
a(rm, 'combineIndexes');
const nm = /* @__PURE__ */ a(() => {
  const { index: e, refs: t } = Pe();
  const o = oe();
  const i = o.getCurrentStoryData();
  if (!i) return '';
  const n = rm(e, t || {});
  let r = i.renderLabel?.(i, o) || i.name;
  let l = n[i.id];
  while (l && 'parent' in l && l.parent && n[l.parent] && r.length < 24)
    (l = n[l.parent]), (r = `${l.renderLabel?.(l, o) || l.name}/${r}`);
  return r;
}, 'useFullStoryName');
const pl = /* @__PURE__ */ a(({ menu: e, panel: t, showPanel: o }) => {
  const {
    isMobileMenuOpen: i,
    isMobilePanelOpen: n,
    setMobileMenuOpen: r,
    setMobilePanelOpen: l,
  } = ge();
  const u = nm();
  return /* @__PURE__ */ s.createElement(
    im,
    null,
    /* @__PURE__ */ s.createElement(cl, null, e),
    n
      ? /* @__PURE__ */ s.createElement(il, null, t)
      : /* @__PURE__ */ s.createElement(
          sm,
          { className: 'sb-bar' },
          /* @__PURE__ */ s.createElement(
            am,
            {
              onClick: () => r(!i),
              title:
                'Open\
 navigation menu',
            },
            /* @__PURE__ */ s.createElement(Lo, null),
            /* @__PURE__ */ s.createElement(lm, null, u),
          ),
          o &&
            /* @__PURE__ */ s.createElement(
              te,
              { onClick: () => l(!0), title: 'Open addon panel' },
              /* @__PURE__ */ s.createElement(hs, null),
            ),
        ),
  );
}, 'MobileNavigation');
const im = x.div(({ theme: e }) => ({
  bottom: 0,
  left: 0,
  width: '100%',
  zIndex: 10,
  background: e.barBg,
  borderTop: `1px solid ${e.appBorderColor}`,
}));
const sm = x.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: 40,
  padding: '0 6px',
});
const am = x.button(({ theme: e }) => ({
  all: 'unset',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  color: e.barTextColor,
  fontSize: `${e.typography.size.s2 - 1}px`,
  padding: '0 7px',
  fontWeight: e.typography.weight.bold,
  WebkitLineClamp: 1,
  '> svg': {
    width: 14,
    height: 14,
    flexShrink: 0,
  },
}));
const lm = x.p({
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

// src/manager/components/layout/useDragging.ts
const dl = 30;
const ar = 240;
const lr = 270;
const fl = 0.9;
function ml(e, t, o) {
  return Math.min(Math.max(e, t), o);
}
a(ml, 'clamp');
function hl(e, t, o) {
  return t + (o - t) * e;
}
a(hl, 'interpolate');
function gl({ setState: e, isPanelShown: t, isDesktop: o }) {
  const i = Y(null);
  const n = Y(null);
  return (
    j(() => {
      const r = i.current;
      const l = n.current;
      const u = document.querySelector('#storybook-preview-wrapper');
      let c = null;
      const p = /* @__PURE__ */ a(h => {
        h.preventDefault(),
          e(y => ({
            ...y,
            isDragging: !0,
          })),
          h.currentTarget === r ? (c = r) : h.currentTarget === l && (c = l),
          window.addEventListener('mousemove', g),
          window.addEventListener('mouseup', d),
          u && (u.style.pointerEvents = 'none');
      }, 'onDragStart');
      const d = /* @__PURE__ */ a(h => {
        e(y =>
          c === l && y.navSize < ar && y.navSize > 0
            ? {
                ...y,
                isDragging: !1,
                navSize: ar,
              }
            : c === r &&
                y.panelPosition === 'right' &&
                y.rightPanelWidth < lr &&
                y.rightPanelWidth > 0
              ? {
                  ...y,
                  isDragging: !1,
                  rightPanelWidth: lr,
                }
              : {
                  ...y,
                  isDragging: !1,
                },
        ),
          window.removeEventListener('mousemove', g),
          window.removeEventListener('mouseup', d),
          u?.removeAttribute('style'),
          (c = null);
      }, 'onDragEnd');
      const g = /* @__PURE__ */ a(h => {
        if (h.buttons === 0) {
          d(h);
          return;
        }
        e(y => {
          if (c === l) {
            const f = h.clientX;
            return f === y.navSize
              ? y
              : f <= dl
                ? {
                    ...y,
                    navSize: 0,
                  }
                : f <= ar
                  ? {
                      ...y,
                      navSize: hl(fl, f, ar),
                    }
                  : {
                      ...y,
                      // @ts-expect-error (non strict)
                      navSize: ml(f, 0, h.view.innerWidth),
                    };
          }
          if (c === r) {
            const f = y.panelPosition === 'bottom' ? 'bottomPanelHeight' : 'rightPanelWidth';
            const b =
              y.panelPosition === 'bottom'
                ? // @ts-expect-error (non strict)
                  h.view.innerHeight - h.clientY
                : // @ts-expect-error (non strict)
                  h.view.innerWidth - h.clientX;
            if (b === y[f]) return y;
            if (b <= dl)
              return {
                ...y,
                [f]: 0,
              };
            if (y.panelPosition === 'right' && b <= lr)
              return {
                ...y,
                [f]: hl(fl, b, lr),
              };
            const I =
              // @ts-expect-error (non strict)
              y.panelPosition === 'bottom' ? h.view.innerHeight : h.view.innerWidth;
            return {
              ...y,
              [f]: ml(b, 0, I),
            };
          }
          return y;
        });
      }, 'onDrag');
      return (
        r?.addEventListener('mousedown', p),
        l?.addEventListener('mousedown', p),
        () => {
          r?.removeEventListener('mousedown', p),
            l?.removeEventListener('mousedown', p),
            u?.removeAttribute('style');
        }
      );
    }, [
      // we need to rerun this effect when the panel is shown/hidden or when changing between mobile/desktop to re-attach the event listeners
      t,
      o,
      e,
    ]),
    { panelResizerRef: i, sidebarResizerRef: n }
  );
}
a(gl, 'useDragging');

// src/manager/components/layout/Layout.tsx
const um = 100;
const yl = /* @__PURE__ */ a(
  (e, t) =>
    e.navSize === t.navSize &&
    e.bottomPanelHeight === t.bottomPanelHeight &&
    e.rightPanelWidth === t.rightPanelWidth &&
    e.panelPosition === t.panelPosition,
  'layoutStateIsEqual',
);
const cm = /* @__PURE__ */ a(
  ({ managerLayoutState: e, setManagerLayoutState: t, isDesktop: o, hasTab: i }) => {
    const n = s.useRef(e);
    const [r, l] = $({
      ...e,
      isDragging: !1,
    });
    j(() => {
      r.isDragging || // don't interrupt user's drag
        yl(e, n.current) ||
        ((n.current = e), l(f => ({ ...f, ...e })));
    }, [r.isDragging, e, l]),
      ft(() => {
        if (
          r.isDragging || // wait with syncing managerLayoutState until user is done dragging
          yl(e, r)
        )
          return;
        const f = {
          navSize: r.navSize,
          bottomPanelHeight: r.bottomPanelHeight,
          rightPanelWidth: r.rightPanelWidth,
        };
        (n.current = {
          ...n.current,
          ...f,
        }),
          t(f);
      }, [r, t]);
    const u = e.viewMode !== 'story' && e.viewMode !== 'docs';
    const c = e.viewMode === 'story' && !i;
    const { panelResizerRef: p, sidebarResizerRef: d } = gl({
      setState: l,
      isPanelShown: c,
      isDesktop: o,
    });
    const { navSize: g, rightPanelWidth: h, bottomPanelHeight: y } = r.isDragging ? r : e;
    return {
      navSize: g,
      rightPanelWidth: h,
      bottomPanelHeight: y,
      panelPosition: e.panelPosition,
      panelResizerRef: p,
      sidebarResizerRef: d,
      showPages: u,
      showPanel: c,
      isDragging: r.isDragging,
    };
  },
  'useLayoutSyncingState',
);
const vl = /* @__PURE__ */ a(
  ({ managerLayoutState: e, setManagerLayoutState: t, hasTab: o, ...i }) => {
    const { isDesktop: n, isMobile: r } = ge();
    const {
      navSize: l,
      rightPanelWidth: u,
      bottomPanelHeight: c,
      panelPosition: p,
      panelResizerRef: d,
      sidebarResizerRef: g,
      showPages: h,
      showPanel: y,
      isDragging: f,
    } = cm({ managerLayoutState: e, setManagerLayoutState: t, isDesktop: n, hasTab: o });
    return /* @__PURE__ */ s.createElement(
      pm,
      {
        navSize: l,
        rightPanelWidth: u,
        bottomPanelHeight: c,
        panelPosition: e.panelPosition,
        isDragging: f,
        viewMode: e.viewMode,
        showPanel: y,
      },
      h && /* @__PURE__ */ s.createElement(mm, null, i.slotPages),
      /* @__PURE__ */ s.createElement(
        ca,
        { path: /(^\/story|docs|onboarding\/|^\/$)/, startsWith: !1 },
        ({ match: b }) => /* @__PURE__ */ s.createElement(fm, { shown: !!b }, i.slotMain),
      ),
      n &&
        /* @__PURE__ */ s.createElement(
          s.Fragment,
          null,
          /* @__PURE__ */ s.createElement(
            dm,
            null,
            /* @__PURE__ */ s.createElement(bl, { ref: g }),
            i.slotSidebar,
          ),
          y &&
            /* @__PURE__ */ s.createElement(
              hm,
              { position: p },
              /* @__PURE__ */ s.createElement(bl, {
                orientation: p === 'bottom' ? 'horizontal' : 'vertical',
                position: p === 'bottom' ? 'left' : 'right',
                ref: d,
              }),
              i.slotPanel,
            ),
        ),
      r &&
        /* @__PURE__ */ s.createElement(
          s.Fragment,
          null,
          /* @__PURE__ */ s.createElement(nl, null),
          /* @__PURE__ */ s.createElement(pl, {
            menu: i.slotSidebar,
            panel: i.slotPanel,
            showPanel: y,
          }),
        ),
    );
  },
  'Layout',
);
const pm = x.div(
  ({
    navSize: e,
    rightPanelWidth: t,
    bottomPanelHeight: o,
    viewMode: i,
    panelPosition: n,
    showPanel: r,
  }) => ({
    width: '100%',
    height: ['100vh', '100dvh'],
    // This array is a special Emotion syntax to set a fallback if 100dvh is not supported
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    [Qe]: {
      display: 'grid',
      gap: 0,
      gridTemplateColumns: `minmax(0, ${e}px) minmax(${um}px, 1fr) minmax(0, ${t}px)`,
      gridTemplateRows: `1fr minmax(0, ${o}px)`,
      gridTemplateAreas:
        i === 'docs' || !r
          ? `"sidebar content content"
                  "sidebar content content"`
          : n === 'right'
            ? `"sidebar content panel"
                  "sidebar content panel"`
            : `"sidebar content content"
                "sidebar panel   panel"`,
    },
  }),
);
const dm = x.div(({ theme: e }) => ({
  backgroundColor: e.background.app,
  gridArea: 'sidebar',
  position: 'relative',
  borderRight: `1px solid ${e.color.border}`,
}));
const fm = x.div(({ theme: e, shown: t }) => ({
  flex: 1,
  position: 'relative',
  backgroundColor: e.background.content,
  display: t ? 'grid' : 'none',
  // This is needed to make the content container fill the available space
  overflow: 'auto',
  [Qe]: {
    flex: 'auto',
    gridArea: 'content',
  },
}));
const mm = x.div(({ theme: e }) => ({
  gridRowStart: 'sidebar-start',
  gridRowEnd: '-1',
  gridColumnStart: 'sidebar-end',
  gridColumnEnd: '-1',
  backgroundColor: e.background.content,
  zIndex: 1,
}));
const hm = x.div(({ theme: e, position: t }) => ({
  gridArea: 'panel',
  position: 'relative',
  backgroundColor: e.background.content,
  borderTop: t === 'bottom' ? `1px solid ${e.color.border}` : void 0,
  borderLeft: t === 'right' ? `1px solid ${e.color.border}` : void 0,
}));
const bl = x.div(
  ({ theme: e }) => ({
    position: 'absolute',
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
    zIndex: 100,
    '&:after': {
      content: '""',
      display: 'block',
      backgroundColor: e.color.secondary,
    },
    '&:hover': {
      opacity: 1,
    },
  }),
  ({ orientation: e = 'vertical', position: t = 'left' }) =>
    e === 'vertical'
      ? {
          width: t === 'left' ? 10 : 13,
          height: '100%',
          top: 0,
          right: t === 'left' ? '-7px' : void 0,
          left: t === 'right' ? '-7px' : void 0,
          '&:after': {
            width: 1,
            height: '100%',
            marginLeft: t === 'left' ? 3 : 6,
          },
          '&:hover': {
            cursor: 'col-resize',
          },
        }
      : {
          width: '100%',
          height: '13px',
          top: '-7px',
          left: 0,
          '&:after': {
            width: '100%',
            height: 1,
            marginTop: 6,
          },
          '&:hover': {
            cursor: 'row-resize',
          },
        },
);

// global-externals:@storybook/core/types
const lk = __STORYBOOK_TYPES__;
const { Addon_TypesEnum: Te } = __STORYBOOK_TYPES__;

// src/core-events/index.ts
const xl = /* @__PURE__ */ (B => (
  (B.CHANNEL_WS_DISCONNECT = 'channelWSDisconnect'),
  (B.CHANNEL_CREATED = 'channelCreated'),
  (B.CONFIG_ERROR =
    'c\
onfigError'),
  (B.STORY_INDEX_INVALIDATED = 'storyIndexInvalidated'),
  (B.STORY_SPECIFIED = 'storySpecified'),
  (B.SET_CONFIG = 'setConfig'),
  (B.SET_STORIES = 'setStories'),
  (B.SET_INDEX = 'setIndex'),
  (B.SET_CURRENT_STORY = 'setCurrentStory'),
  (B.CURRENT_STORY_WAS_SET = 'currentStoryWasSet'),
  (B.FORCE_RE_RENDER = 'forceReRender'),
  (B.FORCE_REMOUNT = 'forceRemount'),
  (B.PRELOAD_ENTRIES = 'preloadStories'),
  (B.STORY_PREPARED = 'storyPrepared'),
  (B.DOCS_PREPARED = 'docsPrepared'),
  (B.STORY_CHANGED = 'storyChanged'),
  (B.STORY_UNCHANGED = 'storyUnchanged'),
  (B.STORY_RENDERED = 'storyRendered'),
  (B.STORY_FINISHED = 'storyFinished'),
  (B.STORY_MISSING = 'storyMissing'),
  (B.STORY_ERRORED = 'storyErrored'),
  (B.STORY_THREW_EXCEPTION = 'storyThrewException'),
  (B.STORY_RENDER_PHASE_CHANGED = 'storyRenderPhaseChanged'),
  (B.PLAY_FUNCTION_THREW_EXCEPTION = 'playFunctionThrewException'),
  (B.UNHANDLED_ERRORS_WHILE_PLAYING =
    'unhandledErro\
rsWhilePlaying'),
  (B.UPDATE_STORY_ARGS = 'updateStoryArgs'),
  (B.STORY_ARGS_UPDATED = 'storyArgsUpdated'),
  (B.RESET_STORY_ARGS = 'resetStoryArgs'),
  (B.SET_FILTER = 'setFilter'),
  (B.SET_GLOBALS = 'setGlobals'),
  (B.UPDATE_GLOBALS = 'updateGlobals'),
  (B.GLOBALS_UPDATED = 'globalsUpdated'),
  (B.REGISTER_SUBSCRIPTION = 'registerSubscription'),
  (B.PREVIEW_KEYDOWN = 'previewKeydown'),
  (B.PREVIEW_BUILDER_PROGRESS = 'preview_builder_progress'),
  (B.SELECT_STORY =
    'sel\
ectStory'),
  (B.STORIES_COLLAPSE_ALL = 'storiesCollapseAll'),
  (B.STORIES_EXPAND_ALL = 'storiesExpandAll'),
  (B.DOCS_RENDERED = 'docsRendered'),
  (B.SHARED_STATE_CHANGED = 'sharedStateChanged'),
  (B.SHARED_STATE_SET = 'sharedStateSet'),
  (B.NAVIGATE_URL = 'navigateUrl'),
  (B.UPDATE_QUERY_PARAMS = 'updateQueryParams'),
  (B.REQUEST_WHATS_NEW_DATA = 'requestWhatsNewData'),
  (B.RESULT_WHATS_NEW_DATA = 'resultWhatsNewData'),
  (B.SET_WHATS_NEW_CACHE = 'setWhatsNewCache'),
  (B.TOGGLE_WHATS_NEW_NOTIFICATIONS = 'toggleWhatsNewNotifications'),
  (B.TELEMETRY_ERROR = 'telemetryError'),
  (B.FILE_COMPONENT_SEARCH_REQUEST =
    'fil\
eComponentSearchRequest'),
  (B.FILE_COMPONENT_SEARCH_RESPONSE = 'fileComponentSearchResponse'),
  (B.SAVE_STORY_REQUEST = 'saveStoryRequest'),
  (B.SAVE_STORY_RESPONSE = 'saveStoryResponse'),
  (B.ARGTYPES_INFO_REQUEST = 'argtypesInfoRequest'),
  (B.ARGTYPES_INFO_RESPONSE = 'argtypesInfoResponse'),
  (B.CREATE_NEW_STORYFILE_REQUEST = 'createNewStoryfileRequest'),
  (B.CREATE_NEW_STORYFILE_RESPONSE = 'createNewStoryfileResponse'),
  (B.TESTING_MODULE_CRASH_REPORT =
    'testingModuleC\
rashReport'),
  (B.TESTING_MODULE_PROGRESS_REPORT = 'testingModuleProgressReport'),
  (B.TESTING_MODULE_RUN_REQUEST = 'testingModuleRunRequest'),
  (B.TESTING_MODULE_RUN_ALL_REQUEST = 'testingModuleRunAllRequest'),
  (B.TESTING_MODULE_CANCEL_TEST_RUN_REQUEST = 'testingModuleCancelTestRunRequest'),
  (B.TESTING_MODULE_CANCEL_TEST_RUN_RESPONSE = 'testingModuleCancelTestRunResponse'),
  B
))(xl || {});
const {
  CHANNEL_WS_DISCONNECT: ck,
  CHANNEL_CREATED: pk,
  CONFIG_ERROR: dk,
  CREATE_NEW_STORYFILE_REQUEST: fk,
  CREATE_NEW_STORYFILE_RESPONSE: mk,
  CURRENT_STORY_WAS_SET: hk,
  DOCS_PREPARED: gk,
  DOCS_RENDERED: yk,
  FILE_COMPONENT_SEARCH_REQUEST: bk,
  FILE_COMPONENT_SEARCH_RESPONSE: vk,
  FORCE_RE_RENDER: xk,
  FORCE_REMOUNT: Sk,
  GLOBALS_UPDATED: Ik,
  NAVIGATE_URL: Ek,
  PLAY_FUNCTION_THREW_EXCEPTION: _k,
  UNHANDLED_ERRORS_WHILE_PLAYING: wk,
  PRELOAD_ENTRIES: Tk,
  PREVIEW_BUILDER_PROGRESS: Ck,
  PREVIEW_KEYDOWN: kk,
  REGISTER_SUBSCRIPTION: Ok,
  RESET_STORY_ARGS: Pk,
  SELECT_STORY: Ak,
  SET_CONFIG: Dk,
  SET_CURRENT_STORY: Mk,
  SET_FILTER: Lk,
  SET_GLOBALS: Nk,
  SET_INDEX: Rk,
  SET_STORIES: Fk,
  SHARED_STATE_CHANGED: Hk,
  SHARED_STATE_SET: Bk,
  STORIES_COLLAPSE_ALL: zk,
  STORIES_EXPAND_ALL: Wk,
  STORY_ARGS_UPDATED: jk,
  STORY_CHANGED: Vk,
  STORY_ERRORED: Kk,
  STORY_INDEX_INVALIDATED: $k,
  STORY_MISSING: Uk,
  STORY_PREPARED: Sl,
  STORY_RENDER_PHASE_CHANGED: Gk,
  STORY_RENDERED: Yk,
  STORY_FINISHED: qk,
  STORY_SPECIFIED: Qk,
  STORY_THREW_EXCEPTION: Xk,
  STORY_UNCHANGED: Zk,
  UPDATE_GLOBALS: Jk,
  UPDATE_QUERY_PARAMS: eO,
  UPDATE_STORY_ARGS: tO,
  REQUEST_WHATS_NEW_DATA: oO,
  RESULT_WHATS_NEW_DATA: rO,
  SET_WHATS_NEW_CACHE: nO,
  TOGGLE_WHATS_NEW_NOTIFICATIONS: iO,
  TELEMETRY_ERROR: sO,
  SAVE_STORY_REQUEST: aO,
  SAVE_STORY_RESPONSE: lO,
  ARGTYPES_INFO_REQUEST: uO,
  ARGTYPES_INFO_RESPONSE: cO,
  TESTING_MODULE_CRASH_REPORT: pO,
  TESTING_MODULE_PROGRESS_REPORT: dO,
  TESTING_MODULE_RUN_REQUEST: fO,
  TESTING_MODULE_RUN_ALL_REQUEST: mO,
  TESTING_MODULE_CANCEL_TEST_RUN_REQUEST: hO,
  TESTING_MODULE_CANCEL_TEST_RUN_RESPONSE: gO,
} = xl;

// src/manager/components/panel/Panel.tsx
const Hn = class Hn extends Re {
  constructor(t) {
    super(t), (this.state = { hasError: !1 });
  }
  componentDidCatch(t, o) {
    this.setState({ hasError: !0 }), console.error(t, o);
  }
  // @ts-expect-error (we know this is broken)
  render() {
    const { hasError: t } = this.state;
    const { children: o } = this.props;
    return t ? /* @__PURE__ */ s.createElement('h1', null, 'Something went wrong.') : o;
  }
};
a(Hn, 'SafeTab');
const Rn = Hn;
const Fn = s.memo(
  ({
    panels: e,
    shortcuts: t,
    actions: o,
    selectedPanel: i = null,
    panelPosition: n = 'right',
    absolute: r = !0,
  }) => {
    const { isDesktop: l, setMobilePanelOpen: u } = ge();
    return /* @__PURE__ */ s.createElement(
      Ua,
      {
        absolute: r,
        ...(i && e[i] ? { selected: i } : {}),
        menuName: 'Addons',
        actions: o,
        showToolsWhenEmpty: !0,
        emptyState: /* @__PURE__ */ s.createElement(ja, {
          title: 'Storybook add-ons',
          description: /* @__PURE__ */ s.createElement(
            s.Fragment,
            null,
            'Integrate your tools with Storybook to connect workflows and unl\
ock advanced features.',
          ),
          footer: /* @__PURE__ */ s.createElement(
            Me,
            { href: 'https://storybook.js.org/integrations', target: '_blank', withArrow: !0 },
            /* @__PURE__ */ s.createElement($t, null),
            ' Explore integrations catalog',
          ),
        }),
        tools: /* @__PURE__ */ s.createElement(
          gm,
          null,
          l
            ? /* @__PURE__ */ s.createElement(
                s.Fragment,
                null,
                /* @__PURE__ */ s.createElement(
                  te,
                  {
                    key: 'position',
                    onClick: o.togglePosition,
                    title: `Change addon orientation [${qe(t.panelPosition)}]`,
                  },
                  n === 'bottom'
                    ? /* @__PURE__ */ s.createElement(Ro, null)
                    : /* @__PURE__ */ s.createElement(Po, null),
                ),
                /* @__PURE__ */ s.createElement(
                  te,
                  {
                    key: 'visibility',
                    onClick: o.toggleVisibility,
                    title: `Hide addons [${qe(t.togglePanel)}]`,
                  },
                  /* @__PURE__ */ s.createElement(Ge, null),
                ),
              )
            : /* @__PURE__ */ s.createElement(
                te,
                { onClick: () => u(!1), title: 'Close addon panel' },
                /* @__PURE__ */ s.createElement(Ge, null),
              ),
        ),
        id: 'storybook-panel-root',
      },
      Object.entries(e).map(([c, p]) =>
        // @ts-expect-error (we know this is broken)
        /* @__PURE__ */ s.createElement(
          Rn,
          {
            key: c,
            id: c,
            title:
              typeof p.title === 'function'
                ? /* @__PURE__ */ s.createElement(p.title, null)
                : p.title,
          },
          p.render,
        ),
      ),
    );
  },
);
Fn.displayName = 'AddonPanel';
const gm = x.div({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

// src/manager/container/Panel.tsx
const ym = /* @__PURE__ */ a(e => {
  const t = oe();
  const o = Pe();
  const [i, n] = $(t.getCurrentStoryData());
  aa(
    {
      [Sl]: () => {
        n(t.getCurrentStoryData());
      },
    },
    [],
  );
  const { parameters: r, type: l } = i ?? {};
  const u = K(
    () => ({
      onSelect: /* @__PURE__ */ a(p => t.setSelectedPanel(p), 'onSelect'),
      toggleVisibility: /* @__PURE__ */ a(() => t.togglePanel(), 'toggleVisibility'),
      togglePosition: /* @__PURE__ */ a(() => t.togglePanelPosition(), 'togglePosition'),
    }),
    [t],
  );
  const c = K(() => {
    const p = t.getElements(Te.PANEL);
    if (!p || l !== 'story') return p;
    const d = {};
    return (
      Object.entries(p).forEach(([g, h]) => {
        const { paramKey: y } = h;
        (y && r && r[y] && r[y].disable) ||
          h.disabled === !0 ||
          (typeof h.disabled === 'function' && h.disabled(r)) ||
          (d[g] = h);
      }),
      d
    );
  }, [t, l, r]);
  return /* @__PURE__ */ s.createElement(Fn, {
    panels: c,
    selectedPanel: t.getSelectedPanel(),
    panelPosition: o.layout.panelPosition,
    actions: u,
    shortcuts: t.getShortcutKeys(),
    ...e,
  });
}, 'Panel');
const Il = ym;

// src/manager/container/Preview.tsx
const yo = ze(zn(), 1);

// src/manager/components/preview/Iframe.tsx
const bm = x.iframe(({ theme: e }) => ({
  backgroundColor: e.background.preview,
  display: 'block',
  boxSizing: 'content-box',
  height: '100%',
  width: '100%',
  border: '0 none',
  transition: 'background-position 0s, visibility 0s',
  backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px',
  margin: 'auto',
  boxShadow: '0 0 100px 100vw rgba(0,0,0,0.5)',
}));
function _l(e) {
  const { active: t, id: o, title: i, src: n, allowFullScreen: r, scale: l, ...u } = e;
  const c = s.useRef(null);
  return /* @__PURE__ */ s.createElement(
    Ga.IFrame,
    { scale: l, active: t, iFrameRef: c },
    /* @__PURE__ */ s.createElement(bm, {
      'data-is-storybook': t ? 'true' : 'false',
      onLoad: p => p.currentTarget.setAttribute('data-is-loaded', 'true'),
      id: o,
      title: i,
      src: n,
      allow: 'clipboard-write;',
      allowFullScreen: r,
      ref: c,
      ...u,
    }),
  );
}
a(_l, 'IFrame');

// src/manager/components/preview/utils/stringifyQueryParams.tsx
const Fl = ze(Rl(), 1);
const Hl = /* @__PURE__ */ a(e => {
  const t = (0, Fl.stringify)(e);
  return t === '' ? '' : `&${t}`;
}, 'stringifyQueryParams');

// src/manager/components/preview/FramesRenderer.tsx
const Km = /* @__PURE__ */ a(
  (e, t) => (e && t[e] ? `storybook-ref-${e}` : 'storybook-preview-iframe'),
  'getActive',
);
const $m = x(me)(({ theme: e }) => ({
  display: 'none',
  '@media (min-width: 600px)': {
    position: 'absolute',
    display: 'block',
    top: 10,
    right: 15,
    padding: '10px 15px',
    fontSize: e.typography.size.s1,
    transform: 'translateY(-100px)',
    '&:focus': {
      transform: 'translateY(0)',
      zIndex: 1,
    },
  },
}));
const Um = /* @__PURE__ */ a(
  ({ api: e, state: t }) => ({
    isFullscreen: e.getIsFullscreen(),
    isNavShown: e.getIsNavShown(),
    selectedStoryId: t.storyId,
  }),
  'whenSidebarIsVisible',
);
const Gm = {
  '#root [data-is-storybook="false"]': {
    display: 'none',
  },
  '#root [data-is-storybook="true"]': {
    display: 'block',
  },
};
const Bl = /* @__PURE__ */ a(
  ({
    refs: e,
    scale: t,
    viewMode: o = 'story',
    refId: i,
    queryParams: n = {},
    baseUrl: r,
    storyId: l = '*',
  }) => {
    const u = e[i]?.version;
    const c = Hl({
      ...n,
      ...(u && { version: u }),
    });
    const p = Km(i, e);
    const { current: d } = Y({});
    const g = Object.values(e).filter(h => h.type === 'auto-inject' || h.id === i, {});
    return (
      d['storybook-preview-iframe'] ||
        (d['storybook-preview-iframe'] = Qt(r, l, {
          ...n,
          ...(u && { version: u }),
          viewMode: o,
        })),
      g.forEach(h => {
        const y = `storybook-ref-${h.id}`;
        const f = d[y]?.split('/iframe.html')[0];
        if (!f || h.url !== f) {
          const b = `${h.url}/iframe.html?id=${l}&viewMode=${o}&refId=${h.id}${c}`;
          d[y] = b;
        }
      }),
      /* @__PURE__ */ s.createElement(
        _e,
        null,
        /* @__PURE__ */ s.createElement(Ut, { styles: Gm }),
        /* @__PURE__ */ s.createElement(
          he,
          { filter: Um },
          ({ isFullscreen: h, isNavShown: y, selectedStoryId: f }) =>
            h || !y || !f
              ? null
              : /* @__PURE__ */ s.createElement(
                  $m,
                  { asChild: !0 },
                  /* @__PURE__ */ s.createElement(
                    'a',
                    { href: `#${f}`, tabIndex: 0, title: 'Skip to sidebar' },
                    'Skip to sidebar',
                  ),
                ),
        ),
        Object.entries(d).map(([h, y]) =>
          /* @__PURE__ */ s.createElement(
            _e,
            { key: h },
            /* @__PURE__ */ s.createElement(_l, {
              active: h === p,
              key: h,
              id: h,
              title: h,
              src: y,
              allowFullScreen: !0,
              scale: t,
            }),
          ),
        ),
      )
    );
  },
  'FramesRenderer',
);

// src/manager/components/preview/tools/addons.tsx
const Ym = /* @__PURE__ */ a(
  ({ api: e, state: t }) => ({
    isVisible: e.getIsPanelShown(),
    singleStory: t.singleStory,
    panelPosition: t.layout.panelPosition,
    toggle: /* @__PURE__ */ a(() => e.togglePanel(), 'toggle'),
  }),
  'menuMapper',
);
const zl = {
  title: 'addons',
  id: 'addons',
  type: ve.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === 'story' && !t, 'match'),
  render: /* @__PURE__ */ a(
    () =>
      /* @__PURE__ */ s.createElement(
        he,
        { filter: Ym },
        ({ isVisible: e, toggle: t, singleStory: o, panelPosition: i }) =>
          !o &&
          !e &&
          /* @__PURE__ */ s.createElement(
            s.Fragment,
            null,
            /* @__PURE__ */ s.createElement(
              te,
              { 'aria-label': 'Show addons', key: 'addons', onClick: t, title: 'Show addons' },
              i === 'bottom'
                ? /* @__PURE__ */ s.createElement(Po, null)
                : /* @__PURE__ */ s.createElement(Ro, null),
            ),
          ),
      ),
    'render',
  ),
};

// src/manager/components/preview/tools/copy.tsx
const Ul = ze($l(), 1);
const { PREVIEW_URL: Jm, document: eh } = se;
const th = /* @__PURE__ */ a(({ state: e }) => {
  const { storyId: t, refId: o, refs: i } = e;
  const { location: n } = eh;
  const r = i[o];
  let l = `${n.origin}${n.pathname}`;
  return (
    l.endsWith('/') || (l += '/'),
    {
      refId: o,
      baseUrl: r ? `${r.url}/iframe.html` : Jm || `${l}iframe.html`,
      storyId: t,
      queryParams: e.customQueryParams,
    }
  );
}, 'copyMapper');
const Gl = {
  title: 'copy',
  id: 'copy',
  type: ve.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === 'story' && !t, 'match'),
  render: /* @__PURE__ */ a(
    () =>
      /* @__PURE__ */ s.createElement(
        he,
        { filter: th },
        ({ baseUrl: e, storyId: t, queryParams: o }) =>
          t
            ? /* @__PURE__ */ s.createElement(
                te,
                {
                  key: 'copy',
                  onClick: () => (0, Ul.default)(Qt(e, t, o)),
                  title: 'Copy canvas link',
                },
                /* @__PURE__ */ s.createElement(Ps, null),
              )
            : null,
      ),
    'render',
  ),
};

// src/manager/components/preview/tools/eject.tsx
const { PREVIEW_URL: oh } = se;
const rh = /* @__PURE__ */ a(({ state: e }) => {
  const { storyId: t, refId: o, refs: i } = e;
  const n = i[o];
  return {
    refId: o,
    baseUrl: n ? `${n.url}/iframe.html` : oh || 'iframe.html',
    storyId: t,
    queryParams: e.customQueryParams,
  };
}, 'ejectMapper');
const Yl = {
  title: 'eject',
  id: 'eject',
  type: ve.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === 'story' && !t, 'match'),
  render: /* @__PURE__ */ a(
    () =>
      /* @__PURE__ */ s.createElement(
        he,
        { filter: rh },
        ({ baseUrl: e, storyId: t, queryParams: o }) =>
          t
            ? /* @__PURE__ */ s.createElement(
                te,
                { key: 'opener', asChild: !0 },
                /* @__PURE__ */ s.createElement(
                  'a',
                  {
                    href: Qt(e, t, o),
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    title: 'Open canvas in new tab',
                  },
                  /* @__PURE__ */ s.createElement(at, null),
                ),
              )
            : null,
      ),
    'render',
  ),
};

// src/manager/components/preview/tools/remount.tsx
const nh = x(te)(({ theme: e, animating: t, disabled: o }) => ({
  opacity: o ? 0.5 : 1,
  svg: {
    animation: t ? `${e.animation.rotate360} 1000ms ease-out` : void 0,
  },
}));
const ih = /* @__PURE__ */ a(({ api: e, state: t }) => {
  const { storyId: o } = t;
  return {
    storyId: o,
    remount: /* @__PURE__ */ a(() => e.emit(sn, { storyId: t.storyId }), 'remount'),
    api: e,
  };
}, 'menuMapper');
const ql = {
  title: 'remount',
  id: 'remount',
  type: ve.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === 'story' && !t, 'match'),
  render: /* @__PURE__ */ a(
    () =>
      /* @__PURE__ */ s.createElement(he, { filter: ih }, ({ remount: e, storyId: t, api: o }) => {
        const [i, n] = $(!1);
        const r = /* @__PURE__ */ a(() => {
          t && e();
        }, 'remountComponent');
        return (
          o.on(sn, () => {
            n(!0);
          }),
          /* @__PURE__ */ s.createElement(
            nh,
            {
              key: 'remount',
              title: 'Remount component',
              onClick: r,
              onAnimationEnd: () => n(!1),
              animating: i,
              disabled: !t,
            },
            /* @__PURE__ */ s.createElement(mt, null),
          )
        );
      }),
    'render',
  ),
};

// src/manager/components/preview/tools/zoom.tsx
const go = 1;
const Ql = jt({ value: go, set: /* @__PURE__ */ a(e => {}, 'set') });
const Yn = class Yn extends Re {
  constructor() {
    super(...arguments);
    this.state = {
      value: go,
    };
    this.set = /* @__PURE__ */ a(o => this.setState({ value: o }), 'set');
  }
  render() {
    const { children: o, shouldScale: i } = this.props;
    const { set: n } = this;
    const { value: r } = this.state;
    return /* @__PURE__ */ s.createElement(
      Ql.Provider,
      { value: { value: i ? r : go, set: n } },
      o,
    );
  }
};
a(Yn, 'ZoomProvider');
const fr = Yn;
const { Consumer: Gn } = Ql;
const sh = no(
  /* @__PURE__ */ a(
    ({ zoomIn: t, zoomOut: o, reset: i }) =>
      s.createElement(
        s.Fragment,
        null,
        /* @__PURE__ */ s.createElement(
          te,
          { key: 'zoomin', onClick: t, title: 'Zoom in' },
          /* @__PURE__ */ s.createElement(Vs, null),
        ),
        /* @__PURE__ */ s.createElement(
          te,
          { key: 'zoomout', onClick: o, title: 'Zoom out' },
          /* @__PURE__ */ s.createElement(Ks, null),
        ),
        /* @__PURE__ */ s.createElement(
          te,
          { key: 'zoomreset', onClick: i, title: 'Reset zoom' },
          /* @__PURE__ */ s.createElement($s, null),
        ),
      ),
    'Zoom',
  ),
);
const ah = no(
  /* @__PURE__ */ a(({ set: t, value: o }) => {
    const i = A(
      l => {
        l.preventDefault(), t(0.8 * o);
      },
      [t, o],
    );
    const n = A(
      l => {
        l.preventDefault(), t(1.25 * o);
      },
      [t, o],
    );
    const r = A(
      l => {
        l.preventDefault(), t(go);
      },
      [t, go],
    );
    return /* @__PURE__ */ s.createElement(sh, { key: 'zoom', zoomIn: i, zoomOut: n, reset: r });
  }, 'ZoomWrapper'),
);
function lh() {
  return /* @__PURE__ */ s.createElement(
    s.Fragment,
    null,
    /* @__PURE__ */ s.createElement(Gn, null, ({ set: e, value: t }) =>
      /* @__PURE__ */ s.createElement(ah, { set: e, value: t }),
    ),
    /* @__PURE__ */ s.createElement(qt, null),
  );
}
a(lh, 'ZoomToolRenderer');
const Xl = {
  title: 'zoom',
  id: 'zoom',
  type: ve.TOOL,
  match: /* @__PURE__ */ a(({ viewMode: e, tabId: t }) => e === 'story' && !t, 'match'),
  render: lh,
};

// src/manager/components/preview/Toolbar.tsx
const uh = /* @__PURE__ */ a(
  ({ api: e, state: t }) => ({
    toggle: e.toggleFullscreen,
    isFullscreen: e.getIsFullscreen(),
    shortcut: qe(e.getShortcutKeys().fullScreen),
    hasPanel: Object.keys(e.getElements(Te.PANEL)).length > 0,
    singleStory: t.singleStory,
  }),
  'fullScreenMapper',
);
const Jl = {
  title: 'fullscreen',
  id: 'fullscreen',
  type: ve.TOOL,
  // @ts-expect-error (non strict)
  match: /* @__PURE__ */ a(e => ['story', 'docs'].includes(e.viewMode), 'match'),
  render: /* @__PURE__ */ a(() => {
    const { isMobile: e } = ge();
    return e
      ? null
      : /* @__PURE__ */ s.createElement(
          he,
          { filter: uh },
          ({ toggle: t, isFullscreen: o, shortcut: i, hasPanel: n, singleStory: r }) =>
            (!r || (r && n)) &&
            /* @__PURE__ */ s.createElement(
              te,
              {
                key: 'full',
                onClick: t,
                title: `${o ? 'Exit full screen' : 'Go full screen'} [${i}]`,
                'aria-label': o ? 'Exit full screen' : 'Go full screen',
              },
              o
                ? /* @__PURE__ */ s.createElement(Ge, null)
                : /* @__PURE__ */ s.createElement(Is, null),
            ),
        );
  }, 'render'),
};
const eu = s.memo(
  /* @__PURE__ */ a(
    ({ isShown: t, tools: o, toolsExtra: i, tabs: n, tabId: r, api: l }) =>
      n || o || i
        ? /* @__PURE__ */ s.createElement(
            ph,
            {
              className: 'sb-bar',
              key: 'toolbar',
              shown: t,
              'data-test-id':
                'sb-preview-tool\
bar',
            },
            /* @__PURE__ */ s.createElement(
              dh,
              null,
              /* @__PURE__ */ s.createElement(
                tu,
                null,
                n.length > 1
                  ? /* @__PURE__ */ s.createElement(
                      _e,
                      null,
                      /* @__PURE__ */ s.createElement(
                        Zo,
                        { key: 'tabs' },
                        n.map((u, c) =>
                          /* @__PURE__ */ s.createElement(
                            Jo,
                            {
                              disabled: !!u.disabled,
                              active: u.id === r || (u.id === 'canvas' && !r),
                              onClick: () => {
                                l.applyQueryParams({ tab: u.id === 'canvas' ? void 0 : u.id });
                              },
                              key: u.id || `tab-${c}`,
                            },
                            u.title,
                          ),
                        ),
                      ),
                      /* @__PURE__ */ s.createElement(qt, null),
                    )
                  : null,
                /* @__PURE__ */ s.createElement(Zl, { key: 'left', list: o }),
              ),
              /* @__PURE__ */ s.createElement(
                fh,
                null,
                /* @__PURE__ */ s.createElement(Zl, { key: 'right', list: i }),
              ),
            ),
          )
        : null,
    'ToolbarComp',
  ),
);
const Zl = s.memo(
  /* @__PURE__ */ a(
    ({ list: t }) =>
      s.createElement(
        s.Fragment,
        null,
        t.filter(Boolean).map(({ render: o, id: i, ...n }, r) =>
          // @ts-expect-error (Converted from ts-ignore)
          /* @__PURE__ */ s.createElement(o, { key: i || n.key || `f-${r}` }),
        ),
      ),
    'Tools',
  ),
);
function ch(e, t) {
  const o = t?.type === 'story' && t?.prepared ? t?.parameters : {};
  const i = 'toolbar' in o ? o.toolbar : void 0;
  const { toolbar: n } = Ye.getConfig();
  const r = Bo(n || {}, i || {});
  return r ? !!r[e?.id]?.hidden : !1;
}
a(ch, 'toolbarItemHasBeenExcluded');
function qn(e, t, o, i, n, r) {
  const l = /* @__PURE__ */ a(
    u =>
      u &&
      (!u.match ||
        u.match({
          storyId: t?.id,
          refId: t?.refId,
          viewMode: o,
          location: i,
          path: n,
          tabId: r,
        })) &&
      !ch(u, t),
    'filter',
  );
  return e.filter(l);
}
a(qn, 'filterToolsSide');
const ph = x.div(({ theme: e, shown: t }) => ({
  position: 'relative',
  color: e.barTextColor,
  width: '100%',
  height: 40,
  flexShrink: 0,
  overflowX: 'auto',
  overflowY: 'hidden',
  marginTop: t ? 0 : -40,
  boxShadow: `${e.appBorderColor}  0 -1px 0 0 inset`,
  background: e.barBg,
  zIndex: 4,
}));
const dh = x.div({
  position: 'absolute',
  width: 'calc(100% - 20px)',
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'nowrap',
  flexShrink: 0,
  height: 40,
  marginLeft: 10,
  marginRight: 10,
});
const tu = x.div({
  display: 'flex',
  whiteSpace: 'nowrap',
  flexBasis: 'auto',
  gap: 6,
  alignItems: 'center',
});
const fh = x(tu)({
  marginLeft: 30,
});

// src/manager/components/preview/utils/components.ts
const ou = x.main({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});
const ru = x.div({
  overflow: 'auto',
  width: '100%',
  zIndex: 3,
  background: 'transparent',
  flex: 1,
});
const nu = x.div(
  {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    overflow: 'auto',
    gridTemplateColumns: '100%',
    gridTemplateRows: '100%',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  ({ show: e }) => ({ display: e ? 'grid' : 'none' }),
);
const pA = x(zo)({
  color: 'inherit',
  textDecoration: 'inherit',
  display: 'inline-block',
});
const dA = x.span({
  // Hides full screen icon at mobile breakpoint defined in app.js
  '@media (max-width: 599px)': {
    display: 'none',
  },
});
const mr = x.div(({ theme: e }) => ({
  alignContent: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  justifyItems: 'center',
  overflow: 'auto',
  display: 'grid',
  gridTemplateColumns: '100%',
  gridTemplateRows: '100%',
  position: 'relative',
  width: '100%',
  height: '100%',
}));
const iu = x.div(({ theme: e }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  background: e.background.preview,
  zIndex: 1,
}));

// src/manager/components/preview/Wrappers.tsx
const su = /* @__PURE__ */ a(
  ({ wrappers: e, id: t, storyId: o, children: i }) =>
    /* @__PURE__ */ s.createElement(
      _e,
      null,
      e.reduceRight(
        (n, r, l) =>
          /* @__PURE__ */ s.createElement(r.render, { index: l, children: n, id: t, storyId: o }),
        i,
      ),
    ),
  'ApplyWrappers',
);
const au = [
  {
    id: 'iframe-wrapper',
    type: Te.PREVIEW,
    render: /* @__PURE__ */ a(
      e => /* @__PURE__ */ s.createElement(mr, { id: 'storybook-preview-wrapper' }, e.children),
      'render',
    ),
  },
];

// src/manager/components/preview/Preview.tsx
const hh = /* @__PURE__ */ a(
  ({ state: e, api: t }) => ({
    storyId: e.storyId,
    refId: e.refId,
    viewMode: e.viewMode,
    customCanvas: t.renderPreview,
    queryParams: e.customQueryParams,
    getElements: t.getElements,
    entry: t.getData(e.storyId, e.refId),
    previewInitialized: e.previewInitialized,
    refs: e.refs,
  }),
  'canvasMapper',
);
const lu = /* @__PURE__ */ a(
  () => ({
    id: 'canvas',
    type: ve.TAB,
    title: 'Canvas',
    route: /* @__PURE__ */ a(
      ({ storyId: e, refId: t }) => (t ? `/story/${t}_${e}` : `/story/${e}`),
      'route',
    ),
    match: /* @__PURE__ */ a(({ viewMode: e }) => !!e?.match(/^(story|docs)$/), 'match'),
    render: /* @__PURE__ */ a(() => null, 'render'),
  }),
  'createCanvasTab',
);
const uu = s.memo(
  /* @__PURE__ */ a(t => {
    const {
      api: o,
      id: i,
      options: n,
      viewMode: r,
      storyId: l,
      entry: u = void 0,
      description: c,
      baseUrl: p,
      withLoader: d = !0,
      tools: g,
      toolsExtra: h,
      tabs: y,
      wrappers: f,
      tabId: b,
    } = t;
    const I = y.find(S => S.id === b)?.render;
    const _ = r === 'story';
    const { showToolbar: m } = n;
    const v = Y(l);
    return (
      j(() => {
        if (u && r) {
          if (l === v.current) return;
          if (((v.current = l), r.match(/docs|story/))) {
            const { refId: S, id: E } = u;
            o.emit(ra, {
              storyId: E,
              viewMode: r,
              options: { target: S },
            });
          }
        }
      }, [u, r, l, o]),
      /* @__PURE__ */ s.createElement(
        _e,
        null,
        i === 'main' &&
          /* @__PURE__ */ s.createElement(
            uo,
            { key: 'description' },
            /* @__PURE__ */ s.createElement('title', null, c),
          ),
        /* @__PURE__ */ s.createElement(
          fr,
          { shouldScale: _ },
          /* @__PURE__ */ s.createElement(
            ou,
            null,
            /* @__PURE__ */ s.createElement(eu, {
              key: 'tools',
              isShown: m,
              tabId: b,
              tabs: y,
              tools: g,
              toolsExtra: h,
              api: o,
            }),
            /* @__PURE__ */ s.createElement(
              ru,
              { key: 'frame' },
              I && /* @__PURE__ */ s.createElement(mr, null, I({ active: !0 })),
              /* @__PURE__ */ s.createElement(
                nu,
                { show: !b },
                /* @__PURE__ */ s.createElement(gh, { withLoader: d, baseUrl: p, wrappers: f }),
              ),
            ),
          ),
        ),
      )
    );
  }, 'Preview'),
);
const gh = /* @__PURE__ */ a(
  ({ baseUrl: e, withLoader: t, wrappers: o }) =>
    /* @__PURE__ */ s.createElement(
      he,
      { filter: hh },
      ({
        entry: i,
        refs: n,
        customCanvas: r,
        storyId: l,
        refId: u,
        viewMode: c,
        queryParams: p,
        previewInitialized: d,
      }) => {
        const g = 'canvas';
        const [h, y] = $(void 0);
        j(() => {
          if (se.CONFIG_TYPE === 'DEVELOPMENT')
            try {
              Ye.getChannel().on(ea, v => {
                y(v);
              });
            } catch {}
        }, []);
        const f = !!n[u] && !n[u].previewInitialized;
        const b = !(h?.value === 1 || h === void 0);
        const I = !u && (!d || b);
        const _ = (i && f) || I;
        return /* @__PURE__ */ s.createElement(Gn, null, ({ value: m }) =>
          /* @__PURE__ */ s.createElement(
            s.Fragment,
            null,
            t &&
              _ &&
              /* @__PURE__ */ s.createElement(
                iu,
                null,
                /* @__PURE__ */ s.createElement(qo, {
                  id: 'preview-loader',
                  role: 'progressbar',
                  progress: h,
                }),
              ),
            /* @__PURE__ */ s.createElement(
              su,
              { id: g, storyId: l, viewMode: c, wrappers: o },
              r
                ? r(l, c, g, e, m, p)
                : /* @__PURE__ */ s.createElement(Bl, {
                    baseUrl: e,
                    refs: n,
                    scale: m,
                    entry: i,
                    viewMode: c,
                    refId: u,
                    queryParams: p,
                    storyId: l,
                  }),
            ),
          ),
        );
      },
    ),
  'Canvas',
);
function cu(e, t) {
  const { previewTabs: o } = Ye.getConfig();
  const i = t ? t.previewTabs : void 0;
  if (o || i) {
    const n = Bo(o || {}, i || {});
    const r = Object.keys(n).map((l, u) => ({
      index: u,
      ...(typeof n[l] === 'string' ? { title: n[l] } : n[l]),
      id: l,
    }));
    return e
      .filter(l => {
        const u = r.find(c => c.id === l.id);
        return u === void 0 || u.id === 'canvas' || !u.hidden;
      })
      .map((l, u) => ({ ...l, index: u }))
      .sort((l, u) => {
        const c = r.find(h => h.id === l.id);
        const p = c ? c.index : r.length + l.index;
        const d = r.find(h => h.id === u.id);
        const g = d ? d.index : r.length + u.index;
        return p - g;
      })
      .map(l => {
        const u = r.find(c => c.id === l.id);
        return u
          ? {
              ...l,
              title: u.title || l.title,
              disabled: u.disabled,
              hidden: u.hidden,
            }
          : l;
      });
  }
  return e;
}
a(cu, 'filterTabs');

// src/manager/components/preview/tools/menu.tsx
const yh = /* @__PURE__ */ a(
  ({ api: e, state: t }) => ({
    isVisible: e.getIsNavShown(),
    singleStory: t.singleStory,
    toggle: /* @__PURE__ */ a(() => e.toggleNav(), 'toggle'),
  }),
  'menuMapper',
);
const pu = {
  title: 'menu',
  id: 'menu',
  type: ve.TOOL,
  // @ts-expect-error (non strict)
  match: /* @__PURE__ */ a(({ viewMode: e }) => ['story', 'docs'].includes(e), 'match'),
  render: /* @__PURE__ */ a(
    () =>
      /* @__PURE__ */ s.createElement(
        he,
        { filter: yh },
        ({ isVisible: e, toggle: t, singleStory: o }) =>
          !o &&
          !e &&
          /* @__PURE__ */ s.createElement(
            s.Fragment,
            null,
            /* @__PURE__ */ s.createElement(
              te,
              { 'aria-label': 'Show sidebar', key: 'menu', onClick: t, title: 'Show sidebar' },
              /* @__PURE__ */ s.createElement(Lo, null),
            ),
            /* @__PURE__ */ s.createElement(qt, null),
          ),
      ),
    'render',
  ),
};

// src/manager/container/Preview.tsx
const bh = [lu()];
const vh = [pu, ql, Xl];
const xh = [zl, Jl, Yl, Gl];
const Sh = [];
const Ih = (0, yo.default)(1)((e, t, o, i) => (i ? cu([...bh, ...Object.values(t)], o) : Sh));
const Eh = (0, yo.default)(1)((e, t, o) => qn([...vh, ...Object.values(t)], ...o));
const _h = (0, yo.default)(1)((e, t, o) => qn([...xh, ...Object.values(t)], ...o));
const wh = (0, yo.default)(1)((e, t) => [...au, ...Object.values(t)]);
const { PREVIEW_URL: Th } = se;
const Ch = /* @__PURE__ */ a(
  e => e.split('/').join(' / ').replace(/\s\s/, ' '),
  'splitTitleAddExtraSpace',
);
const kh = /* @__PURE__ */ a(e => {
  if (e?.type === 'story' || e?.type === 'docs') {
    const { title: t, name: o } = e;
    return t && o ? Ch(`${t} - ${o} \u22C5 Storybook`) : 'Storybook';
  }
  return e?.name ? `${e.name} \u22C5 Storybook` : 'Storybook';
}, 'getDescription');
const Oh = /* @__PURE__ */ a(
  ({
    api: e,
    state: t,
    // @ts-expect-error (non strict)
  }) => {
    const {
      layout: o,
      location: i,
      customQueryParams: n,
      storyId: r,
      refs: l,
      viewMode: u,
      path: c,
      refId: p,
    } = t;
    const d = e.getData(r, p);
    const g = Object.values(e.getElements(Te.TAB));
    const h = Object.values(e.getElements(Te.PREVIEW));
    const y = Object.values(e.getElements(Te.TOOL));
    const f = Object.values(e.getElements(Te.TOOLEXTRA));
    const b = e.getQueryParam('tab');
    const I = Eh(y.length, e.getElements(Te.TOOL), [
      d,
      u,
      i,
      c,
      // @ts-expect-error (non strict)
      b,
    ]);
    const _ = _h(
      f.length,
      e.getElements(Te.TOOLEXTRA),
      // @ts-expect-error (non strict)
      [d, u, i, c, b],
    );
    return {
      api: e,
      entry: d,
      options: o,
      description: kh(d),
      viewMode: u,
      refs: l,
      storyId: r,
      baseUrl: Th || 'iframe.html',
      queryParams: n,
      tools: I,
      toolsExtra: _,
      tabs: Ih(g.length, e.getElements(Te.TAB), d ? d.parameters : void 0, o.showTabs),
      wrappers: wh(h.length, e.getElements(Te.PREVIEW)),
      tabId: b,
    };
  },
  'mapper',
);
const Ph = s.memo(
  /* @__PURE__ */ a(
    t =>
      s.createElement(he, { filter: Oh }, o => /* @__PURE__ */ s.createElement(uu, { ...t, ...o })),
    'PreviewConnected',
  ),
);
const du = Ph;

// src/manager/hooks/useDebounce.ts
function fu(e, t) {
  const [o, i] = $(e);
  return (
    j(() => {
      const n = setTimeout(() => {
        i(e);
      }, t);
      return () => {
        clearTimeout(n);
      };
    }, [e, t]),
    o
  );
}
a(fu, 'useDebounce');

// src/manager/hooks/useMeasure.tsx
function mu() {
  const [e, t] = s.useState({
    width: null,
    height: null,
  });
  const o = s.useRef(null);
  return [
    s.useCallback(n => {
      if (
        (o.current && (o.current.disconnect(), (o.current = null)),
        n?.nodeType === Node.ELEMENT_NODE)
      ) {
        const r = new ResizeObserver(([l]) => {
          if (l?.borderBoxSize) {
            const { inlineSize: u, blockSize: c } = l.borderBoxSize[0];
            t({ width: u, height: c });
          }
        });
        r.observe(n), (o.current = r);
      }
    }, []),
    e,
  ];
}
a(mu, 'useMeasure');

// ../node_modules/@tanstack/virtual-core/dist/esm/utils.js
function At(e, t, o) {
  let i = o.initialDeps ?? [];
  let n;
  return () => {
    let r;
    let l;
    let u;
    let c;
    let p;
    o.key && (r = o.debug) != null && r.call(o) && (p = Date.now());
    const d = e();
    if (!(d.length !== i.length || d.some((y, f) => i[f] !== y))) return n;
    i = d;
    let h;
    if (
      (o.key && (l = o.debug) != null && l.call(o) && (h = Date.now()),
      (n = t(...d)),
      o.key && (u = o.debug) != null && u.call(o))
    ) {
      const y = Math.round((Date.now() - p) * 100) / 100;
      const f = Math.round((Date.now() - h) * 100) / 100;
      const b = f / 16;
      const I = /* @__PURE__ */ a((_, m) => {
        for (_ = String(_); _.length < m; ) _ = ` ${_}`;
        return _;
      }, 'pad');
      console.info(
        `%c\u23F1 ${I(f, 5)} /${I(y, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(0, Math.min(120 - 120 * b, 120))}deg 100% 31%);`,
        o?.key,
      );
    }
    return (c = o?.onChange) == null || c.call(o, n), n;
  };
}
a(At, 'memo');
function hr(e, t) {
  if (e === void 0) throw new Error(`Unexpected undefined${t ? `: ${t}` : ''}`);
  return e;
}
a(hr, 'notUndefined');
const hu = /* @__PURE__ */ a((e, t) => Math.abs(e - t) < 1, 'approxEqual');

// ../node_modules/@tanstack/virtual-core/dist/esm/index.js
const Ah = /* @__PURE__ */ a(e => e, 'defaultKeyExtractor');
const Dh = /* @__PURE__ */ a(e => {
  const t = Math.max(e.startIndex - e.overscan, 0);
  const o = Math.min(e.endIndex + e.overscan, e.count - 1);
  const i = [];
  for (let n = t; n <= o; n++) i.push(n);
  return i;
}, 'defaultRangeExtractor');
const gu = /* @__PURE__ */ a((e, t) => {
  const o = e.scrollElement;
  if (!o) return;
  const i = /* @__PURE__ */ a(r => {
    const { width: l, height: u } = r;
    t({ width: Math.round(l), height: Math.round(u) });
  }, 'handler');
  if ((i(o.getBoundingClientRect()), typeof ResizeObserver > 'u')) return () => {};
  const n = new ResizeObserver(r => {
    const l = r[0];
    if (l?.borderBoxSize) {
      const u = l.borderBoxSize[0];
      if (u) {
        i({ width: u.inlineSize, height: u.blockSize });
        return;
      }
    }
    i(o.getBoundingClientRect());
  });
  return (
    n.observe(o, { box: 'border-box' }),
    () => {
      n.unobserve(o);
    }
  );
}, 'observeElementRect');
const yu = /* @__PURE__ */ a((e, t) => {
  const o = e.scrollElement;
  if (!o) return;
  const i = /* @__PURE__ */ a(() => {
    t(o[e.options.horizontal ? 'scrollLeft' : 'scrollTop']);
  }, 'handler');
  return (
    i(),
    o.addEventListener('scroll', i, {
      passive: !0,
    }),
    () => {
      o.removeEventListener('scroll', i);
    }
  );
}, 'observeElementOffset');
const Mh = /* @__PURE__ */ a((e, t, o) => {
  if (t?.borderBoxSize) {
    const i = t.borderBoxSize[0];
    if (i) return Math.round(i[o.options.horizontal ? 'inlineSize' : 'blockSize']);
  }
  return Math.round(e.getBoundingClientRect()[o.options.horizontal ? 'width' : 'height']);
}, 'measureElement');
const bu = /* @__PURE__ */ a((e, { adjustments: t = 0, behavior: o }, i) => {
  let n;
  let r;
  const l = e + t;
  (r = (n = i.scrollElement) == null ? void 0 : n.scrollTo) == null ||
    r.call(n, {
      [i.options.horizontal ? 'left' : 'top']: l,
      behavior: o,
    });
}, 'elementScroll');
const Qn = class Qn {
  constructor(t) {
    (this.unsubs = []),
      (this.scrollElement = null),
      (this.isScrolling = !1),
      (this.isScrollingTimeoutId = null),
      (this.scrollToIndexTimeoutId = null),
      (this.measurementsCache = []),
      (this.itemSizeCache = /* @__PURE__ */ new Map()),
      (this.pendingMeasuredCacheIndexes = []),
      (this.scrollDirection = null),
      (this.scrollAdjustments = 0),
      (this.measureElementCache = /* @__PURE__ */ new Map()),
      (this.observer = /* @__PURE__ */ (() => {
        let o = null;
        const i = /* @__PURE__ */ a(
          () =>
            o ||
            (typeof ResizeObserver < 'u'
              ? (o = new ResizeObserver(n => {
                  n.forEach(r => {
                    this._measureElement(r.target, r);
                  });
                }))
              : null),
          'get',
        );
        return {
          disconnect: /* @__PURE__ */ a(() => {
            let n;
            return (n = i()) == null ? void 0 : n.disconnect();
          }, 'disconnect'),
          observe: /* @__PURE__ */ a(n => {
            let r;
            return (r = i()) == null ? void 0 : r.observe(n, { box: 'border-box' });
          }, 'observe'),
          unobserve: /* @__PURE__ */ a(n => {
            let r;
            return (r = i()) == null ? void 0 : r.unobserve(n);
          }, 'unobserve'),
        };
      })()),
      (this.range = null),
      (this.setOptions = o => {
        Object.entries(o).forEach(([i, n]) => {
          typeof n > 'u' && delete o[i];
        }),
          (this.options = {
            debug: !1,
            initialOffset: 0,
            overscan: 1,
            paddingStart: 0,
            paddingEnd: 0,
            scrollPaddingStart: 0,
            scrollPaddingEnd: 0,
            horizontal: !1,
            getItemKey: Ah,
            rangeExtractor: Dh,
            onChange: /* @__PURE__ */ a(() => {}, 'onChange'),
            measureElement: Mh,
            initialRect: { width: 0, height: 0 },
            scrollMargin: 0,
            gap: 0,
            scrollingDelay: 150,
            indexAttribute: 'data-index',
            initialMeasurementsCache: [],
            lanes: 1,
            ...o,
          });
      }),
      (this.notify = o => {
        let i;
        let n;
        (n = (i = this.options).onChange) == null || n.call(i, this, o);
      }),
      (this.maybeNotify = At(
        () => (
          this.calculateRange(),
          [
            this.isScrolling,
            this.range ? this.range.startIndex : null,
            this.range ? this.range.endIndex : null,
          ]
        ),
        o => {
          this.notify(o);
        },
        {
          key: !1,
          debug: /* @__PURE__ */ a(() => this.options.debug, 'debug'),
          initialDeps: [
            this.isScrolling,
            this.range ? this.range.startIndex : null,
            this.range ? this.range.endIndex : null,
          ],
        },
      )),
      (this.cleanup = () => {
        this.unsubs.filter(Boolean).forEach(o => o()),
          (this.unsubs = []),
          (this.scrollElement = null);
      }),
      (this._didMount = () => (
        this.measureElementCache.forEach(this.observer.observe),
        () => {
          this.observer.disconnect(), this.cleanup();
        }
      )),
      (this._willUpdate = () => {
        const o = this.options.getScrollElement();
        this.scrollElement !== o &&
          (this.cleanup(),
          (this.scrollElement = o),
          this._scrollToOffset(this.scrollOffset, {
            adjustments: void 0,
            behavior: void 0,
          }),
          this.unsubs.push(
            this.options.observeElementRect(this, i => {
              (this.scrollRect = i), this.maybeNotify();
            }),
          ),
          this.unsubs.push(
            this.options.observeElementOffset(this, i => {
              (this.scrollAdjustments = 0),
                this.scrollOffset !== i &&
                  (this.isScrollingTimeoutId !== null &&
                    (clearTimeout(this.isScrollingTimeoutId), (this.isScrollingTimeoutId = null)),
                  (this.isScrolling = !0),
                  (this.scrollDirection = this.scrollOffset < i ? 'forward' : 'backward'),
                  (this.scrollOffset = i),
                  this.maybeNotify(),
                  (this.isScrollingTimeoutId = setTimeout(() => {
                    (this.isScrollingTimeoutId = null),
                      (this.isScrolling = !1),
                      (this.scrollDirection = null),
                      this.maybeNotify();
                  }, this.options.scrollingDelay)));
            }),
          ));
      }),
      (this.getSize = () => this.scrollRect[this.options.horizontal ? 'width' : 'height']),
      (this.memoOptions = At(
        () => [
          this.options.count,
          this.options.paddingStart,
          this.options.scrollMargin,
          this.options.getItemKey,
        ],
        (o, i, n, r) => (
          (this.pendingMeasuredCacheIndexes = []),
          {
            count: o,
            paddingStart: i,
            scrollMargin: n,
            getItemKey: r,
          }
        ),
        {
          key: !1,
        },
      )),
      (this.getFurthestMeasurement = (o, i) => {
        const n = /* @__PURE__ */ new Map();
        const r = /* @__PURE__ */ new Map();
        for (let l = i - 1; l >= 0; l--) {
          const u = o[l];
          if (n.has(u.lane)) continue;
          const c = r.get(u.lane);
          if (
            (c == null || u.end > c.end ? r.set(u.lane, u) : u.end < c.end && n.set(u.lane, !0),
            n.size === this.options.lanes)
          )
            break;
        }
        return r.size === this.options.lanes
          ? Array.from(r.values()).sort((l, u) =>
              l.end === u.end ? l.index - u.index : l.end - u.end,
            )[0]
          : void 0;
      }),
      (this.getMeasurements = At(
        () => [this.memoOptions(), this.itemSizeCache],
        ({ count: o, paddingStart: i, scrollMargin: n, getItemKey: r }, l) => {
          const u =
            this.pendingMeasuredCacheIndexes.length > 0
              ? Math.min(...this.pendingMeasuredCacheIndexes)
              : 0;
          this.pendingMeasuredCacheIndexes = [];
          const c = this.measurementsCache.slice(0, u);
          for (let p = u; p < o; p++) {
            const d = r(p);
            const g = this.options.lanes === 1 ? c[p - 1] : this.getFurthestMeasurement(c, p);
            const h = g ? g.end + this.options.gap : i + n;
            const y = l.get(d);
            const f = typeof y === 'number' ? y : this.options.estimateSize(p);
            const b = h + f;
            const I = g ? g.lane : p % this.options.lanes;
            c[p] = {
              index: p,
              start: h,
              size: f,
              end: b,
              key: d,
              lane: I,
            };
          }
          return (this.measurementsCache = c), c;
        },
        {
          key: !1,
          debug: /* @__PURE__ */ a(() => this.options.debug, 'debug'),
        },
      )),
      (this.calculateRange = At(
        () => [this.getMeasurements(), this.getSize(), this.scrollOffset],
        (o, i, n) =>
          (this.range =
            o.length > 0 && i > 0
              ? Lh({
                  measurements: o,
                  outerSize: i,
                  scrollOffset: n,
                })
              : null),
        {
          key: !1,
          debug: /* @__PURE__ */ a(() => this.options.debug, 'debug'),
        },
      )),
      (this.getIndexes = At(
        () => [
          this.options.rangeExtractor,
          this.calculateRange(),
          this.options.overscan,
          this.options.count,
        ],
        (o, i, n, r) =>
          i === null
            ? []
            : o({
                ...i,
                overscan: n,
                count: r,
              }),
        {
          key: !1,
          debug: /* @__PURE__ */ a(() => this.options.debug, 'debug'),
        },
      )),
      (this.indexFromElement = o => {
        const i = this.options.indexAttribute;
        const n = o.getAttribute(i);
        return n
          ? Number.parseInt(n, 10)
          : (console.warn(`Missing attribute name '${i}={index}' on measured element.`), -1);
      }),
      (this._measureElement = (o, i) => {
        const n = this.measurementsCache[this.indexFromElement(o)];
        if (!n || !o.isConnected) {
          this.measureElementCache.forEach((u, c) => {
            u === o && (this.observer.unobserve(o), this.measureElementCache.delete(c));
          });
          return;
        }
        const r = this.measureElementCache.get(n.key);
        r !== o &&
          (r && this.observer.unobserve(r),
          this.observer.observe(o),
          this.measureElementCache.set(n.key, o));
        const l = this.options.measureElement(o, i, this);
        this.resizeItem(n, l);
      }),
      (this.resizeItem = (o, i) => {
        const n = this.itemSizeCache.get(o.key) ?? o.size;
        const r = i - n;
        r !== 0 &&
          ((this.shouldAdjustScrollPositionOnItemSizeChange !== void 0
            ? this.shouldAdjustScrollPositionOnItemSizeChange(o, r, this)
            : o.start < this.scrollOffset + this.scrollAdjustments) &&
            this._scrollToOffset(this.scrollOffset, {
              adjustments: (this.scrollAdjustments += r),
              behavior: void 0,
            }),
          this.pendingMeasuredCacheIndexes.push(o.index),
          (this.itemSizeCache = new Map(this.itemSizeCache.set(o.key, i))),
          this.notify(!1));
      }),
      (this.measureElement = o => {
        o && this._measureElement(o, void 0);
      }),
      (this.getVirtualItems = At(
        () => [this.getIndexes(), this.getMeasurements()],
        (o, i) => {
          const n = [];
          for (let r = 0, l = o.length; r < l; r++) {
            const u = o[r];
            const c = i[u];
            n.push(c);
          }
          return n;
        },
        {
          key: !1,
          debug: /* @__PURE__ */ a(() => this.options.debug, 'debug'),
        },
      )),
      (this.getVirtualItemForOffset = o => {
        const i = this.getMeasurements();
        return hr(i[vu(0, i.length - 1, n => hr(i[n]).start, o)]);
      }),
      (this.getOffsetForAlignment = (o, i) => {
        const n = this.getSize();
        i === 'auto' &&
          (o <= this.scrollOffset
            ? (i = 'start')
            : o >= this.scrollOffset + n
              ? (i = 'end')
              : (i = 'start')),
          i === 'start' ? (o = o) : i === 'end' ? (o = o - n) : i === 'center' && (o = o - n / 2);
        const r = this.options.horizontal ? 'scrollWidth' : 'scrollHeight';
        const u =
          (this.scrollElement
            ? 'document' in this.scrollElement
              ? this.scrollElement.document.documentElement[r]
              : this.scrollElement[r]
            : 0) - this.getSize();
        return Math.max(Math.min(u, o), 0);
      }),
      (this.getOffsetForIndex = (o, i = 'auto') => {
        o = Math.max(0, Math.min(o, this.options.count - 1));
        const n = hr(this.getMeasurements()[o]);
        if (i === 'auto')
          if (n.end >= this.scrollOffset + this.getSize() - this.options.scrollPaddingEnd)
            i = 'end';
          else if (n.start <= this.scrollOffset + this.options.scrollPaddingStart) i = 'start';
          else return [this.scrollOffset, i];
        const r =
          i === 'end'
            ? n.end + this.options.scrollPaddingEnd
            : n.start - this.options.scrollPaddingStart;
        return [this.getOffsetForAlignment(r, i), i];
      }),
      (this.isDynamicMode = () => this.measureElementCache.size > 0),
      (this.cancelScrollToIndex = () => {
        this.scrollToIndexTimeoutId !== null &&
          (clearTimeout(this.scrollToIndexTimeoutId), (this.scrollToIndexTimeoutId = null));
      }),
      (this.scrollToOffset = (o, { align: i = 'start', behavior: n } = {}) => {
        this.cancelScrollToIndex(),
          n === 'smooth' &&
            this.isDynamicMode() &&
            console.warn('The `smooth` scroll behavior is not fully supported with dynamic size.'),
          this._scrollToOffset(this.getOffsetForAlignment(o, i), {
            adjustments: void 0,
            behavior: n,
          });
      }),
      (this.scrollToIndex = (o, { align: i = 'auto', behavior: n } = {}) => {
        (o = Math.max(0, Math.min(o, this.options.count - 1))),
          this.cancelScrollToIndex(),
          n === 'smooth' &&
            this.isDynamicMode() &&
            console.warn('The `smooth` scroll behavior is not fully supported with dynamic size.');
        const [r, l] = this.getOffsetForIndex(o, i);
        this._scrollToOffset(r, { adjustments: void 0, behavior: n }),
          n !== 'smooth' &&
            this.isDynamicMode() &&
            (this.scrollToIndexTimeoutId = setTimeout(() => {
              if (
                ((this.scrollToIndexTimeoutId = null),
                this.measureElementCache.has(this.options.getItemKey(o)))
              ) {
                const [c] = this.getOffsetForIndex(o, l);
                hu(c, this.scrollOffset) || this.scrollToIndex(o, { align: l, behavior: n });
              } else this.scrollToIndex(o, { align: l, behavior: n });
            }));
      }),
      (this.scrollBy = (o, { behavior: i } = {}) => {
        this.cancelScrollToIndex(),
          i === 'smooth' &&
            this.isDynamicMode() &&
            console.warn('The `smooth` scroll behavior is not fully supported with dynamic size.'),
          this._scrollToOffset(this.scrollOffset + o, {
            adjustments: void 0,
            behavior: i,
          });
      }),
      (this.getTotalSize = () => {
        let o;
        const i = this.getMeasurements();
        let n;
        return (
          i.length === 0
            ? (n = this.options.paddingStart)
            : (n =
                this.options.lanes === 1
                  ? (((o = i[i.length - 1]) == null ? void 0 : o.end) ?? 0)
                  : Math.max(...i.slice(-this.options.lanes).map(r => r.end))),
          n - this.options.scrollMargin + this.options.paddingEnd
        );
      }),
      (this._scrollToOffset = (o, { adjustments: i, behavior: n }) => {
        this.options.scrollToFn(o, { behavior: n, adjustments: i }, this);
      }),
      (this.measure = () => {
        (this.itemSizeCache = /* @__PURE__ */ new Map()), this.notify(!1);
      }),
      this.setOptions(t),
      (this.scrollRect = this.options.initialRect),
      (this.scrollOffset =
        typeof this.options.initialOffset === 'function'
          ? this.options.initialOffset()
          : this.options.initialOffset),
      (this.measurementsCache = this.options.initialMeasurementsCache),
      this.measurementsCache.forEach(o => {
        this.itemSizeCache.set(o.key, o.size);
      }),
      this.maybeNotify();
  }
};
a(Qn, 'Virtualizer');
const gr = Qn;
const vu = /* @__PURE__ */ a((e, t, o, i) => {
  while (e <= t) {
    const n = ((e + t) / 2) | 0;
    const r = o(n);
    if (r < i) e = n + 1;
    else if (r > i) t = n - 1;
    else return n;
  }
  return e > 0 ? e - 1 : 0;
}, 'findNearestBinarySearch');
function Lh({ measurements: e, outerSize: t, scrollOffset: o }) {
  const i = e.length - 1;
  const r = vu(
    0,
    i,
    /* @__PURE__ */ a(u => e[u].start, 'getOffset'),
    o,
  );
  let l = r;
  while (l < i && e[l].end < o + t) l++;
  return { startIndex: r, endIndex: l };
}
a(Lh, 'calculateRange');

// ../node_modules/@tanstack/react-virtual/dist/esm/index.js
const Nh = typeof document < 'u' ? ft : j;
function Rh(e) {
  const t = Vt(() => ({}), {})[1];
  const o = {
    ...e,
    onChange: /* @__PURE__ */ a((n, r) => {
      let l;
      r ? mo(t) : t(), (l = e.onChange) == null || l.call(e, n, r);
    }, 'onChange'),
  };
  const [i] = $(() => new gr(o));
  return i.setOptions(o), j(() => i._didMount(), []), Nh(() => i._willUpdate()), i;
}
a(Rh, 'useVirtualizerBase');
function xu(e) {
  return Rh({
    observeElementRect: gu,
    observeElementOffset: yu,
    scrollToFn: bu,
    ...e,
  });
}
a(xu, 'useVirtualizer');

// src/manager/components/sidebar/FIleSearchList.utils.tsx
const Su = /* @__PURE__ */ a(({ parentRef: e, rowVirtualizer: t, selectedItem: o }) => {
  j(() => {
    const i = /* @__PURE__ */ a(n => {
      if (!e.current) return;
      const r = t.options.count;
      const l = document.activeElement;
      const u = Number.parseInt(l.getAttribute('data-index') || '-1', 10);
      const c = l.tagName === 'INPUT';
      const p = /* @__PURE__ */ a(
        () => document.querySelector('[data-index="0"]'),
        'getFirstElement',
      );
      const d = /* @__PURE__ */ a(
        () => document.querySelector(`[data-index="${r - 1}"]`),
        'getLastElement',
      );
      if (n.code === 'ArrowDown' && l) {
        if ((n.stopPropagation(), c)) {
          p()?.focus();
          return;
        }
        if (u === r - 1) {
          mo(() => {
            t.scrollToIndex(0, { align: 'start' });
          }),
            setTimeout(() => {
              p()?.focus();
            }, 100);
          return;
        }
        if (o === u) {
          document.querySelector(`[data-index-position="${o}_first"]`)?.focus();
          return;
        }
        if (o !== null && l.getAttribute('data-index-position')?.includes('last')) {
          document.querySelector(`[data-index="${o + 1}"]`)?.focus();
          return;
        }
        l.nextElementSibling?.focus();
      }
      if (n.code === 'ArrowUp' && l) {
        if (c) {
          mo(() => {
            t.scrollToIndex(r - 1, { align: 'start' });
          }),
            setTimeout(() => {
              d()?.focus();
            }, 100);
          return;
        }
        if (o !== null && l.getAttribute('data-index-position')?.includes('first')) {
          document.querySelector(`[data-index="${o}"]`)?.focus();
          return;
        }
        l.previousElementSibling?.focus();
      }
    }, 'handleArrowKeys');
    return (
      document.addEventListener('keydown', i, { capture: !0 }),
      () => {
        document.removeEventListener('keydown', i, { capture: !0 });
      }
    );
  }, [t, o, e]);
}, 'useArrowKeyNavigation');

// src/manager/components/sidebar/FileList.tsx
const Iu = x('div')(({ theme: e }) => ({
  marginTop: '-16px',
  // after element which fades out the list
  '&::after': {
    content: '""',
    position: 'fixed',
    pointerEvents: 'none',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80px',
    background: `linear-gradient(${rr(e.barBg, 0)} 10%, ${e.barBg} 80%)`,
  },
}));
const yr = x('div')(({ theme: e }) => ({
  height: '280px',
  overflow: 'auto',
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
  position: 'relative',
  '::-webkit-scrollbar': {
    display: 'none',
  },
}));
const Eu = x('li')(({ theme: e }) => ({
  ':focus-visible': {
    outline: 'none',
    '.file-list-item': {
      borderRadius: '4px',
      background: e.base === 'dark' ? 'rgba(255,255,255,.1)' : e.color.mediumlight,
      '> svg': {
        display: 'flex',
      },
    },
  },
}));
const br = x('div')(({ theme: e }) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));
const _u = x.div(({ theme: e, selected: t, disabled: o, error: i }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  alignSelf: 'stretch',
  padding: '8px 16px',
  cursor: 'pointer',
  borderRadius: '4px',
  ...(t && {
    borderRadius: '4px',
    background: e.base === 'dark' ? 'rgba(255,255,255,.1)' : e.color.mediumlight,
    '> svg': {
      display: 'flex',
    },
  }),
  ...(o && {
    cursor: 'not-allowed',
    div: {
      color: `${e.color.mediumdark} !important`,
    },
  }),
  ...(i && {
    background: e.base === 'light' ? '#00000011' : '#00000033',
  }),
  '&:hover': {
    background: i ? '#00000022' : e.base === 'dark' ? 'rgba(255,255,255,.1)' : e.color.mediumlight,
    '> svg': {
      display: 'flex',
    },
  },
}));
const wu = x('ul')({
  margin: 0,
  padding: '0 0 0 0',
  width: '100%',
  position: 'relative',
});
const Tu = x('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: 'calc(100% - 50px)',
});
const Cu = x('div')(({ theme: e, error: t }) => ({
  color: t ? e.color.negativeText : e.color.secondary,
}));
const ku = x('div')(({ theme: e, error: t }) => ({
  color: t ? e.color.negativeText : e.base === 'dark' ? e.color.lighter : e.color.darkest,
  fontSize: '14px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  maxWidth: '100%',
}));
const Ou = x('div')(({ theme: e }) => ({
  color: e.color.mediumdark,
  fontSize: '14px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  maxWidth: '100%',
}));
const Pu = x('ul')(({ theme: e }) => ({
  margin: 0,
  padding: 0,
}));
const Au = x('li')(({ theme: e, error: t }) => ({
  padding: '8px 16px 8px 16px',
  marginLeft: '30px',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '14px',
  cursor: 'pointer',
  borderRadius: '4px',
  ':focus-visible': {
    outline: 'none',
  },
  ...(t && {
    background: '#F9ECEC',
    color: e.color.negativeText,
  }),
  '&:hover,:focus-visible': {
    background: t
      ? '#F9ECEC'
      : e.base === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : e.color.mediumlight,
    '> svg': {
      display: 'flex',
    },
  },
  '> div > svg': {
    color: t ? e.color.negativeText : e.color.secondary,
  },
}));
const Du = x('div')(({ theme: e }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: 'calc(100% - 20px)',
}));
const Mu = x('span')(({ theme: e }) => ({
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  maxWidth: 'calc(100% - 160px)',
  display: 'inline-block',
}));
const Lu = x('span')(({ theme: e }) => ({
  display: 'inline-block',
  padding: `1px ${e.appBorderRadius}px`,
  borderRadius: '2px',
  fontSize: '10px',
  color: e.base === 'dark' ? e.color.lightest : '#727272',
  backgroundColor: e.base === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#F2F4F5',
}));
const Nu = x('div')(({ theme: e }) => ({
  textAlign: 'center',
  maxWidth: '334px',
  margin: '16px auto 50px auto',
  fontSize: '14px',
  color: e.base === 'dark' ? e.color.lightest : '#000',
}));
const Ru = x('p')(({ theme: e }) => ({
  margin: 0,
  color: e.base === 'dark' ? e.color.defaultText : e.color.mediumdark,
}));

// src/manager/components/sidebar/FileSearchListSkeleton.tsx
const Fh = x('div')(({ theme: e }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  alignSelf: 'stretch',
  padding: '8px 16px',
}));
const Hh = x('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  borderRadius: '3px',
});
const Bh = x.div(({ theme: e }) => ({
  width: '14px',
  height: '14px',
  borderRadius: '3px',
  marginTop: '1px',
  background: e.base === 'dark' ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)',
  animation: `${e.animation.glow} 1.5s ease-in-out infinite`,
}));
const Fu = x.div(({ theme: e }) => ({
  height: '16px',
  borderRadius: '3px',
  background: e.base === 'dark' ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)',
  animation: `${e.animation.glow} 1.5s ease-in-out infinite`,
  width: '100%',
  maxWidth: '100%',
  '+ div': {
    marginTop: '6px',
  },
}));
const Hu = /* @__PURE__ */ a(
  () =>
    /* @__PURE__ */ s.createElement(
      yr,
      null,
      [1, 2, 3].map(e =>
        /* @__PURE__ */ s.createElement(
          br,
          { key: e },
          /* @__PURE__ */ s.createElement(
            Fh,
            null,
            /* @__PURE__ */ s.createElement(Bh, null),
            /* @__PURE__ */ s.createElement(
              Hh,
              null,
              /* @__PURE__ */ s.createElement(Fu, { style: { width: '90px' } }),
              /* @__PURE__ */ s.createElement(Fu, { style: { width: '300px' } }),
            ),
          ),
        ),
      ),
    ),
  'FileSearchListLoa\
dingSkeleton',
);

// src/manager/components/sidebar/FileSearchList.tsx
const Bu = x(gs)(({ theme: e }) => ({
  display: 'none',
  alignSelf: 'center',
  color: e.color.mediumdark,
}));
const zh = x(Kt)(({ theme: e }) => ({
  display: 'none',
  alignSelf: 'center',
  color: e.color.mediumdark,
}));
const zu = no(
  /* @__PURE__ */ a(({ isLoading: t, searchResults: o, onNewStory: i, errorItemId: n }) => {
    const [r, l] = $(null);
    const u = s.useRef();
    const c = K(
      () =>
        [...(o ?? [])].sort((f, b) => {
          const I = f.exportedComponents === null || f.exportedComponents?.length === 0;
          const _ = f.storyFileExists;
          const m = b.exportedComponents === null || b.exportedComponents?.length === 0;
          const v = b.storyFileExists;
          return _ && !v ? -1 : (v && !_) || (I && !m) ? 1 : !I && m ? -1 : 0;
        }),
      [o],
    );
    const p = o?.length || 0;
    const d = xu({
      count: p,
      // @ts-expect-error (non strict)
      getScrollElement: /* @__PURE__ */ a(() => u.current, 'getScrollElement'),
      paddingStart: 16,
      paddingEnd: 40,
      estimateSize: /* @__PURE__ */ a(() => 54, 'estimateSize'),
      overscan: 2,
    });
    Su({ rowVirtualizer: d, parentRef: u, selectedItem: r });
    const g = A(
      ({ virtualItem: f, searchResult: b, itemId: I }) => {
        b?.exportedComponents?.length > 1
          ? l(_ => (_ === f.index ? null : f.index))
          : b?.exportedComponents?.length === 1 &&
            i({
              componentExportName: b.exportedComponents[0].name,
              componentFilePath: b.filepath,
              componentIsDefaultExport: b.exportedComponents[0].default,
              selectedItemId: I,
              componentExportCount: 1,
            });
      },
      [i],
    );
    const h = A(
      ({ searchResult: f, component: b, id: I }) => {
        i({
          componentExportName: b.name,
          componentFilePath: f.filepath,
          componentIsDefaultExport: b.default,
          selectedItemId: I,
          // @ts-expect-error (non strict)
          componentExportCount: f.exportedComponents.length,
        });
      },
      [i],
    );
    const y = A(
      ({ virtualItem: f, selected: b, searchResult: I }) => {
        const _ = n === I.filepath;
        const m = b === f.index;
        return /* @__PURE__ */ s.createElement(
          br,
          {
            'aria-expanded': m,
            'aria-controls': `file-list-export-${f.index}`,
            id: `file-list-item-wrapper-${f.index}`,
          },
          /* @__PURE__ */ s.createElement(
            _u,
            {
              className: 'file-list-item',
              selected: m,
              error: _,
              disabled: I.exportedComponents === null || I.exportedComponents?.length === 0,
            },
            /* @__PURE__ */ s.createElement(
              Cu,
              { error: _ },
              /* @__PURE__ */ s.createElement(rn, null),
            ),
            /* @__PURE__ */ s.createElement(
              Tu,
              null,
              /* @__PURE__ */ s.createElement(ku, { error: _ }, I.filepath.split('/').at(-1)),
              /* @__PURE__ */ s.createElement(Ou, null, I.filepath),
            ),
            m
              ? /* @__PURE__ */ s.createElement(zh, null)
              : /* @__PURE__ */ s.createElement(Bu, null),
          ),
          I?.exportedComponents?.length > 1 &&
            m &&
            /* @__PURE__ */ s.createElement(
              Pu,
              {
                role: 'region',
                id: `file-list-export-${f.index}`,
                'aria-labelledby': `file-list-item-wrapper-${f.index}`,
                onClick: v => {
                  v.stopPropagation();
                },
                onKeyUp: v => {
                  v.key === 'Enter' && v.stopPropagation();
                },
              },
              I.exportedComponents?.map((v, S) => {
                const E = n === `${I.filepath}_${S}`;
                const T =
                  S === 0
                    ? 'first'
                    : // @ts-expect-error (non strict)
                      S === I.exportedComponents.length - 1
                      ? 'last'
                      : 'middle';
                return /* @__PURE__ */ s.createElement(
                  Au,
                  {
                    tabIndex: 0,
                    'data-index-position': `${f.index}_${T}`,
                    key: v.name,
                    error: E,
                    onClick: () => {
                      h({
                        searchResult: I,
                        component: v,
                        id: `${I.filepath}_${S}`,
                      });
                    },
                    onKeyUp: C => {
                      C.key === 'Enter' &&
                        h({
                          searchResult: I,
                          component: v,
                          id: `${I.filepath}_${S}`,
                        });
                    },
                  },
                  /* @__PURE__ */ s.createElement(
                    Du,
                    null,
                    /* @__PURE__ */ s.createElement(rn, null),
                    v.default
                      ? /* @__PURE__ */ s.createElement(
                          s.Fragment,
                          null,
                          /* @__PURE__ */ s.createElement(
                            Mu,
                            null,
                            I.filepath.split('/').at(-1)?.split('.')?.at(0),
                          ),
                          /* @__PURE__ */ s.createElement(Lu, null, 'Default export'),
                        )
                      : v.name,
                  ),
                  /* @__PURE__ */ s.createElement(Bu, null),
                );
              }),
            ),
        );
      },
      [h, n],
    );
    return t && (o === null || o?.length === 0)
      ? /* @__PURE__ */ s.createElement(Hu, null)
      : o?.length === 0
        ? /* @__PURE__ */ s.createElement(
            Nu,
            null,
            /* @__PURE__ */ s.createElement('p', null, 'We could not find any file with that name'),
            /* @__PURE__ */ s.createElement(
              Ru,
              null,
              'You may want to try using different keywords, check for typos, and adjust your filters',
            ),
          )
        : c?.length > 0
          ? /* @__PURE__ */ s.createElement(
              Iu,
              null,
              /* @__PURE__ */ s.createElement(
                yr,
                { ref: u },
                /* @__PURE__ */ s.createElement(
                  wu,
                  {
                    style: {
                      height: `${d.getTotalSize()}px`,
                    },
                  },
                  d.getVirtualItems().map(f => {
                    const b = c[f.index];
                    const I = b.exportedComponents === null || b.exportedComponents?.length === 0;
                    const _ = {};
                    return /* @__PURE__ */ s.createElement(
                      Eu,
                      {
                        key: f.key,
                        'data-index': f.index,
                        ref: d.measureElement,
                        onClick: () => {
                          g({
                            virtualItem: f,
                            itemId: b.filepath,
                            searchResult: b,
                          });
                        },
                        onKeyUp: m => {
                          m.key === 'Enter' &&
                            g({
                              virtualItem: f,
                              itemId: b.filepath,
                              searchResult: b,
                            });
                        },
                        style: {
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${f.start}px)`,
                        },
                        tabIndex: 0,
                      },
                      I
                        ? /* @__PURE__ */ s.createElement(
                            be,
                            {
                              ..._,
                              style: { width: '100%' },
                              hasChrome: !1,
                              closeOnOutsideClick: !0,
                              tooltip: /* @__PURE__ */ s.createElement(Xe, {
                                note: I
                                  ? "We can't evaluate exports for this file. You can't create a story for it automatically"
                                  : null,
                              }),
                            },
                            /* @__PURE__ */ s.createElement(y, {
                              searchResult: b,
                              selected: r,
                              virtualItem: f,
                            }),
                          )
                        : /* @__PURE__ */ s.createElement(y, {
                            ..._,
                            key: f.index,
                            searchResult: b,
                            selected: r,
                            virtualItem: f,
                          }),
                    );
                  }),
                ),
              ),
            )
          : null;
  }, 'FileSearchList'),
);

// src/manager/components/sidebar/FileSearchModal.tsx
const Wh = 418;
const jh = x(Et)(() => ({
  boxShadow: 'none',
  background: 'transparent',
  overflow: 'visible',
}));
const Vh = x.div(({ theme: e, height: t }) => ({
  backgroundColor: e.background.bar,
  borderRadius: 6,
  boxShadow:
    'rgba(255, 255, 255, 0.05) 0 0 0 1px inset, rgba(14, 18, 22, 0.35) 0px 10px 18px -10px',
  padding: '16px',
  transition: 'height 0.3s',
  height: t ? `${t + 32}px` : 'auto',
  overflow: 'hidden',
}));
const Kh = x(Et.Content)(({ theme: e }) => ({
  margin: 0,
  color: e.base === 'dark' ? e.color.lighter : e.color.mediumdark,
}));
const $h = x(Yo.Input)(({ theme: e }) => ({
  paddingLeft: 40,
  paddingRight: 28,
  fontSize: 14,
  height: 40,
  ...(e.base === 'light' && {
    color: e.color.darkest,
  }),
  '::placeholder': {
    color: e.color.mediumdark,
  },
  '&:invalid:not(:placeholder-shown)': {
    boxShadow: `${e.color.negative} 0 0 0 1px inset`,
  },
  '&::-webkit-search-decoration, &::-webkit-search-cancel-button, &::-webkit-search-results-button, &::-webkit-search-results-decoration':
    {
      display: 'none',
    },
}));
const Uh = x.div({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  position: 'relative',
});
const Gh = x.div(({ theme: e }) => ({
  position: 'absolute',
  top: 0,
  left: 16,
  zIndex: 1,
  pointerEvents: 'none',
  color: e.darkest,
  display: 'flex',
  alignItems: 'center',
  height: '100%',
}));
const Yh = x.div(({ theme: e }) => ({
  position: 'absolute',
  top: 0,
  right: 16,
  zIndex: 1,
  color: e.darkest,
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  animation: 'spin 1s linear infinite',
}));
const qh = x(Et.Error)({
  position: 'absolute',
  padding: '8px 40px 8px 16px',
  bottom: 0,
  maxHeight: 'initial',
  width: '100%',
  div: {
    wordBreak: 'break-word',
  },
  '> div': {
    padding: 0,
  },
});
const Qh = x(Ao)({
  position: 'absolute',
  top: 4,
  right: -24,
  cursor: 'pointer',
});
const Wu = /* @__PURE__ */ a(
  ({
    open: e,
    onOpenChange: t,
    fileSearchQuery: o,
    setFileSearchQuery: i,
    isLoading: n,
    error: r,
    searchResults: l,
    onCreateNewStory: u,
    setError: c,
    container: p,
  }) => {
    const [d, g] = mu();
    const [h, y] = $(g.height);
    const [, f] = ds();
    const [b, I] = $(o);
    return (
      j(() => {
        h < g.height && y(g.height);
      }, [g.height, h]),
      /* @__PURE__ */ s.createElement(
        jh,
        {
          height: Wh,
          width: 440,
          open: e,
          onOpenChange: t,
          onEscapeKeyDown: () => {
            t(!1);
          },
          onInteractOutside: () => {
            t(!1);
          },
          container: p,
        },
        /* @__PURE__ */ s.createElement(
          Vh,
          { height: o === '' ? g.height : h },
          /* @__PURE__ */ s.createElement(
            Kh,
            { ref: d },
            /* @__PURE__ */ s.createElement(
              Et.Header,
              null,
              /* @__PURE__ */ s.createElement(Et.Title, null, 'Add a new story'),
              /* @__PURE__ */ s.createElement(
                Et.Description,
                null,
                'We will create a new story for your component',
              ),
            ),
            /* @__PURE__ */ s.createElement(
              Uh,
              null,
              /* @__PURE__ */ s.createElement(Gh, null, /* @__PURE__ */ s.createElement(No, null)),
              /* @__PURE__ */ s.createElement($h, {
                placeholder: './components/**/*.tsx',
                type: 'search',
                required: !0,
                autoFocus: !0,
                value: b,
                onChange: _ => {
                  const m = _.target.value;
                  I(m),
                    f(() => {
                      i(m);
                    });
                },
              }),
              n &&
                /* @__PURE__ */ s.createElement(
                  Yh,
                  null,
                  /* @__PURE__ */ s.createElement(mt, null),
                ),
            ),
            /* @__PURE__ */ s.createElement(zu, {
              errorItemId: r?.selectedItemId,
              isLoading: n,
              searchResults: l,
              onNewStory: u,
            }),
          ),
        ),
        r &&
          o !== '' &&
          /* @__PURE__ */ s.createElement(
            qh,
            null,
            /* @__PURE__ */ s.createElement('div', null, r.error),
            /* @__PURE__ */ s.createElement(Qh, {
              onClick: () => {
                c(null);
              },
            }),
          ),
      )
    );
  },
  'FileSearchModal',
);

// src/manager/components/sidebar/FileSearchModal.utils.tsx
function ju(e) {
  return Object.keys(e).reduce((o, i) => {
    const n = e[i];
    if (typeof n.control === 'object' && 'type' in n.control)
      switch (n.control.type) {
        case 'object':
          o[i] = {};
          break;
        case 'inline-radio':
        case 'radio':
        case 'inline-check':
        case 'check':
        case 'select':
        case 'multi-select':
          o[i] = n.control.options?.[0];
          break;
        case 'color':
          o[i] = '#000000';
          break;
        default:
          break;
      }
    return vr(n.type, o, i), o;
  }, {});
}
a(ju, 'extractSeededRequiredArgs');
function vr(e, t, o) {
  if (!(typeof e === 'string' || !e.required))
    switch (e.name) {
      case 'boolean':
        t[o] = !0;
        break;
      case 'number':
        t[o] = 0;
        break;
      case 'string':
        t[o] = o;
        break;
      case 'array':
        t[o] = [];
        break;
      case 'object':
        (t[o] = {}),
          Object.entries(e.value ?? {}).forEach(([i, n]) => {
            vr(n, t[o], i);
          });
        break;
      case 'function':
        t[o] = () => {};
        break;
      case 'intersection':
        e.value?.every(i => i.name === 'object') &&
          ((t[o] = {}),
          e.value?.forEach(i => {
            i.name === 'object' &&
              Object.entries(i.value ?? {}).forEach(([n, r]) => {
                vr(r, t[o], n);
              });
          }));
        break;
      case 'union':
        e.value?.[0] !== void 0 && vr(e.value[0], t, o);
        break;
      case 'enum':
        e.value?.[0] !== void 0 && (t[o] = e.value?.[0]);
        break;
      case 'other':
        typeof e.value === 'string' && e.value === 'tuple' && (t[o] = []);
        break;
      default:
        break;
    }
}
a(vr, 'setArgType');
async function xr(e, t, o = 1) {
  if (o > 10) throw new Error('We could not select the new story. Please try again.');
  try {
    await e(t);
  } catch {
    return await new Promise(n => setTimeout(n, 500)), xr(e, t, o + 1);
  }
}
a(xr, 'trySelectNewStory');

// src/manager/components/sidebar/CreateNewStoryFileModal.tsx
const Xh = /* @__PURE__ */ a(
  e => JSON.stringify(e, (t, o) => (typeof o === 'function' ? '__sb_empty_function_arg__' : o)),
  'stringifyArgs',
);
const Vu = /* @__PURE__ */ a(({ open: e, onOpenChange: t }) => {
  const [o, i] = $(!1);
  const [n, r] = $('');
  const l = fu(n, 600);
  const u = ps(l);
  const c = Y(null);
  const [p, d] = $(null);
  const g = oe();
  const [h, y] = $(null);
  const f = A(
    m => {
      g.addNotification({
        id: 'create-new-story-file-success',
        content: {
          headline: 'Story file created',
          subHeadline: `${m} was created`,
        },
        duration: 8e3,
        icon: /* @__PURE__ */ s.createElement(We, null),
      }),
        t(!1);
    },
    [g, t],
  );
  const b = A(() => {
    g.addNotification({
      id: 'create-new-story-file-error',
      content: {
        headline: 'Story already exists',
        subHeadline: 'Successfully navigated to existing story',
      },
      duration: 8e3,
      icon: /* @__PURE__ */ s.createElement(We, null),
    }),
      t(!1);
  }, [g, t]);
  const I = A(() => {
    i(!0);
    const m = Ye.getChannel();
    const v = /* @__PURE__ */ a(S => {
      S.id === u &&
        (S.success ? y(S.payload.files) : d({ error: S.error }),
        m.off(Fo, v),
        i(!1),
        (c.current = null));
    }, 'set');
    return (
      m.on(Fo, v),
      u !== '' && c.current !== u
        ? ((c.current = u),
          m.emit(Js, {
            id: u,
            payload: {},
          }))
        : (y(null), i(!1)),
      () => {
        m.off(Fo, v);
      }
    );
  }, [u]);
  const _ = A(
    async ({
      componentExportName: m,
      componentFilePath: v,
      componentIsDefaultExport: S,
      componentExportCount: E,
      selectedItemId: T,
    }) => {
      try {
        const C = Ye.getChannel();
        const k = await Ho(C, Xs, Zs, {
          componentExportName: m,
          componentFilePath: v,
          componentIsDefaultExport: S,
          componentExportCount: E,
        });
        d(null);
        const w = k.storyId;
        await xr(g.selectStory, w);
        try {
          const P = (
            await Ho(C, Gs, Ys, {
              storyId: w,
            })
          ).argTypes;
          const D = ju(P);
          await Ho(C, ta, oa, {
            args: Xh(D),
            importPath: k.storyFilePath,
            csfId: w,
          });
        } catch {}
        f(m), I();
      } catch (C) {
        switch (C?.payload?.type) {
          case 'STORY_FILE_EXISTS': {
            const k = C;
            await xr(g.selectStory, k.payload.kind), b();
            break;
          }
          default:
            d({ selectedItemId: T, error: C?.message });
            break;
        }
      }
    },
    [g?.selectStory, f, I, b],
  );
  return (
    j(() => {
      d(null);
    }, [u]),
    j(() => I(), [I]),
    /* @__PURE__ */ s.createElement(Wu, {
      error: p,
      fileSearchQuery: n,
      fileSearchQueryDeferred: u,
      onCreateNewStory: _,
      isLoading: o,
      onOpenChange: t,
      open: e,
      searchResults: h,
      setError: d,
      setFileSearchQuery: r,
    })
  );
}, 'CreateNewStoryFileModal');

// src/manager/components/sidebar/HighlightStyles.tsx
const Ku = /* @__PURE__ */ a(
  ({ refId: e, itemId: t }) =>
    /* @__PURE__ */ s.createElement(Ut, {
      styles: ({ color: o }) => {
        const i = we(0.85, o.secondary);
        return {
          [`[data-ref-id="${e}"][data-item-id="${t}"]:not([data-selected="true"])`]: {
            '&[data-nodetype="component"], &[data-nodetype="group"]': {
              background: i,
              '&:hover, &:focus': { background: i },
            },
            '&[data-nodetype="story"], &[data-nodetype="document"]': {
              color: o.defaultText,
              background: i,
              '&:hover, &:focus': { background: i },
            },
          },
        };
      },
    }),
  'HighlightStyles',
);

// src/manager/utils/tree.ts
const eo = ze(zn(), 1);
const { document: Xn, window: Zh } = se;
const Sr = /* @__PURE__ */ a((e, t) => (!t || t === st ? e : `${t}_${e}`), 'createId');
const Gu = /* @__PURE__ */ a(
  (e, t) => `${Xn.location.pathname}?path=/${e.type}/${Sr(e.id, t)}`,
  'getLink',
);
const $u = (0, eo.default)(1e3)((e, t) => t[e]);
const Jh = (0, eo.default)(1e3)((e, t) => {
  const o = $u(e, t);
  return o && o.type !== 'root' ? $u(o.parent, t) : void 0;
});
const Yu = (0, eo.default)(1e3)((e, t) => {
  const o = Jh(e, t);
  return o ? [o, ...Yu(o.id, t)] : [];
});
const bo = (0, eo.default)(1e3)((e, t) => Yu(t, e).map(o => o.id));
const it = (0, eo.default)(1e3)((e, t, o) => {
  const i = e[t];
  return (i.type === 'story' || i.type === 'docs' ? [] : i.children).reduce((r, l) => {
    const u = e[l];
    return !u || (o && (u.type === 'story' || u.type === 'docs')) || r.push(l, ...it(e, l, o)), r;
  }, []);
});
function qu(e, t) {
  const o = e.type !== 'root' && e.parent ? t.index[e.parent] : null;
  return o ? [...qu(o, t), o.name] : t.id === st ? [] : [t.title || t.id];
}
a(qu, 'getPath');
const Zn = /* @__PURE__ */ a((e, t) => ({ ...e, refId: t.id, path: qu(e, t) }), 'searchItem');
function Qu(e, t, o) {
  let i = t + (o % e.length);
  return i < 0 && (i = e.length + i), i >= e.length && (i -= e.length), i;
}
a(Qu, 'cycle');
const Dt = /* @__PURE__ */ a((e, t = !1) => {
  if (!e) return;
  const { top: o, bottom: i } = e.getBoundingClientRect();
  if (!o || !i) return;
  const n =
    Xn?.querySelector('#sidebar-bottom-wrapper')?.getBoundingClientRect().top ||
    Zh.innerHeight ||
    Xn.documentElement.clientHeight;
  i > n && e.scrollIntoView({ block: t ? 'center' : 'nearest' });
}, 'scrollIntoView');
const Xu = /* @__PURE__ */ a((e, t, o, i) => {
  switch (!0) {
    case t:
      return 'auth';
    case o:
      return 'error';
    case e:
      return 'loading';
    case i:
      return 'empty';
    default:
      return 'ready';
  }
}, 'getStateType');
const Mt = /* @__PURE__ */ a(
  (e, t) => (!e || !t ? !1 : e === t ? !0 : Mt(e.parentElement || void 0, t)),
  'isAncestor',
);
const Uu = /* @__PURE__ */ a(e => e.replaceAll(/(\s|-|_)/gi, ''), 'removeNoiseFromName');
const Zu = /* @__PURE__ */ a((e, t) => Uu(e) === Uu(t), 'isStoryHoistable');

// global-externals:@storybook/core/client-logger
const dM = __STORYBOOK_CLIENT_LOGGER__;
const { deprecate: fM, logger: Ju, once: mM, pretty: hM } = __STORYBOOK_CLIENT_LOGGER__;

// src/manager/components/sidebar/Loader.tsx
const ec = [0, 0, 1, 1, 2, 3, 3, 3, 1, 1, 1, 2, 2, 2, 3];
const eg = x.div(
  {
    cursor: 'progress',
    fontSize: 13,
    height: '16px',
    marginTop: 4,
    marginBottom: 4,
    alignItems: 'center',
    overflow: 'hidden',
  },
  ({ depth: e = 0 }) => ({
    marginLeft: e * 15,
    maxWidth: 85 - e * 5,
  }),
  ({ theme: e }) => e.animation.inlineGlow,
  ({ theme: e }) => ({
    background: e.appBorderColor,
  }),
);
const vo = x.div({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 20,
  paddingRight: 20,
});
const tc = /* @__PURE__ */ a(({ size: e }) => {
  const t = Math.ceil(e / ec.length);
  const o = Array.from(Array(t)).fill(ec).flat().slice(0, e);
  return /* @__PURE__ */ s.createElement(
    _e,
    null,
    o.map((i, n) => /* @__PURE__ */ s.createElement(eg, { depth: i, key: n })),
  );
}, 'Loader');

// src/manager/components/sidebar/RefBlocks.tsx
const { window: oc } = se;
const tg = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  lineHeight: '20px',
  margin: 0,
}));
const Jn = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  lineHeight: '20px',
  margin: 0,
  code: {
    fontSize: e.typography.size.s1,
  },
  ul: {
    paddingLeft: 20,
    marginTop: 8,
    marginBottom: 8,
  },
}));
const og = x.pre(
  {
    width: 420,
    boxSizing: 'border-box',
    borderRadius: 8,
    overflow: 'auto',
    whiteSpace: 'pre',
  },
  ({ theme: e }) => ({
    color: e.color.dark,
  }),
);
const rc = /* @__PURE__ */ a(({ loginUrl: e, id: t }) => {
  const [o, i] = $(!1);
  const n = A(() => {
    oc.document.location.reload();
  }, []);
  const r = A(l => {
    l.preventDefault();
    const u = oc.open(e, `storybook_auth_${t}`, 'resizable,scrollbars');
    const c = setInterval(() => {
      u
        ? u.closed && (clearInterval(c), i(!0))
        : (Ju.error('unable to access loginUrl window'), clearInterval(c));
    }, 1e3);
  }, []);
  return /* @__PURE__ */ s.createElement(
    vo,
    null,
    /* @__PURE__ */ s.createElement(
      lt,
      null,
      o
        ? /* @__PURE__ */ s.createElement(
            _e,
            null,
            /* @__PURE__ */ s.createElement(
              Jn,
              null,
              'Authentication on ',
              /* @__PURE__ */ s.createElement('strong', null, e),
              ' concluded. Refresh the page to fetch t\
his Storybook.',
            ),
            /* @__PURE__ */ s.createElement(
              'div',
              null,
              /* @__PURE__ */ s.createElement(
                me,
                { small: !0, gray: !0, onClick: n },
                /* @__PURE__ */ s.createElement(mt, null),
                'Refresh now',
              ),
            ),
          )
        : /* @__PURE__ */ s.createElement(
            _e,
            null,
            /* @__PURE__ */ s.createElement(
              Jn,
              null,
              'Sign in t\
o browse this Storybook.',
            ),
            /* @__PURE__ */ s.createElement(
              'div',
              null,
              /* @__PURE__ */ s.createElement(
                me,
                { small: !0, gray: !0, onClick: r },
                /* @__PURE__ */ s.createElement(Mo, null),
                'Sign in',
              ),
            ),
          ),
    ),
  );
}, 'AuthBlock');
const nc = /* @__PURE__ */ a(
  ({ error: e }) =>
    /* @__PURE__ */ s.createElement(
      vo,
      null,
      /* @__PURE__ */ s.createElement(
        lt,
        null,
        /* @__PURE__ */ s.createElement(
          tg,
          null,
          'Oh no! Something went wrong loading this Storybook.',
          /* @__PURE__ */ s.createElement('br', null),
          /* @__PURE__ */ s.createElement(
            be,
            {
              tooltip: /* @__PURE__ */ s.createElement(
                og,
                null,
                /* @__PURE__ */ s.createElement(Va, { error: e }),
              ),
            },
            /* @__PURE__ */ s.createElement(
              Me,
              { isButton: !0 },
              'View error ',
              /* @__PURE__ */ s.createElement(Kt, null),
            ),
          ),
          ' ',
          /* @__PURE__ */ s.createElement(
            Me,
            {
              withArrow: !0,
              href: 'https://storybook.js.org/docs',
              cancel: !1,
              target: '_blank',
            },
            'View do\
cs',
          ),
        ),
      ),
    ),
  'ErrorBlock',
);
const rg = x(lt)({
  display: 'flex',
});
const ng = x(lt)({
  flex: 1,
});
const ic = /* @__PURE__ */ a(
  ({ isMain: e }) =>
    /* @__PURE__ */ s.createElement(
      vo,
      null,
      /* @__PURE__ */ s.createElement(
        rg,
        { col: 1 },
        /* @__PURE__ */ s.createElement(
          ng,
          null,
          /* @__PURE__ */ s.createElement(
            Jn,
            null,
            e
              ? /* @__PURE__ */ s.createElement(
                  s.Fragment,
                  null,
                  'Oh no! Your Storybo\
ok is empty. Possible reasons why:',
                  /* @__PURE__ */ s.createElement(
                    'ul',
                    null,
                    /* @__PURE__ */ s.createElement(
                      'li',
                      null,
                      'The glob speci\
fied in ',
                      /* @__PURE__ */ s.createElement('code', null, 'main.js'),
                      " isn't correct.",
                    ),
                    /* @__PURE__ */ s.createElement(
                      'li',
                      null,
                      'No sto\
ries are defined in your story files.',
                    ),
                    /* @__PURE__ */ s.createElement(
                      'li',
                      null,
                      "You're using filter-functions, and all stories are fil\
tered away.",
                    ),
                  ),
                  ' ',
                )
              : /* @__PURE__ */ s.createElement(
                  s.Fragment,
                  null,
                  "This composed storybook is empty, maybe you're using filter-functi\
ons, and all stories are filtered away.",
                ),
          ),
        ),
      ),
    ),
  'EmptyBlock',
);
const sc = /* @__PURE__ */ a(
  ({ isMain: e }) =>
    /* @__PURE__ */ s.createElement(
      vo,
      null,
      /* @__PURE__ */ s.createElement(tc, { size: e ? 17 : 5 }),
    ),
  'LoaderBlock',
);

// src/manager/components/sidebar/RefIndicator.tsx
const { document: ig, window: sg } = se;
const ag = x.aside(({ theme: e }) => ({
  height: 16,
  display: 'flex',
  alignItems: 'center',
  '& > * + *': {
    marginLeft: e.layoutMargin,
  },
}));
const lg = x.button(({ theme: e }) => ({
  height: 20,
  width: 20,
  padding: 0,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  outline: 'none',
  border: '1px solid transparent',
  borderRadius: '100%',
  cursor: 'pointer',
  color: e.base === 'light' ? we(0.3, e.color.defaultText) : we(0.6, e.color.defaultText),
  '&:hover': {
    color: e.barSelectedColor,
  },
  '&:focus': {
    color: e.barSelectedColor,
    borderColor: e.color.secondary,
  },
  svg: {
    height: 10,
    width: 10,
    transition: 'all 150ms ease-out',
    color: 'inherit',
  },
}));
const Lt = x.span(({ theme: e }) => ({
  fontWeight: e.typography.weight.bold,
}));
const Nt = x.a(({ theme: e }) => ({
  textDecoration: 'none',
  lineHeight: '16px',
  padding: 15,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  color: e.color.defaultText,
  '&:not(:last-child)': {
    borderBottom: `1px solid ${e.appBorderColor}`,
  },
  '&:hover': {
    background: e.background.hoverable,
    color: e.color.darker,
  },
  '&:link': {
    color: e.color.darker,
  },
  '&:active': {
    color: e.color.darker,
  },
  '&:focus': {
    color: e.color.darker,
  },
  '& > *': {
    flex: 1,
  },
  '& > svg': {
    marginTop: 3,
    width: 16,
    height: 16,
    marginRight: 10,
    flex: 'unset',
  },
}));
const ug = x.div({
  width: 280,
  boxSizing: 'border-box',
  borderRadius: 8,
  overflow: 'hidden',
});
const cg = x.div(({ theme: e }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: e.typography.size.s1,
  fontWeight: e.typography.weight.regular,
  color: e.base === 'light' ? we(0.3, e.color.defaultText) : we(0.6, e.color.defaultText),
  '& > * + *': {
    marginLeft: 4,
  },
  svg: {
    height: 10,
    width: 10,
  },
}));
const pg = /* @__PURE__ */ a(({ url: e, versions: t }) => {
  const o = K(() => {
    const i = Object.entries(t).find(([n, r]) => r === e);
    return i?.[0] ? i[0] : 'current';
  }, [e, t]);
  return /* @__PURE__ */ s.createElement(
    cg,
    null,
    /* @__PURE__ */ s.createElement('span', null, o),
    /* @__PURE__ */ s.createElement(Kt, null),
  );
}, 'CurrentVersion');
const ac = s.memo(
  cs(({ state: e, ...t }, o) => {
    const i = oe();
    const n = K(() => Object.values(t.index || {}), [t.index]);
    const r = K(() => n.filter(u => u.type === 'component').length, [n]);
    const l = K(() => n.filter(u => u.type === 'docs' || u.type === 'story').length, [n]);
    return /* @__PURE__ */ s.createElement(
      ag,
      { ref: o },
      /* @__PURE__ */ s.createElement(
        be,
        {
          placement: 'bottom-start',
          trigger: 'click',
          closeOnOutsideClick: !0,
          tooltip: /* @__PURE__ */ s.createElement(
            ug,
            null,
            /* @__PURE__ */ s.createElement(
              lt,
              { row: 0 },
              e === 'loading' && /* @__PURE__ */ s.createElement(yg, { url: t.url }),
              (e === 'error' || e === 'empty') &&
                /* @__PURE__ */ s.createElement(gg, { url: t.url }),
              e ===
                '\
ready' &&
                /* @__PURE__ */ s.createElement(
                  s.Fragment,
                  null,
                  /* @__PURE__ */ s.createElement(dg, {
                    url: t.url,
                    componentCount: r,
                    leafCount: l,
                  }),
                  t.sourceUrl && /* @__PURE__ */ s.createElement(fg, { url: t.sourceUrl }),
                ),
              e === 'auth' && /* @__PURE__ */ s.createElement(mg, { ...t }),
              t.type === 'auto-inject' &&
                e !== 'error' &&
                /* @__PURE__ */ s.createElement(bg, null),
              e !== 'loading' && /* @__PURE__ */ s.createElement(hg, null),
            ),
          ),
        },
        /* @__PURE__ */ s.createElement(
          lg,
          { 'data-action': 'toggle-indicator', 'aria-label': 'toggle indicator' },
          /* @__PURE__ */ s.createElement(nn, null),
        ),
      ),
      t.versions && Object.keys(t.versions).length
        ? /* @__PURE__ */ s.createElement(
            be,
            {
              placement: 'bottom-start',
              trigger: 'click',
              closeOnOutsideClick: !0,
              tooltip: u =>
                /* @__PURE__ */ s.createElement(gt, {
                  links: Object.entries(t.versions).map(([c, p]) => ({
                    icon: p === t.url ? /* @__PURE__ */ s.createElement(We, null) : void 0,
                    id: c,
                    title: c,
                    href: p,
                    onClick: /* @__PURE__ */ a((d, g) => {
                      d.preventDefault(), i.changeRefVersion(t.id, g.href), u.onHide();
                    }, 'onClick'),
                  })),
                }),
            },
            /* @__PURE__ */ s.createElement(pg, { url: t.url, versions: t.versions }),
          )
        : null,
    );
  }),
);
const dg = /* @__PURE__ */ a(({ url: e, componentCount: t, leafCount: o }) => {
  const i = Ae();
  return /* @__PURE__ */ s.createElement(
    Nt,
    { href: e.replace(/\/?$/, '/index.html'), target: '_blank' },
    /* @__PURE__ */ s.createElement(nn, { color: i.color.secondary }),
    /* @__PURE__ */ s.createElement(
      'div',
      null,
      /* @__PURE__ */ s.createElement(
        Lt,
        null,
        'View external Story\
book',
      ),
      /* @__PURE__ */ s.createElement(
        'div',
        null,
        'Explore ',
        t,
        ' components and ',
        o,
        ' stories in a new browser tab.',
      ),
    ),
  );
}, 'ReadyMessage');
const fg = /* @__PURE__ */ a(({ url: e }) => {
  const t = Ae();
  return /* @__PURE__ */ s.createElement(
    Nt,
    { href: e, target: '_blank' },
    /* @__PURE__ */ s.createElement(As, { color: t.color.secondary }),
    /* @__PURE__ */ s.createElement(
      'div',
      null,
      /* @__PURE__ */ s.createElement(Lt, null, 'View source code'),
    ),
  );
}, 'SourceCodeMessage');
const mg = /* @__PURE__ */ a(({ loginUrl: e, id: t }) => {
  const o = Ae();
  const i = A(n => {
    n.preventDefault();
    const r = sg.open(e, `storybook_auth_${t}`, 'resizable,scrollbars');
    const l = setInterval(() => {
      r ? r.closed && (clearInterval(l), ig.location.reload()) : clearInterval(l);
    }, 1e3);
  }, []);
  return /* @__PURE__ */ s.createElement(
    Nt,
    { onClick: i },
    /* @__PURE__ */ s.createElement(Mo, { color: o.color.gold }),
    /* @__PURE__ */ s.createElement(
      'div',
      null,
      /* @__PURE__ */ s.createElement(Lt, null, 'Log in required'),
      /* @__PURE__ */ s.createElement(
        'div',
        null,
        "You\
 need to authenticate to view this Storybook's components.",
      ),
    ),
  );
}, 'LoginRequiredMessage');
const hg = /* @__PURE__ */ a(() => {
  const e = Ae();
  return /* @__PURE__ */ s.createElement(
    Nt,
    { href: 'https://storybook.js.org/docs/sharing/storybook-composition', target: '_blank' },
    /* @__PURE__ */ s.createElement($t, { color: e.color.green }),
    /* @__PURE__ */ s.createElement(
      'div',
      null,
      /* @__PURE__ */ s.createElement(
        Lt,
        null,
        'Read \
Composition docs',
      ),
      /* @__PURE__ */ s.createElement(
        'div',
        null,
        'Learn how to combine multiple Storybooks into one.',
      ),
    ),
  );
}, 'ReadDocsMessage');
const gg = /* @__PURE__ */ a(({ url: e }) => {
  const t = Ae();
  return /* @__PURE__ */ s.createElement(
    Nt,
    { href: e.replace(/\/?$/, '/index.html'), target: '_blank' },
    /* @__PURE__ */ s.createElement(Oo, { color: t.color.negative }),
    /* @__PURE__ */ s.createElement(
      'div',
      null,
      /* @__PURE__ */ s.createElement(Lt, null, 'Something went wrong'),
      /* @__PURE__ */ s.createElement(
        'div',
        null,
        "This external Storybook didn't load. Debug it in a new tab now.",
      ),
    ),
  );
}, 'ErrorOccurredMessage');
const yg = /* @__PURE__ */ a(({ url: e }) => {
  const t = Ae();
  return /* @__PURE__ */ s.createElement(
    Nt,
    { href: e.replace(/\/?$/, '/index.html'), target: '_blank' },
    /* @__PURE__ */ s.createElement(zs, { color: t.color.secondary }),
    /* @__PURE__ */ s.createElement(
      'div',
      null,
      /* @__PURE__ */ s.createElement(Lt, null, 'Please wait'),
      /* @__PURE__ */ s.createElement('div', null, 'This Storybook is loading.'),
    ),
  );
}, 'LoadingMessage');
const bg = /* @__PURE__ */ a(() => {
  const e = Ae();
  return /* @__PURE__ */ s.createElement(
    Nt,
    { href: 'https://storybook.js.org/docs/sharing/storybook-composition', target: '_blank' },
    /* @__PURE__ */ s.createElement(Os, { color: e.color.gold }),
    /* @__PURE__ */ s.createElement(
      'div',
      null,
      /* @__PURE__ */ s.createElement(
        Lt,
        null,
        'Reduce\
 lag',
      ),
      /* @__PURE__ */ s.createElement(
        'div',
        null,
        'Learn how to speed up Composition performance.',
      ),
    ),
  );
}, 'PerformanceDegradedMessage');

// src/manager/components/sidebar/IconSymbols.tsx
const vg = x.svg`
  position: absolute;
  width: 0;
  height: 0;
  display: inline-block;
  shape-rendering: inherit;
  vertical-align: middle;
`;
const lc = 'icon--group';
const uc = 'icon--component';
const cc = 'icon--document';
const pc = 'icon--story';
const dc = 'icon--success';
const fc = 'icon--error';
const mc =
  'ic\
on--warning';
const hc = 'icon--dot';
const gc = /* @__PURE__ */ a(
  () =>
    /* @__PURE__ */ s.createElement(
      vg,
      { 'data-chromatic': 'ignore' },
      /* @__PURE__ */ s.createElement(
        'symbol',
        { id: lc },
        /* @__PURE__ */ s.createElement('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M6.586 3.504l-1.5-1.5H1v9h12v-7.5H6.586zm.414-1L5.793 1.297a1 1 0 00-.707-.293H.5a.5.5 0 00-.5.5v10a.5.5 0 00.5.5h13a.5.5 0 00.5-.5v\
-8.5a.5.5 0 00-.5-.5H7z',
          fill: 'currentColor',
        }),
      ),
      /* @__PURE__ */ s.createElement(
        'symbol',
        { id: uc },
        /* @__PURE__ */ s.createElement('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M3.5 1.004a2.5 2.5 0 00-2.5 2.5v7a2.5 2.5 0 002.5 2.5h7a2.5 2.5 0 002.5-2.5v-7a2.5 2.5 0 00-2.5-2.5h-7zm8.5 5.5H7.5v-4.5h3a1.5 1.5 0\
 011.5 1.5v3zm0 1v3a1.5 1.5 0 01-1.5 1.5h-3v-4.5H12zm-5.5 4.5v-4.5H2v3a1.5 1.5 0 001.5 1.5h3zM2 6.504h4.5v-4.5h-3a1.5 1.5 0 00-1.5 1.5v3z',
          fill: 'currentColor',
        }),
      ),
      /* @__PURE__ */ s.createElement(
        'symbol',
        { id: cc },
        /* @__PURE__ */ s.createElement('path', {
          d: 'M4 5.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zM4.5 7.5a.5.5 0 000 1h5a.5.5 0 000-1h-5zM4 10.5a.5.5 0 01.5-.5h5a.5.5 0 010 \
1h-5a.5.5 0 01-.5-.5z',
          fill: 'currentColor',
        }),
        /* @__PURE__ */ s.createElement('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M1.5 0a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h11a.5.5 0 00.5-.5V3.207a.5.5 0 00-.146-.353L10.146.146A.5.5 0 009.793 0H1.5zM2 1h7.5v2a.5.5 0\
 00.5.5h2V13H2V1z',
          fill: 'currentColor',
        }),
      ),
      /* @__PURE__ */ s.createElement(
        'symbol',
        { id: pc },
        /* @__PURE__ */ s.createElement('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M3.5 0h7a.5.5 0 01.5.5v13a.5.5 0 01-.454.498.462.462 0 01-.371-.118L7 11.159l-3.175 2.72a.46.46 0 01-.379.118A.5.5 0 013 13.5V.5a.5.\
5 0 01.5-.5zM4 12.413l2.664-2.284a.454.454 0 01.377-.128.498.498 0 01.284.12L10 12.412V1H4v11.413z',
          fill: 'currentColor',
        }),
      ),
      /* @__PURE__ */ s.createElement(
        'symbol',
        { id: dc },
        /* @__PURE__ */ s.createElement('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M10.854 4.146a.5.5 0 010 .708l-5 5a.5.5 0 01-.708 0l-2-2a.5.5 0 11.708-.708L5.5 8.793l4.646-4.647a.5.5 0 01.708 0z',
          fill: 'currentColor',
        }),
      ),
      /* @__PURE__ */ s.createElement(
        'symbol',
        { id: fc },
        /* @__PURE__ */ s.createElement('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M7 4a3 3 0 100 6 3 3 0 000-6zM3 7a4 4 0 118 0 4 4 0 01-8 0z',
          fill: 'currentColor',
        }),
      ),
      /* @__PURE__ */ s.createElement(
        'symbol',
        { id: mc },
        /* @__PURE__ */ s.createElement('path', {
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'M7.206 3.044a.498.498 0 01.23.212l3.492 5.985a.494.494 0 01.006.507.497.497 0 01-.443.252H3.51a.499.499 0 01-.437-.76l3.492-5.984a.4\
97.497 0 01.642-.212zM7 4.492L4.37 9h5.26L7 4.492z',
          fill: 'currentColor',
        }),
      ),
      /* @__PURE__ */ s.createElement(
        'symbol',
        { id: hc },
        /* @__PURE__ */ s.createElement('circle', {
          cx: '3',
          cy: '3',
          r: '3',
          fill: 'curre\
ntColor',
        }),
      ),
    ),
  'IconSymbols',
);
const Ne = /* @__PURE__ */ a(
  ({ type: e }) =>
    e === 'group'
      ? /* @__PURE__ */ s.createElement('use', {
          xlinkHref: `\
#${lc}`,
        })
      : e === 'component'
        ? /* @__PURE__ */ s.createElement('use', { xlinkHref: `#${uc}` })
        : e === 'document'
          ? /* @__PURE__ */ s.createElement('use', { xlinkHref: `#${cc}` })
          : e === 'story'
            ? /* @__PURE__ */ s.createElement('use', { xlinkHref: `#${pc}` })
            : e === 'success'
              ? /* @__PURE__ */ s.createElement('use', { xlinkHref: `#${dc}` })
              : e === 'error'
                ? /* @__PURE__ */ s.createElement('use', { xlinkHref: `#${fc}` })
                : e ===
                    'war\
ning'
                  ? /* @__PURE__ */ s.createElement('use', { xlinkHref: `#${mc}` })
                  : e === 'dot'
                    ? /* @__PURE__ */ s.createElement('use', {
                        xlinkHref: `\
#${hc}`,
                      })
                    : null,
  'UseSymbol',
);

// src/manager/utils/status.tsx
const xg = x(bs)({
  // specificity hack
  '&&&': {
    width: 6,
    height: 6,
  },
});
const Sg = x(xg)(({ theme: { animation: e, color: t, base: o } }) => ({
  // specificity hack
  animation: `${e.glow} 1.5s ease-in-out infinite`,
  color: o === 'light' ? t.mediumdark : t.darker,
}));
const Ig = ['unknown', 'pending', 'success', 'warn', 'error'];
const xo = {
  unknown: [null, null],
  pending: [/* @__PURE__ */ s.createElement(Sg, { key: 'icon' }), 'currentColor'],
  success: [
    /* @__PURE__ */ s.createElement(
      'svg',
      { key: 'icon', viewBox: '0 0 14 14', width: '14', height: '14' },
      /* @__PURE__ */ s.createElement(Ne, { type: 'success' }),
    ),
    'currentColor',
  ],
  warn: [
    /* @__PURE__ */ s.createElement(
      'svg',
      { key: 'icon', viewBox: '0 0 14 14', width: '14', height: '14' },
      /* @__PURE__ */ s.createElement(Ne, { type: 'warning' }),
    ),
    '#A15C20',
  ],
  error: [
    /* @__PURE__ */ s.createElement(
      'svg',
      { key: 'icon', viewBox: '0 0 14 14', width: '14', height: '14' },
      /* @__PURE__ */ s.createElement(Ne, { type: 'error' }),
    ),
    'brown',
  ],
};
const So = /* @__PURE__ */ a(
  e => Ig.reduce((t, o) => (e.includes(o) ? o : t), 'unknown'),
  'getHighestStatus',
);
function Ir(e, t) {
  return Object.values(e).reduce((o, i) => {
    if (i.type === 'group' || i.type === 'component') {
      const n = it(e, i.id, !1)
        .map(l => e[l])
        .filter(l => l.type === 'story');
      const r = So(
        // @ts-expect-error (non strict)
        n
          .flatMap(l => Object.values(t?.[l.id] || {}))
          .map(l => l.status),
      );
      r && (o[i.id] = r);
    }
    return o;
  }, {});
}
a(Ir, 'getGroupStatus');

// src/manager/components/sidebar/StatusButton.tsx
const yc = /* @__PURE__ */ a(({ theme: e, status: t }) => {
  const o = e.base === 'light' ? we(0.3, e.color.defaultText) : we(0.6, e.color.defaultText);
  return {
    color: {
      pending: o,
      success: e.color.positive,
      error: e.color.negative,
      warn: e.color.warning,
      unknown: o,
    }[t],
  };
}, 'withStatusColor');
const bc = x.div(yc, {
  margin: 3,
});
const Io = x(te)(
  yc,
  ({ theme: e, height: t, width: o }) => ({
    transition: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: o || 28,
    height: t || 28,
    '&:hover': {
      color: e.color.secondary,
      background: e.base === 'dark' ? nr(0.3, e.color.secondary) : po(0.4, e.color.secondary),
    },
    '[data-selected="true"] &': {
      background: e.color.secondary,
      boxShadow: `0 0 5px 5px ${e.color.secondary}`,
      '&:hover': {
        background: po(0.1, e.color.secondary),
      },
    },
    '&:focus': {
      color: e.color.secondary,
      borderColor: e.color.secondary,
      '&:not(:focus-visible)': {
        borderColor: 'transparent',
      },
    },
  }),
  ({ theme: e, selectedItem: t }) =>
    t && {
      '&:hover': {
        boxShadow: `inset 0 0 0 2px ${e.color.secondary}`,
        background: 'rgba(255, 255, 255, 0.2)',
      },
    },
);

// src/manager/components/sidebar/ContextMenu.tsx
const Eg = {
  onMouseEnter: /* @__PURE__ */ a(() => {}, 'onMouseEnter'),
  node: null,
};
const _g = x(be)({
  position: 'absolute',
  right: 0,
  zIndex: 1,
});
const wg = x(Io)({
  background: 'var(--tree-node-background-hover)',
  boxShadow: '0 0 5px 5px var(--tree-node-background-hover)',
});
const vc = /* @__PURE__ */ a((e, t, o) => {
  const [i, n] = $(0);
  const [r, l] = $(!1);
  const u = K(
    () => ({
      onMouseEnter: /* @__PURE__ */ a(() => {
        n(d => d + 1);
      }, 'onMouseEnter'),
      onOpen: /* @__PURE__ */ a(d => {
        d.stopPropagation(), l(!0);
      }, 'onOpen'),
      onClose: /* @__PURE__ */ a(() => {
        l(!1);
      }, 'onClose'),
    }),
    [],
  );
  const p =
    K(() => {
      const d = o.getElements(Te.experimental_TEST_PROVIDER);
      return i ? xc(d, e) : [];
    }, [o, e, i]).length > 0 || t.length > 0;
  return K(
    () =>
      globalThis.CONFIG_TYPE !== 'DEVELOPMENT'
        ? Eg
        : {
            onMouseEnter: u.onMouseEnter,
            node: p
              ? /* @__PURE__ */ s.createElement(
                  _g,
                  {
                    'data-displayed': r ? 'on' : 'off',
                    closeOnOutsideClick: !0,
                    placement: 'bottom-end',
                    'data-testid': 'context-menu',
                    onVisibleChange: d => {
                      d ? l(!0) : u.onClose();
                    },
                    tooltip: /* @__PURE__ */ s.createElement(Tg, { context: e, links: t }),
                  },
                  /* @__PURE__ */ s.createElement(
                    wg,
                    { type: 'button', status: 'pending' },
                    /* @__PURE__ */ s.createElement(xs, null),
                  ),
                )
              : null,
          },
    [e, u, r, p, t],
  );
}, 'useContextMenu');
const Tg = /* @__PURE__ */ a(({ context: e, links: t, ...o }) => {
  const { testProviders: i } = Pe();
  const n = xc(i, e);
  const l = (Array.isArray(t[0]) ? t : [t]).concat([n]);
  return /* @__PURE__ */ s.createElement(gt, { ...o, links: l });
}, 'LiveContextMenu');
function xc(e, t) {
  return Object.entries(e)
    .map(([o, i]) => {
      if (!i) return null;
      const n = i.sidebarContextMenu?.({ context: t, state: i });
      return n
        ? {
            id: o,
            content: n,
          }
        : null;
    })
    .filter(Boolean);
}
a(xc, 'generateTestProviderLinks');

// src/manager/components/sidebar/StatusContext.tsx
const ei = jt({});
const Sc = /* @__PURE__ */ a(e => {
  const { data: t, status: o, groupStatus: i } = ko(ei);
  const n = {
    counts: { pending: 0, success: 0, error: 0, warn: 0, unknown: 0 },
    statuses: { pending: {}, success: {}, error: {}, warn: {}, unknown: {} },
  };
  if (t && o && i && ['pending', 'warn', 'error'].includes(i[e.id]))
    for (const r of it(t, e.id, !1))
      for (const l of Object.values(o[r] || {}))
        n.counts[l.status]++,
          (n.statuses[l.status][r] = n.statuses[l.status][r] || []),
          n.statuses[l.status][r].push(l);
  return n;
}, 'useStatusSummary');

// src/manager/components/sidebar/components/CollapseIcon.tsx
const Cg = x.div(({ theme: e, isExpanded: t }) => ({
  width: 8,
  height: 8,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: we(0.4, e.textMutedColor),
  transform: t ? 'rotateZ(90deg)' : 'none',
  transition: 'transform .1s ease-out',
}));
const Rt = /* @__PURE__ */ a(
  ({ isExpanded: e }) =>
    /* @__PURE__ */ s.createElement(
      Cg,
      { isExpanded: e },
      /* @__PURE__ */ s.createElement(
        's\
vg',
        { xmlns: 'http://www.w3.org/2000/svg', width: '8', height: '8', fill: 'none' },
        /* @__PURE__ */ s.createElement('path', {
          fill: '#73828C',
          fillRule: 'evenodd',
          d: 'M1.896 7.146a.5.5 0 1 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 1 0-.708.708L5.043 4 1.896 7.146Z',
          clipRule: 'evenodd',
        }),
      ),
    ),
  'CollapseIcon',
);

// src/manager/components/sidebar/TreeNode.tsx
const bt = x.svg(({ theme: e, type: t }) => ({
  width: 14,
  height: 14,
  flex: '0 0 auto',
  color:
    t === 'group'
      ? e.base === 'dark'
        ? e.color.primary
        : e.color.ultraviolet
      : t === 'component'
        ? e.color.secondary
        : t ===
            'docume\
nt'
          ? e.base === 'dark'
            ? e.color.gold
            : '#ff8300'
          : t === 'story'
            ? e.color.seafoam
            : 'currentColor',
}));
const Ic = x.button(({ theme: e, depth: t = 0, isExpandable: o = !1 }) => ({
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'start',
  textAlign: 'left',
  paddingLeft: `${(o ? 8 : 22) + t * 18}px`,
  color: 'inherit',
  fontSize: `${e.typography.size.s2}px`,
  background: 'transparent',
  minHeight: 28,
  borderRadius: 4,
  gap: 6,
  paddingTop: 5,
  paddingBottom: 4,
}));
const Ec = x.a(({ theme: e, depth: t = 0 }) => ({
  width: '100%',
  cursor: 'pointer',
  color: 'inherit',
  display: 'flex',
  gap: 6,
  flex: 1,
  alignItems: 'start',
  paddingLeft: `${22 + t * 18}px`,
  paddingTop: 5,
  paddingBottom: 4,
  fontSize: `${e.typography.size.s2}px`,
  textDecoration: 'none',
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
}));
const _c = x.div(({ theme: e }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 16,
  marginBottom: 4,
  fontSize: `${e.typography.size.s1 - 1}px`,
  fontWeight: e.typography.weight.bold,
  lineHeight: '16px',
  minHeight: 28,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: e.textMutedColor,
}));
const Er = x.div({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginTop: 2,
});
const wc = s.memo(
  /* @__PURE__ */ a(
    ({ children: t, isExpanded: o = !1, isExpandable: i = !1, ...n }) =>
      s.createElement(
        Ic,
        { isExpandable: i, tabIndex: -1, ...n },
        /* @__PURE__ */ s.createElement(
          Er,
          null,
          i && /* @__PURE__ */ s.createElement(Rt, { isExpanded: o }),
          /* @__PURE__ */ s.createElement(
            bt,
            { viewBox: '0 0 14 14', width: '14', height: '14', type: 'group' },
            /* @__PURE__ */ s.createElement(Ne, { type: 'group' }),
          ),
        ),
        t,
      ),
    'GroupNode',
  ),
);
const Tc = s.memo(
  /* @__PURE__ */ a(
    ({ theme: t, children: o, isExpanded: i, isExpandable: n, isSelected: r, ...l }) =>
      s.createElement(
        Ic,
        { isExpandable: n, tabIndex: -1, ...l },
        /* @__PURE__ */ s.createElement(
          Er,
          null,
          n && /* @__PURE__ */ s.createElement(Rt, { isExpanded: i }),
          /* @__PURE__ */ s.createElement(
            bt,
            {
              viewBox: '0 0 14 14',
              width: '12',
              height: '12',
              type: 'comp\
onent',
            },
            /* @__PURE__ */ s.createElement(Ne, { type: 'component' }),
          ),
        ),
        o,
      ),
    'ComponentNode',
  ),
);
const Cc = s.memo(
  /* @__PURE__ */ a(
    ({ theme: t, children: o, docsMode: i, ...n }) =>
      s.createElement(
        Ec,
        { tabIndex: -1, ...n },
        /* @__PURE__ */ s.createElement(
          Er,
          null,
          /* @__PURE__ */ s.createElement(
            bt,
            { viewBox: '0 0 14 14', width: '12', height: '12', type: 'document' },
            /* @__PURE__ */ s.createElement(Ne, { type: 'document' }),
          ),
        ),
        o,
      ),
    'DocumentNode',
  ),
);
const kc = s.memo(
  /* @__PURE__ */ a(
    ({ theme: t, children: o, ...i }) =>
      s.createElement(
        Ec,
        { tabIndex: -1, ...i },
        /* @__PURE__ */ s.createElement(
          Er,
          null,
          /* @__PURE__ */ s.createElement(
            bt,
            { viewBox: '0 0 14 14', width: '12', height: '12', type: 'story' },
            /* @__PURE__ */ s.createElement(Ne, { type: 'story' }),
          ),
        ),
        o,
      ),
    'StoryNode',
  ),
);

// ../node_modules/es-toolkit/dist/function/debounce.mjs
function _r(e, t, { signal: o, edges: i } = {}) {
  let n;
  let r = null;
  const l = i?.includes('leading');
  const u = i == null || i.includes('trailing');
  const c = /* @__PURE__ */ a(() => {
    r !== null && (e.apply(n, r), (n = void 0), (r = null));
  }, 'invoke');
  const p = /* @__PURE__ */ a(() => {
    u && c(), y();
  }, 'onTimerEnd');
  let d = null;
  const g = /* @__PURE__ */ a(() => {
    d != null && clearTimeout(d),
      (d = setTimeout(() => {
        (d = null), p();
      }, t));
  }, 'schedule');
  const h = /* @__PURE__ */ a(() => {
    d !== null && (clearTimeout(d), (d = null));
  }, 'cancelTimer');
  const y = /* @__PURE__ */ a(() => {
    h(), (n = void 0), (r = null);
  }, 'cancel');
  const f = /* @__PURE__ */ a(() => {
    h(), c();
  }, 'flush');
  const b = /* @__PURE__ */ a(function (...I) {
    if (o?.aborted) return;
    (n = this), (r = I);
    const _ = d == null;
    g(), l && _ && c();
  }, 'debounced');
  return (
    (b.schedule = g),
    (b.cancel = y),
    (b.flush = f),
    o?.addEventListener('abort', y, { once: !0 }),
    b
  );
}
a(_r, 'debounce');

// ../node_modules/es-toolkit/dist/function/throttle.mjs
function ti(e, t, { signal: o, edges: i = ['leading', 'trailing'] } = {}) {
  let n = null;
  const r = _r(e, t, { signal: o, edges: i });
  const l = /* @__PURE__ */ a((...u) => {
    n == null ? (n = Date.now()) : Date.now() - n >= t && ((n = Date.now()), r.cancel(), r(...u)),
      r(...u);
  }, 'throttled');
  return (l.cancel = r.cancel), (l.flush = r.flush), l;
}
a(ti, 'throttle');

// src/manager/keybinding.ts
const kg = {
  // event.code => event.key
  Space: ' ',
  Slash: '/',
  ArrowLeft: 'ArrowLeft',
  ArrowUp: 'ArrowUp',
  ArrowRight: 'ArrowRight',
  ArrowDown: 'ArrowDown',
  Escape: 'Escape',
  Enter: 'Enter',
};
const Og = { alt: !1, ctrl: !1, meta: !1, shift: !1 };
const vt = /* @__PURE__ */ a((e, t) => {
  const { alt: o, ctrl: i, meta: n, shift: r } = e === !1 ? Og : e;
  return !(
    (typeof o === 'boolean' && o !== t.altKey) ||
    (typeof i === 'boolean' && i !== t.ctrlKey) ||
    (typeof n === 'boolean' && n !== t.metaKey) ||
    (typeof r === 'boolean' && r !== t.shiftKey)
  );
}, 'matchesModifiers');
const Ve = /* @__PURE__ */ a((e, t) => (t.code ? t.code === e : t.key === kg[e]), 'matchesKeyCode');

// src/manager/components/sidebar/useExpanded.ts
const { document: oi } = se;
const Pg = /* @__PURE__ */ a(
  ({ refId: e, data: t, initialExpanded: o, highlightedRef: i, rootIds: n }) => {
    const r = i.current?.refId === e ? bo(t, i.current?.itemId) : [];
    return [...n, ...r].reduce(
      // @ts-expect-error (non strict)
      (l, u) => Object.assign(l, { [u]: u in o ? o[u] : !0 }),
      {},
    );
  },
  'initializeExpanded',
);
const Ag = /* @__PURE__ */ a(() => {}, 'noop');
const Oc = /* @__PURE__ */ a(
  ({
    containerRef: e,
    isBrowsing: t,
    refId: o,
    data: i,
    initialExpanded: n,
    rootIds: r,
    highlightedRef: l,
    setHighlightedItemId: u,
    selectedStoryId: c,
    onSelectStoryId: p,
  }) => {
    const d = oe();
    const [g, h] = Vt(
      (m, { ids: v, value: S }) => v.reduce((E, T) => Object.assign(E, { [T]: S }), { ...m }),
      // @ts-expect-error (non strict)
      { refId: o, data: i, highlightedRef: l, rootIds: r, initialExpanded: n },
      Pg,
    );
    const y = A(m => e.current?.querySelector(`[data-item-id="${m}"]`), [e]);
    const f = A(
      m => {
        u(m.getAttribute('data-item-id')), Dt(m);
      },
      [u],
    );
    const b = A(
      ({ ids: m, value: v }) => {
        if ((h({ ids: m, value: v }), m.length === 1)) {
          const S = e.current?.querySelector(`[data-item-id="${m[0]}"][data-ref-id="${o}"]`);
          S && f(S);
        }
      },
      [e, f, o],
    );
    j(() => {
      h({ ids: bo(i, c), value: !0 });
    }, [i, c]);
    const I = A(() => {
      const m = Object.keys(i).filter(v => !r.includes(v));
      h({ ids: m, value: !1 });
    }, [i, r]);
    const _ = A(() => {
      h({ ids: Object.keys(i), value: !0 });
    }, [i]);
    return (
      j(
        () =>
          d
            ? (d.on(io, I),
              d.on(an, _),
              () => {
                d.off(io, I), d.off(an, _);
              })
            : Ag,
        [d, I, _],
      ),
      j(() => {
        const m = oi.getElementById('storybook-explorer-menu');
        const v = ti(S => {
          const E = l.current?.refId === o && l.current?.itemId;
          if (!t || !e.current || !E || S.repeat || !vt(!1, S)) return;
          const T = Ve('Enter', S);
          const C = Ve('Space', S);
          const k = Ve('ArrowLeft', S);
          const w = Ve('ArrowRight', S);
          if (!(T || C || k || w)) return;
          const O = y(E);
          if (!O || O.getAttribute('data-ref-id') !== o) return;
          const P = S.target;
          if (!Mt(m, P) && !Mt(P, m)) return;
          if (P.hasAttribute('data-action')) {
            if (T || C) return;
            P.blur();
          }
          const D = O.getAttribute('data-nodetype');
          (T || C) && ['component', 'story', 'document'].includes(D) && p(E);
          const M = O.getAttribute('aria-expanded');
          if (k) {
            if (M === 'true') {
              h({ ids: [E], value: !1 });
              return;
            }
            const N = O.getAttribute('data-parent-id');
            const Q = N && y(N);
            if (Q && Q.getAttribute('data-highlightable') === 'true') {
              f(Q);
              return;
            }
            h({ ids: it(i, E, !0), value: !1 });
            return;
          }
          w &&
            (M === 'false'
              ? b({ ids: [E], value: !0 })
              : M === 'true' && b({ ids: it(i, E, !0), value: !0 }));
        }, 60);
        return oi.addEventListener('keydown', v), () => oi.removeEventListener('keydown', v);
      }, [e, t, o, i, l, u, p]),
      [g, b]
    );
  },
  'useExpanded',
);

// src/manager/components/sidebar/Tree.tsx
const Dg = x.div(e => ({
  marginTop: e.hasOrphans ? 20 : 0,
  marginBottom: 20,
}));
const Mg = x.button(({ theme: e }) => ({
  all: 'unset',
  display: 'flex',
  padding: '0px 8px',
  borderRadius: 4,
  transition: 'color 150ms, box-shadow 150ms',
  gap: 6,
  alignItems: 'center',
  cursor: 'pointer',
  height: 28,
  '&:hover, &:focus': {
    outline: 'none',
    background: 'var(--tree-node-background-hover)',
  },
}));
const Pc = x.div(({ theme: e }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  color: e.color.defaultText,
  background: 'transparent',
  minHeight: 28,
  borderRadius: 4,
  overflow: 'hidden',
  '--tree-node-background-hover': e.background.content,
  [Qe]: {
    '--tree-node-background-hover': e.background.app,
  },
  '&:hover, &:focus': {
    '--tree-node-background-hover':
      e.base === 'dark' ? nr(0.35, e.color.secondary) : po(0.45, e.color.secondary),
    background: 'var(--tree-node-background-hover)',
    outline: 'none',
  },
  '& [data-displayed="off"]': {
    visibility: 'hidden',
  },
  '&:hover [data-displayed="off"]': {
    visibility: 'visible',
  },
  '& [data-displayed="on"] + *': {
    visibility: 'hidden',
  },
  '&:hover [data-displayed="off"] + *': {
    visibility: 'hidden',
  },
  '&[data-selected="true"]': {
    color: e.color.lightest,
    background: e.color.secondary,
    fontWeight: e.typography.weight.bold,
    '&&:hover, &&:focus': {
      '--tree-node-background-hover': e.color.secondary,
      background: 'var(--tree-node-background-hover)',
    },
    svg: { color: e.color.lightest },
  },
  a: { color: 'currentColor' },
}));
const Lg = x(me)(({ theme: e }) => ({
  display: 'none',
  '@media (min-width: 600px)': {
    display: 'block',
    fontSize: '10px',
    overflow: 'hidden',
    width: 1,
    height: '20px',
    boxSizing: 'border-box',
    opacity: 0,
    padding: 0,
    '&:focus': {
      opacity: 1,
      padding: '5px 10px',
      background: 'white',
      color: e.color.secondary,
      width: 'auto',
    },
  },
}));
const Ng = /* @__PURE__ */ a(e => {
  const t = Ae();
  return /* @__PURE__ */ s.createElement(Rs, { ...e, color: t.color.positive });
}, 'SuccessStatusIcon');
const Rg = /* @__PURE__ */ a(e => {
  const t = Ae();
  return /* @__PURE__ */ s.createElement(Ns, { ...e, color: t.color.negative });
}, 'ErrorStatusIcon');
const Fg = /* @__PURE__ */ a(e => {
  const t = Ae();
  return /* @__PURE__ */ s.createElement(Fs, { ...e, color: t.color.warning });
}, 'WarnStatusIcon');
const Hg = /* @__PURE__ */ a(e => {
  const t = Ae();
  return /* @__PURE__ */ s.createElement(mt, { ...e, size: 12, color: t.color.defaultText });
}, 'PendingStatusIcon');
const ri = {
  success: /* @__PURE__ */ s.createElement(Ng, null),
  error: /* @__PURE__ */ s.createElement(Rg, null),
  warn: /* @__PURE__ */ s.createElement(Fg, null),
  pending: /* @__PURE__ */ s.createElement(Hg, null),
  unknown: null,
};
const Ac = ['success', 'error', 'warn', 'pending', 'unknown'];
const Dc = s.memo(
  /* @__PURE__ */ a(
    ({
      item: t,
      status: o,
      groupStatus: i,
      refId: n,
      docsMode: r,
      isOrphan: l,
      isDisplayed: u,
      isSelected: c,
      isFullyExpanded: p,
      setFullyExpanded: d,
      isExpanded: g,
      setExpanded: h,
      onSelectStoryId: y,
      api: f,
    }) => {
      const { isDesktop: b, isMobile: I, setMobileMenuOpen: _ } = ge();
      const { counts: m, statuses: v } = Sc(t);
      if (!u) return null;
      const S = K(() => {
        if (t.type === 'story' || t.type === 'docs')
          return Object.entries(o || {})
            .filter(([, C]) => C.sidebarContextMenu !== !1)
            .sort((C, k) => Ac.indexOf(C[1].status) - Ac.indexOf(k[1].status))
            .map(([C, k]) => ({
              id: C,
              title: k.title,
              description: k.description,
              'aria-label': `Test status for ${k.title}: ${k.status}`,
              icon: ri[k.status],
              onClick: /* @__PURE__ */ a(() => {
                y(t.id), k.onClick?.();
              }, 'onClick'),
            }));
        if (t.type === 'component' || t.type === 'group') {
          const C = [];
          return (
            m.error &&
              C.push({
                id: 'errors',
                icon: ri.error,
                title: `${m.error} ${m.error === 1 ? 'story' : 'stories'} with errors`,
                onClick: /* @__PURE__ */ a(() => {
                  const [k, [w]] = Object.entries(v.error)[0];
                  y(k), w.onClick?.();
                }, 'onClick'),
              }),
            m.warn &&
              C.push({
                id: 'warnings',
                icon: ri.warn,
                title: `${m.warn} ${m.warn === 1 ? 'story' : 'stories'} with warnings`,
                onClick: /* @__PURE__ */ a(() => {
                  const [k, [w]] = Object.entries(v.warn)[0];
                  y(k), w.onClick?.();
                }, 'onClick'),
              }),
            C
          );
        }
        return [];
      }, [m.error, m.warn, t.id, t.type, y, o, v.error, v.warn]);
      const E = Sr(t.id, n);
      const T =
        n === 'storybook_internal'
          ? vc(t, S, f)
          : { node: null, onMouseEnter: /* @__PURE__ */ a(() => {}, 'onMouseEnter') };
      if (t.type === 'story' || t.type === 'docs') {
        const C = t.type === 'docs' ? Cc : kc;
        const k = So(Object.values(o || {}).map(P => P.status));
        const [w, O] = xo[k];
        return /* @__PURE__ */ s.createElement(
          Pc,
          {
            key: E,
            className: 'sidebar-item',
            'data-selected': c,
            'data-ref-id': n,
            'data-item-id': t.id,
            'data-parent-id': t.parent,
            'data-nodetype': t.type === 'docs' ? 'document' : 'story',
            'data-highlightable': u,
            onMouseEnter: T.onMouseEnter,
          },
          /* @__PURE__ */ s.createElement(
            C,
            {
              style: c ? {} : { color: O },
              href: Gu(t, n),
              id: E,
              depth: l ? t.depth : t.depth - 1,
              onClick: P => {
                P.preventDefault(), y(t.id), I && _(!1);
              },
              ...(t.type === 'docs' && { docsMode: r }),
            },
            t.renderLabel?.(t, f) || t.name,
          ),
          c &&
            /* @__PURE__ */ s.createElement(
              Lg,
              { asChild: !0 },
              /* @__PURE__ */ s.createElement(
                'a',
                { href: '#storybook-preview-wrapper' },
                'Skip to canvas',
              ),
            ),
          T.node,
          w
            ? /* @__PURE__ */ s.createElement(
                Io,
                {
                  'aria-label': `Test status: ${k}`,
                  role: 'status',
                  type: 'button',
                  status: k,
                  selectedItem: c,
                },
                w,
              )
            : null,
        );
      }
      if (t.type === 'root')
        return /* @__PURE__ */ s.createElement(
          _c,
          {
            key: E,
            id: E,
            className: 'sidebar-subheading',
            'data-ref-id': n,
            'data-item-id': t.id,
            'data-nodetype': 'root',
          },
          /* @__PURE__ */ s.createElement(
            Mg,
            {
              type: 'button',
              'data-action': 'collapse-root',
              onClick: C => {
                C.preventDefault(), h({ ids: [t.id], value: !g });
              },
              'aria-expanded': g,
            },
            /* @__PURE__ */ s.createElement(Rt, { isExpanded: g }),
            t.renderLabel?.(t, f) || t.name,
          ),
          g &&
            /* @__PURE__ */ s.createElement(
              te,
              {
                className: 'sidebar-subheading-action',
                'aria-label': p ? 'Expand' : 'Collapse',
                'data-action': 'expand-all',
                'data-expanded': p,
                onClick: C => {
                  C.preventDefault(), d();
                },
              },
              p
                ? /* @__PURE__ */ s.createElement(vs, null)
                : /* @__PURE__ */ s.createElement(Ss, null),
            ),
        );
      if (t.type === 'component' || t.type === 'group') {
        const C = i?.[t.id];
        const k = C ? xo[C][1] : null;
        const w = t.type === 'component' ? Tc : wc;
        return /* @__PURE__ */ s.createElement(
          Pc,
          {
            key: E,
            className: 'sidebar-item',
            'data-ref-id': n,
            'data-item-id': t.id,
            'data-parent-id': t.parent,
            'data-nodetype': t.type,
            'data-highlightable': u,
            onMouseEnter: T.onMouseEnter,
          },
          /* @__PURE__ */ s.createElement(
            w,
            {
              id: E,
              style: k ? { color: k } : {},
              'aria-controls': t.children?.[0],
              'aria-expanded': g,
              depth: l ? t.depth : t.depth - 1,
              isComponent: t.type === 'component',
              isExpandable: t.children && t.children.length > 0,
              isExpanded: g,
              onClick: O => {
                O.preventDefault(),
                  h({ ids: [t.id], value: !g }),
                  t.type === 'component' && !g && b && y(t.id);
              },
              onMouseEnter: () => {
                t.type === 'component' &&
                  f.emit(St, {
                    ids: [t.children[0]],
                    options: { target: n },
                  });
              },
            },
            t.renderLabel?.(t, f) || t.name,
          ),
          T.node,
          ['error', 'warn'].includes(C) &&
            /* @__PURE__ */ s.createElement(
              Io,
              { type: 'button', status: C },
              /* @__PURE__ */ s.createElement(
                's\
vg',
                { key: 'icon', viewBox: '0 0 6 6', width: '6', height: '6', type: 'dot' },
                /* @__PURE__ */ s.createElement(Ne, { type: 'dot' }),
              ),
            ),
        );
      }
      return null;
    },
    'Node',
  ),
);
const Bg = s.memo(
  /* @__PURE__ */ a(({ setExpanded: t, isFullyExpanded: o, expandableDescendants: i, ...n }) => {
    const r = A(() => t({ ids: i, value: !o }), [t, o, i]);
    return /* @__PURE__ */ s.createElement(Dc, {
      ...n,
      setExpanded: t,
      isFullyExpanded: o,
      setFullyExpanded: r,
    });
  }, 'Root'),
);
const Mc = s.memo(
  /* @__PURE__ */ a(
    ({
      isBrowsing: t,
      isMain: o,
      refId: i,
      data: n,
      status: r,
      docsMode: l,
      highlightedRef: u,
      setHighlightedItemId: c,
      selectedStoryId: p,
      onSelectStoryId: d,
    }) => {
      const g = Y(null);
      const h = oe();
      const [y, f, b] = K(
        () =>
          Object.keys(n).reduce(
            (w, O) => {
              const P = n[O];
              return (
                P.type === 'root' ? w[0].push(O) : P.parent || w[1].push(O),
                P.type === 'root' && P.startCollapsed && (w[2][O] = !1),
                w
              );
            },
            [[], [], {}],
          ),
        [n],
      );
      const { expandableDescendants: I } = K(
        () =>
          [...f, ...y].reduce(
            (w, O) => (
              (w.expandableDescendants[O] = it(n, O, !1).filter(
                P => !['story', 'docs'].includes(n[P].type),
              )),
              w
            ),
            { orphansFirst: [], expandableDescendants: {} },
          ),
        [n, y, f],
      );
      const _ = K(
        () =>
          Object.keys(n).filter(w => {
            const O = n[w];
            if (O.type !== 'component') return !1;
            const { children: P = [], name: D } = O;
            if (P.length !== 1) return !1;
            const M = n[P[0]];
            return M.type === 'docs' ? !0 : M.type === 'story' ? Zu(M.name, D) : !1;
          }),
        [n],
      );
      const m = K(() => Object.keys(n).filter(w => !_.includes(w)), [_]);
      const v = K(
        () =>
          _.reduce(
            (w, O) => {
              const { children: P, parent: D, name: M } = n[O];
              const [N] = P;
              if (D) {
                const Q = [...n[D].children];
                (Q[Q.indexOf(O)] = N), (w[D] = { ...n[D], children: Q });
              }
              return (
                (w[N] = {
                  ...n[N],
                  name: M,
                  parent: D,
                  depth: n[N].depth - 1,
                }),
                w
              );
            },
            { ...n },
          ),
        [n],
      );
      const S = K(() => m.reduce((w, O) => Object.assign(w, { [O]: bo(v, O) }), {}), [m, v]);
      const [E, T] = Oc({
        // @ts-expect-error (non strict)
        containerRef: g,
        isBrowsing: t,
        refId: i,
        data: v,
        initialExpanded: b,
        rootIds: y,
        highlightedRef: u,
        setHighlightedItemId: c,
        selectedStoryId: p,
        onSelectStoryId: d,
      });
      const C = K(() => Ir(v, r), [v, r]);
      const k = K(
        () =>
          m.map(w => {
            const O = v[w];
            const P = Sr(w, i);
            if (O.type === 'root') {
              const M = I[O.id];
              const N = M.every(Q => E[Q]);
              return (
                // @ts-expect-error (TODO)
                /* @__PURE__ */ s.createElement(Bg, {
                  api: h,
                  key: P,
                  item: O,
                  refId: i,
                  collapsedData: v,
                  isOrphan: !1,
                  isDisplayed: !0,
                  isSelected: p === w,
                  isExpanded: !!E[w],
                  setExpanded: T,
                  isFullyExpanded: N,
                  expandableDescendants: M,
                  onSelectStoryId: d,
                })
              );
            }
            const D = !O.parent || S[w].every(M => E[M]);
            return D === !1
              ? null
              : /* @__PURE__ */ s.createElement(Dc, {
                  api: h,
                  collapsedData: v,
                  key: P,
                  item: O,
                  status: r?.[w],
                  groupStatus: C,
                  refId: i,
                  docsMode: l,
                  isOrphan: f.some(M => w === M || w.startsWith(`${M}-`)),
                  isDisplayed: D,
                  isSelected: p === w,
                  isExpanded: !!E[w],
                  setExpanded: T,
                  onSelectStoryId: d,
                });
          }),
        [S, h, v, m, l, I, E, C, d, f, i, p, T, r],
      );
      return /* @__PURE__ */ s.createElement(
        ei.Provider,
        { value: { data: n, status: r, groupStatus: C } },
        /* @__PURE__ */ s.createElement(
          Dg,
          { ref: g, hasOrphans: o && f.length > 0 },
          /* @__PURE__ */ s.createElement(gc, null),
          k,
        ),
      );
    },
    'Tree',
  ),
);

// src/manager/components/sidebar/Refs.tsx
const zg = x.div(({ isMain: e }) => ({
  position: 'relative',
  marginTop: e ? void 0 : 0,
}));
const Wg = x.div(({ theme: e }) => ({
  fontWeight: e.typography.weight.bold,
  fontSize: e.typography.size.s2,
  // Similar to ListItem.tsx
  textDecoration: 'none',
  lineHeight: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'transparent',
  width: '100%',
  marginTop: 20,
  paddingTop: 16,
  paddingBottom: 12,
  borderTop: `1px solid ${e.appBorderColor}`,
  color: e.base === 'light' ? e.color.defaultText : we(0.2, e.color.defaultText),
}));
const jg = x.div({
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  overflow: 'hidden',
  marginLeft: 2,
});
const Vg = x.button(({ theme: e }) => ({
  all: 'unset',
  display: 'flex',
  padding: '0px 8px',
  gap: 6,
  alignItems: 'center',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:focus': {
    borderColor: e.color.secondary,
    'span:first-of-type': {
      borderLeftColor: e.color.secondary,
    },
  },
}));
const Lc = s.memo(
  /* @__PURE__ */ a(t => {
    const { docsOptions: o } = Pe();
    const i = oe();
    const {
      filteredIndex: n,
      id: r,
      title: l = r,
      isLoading: u,
      isBrowsing: c,
      selectedStoryId: p,
      highlightedRef: d,
      setHighlighted: g,
      loginUrl: h,
      type: y,
      expanded: f = !0,
      indexError: b,
      previewInitialized: I,
    } = t;
    const _ = K(() => (n ? Object.keys(n).length : 0), [n]);
    const m = Y(null);
    const v = r === st;
    const E =
      u ||
      (y === 'auto-inject' && !I) ||
      y ===
        'server-\
checked' ||
      y === 'unknown';
    const w = Xu(E, !!h && _ === 0, !!b, !E && _ === 0);
    const [O, P] = $(f);
    j(() => {
      n && p && n[p] && P(!0);
    }, [P, n, p]);
    const D = A(() => P(Q => !Q), [P]);
    const M = A(Q => g({ itemId: Q, refId: r }), [g]);
    const N = A(
      // @ts-expect-error (non strict)
      Q => i?.selectStory(Q, void 0, { ref: !v && r }),
      [i, v, r],
    );
    return /* @__PURE__ */ s.createElement(
      s.Fragment,
      null,
      v ||
        /* @__PURE__ */ s.createElement(
          Wg,
          {
            'aria-label': `${O ? 'Hide' : 'Show'} ${l} stories`,
            'aria-expanded': O,
          },
          /* @__PURE__ */ s.createElement(
            Vg,
            { 'data-action': 'collapse-ref', onClick: D },
            /* @__PURE__ */ s.createElement(Rt, { isExpanded: O }),
            /* @__PURE__ */ s.createElement(jg, { title: l }, l),
          ),
          /* @__PURE__ */ s.createElement(ac, { ...t, state: w, ref: m }),
        ),
      O &&
        /* @__PURE__ */ s.createElement(
          zg,
          { 'data-title': l, isMain: v },
          w === 'auth' && /* @__PURE__ */ s.createElement(rc, { id: r, loginUrl: h }),
          w === 'error' && /* @__PURE__ */ s.createElement(nc, { error: b }),
          w === 'loading' && /* @__PURE__ */ s.createElement(sc, { isMain: v }),
          w === 'empty' && /* @__PURE__ */ s.createElement(ic, { isMain: v }),
          w === 'ready' &&
            /* @__PURE__ */ s.createElement(Mc, {
              status: t.status,
              isBrowsing: c,
              isMain: v,
              refId: r,
              data: n,
              docsMode: o.docsMode,
              selectedStoryId: p,
              onSelectStoryId: N,
              highlightedRef: d,
              setHighlightedItemId: M,
            }),
        ),
    );
  }, 'Ref'),
);

// src/manager/components/sidebar/useHighlighted.ts
const { document: wr, window: Nc } = se;
const Rc = /* @__PURE__ */ a(
  e => (e ? { itemId: e.storyId, refId: e.refId } : null),
  'fromSelection',
);
const Fc = /* @__PURE__ */ a((e, t = {}, o = 1) => {
  const { containerRef: i, center: n = !1, attempts: r = 3, delay: l = 500 } = t;
  const u = (i ? i.current : wr)?.querySelector(e);
  u ? Dt(u, n) : o <= r && setTimeout(Fc, l, e, t, o + 1);
}, 'scrollToSelector');
const Hc = /* @__PURE__ */ a(({ containerRef: e, isLoading: t, isBrowsing: o, selected: i }) => {
  const n = Rc(i);
  const r = Y(n);
  const [l, u] = $(n);
  const c = oe();
  const p = A(
    g => {
      (r.current = g), u(g);
    },
    [r],
  );
  const d = A(
    (g, h = !1) => {
      const y = g.getAttribute('data-item-id');
      const f = g.getAttribute('data-ref-id');
      !y || !f || (p({ itemId: y, refId: f }), Dt(g, h));
    },
    [p],
  );
  return (
    j(() => {
      const g = Rc(i);
      p(g),
        g &&
          Fc(`[data-item-id="${g.itemId}"][data-ref-id="${g.refId}"]`, {
            containerRef: e,
            center: !0,
          });
    }, [e, i, p]),
    j(() => {
      const g = wr.getElementById('storybook-explorer-menu');
      let h;
      const y = /* @__PURE__ */ a(f => {
        if (t || !o || !e.current || !vt(!1, f)) return;
        const b = Ve('ArrowUp', f);
        const I = Ve('ArrowDown', f);
        if (!(b || I)) return;
        const _ = Nc.requestAnimationFrame(() => {
          Nc.cancelAnimationFrame(h), (h = _);
          const m = f.target;
          if (!Mt(g, m) && !Mt(m, g)) return;
          m.hasAttribute('data-action') && m.blur();
          const v = Array.from(e.current?.querySelectorAll('[data-highlightable=true]') || []);
          const S = v.findIndex(
            C =>
              C.getAttribute('data-item-id') === r.current?.itemId &&
              C.getAttribute('data-ref-id') === r.current?.refId,
          );
          const E = Qu(v, S, b ? -1 : 1);
          const T = b ? E === v.length - 1 : E === 0;
          if ((d(v[E], T), v[E].getAttribute('data-nodetype') === 'component')) {
            const { itemId: C, refId: k } = r.current;
            const w = c.resolveStory(C, k === 'storybook_internal' ? void 0 : k);
            w.type === 'component' &&
              c.emit(St, {
                // @ts-expect-error (non strict)
                ids: [w.children[0]],
                options: { target: k },
              });
          }
        });
      }, 'navigateTree');
      return wr.addEventListener('keydown', y), () => wr.removeEventListener('keydown', y);
    }, [t, o, r, d]),
    [l, p, r]
  );
}, 'useHighlighted');

// src/manager/components/sidebar/Explorer.tsx
const Bc = s.memo(
  /* @__PURE__ */ a(({ isLoading: t, isBrowsing: o, dataset: i, selected: n }) => {
    const r = Y(null);
    const [l, u, c] = Hc({
      containerRef: r,
      isLoading: t,
      isBrowsing: o,
      selected: n,
    });
    return /* @__PURE__ */ s.createElement(
      'div',
      {
        ref: r,
        id: 'storybook-explorer-tree',
        'data-highlighted-ref-id': l?.refId,
        'data-highlighted-item-id': l?.itemId,
      },
      l && /* @__PURE__ */ s.createElement(Ku, { ...l }),
      i.entries.map(([p, d]) =>
        /* @__PURE__ */ s.createElement(Lc, {
          ...d,
          key: p,
          isLoading: t,
          isBrowsing: o,
          selectedStoryId: n?.refId === d.id ? n.storyId : null,
          highlightedRef: c,
          setHighlighted: u,
        }),
      ),
    );
  }, 'Explorer'),
);

// src/manager/components/sidebar/Brand.tsx
const Kg = x(Xo)(({ theme: e }) => ({
  width: 'auto',
  height: '22px !important',
  display: 'block',
  color: e.base === 'light' ? e.color.defaultText : e.color.lightest,
}));
const $g = x.img({
  display: 'block',
  maxWidth: '150px !important',
  maxHeight: '100px',
});
const zc = x.a(({ theme: e }) => ({
  display: 'inline-block',
  height: '100%',
  margin: '-3px -4px',
  padding: '2px 3px',
  border: '1px solid transparent',
  borderRadius: 3,
  color: 'inherit',
  textDecoration: 'none',
  '&:focus': {
    outline: 0,
    borderColor: e.color.secondary,
  },
}));
const Wc = ma(({ theme: e }) => {
  const { title: t = 'Storybook', url: o = './', image: i, target: n } = e.brand;
  const r = n || (o === './' ? '' : '_blank');
  if (i === null)
    return t === null
      ? null
      : o
        ? /* @__PURE__ */ s.createElement(zc, {
            href: o,
            target: r,
            dangerouslySetInnerHTML: { __html: t },
          })
        : /* @__PURE__ */ s.createElement('div', { dangerouslySetInnerHTML: { __html: t } });
  const l = i
    ? /* @__PURE__ */ s.createElement($g, { src: i, alt: t })
    : /* @__PURE__ */ s.createElement(Kg, { alt: t });
  return o
    ? /* @__PURE__ */ s.createElement(zc, { title: t, href: o, target: r }, l)
    : /* @__PURE__ */ s.createElement('div', null, l);
});

// src/manager/components/sidebar/Menu.tsx
const jc = x(te)(({ highlighted: e, theme: t }) => ({
  position: 'relative',
  overflow: 'visible',
  marginTop: 0,
  zIndex: 1,
  ...(e && {
    '&:before, &:after': {
      content: '""',
      position: 'absolute',
      top: 6,
      right: 6,
      width: 5,
      height: 5,
      zIndex: 2,
      borderRadius: '50%',
      background: t.background.app,
      border: `1px solid ${t.background.app}`,
      boxShadow: `0 0 0 2px ${t.background.app}`,
    },
    '&:after': {
      background: t.color.positive,
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: `0 0 0 2px ${t.background.app}`,
    },
    '&:hover:after, &:focus-visible:after': {
      boxShadow: `0 0 0 2px ${we(0.88, t.color.secondary)}`,
    },
  }),
}));
const Ug = x.div({
  display: 'flex',
  gap: 4,
});
const Gg = /* @__PURE__ */ a(
  ({ menu: e, onClick: t }) => /* @__PURE__ */ s.createElement(gt, { links: e, onClick: t }),
  'SidebarMenuList',
);
const Vc = /* @__PURE__ */ a(({ menu: e, isHighlighted: t, onClick: o }) => {
  const [i, n] = $(!1);
  const { isMobile: r, setMobileMenuOpen: l } = ge();
  return r
    ? /* @__PURE__ */ s.createElement(
        Ug,
        null,
        /* @__PURE__ */ s.createElement(
          jc,
          {
            title: 'About Storybook',
            'aria-label': 'About Storybook',
            highlighted: t,
            active: !1,
            onClick: o,
          },
          /* @__PURE__ */ s.createElement(on, null),
        ),
        /* @__PURE__ */ s.createElement(
          te,
          {
            title: 'Close menu',
            'aria-label': 'Close menu',
            onClick: () => l(!1),
          },
          /* @__PURE__ */ s.createElement(Ge, null),
        ),
      )
    : /* @__PURE__ */ s.createElement(
        be,
        {
          placement: 'top',
          closeOnOutsideClick: !0,
          tooltip: ({ onHide: u }) => /* @__PURE__ */ s.createElement(Gg, { onClick: u, menu: e }),
          onVisibleChange: n,
        },
        /* @__PURE__ */ s.createElement(
          jc,
          {
            title: 'Shortcuts',
            'aria-label': 'Shortcuts',
            highlighted: t,
            active: i,
          },
          /* @__PURE__ */ s.createElement(on, null),
        ),
      );
}, 'SidebarMenu');

// src/manager/components/sidebar/Heading.tsx
const Yg = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  fontWeight: e.typography.weight.bold,
  color: e.color.defaultText,
  marginRight: 20,
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  minHeight: 22,
  '& > * > *': {
    maxWidth: '100%',
  },
  '& > *': {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    flex: '1 1 auto',
  },
}));
const qg = x.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  minHeight: 42,
  paddingLeft: 8,
});
const Qg = x(me)(({ theme: e }) => ({
  display: 'none',
  '@media (min-width: 600px)': {
    display: 'block',
    position: 'absolute',
    fontSize: e.typography.size.s1,
    zIndex: 3,
    border: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
    opacity: 0,
    transition: 'opacity 150ms ease-out',
    '&:focus': {
      width: '100%',
      height: 'inherit',
      padding: '10px 15px',
      margin: 0,
      clip: 'unset',
      overflow: 'unset',
      opacity: 1,
    },
  },
}));
const Kc = /* @__PURE__ */ a(
  ({
    menuHighlighted: e = !1,
    menu: t,
    skipLinkHref: o,
    extra: i,
    isLoading: n,
    onMenuClick: r,
    ...l
  }) =>
    /* @__PURE__ */ s.createElement(
      qg,
      { ...l },
      o &&
        /* @__PURE__ */ s.createElement(
          Qg,
          { asChild: !0 },
          /* @__PURE__ */ s.createElement('a', { href: o, tabIndex: 0 }, 'Skip to canvas'),
        ),
      /* @__PURE__ */ s.createElement(Yg, null, /* @__PURE__ */ s.createElement(Wc, null)),
      n ? null : i.map(({ id: u, render: c }) => /* @__PURE__ */ s.createElement(c, { key: u })),
      /* @__PURE__ */ s.createElement(Vc, { menu: t, isHighlighted: e, onClick: r }),
    ),
  'Heading',
);

// ../node_modules/downshift/dist/downshift.esm.js
const q = ze(pn());
const ey = ze(Yc());

// ../node_modules/compute-scroll-into-view/dist/index.js
const qc = /* @__PURE__ */ a(e => typeof e === 'object' && e != null && e.nodeType === 1, 't');
const Qc = /* @__PURE__ */ a(
  (e, t) => (!t || e !== 'hidden') && e !== 'visible' && e !== 'clip',
  'e',
);
const si = /* @__PURE__ */ a((e, t) => {
  if (e.clientHeight < e.scrollHeight || e.clientWidth < e.scrollWidth) {
    const o = getComputedStyle(e, null);
    return (
      Qc(o.overflowY, t) ||
      Qc(o.overflowX, t) ||
      (i => {
        const n = (r => {
          if (!r.ownerDocument || !r.ownerDocument.defaultView) return null;
          try {
            return r.ownerDocument.defaultView.frameElement;
          } catch {
            return null;
          }
        })(i);
        return !!n && (n.clientHeight < i.scrollHeight || n.clientWidth < i.scrollWidth);
      })(e)
    );
  }
  return !1;
}, 'n');
const Rr = /* @__PURE__ */ a(
  (e, t, o, i, n, r, l, u) =>
    (r < e && l > t) || (r > e && l < t)
      ? 0
      : (r <= e && u <= o) || (l >= t && u >= o)
        ? r - e - i
        : (l > t && u < o) || (r < e && u > o)
          ? l - t + n
          : 0,
  'o',
);
const Jg = /* @__PURE__ */ a(e => {
  const t = e.parentElement;
  return t ?? (e.getRootNode().host || null);
}, 'l');
const Xc = /* @__PURE__ */ a((e, t) => {
  let o;
  let i;
  let n;
  let r;
  if (typeof document > 'u') return [];
  const { scrollMode: l, block: u, inline: c, boundary: p, skipOverflowHiddenElements: d } = t;
  const g = typeof p === 'function' ? p : V => V !== p;
  if (!qc(e)) throw new TypeError('Invalid target');
  const h = document.scrollingElement || document.documentElement;
  const y = [];
  let f = e;
  while (qc(f) && g(f)) {
    if (((f = Jg(f)), f === h)) {
      y.push(f);
      break;
    }
    (f != null && f === document.body && si(f) && !si(document.documentElement)) ||
      (f != null && si(f, d) && y.push(f));
  }
  const b = (i = (o = window.visualViewport) == null ? void 0 : o.width) != null ? i : innerWidth;
  const I = (r = (n = window.visualViewport) == null ? void 0 : n.height) != null ? r : innerHeight;
  const { scrollX: _, scrollY: m } = window;
  const { height: v, width: S, top: E, right: T, bottom: C, left: k } = e.getBoundingClientRect();
  const {
    top: w,
    right: O,
    bottom: P,
    left: D,
  } = (V => {
    const X = window.getComputedStyle(V);
    return {
      top: Number.parseFloat(X.scrollMarginTop) || 0,
      right: Number.parseFloat(X.scrollMarginRight) || 0,
      bottom: Number.parseFloat(X.scrollMarginBottom) || 0,
      left: Number.parseFloat(X.scrollMarginLeft) || 0,
    };
  })(e);
  let M = u === 'start' || u === 'nearest' ? E - w : u === 'end' ? C + P : E + v / 2 - w + P;
  let N = c === 'center' ? k + S / 2 - D + O : c === 'end' ? T + O : k - D;
  const Q = [];
  for (let V = 0; V < y.length; V++) {
    const X = y[V];
    const {
      height: H,
      width: U,
      top: z,
      right: re,
      bottom: R,
      left: F,
    } = X.getBoundingClientRect();
    if (
      l === 'if-needed' &&
      E >= 0 &&
      k >= 0 &&
      C <= I &&
      T <= b &&
      E >= z &&
      C <= R &&
      k >= F &&
      T <= re
    )
      return Q;
    const L = getComputedStyle(X);
    const W = Number.parseInt(L.borderLeftWidth, 10);
    const J = Number.parseInt(L.borderTopWidth, 10);
    const ie = Number.parseInt(L.borderRightWidth, 10);
    const ee = Number.parseInt(L.borderBottomWidth, 10);
    let de = 0;
    let ae = 0;
    const ce = 'offsetWidth' in X ? X.offsetWidth - X.clientWidth - W - ie : 0;
    const ue =
      'offs\
etHeight' in X
        ? X.offsetHeight - X.clientHeight - J - ee
        : 0;
    const Se = 'offsetWidth' in X ? (X.offsetWidth === 0 ? 0 : U / X.offsetWidth) : 0;
    const ye =
      '\
offsetHeight' in X
        ? X.offsetHeight === 0
          ? 0
          : H / X.offsetHeight
        : 0;
    if (h === X)
      (de =
        u === 'start'
          ? M
          : u === 'end'
            ? M - I
            : u === 'nearest'
              ? Rr(m, m + I, I, J, ee, m + M, m + M + v, v)
              : M - I / 2),
        (ae =
          c === 'start'
            ? N
            : c === 'center'
              ? N - b / 2
              : c === 'end'
                ? N - b
                : Rr(_, _ + b, b, W, ie, _ + N, _ + N + S, S)),
        (de = Math.max(0, de + m)),
        (ae = Math.max(0, ae + _));
    else {
      (de =
        u === 'start'
          ? M - z - J
          : u === 'end'
            ? M - R + ee + ue
            : u === 'nearest'
              ? Rr(z, R, H, J, ee + ue, M, M + v, v)
              : M - (z + H / 2) + ue / 2),
        (ae =
          c === 'start'
            ? N - F - W
            : c === 'center'
              ? N - (F + U / 2) + ce / 2
              : c === 'end'
                ? N - re + ie + ce
                : Rr(F, re, U, W, ie + ce, N, N + S, S));
      const { scrollLeft: Oe, scrollTop: fe } = X;
      (de = ye === 0 ? 0 : Math.max(0, Math.min(fe + de / ye, X.scrollHeight - H / ye + ue))),
        (ae = Se === 0 ? 0 : Math.max(0, Math.min(Oe + ae / Se, X.scrollWidth - U / Se + ce))),
        (M += fe - de),
        (N += Oe - ae);
    }
    Q.push({ el: X, top: de, left: ae });
  }
  return Q;
}, 'r');

// ../node_modules/tslib/tslib.es6.mjs
let Ft = /* @__PURE__ */ a(function () {
  return (
    (Ft =
      Object.assign ||
      /* @__PURE__ */ a(t => {
        for (let o, i = 1, n = arguments.length; i < n; i++) {
          o = arguments[i];
          for (const r in o) Object.prototype.hasOwnProperty.call(o, r) && (t[r] = o[r]);
        }
        return t;
      }, '__assign')),
    Ft.apply(this, arguments)
  );
}, '__assign');

// ../node_modules/downshift/dist/downshift.esm.js
let ty = 0;
function Zc(e) {
  return typeof e === 'function' ? e : Fe;
}
a(Zc, 'cbToCb');
function Fe() {}
a(Fe, 'noop');
function ip(e, t) {
  if (e) {
    const o = Xc(e, {
      boundary: t,
      block: 'nearest',
      scrollMode: 'if-needed',
    });
    o.forEach(i => {
      const n = i.el;
      const r = i.top;
      const l = i.left;
      (n.scrollTop = r), (n.scrollLeft = l);
    });
  }
}
a(ip, 'scrollIntoView');
function Jc(e, t, o) {
  const i = e === t || (t instanceof o.Node && e.contains && e.contains(t));
  return i;
}
a(Jc, 'isOrContainsNode');
function Yr(e, t) {
  let o;
  function i() {
    o && clearTimeout(o);
  }
  a(i, 'cancel');
  function n() {
    for (let r = arguments.length, l = new Array(r), u = 0; u < r; u++) l[u] = arguments[u];
    i(),
      (o = setTimeout(() => {
        (o = null), e.apply(void 0, l);
      }, t));
  }
  return a(n, 'wrapper'), (n.cancel = i), n;
}
a(Yr, 'debounce');
function le() {
  for (let e = arguments.length, t = new Array(e), o = 0; o < e; o++) t[o] = arguments[o];
  return i => {
    for (let n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), l = 1; l < n; l++)
      r[l - 1] = arguments[l];
    return t.some(
      u => (
        u?.apply(void 0, [i].concat(r)),
        i.preventDownshiftDefault ||
          (i.hasOwnProperty('nativeEvent') && i.nativeEvent.preventDownshiftDefault)
      ),
    );
  };
}
a(le, 'callAllEventHandlers');
function Je() {
  for (let e = arguments.length, t = new Array(e), o = 0; o < e; o++) t[o] = arguments[o];
  return i => {
    t.forEach(n => {
      typeof n === 'function' ? n(i) : n && (n.current = i);
    });
  };
}
a(Je, 'handleRefs');
function sp() {
  return String(ty++);
}
a(sp, 'generateId');
function oy(e) {
  const t = e.isOpen;
  const o = e.resultCount;
  const i = e.previousResultCount;
  return t
    ? o
      ? o !== i
        ? `${o} result${o === 1 ? ' is' : 's are'} available, use up and down arrow keys to navigate. Press Enter ke\
y to select.`
        : ''
      : 'No results are available.'
    : '';
}
a(oy, 'getA11yStatusMessage');
function ep(e, t) {
  return (e = Array.isArray(e) ? /* istanbul ignore next (preact) */ e[0] : e), !e && t ? t : e;
}
a(ep, 'unwrapArray');
function ry(e) {
  return typeof e.type === 'string';
}
a(ry, 'isDOMElement');
function ny(e) {
  return e.props;
}
a(ny, 'getElementProps');
const iy = ['highlightedIndex', 'inputValue', 'isOpen', 'selectedItem', 'type'];
function Fr(e) {
  e === void 0 && (e = {});
  const t = {};
  return (
    iy.forEach(o => {
      e.hasOwnProperty(o) && (t[o] = e[o]);
    }),
    t
  );
}
a(Fr, 'pickState');
function _o(e, t) {
  return !e || !t ? e : Object.keys(e).reduce((o, i) => ((o[i] = jr(t, i) ? t[i] : e[i]), o), {});
}
a(_o, 'getState');
function jr(e, t) {
  return e[t] !== void 0;
}
a(jr, 'isControlledProp');
function to(e) {
  const t = e.key;
  const o = e.keyCode;
  return o >= 37 && o <= 40 && t.indexOf('Arrow') !== 0 ? `Arrow${t}` : t;
}
a(to, 'normalizeArrowKey');
function et(e, t, o, i, n) {
  n === void 0 && (n = !1);
  const r = o.length;
  if (r === 0) return -1;
  const l = r - 1;
  (typeof e !== 'number' || e < 0 || e > l) && (e = t > 0 ? -1 : l + 1);
  let u = e + t;
  u < 0 ? (u = n ? l : 0) : u > l && (u = n ? 0 : l);
  const c = xt(u, t < 0, o, i, n);
  return c === -1 ? (e >= r ? -1 : e) : c;
}
a(et, 'getHighlightedIndex');
function xt(e, t, o, i, n) {
  n === void 0 && (n = !1);
  const r = o.length;
  if (t) {
    for (let l = e; l >= 0; l--) if (!i(o[l], l)) return l;
  } else for (let u = e; u < r; u++) if (!i(o[u], u)) return u;
  return n ? xt(t ? r - 1 : 0, t, o, i) : -1;
}
a(xt, 'getNonDisabledIndex');
function Vr(e, t, o, i) {
  return (
    i === void 0 && (i = !0),
    o && t.some(n => n && (Jc(n, e, o) || (i && Jc(n, o.document.activeElement, o))))
  );
}
a(Vr, 'targetWithinDownshift');
const sy = Yr(e => {
  ap(e).textContent = '';
}, 500);
function ap(e) {
  let t = e.getElementById('a11y-status-message');
  return (
    t ||
    ((t = e.createElement('div')),
    t.setAttribute('id', 'a11y-status-message'),
    t.setAttribute('role', 'status'),
    t.setAttribute(
      'ar\
ia-live',
      'polite',
    ),
    t.setAttribute('aria-relevant', 'additions text'),
    Object.assign(t.style, {
      border: '0',
      clip: 'rect(0 0 0 0)',
      height: '1px',
      margin: '-1px',
      overflow: 'hidden',
      padding: '0',
      position: 'absolute',
      width: '1px',
    }),
    e.body.appendChild(t),
    t)
  );
}
a(ap, 'getStatusDiv');
function lp(e, t) {
  if (!(!e || !t)) {
    const o = ap(t);
    (o.textContent = e), sy(t);
  }
}
a(lp, 'setStatus');
function ay(e) {
  const t = e?.getElementById('a11y-status-message');
  t?.remove();
}
a(ay, 'cleanupStatusDiv');
const up = 0;
const cp = 1;
const pp = 2;
const Hr = 3;
const Br = 4;
const dp = 5;
const fp = 6;
const mp = 7;
const hp = 8;
const gp = 9;
const yp = 10;
const bp = 11;
const vp = 12;
const xp = 13;
const Sp = 14;
const Ip = 15;
const Ep = 16;
const ly = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  unknown: up,
  mouseUp: cp,
  itemMouseEnter: pp,
  keyDownArrowUp: Hr,
  keyDownArrowDown: Br,
  keyDownEscape: dp,
  keyDownEnter: fp,
  keyDownHome: mp,
  keyDownEnd: hp,
  clickItem: gp,
  blurInput: yp,
  changeInput: bp,
  keyDownSpaceButton: vp,
  clickButton: xp,
  blurButton: Sp,
  controlledPropUpdatedSelectedItem: Ip,
  touchEnd: Ep,
});
const uy = ['refKey', 'ref'];
const cy = ['onClick', 'onPress', 'onKeyDown', 'onKeyUp', 'onBlur'];
const py = ['onKeyDown', 'onBlur', 'onChange', 'onInput', 'onChangeText'];
const dy = ['refKey', 'ref'];
const fy = ['onMouseMove', 'onMouseDown', 'onClick', 'onPress', 'index', 'item'];
const my = /* @__PURE__ */ (() => {
  const e = /* @__PURE__ */ (t => {
    function o(n) {
      let r;
      (r = t.call(this, n) || this),
        (r.id = r.props.id || `downshift-${sp()}`),
        (r.menuId = r.props.menuId || `${r.id}-menu`),
        (r.labelId = r.props.labelId || `${r.id}-label`),
        (r.inputId = r.props.inputId || `${r.id}-input`),
        (r.getItemId = r.props.getItemId || (m => `${r.id}-item-${m}`)),
        (r.items = []),
        (r.itemCount = null),
        (r.previousResultCount = 0),
        (r.timeoutIds = []),
        (r.internalSetTimeout = (m, v) => {
          const S = setTimeout(() => {
            (r.timeoutIds = r.timeoutIds.filter(E => E !== S)), m();
          }, v);
          r.timeoutIds.push(S);
        }),
        (r.setItemCount = m => {
          r.itemCount = m;
        }),
        (r.unsetItemCount = () => {
          r.itemCount = null;
        }),
        (r.isItemDisabled = (m, v) => {
          const S = r.getItemNodeFromIndex(v);
          return S?.hasAttribute('disabled');
        }),
        (r.setHighlightedIndex = (m, v) => {
          m === void 0 && (m = r.props.defaultHighlightedIndex),
            v === void 0 && (v = {}),
            (v = Fr(v)),
            r.internalSetState(
              G(
                {
                  highlightedIndex: m,
                },
                v,
              ),
            );
        }),
        (r.clearSelection = m => {
          r.internalSetState(
            {
              selectedItem: null,
              inputValue: '',
              highlightedIndex: r.props.defaultHighlightedIndex,
              isOpen: r.props.defaultIsOpen,
            },
            m,
          );
        }),
        (r.selectItem = (m, v, S) => {
          (v = Fr(v)),
            r.internalSetState(
              G(
                {
                  isOpen: r.props.defaultIsOpen,
                  highlightedIndex: r.props.defaultHighlightedIndex,
                  selectedItem: m,
                  inputValue: r.props.itemToString(m),
                },
                v,
              ),
              S,
            );
        }),
        (r.selectItemAtIndex = (m, v, S) => {
          const E = r.items[m];
          E != null && r.selectItem(E, v, S);
        }),
        (r.selectHighlightedItem = (m, v) =>
          r.selectItemAtIndex(r.getState().highlightedIndex, m, v)),
        (r.internalSetState = (m, v) => {
          let S;
          let E;
          const T = {};
          const C = typeof m === 'function';
          return (
            !C &&
              m.hasOwnProperty('inputValue') &&
              r.props.onInputValueChange(m.inputValue, G({}, r.getStateAndHelpers(), m)),
            r.setState(
              k => {
                let w;
                k = r.getState(k);
                let O = C ? m(k) : m;
                (O = r.props.stateReducer(k, O)), (S = O.hasOwnProperty('selectedItem'));
                const P = {};
                return (
                  S && O.selectedItem !== k.selectedItem && (E = O.selectedItem),
                  (w = O).type || (w.type = up),
                  Object.keys(O).forEach(D => {
                    k[D] !== O[D] && (T[D] = O[D]),
                      D !== 'type' && (O[D], jr(r.props, D) || (P[D] = O[D]));
                  }),
                  C &&
                    O.hasOwnProperty('inputValue') &&
                    r.props.onInputValueChange(O.inputValue, G({}, r.getStateAndHelpers(), O)),
                  P
                );
              },
              () => {
                Zc(v)();
                const k = Object.keys(T).length > 1;
                k && r.props.onStateChange(T, r.getStateAndHelpers()),
                  S && r.props.onSelect(m.selectedItem, r.getStateAndHelpers()),
                  E !== void 0 && r.props.onChange(E, r.getStateAndHelpers()),
                  r.props.onUserAction(T, r.getStateAndHelpers());
              },
            )
          );
        }),
        (r.rootRef = m => (r._rootNode = m)),
        (r.getRootProps = (m, v) => {
          let S;
          const E = m === void 0 ? {} : m;
          const T = E.refKey;
          const C = T === void 0 ? 'ref' : T;
          const k = E.ref;
          const w = ke(E, uy);
          const O = v === void 0 ? {} : v;
          const P = O.suppressRefError;
          const D = P === void 0 ? !1 : P;
          (r.getRootProps.called = !0),
            (r.getRootProps.refKey = C),
            (r.getRootProps.suppressRefError = D);
          const M = r.getState();
          const N = M.isOpen;
          return G(
            ((S = {}),
            (S[C] = Je(k, r.rootRef)),
            (S.role = 'combobox'),
            (S['aria-expanded'] = N),
            (S['aria-haspopup'] = 'listbox'),
            (S['aria-owns'] = N ? r.menuId : void 0),
            (S['aria-labelledby'] = r.labelId),
            S),
            w,
          );
        }),
        (r.keyDownHandlers = {
          ArrowDown: /* @__PURE__ */ a(function (v) {
            if ((v.preventDefault(), this.getState().isOpen)) {
              const E = v.shiftKey ? 5 : 1;
              this.moveHighlightedIndex(E, {
                type: Br,
              });
            } else
              this.internalSetState(
                {
                  isOpen: !0,
                  type: Br,
                },
                () => {
                  const T = this.getItemCount();
                  if (T > 0) {
                    const C = this.getState();
                    const k = C.highlightedIndex;
                    const w = et(
                      k,
                      1,
                      {
                        length: T,
                      },
                      this.isItemDisabled,
                      !0,
                    );
                    this.setHighlightedIndex(w, {
                      type: Br,
                    });
                  }
                },
              );
          }, 'ArrowDown'),
          ArrowUp: /* @__PURE__ */ a(function (v) {
            if ((v.preventDefault(), this.getState().isOpen)) {
              const E = v.shiftKey ? -5 : -1;
              this.moveHighlightedIndex(E, {
                type: Hr,
              });
            } else
              this.internalSetState(
                {
                  isOpen: !0,
                  type: Hr,
                },
                () => {
                  const T = this.getItemCount();
                  if (T > 0) {
                    const C = this.getState();
                    const k = C.highlightedIndex;
                    const w = et(
                      k,
                      -1,
                      {
                        length: T,
                      },
                      this.isItemDisabled,
                      !0,
                    );
                    this.setHighlightedIndex(w, {
                      type: Hr,
                    });
                  }
                },
              );
          }, 'ArrowUp'),
          Enter: /* @__PURE__ */ a(function (v) {
            if (v.which !== 229) {
              const S = this.getState();
              const E = S.isOpen;
              const T = S.highlightedIndex;
              if (E && T != null) {
                v.preventDefault();
                const C = this.items[T];
                const k = this.getItemNodeFromIndex(T);
                if (C == null || k?.hasAttribute('disabled')) return;
                this.selectHighlightedItem({
                  type: fp,
                });
              }
            }
          }, 'Enter'),
          Escape: /* @__PURE__ */ a(function (v) {
            v.preventDefault(),
              this.reset(
                G(
                  {
                    type: dp,
                  },
                  !this.state.isOpen && {
                    selectedItem: null,
                    inputValue: '',
                  },
                ),
              );
          }, 'Escape'),
        }),
        (r.buttonKeyDownHandlers = G({}, r.keyDownHandlers, {
          ' ': /* @__PURE__ */ a(function (v) {
            v.preventDefault(),
              this.toggleMenu({
                type: vp,
              });
          }, '_'),
        })),
        (r.inputKeyDownHandlers = G({}, r.keyDownHandlers, {
          Home: /* @__PURE__ */ a(function (v) {
            const S = this.getState();
            const E = S.isOpen;
            if (E) {
              v.preventDefault();
              const T = this.getItemCount();
              if (!(T <= 0 || !E)) {
                const C = xt(
                  0,
                  !1,
                  {
                    length: T,
                  },
                  this.isItemDisabled,
                );
                this.setHighlightedIndex(C, {
                  type: mp,
                });
              }
            }
          }, 'Home'),
          End: /* @__PURE__ */ a(function (v) {
            const S = this.getState();
            const E = S.isOpen;
            if (E) {
              v.preventDefault();
              const T = this.getItemCount();
              if (!(T <= 0 || !E)) {
                const C = xt(
                  T - 1,
                  !0,
                  {
                    length: T,
                  },
                  this.isItemDisabled,
                );
                this.setHighlightedIndex(C, {
                  type: hp,
                });
              }
            }
          }, 'End'),
        })),
        (r.getToggleButtonProps = m => {
          const v = m === void 0 ? {} : m;
          const S = v.onClick;
          v.onPress;
          const E = v.onKeyDown;
          const T = v.onKeyUp;
          const C = v.onBlur;
          const k = ke(v, cy);
          const w = r.getState();
          const O = w.isOpen;
          const P = {
            onClick: le(S, r.buttonHandleClick),
            onKeyDown: le(E, r.buttonHandleKeyDown),
            onKeyUp: le(T, r.buttonHandleKeyUp),
            onBlur: le(C, r.buttonHandleBlur),
          };
          const D = k.disabled ? {} : P;
          return G(
            {
              type: 'button',
              role: 'button',
              'aria-label': O ? 'close menu' : 'open menu',
              'aria-haspopup': !0,
              'data-toggle': !0,
            },
            D,
            k,
          );
        }),
        (r.buttonHandleKeyUp = m => {
          m.preventDefault();
        }),
        (r.buttonHandleKeyDown = m => {
          const v = to(m);
          r.buttonKeyDownHandlers[v]?.call(r, m);
        }),
        (r.buttonHandleClick = m => {
          if ((m.preventDefault(), r.props.environment)) {
            const v = r.props.environment.document;
            const S = v.body;
            const E = v.activeElement;
            S && S === E && m.target.focus();
          }
          r.internalSetTimeout(() =>
            r.toggleMenu({
              type: xp,
            }),
          );
        }),
        (r.buttonHandleBlur = m => {
          const v = m.target;
          r.internalSetTimeout(() => {
            if (!(r.isMouseDown || !r.props.environment)) {
              const S = r.props.environment.document.activeElement;
              (S == null || S.id !== r.inputId) &&
                S !== v &&
                r.reset({
                  type: Sp,
                });
            }
          });
        }),
        (r.getLabelProps = m =>
          G(
            {
              htmlFor: r.inputId,
              id: r.labelId,
            },
            m,
          )),
        (r.getInputProps = m => {
          const v = m === void 0 ? {} : m;
          const S = v.onKeyDown;
          const E = v.onBlur;
          const T = v.onChange;
          const C = v.onInput;
          v.onChangeText;
          const k = ke(v, py);
          let w;
          let O = {};
          w = 'onChange';
          const P = r.getState();
          const D = P.inputValue;
          const M = P.isOpen;
          const N = P.highlightedIndex;
          if (!k.disabled) {
            let Q;
            O =
              ((Q = {}),
              (Q[w] = le(T, C, r.inputHandleChange)),
              (Q.onKeyDown = le(S, r.inputHandleKeyDown)),
              (Q.onBlur = le(E, r.inputHandleBlur)),
              Q);
          }
          return G(
            {
              'aria-autocomplete': 'list',
              'aria-activedescendant':
                M && typeof N === 'number' && N >= 0 ? r.getItemId(N) : void 0,
              'aria-controls': M ? r.menuId : void 0,
              'aria-labelledby': k?.['aria-label'] ? void 0 : r.labelId,
              // https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
              // revert back since autocomplete="nope" is ignored on latest Chrome and Opera
              autoComplete: 'off',
              value: D,
              id: r.inputId,
            },
            O,
            k,
          );
        }),
        (r.inputHandleKeyDown = m => {
          const v = to(m);
          v && r.inputKeyDownHandlers[v] && r.inputKeyDownHandlers[v].call(r, m);
        }),
        (r.inputHandleChange = m => {
          r.internalSetState({
            type: bp,
            isOpen: !0,
            inputValue: m.target.value,
            highlightedIndex: r.props.defaultHighlightedIndex,
          });
        }),
        (r.inputHandleBlur = () => {
          r.internalSetTimeout(() => {
            let m;
            if (!(r.isMouseDown || !r.props.environment)) {
              const v = r.props.environment.document.activeElement;
              const S =
                (v == null || (m = v.dataset) == null ? void 0 : m.toggle) &&
                r._rootNode &&
                r._rootNode.contains(v);
              S ||
                r.reset({
                  type: yp,
                });
            }
          });
        }),
        (r.menuRef = m => {
          r._menuNode = m;
        }),
        (r.getMenuProps = (m, v) => {
          let S;
          const E = m === void 0 ? {} : m;
          const T = E.refKey;
          const C = T === void 0 ? 'ref' : T;
          const k = E.ref;
          const w = ke(E, dy);
          const O = v === void 0 ? {} : v;
          const P = O.suppressRefError;
          const D = P === void 0 ? !1 : P;
          return (
            (r.getMenuProps.called = !0),
            (r.getMenuProps.refKey = C),
            (r.getMenuProps.suppressRefError = D),
            G(
              ((S = {}),
              (S[C] = Je(k, r.menuRef)),
              (S.role = 'listbox'),
              (S['aria-labelledby'] = w?.['aria-label'] ? void 0 : r.labelId),
              (S.id = r.menuId),
              S),
              w,
            )
          );
        }),
        (r.getItemProps = m => {
          let v;
          const S = m === void 0 ? {} : m;
          const E = S.onMouseMove;
          const T = S.onMouseDown;
          const C = S.onClick;
          S.onPress;
          let k = S.index;
          const w = S.item;
          const O = w === void 0 ? /* istanbul ignore next */ void 0 : w;
          const P = ke(S, fy);
          k === void 0 ? (r.items.push(O), (k = r.items.indexOf(O))) : (r.items[k] = O);
          const D = 'onClick';
          const M = C;
          const N =
            ((v = {
              // onMouseMove is used over onMouseEnter here. onMouseMove
              // is only triggered on actual mouse movement while onMouseEnter
              // can fire on DOM changes, interrupting keyboard navigation
              onMouseMove: le(E, () => {
                k !== r.getState().highlightedIndex &&
                  (r.setHighlightedIndex(k, {
                    type: pp,
                  }),
                  (r.avoidScrolling = !0),
                  r.internalSetTimeout(() => (r.avoidScrolling = !1), 250));
              }),
              onMouseDown: le(T, V => {
                V.preventDefault();
              }),
            }),
            (v[D] = le(M, () => {
              r.selectItemAtIndex(k, {
                type: gp,
              });
            })),
            v);
          const Q = P.disabled
            ? {
                onMouseDown: N.onMouseDown,
              }
            : N;
          return G(
            {
              id: r.getItemId(k),
              role: 'option',
              'aria-selected': r.getState().highlightedIndex === k,
            },
            Q,
            P,
          );
        }),
        (r.clearItems = () => {
          r.items = [];
        }),
        (r.reset = (m, v) => {
          m === void 0 && (m = {}),
            (m = Fr(m)),
            r.internalSetState(S => {
              const E = S.selectedItem;
              return G(
                {
                  isOpen: r.props.defaultIsOpen,
                  highlightedIndex: r.props.defaultHighlightedIndex,
                  inputValue: r.props.itemToString(E),
                },
                m,
              );
            }, v);
        }),
        (r.toggleMenu = (m, v) => {
          m === void 0 && (m = {}),
            (m = Fr(m)),
            r.internalSetState(
              S => {
                const E = S.isOpen;
                return G(
                  {
                    isOpen: !E,
                  },
                  E && {
                    highlightedIndex: r.props.defaultHighlightedIndex,
                  },
                  m,
                );
              },
              () => {
                const S = r.getState();
                const E = S.isOpen;
                const T = S.highlightedIndex;
                E && r.getItemCount() > 0 && typeof T === 'number' && r.setHighlightedIndex(T, m),
                  Zc(v)();
              },
            );
        }),
        (r.openMenu = m => {
          r.internalSetState(
            {
              isOpen: !0,
            },
            m,
          );
        }),
        (r.closeMenu = m => {
          r.internalSetState(
            {
              isOpen: !1,
            },
            m,
          );
        }),
        (r.updateStatus = Yr(() => {
          let m;
          if ((m = r.props) != null && (m = m.environment) != null && m.document) {
            const v = r.getState();
            const S = r.items[v.highlightedIndex];
            const E = r.getItemCount();
            const T = r.props.getA11yStatusMessage(
              G(
                {
                  itemToString: r.props.itemToString,
                  previousResultCount: r.previousResultCount,
                  resultCount: E,
                  highlightedItem: S,
                },
                v,
              ),
            );
            (r.previousResultCount = E), lp(T, r.props.environment.document);
          }
        }, 200));
      const l = r.props;
      const u = l.defaultHighlightedIndex;
      const c = l.initialHighlightedIndex;
      const p = c === void 0 ? u : c;
      const d = l.defaultIsOpen;
      const g = l.initialIsOpen;
      const h = g === void 0 ? d : g;
      const y = l.initialInputValue;
      const f = y === void 0 ? '' : y;
      const b = l.initialSelectedItem;
      const I = b === void 0 ? null : b;
      const _ = r.getState({
        highlightedIndex: p,
        isOpen: h,
        inputValue: f,
        selectedItem: I,
      });
      return (
        _.selectedItem != null &&
          r.props.initialInputValue === void 0 &&
          (_.inputValue = r.props.itemToString(_.selectedItem)),
        (r.state = _),
        r
      );
    }
    a(o, 'Downshift'), Xt(o, t);
    const i = o.prototype;
    return (
      (i.internalClearTimeouts = /* @__PURE__ */ a(function () {
        this.timeoutIds.forEach(r => {
          clearTimeout(r);
        }),
          (this.timeoutIds = []);
      }, 'internalClearTimeouts')),
      (i.getState = /* @__PURE__ */ a(function (r) {
        return r === void 0 && (r = this.state), _o(r, this.props);
      }, 'getState$1')),
      (i.getItemCount = /* @__PURE__ */ a(function () {
        let r = this.items.length;
        return (
          this.itemCount != null
            ? (r = this.itemCount)
            : this.props.itemCount !== void 0 && (r = this.props.itemCount),
          r
        );
      }, 'getItemCount')),
      (i.getItemNodeFromIndex = /* @__PURE__ */ a(function (r) {
        return this.props.environment
          ? this.props.environment.document.getElementById(this.getItemId(r))
          : null;
      }, 'getItemNodeFromIndex')),
      (i.scrollHighlightedItemIntoView = /* @__PURE__ */ a(function () {
        const r = this.getItemNodeFromIndex(this.getState().highlightedIndex);
        this.props.scrollIntoView(r, this._menuNode);
      }, 'scrollHighlightedItemIntoView')),
      (i.moveHighlightedIndex = /* @__PURE__ */ a(function (r, l) {
        const u = this.getItemCount();
        const c = this.getState();
        const p = c.highlightedIndex;
        if (u > 0) {
          const d = et(
            p,
            r,
            {
              length: u,
            },
            this.isItemDisabled,
            !0,
          );
          this.setHighlightedIndex(d, l);
        }
      }, 'moveHighlightedIndex')),
      (i.getStateAndHelpers = /* @__PURE__ */ a(function () {
        const r = this.getState();
        const l = r.highlightedIndex;
        const u = r.inputValue;
        const c = r.selectedItem;
        const p = r.isOpen;
        const d = this.props.itemToString;
        const g = this.id;
        const h = this.getRootProps;
        const y = this.getToggleButtonProps;
        const f = this.getLabelProps;
        const b = this.getMenuProps;
        const I = this.getInputProps;
        const _ = this.getItemProps;
        const m = this.openMenu;
        const v = this.closeMenu;
        const S = this.toggleMenu;
        const E = this.selectItem;
        const T = this.selectItemAtIndex;
        const C = this.selectHighlightedItem;
        const k = this.setHighlightedIndex;
        const w = this.clearSelection;
        const O = this.clearItems;
        const P = this.reset;
        const D = this.setItemCount;
        const M = this.unsetItemCount;
        const N = this.internalSetState;
        return {
          // prop getters
          getRootProps: h,
          getToggleButtonProps: y,
          getLabelProps: f,
          getMenuProps: b,
          getInputProps: I,
          getItemProps: _,
          // actions
          reset: P,
          openMenu: m,
          closeMenu: v,
          toggleMenu: S,
          selectItem: E,
          selectItemAtIndex: T,
          selectHighlightedItem: C,
          setHighlightedIndex: k,
          clearSelection: w,
          clearItems: O,
          setItemCount: D,
          unsetItemCount: M,
          setState: N,
          // props
          itemToString: d,
          // derived
          id: g,
          // state
          highlightedIndex: l,
          inputValue: u,
          isOpen: p,
          selectedItem: c,
        };
      }, 'getStateAndHelpers')),
      (i.componentDidMount = /* @__PURE__ */ a(function () {
        if (!this.props.environment)
          this.cleanup = () => {
            this.internalClearTimeouts();
          };
        else {
          const l = /* @__PURE__ */ a(() => {
            this.isMouseDown = !0;
          }, 'onMouseDown');
          const u = /* @__PURE__ */ a(y => {
            this.isMouseDown = !1;
            const f = Vr(y.target, [this._rootNode, this._menuNode], this.props.environment);
            !f &&
              this.getState().isOpen &&
              this.reset(
                {
                  type: cp,
                },
                () => this.props.onOuterClick(this.getStateAndHelpers()),
              );
          }, 'onMouseUp');
          const c = /* @__PURE__ */ a(() => {
            this.isTouchMove = !1;
          }, 'onTouchStart');
          const p = /* @__PURE__ */ a(() => {
            this.isTouchMove = !0;
          }, 'onTouchMove');
          const d = /* @__PURE__ */ a(y => {
            const f = Vr(y.target, [this._rootNode, this._menuNode], this.props.environment, !1);
            !this.isTouchMove &&
              !f &&
              this.getState().isOpen &&
              this.reset(
                {
                  type: Ep,
                },
                () => this.props.onOuterClick(this.getStateAndHelpers()),
              );
          }, 'onTouchEnd');
          const g = this.props.environment;
          g.addEventListener('mousedown', l),
            g.addEventListener('mouseup', u),
            g.addEventListener('touchstart', c),
            g.addEventListener(
              'touch\
move',
              p,
            ),
            g.addEventListener('touchend', d),
            (this.cleanup = () => {
              this.internalClearTimeouts(),
                this.updateStatus.cancel(),
                g.removeEventListener('mousedown', l),
                g.removeEventListener('mouseup', u),
                g.removeEventListener('touchstart', c),
                g.removeEventListener('touchmove', p),
                g.removeEventListener('touchend', d);
            });
        }
      }, 'componentDidMount')),
      (i.shouldScroll = /* @__PURE__ */ a(function (r, l) {
        const u = this.props.highlightedIndex === void 0 ? this.getState() : this.props;
        const c = u.highlightedIndex;
        const p = l.highlightedIndex === void 0 ? r : l;
        const d = p.highlightedIndex;
        const g = c && this.getState().isOpen && !r.isOpen;
        const h = c !== d;
        return g || h;
      }, 'shouldScroll')),
      (i.componentDidUpdate = /* @__PURE__ */ a(function (r, l) {
        jr(this.props, 'selectedItem') &&
          this.props.selectedItemChanged(r.selectedItem, this.props.selectedItem) &&
          this.internalSetState({
            type: Ip,
            inputValue: this.props.itemToString(this.props.selectedItem),
          }),
          !this.avoidScrolling && this.shouldScroll(l, r) && this.scrollHighlightedItemIntoView(),
          this.updateStatus();
      }, 'componentDidUpdate')),
      (i.componentWillUnmount = /* @__PURE__ */ a(function () {
        this.cleanup();
      }, 'componentWillUnmount')),
      (i.render = /* @__PURE__ */ a(function () {
        const r = ep(this.props.children, Fe);
        this.clearItems(),
          (this.getRootProps.called = !1),
          (this.getRootProps.refKey = void 0),
          (this.getRootProps.suppressRefError = void 0),
          (this.getMenuProps.called = !1),
          (this.getMenuProps.refKey = void 0),
          (this.getMenuProps.suppressRefError = void 0),
          (this.getLabelProps.called = !1),
          (this.getInputProps.called = !1);
        const l = ep(r(this.getStateAndHelpers()));
        if (!l) return null;
        if (this.getRootProps.called || this.props.suppressRefError) return l;
        if (ry(l)) return /* @__PURE__ */ us(l, this.getRootProps(ny(l)));
      }, 'render')),
      o
    );
  })(Re);
  return (
    (e.defaultProps = {
      defaultHighlightedIndex: null,
      defaultIsOpen: !1,
      getA11yStatusMessage: oy,
      itemToString: /* @__PURE__ */ a(o => (o == null ? '' : String(o)), 'itemToString'),
      onStateChange: Fe,
      onInputValueChange: Fe,
      onUserAction: Fe,
      onChange: Fe,
      onSelect: Fe,
      onOuterClick: Fe,
      selectedItemChanged: /* @__PURE__ */ a((o, i) => o !== i, 'selectedItemChanged'),
      environment:
        /* istanbul ignore next (ssr) */
        typeof window > 'u' ? void 0 : window,
      stateReducer: /* @__PURE__ */ a((o, i) => i, 'stateReducer'),
      suppressRefError: !1,
      scrollIntoView: ip,
    }),
    (e.stateChangeTypes = ly),
    e
  );
})();
const zt = my;
const _p = {
  highlightedIndex: -1,
  isOpen: !1,
  selectedItem: null,
  inputValue: '',
};
function hy(e, t, o) {
  const i = e.props;
  const n = e.type;
  const r = {};
  Object.keys(t).forEach(l => {
    gy(l, e, t, o), o[l] !== t[l] && (r[l] = o[l]);
  }),
    i.onStateChange &&
      Object.keys(r).length &&
      i.onStateChange(
        G(
          {
            type: n,
          },
          r,
        ),
      );
}
a(hy, 'callOnChangeProps');
function gy(e, t, o, i) {
  const n = t.props;
  const r = t.type;
  const l = `on${ui(e)}Change`;
  n[l] &&
    i[e] !== void 0 &&
    i[e] !== o[e] &&
    n[l](
      G(
        {
          type: r,
        },
        i,
      ),
    );
}
a(gy, 'invokeOnChangeHandler');
function yy(e, t) {
  return t.changes;
}
a(yy, 'stateReducer');
const tp = Yr((e, t) => {
  lp(e, t);
}, 200);
const by =
  typeof window < 'u' && typeof window.document < 'u' && typeof window.document.createElement < 'u'
    ? ft
    : j;
const wp =
  'useId' in s
    ? /* @__PURE__ */ a(t => {
        let o = t.id;
        const i = t.labelId;
        const n = t.menuId;
        const r = t.getItemId;
        const l = t.toggleButtonId;
        const u = t.inputId;
        const c = `downshift-${s.useId()}`;
        o || (o = c);
        const p = Y({
          labelId: i || `${o}-label`,
          menuId: n || `${o}-menu`,
          getItemId: r || (d => `${o}-item-${d}`),
          toggleButtonId: l || `${o}-toggle-button`,
          inputId: u || `${o}-input`,
        });
        return p.current;
      }, 'useElementIds')
    : /* @__PURE__ */ a(t => {
        const o = t.id;
        const i = o === void 0 ? `downshift-${sp()}` : o;
        const n = t.labelId;
        const r = t.menuId;
        const l = t.getItemId;
        const u = t.toggleButtonId;
        const c = t.inputId;
        const p = Y({
          labelId: n || `${i}-label`,
          menuId: r || `${i}-menu`,
          getItemId: l || (d => `${i}-item-${d}`),
          toggleButtonId: u || `${i}-toggle-button`,
          inputId: c || `${i}-input`,
        });
        return p.current;
      }, 'useElementIds');
function li(e, t, o, i) {
  let n;
  let r;
  if (e === void 0) {
    if (t === void 0) throw new Error(i);
    (n = o[t]), (r = t);
  } else (r = t === void 0 ? o.indexOf(e) : t), (n = e);
  return [n, r];
}
a(li, 'getItemAndIndex');
function vy(e) {
  return /^\S{1}$/.test(e);
}
a(vy, 'isAcceptedCharacterKey');
function ui(e) {
  return `${e.slice(0, 1).toUpperCase()}${e.slice(1)}`;
}
a(ui, 'capitalizeString');
function qr(e) {
  const t = Y(e);
  return (t.current = e), t;
}
a(qr, 'useLatestRef');
function Tp(e, t, o, i) {
  const n = Y();
  const r = Y();
  const l = A(
    (y, f) => {
      (r.current = f), (y = _o(y, f.props));
      const b = e(y, f);
      const I = f.props.stateReducer(
        y,
        G({}, f, {
          changes: b,
        }),
      );
      return I;
    },
    [e],
  );
  const u = Vt(l, t, o);
  const c = u[0];
  const p = u[1];
  const d = qr(t);
  const g = A(
    y =>
      p(
        G(
          {
            props: d.current,
          },
          y,
        ),
      ),
    [d],
  );
  const h = r.current;
  return (
    j(() => {
      const y = _o(n.current, h?.props);
      const f = h && n.current && !i(y, c);
      f && hy(h, y, c), (n.current = c);
    }, [c, h, i]),
    [c, g]
  );
}
a(Tp, 'useEnhancedReducer');
function Cp(e, t, o, i) {
  const n = Tp(e, t, o, i);
  const r = n[0];
  const l = n[1];
  return [_o(r, t), l];
}
a(Cp, 'useControlledReducer$1');
const Eo = {
  itemToString: /* @__PURE__ */ a(t => (t ? String(t) : ''), 'itemToString'),
  itemToKey: /* @__PURE__ */ a(t => t, 'itemToKey'),
  stateReducer: yy,
  scrollIntoView: ip,
  environment:
    /* istanbul ignore next (ssr) */
    typeof window > 'u' ? void 0 : window,
};
function He(e, t, o) {
  o === void 0 && (o = _p);
  const i = e[`default${ui(t)}`];
  return i !== void 0 ? i : o[t];
}
a(He, 'getDefaultValue$1');
function Ht(e, t, o) {
  o === void 0 && (o = _p);
  const i = e[t];
  if (i !== void 0) return i;
  const n = e[`initial${ui(t)}`];
  return n !== void 0 ? n : He(e, t, o);
}
a(Ht, 'getInitialValue$1');
function kp(e) {
  const t = Ht(e, 'selectedItem');
  const o = Ht(e, 'isOpen');
  const i = Ht(e, 'highlightedIndex');
  const n = Ht(e, 'inputValue');
  return {
    highlightedIndex:
      i < 0 && t && o ? e.items.findIndex(r => e.itemToKey(r) === e.itemToKey(t)) : i,
    isOpen: o,
    selectedItem: t,
    inputValue: n,
  };
}
a(kp, 'getInitialState$2');
function Bt(e, t, o) {
  const i = e.items;
  const n = e.initialHighlightedIndex;
  const r = e.defaultHighlightedIndex;
  const l = e.isItemDisabled;
  const u = e.itemToKey;
  const c = t.selectedItem;
  const p = t.highlightedIndex;
  return i.length === 0
    ? -1
    : n !== void 0 && p === n && !l(i[n])
      ? n
      : r !== void 0 && !l(i[r])
        ? r
        : c
          ? i.findIndex(d => u(c) === u(d))
          : o < 0 && !l(i[i.length - 1])
            ? i.length - 1
            : o > 0 && !l(i[0])
              ? 0
              : -1;
}
a(Bt, 'getHighlightedIndexOnOpen');
function Op(e, t, o) {
  const i = Y({
    isMouseDown: !1,
    isTouchMove: !1,
    isTouchEnd: !1,
  });
  return (
    j(() => {
      if (!e) return Fe;
      const n = t.map(d => d.current);
      function r() {
        (i.current.isTouchEnd = !1), (i.current.isMouseDown = !0);
      }
      a(r, 'onMouseDown');
      function l(d) {
        (i.current.isMouseDown = !1), Vr(d.target, n, e) || o();
      }
      a(l, 'onMouseUp');
      function u() {
        (i.current.isTouchEnd = !1), (i.current.isTouchMove = !1);
      }
      a(u, 'onTouchStart');
      function c() {
        i.current.isTouchMove = !0;
      }
      a(c, 'onTouchMove');
      function p(d) {
        (i.current.isTouchEnd = !0), !i.current.isTouchMove && !Vr(d.target, n, e, !1) && o();
      }
      return (
        a(p, 'onTouchEnd'),
        e.addEventListener('mousedown', r),
        e.addEventListener('mouseup', l),
        e.addEventListener('touchstart', u),
        e.addEventListener('touchmove', c),
        e.addEventListener('touchend', p),
        /* @__PURE__ */ a(() => {
          e.removeEventListener('mousedown', r),
            e.removeEventListener('mouseup', l),
            e.removeEventListener('touchstart', u),
            e.removeEventListener('touchmove', c),
            e.removeEventListener('touchend', p);
        }, 'cleanup')
      );
    }, [e, o]),
    i.current
  );
}
a(Op, 'useMouseAndTouchTracker');
const ci = /* @__PURE__ */ a(() => Fe, 'useGetterPropsCalledChecker');
function pi(e, t, o, i) {
  i === void 0 && (i = {});
  const n = i.document;
  const r = Qr();
  j(() => {
    if (!(!e || r || !n)) {
      const l = e(t);
      tp(l, n);
    }
  }, o),
    j(
      () => () => {
        tp.cancel(), ay(n);
      },
      [n],
    );
}
a(pi, 'useA11yMessageStatus');
function Pp(e) {
  const t = e.highlightedIndex;
  const o = e.isOpen;
  const i = e.itemRefs;
  const n = e.getItemNodeFromIndex;
  const r = e.menuElement;
  const l = e.scrollIntoView;
  const u = Y(!0);
  return (
    by(() => {
      t < 0 ||
        !o ||
        !Object.keys(i.current).length ||
        (u.current === !1 ? (u.current = !0) : l(n(t), r));
    }, [t]),
    u
  );
}
a(Pp, 'useScrollIntoView');
const di = Fe;
function Kr(e, t, o) {
  let i;
  o === void 0 && (o = !0);
  const n = ((i = e.items) == null ? void 0 : i.length) && t >= 0;
  return G(
    {
      isOpen: !1,
      highlightedIndex: -1,
    },
    n &&
      G(
        {
          selectedItem: e.items[t],
          isOpen: He(e, 'isOpen'),
          highlightedIndex: He(e, 'highlightedIndex'),
        },
        o && {
          inputValue: e.itemToString(e.items[t]),
        },
      ),
  );
}
a(Kr, 'getChangesOnSelection');
function Ap(e, t) {
  return (
    e.isOpen === t.isOpen &&
    e.inputValue === t.inputValue &&
    e.highlightedIndex === t.highlightedIndex &&
    e.selectedItem === t.selectedItem
  );
}
a(Ap, 'isDropdownsStateEqual');
function Qr() {
  const e = s.useRef(!0);
  return (
    s.useEffect(
      () => (
        (e.current = !1),
        () => {
          e.current = !0;
        }
      ),
      [],
    ),
    e.current
  );
}
a(Qr, 'useIsInitialMount');
const zr = {
  environment: q.default.shape({
    addEventListener: q.default.func.isRequired,
    removeEventListener: q.default.func.isRequired,
    document: q.default.shape({
      createElement: q.default.func.isRequired,
      getElementById: q.default.func.isRequired,
      activeElement: q.default.any.isRequired,
      body: q.default.any.isRequired,
    }).isRequired,
    Node: q.default.func.isRequired,
  }),
  itemToString: q.default.func,
  itemToKey: q.default.func,
  stateReducer: q.default.func,
};
const Dp = G({}, zr, {
  getA11yStatusMessage: q.default.func,
  highlightedIndex: q.default.number,
  defaultHighlightedIndex: q.default.number,
  initialHighlightedIndex: q.default.number,
  isOpen: q.default.bool,
  defaultIsOpen: q.default.bool,
  initialIsOpen: q.default.bool,
  selectedItem: q.default.any,
  initialSelectedItem: q.default.any,
  defaultSelectedItem: q.default.any,
  id: q.default.string,
  labelId: q.default.string,
  menuId: q.default.string,
  getItemId: q.default.func,
  toggleButtonId: q.default.string,
  onSelectedItemChange: q.default.func,
  onHighlightedIndexChange: q.default.func,
  onStateChange: q.default.func,
  onIsOpenChange: q.default.func,
  scrollIntoView: q.default.func,
});
function Mp(e, t, o) {
  const i = t.type;
  const n = t.props;
  let r;
  switch (i) {
    case o.ItemMouseMove:
      r = {
        highlightedIndex: t.disabled ? -1 : t.index,
      };
      break;
    case o.MenuMouseLeave:
      r = {
        highlightedIndex: -1,
      };
      break;
    case o.ToggleButtonClick:
    case o.FunctionToggleMenu:
      r = {
        isOpen: !e.isOpen,
        highlightedIndex: e.isOpen ? -1 : Bt(n, e, 0),
      };
      break;
    case o.FunctionOpenMenu:
      r = {
        isOpen: !0,
        highlightedIndex: Bt(n, e, 0),
      };
      break;
    case o.FunctionCloseMenu:
      r = {
        isOpen: !1,
      };
      break;
    case o.FunctionSetHighlightedIndex:
      r = {
        highlightedIndex: t.highlightedIndex,
      };
      break;
    case o.FunctionSetInputValue:
      r = {
        inputValue: t.inputValue,
      };
      break;
    case o.FunctionReset:
      r = {
        highlightedIndex: He(n, 'highlightedIndex'),
        isOpen: He(n, 'isOpen'),
        selectedItem: He(n, 'selectedItem'),
        inputValue: He(n, 'inputValue'),
      };
      break;
    default:
      throw new Error('Reducer called without proper action type.');
  }
  return G({}, e, r);
}
a(Mp, 'downshiftCommonReducer');
function xy(e) {
  for (
    let t = e.keysSoFar,
      o = e.highlightedIndex,
      i = e.items,
      n = e.itemToString,
      r = e.isItemDisabled,
      l = t.toLowerCase(),
      u = 0;
    u < i.length;
    u++
  ) {
    const c = (u + o + (t.length < 2 ? 1 : 0)) % i.length;
    const p = i[c];
    if (p !== void 0 && n(p).toLowerCase().startsWith(l) && !r(p, c)) return c;
  }
  return o;
}
a(xy, 'getItemIndexByCharacterKey');
const fR = Ft(Ft({}, Dp), { items: q.default.array.isRequired, isItemDisabled: q.default.func });
const Sy = Ft(Ft({}, Eo), { isItemDisabled: /* @__PURE__ */ a(() => !1, 'isItemDisabled') });
const Iy = Fe;
const Wr = 0;
const fi = 1;
const mi = 2;
const $r = 3;
const hi = 4;
const gi = 5;
const yi = 6;
const bi = 7;
const vi = 8;
const xi = 9;
const Si = 10;
const Ur = 11;
const Lp = 12;
const Np = 13;
const Ii = 14;
const Rp = 15;
const Fp = 16;
const Hp = 17;
const Bp = 18;
const Ei = 19;
const ai = 20;
const zp = 21;
const Wp = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ToggleButtonClick: Wr,
  ToggleButtonKeyDownArrowDown: fi,
  ToggleButtonKeyDownArrowUp: mi,
  ToggleButtonKeyDownCharacter: $r,
  ToggleButtonKeyDownEscape: hi,
  ToggleButtonKeyDownHome: gi,
  ToggleButtonKeyDownEnd: yi,
  ToggleButtonKeyDownEnter: bi,
  ToggleButtonKeyDownSpaceButton: vi,
  ToggleButtonKeyDownPageUp: xi,
  ToggleButtonKeyDownPageDown: Si,
  ToggleButtonBlur: Ur,
  MenuMouseLeave: Lp,
  ItemMouseMove: Np,
  ItemClick: Ii,
  FunctionToggleMenu: Rp,
  FunctionOpenMenu: Fp,
  FunctionCloseMenu: Hp,
  FunctionSetHighlightedIndex: Bp,
  FunctionSelectItem: Ei,
  FunctionSetInputValue: ai,
  FunctionReset: zp,
});
function Ey(e, t) {
  let o;
  const i = t.type;
  const n = t.props;
  const r = t.altKey;
  let l;
  switch (i) {
    case Ii:
      l = {
        isOpen: He(n, 'isOpen'),
        highlightedIndex: He(n, 'highlightedIndex'),
        selectedItem: n.items[t.index],
      };
      break;
    case $r:
      {
        const u = t.key;
        const c = `${e.inputValue}${u}`;
        const p =
          !e.isOpen && e.selectedItem
            ? n.items.findIndex(y => n.itemToKey(y) === n.itemToKey(e.selectedItem))
            : e.highlightedIndex;
        const d = xy({
          keysSoFar: c,
          highlightedIndex: p,
          items: n.items,
          itemToString: n.itemToString,
          isItemDisabled: n.isItemDisabled,
        });
        l = {
          inputValue: c,
          highlightedIndex: d,
          isOpen: !0,
        };
      }
      break;
    case fi:
      {
        const g = e.isOpen
          ? et(e.highlightedIndex, 1, n.items, n.isItemDisabled)
          : r && e.selectedItem == null
            ? -1
            : Bt(n, e, 1);
        l = {
          highlightedIndex: g,
          isOpen: !0,
        };
      }
      break;
    case mi:
      if (e.isOpen && r) l = Kr(n, e.highlightedIndex, !1);
      else {
        const h = e.isOpen ? et(e.highlightedIndex, -1, n.items, n.isItemDisabled) : Bt(n, e, -1);
        l = {
          highlightedIndex: h,
          isOpen: !0,
        };
      }
      break;
    // only triggered when menu is open.
    case bi:
    case vi:
      l = Kr(n, e.highlightedIndex, !1);
      break;
    case gi:
      l = {
        highlightedIndex: xt(0, !1, n.items, n.isItemDisabled),
        isOpen: !0,
      };
      break;
    case yi:
      l = {
        highlightedIndex: xt(n.items.length - 1, !0, n.items, n.isItemDisabled),
        isOpen: !0,
      };
      break;
    case xi:
      l = {
        highlightedIndex: et(e.highlightedIndex, -10, n.items, n.isItemDisabled),
      };
      break;
    case Si:
      l = {
        highlightedIndex: et(e.highlightedIndex, 10, n.items, n.isItemDisabled),
      };
      break;
    case hi:
      l = {
        isOpen: !1,
        highlightedIndex: -1,
      };
      break;
    case Ur:
      l = G(
        {
          isOpen: !1,
          highlightedIndex: -1,
        },
        e.highlightedIndex >= 0 &&
          ((o = n.items) == null ? void 0 : o.length) && {
            selectedItem: n.items[e.highlightedIndex],
          },
      );
      break;
    case Ei:
      l = {
        selectedItem: t.selectedItem,
      };
      break;
    default:
      return Mp(e, t, Wp);
  }
  return G({}, e, l);
}
a(Ey, 'downshiftSelectReducer');
const _y = ['onClick'];
const wy = ['onMouseLeave', 'refKey', 'ref'];
const Ty = ['onBlur', 'onClick', 'onPress', 'onKeyDown', 'refKey', 'ref'];
const Cy = [
  'it\
em',
  'index',
  'onMouseMove',
  'onClick',
  'onMouseDown',
  'onPress',
  'refKey',
  'disabled',
  'ref',
];
jp.stateChangeTypes = Wp;
function jp(e) {
  e === void 0 && (e = {}), Iy(e, jp);
  const t = G({}, Sy, e);
  const o = t.scrollIntoView;
  const i = t.environment;
  const n = t.getA11yStatusMessage;
  const r = Cp(Ey, t, kp, Ap);
  const l = r[0];
  const u = r[1];
  const c = l.isOpen;
  const p = l.highlightedIndex;
  const d = l.selectedItem;
  const g = l.inputValue;
  const h = Y(null);
  const y = Y(null);
  const f = Y({});
  const b = Y(null);
  const I = wp(t);
  const _ = qr({
    state: l,
    props: t,
  });
  const m = A(H => f.current[I.getItemId(H)], [I]);
  pi(n, l, [c, p, d, g], i);
  const v = Pp({
    menuElement: y.current,
    highlightedIndex: p,
    isOpen: c,
    itemRefs: f,
    scrollIntoView: o,
    getItemNodeFromIndex: m,
  });
  j(
    () => (
      (b.current = Yr(H => {
        H({
          type: ai,
          inputValue: '',
        });
      }, 500)),
      () => {
        b.current.cancel();
      }
    ),
    [],
  ),
    j(() => {
      g && b.current(u);
    }, [u, g]),
    di({
      props: t,
      state: l,
    }),
    j(() => {
      const H = Ht(t, 'isOpen');
      H && h.current && h.current.focus();
    }, []);
  const S = Op(
    i,
    [h, y],
    A(
      /* @__PURE__ */ a(() => {
        _.current.state.isOpen &&
          u({
            type: Ur,
          });
      }, 'handleBlur'),
      [u, _],
    ),
  );
  const E = ci('getMenuProps', 'getToggleButtonProps');
  j(() => {
    c || (f.current = {});
  }, [c]);
  const T = K(
    () => ({
      ArrowDown: /* @__PURE__ */ a(U => {
        U.preventDefault(),
          u({
            type: fi,
            altKey: U.altKey,
          });
      }, 'ArrowDown'),
      ArrowUp: /* @__PURE__ */ a(U => {
        U.preventDefault(),
          u({
            type: mi,
            altKey: U.altKey,
          });
      }, 'ArrowUp'),
      Home: /* @__PURE__ */ a(U => {
        U.preventDefault(),
          u({
            type: gi,
          });
      }, 'Home'),
      End: /* @__PURE__ */ a(U => {
        U.preventDefault(),
          u({
            type: yi,
          });
      }, 'End'),
      Escape: /* @__PURE__ */ a(() => {
        _.current.state.isOpen &&
          u({
            type: hi,
          });
      }, 'Escape'),
      Enter: /* @__PURE__ */ a(U => {
        U.preventDefault(),
          u({
            type: _.current.state.isOpen ? bi : Wr,
          });
      }, 'Enter'),
      PageUp: /* @__PURE__ */ a(U => {
        _.current.state.isOpen &&
          (U.preventDefault(),
          u({
            type: xi,
          }));
      }, 'PageUp'),
      PageDown: /* @__PURE__ */ a(U => {
        _.current.state.isOpen &&
          (U.preventDefault(),
          u({
            type: Si,
          }));
      }, 'PageDown'),
      ' ': /* @__PURE__ */ a(U => {
        U.preventDefault();
        const z = _.current.state;
        if (!z.isOpen) {
          u({
            type: Wr,
          });
          return;
        }
        z.inputValue
          ? u({
              type: $r,
              key: ' ',
            })
          : u({
              type: vi,
            });
      }, '_'),
    }),
    [u, _],
  );
  const C = A(() => {
    u({
      type: Rp,
    });
  }, [u]);
  const k = A(() => {
    u({
      type: Hp,
    });
  }, [u]);
  const w = A(() => {
    u({
      type: Fp,
    });
  }, [u]);
  const O = A(
    H => {
      u({
        type: Bp,
        highlightedIndex: H,
      });
    },
    [u],
  );
  const P = A(
    H => {
      u({
        type: Ei,
        selectedItem: H,
      });
    },
    [u],
  );
  const D = A(() => {
    u({
      type: zp,
    });
  }, [u]);
  const M = A(
    H => {
      u({
        type: ai,
        inputValue: H,
      });
    },
    [u],
  );
  const N = A(
    H => {
      const U = H === void 0 ? {} : H;
      const z = U.onClick;
      const re = ke(U, _y);
      const R = /* @__PURE__ */ a(() => {
        let L;
        (L = h.current) == null || L.focus();
      }, 'labelHandleClick');
      return G(
        {
          id: I.labelId,
          htmlFor: I.toggleButtonId,
          onClick: le(z, R),
        },
        re,
      );
    },
    [I],
  );
  const Q = A(
    (H, U) => {
      let z;
      const re = H === void 0 ? {} : H;
      const R = re.onMouseLeave;
      const F = re.refKey;
      const L = F === void 0 ? 'ref' : F;
      const W = re.ref;
      const J = ke(re, wy);
      const ie = U === void 0 ? {} : U;
      const ee = ie.suppressRefError;
      const de = ee === void 0 ? !1 : ee;
      const ae = /* @__PURE__ */ a(() => {
        u({
          type: Lp,
        });
      }, 'menuHandleMouseLeave');
      return (
        E('getMenuProps', de, L, y),
        G(
          ((z = {}),
          (z[L] = Je(W, ce => {
            y.current = ce;
          })),
          (z.id = I.menuId),
          (z.role = 'listbox'),
          (z['aria-labelledby'] = J?.['aria-label'] ? void 0 : `${I.labelId}`),
          (z.onMouseLeave = le(R, ae)),
          z),
          J,
        )
      );
    },
    [u, E, I],
  );
  const V = A(
    (H, U) => {
      let z;
      const re = H === void 0 ? {} : H;
      const R = re.onBlur;
      const F = re.onClick;
      re.onPress;
      const L = re.onKeyDown;
      const W = re.refKey;
      const J = W === void 0 ? 'ref' : W;
      const ie = re.ref;
      const ee = ke(re, Ty);
      const de = U === void 0 ? {} : U;
      const ae = de.suppressRefError;
      const ce = ae === void 0 ? !1 : ae;
      const ue = _.current.state;
      const Se = /* @__PURE__ */ a(() => {
        u({
          type: Wr,
        });
      }, 'toggleButtonHandleClick');
      const ye = /* @__PURE__ */ a(() => {
        ue.isOpen &&
          !S.isMouseDown &&
          u({
            type: Ur,
          });
      }, 'toggleButtonHandleBlur');
      const Oe = /* @__PURE__ */ a(Ce => {
        const Le = to(Ce);
        Le && T[Le]
          ? T[Le](Ce)
          : vy(Le) &&
            u({
              type: $r,
              key: Le,
            });
      }, 'toggleButtonHandleKeyDown');
      const fe = G(
        ((z = {}),
        (z[J] = Je(ie, Ie => {
          h.current = Ie;
        })),
        (z['aria-activedescendant'] =
          ue.isOpen && ue.highlightedIndex > -1 ? I.getItemId(ue.highlightedIndex) : ''),
        (z['aria-controls'] = I.menuId),
        (z['aria-expanded'] = _.current.state.isOpen),
        (z['aria-haspopup'] = 'listbox'),
        (z['aria-labelledby'] = ee?.['aria-label'] ? void 0 : `${I.labelId}`),
        (z.id = I.toggleButtonId),
        (z.role = 'combobox'),
        (z.tabIndex = 0),
        (z.onBlur = le(R, ye)),
        z),
        ee,
      );
      return (
        ee.disabled || ((fe.onClick = le(F, Se)), (fe.onKeyDown = le(L, Oe))),
        E('getToggleButtonProps', ce, J, h),
        fe
      );
    },
    [u, I, _, S, E, T],
  );
  const X = A(
    H => {
      let U;
      const z = H === void 0 ? {} : H;
      const re = z.item;
      const R = z.index;
      const F = z.onMouseMove;
      const L = z.onClick;
      const W = z.onMouseDown;
      z.onPress;
      const J = z.refKey;
      const ie = J === void 0 ? 'ref' : J;
      const ee = z.disabled;
      const de = z.ref;
      const ae = ke(z, Cy);
      ee !== void 0 &&
        console.warn(
          'Passing "disabled" as an argument to getItemProps is not supported anymore. Please use the isItemDisabled\
 prop from useSelect.',
        );
      const ce = _.current;
      const ue = ce.state;
      const Se = ce.props;
      const ye = li(re, R, Se.items, 'Pass either item or index to getItemProps!');
      const Oe = ye[0];
      const fe = ye[1];
      const Ie = Se.isItemDisabled(Oe, fe);
      const Ce = /* @__PURE__ */ a(() => {
        S.isTouchEnd ||
          fe === ue.highlightedIndex ||
          ((v.current = !1),
          u({
            type: Np,
            index: fe,
            disabled: Ie,
          }));
      }, 'itemHandleMouseMove');
      const Le = /* @__PURE__ */ a(() => {
        u({
          type: Ii,
          index: fe,
        });
      }, 'itemHandleClick');
      const tt = /* @__PURE__ */ a(oo => oo.preventDefault(), 'itemHandleMouseDown');
      const De = G(
        ((U = {}),
        (U[ie] = Je(de, $e => {
          $e && (f.current[I.getItemId(fe)] = $e);
        })),
        (U['aria-disabled'] = Ie),
        (U['aria-selected'] = `${Oe === ue.selectedItem}`),
        (U.id = I.getItemId(fe)),
        (U.role = 'option'),
        U),
        ae,
      );
      return (
        Ie || (De.onClick = le(L, Le)),
        (De.onMouseMove = le(F, Ce)),
        (De.onMouseDown = le(W, tt)),
        De
      );
    },
    [_, I, S, v, u],
  );
  return {
    // prop getters.
    getToggleButtonProps: V,
    getLabelProps: N,
    getMenuProps: Q,
    getItemProps: X,
    // actions.
    toggleMenu: C,
    openMenu: w,
    closeMenu: k,
    setHighlightedIndex: O,
    selectItem: P,
    reset: D,
    setInputValue: M,
    // state.
    highlightedIndex: p,
    isOpen: c,
    selectedItem: d,
    inputValue: g,
  };
}
a(jp, 'useSelect');
const _i = 0;
const wi = 1;
const Ti = 2;
const Ci = 3;
const ki = 4;
const Oi = 5;
const Pi = 6;
const Ai = 7;
const Di = 8;
const Gr = 9;
const Mi = 10;
const Vp = 11;
const Kp = 12;
const Li = 13;
const $p = 14;
const Up = 15;
const Gp = 16;
const Yp = 17;
const qp = 18;
const Ni = 19;
const Qp = 20;
const Xp = 21;
const Ri = 22;
const Zp = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  InputKeyDownArrowDown: _i,
  InputKeyDownArrowUp: wi,
  InputKeyDownEscape: Ti,
  InputKeyDownHome: Ci,
  InputKeyDownEnd: ki,
  InputKeyDownPageUp: Oi,
  InputKeyDownPageDown: Pi,
  InputKeyDownEnter: Ai,
  InputChange: Di,
  InputBlur: Gr,
  InputClick: Mi,
  MenuMouseLeave: Vp,
  ItemMouseMove: Kp,
  ItemClick: Li,
  ToggleButtonClick: $p,
  FunctionToggleMenu: Up,
  FunctionOpenMenu: Gp,
  FunctionCloseMenu: Yp,
  FunctionSetHighlightedIndex: qp,
  FunctionSelectItem: Ni,
  FunctionSetInputValue: Qp,
  FunctionReset: Xp,
  ControlledPropUpdatedSelectedItem: Ri,
});
function ky(e) {
  const t = kp(e);
  const o = t.selectedItem;
  let i = t.inputValue;
  return (
    i === '' &&
      o &&
      e.defaultInputValue === void 0 &&
      e.initialInputValue === void 0 &&
      e.inputValue === void 0 &&
      (i = e.itemToString(o)),
    G({}, t, {
      inputValue: i,
    })
  );
}
a(ky, 'getInitialState$1');
const mR = G({}, Dp, {
  items: q.default.array.isRequired,
  isItemDisabled: q.default.func,
  inputValue: q.default.string,
  defaultInputValue: q.default.string,
  initialInputValue: q.default.string,
  inputId: q.default.string,
  onInputValueChange: q.default.func,
});
function Oy(e, t, o, i) {
  const n = Y();
  const r = Tp(e, t, o, i);
  const l = r[0];
  const u = r[1];
  const c = Qr();
  return (
    j(() => {
      if (jr(t, 'selectedItem')) {
        if (!c) {
          const p = t.itemToKey(t.selectedItem) !== t.itemToKey(n.current);
          p &&
            u({
              type: Ri,
              inputValue: t.itemToString(t.selectedItem),
            });
        }
        n.current = l.selectedItem === n.current ? t.selectedItem : l.selectedItem;
      }
    }, [l.selectedItem, t.selectedItem]),
    [_o(l, t), u]
  );
}
a(Oy, 'useControlledReducer');
const Py = Fe;
const Ay = G({}, Eo, {
  isItemDisabled: /* @__PURE__ */ a(() => !1, 'isItemDisabled'),
});
function Dy(e, t) {
  let o;
  const i = t.type;
  const n = t.props;
  const r = t.altKey;
  let l;
  switch (i) {
    case Li:
      l = {
        isOpen: He(n, 'isOpen'),
        highlightedIndex: He(n, 'highlightedIndex'),
        selectedItem: n.items[t.index],
        inputValue: n.itemToString(n.items[t.index]),
      };
      break;
    case _i:
      e.isOpen
        ? (l = {
            highlightedIndex: et(e.highlightedIndex, 1, n.items, n.isItemDisabled, !0),
          })
        : (l = {
            highlightedIndex: r && e.selectedItem == null ? -1 : Bt(n, e, 1),
            isOpen: n.items.length >= 0,
          });
      break;
    case wi:
      e.isOpen
        ? r
          ? (l = Kr(n, e.highlightedIndex))
          : (l = {
              highlightedIndex: et(e.highlightedIndex, -1, n.items, n.isItemDisabled, !0),
            })
        : (l = {
            highlightedIndex: Bt(n, e, -1),
            isOpen: n.items.length >= 0,
          });
      break;
    case Ai:
      l = Kr(n, e.highlightedIndex);
      break;
    case Ti:
      l = G(
        {
          isOpen: !1,
          highlightedIndex: -1,
        },
        !e.isOpen && {
          selectedItem: null,
          inputValue: '',
        },
      );
      break;
    case Oi:
      l = {
        highlightedIndex: et(e.highlightedIndex, -10, n.items, n.isItemDisabled, !0),
      };
      break;
    case Pi:
      l = {
        highlightedIndex: et(e.highlightedIndex, 10, n.items, n.isItemDisabled, !0),
      };
      break;
    case Ci:
      l = {
        highlightedIndex: xt(0, !1, n.items, n.isItemDisabled),
      };
      break;
    case ki:
      l = {
        highlightedIndex: xt(n.items.length - 1, !0, n.items, n.isItemDisabled),
      };
      break;
    case Gr:
      l = G(
        {
          isOpen: !1,
          highlightedIndex: -1,
        },
        e.highlightedIndex >= 0 &&
          ((o = n.items) == null ? void 0 : o.length) &&
          t.selectItem && {
            selectedItem: n.items[e.highlightedIndex],
            inputValue: n.itemToString(n.items[e.highlightedIndex]),
          },
      );
      break;
    case Di:
      l = {
        isOpen: !0,
        highlightedIndex: He(n, 'highlightedIndex'),
        inputValue: t.inputValue,
      };
      break;
    case Mi:
      l = {
        isOpen: !e.isOpen,
        highlightedIndex: e.isOpen ? -1 : Bt(n, e, 0),
      };
      break;
    case Ni:
      l = {
        selectedItem: t.selectedItem,
        inputValue: n.itemToString(t.selectedItem),
      };
      break;
    case Ri:
      l = {
        inputValue: t.inputValue,
      };
      break;
    default:
      return Mp(e, t, Zp);
  }
  return G({}, e, l);
}
a(Dy, 'downshiftUseComboboxReducer');
const My = ['onMouseLeave', 'refKey', 'ref'];
const Ly = [
  'item',
  'index',
  'refKey',
  'ref',
  'onMouseMove',
  'onMouseDown',
  'onClick',
  'onPress',
  'dis\
abled',
];
const Ny = ['onClick', 'onPress', 'refKey', 'ref'];
const Ry = [
  'onKeyDown',
  'onChange',
  'onInput',
  'onBlur',
  'onChangeText',
  'onClick',
  'refKe\
y',
  'ref',
];
Jp.stateChangeTypes = Zp;
function Jp(e) {
  e === void 0 && (e = {}), Py(e, Jp);
  const t = G({}, Ay, e);
  const o = t.items;
  const i = t.scrollIntoView;
  const n = t.environment;
  const r = t.getA11yStatusMessage;
  const l = Oy(Dy, t, ky, Ap);
  const u = l[0];
  const c = l[1];
  const p = u.isOpen;
  const d = u.highlightedIndex;
  const g = u.selectedItem;
  const h = u.inputValue;
  const y = Y(null);
  const f = Y({});
  const b = Y(null);
  const I = Y(null);
  const _ = Qr();
  const m = wp(t);
  const v = Y();
  const S = qr({
    state: u,
    props: t,
  });
  const E = A(R => f.current[m.getItemId(R)], [m]);
  pi(r, u, [p, d, g, h], n);
  const T = Pp({
    menuElement: y.current,
    highlightedIndex: d,
    isOpen: p,
    itemRefs: f,
    scrollIntoView: i,
    getItemNodeFromIndex: E,
  });
  di({
    props: t,
    state: u,
  }),
    j(() => {
      const R = Ht(t, 'isOpen');
      R && b.current && b.current.focus();
    }, []),
    j(() => {
      _ || (v.current = o.length);
    });
  const C = Op(
    n,
    [I, y, b],
    A(
      /* @__PURE__ */ a(() => {
        S.current.state.isOpen &&
          c({
            type: Gr,
            selectItem: !1,
          });
      }, 'handleBlur'),
      [c, S],
    ),
  );
  const k = ci('getInputProps', 'getMenuProps');
  j(() => {
    p || (f.current = {});
  }, [p]),
    j(() => {
      let R;
      !p ||
        !n?.document ||
        !(b != null && (R = b.current) != null && R.focus) ||
        (n.document.activeElement !== b.current && b.current.focus());
    }, [p, n]);
  const w = K(
    () => ({
      ArrowDown: /* @__PURE__ */ a(F => {
        F.preventDefault(),
          c({
            type: _i,
            altKey: F.altKey,
          });
      }, 'ArrowDown'),
      ArrowUp: /* @__PURE__ */ a(F => {
        F.preventDefault(),
          c({
            type: wi,
            altKey: F.altKey,
          });
      }, 'ArrowUp'),
      Home: /* @__PURE__ */ a(F => {
        S.current.state.isOpen &&
          (F.preventDefault(),
          c({
            type: Ci,
          }));
      }, 'Home'),
      End: /* @__PURE__ */ a(F => {
        S.current.state.isOpen &&
          (F.preventDefault(),
          c({
            type: ki,
          }));
      }, 'End'),
      Escape: /* @__PURE__ */ a(F => {
        const L = S.current.state;
        (L.isOpen || L.inputValue || L.selectedItem || L.highlightedIndex > -1) &&
          (F.preventDefault(),
          c({
            type: Ti,
          }));
      }, 'Escape'),
      Enter: /* @__PURE__ */ a(F => {
        const L = S.current.state;
        !L.isOpen ||
          F.which === 229 ||
          (F.preventDefault(),
          c({
            type: Ai,
          }));
      }, 'Enter'),
      PageUp: /* @__PURE__ */ a(F => {
        S.current.state.isOpen &&
          (F.preventDefault(),
          c({
            type: Oi,
          }));
      }, 'PageUp'),
      PageDown: /* @__PURE__ */ a(F => {
        S.current.state.isOpen &&
          (F.preventDefault(),
          c({
            type: Pi,
          }));
      }, 'PageDown'),
    }),
    [c, S],
  );
  const O = A(
    R =>
      G(
        {
          id: m.labelId,
          htmlFor: m.inputId,
        },
        R,
      ),
    [m],
  );
  const P = A(
    (R, F) => {
      let L;
      const W = R === void 0 ? {} : R;
      const J = W.onMouseLeave;
      const ie = W.refKey;
      const ee = ie === void 0 ? 'ref' : ie;
      const de = W.ref;
      const ae = ke(W, My);
      const ce = F === void 0 ? {} : F;
      const ue = ce.suppressRefError;
      const Se = ue === void 0 ? !1 : ue;
      return (
        k('getMenuProps', Se, ee, y),
        G(
          ((L = {}),
          (L[ee] = Je(de, ye => {
            y.current = ye;
          })),
          (L.id = m.menuId),
          (L.role = 'listbox'),
          (L['aria-labelledby'] = ae?.['aria-label'] ? void 0 : `${m.labelId}`),
          (L.onMouseLeave = le(J, () => {
            c({
              type: Vp,
            });
          })),
          L),
          ae,
        )
      );
    },
    [c, k, m],
  );
  const D = A(
    R => {
      let F;
      let L;
      const W = R === void 0 ? {} : R;
      const J = W.item;
      const ie = W.index;
      const ee = W.refKey;
      const de = ee === void 0 ? 'ref' : ee;
      const ae = W.ref;
      const ce = W.onMouseMove;
      const ue = W.onMouseDown;
      const Se = W.onClick;
      W.onPress;
      const ye = W.disabled;
      const Oe = ke(W, Ly);
      ye !== void 0 &&
        console.warn(
          'Passing "disabled" as an argument to getItemProps is not supported anymore. Please use the isItemDisabled\
 prop from useCombobox.',
        );
      const fe = S.current;
      const Ie = fe.props;
      const Ce = fe.state;
      const Le = li(J, ie, Ie.items, 'Pass either item or index to getItemProps!');
      const tt = Le[0];
      const De = Le[1];
      const $e = Ie.isItemDisabled(tt, De);
      const oo = 'onClick';
      const Co = Se;
      const pt = /* @__PURE__ */ a(() => {
        C.isTouchEnd ||
          De === Ce.highlightedIndex ||
          ((T.current = !1),
          c({
            type: Kp,
            index: De,
            disabled: $e,
          }));
      }, 'itemHandleMouseMove');
      const B = /* @__PURE__ */ a(() => {
        c({
          type: Li,
          index: De,
        });
      }, 'itemHandleClick');
      const dt = /* @__PURE__ */ a(Ld => Ld.preventDefault(), 'itemHandleMouseDown');
      return G(
        ((F = {}),
        (F[de] = Je(ae, Ue => {
          Ue && (f.current[m.getItemId(De)] = Ue);
        })),
        (F['aria-disabled'] = $e),
        (F['aria-selected'] = `${De === Ce.highlightedIndex}`),
        (F.id = m.getItemId(De)),
        (F.role = 'option'),
        F),
        !$e && ((L = {}), (L[oo] = le(Co, B)), L),
        {
          onMouseMove: le(ce, pt),
          onMouseDown: le(ue, dt),
        },
        Oe,
      );
    },
    [c, m, S, C, T],
  );
  const M = A(
    R => {
      let F;
      const L = R === void 0 ? {} : R;
      const W = L.onClick;
      L.onPress;
      const J = L.refKey;
      const ie = J === void 0 ? 'ref' : J;
      const ee = L.ref;
      const de = ke(L, Ny);
      const ae = S.current.state;
      const ce = /* @__PURE__ */ a(() => {
        c({
          type: $p,
        });
      }, 'toggleButtonHandleClick');
      return G(
        ((F = {}),
        (F[ie] = Je(ee, ue => {
          I.current = ue;
        })),
        (F['aria-controls'] = m.menuId),
        (F['aria-expanded'] = ae.isOpen),
        (F.id = m.toggleButtonId),
        (F.tabIndex = -1),
        F),
        !de.disabled &&
          G(
            {},
            {
              onClick: le(W, ce),
            },
          ),
        de,
      );
    },
    [c, S, m],
  );
  const N = A(
    (R, F) => {
      let L;
      const W = R === void 0 ? {} : R;
      const J = W.onKeyDown;
      const ie = W.onChange;
      const ee = W.onInput;
      const de = W.onBlur;
      W.onChangeText;
      const ae = W.onClick;
      const ce = W.refKey;
      const ue = ce === void 0 ? 'ref' : ce;
      const Se = W.ref;
      const ye = ke(W, Ry);
      const Oe = F === void 0 ? {} : F;
      const fe = Oe.suppressRefError;
      const Ie = fe === void 0 ? !1 : fe;
      k('getInputProps', Ie, ue, b);
      const Ce = S.current.state;
      const Le = /* @__PURE__ */ a(dt => {
        const Ue = to(dt);
        Ue && w[Ue] && w[Ue](dt);
      }, 'inputHandleKeyDown');
      const tt = /* @__PURE__ */ a(dt => {
        c({
          type: Di,
          inputValue: dt.target.value,
        });
      }, 'inputHandleChange');
      const De = /* @__PURE__ */ a(dt => {
        if (n?.document && Ce.isOpen && !C.isMouseDown) {
          const Ue = dt.relatedTarget === null && n.document.activeElement !== n.document.body;
          c({
            type: Gr,
            selectItem: !Ue,
          });
        }
      }, 'inputHandleBlur');
      const $e = /* @__PURE__ */ a(() => {
        c({
          type: Mi,
        });
      }, 'inputHandleClick');
      const oo = 'onChange';
      let Co = {};
      if (!ye.disabled) {
        let pt;
        Co =
          ((pt = {}),
          (pt[oo] = le(ie, ee, tt)),
          (pt.onKeyDown = le(J, Le)),
          (pt.onBlur = le(de, De)),
          (pt.onClick = le(ae, $e)),
          pt);
      }
      return G(
        ((L = {}),
        (L[ue] = Je(Se, B => {
          b.current = B;
        })),
        (L['aria-activedescendant'] =
          Ce.isOpen && Ce.highlightedIndex > -1 ? m.getItemId(Ce.highlightedIndex) : ''),
        (L['aria-autocomplete'] = 'list'),
        (L['aria-controls'] = m.menuId),
        (L['aria-expanded'] = Ce.isOpen),
        (L['aria-labelledby'] = ye?.['aria-label'] ? void 0 : m.labelId),
        (L.autoComplete = 'off'),
        (L.id = m.inputId),
        (L.role = 'combobox'),
        (L.value = Ce.inputValue),
        L),
        Co,
        ye,
      );
    },
    [c, m, n, w, S, C, k],
  );
  const Q = A(() => {
    c({
      type: Up,
    });
  }, [c]);
  const V = A(() => {
    c({
      type: Yp,
    });
  }, [c]);
  const X = A(() => {
    c({
      type: Gp,
    });
  }, [c]);
  const H = A(
    R => {
      c({
        type: qp,
        highlightedIndex: R,
      });
    },
    [c],
  );
  const U = A(
    R => {
      c({
        type: Ni,
        selectedItem: R,
      });
    },
    [c],
  );
  const z = A(
    R => {
      c({
        type: Qp,
        inputValue: R,
      });
    },
    [c],
  );
  const re = A(() => {
    c({
      type: Xp,
    });
  }, [c]);
  return {
    // prop getters.
    getItemProps: D,
    getLabelProps: O,
    getMenuProps: P,
    getInputProps: N,
    getToggleButtonProps: M,
    // actions.
    toggleMenu: Q,
    openMenu: X,
    closeMenu: V,
    setHighlightedIndex: H,
    setInputValue: z,
    selectItem: U,
    reset: re,
    // state.
    highlightedIndex: d,
    isOpen: p,
    selectedItem: g,
    inputValue: h,
  };
}
a(Jp, 'useCombobox');
const ed = {
  activeIndex: -1,
  selectedItems: [],
};
function op(e, t) {
  return Ht(e, t, ed);
}
a(op, 'getInitialValue');
function rp(e, t) {
  return He(e, t, ed);
}
a(rp, 'getDefaultValue');
function Fy(e) {
  const t = op(e, 'activeIndex');
  const o = op(e, 'selectedItems');
  return {
    activeIndex: t,
    selectedItems: o,
  };
}
a(Fy, 'getInitialState');
function np(e) {
  if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return !1;
  const t = e.target;
  return !(
    t instanceof HTMLInputElement && // if element is a text input
    t.value !== '' && // and we have text in it
    // and cursor is either not at the start or is currently highlighting text.
    (t.selectionStart !== 0 || t.selectionEnd !== 0)
  );
}
a(np, 'isKeyDownOperationPermitted');
function Hy(e, t) {
  return e.selectedItems === t.selectedItems && e.activeIndex === t.activeIndex;
}
a(Hy, 'isStateEqual');
const hR = {
  stateReducer: zr.stateReducer,
  itemToKey: zr.itemToKey,
  environment: zr.environment,
  selectedItems: q.default.array,
  initialSelectedItems: q.default.array,
  defaultSelectedItems: q.default.array,
  getA11yStatusMessage: q.default.func,
  activeIndex: q.default.number,
  initialActiveIndex: q.default.number,
  defaultActiveIndex: q.default.number,
  onActiveIndexChange: q.default.func,
  onSelectedItemsChange: q.default.func,
  keyNavigationNext: q.default.string,
  keyNavigationPrevious: q.default.string,
};
const By = {
  itemToKey: Eo.itemToKey,
  stateReducer: Eo.stateReducer,
  environment: Eo.environment,
  keyNavigationNext: 'ArrowRight',
  keyNavigationPrevious: 'ArrowLeft',
};
const zy = Fe;
const Fi = 0;
const Hi = 1;
const Bi = 2;
const zi = 3;
const Wi = 4;
const ji = 5;
const Vi = 6;
const Ki = 7;
const $i = 8;
const Ui = 9;
const Gi = 10;
const Yi = 11;
const qi = 12;
const Wy = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  SelectedItemClick: Fi,
  SelectedItemKeyDownDelete: Hi,
  SelectedItemKeyDownBackspace: Bi,
  SelectedItemKeyDownNavigationNext: zi,
  SelectedItemKeyDownNavigationPrevious: Wi,
  DropdownKeyDownNavigationPrevious: ji,
  DropdownKeyDownBackspace: Vi,
  DropdownClick: Ki,
  FunctionAddSelectedItem: $i,
  FunctionRemoveSelectedItem: Ui,
  FunctionSetSelectedItems: Gi,
  FunctionSetActiveIndex: Yi,
  FunctionReset: qi,
});
function jy(e, t) {
  const o = t.type;
  const i = t.index;
  const n = t.props;
  const r = t.selectedItem;
  const l = e.activeIndex;
  const u = e.selectedItems;
  let c;
  switch (o) {
    case Fi:
      c = {
        activeIndex: i,
      };
      break;
    case Wi:
      c = {
        activeIndex: l - 1 < 0 ? 0 : l - 1,
      };
      break;
    case zi:
      c = {
        activeIndex: l + 1 >= u.length ? -1 : l + 1,
      };
      break;
    case Bi:
    case Hi: {
      if (l < 0) break;
      let p = l;
      u.length === 1 ? (p = -1) : l === u.length - 1 && (p = u.length - 2),
        (c = G(
          {
            selectedItems: [].concat(u.slice(0, l), u.slice(l + 1)),
          },
          {
            activeIndex: p,
          },
        ));
      break;
    }
    case ji:
      c = {
        activeIndex: u.length - 1,
      };
      break;
    case Vi:
      c = {
        selectedItems: u.slice(0, u.length - 1),
      };
      break;
    case $i:
      c = {
        selectedItems: [].concat(u, [r]),
      };
      break;
    case Ki:
      c = {
        activeIndex: -1,
      };
      break;
    case Ui: {
      let d = l;
      const g = u.findIndex(f => n.itemToKey(f) === n.itemToKey(r));
      if (g < 0) break;
      u.length === 1 ? (d = -1) : g === u.length - 1 && (d = u.length - 2),
        (c = {
          selectedItems: [].concat(u.slice(0, g), u.slice(g + 1)),
          activeIndex: d,
        });
      break;
    }
    case Gi: {
      const h = t.selectedItems;
      c = {
        selectedItems: h,
      };
      break;
    }
    case Yi: {
      const y = t.activeIndex;
      c = {
        activeIndex: y,
      };
      break;
    }
    case qi:
      c = {
        activeIndex: rp(n, 'activeIndex'),
        selectedItems: rp(n, 'selectedItems'),
      };
      break;
    default:
      throw new Error('Reducer called without proper action type.');
  }
  return G({}, e, c);
}
a(jy, 'downshiftMultipleSelectionReducer');
const Vy = ['refKey', 'ref', 'onClick', 'onKeyDown', 'selectedItem', 'index'];
const Ky = [
  'refKey',
  'ref',
  'onKeyDown',
  'onClick',
  'preventKeyActio\
n',
];
td.stateChangeTypes = Wy;
function td(e) {
  e === void 0 && (e = {}), zy(e, td);
  const t = G({}, By, e);
  const o = t.getA11yStatusMessage;
  const i = t.environment;
  const n = t.keyNavigationNext;
  const r = t.keyNavigationPrevious;
  const l = Cp(jy, t, Fy, Hy);
  const u = l[0];
  const c = l[1];
  const p = u.activeIndex;
  const d = u.selectedItems;
  const g = Qr();
  const h = Y(null);
  const y = Y();
  y.current = [];
  const f = qr({
    state: u,
    props: t,
  });
  pi(o, u, [p, d], i),
    j(() => {
      g || (p === -1 && h.current ? h.current.focus() : y.current[p]?.focus());
    }, [p]),
    di({
      props: t,
      state: u,
    });
  const b = ci('getDropdownProps');
  const I = K(() => {
    let w;
    return (
      (w = {}),
      (w[r] = () => {
        c({
          type: Wi,
        });
      }),
      (w[n] = () => {
        c({
          type: zi,
        });
      }),
      (w.Delete = /* @__PURE__ */ a(() => {
        c({
          type: Hi,
        });
      }, 'Delete')),
      (w.Backspace = /* @__PURE__ */ a(() => {
        c({
          type: Bi,
        });
      }, 'Backspace')),
      w
    );
  }, [c, n, r]);
  const _ = K(() => {
    let w;
    return (
      (w = {}),
      (w[r] = O => {
        np(O) &&
          c({
            type: ji,
          });
      }),
      (w.Backspace = /* @__PURE__ */ a(P => {
        np(P) &&
          c({
            type: Vi,
          });
      }, 'Backspace')),
      w
    );
  }, [c, r]);
  const m = A(
    w => {
      let O;
      const P = w === void 0 ? {} : w;
      const D = P.refKey;
      const M = D === void 0 ? 'ref' : D;
      const N = P.ref;
      const Q = P.onClick;
      const V = P.onKeyDown;
      const X = P.selectedItem;
      const H = P.index;
      const U = ke(P, Vy);
      const z = f.current.state;
      const re = li(X, H, z.selectedItems, 'Pass either item or index to getSelectedItemProps!');
      const R = re[1];
      const F = R > -1 && R === z.activeIndex;
      const L = /* @__PURE__ */ a(() => {
        c({
          type: Fi,
          index: R,
        });
      }, 'selectedItemHandleClick');
      const W = /* @__PURE__ */ a(ie => {
        const ee = to(ie);
        ee && I[ee] && I[ee](ie);
      }, 'selectedItemHandleKeyDown');
      return G(
        ((O = {}),
        (O[M] = Je(N, J => {
          J && y.current.push(J);
        })),
        (O.tabIndex = F ? 0 : -1),
        (O.onClick = le(Q, L)),
        (O.onKeyDown = le(V, W)),
        O),
        U,
      );
    },
    [c, f, I],
  );
  const v = A(
    (w, O) => {
      let P;
      const D = w === void 0 ? {} : w;
      const M = D.refKey;
      const N = M === void 0 ? 'ref' : M;
      const Q = D.ref;
      const V = D.onKeyDown;
      const X = D.onClick;
      const H = D.preventKeyAction;
      const U = H === void 0 ? !1 : H;
      const z = ke(D, Ky);
      const re = O === void 0 ? {} : O;
      const R = re.suppressRefError;
      const F = R === void 0 ? !1 : R;
      b('getDropdownProps', F, N, h);
      const L = /* @__PURE__ */ a(ie => {
        const ee = to(ie);
        ee && _[ee] && _[ee](ie);
      }, 'dropdownHandleKeyDown');
      const W = /* @__PURE__ */ a(() => {
        c({
          type: Ki,
        });
      }, 'dropdownHandleClick');
      return G(
        ((P = {}),
        (P[N] = Je(Q, J => {
          J && (h.current = J);
        })),
        P),
        !U && {
          onKeyDown: le(V, L),
          onClick: le(X, W),
        },
        z,
      );
    },
    [c, _, b],
  );
  const S = A(
    w => {
      c({
        type: $i,
        selectedItem: w,
      });
    },
    [c],
  );
  const E = A(
    w => {
      c({
        type: Ui,
        selectedItem: w,
      });
    },
    [c],
  );
  const T = A(
    w => {
      c({
        type: Gi,
        selectedItems: w,
      });
    },
    [c],
  );
  const C = A(
    w => {
      c({
        type: Yi,
        activeIndex: w,
      });
    },
    [c],
  );
  const k = A(() => {
    c({
      type: qi,
    });
  }, [c]);
  return {
    getSelectedItemProps: m,
    getDropdownProps: v,
    addSelectedItem: S,
    removeSelectedItem: E,
    setSelectedItems: T,
    setActiveIndex: C,
    reset: k,
    selectedItems: d,
    activeIndex: p,
  };
}
a(td, 'useMultipleSelection');

// src/manager/components/sidebar/Search.tsx
const rd = ze(od(), 1);

// src/manager/components/sidebar/types.ts
function To(e) {
  return !!e?.showAll;
}
a(To, 'isExpandType');
function Xi(e) {
  return !!e?.item;
}
a(Xi, 'isSearchResult');

// src/manager/components/sidebar/Search.tsx
const { document: $y } = se;
const Zi = 50;
const Uy = {
  shouldSort: !0,
  tokenize: !0,
  findAllMatches: !0,
  includeScore: !0,
  includeMatches: !0,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'path', weight: 0.3 },
  ],
};
const Gy = x.div({
  display: 'flex',
  flexDirection: 'row',
  columnGap: 6,
});
const Yy = x.label({
  position: 'absolute',
  left: -1e4,
  top: 'auto',
  width: 1,
  height: 1,
  overflow: 'hidden',
});
const qy = x.div(({ theme: e }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: 2,
  flexGrow: 1,
  height: 32,
  width: '100%',
  boxShadow: `${e.button.border} 0 0 0 1px inset`,
  borderRadius: e.appBorderRadius + 2,
  '&:has(input:focus), &:has(input:active)': {
    boxShadow: `${e.color.secondary} 0 0 0 1px inset`,
    background: e.background.app,
  },
}));
const Qy = x.div(({ theme: e, onClick: t }) => ({
  cursor: t ? 'pointer' : 'default',
  flex: '0 0 28px',
  height: '100%',
  pointerEvents: t ? 'auto' : 'none',
  color: e.textMutedColor,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));
const Xy = x.input(({ theme: e }) => ({
  appearance: 'none',
  height: 28,
  width: '100%',
  padding: 0,
  border: 0,
  background: 'transparent',
  fontSize: `${e.typography.size.s1 + 1}px`,
  fontFamily: 'inherit',
  transition: 'all 150ms',
  color: e.color.defaultText,
  outline: 0,
  '&::placeholder': {
    color: e.textMutedColor,
    opacity: 1,
  },
  '&:valid ~ code, &:focus ~ code': {
    display: 'none',
  },
  '&:invalid ~ svg': {
    display: 'none',
  },
  '&:valid ~ svg': {
    display: 'block',
  },
  '&::-ms-clear': {
    display: 'none',
  },
  '&::-webkit-search-decoration, &::-webkit-search-cancel-button, &::-webkit-search-results-button, &::-webkit-search-results-decoration':
    {
      display: 'none',
    },
}));
const Zy = x.code(({ theme: e }) => ({
  margin: 5,
  marginTop: 6,
  height: 16,
  lineHeight: '16px',
  textAlign: 'center',
  fontSize: '11px',
  color: e.base === 'light' ? e.color.dark : e.textMutedColor,
  userSelect: 'none',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  flexShrink: 0,
}));
const Jy = x.span({
  fontSize: '14px',
});
const eb = x.div({
  display: 'flex',
  alignItems: 'center',
  gap: 2,
});
const tb = x.div({ outline: 0 });
const nd = s.memo(
  /* @__PURE__ */ a(
    ({
      children: t,
      dataset: o,
      enableShortcuts: i = !0,
      getLastViewed: n,
      initialQuery: r = '',
      searchBarContent: l,
      searchFieldContent: u,
    }) => {
      const c = oe();
      const p = Y(null);
      const [d, g] = $('Find components');
      const [h, y] = $(!1);
      const f = c ? qe(c.getShortcutKeys().search) : '/';
      const b = A(() => {
        const E = o.entries.reduce((T, [C, { index: k, status: w }]) => {
          const O = Ir(k || {}, w);
          return (
            k &&
              T.push(
                ...Object.values(k).map(P => {
                  const D = w?.[P.id] ? So(Object.values(w[P.id] || {}).map(M => M.status)) : null;
                  return {
                    ...Zn(P, o.hash[C]),
                    status: D || O[P.id] || null,
                  };
                }),
              ),
            T
          );
        }, []);
        return new rd.default(E, Uy);
      }, [o]);
      const I = A(
        E => {
          const T = b();
          if (!E) return [];
          let C = [];
          const k = /* @__PURE__ */ new Set();
          const w = T.search(E).filter(({ item: O }) =>
            !(O.type === 'component' || O.type === 'docs' || O.type === 'story') || // @ts-expect-error (non strict)
            k.has(O.parent)
              ? !1
              : (k.add(O.id), !0),
          );
          return (
            w.length &&
              ((C = w.slice(0, h ? 1e3 : Zi)),
              w.length > Zi &&
                !h &&
                C.push({
                  showAll: /* @__PURE__ */ a(() => y(!0), 'showAll'),
                  totalCount: w.length,
                  moreCount: w.length - Zi,
                })),
            C
          );
        },
        [h, b],
      );
      const _ = A(
        E => {
          if (Xi(E)) {
            const { id: T, refId: C } = E.item;
            c?.selectStory(T, void 0, { ref: C !== st && C }), p.current.blur(), y(!1);
            return;
          }
          To(E) && E.showAll();
        },
        [c],
      );
      const m = A((E, T) => {
        y(!1);
      }, []);
      const v = A((E, T) => {
        switch (T.type) {
          case zt.stateChangeTypes.blurInput:
            return {
              ...T,
              // Prevent clearing the input on blur
              inputValue: E.inputValue,
              // Return to the tree view after selecting an item
              isOpen: E.inputValue && !E.selectedItem,
            };
          case zt.stateChangeTypes.mouseUp:
            return E;
          case zt.stateChangeTypes.keyDownEscape:
            return E.inputValue
              ? { ...T, inputValue: '', isOpen: !0, selectedItem: null }
              : { ...T, isOpen: !1, selectedItem: null };
          case zt.stateChangeTypes.clickItem:
          case zt.stateChangeTypes.keyDownEnter:
            return Xi(T.selectedItem)
              ? { ...T, inputValue: E.inputValue }
              : To(T.selectedItem)
                ? E
                : T;
          default:
            return T;
        }
      }, []);
      const { isMobile: S } = ge();
      return (
        // @ts-expect-error (non strict)
        /* @__PURE__ */ s.createElement(
          zt,
          {
            initialInputValue: r,
            stateReducer: v,
            itemToString: E => E?.item?.name || '',
            scrollIntoView: E => Dt(E),
            onSelect: _,
            onInputValueChange: m,
          },
          ({
            isOpen: E,
            openMenu: T,
            closeMenu: C,
            inputValue: k,
            clearSelection: w,
            getInputProps: O,
            getItemProps: P,
            getLabelProps: D,
            getMenuProps: M,
            getRootProps: N,
            highlightedIndex: Q,
          }) => {
            const V = k ? k.trim() : '';
            let X = V ? I(V) : [];
            const H = !V && n();
            H?.length &&
              (X = H.reduce((R, { storyId: F, refId: L }) => {
                const W = o.hash[L];
                if (W?.index?.[F]) {
                  const J = W.index[F];
                  const ie = J.type === 'story' ? W.index[J.parent] : J;
                  R.some(ee => ee.item.refId === L && ee.item.id === ie.id) ||
                    R.push({ item: Zn(ie, o.hash[L]), matches: [], score: 0 });
                }
                return R;
              }, []));
            const U = 'storybook-explorer-searchfield';
            const z = O({
              id: U,
              ref: p,
              required: !0,
              type: 'search',
              placeholder: d,
              onFocus: /* @__PURE__ */ a(() => {
                T(), g('Type to find...');
              }, 'onFocus'),
              onBlur: /* @__PURE__ */ a(() => g('Find components'), 'onBlur'),
              onKeyDown: /* @__PURE__ */ a(R => {
                R.key === 'Escape' && k.length === 0 && p.current.blur();
              }, 'onKeyDown'),
            });
            const re = D({
              htmlFor: U,
            });
            return /* @__PURE__ */ s.createElement(
              s.Fragment,
              null,
              /* @__PURE__ */ s.createElement(Yy, { ...re }, 'Search for components'),
              /* @__PURE__ */ s.createElement(
                Gy,
                null,
                /* @__PURE__ */ s.createElement(
                  qy,
                  {
                    ...N({ refKey: '' }, { suppressRefError: !0 }),
                    className: 'search-field',
                  },
                  /* @__PURE__ */ s.createElement(
                    Qy,
                    null,
                    /* @__PURE__ */ s.createElement(No, null),
                  ),
                  /* @__PURE__ */ s.createElement(Xy, { ...z }),
                  !S &&
                    i &&
                    !E &&
                    /* @__PURE__ */ s.createElement(
                      Zy,
                      null,
                      f === '\u2318 K'
                        ? /* @__PURE__ */ s.createElement(
                            s.Fragment,
                            null,
                            /* @__PURE__ */ s.createElement(Jy, null, '\u2318'),
                            'K',
                          )
                        : f,
                    ),
                  /* @__PURE__ */ s.createElement(
                    eb,
                    null,
                    E &&
                      /* @__PURE__ */ s.createElement(
                        te,
                        { onClick: () => w() },
                        /* @__PURE__ */ s.createElement(Ge, null),
                      ),
                    u,
                  ),
                ),
                l,
              ),
              /* @__PURE__ */ s.createElement(
                tb,
                { tabIndex: 0, id: 'storybook-explorer-menu' },
                t({
                  query: V,
                  results: X,
                  isBrowsing: !E && $y.activeElement !== p.current,
                  closeMenu: C,
                  getMenuProps: M,
                  getItemProps: P,
                  highlightedIndex: Q,
                }),
              ),
            );
          },
        )
      );
    },
    'Search',
  ),
);

// src/manager/components/sidebar/SearchResults.tsx
const { document: id } = se;
const ob = x.ol({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});
const rb = x.li(({ theme: e, isHighlighted: t }) => ({
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'start',
  justifyContent: 'space-between',
  textAlign: 'left',
  color: 'inherit',
  fontSize: `${e.typography.size.s2}px`,
  background: t ? e.background.hoverable : 'transparent',
  minHeight: 28,
  borderRadius: 4,
  gap: 6,
  paddingTop: 7,
  paddingBottom: 7,
  paddingLeft: 8,
  paddingRight: 8,
  '&:hover, &:focus': {
    background: we(0.93, e.color.secondary),
    outline: 'none',
  },
}));
const nb = x.div({
  marginTop: 2,
});
const ib = x.div({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});
const sb = x.div(({ theme: e }) => ({
  marginTop: 20,
  textAlign: 'center',
  fontSize: `${e.typography.size.s2}px`,
  lineHeight: '18px',
  color: e.color.defaultText,
  small: {
    color: e.textMutedColor,
    fontSize: `${e.typography.size.s1}px`,
  },
}));
const ab = x.mark(({ theme: e }) => ({
  background: 'transparent',
  color: e.color.secondary,
}));
const lb = x.div({
  marginTop: 8,
});
const ub = x.div(({ theme: e }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: `${e.typography.size.s1 - 1}px`,
  fontWeight: e.typography.weight.bold,
  minHeight: 28,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: e.textMutedColor,
  marginTop: 16,
  marginBottom: 4,
  alignItems: 'center',
  '.search-result-recentlyOpened-clear': {
    visibility: 'hidden',
  },
  '&:hover': {
    '.search-result-recentlyOpened-clear': {
      visibility: 'visible',
    },
  },
}));
const sd = s.memo(
  /* @__PURE__ */ a(({ children: t, match: o }) => {
    if (!o) return t;
    const { value: i, indices: n } = o;
    const { nodes: r } = n.reduce(
      ({ cursor: l, nodes: u }, [c, p], d, { length: g }) => (
        u.push(/* @__PURE__ */ s.createElement('span', { key: `${d}-1` }, i.slice(l, c))),
        u.push(/* @__PURE__ */ s.createElement(ab, { key: `${d}-2` }, i.slice(c, p + 1))),
        d === g - 1 &&
          u.push(/* @__PURE__ */ s.createElement('span', { key: `${d}-3` }, i.slice(p + 1))),
        { cursor: p + 1, nodes: u }
      ),
      { cursor: 0, nodes: [] },
    );
    return /* @__PURE__ */ s.createElement('span', null, r);
  }, 'Highlight'),
);
const cb = x.div(({ theme: e }) => ({
  display: 'grid',
  justifyContent: 'start',
  gridAutoColumns: 'auto',
  gridAutoFlow: 'column',
  '& > span': {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));
const pb = x.div(({ theme: e }) => ({
  display: 'grid',
  justifyContent: 'start',
  gridAutoColumns: 'auto',
  gridAutoFlow: 'column',
  fontSize: `${e.typography.size.s1 - 1}px`,
  '& > span': {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& > span + span': {
    '&:before': {
      content: "' / '",
    },
  },
}));
const db = s.memo(
  /* @__PURE__ */ a(({ item: t, matches: o, onClick: i, ...n }) => {
    const r = A(
      d => {
        d.preventDefault(), i?.(d);
      },
      [i],
    );
    const l = oe();
    j(() => {
      l &&
        n.isHighlighted &&
        t.type === 'component' &&
        l.emit(St, { ids: [t.children[0]] }, { options: { target: t.refId } });
    }, [n.isHighlighted, t]);
    const u = o.find(d => d.key === 'name');
    const c = o.filter(d => d.key === 'path');
    const [p] = t.status ? xo[t.status] : [];
    return /* @__PURE__ */ s.createElement(
      rb,
      { ...n, onClick: r },
      /* @__PURE__ */ s.createElement(
        nb,
        null,
        t.type === 'component' &&
          /* @__PURE__ */ s.createElement(
            bt,
            { viewBox: '0 0 14 14', width: '14', height: '14', type: 'component' },
            /* @__PURE__ */ s.createElement(Ne, {
              type: 'com\
ponent',
            }),
          ),
        t.type === 'story' &&
          /* @__PURE__ */ s.createElement(
            bt,
            { viewBox: '0 0 14 14', width: '14', height: '14', type: 'story' },
            /* @__PURE__ */ s.createElement(Ne, { type: 'story' }),
          ),
        !(t.type === 'component' || t.type === 'story') &&
          /* @__PURE__ */ s.createElement(
            bt,
            {
              viewBox:
                '\
0 0 14 14',
              width: '14',
              height: '14',
              type: 'document',
            },
            /* @__PURE__ */ s.createElement(Ne, { type: 'document' }),
          ),
      ),
      /* @__PURE__ */ s.createElement(
        ib,
        { className: 'search-result-item--label' },
        /* @__PURE__ */ s.createElement(
          cb,
          null,
          /* @__PURE__ */ s.createElement(sd, { match: u }, t.name),
        ),
        /* @__PURE__ */ s.createElement(
          pb,
          null,
          t.path.map((d, g) =>
            /* @__PURE__ */ s.createElement(
              'span',
              { key: g },
              /* @__PURE__ */ s.createElement(sd, { match: c.find(h => h.arrayIndex === g) }, d),
            ),
          ),
        ),
      ),
      t.status ? /* @__PURE__ */ s.createElement(bc, { status: t.status }, p) : null,
    );
  }, 'Result'),
);
const ad = s.memo(
  /* @__PURE__ */ a(
    ({
      query: t,
      results: o,
      closeMenu: i,
      getMenuProps: n,
      getItemProps: r,
      highlightedIndex: l,
      isLoading: u = !1,
      enableShortcuts: c = !0,
      clearLastViewed: p,
    }) => {
      const d = oe();
      j(() => {
        const y = /* @__PURE__ */ a(f => {
          if (!(!c || u || f.repeat) && vt(!1, f) && Ve('Escape', f)) {
            if (f.target?.id === 'storybook-explorer-searchfield') return;
            f.preventDefault(), i();
          }
        }, 'handleEscape');
        return id.addEventListener('keydown', y), () => id.removeEventListener('keydown', y);
      }, [i, c, u]);
      const g = A(y => {
        if (!d) return;
        const f = y.currentTarget;
        const b = f.getAttribute('data-id');
        const I = f.getAttribute('data-refid');
        const _ = d.resolveStory(
          b,
          I ===
            'storybook_interna\
l'
            ? void 0
            : I,
        );
        _?.type === 'component' &&
          d.emit(St, {
            // @ts-expect-error (TODO)
            ids: [_.isLeaf ? _.id : _.children[0]],
            options: { target: I },
          });
      }, []);
      const h = /* @__PURE__ */ a(() => {
        p(), i();
      }, 'handleClearLastViewed');
      return /* @__PURE__ */ s.createElement(
        ob,
        { ...n() },
        o.length > 0 &&
          !t &&
          /* @__PURE__ */ s.createElement(
            ub,
            {
              className:
                'search-resu\
lt-recentlyOpened',
            },
            'Recently opened',
            /* @__PURE__ */ s.createElement(
              te,
              {
                className: 'search-result-recentlyOpened-clear',
                onClick: h,
              },
              /* @__PURE__ */ s.createElement(Ws, null),
            ),
          ),
        o.length === 0 &&
          t &&
          /* @__PURE__ */ s.createElement(
            'li',
            null,
            /* @__PURE__ */ s.createElement(
              sb,
              null,
              /* @__PURE__ */ s.createElement('strong', null, 'No components found'),
              /* @__PURE__ */ s.createElement('br', null),
              /* @__PURE__ */ s.createElement(
                'small',
                null,
                'Find \
components by name or path.',
              ),
            ),
          ),
        o.map((y, f) => {
          if (To(y))
            return /* @__PURE__ */ s.createElement(
              lb,
              { key: 'search-result-expand' },
              /* @__PURE__ */ s.createElement(
                me,
                {
                  ...y,
                  ...r({ key: f, index: f, item: y }),
                  size: 'small',
                },
                'Show ',
                y.moreCount,
                ' more results',
              ),
            );
          const { item: b } = y;
          const I = `${b.refId}::${b.id}`;
          return /* @__PURE__ */ s.createElement(db, {
            key: b.id,
            ...y,
            ...r({ key: I, index: f, item: y }),
            isHighlighted: l === f,
            'data-id': y.item.id,
            'data-refid': y.item.refId,
            onMouseOver: g,
            className: 'search-result-item',
          });
        }),
      );
    },
    'SearchResults',
  ),
);

// src/manager/components/sidebar/LegacyRender.tsx
const fb = x.div({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 2px',
});
const mb = x.div({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 6,
});
const hb = x.div({
  display: 'flex',
  gap: 6,
});
const gb = x.div(({ crashed: e, theme: t }) => ({
  fontSize: t.typography.size.s1,
  fontWeight: e ? 'bold' : 'normal',
  color: e ? t.color.negativeText : t.color.defaultText,
}));
const yb = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s1,
  color: e.textMutedColor,
}));
const bb = x($a)({
  margin: 2,
});
const vb = x(Hs)({
  width: 10,
});
const ld = /* @__PURE__ */ a(({ ...e }) => {
  const t = e.description;
  const o = e.title;
  const i = oe();
  return /* @__PURE__ */ s.createElement(
    fb,
    null,
    /* @__PURE__ */ s.createElement(
      mb,
      null,
      /* @__PURE__ */ s.createElement(
        gb,
        { crashed: e.crashed, id: 'testing-module-title' },
        /* @__PURE__ */ s.createElement(o, { ...e }),
      ),
      /* @__PURE__ */ s.createElement(
        yb,
        {
          id: 'testing-m\
odule-description',
        },
        /* @__PURE__ */ s.createElement(t, { ...e }),
      ),
    ),
    /* @__PURE__ */ s.createElement(
      hb,
      null,
      e.runnable &&
        /* @__PURE__ */ s.createElement(
          s.Fragment,
          null,
          e.running && e.cancellable
            ? /* @__PURE__ */ s.createElement(
                be,
                {
                  hasChrome: !1,
                  trigger: 'hover',
                  tooltip: /* @__PURE__ */ s.createElement(Xe, { note: `Stop ${e.name}` }),
                },
                /* @__PURE__ */ s.createElement(
                  me,
                  {
                    'aria-label': `Stop ${e.name}`,
                    variant: 'ghost',
                    padding: 'none',
                    onClick: () => i.cancelTestProvider(e.id),
                    disabled: e.cancelling,
                  },
                  /* @__PURE__ */ s.createElement(
                    bb,
                    {
                      percentage:
                        e.progress?.percentageCompleted ?? e.details?.buildProgressPercentage,
                    },
                    /* @__PURE__ */ s.createElement(vb, null),
                  ),
                ),
              )
            : /* @__PURE__ */ s.createElement(
                be,
                {
                  hasChrome: !1,
                  trigger: 'hover',
                  tooltip: /* @__PURE__ */ s.createElement(Xe, { note: `Start ${e.name}` }),
                },
                /* @__PURE__ */ s.createElement(
                  me,
                  {
                    'aria-label': `Start ${e.name}`,
                    variant: 'ghost',
                    padding: 'small',
                    onClick: () => i.runTestProvider(e.id),
                    disabled: e.crashed || e.running,
                  },
                  /* @__PURE__ */ s.createElement(Ms, null),
                ),
              ),
        ),
    ),
  );
}, 'LegacyRender');

// src/manager/components/sidebar/TestingModule.tsx
const Ji = 500;
const xb = It({
  '0%': { transform: 'rotate(0deg)' },
  '10%': { transform: 'rotate(10deg)' },
  '40%': { transform: 'rotate(170deg)' },
  '50%': { transform: 'rotate(180deg)' },
  '60%': { transform: 'rotate(190deg)' },
  '90%': { transform: 'rotate(350deg)' },
  '100%': { transform: 'rotate(360deg)' },
});
const Sb = x.div(({ crashed: e, failed: t, running: o, theme: i }) => ({
  position: 'relative',
  lineHeight: '20px',
  width: '100%',
  padding: 1,
  overflow: 'hidden',
  backgroundColor: `var(--sb-sidebar-bottom-card-background, ${i.background.content})`,
  borderRadius: `var(--sb-sidebar-bottom-card-border-radius, ${i.appBorderRadius + 1}px)`,
  boxShadow: `inset 0 0 0 1px ${e && !o ? i.color.negative : i.appBorderColor}, var(--sb-sidebar-bottom-card-box-shadow, 0 1px 2px 0 rgba(0,\
 0, 0, 0.05), 0px -5px 20px 10px ${i.background.app})`,
  transition: 'box-shadow 1s',
  '&:after': {
    content: '""',
    display: o ? 'block' : 'none',
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: 'calc(max(100vw, 100vh) * -0.5)',
    marginTop: 'calc(max(100vw, 100vh) * -0.5)',
    height: 'max(100vw, 100vh)',
    width: 'max(100vw, 100vh)',
    animation: `${xb} 3s linear infinite`,
    background: t
      ? // Hardcoded colors to prevent themes from messing with them (orange+gold, secondary+seafoam)
        'conic-gradient(transparent 90deg, #FC521F 150deg, #FFAE00 210deg, transparent 270deg)'
      : 'conic-gradient(transparent 90deg, #029CFD 150deg, #37D5D3 210deg, transparent 270deg)',
    opacity: 1,
    willChange: 'auto',
  },
}));
const Ib = x.div(({ theme: e }) => ({
  position: 'relative',
  zIndex: 1,
  borderRadius: e.appBorderRadius,
  backgroundColor: e.background.content,
  '&:hover #testing-module-collapse-toggle': {
    opacity: 1,
  },
}));
const Eb = x.div(({ theme: e }) => ({
  overflow: 'hidden',
  willChange: 'auto',
  boxShadow: `inset 0 -1px 0 ${e.appBorderColor}`,
}));
const _b = x.div({
  display: 'flex',
  flexDirection: 'column',
});
const wb = x.div(({ onClick: e }) => ({
  display: 'flex',
  width: '100%',
  cursor: e ? 'pointer' : 'default',
  userSelect: 'none',
  alignItems: 'center',
  justifyContent: 'space-between',
  overflow: 'hidden',
  padding: '6px',
}));
const Tb = x.div({
  display: 'flex',
  flexBasis: '100%',
  justifyContent: 'flex-end',
  gap: 6,
});
const Cb = x(me)({
  opacity: 0,
  transition: 'opacity 250ms',
  willChange: 'auto',
  '&:focus, &:hover': {
    opacity: 1,
  },
});
const ud = x(me)(
  { minWidth: 28 },
  ({ active: e, status: t, theme: o }) =>
    !e &&
    (o.base === 'light'
      ? {
          background: {
            negative: o.background.negative,
            warning: o.background.warning,
          }[t],
          color: {
            negative: o.color.negativeText,
            warning: o.color.warningText,
          }[t],
        }
      : {
          background: {
            negative: `${o.color.negative}22`,
            warning: `${o.color.warning}22`,
          }[t],
          color: {
            negative: o.color.negative,
            warning: o.color.warning,
          }[t],
        }),
);
const kb = x.div(({ theme: e }) => ({
  padding: 4,
  '&:not(:last-child)': {
    boxShadow: `inset 0 -1px 0 ${e.appBorderColor}`,
  },
}));
const cd = /* @__PURE__ */ a(
  ({
    testProviders: e,
    errorCount: t,
    errorsActive: o,
    setErrorsActive: i,
    warningCount: n,
    warningsActive: r,
    setWarningsActive: l,
  }) => {
    const u = oe();
    const c = Y(null);
    const p = Y(null);
    const [d, g] = $(Ji);
    const [h, y] = $(!0);
    const [f, b] = $(!1);
    j(() => {
      if (p.current) {
        g(p.current?.getBoundingClientRect().height || Ji);
        const E = new ResizeObserver(() => {
          requestAnimationFrame(() => {
            if (p.current && !h) {
              const T = p.current?.getBoundingClientRect().height || Ji;
              g(T);
            }
          });
        });
        return E.observe(p.current), () => E.disconnect();
      }
    }, [h]);
    const I = A(E => {
      E.stopPropagation(),
        b(!0),
        y(T => !T),
        c.current && clearTimeout(c.current),
        (c.current = setTimeout(() => {
          b(!1);
        }, 250));
    }, []);
    const _ = e.some(E => E.running);
    const m = e.some(E => E.crashed);
    const v = e.some(E => E.failed);
    const S = e.length > 0;
    return !S && (!t || !n)
      ? null
      : /* @__PURE__ */ s.createElement(
          Sb,
          {
            id: 'storybook-testing-module',
            running: _,
            crashed: m,
            failed: v || t > 0,
          },
          /* @__PURE__ */ s.createElement(
            Ib,
            null,
            S &&
              /* @__PURE__ */ s.createElement(
                Eb,
                {
                  'data-testid': 'collapse',
                  style: {
                    transition: f ? 'max-height 250ms' : 'max-height 0ms',
                    display: S ? 'block' : 'none',
                    maxHeight: h ? 0 : d,
                  },
                },
                /* @__PURE__ */ s.createElement(
                  _b,
                  { ref: p },
                  e.map(E => {
                    const { render: T } = E;
                    return /* @__PURE__ */ s.createElement(
                      kb,
                      { key: E.id, 'data-module-id': E.id },
                      T
                        ? /* @__PURE__ */ s.createElement(T, { ...E })
                        : /* @__PURE__ */ s.createElement(ld, { ...E }),
                    );
                  }),
                ),
              ),
            /* @__PURE__ */ s.createElement(
              wb,
              { ...(S ? { onClick: I } : {}) },
              S &&
                /* @__PURE__ */ s.createElement(
                  me,
                  {
                    variant: 'ghost',
                    padding: 'small',
                    onClick: E => {
                      E.stopPropagation(),
                        e
                          .filter(T => !T.running && T.runnable)
                          .forEach(({ id: T }) => u.runTestProvider(T));
                    },
                    disabled: _,
                  },
                  /* @__PURE__ */ s.createElement(Ds, null),
                  _ ? 'Running...' : 'Run tests',
                ),
              /* @__PURE__ */ s.createElement(
                Tb,
                null,
                S &&
                  /* @__PURE__ */ s.createElement(
                    be,
                    {
                      hasChrome: !1,
                      tooltip: /* @__PURE__ */ s.createElement(Xe, {
                        note: h ? 'Expand testing module' : 'Collapse testing module',
                      }),
                      trigger: 'hover',
                    },
                    /* @__PURE__ */ s.createElement(
                      Cb,
                      {
                        variant: 'ghost',
                        padding: 'small',
                        onClick: I,
                        id: 'testing-module-collapse-toggle',
                        'aria-label': h ? 'Expand testing module' : 'Collapse testing module',
                      },
                      /* @__PURE__ */ s.createElement(ys, {
                        style: {
                          transform: h ? 'none' : 'rotate(180deg)',
                          transition: 'transform 250ms',
                          willChange: 'auto',
                        },
                      }),
                    ),
                  ),
                t > 0 &&
                  /* @__PURE__ */ s.createElement(
                    be,
                    {
                      hasChrome: !1,
                      tooltip: /* @__PURE__ */ s.createElement(Xe, { note: 'Toggle errors' }),
                      trigger: 'hover',
                    },
                    /* @__PURE__ */ s.createElement(
                      ud,
                      {
                        id: 'errors-found-filter',
                        variant: 'ghost',
                        padding: t < 10 ? 'medium' : 'small',
                        status: 'negative',
                        active: o,
                        onClick: E => {
                          E.stopPropagation(), i(!o);
                        },
                        'aria-label': 'Toggle errors',
                      },
                      t < 100 ? t : '99+',
                    ),
                  ),
                n > 0 &&
                  /* @__PURE__ */ s.createElement(
                    be,
                    {
                      hasChrome: !1,
                      tooltip: /* @__PURE__ */ s.createElement(Xe, { note: 'Toggle warnings' }),
                      trigger: 'hover',
                    },
                    /* @__PURE__ */ s.createElement(
                      ud,
                      {
                        id: 'warnings-found-filter',
                        variant: 'ghost',
                        padding: n < 10 ? 'medium' : 'small',
                        status: 'warning',
                        active: r,
                        onClick: E => {
                          E.stopPropagation(), l(!r);
                        },
                        'aria-label': 'Toggle warnings',
                      },
                      n < 100 ? n : '99+',
                    ),
                  ),
              ),
            ),
          ),
        );
  },
  'TestingModule',
);

// src/manager/components/sidebar/SidebarBottom.tsx
const Ob = 'sidebar-bottom-spacer';
const Pb = 'sidebar-bottom-wrapper';
const Ab = /* @__PURE__ */ a(() => !0, 'filterNone');
const Db = /* @__PURE__ */ a(
  ({ status: e = {} }) => Object.values(e).some(t => t?.status === 'warn'),
  'filterWarn',
);
const Mb = /* @__PURE__ */ a(
  ({ status: e = {} }) => Object.values(e).some(t => t?.status === 'error'),
  'filterError',
);
const Lb = /* @__PURE__ */ a(
  ({ status: e = {} }) =>
    Object.values(e).some(
      t =>
        t?.status === 'warn' ||
        t?.status ===
          '\
error',
    ),
  'filterBoth',
);
const Nb = /* @__PURE__ */ a((e = !1, t = !1) => (e && t ? Lb : e ? Db : t ? Mb : Ab), 'getFilter');
const Rb = x.div({
  pointerEvents: 'none',
});
const Fb = x.div(({ theme: e }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '12px 0',
  margin: '0 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  color: e.color.defaultText,
  fontSize: e.typography.size.s1,
  overflow: 'hidden',
  '&:empty': {
    display: 'none',
  },
  // Integrators can use these to style their custom additions
  '--sb-sidebar-bottom-card-background': e.background.content,
  '--sb-sidebar-bottom-card-border': `1px solid ${e.appBorderColor}`,
  '--sb-sidebar-bottom-card-border-radius': `${e.appBorderRadius + 1}px`,
  '--sb-sidebar-bottom-card-box-shadow': `0 1px 2px 0 rgba(0, 0, 0, 0.05), 0px -5px 20px 10px ${e.background.app}`,
}));
const Hb = /* @__PURE__ */ a(
  ({ api: e, notifications: t = [], status: o = {}, isDevelopment: i }) => {
    const n = Y(null);
    const r = Y(null);
    const [l, u] = $(!1);
    const [c, p] = $(!1);
    const { testProviders: d } = Pe();
    const g = Object.values(o).filter(I => Object.values(I).some(_ => _?.status === 'warn'));
    const h = Object.values(o).filter(I => Object.values(I).some(_ => _?.status === 'error'));
    const y = g.length > 0;
    const f = h.length > 0;
    j(() => {
      if (n.current && r.current) {
        const I = new ResizeObserver(() => {
          n.current && r.current && (n.current.style.height = `${r.current.scrollHeight}px`);
        });
        return I.observe(r.current), () => I.disconnect();
      }
    }, []),
      j(() => {
        const I = Nb(y && l, f && c);
        e.experimental_setFilter('sidebar-bottom-filter', I);
      }, [e, y, f, l, c]),
      ft(() => {
        const I = /* @__PURE__ */ a(({ providerId: m, ...v }) => {
          e.updateTestProviderState(m, {
            error: { name: 'Crashed!', message: v.error.message },
            running: !1,
            crashed: !0,
          });
        }, 'onCrashReport');
        const _ = /* @__PURE__ */ a(async ({ providerId: m, ...v }) => {
          const S = 'status' in v ? v.status : void 0;
          e.updateTestProviderState(
            m,
            S === 'failed' ? { ...v, running: !1, failed: !0 } : { ...v, running: S === 'pending' },
          );
        }, 'onProgressReport');
        return (
          e.on(ln, I),
          e.on(un, _),
          () => {
            e.off(ln, I), e.off(un, _);
          }
        );
      }, [e, d]);
    const b = Object.values(d || {});
    return !y && !f && !b.length && !t.length
      ? null
      : /* @__PURE__ */ s.createElement(
          _e,
          null,
          /* @__PURE__ */ s.createElement(Rb, { id: Ob, ref: n }),
          /* @__PURE__ */ s.createElement(
            Fb,
            { id: Pb, ref: r },
            /* @__PURE__ */ s.createElement(ir, {
              notifications: t,
              clearNotification: e.clearNotification,
            }),
            i &&
              /* @__PURE__ */ s.createElement(cd, {
                testProviders: b,
                errorCount: h.length,
                errorsActive: c,
                setErrorsActive: p,
                warningCount: g.length,
                warningsActive: l,
                setWarningsActive: u,
              }),
          ),
        );
  },
  'SidebarBottomBase',
);
const pd = /* @__PURE__ */ a(({ isDevelopment: e }) => {
  const t = oe();
  const { notifications: o, status: i } = Pe();
  return /* @__PURE__ */ s.createElement(Hb, {
    api: t,
    notifications: o,
    status: i,
    isDevelopment: e,
  });
}, 'SidebarBottom');

// src/manager/components/sidebar/TagsFilterPanel.tsx
const Bb = /* @__PURE__ */ new Set(['play-fn']);
const zb = x.div({
  minWidth: 180,
  maxWidth: 220,
});
const dd = /* @__PURE__ */ a(
  ({ api: e, allTags: t, selectedTags: o, toggleTag: i, isDevelopment: n }) => {
    const r = t.filter(c => !Bb.has(c));
    const l = e.getDocsUrl({ subpath: 'writing-stories/tags#filtering-by-custom-tags' });
    const u = [
      t.map(c => {
        const p = o.includes(c);
        const d = `tag-${c}`;
        return {
          id: d,
          title: c,
          right: /* @__PURE__ */ s.createElement('input', {
            type: 'checkbox',
            id: d,
            name: d,
            value: c,
            checked: p,
            onChange: () => {},
          }),
          onClick: /* @__PURE__ */ a(() => i(c), 'onClick'),
        };
      }),
    ];
    return (
      t.length === 0 &&
        u.push([
          {
            id: 'no-tags',
            title: 'There are no tags. Use tags to organize and filter your Storybook.',
            isIndented: !1,
          },
        ]),
      r.length === 0 &&
        n &&
        u.push([
          {
            id: 'tags-docs',
            title: 'Learn how to add tags',
            icon: /* @__PURE__ */ s.createElement(at, null),
            href: l,
          },
        ]),
      /* @__PURE__ */ s.createElement(zb, null, /* @__PURE__ */ s.createElement(gt, { links: u }))
    );
  },
  'TagsFilterPanel',
);

// src/manager/components/sidebar/TagsFilter.tsx
const Wb = 'tags-filter';
const jb = /* @__PURE__ */ new Set([
  'dev',
  'docs-only',
  'test-only',
  'autodocs',
  'test',
  'attached-mdx',
  'unattached-mdx',
]);
const Vb = x.div({
  position: 'relative',
});
const Kb = x(Go)(({ theme: e }) => ({
  position: 'absolute',
  top: 7,
  right: 7,
  transform: 'translate(50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 3,
  height: 6,
  minWidth: 6,
  lineHeight: 'px',
  boxShadow: `${e.barSelectedColor} 0 0 0 1px inset`,
  fontSize: e.typography.size.s1 - 1,
  background: e.color.secondary,
  color: e.color.lightest,
}));
const fd = /* @__PURE__ */ a(
  ({ api: e, indexJson: t, initialSelectedTags: o = [], isDevelopment: i }) => {
    const [n, r] = $(o);
    const [l, u] = $(!1);
    const c = n.length > 0;
    j(() => {
      e.experimental_setFilter(Wb, y => (n.length === 0 ? !0 : n.some(f => y.tags?.includes(f))));
    }, [e, n]);
    const p = Object.values(t.entries).reduce(
      (y, f) => (
        f.tags?.forEach(b => {
          jb.has(b) || y.add(b);
        }),
        y
      ),
      /* @__PURE__ */ new Set(),
    );
    const d = A(
      y => {
        n.includes(y) ? r(n.filter(f => f !== y)) : r([...n, y]);
      },
      [n, r],
    );
    const g = A(
      y => {
        y.preventDefault(), u(!l);
      },
      [l, u],
    );
    if (p.size === 0 && !i) return null;
    const h = Array.from(p);
    return (
      h.sort(),
      /* @__PURE__ */ s.createElement(
        be,
        {
          placement: 'bottom',
          trigger: 'click',
          onVisibleChange: u,
          tooltip: () =>
            /* @__PURE__ */ s.createElement(dd, {
              api: e,
              allTags: h,
              selectedTags: n,
              toggleTag: d,
              isDevelopment: i,
            }),
          closeOnOutsideClick: !0,
        },
        /* @__PURE__ */ s.createElement(
          Vb,
          null,
          /* @__PURE__ */ s.createElement(
            te,
            { key: 'tags', title: 'Tag filters', active: c, onClick: g },
            /* @__PURE__ */ s.createElement(Ts, null),
          ),
          n.length > 0 && /* @__PURE__ */ s.createElement(Kb, null),
        ),
      )
    );
  },
  'TagsFilter',
);

// ../node_modules/es-toolkit/dist/compat/function/debounce.mjs
function es(e, t = 0, o = {}) {
  typeof o !== 'object' && (o = {});
  const { signal: i, leading: n = !1, trailing: r = !0, maxWait: l } = o;
  const u = Array(2);
  n && (u[0] = 'leading'), r && (u[1] = 'trailing');
  let c;
  let p = null;
  const d = _r(
    function (...y) {
      (c = e.apply(this, y)), (p = null);
    },
    t,
    { signal: i, edges: u },
  );
  const g = /* @__PURE__ */ a(function (...y) {
    if (l != null) {
      if (p === null) p = Date.now();
      else if (Date.now() - p >= l)
        return (c = e.apply(this, y)), (p = Date.now()), d.cancel(), d.schedule(), c;
    }
    return d.apply(this, y), c;
  }, 'debounced');
  const h = /* @__PURE__ */ a(() => (d.flush(), c), 'flush');
  return (g.cancel = d.cancel), (g.flush = h), g;
}
a(es, 'debounce');

// src/manager/components/sidebar/useLastViewed.ts
const Jr = ze(md(), 1);
const hd = es(e => Jr.default.set('lastViewedStoryIds', e), 1e3);
const gd = /* @__PURE__ */ a(e => {
  const t = K(() => {
    const n = Jr.default.get('lastViewedStoryIds');
    return !n || !Array.isArray(n)
      ? []
      : n.some(r => typeof r === 'object' && r.storyId && r.refId)
        ? n
        : [];
  }, [Jr.default]);
  const o = Y(t);
  const i = A(
    n => {
      const r = o.current;
      const l = r.findIndex(({ storyId: u, refId: c }) => u === n.storyId && c === n.refId);
      l !== 0 &&
        (l === -1
          ? (o.current = [n, ...r])
          : (o.current = [n, ...r.slice(0, l), ...r.slice(l + 1)]),
        hd(o.current));
    },
    [o],
  );
  return (
    j(() => {
      e && i(e);
    }, [e]),
    {
      getLastViewed: A(() => o.current, [o]),
      clearLastViewed: A(() => {
        (o.current = o.current.slice(0, 1)), hd(o.current);
      }, [o]),
    }
  );
}, 'useLastViewed');

// src/manager/components/sidebar/Sidebar.tsx
const st = 'storybook_internal';
const $b = x.nav(({ theme: e }) => ({
  position: 'absolute',
  zIndex: 1,
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: e.background.content,
  [Qe]: {
    background: e.background.app,
  },
}));
const Ub = x(lt)({
  paddingLeft: 12,
  paddingRight: 12,
  paddingBottom: 20,
  paddingTop: 16,
  flex: 1,
});
const Gb = x(Xe)({
  margin: 0,
});
const Yb = x(te)(({ theme: e }) => ({
  color: e.color.mediumdark,
  width: 32,
  height: 32,
  borderRadius: e.appBorderRadius + 2,
}));
const qb = s.memo(
  /* @__PURE__ */ a(({ children: t, condition: o }) => {
    const [i, n] = s.Children.toArray(t);
    return /* @__PURE__ */ s.createElement(
      s.Fragment,
      null,
      /* @__PURE__ */ s.createElement('div', { style: { display: o ? 'block' : 'none' } }, i),
      /* @__PURE__ */ s.createElement('div', { style: { display: o ? 'none' : 'block' } }, n),
    );
  }, 'Swap'),
);
const Qb = /* @__PURE__ */ a((e, t, o, i, n) => {
  const r = K(
    () => ({
      [st]: {
        index: e,
        filteredIndex: e,
        indexError: t,
        previewInitialized: o,
        status: i,
        title: null,
        id: st,
        url: 'iframe.html',
      },
      ...n,
    }),
    [n, e, t, o, i],
  );
  return K(() => ({ hash: r, entries: Object.entries(r) }), [r]);
}, 'useCombination');
const Xb = se.STORYBOOK_RENDERER === 'react';
const yd = s.memo(
  /* @__PURE__ */ a(
    ({
      // @ts-expect-error (non strict)
      storyId: t = null,
      refId: o = st,
      index: i,
      indexJson: n,
      indexError: r,
      status: l,
      previewInitialized: u,
      menu: c,
      extra: p,
      menuHighlighted: d = !1,
      enableShortcuts: g = !0,
      isDevelopment: h = se.CONFIG_TYPE === 'DEVELOPMENT',
      refs: y = {},
      onMenuClick: f,
      showCreateStoryButton: b = h && Xb,
    }) => {
      const [I, _] = $(!1);
      const m = K(() => t && { storyId: t, refId: o }, [t, o]);
      const v = Qb(i, r, u, l, y);
      const S = !i && !r;
      const E = gd(m);
      const { isMobile: T } = ge();
      const C = oe();
      return /* @__PURE__ */ s.createElement(
        $b,
        { className: 'container sidebar-container' },
        /* @__PURE__ */ s.createElement(
          Qo,
          { vertical: !0, offset: 3, scrollbarSize: 6 },
          /* @__PURE__ */ s.createElement(
            Ub,
            { row: 1.6 },
            /* @__PURE__ */ s.createElement(Kc, {
              className: 'sidebar-header',
              menuHighlighted: d,
              menu: c,
              extra: p,
              skipLinkHref: '#storybook-preview-wrapper',
              isLoading: S,
              onMenuClick: f,
            }),
            /* @__PURE__ */ s.createElement(
              nd,
              {
                dataset: v,
                enableShortcuts: g,
                searchBarContent:
                  b &&
                  /* @__PURE__ */ s.createElement(
                    s.Fragment,
                    null,
                    /* @__PURE__ */ s.createElement(
                      be,
                      {
                        trigger: 'hover',
                        hasChrome: !1,
                        tooltip: /* @__PURE__ */ s.createElement(Gb, {
                          note: 'Create a new story',
                        }),
                      },
                      /* @__PURE__ */ s.createElement(
                        Yb,
                        {
                          onClick: () => {
                            _(!0);
                          },
                          variant: 'outline',
                        },
                        /* @__PURE__ */ s.createElement(Ls, null),
                      ),
                    ),
                    /* @__PURE__ */ s.createElement(Vu, {
                      open: I,
                      onOpenChange: _,
                    }),
                  ),
                searchFieldContent:
                  n &&
                  /* @__PURE__ */ s.createElement(fd, { api: C, indexJson: n, isDevelopment: h }),
                ...E,
              },
              ({
                query: k,
                results: w,
                isBrowsing: O,
                closeMenu: P,
                getMenuProps: D,
                getItemProps: M,
                highlightedIndex: N,
              }) =>
                /* @__PURE__ */ s.createElement(
                  qb,
                  { condition: O },
                  /* @__PURE__ */ s.createElement(Bc, {
                    dataset: v,
                    selected: m,
                    isLoading: S,
                    isBrowsing: O,
                  }),
                  /* @__PURE__ */ s.createElement(ad, {
                    query: k,
                    results: w,
                    closeMenu: P,
                    getMenuProps: D,
                    getItemProps: M,
                    highlightedIndex: N,
                    enableShortcuts: g,
                    isLoading: S,
                    clearLastViewed: E.clearLastViewed,
                  }),
                ),
            ),
          ),
          T || S ? null : /* @__PURE__ */ s.createElement(pd, { isDevelopment: h }),
        ),
      );
    },
    'Sidebar',
  ),
);

// src/manager/container/Menu.tsx
const Zb = {
  storySearchField: 'storybook-explorer-searchfield',
  storyListMenu: 'storybook-explorer-menu',
  storyPanelRoot: 'storybook-panel-root',
};
const Jb = x.span(({ theme: e }) => ({
  display: 'inline-block',
  height: 16,
  lineHeight: '16px',
  textAlign: 'center',
  fontSize: '11px',
  background: e.base === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
  color: e.base === 'light' ? e.color.dark : e.textMutedColor,
  borderRadius: 2,
  userSelect: 'none',
  pointerEvents: 'none',
  padding: '0 6px',
}));
const e0 = x.code(
  ({ theme: e }) => `
  padding: 0;
  vertical-align: middle;

  & + & {
    margin-left: 6px;
  }
`,
);
const Be = /* @__PURE__ */ a(
  ({ keys: e }) =>
    /* @__PURE__ */ s.createElement(
      s.Fragment,
      null,
      /* @__PURE__ */ s.createElement(
        Jb,
        null,
        e.map((t, o) => /* @__PURE__ */ s.createElement(e0, { key: t }, qe([t]))),
      ),
    ),
  'Shortcut',
);
const bd = /* @__PURE__ */ a((e, t, o, i, n, r, l) => {
  const u = t.getShortcutKeys();
  const c = K(
    () => ({
      id: 'about',
      title: 'About your Storybook',
      onClick: /* @__PURE__ */ a(() => t.changeSettingsTab('about'), 'onClick'),
      icon: /* @__PURE__ */ s.createElement(ks, null),
    }),
    [t],
  );
  const p = K(
    () => ({
      id: 'documentation',
      title: 'Documentation',
      href: t.getDocsUrl({ versioned: !0, renderer: !0 }),
      icon: /* @__PURE__ */ s.createElement(at, null),
    }),
    [t],
  );
  const d = e.whatsNewData?.status === 'SUCCESS' && !e.disableWhatsNewNotifications;
  const g = t.isWhatsNewUnread();
  const h = K(
    () => ({
      id: 'whats-new',
      title: "What's new?",
      onClick: /* @__PURE__ */ a(() => t.changeSettingsTab('whats-new'), 'onClick'),
      right: d && g && /* @__PURE__ */ s.createElement(Go, { status: 'positive' }, 'Check it out'),
      icon: /* @__PURE__ */ s.createElement(js, null),
    }),
    [t, d, g],
  );
  const y = K(
    () => ({
      id: 'shortcuts',
      title: 'Keyboard shortcuts',
      onClick: /* @__PURE__ */ a(() => t.changeSettingsTab('shortcuts'), 'onClick'),
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.shortcutsPage }) : null,
    }),
    [t, l, u.shortcutsPage],
  );
  const f = K(
    () => ({
      id: 'S',
      title: 'Show sidebar',
      onClick: /* @__PURE__ */ a(() => t.toggleNav(), 'onClick'),
      active: r,
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.toggleNav }) : null,
      icon: r ? /* @__PURE__ */ s.createElement(We, null) : null,
    }),
    [t, l, u, r],
  );
  const b = K(
    () => ({
      id: 'T',
      title: 'Show toolbar',
      onClick: /* @__PURE__ */ a(() => t.toggleToolbar(), 'onClick'),
      active: o,
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.toolbar }) : null,
      icon: o ? /* @__PURE__ */ s.createElement(We, null) : null,
    }),
    [t, l, u, o],
  );
  const I = K(
    () => ({
      id: 'A',
      title: 'Show addons',
      onClick: /* @__PURE__ */ a(() => t.togglePanel(), 'onClick'),
      active: n,
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.togglePanel }) : null,
      icon: n ? /* @__PURE__ */ s.createElement(We, null) : null,
    }),
    [t, l, u, n],
  );
  const _ = K(
    () => ({
      id: 'D',
      title: 'Change addons orientation',
      onClick: /* @__PURE__ */ a(() => t.togglePanelPosition(), 'onClick'),
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.panelPosition }) : null,
    }),
    [t, l, u],
  );
  const m = K(
    () => ({
      id: 'F',
      title: 'Go full screen',
      onClick: /* @__PURE__ */ a(() => t.toggleFullscreen(), 'onClick'),
      active: i,
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.fullScreen }) : null,
      icon: i ? /* @__PURE__ */ s.createElement(We, null) : null,
    }),
    [t, l, u, i],
  );
  const v = K(
    () => ({
      id: '/',
      title: 'Search',
      onClick: /* @__PURE__ */ a(() => t.focusOnUIElement(Zb.storySearchField), 'onClick'),
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.search }) : null,
    }),
    [t, l, u],
  );
  const S = K(
    () => ({
      id: 'up',
      title: 'Previous component',
      onClick: /* @__PURE__ */ a(() => t.jumpToComponent(-1), 'onClick'),
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.prevComponent }) : null,
    }),
    [t, l, u],
  );
  const E = K(
    () => ({
      id: 'down',
      title: 'Next component',
      onClick: /* @__PURE__ */ a(() => t.jumpToComponent(1), 'onClick'),
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.nextComponent }) : null,
    }),
    [t, l, u],
  );
  const T = K(
    () => ({
      id: 'prev',
      title: 'Previous story',
      onClick: /* @__PURE__ */ a(() => t.jumpToStory(-1), 'onClick'),
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.prevStory }) : null,
    }),
    [t, l, u],
  );
  const C = K(
    () => ({
      id: 'next',
      title: 'Next story',
      onClick: /* @__PURE__ */ a(() => t.jumpToStory(1), 'onClick'),
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.nextStory }) : null,
    }),
    [t, l, u],
  );
  const k = K(
    () => ({
      id: 'collapse',
      title: 'Collapse all',
      onClick: /* @__PURE__ */ a(() => t.emit(io), 'onClick'),
      right: l ? /* @__PURE__ */ s.createElement(Be, { keys: u.collapseAll }) : null,
    }),
    [t, l, u],
  );
  const w = A(() => {
    const O = t.getAddonsShortcuts();
    const P = u;
    return Object.entries(O)
      .filter(([D, { showInMenu: M }]) => M)
      .map(([D, { label: M, action: N }]) => ({
        id: D,
        title: M,
        onClick: /* @__PURE__ */ a(() => N(), 'onClick'),
        right: l ? /* @__PURE__ */ s.createElement(Be, { keys: P[D] }) : null,
      }));
  }, [t, l, u]);
  return K(
    () => [
      [c, ...(e.whatsNewData?.status === 'SUCCESS' ? [h] : []), p, y],
      [f, b, I, _, m, v, S, E, T, C, k],
      w(),
    ],
    [c, e, h, p, y, f, b, I, _, m, v, S, E, T, C, k, w],
  );
}, 'useMenu');

// src/manager/container/Sidebar.tsx
const t0 = s.memo(
  /* @__PURE__ */ a(
    ({ onMenuClick: t }) =>
      s.createElement(
        he,
        {
          filter: /* @__PURE__ */ a(({ state: i, api: n }) => {
            const {
              ui: { name: r, url: l, enableShortcuts: u },
              viewMode: c,
              storyId: p,
              refId: d,
              layout: { showToolbar: g },
              // FIXME: This is the actual `index.json` index where the `index` below
              // is actually the stories hash. We should fix this up and make it consistent.
              // eslint-disable-next-line @typescript-eslint/naming-convention
              internal_index: h,
              filteredIndex: y,
              status: f,
              indexError: b,
              previewInitialized: I,
              refs: _,
            } = i;
            const m = bd(i, n, g, n.getIsFullscreen(), n.getIsPanelShown(), n.getIsNavShown(), u);
            const v = i.whatsNewData?.status === 'SUCCESS' && !i.disableWhatsNewNotifications;
            const S = n.getElements(Te.experimental_SIDEBAR_TOP);
            const E = K(() => Object.values(S), [Object.keys(S).join('')]);
            return {
              title: r,
              url: l,
              indexJson: h,
              index: y,
              indexError: b,
              status: f,
              previewInitialized: I,
              refs: _,
              storyId: p,
              refId: d,
              viewMode: c,
              menu: m,
              menuHighlighted: v && n.isWhatsNewUnread(),
              enableShortcuts: u,
              extra: E,
            };
          }, 'mapper'),
        },
        i => /* @__PURE__ */ s.createElement(yd, { ...i, onMenuClick: t }),
      ),
    'Sideber',
  ),
);
const vd = t0;

// src/manager/App.tsx
const xd = /* @__PURE__ */ a(
  ({ managerLayoutState: e, setManagerLayoutState: t, pages: o, hasTab: i }) => {
    const { setMobileAboutOpen: n } = ge();
    return /* @__PURE__ */ s.createElement(
      s.Fragment,
      null,
      /* @__PURE__ */ s.createElement(Ut, { styles: da }),
      /* @__PURE__ */ s.createElement(vl, {
        hasTab: i,
        managerLayoutState: e,
        setManagerLayoutState: t,
        slotMain: /* @__PURE__ */ s.createElement(du, { id: 'main', withLoader: !0 }),
        slotSidebar: /* @__PURE__ */ s.createElement(vd, { onMenuClick: () => n(r => !r) }),
        slotPanel: /* @__PURE__ */ s.createElement(Il, null),
        slotPages: o.map(({ id: r, render: l }) => /* @__PURE__ */ s.createElement(l, { key: r })),
      }),
    );
  },
  'App',
);

// src/manager/provider.ts
const ts = class ts {
  getElements(t) {
    throw new Error('Provider.getElements() is not implemented!');
  }
  handleAPI(t) {
    throw new Error('Provider.handleAPI() is not implemented!');
  }
  getConfig() {
    return console.error('Provider.getConfig() is not implemented!'), {};
  }
};
a(ts, 'Provider');
const Wt = ts;

// src/manager/settings/About.tsx
const o0 = x.div({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  marginTop: 40,
});
const r0 = x.header({
  marginBottom: 32,
  alignItems: 'center',
  display: 'flex',
  '> svg': {
    height: 48,
    width: 'auto',
    marginRight: 8,
  },
});
const n0 = x.div(({ theme: e }) => ({
  marginBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: e.base === 'light' ? e.color.dark : e.color.lightest,
  fontWeight: e.typography.weight.regular,
  fontSize: e.typography.size.s2,
}));
const i0 = x.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 24,
  marginTop: 24,
  gap: 16,
});
const Sd = x(Me)(({ theme: e }) => ({
  '&&': {
    fontWeight: e.typography.weight.bold,
    color: e.base === 'light' ? e.color.dark : e.color.light,
  },
  '&:hover': {
    color: e.base === 'light' ? e.color.darkest : e.color.lightest,
  },
}));
const Id = /* @__PURE__ */ a(
  ({ onNavigateToWhatsNew: e }) =>
    /* @__PURE__ */ s.createElement(
      o0,
      null,
      /* @__PURE__ */ s.createElement(
        r0,
        null,
        /* @__PURE__ */ s.createElement(Xo, { alt: 'Storybook' }),
      ),
      /* @__PURE__ */ s.createElement(sr, { onNavigateToWhatsNew: e }),
      /* @__PURE__ */ s.createElement(
        n0,
        null,
        /* @__PURE__ */ s.createElement(
          i0,
          null,
          /* @__PURE__ */ s.createElement(
            me,
            { asChild: !0 },
            /* @__PURE__ */ s.createElement(
              'a',
              { href: 'https://github.com/storybookjs/storybook' },
              /* @__PURE__ */ s.createElement(Do, null),
              'GitHub',
            ),
          ),
          /* @__PURE__ */ s.createElement(
            me,
            { asChild: !0 },
            /* @__PURE__ */ s.createElement(
              'a',
              { href: 'https://storybook.js.org/docs' },
              /* @__PURE__ */ s.createElement($t, {
                style: {
                  display: 'inline',
                  marginRight: 5,
                },
              }),
              'Documentation',
            ),
          ),
        ),
        /* @__PURE__ */ s.createElement(
          'div',
          null,
          'Open source software maintained by',
          ' ',
          /* @__PURE__ */ s.createElement(Sd, { href: 'https://www.chromatic.com/' }, 'Chromatic'),
          ' and the',
          ' ',
          /* @__PURE__ */ s.createElement(
            Sd,
            { href: 'https://github.com/storybookjs/storybook/graphs/contributors' },
            'Storybook Community',
          ),
        ),
      ),
    ),
  'AboutScreen',
);

// src/manager/settings/AboutPage.tsx
const rs = class rs extends Re {
  componentDidMount() {
    const { api: t, notificationId: o } = this.props;
    t.clearNotification(o);
  }
  render() {
    const { children: t } = this.props;
    return t;
  }
};
a(rs, 'NotificationClearer');
const os = rs;
const Ed = /* @__PURE__ */ a(() => {
  const e = oe();
  const t = Pe();
  const o = A(() => {
    e.changeSettingsTab('whats-new');
  }, [e]);
  return /* @__PURE__ */ s.createElement(
    os,
    { api: e, notificationId: 'update' },
    /* @__PURE__ */ s.createElement(Id, {
      onNavigateToWhatsNew: t.whatsNewData?.status === 'SUCCESS' ? o : void 0,
    }),
  );
}, 'AboutPage');

// src/manager/settings/SettingsFooter.tsx
const s0 = x.div(({ theme: e }) => ({
  display: 'flex',
  paddingTop: 20,
  marginTop: 20,
  borderTop: `1px solid ${e.appBorderColor}`,
  fontWeight: e.typography.weight.bold,
  '& > * + *': {
    marginLeft: 20,
  },
}));
const a0 = /* @__PURE__ */ a(
  e =>
    /* @__PURE__ */ s.createElement(
      s0,
      { ...e },
      /* @__PURE__ */ s.createElement(
        Me,
        {
          secondary: !0,
          href: '\
https://storybook.js.org',
          cancel: !1,
          target: '_blank',
        },
        'Docs',
      ),
      /* @__PURE__ */ s.createElement(
        Me,
        {
          secondary: !0,
          href: 'https://gith\
ub.com/storybookjs/storybook',
          cancel: !1,
          target: '_blank',
        },
        'GitHub',
      ),
      /* @__PURE__ */ s.createElement(
        Me,
        {
          secondary: !0,
          href: 'https://storybook.js.org/community#support',
          cancel: !1,
          target: '_blank',
        },
        'Support',
      ),
    ),
  'SettingsFooter',
);
const _d = a0;

// src/manager/settings/shortcuts.tsx
const l0 = x.header(({ theme: e }) => ({
  marginBottom: 20,
  fontSize: e.typography.size.m3,
  fontWeight: e.typography.weight.bold,
  alignItems: 'center',
  display: 'flex',
}));
const wd = x.div(({ theme: e }) => ({
  fontWeight: e.typography.weight.bold,
}));
const u0 = x.div({
  alignSelf: 'flex-end',
  display: 'grid',
  margin: '10px 0',
  gridTemplateColumns: '1fr 1fr 12px',
  '& > *:last-of-type': {
    gridColumn: '2 / 2',
    justifySelf: 'flex-end',
    gridRow: '1',
  },
});
const c0 = x.div(({ theme: e }) => ({
  padding: '6px 0',
  borderTop: `1px solid ${e.appBorderColor}`,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 0px',
}));
const p0 = x.div({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gridAutoRows: 'minmax(auto, auto)',
  marginBottom: 20,
});
const d0 = x.div({
  alignSelf: 'center',
});
const f0 = x(Yo.Input)(
  ({ valid: e, theme: t }) =>
    e === 'error'
      ? {
          animation: `${t.animation.jiggle} 700ms ease-out`,
        }
      : {},
  {
    display: 'flex',
    width: 80,
    flexDirection: 'column',
    justifySelf: 'flex-end',
    paddingLeft: 4,
    paddingRight: 4,
    textAlign: 'center',
  },
);
const m0 = It`
0%,100% { opacity: 0; }
  50% { opacity: 1; }
`;
const h0 = x(We)(
  ({ valid: e, theme: t }) =>
    e === 'valid'
      ? {
          color: t.color.positive,
          animation: `${m0} 2s ease forwards`,
        }
      : {
          opacity: 0,
        },
  {
    alignSelf: 'center',
    display: 'flex',
    marginLeft: 10,
    height: 14,
    width: 14,
  },
);
const g0 = x.div(({ theme: e }) => ({
  fontSize: e.typography.size.s2,
  padding: '3rem 20px',
  maxWidth: 600,
  margin: '0 auto',
}));
const y0 = {
  fullScreen: 'Go full screen',
  togglePanel: 'Toggle addons',
  panelPosition: 'Toggle addons orientation',
  toggleNav: 'Toggle sidebar',
  toolbar: 'Toggle canvas toolbar',
  search: 'Focus search',
  focusNav: 'Focus sidebar',
  focusIframe: 'Focus canvas',
  focusPanel: 'Focus addons',
  prevComponent: 'Previous component',
  nextComponent: 'Next component',
  prevStory: 'Previous story',
  nextStory: 'Next story',
  shortcutsPage: 'Go to shortcuts page',
  aboutPage: 'Go to about page',
  collapseAll: 'Collapse all items on sidebar',
  expandAll: 'Expand all items on sidebar',
  remount: 'Remount component',
};
const b0 = ['escape'];
function ns(e) {
  return Object.entries(e).reduce(
    // @ts-expect-error (non strict)
    (t, [o, i]) => (b0.includes(o) ? t : { ...t, [o]: { shortcut: i, error: !1 } }),
    {},
  );
}
a(ns, 'toShortcutState');
const is = class is extends Re {
  constructor(o) {
    super(o);
    this.onKeyDown = /* @__PURE__ */ a(o => {
      const { activeFeature: i, shortcutKeys: n } = this.state;
      if (o.key === 'Backspace') return this.restoreDefault();
      const r = ia(o);
      if (!r) return !1;
      const l = !!Object.entries(n).find(([u, { shortcut: c }]) => u !== i && c && sa(r, c));
      return this.setState({
        shortcutKeys: { ...n, [i]: { shortcut: r, error: l } },
      });
    }, 'onKeyDown');
    this.onFocus = /* @__PURE__ */ a(
      o => () => {
        const { shortcutKeys: i } = this.state;
        this.setState({
          activeFeature: o,
          shortcutKeys: {
            ...i,
            [o]: { shortcut: null, error: !1 },
          },
        });
      },
      'onFocus',
    );
    this.onBlur = /* @__PURE__ */ a(async () => {
      const { shortcutKeys: o, activeFeature: i } = this.state;
      if (o[i]) {
        const { shortcut: n, error: r } = o[i];
        return !n || r ? this.restoreDefault() : this.saveShortcut();
      }
      return !1;
    }, 'onBlur');
    this.saveShortcut = /* @__PURE__ */ a(async () => {
      const { activeFeature: o, shortcutKeys: i } = this.state;
      const { setShortcut: n } = this.props;
      await n(o, i[o].shortcut), this.setState({ successField: o });
    }, 'saveShortcut');
    this.restoreDefaults = /* @__PURE__ */ a(async () => {
      const { restoreAllDefaultShortcuts: o } = this.props;
      const i = await o();
      return this.setState({ shortcutKeys: ns(i) });
    }, 'restoreDefaults');
    this.restoreDefault = /* @__PURE__ */ a(async () => {
      const { activeFeature: o, shortcutKeys: i } = this.state;
      const { restoreDefaultShortcut: n } = this.props;
      const r = await n(o);
      return this.setState({
        shortcutKeys: {
          ...i,
          ...ns({ [o]: r }),
        },
      });
    }, 'restoreDefault');
    this.displaySuccessMessage = /* @__PURE__ */ a(o => {
      const { successField: i, shortcutKeys: n } = this.state;
      return o === i && n[o].error === !1 ? 'valid' : void 0;
    }, 'displaySuccessMessage');
    this.displayError = /* @__PURE__ */ a(o => {
      const { activeFeature: i, shortcutKeys: n } = this.state;
      return o === i && n[o].error === !0 ? 'error' : void 0;
    }, 'displayError');
    this.renderKeyInput = /* @__PURE__ */ a(() => {
      const { shortcutKeys: o, addonsShortcutLabels: i } = this.state;
      return Object.entries(o).map(([r, { shortcut: l }]) =>
        /* @__PURE__ */ s.createElement(
          c0,
          { key: r },
          /* @__PURE__ */ s.createElement(d0, null, y0[r] || i[r]),
          /* @__PURE__ */ s.createElement(f0, {
            spellCheck: 'false',
            valid: this.displayError(r),
            className: 'modalInput',
            onBlur: this.onBlur,
            onFocus: this.onFocus(r),
            onKeyDown: this.onKeyDown,
            value: l ? qe(l) : '',
            placeholder: 'Type keys',
            readOnly: !0,
          }),
          /* @__PURE__ */ s.createElement(h0, { valid: this.displaySuccessMessage(r) }),
        ),
      );
    }, 'renderKeyInput');
    this.renderKeyForm = /* @__PURE__ */ a(
      () =>
        /* @__PURE__ */ s.createElement(
          p0,
          null,
          /* @__PURE__ */ s.createElement(
            u0,
            null,
            /* @__PURE__ */ s.createElement(wd, null, 'Commands'),
            /* @__PURE__ */ s.createElement(wd, null, 'Shortcut'),
          ),
          this.renderKeyInput(),
        ),
      'renderKeyForm',
    );
    this.state = {
      // @ts-expect-error (non strict)
      activeFeature: void 0,
      // @ts-expect-error (non strict)
      successField: void 0,
      // The initial shortcutKeys that come from props are the defaults/what was saved
      // As the user interacts with the page, the state stores the temporary, unsaved shortcuts
      // This object also includes the error attached to each shortcut
      // @ts-expect-error (non strict)
      shortcutKeys: ns(o.shortcutKeys),
      addonsShortcutLabels: o.addonsShortcutLabels,
    };
  }
  render() {
    const o = this.renderKeyForm();
    return /* @__PURE__ */ s.createElement(
      g0,
      null,
      /* @__PURE__ */ s.createElement(l0, null, 'Keyboard shortcuts'),
      o,
      /* @__PURE__ */ s.createElement(
        me,
        {
          variant: 'outline',
          size: 'small',
          id: 'restoreDefaultsHotkeys',
          onClick: this.restoreDefaults,
        },
        'Restore defaults',
      ),
      /* @__PURE__ */ s.createElement(_d, null),
    );
  }
};
a(is, 'ShortcutsScreen');
const en = is;

// src/manager/settings/ShortcutsPage.tsx
const Td = /* @__PURE__ */ a(
  () =>
    /* @__PURE__ */ s.createElement(
      he,
      null,
      ({
        api: {
          getShortcutKeys: e,
          getAddonsShortcutLabels: t,
          setShortcut: o,
          restoreDefaultShortcut: i,
          restoreAllDefaultShortcuts: n,
        },
      }) =>
        /* @__PURE__ */ s.createElement(en, {
          shortcutKeys: e(),
          addonsShortcutLabels: t(),
          setShortcut: o,
          restoreDefaultShortcut: i,
          restoreAllDefaultShortcuts: n,
        }),
    ),
  'ShortcutsPage',
);

// src/manager/settings/whats_new.tsx
const Cd = x.div({
  top: '50%',
  position: 'absolute',
  transform: 'translateY(-50%)',
  width: '100%',
  textAlign: 'center',
});
const v0 = x.div({
  position: 'relative',
  height: '32px',
});
const kd = x.div(({ theme: e }) => ({
  paddingTop: '12px',
  color: e.textMutedColor,
  maxWidth: '295px',
  margin: '0 auto',
  fontSize: `${e.typography.size.s1}px`,
  lineHeight: '16px',
}));
const x0 = x.div(({ theme: e }) => ({
  position: 'absolute',
  width: '100%',
  bottom: '40px',
  background: e.background.bar,
  fontSize: '13px',
  borderTop: '1px solid',
  borderColor: e.appBorderColor,
  padding: '8px 12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));
const S0 = /* @__PURE__ */ a(
  ({ isNotificationsEnabled: e, onToggleNotifications: t, onCopyLink: o }) => {
    const i = Ae();
    const [n, r] = $('Copy Link');
    const l = /* @__PURE__ */ a(() => {
      o(), r('Copied!'), setTimeout(() => r('Copy Link'), 4e3);
    }, 'copyLink');
    return /* @__PURE__ */ s.createElement(
      x0,
      null,
      /* @__PURE__ */ s.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 10 } },
        /* @__PURE__ */ s.createElement(Cs, { color: i.color.mediumdark }),
        /* @__PURE__ */ s.createElement(
          'div',
          null,
          'Share this with your tea\
m.',
        ),
        /* @__PURE__ */ s.createElement(me, { onClick: l, size: 'small', variant: 'ghost' }, n),
      ),
      e
        ? /* @__PURE__ */ s.createElement(
            me,
            {
              size: '\
small',
              variant: 'ghost',
              onClick: t,
            },
            /* @__PURE__ */ s.createElement(Es, null),
            'Hide notifications',
          )
        : /* @__PURE__ */ s.createElement(
            me,
            { size: 'small', variant: 'ghost', onClick: t },
            /* @__PURE__ */ s.createElement(_s, null),
            'Show notifications',
          ),
    );
  },
  'WhatsNewFooter',
);
const I0 = x.iframe(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: 0,
    margin: 0,
    padding: 0,
    width: '100%',
    height: 'calc(100% - 80px)',
    background: 'white',
  },
  ({ isLoaded: e }) => ({ visibility: e ? 'visible' : 'hidden' }),
);
const E0 = x(e => /* @__PURE__ */ s.createElement(Oo, { ...e }))(({ theme: e }) => ({
  color: e.textMutedColor,
  width: 32,
  height: 32,
  margin: '0 auto',
}));
const _0 = /* @__PURE__ */ a(
  () =>
    /* @__PURE__ */ s.createElement(
      Cd,
      null,
      /* @__PURE__ */ s.createElement(v0, null, /* @__PURE__ */ s.createElement(qo, null)),
      /* @__PURE__ */ s.createElement(kd, null, 'Loading...'),
    ),
  'WhatsNewLoader',
);
const w0 = /* @__PURE__ */ a(
  () =>
    /* @__PURE__ */ s.createElement(
      Cd,
      null,
      /* @__PURE__ */ s.createElement(E0, null),
      /* @__PURE__ */ s.createElement(
        kd,
        null,
        "The page couldn't be loaded. Check your inte\
rnet connection and try again.",
      ),
    ),
  'MaxWaitTimeMessaging',
);
const T0 = /* @__PURE__ */ a(
  ({
    didHitMaxWaitTime: e,
    isLoaded: t,
    onLoad: o,
    url: i,
    onCopyLink: n,
    onToggleNotifications: r,
    isNotificationsEnabled: l,
  }) =>
    /* @__PURE__ */ s.createElement(
      _e,
      null,
      !t && !e && /* @__PURE__ */ s.createElement(_0, null),
      e
        ? /* @__PURE__ */ s.createElement(w0, null)
        : /* @__PURE__ */ s.createElement(
            s.Fragment,
            null,
            /* @__PURE__ */ s.createElement(I0, {
              isLoaded: t,
              onLoad: o,
              src: i,
              title:
                "What\
's new?",
            }),
            /* @__PURE__ */ s.createElement(S0, {
              isNotificationsEnabled: l,
              onToggleNotifications: r,
              onCopyLink: n,
            }),
          ),
    ),
  'PureWhatsNewScreen',
);
const C0 = 1e4;
const Od = /* @__PURE__ */ a(() => {
  const e = oe();
  const t = Pe();
  const { whatsNewData: o } = t;
  const [i, n] = $(!1);
  const [r, l] = $(!1);
  if (
    (j(() => {
      const c = setTimeout(() => !i && l(!0), C0);
      return () => clearTimeout(c);
    }, [i]),
    o?.status !== 'SUCCESS')
  )
    return null;
  const u = !o.disableWhatsNewNotifications;
  return /* @__PURE__ */ s.createElement(T0, {
    didHitMaxWaitTime: r,
    isLoaded: i,
    onLoad: () => {
      e.whatsNewHasBeenRead(), n(!0);
    },
    url: o.url,
    isNotificationsEnabled: u,
    onCopyLink: () => {
      navigator.clipboard?.writeText(o.blogUrl ?? o.url);
    },
    onToggleNotifications: () => {
      u
        ? se.confirm('All update notifications will no longer be shown. Are you sure?') &&
          e.toggleWhatsNewNotifications()
        : e.toggleWhatsNewNotifications();
    },
  });
}, 'WhatsNewScreen');

// src/manager/settings/whats_new_page.tsx
const Pd = /* @__PURE__ */ a(() => /* @__PURE__ */ s.createElement(Od, null), 'WhatsNewPage');

// src/manager/settings/index.tsx
const { document: Ad } = se;
const k0 = x.div(({ theme: e }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: 40,
  boxShadow: `${e.appBorderColor}  0 -1px 0 0 inset`,
  background: e.barBg,
  paddingRight: 8,
}));
const ss = s.memo(
  /* @__PURE__ */ a(
    ({ changeTab: t, id: o, title: i }) =>
      s.createElement(Wo, null, ({ path: n }) => {
        const r = n.includes(`settings/${o}`);
        return /* @__PURE__ */ s.createElement(
          Jo,
          {
            id: `tabbutton-${o}`,
            className: ['tabbutton'].concat(r ? ['tabbutton-active'] : []).join(' '),
            type: 'button',
            key: 'id',
            active: r,
            onClick: () => t(o),
            role: 'tab',
          },
          i,
        );
      }),
    'TabBarButton',
  ),
);
const O0 = x(Qo)(({ theme: e }) => ({
  background: e.background.content,
}));
const P0 = /* @__PURE__ */ a(
  ({ changeTab: e, onClose: t, enableShortcuts: o = !0, enableWhatsNew: i }) => (
    s.useEffect(() => {
      const n = /* @__PURE__ */ a(r => {
        !o || r.repeat || (vt(!1, r) && Ve('Escape', r) && (r.preventDefault(), t()));
      }, 'handleEscape');
      return Ad.addEventListener('keydown', n), () => Ad.removeEventListener('keydown', n);
    }, [o, t]),
    /* @__PURE__ */ s.createElement(
      _e,
      null,
      /* @__PURE__ */ s.createElement(
        k0,
        { className: 'sb-bar' },
        /* @__PURE__ */ s.createElement(
          Zo,
          { role: 'tablist' },
          /* @__PURE__ */ s.createElement(ss, { id: 'about', title: 'About', changeTab: e }),
          i &&
            /* @__PURE__ */ s.createElement(ss, {
              id: 'whats-new',
              title: "What's new?",
              changeTab: e,
            }),
          /* @__PURE__ */ s.createElement(ss, {
            id: 'shortcuts',
            title:
              'Keyboard shortc\
uts',
            changeTab: e,
          }),
        ),
        /* @__PURE__ */ s.createElement(
          te,
          {
            onClick: n => (n.preventDefault(), t()),
            title: 'Close settings page',
          },
          /* @__PURE__ */ s.createElement(Ge, null),
        ),
      ),
      /* @__PURE__ */ s.createElement(
        O0,
        { vertical: !0, horizontal: !1 },
        /* @__PURE__ */ s.createElement(
          so,
          { path: 'about' },
          /* @__PURE__ */ s.createElement(Ed, { key: 'about' }),
        ),
        /* @__PURE__ */ s.createElement(
          so,
          { path: 'whats-new' },
          /* @__PURE__ */ s.createElement(Pd, {
            key: '\
whats-new',
          }),
        ),
        /* @__PURE__ */ s.createElement(
          so,
          { path: 'shortcuts' },
          /* @__PURE__ */ s.createElement(Td, { key: 'shortcuts' }),
        ),
      ),
    )
  ),
  'P\
ages',
);
const A0 = /* @__PURE__ */ a(() => {
  const e = oe();
  const t = Pe();
  const o = /* @__PURE__ */ a(i => e.changeSettingsTab(i), 'changeTab');
  return /* @__PURE__ */ s.createElement(P0, {
    enableWhatsNew: t.whatsNewData?.status === 'SUCCESS',
    enableShortcuts: t.ui.enableShortcuts,
    changeTab: o,
    onClose: e.closeSettings,
  });
}, 'SettingsPages');
const Dd = {
  id: 'settings',
  url: '/settings/',
  title: 'Settings',
  type: ve.experimental_PAGE,
  render: /* @__PURE__ */ a(
    () =>
      /* @__PURE__ */ s.createElement(
        so,
        { path: '/settings/', startsWith: !0 },
        /* @__PURE__ */ s.createElement(A0, null),
      ),
    'render',
  ),
};

// src/manager/index.tsx
cn.displayName = 'ThemeProvider';
ht.displayName = 'HelmetProvider';
const D0 = /* @__PURE__ */ a(
  ({ provider: e }) =>
    /* @__PURE__ */ s.createElement(
      ht,
      { key: 'helmet.Provider' },
      /* @__PURE__ */ s.createElement(
        ua,
        { key: 'location.provider' },
        /* @__PURE__ */ s.createElement(M0, { provider: e }),
      ),
    ),
  'Root',
);
const M0 = /* @__PURE__ */ a(({ provider: e }) => {
  const t = pa();
  return /* @__PURE__ */ s.createElement(Wo, { key: 'location.consumer' }, o =>
    /* @__PURE__ */ s.createElement(
      na,
      {
        key: 'manager',
        provider: e,
        ...o,
        navigate: t,
        docsOptions: se?.DOCS_OPTIONS || {},
      },
      i => {
        const { state: n, api: r } = i;
        const l = A(
          c => {
            r.setSizes(c);
          },
          [r],
        );
        const u = K(
          () => [Dd, ...Object.values(r.getElements(ve.experimental_PAGE))],
          [Object.keys(r.getElements(ve.experimental_PAGE)).join()],
        );
        return /* @__PURE__ */ s.createElement(
          cn,
          { key: 'theme.provider', theme: fa(n.theme) },
          /* @__PURE__ */ s.createElement(
            Wa,
            null,
            /* @__PURE__ */ s.createElement(xd, {
              key: 'app',
              pages: u,
              managerLayoutState: {
                ...n.layout,
                viewMode: n.viewMode,
              },
              hasTab: !!r.getQueryParam('tab'),
              setManagerLayoutState: l,
            }),
          ),
        );
      },
    ),
  );
}, 'Main');
function Md(e, t) {
  if (!(t instanceof Wt)) throw new ha();
  la(e).render(/* @__PURE__ */ s.createElement(D0, { key: 'root', provider: t }));
}
a(Md, 'renderStorybookUI');

// src/manager/runtime.tsx
const L0 = 'CORE/WS_DISCONNECTED';
const ls = class ls extends Wt {
  constructor() {
    super();
    this.wsDisconnected = !1;
    const o = fs({ page: 'manager' });
    Ye.setChannel(o),
      o.emit(qs),
      (this.addons = Ye),
      (this.channel = o),
      (se.__STORYBOOK_ADDONS_CHANNEL__ = o);
  }
  getElements(o) {
    return this.addons.getElements(o);
  }
  getConfig() {
    return this.addons.getConfig();
  }
  handleAPI(o) {
    this.addons.loadAddons(o),
      this.channel.on(Qs, i => {
        (this.wsDisconnected = !0),
          o.addNotification({
            id: L0,
            content: {
              headline: i.code === 3008 ? 'Server timed out' : 'Connection lost',
              subHeadline: 'Please restart your Storybook server and reload the page',
            },
            icon: /* @__PURE__ */ s.createElement(ws, { color: Us.negative }),
            link: void 0,
          });
      });
  }
};
a(ls, 'ReactProvider');
const as = ls;
const { document: N0 } = se;
const R0 = N0.getElementById('root');
setTimeout(() => {
  Md(R0, new as());
}, 0);
