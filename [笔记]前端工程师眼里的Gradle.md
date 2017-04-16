# [笔记]前端工程师眼里的Gradle

最近团队在做一个类似于Weex的项目，基于Android SDK层面使用了Gradle构建工具，为了熟悉整个前端与Native的生命周期与交互，因此来认识一下Gradle，本文不求准确，能够读懂脚本大概即可。

## Gradle是工具？类库？还是框架？

站在第三方使用者的角度上，我这么认为：

* 工具：在工程化方面加快软件的研发速度，并不会对软件代码的组织方式带来改变，如：需求收集工具Axure、项目打包工具Grunt/Webpack、JS混淆工具UglifyJS
* 类库：如果在软件代码中使用，类库是一系列Util函数的集合，函数属于一等(类)公民，很多类放一起组成类库，它是对代码组织的抽象
* 框架：如果在软件代码中使用，框架是围绕解决某类复杂的系统型问题而产生的，解决这类问题往往需要对常用功能（如：页面更新，模板渲染）进行高度封装（如：数据驱动，模板编译），应用多种设计模式，以减少业务代码的量和负担，进而提升开发效率，因此也往往对框架本身带来学习成本


## 有了Ant, Maven为什么还需要Gradle

Ant缺点之一是缺乏对依赖jar包的维护和管理，项目对依赖jar的升级不仅仅配置那么简单；Maven设立了统一的公共仓库，同时公司内部还可以搭建Nexus私服来加快下载与发布包的速度，另外Maven引入了项目构建的生命周期概念，例如编译一个项目，会包括：compileSrc, copyResource，test，publish等顺序的步骤。

然而采用XML方式来声明顺序固然可行，但是想做些AOP或者If-Else之类的工作就难多了，也不利于Java程序员快速上手与调试，并且还需要依赖Ant具备此类Task的API。因此采用XML方式来声明项目构建的过程可能并不理想，所以引入Gradle工具，增加了Groovy脚本语言来作为支撑。

如果以前端工作来理解，就是：Ant，Maven，Gradle相当于：Grunt|Gulp，Webpack，NPM Script；Grunt|Gulp流式处理好，但缺乏工程化思想，因此Webpack在Loader, Plugin方面做的封装就好很多，方便定制与AOP，然而假设我们在项目构建后，需要做打包发布等复杂流程的时候，有的人就是用Grunt|Gulp来做，有的使用NPM Script来做，我推荐后者。

因此Gradle最起码应具备以下能力：

1. 脚本灵活：参数配置方便，工程化方面适应Java项目构建
2. 语法简洁：变量声明引用简单，函数定义与执行不冗余，常用类库丰富
3. 天然亲近：最好以类似于Java的结构和API来支持，上手容易
4. 保持兼容：对于以往采用Ant，Maven构建的项目保持最大程度的复用


## Gradle快速了解

快速学习Gradle分为三个部分：

1. [语法部分](http://www.groovy-lang.org/documentation.html)

由于Gradle采用了Groovy语言作为脚本，因此先必须了解很简洁的语法介绍：[代码风格：Style guide](http://www.groovy-lang.org/style-guide.html)，[语法部分：Syntax](http://www.groovy-lang.org/syntax.html)，[闭包部分：Closures](http://www.groovy-lang.org/closures.html)

2. 工程部分

在命令行执行`gradle init`会产生如下几个文件：

- `文件build.gradle`是要执行的脚本；
- `目录gradle`通常用来盛放gradlew（Gradle Wrapper）的内容，执行`文件gradlew|gradlew.bat`即可完成Gradle的版本下载、方便管理；
- `目录.gradle`盛放一些中间产出taskArtifacts
- `文件settings.properties`放置子项目subprojects的一些项目组成信息

在命令行执行`gradle -q taskName`就是开始进行某个任务的构建工作。查看这个[Build Script Basics](https://docs.gradle.org/3.5/userguide/tutorial_using_tasks.html)可以获取`project与task`两个概念，查看[DSL: Project](https://docs.gradle.org/3.5/dsl/org.gradle.api.Project.html)可以深入了解Project类的组成。


3. 插件部分

构建一个项目，可以是Java项目产出jar包，也可以是Web项目产出War包，或者Android项目拥有不同的声明周期，需要采用不同的插件。所以了解这个插件来决定是否满足做一些AOP或者条件判断的任务。如：[Java插件相关](https://docs.gradle.org/3.5/userguide/tutorial_java_projects.html)


## 参考资料

1. [Gradle构建工具官网](https://gradle.org/)
2. [Apache Groovy语言官网](http://www.groovy-lang.org/index.html)
3. [动态语言Groovy与静态语言Java](https://www.zhihu.com/question/19918532)

