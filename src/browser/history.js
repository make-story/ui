/**
 * 히스토리 관련
 * IE10 이상이면 history.replaceState 저장, 이하이면 IE8 이상 지원하는 sessionStorage 저장
 * IOS 등에서 터치(플리킹)로 뒤로가기를 했을 경우 BFCache 활용됨
 * (IOS nitro엔진 WKWebview는 히스토리백시 BFCache를 사용)
 *
 * Page Lifecycle
 * https://developers.google.com/web/updates/2018/07/page-lifecycle-api
 * 
 * pageshow / pagehide 캐시 사용여부 확인
 * event.persisted
 * https://developer.mozilla.org/en-US/docs/Web/API/PageTransitionEvent/persisted
 * 
 *
 * BF Cache
 * https://web.dev/bfcache/
 * 비활성화 Cache-Control: no-store
 * onpageshow 이벤트를 통해 BFCache 여부를 알 수 있다하더라도,
 * 페이지이동 -> 뒤로가기로 BFCache 페이지 진입 -> 다시 페이지 이동 -> 뒤로가기로 BFCache 이력이 있던 페이지 진입
 * onpageshow 이벤트도 실행되지 않는다. (즉, BFCache 를 onpageshow 이벤트로 두번이상 부터는 알 수 없다.)
 */
/*
// 일반적 방식
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    //console.log('BFCache');
    window.location.reload();  
  }
};
*/
let isBFCache = null;
const callbackListPageShow = [];
const callbackListDOMReady = [];


/**
 * 스크롤 위치 복원 기능 값 설정
 */
export const setScrollRestoration = (value='manual') => {
	if(typeof window !== 'undefined' && history.scrollRestoration) {
		window.history.scrollRestoration = value; // 'manual' | 'auto'
	}
};


/**
 * BFCache
 * pageshow, pagebeforeshow, pagebeforehide, pagehide 이벤트
 * https://developer.mozilla.org/en-US/docs/Web/Events/pagehide
 * https://developer.mozilla.org/en-US/docs/Web/Events/pageshow
 */
const setCallbackListPageShow = () => {
	/*while (callbackListPageShow.length) { 
		callbackListPageShow.shift()(isBFCache);
	}*/
	callbackListPageShow.forEach((callback) => {
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
		}else {
			//console.log('새로 진입');
			isBFCache = false;
		}
		console.log('history > BFCache', isBFCache);
		console.log('history > referrer', document.referrer);
		setCallbackListPageShow();
	});
}
// pageshow 이벤트 콜백 추가
export const setPageShowCallback = (callback) => {
	if(typeof callback !== 'function') {
		return;
	}
	if(typeof isBFCache === 'boolean') {
		callback(isBFCache);
	}else {
		// [()=>{}, ()=>{}].includes(()=>{}) : false
		!callbackListPageShow.includes(callback) && callbackListPageShow.push(callback);
	}
};
// pageshow 이벤트 콜백 제거
export const setPageShowCallbackCancel = (callback) => {
	callbackListPageShow.splice(callbackListPageShow.indexOf(callback), 1);
};
// pageshow 이벤트 콜백 초기화
export const setPageShowCallbackClear = () => {
	callbackListPageShow.splice(0, callbackListPageShow.length);
};


/**
 * DOM Ready
 */
// DOMContentLoaded 이벤트 콜백 리스트 실행
const setCallbackListDOMReady = () => {
	callbackListDOMReady.forEach((callback) => {
		callback();
	});
};
if (typeof window !== 'undefined') {
	document.addEventListener('DOMContentLoaded', (event) => {
		setCallbackListDOMReady();
	});
}
// DOM Ready 이벤트 콜백 추가
export const setDOMReadyCallback = (callback) => {
	if (typeof window === 'undefined' || typeof callback !== 'function') {
		return;
	}
	if (document.readyState === 'interactive' || document.readyState === 'complete') {
		// IE8 등에서 window.setTimeout 파라미터로 바로 함수값을 넣으면 오류가 난다.
		// 그러므로 function() {} 무명함수로 해당 함수를 실행시킨다.
		window.setTimeout(() => {
		callback();
		});
	} else {
		!callbackListDOMReady.includes(callback) && callbackListDOMReady.push(callback);
	}
};
// DOM Ready 이벤트 콜백 제거
export const setDOMReadyCallbackCancel = (callback) => {
	callbackListDOMReady.splice(callbackListDOMReady.indexOf(callback), 1);
};
// DOM Ready 이벤트 콜백 초기화
export const setDOMReadyCallbackClear = () => {
	callbackListDOMReady.splice(0, callbackListDOMReady.length);
};


/**
 * page change
 */
// 현재 페이지 URL 정보
const getPageURL = () => {
	return window.location.href.split('?')?.shift() || '';
};
const HISTORY_SCROLL = 'HISTORY_SCROLL';
// window 스크롤 값 반환
// TODO: 오버플로우 스크롤 설정된 element 의 경우 대응필요
export const getScroll = (element) => {
	return {
		left: window.pageXOffset || window.scrollX,
		top: window.pageYOffset || window.scrollY,
	};
};
// window 스크롤 값 브라우저 스토리지에 저장
export const setHistoryWindowScroll = ({ left, top }=getScroll(), { key=`${HISTORY_SCROLL}_${getPageURL()}`/*페이지 단위 구분*/ } = {}) => {
	//console.log(`scroll left: ${left}, top: ${top}`);
	window.sessionStorage.setItem(key, JSON.stringify({ left, top }));
};
// window 스크롤 값 브라우저 스토리지에서 불러오기
export const getHistoryWindowScroll = ({ key=`${HISTORY_SCROLL}_${getPageURL()}`/*페이지 단위 구분*/ } = {}) => {
	//window.pageYOffset || window.scrollY || document.documentElement.scrollTop
	let scroll = window.sessionStorage.getItem(key);
	if(scroll) {
		scroll = JSON.parse(scroll) || {};
		return { left: Number(scroll.left) || 0, top: Number(scroll.top) || 0 };
	}else {
		return { left: 0, top: 0 };
	}
};

// 현재 페이지 BFCache 이력
const HISTORY_BFCACHE = 'HISTORY_BFCACHE';
// BFCache 된 페이지 였는지 이력 브라우저 스토리지에 저장
const setHistoryBFCache = (isBFCache=false, { key=`${HISTORY_BFCACHE}_${getPageURL()}`/*페이지 단위 구분*/ } = {}) => {
	window.sessionStorage.setItem(key, String(isBFCache));
};
// BFCache 페이지 이력 브라우저 스토리지에서 불러오기
const getHistoryBFCache = ({ key=`${HISTORY_BFCACHE}_${getPageURL()}`/*페이지 단위 구분*/ } = {}) => {
	return window.sessionStorage.getItem(key);
};


/**
 * window 이벤트 리스너
 */
if(typeof window !== 'undefined') {
	// hashchange
	window.addEventListener('hashchange', (event) => {
		console.log('history > hashchange', event);
	});
	// beforeunload
	/*window.addEventListener('beforeunload', (event) => { // 취소 가능한 이벤트 (사용자 페이지 이탈을 막을 수 있음)
		console.log('history > beforeunload', event);
		// BFCache reload 여부 확인용
		setHistoryBFCache(isBFCache);
		// 콜백 초기화
		setPageShowCallbackClear();
	});*/
	// pagehide
	// unload (beforeunload 이벤트는 제외) 사용하지 않은 이유 : 브라우저는 페이지에 unload 이벤트 리스너가 추가되어 있는 경우, bfcache에 적합하지 않은 페이지로 판단하는 경우가 많다.
	/*window.addEventListener('pagehide', (() => {
		let timeHistoryPageInterval = 0;
		return (event) => {
			console.log('history > pagehide', event);
			// BFCache reload 여부 확인용
			setHistoryBFCache(isBFCache);
			// 콜백 초기화
			setPageShowCallbackClear();
			// 사파리에서는 BFCache 에 기존 JavaScript 코드가 실행되지 않는다.
			if (isSafari) {
				// 페이지 떠나기 전 인터벌 실행이 캐쉬되도록 한다.
				window.clearInterval(timeHistoryPageInterval);
				timeHistoryPageInterval = window.setInterval(() => {
					console.log('safari history interval!!!!!');
					window.clearInterval(timeHistoryPageInterval);
					// 
				});
			}
		};
	})());*/
	window.addEventListener('pagehide', (event) => {
		console.log('history > pagehide', event);
		// BFCache reload 여부 확인용
		setHistoryBFCache(isBFCache);
		// 콜백 초기화
		setPageShowCallbackClear();
	});
}

// 사용자가 페이지를 떠날 때
export const setPageHideEvent = (listener) => {
	// unload (beforeunload 이벤트는 제외) 사용하지 않은 이유 : 브라우저는 페이지에 unload 이벤트 리스너가 추가되어 있는 경우, bfcache에 적합하지 않은 페이지로 판단하는 경우가 많다.
	window.removeEventListener('pagehide', listener);
	window.addEventListener('pagehide', listener), { once: true };
};

// 사용자 터치가 발생하면, 히스토리 스크롤 이동 등 정지
export const setUserTouchEvent = (listener) => {
	window.document.body.removeEventListener('touchstart', listener);
	window.document.body.removeEventListener('touchmove', listener);
	window.document.body.addEventListener('touchstart', listener, { once: true });
	window.document.body.addEventListener('touchmove', listener, { once: true });
};


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
 * 페이지 진입 방식 확인
 * window.performance.navigation 스팩아웃 (Level 2 스팩 사용 권장)
 * https://www.w3.org/TR/navigation-timing-2/#sec-performance-navigation-types
 * 
 * 'navigate' | 'reload' | 'back_forward' | 'prerender' | 'bfcache' | 'reload_bfcache' | ''
 */
export const getNavigationType = (callback) => {
	// navigation
	const getType = () => {
		if(typeof window.performance.getEntriesByType === 'function' && window.performance.getEntriesByType('navigation').length) {
			const timing = window.performance.getEntriesByType('navigation')[0] || {};
			type = timing.type || ''; // 'navigate' | 'reload' | 'back_forward' | 'prerender'
		}else {
			switch (window.performance.navigation.type) {
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

		// BFCache, referrer 확인
		if (['navigate', 'reload'].includes(type)) {
			if (getHistoryBFCache() === 'true') {
				type = 'reload_bfcache'; // 이전 BFCache 상태에서 페이지 새로고침 됨
			} else if (document.referrer && document.referrer.split('?').shift().split('/').pop() === 'login') {
				type = 'referrer_login';
			}
		}

		return type;
	};

	// callback 에 따른 분기 (bfcache 여부)
	if (typeof callback === 'function') {
		setPageShowCallback((isBFCache) => callback(isBFCache ? 'bfcache' : getType()));
	}

	return getType();
};


/**
 * default
 */
export default () => {
	// ...
};