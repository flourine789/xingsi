/* music-profile-panel.jsx — 音乐画像面板（预设勾选 + 歌手/歌词解析） */

window.MusicProfilePanel = function({ open, onClose, toast }) {
  const [tab, setTab] = React.useState('presets');
  const [profile, setProfile] = React.useState(() => window.getMusicProfile());

  // 解析输入区状态
  const [artistName, setArtistName] = React.useState('');
  const [artistAnalyzing, setArtistAnalyzing] = React.useState(false);

  const [lyricsLabel, setLyricsLabel] = React.useState('');
  const [lyricsText, setLyricsText] = React.useState('');
  const [lyricsAnalyzing, setLyricsAnalyzing] = React.useState(false);

  // ESC 关闭
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // 打开时重新读取（避免外部修改不同步）
  React.useEffect(() => {
    if (open) setProfile(window.getMusicProfile());
  }, [open]);

  if (!open) return null;

  const persist = (next) => {
    setProfile(next);
    window.saveMusicProfile(next);
  };

  /* ---------- 预设勾选 ---------- */
  const togglePreset = (key, value) => {
    const cur = profile.presets[key] || [];
    const has = cur.includes(value);
    const nextList = has ? cur.filter(v => v !== value) : [...cur, value];
    persist({ ...profile, presets: { ...profile.presets, [key]: nextList } });
  };

  const setFreeText = (text) => {
    // 手动编辑时同步写入 freeTextManual，作为日后反思的"用户原话基线"
    persist({
      ...profile,
      presets: { ...profile.presets, freeText: text },
      freeTextManual: text
    });
  };

  /* ---------- 歌手解析 ---------- */
  const handleAnalyzeArtist = async () => {
    const name = artistName.trim();
    if (!name) { toast && toast('请填写歌手名'); return; }
    setArtistAnalyzing(true);
    try {
      const analysis = await window.analyzeArtist(name);
      const ref = {
        id: 'ref_' + Math.random().toString(36).slice(2, 10),
        kind: 'artist',
        label: name,
        analysis,
        created_at: Date.now()
      };
      persist({ ...profile, references: [...profile.references, ref] });
      setArtistName('');
      toast && toast(`已加入画像：${name}`);
    } catch(err) {
      toast && toast('解析失败：' + (err.message || '未知错误'));
    } finally {
      setArtistAnalyzing(false);
    }
  };

  /* ---------- 歌词解析 ---------- */
  const handleAnalyzeLyrics = async () => {
    const text = lyricsText.trim();
    if (text.length < 10) { toast && toast('歌词内容太短'); return; }
    setLyricsAnalyzing(true);
    try {
      const analysis = await window.analyzeLyrics(text, lyricsLabel.trim());
      const ref = {
        id: 'ref_' + Math.random().toString(36).slice(2, 10),
        kind: 'lyrics',
        label: lyricsLabel.trim() || '一段歌词',
        analysis,
        created_at: Date.now()
      };
      persist({ ...profile, references: [...profile.references, ref] });
      setLyricsLabel('');
      setLyricsText('');
      toast && toast('已加入画像');
    } catch(err) {
      toast && toast('解析失败：' + (err.message || '未知错误'));
    } finally {
      setLyricsAnalyzing(false);
    }
  };

  const removeReference = (id) => {
    persist({ ...profile, references: profile.references.filter(r => r.id !== id) });
  };

  const resetAll = () => {
    if (!window.confirm('重置后会清空所有预设和已解析的参考，确定？')) return;
    persist(window.DEFAULT_MUSIC_PROFILE);
    toast && toast('已重置音乐画像');
  };

  const presetOptions = window.MUSIC_PRESET_OPTIONS || { genres: [], moods: [], instruments: [], languages: [] };

  return (
    <div className="intro-backdrop" onClick={onClose}>
      <div className="intro-modal" onClick={(e) => e.stopPropagation()}>
        <div className="intro-head">
          <div className="intro-tabs">
            <button className={`intro-tab ${tab==='presets'?'active':''}`} onClick={() => setTab('presets')}>预设勾选</button>
            <button className={`intro-tab ${tab==='artist'?'active':''}`} onClick={() => setTab('artist')}>喜欢的歌手</button>
            <button className={`intro-tab ${tab==='lyrics'?'active':''}`} onClick={() => setTab('lyrics')}>上传歌词</button>
            <button className={`intro-tab ${tab==='profile'?'active':''}`} onClick={() => setTab('profile')}>当前画像</button>
          </div>
          <button className="intro-close" onClick={onClose} title="关闭">×</button>
        </div>

        <div className="intro-body">
          {tab === 'presets' && (
            <article className="intro-article">
              <h2>预设你喜欢的曲风</h2>
              <p style={{color:'var(--ink-mute)', fontSize:13, marginTop:-6, marginBottom:18}}>
                选中后，每次写歌都会把这些偏好注入到 LLM3 的 system prompt。可随时增减。
              </p>

              <PresetGroup title="曲风"     items={presetOptions.genres}      selected={profile.presets.genres}      onToggle={(v) => togglePreset('genres', v)} />
              <PresetGroup title="情绪"     items={presetOptions.moods}       selected={profile.presets.moods}       onToggle={(v) => togglePreset('moods', v)} />
              <PresetGroup title="乐器"     items={presetOptions.instruments} selected={profile.presets.instruments} onToggle={(v) => togglePreset('instruments', v)} />
              <PresetGroup title="语种"     items={presetOptions.languages}   selected={profile.presets.languages}   onToggle={(v) => togglePreset('languages', v)} />

              <div style={{marginTop:18}}>
                <h5 style={{fontSize:12, letterSpacing:3, color:'var(--ink-mute)', margin:'0 0 8px'}}>自由补充</h5>
                <textarea className="mp-textarea"
                          rows={3}
                          placeholder="例如：想要克制的，不要太抒情；尽量少用电吉他；句子不要太长。"
                          value={profile.presets.freeText || ''}
                          onChange={(e) => setFreeText(e.target.value)} />
              </div>

              <div style={{marginTop:24, display:'flex', justifyContent:'flex-end'}}>
                <button className="btn btn-ghost btn-sm" onClick={resetAll}>重置全部</button>
              </div>
            </article>
          )}

          {tab === 'artist' && (
            <article className="intro-article">
              <h2>告诉我你喜欢哪位歌手</h2>
              <p style={{color:'var(--ink-mute)', fontSize:13, marginTop:-6, marginBottom:18}}>
                输入歌手 / 词曲人 / 乐队的名字，LLM 会提炼他/她的风格特征加入你的画像。
              </p>

              <div style={{display:'flex', gap:8, alignItems:'stretch'}}>
                <input className="mp-input" type="text"
                       placeholder="例如：李宗盛 / Taylor Swift / 坂本龙一"
                       value={artistName}
                       onChange={(e) => setArtistName(e.target.value)}
                       onKeyDown={(e) => { if (e.key === 'Enter' && !artistAnalyzing) handleAnalyzeArtist(); }} />
                <button className="btn btn-primary"
                        disabled={artistAnalyzing || !artistName.trim()}
                        onClick={handleAnalyzeArtist}>
                  {artistAnalyzing ? '解析中…' : '解析并加入'}
                </button>
              </div>

              <ArtistList references={profile.references.filter(r => r.kind === 'artist')}
                          onRemove={removeReference} />
            </article>
          )}

          {tab === 'lyrics' && (
            <article className="intro-article">
              <h2>贴一段你喜欢的歌词</h2>
              <p style={{color:'var(--ink-mute)', fontSize:13, marginTop:-6, marginBottom:18}}>
                LLM 会解析这段歌词的意象、押韵、情绪，作为你的偏好参考。
              </p>

              <input className="mp-input" type="text"
                     placeholder="标注（可选）：歌名 - 歌手"
                     value={lyricsLabel}
                     onChange={(e) => setLyricsLabel(e.target.value)} />

              <textarea className="mp-textarea"
                        rows={8}
                        style={{marginTop:8}}
                        placeholder={'把你喜欢的歌词贴进来⋯⋯\n至少 10 字。'}
                        value={lyricsText}
                        onChange={(e) => setLyricsText(e.target.value)} />

              <div style={{marginTop:10, display:'flex', justifyContent:'flex-end'}}>
                <button className="btn btn-primary"
                        disabled={lyricsAnalyzing || lyricsText.trim().length < 10}
                        onClick={handleAnalyzeLyrics}>
                  {lyricsAnalyzing ? '解析中…' : '解析并加入'}
                </button>
              </div>

              <ArtistList references={profile.references.filter(r => r.kind === 'lyrics')}
                          onRemove={removeReference} />
            </article>
          )}

          {tab === 'profile' && (
            <article className="intro-article">
              <h2>写歌时会用到的画像</h2>
              <p style={{color:'var(--ink-mute)', fontSize:13, marginTop:-6, marginBottom:18}}>
                这是会真正注入到 LLM3 system prompt 顶部的内容。如果为空，表示尚未设置任何偏好。
              </p>

              <pre style={{
                whiteSpace:'pre-wrap',
                fontFamily:'var(--serif)', fontSize:13, color:'var(--ink)',
                background:'var(--paper-soft)', padding:'16px 20px',
                borderRadius:6, lineHeight:1.85,
                border:'1px solid var(--paper-rim)'
              }}>
                {window.compileMusicProfileText(profile) || '（暂无偏好。去前几个 tab 添加。）'}
              </pre>

              {/* 反思状态 */}
              <div style={{marginTop:24, padding:'12px 16px', background:'var(--paper-soft)',
                           border:'1px dashed var(--paper-rim)', borderRadius:6,
                           fontSize:12, color:'var(--ink-mute)', lineHeight:1.7}}>
                <strong style={{color:'var(--ink-soft)', letterSpacing:1}}>♺ 自动反思</strong>
                <div style={{marginTop:4}}>
                  已生成 {profile.trajectories.length} 首歌 · 距下次反思还差{' '}
                  {Math.max(0, (window.REFLECT_EVERY || 3) - (profile.trajectories.length - profile.lastReflectedAt))} 首
                  · 已发生 {profile.reflectionHistory.length} 次反思
                </div>
                {profile.reflectionHistory.length > 0 && (
                  <details style={{marginTop:10}}>
                    <summary style={{cursor:'pointer', color:'var(--cinnabar)', fontSize:12}}>
                      查看反思历史
                    </summary>
                    <div style={{marginTop:10, display:'flex', flexDirection:'column', gap:10}}>
                      {[...profile.reflectionHistory].reverse().map((h, i) => (
                        <div key={i} style={{padding:'8px 10px', background:'var(--paper)', borderRadius:4}}>
                          <div style={{fontSize:11, color:'var(--ink-faint)', marginBottom:4}}>
                            {new Date(h.at).toLocaleString('zh-CN')} · 基于 {h.basis_count} 首
                          </div>
                          {h.prevFreeText && (
                            <div style={{fontSize:12, color:'var(--ink-faint)', textDecoration:'line-through', marginBottom:4}}>
                              {h.prevFreeText}
                            </div>
                          )}
                          <div style={{fontSize:12, color:'var(--ink)'}}>{h.newFreeText}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>

              <div style={{marginTop:16, display:'flex', justifyContent:'flex-end'}}>
                <button className="btn btn-ghost btn-sm" onClick={resetAll}>重置全部</button>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
};

/* ----- 子组件 ----- */
function PresetGroup({ title, items, selected, onToggle }) {
  return (
    <div style={{marginBottom:14}}>
      <h5 style={{fontSize:12, letterSpacing:3, color:'var(--ink-mute)', margin:'0 0 8px'}}>{title}</h5>
      <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
        {items.map(v => {
          const active = (selected || []).includes(v);
          return (
            <button key={v}
                    className={`mp-chip ${active ? 'active' : ''}`}
                    onClick={() => onToggle(v)}>
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ArtistList({ references, onRemove }) {
  if (!references || references.length === 0) {
    return (
      <div style={{marginTop:24, color:'var(--ink-faint)', fontSize:13, textAlign:'center'}}>
        还没有解析过的参考
      </div>
    );
  }
  return (
    <div style={{marginTop:24}}>
      <h5 style={{fontSize:12, letterSpacing:3, color:'var(--ink-mute)', margin:'0 0 10px'}}>
        已收录（{references.length}）
      </h5>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {references.map(r => (
          <div key={r.id} style={{
            background:'var(--paper-soft)',
            border:'1px solid var(--paper-rim)',
            borderRadius:6,
            padding:'12px 14px'
          }}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6}}>
              <strong style={{fontFamily:'var(--serif)', letterSpacing:1}}>
                {r.kind === 'artist' ? '♪ ' : '✎ '}{r.label}
              </strong>
              <button className="btn btn-ghost btn-sm"
                      onClick={() => onRemove(r.id)}
                      style={{fontSize:11}}>移除</button>
            </div>
            <div style={{fontSize:13, color:'var(--ink-soft)', lineHeight:1.75}}>
              {r.analysis}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
