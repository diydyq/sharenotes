# [笔记]前端工程师眼里的Gradle

最近团队在做一个类似于Weex的项目，基于Android SDK层面使用了Gradle构建工具，为了熟悉整个前端与Native的生命周期与交互，因此来认识一下Gradle，本文不求准确，能够读懂脚本大概即可。

## Gradle是工具？类库？还是框架？

站在第三方使用者的角度上，我这么认为：

* 工具：在工程化方面加快软件的研发速度，并不会对软件代码的组织方式带来改变，如：需求收集工具Axure、项目打包工具Grunt/Webpack、JS混淆工具UglifyJS
* 类库：如果在软件代码中使用，类库是一系列Util函数的集合，函数属于一等(类)公民，很多类放一起组成类库，它是对代码组织的抽象
* 框架：如果在软件代码中使用，框架是围绕解决某类复杂的系统型问题而产生的，解决这类问题往往需要对常用功能（如：页面更新，模板渲染）进行高度抽象（如：数据驱动，模板编译），应用多种设计模式，减少业务代码的量，进而提升开发效率，因此也往往对框架本身带来学习成本


## 有了Ant, Maven为什么还需要Gradle

Ant缺点之一是缺乏对依赖jar包的维护和管理，项目对依赖jar的升级不仅仅配置那么简单；Maven设立了统一的公共仓库，同时公司内部还可以搭建Nexus私服来加快下载与发布包的速度，另外Maven引入了项目构建的生命周期概念，例如编译一个项目，会包括：compileSrc, copyResource，test，publish等顺序的步骤。

然而采用XML方式来声明顺序固然可行，但是想做些AOP或者If-Else之类的工作就相对难多了，并且还需要依赖Ant具备此类Task的API。因此采用XML方式来声明项目构建的过程可能并不理想，所以引入Gradle工具，增加了Groovy脚本语言来作为支撑。

如果以前端工作来理解，就是：Ant，Maven，Gradle相当于：Grunt|Gulp，Webpack，NPM Script；Grunt|Gulp流式处理好，但缺乏工程化思想，因此Webpack在Loader, Plugin方面做的封装就好很多，方便定制与AOP，然而假设我们在项目构建后，需要做打包发布等复杂流程的时候，有的人就是用Grunt|Gulp来做，有的使用NPM Script来做，我推荐后者。


## Gradle怎么快速掌握





## 参考资料

1. [Gradle构建工具官网](https://gradle.org/)
2. [Apache Groovy语言官网](http://www.groovy-lang.org/index.html)

