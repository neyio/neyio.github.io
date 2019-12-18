function createObject(name, age) {
	const o = new Object();
	o.name = name;
	o.age = age;
	return o;
}
const obj = createObject('neyio', 18);
console.log(obj); // {name:'neyio',age:18}

const Person = function(name, age) {
	this.name = name;
	this.age = age;
};
const person = Object.create(Person.prototype);
Person.call(person, 'neyio', 18);
console.log(person); // { name:'neyio', age:18 }
// 等价于
const person2 = new Person('neyio', 18);
console.log(person2); // { name:'neyio', age:18 } person3 instanceof Person true
// 等价于
const person3 = Object.create({});
Person.call(person3, 'neyio', 18);
console.log(person3); // { name:'neyio', age:18 } person3 instanceof Person false
Object.setPrototypeOf(person3, Person.prototype);
console.log(person3); // { name:'neyio', age:18 } person3 instanceof Person true
