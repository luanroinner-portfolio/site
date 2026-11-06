/* Mini runtime: liga os {{valores}} do template ao componente da página. */
(function () {
  var HOLE = /\{\{\s*([\w$.]+)\s*\}\}/g;
  var bindings = [], cur = {}, comp = null, queued = false;
  window.DCLogic = function DCLogic(props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (s) {
    this.state = Object.assign({}, this.state, typeof s === 'function' ? s(this.state) : s);
    schedule();
  };
  function schedule() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; render(); }); }
  function key(v) { var m = /\{\{\s*([\w$.]+)/.exec(v); return m && m[1]; }
  function walk(node) {
    if (node.nodeType === 3) {
      if (node.nodeValue.indexOf('{{') > -1) bindings.push({ t: 'text', n: node, tpl: node.nodeValue });
      return;
    }
    if (node.nodeType !== 1) return;
    if (node.tagName === 'SC-IF') {
      bindings.push({ t: 'if', n: node, k: key(node.getAttribute('value') || '') });
      node.removeAttribute('value'); node.removeAttribute('hint-placeholder-val');
    }
    Array.prototype.slice.call(node.attributes).forEach(function (a) {
      var v = a.value; if (v.indexOf('{{') < 0) return;
      var name = a.name;
      if (name === 'ref') { bindings.push({ t: 'ref', n: node, k: key(v) }); node.removeAttribute(name); return; }
      if (/^on[a-z]/.test(name)) {
        var k = key(v), ev = name.slice(2);
        node.removeAttribute(name);
        node.addEventListener(ev, function (e) { var f = cur[k]; if (typeof f === 'function') f(e); });
        return;
      }
      bindings.push({ t: 'attr', n: node, name: name, tpl: v });
    });
    Array.prototype.slice.call(node.childNodes).forEach(walk);
  }
  function fill(tpl) { return tpl.replace(HOLE, function (_, k) { var v = cur[k]; return v == null ? '' : String(v); }); }
  function render() {
    cur = comp.renderVals() || {};
    for (var i = 0; i < bindings.length; i++) {
      var b = bindings[i], s;
      if (b.t === 'text') { s = fill(b.tpl); if (b.last !== s) { b.n.nodeValue = s; b.last = s; } }
      else if (b.t === 'attr') { s = fill(b.tpl); if (b.last !== s) { b.n.setAttribute(b.name, s); b.last = s; } }
      else if (b.t === 'if') { var on = !!cur[b.k]; if (b.last !== on) { b.n.style.display = on ? 'contents' : 'none'; b.last = on; } }
      else if (b.t === 'ref' && !b.done) { var f = cur[b.k]; if (typeof f === 'function') { f(b.n); b.done = true; } }
    }
  }
  window.__mountPage = function (Component, props) {
    var tpl = document.getElementById('page-template');
    var frag = tpl.content.cloneNode(true);
    Array.prototype.slice.call(frag.childNodes).forEach(walk);
    document.getElementById('page').appendChild(frag);
    comp = new Component(props || {});
    render();
    if (comp.componentDidMount) comp.componentDidMount();
    render();
  };
})();

/* Proteção leve das imagens: sem menu do botão direito, sem arrastar e sem "salvar" no toque longo. */
(function () {
  function isMedia(el) { return el && el.closest && el.closest('img, video, picture, svg image'); }
  document.addEventListener('contextmenu', function (e) { if (isMedia(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (isMedia(e.target)) e.preventDefault(); });
})();

/* Menu: reflexo de luz no vidro + botão magnético (só com mouse; respeita "reduzir movimento"). */
(function () {
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine) return;
  function init() {
    var bar = document.querySelector('.lr-hbar, .lr-head-in');
    if (!bar) return;
    bar.classList.add('lr-spot');
    bar.addEventListener('pointermove', function (e) {
      var r = bar.getBoundingClientRect();
      bar.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      bar.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    if (reduce) return;
    var btn = document.querySelector('.lr-hcta, .lr-back');
    var zone = document.querySelector('.lr-hhead, .lr-head') || bar;
    if (!btn) return;
    btn.classList.add('lr-mag');
    zone.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var reach = Math.max(r.width, r.height) * 0.75;
      if (Math.hypot(dx, dy) < reach) {
        btn.classList.add('lr-mag-live');
        var tx = Math.max(-7, Math.min(7, dx * 0.16)), ty = Math.max(-4, Math.min(4, dy * 0.3));
        btn.style.translate = tx.toFixed(1) + 'px ' + ty.toFixed(1) + 'px';
      } else { btn.classList.remove('lr-mag-live'); btn.style.translate = ''; }
    });
    zone.addEventListener('pointerleave', function () { btn.classList.remove('lr-mag-live'); btn.style.translate = ''; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });
  else setTimeout(init, 0);
})();

/* Galeria: as fotos perto do meio da tela ficam coloridas (efeito "Foco"). */
(function () {
  var raf = 0;
  function smooth(v) { v = v < 0 ? 0 : v > 1 ? 1 : v; return v * v * (3 - 2 * v); }
  function update() {
    raf = 0;
    var gal = document.querySelector('.lr-gal');
    if (!gal) return;
    gal.classList.add('lr-focus');
    var vh = window.innerHeight, tiles = gal.querySelectorAll('a');
    for (var i = 0; i < tiles.length; i++) {
      var r = tiles[i].getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) { if (tiles[i]._p !== 0) { tiles[i].style.setProperty('--p', '0'); tiles[i]._p = 0; } continue; }
      var d = Math.abs(r.top + r.height / 2 - vh * 0.5) / (vh * 0.5);
      var p = Math.round((1 - smooth((d - 0.25) / 0.5)) * 50) / 50;
      if (tiles[i]._p !== p) { tiles[i].style.setProperty('--p', String(p)); tiles[i]._p = p; }
    }
  }
  function req() { if (!raf) raf = requestAnimationFrame(update); }
  window.addEventListener('scroll', req, { capture: true, passive: true });
  window.addEventListener('resize', req);
  document.addEventListener('click', function () { setTimeout(req, 0); }); /* troca Galeria/Projetos */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(req, 0); });
  else setTimeout(req, 0);
})();
