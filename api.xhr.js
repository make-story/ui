/*
xhr (XMLHttpRequest level 2)

@version
0.1 (2015.07.07)

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

-
사용예 (파일전송)
var from = new FormData(api.dom('#form').get(0));
api.xhr({
	'type': 'POST', 
	'url': './action.php', 
	'async': true, 
	'data': from // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
});
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window || !('api' in global) || !('XMLHttpRequest' in global)) {
		return false;
	}
	global.api.xhr = factory(global);

})(function(global, undefined) { 

	'use strict'; // ES5

	var xhr = function(parameter) {

		// settings
		var parameter = parameter || {}; // 사용자 설정값
		var settings = { // 기본 설정값
			'type': 'GET', // GET이나 POST 같은 HTTP 메서드 타입
			'url': '', // 요청할 URL 주소
			'async': true, // 동기/비동기 방식

			//'file': {}, // xhr 전송할 파일 리스트
			'data': {}, // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
			'context': global, // 콜백함수 내부에서 this 키워드로 사용할 객체
			'dataType': 'text', // 서버 측에서 응답받을 데이터의 형식을 문자열로 지정 (json, text, jsonp)

			//'beforeSend': undefined, // 요청하기 전 실행할 콜백 함수
			//'complete': undefined, // 요청이 끝난 후 실행할 콜백 함수
			'progressUpload': undefined, // 업로드 진행률 콜백 함수
			'progressDownload': undefined, // 다운로드 진행률 콜백 함수
			'success': undefined // 요청이 성공했을 때 실행할 콜백 함수
		};
		var key;
		for(key in settings) {
			if(settings.hasOwnProperty(key)) {
				if(parameter[key]) {
					settings[key] = parameter[key];
				}
			}
		}

		// 유효성 검사
		if(settings.type.toLowerCase() != 'get' && settings.type.toLowerCase() != 'post') { // HTTP 타입
			return false;
		}
		if(typeof settings.url != 'string' || settings.url.replace(/\s/g, '') === '' /*|| !/^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/.test(settings.url)*/) { // url
			return false;
		}
		if(typeof settings.async != 'boolean') { // 동기/비동기 
			return false;
		}

		var match, callback, pattern, script;
		var instance, data, name, arr = [];
		if(typeof settings.dataType === 'string' && settings.dataType.toLowerCase() === 'jsonp') {
			// 1.
			// JSONP
			/*
			XMLHttpRequest level2 사용하여 CORS(Cross Origin Resource Sharing) 가능하나
			서버측 header 설정부분(Access-Control-Allow-Credentials 응답 헤더를 true로 설정, PHP예: header("Access-Control-Allow-Origin: http://foo.example");)도 있어 
			일단 아래와 같이 우회방법을 사용한다. (http://wit.nts-corp.com/2014/04/22/1400)
			*/

			// callback 값 검출
			match = settings.url.match(/[?&]callback=([^&]*)?/);
			callback = match ? match[1] : 'YSM_' + Math.round(10000 * Math.random());
			window[callback] = function(data) {
				settings.success.call(settings.context, data);
			};

			// url 조립
			pattern = new RegExp('\\b(callback=).*?(&|$)');
			if(0 <= settings.url.search(pattern)) {
				settings.url = settings.url.replace(pattern, '$1' + callback + '$2');
			}else {
				settings.url = settings.url + (settings.url.indexOf('?') > 0 ? '&' : '?') + 'callback=' + callback;
			}

			// script load 실행
			script = window.document.createElement('script');
			script.src = settings.url;
			document.getElementsByTagName('head')[0].appendChild(script);
			script.onload = script.onreadystatechange = function () {
				if(!script.readyState || /loaded|complete/.test(script.readyState)) {
					// Handle memory leak in IE
					script.onload = script.onreadystatechange = null;

					// Remove the script
					//delete window[callback];
					//this.remove();
					if(script.parentNode) {
						script.parentNode.removeChild(script);
					}
				}
			};
		}else {
			// 2.
			// AJAX
			/*
			CORS를 사용하기 위해서 클라이언트와 서버는 몇 가지 추가 정보를 주고 받아야 한다. 
			클라이언트는 CORS 요청을 위해 새로운 HTTP 헤더를 추가한다. 
			서버는 클라이언트가 전송한 헤더를 확인해서 요청을 허용할지 말지를 결정한다. 
			데이터에 사이드 이펙트를 일으킬 수 있는 HTTP 메소드를 사용할 때는 먼저 preflight 요청을 서버로 전송해서 
			서버가 허용하는 메소드 목록을 HTTP OPTIONS 헤더로 획득한 다음에 실제 요청을 전송한다.			
			*/
			
			// XMLHttpRequest 인스턴스
			// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
			/*if(global.XDomainRequest) { // IE8, IE9
				instance = new XDomainRequest();
			}else if(global.XMLHttpRequest) { // IE10부터 사용가능
				instance = new XMLHttpRequest();
				if(typeof instance.withCredentials === 'undefined') {
					return false;
				}
			}*/
			instance = new XMLHttpRequest();
			if(typeof instance.withCredentials === 'undefined') {
				return false;
			}
			
			// 요청
			instance.open(settings.type, settings.url, settings.async);

			// http://www.html5rocks.com/en/tutorials/file/xhr2/?redirect_from_locale=ko
			instance.responseType = settings.dataType || 'text'; // arraybuffer || blob || document || json || text
			
			// data 처리
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
					/*
					// POST 요청의 경우에는 서버로 전송하는 Content-Type이 application/x-www-form-urlencoded, multipart/form-data, text/plain 중에 하나여야 한다.
					instance.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
					instance.setRequestHeader('Content-Type', 'multipart/form-data');
					instance.setRequestHeader('Content-Type', 'text/plain');
					instance.setRequestHeader('X-PINGOTHER', 'pingpong'); // CORS
					instance.overrideMimeType('text/plain; charset=x-user-defined');
					*/
					if(global.FormData && typeof settings.data === 'object' && settings.data instanceof FormData) {
						data = settings.data;
					}else {
						instance.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
						if(typeof settings.data === 'string' && settings.data !== '') {
							settings.data.replace(/([^=&]+)=([^&]*)/g, function(m, name, value) {
								arr.push(name + '=' + value);
							});
						}else if(typeof settings.data === 'object' && Object.keys(settings.data).length > 0) {
							for(name in settings.data) {
								if(settings.data.hasOwnProperty(name)) {
									arr.push(name + '=' + settings.data[name]);
								}
							}
						}
						data = arr.join('&');
					}
					/*
					if(global.FormData) {
						// FormData: https://developer.mozilla.org/en-US/docs/Web/API/FormData
						data = new FormData(); 
						// text
						if(typeof settings.data === 'string' && settings.data !== '') {
							// &, = 문자열 기준으로 key=value 를 분리하여, data에 넣는다
							settings.data.replace(/([^=&]+)=([^&]*)/g, function(m, name, value) {
								//data[decodeURIComponent(name)] = decodeURIComponent(value);
								data.append(name, value);	
							}); 
						}else if(typeof settings.data === 'object' && Object.keys(settings.data).length > 0) {
							for(name in settings.data) {
								if(settings.data.hasOwnProperty(name)) {
									data.append(name, settings.data[name]);
								}
							}
						}
						// file
						if(typeof settings.file === 'object' && Object.keys(settings.file).length > 0) {
							for(name in settings.file) {
								if(settings.file.hasOwnProperty(name) && 'files' in settings.file[name]) {
									data.append(name, settings.file[name].files[0]);
								}
							}
						}
					}else {
						// 일반적인 방법
						if(typeof settings.data === 'string' && settings.data !== '') {
							settings.data.replace(/([^=&]+)=([^&]*)/g, function(m, name, value) {
								arr.push(name + '=' + value);
							}); 
						}else if(typeof settings.data === 'object' && Object.keys(settings.data).length > 0) {
							for(name in settings.data) {
								if(settings.data.hasOwnProperty(name)) {
									arr.push(name + '=' + settings.data[name]);
								}
							}
						}
						data = arr.join('&');
					}
					*/
					break;
			}
			
			/*
			// 상태처리 (구버전, XMLHttpRequest level 1)
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
			instance.addEventListener("progress", callback, false);
			instance.addEventListener("load", callback, false);
			instance.addEventListener("error", callback, false);
			instance.addEventListener("abort", callback, false);
			*/

			//instance.onloadstart
			//instance.onabort
			//instance.ontimeout
			//instance.onloadend

			// 업로드와 다운로드 진행율을 계산하는 콜백 함수를 단계적 응답 이벤트에 설정
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
			};
			// 에러
			instance.onerror = function(event) {
				console.log('error');
				console.log(event);
			};

			// 전송 데이터
			instance.send(data);
		}
	};
	
	// public return
	return xhr;

}, this);
