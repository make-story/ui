
Thinking 
====
_작업시 고민했던 부분_

<br />
### ';' 시작하는 이유

>자바스크립트 파일을 합칠 때 이전 파일에 ;(세미콜론)이 빠졌을 경우
개발자 의도와 다르게 실행되는 것을 방지

<pre>
;void function(global) {   ...
</pre>

<br />
### 'ECMAScript 5' 환경을 위해 'use strict' 를 사용하였습니다. (전역으로 사용하지 않음)

>실제로는 기능을 추가한 것이 아니라 제거함으로써 프로그램을 더 간단하게 만들고 오류 발생 가능성을 낮춘 것이다.
스트릭트 모드는 'use strict'라는 일반 문자열에 의해서 구동되며 이전 버전에서는 단순하게 무시된다. 
즉, 구형 브라우저는 스트릭트 모드를 이해하지 못하고 오류를 발생하지도 않기 때문에 하위 호환성이 유지된다.

<br />
### One-Global 접근법 사용

>api 라는 전역 변수를 통해 각 로직(프로퍼티)에 접근합니다.

<pre>
var api = {};
api.code. ...
api.dom. ...
api.ajax ...
</pre>

<br />
### Zero-Global 접근법 사용

>각 로직이 전역변수에 오염되지 않도록 또는 전역변수를 오염시키지 않도록 별도의 스코프 공간에서 작업합니다.

<pre>
(function() {
	"use strict";
	...
})();
</pre>

<br />
### 초기화 시점 분기

>어떤 조건이 프로그램의 생명주기 동안 변경되지 않는 게 확실한 경우, 조건을 단 한 번만 확인하는 것이 바람직하다.
브라우저 탐지(또는 기능 탐지)가 전형적인 예다.
예를 들어, XMLHttpRequest가 내장 객체로 지원되는 걸 확인했다면, 프로그램 실행 중에 브라우저가 바뀌어 난데없이 ActiveX 객체를 다루게 될 리는 없다.
실행 환경은 변하지 않기 때문에 코드가 XHR 객체를 지원하는지 매번 다시 확인할 필요가 없다.(확인한다 해도 결과는 같을 것이다.)

<pre>
(function() {
	if(typeof window.addEventListener === 'function') {
		return function(elem, events, handlers, capture) {
			elem.addEventListener(events, handlers, capture);
		}
	}else if(typeof document.attachEvent === 'function') { // IE
		return function(elem, events, handlers) {
			elem.attachEvent('on' + events, handlers);
		}
	}
})();
</pre>

<br />
### 이름 규칙

>__함수, 메소드:__ 낙타표기법(소문자로 시작하고 새로운 단어를 사용할 때마다 첫 문자는 대문자로 입력하는 방식)

>__변수:__ _ 사용

>__생성자:__ 파스칼 표기법(낙타 표기법과 유사하지만, 낙타 표기법과 다르게 첫 글자는 대문자로 시작)

<br />
### 들여쓰기

>탭을 이용한 들여쓰기 방식을 사용하고 있습니다.

<br />
### 'undefined' 를 임의로 수정하지 않습니다.

>해당 프로젝트에 대해 undefined, null 사용구분

>__undefined:__ 변수가 선언되어 있지 않았을 때를 판단

>__null:__ 변수는 선언되어 있으나 초기화되었을 때를 판단

<br />
### 함수 Object 실행단계에 따른 설계
1. 실행 콘텍스트 환경을 설정
2. 함수 안의 전체코드에서 함수선언문의 함수를 Function Object 로 생성
3. 다시 함수의 처음으로 올라가 변수를 바인딩(undefined)
4. 다시 함수의 처음으로 돌아가 코드를 실행

<pre>
code
</pre>

<br />
### demos 마크업

> html5 마크업 사용

<br />
API
====

###1. library: api.core.js
---
- *브라우저 정보, 해상도, 사용자 정보 등 확인*

> api.core.check: 모바일, 터치 등 정보 (true | false)

> api.core.device: pc | tablet | mobile

> api.core.browser: 브라우저명, 버전 등 정보

> api.core.screen: 해상도 정보

> api.core.event: 이벤트 정보

> api.core.css: 벤더프리픽스

> api.core.script: script 동적로딩, 의존성관리, 모듈화

<pre>
api.script(
	['./test1.js', './test2.js', 'test3.js'], 
	function() {
		// 성공콜백
	}, 
	function() {
		// 에러콜백
	}
);

api.script('test.js', function() {
	// 성공콜백
});

api.script('test1.js', function() {
	api.script(['test2.js'], function() {
		// ...
	});
})
</pre>


###2. library: api.dom.js
---
- *DOM 제어*
- 대표적인 UI 컴포넌트 jQuery 의 기능(메소드)을 네이티브로 구현해 보는 것에 목적이 있음

> selector: querySelectorAll 사용

> api.$(selector), api.dom.$(selector)

> api.ready(): readystatechange

> api.html(): createDocumentFragment html 동적생성

<pre>
api.dom.html({
	"parent": "#ysm", // 작업영역
	"child": [
		{
			"tag": "div", // Tag 명
			"attr": {"id": "a", "class": "a"}, // 속성
			"css": {"width": "100px", "height": "100px"}, // style
			"data": {"type": "folder", "instance": "a"}, // data-* (html5 표준)
			"html": "", // html
			"callback": function(element) { // element 만든 후 작업
				// ...
			},
			"child": [ // 내부 자식 element 리스트
				// ... 
			]
		}
	]
});
</pre>


> api.$(selector).find(): 하위 dom 검색

> api.$(selector).closest(): 상위 dom 검색 (비효율)

> api.$(selector).children(): 자식 리스트

> api.$(selector).childElementCount(): 자식 리스트 count

> api.$(selector).live(): 동적 이벤트

> api.$(selector).on(): 이벤트 설정

> api.$(selector).off(): 이벤트 해제

> api.$(selector).trigger(): 이벤트 강제실행

> api.$(selector).each(): element 순회

> api.$(selector).attr(): element 속성 확인/수정

> api.$(selector).removeAttr(): element 속성 삭제

> api.$(selector).hasAttr(): element 속성 존재여부

> api.$(selector).prop(): element property 확인/수정

> api.$(selector).removeProp(): element property 삭제

> api.$(selector).html(): element html 확인/수정

> api.$(selector).text(): element text 확인/수정

> api.$(selector).val(): element value 확인/수정

> api.$(selector).append(): 하위 요소 삽입

> api.$(selector).appendHtml(): 위치지정 html 삽입

> api.$(selector).remove(): 요소 삭제 

> api.$(selector).css(): css 확인/수정

> api.$(selector).getClass(): class 속성 확인

> api.$(selector).hasClass(): class 특성 속성값 존재여부

> api.$(selector).addClass(): class 속성값 추가

> api.$(selector).removeClass(): class 속성값 삭제

> api.$(selector).toggleClass(): class 속성값 toggle

> api.$(selector).data(): data (html5 data 속성) 

> api.$(selector).animate(): color, css3 적용 작업 진행중

> 그밖의 계속 추가중...


###3. library: api.ajax.js
---
- *Ajax 사용*

> api.ajax()

<pre>
api.ajax({
	'type': 'GET', // GET이나 POST 같은 HTTP 메서드 타입
	'url': '', // 요청할 URL 주소
	'async': true, // 동기/비동기 방식

	'data': undefined, // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
	'context': window, // 콜백함수 내부에서 this 키워드로 사용할 객체
	'dataType': 'text', // 서버 측에서 응답반을 데이터의 혁식을 문자열로 지정 (json, xml, text)

	'beforeSend': undefined, // 요청하기 전 실행할 콜백 함수
	'complete': undefined, // 요청이 끝난 후 실행할 콜백 함수
	'success': undefined // 요청이 성공했을 때 실행할 콜백 함수
});

api.ajax({
	'url': 'test.js',
	'success': function(data) {
		
	}
});
</pre>


#### plugin: api.popup.js
---
- *작업 진행중 입니다.*
- *api.dom.js 를 사용합니다.*
- div 팝업 기능을 제공합니다.


#### plugin: api.slide.js
---
- *작업 진행중 입니다.*
- *api.dom.js 를 사용합니다.*
- div 슬라이드 기능을 제공합니다.


#### plugin: api.validate.js
---
- *작업 진행중 입니다.*
- *api.dom.js 를 사용합니다.*
- input 등 유효성 검사 기능을 제공합니다.

====

#####The MIT License (MIT)
#####Copyright (c) Sung-min Yu
