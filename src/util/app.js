/**
 * app 연동
 */

/*
-
아이폰 앱 실행
앱이 있을 때는 바로 실행 가능하지만, 없을 때는 javascript timer를 사용해 일정 시간 후 appstore로 분기시키는 방법을 사용

-
Webview -> iOS Native 데이터 교환
UIWebView : 보이지 않는 iframe 생성하여 src="전달정보" 로 데이터 교환
WKWebview : window.webkit.messageHandlers[YOUR_HANDLER_NAME].postMessage(PARAMS) 로 데이터 교환 

iOS Native -> Webview 데이터 교환
iOS 와 자바스크립트간 약속된 funcName 함수로 호출
window.{funcName} = ({parameter}) => {
	// Function 내용
};


-
안드로이드 앱 실행
안드로이드도 아이폰과 동일한 방식으로 앱 미설치 시 예외 처리를 할 수 있으나, 시스템 에러 메시지를 숨기기 위한 iframe 처리 등이 필요할 수 있습니다.
<a id="applink" href="intent://qmenu=voicerecg&version=1#Intent;scheme=naversearchapp;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.search;end">App실행</a>

-
Webview -> 안드로이드 Native 데이터 교환
window[YOUR_HANDLER_NAME][YOUR_METHOD_NAME](PARAMS) 로 데이터 교환


-
참고
https://developer.mozilla.org/ko/docs/Web/API/Window/postMessage
https://developers.naver.com/docs/utils/mobileapp/
https://developers.kakao.com/sdk/js/kakao.js
https://naitas.tistory.com/entry/WKWebview%EC%97%90%EC%84%9C-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%ED%98%B8%EC%B6%9C
https://yoogomja.tistory.com/entry/%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C-%EC%95%B1%EC%97%90%EC%84%9C%EC%9D%98-%ED%95%A8%EC%88%98-%EC%8B%A4%ED%96%89
*/
export const app = (url="appscheme://search?qmenu=voicerecg&version=1") => {
	let clickedAt = +new Date;
	// 페이지가 hidden 되면 타이머를 종료 시켜줘야 한다.
	setTimeout(function() {
		if(+new Date - clickedAt < 2000){
			window.location.href = 'http://itunes.apple.com/kr/app/앱스토어id';
		}
	}, 1500);
	location.href = url;
}

const createHiddenIframe = (id) => {
	let iframe = document.createElement('iframe');
	iframe.id = id;
	iframe.style.border = 'none';
	iframe.style.width = '0';
	iframe.style.height = '0';
	iframe.style.display = 'none';
	iframe.style.overflow = 'hidden';
	document.body.appendChild(iframe);
	return iframe;
}
const launchAppViaHiddenIframe = (urlScheme) => {
	setTimeout(function () {
		let iframe = createHiddenIframe('appLauncher');
		iframe.onload = function () {
			// 마켓 이동
			//document.location = 'market url';
			// iframe 제거
			//iframe.parentNode.removeChild(iframe);
		};
		iframe.src = urlScheme;
	}, 100);
}

// 앱과 데이터 교환
export const appSend = (url) => {
	
}
export const appMessage = (data) => {
	
}