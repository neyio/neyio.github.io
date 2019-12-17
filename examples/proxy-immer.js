//尚未完成，暂时不进行实践，涉及到其他基础知识点，比如deepclone以及变动观察和合并
const proxyImmer = (obj) =>
	new Proxy(
		{ ...obj },
		{
			get(target, key, receiver) {
				const value = Reflect.get(target, key, receiver);
				if (!value) {
					if (Reflect.set(target, key, proxyImmer({}), receiver)) {
						return Reflect.get(target, key, receiver);
					} else {
						throw new Error('set key to object failed');
					}
				}
				return value;
			},
			set(target, key, value, receiver) {
				return Reflect.set(target, key, value, receiver);
			}
		}
	);

const produce = (obj, fn) => {
	const immer = proxyImmer(obj);
	fn(immer);
	return immer;
};

const obj = { a: 1, b: [], c: 3, e: { g: 8 } };
const nextState = produce(obj, (draft) => {
	draft.d = 4;
	draft.c = 4;
	draft.e.g = 10;
	draft.b.push(5);
});
console.log(nextState);
console.log(obj);
