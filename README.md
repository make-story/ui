#####The MIT License (MIT)<br />Copyright (c) Sung-min Yu
==
###Thinking (코딩 이슈)

- ';' 시작하는 이유

>자바스크립트 파일을 합칠 때 이전 파일에 ;(세미콜론)이 빠졌을 경우
개발자 의도와 다르게 실행되는 것을 방지

<pre>
;void function(global) {   ...
</pre>

<br />
- 'ECMAScript 5' 환경을 위해 'use strict' 를 사용하였습니다. (전역으로 사용하지 않음)

>실제로는 기능을 추가한 것이 아니라 제거함으로써 프로그램을 더 간단하게 만들고 오류 발생 가능성을 낮춘 것이다.
스트릭트 모드는 'use strict'라는 일반 문자열에 의해서 구동되며 이전 버전에서는 단순하게 무시된다. 
즉, 구형 브라우저는 스트릭트 모드를 이해하지 못하고 오류를 발생하지도 않기 때문에 하위 호환성이 유지된다.

<br />
- One-Global 접근법 사용

>api 라는 전역 변수를 통해 각 로직(프로퍼티)에 접근합니다.

<pre>
var api = {};
api.code. ...
api.dom. ...
api.ajax ...
</pre>

<br />
- Zero-Global 접근법 사용

>각 로직이 전역변수에 오염되지 않도록 또는 전역변수를 오염시키지 않도록 별도의 스코프 공간에서 작업합니다.

<pre>
(function() {
	"use strict";
	...
})();
</pre>

<br />
- 초기화 시점 분기

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
- 이름 규칙

>__함수, 메소드:__ 낙타표기법(소문자로 시작하고 새로운 단어를 사용할 때마다 첫 문자는 대문자로 입력하는 방식)

>__변수:__ _ 사용

>__생성자:__ 파스칼 표기법(낙타 표기법과 유사하지만, 낙타 표기법과 다르게 첫 글자는 대문자로 시작)

<br />
- 들여쓰기

>탭을 이용한 들여쓰기 방식을 사용하고 있습니다.

<br />
- 'undefined' 를 임의로 수정하지 않습니다.

>해당 프로젝트에 대해 undefined, null 사용구분

>__undefined:__ 변수가 선언되어 있지 않았을 때를 판단

>__null:__ 변수는 선언되어 있으나 초기화되었을 때를 판단

<br />
- 함수 Object 실행단계에 따른 설계

<pre>
code
</pre>

==
####1. library: api.core.js
>- *브라우저 정보, 해상도, 사용자 정보 등 확인*

####2. library: api.dom.js
>- *DOM 제어*

####3. library: api.ajax.js
>- *Ajax 사용*

==
##### plugin: api.popup.js
>- *api.dom.js 를 사용합니다.*


##### plugin: api.slide.js
>- *api.dom.js 를 사용합니다.*


##### plugin: api.validate.js (설계 진행)
>- *api.dom.js 를 사용합니다.*


