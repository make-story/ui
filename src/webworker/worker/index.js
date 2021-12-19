// import 
if(!self.isGlobalModule) {
    importScripts('./global.js');
}
//importScripts('/a.js', '/b.js', '/c.js');

// instance
let instance = {};
//instance.a = new A();
//instance.b = new B();
//instance.c = new C();

// worker event
self.onmessage = (event) => {
	let data = event.data || {};
	let { action={}, key, isSync, } = data;
	let { instance: i, method: m, parameter: p, } = action;

	// 워커 작업 실행
	(async () => {
		console.log('[worker 정보] 요청', action);
		data.result = await instance[i][m](p);
		console.log('[worker 정보] 응답', data.result);
		self.postMessage(data);
	})();
	//setTimeout(() => {
		//console.log('action', action); // instance, method, parameter
		//console.log('isSync', isSync);
		//console.log('key', key);
		//console.log(instance[action.instance]);
		//data.result = 'worker에서 반환되는 값!';
		//self.postMessage(data);
	//}, action.time);
};