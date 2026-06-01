/* tweaks-panel.jsx — 实时主题面板（Mood / Accent / Texture）---
   对应 DESIGN.md §四,所有 token 直写到 :root。
------------------------------------------------------------ */

const MOODS = {
  parchment: {
    label: '古纸',
    tokens: {
      '--paper': '#f3ede0',
      '--paper-soft': '#f8f3e7',
      '--paper-deep': '#ebe4d2',
      '--paper-rim': '#d8cdb4',
      '--ink': '#1c1611',
      '--ink-soft': '#4a3f33',
      '--ink-mute': '#7a6d5b',
      '--ink-faint': '#b5a98f',
      '--grain-base': '0.55'
    }
  },
  night: {
    label: '夜读',
    tokens: {
      '--paper': '#1c1814',
      '--paper-soft': '#2a241c',
      '--paper-deep': '#13110d',
      '--paper-rim': '#3a3024',
      '--ink': '#e7dcc1',
      '--ink-soft': '#c4b894',
      '--ink-mute': '#988a72',
      '--ink-faint': '#5a4f3e',
      '--grain-base': '0.20'
    }
  },
  dawn: {
    label: '晨白',
    tokens: {
      '--paper': '#fafaf7',
      '--paper-soft': '#ffffff',
      '--paper-deep': '#f0eee9',
      '--paper-rim': '#d4d0c8',
      '--ink': '#1a1a1a',
      '--ink-soft': '#404040',
      '--ink-mute': '#888888',
      '--ink-faint': '#cbc8c0',
      '--grain-base': '0.10'
    }
  }
};

const ACCENTS = [
  { name: '朱砂', hex: '#a8332a', deep: '#7e2620' },
  { name: '苍青', hex: '#5d7a72', deep: '#3f574f' },
  { name: '黛蓝', hex: '#4a5d75', deep: '#2e3e54' },
  { name: '古金', hex: '#a08454', deep: '#7a6238' }
];

const TEXTURES = [
  { key: 'hidden', label: '隐', mult: 0.25 },
  { key: 'mid',    label: '中', mult: 1.0 },
  { key: 'shown',  label: '显', mult: 1.8 }
];

window.applyTweaks = function({ mood='parchment', accent='#a8332a', texture='mid' }) {
  const root = document.documentElement;
  const m = MOODS[mood] || MOODS.parchment;
  Object.entries(m.tokens).forEach(([k,v]) => root.style.setProperty(k, v));

  const a = ACCENTS.find(x => x.hex === accent) || ACCENTS[0];
  root.style.setProperty('--cinnabar', a.hex);
  root.style.setProperty('--cinnabar-deep', a.deep);

  const tx = TEXTURES.find(x => x.key === texture) || TEXTURES[1];
  const grainBase = parseFloat(m.tokens['--grain-base']);
  const finalOpacity = (grainBase * tx.mult).toFixed(3);
  root.style.setProperty('--grain-opacity', finalOpacity);

  document.body.style.background = m.tokens['--paper-deep'];
};

window.ApiPanel = function() {
  const defaultLLM = (sp) => ({
    enabled: false,
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o',
    systemPrompt: sp
  });
  const defaultCfg = {
    llm1: {
      ...defaultLLM(window.DEFAULT_LLM1_SP),
      baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
      model: 'doubao-seed-2-0-pro-260215'
    },
    llm2: {
      ...defaultLLM(window.DEFAULT_LLM2_SP),
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-v4-pro'
    },
    llm3: {
      enabled: false,
      baseUrl: 'https://api.minimax.io/v1',
      apiKey: '',
      model: 'music-2.6-free'
    }
  };

  // 每个 LLM tab 的提示文案
  const TAB_META = {
    llm1: {
      title: 'LLM1 匹配',
      hint: '建议选用支持联网搜索的模型，用于在匹配候选时核实公开摘录的真实性。',
      recommended: 'doubao-seed-2-0-pro · doubao-1-5-pro-256k-search · gpt-4o-search-preview',
      hasSP: true
    },
    llm2: {
      title: 'LLM2 对话',
      hint: '负责角色化对话与写歌词。要求中文表达细腻、能稳定输出 JSON。',
      recommended: 'deepseek-v4-pro · deepseek-chat · gpt-4o · claude-sonnet-4-5',
      hasSP: true
    },
    llm3: {
      title: 'LLM3 谱曲',
      hint: 'MiniMax music-2.6 用 LLM2 写好的歌词与英文风格 prompt 直接谱成 mp3。免费档为 music-2.6-free，付费档为 music-2.6。',
      recommended: 'MiniMax music-2.6 · music-2.6-free',
      hasSP: false
    }
  };

  const [cfg, setCfg] = window.useStored('xingsi:api-config', defaultCfg);
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState('llm1');
  const [showSP, setShowSP] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  const cur = (cfg[tab] || defaultCfg[tab]);
  const meta = TAB_META[tab];
  const setCur = (k, v) => setCfg(prev => ({
    ...prev,
    [tab]: { ...(prev[tab] || defaultCfg[tab]), [k]: v }
  }));

  const switchTab = (t) => { setTab(t); setTestResult(''); setShowSP(false); };

  const SAMPLE_ESSAY = '今晚读完一本旧书,合上的时候窗外正在下雨。我一直想不明白:为什么我们做的事比父辈多,内心却更加疲惫?是我们想得太多,还是这个时代过分喧嚣?';

  const runTest = async () => {
    setTesting(true);
    setTestResult('');
    try {
      if (tab === 'llm1') {
        const r = await window.callLLM1(SAMPLE_ESSAY);
        setTestResult(JSON.stringify(r, null, 2));
      } else if (tab === 'llm2') {
        const p = window.PERSONAS[0];
        const r = await window.callLLM2({
          persona: p,
          essay_context: SAMPLE_ESSAY,
          dialogue_history: [],
          action: 'respond',
          user_message: ''
        });
        setTestResult(r.text);
      } else if (tab === 'llm3') {
        setTestResult('正在写词 + 调用 MiniMax，约需 30-60 秒…');
        const { lyrics, prompt } = await window.generateLyrics(SAMPLE_ESSAY, null);
        setTestResult(`✓ 写词成功，正在谱曲…\n\n风格 prompt：${prompt}\n\n歌词预览：\n${lyrics.slice(0, 200)}…`);
        const { audio_url, duration } = await window.callMiniMaxMusic(lyrics, prompt);
        setTestResult(`✓ 谱曲成功（${duration || '?'} 秒）\n\n音频地址：\n${audio_url}\n\n风格 prompt：${prompt}\n\n歌词预览：\n${lyrics.slice(0, 300)}…`);
      }
    } catch(e) {
      setTestResult('错误：' + e.message);
    } finally {
      setTesting(false);
    }
  };

  const SP_VARS = '{{NAME}} {{ERA}} {{INTRO}} {{TONE}} {{SENTENCE_LENGTH}} {{RHETORIC}} {{MOTIFS}} {{EXCERPTS}}';
  const defaultSP = tab === 'llm1' ? window.DEFAULT_LLM1_SP : window.DEFAULT_LLM2_SP;

  if (collapsed) {
    return (
      <div className="tweaks collapsed" onClick={() => setCollapsed(false)} title="API 设置">
        <div className="tweaks-head"><span style={{fontSize:12,letterSpacing:2}}>API</span></div>
      </div>
    );
  }

  return (
    <div className="tweaks">
      <div className="tweaks-head">
        <h4>API · 调用</h4>
        <button className="tweaks-toggle" onClick={() => setCollapsed(true)}>−</button>
      </div>
      <div className="tweaks-body">

        {/* Tab 切换 */}
        <div className="tweak-section">
          <div className="tweak-radios">
            <button className={`tweak-radio ${tab==='llm1'?'active':''}`} onClick={() => switchTab('llm1')}>LLM1 匹配</button>
            <button className={`tweak-radio ${tab==='llm2'?'active':''}`} onClick={() => switchTab('llm2')}>LLM2 对话</button>
            <button className={`tweak-radio ${tab==='llm3'?'active':''}`} onClick={() => switchTab('llm3')}>LLM3 谱曲</button>
          </div>
        </div>

        {/* 当前 tab 的提示 */}
        {meta && (
          <div className="tweak-section api-hint">
            <div className="api-hint-body">{meta.hint}</div>
            <div className="api-hint-models">
              <span className="api-hint-label">推荐模型</span>
              <span className="api-hint-value">{meta.recommended}</span>
            </div>
          </div>
        )}

        {/* 启用 */}
        <div className="tweak-section">
          <div className="lbl">模式</div>
          <label className="api-toggle-row">
            <input type="checkbox" checked={cur.enabled} onChange={e => setCur('enabled', e.target.checked)} />
            <span>{cur.enabled ? '真实 API' : (tab === 'llm3' ? '未启用' : '模拟数据')}</span>
          </label>
        </div>

        {/* 连接参数 */}
        <div className="tweak-section">
          <div className="lbl">Base URL</div>
          <input className="api-input" value={cur.baseUrl}
            onChange={e => setCur('baseUrl', e.target.value)}
            placeholder={tab === 'llm3' ? 'https://api.minimax.io/v1' : 'https://api.openai.com/v1'} />
        </div>
        <div className="tweak-section">
          <div className="lbl">API Key</div>
          <input className="api-input" type="password" value={cur.apiKey}
            onChange={e => setCur('apiKey', e.target.value)}
            placeholder={tab === 'llm3' ? 'MiniMax API Key' : 'sk-...'} />
        </div>
        <div className="tweak-section">
          <div className="lbl">模型</div>
          <input className="api-input" value={cur.model}
            onChange={e => setCur('model', e.target.value)}
            placeholder={
              tab === 'llm1' ? 'doubao-seed-2-0-pro-260215' :
              tab === 'llm2' ? 'deepseek-v4-pro' :
              'music-2.6-free'
            } />
        </div>

        {/* System Prompt — 仅 LLM1 / LLM2 */}
        {meta && meta.hasSP && (
          <>
            <div className="tweak-section">
              <button className="tweak-radio" style={{width:'100%'}}
                onClick={() => setShowSP(s => !s)}>
                {showSP ? '▲ 收起' : '▼ 编辑'} System Prompt
              </button>
            </div>
            {showSP && (
              <div className="tweak-section">
                <textarea className="api-input api-sp"
                  value={cur.systemPrompt || ''}
                  onChange={e => setCur('systemPrompt', e.target.value)} />
                {tab === 'llm2' && <div className="api-vars">可用变量：{SP_VARS}</div>}
                <button className="api-reset" onClick={() => setCur('systemPrompt', defaultSP)}>重置默认</button>
              </div>
            )}
          </>
        )}

        {/* 测试 */}
        <div className="tweak-section">
          <button className="tweak-radio api-test-btn" style={{width:'100%'}}
            onClick={runTest} disabled={testing}>
            {testing ? '调用中⋯'
              : tab === 'llm3' ? '▶ 测试 LLM3（写词+谱曲，约 60s）'
              : `▶ 测试 ${meta ? meta.title.split(' ')[0] : ''}`}
          </button>
        </div>
        {testResult && (
          <div className="tweak-section">
            <div className="lbl">响应</div>
            <textarea className="api-input api-sp api-result" readOnly value={testResult} />
            <button className="api-reset" onClick={() => setTestResult('')}>清除</button>
          </div>
        )}
      </div>
    </div>
  );
};

window.TweaksPanel = function() {
  const [vals, setVals] = window.useStored('xingsi:tweaks', {
    mood: 'parchment', accent: '#a8332a', texture: 'mid'
  });
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => { window.applyTweaks(vals); }, [vals]);

  const setTweak = (k, v) => setVals(prev => ({ ...prev, [k]: v }));

  if (collapsed) {
    return (
      <div className="tweaks collapsed" onClick={() => setCollapsed(false)} title="主题">
        <div className="tweaks-head"><span style={{fontSize:26}}>⚙</span></div>
      </div>
    );
  }

  return (
    <div className="tweaks">
      <div className="tweaks-head">
        <h4>主题 · Mood</h4>
        <button className="tweaks-toggle" onClick={() => setCollapsed(true)} title="收起">−</button>
      </div>
      <div className="tweaks-body">
        <div className="tweak-section">
          <div className="lbl">氛围</div>
          <div className="tweak-radios">
            {Object.entries(MOODS).map(([k, m]) => (
              <button key={k}
                      className={`tweak-radio ${vals.mood===k?'active':''}`}
                      onClick={() => setTweak('mood', k)}>{m.label}</button>
            ))}
          </div>
        </div>
        <div className="tweak-section">
          <div className="lbl">印章</div>
          <div className="tweak-colors">
            {ACCENTS.map(a => (
              <span key={a.hex}
                    className={`tweak-color ${vals.accent===a.hex?'active':''}`}
                    style={{ background: a.hex }}
                    title={a.name}
                    onClick={() => setTweak('accent', a.hex)} />
            ))}
          </div>
        </div>
        <div className="tweak-section">
          <div className="lbl">纸纹</div>
          <div className="tweak-radios">
            {TEXTURES.map(t => (
              <button key={t.key}
                      className={`tweak-radio ${vals.texture===t.key?'active':''}`}
                      onClick={() => setTweak('texture', t.key)}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
