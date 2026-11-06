class Component extends DCLogic {
componentDidMount() {
this.initLang();
this.onScrollHead = () => {
const el = this.rootEl;
if (!el) return;
const sc = el.getBoundingClientRect().top < -24;
if (sc !== !!(this.state && this.state.scrolled)) this.setState({ scrolled: sc });
};
window.addEventListener('scroll', this.onScrollHead, { capture: true, passive: true });
this.onScrollHead();
}
componentWillUnmount() {
if (this.onLangStore) window.removeEventListener('storage', this.onLangStore);
if (this.onScrollHead) window.removeEventListener('scroll', this.onScrollHead, { capture: true });
}
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
renderVals() {
if (!this.setRoot) this.setRoot = (n) => { this.rootEl = n; };
return { ...this.langVals(), setRoot: this.setRoot, scrolled: this.state && this.state.scrolled ? 'true' : 'false' };
}
}
window.__mountPage(Component, {});
