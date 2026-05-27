/* screen-dialogue.jsx — C1 对话室（LLM2 角色化对话）------- */

window.ScreenDialogue = function({ essay, candidate, dialogue, setDialogue, onAddCard, onBackToEchoes, onBackToWrite, onInsertToWrite, toast, cardCount }) {
  const [draft, setDraft] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const [selectionTip, setSelectionTip] = React.useState(null); // {text, x, y}
  const streamRef = React.useRef(null);

  // 找到完整 persona(从 PERSONAS 里取风格资料)
  const persona = React.useMemo(() => {
    const found = window.PERSONAS.find(p => p.id === candidate.id);
    return found || candidate._persona || candidate;
  }, [candidate]);

  // 初次进入:LLM2 自动开口
  React.useEffect(() => {
    if (dialogue.messages && dialogue.messages.length > 0) return;
    setThinking(true);
    window.callLLM2({
      persona,
      essay_context: essay.content,
      dialogue_history: [],
      action: 'respond',
      user_message: ''
    }).then(out => {
      setDialogue(prev => ({
        ...prev,
        messages: [{
          id: out.message_id,
          role: 'persona',
          text: out.text,
          cited: out.cited_snippets,
          ts: Date.now()
        }]
      }));
    }).catch(() => {
      toast('初始化对话失败，请检查 API 配置');
    }).finally(() => {
      setThinking(false);
    });
  }, []);

  // 滚动到底部
  React.useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [dialogue.messages, thinking]);

  // 监听文本选区：在 persona 气泡内选中文字时，浮出"收藏选段"按钮
  React.useEffect(() => {
    const handler = (e) => {
      if (e.target.closest && e.target.closest('.selection-tip')) return; // 点击按钮自身不重算
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) { setSelectionTip(null); return; }
        const text = sel.toString().trim();
        if (!text) { setSelectionTip(null); return; }
        const range = sel.getRangeAt(0);
        const node = range.commonAncestorContainer;
        const el = (node.nodeType === 1 ? node : node.parentElement);
        const bubble = el && el.closest && el.closest('.bubble');
        const msgWrap = bubble && bubble.parentElement;
        if (!bubble || !msgWrap || !msgWrap.classList.contains('persona')) {
          setSelectionTip(null); return;
        }
        const rect = range.getBoundingClientRect();
        setSelectionTip({
          text,
          x: rect.left + rect.width / 2,
          y: rect.top
        });
      }, 0);
    };
    document.addEventListener('mouseup', handler);
    return () => document.removeEventListener('mouseup', handler);
  }, []);

  const saveSelection = () => {
    if (!selectionTip) return;
    onAddCard({
      id: 'c_' + Math.random().toString(36).slice(2,9),
      essay_id: essay.id,
      persona_id: persona.id,
      persona_name: persona.name,
      persona_type: persona.type,
      avatar: persona.avatar,
      text: selectionTip.text,
      ts: Date.now(),
      candidate: candidate
    });
    toast('已收入灵感卡片');
    const sel = window.getSelection();
    if (sel) sel.removeAllRanges();
    setSelectionTip(null);
  };

  const sendAction = async (action, userText) => {
    const messages = dialogue.messages || [];
    const newMsgs = userText ? [...messages, {
      id: 'u_' + Math.random().toString(36).slice(2,9),
      role: 'user',
      text: userText,
      ts: Date.now()
    }] : messages;

    setDialogue(prev => ({ ...prev, messages: newMsgs }));
    setDraft('');
    setThinking(true);

    try {
      const out = await window.callLLM2({
        persona,
        essay_context: essay.content,
        dialogue_history: newMsgs,
        action,
        user_message: userText
      });

      const finalMsgs = [...newMsgs, {
        id: out.message_id,
        role: 'persona',
        text: out.text,
        cited: out.cited_snippets,
        ts: Date.now()
      }];

      // 每 10 轮自动插入"模拟"提示
      const personaCount = finalMsgs.filter(m => m.role === 'persona').length;
      let withReminder = finalMsgs;
      if (personaCount > 0 && personaCount % 10 === 0) {
        withReminder = [...finalMsgs, {
          id: 'sys_' + Date.now(),
          role: 'system',
          text: `这不是真实的 ${persona.name}。这是基于公开作品的风格化模拟。`,
          ts: Date.now()
        }];
      }
      setDialogue(prev => ({ ...prev, messages: withReminder }));
    } catch(err) {
      toast('发送失败，请检查 API 配置');
    } finally {
      setThinking(false);
    }
  };

  const onSend = () => {
    if (!draft.trim()) {
      // 默认动作:让 ta 回应这段话
      sendAction('respond', '');
      return;
    }
    sendAction('respond', draft.trim());
  };

  const handleFavorite = (msg) => {
    const sel = window.getSelection();
    const selText = sel ? sel.toString().trim() : '';
    if (!selText) {
      toast('请先用鼠标选中要收藏的文字');
      return;
    }
    onAddCard({
      id: 'c_' + Math.random().toString(36).slice(2,9),
      essay_id: essay.id,
      persona_id: persona.id,
      persona_name: persona.name,
      persona_type: persona.type,
      avatar: persona.avatar,
      text: selText,
      ts: msg.ts || Date.now(),
      candidate: candidate
    });
    toast('已收入灵感卡片');
    sel.removeAllRanges();
    setSelectionTip(null);
  };

  const handleInsertBack = (msg) => {
    onInsertToWrite(msg.text, persona.name);
    toast('已带回写作页(以引用块插入)');
  };

  const messages = dialogue.messages || [];

  return (
    <main className="page">
      {selectionTip && (
        <div className="selection-tip"
             style={{ left: selectionTip.x, top: selectionTip.y }}
             onMouseDown={(e) => { e.preventDefault(); saveSelection(); }}>
          ★ 收藏选段
        </div>
      )}
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:18}}>
        <button className="btn btn-ghost btn-sm" onClick={onBackToEchoes}>← 回到星图</button>
        <span style={{fontSize:12, color:'var(--ink-mute)', letterSpacing:'2px'}}>对话室 · Dialogue</span>
      </div>

      <div className="dialogue-page">
        {/* 左:原随笔上下文 */}
        <aside className="paper dlg-context">
          <h4>你的随笔</h4>
          <p>{essay.content}</p>
          <div style={{marginTop:14, paddingTop:14, borderTop:'1px dashed var(--paper-rim)'}}>
            <button className="btn btn-ghost btn-sm" onClick={onBackToWrite}>继续写作 →</button>
          </div>
        </aside>

        {/* 中:对话主区 */}
        <section className="paper dlg-main">
          <div className="dlg-header">
            <window.PersonaAvatar persona={persona} size={44}/>
            <div>
              <div className="name">
                {persona.name}
                <span style={{marginLeft:8}}><window.TypeBadge type={persona.type}/></span>
              </div>
              <div className="intro">{persona.intro}{persona.era?` · ${persona.era}`:''}</div>
            </div>
          </div>

          <div className="dlg-stream" ref={streamRef}>
            {messages.map(m => {
              if (m.role === 'system') {
                return (
                  <div key={m.id} style={{textAlign:'center', fontSize:11.5, color:'var(--ink-mute)', letterSpacing:'1px', padding:'4px 0'}}>
                    · {m.text} ·
                  </div>
                );
              }
              return (
                <div key={m.id} className={`msg ${m.role} t-${persona.type}`}>
                  <div className="bubble">{m.text}</div>
                  {m.role === 'persona' && (
                    <div className="meta">
                      <button onClick={() => handleFavorite(m)}>★ 收藏为灵感卡片</button>
                      <button onClick={() => handleInsertBack(m)}>↩ 带回写作</button>
                    </div>
                  )}
                </div>
              );
            })}
            {thinking && (
              <div className={`msg persona t-${persona.type}`}>
                <div className="bubble">
                  <span className="typing"><span></span><span></span><span></span></span>
                </div>
              </div>
            )}
          </div>

          <div className="dlg-actions">
            <div className="dlg-actions-row">
              <button className="dlg-action" onClick={() => sendAction('respond', '')}>让 ta 回应这段话</button>
              <button className="dlg-action" onClick={() => sendAction('continue', '')}>让 ta 续写</button>              <button className="dlg-action" onClick={() => sendAction('opposite_view', '')}>从相反立场重审</button>
              <button className="dlg-action" onClick={() => sendAction('deepen', '')}>更深一层的角度</button>
            </div>
            <div className="dlg-input-row">
              <textarea className="dlg-input"
                        value={draft}
                        placeholder="表达此刻想法 ta⋯⋯按 Enter 发送,Shift+Enter 换行"
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault(); onSend();
                          }
                        }}/>
              <button className="btn btn-primary" onClick={onSend} disabled={thinking}>
                {thinking ? '思忖中⋯' : '发送'}
              </button>
            </div>
          </div>
        </section>

        {/* 右:灵感卡片抽屉 */}
        <aside className="paper dlg-cards">
          <h4>
            <span>本次灵感</span>
            <span style={{fontSize:11, color:'var(--ink-faint)'}}>
              共 {(dialogue.cards||[]).length} 张
            </span>
          </h4>
          {(dialogue.cards||[]).length === 0 ? (
            <div className="empty">用鼠标选中一段文字<br/>点浮出的「★ 收藏选段」<br/>沉淀进灵感卡片</div>
          ) : (
            (dialogue.cards||[]).map(c => (
              <div className="mini-card" key={c.id}>
                <div className="from">{c.persona_name}</div>
                <div className="text">{c.text.length > 80 ? c.text.slice(0,78)+'…' : c.text}</div>
              </div>
            ))
          )}
        </aside>
      </div>
    </main>
  );
};
