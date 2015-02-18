/*
Ajax

The MIT License (MIT)
Copyright (c) Sung-min Yu 
*/

;void function(global) {
	'use strict'; // ES5
	if(typeof global === 'undefined' || typeof global.api === 'undefined' || typeof global.api.ajax !== 'undefined') return false;

	global.api.ajax = function(parameter) {

		var that = this;

		// XMLHttpRequest 인스턴스
		that.instance = null; 
		if(!that.instance) {
			if(window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
				that.instance = new XMLHttpRequest();
			}else { // code for IE6, IE5
				that.instance = new ActiveXObject("Microsoft.XMLHTTP");
			}
		}

		// settings
		var parameter = parameter || {}; // 사용자 설정값
		var settings = { // 기본 설정값
			'type': 'GET', // GET이나 POST 같은 HTTP 메서드 타입
			'url': '', // 요청할 URL 주소
			'async': true, // 동기/비동기 방식

			'data': undefined, // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
			'context': window, // 콜백함수 내부에서 this 키워드로 사용할 객체
			'dataType': 'text', // 서버 측에서 응답반을 데이터의 혁식을 문자열로 지정 (json, xml, text)

			'beforeSend': undefined, // 요청하기 전 실행할 콜백 함수
			'complete': undefined, // 요청이 끝난 후 실행할 콜백 함수
			'success': undefined // 요청이 성공했을 때 실행할 콜백 함수
		};
		for(var key in settings) {
			if(settings.hasOwnProperty(key)) {
				if(parameter[key]) {
					settings[key] = parameter[key];
				}
			}
		}
		
		// 유효성 검사
		if(settings.type.toLowerCase() !== 'get' && settings.type.toLowerCase() !== 'post') { // HTTP 타입
			return false;
		}
		if(typeof settings.url !== 'string' || settings.url.replace(/\s/g, '') == '') { // url
			return false;
		}
		if(typeof settings.async !== 'boolean') { // 동기/비동기 
			return false;	
		}

		// 데이터 검사
		if(typeof settings.data === 'object') {
			var arr = [];
			for(var name in settings.data) {
				if(settings.data.hasOwnProperty(name)) {
					arr.push(name + '=' + settings.data[name]);
				}
			}
			settings.data = arr.join('&');
		}else if(typeof settings.data != 'string') {
			settings.data = null;
		}

		// 상태처리
		that.instance.onreadystatechange = function() {
			switch(that.instance.readyState) {
				case 0: // 객체만 생성되고 아직 초기화되지 않은 상태(open 메소드가 호출되지 않음)
					if(typeof settings.beforeSend === 'function') {
						settings.beforeSend.call(settings.context);
					}
					break;
				case 1: // open 메소드가 호출되고 아직 send 메소드가 불리지 않은 상태
				case 2: // send 메소드가 불렸지만 status와 헤더는 도착하지 않은 상태
					// 연결 진행
					break;
				case 3: // 데이터의 일부를 받은 상태
					if(typeof settings.complete === 'function') {
						settings.complete.call(settings.context);
					}
					break;
				case 4: // 데이터를 전부 받은 상태
					if(that.instance.status === 200) { // 요청 성공
						var data;
						if(settings.dataType.toLowerCase() === 'xml') {
							data = that.instance.responseXML;
						}else {
							data = that.instance.responseText;
							if(settings.dataType.toLowerCase() === 'json') {
								data = JSON.parse(data);
							}
						}
						if(typeof settings.success === 'function') {
							settings.success.call(settings.context, data);
						}
					}else { // 문제 발생
						// 403(접근거부), 404(페이지없음), 500(서버오류발생)
					}
					break;
			}
		};

		// 요청
		that.instance.open(settings.type, settings.url, settings.async);
		that.instance.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		that.instance.send(settings.data);
	};

}(window);