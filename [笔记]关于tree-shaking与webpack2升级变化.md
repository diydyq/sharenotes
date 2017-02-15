# [笔记]关于tree-shaking与webpack2升级变化


## 什么是Tree-shaking？

![Tree-shaking](http://www.jamesbannerman.com/images/shake_tree.gif)

Tree-shaking算不上一个技术术语，但是却很形象，当我们晃动一棵树的时候，就伴随树上不稳固的叶子果实落下来。

这就是它的目标：在JS中页面的多个模块之间会有很多相互引用，此时模块之间的关系会是一个树形结构（以页面JS执行入口模块为根节点；当然不排除网状结构），这里面的模块引用，小到一个模块内部导出的各个变量函数，大到引用了模块却并未使用；那么这么多模块的存在，有一些是一定不会执行到的代码，**将这些不会执行的代码排除在压缩合并之外，就是一种优化方案，如：可以减轻浏览器加载JS脚本的体积**。

实际上，Tree-shaking是来源于另外一个打包工具Rollup的一个特性（[Github地址](https://github.com/rollup/rollup)），作者是Rich Harris。这个特性利用了ES6模块语法的静态结构（static structure）特点做到对模块依赖的分析，脚本压缩期间配合Uglify.JS来完成对无使用代码的剔除。


## 示例代码

在本代码库的[webpack2-treeshaking示例](https://github.com/diydyq/sharenotes/tree/master/demo/webpack2-treeshaking)中，展示了对声明export ...方式和export default的方式的使用说明；

在src/demo-mine的JSDoc描述中，说明了如何用webpack2跑起来；


## Tree-shaking的优势

1. 减少对一个模块中无export代码引用的依赖，并减小该模块体积（如：模块module1.js export A,B两个函数，业务代码仅使用其中一个）
2. 减少对多个未使用模块的引用（如：页面脚本引用了module1, module2, module3的三个模块，却仅使用其中的module3，剩余两个都未曾使用）
3. 在减少直接依赖的同时，减少间接依赖
4. 由于减少了依赖，模块代码会变少，方便多个模块之间进行合并；这是在<<探索ES6>>一书中所讲述的优势，详见：[章节16.8.2.2](https://github.com/diydyq/sharenotes/blob/master/%5B%E7%BF%BB%E8%AF%91%5D%E6%8E%A2%E7%B4%A2ES6%20-%20%E7%AC%AC16%E7%AB%A0%20%E6%A8%A1%E5%9D%97.md)


## Tree-shaking的其它说明

1. Tree-shaking需要依赖于Uglify.js此类的代码压缩工具；其实是两步骤：1. webpack2发现unused export；2. uglify.js压缩式删除unused export代码；
2. 当前尚未看到对ES6模块声明中对export default为字典对象（即：{}）的支持；
3. 由于原理本身是借助了ES6模块的静态结构的特点，所以这要求被依赖的模块/类库采用这种语法来export模块，而不是现在常用的CommonJS规范；我想这也是许多同学觉得Tree-shaking夸大的原因之一吧。
4. ES6模块在推出静态结构之后，建立新规范：动态结构的介绍，挺有意义的，详见[这里](http://www.2ality.com/2017/01/import-operator.html)


## 与DCE（Dead Code Elimination）的关系

为了讲述由来与区分两者，作者Rich Harris专门写了一篇[文章](https://medium.com/@Rich_Harris/tree-shaking-versus-dead-code-elimination-d3765df85c80#.a9h8v572v)；[DCE](https://en.wikipedia.org/wiki/Dead_code_elimination)是一个技术术语，用于编译器优化，在各个语言中都很通用。

在我看来，Tree-shaking是DCE中的一种解决模块依赖的优化技术，所以属于DCE；作者本意可能并不是区别于DCE，而是想指出这是DCE的一种新型途径，并以此通过Rollup做了实现。


## 排疑

- import('util')引入类库匹配错误，尽管webpack.config.js中resolve.modules顺序正确（先node_modules/@nfe，后node_modules），但webpack2查找所需类库并不是想要的私服node_moudles/@nfe/util时，而是node_moudles/util，这是NodeJS的一个npm库；参见[这里](https://github.com/webpack/webpack/issues/4083)解决问题，在webpack.config.js中声明对node.util的不引用。
- Tree-shaking无效原因之一：没有禁用babel的modules转换模块，导致babel将modules转换为CommonJS规范；在.babelrc中声明 modules: false，详见[官网](http://babeljs.io/docs/plugins/#modules)


## 参考资料

- [Rollup官网](https://github.com/rollup/rollup)
- [Roolup的web在线demo](http://rollupjs.org/)
- [Dr. Axel Rauschmayer博士对Tree-shaking的分享](http://www.2ality.com/2015/12/webpack-tree-shaking.html)
- [作者Rich Harris对Tree-shaking与DCE的解释](https://medium.com/@Rich_Harris/tree-shaking-versus-dead-code-elimination-d3765df85c80#.45bhexvkq)
- [另一个作者讲述Tree-shaking的由来](https://blog.engineyard.com/2016/tree-shaking)
- [国内一位同学对Tree-shaking的实验](http://imweb.io/topic/58666d57b3ce6d8e3f9f99b0)
- [ES6模块的静态结构之后的新规范：动态结构的介绍](https://github.com/diydyq/sharenotes/blob/master/%5B%E7%BF%BB%E8%AF%91%5D%E6%8E%A2%E7%B4%A2ES6%20-%20%E7%AC%AC16%E7%AB%A0%20%E6%A8%A1%E5%9D%97.md)


