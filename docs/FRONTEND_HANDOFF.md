# 前端对接说明

你负责前端界面、交互和 A2A 可视化；后端、模型调用、独立 Agent 上下文、
消息路由和隔离测试由后端侧继续负责。产品主张：

**Save your attention. Leave an agent in your community.**

## 拉取与启动

建议 Node.js 24+。第一次：

```sh
git clone https://github.com/Adkid-Zephyr/commons-a2a.git
cd commons-a2a
npm ci
npm run dev
```

已有仓库时，先保存自己的改动，再更新 main：

```sh
git switch main
git pull --ff-only origin main
npm ci
```

建议在自己的前端分支工作，不要强推 main。打开 http://127.0.0.1:3402。
前端入口是 app/page.tsx、app/globals.css；独立展示页是 public/showcase/。
密钥和源数据不通过 Git 分享。新克隆只有 synthetic 数据集。

## 接口

前端使用同源相对路径，不另起一套后端。POST 使用 application/json，浏览器
会带 Origin；CLI 测试需要显式传与 Host 匹配的 Origin。

| 请求 | 用途 |
| --- | --- |
| GET /api?dataset=synthetic | 获取完整测试状态 |
| GET /api?dataset=<id>&profile=<memberId> | 获取测试成员资料 |
| POST /api?dataset=<id> | 提交下列 action |
| GET /api?dataset=<id>&view=attention&ownerId=<memberId> | 推荐作为收件箱入口：最多 5 条优先事项，默认只看 live |

**新增的 attention 接口可以直接用来做 “Only what needs you” 页面。**
返回 items、totalItems、hasMore、stats；每项有 kind、title、summary、证据、
requestId/sessionId 和可用 actions。优先显示待决策，其次失败和缺失信息，
再显示真人连接及普通更新。用原接口处理 approve/decline 等动作；
点“查看过程”再打开完整 A2A 时间线。支持 limit/offset 分页及 mode=rehearsal。
不展示其他成员的私有摘要，也不把演练结果混进默认真实模式。

创建需求：

```js
{
  action: 'request',
  request: {
    ownerId: 'maya',
    kind: 'speaker', // 或 collaborator
    title: 'Looking for an agent payments speaker',
    details: 'A practical 20-minute talk with a working demo.',
    topics: ['payments', 'agents'],
    mode: 'rehearsal', // 配好模型后用 live
    idempotencyKey: crypto.randomUUID(), // 同一操作重试时复用原 key
    authorized: true
  }
}
```

其余操作：

```js
// 创建时省略 id；完整 profile 字段见 lib/schema.mjs
{ action: 'member', id: memberId, profile }
{ action: 'approve', sessionId, ownerId, decision: 'approved' } // 或 declined
{ action: 'message', connectionId, ownerId, message: 'Hello' }
```

失败返回 HTTP 400 和 `{error}`，要显示出来。创建需求成功只代表任务被接收；
后续约每秒轮询 GET，目前没有 SSE/WebSocket。

## 展示字段

- members：Agent 节点、角色、技能、目标和证据。
- requests：需求内容、mode、status。
- sessions：ownerId、candidateId、status、approvals、summary、evidenceIds。
- events：用 id 去重，按 seq 排序，按 requestId/sessionId 筛选。
  from/to/type/message 是交流正文；reason 是简短行动依据，不是内部思维链。
  call/model/usage 是实际模型调用记录，可按需展开。
- connections：双方确认后的本地真人对话。
- datasets：可用数据集选项；不要把未提供的 organizer-replay 硬编码成可用。

重点展示谁找谁、为什么、问了什么、拒绝或澄清的原因，以及哪一步交给真人。
不能在前端编排假对话冒充真实调用；rehearsal 必须保留标识。

## 隔离边界

discord-replay 和 organizer-replay 禁止 member/approve/message；前端也要禁用。
这些是来源回放代理，不是原作者授权的分身。成员切换只是操作员测试控制，
不是正式多用户登录。不要把当前 localhost 原型直接公开部署给真实用户。

## 验证与同步

```sh
npm test
npm run build
```

每次较大更新检查后 commit + push，并记录分支和 SHA。后端接口变化同步到
COLLABORATION.md。提交前不要覆盖其他人的变更，不上传 .env.local、.data/、
private-data/、原始成员资料或真实消息截图。
