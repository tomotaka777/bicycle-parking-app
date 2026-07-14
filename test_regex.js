/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
const html = require("fs").readFileSync("folder.html", "utf8"); const idIdx = html.indexOf("1B20hIeozG8JiRN1_sLoapJEx0gmqVICggd5xnmo1kpo", 310000); const fnIdx = html.indexOf("���ԗ\��_�ŐV", idIdx); console.log("Distance:", fnIdx - idIdx); console.log(html.substring(idIdx, fnIdx + 20));
