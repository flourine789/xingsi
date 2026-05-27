/* shared.jsx — 共享原子组件 */
const { useState, useEffect, useRef, useCallback } = React;

/* Toast（轻提示） ---------------------------------------------- */
window.useToast = function() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);
  const node = toast ? <div className="toast">{toast}</div> : null;
  return { show, node };
};

/* localStorage 持久化 Hook ------------------------------------- */
window.useStored = function(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return init;
      return JSON.parse(raw);
    } catch (e) { return init; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }, [key, val]);
  return [val, setVal];
};

/* 类型徽章 ----------------------------------------------------- */
window.TypeBadge = function({ type }) {
  const map = { writer: '作家', celebrity: '名人', news: '评论' };
  return <span className={`cand-badge t-${type}`}>{map[type] || type}</span>;
};

/* 头像 --------------------------------------------------------- */
window.PersonaAvatar = function({ persona, size }) {
  const cls = `cand-avatar t-${persona.type}`;
  const style = size ? { width: size, height: size, fontSize: size * 0.42 } : {};
  return <span className={cls} style={style}>{persona.avatar || persona.name[0]}</span>;
};

/* 字符计数（中英统一计 1 个字符） ----------------------------- */
window.countChars = function(s) {
  return Array.from(s || '').length;
};

/* 顶部栏 ------------------------------------------------------- */
window.TopBar = function({ current, onNav, onShowIntro }) {
  return (
    <header className="topbar">
      <div className="brand" onClick={() => onNav('home')}>
        <div>
          <div className="brand-zh">行思</div>
          <div className="brand-en">Xing-Si · 古人今人若流水，共看明月皆如此</div>
        </div>
      </div>
      <div className="topbar-right">
        <button className="topbar-about" onClick={onShowIntro} title="关于行思">关于</button>
        <span style={{fontSize:11, color:'var(--ink-mute)', letterSpacing:'2px'}}>
          MVP · v1.0
        </span>
      </div>
    </header>
  );
};
