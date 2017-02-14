/**
 * @file 测试文件
 * @desc npm run server不带压缩；npm run server2带压缩；通过http://localhost:8527/my-first-webpack.bundle查看脚本打包
 *
 */

import { b } from './demo-mine/export-default-object-index.js';

console.info('import: ', b);


import { test1 } from './demo-mine/export-function-test.js';

console.info('import: ', test1);


import { fnB } from './demo-mine/export-default-function-index.js';

console.info('import: ', fnB);
