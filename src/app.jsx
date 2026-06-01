/* app.jsx — 顶层 App ----------------------------------------
   屏幕路由:home / write / matching / echoes / dialogue / cards
   实体:Essay / MatchRun / Candidate / Dialogue / Card
   持久化:全部入 localStorage(MVP 的"后端")。
----------------------------------------------------------- */

const { useState, useEffect, useCallback, useMemo } = React;

function newId(prefix) {
  return `${prefix}_` + Math.random().toString(36).slice(2,10);
}

function App() {
  const [route, setRoute] = useState('home');           // home/write/matching/echoes/dialogue/cards
  const [essays, setEssays] = window.useStored('xingsi:essays', []);
  const [cards, setCards]  = window.useStored('xingsi:cards', []);
  const [dialogues, setDialogues] = window.useStored('xingsi:dialogues', {}); // { dialogueId: {messages,...} }
  const [matches, setMatches] = window.useStored('xingsi:matches', {});       // { essayId: matchResult }
  const [songs, setSongs] = window.useStored('xingsi:songs', {});             // { essayId: { lyrics, prompt, audio_url, created_at } }
  const [composingState, setComposingState] = useState(null);                  // null | 'lyrics' | 'music'
  const [composingError, setComposingError] = useState(null);

  // 首次进入(无任何随笔且无"已被引导"标记)塞入一段示例随笔,降低空状态
  useEffect(() => {
    const seeded = localStorage.getItem('xingsi:seeded');
    if (!seeded && essays.length === 0) {
      const id = 'e_seed_' + Math.random().toString(36).slice(2,6);
      const now = Date.now();
      const sample = {
        id, content: '今晚读完一本旧书,合上的时候窗外正在下雨。我一直想不明白:为什么我们做的事比父辈多,内心却更加疲惫?是我们想得太多,还是这个时代过分喧嚣?',
        word_count: 60, language: 'zh', created_at: now, updated_at: now,
        status: 'draft', recent_echoes: []
      };
      setEssays([sample]);
      localStorage.setItem('xingsi:seeded', '1');
    }
  }, []); // eslint-disable-line

  const [activeEssayId, setActiveEssayId] = useState(null);
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [activeDialogueId, setActiveDialogueId] = useState(null);

  // 介绍弹窗：首次访问自动弹出
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem('xingsi:intro-seen'));
  const closeIntro = useCallback(() => {
    setShowIntro(false);
    localStorage.setItem('xingsi:intro-seen', '1');
  }, []);

  const { show: toast, node: toastNode } = window.useToast();

  /* --- 找到当前 essay --- */
  const activeEssay = useMemo(
    () => essays.find(e => e.id === activeEssayId) || null,
    [essays, activeEssayId]
  );

  const upsertEssay = useCallback((updater) => {
    setEssays(prev => {
      const idx = prev.findIndex(e => e.id === activeEssayId);
      if (idx < 0) return prev;
      const next = [...prev];
      next[idx] = updater(next[idx]);
      return next;
    });
  }, [activeEssayId, setEssays]);

  /* --- A1 → A2 :新起一篇 --- */
  const handleNew = () => {
    const id = newId('e');
    const now = Date.now();
    const e = {
      id, content: '', word_count: 0,
      language: 'zh', created_at: now, updated_at: now,
      status: 'draft', recent_echoes: []
    };
    setEssays(prev => [e, ...prev]);
    setActiveEssayId(id);
    setRoute('write');
  };

  const handleOpenEssay = (id) => {
    setActiveEssayId(id);
    // 若已经有匹配结果,可直接进 echoes;否则进书写
    if (matches[id]) setRoute('echoes');
    else setRoute('write');
  };

  const handleDeleteEssay = (id) => {
    setEssays(prev => prev.filter(e => e.id !== id));
    setMatches(prev => { const c={...prev}; delete c[id]; return c; });
    setDialogues(prev => {
      const c = {...prev};
      Object.keys(c).forEach(k => { if (c[k].essay_id === id) delete c[k]; });
      return c;
    });
    setCards(prev => prev.filter(card => card.essay_id !== id));
    toast('已删除该随笔与对应对话');
  };

  /* --- A2 内容变更 / 保存 --- */
  const handleContentChange = (val) => {
    upsertEssay(e => ({
      ...e,
      content: val,
      word_count: window.countChars(val),
      updated_at: Date.now()
    }));
  };

  const handleSaveDraft = () => {
    upsertEssay(e => ({ ...e, status: 'draft', updated_at: Date.now() }));
  };

  const handleClear = () => {
    upsertEssay(e => ({ ...e, content: '', word_count: 0, updated_at: Date.now() }));
  };

  /* --- A2 → B1 → B2:寻找共鸣 --- */
  const handleMatch = () => {
    upsertEssay(e => ({ ...e, status: 'submitted' }));
    setRoute('matching');
  };

  const handleMatchingDone = async () => {
    if (!activeEssay) { setRoute('home'); return; }
    try {
      const result = await window.callLLM1(activeEssay.content);
      setMatches(prev => ({ ...prev, [activeEssay.id]: result }));
      upsertEssay(e => ({
        ...e,
        status: 'matched',
        recent_echoes: result.candidates.slice(0,3).map(c => ({ name: c.name, avatar: c.avatar }))
      }));
      setRoute('echoes');
      const n = result.fact_check && result.fact_check.filtered_count;
      if (n > 0) toast(`已过滤 ${n} 条疑似伪造的引文`);
    } catch(err) {
      setRoute('write');
      toast('匹配失败，请检查 API 配置后重试');
    }
  };

  /* --- B2 操作:再找一批 --- */
  const handleRefreshMatch = async () => {
    if (!activeEssay) return;
    try {
      const result = await window.callLLM1(activeEssay.content);
      setMatches(prev => ({ ...prev, [activeEssay.id]: result }));
      const n = result.fact_check && result.fact_check.filtered_count;
      toast(n > 0 ? `已重新匹配（过滤 ${n} 条疑似伪造引文）` : '已重新匹配');
    } catch(err) {
      toast('重新匹配失败，请检查 API 配置');
    }
  };

  /* --- B2 → 歌曲:做成一首歌 --- */
  const handleOpenSong = () => {
    if (!activeEssay) return;
    setComposingError(null);
    setRoute('song');
  };

  const handleComposeSong = async () => {
    if (!activeEssay) return;
    setComposingError(null);
    const tags = (matches[activeEssay.id] && matches[activeEssay.id].tags) || null;
    try {
      setComposingState('lyrics');
      const { lyrics, prompt } = await window.generateLyrics(activeEssay.content, tags);
      // 先存歌词，让用户在谱曲时能预览
      setSongs(prev => ({
        ...prev,
        [activeEssay.id]: { lyrics, prompt, audio_url: null, created_at: Date.now() }
      }));
      setComposingState('music');
      const { audio_url, duration } = await window.callMiniMaxMusic(lyrics, prompt);
      setSongs(prev => ({
        ...prev,
        [activeEssay.id]: { lyrics, prompt, audio_url, duration, created_at: Date.now() }
      }));
      setComposingState(null);

      // 记录轨迹 + 异步反思（每 REFLECT_EVERY 首一次）
      if (window.recordSongTrajectory) {
        window.recordSongTrajectory({
          essay_id: activeEssay.id,
          essay_text: activeEssay.content,
          lyrics, prompt
        });
      }
      if (window.reflectMusicProfileIfNeeded) {
        window.reflectMusicProfileIfNeeded().then(r => {
          if (r && r.triggered) toast('已根据最近 3 首歌更新你的曲风画像');
        }).catch(() => {});
      }
    } catch(err) {
      console.error('[composeSong]', err);
      setComposingError(err.message || '未知错误');
      setComposingState(null);
    }
  };

  /* --- B2 → C1:点击候选 --- */
  const handlePickCandidate = (cand) => {
    if (!activeEssay) return;
    setActiveCandidate(cand);
    // dialogue id 由 essay + persona 组成,保证多次进入同一组合时延续历史
    const did = `d_${activeEssay.id}_${cand.id}`;
    setActiveDialogueId(did);
    setDialogues(prev => {
      if (prev[did]) return prev;
      return {
        ...prev,
        [did]: { id: did, essay_id: activeEssay.id, persona_id: cand.id, messages: [], cards: [] }
      };
    });
    setRoute('dialogue');
  };

  const setActiveDialogue = (updater) => {
    setDialogues(prev => {
      const cur = prev[activeDialogueId];
      if (!cur) return prev;
      return { ...prev, [activeDialogueId]: updater(cur) };
    });
  };

  /* --- C1 收藏卡片 --- */
  const handleAddCard = (card) => {
    setCards(prev => [card, ...prev]);
    setActiveDialogue(d => ({ ...d, cards: [card, ...(d.cards||[])] }));
  };

  const handleDeleteCard = (id) => {
    setCards(prev => prev.filter(c => c.id !== id));
    setDialogues(prev => {
      const next = {...prev};
      Object.keys(next).forEach(k => {
        next[k] = { ...next[k], cards: (next[k].cards||[]).filter(c => c.id !== id) };
      });
      return next;
    });
  };

  /* --- C1 → A2:带回写作 --- */
  const handleInsertToWrite = (text, source) => {
    if (!window.__insertQuoteToWrite) {
      // 没在 write 页;直接修改 essay 内容,跳回去
      upsertEssay(e => ({
        ...e,
        content: (e.content || '') + `\n\n> ${text}\n> ——${source}\n\n`,
        updated_at: Date.now()
      }));
      setRoute('write');
      return;
    }
    setRoute('write');
    setTimeout(() => {
      if (window.__insertQuoteToWrite) window.__insertQuoteToWrite(text, source);
    }, 50);
  };

  /* --- 卡片页:回到对话 --- */
  const handleJumpFromCard = (card) => {
    const e = essays.find(x => x.id === card.essay_id);
    if (!e) { toast('原随笔已删除'); return; }
    // 1. 从本次匹配结果里找
    const m = matches[e.id];
    const cand = m && m.candidates.find(c => c.id === card.persona_id);
    if (cand) { setActiveEssayId(e.id); handlePickCandidate(cand); return; }
    // 2. 用卡片里存的完整 candidate
    if (card.candidate) { setActiveEssayId(e.id); handlePickCandidate(card.candidate); return; }
    // 3. 兜底：从 PERSONAS 重建（旧卡片兼容）
    const p = window.PERSONAS.find(p => p.id === card.persona_id);
    if (p) {
      const minCand = {
        id: p.id, name: p.name, type: p.type, era: p.era,
        avatar: p.avatar, intro: p.intro, _persona: p,
        excerpt: p.excerpts[0].text, excerpt_source: p.excerpts[0].source,
        similarity: 0.7, similarity_reason: '从灵感卡片回到对话',
        position_hint: { x: 0.5, y: 0.5 }
      };
      setActiveEssayId(e.id);
      handlePickCandidate(minCand);
      return;
    }
    toast('回响者不可达');
  };

  /* --- 渲染当前路由 --- */
  let screen;
  switch (route) {
    case 'write':
      if (!activeEssay) { setRoute('home'); break; }
      screen = (
        <window.ScreenWrite
          essay={activeEssay}
          cards={cards}
          onChange={handleContentChange}
          onMatch={handleMatch}
          onSaveDraft={handleSaveDraft}
          onClear={handleClear}
          onBack={() => { handleSaveDraft(); setRoute('home'); }}
          onOpenSong={handleOpenSong}
          toast={toast}
        />
      );
      break;
    case 'matching':
      if (!activeEssay) { setRoute('home'); break; }
      screen = (
        <window.ScreenMatching
          firstSentence={(activeEssay.content||'').split(/[。!?\.\!\?\n]/).filter(Boolean)[0] || ''}
          onDone={handleMatchingDone}
          onTimeout={() => { setRoute('write'); toast('线路有些拥挤,稍后再试'); }}
        />
      );
      break;
    case 'echoes':
      if (!activeEssay || !matches[activeEssay.id]) { setRoute('home'); break; }
      screen = (
        <window.ScreenEchoes
          essay={activeEssay}
          matchResult={matches[activeEssay.id]}
          onPick={handlePickCandidate}
          onRefresh={handleRefreshMatch}
          onBack={() => setRoute('write')}
          onOpenSong={handleOpenSong}
        />
      );
      break;
    case 'song':
      if (!activeEssay) { setRoute('home'); break; }
      screen = (
        <window.ScreenSong
          essay={activeEssay}
          song={songs[activeEssay.id]}
          composingState={composingState}
          composingError={composingError}
          onBack={() => setRoute('echoes')}
          onCompose={handleComposeSong}
          toast={toast}
        />
      );
      break;
    case 'dialogue':
      if (!activeEssay || !activeCandidate || !activeDialogueId) { setRoute('home'); break; }
      const dlg = dialogues[activeDialogueId] || { messages: [], cards: [] };
      screen = (
        <window.ScreenDialogue
          key={activeDialogueId}
          essay={activeEssay}
          candidate={activeCandidate}
          dialogue={dlg}
          setDialogue={setActiveDialogue}
          onAddCard={handleAddCard}
          onBackToEchoes={() => setRoute('echoes')}
          onBackToWrite={() => setRoute('write')}
          onInsertToWrite={handleInsertToWrite}
          toast={toast}
          cardCount={cards.length}
        />
      );
      break;
    case 'cards':
      screen = (
        <window.ScreenCards
          cards={cards}
          essays={essays}
          onDelete={handleDeleteCard}
          onBack={() => setRoute('home')}
          onJump={handleJumpFromCard}
          toast={toast}
        />
      );
      break;
    case 'home':
    default:
      screen = (
        <window.ScreenHome
          essays={essays}
          cards={cards}
          songs={songs}
          onNew={handleNew}
          onOpen={handleOpenEssay}
          onDelete={handleDeleteEssay}
          onOpenCards={() => setRoute('cards')}
        />
      );
  }

  return (
    <div className="app">
      <window.TopBar
        current={route}
        onNav={(k) => { if (k === 'home') setRoute('home'); }}
        onShowIntro={() => setShowIntro(true)}
      />
      {screen}
      <div className="panels-dock">
        <window.ApiPanel />
        <window.TweaksPanel />
      </div>
      <window.IntroCard open={showIntro} onClose={closeIntro} />
      {toastNode}
    </div>
  );
}

// 首帧主题应用(避免闪烁)
(function bootstrapTheme() {
  try {
    const raw = localStorage.getItem('xingsi:tweaks');
    const v = raw ? JSON.parse(raw) : { mood: 'parchment', accent: '#a8332a', texture: 'mid' };
    if (window.applyTweaks) window.applyTweaks(v);
  } catch(e) {}
})();

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
