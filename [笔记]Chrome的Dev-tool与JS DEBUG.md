# [笔记]Chrome的Dev-tool与JS DEBUG


## 当前调试NodeJS代码的工具有哪些？

1. V8-inspector [推荐]

在6.3发布之后，NodeJS集成了V8 inspector工具，这个工具允许我们使用Chrome自带的调试工具调试NodeJS程序，官方说明在[这里](https://nodejs.org/api/debugger.html)；

```
# 代码直接运行，默认开启9229端口
node --inspect test.js
# 从第一行开始调试
node --inspect-brk test.js
# 当--inspect-brk参数不支持时，使用下面
node --inspect --debug test.js
```
效果如下图：

![DEBUG效果](https://github.com/diydyq/sharenotes/blob/master/demo/static/images/Debug_CDP.png)


2. Node-inspector

这个工具其实已经被上面替代了，开源地址点击[这里](https://github.com/node-inspector/node-inspector)

想要看下如何开发inspector WEB工具的同学可以参考看下


## 关于CDP: Chrome Debugging Protocol

虽然Chrome Devtools更多的用在调试JS代码上，但实际上，Android，Go等多种语言也是可以使用它来调试的。那么Devtools就变成为一个Client，它能连接不同的程序来调试。要做到这一点，就需要抽象出一个统一的接口层，不同的语言做不同的实现。

那么这个规范就是[CDP协议](https://chromedevtools.github.io/devtools-protocol/)，它主要包括了3大版本：

1. V8 inspector：用作NodeJS的调试
2. stable版本：API不会发生变动
3. latest版本：这个API可能会频繁变动，导致break


针对Android应用的调试，目前我了解两个：

1. [Facebook的Stetho](http://facebook.github.io/stetho/)
2. [Weex的Android调试实现](https://github.com/weexteam/weex-devtools-android)：对应的FrontendServer工具是[weex-devtool](https://github.com/weexteam/weex-devtool)


## Questions

1. 我想用我机器的Devtools调试远端机器上的Chrome浏览器页面，能行不？

可以，参考[DevTools Remote](https://github.com/auchenberg/devtools-remote)

![DevTools Remote](https://remote.devtools.rocks/images/demo.gif)

2. 我想写NodeJS代码来调用CDP的API，能行不？

可以，参考[chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface/)


## 参考资料

- [CDP的三个版本API](https://chromedevtools.github.io/devtools-protocol/)
- [好玩的chrome-devtools工具](https://github.com/ChromeDevTools/awesome-chrome-devtools#chrome-devtools-protocol)


