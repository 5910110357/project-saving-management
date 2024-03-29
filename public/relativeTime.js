!(function (r, t) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = t())
    : 'function' == typeof define && define.amd
    ? define(t)
    : (r.dayjs_plugin_relativeTime = t());
})(this, function () {
  'use strict';
  return function (r, t, e) {
    r = r || {};
    var n = t.prototype,
      o = {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
      };
    function i(r, t, e, o) {
      return n.fromToBase(r, t, e, o);
    }
    (e.en.relativeTime = o),
      (n.fromToBase = function (t, n, i, d, u) {
        for (
          var a,
            f,
            s,
            l = i.$locale().relativeTime || o,
            h = r.thresholds || [
              { l: 's', r: 44, d: 'second' },
              { l: 'm', r: 89 },
              { l: 'mm', r: 44, d: 'minute' },
              { l: 'h', r: 89 },
              { l: 'hh', r: 21, d: 'hour' },
              { l: 'd', r: 35 },
              { l: 'dd', r: 25, d: 'day' },
              { l: 'M', r: 45 },
              { l: 'MM', r: 10, d: 'month' },
              { l: 'y', r: 17 },
              { l: 'yy', d: 'year' }
            ],
            m = h.length,
            c = 0;
          c < m;
          c += 1
        ) {
          var y = h[c];
          y.d && (a = d ? e(t).diff(i, y.d, !0) : i.diff(t, y.d, !0));
          var p = (r.rounding || Math.round)(Math.abs(a));
          if (((s = a > 0), p <= y.r || !y.r)) {
            p <= 1 && c > 0 && (y = h[c - 1]);
            var v = l[y.l];
            u && (p = u('' + p)),
              (f = 'string' == typeof v ? v.replace('%d', p) : v(p, n, y.l, s));
            break;
          }
        }
        if (n) return f;
        var M = s ? l.future : l.past;
        return 'function' == typeof M ? M(f) : M.replace('%s', f);
      }),
      (n.to = function (r, t) {
        return i(r, t, this, !0);
      }),
      (n.from = function (r, t) {
        return i(r, t, this);
      });
    var d = function (r) {
      return r.$u ? e.utc() : e();
    };
    (n.toNow = function (r) {
      return this.to(d(this), r);
    }),
      (n.fromNow = function (r) {
        return this.from(d(this), r);
      });
  };
});
