/* screen-song.jsx — 歌曲页（基于随笔与匹配 tags 自动生成） */

window.ScreenSong = function({ essay, song, composingState, composingError, onBack, onCompose }) {
  // composingState: null | 'lyrics' | 'music'
  const busy = composingState === 'lyrics' || composingState === 'music';
  const hasSong = !!(song && song.audio_url && song.lyrics);

  return (
    <main className="page">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 18}}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← 回到共鸣</button>
        <span style={{fontSize:12, color:'var(--ink-mute)', letterSpacing:'2px'}}>
          歌曲 · Song
        </span>
      </div>

      <div className="paper" style={{padding: '32px 36px', maxWidth: 720, margin: '0 auto'}}>
        <h2 style={{margin: 0, fontFamily: 'var(--serif)', letterSpacing: 2}}>这段念头，唱给你听</h2>
        <p style={{fontSize: 13, color: 'var(--ink-mute)', marginTop: 8}}>
          以你的随笔为蓝本，由 DeepSeek 写词，MiniMax 谱曲。
        </p>

        {!hasSong && !busy && !composingError && (
          <div style={{textAlign:'center', padding:'40px 0'}}>
            <button className="btn btn-primary" onClick={onCompose}>
              ♪ 开始创作
            </button>
            <div style={{fontSize:12, color:'var(--ink-faint)', marginTop:12}}>
              约需 30-60 秒
            </div>
          </div>
        )}

        {composingState === 'lyrics' && (
          <div style={{textAlign:'center', padding:'40px 0', color:'var(--ink-mute)'}}>
            <div style={{fontSize:18, letterSpacing:3, marginBottom:8}}>· 落 笔 ·</div>
            <div style={{fontSize:13}}>正在为你的随笔写词…</div>
          </div>
        )}

        {composingState === 'music' && (
          <div style={{textAlign:'center', padding:'40px 0', color:'var(--ink-mute)'}}>
            <div style={{fontSize:18, letterSpacing:3, marginBottom:8}}>· 谱 曲 ·</div>
            <div style={{fontSize:13}}>词已成，正在谱曲，约 30 秒…</div>
            {song && song.lyrics && (
              <pre style={{
                marginTop:24, textAlign:'left', whiteSpace:'pre-wrap',
                fontFamily:'var(--serif)', fontSize:13, color:'var(--ink-soft)',
                background:'var(--paper-soft)', padding:'16px 20px',
                borderRadius:6, lineHeight:1.9
              }}>{song.lyrics}</pre>
            )}
          </div>
        )}

        {composingError && (
          <div style={{padding:'20px 0', color:'var(--cinnabar)'}}>
            <div style={{fontSize:13, marginBottom:12}}>创作失败：{composingError}</div>
            <button className="btn btn-sm" onClick={onCompose}>重试</button>
          </div>
        )}

        {hasSong && !busy && (
          <div style={{marginTop: 24}}>
            <audio src={song.audio_url} controls style={{width: '100%'}} />
            <div style={{marginTop:10, display:'flex', gap:10, alignItems:'center'}}>
              <a href={song.audio_url} download={`xingsi-${essay.id}.mp3`}
                 style={{fontSize:12, color:'var(--cinnabar)', textDecoration:'none', letterSpacing:1}}>
                ↓ 下载 mp3
              </a>
              <span style={{fontSize:11, color:'var(--ink-faint)'}}>
                · 链接 24 小时内有效
              </span>
              <button className="btn btn-ghost btn-sm" style={{marginLeft:'auto'}}
                      onClick={onCompose}>
                ♪ 换一首
              </button>
            </div>

            <h4 style={{marginTop:32, fontFamily:'var(--serif)', letterSpacing:2, color:'var(--ink-soft)'}}>词</h4>
            <pre style={{
              whiteSpace:'pre-wrap',
              fontFamily:'var(--serif)', fontSize:14, color:'var(--ink)',
              background:'var(--paper-soft)', padding:'20px 24px',
              borderRadius:6, lineHeight:1.95, letterSpacing:'.5px'
            }}>{song.lyrics}</pre>

            {song.prompt && (
              <div style={{marginTop:14, fontSize:11, color:'var(--ink-faint)', letterSpacing:1}}>
                style: {song.prompt}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};
