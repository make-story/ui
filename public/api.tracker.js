/*
트래커
프론트 에러수집, 속도측정 등

@date (버전관리)
2019.10

@copyright
Copyright (c) Sung-min Yu.

@license

@browser compatibility

-
사용예

*/


// 동적으로 추가된 이미지의 error 확인
// https://www.bennadel.com/blog/3429-tracking-image-error-events-using-event-delegation-in-javascript.htm
/*
DOM (Document Object Model) 사양에 따르면 이미지의 ERROR 및 LOAD 이벤트는 DOM 트리를 통해 버블링되지 않습니다. 
따라서 우리는 CAPTURE 단계를 사용해야합니다.
이 단계는 DOM의 맨 위에서 시작하여 대상 요소쪽으로 DOM으로 내려갑니다.
*/
var handler = function(event) {
	// 유효성 검사 
	if(!event || typeof event !== 'object' || typeof event.target !== 'object') {
		return false;
	}else if(typeof event.target.tagName !== 'string' || event.target.tagName.toLowerCase() !== 'img') {
		// img 태그 확인 
		return false;
	}
	
	// 전송 
	$.ajax({
		method: "POST",
		url: '/addErrorImage',
		data: { 
			imgUrl: event.target.src,
			pageUrl: window.location.href
		},
		timeout: 10000,
		success: function(data, textStatus, jqXHR) {
			
		},
		error: function(jqXHR, textStatus, errorThrown) {
			
		}
	});
};
(function() {
	if(document.body && typeof document.body.addEventListener === 'function') {
		// 이벤트 중복 등록 확인 
		if(typeof document.body.TRACKER === 'object') {
			// 이벤트 해제 
			document.body.removeEventListener(document.body.TRACKER.event, document.body.TRACKER.handler, document.body.TRACKER.capture);
		}
		// 이벤트 설정 
		document.body.TRACKER = {
			"event": "error",
			"handler": handler,
			"capture": true
		};
		document.body.addEventListener(document.body.TRACKER.event, document.body.TRACKER.handler, document.body.TRACKER.capture);
	}
})();