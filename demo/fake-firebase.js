/* DEMO del Tablero VPH — Firebase SIMULADO, SOLO LECTURA.
 * Reemplaza al SDK de Firebase: no se conecta a ningún servidor ni a la base real.
 * Lee los datos inventados de seed.js, y cualquier intento de guardar/borrar se ignora con un aviso.
 */
(function () {
  'use strict';
  var SEED = window.__demoSeed();
  var store = {};
  function clone(o) { return o === undefined ? o : JSON.parse(JSON.stringify(o)); }
  Object.keys(SEED).forEach(function (c) { store[c] = {}; SEED[c].forEach(function (d) { store[c][d._uid] = clone(d); }); });

  // ---- aviso de "solo lectura"
  var toastEl = null, toastT = null;
  function avisar(msg) {
    try {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.style.cssText = 'position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:99999;background:#1f2937;color:#fff;padding:11px 18px;border-radius:12px;font:600 13px/1.4 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.35);max-width:min(92vw,520px);text-align:center;transition:opacity .25s;opacity:0;pointer-events:none';
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = msg || '🔒 Es una demostración: los cambios no se guardan.';
      toastEl.style.opacity = '1';
      clearTimeout(toastT); toastT = setTimeout(function () { toastEl.style.opacity = '0'; }, 3200);
    } catch (e) { }
  }
  function bloqueado() { avisar(); return Promise.resolve(); }

  // ---- referencias
  function doc(db) {
    var seg = Array.prototype.slice.call(arguments, 1).join('/').split('/').filter(Boolean);
    return { __t: 'doc', col: seg[0], id: seg[1], path: seg.join('/') };
  }
  function collection(db, col) { return { __t: 'col', col: String(col) }; }
  function where(f, op, v) { return { __w: [f, op, v] }; }
  function query(ref) { return { __t: 'q', col: ref.col, cons: Array.prototype.slice.call(arguments, 1).filter(function (c) { return c && c.__w; }) }; }
  function tsVal(x) { return x && typeof x === 'object' && 'seconds' in x ? x.seconds : x; }
  function cumple(d, w) {
    var a = tsVal(d[w[0]]), b = tsVal(w[2]);
    switch (w[1]) {
      case '==': return a === b; case '!=': return a !== b;
      case '>': return a > b; case '>=': return a >= b; case '<': return a < b; case '<=': return a <= b;
      case 'in': return Array.isArray(b) && b.indexOf(a) >= 0;
    }
    return true;
  }
  function docsDe(ref) {
    var col = store[ref.col] || {};
    var out = Object.keys(col).map(function (id) { return { id: id, d: col[id] }; });
    if (ref.__t === 'q') ref.cons.forEach(function (c) { out = out.filter(function (x) { return cumple(x.d, c.__w); }); });
    return out;
  }
  var META = { fromCache: false, hasPendingWrites: false };
  function docSnap(ref) {
    var d = (store[ref.col] || {})[ref.id];
    return { id: ref.id, ref: ref, metadata: META, exists: function () { return d !== undefined; }, data: function () { return d === undefined ? undefined : clone(d); } };
  }
  function querySnap(ref) {
    var arr = docsDe(ref).map(function (x) { return { id: x.id, ref: doc(null, ref.col, x.id), metadata: META, exists: function () { return true; }, data: function () { return clone(x.d); } }; });
    return { docs: arr, size: arr.length, empty: arr.length === 0, metadata: META, forEach: function (f) { arr.forEach(f); }, docChanges: function () { return []; } };
  }
  function getDoc(ref) { return Promise.resolve(docSnap(ref)); }
  function getDocs(ref) { return Promise.resolve(querySnap(ref)); }
  function onSnapshot(ref) {
    var cb = null; for (var i = 1; i < arguments.length; i++) { if (typeof arguments[i] === "function") { cb = arguments[i]; break; } if (arguments[i] && typeof arguments[i].next === "function") { cb = arguments[i].next.bind(arguments[i]); break; } }
    var vivo = !!cb;
    setTimeout(function () { if (vivo) { try { cb(ref.__t === 'doc' ? docSnap(ref) : querySnap(ref)); } catch (e) { console.error(e); } } }, 0);
    return function () { vivo = false; };
  }
  function runTransaction(db, fn) {
    var tx = { get: function (ref) { return getDoc(ref); }, set: function () { avisar(); return tx; }, update: function () { avisar(); return tx; }, delete: function () { avisar(); return tx; } };
    return Promise.resolve(fn(tx));
  }
  function writeBatch() {
    var b = { set: function () { return b; }, update: function () { return b; }, delete: function () { return b; }, commit: function () { return bloqueado(); } };
    return b;
  }
  var Timestamp = {
    now: function () { return Timestamp.fromMillis(Date.now()); },
    fromDate: function (d) { return Timestamp.fromMillis(d.getTime()); },
    fromMillis: function (ms) { var s = Math.floor(ms / 1000); return { seconds: s, nanoseconds: 0, toMillis: function () { return ms; }, toDate: function () { return new Date(ms); } }; }
  };
  var fsM = {
    initializeFirestore: function () { return {}; }, getFirestore: function () { return {}; },
    persistentLocalCache: function () { return {}; }, persistentMultipleTabManager: function () { return {}; },
    doc: doc, collection: collection, query: query, where: where, getDoc: getDoc, getDocs: getDocs, onSnapshot: onSnapshot,
    setDoc: bloqueado, updateDoc: bloqueado, deleteDoc: bloqueado, runTransaction: runTransaction, writeBatch: writeBatch, Timestamp: Timestamp,
    serverTimestamp: function () { return Timestamp.now(); }
  };

  // ---- auth falso: entra solo como "Demostración"
  var user = { uid: 'demo-admin', email: 'demo@vph-demo.com', getIdToken: function () { return Promise.resolve('demo'); } };
  var authM = {
    getAuth: function () { return { currentUser: user }; },
    onAuthStateChanged: function (a, cb) { setTimeout(function () { cb(user); }, 30); return function () { }; },
    signInWithEmailAndPassword: function () { return Promise.resolve({ user: user }); },
    signOut: function () { avisar('🎬 Es una demostración: no hay sesión que cerrar.'); return Promise.resolve(); }
  };
  var appM = { initializeApp: function () { return {}; } };
  window.__DEMO_FB = { appM: appM, authM: authM, fsM: fsM, stM: null };
  window.__DEMO = true;

  // ---- ningún pedido sale a servicios externos (facturación, padrón, etc.)
  var _fetch = window.fetch;
  window.fetch = function (u) {
    var s = String((u && u.url) || u);
    if (/^https?:\/\//i.test(s) && s.indexOf(location.origin) !== 0) { avisar('🎬 Demostración: sin conexión a servicios externos.'); return Promise.reject(new Error('Demostración: sin conexión a servicios externos')); }
    return _fetch.apply(this, arguments);
  };

  // ---- cartel permanente
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.createElement('div');
    b.textContent = '🎬 DEMOSTRACIÓN — datos inventados · solo lectura';
    b.style.cssText = 'position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:99998;background:#b45309;color:#fff;padding:5px 14px;border-radius:999px;font:700 11.5px system-ui,sans-serif;letter-spacing:.2px;box-shadow:0 2px 10px rgba(0,0,0,.3);pointer-events:none';
    document.body.appendChild(b);
    document.title = 'Tablero VPH · Demostración';
  });
})();
