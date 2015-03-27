/*
Core

The MIT License (MIT)
Copyright (c) Sung-min Yu

브라우저 정보, 해상도, 사용자 정보 등 확인
브라우저 기능지원 여부: http://modernizr.com/download/
*/

(function(api, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) return false;
	return api(global);

})(function(global) {
	
	'use strict'; // ES5
	// JS정보: http://www.quirksmode.org/js/detect.html
	// 해상도, 이벤트, 모바일, 브라우저 환경

	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	// 클라이언드 브라우저 환경
	var userAgent = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase();
	var platform = navigator.platform;
	var prefixes = {
		// "브라우저 지원종류": [transition 종료 후 이벤트, 애니메이션 시작 이벤트, 애니메이션이 반복될때 시작시마다  이벤트, 애니메이션 종료]
		'transform': ['transitionend', 'animationstart', 'animationiteration', 'animationend'], 
		'WebkitTransform': ['webkitTransitionEnd', 'webkitAnimationStart', 'webkitAnimationIteration', 'webkitAnimationEnd'], 
		'MozTransform': ['transitionend', 'animationstart', 'animationiteration', 'animationend'], 
		'OTransform': ['oTransitionEnd', 'oanimationstart', 'oanimationiteration', 'oanimationend'], 
		'msTransform': ['MSTransitionEnd', 'MSAnimationStart', 'MSAnimationIteration', 'MSAnimationEnd']
	};
	var element = document.createElement('div');
	var nameOffset, verOffset, key;
	var core = {
		"check": { // true, false 
			"mobile": null,
			"touch": null,
			"transform" : false
		},
		"device": null, // pc | mobile | tablet (해상도에 따라 설정)
		"browser": {
			"name": null, // chrome | safari | opera | firefox | explorer (브라우저 구분)
			"version": null
		},
		"screen": {
			"width": screen.availWidth/*Windows Taskbar 제외*/ || screen.width || Math.round(window.innerWidth), // 실제 해상도 값
			"height": screen.availHeight/*Windows Taskbar 제외*/ || screen.height || Math.round(window.innerHeight)
		},
		"event": {
			// 마우스 또는 터치
			"resize": 'onorientationchange' in window ? 'orientationchange' : 'resize',
			"down": null,
			"move": null,
			"up": null,
			// 트랜지션, 애니메이션
			"transitionend": "transitionend",
			"animationstart": "animationstart",
			"animationiteration": "animationiteration",
			"animationend": "animationend"
		},
		"css": {
			"prefix": ['-webkit-', '-moz-', '-ms-', '-o-'] // 벤더 프리픽스
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

	// check, event
	core.check.mobile = (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent||navigator.vendor||window.opera)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).substr(0,4)));
	core.check.touch = ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
	for(key in prefixes) {
		if(element.style[key] !== undefined) {
			core.check.transform = true; // CSS3 지원
			core.event.transitionend = prefixes[key][0];
			core.event.animationstart = prefixes[key][1];
			core.event.animationiteration = prefixes[key][2];
			core.event.animationend = prefixes[key][3];
			break;
		}
	}
	core.event.down = core.check.touch ? 'touchstart' : 'mousedown';
	core.event.move = core.check.touch ? 'touchmove' : 'mousemove';
	core.event.up = core.check.touch ? 'touchend' : 'mouseup';

	// browser (if문 순서 중요함)
	core.browser.name  = navigator.appName;
	core.browser.version = String(parseFloat(navigator.appVersion));
	if((verOffset = userAgent.indexOf("opr/")) != -1) {
		core.browser.name = "opera";
		core.browser.version = userAgent.substring(verOffset + 4);
	}else if((verOffset = userAgent.indexOf("opera")) != -1) {
		core.browser.name = "opera";
		core.browser.version = userAgent.substring(verOffset + 6);
		if((verOffset = userAgent.indexOf("version")) != -1) {
			core.browser.version = userAgent.substring(verOffset + 8);
		}
	}else if((verOffset = userAgent.indexOf("msie")) != -1) {
		core.browser.name = "explorer";
		core.browser.version = userAgent.substring(verOffset + 5);
	}else if((verOffset = userAgent.indexOf("chrome")) != -1) {
		core.browser.name = "chrome";
		core.browser.version = userAgent.substring(verOffset + 7);
	}else if((verOffset = userAgent.indexOf("safari")) != -1) {
		core.browser.name = "safari";
		core.browser.version = userAgent.substring(verOffset + 7);
		if((verOffset = userAgent.indexOf("version")) != -1) {
			core.browser.version = userAgent.substring(verOffset + 8);
		}
	}else if((verOffset = userAgent.indexOf("firefox")) != -1) {
		core.browser.name = "firefox";
		core.browser.version = userAgent.substring(verOffset + 8);
	}else if((nameOffset = userAgent.lastIndexOf(' ') + 1) < (verOffset = userAgent.lastIndexOf('/'))) { // In most other browsers, "name/version" is at the end of userAgent 
		core.browser.name = userAgent.substring(nameOffset, verOffset);
		core.browser.version = userAgent.substring(verOffset + 1);
		if(core.browser.name.toLowerCase() == core.browser.name.toUpperCase()) {
			core.browser.name = navigator.appName;
		}
	}
	if((verOffset = core.browser.version.indexOf(';')) != -1) core.browser.version = core.browser.version.substring(0, verOffset);
	if((verOffset = core.browser.version.indexOf(' ')) != -1) core.browser.version = core.browser.version.substring(0, verOffset);

	// device
	core.device = 'pc';
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
	}else if(core.check.mobile) {
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
	// api.core.js 상단에서 동일한 js파일이 load 된 경우, box 가 작동하지 않는다.
	var Call = function() {
		/*
		- 메소드 실행순서
		setQueue() -> setList() -> setLoad() -> setBox() -> setState() -> setCallback()
		*/

		// 대기중인 작업 - 구조: [{"list": ['JS load 파일', ... ], "count": "JS load 파일 총 개수", "success": 성공콜백, "error": 실패콜백, "uninitialized": ['load 실패 리스트', ... ], "complete": ['load 성공 리스트', ... ]}, ... ]
		this['queue'] = {
			'script': [],
			'box': []
		};

		// 현재 진행중인 작업
		this['action']; // Module 인스턴스 값
		this['wait'] = []; // box 의 js list load 에 따라 대기중인 인스턴스 값

		// 전체 작업정보 (작업결과)
		this['result'] = {
			'uninitialized': [], // 실패 리스트
			'complete': this.dom.getScript(), // 성공 리스트 (동일한 경로의 값이라도 load가 성공하면 리스트에 추가된다.)
			'box': {} // 모듈화에 필요한 JS 파일별 값 - 구조: {'JS 파일명': 'box 반환값', 'JS 파일명': 'box 반환값', ... }
		};
	};
	Call.prototype = {
		dom: {
			// document에 존재하는 script element 리스트
			getScript: function() {
				var elements = document.getElementsByTagName('script');
				//var elements = document.scripts;
				var scripts = [];
				var src;
				if(typeof elements === 'object') {
					for(var i=elements.length-1; i>=0; i-=1) {
						if(typeof elements[i].src !== 'undefined' && elements[i].src !== '') {
							//src = elements[i].src; // 상대경로가 자동 절대경로로 변경
							src = elements[i].getAttribute('src');
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
			}
		},
		// 모듈
		Module: function() {
			// 모듈 타입
			this['type'] = 'script'; // script | box
			// 공통
			this['file'] = { 
				'count': 0, // 현재 작업 개수 카운트
				'total': 0, // 작업 리스트 총 개수
				'list': [] // 작업 리스트
			};
			// box 작업에 사용되는 정보
			this['box'] = {
				'count': 0, // 현재 box 개수 카운트
				'factory': [] // IE는 setBox가 js list 별로 모두 실행된 후 setState 가 실행되므로 타입이 배열로 되어있어야 한다.
			};
			// 모듈간 관계
			this['relation'] = {
				// 연결된 모듈 인스턴스 값
				'parent': undefined,
				/*
				- 매칭작업
				setState 함수에서 매칭작업이 진행되며,
				this['relation']['parent'] 인스턴스에서 box 인스턴스가 module 배열에서 몇번째 index 에 있는지 확인하여,
				이 index 값을 가지고 file 배열에서 현재 box 인스턴스가 어떤 src 인지 확인한다.
				*/
				'file': [], // load 된 파일 순서
				'module': [] // box 인스턴스 순서
			};
			// 해당 Module 작업 결과
			this['result'] = {
				'uninitialized': [], // 실패 리스트
				'complete': [] // 성공 리스트	
			};
			// 작업 결과에 따른 콜백 (type이 script 의 경우만 실행)
			this['success'] = function() {}; 
			this['error'] = function() {}; 
		},
		// script load
		setScript: function() {
			console.log('---------- setScript 실행');
			// arguments를 배열로 변환
			var args = Array.prototype.slice.call(arguments);
			var queue = this['queue'];

			// 모듈 인스턴스 생성
			var module = new this.Module(); 
			queue['script'].push(module);

			// 파라미터 확인
			switch(args.length) {
				case 3:
					// 에러 콜백 함수
					module['error'] = args.pop();
				case 2:
					// 완료 콜백 함수
					module['success'] = args.pop();
					break;
			}

			// 작업 정보 설정
			module['type'] = 'script';
			module['file']['list'] = (args[0] && typeof args[0] === "string") ? args : args[0];
			module['file']['total'] = module['file']['list'].length; // js 파일 리스트 총 개수

			// 실행
			this.setQueue();
		},
		setBox: function() {	
			// 흐름: setBox 가 실행되고, setState 가 실행
			// box(['파일', ... ], function() { return 반환값; }), 또는 box(반환값)
			// js 파일 load -> 해당 js파일의 box 리스트로드 -> 해당 js파일의 box 리스트로드 -> ... 계층적으로 js파일 load 가 이루어질 수 있음
			console.log('---------- setBox 실행');
			
			// arguments를 배열로 변환
			var args = Array.prototype.slice.call(arguments);
			var queue = this['queue'];
			var action = this['action'];
			var module;

			if(!action || typeof action !== 'object') return;

			// 파라미터 확인
			switch(args.length) {
				case 2:
					// 모듈 인스턴스 생성
					module = new this.Module();
					queue['box'].push(module);
					// 작업 정보 설정
					module['type'] = 'box';
					module['file']['list'] = args.shift();
					module['file']['total'] = module['file']['list'].length;
					// 관계 설정
					module['relation']['parent'] = action; // 추가 모듈에 현재 인스턴스값 설정
				case 1:
				default:
					//
					action['relation']['module'].push(module); // module: 파라미터가 2개의 경우 module은 box의 인스턴스 값이 들어가며, 1개의 경우 undefined 가 들어가도록 설계 (['relation']['file'] 리스트와 매칭작업 때문)
					//
					action['box']['count']++;
					action['box']['factory'].push(args.shift()); // box를 담고 있는 객체(또는 함수, undefined)
					break;
			}
		},
		// queue(대기중인 작업) 순차 실행
		setQueue: function() {
			console.log('---------- setQueue 실행');
			var queue = this['queue'];
			
			// 현재 실행 모듈에 적용
			if(queue['box'].length > 0) {
				this['action'] = queue['box'].shift();
			}else if(queue['script'].length > 0) {
				this['action'] = queue['script'].shift();
			}else {	
				//this['action'] = undefined;
				delete this['action'];
				return;
			}
			// list 실행
			if(this['action']['file']['list'].length === 0) { // 실행할 js load 리스트가 없거나, 중복된 js 파일이 이미 load 되어 리스트가 비어있을 경우
				this.setQueue(); // 재귀실행
			}else {
				this.setList(); // js 파일 리스트 실행
			}
		},
		// Module 내부 list(JS 파일) load 실행
		setList: function() {
			console.log('---------- setList 실행');
			if(!this['action'] || typeof this['action'] !== 'object') return;
			var list = this['action']['file']['list'];
			var i, max, src;
			
			// async 사용하여 JS리스트 전체 load 실행
			for(i=0, max=list.length; i<max; i++) {
				src = list[i];
				if(this['result']['complete'].indexOf(src) > -1) {
					// complete 되어있음 (이미 load 되어 있는 파일)
					this.setState(src, 'complete');
				}else {
					// load 실행
					this.setLoad(src);
				}
			}
		},
		// script 로드, 에러 이벤트
		setLoad: (function() {
			/*
			readyState 상태값
			uninitialized: 아직 loading이 시작되지 않았다.
			loading: loading 중이다.
			interactive: 충분히 load되었고 사용자가 그것과 상호작용할 수 있다.
			complete: 완전히 load되었다.
			*/
			if(document.attachEvent && !(document.attachEvent.toString && document.attachEvent.toString().indexOf('[native code') < 0)) {
				return function(src) {
					var that = this;
					var pending_script_list = [];
					var error_script_list = [];
					var element = that.dom.setScriptCreate();
					
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
					that.dom.setScriptInsert(element);
				}
			}else if(window.addEventListener) {
				return function(src) {
					var that = this;
					var element = that.dom.setScriptCreate();
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
					that.dom.setScriptInsert(element);
				}
			}else {
				return function(){};
			}
		})(),
		// load 에 따른 상태 설정 (setLoad 함수에서 실행됨)
		setState: function(src, state) { // state: uninitialized(실패), complete(완료)
			console.log('---------- setState 실행');
			var queue = this['queue'];
			var action = this['action'];
			var wait = this['wait'];
			var result = this['result'];

			console.log('src: ' + src);

			// 유효성 검사
			if(typeof action !== 'object' || !src || !state || (state !== 'uninitialized' && state !== 'complete')) return;

			// 전체 상태정보에 추가 - uninitialized[], complete[]
			result[state].push(src);

			// 현재 모듈(queue) 상태정보
			action['file']['count']++;
			action['relation']['file'].push(src);
			action['result'][state].push(src);

			// box
			if(!(src in result['box'])) { 
				// 개별 모듈의 box 확인
				if(action['file']['count'] > action['box']['count']) {
					// 해당 js 내부 box 실행 함수가 없으므로 강제 실행
					this.setBox(); 
				}

				// 전체 JS 정보에 추가 (필히 개별 box 확인 작업 후 실행되어야 한다)
				if(action['file']['count'] < action['box']['count']) { 
					// IE (익스플로러는 여러개의 JS 파일을 load 할 경우, box 함수가 모두 실행되고 이 부분이 실행될 수 있다.)
					result['box'][src] = action['box']['factory'].shift(); // 첫번째 (선입선출)
				}else {
					result['box'][src] = action['box']['factory'].pop(); // 마지막 (후입선출)
				}
			}

			// 
			if(action['file']['count'] === action['file']['total']) { 
				if(queue['box'].length > 0) {
					wait.push(action);
					this.setQueue();
					return;
				}else {

					// 현재 module 타입이 box 인것 처리 (factory 재설정)
					if(wait.length > 0 || action['type'] === 'box') {
						var i = wait.length;
						var instance = action;
						var parent, index, file, arr, j, max;
						do {
							// factory 재설정
							if(instance['type'] === 'box' && instance['file']['count'] === instance['file']['total']) {
								// 현재 box가 parent 의 module 배열에서 몇번째 index에 위치해 있는지 확인
								// index 값으로 file 배열에서 해당 index file 값을 가져온다.
								parent = instance['relation']['parent'];
								if(parent && typeof parent === 'object') {
									index = parent['relation']['module'].indexOf(instance);
									file = parent['relation']['file'][index];
									console.log('index: ' + index);
									console.log('file: ' + file);
									// facroty 값 재설정
									if(typeof result['box'][file] === 'function') {
										arr = [];
										for(j=0, max=instance['file']['total']; j<max; j++) {
											arr.push(result['box'][instance['file']['list'][j]]);
										}
										result['box'][file] = result['box'][file].apply(null, arr);
									}
								}
							}
							// wait 순차처리 (wait의 0번째 index 는 type 이 script 이므로 제외됨)
							i -= 1;
							if(i < 1) {
								break;
							}else {
								instance = wait[i];
							}
						}while(true);

						// 현재 action 값 변경
						action = wait[0];
					}
					console.dir(result['box']);


					/*
					if(action['type'] === 'script') {
						// 대기 모듈(queue)에서 현재 작업된 src 확인
						var ready_module, ready_queue, ready_list;
						for(ready_queue in queue['script']) {
							// 인스턴스 값
							ready_module = queue['script'][ready_queue]; 
							// 존재여부 확인
							ready_list = (typeof ready_module['list'] === 'object' && ready_module['list'].length > 0) ? ready_module['list'].indexOf(src) : -1; 
							// 현재 action 의 인스턴스가 아닌 대기중인 queue 의 인스턴스 작업임을 알야야 한다.
							if(ready_list > -1) { 
								// 대기중인 queue 에서 해당 src 관련 정보 변경
								ready_module[state].push(src);
								// box 정보
								ready_module['box'].push(this['box'][src]);
								// 대기 리스트 요소 제거
								//ready_module['list'].splice(ready_list, 1); // js list 를 지우게 되면, 하단 callback 에서 box 조립시 list 배열 정보를 몰라서 파라미터 작업을 못한다!!!!
								// 해당 콜백 실행
								this.setCallback(ready_module);
							}
						}
					}
					*/

					// 콜백실행
					this.setCallback(action);
				}
			}		
		},
		// 사용자 콜백 실행 (setState 함수에서 실행됨)
		setCallback: function(instance) {
			console.log('---------- setCallback 실행');
			if(typeof instance !== 'object') return;
			
			var result = this['result'];
			var uninitialized = instance['result']['uninitialized'];
			var complete = instance['result']['complete'];
			var arr, j, max;

			if(uninitialized.length > 0) { // 실패
				// 에러 콜백 실행
				try {
					instance['error'].call(instance['result']);
				}catch(e) {
					console.log(e);
				}
				// 현재 작업 정보 초기화
				if(instance === this['action']) {
					//this['action'] = undefined; 
					delete this['action'];
				}
				// 다음 queue 실행
				this.setQueue();
			}else if(instance['file']['count'] === instance['file']['total']) { // 성공
				// 정상 콜백 실행
				try {
					// box 파라미터 조립
					arr = [];
					for(j=0, max=instance['file']['total']; j<max; j++) {
						arr.push(result['box'][instance['file']['list'][j]]);
					}
					instance['success'].apply(instance['result'], arr);
				}catch(e) {
					console.log(e);
				}
				// 현재 작업 정보 초기화
				if(instance === this['action']) {
					//this['action'] = undefined; 
					delete this['action'];
				}
				// 다음 queue 실행
				this.setQueue();
			}
		}
	};
	var instance_call = new Call();

	// resize callback 관리
	var Resize = function() {
		var that = this;
		that.callback = [];
		that.time = null;
		that.func = function() {
			window.clearTimeout(that.time);
			that.time = window.setTimeout(function(){ 
				for(var index in that.callback) {
					that.callback[index]();
				}
			}, 500);
		};
		that.on();
	};
	Resize.prototype = {
		add: function(callback) { // callback 추가
			if(!callback || typeof callback !== 'function') return false;
			this.callback.push(callback);
		},
		del: function(callback) { // callback 제거
			if(!callback || typeof callback !== 'function') return false;
			var index = (this.callback.length > 0) ? this.callback.indexOf(callback) : -1; // 존재여부 확인
			if(index > -1) {
				this.callback.splice(index, 1); // 대기 리스트 요소 제거
			}
		},
		on: (function() { // resize 이벤트 작동
			if(typeof window.addEventListener === 'function') {
				return function() {
					window.addEventListener(core.event.resize, this.func, false);
				}
			}else if(typeof document.attachEvent === 'function') { // IE
				return function() {
					document.attachEvent('on' + core.event.resize, this.func);
				}
			}
		})(),
		off: (function() { // resize 이벤트 정지
			if(typeof window.removeEventListener === 'function') {
				return function() {
					window.removeEventListener(core.event.resize, this.func, false);
				}
			}else if(typeof document.detachEvent === 'function') { // IE
				return function() {
					document.detachEvent('on' + core.event.resize, this.func);
				}
			}
		})()
	};
	var instance_resize = new Resize();
	
	// ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- 

	global.api = {
		"core": core,
		"box": instance_call.setBox.bind(instance_call),
		"script": instance_call.setScript.bind(instance_call),
		"resize": instance_resize
	};

}, this);
