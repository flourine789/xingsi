# 行思 · Xing-Si

> 古人今人若流水，共看明月皆如此。

一款面向**写作者与思考者**的 AI 应用网页原型。用户写下一段随笔，系统识别其中的主题、情绪与立场，匹配与之共鸣的**作家、名人或新闻评论**，并支持点击任一对象进入角色化对话，把灵感沉淀为卡片，也可以让 AI 谱成一首歌。

**核心链路**：输入随笔 → 可视化探索 → 共鸣交流 → 续写沉淀 / 谱曲

---

## ✨ 主要功能

### 写作与匹配
- **随笔簿 / 书写页**：极简的中文写作界面，实时字数统计、自动保存草稿。
- **思想星图**：将匹配结果以环形二维星图展示，距离即相似度，颜色区分作家 / 名人 / 评论；节点上下左右散布。
- **角色化对话**：以匹配对象的语言风格回应你的随笔，可让 ta 续写、反驳、深入。
- **灵感卡片**：把对话中打动你的句子收藏成卡片，或一键回流到原随笔。

### AI 谱曲与音乐画像
- **AI 谱曲**：把这段念头交给 MiniMax music-2.6，生成歌词 + 一首 mp3。歌词按 `[Verse] [Chorus]` 等 14 种结构标签输出。
- **我的曲风偏好**（Hermes-style memory）：
  - **预设勾选**：曲风 / 情绪 / 乐器 / 语种 chip + 自由文本
  - **歌手解析**：输入 "李宗盛"，LLM 提炼 80-160 字风格画像并加入记忆
  - **歌词上传**：贴一段你喜欢的歌词，LLM 解析意象/押韵/情绪
  - **自动反思**：每生成 3 首歌后自动让模型回头观察轨迹，重写 freeText；保留你手动写过的"原话基线"，并留下可查看的反思 diff 历史

### 对话动作 Skill 系统
- **5 个内置动作**：响应 / 续写 / 反驳 / 反观 / 加深，每个都是可替换的 skill
- **存为动作**：在任何 persona 回复下方点 "⤴ 存为动作"，可把当时的指令模板（你输入的 user_message 自动作为种子）保存为新的可复用动作
- **自适应排序**：starred 在前，常用的 skill 自动浮到前面，显示 ×N 使用次数

### 视觉与体验
- **主题切换**：水墨 / 夜读 / 报刊等多种视觉氛围。
- **PWA**：iOS / Android 上可"添加到主屏幕"，独立窗口、离线缓存 app shell。
- **应用架构图**：介绍弹窗里有一张 LLM1（匹配）/ LLM2（对话）/ LLM3（谱曲）三层模型的可视化说明。

---

## 🛠 技术栈

纯静态前端，无构建步骤：

- React 18（通过 CDN 加载）
- Babel Standalone（浏览器端 JSX 转译）
- 原生 CSS（[`src/styles.css`](src/styles.css)）
- Service Worker（[`sw.js`](sw.js)）实现 PWA + 离线
- 后端：浏览器直接 fetch LLM Chat Completions / MiniMax music-2.6

> 选择「浏览器端 Babel」是为了让原型保持零依赖、零构建、即开即用，方便快速迭代视觉与交互。代价是首屏体积较大，未来若上正式部署可换 Vite。

---

## 🚀 快速开始
https://xingsi.vercel.app/
---

## 🔑 配置 API Key

应用调用以下接口：

| 用途 | 接口 | 位置 |
|---|---|---|
| LLM1（匹配 / 标签） | 火山方舟 Doubao Responses API + web_search | [`src/data.jsx`](src/data.jsx) `getApiConfig('llm1')` |
| LLM2（角色对话 / 写歌词 / 歌手分析 / 反思） | OpenAI 兼容 Chat Completions | [`src/data.jsx`](src/data.jsx) `getApiConfig('llm2')` |
| LLM3 | MiniMax music-2.6 | [`src/data.jsx`](src/data.jsx) `MINIMAX_API_KEY` |


---

## 📁 项目结构

```
xingsi/
├── index.html                  入口；通过 CDN 加载 React + Babel
├── manifest.json               PWA 清单
├── icon.svg                    应用图标（宣纸底 + 朱砂"行"字）
├── sw.js                       Service Worker（app shell 缓存 + 离线）
├── README.md
└── src/
    ├── app.jsx                 顶层路由、全局状态、记忆/反思触发
    ├── data.jsx                LLM 调用、System Prompt、本地存储、记忆层、skill registry
    ├── shared.jsx              通用组件（头像、徽章、useStored）
    ├── intro-card.jsx          首次进入引导弹窗（含三层架构图）
    ├── tweaks-panel.jsx        主题 / API 配置侧栏
    ├── music-profile-panel.jsx 音乐画像面板（预设 + 歌手 + 歌词 + 当前画像）
    ├── screen-home.jsx         A1 随笔簿
    ├── screen-write.jsx        A2 书写页（含「♪ 做成一首歌」入口）
    ├── screen-matching.jsx     B1 匹配等待
    ├── screen-echoes.jsx       B2 思想星图（环形布局）
    ├── screen-dialogue.jsx     C1 角色对话室（含 Skill 动作 + SaveSkillModal）
    ├── screen-cards.jsx        C2 灵感卡片
    ├── screen-song.jsx         ♪ AI 谱曲（含曲风偏好入口）
    ├── styles.css              全部样式
    ├── PRD.md                  产品需求文档
    └── DESIGN.md               设计说明
```

---

## 🧠 记忆与 Skill 体系

应用内部维护几个互相协作的 localStorage 命名空间：

| Key | 内容 | 注入时机 |
|---|---|---|
| `xingsi:essays` / `xingsi:matches` / `xingsi:dialogues` / `xingsi:cards` / `xingsi:songs` | 用户创作与生成产物 | 渲染时读取 |
| `xingsi:music-profile` | 音乐画像（预设 + references + trajectories + 反思历史） | 每次 `generateLyrics` 前编译成中文段落，贴到 LYRICS_SP 顶部 |
| `xingsi:skills` | 对话动作 skill 注册表 | `callLLM2(input.action_prompt)` 注入到 user message 后 |
| `xingsi:tweaks` | 主题 / 视觉 token | 启动时 `applyTweaks` 应用 |

设计灵感参考了 [nousresearch/hermes-agent](https://github.com/nousresearch/hermes-agent) 的 USER.md / 反思循环 / Skill 注册概念，但裁剪为浏览器 + localStorage 可承载的轻量版。

---

## 📄 进一步阅读

- 产品全貌与场景细节：[`src/PRD.md`](src/PRD.md)
- 视觉规范与组件 token：[`src/DESIGN.md`](src/DESIGN.md)

---

## ⚖️ 内容与版权

- 引用摘录每条 ≤ 80 字，必带出处；不展示完整段落。
- 角色化对话以「基于公开作品的风格化模拟」呈现，永久显示免责说明，不为人物伪造立场。
- 同一立场匹配结果占比 ≤ 70%，保留异见视角，避免回音壁。
- LLM1 返回的候选会经过 `factCheckCandidates` 二次核查，疑似伪造的引文会被过滤并提示用户。

---

## 📜 License

本项目仅作为产品原型与学习用途，未指定开源许可。如需复用代码或资源，请先联系作者。
