/* screen-echoes.jsx — B2 思想星图 + 候选清单 --------------- */

window.ScreenEchoes = function({ essay, matchResult, onPick, onRefresh, onBack, onOpenSong }) {
  const [hoverId, setHoverId] = React.useState(null);
  const [tooltip, setTooltip] = React.useState(null); // {candidate, x, y}
  const [filterType, setFilterType] = React.useState('all');

  const candidates = (matchResult.candidates || []).filter(c => filterType==='all' || c.type===filterType);

  // SVG 尺寸
  const W = 820, H = 720, cx = W/2, cy = H/2;

  // 按相似度排序，围绕中心环形分布；越靠中心相似度越高
  const sorted = [...candidates].sort((a,b) => (b.similarity||0) - (a.similarity||0));
  const N = sorted.length;
  // 起始角度偏移：避开正上方（让标题更醒目），从右上 -60° 处开始顺时针铺
  const startAngle = -Math.PI / 3;
  const positioned = sorted.map((c, i) => {
    // 均匀分布在 360° 上；用黄金角扰动可避免对称重叠，这里用均布即可
    const angle = startAngle + (N > 0 ? (i / N) * Math.PI * 2 : 0);
    const distance = 180 + (1 - (c.similarity||0)) * 170;  // 180~350px
    const px = cx + Math.cos(angle) * distance;
    const py = cy + Math.sin(angle) * distance;
    // 文本对齐：根据角度水平分量决定
    const cosA = Math.cos(angle);
    const anchor = cosA > 0.35 ? 'start' : (cosA < -0.35 ? 'end' : 'middle');
    return { ...c, _px: px, _py: py, _angle: angle, _anchor: anchor };
  });

  const handleNodeEnter = (c, e) => {
    setHoverId(c.id);
    const maxX = window.innerWidth - 320;
    setTooltip({ candidate: c, x: Math.min(e.clientX + 16, maxX), y: e.clientY + 12 });
  };
  const handleNodeLeave = () => {
    setHoverId(null);
    setTooltip(null);
  };

  return (
    <main className="page">
      <div className="echo-toolbar">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← 回到书写</button>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <span style={{fontSize:12, color:'var(--ink-mute)', letterSpacing:2}}>筛选:</span>
          {[
            {k:'all', l:'全部'},
            {k:'writer', l:'作家'},
            {k:'celebrity', l:'名人'},
            {k:'news', l:'评论'}
          ].map(f => (
            <button key={f.k}
                    className={`tnav ${filterType===f.k?'active':''}`}
                    onClick={() => setFilterType(f.k)}>{f.l}</button>
          ))}
          <button className="btn btn-sm" onClick={onRefresh} style={{marginLeft:12}}>再找一批</button>
          {onOpenSong && (
            <button className="btn btn-sm" onClick={onOpenSong} style={{marginLeft:6}} title="把这段念头做成一首歌">
              ♪ 做成一首歌
            </button>
          )}
        </div>
      </div>

      <div className="echoes-page">
        {/* 左:摘要 + 标签 */}
        <aside className="paper echoes-left">
          <h3>这段念头</h3>
          <p className="summary">{matchResult.essay_summary || '一段尚未展开的思考。'}</p>

          <div className="tag-group">
            <h5>主题</h5>
            {(matchResult.tags?.theme||[]).map(t => <span key={t} className="tag theme">{t}</span>)}
          </div>
          <div className="tag-group">
            <h5>情绪</h5>
            {(matchResult.tags?.emotion||[]).map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <div className="tag-group">
            <h5>立场</h5>
            {(matchResult.tags?.stance||[]).map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </aside>

        {/* 中:星图 */}
        <section className="echoes-center">
          <svg className="starmap-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            {/* 中心:标题 + 念头 */}
            <text x={cx} y={cy - 10} textAnchor="middle" className="starmap-title">思想星图</text>
            <text x={cx} y={cy + 18} textAnchor="middle" className="starmap-subtitle-center">· 你的念头 ·</text>

            {/* 候选节点（仅文字） */}
            {positioned.map((c) => {
              const isHover = hoverId === c.id;
              const fontSize = 15 + (c.similarity || 0) * 6;
              // 连线起点：从中心标题外圈出发；终点收回少许避免压住文字
              const startR = 70;
              const endR = 14;
              const lineStartX = cx + Math.cos(c._angle) * startR;
              const lineStartY = cy + Math.sin(c._angle) * startR;
              const lineEndX = c._px - Math.cos(c._angle) * endR;
              const lineEndY = c._py - Math.sin(c._angle) * endR;
              // 相似度文字位置：上半圈放上方，下半圈放下方
              const simDy = Math.sin(c._angle) >= 0 ? 20 : -fontSize - 4;
              return (
                <g key={c.id}
                   className="starmap-text-node"
                   onMouseEnter={(e) => handleNodeEnter(c, e)}
                   onMouseLeave={handleNodeLeave}
                   onClick={() => onPick(c)}>
                  {/* 连线 */}
                  <line x1={lineStartX} y1={lineStartY} x2={lineEndX} y2={lineEndY}
                        stroke={isHover ? 'var(--cinnabar)' : 'var(--paper-rim)'}
                        strokeWidth={isHover ? 1.2 : 0.8}
                        strokeDasharray={isHover ? '' : '2 3'}
                        opacity={isHover ? 0.7 : 0.35} />
                  {/* 名字 */}
                  <text x={c._px} y={c._py}
                        textAnchor={c._anchor}
                        className={`starmap-text-name t-${c.type} ${isHover ? 'hover' : ''}`}
                        style={{ fontSize }}>
                    {c.name}
                  </text>
                  {/* 相似度 */}
                  <text x={c._px} y={c._py + simDy}
                        textAnchor={c._anchor}
                        className="starmap-text-sim">
                    {Math.round((c.similarity || 0) * 100)}%
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="starmap-tip">
            悬停查看相似原因 · 点击进入对话室 · 距中心越近相似度越高
          </div>
        </section>

        {tooltip && (
          <div className="echo-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <div className="t-head">
              <strong>{tooltip.candidate.name}</strong>
              <span className="t-sim">相似度 {Math.round((tooltip.candidate.similarity||0)*100)}%</span>
            </div>
            {tooltip.candidate.era && <div className="t-era">{tooltip.candidate.era}</div>}
            <div className="t-reason">{tooltip.candidate.similarity_reason}</div>
            {tooltip.candidate.excerpt && (
              <div className="t-excerpt">
                「{tooltip.candidate.excerpt}」
                {tooltip.candidate.excerpt_source && ` ——${tooltip.candidate.excerpt_source}`}
                {tooltip.candidate.source_url && (
                  <span style={{marginLeft:6, color:'var(--cinnabar)', fontSize:11}}>↗</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 右:候选清单 */}
        <aside className="candidates-list">
          {candidates.map(c => (
            <div key={c.id}
                 className={`paper candidate-card ${hoverId===c.id?'highlight':''}`}
                 onMouseEnter={() => setHoverId(c.id)}
                 onMouseLeave={() => setHoverId(null)}
                 onClick={() => onPick(c)}>
              <div className="cand-head">
                <window.PersonaAvatar persona={c} />
                <div>
                  <div className="cand-name">{c.name}</div>
                  {c.era && <div style={{fontSize:11, color:'var(--ink-mute)', letterSpacing:'.5px'}}>{c.era}</div>}
                </div>
                <window.TypeBadge type={c.type} />
                <span className="cand-sim">{Math.round(c.similarity*100)}</span>
              </div>
              <p className="cand-excerpt">「{c.excerpt}」</p>
              <div className="cand-source">
                —— {c.excerpt_source}
                {c.source_url && (
                  <a href={c.source_url}
                     target="_blank"
                     rel="noopener noreferrer"
                     onClick={(e) => e.stopPropagation()}
                     title={c.source_url}
                     style={{marginLeft:8, fontSize:11, color:'var(--cinnabar)', textDecoration:'none', letterSpacing:'.5px'}}>
                    查看原文 ↗
                  </a>
                )}
              </div>
              <div className="cand-reason">{c.similarity_reason}</div>
            </div>
          ))}
          {candidates.length === 0 && (
            <div className="paper" style={{padding:32, textAlign:'center', color:'var(--ink-mute)'}}>
              当前筛选下没有候选。
            </div>
          )}
        </aside>
      </div>
    </main>
  );
};
