# [笔记]关于Vue2源码与整体设计的学习


## Vue2主要分为几个部分

Vue2是在16年10月推出，优势较之前很明显，所以团队里升级很快，并且围绕Vue2源码学习做了一个分享；站在数据驱动框架的角度，我把它分为6个模块：

1. `Setter/Getter代理`：UI界面层对数据的读写
2. `Dep类、Watcher类`：Vue组件与Expression表达式（如：{{ ... }}}）或者属性的依赖管理
3. `模板编译前置AOT（Ahead Of Time）`：将组件模板编译为函数化的VNode树节点
4. `Watcher类的执行与VNode更新`：从产出VNode节点与更新VNode节点
5. `Virtual-DOM中新旧VNode的对比`：两颗VNode树节点，如何以最优的算法，找到不同点并进行更新
6. `VNode到HTML的渲染`：VNode与Document Element的转换

如果用一张图来标识大概关系是这样的：

![Vue2的数据驱动](https://github.com/diydyq/sharenotes/blob/master/demo/static/images/Vue2_DataDrive.png)

下面依次介绍各个模块：

## 模块1：Setter/Getter代理

众所周知，Vue1&2里都利用了JS的Getter/Setter完成UI层中数据的读写，那不可避免的就会用到一个API：`Object.defineProperty(obj, key, { ... })`，源码中的使用有以下几处：

```javascript
// 1. vueInstance.initData()对data属性中的每条数据key做代理，将每条key定义在组件实例上
function initData (vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? data.call(vm)
    : data || {};
  if (!isPlainObject(data)) {
    data = {};
    "development" !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var i = keys.length;
  while (i--) {
    if (props && hasOwn(props, keys[i])) {
      "development" !== 'production' && warn(
        "The data property \"" + (keys[i]) + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      );
    } else {
      proxy(vm, keys[i]);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}

// 注意：这个调用仅涉及data的直接属性，直接赋值到`vm`上，`vm._data`存放了代理后的数据；深层次的setter/getter是另一个方法
function proxy (vm, key) {
  if (!isReserved(key)) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter () {
        return vm._data[key]
      },
      set: function proxySetter (val) {
        vm._data[key] = val;
      }
    });
  }
}
```

```javascript
// 2. vueInstance.initComputed()对computed属性中的每条数据做代理，注意：这里只定义了Getter，Setter为noop空函数；
function initComputed (vm, computed) {
  for (var key in computed) {
    /* istanbul ignore if */
    if ("development" !== 'production' && key in vm) {
      warn(
        "existing instance property \"" + key + "\" will be " +
        "overwritten by a computed property with the same name.",
        vm
      );
    }
    var userDef = computed[key];
    if (typeof userDef === 'function') {
      computedSharedDefinition.get = makeComputedGetter(userDef, vm);
      computedSharedDefinition.set = noop;
    } else {
      computedSharedDefinition.get = userDef.get
        ? userDef.cache !== false
          ? makeComputedGetter(userDef.get, vm)
          : bind$1(userDef.get, vm)
        : noop;
      computedSharedDefinition.set = userDef.set
        ? bind$1(userDef.set, vm)
        : noop;
    }
    Object.defineProperty(vm, key, computedSharedDefinition);
  }
}

function makeComputedGetter (getter, owner) {
  var watcher = new Watcher(owner, getter, noop, {
    lazy: true
  });
  return function computedGetter () {
    if (watcher.dirty) {
      watcher.evaluate();
    }
    if (Dep.target) {
      watcher.depend();
    }
    return watcher.value
  }
}
```

```javascript
// 3. 对属性值为obj字典对象类型的属性代理
function defineReactive$$1 (
  obj,
  key,
  val,
  customSetter
) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;

  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (Array.isArray(value)) {
          dependArray(value);
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if ("development" !== 'production' && customSetter) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  });
}
```

```javascript
// 4. 公用Util
// 4.1 如：代理数组原型方法（'push','pop','shift','unshift','splice','sort','reverse'），在数组实例修改时触发脏数据检查
// 4.2 如：为data中的对象定义key为__ob__的观察对象
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}
```

```javascript
// 5. 避免直接对vueInstance.$data和Vue.config的直接直接：
// 5.1 如：vueInstance.$data
var dataDef = {};
dataDef.get = function () {
  return this._data
};
{
  dataDef.set = function (newData) {
    warn(
      'Avoid replacing instance root $data. ' +
      'Use nested data properties instead.',
      this
    );
  };
}
Object.defineProperty(Vue.prototype, '$data', dataDef);
// 5.2 如：Vue.config
var configDef = {};
configDef.get = function () { return config; };
{
  configDef.set = function () {
    warn(
      'Do not replace the Vue.config object, set individual fields instead.'
    );
  };
}
Object.defineProperty(Vue, 'config', configDef);
```


## 模块2：Dep类、Watcher类

如上所述，UI层修改某个属性时肯定会调用setter方法，但是修改之后是如何做到更新使用方的呢？它的使用方肯定会记录下来，那么记录的是组件还是使用该属性的多个表达式呢？这里的问题主要有3点：

1. 使用该属性的组件/表达式怎么收集到的？
2. 使用该属性的组件/表达式接下来怎么更新？
3. 依赖管理是什么样子？好理解吗？

从上面`代码块：3. 对属性值为obj字典对象的属性代理`的代码中，我们可以看到：对象`obj`中的每个属性`key`原本的值`val`都会重新以`defineProperty()`的方式重新定义；同时针对每个属性`key`，都会以闭包的形式定义对应的`Dep`实例`dep`，看来属性`key`与实例`dep`是一一对应的关系。

那么在调用`getter`时通过`dep`收集使用方，`setter`时通知使用方是不是一种很好的方式呢？

确实！Vue2就是这么做的，`dep.depend();`负责收集使用方，`dep.notify();`负责通知使用方，如下面的源码片段：

```javascript
// 收集使用方
var Dep = function Dep () {
  this.id = uid$1++;
  this.subs = [];
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      // 将使用方Watcher加入dep.subs数组中
      dep.addSub(this);
    }
  }
};
```

```javascript
// 通知使用方
Dep.prototype.notify = function notify () {
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

Watcher.prototype.update = function update () {
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};
```

根据代码`dep.addSub(this);`得出使用方一定是个`Watcher`；那`Watcher`代表的是啥？看看构造函数与Watcher的调用场景才能得知：


```javascript
// 传递vue组件，deps,depIds记录组件中的属性key的使用
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options
) {
  this.vm = vm;
  vm._watchers.push(this);
  // options
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression = expOrFn.toString();
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = function () {};
      "development" !== 'production' && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get();
};

// 调用场景1：在组件挂载mount的生命周期中实例化
Vue.prototype._mount = function (
  el,
  hydrating
) {
  var vm = this;
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
  }
  callHook(vm, 'beforeMount');
  vm._watcher = new Watcher(vm, function () {
    vm._update(vm._render(), hydrating);
  }, noop);
  hydrating = false;
  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm
};
// 调用场景2：代理computed属性的getter自定义方法，dirty后重新执行
function makeComputedGetter (getter, owner) {
  var watcher = new Watcher(owner, getter, noop, {
    lazy: true
  });
  return function computedGetter () {
    if (watcher.dirty) {
      watcher.evaluate();
    }
    if (Dep.target) {
      watcher.depend();
    }
    return watcher.value
  }
}
// 调用场景3：在watch属性中的使用
Vue.prototype.$watch = function (
  expOrFn,
  cb,
  options
) {
  var vm = this;
  options = options || {};
  options.user = true;
  var watcher = new Watcher(vm, expOrFn, cb, options);
  if (options.immediate) {
    cb.call(vm, watcher.value);
  }
  return function unwatchFn () {
    watcher.teardown();
  }
};

```

可以看出，`Watcher`就是一个监听器，属性`deps, depIds`记录了每一个要监听的对象，即：监听`dep实例`，当属性key修改导致setter被调用时，就会触发监听器的更新。那么更新的内容都包括哪些呢？很明显就是调用`new Watcher()`的地方了，即向构造函数传递`expOrFn`的参数；代码中显示了3处：

1. 当Vue组件渲染更新时，包括首次挂载时，随后模板`render`、`update`
2. 当computed中某个属性key的`getter`函数声明中的某个变量更新时，触发该`getter`函数的重新执行
3. 同理`watch`属性；

所以，`Dep类`代表了组件属性`key`的使用方收集，`Watcher类`代表了监听对象收集，前者面向属性，后者面向组件，相互关联，配合使用。并且属性key的使用方记录是：组件级别，而不是表达式级别。

注：代码中`Dep`应该代表`Dependency`，我没有直接翻译为`依赖`，而是`使用方收集`，请留意。


### 深入探索

想要继续深入探索的同学，可以考虑下这几个地方的实现：

1. Observe类的作用？为什么只在对象上才有，字面量值没有呢？
2. 父组件给子组件通过prop属性传递的对象，是直接使用了父的对象还是子对象？
3. Vue2推荐避免直接修改父组件传递的对象，是出于设计模式的角度出发，


## 模块3：模板编译前置AOT（Ahead Of Time）

在JS打包合并时，将组件的模板HTML字符串转换为DOM片段，可以带来两点性能优势：

1. 避免浏览器运行时编译模板的性能损耗；
2. 避免Vue脚本中携带编译模板的DOM解析引擎代码，减小体积；
3. 避免HTML字符串出现在脚本中，取而代之的是编译后的函数化模板；（因为体积基本没有减小，反而还会因为`_c,_m,{},[]`等标识而增加一点）

Vue2在DOM片段转换后，进而转换为可以执行的函数，[查看官网介绍](https://cn.vuejs.org/v2/guide/render-function.html#模板编译)，好处如下：

1. 避免JSON化的DOM树节点携带meta信息，如：某节点是空节点、文本节点、还是元素节点等；
2. 函数区分为：render、staticRenderFns；后者标识该节点及其子节点为纯HTML，在组件渲染时直接取之前的缓存即可，优化性能；

函数执行后得到的是一个VNode树根节点，它与具体的某个Vue组件形成一一对应的关系（因为`_c|createElement`定义在vm上，搜索`vm._c`得知），就像Vue组件与Vue模板。

关于详细的`解析DOM字符串、优化、生成函数`请参考[这里](https://github.com/vuejs/vue/blob/dev/src/compiler/index.js)。


## 模块4：Watcher类的执行与VNode更新

如前所述，组件首次渲染或者data属性修改时，都会触发Watcher实例的更新：`subs[i].update();`，Watcher接下来将被放入待执行队列中，待多个WatcherList优先级排序后，开始执行，如下面的代码：

```javascript
Watcher.prototype.update = function update () {
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
  	// 放入队列
    queueWatcher(this);
  }
};

function queueWatcher (watcher) {
  var id = watcher.id;
  if (has$1[id] == null) {
    has$1[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i >= 0 && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(Math.max(i, index) + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

// 1. 排序（父子组件的先后顺序）; 2. 执行watcher.run()；3. Watcher的执行就是实例化是的参数expOrFn
function flushSchedulerQueue () {
  flushing = true;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    var watcher = queue[index];
    var id = watcher.id;
    has$1[id] = null;
    watcher.run();
    ...
  }

  resetSchedulerState();
}

```

还记得否？`Vue.prototype._mount()`中的`expOrFn`主要有两个步骤（代码分别如下）：

1. vm._render()：执行组件的render()，返回VNode树节点；参见`Vue.prototype._render`中的`vnode = render.call(...)`
2. vm._update(vNode)：将最新生成的VNode与当前组件的vNode进行对比并更新，参见`Vue.prototype._render`中的`vm.__patch__(...)`

```javascript
// 组件render()的调用
Vue.prototype._render = function () {
  var vm = this;
  var ref = vm.$options;
  var render = ref.render;
  var staticRenderFns = ref.staticRenderFns;
  var _parentVnode = ref._parentVnode;

  if (vm._isMounted) {
    // clone slot nodes on re-renders
    for (var key in vm.$slots) {
    vm.$slots[key] = cloneVNodes(vm.$slots[key]);
    }
  }

  if (_parentVnode && _parentVnode.data.scopedSlots) {
    vm.$scopedSlots = _parentVnode.data.scopedSlots;
  }

  if (staticRenderFns && !vm._staticTrees) {
    vm._staticTrees = [];
  }
  // set parent vnode. this allows render functions to have access
  // to the data on the placeholder node.
  vm.$vnode = _parentVnode;
  // render self
  var vnode;
  try {
    vnode = render.call(vm._renderProxy, vm.$createElement);
  } catch (e) {
    /* istanbul ignore else */
    if (config.errorHandler) {
    config.errorHandler.call(null, e, vm);
    } else {
    if (process.env.NODE_ENV !== 'production') {
      warn(("Error when rendering " + (formatComponentName(vm)) + ":"));
    }
    throw e
    }
    // return previous vnode to prevent render error causing blank component
    vnode = vm._vnode;
  }
  // return empty vnode in case the render function errored out
  if (!(vnode instanceof VNode)) {
    if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
    warn(
      'Multiple root nodes returned from render function. Render function ' +
      'should return a single root node.',
      vm
    );
    }
    vnode = createEmptyVNode();
  }
  // set parent
  vnode.parent = _parentVnode;
  return vnode
};


// 新增与更新均使用__patch__()方法：完成新旧vnode的对比
Vue.prototype._update = function (vnode, hydrating) {
  var vm = this;
  if (vm._isMounted) {
    callHook(vm, 'beforeUpdate');
  }
  var prevEl = vm.$el;
  var prevVnode = vm._vnode;
  var prevActiveInstance = activeInstance;
  activeInstance = vm;
  vm._vnode = vnode;
  // Vue.prototype.__patch__ is injected in entry points
  // based on the rendering backend used.
  if (!prevVnode) {
    // initial render
    vm.$el = vm.__patch__(
    vm.$el, vnode, hydrating, false /* removeOnly */,
    vm.$options._parentElm,
    vm.$options._refElm
    );
  } else {
    // updates
    vm.$el = vm.__patch__(prevVnode, vnode);
  }
  activeInstance = prevActiveInstance;
  // update __vue__ reference
  if (prevEl) {
    prevEl.__vue__ = null;
  }
  if (vm.$el) {
    vm.$el.__vue__ = vm;
  }
  // if parent is an HOC, update its $el as well
  if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
    vm.$parent.$el = vm.$el;
  }
  if (vm._isMounted) {
    callHook(vm, 'updated');
  }
};
```

上面可以看出：组件的新增、更新、销毁都会调用`__patch__(oldVnode, vnode, ...)`完成VNode到HTML DOM节点的转换。新增时传递`vm.$el`，更新时传递`vm._vnode`，内部通过`nodeType`区别，前者接下来`createElm(...)`，后者接下来`patchVnode(...)`，并且在真正的DOM更新之前，已经赋值最新VNode到组件上，如代码所示：`vm._vnode = vnode;`。


```javascript
function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
  if (!vnode) {
    if (oldVnode) { invokeDestroyHook(oldVnode); }
    return
  }

  var elm, parent;
  var isInitialPatch = false;
  var insertedVnodeQueue = [];

  if (!oldVnode) {
    // empty mount (likely as component), create new root element
    // 子组件，创建时没有root挂载节点
    isInitialPatch = true;
    createElm(vnode, insertedVnodeQueue, parentElm, refElm);
  } else {
    var isRealElement = isDef(oldVnode.nodeType);
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      // patch existing root node
      // 不是Document节点，即VNode，说明是更新操作
      patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
    } else {
      if (isRealElement) {
        // mounting to a real element
        // either not server-rendered, or hydration failed.
        // create an empty node and replace it
        oldVnode = emptyNodeAt(oldVnode);
      }
      // replacing existing element
      elm = oldVnode.elm;
      parent = nodeOps.parentNode(elm);
      // 是Document节点，说明新增操作，接下来创建Element、Component等
      createElm(vnode, insertedVnodeQueue, parent, nodeOps.nextSibling(elm));

      if (parent !== null) {
        removeVnodes(parent, [oldVnode], 0, 0);
      } else if (isDef(oldVnode.tag)) {
        invokeDestroyHook(oldVnode);
      }
    }
  }

  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
  return vnode.elm
}
```


## 模块5：Virtual-DOM中新旧VNode的对比

给定新旧两个VNode的树节点，对比找出不同的地方并进行更新，是个值得关注的问题，这也是性能体现的地方，做得好直接复用，做的不好导致频繁的DOM插入删除操作。

有的同学说了，这不很简单吗？

1. 对比VNode节点本身，包括：attribute、class、style、event listener
2. 循环对比VNode的子节点，子节点的逐个对比又递归调用
3. 复杂的情况下考虑缓存

嗯，我认为这么说也确实是这么回事！不过`Talk is cheap, show me the code！`，真是的Vue2这块的实现还是和我想的有些区别，下面的两个方法：`patchVNode()`和`updateChildren()`递归调用，大家可以看下。


```javascript
// 更新vnode节点
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
  if (oldVnode === vnode) {
    return
  }
  // reuse element for static trees.
  // note we only do this if the vnode is cloned -
  // if the new node is not cloned it means the render functions have been
  // reset by the hot-reload-api and we need to do a proper re-render.
  // 如果是纯HTML标识，则不用管；
  if (vnode.isStatic &&
    oldVnode.isStatic &&
    vnode.key === oldVnode.key &&
    (vnode.isCloned || vnode.isOnce)) {
    vnode.elm = oldVnode.elm;
    vnode.child = oldVnode.child;
    return
  }
  var i;
  var data = vnode.data;
  var hasData = isDef(data);
  if (hasData && isDef(i = data.hook) && isDef(i = i.prepatch)) {
    i(oldVnode, vnode);
  }
  var elm = vnode.elm = oldVnode.elm;
  var oldCh = oldVnode.children;
  var ch = vnode.children;
  // 针对本节点的操作（不包括children）
  if (hasData && isPatchable(vnode)) {
    for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
    if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
  }
  if (isUndef(vnode.text)) {
  	// 如果新的不是文本节点
    if (isDef(oldCh) && isDef(ch)) {
      // 如果两者都存在
      if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
    } else if (isDef(ch)) {
   	  // 如果只有新的是节点，旧的不是，则：创建节点
      if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
    } else if (isDef(oldCh)) {
      // 如果只有旧的是节点，新的不是，则：删除节点
      removeVnodes(elm, oldCh, 0, oldCh.length - 1);
    } else if (isDef(oldVnode.text)) {
      // 如果只有就的文本节点，则：赋值空串
      nodeOps.setTextContent(elm, '');
    }
  } else if (oldVnode.text !== vnode.text) {
  	// 如果新旧都是文本节点，则赋值文本
    nodeOps.setTextContent(elm, vnode.text);
  }
  if (hasData) {
    if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
  }
}

function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
	var oldStartIdx = 0;
	var newStartIdx = 0;
	var oldEndIdx = oldCh.length - 1;
	var oldStartVnode = oldCh[0];
	var oldEndVnode = oldCh[oldEndIdx];
	var newEndIdx = newCh.length - 1;
	var newStartVnode = newCh[0];
	var newEndVnode = newCh[newEndIdx];
	var oldKeyToIdx, idxInOld, elmToMove, refElm;

	// removeOnly is a special flag used only by <transition-group>
	// to ensure removed elements stay in correct relative positions
	// during leaving transitions
	var canMove = !removeOnly;

	while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
	  if (isUndef(oldStartVnode)) {
	    oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
	  } else if (isUndef(oldEndVnode)) {
	    oldEndVnode = oldCh[--oldEndIdx];
	  } else if (sameVnode(oldStartVnode, newStartVnode)) {
	    patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
	    oldStartVnode = oldCh[++oldStartIdx];
	    newStartVnode = newCh[++newStartIdx];
	  } else if (sameVnode(oldEndVnode, newEndVnode)) {
	    patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
	    oldEndVnode = oldCh[--oldEndIdx];
	    newEndVnode = newCh[--newEndIdx];
	  } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
	    patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
	    canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
	    oldStartVnode = oldCh[++oldStartIdx];
	    newEndVnode = newCh[--newEndIdx];
	  } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
	    patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
	    canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
	    oldEndVnode = oldCh[--oldEndIdx];
	    newStartVnode = newCh[++newStartIdx];
	  } else {
	    if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
	    idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null;
	    if (isUndef(idxInOld)) { // New element
	      createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
	      newStartVnode = newCh[++newStartIdx];
	    } else {
	      elmToMove = oldCh[idxInOld];
	      /* istanbul ignore if */
	      if (process.env.NODE_ENV !== 'production' && !elmToMove) {
	        warn(
	          'It seems there are duplicate keys that is causing an update error. ' +
	          'Make sure each v-for item has a unique key.'
	        );
	      }
	      if (sameVnode(elmToMove, newStartVnode)) {
	        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
	        oldCh[idxInOld] = undefined;
	        canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
	        newStartVnode = newCh[++newStartIdx];
	      } else {
	        // same key but different element. treat as new element
	        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
	        newStartVnode = newCh[++newStartIdx];
	      }
	    }
	  }
	}
	if (oldStartIdx > oldEndIdx) {
	  refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
	  addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
	} else if (newStartIdx > newEndIdx) {
	  removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
	}
}
```

## 模块6：VNode到HTML的渲染

关于这一块，感觉没啥好讲的，看看下面的源码调用就可以了。

```javascript
function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
    vnode.isRootInsert = !nested; // for transition enter check
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      if (process.env.NODE_ENV !== 'production') {
        if (data && data.pre) {
          inPre++;
        }
        if (
          !inPre &&
          !vnode.ns &&
          !(config.ignoredElements.length && config.ignoredElements.indexOf(tag) > -1) &&
          config.isUnknownElement(tag)
        ) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      setScope(vnode);

      /* istanbul ignore if */
      {
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
      }

      if (process.env.NODE_ENV !== 'production' && data && data.pre) {
        inPre--;
      }
    } else if (vnode.isComment) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
}
```


## 是否有继续优化的空间








