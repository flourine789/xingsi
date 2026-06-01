/* screen-dialogue.jsx — C1 对话室（LLM2 角色化对话）------- */

window.ScreenDialogue = function({ essay, candidate, dialogue, setDialogue, onAddCard, onBackToEchoes, onBackToWrite, onInsertToWrite, toast, cardCount }) {
  const [draft, setDraft] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const [selectionTip, setSelectionTip] = React.useState(null); // {text, x, y}
  const streamRef = React.useRef(null);
  // skills 相关
  const [skillsTick, setSkillsTick] = React.useState(0); // 用于触发重新读取
  const [saveSkillFor, setSaveSkillFor] = React.useState(null); // {msg, hint}
  const [skillsExpanded, setSkillsExpanded] = React.useState(false);

  // 找到完整 persona(从 PERSONAS 里取风格资料)
  const persona = React.useMemo(() => {
    const found = window.PERSONAS.find(p => p.id === candidate.id);
    return found || candidate._persona || candidate;
  }, [candidate]);

  // 当前 persona 适用的 skill 列表
  const skills = React.useMemo(
    () => (window.getDialogueSkillsFor ? window.getDialogueSkillsFor(persona.type) : []),
    [persona.type, skillsTick]
  );

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
          ts: Date.now(),
          source: { skill_id: 'sk_respond', skill_name: '让 ta 回应这段话', user_message: '' }
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

  // skill 可以是字符串 action（向后兼容）或 skill 对象
  const sendAction = async (skillOrAction, userText) => {
    const skill = typeof skillOrAction === 'string'
      ? skills.find(s => s.prompt_template === actionStringToTemplate(skillOrAction)) || null
      : skillOrAction;
    const action = (skill && skill.id === 'sk_continue') ? 'continue'
                 : (skill && skill.id === 'sk_deepen') ? 'deepen'
                 : (skill && skill.id === 'sk_rebut') ? 'rebut'
                 : (skill && skill.id === 'sk_opposite') ? 'opposite_view'
                 : (typeof skillOrAction === 'string' ? skillOrAction : 'respond');

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
        action_prompt: skill ? skill.prompt_template : null,
        user_message: userText
      });

      if (skill && window.incrementSkillUse) {
        window.incrementSkillUse(skill.id);
        setSkillsTick(t => t + 1);
      }

      const finalMsgs = [...newMsgs, {
        id: out.message_id,
        role: 'persona',
        text: out.text,
        cited: out.cited_snippets,
        ts: Date.now(),
        source: skill
          ? { skill_id: skill.id, skill_name: skill.name, user_message: userText || '' }
          : { user_message: userText || '' }
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
    const respondSkill = skills.find(s => s.id === 'sk_respond');
    if (!draft.trim()) {
      sendAction(respondSkill || 'respond', '');
      return;
    }
    sendAction(respondSkill || 'respond', draft.trim());
  };

  function actionStringToTemplate(action) {
    // 仅用于初始化时把老式 action 字符串匹配回 skill
    const map = {
      respond: 'sk_respond', continue: 'sk_continue',
      rebut: 'sk_rebut', opposite_view: 'sk_opposite', deepen: 'sk_deepen'
    };
    const id = map[action];
    const found = id && skills.find(s => s.id === id);
    return found ? found.prompt_template : null;
  }

  const openSaveSkillModal = (msg) => {
    const src = msg.source || {};
    // 优先把"用户当时的输入"作为新 skill 的种子；否则用触发它的 skill 模板
    const seedTemplate = src.user_message
      ? `请按以下意图继续与用户对话：${src.user_message}`
      : (skills.find(s => s.id === src.skill_id)?.prompt_template || '请回应用户的最新发言。');
    const seedName = src.user_message
      ? src.user_message.slice(0, 20)
      : (src.skill_name ? `${src.skill_name}（自定义版）` : '我的动作');
    setSaveSkillFor({
      msg,
      defaults: {
        name: seedName,
        prompt_template: seedTemplate,
        applies_to: [persona.type]
      }
    });
  };

  const confirmSaveSkill = (data) => {
    if (!data.name.trim() || !data.prompt_template.trim()) {
      toast('名字和模板都不能为空');
      return;
    }
    window.addSkill({
      name: data.name.trim(),
      description: data.description || '',
      scope: 'dialogue',
      prompt_template: data.prompt_template.trim(),
      applies_to: data.applies_to,
      source: 'user',
      created_from: saveSkillFor && saveSkillFor.msg && saveSkillFor.msg.id
        ? { message_id: saveSkillFor.msg.id }
        : null
    });
    toast(`已保存动作「${data.name.trim()}」`);
    setSaveSkillFor(null);
    setSkillsTick(t => t + 1);
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
                      <button onClick={() => openSaveSkillModal(m)} title="把这次操作存为可复用的动作">
                        ⤴ 存为动作
                      </button>
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
              {(skillsExpanded ? skills : skills.slice(0, 5)).map(s => (
                <button key={s.id}
                        className="dlg-action"
                        onClick={() => sendAction(s, '')}
                        title={s.description || s.prompt_template}>
                  {s.starred && <span style={{opacity:.6, marginRight:3}}>★</span>}
                  {s.name}
                  {s.uses > 0 && <span style={{opacity:.45, fontSize:11, marginLeft:6}}>×{s.uses}</span>}
                </button>
              ))}
              {skills.length > 5 && (
                <button className="dlg-action" style={{opacity:.7}}
                        onClick={() => setSkillsExpanded(v => !v)}>
                  {skillsExpanded ? '收起' : `+${skills.length - 5}`}
                </button>
              )}
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

        {saveSkillFor && (
          <window.SaveSkillModal
            defaults={saveSkillFor.defaults}
            personaType={persona.type}
            onCancel={() => setSaveSkillFor(null)}
            onConfirm={confirmSaveSkill}
          />
        )}

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

/* ---------- SaveSkillModal ---------- */
window.SaveSkillModal = function({ defaults, personaType, onCancel, onConfirm }) {
  const [name, setName] = React.useState(defaults.name || '');
  const [promptTemplate, setPromptTemplate] = React.useState(defaults.prompt_template || '');
  const [description, setDescription] = React.useState('');
  const [appliesTo, setAppliesTo] = React.useState(defaults.applies_to || [personaType]);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel && onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const toggleType = (t) => {
    setAppliesTo(cur => cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t]);
  };

  return (
    <div className="intro-backdrop" onClick={onCancel}>
      <div className="intro-modal" style={{maxWidth: 560}} onClick={(e) => e.stopPropagation()}>
        <div className="intro-head">
          <div style={{fontSize:15, letterSpacing:4, color:'var(--ink-soft)', fontFamily:'var(--serif)'}}>
            ⤴ 保存为可复用的对话动作
          </div>
          <button className="intro-close" onClick={onCancel} title="取消">×</button>
        </div>
        <div className="intro-body" style={{padding: '14px 20px 20px'}}>
          <div style={{marginBottom:14}}>
            <label style={{display:'block', fontSize:12, letterSpacing:2, color:'var(--ink-mute)', marginBottom:6}}>动作名（按钮上显示）</label>
            <input className="mp-input" type="text" maxLength={24}
                   value={name} onChange={(e) => setName(e.target.value)}
                   placeholder="例如：辛辣反问 / 一句格言 / 列三个反例" />
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:'block', fontSize:12, letterSpacing:2, color:'var(--ink-mute)', marginBottom:6}}>
              触发模板（告诉 LLM 怎么做）
            </label>
            <textarea className="mp-textarea" rows={4}
                      value={promptTemplate}
                      onChange={(e) => setPromptTemplate(e.target.value)}
                      placeholder="例如：请用一句不超过 20 字的反问回应用户的发言。" />
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:'block', fontSize:12, letterSpacing:2, color:'var(--ink-mute)', marginBottom:6}}>说明（可选，hover 提示）</label>
            <input className="mp-input" type="text" maxLength={60}
                   value={description} onChange={(e) => setDescription(e.target.value)}
                   placeholder="一句话描述这个动作的用途" />
          </div>

          <div style={{marginBottom:18}}>
            <label style={{display:'block', fontSize:12, letterSpacing:2, color:'var(--ink-mute)', marginBottom:6}}>
              适用回响者类型
            </label>
            <div style={{display:'flex', gap:6}}>
              {[{k:'writer', l:'作家'}, {k:'celebrity', l:'名人'}, {k:'news', l:'评论'}].map(t => (
                <button key={t.k}
                        className={`mp-chip ${appliesTo.includes(t.k) ? 'active' : ''}`}
                        onClick={() => toggleType(t.k)}>
                  {t.l}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:10}}>
            <button className="btn btn-ghost btn-sm" onClick={onCancel}>取消</button>
            <button className="btn btn-primary btn-sm"
                    onClick={() => onConfirm({
                      name, prompt_template: promptTemplate, description, applies_to: appliesTo
                    })}>
              保存动作
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
