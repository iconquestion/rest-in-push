const express = require("express");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
require("dotenv").config();

const app = express();

const { cleanEnv, num, bool } = require("envalid");

const env = cleanEnv(process.env, {
    PORT: num(),
    DEBUG: bool()
});

const projectRootDirectory = path.resolve(__dirname, "..");
const logsDirectory = path.join(projectRootDirectory, "logs");
const dataDirectory = path.join(projectRootDirectory, "data");

if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true });
}

const infoOnlyFilter = winston.format((info) => (info.level === "info" ? info : false));
const errorOnlyFilter = winston.format((info) => (info.level === "error" ? info : false));

/**
 * @author iconquestion
 * @description 创建应用日志记录器，统一输出到控制台和日志文件。
 * @param {void} 无输入参数。
 * @returns {import("winston").Logger} Winston 日志实例。
 */
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        // 自定义日志输出格式，便于定位时间与级别
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}`;
        })
    ),
    transports: [
        // 控制台输出，便于开发时观察
        new winston.transports.Console(),
        // info 日志单独输出
        new winston.transports.File({
            filename: path.join(logsDirectory, "info.log"),
            format: winston.format.combine(
                infoOnlyFilter(),
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level.toUpperCase()}] ${message}`;
                })
            )
        }),
        // error 日志单独输出
        new winston.transports.File({
            filename: path.join(logsDirectory, "error.log"),
            format: winston.format.combine(
                errorOnlyFilter(),
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level.toUpperCase()}] ${message}`;
                })
            )
        })
    ]
});

/**
 * @author iconquestion
 * @description 从指定 JSON 文件读取并解析数据。
 * @param {string} data_file 数据目录下的文件名。
 * @returns {any} 解析后的 JSON 数据对象或数组。
 */
function loadData(data_file) {
    // 始终从项目根目录下的 data 文件夹读取
    const filePath = path.join(dataDirectory, data_file);
    // 同步读取文件，保证后续逻辑拿到完整内容
    const raw = fs.readFileSync(filePath, "utf-8");
    // 将 JSON 字符串解析为 JavaScript 数据
    return JSON.parse(raw);
}

/**
 * @author iconquestion
 * @description 从数组中随机抽取指定数量的元素。
 * @param {any[]} arr 待抽取的数据数组。
 * @param {number} [count=3] 需要抽取的元素个数。
 * @returns {any[]} 随机抽取后的新数组。
 */
function pickRandomItems(arr, count = 3) {
    // 兜底处理：非数组输入直接返回空数组
    if (!Array.isArray(arr)) return [];

    // 复制数组，避免修改原始数据
    const copied = [...arr];

    // 使用 Fisher-Yates 算法原地打乱复制数组
    for (let i = copied.length - 1; i > 0; i--) {
        // 在 [0, i] 区间内随机选取一个下标进行交换
        const j = Math.floor(Math.random() * (i + 1));
        [copied[i], copied[j]] = [copied[j], copied[i]];
    }

    // 返回打乱后前 count 个元素
    return copied.slice(0, count);
}

/**
 * @author iconquestion
 * @description 记录每次请求的方法和路径。
 * @param {import("express").Request} req Express 请求对象。
 * @param {import("express").Response} res Express 响应对象。
 * @param {import("express").NextFunction} next Express 中间件放行函数。
 * @returns {void} 无返回值。
 */
app.use((req, res, next) => {
    // 输出本次请求信息到日志
    logger.info(`${req.method} ${req.url}`);
    // 交给下一个中间件或路由处理
    next();
});

/**
 * @author iconquestion
 * @description 健康检查接口，确认服务是否正常运行。
 * @param {import("express").Request} req Express 请求对象。
 * @param {import("express").Response} res Express 响应对象。
 * @returns {void} 无返回值。
 */
app.get("/status", (req, res) => {
    // 返回固定成功消息
    res.json({
        message: "ok"
    });
});

/**
 * @author iconquestion
 * @description 随机组合数据并返回生成结果。
 * @param {import("express").Request} req Express 请求对象。
 * @param {import("express").Response} res Express 响应对象。
 * @returns {void} 无返回值。
 */
app.get("/generate", (req, res) => {
    try {
        // 分别从三个数据源中随机抽样
        const what_you_have_done = pickRandomItems(loadData("what_you_have_done.json"), 3);
        const death_reasons = pickRandomItems(loadData("death_reasons.json"), 1);
        const reviews_from_others = pickRandomItems(loadData("reviews_from_others.json"), 3);

        // 统一返回生成后的结构化数据
        res.json({
            message: "ok",
            data: {
                what_you_have_done: what_you_have_done,
                death_reasons: death_reasons,
                reviews_from_others: reviews_from_others
            }
        });
    } catch (error) {
        // 记录异常信息，便于定位问题
        logger.error(`GET /generate failed: ${error.message}`);
        // DEBUG 模式返回具体错误，生产模式隐藏细节
        res.status(500).json({
            message: "Error generating data",
            data: env.DEBUG ? error.message : undefined
        });
    }
});

/**
 * @author iconquestion
 * @description 兜底处理未匹配的路由请求。
 * @param {import("express").Request} req Express 请求对象。
 * @param {import("express").Response} res Express 响应对象。
 * @returns {void} 无返回值。
 */
app.use((req, res) => {
    // 返回标准 404 响应
    res.status(404).json({
        message: "Route not found"
    });
});

/**
 * @author iconquestion
 * @description 启动 HTTP 服务并输出启动日志。
 * @param {void} 无输入参数。
 * @returns {void} 无返回值。
 */
app.listen(env.PORT, () => {
    // 提示服务监听地址
    logger.info(`Server running at http://localhost:${env.PORT}`);
});
