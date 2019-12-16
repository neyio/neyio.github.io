const tasks = Array.from({ length: 30 }).map((_, i) => {
	return (callback) => {
		setTimeout(() => {
			console.log(i);
			callback(i);
		}, 1000);
	};
});
let currentRunIndex = 0;
let finished = 0;
let concurrency = 0;
let concurrencyLimit = 2;
const finish = () => {
	console.log('finished');
};
const next = () => {
	while (concurrency <= concurrencyLimit && currentRunIndex < tasks.length) {
		const task = tasks[currentRunIndex++];
		concurrency++;
		console.log(`run at ${currentRunIndex} concurrency is ${concurrency},finished is ${finished}`);
		task(() => {
			if (finished === tasks.length) {
				return finish();
			}
			finished++;
			concurrency--;
			next();
		});
	}
};

next();

//pipeAsyncFunctions，函数式编程的reduce一向是比较难以理解的，如果你是个新人同学，你可以大致了解，但是未必一定要能够自己手动实现，当然如果能手动实现则更好，毕竟有那么多库你可以使用
const pipeAsyncFunctions = (...fns) => (arg) => fns.reduce((p, f) => p.then(f), Promise.resolve(arg));

const sum = pipeAsyncFunctions(
	(x) => x + 1,
	(x) => new Promise((resolve) => setTimeout(() => resolve(x + 2), 1000)),
	(x) => x + 3,
	async (x) => (await x) + 4
);
(async () => {
	console.log(await sum(5)); // 15
})();
