Function.prototype._bind = function(obj) {
	var preThis = this;
	var newFunction = function() {
		return preThis.apply(obj, arguments); //注意arguments已经不被提倡使用了。
	};
	return newFunction;
};

const obj = {
	name: 'neyio',
	getName: function() {
		return this.name;
	}
};
const obj2 = { name: 'foobar' };
console.log(obj.getName._bind(obj2)()); //foobar

Function.prototype._call = function(...args) {
	const preThis = this;
	const [ obj, ...rest ] = args;
	var newFunction = function() {
		return preThis.call(obj, ...rest); //注意arguments已经不被提倡使用了。
	};
	return newFunction();
};

const obj3 = {
	name: 'neyio',
	getName: function(suffix) {
		return this.name + suffix;
	}
};
console.log(obj3.getName._call(obj2, 'neyio')); //foobarneyio

Function.prototype._apply = function(obj, args) {
	obj = obj || window;
	const symbol = Symbol('function');
	obj[symbol] = this;
	const result = obj[symbol](args);
	delete obj[symbol];
	return result;
};

console.log(obj3.getName._apply(obj2, [ 'neyio' ]));
