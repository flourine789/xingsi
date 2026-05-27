# 行思 · Xing-Si

> 古人今人若流水，共看明月皆如此。

一款面向**写作者与思考者**的 AI 应用网页原型。用户写下一段随笔，系统识别其中的主题、情绪与立场，匹配与之共鸣的**作家、名人或新闻评论**，并支持点击任一对象进入角色化对话，把灵感沉淀为卡片或回流到下一段写作。

**核心链路**：输入随笔 → 可视化探索 → 共鸣交流 → 续写沉淀

---

## ✨ 主要功能

- **随笔簿 / 书写页**：极简的中文写作界面，实时字数统计、自动保存草稿。
- **思想星图**：将匹配结果以二维星图展示，距离即相似度，颜色区分作家 / 名人 / 评论。
- **角色化对话**：以匹配对象的语言风格回应你的随笔，可让 ta 续写、反驳、深入。
- **灵感卡片**：把对话中打动你的句子收藏成卡片，或回流到原随笔。
- **AI 谱曲**：把这段念头交给 MiniMax music-2.6，生成一首属于它的歌。
- **主题切换**：水墨 / 夜读 / 报刊等多种视觉氛围。

---

## 🛠 技术栈

纯静态前端，无构建步骤：

- React 18（通过 CDN 加载）
- Babel Standalone（浏览器端 JSX 转译）
- 原生 CSS（[`src/styles.css`](src/styles.css)）
- 后端：直连 LLM Chat Completions API 与 MiniMax music-2.6

> 选择「浏览器端 Babel」是为了让原型保持零依赖、零构建、即开即用，方便快速迭代视觉与交互。

---

## 🚀 快速开始

由于使用浏览器端 Babel 转译 JSX，直接 `file://` 打开会被 CORS 拦截，需要本地起一个静态服务器：

```bash
# 方式一：Python 自带
cd /path/to/xingsi
python3 -m http.server 8765
# 然后访问 http://localhost:8765/

# 方式二：Node
npx serve .

# 方式三：VS Code Live Server 插件
```

首次进入会看到引导卡片，关闭后从「新起一篇」开始写作。

---

## 🔑 配置 API Key

应用同时调用两组接口：

| 用途 | 接口 | 位置 |
|---|---|---|
| LLM1（匹配 / 标签） | OpenAI 兼容 Chat Completions | [`src/data.jsx`](src/data.jsx) `DEFAULT_LLM1_*` |
| LLM2（角色对话 / 写歌词） | OpenAI 兼容 Chat Completions | [`src/data.jsx`](src/data.jsx) `DEFAULT_LLM2_*` |
| 谱曲 | MiniMax music-2.6 | [`src/data.jsx`](src/data.jsx) `MINIMAX_API_KEY` |

⚠️ **不要把真实 Key 提交到公开仓库**。建议：
- 公开仓库：把 Key 改为从 `localStorage` 读取（应用内右上角"工具"面板支持运行时填入）。
- 私人原型：可保留硬编码，但将仓库设为 Private。

---

## 📁 项目结构

```
xingsi/
├── index.html              入口；通过 CDN 加载 React + Babel
├── src/
│   ├── app.jsx             顶层路由与状态
│   ├── data.jsx            API 调用、System Prompt、本地存储
│   ├── shared.jsx          通用组件（头像、徽章等）
│   ├── intro-card.jsx      首次进入引导卡片
│   ├── tweaks-panel.jsx    主题 / API 配置侧栏
│   ├── screen-home.jsx     A1 随笔簿
│   ├── screen-write.jsx    A2 书写页
│   ├── screen-matching.jsx B1 匹配等待
│   ├── screen-echoes.jsx   B2 思想星图
│   ├── screen-dialogue.jsx C1 角色对话室
│   ├── screen-cards.jsx    C2 灵感卡片
│   ├── screen-song.jsx     ♪ AI 谱曲
│   ├── styles.css          全部样式
│   ├── PRD.md              产品需求文档
│   └── DESIGN.md           设计说明
└── README.md
```

---

## 📄 进一步阅读

- 产品全貌与场景细节：[`src/PRD.md`](src/PRD.md)
- 视觉规范与组件 token：[`src/DESIGN.md`](src/DESIGN.md)

---

## ⚖️ 内容与版权

- 引用摘录每条 ≤ 80 字，必带出处；不展示完整段落。
- 角色化对话以「基于公开作品的风格化模拟」呈现，永久显示免责说明，不为人物伪造立场。
- 同一立场匹配结果占比 ≤ 70%，保留异见视角，避免回音壁。

---

## 📜 License

本项目仅作为产品原型与学习用途，未指定开源许可。如需复用代码或资源，请先联系作者。
