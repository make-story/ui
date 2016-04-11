
api.dom - 클라이언트 환경정보, DOM handling

	api.key()
		일반적인 고유값 반환

	api.env.check.mobile
		모바일 디바이스 여부 true/false
	api.env.check.touch
		터치 디스플레이 여부 true/false
	api.env.check.transform
		트랜스폼 지원 브라우저 여부 true/false
	api.env.check.transition
		트랜지션 지원 브라우저 여부 true/false
	api.env.check.animation
		애니메이션 지원 브라우저 여부 true/false
	api.env.check.fullscreen
		풀스크린 지원 브라우저 여부 true/false

	api.env.monitor
		사용자 해상도 종류 pc/mobile/tablet

	api.env.screen.width
		해상도 width
	api.env.screen.height
		해상도 height

	api.env.browser.name
		브라우저 종류
	api.env.browser.version
		브라우저 버전
	api.env.browser.scrollbar
		브라우저 스크롤바 영역 가로 픽셀

	api.env.event.resize
		resize/orientationchange
	api.env.event.down
		mousedown/touchstart
	api.env.event.move
		mousemove/touchmove
	api.env.event.up
		mouseup/touchend
	api.env.event.click
		click/tap
	api.env.event.transitionend
		transitionend/webkitTransitionEnd/oTransitionEnd/MSTransitionEnd
	api.env.event.animationstart
		animationstart/webkitAnimationStart/oanimationstart/MSAnimationStart
	api.env.event.animationiteration
		animationiteration/webkitAnimationIteration/oanimationiteration/MSAnimationIteration
	api.env.event.animationend
		animationend/webkitAnimationEnd/oanimationend/MSAnimationEnd


	api.dom(selector, [context])
		요소 검색

	.ready(handler)
		Document ready callback

	.get(index)
		검색된 요소 중 index 번째 요소 반환 또는 전체반환

	.find(selector)
		context 내부 요소 검색

	.each(callback)
		요소을 순회하면서 각 요소를 매개변수로 지정한 콜백함수를 호출한다.

	.closest(selector, context)
		상위 요소 검색

	.children()
		자식요소 리스트

	.getClass()
		요소 class 리스트 반환

	.hasClass(name)
		해당 class명 포함여부 true/false

	.addClass(name)
		요소에 class명 추가

	.removeClass(name)
		해당 class명 삭제

	.toggleClass(name)
		해당 class 추가 또는 삭제

	.html(value)
		요소에 html 삽입

	.text(value)
		요소에 text 삽입

	.val(value)
		요소에 value 삽입

	.css({name: value})
	.css(name)
		요소 style property 추가 또는 반환

	.width(value)
		요소의 width 값 반환

	.innerWidth()
		요소의 width + padding 값 반환

	.outerWidth(is)
		요소의 width + padding + border + [margin] 값 반환

	.height(value)
		요소의 height 값 반환

	innerHeight()
		요소의 height + padding 값 반환

	.outerHeight(is)
		요소의 height + padding + border + [margin] 값 반환	

	.attr({name: value})
	.attr(name)
		요소에 attribute 추가 또는 반환

	.removeAttr(name)
		해당 attribute 삭제

	.hasAttr(name)
		해당 attribute 포함여부 true/false

	.prop({name: value})
	.prop(name)
		요소에 property 추가 또는 반환

	.removeProp(name)
		해당 property 삭제

	.remove()
		요소 제거

	.clone(is)
		요소 복사
		is : 자식 노드들도 모두 복제할지 여부(true:복사, false:해당없음)

	.prepend(value)
		요소의 앞에 추가하기

	.append(value)
		마지막 자식 요소 추가

	.after(value)
		뒤에 추가

	.before(value)
		앞에 추가

	.insertBefore(value)
		앞에 추가

	.replaceWith(value)
		요소 바꾸기

	.on(events, handlers, [capture])
		이벤트 바인딩

	.off(events)
		이벤트 해제

	.one(events, handlers, [capture])
		이벤트 발생하면 바인딩 자동해제

	.trigger(events)
		지정한 이벤트 타입의 이벤트를 발생시켜 이벤트 핸들러 함수를 실행한다.

	.data(value)
		데이터 추가 또는 반환

	.scroll()
	.scroll({name: value})
		브라우저 스크롤 위치설정 또는 위치반환

	.contains(value)
		특정 노드가 다른 노드 내에 포함되었는지 여부


	api.extend({name: value})
	api.fn.extend({name: value})
		api.dom 객체 또는 prototype 에 기능추가

----------

	api.touch.on(selector, handlers)
		더블터치, 딜레이터치, 원터치 이벤트 설정

		사용예:
		“`
		api.touch.on('#ysm', 
			{
				'one': function(e) {
					console.log('one touch');
				},
				'two': function(e) {
					console.log('two touch');
				},
				'delay': function(e) {
					console.log('delay touch');
				}
			}
		);
		“`

	api.touch.off(selector, eventkey);
		터치 이벤트 해제
		eventkey: one, two, delay, all

		사용예:
		“`
		api.touch.off('#ysm', 'one'); // one 해제
		“`

----------

	
	api.animationFrameQueue({})
		requestAnimationFrame 애니메이션 리스트 실행

		사용예:
		“`
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

		api.animationFrameQueue({
			'element': '.h2', 
			'style': {
				'left': '100px', 
				'top': '100px', 
				'width': '100px', 
				'height': '100px'
			}
		});
		“`

	api.animationQueue({})
		애니메이션 리스트 실행 (class 값으로 제어)

		사용예:
		“`
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

		api.animationQueue({
			'element': api.dom('#view'), 
			'animation': 'pt-page-moveToLeft', 
			'complete': function() { ... }
		});
		“`

	api.transitionQueue({})
		트랜지션 리스트 실행

		사용예:
		“`
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

		api.transitionQueue({
			'element': api.dom('#view'), 
			'transition': {
				'left': '100px', 
				'top': '100px'
			}
		});
		“`


----------


api.editor - 텍스트에디터 라이브러리

	사용예:
	“`
	api.editor.on(api.dom('#editor').get(0)); // 해당요소 에디터 설정
	api.editor.off(api.dom('#editor').get(0)); // 해당요소 에디터 해제
	“`


----------


api.flicking - 플리킹 라이브러리

	사용예: 
	“`
	var instance = api.flicking.setup({
		'key': '', // 플리킹 작동 고유키 (옵션)
		'total': 0, // 전체 슬라이드 수 (필수)
		'width': 0, // 슬라이드 width 픽셀값 (필수)
		'element': null, // 플리킹 element (필수)
		'speed': 300, // 플리킹 속도 (기본값: 300)
		'touch': true, // 터치 또는 클릭으로 슬라이드 작동여부 (기본값: true)
		'callback': null, // 플리킹 작동 callback
		'transitionend': null // 플리킹 transitionend 이벤트 callback
	});
	instance.on(); // 플리킹 터치(또는 클릭) 이벤트 On
	instance.off(); // 플리킹 터치(또는 클릭) 이벤트 Off
	instance.slide({
		'value': '', // 슬라이드 이동(숫자값: 해당슬라이드 index 이동, 문자값: 'next' 다음슬라이드 이동 'prev' 이전슬라이드 이동)
	});

	instance = api.flicking.instance(key); // key에 해당하는 플리킹 인스턴스값 반환
	“`


----------


api.modal - 팝업 라이브러리

	레이어 사용예:
	“`
	api.modal.setup({
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
	“`

	Confirm 사용예:
	“`
	api.modal.setup({
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
	“`

	Alert 사용예:
	“`
	api.modal.setup({
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
	“`

	Push 사용예:
	“`
	api.modal.setup({
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
	“`


----------


api.socket - WebSocket 라이브러리

	사용예:
	“`
	api.socket({
		'url': 'ws://', // 필수
		'open': 'open 콜백',
		'send': '서버전송 메시지',
		'message': '서버로 부터 받은 메시지 콜백',
		'error': '에러 콜백'
	});

	var socket = api.socket({'url': 'ws://'});
	socket.message(function(data) {
		// 서버로 부터 받은 메시지
	});
	socket.send('서버로 전송 데이터');
	“`


----------


api.template - 템플릿 {{tag}} 라이브러리

	사용예:
	“`
	<script id="template" type="text/template">
	<p>Use the <strong>{{=power}}</strong>, {{=title}}!</p>

	{{<people}}
		<p class="{{=test}}">{{=title}}</p>
		{{<deep}}
			<div>{{=ysm}}</div>
			{{<haha}}
				{{=ysm}}
			{{haha>}}
		{{deep>}}
	{{people>}}
	<p>ysm</p>
	</script>

	<script>
	var parse = api.template.parse(document.getElementById('template').innerHTML);
	var paint = api.template.paint(parse, {
		'power': 'aa',
		'title': 'bb',
		'people': [
			{'test': 'ysm', 'title': 'cc', 'deep': {'ysm': 'aaa', 'haha': {'ysm': '유성민'}}},
			{'title': 'cc', 'deep': {'ysm': 'bbb', 'haha': false}}
		]
	});
	document.getElementById('target').innerHTML = paint;
	</script>
	“`


----------


api.validate - 유효성검사 라이브러리 (nodeJS 에서 사용가능)

	api.validate.isText(value)
		text 빈값 검사

	api.validate.isNumber(value)
		number 값 검사

	api.validate.isDate(value)
		날짜타입 검사

	api.validate.isEmail(value)
		이메일타입 검사

	api.validate.isUrl(value)
		URL타입 검사

	api.validate.isEqualTo(value, string)
		글자 포함여부

	api.validate.isMinlength(value, number)
		최소글자

	api.validate.isMaxlength(value, number)
		최대글자

	api.validate.isMin(value, number)
		최소값

	api.validate.isMax(value, number)
		최대값

	api.validate.isPhone(value)
		전화번호

	api.validate.isExtension(value, extension)
		확장자 
		extension : jpg,jpeg,gif,png,pdf,hwp,exl


----------


api.xhr - XMLHttpRequest (레벨2) 라이브러리

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

	사용예 (파일전송)
	“`
	var from = new FormData(api.dom('#form').get(0));
	api.xhr({
		'type': 'POST', 
		'url': '', 
		'data': from 
	});
	“`

----------


api.util - 각종 기능들 묶음

	api.util.inherit(객체, 상속할 객체)
		함수객체 상속

	api.util.clone(복사대상, 하위까지 복사여부)
		깊은 복사

	api.util.jsonDeepCopy(원본, 복사대상)
		json 깊은 복사

	api.util.sizePercent(대상, 컨텐츠)
		반응형 공식에 따른 계산값 반환

	api.util.stopCapture(이벤트)
		이벤트의 기본 동작 중단

	api.util.stopBubbling(이벤트)
		이벤트의 전파 중단

	api.util.stopEventDelivery(이벤트)
		이벤트의 기본동작, 전파 모두 중단

	api.util.startCall(callback, seconds)
		setTimeout

	api.util.closeCall(time)
		clearTimeout

	api.util.startTime(callback, seconds)
		setInterval

	api.util.closeTime(time)
		clearInterval

	api.util.type(값)
		type({a: 4}); //"object"
		type([1, 2, 3]); //"array"
		(function() {console.log(type(arguments))})(); //arguments
		type(new ReferenceError); //"error"
		type(new Date); //"date"
		type(/a-z/); //"regexp"
		type(Math); //"math"
		type(JSON); //"json"
		type(new Number(4)); //"number"
		type(new String("abc")); //"string"
		type(new Boolean(true)); //"boolean"

	api.util.trim(값)
		좌우 공백 제거 

	api.util.keyboardCode(이벤트)
		키보드 이벤트 값 반환

	api.util.sleep(milliSeconds)
		대기 상태 실행

	api.util.setLeftFormatString(add, value, count)
		value 앞에 count 수만큼 add를 채운다	

	api.util.setFragmentHtml(html)
		fragment 에 html 삽입 후 반환

	api.util.setRequestAnimFrame(callback)
		requestAnimationFrame

	api.util.setCancelAnimFrame(time)
		cancelAnimationFrame

	api.util.getNumberUnit(value)
		숫자값 단위값 분리

	api.util.isNumeric(value)
		숫자여부 확인

	api.util.getNumber(value)
		숫자만 추출

	api.util.setNumberFormat(value)
		정수값을 금액단위로 표현

	api.util.setFloatFormat(value)
		소수점값을 금액단위로 표현

	api.util.setRemoveComma(value)
		금액단위 표현 제거

	api.util.setRound(값, 자릿수)
		지정자리 반올림

	api.util.setFloor(값, 자릿수)
		지정자리 버림

	api.util.setCeiling(값, 자릿수)
		지정자리 올림

	api.util.dateSpecificInterval()
		몇일째 되는날
		getDateSpecificInterval({'year': year, 'month': month, 'day': day}, 10); // +10일
		getDateSpecificInterval({'instance': tmp}, -19); // -19일

	api.util.dateBetween(시작일2015-10-27, 종료일2015-12-27)
		날짜차이

	api.util.lastday(년도, 월);
		해당 년월의 마지막 날짜
		

----------


api.script - js 파일 동적로딩

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


	의존성관리(해당 코드를 실행시키는데 종속적인 파일 리스트)
	모듈화(리턴값을 글로벌 스코프가 아닌 콜백함수의 스코프로 제한)

	// 사용예 1
	api.box(반환객체);

	// 사용예 2
	api.box([종속된 객체 리스트], function(종속된 객체) {
		return 반환객체;
	});


====

#####The MIT License (MIT)
#####Copyright (c) Sung-min Yu
