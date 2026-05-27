/* screen-cards.jsx — C2 灵感卡片（独立页） ----------------- */

window.ScreenCards = function({ cards, essays, onDelete, onBack, onJump, toast }) {
  const sorted = [...cards].sort((a,b) => (b.ts||0) - (a.ts||0));

  const fmt = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  };

  const copyText = (t) => {
    try {
      navigator.clipboard.writeText(t);
      toast('已复制到剪贴板');
    } catch(e) {
      toast('复制失败,请手动选择');
    }
  };

  return (
    <main className="page cards-page">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24}}>
        <div>
          <h1>灵感卡片</h1>
          <p className="sub">
            共 {sorted.length} 张 · 从对话中沉淀下来的、最打动你的那几句话。
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← 返回随笔簿</button>
      </div>

      {sorted.length === 0 ? (
        <div className="paper" style={{padding:'48px 24px', textAlign:'center'}}>
          <div className="empty-hint">
            还没有灵感卡片。<br/>
            进入对话后,点击回响者发言旁的 ★ 即可收藏。
          </div>
        </div>
      ) : (
        <div className="cards-grid">
          {sorted.map(c => {
            const fromEssay = essays.find(e => e.id === c.essay_id);
            return (
              <div className="paper ember-card" key={c.id}>
                <div className="seal-corner">行思</div>
                <p className="quote">{c.text}</p>
                <div className="from">
                  <span className={`cand-avatar t-${c.persona_type}`}
                        style={{width:22,height:22,fontSize:11}}>
                    {c.avatar || c.persona_name[0]}
                  </span>
                  <span>{c.persona_name} · {fmt(c.ts)}</span>
                </div>
                <div className="actions">
                  <button onClick={() => copyText(c.text)}>复制</button>
                  {fromEssay && <button onClick={() => onJump(c)}>回到对话</button>}
                  <button onClick={() => { if (confirm('删除这张卡片?')) onDelete(c.id); }}>删除</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};
