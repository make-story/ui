/**
 * app 연동
 */

// user Agent
// https://github.com/naver/egjs-agent/tree/master/src
const BROWSER_PRESETS = [
    {
        test: "phantomjs",
        id: "phantomjs",
    },
    {
        test: "whale",
        id: "whale",
    }, {
        test: "edgios|edge|edg",
        id: "edge",
    },
    {
        test: "msie|trident|windows phone",
        id: "ie",
        versionTest: "iemobile|msie|rv",
    },
    {
        test: "miuibrowser",
        id: "miui browser",
    },
    {
        test: "samsungbrowser",
        id: "samsung internet",
    },
    {
        test: "samsung",
        id: "samsung internet",
        versionTest: "version",
    },
    {
        test: "chrome|crios",
        id: "chrome",
    },
    {
        test: "firefox|fxios",
        id: "firefox",
    },
    {
        test: "android",
        id: "android browser",
        versionTest: "version",
    },
    {
        test: "safari|iphone|ipad|ipod",
        id: "safari",
        versionTest: "version",
    },
];

// chromium's engine(blink) is based on applewebkit 537.36.
const CHROMIUM_PRESETS = [
    {
        test: "(?=.*applewebkit/(53[0-7]|5[0-2]|[0-4]))(?=.*\\schrome)",
        id: "chrome",
    },
    {
        test: "chromium",
        id: "chrome",
    },
    {
        test: "whale",
        id: "chrome",
        brand: true,
    },
];
const WEBKIT_PRESETS = [
    {
        test: "applewebkit",
        id: "webkit",
    },
];
const PLATFORM_PRESETS = [
    {
        test: "win",
        id: "window",
    },
    {
        test: "linux",
        id: "linux",
    },
    {
        test: "ipad|ipod|iphone",
        id: "ios",
    },
    {
        test: "android",
        id: "android",
    },
];
const WEBVIEW_PRESETS = [
    {
        test: "(?=(iphone|ipad))(?!(.*version))",
        id: "webview",
    },
    {
        test: "(?=(android|iphone|ipad))(?=.*(naver|daum|; wv))",
        id: "webview",
    },
    {
        // test webview
        test: "webview",
        id: "webview",
    },
];
const OS_PRESETS = [
    {
        test: "windows phone",
        id: "windows phone",
    },
    {
        test: "windows 2000",
        id: "window",
        versionAlias: "5.0",
    },
    {
        test: "windows nt",
        id: "window",
    },
    {
        test: "iphone|ipad|ipod",
        id: "ios",
        versionTest: "iphone os|cpu os",
    },
    {
        test: "mac os x",
        id: "mac",
    },
    {
        test: "android",
        id: "android",
    },
    {
        test: "tizen",
        id: "tizen",
    },
    {
        test: "webos|web0s",
        id: "webos",
    },
    // {
    //     test: "linux|ubuntu|debian",
    //     id: "linux",
    //     versionAlias: "-1",
    // },
];
function some(arr, callback) {
    const length = arr.length;

    for (let i = 0; i < length; ++i) {
        if (callback(arr[i], i)) {
            return true;
        }
    }

    return false;
}
function findPreset(presets, userAgent) {
    let userPreset = null;
    let version = "-1";

    some(presets, preset => {
        const result = execRegExp(`(${preset.test})((?:\\/|\\s|:)([0-9|\\.|_]+))?`, userAgent);

        if (!result || preset.brand) {
            return false;
        }
        userPreset = preset;
        version = result[3] || "-1";

        if (preset.versionAlias) {
            version = preset.versionAlias;
        } else if (preset.versionTest) {
            version = findVersion(preset.versionTest.toLowerCase(), userAgent) || version;
        }
        version = convertVersion(version);
        return true;
    });

    return {
        preset: userPreset,
        version,
    };
}
function getUserAgent(agent) {
    let userAgent = agent;
    if (typeof userAgent === "undefined") {
        if (typeof navigator === "undefined" || !navigator) {
            return "";
        }

        userAgent = navigator.userAgent || "";
    }
    return userAgent.toLowerCase();
}
function parseUserAgent(userAgent) {
    const nextAgent = getUserAgent(userAgent);
    const isMobile = !!/mobi/g.exec(nextAgent);
    const browser = {
        name: "unknown",
        version: "-1",
        majorVersion: -1,
        webview: !!findPreset(WEBVIEW_PRESETS, nextAgent).preset,
        chromium: !!findPreset(CHROMIUM_PRESETS, nextAgent).preset,
        webkit: false,
    };
    const os = {
        name: "unknown",
        version: "-1",
        majorVersion: -1,
    };
    const {
        preset: browserPreset,
        version: browserVersion,
    } = findPreset(BROWSER_PRESETS, nextAgent);

    const {
        preset: osPreset,
        version: osVersion,
    } = findPreset(OS_PRESETS, nextAgent);

    browser.webkit = !browser.chromium && !!findPreset(WEBKIT_PRESETS, nextAgent).preset;

    if (osPreset) {
        os.name = osPreset.id;
        os.version = osVersion;
        os.majorVersion = parseInt(osVersion, 10);
    }
    if (browserPreset) {
        browser.name = browserPreset.id;
        browser.version = browserVersion;

        if (browser.webview && os.name === "ios" && browser.name !== "safari") {
            browser.webview = false;
        }
    }
    browser.majorVersion = parseInt(browser.version, 10);

    return {
        browser,
        os,
        isMobile,
        isHints: false,
    };
}
function hasUserAgentData() {
    if (typeof navigator === "undefined" || !navigator || !navigator.userAgentData) {
        return false;
    }
    const userAgentData = navigator.userAgentData;
    const brands = (userAgentData.brands || userAgentData.uaList);

    return !!(brands && brands.length);
}
function agent(userAgent) {
    if (typeof userAgent === "undefined" && hasUserAgentData()) {
        //return parseUserAgentData();
    } else {
        return parseUserAgent(userAgent);
    }
}


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
https://developer.android.com/guide/webapps/webview#EnablingJavaScript
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


// 약속된 네이밍
export const preset = 'abcapp';

// 웹뷰 -> 앱
export const appSendMessage = (name, param) => {
	const userAgent = navigator.userAgent;
	// check Mac
	const isMac = userAgent.indexOf("Mac") > -1;
	// check iOS
	const isIOS = (isMac || userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
	// check Chrome
	const isChrome = userAgent.indexOf("Chrome") > -1;  

	/*
	User-Agent Client Hints 를 지원하는 브라우저의 경우
	- navigator.userAgentData.brands: 브라우저의 이름과 메이저 버전, Chromium 정보
	- navigator.userAgentData.mobile: 모바일 여부
	- navigator.platform: Android Chrome(Linux armv8l) 여부
	*/

	try {
		if (param) {
			param = JSON.stringify(param);
		}
		
		if (isIOS) {
			// ios
			// https://sesang06.tistory.com/170
			const iframe = document.createElement('iframe');
			let	scheme = `${preset}://appapi/`;

			if (typeof name === 'string') {
				scheme += name;
			}
			if (typeof param === 'string') {
				scheme += '?' + encodeURIComponent(param);
			}
			iframe.setAttribute('src', scheme);
			document.documentElement.appendChild(iframe);
			iframe.parentNode.removeChild(iframe);
			iframe = null;
		} else { 
			// android
			// https://black-jin0427.tistory.com/272
			if (window[preset] && window[preset][name]) { // window.[함수는 안드로이드 APP에서 만든다.]
				if (param === undefined) {
					window[preset][name].apply(window[preset], []);
				} else {
					window[preset][name].apply(window[preset], [param]);
				}
			}
		}
	}catch(e) {}
}

// 맵 -> 웹뷰
/*
웹뷰에서 이벤트 대기
document.addEventListener(window[preset].EVENT.TEST, function(event) { 
	event.detail; // 앱에서 넘어오는 데이터
});
이벤트 디스패치
document.dispatchEvent(new CustomEvent(window[preset].EVENT.TEST, { detail: '앱에서 넘어오는 데이터!' }));


앱에서 호출 시 
window[preset].appTriggerMessage(window[preset].EVENT.TEST, '{"name": "test value"}')
*/
if(!window[preset] || typeof window[preset] !== 'object') {
	window[preset] = {};
}
if(!window[preset].EVENT) {
	window[preset].EVENT = {
		TEST: 'test',
	};
}
if(typeof window[preset].appTriggerMessage !== 'function') {
	window[preset].appTriggerMessage = (name, data) => {
		document.dispatchEvent(new CustomEvent(window[preset].EVENT[name], { detail: data }));
	}
}