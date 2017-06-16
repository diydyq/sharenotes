# [笔记]关于JSX语法


## 为什么想起了JSX语法的事？

这几天开发的前端框架需要支持JSX语法，所以需要调研都需要做哪些方面的工作，目前来看，过程如下：

1. 识别JSX Syntax；
2. 转换JSX语法到对应的前端框架代码
3. 生成代码

其实这几个步骤都已经有了现成的参考实现。

1. React提交[JSX规范](https://facebook.github.io/jsx/)，并解析了为什么没有使用Template Literal或者E4X规范；
2. 针对Mozilla AST的[JSX扩展语法](https://github.com/facebook/jsx/blob/master/AST.md)做了详细介绍；
3. [babylon](https://github.com/babel/babylon)是babel的核心解析器，基于**acron**和**acron-jsx**；
4. 如果你还需要扩展JSX语法，那么你可以参考下[acron-jsx](https://github.com/RReverser/acorn-jsx)，它负责对JSX语法解析为JSX AST；


## [React JSX babel转换参考: React JSX transform](https://babeljs.io/docs/plugins/transform-react-jsx/)

代码转换前：
```javascript
/** @jsx dom */

var { dom } = require("deku");

var profile = <div>
  <img src="avatar.png" className="profile" />
  <h3>{[user.firstName, user.lastName].join(' ')}</h3>
</div>;
```
代码转换后：
```javascript
/** @jsx dom */

var dom = require("deku").dom;

var profile = dom( "div", null,
  dom("img", { src: "avatar.png", className: "profile" }),
  dom("h3", null, [user.firstName, user.lastName].join(" "))
);
```

在这个babel插件的实现层面，引入解析JSX后通过访问者模式构建生成转换过程；参考文件只有两个：[plugin index.js](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-react-jsx/src/index.js)与[helper/index.js](https://github.com/babel/babel/blob/master/packages/babel-helper-builder-react-jsx/src/index.js)


## [开发Babel插件的过程](https://github.com/thejameskyle/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)

如果需要了解代码转换为AST树的样子，可参考在线地址[AST Explorer](https://astexplorer.net/#/KJ8AjD6maa)


## 参考资料

- [JSX规范草稿Draft](https://facebook.github.io/jsx/)
- [React JSX transform](https://babeljs.io/docs/plugins/transform-react-jsx/)
- [AST Explorer](https://astexplorer.net/#/KJ8AjD6maa)
- [Babel Plugins列表](https://babeljs.io/docs/plugins/)

