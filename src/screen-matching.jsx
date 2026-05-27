/* screen-matching.jsx — B1 寻回声 -------------------------- */

window.ScreenMatching = function({ firstSentence, onDone, onTimeout }) {
  const [progress, setProgress] = React.useState(0);
  const [phase, setPhase] = React.useState(0); // 0:作家 1:名人 2:新闻
  const totalMs = 3500 + Math.random()*2500; // 3.5–6s
  const startRef = React.useRef(Date.now());

  React.useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(1, elapsed / totalMs);
      setProgress(p);
      if (p >= 0.33 && phase < 1) setPhase(1);
      if (p >= 0.66 && phase < 2) setPhase(2);
      if (p >= 1) {
        clearInterval(tick);
        // 模拟 LLM1 调用完成
        onDone();
      }
    }, 100);
    return () => clearInterval(tick);
  }, []);

  const phaseLabels = ['作家库', '名人库', '新闻库'];

  return (
    <main className="page">
      <div className="matching-page">
        <p className="matching-quote">
          {firstSentence || '正在阅读你刚写下的那一段念头⋯⋯'}
        </p>

        <div className="halo-wrap">
          <div className="halo h1"></div>
          <div className="halo h2"></div>
          <div className="halo h3"></div>

          {/* 三个标签环绕 */}
          {phaseLabels.map((lbl, i) => {
            const angle = (i / 3) * Math.PI * 2 - Math.PI/2;
            const r = 195;
            const x = 180 + Math.cos(angle) * r - 30;
            const y = 180 + Math.sin(angle) * r - 14;
            return (
              <div key={i}
                   className={`halo-label ${i<=phase?'active':''}`}
                   style={{ left: x, top: y }}>
                调阅 · {lbl}
              </div>
            );
          })}

          {/* 旋转点 */}
          <div className="halo-orbit">
            <div className="halo-dot"></div>
          </div>

          <div className="halo-center">行</div>
        </div>

        <div className="matching-progress">
          <div className="matching-progress-bar" style={{width: `${progress*100}%`}}></div>
        </div>
        <div className="matching-text">正在为你寻找回响者⋯⋯</div>
      </div>
    </main>
  );
};
