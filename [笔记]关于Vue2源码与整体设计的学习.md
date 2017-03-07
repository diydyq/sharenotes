# [笔记]关于Vue2源码与整体设计的学习


## Vue2主要分为几个部分

Vue2是在16年10月推出，优势较之前很明显，所以团队里升级很快，并且围绕Vue2源码学习做一个分享，从数据驱动框架的角度上整体分为这么几块：

1. Setter/Getter代理：UI界面层对数据的读写
2. 模板编译前置AOT（Ahead Of Time）：将组件模板编译为DOM树节点，每个节点以函数的形式体现
3. VNode的渲染：VNode与Document Element的转换
4. Virtual-DOM中新旧VNode的对比：两颗VNode树节点，如何以最优的算法，找到不同点并进行更新


## Setter/Getter

众所周知，Vue1&2里都利用了JS的Getter/Setter完成UI层中数据的读写，那不可避免的就必然会用到一个API：Object.defineProperty()，它的使用有以下这么几处：

1. vueInstance.initData()对data属性中的每条数据做代理

```
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


2. vueInstance.initComputed()对computed属性中的每条数据做代理，这里方便直接定义Getter，所以Setter为noop空函数；

	````
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


3. 对深层次下数据对象的属性代理

	````
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
	  	...
	  }
	}


4. 公用Util，如：代理数组原型方法（'push','pop','shift','unshift','splice','sort','reverse'），在数组实例修改时触发脏数据检查

	````
	function def (obj, key, val, enumerable) {
	  Object.defineProperty(obj, key, {
	    value: val,
	    enumerable: !!enumerable,
	    writable: true,
	    configurable: true
	  });
	}


5. 避免直接对vueInstance.$data和Vue.config的直接写：

	````
	// ...
	Object.defineProperty(Vue.prototype, '$data', dataDef);
	// ...
	Object.defineProperty(Vue, 'config', configDef);






## 是否有继续优化的空间








