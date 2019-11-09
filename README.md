
# UI 컴포넌트

javascript

----

### api.brower.js  (기존 파일명 api.dom.js)

api.key()
- 일반적인 고유값 반환

api.env.check.mobile
- 모바일 디바이스 여부 true/false

api.env.check.touch
- 터치 디스플레이 여부 true/false

api.env.check.transform
- 트랜스폼 브라우저 지원여부 true/false

api.env.check.transition
- 트랜지션 브라우저 지원여부 true/false

api.env.check.animation
- 애니메이션 브라우저 지원여부 true/false

api.env.check.fullscreen
- 풀스크린 브라우저 지원여부 true/false

api.env.check.passive
- 크롬 기본이벤트 true/false

api.env.os.name
- OS 
android/ios/mac/window

api.env.monitor
- 사용자 해상도 종류(기준 픽셀값에 따라 분기) pc/mobile/tablet

api.env.screen.width
- 해상도 width

api.env.screen.height
- 해상도 height

api.env.browser.name
- 브라우저 종류

api.env.browser.version
- 브라우저 버전

api.env.browser.scrollbar
- 브라우저에서 스크롤바가 차지하는 픽셀값

api.env.event.down
- mousedown/touchstart

api.env.event.move
- mousemove/touchmove

api.env.event.up
- mouseup/touchend

api.env.event.click
- touchstart/tap/click

api.env.event.wheel
- mousewheel/DOMMouseScroll

api.env.event.transitionend
- transitionend/webkitTransitionEnd/oTransitionEnd/MSTransitionEnd

api.env.event.animationstart
- animationstart/webkitAnimationStart/oanimationstart/MSAnimationStart

api.env.event.animationiteration
- animationiteration/webkitAnimationIteration/oanimationiteration/MSAnimationIteration

api.env.event.animationend
- animationend/webkitAnimationEnd/oanimationend/MSAnimationEnd


api.dom(selector, [context])
- 요소 검색

````javascript
api.dom('.class');
api.dom('#id');
api.dom('div.note, div.alert');
api.dom('div.user-panel.main input[name=login]');
````

.ready(handler)
- Document ready callback

````javascript
api.dom(document).ready(function() {
	// code
});
````

.get(index)
- 검색된 요소 중 index 번째 요소 반환 또는 전체반환

````javascript
var list = api.dom('.class');
var elem = list.get(0);
````

.find(selector)
- context 내부 요소 검색

````javascript
api.dom('#id').find('.class');
````

.each(callback)
- 요소을 순회하면서 각 요소를 매개변수로 지정한 콜백함수를 호출한다.

````javascript
api.dom('.class').each(function(index, elem) {
	// this: element
	// code
});
````

.closest(selector, context)
- 상위 요소 검색

````javascript
api.dom('li.item-a').closest('ul');
````

.children()
- 자식요소 리스트

````javascript
api.dom("ul").children();
````

.getClass()
- 요소 class 리스트 반환

.hasClass(name)
- 해당 class명 포함여부 true/false

.addClass(name)
- 요소에 class명 추가

.removeClass(name)
- 해당 class명 삭제

.toggleClass(name)
- 해당 class 추가 또는 삭제

.html(value)
- 요소에 html 삽입

.text(value)
- 요소에 text 삽입

.val(value)
- 요소에 value 삽입

.css({name: value})
.css(name)
- 요소 style property 추가 또는 반환

.show()
- 요소 display 기본값 설정

.hide()
- 요소 display none 설정

.isVisible()
- 요소 화면 노출여부 

.offset()
- 현재요소 위치(좌표)값 반환

.offsetParent()
- 현재요소 부모 정보 반환 

.position()
- 부모요소 기준 현재요소 위치(좌표)값 반환

.width(value)
- 요소의 width 값 반환

.innerWidth()
- 요소의 width + padding 값 반환

.outerWidth(is)
- 요소의 width + padding + border + [margin] 값 반환

.scrollWidth()
- 요소의 overflow auto/scroll 값에서 보이지 않는 부분까지 포함한 값 

.height(value)
- 요소의 height 값 반환

.innerHeight()
- 요소의 height + padding 값 반환

.outerHeight(is)
- 요소의 height + padding + border + [margin] 값 반환	

.scrollHeight()
- 요소의 overflow auto/scroll 값에서 보이지 않는 부분까지 포함한 값 

.attr({name: value})
.attr(name)
- 요소에 attribute 추가 또는 반환

.removeAttr(name)
- 해당 attribute 삭제

.hasAttr(name)
- 해당 attribute 포함여부 true/false

.prop({name: value})
.prop(name)
- 요소에 property 추가 또는 반환

.removeProp(name)
- 해당 property 삭제

.empty()
- 요소내 제거 

.remove()
- 요소 제거

.clone(is)
- 요소 복사
- is : 자식 노드들도 모두 복제할지 여부(true:복사, false:해당없음)

.prepend(value)
- 요소의 앞에 추가하기

````javascript
api.dom("ul").prepend(api.dom('<li>'));
````

.append(value)
- 마지막 자식 요소 추가

````javascript
api.dom("ul").append(api.dom('<li>'));
````

.after(value)
- 뒤에 추가

.before(value)
- 앞에 추가

.insertBefore(value)
- 앞에 추가

.replaceWith(value)
- 요소 바꾸기

.next()
- 다음 요소

.prev()
- 이전 요소 

.on(events, handlers, [capture])
- 이벤트 바인딩

````javascript
// 이벤트 여러개를 키와 함께 한번에 설정
api.dom("#target").on('click.EVENT_CLICK_TEST mousedown.EVENT_MOUSEDOWN_TEST mouseup');
// 이벤트 키와 함께 하나의 이벤트 설정
api.dom("#target").on('click.EVENT_CLICK_TEST');
// 이벤트 키없이 일반적인 설정
api.dom("#target").on('click');
````

.off(events)
- 이벤트 해제

````javascript
// 이벤트 키에 해당하는 여러개를 한번에 해제
api.dom("#target").off('click.EVENT_CLICK_TEST mousedown.EVENT_MOUSEDOWN_TEST');
// 이벤트 키에 해당하는 것만 해제
api.dom("#target").off('click.EVENT_CLICK_TEST');
api.dom("#target").off('.EVENT_CLICK_TEST');
// 이벤트 type 에 해당하는 전체 해제
api.dom("#target").off('click');
// 이벤트 전체 해제
api.dom("#target").off();
````

.one(events, handlers, [capture])
- 이벤트 발생하면 바인딩 자동해제

.trigger(events)
- 지정한 이벤트 타입의 이벤트를 발생시켜 이벤트 핸들러 함수를 실행한다.

.data(value)
- 데이터 추가 또는 반환

.scroll()
.scroll({name: value})
- 브라우저 스크롤 위치설정 또는 위치반환

.contains(value)
- 특정 노드가 다른 노드 내에 포함되었는지 여부

.is(selector)
- 셀럭터 조건 반환

.isEqualNode(selector || element)
- 동일한 요소 여부 반환 

api.extend({name: value})
api.fn.extend({name: value})
- api.dom 객체 또는 prototype 에 기능추가


api.location.hash.get(key)
- 해쉬 값 불러오기 

api.location.hash.set(key, value)
- 해쉬 값 추가 

api.location.hash.del(key)
- 해쉬 값 제거 

api.location.hash.has(key)
- 해쉬 값 존재여부 

api.location.params.get(url)
- URL 파라미터 값 불러오기 {key: value, key: value, ...}


api.storage.clear(type)
- 브라우저 저장소 데이터 전체삭제

````javascript
// 세션 스토리지 전체 삭제
api.storage.clear('session');

// 로컬 스토리지 전체 삭제
api.storage.clear('local');
````

api.storage.length(type)
- 브라우저 저장소 데이터 총 개수

````javascript
// 세션 스토리지에 저장된 전체 개수
api.storage.length('session');

// 로컬 스토리지 저장된 전체 개수
api.storage.length('local');
````

api.storage.get(type, key)
- 브라우저 저장소 데이터 출력

````javascript
// 세션 스토리지에 mykey 라는 키로 저장된 데이터 출력
api.storage.get('session', 'mykey');

// 로컬 스토리지에 mykey 라는 키로 저장된 데이터 출력
api.storage.get('local', 'mykey');
````

api.storage.set(type, key, item)
- 브라우저 저장소 데이터 입력

````javascript
// 세션 스토리지에 mykey 라는 키로 데이터 입력
api.storage.set('session', 'mykey', '유성민');

// 로컬 스토리지에 mykey 라는 키로 데이터 입력
api.storage.set('local', 'mykey', '유성민');
````

api.storage.del(type, key)
- 브라우저 저장소 해당 type에 해당하는 데이터 삭제

````javascript
// 세션 스토리지의 mykey 에 해당하는 데이터 삭제
api.storage.del('session', 'mykey');

// 로컬 스토리지의 mykey 에 해당하는 데이터 삭제
api.storage.del('local', 'mykey');
````


api.history.storage
- 히스토리값 저장소 history/session

api.history.get(key)
- 히스토리 값 불러오기

api.history.set(key, value)
- 히스토리 값 추가 

api.history.del(key)
- 히스토리 값 제거 

api.history.navigation()
- 사용자 브라우저 네비게이션 조작상태 NONE/NAVIGATENEXT/RELOAD/BACK_FORWARD/UNDEFINED

api.history.callback(function() {})
- 네비게이션(URL진입, 앞으로/뒤로가기, 새로고침 등)/해쉬변경 콜백 

````javascript
// 뒤로가기 접근
api.history.callback(function(navigation) {
	console.log(['BACK_FORWARD'].join(' '), navigation);
}, 'BACK_FORWARD');

// 뒤로가기 / 새로고침 접근
api.history.callback(function(navigation) {
	console.log(['BACK_FORWARD', 'RELOAD'].join(' '), navigation);
}, ['BACK_FORWARD', 'RELOAD']);

// 새로고침 / 해시값 변경 접근
api.history.callback(function(navigation) {
	console.log(['RELOAD', 'HASHCHANGE'].join(' '), navigation);
}, ['RELOAD', 'HASHCHANGE']);

// 한페이지에서 여러번 호출 경우
var test = function() {
	api.history.callback(function(navigation) {
		console.log([navigation.state, 'test1'].join(' '));
		test(); // 반복실행 테스트 
	}, {'key': 'test1', 'state': ['NAVIGATENEXT', 'RELOAD']});
};
test();

// 네비게이션에서 바로 이벤트 설정 
api.history.navigation({
	'callback': function(navigation) {
		console.log([navigation.state, 'test2'].join(' '));
	},
	'key': 'test2',
	'state': 'RELOAD'
});
````

api.touch.on(selector, handlers)
- 더블터치, 딜레이터치, 원터치 이벤트 설정

````javascript
api.touch.on('#ysm', 
	{
		'one': function(e) {
			// one touch 
		},
		'two': function(e) {
			// two touch
		},
		'delay': function(e) {
			// delay touch
		}
	}
);
````

api.touch.off(selector, eventkey);
- 더블터치, 딜레이터치, 원터치 이벤트 해제

````javascript
api.touch.off('#ysm', 'one'); // eventkey: one, two, delay, all
````


----

### api.player.js

비디오 플레이어 (오디오 작업중)
<http://makeapi.net/test/media.html>

````javascript
// 플레이어 생성
api.player.setup({
	'target': document.querySelector('#video'),
	'source': '리소스 URL'
});

// setup options 값 참고
/*
	'key': '', // 비디오 작동 고유키
	'target': '', // container, 비디오를 넣을 타겟 
	'attributes': {}, // 비디오 태그 사용자 속성 

	// 외부 오버레이 또는 video 태그와 오버레이를 포함한 템플릿 
	'overlay': '', // 내부에서 생성하는 것이 아닌 외부에서 만든 오버레이, element target 또는 html string
	'template': '', // video 태그를 포함한 템플릿, element target 또는 html string

	// poster 이미지 
	'poster': '', 

	// source
	'source': '', // string 이면 src, {'src': '', 'type': ''} 또는 {} 여러개 엤는 [{...}, {...}, ...] 배열형태

	// 기본 기능 설정
	'crossorigin': '', // anonymous, use-credentials
	'autoplay': false, // 로드시 미디어 자동 재생
	'muted': false, // 초기 음소거 모드여부 
	'loop': false, // loop="" 속성은 미디어가 종료되는 시점에 처음으로 돌아가게 합니다.
	'autoHideControls': true, // 비디오 컨트롤을 자동으로 숨깁니다. // hideControls
	'swipeRewindForward': true, // 마우스/터치 되감기/빨리감기 
	'swipeVolume': true, // 마우스/터치 볼륨
	'seekTime': 10, // 빨리 감기 또는 되감기를 할 때 시간
	'volume': 10, // 초기 볼륨 (1~10)
	'volumeMin': 0, // 불륨 최소 제한
	'volumeMax': 10, // 볼륨 최대 제한
	'volumeStep': 1, // 불륨 조절 간격

	// 컨트롤러 버튼 사용유무
	'controls': {
		'reset': false, // 초기화 
		'rewind': false, // 되돌리기 버튼 노출여부
		'forward': false, // 빨리감기 버튼 노출여부
		'progress': true, // played, buffer
		'currentTime': true, // 현재 재생시간 표시 사용여부
		'duration': true, // 지속시간 표시 사용여부
		'mute': true, // 음소거 사요여부
		'volume': true, // 볼륨 사용여부
		//'captions': false, // 자막 사용여부
		'fullscreen': true, // 풀스크린 사용여부 (native 또는 fallback(프레임) 방식)
		'pip': true, // PIP (Picture-in-Picture)
		'tooltip': true // 각 버튼의 말풍선 사용여부 (예: 재생버튼에 마우스를 올리면, 설명 말풍선을 보여줌)
	},

	// 설렉터 (요소 이벤트 설정)
	'selectors': {
		'controlsWrapper': '[data-player="controls-wrapper"]',
		'playerWrapper': '[data-player="player-wrapper"]',
		'player': '[data-player="player"]',
		'poster': '[data-player="player-poster"]',
		'buttons': {
			'playOverlay': '[data-player="play-overlay"]', // 화면 중앙에 위치한 play 버튼 
			'pauseOverlay': '[data-player="pause-overlay"]',
			'reset': '[data-player="reset"]',
			'play': '[data-player="play"]',
			'pause': '[data-player="pause"]',
			'rewind': '[data-player="rewind"]',
			'forward': '[data-player="forward"]',
			'mute': '[data-player="mute"]', 
			'fullscreen': '[data-player="fullscreen"]', 
			'pip': '[data-player="pip"]'
		},
		'seek': {
			'container': '[data-player="seek"]',
			'range': '[data-player="seekRange"]', // <input type="range" min="0" max="100" step="0.1" value="0" />
			'progressPlayed': '[data-player="seekProgressPlayed"]',
			'progressBuffer': '[data-player="seekProgressBuffer"]',
			'tooltip': '[data-player="seekTooltip"]'
		},
		'volume': {
			'container': '[data-player="volume"]',
			'range': '[data-player="volumeRange"]', // <input type="range" min="0" max="10" value="10" />, 0~10 볼륨 조절
			'progress': '[data-player="volumeProgress"]' // <progress max="10" value="4"></progress>
		},
		'currentTime': '[data-player="current-time"]', // 현재 재생시간
		'duration': '[data-player="duration"]' // 전체 재생시간
	},

	// class (요소 스타일 설정)
	'classes': {
		'loading': 'player-loading', // 로딩중 (container 에 클래스 삽입)
		'fullscreen': 'player-fullscreen', // 풀스크린 상태 (container 에 클래스 삽입)

		'hidden': 'player-hidden', // 감추기 (display: none;)

		'container': 'player-container',
		'controlsWrapper': 'player-controls-wrapper',
		'playerWrapper': 'player-player-wrapper',
		'player': 'player-player',
		'poster': 'player-poster',
		'buttons': {
			'playOverlay': 'player-button-play-overlay',
			'pauseOverlay': 'player-button-pause-overlay',
			'reset': 'player-button-reset',
			'play': 'player-button-play',
			'pause': 'player-button-pause',
			'rewind': 'player-button-rewind',
			'forward': 'player-button-forward',
			'mute': 'player-button-mute',
			//'captions': 'player-button-captions',
			'fullscreen': 'player-button-fullscreen',
			'pip': 'player-button-pip'
		},
		'seek': {
			'container': 'player-seek-container',
			'range': 'player-seek-range',
			'progressPlayed': 'player-seek-progress-played',
			'progressBuffer': 'player-seek-progress-buffer',
			'tooltip': 'player-seek-tooltip'
		},
		'volume': {
			'container': 'player-volume-container',
			'range': 'player-volume-range',
			'progress': 'player-volume-progress'
		},
		'currentTime': 'player-time', 
		'duration': 'player-duration'
	},

	// 사용자 콜백 
	'listeners': {
		'reset': null,
		'seek': null,
		'play': null,
		'pause': null,
		'rewind': null,
		'forward': null,
		'mute': null,
		'volume': null,
		'fullscreen': null,
		'pip': null
	}
*/
````


----

### api.editor.js

에디터
<http://makeapi.net/test/editor.html>

````javascript
// 텍스트 에디터
api.editor.setup({
	'key': 'textedit', // 에디터 key
	'type': 'text', // 에디터 type
	'target': '#editor', // 에디터 적용 element
	'tooltip': true, // 툴팁 사용여부
	'classes': {
		'link': 'editor-text-link' // a 태그에 적용될 class 속성값
	},
	'listeners': { 
		'init': null
	}
}).on();

// 이미지/동영상(작업중) 에디터
api.editor.setup({
	'key': 'multiedit', // 에디터 key
	'type': 'multi', // 에디터 type
	'target': '#editor', // 에디터 적용 element
	'image': true, // 이미지 사용여부
	'video': true, // 비디오 사용여부
	'code': true, // 코드 사용여부
	'line': true, // 구분선 사용여부
	'tooltip': {
		'image': {
			'put': true, // 이미지 넣기 툴팁 보이기 / 숨기기
			'location': true // 이미지 위치 수정 툴팁 보이기 / 숨기기
		}
	},
	'size': {
		'image': {
			'min': {
				'width': 0,
				'height': 0
			},
			'max': {
				'width': 0,
				'height': 0
			}
		}
	},
	'submit': {
		'image': '//makestory.net/files/editor', // 이미지 파일 전송 url
	},
	// element 에 설정할 class 속성값
	'classes': {
		'image': {
			'wrap': 'editor-image-wrap', // 이미지 감싸는 element
			'wide': 'editor-image-wide', // 이미지 와이드
			'left': 'editor-image-wrap-left', // 이미지 왼쪽 글자 오른쪽
			'right': 'editor-image-wrap-right', // 이미지 오른쪽 글자 왼쪽
			'figure': 'editor-image-figure', // img 태그 감싸는 element
			'img': 'editor-image-img',
			'figcaption': 'editor-image-figcaption'
		},
		'code': {
			'wrap': 'editor-code-wrap'
		}
	},
	'listeners': {
		'init': null
	}
}).on();

// 오픈그래프 (링크 meta 출력)
api.editor.setup({
	'key': 'opengraph',
	'type': 'opengraph',
	'submit': '//makestory.net/opengraph', // link url 정보를 받아 meta 정보를 돌려줄 서버측 url
	'classes': {
		'wrap': 'opengraph-wrap',
		'image': 'opengraph-image',
		'text': 'opengraph-text',
		'title': 'opengraph-title',
		'description': 'opengraph-description',
		'author': 'opengraph-author'
	},
	'listeners': {
		'init': null
	}
}).on();

// 서버측 오픈그래프 return json 구조
{
	'status': 'success', 
	'result': {
		'title': '페이지 제목',
		'description': '페이지 요약',
		'image': '이미지',
		'author': '원작자',
		'keywords': '키워드'
	}
}

// 해당요소 에디터 해제
api.editor.search('에디터키').off();
````


----

### api.animate.js

자바스크립트 애니메이션프레임, 애니메이션, 트랜지션
<http://makeapi.net/test/animate.html>

api.animate.frame({})
- requestAnimationFrame 애니메이션 리스트 실행

````javascript
// 단일 실행
api.animate.frame({
	'element': '.h2', 
	'style': {
		'left': '100px', 
		'top': '100px', 
		'width': '100px', 
		'height': '100px'
	}, 
	'duration': 3
});

// 여러개 실행
api.animate.frame([
{
	'element': api.dom('#h2'), 
	'style': {
		'left': '100px', 
		'top': '100px'
	}, 
	'duration': 3, 
	'complete': function() {  }
}, 
{
	'element': api.dom('#h2'), 
	'style': {
		'left': '200px', 
		'top': '200px'
	}, 
	'duration': 3, 
	'complete': function() {  }
}
]);
````

api.animate.transition({})
- 트랜지션 리스트 실행

````javascript
// 단일 실행
api.animate.transition({
	'element': api.dom('#view'), 
	'style': {
		'left': '100px', 
		'top': '100px'
	}, 
	'duration': 3
});

// 여러개 실행
api.animate.transition([
{
	'element': api.dom('#view'), 
	'style': {
		'left': '100px', 
		'top': '100px'
	}, 
	'duration': 3, 
	'complete': function() { }
},
{
	'element': api.dom('#view'), 
	'style': {
		'left': '200px', 
		'top': '200px'
	}, 
	'duration': 3, 
	'complete': function() { }
} 
]);
````

api.animate.animation({})
- 애니메이션 리스트 실행 (class 값으로 제어)

````javascript
// 단일 실행
api.animate.animation({
	'element': api.dom('#view'), 
	'class': 'pt-page-moveToLeft', 
	'complete': function() { }
});

// 여러개 실행
api.animate.animation([
{
	'element': api.dom('#view'), 
	'class': 'pt-page-moveToRight'
}, 
{
	'element': api.dom('#list'), 
	'class': 'pt-page-moveToRight'}
]);
````


----

### api.xhr.js

XMLHttpRequest (레벨2)

````javascript
api.xhr({
	'contentType': 'application/x-www-form-urlencoded',
	'type': 'GET', // GET, POST, DELETE, PUT 같은 HTTP 메서드 타입
	'url': '', // 요청할 URL 주소
	'async': true, // 동기/비동기 방식
	'timeout': 0, // timeout

	'data': {}, // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
	'context': global, // 콜백함수 내부에서 this 키워드로 사용할 객체
	'dataType': 'text', // 서버 측에서 응답받을 데이터의 형식을 문자열로 지정 (json, text, jsonp)

	'progressUpload': undefined, // 업로드 진행률 콜백 함수
	'progressDownload': undefined, // 다운로드 진행률 콜백 함수
	'beforeSend': undefined, // 요청하기 전 실행할 콜백 함수
	'complete': undefined, // 요청이 끝난 후 실행할 콜백 함수
	'success': undefined, // 요청이 성공했을 때 실행할 콜백 함수
	'error': undefined // 에러 콜백 함수 (timeout 포함)
});

// 파일전송
var from = new FormData(api.dom('#form').get(0));
api.xhr({
	'type': 'POST', 
	'url': '', 
	'data': from 
});
````


----

### api.socket.js

WebSocket
<http://makeapi.net/test/websocket.html>

````javascript
var socket = api.socket({
	'url': 'ws://', // 필수
	'listeners': {
		'open': function() {
			console.log('open 콜백');
		},
		'message': function(data) {
			console.log('서버로 부터 받은 메시지 콜백');
		},
		'close': function(event) {
			console.log('종료 콜백');
		},
		'error': function() {
			console.log('에러 콜백');
		}
	}
});
socket.send('서버로 전송 데이터');
socket.close(); // 소켓 연결 종료
````


----

### api.worker.js

Worker

````javascript
var worker = api.worker({
	'url': 'js파일위치', // 필수
	'listeners': {
		'message': function(data) {
			console.log('워커로 부터 받은 메시지 콜백');
		},
		'error': function() {
			console.log('에러 콜백');
		}
	}
});
worker.send('워커로 전송 데이터');
worker.close(); // 워커 종료
````


----

### api.modal.js

레이어
<http://makeapi.net/test/modal.html>

````javascript
// 레이어
var instance = api.modal.setup({
	'type': 'layer',
	'key': '',
	'position': 'center',
	'mask': null, 
	'listeners': {
		'show': null,
		'hide': null
	},
	'target': '', // #id
	'close': '', // .class
	'esc': true // 키보드 esc 닫기실행
});
instance.show(); // 열기
instance.hide(); // 닫기

/*
position 값(브라우저 화면 기준):
topleft, topcenter, topright
bottomleft, bottomcenter, bottomright
centerleft, center, centerright
*/

// Rect (타겟위치를 기준으로 레이어 출력)
api.modal.setup({
	'type': 'rect', 
	'key': 'rect',
	'position': '', // 출력위치
	'target': '', // 출력레이어 타겟
	'rect': '', // 위치기준 타켓
	'esc': true // 키보드 esc 닫기실행
}).toggle();

/*
position 값(타겟 위치 기준):
auto
topleft, topcenter, topright
bottomleft, bottomcenter, bottomright
lefttop, leftmiddle, leftbottom
righttop, rightmiddle, rightbottom
*/

// Confirm
var instance = api.modal.setup({
	'type': 'confirm',
	'key': '',
	'position': 'topcenter',
	'mask': null, 
	'listeners': {
		'show': null,
		'hide': null,
		'ok': function() {
			return true;
		},
		'cancel': function() {
			return false;
		}
	},
	'title': '',
	'message': ''
});
instance.change({'title': '', ...}); // 재설정
instance.show(); // 열기
instance.hide(); // 닫기
instance.remove(); // elememt 제거

/*
position 값(브라우저 화면 기준):
topleft, topcenter, topright
bottomleft, bottomcenter, bottomright
centerleft, center, centerright
*/

// Alert
var instance = api.modal.setup({
	'type': 'alert',
	'key': '',
	'position': 'topcenter',
	'mask': null,
	'listeners': {
		'show': null,
		'hide': null
	},
	'title': '',
	'message': '',
	'esc': true // 키보드 esc 닫기실행
});
instance.change({'title': '', ...}); // 재설정
instance.show(); // 열기
instance.hide(); // 닫기
instance.remove(); // elememt 제거

/*
position 값(브라우저 화면 기준):
topleft, topcenter, topright
bottomleft, bottomcenter, bottomright
centerleft, center, centerright
*/

// Push
var instance = api.modal.setup({
	'type': 'push',
	'key': '',
	'position': 'topright',
	'mask': null,
	'listeners': {
		'show': null,
		'hide': null
	},
	'time': 0, // 0 보다 큰 값은 자동닫기 설정
	'message': ''
});
instance.change({'time': 2000, ...}); // 재설정
instance.show(); // 열기
instance.hide(); // 닫기
instance.remove(); // elememt 제거

/*
position 값(브라우저 화면 기준):
topleft, topcenter, topright
bottomleft, bottomcenter, bottomright
centerleft, center, centerright
*/

// key에 해당하는 팝업 인스턴스값 반환
instance = api.modal.search(key); 
````


----

### api.flicking.js

플리킹
<http://makeapi.net/test/flicking.html>

````javascript
// 방법1
var instance = api.flicking.setup({
	'key': '', // 플리킹 작동 고유키 (선택)
	'target': null, // 슬라이드 wrap (셀렉터 또는 element 값)
	'flow': 'horizontal', // 플리킹 방향 (horizontal, vertical)
	'width': 'auto', // 슬라이드 width 값 설정 (auto: 슬라이드가 target 가운데 위치하도록 wrap width 값에 따라 자동설정)
	'height': 'auto', // 슬라이드 height 값 설정
	'speed': 300, // 슬라이드 속도
	'touch': true, // 클릭 또는 터치 슬라이드 작동여부
	'auto': 0, // 자동 슬라이드 작동여부 (0 이상의 값이 입력되면 작동합니다.)
	'wheel': false, // 마우스 휠 이벤트 작동여부
	'listeners': { // 플리킹 작동 callback (선택)
		'init': null,
		'next': null,
		'prev': null,
		'slidechange': null,
		'prepend': null,
		'append': null,
		'remove': null
	}
});
instance.on(); // 플리킹 터치(또는 클릭) 이벤트 On
instance.off(); // 플리킹 터치(또는 클릭) 이벤트 Off
instance.append({'index': '해당 슬라이드 위치에 추가(last, first, 숫자)', 'html': 'html code'}); // 슬라이드 추가
instance.remove({'index': '해당 슬라이드 위치 삭제(current, last, 숫자)'}); // 슬라이드 삭제
instance.slide({
	'index': '', // 슬라이드 이동(숫자값: 해당슬라이드 index 이동, 문자값: 'next' 다음슬라이드 이동 'prev' 이전슬라이드 이동)
});

// 방법2 (key로 제어)
api.flicking.setup({
	'key': '키값',
	'target': null // 슬라이드 wrap (셀렉터 또는 element 값)
});
api.flicking.search('키값').on();
api.flicking.search('키값').off();
api.flicking.search('키값').slide({'index': '', 'duration': '슬라이드 이동 속도'});

// 기존 설정된 플리킹 인스턴스 검색
if(api.flicking.search('key값')) {
	api.flicking.search('key값').off();
}
````


----

### api.state.js

상태관리

````javascript
var state = api.state();

// key 로 설정된 event.action 값이 true 로 설정될 경우, handler 실행 
state.on({
	'key': 'event.action',
	'value': true,
	'handler': function() {
		that.setBlockMoveOn();
	}
});
state.get('event.action');
state.set({'key': 'event.action', 'value': true});
````


----

### api.template.js (템플릿 엘리먼트, 템플릿 리터럴 등 표준사용 권장)

템플릿 {{tag}}

CommonJS, AMD 지원

````html
<!-- 템플릿 //-->
<script id="template" type="text/template">
<p>Use the <strong>{{=power}}</strong>, {{=title}}!</p>

{{<people>}}
	<p class="{{=test}}">{{=title}}</p>
	{{<deep>}}
		<div>{{=ysm}}</div>
		{{<haha>}}
			{{=ysm}}
		{{</haha>}}
	{{</deep>}}
{{</people>}}
<p>ysm</p>
</script>

<!-- json 데이터 //-->
<script>
var template = document.getElementById('template').innerHTML;
var contents = {
	'power': 'aa',
	'title': 'bb',
	'people': [
		{'test': 'ysm', 'title': 'cc', 'deep': {'ysm': 'aaa', 'haha': {'ysm': '유성민'}}},
		{'title': 'cc', 'deep': {'ysm': 'bbb', 'haha': false}}
	]
};

// 방법1
var parse = api.template.parse(template);
var paint = api.template.paint(parse, contents);
document.getElementById('target').innerHTML = paint;

// 방법2
document.getElementById('target').innerHTML = api.template.paint(template, contents);

// 방법3
document.getElementById('target').appendChild(api.template.fragment(template, contents));
</script>
````


----

### api.validate.js

유효성검사

api.validate.isText(value)
- text 빈값 검사

api.validate.isNumber(value)
- number 값 검사

api.validate.isDate(value)
- 날짜타입 검사

api.validate.isEmail(value)
- 이메일타입 검사

api.validate.isUrl(value)
- URL타입 검사

api.validate.isEqualTo(value, string)
- 글자 포함여부

api.validate.isMinlength(value, number)
- 최소글자

api.validate.isMaxlength(value, number)
- 최대글자

api.validate.isMin(value, number)
- 최소값

api.validate.isMax(value, number)
- 최대값

api.validate.isPhone(value)
- 전화번호

api.validate.isExtension(value, extension)
- 확장자 extension : jpg,jpeg,gif,png,pdf,hwp,exl

api.validate.isSelect(element)
- select 검사

api.validate.isCheck(element)
- checkbox, radio 등 검사


----

### api.util.js

기능

api.util.inherit(객체, 상속할 객체)
- 함수객체 상속

api.util.clone(복사대상, 하위까지 복사여부)
- 깊은 복사

api.util.jsonDeepCopy(원본, 복사대상)
- json 깊은 복사

api.util.sizePercent(대상, 컨텐츠)
- 반응형 공식에 따른 계산값 반환

api.util.stopCapture(이벤트)
- 이벤트의 기본 동작 중단

api.util.stopBubbling(이벤트)
- 이벤트의 전파 중단

api.util.stopEventDelivery(이벤트)
- 이벤트의 기본동작, 전파 모두 중단

api.util.startCall(callback, seconds)
- setTimeout

api.util.closeCall(time)
- clearTimeout

api.util.startTime(callback, seconds)
- setInterval

api.util.closeTime(time)
- clearInterval

api.util.type(값)
- 타입반환

````javascript
api.util.type({a: 4}); //"object"
api.util.type([1, 2, 3]); //"array"
(function() { console.log(api.util.type(arguments)); })(); //arguments
api.util.type(new ReferenceError); //"error"
api.util.type(new Date); //"date"
api.util.type(/a-z/); //"regexp"
api.util.type(Math); //"math"
api.util.type(JSON); //"json"
api.util.type(new Number(4)); //"number"
api.util.type(new String("abc")); //"string"
api.util.type(new Boolean(true)); //"boolean"
````

api.util.trim(값)
- 좌우 공백 제거 

api.util.stripTags(값);
- html 제거

api.util.keyboardCode(이벤트)
- 키보드 이벤트 값 반환

api.util.sleep(milliSeconds)
- 대기 상태 실행

api.util.leftFormatString(add, value, count)
- value 앞에 count 수만큼 add를 채운다	

api.util.stringByteLength(값)
- 글자 Byte 수 출력

api.util.fragmentHtml(html)
- fragment 에 html 삽입 후 반환

api.util.empty(element)
- TextNode 포함 내부 element 전체제거

api.util.windowPopup(url, name, width, height, features)
- 윈도우 팝업


api.util.isObject(value)
- 오브젝트 여부 true/false

api.util.isArray(value)
- 배열여부 true/false

api.util.isNumber(value)
- 숫자여부 true/false

api.util.isString(value)
- 문자여부 true/false

api.util.isBoolean(value)
- boolean 여부 true/false

api.util.isNodeList(value)
- 노드 여부 true/false

api.util.isHtmlElement(value)
- html 엘리먼트 여부 true/false

api.util.isFunction(value)
- 함수 여부 true/false

api.util.isUndefined(value)
- undefined 여부 true/false

api.util.isJSON(value)
- json 여부 true/false



api.util.numberUnit(value)
- 숫자값 단위값 분리

api.util.numberReturn(value)
- 숫자만 추출

api.util.numberFormat(value)
- 정수값을 금액단위로 표현

api.util.floatFormat(value)
- 소수점값을 금액단위로 표현

api.util.removeComma(value)
- 금액단위 표현 제거

api.util.round(값, 자릿수)
- 지정자리 반올림

api.util.floor(값, 자릿수)
- 지정자리 버림

api.util.ceiling(값, 자릿수)
- 지정자리 올림



api.util.dateSpecificInterval()
- 몇일째 되는날

````javascript
api.util.dateSpecificInterval({'year': year, 'month': month, 'day': day}, 10); // +10일
api.util.dateSpecificInterval({'instance': tmp}, -19); // -19일
````

api.util.dateBetween(시작일2015-10-27, 종료일2015-12-27)
- 날짜차이

api.util.lastday(년도, 월);
- 해당 년월의 마지막 날짜


----

### api.script.js (IE하위버전 일부오류, 개발보류, 표준사용권장)

js 파일 동적로딩, 의존성관리, 모듈화

````javascript
// 사용예 1
api.script('js load 파일');

// 사용예 2
api.script(['js load 파일 리스트']);

// 사용예 3
api.script(
	'js load 파일', 
	function(js파일실행반환값) {
		// 성공콜백
	},
	function() {
		// 실패콜백
	}
);


// 의존성관리(해당 코드를 실행시키는데 종속적인 파일 리스트)
// 모듈화(리턴값을 글로벌 스코프가 아닌 콜백함수의 스코프로 제한)

// 사용예 1
api.box(반환객체);

// 사용예 2
api.box([종속된 객체 리스트], function(종속된 객체) {
	return 반환객체;
});

````

----

### jquery.olivemarker.js (현재 개발버전)

이미지 등 마커 올리기 

````javascript
$('#markerTarget').oliveMarker({
    mode: 'display', // admin, display
    target: '', // 셀렉터
    prior: '', // percent, pixel (% 우선적용 또는 px 우선적용 설정)
    markerWidth: 10, // 마커 크기 
    markerHeight: 10, // 마커 크기 
    isTooltipVisibility: false, // 툴팁을 처음부터 보이도록 할 것인가 설정 
    isTooltipToggle: true, // 툴팁 toggle 사용여부
    isResizeEvent: false, // 윈도우 리사이즈에 따른 이벤트 설정여부
    submit: { // 마커정보 submit 여부
        action: '', // url
        method: 'get' // form method
    },
    // 마커 템플릿 (Admin 사용)
    template: '\
        <div data-marker="marker">\
            <div data-marker="mark"></div>\
            <div data-marker="tooltip">\
                \
            </div>\
        </div>\
    ',
    // target 내부 설정된 값으로 element 를 찾는다. 
    selectors: {
        image: '[data-marker="image"]',
        marker: '[data-marker="marker"]',
        mark: '[data-marker="mark"]',
        tooltip: '[data-marker="tooltip"]',
        tooltipShowButton: '[data-marker="tooltipShow"]',
        tooltipHideButton: '[data-marker="tooltipHide"]',
        submit: '[data-marker="submit"]'
    },
    // style class
    classes: {
        image: 'marker-image',
        marker: 'marker-marker',
        mark: 'marker-mark',
        tooltip: 'marker-tooltip'
    },
    // 콜백 
    listeners: {
        initialize: null,
        append: null,
        remove: null,
        tooltip: null, // show / hide 
        submit: null
    }
});
````


----

##### The MIT License (MIT)
##### Copyright (c) Sung-min Yu
