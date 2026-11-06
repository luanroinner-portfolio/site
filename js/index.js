class Component extends DCLogic {
initLang() {
let l = 'pt';
try { l = localStorage.getItem('lr-lang') || 'pt'; } catch (e) {}
this.setState({ lang: l });
this.onLangStore = (e) => { if (e.key === 'lr-lang' && e.newValue) this.setState({ lang: e.newValue }); };
window.addEventListener('storage', this.onLangStore);
}
langVals() {
const lang = (this.state && this.state.lang) === 'en' ? 'en' : 'pt';
if (!this.setPt) {
const set = (l) => { this.setState({ lang: l }); try { localStorage.setItem('lr-lang', l); } catch (e) {} };
this.setPt = () => set('pt');
this.setEn = () => set('en');
}
try { document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR'; } catch (e) {}
return { lang: lang, ptOn: lang === 'pt' ? 'true' : 'false', enOn: lang === 'en' ? 'true' : 'false', setPt: this.setPt, setEn: this.setEn };
}
componentDidMount() {
this.initLang();
this.onScroll = () => {
if (this.raf) return;
this.raf = requestAnimationFrame(() => { this.raf = 0; this.updateScan(); });
};
window.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
window.addEventListener('resize', this.onScroll);
this.updateScan();
this.lens = { x: null, y: null, r: 0 };
this.t0 = performance.now();
const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lite = !!(window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches);
const loop = (ts) => {
this.loopId = requestAnimationFrame(loop);
const st = this.state || {};
const W = st.w || 1440;
const H = st.h || 858;
const fx = 0.5 * W;
const fy = 0.38 * H;
const sec = (ts - this.t0) / 1000;
let tx, ty, tr;
if (this.ptr) {
tx = this.ptr.x; ty = this.ptr.y; tr = 170;
} else {
tx = (still || lite) ? fx : fx + Math.cos(sec * 0.6) * W * 0.07;
ty = (still || lite) ? fy : fy + Math.sin(sec * 0.95) * H * 0.05;
tr = 115;
}
const L = this.lens;
if (L.x == null) { L.x = tx; L.y = ty; }
const k = this.ptr ? 0.16 : 0.04;
L.x += (tx - L.x) * k;
L.y += (ty - L.y) * k;
L.r += (tr - L.r) * 0.07;
if (lite) {
if (Math.abs(tx - L.x) + Math.abs(ty - L.y) + Math.abs(tr - L.r) > 0.3) this.setState({ lx: L.x, ly: L.y, lr: L.r });
return;
}
this.setState({
lx: L.x, ly: L.y, lr: L.r,
oaX: Math.sin(sec * 0.45) * 90 + Math.sin(sec * 0.23) * 40,
oaY: Math.sin(sec * 0.31) * 180 + Math.cos(sec * 0.17) * 80 + 200,
oaS: 1 + 0.14 * Math.sin(sec * 0.6),
obX: Math.cos(sec * 0.38) * 90 + Math.sin(sec * 0.21) * 40,
obY: Math.cos(sec * 0.27) * 200 + Math.sin(sec * 0.19) * 80 + 220,
obS: 1 + 0.16 * Math.cos(sec * 0.5)
});
};
this.loopId = requestAnimationFrame(loop);
}
componentWillUnmount() {
if (this.onLangStore) window.removeEventListener('storage', this.onLangStore);
window.removeEventListener('scroll', this.onScroll, { capture: true });
window.removeEventListener('resize', this.onScroll);
if (this.raf) cancelAnimationFrame(this.raf);
if (this.loopId) cancelAnimationFrame(this.loopId);
}
updateScan() {
const el = this.banner;
const tr = this.track;
if (!el || !tr) return;
const b = el.getBoundingClientRect();
const t = tr.getBoundingClientRect();
const dist = t.height - b.height;
let p = 0;
if (window.innerHeight < b.height * 2.5 && dist > 0) {
p = Math.max(0, Math.min(1, -t.top / dist));
}
const w = b.width;
const h = b.height - 104;
const st = this.state || {};
if (Math.abs(p - (st.p || 0)) > 0.002 || Math.abs(w - (st.w || 0)) > 1 || Math.abs(h - (st.h || 0)) > 1) this.setState({ p: p, w: w, h: h });
const scrolled = t.top < -24;
if (scrolled !== !!st.scrolled) this.setState({ scrolled: scrolled });
}
renderVals() {
if (!this.setBanner) this.setBanner = (node) => { this.banner = node; };
if (!this.setTrack) this.setTrack = (node) => { this.track = node; };
if (!this.onMove) {
this.onMove = (e) => {
const el = this.banner;
if (!el) return;
const r = el.getBoundingClientRect();
this.ptr = { x: e.clientX - r.left, y: e.clientY - r.top - 104 };
if (!(this.state && this.state.hover)) this.setState({ hover: true });
};
this.onLeave = () => { this.ptr = null; this.setState({ hover: false }); };
}
const st = this.state || {};
const p = st.p || 0;
const W = st.w || 1440;
const H = st.h || 858;
const ease = p * p * (3 - 2 * p);
const diag = Math.sqrt(W * W + H * H);
const lx = st.lx != null ? st.lx : 0.5 * W;
const ly = st.ly != null ? st.ly : 0.38 * H;
const base = st.lr || 0;
const R = base + ease * diag * 1.05;
const feather = Math.min(30, R * 0.25);
const mask = 'radial-gradient(circle ' + R.toFixed(1) + 'px at ' + lx.toFixed(1) + 'px ' + ly.toFixed(1) + 'px, #000 ' + Math.max(0, R - feather).toFixed(1) + 'px, transparent ' + R.toFixed(1) + 'px)';
const hudOp = Math.max(0, 1 - p * 2.2) * Math.min(1, base / 60);
const pad = (n) => String(Math.max(0, Math.round(n))).padStart(4, '0');
return {
...this.langVals(),
navTop: st.scrolled ? '12px' : '18px',
ctaBg: st.scrolled ? 'rgb(237, 237, 242)' : 'rgba(255,255,255,0.14)',
ctaFg: st.scrolled ? 'rgb(11, 11, 13)' : '#FFFFFF',
ctaLine: st.scrolled ? 'rgb(237, 237, 242)' : 'rgba(255,255,255,0.32)',
langBg: st.scrolled ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.12)',
langLine: st.scrolled ? 'rgba(237,237,242,0.3)' : 'rgba(255,255,255,0.3)',
topBlur: st.scrolled ? 'none' : 'blur(16px) saturate(160%)',
topShadow: st.scrolled ? 'none' : '0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18)',
navBg: st.scrolled ? 'rgba(18,18,24,0.5)' : 'rgba(18,18,24,0)',
navBlur: st.scrolled ? 'blur(18px) saturate(160%)' : 'blur(0px) saturate(100%)',
navLine: st.scrolled ? 'rgba(237,237,242,0.16)' : 'rgba(237,237,242,0)',
navShadow: st.scrolled ? '0 12px 32px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.08)' : '0 0 0 rgba(0,0,0,0)',
accent: this.props.accent ?? '#6B3DF5',
setBanner: this.setBanner,
setTrack: this.setTrack,
onMove: this.onMove,
onLeave: this.onLeave,
shadeA: (1 - p * 0.45).toFixed(3),
photoBright: st.hover && p < 0.5 ? 0.78 : 1,
lensMask: mask,
lx: lx.toFixed(1),
lyAbs: (104 + ly).toFixed(1),
ld: (R * 2).toFixed(1),
hudOp: hudOp.toFixed(3),
labLeft: lx > W - 300 ? 'calc(-48px - 176px)' : 'calc(100% + 48px)',
coordX: pad(lx),
coordY: pad(ly),
fillA: (1 - p).toFixed(3),
isGaleria: (st.view || 'galeria') === 'galeria',
isProjetos: st.view === 'projetos',
galSel: (st.view || 'galeria') === 'galeria' ? 'true' : 'false',
projSel: st.view === 'projetos' ? 'true' : 'false',
galBg: (st.view || 'galeria') === 'galeria' ? '#EDEDF2' : 'transparent',
galFg: (st.view || 'galeria') === 'galeria' ? '#0B0B0D' : '#EDEDF2',
projBg: st.view === 'projetos' ? '#EDEDF2' : 'transparent',
projFg: st.view === 'projetos' ? '#0B0B0D' : '#EDEDF2',
showGal: this.showGal || (this.showGal = () => this.setState({ view: 'galeria' })),
showProj: this.showProj || (this.showProj = () => this.setState({ view: 'projetos' })),
olA: p.toFixed(3),
orbAY: (ease * H * 0.7).toFixed(1),
orbBY: (-ease * H * 0.6).toFixed(1),
oaX: (st.oaX || 0).toFixed(1),
oaY: (st.oaY || 0).toFixed(1),
oaS: (st.oaS || 1).toFixed(3),
obX: (st.obX || 0).toFixed(1),
obY: (st.obY || 0).toFixed(1),
obS: (st.obS || 1).toFixed(3)
};
}
}
window.__mountPage(Component, {"accent": "#6B3DF5"});
