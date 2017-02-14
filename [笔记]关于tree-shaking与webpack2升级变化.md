# [笔记]关于tree-shaking与webpack2升级变化


## 什么是Tree-shaking？

![Tree-shaking](http://www.jamesbannerman.com/images/shake_tree.gif)

Tree-shaking算不上一个技术术语，但是却很形象，当我们晃动一棵树的时候，就伴随树上不稳固的叶子果实落下来。这就是它的目标：在JS中页面模块之间会有很多相互之间的引用，此时模块之间的关系会是一个树形结构（从页面JS执行入口文件为根节点；当然不排除网状结构），这里面的模块，小到一个模块内部导出的各个变量函数，大到引用了模块却并未使用；

那么这么多模块的存在，有一些是一定不会执行到的代码，将这段代码排除在压缩合并之外，一定是可以减轻脚本的体积。

实际上，Tree-shaking是来源于另外一个打包工具Rollup的一个特性（[Github地址](https://github.com/rollup/rollup)），作者是Rich Harris。这个特性利用了ES6模块语法的静态结构（static structure）特点做到对模块依赖的分析，脚本压缩期间配合Uglify.JS来完成对无使用代码的剔除。


## 示例代码

在本代码库的[webpack2-treeshaking示例](https://github.com/diydyq/sharenotes/tree/master/demo/webpack2-treeshaking)中，展示了对声明export ...方式和export default的方式的使用说明；

在src/demo-mine的JSDoc描述中，说明了如何用webpack2跑起来；


## Tree-shaking的优势

1. 减少一个模块中无使用export代码的依赖，并减小体积（如：模块module1.js export A,B两个函数，仅使用其中一个）
2. 减少对多个未使用模块的引用（如：页面脚本引用了module1, module2, module3的三个模块，却仅使用其中的module3，剩余两个都未曾使用）
3. 在减少直接依赖的同时，减少间接依赖
4. 由于减少了依赖，模块代码会变少，方便多个模块之间进行合并；这是在探索ES6一书中所讲述的优势，详见：[章节16.8.2.2](https://github.com/diydyq/sharenotes/blob/master/%5B%E7%BF%BB%E8%AF%91%5D%E6%8E%A2%E7%B4%A2ES6%20-%20%E7%AC%AC16%E7%AB%A0%20%E6%A8%A1%E5%9D%97.md)


## Tree-shaking的其它说明

1. Tree-shaking当前是依赖于Uglify.js此类的代码压缩工具的；其实是两步骤：1. webpack发现unused export；2. uglify.js剔除未使用代码；
2. 当前尚未看到对ES6模块声明中对export default为字典对象（即：{}）的支持；
3. 由于原理本身是借助了ES6模块的静态结构的特点，所以这要求被依赖的模块/类库采用这种语法来导出，而不是现在常用的CommonJS规范；我想这也是许多同学觉得Tree-shaking夸大的原因之一吧。
4. ES6模块的静态结构之后的新规范：动态结构的介绍，挺有意义的，详见[这里](http://www.2ality.com/2017/01/import-operator.html)


## 排疑

- import('util')引入类库匹配错误，webpack2所找到的不是：私服node_moudles/@nfe/util类库时，而是node_moudles/util；尽管webpack.config.js中resolve.modules顺序正确，参见[这里](https://github.com/webpack/webpack/issues/4083)解决问题。
- Tree-shaking无效原因之一：没有禁用babel的modules转换模块，导致babel将modules转换为CommonJS规范；在.babelrc中声明 modules: false，详见[官网](http://babeljs.io/docs/plugins/#modules)


## 参考资料

- [Rollup官网](https://github.com/rollup/rollup)
- [Dr. Axel Rauschmayer博士对Tree-shaking的分享](http://www.2ality.com/2015/12/webpack-tree-shaking.html)
- [另一个作者讲述Tree-shaking的由来](https://blog.engineyard.com/2016/tree-shaking)
- [Roolup的web在线demo](http://rollupjs.org/)
- [国内一位同学对Tree-shaking的实验](http://imweb.io/topic/58666d57b3ce6d8e3f9f99b0)
- [ES6模块的静态结构之后的新规范：动态结构的介绍]()
