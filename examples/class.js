class Square extends Polygon {
	constructor(length) {
		// 在这里, 它调用了父类的构造函数, 并将 lengths 提供给 Polygon 的"width"和"height"
		super(length, length);
		// 注意: 在派生类中, 必须先调用 super() 才能使用 "this"。
		// 忽略这个，将会导致一个引用错误。
		this.name = 'Square';
	}
	get area() {
		return this.height * this.width;
	}
	set area(value) {
		// 注意：不可使用 this.area = value
		// 否则会导致循环call setter方法导致爆栈
		this._area = value;
	}
}

// ----

class Polygon {
	constructor() {
		this.name = 'Polygon';
	}
}

class Square extends Polygon {
	constructor() {
		super();
	}
}

class Rectangle {}

Object.setPrototypeOf(Square.prototype, Rectangle.prototype); //这里，Square类的原型被改变，但是在正在创建一个新的正方形实例时，仍然调用前一个基类Polygon的构造函数。

console.log(Object.getPrototypeOf(Square.prototype) === Polygon.prototype); //false
console.log(Object.getPrototypeOf(Square.prototype) === Rectangle.prototype); //true

let newInstance = new Square();
console.log(newInstance.name); //Polygon

// 静态方法

class Tripple {
	static tripple(n = 1) {
		return n * 3;
	}
}

class BiggerTripple extends Tripple {
	static tripple(n) {
		return super.tripple(n) * super.tripple(n);
	}
}

console.log(Tripple.tripple()); // 3
console.log(Tripple.tripple(6)); // 18

let tp = new Tripple();

console.log(BiggerTripple.tripple(3)); // 81（不会受父类实例化的影响）
console.log(tp.tripple()); // 'tp.tripple 不是一个函数'.
