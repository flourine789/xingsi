/* intro-card.jsx — 介绍弹窗 ----------------------- */

window.IntroCard = function({ open, onClose }) {
  const [tab, setTab] = React.useState('origin');

  // ESC 关闭
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // 锁住 body 滚动
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="intro-backdrop" onClick={onClose}>
      <div className="intro-modal" onClick={(e) => e.stopPropagation()}>
        <div className="intro-head">
          <div className="intro-tabs">
            <button className={`intro-tab ${tab==='origin'?'active':''}`} onClick={() => setTab('origin')}>缘起</button>
            <button className={`intro-tab ${tab==='design'?'active':''}`} onClick={() => setTab('design')}>架构设计</button>
            <button className={`intro-tab ${tab==='credit'?'active':''}`} onClick={() => setTab('credit')}>致谢与灵感</button>
          </div>
          <button className="intro-close" onClick={onClose} title="关闭">×</button>
        </div>

        <div className="intro-body">
          {tab === 'origin' && (
            <article className="intro-article">
              <h2>为什么我会设计这个 app</h2>
              <blockquote className="intro-epigraph">古人今人若流水，共看明月皆如此。</blockquote>

              <p>行路千里，逸兴遄飞。很多想法和感受，在纷杂的信息推荐中像流星划过，难以抓住。我们读了很多，写了很少；看见了很多，听见自己的很少。社交平台教会我们如何被看见，却没有教我们如何看见自己。</p>

              <p>但在茫茫宇宙之中，或许有人曾与你同频共振。</p>

              <p>可能是千年之前的一位诗人，在同样的月色下写过同样的怅然；可能是百年之前的一位小说家，在同样的迟疑里落过同样的笔；也可能是今天的一位评论员、一位异乡的旅人、一个因为战乱流离失所的儿童——他们的句子像一面镜子，倒映出另一个版本的你。</p>

              <p><strong>与 AI 交流，其实是在与更多的人交流。</strong>对面坐着的可以是鲁迅，可以是张爱玲，可以是乔布斯，可以是拿破仑，也可以是任何一个曾经为同一件事辗转过的普通人。和他们对话，不是为了得到答案，而是为了<strong>听见自己心里那个还没说完的句子</strong>。</p>

              <p>希望借助"行思"，大家能够把藏在心底的想法表达出来，在共鸣里看见自己、在异见里照见自己，最终生出独属于自己的思考——<strong>于万千人之中，认出真实的自己</strong>。</p>

              <blockquote>这不是一款替你写完的工具，是一面让你听见回响的镜子。</blockquote>
            </article>
          )}

          {tab === 'design' && (
            <article className="intro-article intro-article-design">
              <h2>llm结构</h2>
              <p className="intro-design-lead">
                行思把<strong>"理解"</strong>和<strong>"扮演"</strong>分给两个模型
              </p>

              <svg className="design-diagram" viewBox="0 0 720 920" preserveAspectRatio="xMidYMin meet">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-mute)" />
                  </marker>
                  <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="var(--cinnabar)" />
                  </marker>
                </defs>

                {/* 顶部：用户的随笔 */}
                <g>
                  <rect x="280" y="20" width="160" height="60" rx="6" fill="var(--paper-deep)" stroke="var(--paper-rim)" />
                  <text x="360" y="46" textAnchor="middle" className="dg-icon">📜</text>
                  <text x="360" y="68" textAnchor="middle" className="dg-label">你的随笔</text>
                </g>
                <line x1="360" y1="80" x2="360" y2="130" stroke="var(--ink-mute)" strokeWidth="1.5" markerEnd="url(#arrow)" />

                {/* LLM1 box */}
                <g>
                  <rect x="120" y="135" width="480" height="150" rx="10" fill="var(--paper-soft)" stroke="var(--cinnabar)" strokeWidth="2" />
                  <rect x="120" y="135" width="480" height="34" rx="10 10 0 0" fill="var(--cinnabar)" />
                  <text x="360" y="158" textAnchor="middle" className="dg-llm-title">LLM1 · 匹配引擎</text>
                  <text x="150" y="200" className="dg-bullet">① 解析  · 主题 / 情绪 / 立场 / 风格</text>
                  <text x="150" y="230" className="dg-bullet">② 检索  · 作家库 + 名人库 + 评论库</text>
                  <text x="150" y="260" className="dg-bullet">③ 重排  · 0–1 相似度 + 解释为什么是 ta</text>
                </g>

                <line x1="360" y1="315" x2="360" y2="360" stroke="var(--ink-mute)" strokeWidth="1.5" markerEnd="url(#arrow)" />

                {/* 思想星图示意 */}
                <g>
                  <rect x="120" y="365" width="480" height="170" rx="8" fill="var(--paper)" stroke="var(--paper-rim)" strokeDasharray="4 4" />
                  <text x="360" y="388" textAnchor="middle" className="dg-section-label">✦ 思想星图 ✦</text>

                  {/* 中心 */}
                  <text x="360" y="465" textAnchor="middle" className="dg-star-center">你</text>
                  <text x="360" y="482" textAnchor="middle" className="dg-star-sub">念头</text>

                  {/* 周围的回响者 */}
                  <line x1="305" y1="455" x2="240" y2="430" stroke="var(--paper-rim)" strokeDasharray="2 3" />
                  <text x="232" y="425" textAnchor="end" className="dg-star-name t-writer">鲁迅</text>
                  <text x="232" y="440" textAnchor="end" className="dg-star-sim">88%</text>

                  <line x1="305" y1="475" x2="240" y2="495" stroke="var(--paper-rim)" strokeDasharray="2 3" />
                  <text x="232" y="500" textAnchor="end" className="dg-star-name t-writer">博尔赫斯</text>
                  <text x="232" y="515" textAnchor="end" className="dg-star-sim">71%</text>

                  <line x1="415" y1="460" x2="480" y2="425" stroke="var(--paper-rim)" strokeDasharray="2 3" />
                  <text x="488" y="425" textAnchor="start" className="dg-star-name t-writer">张爱玲</text>
                  <text x="488" y="440" textAnchor="start" className="dg-star-sim">82%</text>

                  <line x1="415" y1="475" x2="480" y2="495" stroke="var(--paper-rim)" strokeDasharray="2 3" />
                  <text x="488" y="500" textAnchor="start" className="dg-star-name t-celebrity">乔布斯</text>
                  <text x="488" y="515" textAnchor="start" className="dg-star-sim">64%</text>
                </g>

                {/* 用户点击 → LLM2 */}
                <line x1="360" y1="535" x2="360" y2="580" stroke="var(--cinnabar)" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow-red)" />
                <text x="370" y="560" className="dg-action">点击节点</text>

                {/* LLM2 box */}
                <g>
                  <rect x="120" y="585" width="480" height="150" rx="10" fill="var(--paper-soft)" stroke="#5d7a72" strokeWidth="2" />
                  <rect x="120" y="585" width="480" height="34" rx="10 10 0 0" fill="#5d7a72" />
                  <text x="360" y="608" textAnchor="middle" className="dg-llm-title">LLM2 · 对话引擎</text>

                  <text x="150" y="650" className="dg-bullet">① 风格画像  · 语气 / 句长 / 修辞 / 意象</text>
                  <text x="150" y="680" className="dg-bullet">② 角色化回应  · 像 ta 那样回应你</text>
                  <text x="150" y="710" className="dg-bullet">③ 五种动作  · 回应 / 续写 / 反驳 / 反观 / 加深</text>
                </g>

                <line x1="360" y1="765" x2="360" y2="810" stroke="var(--ink-mute)" strokeWidth="1.5" markerEnd="url(#arrow)" />

                {/* 输出：对话 */}
                <g>
                  <rect x="240" y="815" width="240" height="56" rx="28" fill="var(--paper-deep)" stroke="var(--paper-rim)" />
                  <text x="360" y="848" textAnchor="middle" className="dg-output">生成灵感卡片，继续写作</text>
                </g>

                {/* 总结标签 */}
                <text x="360" y="900" textAnchor="middle" className="dg-summary">
                  LLM1 像图书馆员 · 找到该读的那一页 ｜ LLM2 像演员 · 把那一页念给你听
                </text>
              </svg>
            </article>
          )}

          {tab === 'credit' && (
            <article className="intro-article">
              <h2>致谢</h2>

              <h3>致谢</h3>
              <p>感谢 cluade code；cluade design；doubao；deepseek</p>
              <p>感谢一切在公开领域留下文字的写作者们——是他们的句子构成了行思的语料库，让一场跨越百年的对话成为可能。</p>

              <h3>灵感启发</h3>
              <ul>
                <li><span className="intro-todo"></span>Anthropic. <em>Anthropic</em>Emotion concepts and their function in a large language model</li>
                <li><span className="intro-todo"></span>李白《把酒问月》 <em>libai</em>古人今人若流水，共看明月皆如此</li>
              </ul>

              <blockquote className="intro-coda">
                "我们永远出发，永远热泪盈眶。"
                <div className="intro-sign">—— 行思 </div>
              </blockquote>
            </article>
          )}
        </div>
      </div>
    </div>
  );
};
