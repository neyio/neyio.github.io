const person = {
	name: 'neyio'
};

const proxy = new Proxy(person, {
	get: function(target, property) {
		if (property in target) {
			// 等价于 target.hasOwnproperty(property)
			return target[property];
		} else {
			throw new Error(`${property} does not exsist;`);
		}
	}
});

console.log(proxy.name); //neyio
// console.log(proxy.age); //Error: age does not exsist;

// ---- get方法可以继承
const person2 = Object.create(proxy);

try {
	//console.log(person2);//不要进行输出，否则会报 Cannot convert a Symbol value to a string
	console.log(person2.age); //throw error 进行catch处理
	console.log(person2.name); //继续执行 输出neyio
} catch (e) {
	console.log(e.message); // age does not exsist;
}

// ---- 拦截数组负数索引

const createArray = (...arr) => {
	const target = [ ...arr ];
	const handler = {
		get: function(target, property, receiver) {
			let index = Number(property);
			if (!Number.isInteger(index)) {
				throw new Error('');
			}
			if (index < 0) {
				index = target.length + index;
			}
			return Reflect.get(target, index, receiver);
		}
	};
	return new Proxy(target, handler);
};

const arrProxy = createArray(1, 2, 3);
console.log(arrProxy[1], arrProxy[-1]); //2 3

// ---- 实现链式调用

const actionsFns = {
	double: (x) => x * 2,
	plusOne: (x) => x + 1,
	minusOne: (x) => x - 1
};

const pipProxy = (actions = actionsFns) => {
	const fns = [];
	const handler = {
		get: function(target, property, receiver) {
			if (property !== 'get') {
				if (actions.hasOwnProperty(property)) {
					fns.push(actions[property]);
					return receiver;
				} else {
					throw new Error(`action function ${property} does not exsist!`);
				}
			} else {
				return (initial) =>
					fns.reduce((acc, current) => {
						return current(acc);
					}, initial);
			}
		}
	};
	return new Proxy(fns, handler);
};

const ans = pipProxy().plusOne.double.minusOne.get(1);
console.log(ans); //3

// ---- 生成 _DOM 树 该代码请前往 浏览器环境试验
/*
const domCreator = () => {
	const handler = {
		get: function(target, property, receiver) {
			return (attributes = {}, ...children) => {
				const el = document.createElement(property);
				Object.entries(attributes).map(([ key, value ]) => {
					el.setAttribute(key, value);
				});
				children.map((child) => {
					el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
				});
				return el;
			};
		}
	};
	return new Proxy({}, handler);
};
const _DOM = domCreator();
const domEl = _DOM.div(
	{ style: `background:#000;color:#fff;z-index:10001;` },
	_DOM.a({ href: 'http://neyio.cn' }, `neyio's site`),
	_DOM.ul(
		{},
		_DOM.li({}, '这是第一行'),
		_DOM.li({}, '这是第二行'),
		_DOM.li({}, '这是第三行'),
		_DOM.li({}, '这是第四行'),
		_DOM.h1({}, '标题')
	)
);
document.body.appendChild(domEl);
*/

// ----- set 验证数据

const Validator = () => {
	const handler = {
		set: function(target, key, value, receiver) {
			if (key === 'name' && value !== 'neyio') {
				throw new Error('name must be neyio');
			}
			target[key] = value;
		}
	};
	return new Proxy({}, handler);
};

const user = Validator();
try {
	user.name = 'neyio';
	console.log(user.name);
	user.name = 'laoqian';
} catch (e) {
	console.log(e.message); //Error: name must be neyio
}

// 如果 target 是一个 函数， 调用 proxy包裹的target会被 handler的apply捕获

const fnApply = (fn) => {
	const handler = {
		apply: function(target, ctx, args) {
			console.log(ctx && ctx.name); //此处的ctx是apply对象和call触发的，如果直接调用方法ctx为undefined
			return target(...args);
		}
	};
	return new Proxy(fn, handler);
};

const wrappedFn = fnApply((a, b) => {
	return a + b;
});

console.log(wrappedFn(1, 2)); // 3;

const fnPerson = {
	name: 'neyio'
};

const fnAns = wrappedFn.call(fnPerson, 1, 2);
console.log('TCL: fnAns', fnAns);

//construct拦截目标对象

let _proxyConstructAddress = null;

const constructProxy = new Proxy(function() {}, {
	construct: function(target, args, newTarget) {
		_proxyConstructAddress = newTarget; //等同于  constructProxy
		target = { ...args };
		target.name = 'neyio';
		return target;
	}
});
const _constructProxyDemo = new constructProxy(1, 2);
console.log(_constructProxyDemo); //{ '0': 1, '1': 2, name: 'neyio' }
console.log(_proxyConstructAddress === constructProxy); // 代理构造器的地址 true

// revocable

let target = {
	foo: 'bar'
};
let handler = {
	get: function() {
		return 'neyio';
	}
};
let { proxy: proxyRevocable, revoke } = Proxy.revocable(target, handler);
console.log('TCL: proxy.foo before', proxyRevocable.foo); //TCL: proxy.foo before neyio
revoke();
try {
	console.log('TCL: proxy.foo end', proxyRevocable.foo); // Error:revoked. 结束代理后，拒绝访问目标对象
} catch (e) {
	console.log(e.message); // Cannot perform 'get' on a proxy that has been revoked
}
