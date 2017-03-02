#[积累]常见知识点的汇总

1. CSRF

CSRF（Cross-Site Request Forgery）跨站请求伪造，是利用受害者Bob在登录某些受信网站的前提（浏览器保存了对应合法cookie身份验证信息）下，以点击图片或者访问危险网站页面等的形式，来间接获取Cookie等身份信息，从而完成危险操作，如：转账，删除，更新。

前置条件：

1.1 浏览器保存了受信网站的对应合法cookie身份验证信息
1.2 访问存在CSRF漏洞的网站

预防：

1.1 受信网站对Cookie设置过期时间，避免有效Cookie长时间保存；
1.2 站内的重要操作采用POST方式请求，避免GET直接访问；
1.3 POST请求设置随机码，配合Server端做加密解密校验；


2. XSS

XSS（Cross Site Scripting）跨站脚本攻击，通过将页面渲染中的文本内容替换为攻击脚本，完成对其它信息的获取和诱导操作。最常见的存储型XSS，比如：渲染文本改为<script type="">XXX</script>以达到目的。

常见的预防方法：

2.1 利用HTML5中的MutationObserver类，监听DOMNodeInserted事件；
2.2 src属性拦截，采用DOMAttrModified之类的事件，但是需要Node节点插入才可行；
2.3 覆盖原型链上的src方法，调用__defineSetter__；有兼容性问题；
2.4 在创建script节点的上添加src方法，完成覆盖；因此代理document.createElement()方法；


3. CSP

CSP（Content Security Policy）内容安全策略，是W3的一项规范，当前[最新级别是Level3，Draft状态，发布于2016年9月](https://www.w3.org/TR/CSP3/)。通过不同粒度的配置来设置页面对潜在风险行为（跨站加载JS，执行inlie脚本等）的控制。

CSP目标旨在以下几件事：

3.1 减小内容注入的风险
3.1.1 请求，嵌入，或者执行某个域的内容资源：Document或者Workder
3.1.2 执行内联脚本
3.1.3 编译并执行代码，如：eval()等
3.1.4 内联样式

3.2 减小在恶意环境中嵌入受信网站资源的风险（如：["Pixel Perfect" Attact](https://www.w3.org/TR/CSP3/#biblio-timing)）
3.3 提供策略框架允许开发人员减少对网站的开放权限


使用CSP的格式，遵循这里的[ABNF语法定义](https://www.w3.org/TR/CSP3/#framework-directives)，语法结构为：

    serialized-directive = directive-name [ RWS directive-value ]
    directive-name       = 1*( ALPHA / DIGIT / "-" )
    directive-value      = *( %x09 / %x20-%x2B / %x2D-%x3A / %x3C-%7E )
                           ; Directive values may contain whitespace and VCHAR characters,
                           ; excluding ";" and ","
                           ; RWS means Required Whitespace
                           
    如：Content-Security-Policy: default-src 'self'; img-src 'self' data:; media-src mediastream:
                           

directive-name指令的可选值有：

3.4.1 child-src：管理创建内嵌上下文的方式，如：iframe插入document；serviceworker，sharedworker，worder之类的后台上下文；
3.4.2 connect-src：管理涉及API请求的方式，如：Fetch, XHR，WebSocket，EventSource，navigator.sendBeacon；
3.4.3 default-src：除特殊指定外的默认策略
3.4.4 其它常见的请求：font-src，frame-src，img-src，manifest-src，media-src，object-src，script-src，style-src，workder-src，form-action，frame-ancestors，report-uri等


directive-value也遵循ABNF语法，Source list大概分为以下几类：

3.5.1 关键字 "none" "self" "unsafe-inline" "unsafe-eval"等
3.5.2 特定场合：nonce-source，base64-value
3.5.3 scheme或者host约束


CSP的设置可以以两种方式：1) 通过HTTP Response Header设置; 2) 通过HTML的meta标签设置；

两类CSP类型：Content-Security-Policy 和 Content-Security-Policy-Report-Only，前者浏览器会做强制检查，后者浏览器不强制，可以将其report-to到指定的Server；



# 参考资料

- [CSRF博客](http://www.cnblogs.com/hyddd/archive/2009/04/09/1432744.html)
- [XSS预防](http://netsecurity.51cto.com/art/201406/443349.htm)
- [W3 CSP规范](https://www.w3.org/TR/CSP3/#framework-directives)
- [CSP策略及绕过方法](http://www.jianshu.com/p/4e8aff7f7de4)