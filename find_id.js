/**
 * Copyright (c) 2026 水谷知隆
 * Released under the MIT License.
 */
fetch('https://drive.google.com/drive/folders/1dRwaOUqBeVuRD3HtueVlAAa6ebn2RYr4?usp=sharing').then(r=>r.text()).then(h=>{ const re = /1[A-Za-z0-9_-]{32}/g; let m; while(m=re.exec(h)){ console.log(m[0], h.substring(m.index, m.index+50).replace(/\n/g,'')); } })
