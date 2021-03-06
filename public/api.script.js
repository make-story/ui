/*
Import

@date (버전관리)
2015.07.07

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.

@browser compatibility

-
사용예


script 삽입: 동적로딩, 의존성관리, 모듈화
상단에서 동일한 js파일이 load 된 경우, box 가 작동하지 않는다.
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) {
		return false;	
	}else if(!global.api) {
		global.api = {};
	}
	return factory(global);

})(function(global, undefined) {

	'use strict'; // ES5

	// document에 존재하는 script element 리스트
	var getScript = function() {
		var elements = document.getElementsByTagName('script');
		//var elements = document.scripts;
		var scripts = [];
		var src;
		if(elements && typeof elements === 'object') {
			for(var i=elements.length-1; i>=0; i-=1) {
				if(typeof elements[i].src !== 'undefined' && elements[i].src !== '') {
					//src = elements[i].src; // 상대경로가 자동 절대경로로 변경
					src = elements[i].getAttribute('src');
					scripts.push(src);
				}
			}
		}

		return scripts;
	};

	// script element 생성
	var setScriptCreate = function(options) {
		//var element = config.xhtml ? document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') : document.createElement('script'); // 참고
		var element = document.createElement("script");

		if(!options || typeof options !== 'object') {
			options = {};
		}

		element.type = 'text/javascript';
		if(options.charset) {
			//element.charset = 'utf-8';
		}
		if(options.async) {
			//element.async = true; // HTML 구문 분석과 병행하여 스크립트를 가져온 후 스크립트가 준비 될 때마다 즉시 실행
		}else if(options.defer) {
			//element.defer = true; // HTML 구문 분석이 완료되기 전에 스크립트 다운로드가 완료 되더라도 구문 분석이 완료 될 때까지 스크립트는 실행되지 않는다
		}
		if(options.attributes && typeof options.attributes === 'object') {
			for(key in options.attributes) {
				element.setAttribute(key, options.attributes[key]);
			}
		}
		
		return element;
	};

	// element 를 head 에 추가
	var setScriptInsert = function(element) {
		var head = document.getElementsByTagName('head')[0]; 
		// If BASE tag is in play, using appendChild is a problem for IE6.
		var base = document.getElementsByTagName('base')[0];
		if(base) {
			head = base.parentNode;
			head.insertBefore(element, base);
		}else {
			head.appendChild(element);
		}
	};

	var instance = (function() {
		// Script 생성자
		function Script() {
			// 대기중인 load 파일 리스트
			this['queue'] = {
				'script': [],
				'box': [],
				'wait': [] // JS파일 내부에 api.box(['xx1.js', 'xx2.js', ... ]) 가 실행되고, 'xx1.js' 파일 내부에 또 다른 api.box 가 실행됨에 따라 대기중인 인스턴스 값 리스트
			};
			// 결과 리스트
			this['uninitialized'] = []; // 실패 리스트
			this['complete'] = []; // 성공 리스트
			// 모듈화에 필요한 JS 파일별 값 - 구조: {'JS 파일명': 'box 함수 실행 후 반환값', 'JS 파일명': 'box 함수 실행 후 반환값', ... }
			this['box'] = {}; 
			// 현재 실행중인 module의 인스턴스
			this['action']; 
		};
		Script.prototype = {
			// Module 생성자
			Module: function() {
				// 현재 모듈과 관계있는 다른 인스턴스 값 (종속적인 파일의 load를 실행한 Module 인스턴스)
				this['relation'];
				// 공통
				this['file'] = { 
					'list': [], // load해야할 파일 리스트
					'load': [], // load된 파일 순서
					'uninitialized': [], // 실패 리스트
					'complete': [] // 성공 리스트
				};
				// box 작업에 필요한 변수
				this['box'] = {
					'module': [], // box 인스턴스 순서에 사용된다.
					'factory': [] // IE는 setBox 메소드가 js list 별로 모두 실행된 후 setState 메소드가 실행되므로 값 타입이 배열로 되어있어야 한다.
				};
				// 작업 결과에 따른 콜백 (type이 script 의 경우만 실행)
				this['success']; // success 콜백이 없을 경우 box 파라미터를 만들지 않는다. - 설계 진행중!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				this['error']; 
			},
			// queue 대기 리스트 실행
			setQueue: function() {
				console.log('<< setQueue 실행 >>');
				
				var that = this;
				var queue = that['queue'];
				if(typeof that['action'] === 'object') {
					// 현재 실행중인 인스턴스가 있음
					return false;
				}else if(queue['box'].length === 0 && queue['script'].length === 0) {
					// 실행할 load 리스트가 없음
					return false;
				}else if(queue['box'].length > 0) {
					console.log('box 순차 실행');
					that['action'] = queue['box'].shift();
				}else if(that['queue']['wait'].length === 0 && that['queue']['script'].length > 0) {
					console.log('script 순차 실행');
					that['action'] = queue['script'].shift();
				}
				that.setList();
			},
			// list(JS 파일) load 실행
			setList: function() {
				console.log('<< setList 실행 >>');

				var that = this;
				var action = that['action'];
				var i, max, src;

				if(!action || typeof action !== 'object') {
					// 실행해야할 module 인스턴스가 유효하지 않음
					console.log('---------- error ----------');
					return false;
				}
				
				// async 사용하여 JS 리스트 load 실행
				for(i=0, max=action['file']['list'].length; i<max; i++) {
					src = action['file']['list'][i];
					if(that['complete'].indexOf(src) > -1) { 
						// complete 되어있음 (이미 load 되어 있는 파일)
						console.log('과거 load 존재: ' + src);
						that.setState(src, 'complete');
					}else { 
						// load 실행
						console.log('신규 load 실행: ' + src);
						that.setLoad(src);
					}
				}
			},
			// script 로드, 에러 이벤트
			setLoad: (function() {
				/*
				- readyState 상태값
				uninitialized: 아직 loading이 시작되지 않았다.
				loading: loading 중이다. (파일을 내려받기 시작한 상태)
				loaded: 파일을 완전히 내려받은 상태입니다.
				interactive: 데이터를 완전히 내려받았지만 아직 데이터 전체를 이용할 수는 없는 상태입니다.
				complete: 모든 데이터를 이용할 수 있는 상태입니다.
				*/
				if(document.attachEvent && !(document.attachEvent.toString && document.attachEvent.toString().indexOf('[native code') < 0)) {
					return function(src) {
						var that = this;
						var pending_script_list = [];
						var error_script_list = [];
						var element = setScriptCreate();
						var handlers = function(parameter) { // IE 9 하위 버전에서는 event 객체 반환이 없음
							// this 에는 이벤트의 해당 element 값이 들어 있으므로 오염에 주의해야 한다.

							// 상태값
							// uninitialized -> loading -> loaded -> interactive -> complete
							var pending_script;
							while(typeof pending_script_list[0] === 'object' && /^(loaded|complete)$/.test(pending_script_list[0]['element'].readyState)) {
								// IE 는 onreadystatechange, onerror 가 모두 실행된다. (즉, onerror 가 발생하더라도 onreadystatechange 가 실행된다.)
								// 그러므로 loaded, complete 가 되었을 때 error 을 확인한다.
								// 해당 element 가 error 리스트에 있는지 확인한다.
								//console.log(pending_script_list[0]['element'].readyState);
								pending_script = pending_script_list.shift();
								pending_script['element'].onreadystatechange = null;
								pending_script['element'].onerror = null;
								if(error_script_list.indexOf(pending_script['src']) !== -1) { // 실패
									that.setState(src, 'uninitialized');
								}else { // 성공
									that.setState(src, 'complete');
								}

								//that.setCallback.apply(that, Array.prototype.slice.call(arguments)); // while문 내부에 존재해야 한다. (while 밖에 있을 경우, script( ... ) 함수를 여러번 실행했을 때 불러와야할 js 파일리스트 중 먼저 불러온 js 파일에 따라 콜백내부 종속된 결과값이 개발자의 생각과 다르게 나올 수 있다.)
							}
						};
							
						pending_script_list.push({'src': src, 'element': element}); // IE
						element.attachEvent('onreadystatechange', handlers);
						element.attachEvent('onerror', function() { // IE 에서는 onreadystatechange, onerror 각각 콜백된다. 즉, onerror 이벤트가 발생한다고 onreadystatechange 가 실행이 안되는 것은 아니다.
							error_script_list.push(src);
						});
						/*
						// 아래 이벤트는 
						// script(['test.js', ... ], ... ), script(['test.js', 'test1.js', ... ], ... ) 처럼 다중 load 를 위해 
						// 여러개의 함수(script)를 실행할 경우, 
						// 실제로는 맨 마지막 한개의 이벤트(마지막에 실행된 script 함수의 onreadystatechange, onerror 이벤트)에 대해서만 실행된다.
						element.onreadystatechange = handlers;
						element.onerror = function() {
							error_script_list.push(src);
						};
						*/

						// IE 는 src 속성과 script 삽입이 이벤트(onreadystatechange, onerror) 등록 후 이루어져야 한다.
						element.src = src;
						setScriptInsert(element);
					}
				}else if(window.addEventListener) {
					return function(src) {
						var that = this;
						var element = setScriptCreate();
						var handlers = function(parameter) {
							// this 에는 이벤트의 해당 element 값이 들어 있으므로 오염에 주의해야 한다.

							// 상태값
							if(parameter.type === 'error') { // 실패
								that.setState(src, 'uninitialized');
							}else if(parameter.type === 'load') { // 성공
								that.setState(src, 'complete');
							}

							//that.setCallback.apply(that, Array.prototype.slice.call(arguments));
						};

						element.src = src;
						setScriptInsert(element);
						
						element.addEventListener('error', handlers, false);
						element.addEventListener('load', handlers, false);
					}
				}else {
					return function(){};
				}
			})(),
			// load 에 따른 상태 설정 (setLoad 메소드에서 실행됨)
			setState: function(src, state) { // state: uninitialized(실패), complete(완료)
				console.log('<< setState 실행 >>');
				console.log('src: ' + src);

				var that = this;
				var action = that['action'];

				if(!action || typeof action !== 'object') {
					console.log('---------- error ----------');
					return false;
				}

				action['file']['load'].push(src);
				action['file'][state].push(src);
				that[state].push(src);

				// box 처리
				if(!(src in that['box'])) { 
					// module 확인 (src 경로의 js 파일 내부에 box 실행함수가 없음)
					if(action['file']['load'].length > action['box']['module'].length) {
						action['box']['module'].push(undefined);
					}
					// factory 확인 (위 module 확인이 먼저 이루어 져야함)
					if(action['file']['load'].length < action['box']['factory'].length) { 
						// IE (익스플로러는 여러개의 JS 파일을 load 할 경우, box 함수가 모두 실행되고 이 부분이 실행될 수 있다.)
						that['box'][src] = action['box']['factory'].shift(); // 첫번째 (선입선출)
					}else {
						that['box'][src] = action['box']['factory'].pop(); // 마지막 (후입선출)
					}
				}

				console.log('box');
				console.dir(that['box']);

				// js파일리스트 load 완료 여부확인
				if(action['file']['list'].length === action['file']['load'].length) { 
					if(that['queue']['box'].length > 0) {
						// box 의 종속된 js 리스트를 load하기 위해 현재 인스턴스를 대기 배열에 넣는다.
						that['queue']['wait'].push(action);
						// queue 실행
						that['action'] = undefined;
						that.setQueue();
					}else if(that['queue']['wait'].length > 0) {
						// 대기중이던 인스턴스 실행
						that.setWait();
					}else {
						// 콜백실행
						that.setCallback(action);
					}
				}
			},
			// 대기했던 인스턴스들 실행
			setWait: function() {
				console.log('<< setWait 실행 >>');

				var that = this;
				var queue = that['queue']; 
				var action = that['action'];
				var relation;
				var index, file, arr, j, max;
				do {
					// do{ }while(): 현재 인스턴스 값부터 처리

					// 현재 인스턴스가 relation(현재 인스턴스를 만든 Module인스턴스)의 box['module'] 배열에서 몇번째 index에 위치해 있는지 확인 (누가 자신을 만들었는지 확인)
					// index 값으로 file['load'] 배열에서 해당 index 값으로 자신의 src를 가져온다.
					relation = action['relation'];
					if(relation && typeof relation === 'object') {
						// 배열리스트에서 인스턴스 index 검출
						index = relation['box']['module'].indexOf(action); 
						if(index > -1) {
							// 인스턴스 index 로 load 된 file 순서(배열)에서 src 값을 검출
							file = relation['file']['load'][index]; 
							
							console.log('index: ' + index);
							console.log('file: ' + file);
							
							// facroty 값 재설정
							if(typeof that['box'][file] === 'function') {
								// 파라미터값 조립
								arr = [];
								for(j=0, max=action['file']['load'].length; j<max; j++) {
									arr.push(that['box'][action['file']['list'][j]]);
								}
								that['box'][file] = that['box'][file].apply(null, arr);
							}
						}
					}
					if(queue['wait'].length > 1) {
						action = queue['wait'].pop();
					}else {
						break;
					}
				}while(true);

				console.log('box');
				console.dir(that['box']);

				// 콜백실행
				action = queue['wait'].pop();
				that.setCallback(action);
			},
			// 사용자 콜백 실행 (setState 함수에서 실행됨)
			setCallback: function(action) {
				console.log('<< setCallback 실행 >>');

				var that = this;
				var arr, j, max;
				
				console.log('box');
				console.dir(that['box']);

				// 유효성 검사
				if(typeof instance['error'] === 'function' || typeof action['success'] === 'function') {
					if(typeof action !== 'object') {
						that.setQueue();
						return false;
					}else if(action['file']['uninitialized'].length > 0) { // 실패
						try {
							instance['error'].call(action['file']);
						}catch(e) {
							console.log(e);
						}
					}else if(action['file']['load'].length === action['file']['complete'].length) { // 성공
						try {
							// box 파라미터 조립
							arr = [];
							for(j=0, max=action['file']['load'].length; j<max; j++) {
								console.log(action['file']['list'][j]);
								console.log(that['box'][action['file']['list'][j]]);
								arr.push(that['box'][action['file']['list'][j]]);
							}
							console.log(arr);
							action['success'].apply(action['file'], arr);
						}catch(e) {
							console.log(e);
						}
					}
				}

				// queue 실행
				that['action'] = undefined;
				that.setQueue();
			}
		};
		return new Script();
	})();


	/*
	-
	js 파일 동적로딩


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
	*/
	global.api.script = function() {
		//console.log('---------- api.script 실행 ----------');

		// arguments를 배열로 변환
		var args = Array.prototype.slice.call(arguments);

		// 모듈 인스턴스 생성
		var module = new instance.Module(); 
		instance['queue']['script'].push(module);

		// 파라미터 확인
		switch(args.length) {
			case 3:
				// 에러 콜백 함수
				module['error'] = args.pop();
			case 2:
				// 완료 콜백 함수
				module['success'] = args.pop();
			default:
				// 작업 정보 설정
				module['file']['list'] = (args[0] && typeof args[0] === "string") ? args : args[0];
		}

		//console.log('load해야할 파일: ' + module['file']['list']);

		instance.setQueue();
	};

	
	/*
	-
	의존성관리(해당 코드를 실행시키는데 종속적인 파일 리스트)
	모듈화(리턴값을 글로벌 스코프가 아닌 콜백함수의 스코프로 제한)


	// 사용예 1
	api.box(반환객체);

	// 사용예 2
	api.box([종속된 객체 리스트], function(종속된 객체) {
		return 반환객체;
	})
	*/
	global.api.box = function() {
		//console.log('---------- api.box 실행 ----------');

		// arguments를 배열로 변환
		var args = Array.prototype.slice.call(arguments);

		if(!instance['action'] || typeof instance['action'] !== 'object') {
			return false;
		}
		
		// 파라미터 확인
		var module;
		switch(args.length) {
			case 2:
				// 모듈 인스턴스 생성
				module = new instance.Module();
				instance['queue']['box'].push(module);
				// 작업 정보 설정
				module['file']['list'] = args.shift();
				// 관계 설정
				module['relation'] = instance['action'];

				console.log('종속된 js load 리스트 존재');
				console.log(module['file']['list']);
			case 1:
				// box를 담고 있는 객체(또는 함수, undefined)
				instance['action']['box']['module'].push(module);
				instance['action']['box']['factory'].push(args.shift());
		}
	};

}, this);