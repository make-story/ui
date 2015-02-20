/*
Core

The MIT License (MIT)
Copyright (c) Sung-min Yu

브라우저 정보, 해상도, 사용자 정보 등 확인
브라우저 기능지원 여부: http://modernizr.com/download/

해당 프로젝트에 대해 undefined, null 사용구분
undefined: 변수가 선언되어 있지 않았을 때를 판단
null: 변수는 선언되어 있으나 초기화되었을 때를 판단
*/

;void function(config, global) { // 사용자 config에 따른 설정 추후 추가 
	'use strict'; // ES5
	if(typeof global === 'undefined' || typeof window === 'undefined' || typeof window.document === 'undefined') return false;
	
	global.api = (function() {
		// JS정보: http://www.quirksmode.org/js/detect.html
		// 해상도, 이벤트, 모바일, 브라우저 환경

		// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

		// 클라이언드 브라우저 환경
		var core = {
			"screen": {
				"width": screen.availWidth/*Windows Taskbar 제외*/ || screen.width || Math.round(window.innerWidth), // 실제 해상도 값
				"height": screen.availHeight/*Windows Taskbar 제외*/ || screen.height || Math.round(window.innerHeight)
			},
			"browser": {
				"agent": null // chrome | safari | opera | firefox | explorer (브라우저 구분)
			},
			"device": "", // pc | mobile | tablet (해상도에 따라 설정)
			"mobile": null, // true, false 
			"touch": null, // true, false
			"event": {
				// 마우스 또는 터치
				"resize": 'onorientationchange' in window ? 'orientationchange' : 'resize',
				"down": null,
				"move": null,
				"up": null,
				// 애니메이션
				"transitionend": [ // transition 종료 후 콜백 이벤트
					"webkitTransitionEnd", // chrome, safari
					"oTransitionEnd", // opera 10.5
					"otransitionend", // opera 12
					"transitionend", // opera 12.10
					"transitionEnd" // standard, firefox, ie10+
				],
				"animationstart": [ // 애니메이션 시작
					"webkitAnimationStart", // webkit
					"oanimationstart", // opera
					"MSAnimationStart", // ie10+
					"animationstart" // standard, firefox
				],
				"animationiteration": [ // 애니메이션이 반복될때 시작시마다 
					"webkitAnimationIteration",
					"oanimationiteration",
					"MSAnimationIteration",
					"animationiteration"
				],
				"animationend": [ // 애니메이션 종료
					"webkitAnimationEnd",
					"oanimationend",
					"MSAnimationEnd",
					"animationend"
				]
			},
			"css": {
				"prefix": null // 벤더 프리픽스
			},
			"grid": {
				"width": 0 // 실제 해당도 값에 따른 해상도 기준값(320, 640, 960, 1280~)
			},
			"block": {
				"max_width_size": 4, // 하나의 block 최대 사이즈
				"margin": 6, // block margin (값을 변경할 경우 CSS 해당 px 값도 변경해 주어야 한다.)
				"width": 68, // block size(px) 1개 기준 width 값
				"height": 68, // block size(px) 1개 기준 height 값
				"outer_width": 0, // block size 1개 width 기준 + marign 값
				"outer_height": 0, // block size 1개 height 기준 + marign 값
				"max_width_count": 0 // 해상도 기준 가로로 들어갈 수 있는 block 개수
			}
		};

		// device
		core.device = 'pc';
		core.mobile = (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent||navigator.vendor||window.opera)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).substr(0,4)));
		var userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
		var platform = navigator.platform;
		if(/android/i.test(userAgent)) { // 안드로이드
			// mobile 없으면 태블릿임
			if(/mobile/i.test(userAgent)) {
				core.device = 'mobile';
			}else {
				core.device = 'tablet';
			}
		}else if(/(iphone|ipad|ipod)/i.test(userAgent)) { // 애플
			if(/ipad/i.test(userAgent)) {
				core.device = 'tablet';
			}else {
				core.device = 'mobile';
			}
		}else if(core.mobile) {
			core.device = 'mobile';
		}else if(/(MacIntel|MacPPC)/i.test(platform)) {
			core.device = 'pc';
		}else if(/(win32|win64)/i.test(platform)) {
			core.device = 'pc';
		}
		// agent 값보다 스크린 크기를 우선 적용하여 태블릿인지 모바일인지 여부를 결정한다.
		// 테블렛인데 가로 길이가 미달이면 모바일로 인식하게 함
		if((core.device = 'tablet') && core.screen.width && core.screen.height && (Math.min(core.screen.width, core.screen.height) < 768)) {
			core.device = 'mobile';
		}
		// 모바일인데 가로 길이가 넘어가면 테블렛으로 인식하게 함
		if((core.device = 'mobile') && core.screen.width && core.screen.height && (Math.min(core.screen.width, core.screen.height) >= 768)) {
			core.device = 'tablet';
		}

		// browser
		if(userAgent.indexOf("chrome") > -1) {
			core.browser.agent = "chrome";
			core.css.prefix = '-webkit-';
		}else if(userAgent.indexOf("safari") > -1) {
			core.browser.agent = "safari";
			core.css.prefix = '-webkit-';
		}else if(userAgent.indexOf("opera") > -1) {
			core.browser.agent = "opera";
			core.css.prefix = '-o-';
		}else if(userAgent.indexOf("firefox") > -1) {
			core.browser.agent = "firefox";
			core.css.prefix = '-moz-';
		}else if(userAgent.indexOf("msie") > -1) {
			core.browser.agent = "explorer";
			core.css.prefix = '-ms-';
		}

		// event
		core.touch = ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
		core.event.down = core.touch ? 'touchstart' : 'mousedown';
		core.event.move = core.touch ? 'touchmove' : 'mousemove';
		core.event.up = core.touch ? 'touchend' : 'mouseup';

		// grid
		if(0 <= core.screen.width && core.screen.width < 640) { // 0 ~ 639
			core.grid.width = 320;
		}else if(640 <= core.screen.width && core.screen.width < 960) { // 640 ~ 959
			core.grid.width = 640;
		}else if(960 <= core.screen.width && core.screen.width < 1280) { // 960 ~ 1279
			core.grid.width = 960;
		}else if(1280 <= core.screen.width) { // 1280 ~ 와이드
			// 유동적 계산 - 추후 적용하자
			// 1. 전체 사이즈 대비 1개(60px)가 해상도의 %(퍼센트)로 계산 했을 때 몇 픽셀인지 계산
			// 2. margin(10px)도 해당도의 %(퍼센트)로 계산 했을 때 몇 픽셀인지 계산
			// 3. 두 픽셀을 더해서 해상도 대비 최대 몇개의 story가 가로 사이즈로 들어갈 수 있는지 출력
			core.grid.width = 1280;
		}

		// block
		core.block.outer_width = core.block.width + (core.block.margin * 2);
		core.block.outer_height = core.block.height + (core.block.margin * 2);
		core.block.max_width_count = core.grid.width / (core.block.width + (core.block.margin * 2)); //block.margin * 2 이유 : 여백이 왼쪽, 오른쪽이 있기 때문

		// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

		// script 삽입: 동적로딩, 의존성관리, 모듈화
		var Script = function() {
			/*
			readyState 상태값
			uninitialized: 아직 loading이 시작되지 않았다.
			loading: loading 중이다.
			interactive: 충분히 load되었고 사용자가 그것과 상호작용할 수 있다.
			complete: 완전히 load되었다.
			*/

			// js 작업 전체 리스트
			this['queue'] = []; // 대기 리스트 - 구조: [{"list": ['JS load 파일', ... ], "count": "JS load 파일 총 개수", "success": 성공콜백, "error": 실패콜백, "uninitialized": ['load 실패 리스트', ... ], "complete": ['load 성공 리스트', ... ]}, ... ]
			this['uninitialized'] = []; // 실패 리스트
			this['complete'] = this.getScriptElements(); // 완료 리스트 (동일한 경로의 값이라도 load가 성공하면 리스트에 추가된다.)

			// 현재 작업중인 정보
			this['module']; // Module의 인스턴스 정보가 들어간다
		};
		Script.prototype = {
			Module: function() {
				this['list'] = []; // 작업 리스트
				this['count'] = 0; // 작업 리스트 총 개수
				this['success'] = function() {}; // 성공 콜백
				this['error'] = function() {}; // 에러 콜백
				this['uninitialized'] = []; // 실패 리스트
				this['complete'] = []; // 성공 리스트
			},
			init: function() {
				// arguments를 배열로 변환
				var args = Array.prototype.slice.call(arguments);

				// 해당 모듈 인스턴스 생성
				var module = new this.Module(); 
				switch(args.length) {
					case 3:
						// 에러 콜백 함수
						module['error'] = args.pop();
						//if(typeof module['error'] !== 'function') return; // try{}catch{} 제어로 변경
					case 2:
						// 완료 콜백 함수
						module['success'] = args.pop();
						//if(typeof module['success'] !== 'function') return; // try{}catch{} 제어로 변경
						break;
					default:
						// js 로드만 실행

						break;
				}

				// 작업 리스트에 추가
				module['list'] = (args[0] && typeof args[0] === "string") ? args : args[0];
				module['count'] = module['list'].length; // js 파일 리스트 총 개수
				this.queue.push(module);

				// 실행
				this.setQueue();
			},
			// queue(작업) 리스트 순차 실행
			setQueue: function() {
				if(typeof this.module === 'object' || this.queue.length === 0) return;
				
				// 현재 실행 모듈에 적용
				this.module = this.queue.shift(); 
				if(this.module['list'].length === 0) { // 실행할 js load 리스트가 없거나, 중복된 js 파일이 이미 load 되어 리스트가 비어있을 경우
					delete this.module;
					this.setQueue(); // 재귀실행
				}else {
					this.setList(); // js 파일 리스트 실행
				}
			},
			// queue 내부 js 리스트 순차 실행
			setList: function() {
				if(typeof this.module !== 'object') return; 

				var list = this.module['list'];
				var src;
				
				// js 리스트를 async 사용하여 load 할 경우
				while(list.length) { // while 반복문이 아니라, list.shift() 로 순차 실행을 해야하지 않을까?
					src = list.shift();
					if(this.complete.indexOf(src) > -1) {
						// 기존 존재
						//console.log('기존 존재');
						this.setState(src, 'complete');
					}else {
						// 신규 생성
						//console.log('신규 생성');
						this.setLoad(src);
					}
				}
				
				/*
				// js 리스트를 순차적으로 load 할 경우 - 이 방식은 async 사용하지 않는 방식으로, 개발의미를 벗어난다
				if(list.length > 0) {
					src = list.shift();
					if(this.complete.indexOf(src) > -1) {
						// 기존 존재
						//console.log('기존 존재');
						this.setState(src, 'complete');
					}else {
						// 신규 생성
						//console.log('신규 생성');
						this.setLoad(src);
					}	
				}else {
					// 다음 queue 실행
					this.setQueue();
				}
				*/
			},
			// uninitialized(에러), complete(완료) 상태 설정
			setState: function(src, state) { // state: uninitialized, complete
				if(typeof this.module === 'undefined' || !src || !state || (state !== 'uninitialized' && state !== 'complete')) return;

				// 전체 상태정보에 추가 - uninitialized[], complete[]
				this[state].push(src);
				
				// 현재 모듈(queue) 상태정보에 추가
				this.module[state].push(src);
				
				// 대기 모듈(queue)에서 현재 작업된 src 확인
				var ready_module, index_queue, index_list;
				for(index_queue in this.queue) {
					ready_module = this.queue[index_queue]; // 인스턴스 값
					index_list = (typeof ready_module['list'] === 'object' && ready_module['list'].length > 0) ? ready_module['list'].indexOf(src) : -1; // 존재여부 확인
					if(index_list > -1) {
						// 대기중인 queue 에서 해당 src 관련 정보 변경
						ready_module[state].push(src);
						ready_module['list'].splice(index_list, 1); // 대기 리스트 요소 제거
						// 해당 콜백 실행
						this.setCallback(ready_module);
					}
				}
				
				// 콜백실행
				this.setCallback(this.module);
			},
			// 사용자 콜백 실행  - 현재 실행중인 모듈(this.module)이 아닌, 대기중인 모듈에서 중복된 js 파일의 콜백이 먼저 실행될 수 있다. 그러므로 module === this.module 를 확인하여 현재 실행모듈을 초기화 해야 한다.
			setCallback: function(module) {
				if(typeof module !== 'object') {
					//console.log("typeof module !== 'object'");
					return;
				}
				var queue_length = module['count'];
				var uninitialized_length = module['uninitialized'].length; // 실패
				var complete_length = module['complete'].length; // 성공
				var total = Number(uninitialized_length) + Number(complete_length);

				if(uninitialized_length > 0) { // 실패
					// 에러 콜백 실행
					try {
						module['error'].call(module);
					}catch(e) {
						console.log(e);
					}
					// 현재 작업 정보 초기화
					if(module === this.module) {
						//this.module = undefined; 
						delete this.module;
					}
					// 다음 queue 실행
					this.setQueue();
					//this.setList();
				}else if(complete_length == queue_length) { // 성공
					// 정상 콜백 실행
					try {
						module['success'].call(module);
					}catch(e) {
						console.log(e);
					}
					// 현재 작업 정보 초기화
					if(module === this.module) {
						//this.module = undefined;
						delete this.module;
					}
					// 다음 queue 실행
					this.setQueue();	
					//this.setList();
				}
			},
			// document의 script element 리스트
			getScriptElements: function() {
				var elements = document.getElementsByTagName('script');
				//var elements = document.scripts;
				var scripts = [];
				if(typeof elements === 'object') {
					for(var i=elements.length-1; i>=0; i-=1) {
						if(typeof elements[i].src !== 'undefined' && elements[i].src !== '') {
							// getAttribute: elements[i].src 프로퍼티로 직접 접근할 경우 상대경로가 자동 절대경로로 변경되어 실제 값과 차이가 발생하기 때문
							var src = elements[i].getAttribute('src');
							scripts.push(src);
						}
					}
				}

				return scripts;
			},
			// script element 생성
			setScriptCreate: function() {
				//var element = config.xhtml ? document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') : document.createElement('script'); // 참고
				var element = document.createElement("script");
				element.type = 'text/javascript';
				//element.charset = 'utf-8';
				element.async = true;

				return element;
			},
			// element 를 head 에 추가
			setScriptInsert: function(element) {
				var head = document.getElementsByTagName('head')[0]; 
				//If BASE tag is in play, using appendChild is a problem for IE6.
				var base = document.getElementsByTagName('base')[0];
				if(base) {
					head = base.parentNode;
					head.insertBefore(element, base);
				}else {
					head.appendChild(element);
				}
			},
			// script 로드, 에러 이벤트
			setLoad: (function() {
				if(document.attachEvent && !(document.attachEvent.toString && document.attachEvent.toString().indexOf('[native code') < 0)) {
					return function(src) {
						var that = this;
						var pending_script_list = [];
						var error_script_list = [];
						var element = that.setScriptCreate();
						
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
						that.setScriptInsert(element);
					}
				}else if(window.addEventListener) {
					return function(src) {
						var that = this;
						var element = that.setScriptCreate();
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
						
						element.addEventListener('error', handlers, false);
						element.addEventListener('load', handlers, false);

						element.src = src;
						that.setScriptInsert(element);
					}
				}else {
					return function(){};
				}
			})()
		};
		var instance_script = new Script();

		// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

		return {
			"core": core,
			"script": instance_script.init.bind(instance_script)
		};
	})();
	
	// api.core 수정하지 못하도록 제어

}(typeof api === 'object' && typeof api.config !== 'undefined' ? api.config : {}, window);