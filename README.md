# 战术库 · Ultimate Playbook 🥏

队内飞盘战术库。手机上看战术动画，随手改，队友实时同步。

线上地址：https://ulti-drill.vercel.app/

## 能干什么

- **战术库**：按「战术 / 站位 / 训练 Drill」分类，支持搜索名称、标签、说明。卡片带缩略图，扫一眼就知道是哪套。
- **看战术**（手机优先）：竖屏自动把球场旋转成进攻朝上、铺满屏幕；自动聚焦到战术实际用到的区域；逐帧播放带跑动轨迹箭头；每帧可写要点笔记。
- **改战术**：手机和电脑都能拖球员摆位。加帧、删帧、调上场人数（会同步应用到所有帧）、写说明和标签。
- **云端同步**：所有人打开同一个网址就是同一个战术库。连不上云端时自动降级到本机存储，场边没信号照样能看能改，联网后刷新同步。

## 首次部署：建一张表

云端用 Supabase。第一次需要在 Supabase 控制台 → **SQL Editor** 里跑一次
[`docs-supabase-setup.sql`](./docs-supabase-setup.sql)（App 里的提示条也能一键复制这段 SQL）。

建表前 App 不会报错，只会提示「云端还没建表」并退回本机存储。

> 注意：RLS 策略是全开的 —— 拿到网址的人都能读写战术库。队内用没问题，别把链接发到公开渠道。

## 本地开发

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # 类型检查 + 打包
pnpm lint
```

Supabase 的地址和 anon key 已经写在 `src/lib/supabase.ts` 里作为默认值（anon key 本来就是公开的浏览器端凭据，安全边界靠 RLS）。
要指向别的 Supabase 项目，复制 `.env.example` 成 `.env` 覆盖即可。

## 技术栈

React 19 · TypeScript · Vite · Tailwind v4 · Konva（canvas 渲染）· Supabase REST（直接 fetch，无 SDK）

## 代码结构

```text
src/
├── data/            # Play 数据模型、云端/本地仓储、全局 store
├── lib/             # Supabase REST 客户端、hash 路由、屏幕方向
├── features/
│   ├── field/       # 球场画布：缩放旋转、球员、轨迹、播放
│   └── playbook/    # 场地标准、坐标换算、阵型/人数工具
├── screens/         # 战术库 / 播放器 / 编辑器
└── components/      # 通用 UI
```

## 坐标系

场地标准默认 WFDF：**100m × 37m**，得分区深 18m，brick 点距底线 18m。
战术数据里的 `x` / `y` 一律是**米**，原点在左侧得分区外角，与屏幕像素无关 —— 任何屏幕尺寸下都按比例还原。

一套战术的数据长这样：

```jsonc
{
  "name": "Facial",
  "category": "play",
  "description": "起手战术…",
  "tags": ["起手", "长传"],
  "frames": [
    [ { "id": "disc", "type": "disc", "x": 31.9, "y": 19.1, "label": "" },
      { "id": "offense-1", "type": "offense", "x": 30, "y": 18.5, "label": "1" } ]
  ],
  "frame_notes": ["1 号持盘，2 号在身后接应"]
}
```
