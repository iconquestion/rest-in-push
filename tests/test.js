require("dotenv").config();

const { cleanEnv, num } = require("envalid");

const env = cleanEnv(process.env, {
    PORT: num(),
});

/**
 * @author iconquestion
 * @description 打印测试结果横幅
 * @param {string} statusText 状态文本
 * @returns {void} 无返回值
 */
function print_result_banner(statusText) {
    const separator = "==============================";
    console.log(separator);
    console.log(statusText);
    console.log(separator);
}

/**
 * @author iconquestion
 * @description 调用生成接口并在控制台输出结果，用于本地快速验证。
 * @param {void} 无输入参数。
 * @returns {void} 无返回值。
 */
async function test_generate() {
    try {
        // 发起 GET 请求，获取随机生成的数据
        const response = await fetch(`http://localhost:${env.PORT}/generate`);

        let data;
        try {
            // 优先按 JSON 解析，便于提取 message 字段
            data = await response.json();
        } catch (parseError) {
            data = null;
        }

        // 仅将 200 视为通过，其他状态码都视为失败
        if (response.status !== 200) {
            const responseMessage = data && typeof data.message === "string"
                ? `, message: ${data.message}`
                : "";
            const responseData = data && Object.prototype.hasOwnProperty.call(data, "data")
                ? `, data: ${JSON.stringify(data.data)}`
                : "";
            throw new Error(`Unexpected status code: ${response.status}${responseMessage}${responseData}`);
        }

        // 仅当 message === "ok" 时视为通过
        if (!data || data.message !== "ok") {
            throw new Error(`Unexpected message: ${data?.message}`);
        }

        // 输出成功响应内容
        print_result_banner("TEST PASSED");
        console.log(data);
    } catch (error) {
        // 捕获并输出请求或解析过程中的异常
        print_result_banner("TEST FAILED");
        console.error(error);
        process.exitCode = 1;
    }
}

// 执行测试函数
test_generate();
