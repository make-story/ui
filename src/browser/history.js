/**
 * history
 * IE10 이상이면 history.replaceState 저장, 이하이면 IE8 이상 지원하는 sessionStorage 저장 
 * IOS 등에서 터치(플리킹)로 뒤로가기를 했을 경우 BFCache 활용됨 
 * (IOS nitro엔진 WKWebview는 히스토리백시 BFCache를 사용)
 */
// popstate 이벤트 
// popstate 이벤트는 브라우저의 백 버튼이나 (history.back() 호출) 등을 통해서만 발생 (history.pushState, history.replaceState 의해 추가/변경된 state 값 확인)
// popstate 이벤트의 state 속성은 히스토리 엔트리 state 객체의 복사본을 갖게 됩니다.
// state 객체의 직렬화 결과 크기는 최대 640k로 제한됩니다.
// 브라우저는 popstate 이벤트를 페이지 로딩시에 다르게 처리합니다. Chrome(v34 이전버전) 와 Safari는 popstate 이벤트를 페이지 로딩시에 발생시킵니다. 하지만 Firefox 는 그렇지 않습니다.
// https://developer.mozilla.org/ko/docs/Web/API/History_API
/*window.onpopstate = function(event) {
	console.log("location: ", document.location);
	console.log("state: ", event.state);
};*/

// pageshow, pagebeforeshow, pagebeforehide, pagehide 이벤트
// https://developer.mozilla.org/en-US/docs/Web/Events/pagehide
// https://developer.mozilla.org/en-US/docs/Web/Events/pageshow
/*window.onpageshow = function(event) {
	console.log('event', event);
	console.log('navigation', window.performance.navigation);
	console.log('referrer', document.referrer);
	
	if(event.persisted) {
		console.log('BFCache');
	}else {
		console.log('새로 진입');
	}
};*/

// window.performance.navigation 스팩아웃 (Level 2 스팩 사용 권장)
// https://www.w3.org/TR/navigation-timing-2/#sec-performance-navigation-types
export default (() => {
	console.log(performance.getEntriesByType("navigation"));
	// 스크롤위치를 브라우저에서 자동으로 옮겨가는 것 방지
	//window.history.scrollRestoration = 'manual';
	return {
		state: null,
		get: null,
		set: null,
		del: null,
		navigation: null,
	};
})();