/* screen-home.jsx — A1 随笔簿（首页） ----------------------- */

window.ScreenHome = function({ essays, cards, songs, onNew, onOpen, onDelete, onOpenCards }) {
  const sorted = [...essays].sort((a,b) => (b.updated_at||0) - (a.updated_at||0));

  const fmtDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${d.getFullYear()}.${m}.${day}`;
  };

  const firstLine = (s) => {
    const t = (s||'').trim();
    if (!t) return '（一段尚未落笔的念头⋯⋯）';
    return t.length > 80 ? t.slice(0,78) + '…' : t;
  };

  return (
    <main className="page">
      <div className="home-hero">
        <div>
          <h1>随笔簿</h1>
          <p>把脑中正在转的一段念头先写下来,<br/>不必工整,只要真实。</p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="paper" style={{padding:'48px 32px', textAlign:'center'}}>
          <div className="empty-hint">
            还没有随笔。<br/>
            写下第一段念头,与古今相对的人聊一聊。
          </div>
          <button className="btn btn-primary" onClick={onNew}>开始写</button>
        </div>
      ) : (
        <div className="essay-grid">
          <div className="paper essay-card new-card" onClick={onNew}>
            ＋ 新起一篇
          </div>
          {sorted.map(es => {
            const essayCards = (cards || []).filter(c => c.essay_id === es.id);
            const visibleCards = essayCards.slice(0, 5);
            const song = songs && songs[es.id];
            const hasSong = !!(song && song.audio_url);
            const hasLyrics = !!(song && song.lyrics && !song.audio_url);
            return (
              <div key={es.id} className="paper essay-card" onClick={() => onOpen(es.id)}>
                <p className="first-line">{firstLine(es.content)}</p>
                <div className="meta">
                  <span style={{display:'inline-flex', alignItems:'center', gap:8}}>
                    {fmtDate(es.updated_at)}
                    {hasSong && (
                      <span className="song-badge" title="已生成歌曲">♫</span>
                    )}
                    {hasLyrics && (
                      <span className="song-badge song-badge-lyrics" title="已生成歌词，尚无音频">♪</span>
                    )}
                  </span>
                  <span className="echoes">
                    {(es.recent_echoes || []).slice(0,3).map((p,i) => (
                      <span key={i} className="av" title={p.name}>{p.avatar||p.name[0]}</span>
                    ))}
                  </span>
                </div>
                <button className="btn btn-ghost btn-sm"
                        style={{position:'absolute', top:8, right:8, fontSize:11}}
                        onClick={(e) => { e.stopPropagation(); if(confirm(`删除这篇随笔以及对应的对话?`)) onDelete(es.id); }}>
                  删除
                </button>
                {visibleCards.length > 0 && (
                  <div className="essay-bookmarks"
                       onClick={(e) => { e.stopPropagation(); onOpenCards(); }}>
                    {visibleCards.map((c, i) => (
                      <div key={c.id}
                           className={`essay-bookmark t-${c.persona_type}`}
                           title={`${c.persona_name}：${c.text.slice(0,30)}…`}
                           style={{ top: 36 + i * 34 }}>
                        <span className="bm-avatar">{c.avatar || c.persona_name[0]}</span>
                      </div>
                    ))}
                    {essayCards.length > 5 && (
                      <div className="essay-bookmark essay-bookmark-more"
                           style={{ top: 36 + 5 * 34 }}>
                        <span className="bm-avatar">+{essayCards.length - 5}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};
