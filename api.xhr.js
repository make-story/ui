/*
xhr (XMLHttpRequest level 2)

@version
0.1 (2015.07.07)

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.
*/

(function(api, global) {

	'use strict'; // ES5
	if(typeof global === undefined || global !== window || !('api' in global) || 'xhr' in global.api || !('XMLHttpRequest' in global)) {
		return false;
	}
	return api(global);

})(function(global) { 

	'use strict'; // ES5

	var xhr = function(parameter) {

		// settings
		var parameter = parameter || {}; // 사용자 설정값
		var settings = { // 기본 설정값
			'type': 'GET', // GET이나 POST 같은 HTTP 메서드 타입
			'url': '', // 요청할 URL 주소
			'async': true, // 동기/비동기 방식

			'file': {}, // xhr 전송할 파일 리스트
			'data': {}, // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
			'context': global || window, // 콜백함수 내부에서 this 키워드로 사용할 객체
			'dataType': 'text', // 서버 측에서 응답받을 데이터의 형식을 문자열로 지정 (json, text)

			//'beforeSend': undefined, // 요청하기 전 실행할 콜백 함수
			//'complete': undefined, // 요청이 끝난 후 실행할 콜백 함수
			'progressUpload': undefined, // 업로드 진행률 콜백 함수
			'progressDownload': undefined, // 다운로드 진행률 콜백 함수
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

		// XMLHttpRequest 인스턴스
		// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
		var instance = new XMLHttpRequest();
		if(typeof instance.withCredentials === undefined) {
			return false;
		}

		// 요청
		instance.open(settings.type, settings.url, settings.async);
		//instance.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		// http://www.html5rocks.com/en/tutorials/file/xhr2/?redirect_from_locale=ko
		instance.responseType = settings.dataType || 'text'; // arraybuffer || blob || document || json || text

		// data 처리
		var data, name, arr = [];
		switch(settings.type.toLowerCase()) {
			case 'get':
				if(typeof settings.data === 'object' && Object.keys(settings.data).length > 0) {
					for(name in settings.data) {
						if(settings.data.hasOwnProperty(name)) {
							arr.push(name + '=' + settings.data[name]);
						}
					}
					data = arr.join('&');	
				}
				break;
			case 'post':
				// FormData: https://developer.mozilla.org/en-US/docs/Web/API/FormData
				data = new FormData(); 
				if(typeof settings.data === 'string' && settings.data !== '') {

				}else if(typeof settings.data === 'object' && Object.keys(settings.data).length > 0) {
					for(name in settings.data) {
						if(settings.data.hasOwnProperty(name)) {
							data.append(name, settings.data[name]);	
						}
					}
				}
				// file
				if(typeof settings.data === 'object' && Object.keys(settings.file).length > 0) {
					for(name in settings.file) {
						if(settings.file.hasOwnProperty(name) && 'files' in settings.file[name]) {
							data.append(name, settings.file[name].files[0]);
						}
					}
				}
				break;
		}
			
		/*
		// 상태처리
		instance.onreadystatechange = function() {
			switch(instance.readyState) {
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
					if(instance.status === 200) { // 요청 성공
						var data;
						if(settings.dataType.toLowerCase() === 'xml') {
							data = instance.responseXML;
						}else {
							data = instance.responseText;
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
		*/

		// 업로드와 다운로드 진행율을 계산하는 콜백 함수를 단계적 응답 이벤트에 설정
		/*
		instance.addEventListener("progress", callback, false);
		instance.addEventListener("load", callback, false);
		instance.addEventListener("error", callback, false);
		instance.addEventListener("abort", callback, false);
		*/
		instance.upload.onprogress = function(event) {
			var total = event.total || 0;
			var loaded = event.loaded || 0;
			if(total && loaded && typeof settings.progressUpload === 'function') {
				//console.log((loaded / total) + '% uploaded');
				settings.progressUpload.call(settings.context, Number((100 / total) * loaded).toFixed(2));
			}
		};
		instance.onprogress = function(event) {
			var total = event.total || 0;
			var loaded = event.loaded || 0;
			if(total && loaded && typeof settings.progressDownload === 'function') {
				//console.log((loaded / total) + '% downloaded');
				settings.progressDownload.call(settings.context, Number((100 / total) * loaded).toFixed(2));
			}
		};

		// 완료
		instance.onload = function(event) {
			if(this.status === 200) { // 요청 성공
				//console.log('finished');
				//console.log(this.response);

				// Note: .response instead of .responseText
				//var blob = new Blob([this.response], {type: 'image/png'});

				var data = instance.responseText;
				if(settings.dataType.toLowerCase() === 'json') {
					data = JSON.parse(data);
				}
				if(typeof settings.success === 'function') {
					settings.success.call(settings.context, data);
				}
			}else { // 문제 발생
				// 403(접근거부), 404(페이지없음), 500(서버오류발생)
			}
		};

		// 에러
		instance.onerror = function(event) {
			console.log('error');
			console.log(event);
		};

		// 전송 데이터
		instance.send(data);
	};
	
	// api box 기능을 사용할 경우
	if(api.box && typeof api.box === 'function') {
		return api.box(xhr);
	}else {
		global.api.xhr = xhr;
	}

}, this);
