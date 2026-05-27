/* screen-write.jsx — A2 书写页 ------------------------------ */

window.ScreenWrite = function({ essay, onChange, onMatch, onSaveDraft, onClear, onBack, onOpenSong, toast, cards }) {
  const wordCount = window.countChars(essay.content);
  const meetsMin = wordCount >= 20;
  const tooLong = wordCount > 3000;
  const taRef = React.useRef(null);

  // 自动保存：5s 周期或失焦（静默，不再展示状态）
  React.useEffect(() => {
    const t = setInterval(() => onSaveDraft(), 5000);
    return () => clearInterval(t);
  }, [onSaveDraft]);

  const handleBlur = () => onSaveDraft();

  // 插入引用块（来自对话室"带回写作"或灵感卡片）
  const insertQuote = (text, source) => {
    const block = `\n\n> ${text}\n> ——${source}\n\n`;
    const ta = taRef.current;
    if (!ta) { onChange(essay.content + block); return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    const next = (essay.content||'').slice(0,start) + block + (essay.content||'').slice(end);
    onChange(next);
  };

  React.useEffect(() => {
    window.__insertQuoteToWrite = insertQuote;
  });

  const handleMatch = () => {
    if (!meetsMin) { toast('再多写一点，让回响更准'); return; }
    if (tooLong)   { toast('这段思考很长，先截取一段开始吧'); return; }
    const safe = window.simpleSafetyCheck(essay.content);
    if (!safe.ok) { toast(safe.reason); return; }
    onMatch();
  };

  const handleSong = () => {
    if (!meetsMin) { toast('再多写一点，让歌词更准'); return; }
    if (tooLong)   { toast('这段思考很长，先截取一段开始吧'); return; }
    const safe = window.simpleSafetyCheck(essay.content);
    if (!safe.ok) { toast(safe.reason); return; }
    onOpenSong && onOpenSong();
  };

  // 本随笔相关的灵感卡片
  const essayCards = (cards || []).filter(c => c.essay_id === essay.id);

  return (
    <main className="page">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 18}}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← 返回随笔簿</button>
        <span style={{fontSize:12, color:'var(--ink-mute)', letterSpacing:'2px'}}>
          书写 · Write
        </span>
      </div>

      <div className="write-page">
        <div className="paper write-paper">
          <textarea
            ref={taRef}
            className="write-textarea"
            value={essay.content}
            placeholder={'写下你正在想的事⋯⋯\n\n不必想着写完，先把第一句留住。'}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            autoFocus
          />
        </div>

        <aside className="write-side">
          <div className="paper panel actions">
            <h4>动作</h4>
            <button className="btn btn-primary btn-block"
                    disabled={!meetsMin || tooLong}
                    onClick={handleMatch}>
              寻找共鸣
            </button>
            <button className="btn btn-block"
                    disabled={!meetsMin || tooLong}
                    onClick={handleSong}
                    title="把这段念头交给 AI 谱成一首歌">
              ♪ 做成一首歌
            </button>
            <button className="btn btn-block" onClick={() => { onSaveDraft(); toast('草稿已保存'); }}>
              保存为草稿
            </button>
          </div>

          <div className="paper panel">
            <h4>
              <span>灵感卡片</span>
              <span style={{fontSize:11, color:'var(--ink-faint)', marginLeft:8, fontWeight:'normal', letterSpacing:0}}>
                共 {essayCards.length} 张
              </span>
            </h4>
            {essayCards.length === 0 ? (
              <div className="hint">
                进入对话后，选中回响者的话语<br/>
                点浮出的「★ 收藏选段」<br/>
                即可在此沉淀
              </div>
            ) : (
              <div className="write-cards-list">
                {essayCards.map(c => (
                  <div className="write-mini-card" key={c.id}>
                    <div className="from">
                      <span className={`cand-avatar t-${c.persona_type}`}
                            style={{width:20, height:20, fontSize:10, marginRight:6}}>
                        {c.avatar || c.persona_name[0]}
                      </span>
                      <span>{c.persona_name}</span>
                    </div>
                    <div className="text">{c.text}</div>
                    <button className="card-insert"
                            onClick={() => { insertQuote(c.text, c.persona_name); toast('已插入随笔'); }}>
                      ↩ 插入到随笔
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
};
