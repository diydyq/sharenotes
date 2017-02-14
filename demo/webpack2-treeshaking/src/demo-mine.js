/**
 * @file 测试文件
 * @desc npm run server不带压缩；npm run server2带压缩；通过http://localhost:8527/index.bundle查看脚本打包
 *
 */

// 1. 支持：export named function
import { test1 } from './demo-mine/export-function-test.js';

console.info('import: ', test1);

// 2. 支持：export default为函数
import { fnB } from './demo-mine/export-default-function-index.js';

console.info('import: ', fnB);

// 3. 不支持：export default为字典对象{}
import objTest from './demo-mine/export-default-object-test.js';

console.info('import: ', objTest.attr1);

// 4. 支持：当子模块export defalut为字典对象{}时，总入口文件为export named方式
import { b } from './demo-mine/export-default-object-index.js';

console.info('import: ', b);
