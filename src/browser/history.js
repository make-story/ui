/**
 * 히스토리 관련
 * IE10 이상이면 history.replaceState 저장, 이하이면 IE8 이상 지원하는 sessionStorage 저장 
 * IOS 등에서 터치(플리킹)로 뒤로가기를 했을 경우 BFCache 활용됨 
 * (IOS nitro엔진 WKWebview는 히스토리백시 BFCache를 사용)
 * 
 * onpageshow 이벤트를 통해 BFCache 여부를 알 수 있다하더라도, 
 * 페이지이동 -> 뒤로가기로 BFCache 페이지 진입 -> 다시 페이지 이동 -> 뒤로가기로 BFCache 이력이 있던 페이지 진입 
 * onpageshow 이벤트도 실행되지 않는다. (즉, BFCache 를 onpageshow 이벤트로 두번이상 부터는 알 수 없다.)
 */
let isBFCache = null;
const callbackListBFCache = [];

/*export const setBFCacheOn = (callback) => {
	!callbackListBFCache.includes(callback) && callbackListBFCache.push(callback);
};
export const setBFCacheOff = (callback) => {
	callbackListBFCache.splice(callbackListBFCache.indexOf(callback), 1);
};*/

/**
 * popstate 이벤트
 * popstate 이벤트는 브라우저의 백 버튼이나 (history.back() 호출) 등을 통해서만 발생 (history.pushState, history.replaceState 의해 추가/변경된 state 값 확인)
 * popstate 이벤트의 state 속성은 히스토리 엔트리 state 객체의 복사본을 갖게 됩니다.
 * state 객체의 직렬화 결과 크기는 최대 640k로 제한됩니다.
 * 브라우저는 popstate 이벤트를 페이지 로딩시에 다르게 처리합니다. Chrome(v34 이전버전) 와 Safari는 popstate 이벤트를 페이지 로딩시에 발생시킵니다. 하지만 Firefox 는 그렇지 않습니다.
 * https://developer.mozilla.org/ko/docs/Web/API/History_API
 */
/*window.onpopstate = function(event) {
	console.log("location: ", document.location);
	console.log("state: ", event.state);
};*/

/**
 * 스크롤 위치 복원 기능 값 설정
 */
export const setScrollRestoration = (value='manual') => {
	if(typeof window !== 'undefined' && history.scrollRestoration) {
		window.history.scrollRestoration = value; // 'manual' | 'auto'
	}
};

/**
 * page change
 */
const HISTORY_SCROLL = 'HISTORY_SCROLL';
const HISTORY_BFCACHE = 'HISTORY_BFCACHE';
export const getScroll = (element) => {
	return {
	  left: window.pageXOffset || window.scrollX,
	  top: window.pageYOffset || window.scrollY,
	};
  };
export const setHistoryWindowScroll = ({ left, top } = getScroll()) => {
	//console.log(`scroll left: ${left}, top: ${top}`);
	window.sessionStorage.setItem(HISTORY_SCROLL, JSON.stringify({ left, top }));
};
export const getHistoryWindowScroll = () => {
	//window.pageYOffset || window.scrollY || document.documentElement.scrollTop
	const scroll = window.sessionStorage.getItem(HISTORY_SCROLL);
	if(scroll) {
		return JSON.parse(scroll);
	}else {
		return { left: 0, top: 0 };
	}
};
const setHistoryBFCache = (isBFCache) => {
	window.sessionStorage.setItem(HISTORY_BFCACHE, String(isBFCache));
};
const getHistoryBFCache = () => {
	return window.sessionStorage.getItem(HISTORY_BFCACHE);
};
if(typeof window !== 'undefined') {
	window.addEventListener('beforeunload', (event) => {
		console.log('history > beforeunload');
		// 스크롤 위치 저장
		setHistoryWindowScroll();
		// BFCache reload 여부 확인용
		setHistoryBFCache(isBFCache);
	});
	window.addEventListener('pagehide', (event) => {
		console.log('history > pagehide');
		// 스크롤 위치 저장
		setHistoryWindowScroll();
		// BFCache reload 여부 확인용
		setHistoryBFCache(isBFCache);
	});
}

/**
 * BFCache
 * pageshow, pagebeforeshow, pagebeforehide, pagehide 이벤트
 * https://developer.mozilla.org/en-US/docs/Web/Events/pagehide
 * https://developer.mozilla.org/en-US/docs/Web/Events/pageshow
 */
const BF_CACHE_EVENT_TYPE = 'BF_CACHE_EVENT_TYPE';
const BF_CACHE_CHECK_EVENT_TYPE = 'BF_CACHE_CHECK_EVENT_TYPE';
const setCallbackListBFCache = () => {
	/*while (callbackListBFCache.length) { // callback 을 비워버릴 경우, BFCache 때 callbackListBFCache 배열이 빈배열상태 그대로 있음.
		callbackListBFCache.shift()(isBFCache);
	}*/
	callbackListBFCache.forEach((callback) => {
		callback(isBFCache);
	});
};
if(typeof window !== 'undefined') {
	window.addEventListener('pageshow', (event) => {
		//console.log('event', event);
		//console.log('referrer', document.referrer);
		if(event.persisted) {
			//console.log('BFCache');
			isBFCache = true;
			//document.dispatchEvent(new CustomEvent(BF_CACHE_CHECK_EVENT_TYPE, { detail: true }));
			//document.dispatchEvent(new CustomEvent(BF_CACHE_EVENT_TYPE, { detail: event }));
		}else {
			//console.log('새로 진입');
			isBFCache = false;
			//document.dispatchEvent(new CustomEvent(BF_CACHE_CHECK_EVENT_TYPE, { detail: false }));
		}
		setCallbackListBFCache();
	});
}
export const isBFCacheCallback = (callback) => {
	if(typeof callback !== 'function') {
		return;
	}
	if(typeof isBFCache === 'boolean') {
		callback(isBFCache);
	}else {
		// [()=>{}, ()=>{}].includes(()=>{}) : false
		!callbackListBFCache.includes(callback) && callbackListBFCache.push(callback);
	}
};
/*
사용 예:
const serReload = () => {
  console.log('BFCache');
  window.location.reload();
};
bfCacheEventOn(serReload); // on
//bfCacheEventOff(serReload); // off
*/
/*export const bfCacheEventOn = (listener, options={ capture: false }) => {
	typeof window !== 'undefined' && document.addEventListener(BF_CACHE_EVENT_TYPE, listener, options);
};
export const bfCacheEventOff = (listener, options={ capture: false }) => {
	typeof window !== 'undefined' && document.removeEventListener(BF_CACHE_EVENT_TYPE, listener, options);
};
export const bfCacheCheckEventOn = (listener, options={ capture: false }) => {
	typeof window !== 'undefined' && document.addEventListener(BF_CACHE_CHECK_EVENT_TYPE, listener, options);
};
export const bfCacheCheckEventOff = (listener, options={ capture: false }) => {
	typeof window !== 'undefined' && document.removeEventListener(BF_CACHE_CHECK_EVENT_TYPE, listener, options);
};*/

/**
 * 페이지 진입 방식 확인
 * window.performance.navigation 스팩아웃 (Level 2 스팩 사용 권장)
 * https://www.w3.org/TR/navigation-timing-2/#sec-performance-navigation-types
 * 
 * 'navigate' | 'reload' | 'back_forward' | 'prerender' | 'bfcache' | 'reload_bfcache' | ''
 */
export const getNavigationType = (callback) => {
	// navigation
	const getType = () => {
		if(typeof window.performance?.getEntriesByType === 'function' && window.performance.getEntriesByType('navigation')?.length) {
			const timing = window.performance.getEntriesByType('navigation')[0] || {};
			type = timing?.type || ''; // 'navigate' | 'reload' | 'back_forward' | 'prerender'
		}else {
			switch (window.performance?.navigation?.type) {
				case 0:
					type = 'navigate';
					break;
				case 1:
					type = 'reload';
					break;
				case 2:
					type = 'back_forward';
					break;
				default:
					type = '';
					break;
			}
		}
		return type;
	};

	// callback 에 따른 분기
	if (typeof callback === 'function') {
		isBFCacheCallback((isBFCache) => {
		  let type = getType();
		  if (isBFCache) {
			type = 'bfcache';
		  } else if (type === 'reload' && getHistoryBFCache() === 'true') {
			type = 'reload_bfcache';
		  }
		  callback(type);
		});
	  }

	return getType();
};