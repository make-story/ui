/**
 * web worker
 */
import { getKey } from '../util/index';

const order = []; // 배열 : 순서가 보장되어야 한다.
const queue = {}; // 객체 : 빠르게 값을 찾아야 한다. (order 첫번째 배열의 값을 찾아야 한다.)
const setResolve = ({ key, action, isSync, payload, resolve, reject, }/*order 배열 아이템*/, result/*worker 에서 반환되는 값*/) => { 
    resolve({ action, isSync, payload, result });
};
const serReject = ({ key, action, isSync, payload, resolve, reject, }/*order 배열 아이템*/) => {
    reject({ action, isSync, payload, });
};
const getSearchList = (list=[], key) => {
    let search = {
        item: null,
        index: -1
    };
    Array.isArray(list) && list.some((item, index, list) => {
        if(item.key === key) {
            search.item = item;
            search.index = index;
        }
        return item.key === key;
    });
    return search;
};
const setCheckQueue = (list=[]) => {
    if(!Array.isArray(list)|| !list.length) {
        return;
    }
    const key = list[0].key;
    if(queue[key]) {
        setResolve(list.shift(), queue[key].result);
        delete queue[key]; // 대기열 제거
    }
};

// worker
let instanse = {};
export default (url=`//${window.location.host}/webworker/grid/index.js`, options={}) => {
    // url 값이 null 이거나 "" 빈값일 수 있다.
	// open(url="") 을 통해 새로운 워커 url 로 호출가능하기 때문이다.
	// connect[null] = 값; null 도 하나의 값으로 취급된다.
    if(typeof instanse[url] === 'object') { 
		return instanse[url];
	}

    // options
    //options = Object.assign({}, { listeners: {} }, options);
	//options.listeners = Object.assign({}, { open: null, message: null, close: null, error: null }, options.listeners);

    // 웹워커
    const worker = instanse[url] = new Worker(url); // 개발모드, 운영모드 경로 달라야 한다.
    worker.onmessage = (event) => {
        const data = event.data;
        const { key, action, isSync, result/*워커 실행 결과*/, } = data;

        // orker 정보가 없으면 에러
        if(!order.length) {
            return;
        }
        
        // 순차/비순차 실행
        if(isSync === false) {
            // 비순차적 실행
            const { index } = getSearchList(order, key); // order 에서 해당 키 데이터 찾기
            setResolve(order[index], result);
            order.splice(index, 1);
        }else if(key === order[0].key) {
            // 순차적 실행
            setResolve(order.shift(), result);
        }else {
            // 대기열에 추가
            queue[key] = data; 
        }

        // 대기열 확인
        setCheckQueue(order); 
    };
    worker.onerror = (event) => {
        // order 내부 리스트 모두 reject 실행
        //serReject();
    };

    // 메시지 전송
    const message = (action={}, options={}) => {
        let { isSync=true, payload, } = options;
        return new Promise((resolve, reject) => {
            // 매칭 키
            const key = getKey(); 
            // 정보
            order.push({
                ...options,
                action,
                key, 
                resolve,
                reject,
            });
            // 워커 호출
            worker.postMessage({ key, action, isSync, }); // JSON 혹은 기타 직렬화된 데이터를 전달할 수 있다.
        });
    };
    
    return {
        worker,
        message,
    };
};