
# UI 컴포넌트

javascript

----

### api.dom.js

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

.offset()
- 현재요소 위치(좌표)값 반환

.position()
- 부모요소 기준 현재요소 위치(좌표)값 반환

.width(value)
- 요소의 width 값 반환

.innerWidth()
- 요소의 width + padding 값 반환

.outerWidth(is)
- 요소의 width + padding + border + [margin] 값 반환

.height(value)
- 요소의 height 값 반환

.innerHeight()
- 요소의 height + padding 값 반환

.outerHeight(is)
- 요소의 height + padding + border + [margin] 값 반환	

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

.on(events, handlers, [capture])
- 이벤트 바인딩

.off(events)
- 이벤트 해제

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

api.extend({name: value})
api.fn.extend({name: value})
- api.dom 객체 또는 prototype 에 기능추가

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

api.animationFrameQueue({})
- requestAnimationFrame 애니메이션 리스트 실행

````javascript
// 여러개 실행
api.animationFrameQueue([
	{
		'element': api.dom('#h2'), 
		'style': {
			'left': '100px',
			'top': '100px'
		}
	}, 
	{...}, 
	... 
]);
// 단일 실행
api.animationFrameQueue({
	'element': '.h2', 
	'style': {
		'left': '100px', 
		'top': '100px', 
		'width': '100px', 
		'height': '100px'
	}
});
````

api.animationQueue({})
- 애니메이션 리스트 실행 (class 값으로 제어)

````javascript
// 여러개 실행
api.animationQueue([
	{
		'element': api.dom('#view'), 
		'animation': 'pt-page-moveToRight'
	}, 
	{
		'element': api.dom('#list'), 
		'animation': 'pt-page-moveToRight'
	}
]);
// 단일 실행
api.animationQueue({
	'element': api.dom('#view'), 
	'animation': 'pt-page-moveToLeft', 
	'complete': function() { ... }
});
````

api.transitionQueue({})
- 트랜지션 리스트 실행

````javascript
// 여러개 실행
api.transitionQueue([
	{
		'element': api.dom('#view'), 
		'transition': {
			'left': '100px', 
			'top': '100px'
		}
	}, 
	{...}, 
	... 
]);
// 단일 실행
api.transitionQueue({
	'element': api.dom('#view'), 
	'transition': {
		'left': '100px', 
		'top': '100px'
	}
});
````


----

### api.editor.js

텍스트에디터

````javascript
// 해당요소 에디터 설정
api.editor.setup({
	'key': 'editor', // 에디터 작동 고유키 (선택)
	'target': '#editor', // 에디터 적용 element
	'submit': {
		'image': '', // 이미지 파일 전송 서버 url
		'opengraph': '' // 오픈그래프 반환 서버 url
	},
	'callback': { 
		'init': null
	}
});

// 해당요소 에디터 해제
api.editor.search('editor').off();

// 오픈그래프 반환 json 구조
{
	'msg': 'success', 
	'result': {
		'title': '페이지 제목',
		'description': '페이지 요약',
		'image': '이미지',
		'author': '원작자',
		'keywords': '키워드'
	}
}
````


----

### api.flicking.js

플리킹

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
	'callback': { // 플리킹 작동 callback (선택)
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

### api.modal.js

레이어

````javascript
// 레이어
var instance = api.modal.setup({
	'type': 'layer',
	'key': '',
	'position': 'center',
	'mask': null, 
	'callback': {
		'show': null,
		'hide': null
	},
	'target': '', // #id
	'close': '' // .class
});
instance.show(); // 열기
instance.hide(); // 닫기

/*
position 값:
topleft, topcenter, topright
bottomleft, bottomcenter, bottomright
centerleft, center, centerright
*/

// Rect (타겟위치를 기준으로 출력)
api.modal.setup({
	'type': 'rect', 
	'key': 'rect',
	'position': '', // 출력위치
	'target': '', // 출력레이어 타겟
	'rect': '' // 위치기준 타켓
}).toggle();

/*
position 값:
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
	'callback': {
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
position 값:
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
	'callback': {
		'show': null,
		'hide': null
	},
	'title': '',
	'message': ''
});
instance.change({'title': '', ...}); // 재설정
instance.show(); // 열기
instance.hide(); // 닫기
instance.remove(); // elememt 제거

/*
position 값:
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
	'callback': {
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
position 값:
topleft, topcenter, topright
bottomleft, bottomcenter, bottomright
centerleft, center, centerright
*/

// key에 해당하는 팝업 인스턴스값 반환
instance = api.modal.search(key); 
````


----

### api.socket.js

WebSocket

````javascript
var socket = api.socket({
	'url': 'ws://', // 필수
	'callback': {
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
````


----

### api.worker.js

Worker

````javascript
var worker = api.worker({
	'url': 'js파일위치', // 필수
	'callback': {
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

### api.template.js

템플릿 {{tag}}

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

### api.xhr.js

XMLHttpRequest (레벨2)

````javascript
api.xhr({
	'contentType': 'application/x-www-form-urlencoded',
	'type': 'GET', // GET, POST, DELETE, PUT 같은 HTTP 메서드 타입
	'url': '', // 요청할 URL 주소
	'async': true, // 동기/비동기 방식

	'data': {}, // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
	'context': global, // 콜백함수 내부에서 this 키워드로 사용할 객체
	'dataType': 'text', // 서버 측에서 응답받을 데이터의 형식을 문자열로 지정 (json, text, jsonp)

	'progressUpload': undefined, // 업로드 진행률 콜백 함수
	'progressDownload': undefined, // 다운로드 진행률 콜백 함수
	'beforeSend': undefined, // 요청하기 전 실행할 콜백 함수
	'complete': undefined, // 요청이 끝난 후 실행할 콜백 함수
	'success': undefined // 요청이 성공했을 때 실행할 콜백 함수
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

api.util.windowPopup(url, name, width, height, features)
- 윈도우 팝업

api.util.requestAnimFrame(callback)
- requestAnimationFrame

api.util.cancelAnimationFrame(time)
- cancelAnimationFrame

api.util.numberUnit(value)
- 숫자값 단위값 분리

api.util.isNumeric(value)
- 숫자여부 확인

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

### api.script.js

js 파일 동적로딩, 의존성관리, 모듈화
현재작업중

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

##### The MIT License (MIT)
##### Copyright (c) Sung-min Yu
