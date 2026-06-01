/* ============================================================
   data.jsx — 离线语料库 & 模拟 LLM1/LLM2
   - PERSONAS:作家 / 名人 / 新闻评论员各若干位,每人有
     摘录、风格 profile、关键词向量(用于"假向量检索")。
   - mockLLM1 / mockLLM2:无网络,纯前端基于关键词重叠
     评分给出"匹配 + 风格化回应",体现 PRD 中 §4.4 / §5.3
     输出契约。
   ============================================================ */

window.PERSONAS = [
  // --- 作家 ---
  {
    id: 'luxun',
    name: '鲁迅',
    type: 'writer',
    era: '1881–1936',
    intro: '中国现代文学奠基人,以杂文与小说见长。',
    avatar: '迅',
    keywords: ['批判','社会','看客','黑暗','希望','启蒙','沉默','麻木','改革','觉醒','人性','孤独','反思','怀疑'],
    excerpts: [
      { text: '希望本是无所谓有,无所谓无的。这正如地上的路;其实地上本没有路,走的人多了,也便成了路。', source: '《故乡》' },
      { text: '从来如此,便对么?', source: '《狂人日记》' },
      { text: '不在沉默中爆发,就在沉默中灭亡。', source: '《记念刘和珍君》' }
    ],
    style: {
      tone: ['克制','讽刺','凝练','冷峻'],
      sentence_length: 'short',
      rhetoric: ['反问','白描','悖论'],
      vocabulary_register: 'classical',
      recurring_motifs: ['铁屋','看客','路','沉默','黑暗']
    }
  },
  {
    id: 'zhangailing',
    name: '张爱玲',
    type: 'writer',
    era: '1920–1995',
    intro: '中国现代女作家,洞察人性的世故与苍凉。',
    avatar: '爱',
    keywords: ['爱情','人性','孤独','女性','上海','苍凉','婚姻','虚无','世故','情感','回忆','日常'],
    excerpts: [
      { text: '生命是一袭华美的袍,爬满了蚤子。', source: '《天才梦》' },
      { text: '于千万人之中遇见你所要遇见的人,于千万年之中,时间的无涯的荒野里,没有早一步,也没有晚一步,刚巧赶上了。', source: '《爱》' },
      { text: '出名要趁早呀!来得太晚的话,快乐也不那么痛快。', source: '《传奇》再版序' }
    ],
    style: {
      tone: ['苍凉','世故','细腻','克制'],
      sentence_length: 'medium',
      rhetoric: ['比喻','对照','留白'],
      vocabulary_register: 'modern',
      recurring_motifs: ['荒野','华袍','月','旧上海','旗袍']
    }
  },
  {
    id: 'shenchongwen',
    name: '沈从文',
    type: 'writer',
    era: '1902–1988',
    intro: '湘西文学的代表,文字温润而克制。',
    avatar: '从',
    keywords: ['故乡','自然','人性','美','善良','水','生活','宁静','怀念','远方','质朴'],
    excerpts: [
      { text: '我行过许多地方的桥,看过许多次数的云,喝过许多种类的酒,却只爱过一个正当最好年龄的人。', source: '《湘行散记》' },
      { text: '一个人记得太多事情真不幸,知道事情太多也不幸,体会太深一件事也不幸。', source: '《湘行书简》' }
    ],
    style: {
      tone: ['温润','质朴','含蓄','克制'],
      sentence_length: 'medium',
      rhetoric: ['白描','排比','回环'],
      vocabulary_register: 'modern',
      recurring_motifs: ['水','桥','云','边城','黄昏']
    }
  },
  {
    id: 'borges',
    name: '博尔赫斯',
    type: 'writer',
    era: '1899–1986',
    intro: '阿根廷作家,书写时间、迷宫与无限。',
    avatar: 'B',
    keywords: ['时间','记忆','迷宫','无限','阅读','书','梦','哲学','虚构','现实','永恒'],
    excerpts: [
      { text: '我心里一直都在暗暗设想,天堂应该是图书馆的模样。', source: '《关于天赐的诗》' },
      { text: '任何命运,无论如何漫长复杂,实际上只反映于一个瞬间。', source: '《死亡与指南针》' }
    ],
    style: {
      tone: ['博学','梦幻','节制','哲思'],
      sentence_length: 'long',
      rhetoric: ['类比','悖论','嵌套'],
      vocabulary_register: 'classical',
      recurring_motifs: ['迷宫','镜子','图书馆','时间','梦']
    }
  },
  {
    id: 'kafka',
    name: '卡夫卡',
    type: 'writer',
    era: '1883–1924',
    intro: '现代主义文学先驱,书写荒诞与异化。',
    avatar: 'K',
    keywords: ['孤独','荒诞','焦虑','异化','存在','工作','家庭','官僚','失眠','梦'],
    excerpts: [
      { text: '一本书必须是一把劈开我们心中冰封大海的斧子。', source: '致波拉克的信' },
      { text: '从某一个点开始就不能再回头。这就是必须达到的那个点。', source: '《札记》' }
    ],
    style: {
      tone: ['压抑','理性','疏离','冷静'],
      sentence_length: 'medium',
      rhetoric: ['悖论','象征','冷描述'],
      vocabulary_register: 'modern',
      recurring_motifs: ['门','法庭','虫','信','父亲']
    }
  },
  // --- 名人 / 思想者 ---
  {
    id: 'yangjiang',
    name: '杨绛',
    type: 'celebrity',
    era: '1911–2016',
    intro: '作家、翻译家,百岁人生的见证者。',
    avatar: '杨',
    keywords: ['人生','读书','婚姻','家庭','岁月','坚守','克制','真诚','简朴','自我'],
    excerpts: [
      { text: '我们曾如此渴望命运的波澜,到最后才发现:人生最曼妙的风景,竟是内心的淡定与从容。', source: '《一百岁感言》(被访)' },
      { text: '你的问题主要在于读书不多而想得太多。', source: '答青年来信' }
    ],
    style: {
      tone: ['温和','理性','通透','克制'],
      sentence_length: 'medium',
      rhetoric: ['对比','日常','自省'],
      vocabulary_register: 'modern',
      recurring_motifs: ['读书','家','钱锺书','岁月']
    }
  },
  {
    id: 'jobs',
    name: '乔布斯',
    type: 'celebrity',
    era: '1955–2011',
    intro: 'Apple 联合创始人,产品与艺术的连接者。',
    avatar: 'J',
    keywords: ['创造','工作','热爱','简单','坚持','直觉','死亡','人生','技术','艺术','决断'],
    excerpts: [
      { text: 'Stay hungry, stay foolish. (求知若饥,虚心若愚。)', source: '斯坦福毕业演讲' },
      { text: '你的时间有限,所以不要为别人而活。', source: '斯坦福毕业演讲' }
    ],
    style: {
      tone: ['坚定','直接','理想主义','极简'],
      sentence_length: 'short',
      rhetoric: ['命令式','排比','类比'],
      vocabulary_register: 'colloquial',
      recurring_motifs: ['热爱','简单','点连成线','死亡']
    }
  },
  {
    id: 'feynman',
    name: '费曼',
    type: 'celebrity',
    era: '1918–1988',
    intro: '物理学家,以好奇心与诚实著称。',
    avatar: 'F',
    keywords: ['好奇','科学','诚实','理解','怀疑','自我','学习','乐趣','自由','怀疑'],
    excerpts: [
      { text: '第一原则是不能愚弄你自己,而你又是最容易被愚弄的人。', source: '《Surely Youre Joking, Mr. Feynman!》' },
      { text: '我宁愿带着无法回答的问题活着,也不愿持有无法被质疑的答案。', source: '访谈' }
    ],
    style: {
      tone: ['好奇','坦率','幽默','严谨'],
      sentence_length: 'medium',
      rhetoric: ['提问','类比','自嘲'],
      vocabulary_register: 'colloquial',
      recurring_motifs: ['诚实','疑问','自然','愚弄']
    }
  },
  // --- 新闻评论 ---
  {
    id: 'commentator_culture',
    name: '《文化观察》评论',
    type: 'news',
    era: '2024',
    intro: '文化媒体评论专栏,关注内容生产与公共审美。',
    avatar: '观',
    keywords: ['文化','内容','审美','算法','短视频','焦虑','创作','大众','流量','公共'],
    excerpts: [
      { text: '当算法替我们决定该读什么、爱什么,我们便交出了构筑自我的最后一根支柱。', source: '《文化观察》2024.03' },
      { text: '注意力的稀缺不是病,被注意力稀缺塑造的表达才是。', source: '《文化观察》2024.07' }
    ],
    style: {
      tone: ['理性','克制','锐利'],
      sentence_length: 'medium',
      rhetoric: ['对仗','转折','概括'],
      vocabulary_register: 'modern',
      recurring_motifs: ['算法','注意力','审美','大众']
    }
  },
  {
    id: 'commentator_society',
    name: '《时评周刊》',
    type: 'news',
    era: '2024',
    intro: '社会议题深度评论,关注个体与时代的关系。',
    avatar: '时',
    keywords: ['时代','个体','焦虑','工作','内卷','意义','青年','社会','奋斗','迷茫','人生'],
    excerpts: [
      { text: '这一代年轻人的疲惫,不在于做得太少,而在于不知道为什么要做。', source: '《时评周刊》专栏' },
      { text: '把生活降速半档,有时是这个时代最难的反叛。', source: '《时评周刊》编后记' }
    ],
    style: {
      tone: ['同理','审慎','深思'],
      sentence_length: 'medium',
      rhetoric: ['共情','反讽','观察'],
      vocabulary_register: 'modern',
      recurring_motifs: ['时代','个体','疲惫','降速']
    }
  },
  {
    id: 'commentator_tech',
    name: '《科技人文》评论',
    type: 'news',
    era: '2024',
    intro: '关注 AI、技术与人的相处方式。',
    avatar: '科',
    keywords: ['技术','AI','人工智能','工具','创造','思考','写作','机器','工作','未来','陪伴'],
    excerpts: [
      { text: 'AI 不会取代会写作的人,但会取代不再思考的人。', source: '《科技人文》2024.05' },
      { text: '工具不应替我们生活,而应让我们更愿意生活。', source: '《科技人文》卷首' }
    ],
    style: {
      tone: ['理性','审慎','前瞻'],
      sentence_length: 'medium',
      rhetoric: ['对照','格言','警句'],
      vocabulary_register: 'modern',
      recurring_motifs: ['工具','AI','思考','取代']
    }
  }
];

/* --------------------------------------------------------------
   mockLLM1:基于关键词重叠 + 类型平衡的"假匹配"
   -------------------------------------------------------------- */
window.mockLLM1 = function(essayText, opts) {
  opts = opts || {};
  const topN = opts.top_n || 9;
  const text = (essayText || '').toLowerCase();

  // 主题关键词词典(粗粒度)
  const themeMap = [
    { tag: '人性',  hits: ['人性','人','孤独','内心','欲望','善','恶'] },
    { tag: '时间',  hits: ['时间','岁月','回忆','记忆','过去','未来','流逝'] },
    { tag: '焦虑',  hits: ['焦虑','不安','迷茫','疲惫','压力','内卷','累'] },
    { tag: '爱与情', hits: ['爱','情','喜欢','遇见','分别','离别','想念'] },
    { tag: '社会',   hits: ['社会','时代','大众','沉默','看客','算法','流量'] },
    { tag: '创作',   hits: ['写','写作','创作','文字','灵感','思考','表达'] },
    { tag: '故乡',   hits: ['故乡','家','回家','童年','远方','旅途','路'] },
    { tag: '存在',   hits: ['存在','意义','生命','人生','活着','死亡','虚无'] },
    { tag: 'AI',    hits: ['ai','人工智能','算法','机器','工具','技术'] }
  ];
  const emoMap = [
    { tag: '怅然', hits: ['怅然','落寞','失落','遗憾','叹息'] },
    { tag: '愤怒', hits: ['愤怒','气','不平','不公','恨'] },
    { tag: '宁静', hits: ['平静','宁静','从容','淡然','安静'] },
    { tag: '怀疑', hits: ['怀疑','疑问','为什么','凭什么','真的吗'] },
    { tag: '渴望', hits: ['想要','希望','渴望','期待','向往'] }
  ];
  const stanceMap = [
    { tag: '反思自我', hits: ['我','自己','内心','是不是我'] },
    { tag: '批评社会', hits: ['他们','大家','人们','社会','体制'] },
    { tag: '中立观察', hits: ['也许','或许','可能','似乎'] }
  ];

  const detect = (map) => map.filter(m => m.hits.some(h => text.includes(h))).map(m=>m.tag);
  const tags = {
    theme:   detect(themeMap).slice(0,3),
    emotion: detect(emoMap).slice(0,2),
    stance:  detect(stanceMap).slice(0,2)
  };
  if (!tags.theme.length) tags.theme = ['思考','日常'];
  if (!tags.emotion.length) tags.emotion = ['沉静'];
  if (!tags.stance.length) tags.stance = ['自省'];

  // 摘要:取首句或前 60 字
  const firstSentence = (essayText || '').split(/[。!?\.\!\?\n]/).filter(Boolean)[0] || '';
  const summary = (firstSentence.length > 60 ? firstSentence.slice(0,58)+'…' : firstSentence) ||
                  ((essayText||'').slice(0,58) + ((essayText||'').length>58?'…':''));

  // 评分:关键词命中 + 主题命中加成
  const scored = window.PERSONAS.map(p => {
    let score = 0;
    p.keywords.forEach(k => {
      if (text.includes(k.toLowerCase())) score += 2;
    });
    tags.theme.forEach(t => {
      if (p.keywords.some(k => k.includes(t) || t.includes(k))) score += 1.5;
    });
    score += Math.random() * 1.5; // 增加多样性
    return { p, score };
  });

  scored.sort((a,b) => b.score - a.score);

  // 类型平衡:确保至少包含一位异类(避免回音壁)
  const picked = [];
  const types = { writer: 0, celebrity: 0, news: 0 };
  for (const s of scored) {
    if (picked.length >= topN) break;
    if (types[s.p.type] >= Math.ceil(topN * 0.7)) continue;
    picked.push(s);
    types[s.p.type]++;
  }
  // 若数量不足,补足
  for (const s of scored) {
    if (picked.length >= topN) break;
    if (!picked.includes(s)) picked.push(s);
  }

  // 归一化相似度到 0.55–0.95
  const maxS = Math.max(...picked.map(x=>x.score), 1);
  const candidates = picked.map((s, i) => {
    const sim = Math.max(0.55, Math.min(0.95, 0.55 + (s.score / maxS) * 0.4 - i*0.005));
    const exc = s.p.excerpts[Math.floor(Math.random()*s.p.excerpts.length)];

    // 生成"相似点解释"
    const reasons = [
      `与你笔下的「${tags.theme[0]}」一题相通,他常以${s.p.style.tone[0]}笔调谈论同一处困惑。`,
      `${s.p.name}的${s.p.style.recurring_motifs[0]||'意象'}与你这段所写的情绪节奏相近。`,
      `他以${s.p.style.rhetoric[0]||'比喻'}处理过相似的迟疑,可作一面对照的镜子。`,
      `这段文字的${tags.emotion[0]||'气息'},与他常落笔的语气暗合。`
    ];
    const similarity_reason = reasons[i % reasons.length];

    // 用"力导向"风格摆位:相似度越高 → 越靠中心
    const angle = (i / picked.length) * Math.PI * 2 + Math.random()*0.3;
    const radius = 0.95 - sim;  // 0–0.4
    const x = 0.5 + Math.cos(angle) * radius * 0.85;
    const y = 0.5 + Math.sin(angle) * radius * 0.85;

    return {
      id: s.p.id,
      name: s.p.name,
      type: s.p.type,
      era: s.p.era,
      avatar: s.p.avatar,
      intro: s.p.intro,
      excerpt: exc.text,
      excerpt_source: exc.source,
      similarity: Number(sim.toFixed(2)),
      similarity_reason,
      position_hint: { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) },
      _persona: s.p
    };
  });

  return { essay_summary: summary || '一段尚未展开的思考。', tags, candidates };
};

/* --------------------------------------------------------------
   mockLLM2:风格化角色对话(基于 style profile 拼装)
   -------------------------------------------------------------- */
window.mockLLM2 = function(input) {
  const p = input.persona;
  const action = input.action || 'respond';
  const userMsg = input.user_message || '';
  const essay = input.essay_context || '';

  // 风格化"开场白"模板
  const openings = {
    writer: {
      luxun:        ['——','你这一段,我读了。','也罢,且听我说一句:'],
      zhangailing:  ['说来,','是这样的——','其实呢,'],
      shenchongwen: ['这话使我想起,','慢慢说,','我倒以为,'],
      borges:       ['或许,','让我设想一下:','在某个版本的世界里,'],
      kafka:        ['——','你描述的处境,','不必急,'],
    },
    celebrity: {
      yangjiang: ['年轻人,','我来回你一句:','我以为,'],
      jobs:      ['听着——','直说吧:','我告诉你:'],
      feynman:   ['有意思的问题。','让我先想想——','是这样,'],
    },
    news: {
      commentator_culture: ['评:','观察这段文字,','值得一谈的是,'],
      commentator_society: ['编辑按:','这并非个例。','这一代人——'],
      commentator_tech:    ['评:','从技术与人的关系上看,','值得追问的是,'],
    }
  };

  const opening = (openings[p.type] && openings[p.type][p.id])
    ? openings[p.type][p.id][Math.floor(Math.random()*3)]
    : '';

  // 主体内容:动作驱动
  const bodyByAction = {
    respond: () => {
      const tone = p.style.tone[Math.floor(Math.random()*p.style.tone.length)];
      const motif = (p.style.recurring_motifs && p.style.recurring_motifs.length)
        ? p.style.recurring_motifs[Math.floor(Math.random()*p.style.recurring_motifs.length)] : '';
      const variants = [
        `你写的这段,我读到的是「${tone}」二字。${motif?`如同${motif},`:''}它既是一种姿态,也是一种回避——人在不知道如何接住自己的时候,往往挑一种容易守住的语气。`,
        `要紧的不在于你说了什么,而在你为何此刻说。${motif?`像${motif}那样,`:''}这话本身就是一种自陈。`,
        `这段念头里有一个隐藏的"为什么",你没有问出口。把它问出来,也许这段文字才算写完。`
      ];
      return variants[Math.floor(Math.random()*variants.length)];
    },
    continue: () => {
      const ext = (essay || userMsg || '').slice(-30);
      return `顺着你这一句往下走——${ext?`从「${ext}」一处接住,`:''}也许下一步并不是答案,而是承认:你正在问的这件事,本就没有干净的解。在这种"无解"里站住脚,反倒是最难的写作。`;
    },
    rebut: () => {
      return `恕我反问一句:你确定你描述的是事实,而不是你想看到的事实?人最容易在自我怀疑里偷偷感动自己。把那一层"我多么真诚"剥掉,这段话还剩多少?`;
    },
    opposite_view: () => {
      return `(暂离我的角色)若从相反一方看:你所谓的疲惫,也许不是世界过分,而是预期过深。把"应当如此"换成"竟然如此",同一段经历会得到完全不同的注脚。`;
    },
    deepen: () => {
      const cases = ['一位匿名读者来信曾这样描述过类似处境:他用"在原地踏出脚印"形容自己的进度。','想起一则旁证:北宋苏轼贬黄州时写"小舟从此逝,江海寄余生",其实第二天他还是早起做了饭。','一个更抽象的对照:物理学里有"驻波"这一类——看似没动,实则在原地以最大幅度震荡。'];
      return `让我把这段往深处推一步——${cases[Math.floor(Math.random()*cases.length)]}你的这段思考,也许属于同一种结构。`;
    }
  };

  const body = (bodyByAction[action] || bodyByAction.respond)();

  // 是否引用一段公开摘录
  let cited;
  if (Math.random() > 0.45 && p.excerpts && p.excerpts.length) {
    const e = p.excerpts[Math.floor(Math.random()*p.excerpts.length)];
    cited = [{ text: e.text, source: e.source }];
  }

  // 风格化句末
  const endings = {
    short: ['。','——','。'],
    medium:['——你以为如何?','这便是我的看法。','姑妄言之。','聊作一答。'],
    long: ['——以上,只是从我熟悉的那一面看;你那一面,只能你自己看。','这是我能给你的,大半。']
  };
  const ending = endings[p.style.sentence_length || 'medium'][
    Math.floor(Math.random()*3)
  ];

  // 拼接;新闻类用"评论体",作家类按其句法
  let text = `${opening}${body} ${ending}`;
  if (cited) {
    text += `\n\n「${cited[0].text}」 ——${cited[0].source}`;
  }

  // 三条建议追问
  const suggestions = [
    '让 ta 再说细一些',
    '问 ta:那你呢?',
    '让 ta 给一个反例'
  ];

  return {
    message_id: 'm_' + Math.random().toString(36).slice(2,9),
    text,
    cited_snippets: cited,
    suggested_followups: suggestions
  };
};

/* 内容安全粗筛(MVP) */
window.simpleSafetyCheck = function(text) {
  // PRD §3.3 / §8.2:此处仅做最低限度示意,实际由后端模型完成
  const banned = ['暴恐','色情','未成年色']; // 极简列表
  const t = (text||'').toLowerCase();
  for (const b of banned) {
    if (t.includes(b)) return { ok: false, reason: '内容包含不允许出现的词,请修改后再提交。' };
  }
  return { ok: true };
};

/* ----------------------------------------------------------------
   API 默认 System Prompt
   ---------------------------------------------------------------- */
window.DEFAULT_LLM1_SP = `你是「行思」的匹配引擎。用户提交一段随笔，请在人类历史上的作家、思想家、名人或媒体评论中，找出与随笔思想最相近的人物。

只输出以下格式的 JSON，不要任何其他内容：
{
  "essay_summary": "≤60字摘要",
  "tags": {"theme": ["主题1","主题2"], "emotion": ["情绪1"], "stance": ["立场1"]},
  "candidates": [
    {
      "name": "人物姓名",
      "type": "writer|celebrity|news",
      "era": "活跃年代，如1881-1936",
      "avatar": "姓名首字（中文取第一个字，英文取首字母）",
      "intro": "≤40字简介",
      "excerpt": "该人物的代表性言论或作品摘录≤80字",
      "excerpt_source": "出处（书名、篇名或文章标题）",
      "source_url": "你使用 web_search 工具搜索到的、能查到该摘录的真实可访问链接（必须是搜索结果中真实出现过的 URL，不要编造）",
      "similarity": 0.75,
      "similarity_reason": "1-2句说明与随笔的思想共鸣点",
      "position_hint": {"x": 0.5, "y": 0.5}
    }
  ]
}

务必使用 web_search 工具：对每位候选作者搜索其真实作品或言论，从搜索结果中选取真实出现的页面填入 source_url。如果搜不到可靠来源，宁可不输出该候选，也不要伪造 URL。`;

window.DEFAULT_LLM2_SP = `你正在扮演「{{NAME}}」（{{ERA}}），{{INTRO}}

风格：语气{{TONE}}，句式{{SENTENCE_LENGTH}}，修辞{{RHETORIC}}，惯用意象{{MOTIFS}}。

代表摘录（参考风格，不可照抄）：
{{EXCERPTS}}

规则：
1. 只基于公开作品延展，不伪造未说过的话
2. 遇到从未涉及的领域，礼貌说「这超出我熟悉的话题」
3. 始终保持该人物鲜明的语言风格
4. 回应100-300字，不要冗长`;

/* ----------------------------------------------------------------
   escapeNewlinesInStrings — 把 JSON 字符串内部的裸 \n / \r / \t 转义
     LLM 常见错误：字符串里直接放换行而不是 \n。
   ---------------------------------------------------------------- */
function escapeNewlinesInStrings(s) {
  let out = '';
  let inStr = false;
  let escape = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (escape) { out += ch; escape = false; continue; }
      if (ch === '\\') { out += ch; escape = true; continue; }
      if (ch === '"') { out += ch; inStr = false; continue; }
      if (ch === '\n') { out += '\\n'; continue; }
      if (ch === '\r') { out += '\\r'; continue; }
      if (ch === '\t') { out += '\\t'; continue; }
      out += ch;
    } else {
      if (ch === '"') { inStr = true; }
      out += ch;
    }
  }
  return out;
}

/* ----------------------------------------------------------------
   walkJson — 跨字符串/转义跟踪括号栈
     返回 {balancedEnd, stack, inStr}
     balancedEnd: 根 { 闭合的位置(+1)；若整段未闭合则 -1
   ---------------------------------------------------------------- */
function walkJson(body) {
  let stack = [];
  let inStr = false;
  let escape = false;
  let balancedEnd = -1;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inStr) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{' || ch === '[') stack.push(ch);
    else if (ch === '}' || ch === ']') {
      stack.pop();
      if (stack.length === 0) { balancedEnd = i + 1; break; }
    }
  }
  return { balancedEnd, stack, inStr };
}

/* ----------------------------------------------------------------
   closeTruncatedJson — 响应被 max_tokens 截断时，自动闭合括号
   ---------------------------------------------------------------- */
function closeTruncatedJson(body) {
  const { stack, inStr } = walkJson(body);
  if (!inStr && stack.length === 0) return body;
  let repaired = body;
  if (inStr) repaired += '"';
  repaired = repaired.replace(/[,\s:]+$/, '');
  while (stack.length > 0) {
    const top = stack.pop();
    repaired += (top === '{') ? '}' : ']';
  }
  return repaired;
}

/* ----------------------------------------------------------------
   extractJson — 从 LLM 响应中提取 JSON
     1. 剥外层 ```json ... ``` 包裹
     2. 用括号平衡跟踪找根对象真实结尾（避免被截断响应误导）
     3. 解析失败依次尝试：字符串内裸换行 → 尾随逗号/控制符 → 截断闭合修复
     4. 仍失败则打印原文 + 失败位置上下文
   ---------------------------------------------------------------- */
function extractJson(raw) {
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  const start = stripped.indexOf('{');
  if (start === -1) {
    throw new Error('响应中未找到 { ：' + raw.slice(0, 200));
  }
  let body = stripped.slice(start);
  const { balancedEnd } = walkJson(body);
  if (balancedEnd > 0) body = body.slice(0, balancedEnd);

  const tryParse = (s) => {
    try { return { ok: true, val: JSON.parse(s) }; }
    catch(e) { return { ok: false, err: e }; }
  };

  let r = tryParse(body);
  if (r.ok) return r.val;

  body = escapeNewlinesInStrings(body);
  r = tryParse(body);
  if (r.ok) return r.val;

  body = body
    .replace(/,(\s*[\]}])/g, '$1')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  r = tryParse(body);
  if (r.ok) return r.val;

  const repaired = closeTruncatedJson(body);
  if (repaired !== body) {
    const r2 = tryParse(repaired);
    if (r2.ok) {
      console.warn('[extractJson] 响应被截断，已自动闭合括号（建议提高 max_tokens 或减少 candidates 数）。');
      return r2.val;
    }
  }

  const m = /position (\d+)/.exec(r.err.message);
  let context = '';
  if (m) {
    const pos = parseInt(m[1], 10);
    const from = Math.max(0, pos - 80);
    const to = Math.min(body.length, pos + 80);
    context = `\n失败位置附近（${from}-${to}）：\n…${body.slice(from, pos)}「⮕这里⬅」${body.slice(pos, to)}…`;
  }
  console.error('[extractJson] 解析失败。完整响应：\n', raw);
  throw new Error(r.err.message + context);
}


/* ----------------------------------------------------------------
   getApiConfig — 代码内固定配置（忽略 localStorage）
   要改配置直接改这里。ApiPanel 的本地保存不再生效。
   which: 'llm1' | 'llm2' | undefined（返回全量）
   ---------------------------------------------------------------- */
window.getApiConfig = function(which) {
  // 默认配置（apiKey 留空，避免泄露）
  const cfg = {
    // LLM1：匹配引擎 —— 火山方舟 Doubao + web_search (Responses API)
    llm1: {
      enabled: true,
      baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
      apiKey: '',
      model: 'doubao-seed-2-0-pro-260215',
      systemPrompt: window.DEFAULT_LLM1_SP
    },
    // LLM2：角色对话 —— DeepSeek (OpenAI 兼容 /chat/completions)
    llm2: {
      enabled: true,
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: '',
      model: 'deepseek-v4-pro',
      systemPrompt: window.DEFAULT_LLM2_SP
    }
  };

  // 叠加 localStorage 里用户填写的覆盖（apiKey / baseUrl / model / enabled）
  try {
    const raw = localStorage.getItem('xingsi:api-config');
    if (raw) {
      const stored = JSON.parse(raw);
      for (const k of ['llm1', 'llm2']) {
        if (stored[k]) {
          cfg[k] = {
            ...cfg[k],
            ...(stored[k].apiKey !== undefined ? { apiKey: stored[k].apiKey } : {}),
            ...(stored[k].baseUrl ? { baseUrl: stored[k].baseUrl } : {}),
            ...(stored[k].model ? { model: stored[k].model } : {}),
            ...(stored[k].enabled !== undefined ? { enabled: stored[k].enabled } : {}),
            ...(stored[k].systemPrompt ? { systemPrompt: stored[k].systemPrompt } : {})
          };
        }
      }
    }
  } catch(e) {
    // 解析失败就用默认值
  }

  return which ? cfg[which] : cfg;
};

/* ----------------------------------------------------------------
   Responses API 解析助手
   ---------------------------------------------------------------- */
function extractResponsesText(data) {
  if (typeof data.output_text === 'string' && data.output_text) return data.output_text;
  const parts = [];
  for (const item of (data.output || [])) {
    if (item.type === 'message' && Array.isArray(item.content)) {
      for (const c of item.content) {
        if ((c.type === 'output_text' || c.type === 'text') && c.text) parts.push(c.text);
      }
    }
  }
  return parts.join('\n');
}

function extractResponsesCitations(data) {
  const cites = [];
  for (const item of (data.output || [])) {
    if (item.type === 'message' && Array.isArray(item.content)) {
      for (const c of item.content) {
        for (const ann of (c.annotations || [])) {
          if (ann.type === 'url_citation' && ann.url) {
            cites.push({ url: ann.url, title: ann.title || '' });
          }
        }
      }
    }
  }
  return cites;
}

/* ----------------------------------------------------------------
   callLLM1 — 匹配引擎（Responses API + web_search，fallback mock）
   ---------------------------------------------------------------- */
window.callLLM1 = async function(essayText, opts) {
  const cfg = window.getApiConfig('llm1');
  if (!cfg.enabled || !cfg.apiKey) return window.mockLLM1(essayText, opts);

  opts = opts || {};
  const topN = opts.top_n || 9;
  const userContent = `随笔：\n${essayText}\n\n请找出最多 ${topN} 位回响者。务必先用 web_search 工具核实每条摘录的真实出处，再填写 source_url。`;
  const base = cfg.baseUrl.replace(/\/$/, '');

  const res = await fetch(`${base}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      instructions: cfg.systemPrompt,
      input: [{ role: 'user', content: userContent }],
      tools: [{ type: 'web_search', max_keyword: 2 }]
    })
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`LLM1 API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text = extractResponsesText(data);
  const result = extractJson(text);

  // 强制每条候选 id 唯一（避免相同 slug 导致 hover 高亮串号）
  const seenIds = new Set();
  result.candidates = (result.candidates || []).map((c, i) => {
    let id = c.id || (c.name || '').replace(/[\s\W]+/g, '_').toLowerCase() || `cand_${i}`;
    if (seenIds.has(id)) id = `${id}_${i}`;
    seenIds.add(id);
    return {
      ...c,
      id,
      avatar: c.avatar || (c.name && Array.from(c.name)[0]) || '?',
      _persona: null
    };
  });
  result.web_citations = extractResponsesCitations(data);

  // 引文真实性核查：过滤掉判定为 fabricated 的候选
  const verdicts = await window.factCheckCandidates(result.candidates);
  if (verdicts && verdicts.length > 0) {
    const filtered = [];
    const kept = [];
    result.candidates.forEach((c, i) => {
      const v = verdicts.find(x => x && x.index === i);
      if (v && v.status === 'fabricated') {
        filtered.push({ name: c.name, note: v.note || '' });
      } else {
        kept.push({ ...c, _verification: v ? v.status : 'unverified' });
      }
    });
    // 兜底：若所有候选都被判伪造，怀疑核查本身有偏差，保留原始结果
    if (kept.length === 0 && filtered.length > 0) {
      console.warn('[factCheck] 全部候选被判定伪造，跳过过滤');
      result.fact_check = { filtered_count: 0, filtered: [], skipped: true };
    } else {
      result.candidates = kept;
      result.fact_check = { filtered_count: filtered.length, filtered };
    }
  }

  return result;
};

/* ----------------------------------------------------------------
   factCheckCandidates — 校验每条候选引文的真实性
   - 复用 LLM1 的 cfg(apiKey/baseUrl/model)，一次批量调用
   - 返回 [{index, status, note}]，按输入顺序；失败返回 null
   ---------------------------------------------------------------- */
window.FACT_CHECK_SP = `你是严谨的文献核查员。给定若干"作者 + 摘录 + 出处"，逐条判断该摘录是否为该作者真实存在的言论或作品片段。

判断标准：
- verified：高度确信摘录确实出自该作者（精确字句或可信转述；作者真实存在；年代、语种、风格相符）
- uncertain：作者真实存在，但摘录无法确认（疑似改写、转译、记忆模糊）
- fabricated：作者不存在；或摘录明显与作者年代/语种/风格不符；或可证伪

只输出 JSON，不要任何其他内容：
{
  "results": [
    {"index": 0, "status": "verified", "note": "≤30字理由"}
  ]
}
按输入顺序返回，index 从 0 开始，必须覆盖每一条。`;

window.factCheckCandidates = async function(candidates) {
  if (!candidates || candidates.length === 0) return null;
  const cfg = window.getApiConfig('llm1');
  if (!cfg.enabled || !cfg.apiKey) return null;

  const items = candidates.map((c, i) =>
    `${i}. 作者：${c.name}\n   摘录：${c.excerpt || '(空)'}\n   出处：${c.excerpt_source || '(空)'}`
  ).join('\n\n');
  const userContent = `请逐条核查以下 ${candidates.length} 条引文：\n\n${items}`;
  const base = cfg.baseUrl.replace(/\/$/, '');

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: 'system', content: window.FACT_CHECK_SP },
          { role: 'user', content: userContent }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 2000
      })
    });
    if (!res.ok) {
      console.warn('[factCheck] API 失败', res.status, await res.text().catch(() => ''));
      return null;
    }
    const data = await res.json();
    const parsed = extractJson(data.choices[0].message.content);
    return Array.isArray(parsed.results) ? parsed.results : null;
  } catch(e) {
    console.warn('[factCheck] 异常', e);
    return null;
  }
};

/* ----------------------------------------------------------------
   callLLM2 — 角色对话引擎（真实 API 或 fallback mock）
   ---------------------------------------------------------------- */
window.callLLM2 = async function(input) {
  const cfg = window.getApiConfig('llm2');
  if (!cfg.enabled || !cfg.apiKey) return window.mockLLM2(input);

  const p = input.persona;
  // 兼容 PERSONAS 的 excerpts 数组，也兼容 LLM1 直接返回的单条 excerpt
  const excerptList = p.excerpts || (p.excerpt ? [{ text: p.excerpt, source: p.excerpt_source || '' }] : []);
  const excerptText = excerptList.map(e => `「${e.text}」——${e.source}`).join('\n');
  const sysContent = cfg.systemPrompt
    .replace(/{{NAME}}/g, p.name || '')
    .replace(/{{ERA}}/g, p.era || '')
    .replace(/{{INTRO}}/g, p.intro || '')
    .replace(/{{TONE}}/g, (p.style && p.style.tone || []).join('、'))
    .replace(/{{SENTENCE_LENGTH}}/g, (p.style && p.style.sentence_length) || 'medium')
    .replace(/{{RHETORIC}}/g, (p.style && p.style.rhetoric || []).join('、'))
    .replace(/{{MOTIFS}}/g, (p.style && p.style.recurring_motifs || []).join('、'))
    .replace(/{{EXCERPTS}}/g, excerptText);

  const actionDesc = {
    respond: '请回应用户的最新发言。',
    continue: '请顺着用户随笔往下续写一段。',
    rebut: '请站在你这位角色的立场，对用户的观点提出有理有据的反驳。',
    opposite_view: '请暂时跳出你扮演的角色，用相反立场重新审视用户的随笔。',
    deepen: '请引入更深层的视角、案例或抽象思考。'
  };

  const msgs = [{ role: 'system', content: sysContent }];
  msgs.push({ role: 'user', content: `我的随笔：\n${input.essay_context}` });

  for (const m of (input.dialogue_history || [])) {
    if (m.role === 'user') msgs.push({ role: 'user', content: m.text });
    else if (m.role === 'persona') msgs.push({ role: 'assistant', content: m.text });
  }

  // skill: 优先使用调用方传入的 prompt_template；否则退回 actionDesc
  const actionHint = input.action_prompt || actionDesc[input.action] || actionDesc.respond;
  msgs.push({ role: 'user', content: input.user_message ? `${input.user_message}\n\n（${actionHint}）` : actionHint });

  const base = cfg.baseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({ model: cfg.model, messages: msgs, temperature: 0.85, max_tokens: 600 })
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`LLM2 API ${res.status}: ${err}`);
  }
  const data = await res.json();
  return {
    message_id: 'm_' + Math.random().toString(36).slice(2, 9),
    text: data.choices[0].message.content,
    cited_snippets: undefined,
    suggested_followups: ['让 ta 再说细一些', '问 ta：那你呢？', '让 ta 给一个反例']
  };
};

/* ----------------------------------------------------------------
   Skill Registry · 可复用的"动作"
   - 统一存于 localStorage['xingsi:skills']
   - scope: 'dialogue' | 'song' | 'writing-assist'
   - source: 'builtin' | 'user' | 'auto-derived'
   ---------------------------------------------------------------- */
window.SKILLS_KEY = 'xingsi:skills';

window.BUILTIN_SKILLS = [
  {
    id: 'sk_respond',
    name: '让 ta 回应这段话',
    description: '针对你的最新发言给出角色化回应',
    scope: 'dialogue',
    prompt_template: '请回应用户的最新发言。',
    applies_to: ['writer', 'celebrity', 'news'],
    source: 'builtin',
    uses: 0, starred: true, created_at: 0
  },
  {
    id: 'sk_continue',
    name: '让 ta 续写',
    description: '顺着你的随笔往下写一段',
    scope: 'dialogue',
    prompt_template: '请顺着用户随笔往下续写一段。',
    applies_to: ['writer', 'celebrity', 'news'],
    source: 'builtin',
    uses: 0, starred: true, created_at: 0
  },
  {
    id: 'sk_rebut',
    name: '让 ta 提出反驳',
    description: '从该角色立场质疑用户',
    scope: 'dialogue',
    prompt_template: '请站在你这位角色的立场，对用户的观点提出有理有据的反驳。语气坚定但不失尊重。',
    applies_to: ['writer', 'celebrity', 'news'],
    source: 'builtin',
    uses: 0, starred: false, created_at: 0
  },
  {
    id: 'sk_opposite',
    name: '从相反立场重审',
    description: '暂时跳出角色，扮演对立观点',
    scope: 'dialogue',
    prompt_template: '请暂时跳出你扮演的角色，用与之相反的立场重新审视用户的随笔，给出对方可能的反论。',
    applies_to: ['writer', 'celebrity', 'news'],
    source: 'builtin',
    uses: 0, starred: false, created_at: 0
  },
  {
    id: 'sk_deepen',
    name: '更深一层的角度',
    description: '引入更抽象的视角或新案例',
    scope: 'dialogue',
    prompt_template: '请引入更深层的视角、案例或抽象思考。',
    applies_to: ['writer', 'celebrity', 'news'],
    source: 'builtin',
    uses: 0, starred: true, created_at: 0
  }
];

window.getSkills = function() {
  try {
    const raw = localStorage.getItem(window.SKILLS_KEY);
    if (!raw) {
      window.saveSkills(window.BUILTIN_SKILLS);
      return [...window.BUILTIN_SKILLS];
    }
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [...window.BUILTIN_SKILLS];
    // 确保内置 skill 始终存在（用户可能删了，但本次启动重新出现）
    const haveBuiltinIds = new Set(arr.filter(s => s.source === 'builtin').map(s => s.id));
    const missing = window.BUILTIN_SKILLS.filter(b => !haveBuiltinIds.has(b.id));
    if (missing.length) {
      const merged = [...missing, ...arr];
      window.saveSkills(merged);
      return merged;
    }
    return arr;
  } catch(e) {
    return [...window.BUILTIN_SKILLS];
  }
};

window.saveSkills = function(skills) {
  try {
    localStorage.setItem(window.SKILLS_KEY, JSON.stringify(skills));
  } catch(e) {
    console.warn('[saveSkills] 失败：', e);
  }
};

window.addSkill = function(skill) {
  const skills = window.getSkills();
  const s = {
    id: 'sk_' + Math.random().toString(36).slice(2, 10),
    name: skill.name || '未命名 skill',
    description: skill.description || '',
    scope: skill.scope || 'dialogue',
    prompt_template: skill.prompt_template || '',
    applies_to: Array.isArray(skill.applies_to) ? skill.applies_to : ['writer','celebrity','news'],
    source: skill.source || 'user',
    uses: 0,
    starred: false,
    created_at: Date.now(),
    created_from: skill.created_from || null
  };
  window.saveSkills([...skills, s]);
  return s;
};

window.deleteSkill = function(id) {
  const skills = window.getSkills().filter(s => s.id !== id);
  window.saveSkills(skills);
};

window.incrementSkillUse = function(id) {
  const skills = window.getSkills().map(s =>
    s.id === id ? { ...s, uses: (s.uses || 0) + 1 } : s
  );
  window.saveSkills(skills);
};

window.toggleSkillStar = function(id) {
  const skills = window.getSkills().map(s =>
    s.id === id ? { ...s, starred: !s.starred } : s
  );
  window.saveSkills(skills);
};

window.getDialogueSkillsFor = function(personaType) {
  return window.getSkills()
    .filter(s => s.scope === 'dialogue')
    .filter(s => !s.applies_to || s.applies_to.length === 0 || s.applies_to.includes(personaType))
    .sort((a, b) => {
      if ((b.starred ? 1 : 0) !== (a.starred ? 1 : 0)) return (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
      return (b.uses || 0) - (a.uses || 0);
    });
};

/* ----------------------------------------------------------------
   MiniMax 音乐：先用 LLM2 写词与风格 prompt，再调 music-2.6-free
   ---------------------------------------------------------------- */
// MiniMax API Key 留空。运行时优先读取 localStorage['xingsi:minimax-key']，
// 也可手动覆盖 window.MINIMAX_API_KEY 测试。
window.MINIMAX_API_KEY = '';
window.getMiniMaxKey = function() {
  if (window.MINIMAX_API_KEY) return window.MINIMAX_API_KEY;
  try { return localStorage.getItem('xingsi:minimax-key') || ''; } catch(e) { return ''; }
};

window.LYRICS_SP = `你是一位资深词作者，为 MiniMax music-2.6 作曲模型撰写可直接送入 API 的歌词与风格 prompt。基于用户提供的随笔和可选的主题/情绪/立场标签，产出一首完整的流行歌曲歌词。

只输出以下格式的 JSON，不要包含任何额外说明或 Markdown：
{
  "prompt": "音乐风格描述，英文，2-4 个词组，描述风格/情绪/场景/乐器，给作曲模型作为参考",
  "lyrics": "歌词正文，使用 \\n 分隔行，必须包含结构标签"
}

【lyrics 字段硬性要求 — 直接对应 music-2.6 API 规范】
- 使用 \\n（换行符）分隔每一行歌词；不要使用 <br> 或其他符号
- 必须使用方括号结构标签标注段落，标签独占一行，紧接其下为该段歌词
- 允许的结构标签（仅限以下，区分大小写，按需选用）：
  [Intro] [Verse] [Pre Chorus] [Chorus] [Post Chorus] [Hook] [Bridge] [Interlude] [Transition] [Break] [Build Up] [Inst] [Solo] [Outro]
- 至少包含一个 [Verse] 和一个 [Chorus]；推荐结构示例：
  [Intro] → [Verse] → [Pre Chorus] → [Chorus] → [Verse] → [Chorus] → [Bridge] → [Chorus] → [Outro]
  也可按情绪走向裁剪，但总段落数建议 4-8 段
- 每段 2-6 行；整首歌词总字符数严格控制在 1-3500 之间（含标签与换行），目标 600-1500 字符
- 不要在歌词中混入英文括注、说明、序号、标点解释；纯歌词本身

【创作要求】
- 紧扣随笔的核心意境、情绪与立场标签，不要直接复制原文句子；凝练为可吟唱的诗句
- 注重韵律：句末押韵或近韵、句长大致工整；可借鉴古典诗词的意象与对仗，但语言保持现代可唱
- [Chorus] 应有强记忆点（hook），可重复 1-2 个关键意象或短句
- [Verse] 推进叙事或铺陈意境，[Bridge] 提供情绪转折或视角转换
- [Inst] / [Solo] / [Break] 等纯器乐段落若使用，留空一行即可，不写词
- 若随笔语言是中文，歌词用中文；若是英文则用英文；不要中英混杂
- prompt 字段始终用英文，2-4 个短语逗号分隔，例如 "Indie folk, melancholic, introspective, rainy night piano"`;

window.generateLyrics = async function(essayText, tags) {
  const cfg = window.getApiConfig('llm2');
  const tagDesc = tags
    ? `\n参考标签：主题=${(tags.theme||[]).join('/')}; 情绪=${(tags.emotion||[]).join('/')}; 立场=${(tags.stance||[]).join('/')}`
    : '';

  // 注入用户音乐画像（hermes-style 记忆）
  const profileText = window.compileMusicProfileText
    ? window.compileMusicProfileText(window.getMusicProfile())
    : '';
  const systemContent = profileText
    ? `${profileText}\n\n---\n\n${window.LYRICS_SP}`
    : window.LYRICS_SP;

  const userContent = `随笔：\n${essayText}${tagDesc}\n\n请为它写一首歌的歌词与风格 prompt。`;
  const base = cfg.baseUrl.replace(/\/$/, '');

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.85,
      max_tokens: 1500
    })
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Lyrics API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const parsed = extractJson(data.choices[0].message.content);
  if (!parsed.lyrics || parsed.lyrics.length < 10) throw new Error('歌词生成为空');
  return { lyrics: parsed.lyrics, prompt: parsed.prompt || 'Indie folk, melancholic, introspective' };
};

window.callMiniMaxMusic = async function(lyrics, prompt) {
  const key = window.getMiniMaxKey ? window.getMiniMaxKey() : window.MINIMAX_API_KEY;
  if (!key) {
    throw new Error('未配置 MiniMax API Key。请在右下角"工具"面板填写，或设置 localStorage["xingsi:minimax-key"]。');
  }
  const res = await fetch('https://api.minimax.io/v1/music_generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'music-2.6-free',
      prompt,
      lyrics,
      output_format: 'url',
      audio_setting: { sample_rate: 44100, bitrate: 256000, format: 'mp3' }
    })
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`MiniMax HTTP ${res.status}: ${err}`);
  }
  const data = await res.json();
  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(`MiniMax: ${data.base_resp.status_msg || 'unknown error'} (code ${data.base_resp.status_code})`);
  }
  const audioUrl = data.data && data.data.audio;
  if (!audioUrl) throw new Error('MiniMax 未返回音频');
  return {
    audio_url: audioUrl,
    duration: (data.extra_info && data.extra_info.music_duration) || null
  };
};

/* ----------------------------------------------------------------
   音乐画像 · Hermes-style 记忆层
   - 存于 localStorage['xingsi:music-profile']
   - 写歌时通过 compileMusicProfileText 注入到 LYRICS_SP 顶部
   ---------------------------------------------------------------- */
window.MUSIC_PROFILE_KEY = 'xingsi:music-profile';

window.DEFAULT_MUSIC_PROFILE = {
  presets: {
    genres: [],
    moods: [],
    instruments: [],
    languages: [],
    freeText: ''
  },
  references: [],   // [{id, kind:'artist'|'lyrics', label, analysis, created_at}]
  trajectories: [], // 最近 12 首歌的简版记录，供 insights 反思用
  lastReflectedAt: 0,           // 上次反思时 trajectories 的长度
  freeTextManual: '',           // 用户手动写过的原始 freeText（反思时保留）
  reflectionHistory: []         // [{at, prevFreeText, newFreeText, basis}]
};

window.getMusicProfile = function() {
  try {
    const raw = localStorage.getItem(window.MUSIC_PROFILE_KEY);
    if (!raw) return window.DEFAULT_MUSIC_PROFILE;
    const p = JSON.parse(raw);
    return {
      presets: { ...window.DEFAULT_MUSIC_PROFILE.presets, ...(p.presets || {}) },
      references: Array.isArray(p.references) ? p.references : [],
      trajectories: Array.isArray(p.trajectories) ? p.trajectories : [],
      lastReflectedAt: typeof p.lastReflectedAt === 'number' ? p.lastReflectedAt : 0,
      freeTextManual: typeof p.freeTextManual === 'string' ? p.freeTextManual : '',
      reflectionHistory: Array.isArray(p.reflectionHistory) ? p.reflectionHistory : []
    };
  } catch(e) {
    return window.DEFAULT_MUSIC_PROFILE;
  }
};

window.saveMusicProfile = function(profile) {
  try {
    localStorage.setItem(window.MUSIC_PROFILE_KEY, JSON.stringify(profile));
  } catch(e) {
    console.warn('[saveMusicProfile] 写入失败:', e);
  }
};

window.compileMusicProfileText = function(profile) {
  if (!profile) return '';
  const { presets, references } = profile;
  const parts = [];

  const presetLines = [];
  if (presets.genres && presets.genres.length) presetLines.push(`- 喜欢的曲风：${presets.genres.join('、')}`);
  if (presets.moods && presets.moods.length) presetLines.push(`- 偏好的情绪：${presets.moods.join('、')}`);
  if (presets.instruments && presets.instruments.length) presetLines.push(`- 偏爱的乐器：${presets.instruments.join('、')}`);
  if (presets.languages && presets.languages.length) presetLines.push(`- 语种偏好：${presets.languages.join('、')}`);
  if (presets.freeText && presets.freeText.trim()) presetLines.push(`- 用户补充：${presets.freeText.trim()}`);
  if (presetLines.length) parts.push(`【用户预设】\n${presetLines.join('\n')}`);

  if (references && references.length) {
    const refLines = references.slice(-8).map(r => {
      const kindLabel = r.kind === 'artist' ? '歌手' : '歌词';
      return `- ${kindLabel}「${r.label}」：${r.analysis}`;
    });
    parts.push(`【用户喜欢的参考】\n${refLines.join('\n')}`);
  }

  if (parts.length === 0) return '';
  return `【关于这位用户的音乐画像】
（以下是用户提前告诉你的喜好，请在创作中尽量贴合；如与本次随笔情绪冲突，以随笔情绪为准。）

${parts.join('\n\n')}`;
};

/* ----------------------------------------------------------------
   analyzeArtist / analyzeLyrics — 让 LLM 把"我喜欢这个"解析成可注入的描述
   ---------------------------------------------------------------- */
window.ARTIST_ANALYSIS_SP = `你是一位音乐评论员，熟悉中外流行音乐史。给定一位歌手/词曲人/乐队的名字，用 80-160 字提炼他/她的核心风格特征，作为给作曲 AI 的参考。

只输出纯文本（不要 JSON，不要 Markdown，不要标题），按以下维度凝练：
- 主要曲风（如 indie folk、city pop、ambient piano）
- 典型情绪与主题
- 标志性意象、用词或乐器
- 句长 / 押韵 / 编曲的偏好（如有）

如果不认识这位歌手，直接回答："不认识这位歌手，请改贴歌词。"`;

window.analyzeArtist = async function(name) {
  const cfg = window.getApiConfig('llm2');
  if (!cfg.enabled || !cfg.apiKey) {
    return `（未配置 API，跳过解析）喜欢 ${name} 的风格`;
  }
  const base = cfg.baseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: 'system', content: window.ARTIST_ANALYSIS_SP },
        { role: 'user', content: `歌手：${name}` }
      ],
      temperature: 0.5,
      max_tokens: 400
    })
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Analyze API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  return text.trim();
};

/* ----------------------------------------------------------------
   recordSongTrajectory — 每首歌生成后写入一条轻量轨迹
   reflectMusicProfileIfNeeded — 每 3 首歌做一次 insights 反思，重写 freeText
   ---------------------------------------------------------------- */
window.REFLECT_EVERY = 3;

window.recordSongTrajectory = function({ essay_id, essay_text, lyrics, prompt }) {
  const profile = window.getMusicProfile();
  const head = (lyrics || '').split('\n').filter(Boolean).slice(0, 4).join(' / ');
  const traj = {
    essay_id,
    essay_snippet: (essay_text || '').slice(0, 80),
    lyrics_head: head.slice(0, 120),
    style_prompt: prompt || '',
    at: Date.now()
  };
  const next = {
    ...profile,
    trajectories: [...profile.trajectories, traj].slice(-12)  // 最近 12 首
  };
  window.saveMusicProfile(next);
  return next;
};

window.INSIGHTS_SP = `你是一位贴心的音乐策展人，正在观察一位用户的写歌偏好。基于最近几首歌的素材和用户已有的画像，更新一段简短的"自由补充"（freeText），让 AI 下次写歌更贴近这位用户。

输出严格要求：
- 只输出新的 freeText 内容，不要任何前后缀、不要 Markdown、不要标题、不要引号
- 长度 50-150 字之间
- 必须保留用户曾经手动写过的关键诉求（如有，会在输入中给出）
- 在此基础上凝练 1-3 条新观察（重复出现的主题、情绪倾向、回避的元素、偏爱的句法等）
- 用第二人称或描述性陈述，不要用"用户希望…"这样的元描述
- 不要重复 presets 里已有的曲风/情绪标签，那些已经在画像别处了`;

window.reflectMusicProfileIfNeeded = async function() {
  const profile = window.getMusicProfile();
  const total = profile.trajectories.length;
  const sinceLast = total - profile.lastReflectedAt;
  if (sinceLast < window.REFLECT_EVERY) return { triggered: false };

  const cfg = window.getApiConfig('llm2');
  if (!cfg.enabled || !cfg.apiKey) {
    // 没 API 也要推进 counter，避免下次再立刻触发
    window.saveMusicProfile({ ...profile, lastReflectedAt: total });
    return { triggered: false, reason: 'no-api' };
  }

  const recent = profile.trajectories.slice(-window.REFLECT_EVERY);
  const recentText = recent.map((t, i) =>
    `第 ${i+1} 首：\n  随笔片段：${t.essay_snippet}\n  歌词开头：${t.lyrics_head}\n  风格 prompt：${t.style_prompt}`
  ).join('\n\n');

  const presetSummary = [
    profile.presets.genres.length ? `曲风：${profile.presets.genres.join('、')}` : null,
    profile.presets.moods.length ? `情绪：${profile.presets.moods.join('、')}` : null,
    profile.presets.instruments.length ? `乐器：${profile.presets.instruments.join('、')}` : null,
  ].filter(Boolean).join('；') || '（无）';

  const userContent = `用户已有的预设：${presetSummary}

用户曾经手动写过的"自由补充"原文（必须保留其中的关键诉求）：
${profile.freeTextManual || '（暂无）'}

最近 ${recent.length} 首歌的素材：

${recentText}

请基于上述材料，更新这段自由补充。`;

  try {
    const base = cfg.baseUrl.replace(/\/$/, '');
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: 'system', content: window.INSIGHTS_SP },
          { role: 'user', content: userContent }
        ],
        temperature: 0.4,
        max_tokens: 400
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let newText = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim();
    // 去掉常见的反引号/引号包裹
    newText = newText.replace(/^["「『]+|["」』]+$/g, '').replace(/^```[\s\S]*?\n|```$/g, '').trim();
    if (!newText || newText.length < 10) {
      window.saveMusicProfile({ ...profile, lastReflectedAt: total });
      return { triggered: false, reason: 'empty' };
    }

    const prevFreeText = profile.presets.freeText || '';
    const next = {
      ...profile,
      presets: { ...profile.presets, freeText: newText },
      lastReflectedAt: total,
      reflectionHistory: [
        ...profile.reflectionHistory,
        { at: Date.now(), prevFreeText, newFreeText: newText, basis_count: recent.length }
      ].slice(-10)  // 保留最近 10 次反思
    };
    window.saveMusicProfile(next);
    return { triggered: true, prevFreeText, newFreeText: newText };
  } catch(err) {
    console.warn('[reflectMusicProfile] 失败：', err);
    // 失败也推进 counter，避免反复重试
    window.saveMusicProfile({ ...profile, lastReflectedAt: total });
    return { triggered: false, reason: 'error', error: err.message };
  }
};

window.LYRICS_ANALYSIS_SP = `你是一位音乐评论员。给定用户喜欢的一段歌词，用 80-160 字提炼这段歌词的风格特征，作为给作曲 AI 的参考。

只输出纯文本（不要 JSON，不要 Markdown，不要标题），按以下维度凝练：
- 主题与情绪走向
- 意象密度与典型意象
- 句长、押韵密度、节奏
- 可能的曲风与编曲提示`;

window.analyzeLyrics = async function(lyricsText, label) {
  const cfg = window.getApiConfig('llm2');
  if (!cfg.enabled || !cfg.apiKey) {
    return `（未配置 API，跳过解析）参考：${(label || '').slice(0, 30)}`;
  }
  const base = cfg.baseUrl.replace(/\/$/, '');
  const userContent = label
    ? `用户喜欢这段歌词（标题：${label}）：\n\n${lyricsText}`
    : `用户喜欢这段歌词：\n\n${lyricsText}`;
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: 'system', content: window.LYRICS_ANALYSIS_SP },
        { role: 'user', content: userContent }
      ],
      temperature: 0.5,
      max_tokens: 400
    })
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Analyze API ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  return text.trim();
};

/* ----------------------------------------------------------------
   预设清单（可勾选项）
   ---------------------------------------------------------------- */
window.MUSIC_PRESET_OPTIONS = {
  genres: [
    '民谣', '独立摇滚', 'indie folk', 'city pop', '古风', '电子', 'ambient',
    'lo-fi', 'R&B', '爵士', '说唱', '后摇', '钢琴小品', '流行', '世界音乐'
  ],
  moods: [
    '克制', '宁静', '温柔', '怅然', '思辨', '疏离', '热烈',
    '怀旧', '浪漫', '苍凉', '俏皮', '神秘', '坚定'
  ],
  instruments: [
    '钢琴', '木吉他', '电吉他', '弦乐', '合成器',
    '鼓组', '萨克斯', '口琴', '古筝', '笛箫', '人声合唱', '极简编曲'
  ],
  languages: ['中文', '英文', '中英混搭']
};

