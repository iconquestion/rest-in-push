# 程序员墓志铭生成器 (Programmer Epitaph Generator)

一个带有黑色幽默风格的小网站：
点击按钮，随机生成一组“程序员墓志铭”。

生成内容包括：

* **你做过的事**
* **死亡原因**
* **他人评价**

所有文案均来自本地 JSON 数据，通过 Node.js + Express 随机组合生成。

---

# 在线效果

点击 **生成墓志铭** 按钮即可随机生成一组结果。

示例：

```
你做过的事
- 打开过 423 次 VSCode
- 推送过 87 次代码
- 准备提交最后一次 commit

死亡原因
- 最后一次提交

他人评价
- 喜欢研究新框架
- 写过很多草稿代码
- 打开 IDE 的次数远超写代码次数
```

---

# 项目结构

```
REST-IN-PUSH
│
├─ data/                   # 数据源
│  ├─ death_reasons.json
│  ├─ reviews_from_others.json
│  └─ what_you_have_done.json
│
├─ public/                 # 前端页面
│  └─ index.html
│
├─ src/
│  └─ server.js            # 后端服务入口
│
├─ logs/                   # 日志文件
│  ├─ info.log
│  └─ error.log
│
├─ .env                    # 环境变量
├─ package.json
├─ package-lock.json
├─ README.md
└─ LICENSE
```

---

# 技术栈

* Node.js
* Express
* Winston (日志)
* Envalid (环境变量校验)
* 原生 HTML + JavaScript

---

# 安装

克隆项目：

```bash
git clone <your-repo-url>
cd REST-IN-PUSH
```

安装依赖：

```bash
npm install
```

---

# 环境变量

创建 `.env` 文件：

```
PORT=3000
DEBUG=true
```

参数说明：

| 变量    | 说明       |
| ----- | -------- |
| PORT  | 服务端口     |
| DEBUG | 是否返回详细错误 |

---

# 启动项目

开发模式：

```bash
node src/server.js
```

或者：

```bash
npm start
```

启动后访问：

```
http://localhost:3000
```

---

# API 接口

## 健康检查

```
GET /status
```

返回：

```json
{
  "message": "ok"
}
```

---

## 生成墓志铭

```
GET /generate
```

返回：

```json
{
  "message": "ok",
  "data": {
    "what_you_have_done": [],
    "death_reasons": [],
    "reviews_from_others": []
  }
}
```

说明：

* `what_you_have_done` 随机 3 条
* `death_reasons` 随机 1 条
* `reviews_from_others` 随机 3 条

---

# 日志系统

使用 **Winston** 进行日志记录：

```
logs/info.log
logs/error.log
```

记录内容：

* HTTP 请求日志
* 错误日志
* 服务启动日志

示例：

```
2024-01-01T12:00:00.000Z [INFO] GET /generate
```

---

# 数据格式

所有生成内容来自 `data` 目录下 JSON 文件。

示例：

```json
[
  "准备提交最后一次 commit",
  "打开 IDE 又关掉",
  "打算学习新语言"
]
```

系统会随机抽取并组合生成结果。

---

# 开发说明

核心逻辑：

1. 读取 JSON 数据
2. 随机打乱数组
3. 选取指定数量元素
4. 返回 API 结果

随机算法使用 **Fisher–Yates shuffle**。

---

# License

MIT License

---

# 作者

iconquestion
