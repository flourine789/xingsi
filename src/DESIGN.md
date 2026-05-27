# 行思 · Xing-Si — 设计说明

> 一个可点击的中文随笔/思想匹配应用原型。整个站点是一份"设计画布"(design canvas):把桌面流程、手机端流程、可视化探索并列陈列,可缩放、可聚焦、可主题切换。

---

## 一、整体定位

**产品名**:行思(Xing-Si)
**副标题**:一气书写,寻得回响
**英文短描**:A clickable prototype — click any button or figure to jump screens

技术栈:React 18 + Babel Standalone(浏览器内 JSX 编译),通过 CDN 加载,无打包步骤。所有屏幕组件以独立 `.jsx` 文件载入,统一在 `index.html` 内的 `<App />` 中编排到 `DesignCanvas` 上。

文件结构(由 `<script>` 标签推断):

```
index.html
src/
  styles.css
  design-canvas.jsx      // 缩放/平移/聚焦画布
  shared.jsx             // 共享原子组件
  screen-home.jsx        // 桌面 01 随笔簿
  screen-write.jsx       // 桌面 02 书写
  screen-matching.jsx    // 桌面 03 寻回声
  screen-echoes.jsx      // 桌面 04 思想星图
  screen-dialogue.jsx    // 桌面 05 对话室
  screen-cards.jsx       // 桌面 06 灵感卡片
  visualizations.jsx     // 四种可视化隐喻
  ios-frame.jsx          // iPhone 外壳
  mobile-screens.jsx     // 移动端 M1–M6
  tweaks-panel.jsx       // 实时主题面板
```

---

## 二、页面结构

整个应用被组织为一块巨大的 `DesignCanvas`,可在 `minScale=0.05` 到 `maxScale=3` 之间缩放。画布上有三个分区(`DCSection`)和若干画板(`DCArtboard`)。每个画板可单独"聚焦"为全屏视图。

### Section 1 · 主流程(桌面)

`id="flow"` ・ 标题:**主流程 · 一气书写,寻得回响**
画板尺寸统一为 **1280 × 820**,间距 56。

| 序号 | ID | 中文名 | 英文名 | 组件 |
|---|---|---|---|---|
| 01 | `flow/01-home` | 随笔簿 | Home | `ScreenHome` |
| 02 | `flow/02-write` | 书写 | Write | `ScreenWrite` |
| 03 | `flow/03-matching` | 寻回声 | Matching | `ScreenMatching` |
| 04 | `flow/04-echoes` | 思想星图 | Echo Map | `ScreenEchoes` |
| 05 | `flow/05-dialogue` | 对话室 | Dialogue | `ScreenDialogue` |
| 06 | `flow/06-cards` | 灵感卡片 | Embers | `ScreenCards` |

用户旅程为线性:在 *随笔簿* 中起念 → *书写* → 系统 *寻回声*(为这段思考匹配古今对话者)→ 在 *思想星图* 中看到自己的思想坐标 → 进入 *对话室* 与匹配的回响者对谈 → 把对话沉淀成 *灵感卡片*。

### Section 2 · 手机端

`id="mobile"` ・ 标题:**手机端 · 同样的流程,贴着掌心**
画板尺寸 **460 × 920**,间距 48。每个画板内放一台 `IOSDevice` 外壳,内嵌对应屏幕。

| 序号 | ID | 屏幕 | 备注 |
|---|---|---|---|
| M1 | `mobile/m1-home` | `MScreenHome` | |
| M2 | `mobile/m2-write` | `MScreenWrite` | |
| M3 | `mobile/m3-matching` | `MScreenMatching` | **dark 模式**(`<IOSDevice dark>`) |
| M4 | `mobile/m4-echoes` | `MScreenEchoes` | |
| M5 | `mobile/m5-dialogue` | `MScreenDialogue` | |
| M6 | `mobile/m6-cards` | `MScreenCards` | |

每个 `IOSDevice` 居中放置在 `#f0eee9` 的灰底中,模拟陈列样机的展示效果。注意 M3 *寻回声* 使用深色 iPhone 外壳——与桌面端"匹配中"那一刻的内省气质保持一致。

### Section 3 · 可视化探索

`id="viz"` ・ 标题:**可视化探索 · 同一意念,四种隐喻**
副标题:*The same matched figures, expressed four different ways*
画板尺寸 **1280 × 820**,间距 56。

| 序号 | ID | 中文名 | 英文名 | 组件 |
|---|---|---|---|---|
| V1 | `viz/v1-reflection` | 临水照花 | Reflection | `VizReflection` |
| V2 | `viz/v2-chronograph` | 时间光谱 | Chronoglyph | `VizChronograph` |
| V3 | `viz/v3-roundtable` | 夜话圆桌 | Roundtable | `VizRoundtable` |
| V4 | `viz/v4-rings` | 墨年轮 | Ink Rings | `VizInkRings` |

四种可视化共享同一份"被匹配到的对话者"数据,用四种不同的视觉隐喻表达——分别强调"映照""时间维度""聚谈""年轮沉积"。

### 画布上的便签

页面左上角(`top=-30 left=60 rotate=-3`)有一张 `DCPostIt`,白底斜贴,提示用户:点击任意画板的"展开"图标可聚焦;在主流程内,屏幕里的按钮会跳转到下一屏。

---

## 三、组件清单

### 画布与排版(`design-canvas.jsx`)

| 组件 | 作用 |
|---|---|
| `DesignCanvas` | 顶层容器。提供平移、滚轮缩放,接受 `minScale`/`maxScale`。 |
| `DCSection` | 区段;接受 `id`、`title`、`subtitle`、`gap`。 |
| `DCArtboard` | 单块"画板";接受 `id`、`label`、`width`、`height`。每个画板自带 `.dc-expand` 按钮供路由触发。`data-dc-slot` 属性形如 `"flow/01-home"`,是聚焦路由的唯一键。 |
| `DCPostIt` | 自由摆放的便签;接受 `top/left/rotate/width`。 |

### 共享原子(`shared.jsx`)

由其他屏幕脚本共同使用,提供基础排版、按钮、印章、墨色文字块等(具体组件名未在主文件中暴露;来自 `src/shared.jsx`)。

### 屏幕组件(桌面)

`ScreenHome`、`ScreenWrite`、`ScreenMatching`、`ScreenEchoes`、`ScreenDialogue`、`ScreenCards`——每个都接收 `onNav(screen)` 回调,允许屏内 CTA 跳转。

### 屏幕组件(移动)

`MScreenHome`、`MScreenWrite`、`MScreenMatching`、`MScreenEchoes`、`MScreenDialogue`、`MScreenCards`——除 `MScreenMatching` 外都接收 `onNav(screen)`,跳转受限在移动端区段内部。

### 设备外壳

`IOSDevice`——iPhone 形态的容器,可传入 `dark` 布尔切换深色机身。

### 可视化(`visualizations.jsx`)

`VizReflection`、`VizChronograph`、`VizRoundtable`、`VizInkRings`——四种独立的视觉隐喻,无导航回调。

### 实时主题面板(`tweaks-panel.jsx`)

| 组件 | 作用 |
|---|---|
| `TweaksPanel` | 面板外壳。 |
| `TweakSection` | 分组,接受 `label`(如 "氛围 · Mood")。 |
| `TweakRadio` | 单选按钮组,用于 mood / texture。 |
| `TweakColor` | 色卡选择器,用于 accent。 |
| `useTweaks(defaults)` | 自定义 Hook,返回 `{values, setTweak}`,并把当前值持久化到宿主(`EDITMODE` 块)。 |

---

## 四、配色 Token

主题系统由三个独立的"旋钮"组成,合成出最终的 CSS 自定义属性。所有 token 都挂在 `:root` 上,由 `applyTweaks()` 在首次加载和每次切换时写入。

### 4.1 Mood — 三套纸张+墨色配色

| Token | 古纸 `parchment` | 夜读 `night` | 晨白 `dawn` |
|---|---|---|---|
| `--paper` | `#f3ede0` | `#1c1814` | `#fafaf7` |
| `--paper-soft` | `#f8f3e7` | `#2a241c` | `#ffffff` |
| `--paper-deep` | `#ebe4d2` | `#13110d` | `#f0eee9` |
| `--paper-rim` | `#d8cdb4` | `#3a3024` | `#d4d0c8` |
| `--ink` | `#1c1611` | `#e7dcc1` | `#1a1a1a` |
| `--ink-soft` | `#4a3f33` | `#c4b894` | `#404040` |
| `--ink-mute` | `#7a6d5b` | `#988a72` | `#888888` |
| `--ink-faint` | `#b5a98f` | `#5a4f3e` | `#cbc8c0` |
| `--grain-base` | `0.55` | `0.20` | `0.10` |

`--paper-deep` 会同步写到 `document.body.background`,使画布外的"边缘"也与所选氛围一致。

### 4.2 Accent — 印章色

| 色值 | 名称 | `--cinnabar-deep` |
|---|---|---|
| `#a8332a` | 朱砂 | `#7e2620` |
| `#5d7a72` | 苍青 | `#3f574f` |
| `#4a5d75` | 黛蓝 | `#2e3e54` |
| `#a08454` | 古金 | `#7a6238` |

选择后写入 `--cinnabar` 与 `--cinnabar-deep`。这两个 token 主要用于印章、强调按钮、关键标点。

### 4.3 Texture — 纸纹强度

| 选项 | 标签 | `grainMult` |
|---|---|---|
| `hidden` | 隐 | 0.25 |
| `mid` | 中 | 1.0 |
| `shown` | 显 | 1.8 |

最终的 `--grain-opacity = mood.--grain-base × texture.grainMult`,保留三位小数。这样两个旋钮可叠加而不互相打架——比如"夜读 + 显"仍然克制,而"古纸 + 中"已经有明显手工感。

### 4.4 默认值与持久化

```js
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mood":    "parchment",
  "accent":  "#a8332a",
  "texture": "mid"
}/*EDITMODE-END*/;
```

`EDITMODE` 注释边界由宿主环境识别——任何主题改动都会回写到这两个标记之间,使下次加载即时复现。`applyTweaks(TWEAK_DEFAULTS)` 在 `App` 渲染之前就跑一次,保证首帧不会出现样式闪烁。

---

## 五、交互行为

### 5.1 画布操作

- **平移**:在画布空白处拖动。
- **缩放**:滚轮(范围 `0.05–3`)。
- **聚焦**:点击画板右上角的展开图标 → 该画板放大到全屏视图。
- **退出聚焦**:再次点击或按返回。
- **整体滚动**:`overscroll-behavior: none`(防止浏览器回弹),`html, body` 高度 100%。

### 5.2 屏内导航(自定义路由)

桌面屏幕通过 `onNav(target)` 触发跳转,其内部调用 `setFocusToSlot(slotKey)`。`focus` 回调的映射表:

```
home       → flow/01-home
write      → flow/02-write
matching   → flow/03-matching
echoes     → flow/04-echoes
dialogue   → flow/05-dialogue
cards      → flow/06-cards
roundtable → viz/v3-roundtable   ← 从主流程跳到可视化探索的彩蛋
```

实现方式:

```js
function setFocusToSlot(slotKey) {
  const slot = document.querySelector(`[data-dc-slot="${slotKey}"]`);
  if (!slot) return;
  const btn = slot.querySelector('.dc-expand');
  if (btn) btn.click();
}
```

即"路由"复用了画板自带的展开按钮——无需独立的路由库,所有导航都映射回"聚焦那块画板"。

移动端有独立的 `focusM` 路由,键名同上但前缀为 `mobile/`,避免桌面与手机在跳转时互相干扰。

### 5.3 主题面板

- 三组单选/色卡,改动立即触发 `useEffect` 调用 `applyTweaks`。
- 主题变化反映到所有屏幕(包括 iPhone 外壳内部),因为颜色都通过 CSS 变量传递。
- 切换 mood 时,`document.body.background` 也同步切换,画布的"留白"区域与画板内部纸色融为一体。

### 5.4 渲染挂载

```js
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.Fragment>
    <App />
    <TweaksController />
  </React.Fragment>
);
```

`App` 与 `TweaksController` 是平级:面板渲染在画布之外的固定层,缩放画布不会影响面板自身的位置或字号。

---

## 六、设计意图小结

1. **画布即作品集**:把三种使用场景(桌面流程、手机端、可视化探索)一次铺开,审视者可一眼看到产品的全貌,也可下钻聚焦任一画板。
2. **点击即旅程**:屏幕内的真实按钮直接驱动跳转,所以原型同时是"流程图"和"可走的演示"。
3. **主题不是装饰是叙事**:Mood / Accent / Texture 三个旋钮让审视者实时感受"白天 vs 夜读 vs 晨白"对这款写作产品语气的影响——验证视觉语言的弹性。
4. **古意与现代框架**:朱砂、苍青、古纸、墨年轮——这些 token 名都在为产品定下"东方书写仪式"的基调,但底层是当代 React + CSS 变量,任何主题切换都是数据驱动的。
