/**
 * event
 * 
 * CustomEvent
 * https://github.com/nhn/tui.code-snippet/blob/master/customEvents/customEvents.js
 */

// 인터넷 익스플로러 9 이상 (폴리필)
// https://developer.mozilla.org/ko/docs/Web/API/CustomEvent/CustomEvent
(function () {
	if ( typeof window.CustomEvent === "function" ) return false;
  
	function CustomEvent ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
	  	return evt;
	}
  
	CustomEvent.prototype = window.Event.prototype;
  
	window.CustomEvent = CustomEvent;
})();

// 이벤트 타입
export const EVENT_TYPE = {
    EVENT_TEST: 'EVENT_TEST', // test
};
// https://developer.mozilla.org/ko/docs/Web/Guide/Events/Creating_and_triggering_events
// https://ko.javascript.info/dispatch-events
// https://www.w3.org/TR/uievents/
// https://jeongah-story.tistory.com/157
/*
-
커스텀 이벤트 버블링 예시
const form = document.querySelector('form');
const textarea = document.querySelector('textarea');

// 새로운 이벤트를 생성하고, 버블링을 허용하며, "details" 프로퍼티로 전달할 데이터를 제공합니다
const eventAwesome = new CustomEvent('awesome', {
	bubbles: true,
	detail: { text: () => textarea.value }
});

// form 엘리먼트는 커스텀 "awesome" 이벤트를 리슨한 후 전달된 text() 메소드의 결과를 콘솔에 출력합니다
form.addEventListener('awesome', e => console.log(e.detail.text()));

// 사용자가 입력한대로, form 내의 textarea 는 이벤트를 디스패치/트리거하여 시작점으로 사용합니다
textarea.addEventListener('input', e => e.target.dispatchEvent(eventAwesome));


-
이벤트를 동적으로 생성하고 디스패칭하기
const form = document.querySelector('form');
const textarea = document.querySelector('textarea');

form.addEventListener('awesome', e => console.log(e.detail.text()));

textarea.addEventListener('input', function() {
	// 이벤트 즉시 생성 및 디스패치/트리거
	// 노트: 선택적으로, 우리는 "함수 표현"("화살표 함수 표현" 대신)을 사용하므로 "this"는 엘리먼트를 나타냅니다
	this.dispatchEvent(new CustomEvent('awesome', { bubbles: true, detail: { text: () => textarea.value } }))
});
*/

// 이벤트 추가
export const addCustomEventListener = (type, listener, options=false) => {
    if(Object.values(EVENT_TYPE).includes(type)) {
        document.addEventListener(type, listener, options);
    }else {
        throw 'event type error';
    }
};

// 이벤트 제거
export const removeCustomEventListener = (type, listener, options=false) => {
    if(Object.values(EVENT_TYPE).includes(type)) {
        document.removeEventListener(type, listener, options);
    }else {
        throw 'event type error';
    }
};

// 이벤트 디스패치
export const dispatchCustomEvent = (type, ...detail) => {
    if(Object.values(EVENT_TYPE).includes(type)) {
        document.dispatchEvent(new CustomEvent(type, { detail }));
    }else {
        throw 'event type error';
    }
};

// 기본적 사용자 이벤트
export const createEvent = (type='', options={}) => { 
	let { detail={}, } = options;
	/*
	-
	옵션값 
	{
		type: 이벤트 타입을 나타내는 문자열로 "click"같은 내장 이벤트, "my-event" 같은 커스텀 이벤트가 올 수도 있습니다.
		options:  두 개의 선택 프로퍼티가 있는 객체가 옵니다.
			bubbles: true/false – true인 경우 이벤트가 버블링 됩니다.
			cancelable: true/false – true인 경우 브라우저 '기본 동작’이 실행되지 않습니다. 자세한 내용은 커스텀 이벤트 섹션에서 살펴보겠습니다.
	}
	아무런 값도 지정하지 않으면 두 프로퍼티는 기본적으로 {bubbles: false, cancelable: false} 처럼 false 가 됩니다.
	

	-
	커스텀 이벤트 버블링 예시
	document.addEventListener("hello", function(event) { 
		// 버블링이 일어나면서 document에서 이벤트가 처리됨
		alert("Hello from " + event.target.tagName); // Hello from H1
	});

	// 이벤트(hello)를 만들고 elem에서 이벤트 디스패치
	let event = new Event("hello", {bubbles: true}); // (2)
	element.dispatchEvent(event);

	// document에 할당된 핸들러가 동작하고 메시지가 얼럿창에 출력됩니다.
	*/
	if(Object.keys(detail).length) {
		return createCustomEvent(type, options);
	}else {
		return new Event(type, options);	
	}
}

// mouse 등 UI 이벤트
export const createUIEvent = () => {
	/*
	UIEvent, FocusEvent, MouseEvent, WheelEvent, KeyboardEvent, ...
	
	let event = new MouseEvent("click", {
		bubbles: true,
		cancelable: true,
		clientX: 100,
		clientY: 100
	});
	alert(event.clientX); // 100
	*/
};