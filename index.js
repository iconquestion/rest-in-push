const express = require("express");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
require("dotenv").config()

const app = express();

const { cleanEnv, str, num, bool } = require("envalid")

const env = cleanEnv(process.env, {
    PORT: num(),
    DEBUG: bool()
})

console.log(env.PORT)
console.log(env.DEBUG)

// ===== logger =====
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "app.log" })
    ]
});

// ===== helpers =====
function loadData(data_path) {
    const filePath = path.join(__dirname, data_path);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
}

function pickRandomItems(arr, count = 3) {
    if (!Array.isArray(arr)) return [];

    const copied = [...arr];

    // Fisher–Yates shuffle
    for (let i = copied.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copied[i], copied[j]] = [copied[j], copied[i]];
    }

    return copied.slice(0, count);
}

// ===== middleware =====
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// ===== routes =====

// 健康检查
app.get("/status", (req, res) => {
    res.json({
        message: "ok"
    });
});

// 简单生成一个组合结果
app.get("/generate", (req, res) => {
    try {
        const what_you_have_done = pickRandomItems(loadData("data/what_you_have_done.json"), 3);
        const death_reasons = pickRandomItems(loadData("data/death_reasons.json"), 1);
        const reviews_from_others = pickRandomItems(loadData("data/reviews_from_others.json"), 3);

        res.json({
            message: "ok",
            data: {
                what_you_have_done: what_you_have_done,
                death_reasons: death_reasons,
                reviews_from_others: reviews_from_others
            }
        });
    } catch (error) {
        logger.error(`GET /generate failed: ${error.message}`);
        res.status(500).json({
            message: "Error generating data",
            data: env.DEBUG ? error.message : undefined
        });
    }
});

// 404
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// ===== start =====
app.listen(env.PORT, () => {
    logger.info(`Server running at http://localhost:${env.PORT}`);
});