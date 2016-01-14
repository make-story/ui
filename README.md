
api.support - 클라이언트 환경정보, DOM 컴포넌트

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

	api.env.device
		사용자 디바이스 종류 pc/mobile/tablet

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

	.get(index)
		검색된 요소 중 index 번째 요소 반환 또는 전체반환

	.find(selector)
		context 내부 요소 검색

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

	.style({name: value})
	.style(name)
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


	api.touch.on(selector, handlers)
		더블터치, 딜레이터치, 원터치 이벤트 설정

	api.touch.off(selector);
		터치 이벤트 해제

	api.key()
		고유값 반환
	api.animationFrameQueue({})
		requestAnimationFrame 애니메이션 리스트 실행
	api.animationQueue({})
		class 애니메이션 리스트 실행
	api.transitionQueue({})
		트랜지션 리스트 실행

----------

api.flicking - 플리킹 라이브러리
	api.flicking.setup({
		key: '고유값',
		total: '슬라이드 총 개수',
		width: '슬라이드 하나기준 width',
		element: 'flicking 대상 element 값'
	});
	api.flicking.setOn({key: '이벤트 실행 플로킹 키값'});
	api.flicking.setOff({key: '이벤트 종료 플로킹 키값'});
	api.flicking.setSlideMove({
		key: '고유값',
		index: '이동할 index'
	});
	api.flicking.setSlideStop({key: '이동중인 슬라이드 정지할 고유값'});
	api.flicking.setSlideIndex({
		key: '고유값',
		value: '이동할 index 또는 next, prev'
	});

----------

api.popup - 팝업 라이브러리
	작업진행중

----------

api.xhr - XMLHttpRequest (레벨2) 라이브러리
	api.xhr({
		'type': 'GET', // GET이나 POST 같은 HTTP 메서드 타입
		'url': '', // 요청할 URL 주소
		'async': true, // 동기/비동기 방식

		'file': {}, // xhr 전송할 파일 리스트
		'data': {}, // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
		'context': global, // 콜백함수 내부에서 this 키워드로 사용할 객체
		'dataType': 'text', // 서버 측에서 응답받을 데이터의 형식을 문자열로 지정 (json, text, jsonp)

		'progressUpload': undefined, // 업로드 진행률 콜백 함수
		'progressDownload': undefined, // 다운로드 진행률 콜백 함수
		'success': undefined // 요청이 성공했을 때 실행할 콜백 함수
	});

----------

api.utility - 각종 기능들 묶음
	api.utility.inherit(객체, 상속할 객체)
		함수객체 상속
	api.utility.clone(복사대상, 하위까지 복사여부)
		깊은 복사
	api.utility.jsonDeepCopy(원본, 복사대상)
		json 깊은 복사
	api.utility.sizePercent(대상, 컨텐츠)
		반응형 공식에 따른 계산값 반환
	api.utility.stopCapture(이벤트)
		이벤트의 기본 동작 중단
	api.utility.stopBubbling(이벤트)
		이벤트의 전파 중단
	api.utility.stopEventDelivery(이벤트)
		이벤트의 기본동작, 전파 모두 중단
	api.utility.startCall(callback, seconds)
		setTimeout
	api.utility.closeCall(time)
		clearTimeout
	api.utility.startTime(callback, seconds)
		setInterval
	api.utility.closeTime(time)
		clearInterval
	api.utility.type(값)
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
	api.utility.trim(값)
		좌우 공백 제거 
	api.utility.keyboardCode(이벤트)
		키보드 이벤트 값 반환
	api.utility.sleep(milliSeconds)
		대기 상태 실행
	api.utility.setLeftFormatString(add, value, count)
		value 앞에 count 수만큼 add를 채운다	
	api.utility.setRequestAnimFrame(callback)
		requestAnimationFrame
	api.utility.setCancelAnimFrame(time)
		cancelAnimationFrame
	api.utility.getNumberUnit(value)
		숫자값 단위값 분리
	api.utility.isNumeric(value)
		숫자여부 확인
	api.utility.getNumber(value)
		숫자만 추출
	api.utility.setNumberFormat(value)
		정수값을 금액단위로 표현
	api.utility.setFloatFormat(value)
		소수점값을 금액단위로 표현
	api.utility.setRemoveComma(value)
		금액단위 표현 제거
	api.utility.setRound(값, 자릿수)
		지정자리 반올림
	api.utility.setFloor(값, 자릿수)
		지정자리 버림
	api.utility.setCeiling(값, 자릿수)
		지정자리 올림
	api.utility.dateSpecificInterval()
		몇일째 되는날
		getDateSpecificInterval({'year': year, 'month': month, 'day': day}, 10); // +10일
		getDateSpecificInterval({'instance': tmp}, -19); // -19일
	api.utility.dateBetween(시작일2015-10-27, 종료일2015-12-27)
		날짜차이
	api.utility.lastday(년도, 월);
		해당 년월의 마지막 날짜

====

#####The MIT License (MIT)
#####Copyright (c) Sung-min Yu
