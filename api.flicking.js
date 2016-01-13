/*
Flicking

@version
0.1 (2015.07.07)

@copyright
Copyright (c) Sung-min Yu.

@license
Dual licensed under the MIT and GPL licenses.
*/

;(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window || !('api' in global)) {
		return false;	
	}
	global.api.flicking = factory(global);

})(function(global, undefined) {

	'use strict'; // ES5

	// 플리킹
	var Flicking = function() {
		var that = this;

		// instance - grid별 Module 인스턴스값이 저장되며, grid key 로 해당 인스턴스를 불러온다.
		that.instance = {};

		// 현재 실행중인 플리킹 정보 (인스턴스 값)
		that.action;
	};
	Flicking.prototype = {
		// 해당 grid 이벤트 적용 (실행)
		setup: function(parameter) {
			var that = this;

			// parameter
			var parameter = parameter || {};
			var key = parameter['key']; // flicking key
			var total = parameter['total']; // 슬라이드 총 개수
			var width = parameter['width']; // 슬라이드 하나기준 width
			var element = parameter['element']; // flicking element

			// ---------- ---------- ---------- ---------- ---------- ----------

			if(!key || !element.nodeType) {
				console.log('[오류]');
				return false;
			}

			// 모듈
			var Module = function() {
				// info
				this.key; // grid key
				this.total = 0; // 전체 슬라이드 개수
				this.width = 0; // 슬라이드 width 값
				this.index = 1; // 현재 출력되고 있는 슬라이드 (1부터 시작)
				this.translate = 0; // container 의 현재 translateX 값
				this.element; // 플리킹 대상 element

				// settings
				this.settings = { // 기본 설정값
					'speed': 300,
					'callback': null/*, 
					'auto': true,
					'second': 3 // 초*/
				};

				// translate 콜백
				this.complete; // 슬라이드 작동후 한번실행
			};
			Module.prototype = {
				init: function() {
					this.start = {
						"left": 0,
						"top": 0,
						"time": 0
					};
					this.end = {
						"left": 0,
						"top": 0,
						"time": 0
					};
				}
			};

			// ---------- ---------- ---------- ---------- ---------- ----------

			// flicking 별로 인스턴스를 만든다.
			// key 로 해당 인스턴스를 불러와 동작 시킨다.
			that['instance'][key] = new Module();
			that['instance'][key]['key'] = key;
			that['instance'][key]['total'] = total;
			that['instance'][key]['width'] = width;
			that['instance'][key]['element'] = element;

			// element storage
			if(!element['storage']) {
				element['storage'] = {};
			}
			element['storage']['flicking'] = key; // element 에 flicking 키 설정

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 이벤트 적용
			that.setOn(parameter);
			that.setTransitionendOn(parameter);

			// 스크롤 이벤트 (상하로 움직일 때, 이전과 이후 슬라이드도 함께 이동한다.)

		},
		// 해당 플리킹 정보반환: index, total 등 (또는 모듈 인스턴스를 통해 접근할 수 있다.)
		getInstance: function(parameter) { 
			var that = this;
			var parameter = parameter || {};
			var key = parameter['key']; // flicking key

			if(!key || !that['instance'][key] || !that['instance'][key]['element']) {
				console.log('[오류]');
				return false;
			}
			
			return that['instance'][key];
		},
		// 
		setOn: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var key = parameter['key'];

			if(!key || !that['instance'][key] || !that['instance'][key]['element']) {
				console.log('[오류]');
				return false;
			}
			// 로그
			//console.log('[실행] flicking event');
			//console.log(that['instance'][key]['element']);

			// 마우스 오버시 slide prev, slide next 버튼을 show 하자
			// 마우스 아웃시 slide prev, slide next 버튼을 hide 하자
			// 모바일에서는 사용자가 플레킹에 익숙해져 있지만, pc 에서 사용자는 버튼에 익숙해져 있으므로, 이 방법이 최선이다
			// 위 방법은 뉴욕타임즈를 참고했다.

			// over 이벤트
			/*api.dom('[data-type="grid"]').on('mouseover.over_grid', function(e) {
				api.dom(this).on('mouseout.out_grid', function(e) {

				});
			});*/

			// 이벤트 키를 검사하여, 이미 이벤트가 설정되었는지 확인 (이벤트 중복 설정 방지)
			if(that['instance'][key]['element']['storage'] && that['instance'][key]['element']['storage']['EVENT_MOUSEDOWN_flicking_grid']) {
				console.log('[오류] 중복 이벤트');
				return false;
			}

			// down 이벤트
			api.dom(that['instance'][key]['element']).on(api['env']['event']['down'] + '.EVENT_MOUSEDOWN_flicking_grid', function(e) {
				//console.log('[정보] flicking MOUSEDOWN');
				var event = e || window.event;
				//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
				var touch = event.touches; // touchstart

				// 버블링(stopPropagation) 중지시키면, 상위 이벤트(예: document 에 적용된 이벤트)이 작동을 안한다.
				// 현재 이벤트의 기본 동작을 중단한다. (터치 디바이스에서 기본 이벤트를 중단시키면 스크롤이 작동을 안한다. 모바일에서는 user-select: none; CSS로 해결한다.)
				if(!api['env']['check']['touch']) {
					// PC에서는 마우스 이벤트 정확도(기능 정상작동)를 올리기 위해 정지
					if(event.preventDefault) { 
						event.preventDefault();
					}else {
						event.returnValue = false;
					}
				}
				
				// 멀티터치 방지
				if(touch && touch.length && 1 < touch.length) {
					return;
				}

				// 이벤트 정지
				api.dom(window).off('.EVENT_MOUSEMOVE_flicking_grid');
				api.dom(window).off('.EVENT_MOUSEUP_flicking_grid');
				
				if(!this['storage'] || !this['storage']['flicking'] || !that['instance'][this['storage']['flicking']]) {
					console.log('[오류]');
					return false;
				}
				
				// 인스턴스
				that['action'] = that['instance'][this['storage']['flicking']]; // this['storage']['flicking']: element 에 설정된 flicking key

				// init
				that['action'].init();

				// ---------- ---------- ---------- ---------- ---------- ----------
				
				// 시작값
				if(touch) {
					that['action']['start']['left'] = touch[0].clientX;
					that['action']['start']['top'] = touch[0].clientY;
				}else {
					that['action']['start']['left'] = event.clientX;
					that['action']['start']['top'] = event.clientY;
				}
				that['action']['start']['time'] = new Date().getTime();
				
				// move 이벤트
				api.dom(window).on(api['env']['event']['move'] + '.EVENT_MOUSEMOVE_flicking_grid', function(e) {
					//console.log('[정보] flicking MOUSEMOVE');
					var event = e || window.event;
					//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
					var touch = event.touches || event.changedTouches;
					var left, top, translate;

					// 이동값
					if(touch) {
						left = touch[0].clientX;
						top = touch[0].clientY;
					}else {
						left = event.clientX;
						top = event.clientY;
					}

					// 로그
					/*console.log("left: " + left);
					console.log("that['action']['start']['left']: " + that['action']['start']['left']);
					console.log("top: " + top);
					console.log("that['action']['start']['top']: " + that['action']['start']['top']);
					console.log(Math.abs(left - that['action']['start']['left']));
					console.log(Math.abs(top - that['action']['start']['top']));*/

					// 사용자 터치가 스크롤인지 슬라이드인지 확인하여 안정화함
					if(Math.abs(left - that['action']['start']['left']) > Math.abs(top - that['action']['start']['top'])) { 
						// 현재 이벤트의 기본 동작을 중단한다. (슬라이드가 작동중일 때 모바일의 기본이벤트인 스크롤 작동을 중단시킨다.)
						if(event.preventDefault) { 
							event.preventDefault();
						}else {
							event.returnValue = false;
						}
						// slide 이동
						translate = (left - that['action']['start']['left']) + that['action']['translate'];
						that.setTranslate({'duration': 0, 'translateX': translate});
					}
				});
				
				// up 이벤트
				api.dom(window).on(api['env']['event']['up'] + '.EVENT_MOUSEUP_flicking_grid', function(e) {
					//console.log('[정보] flicking MOUSEUP');
					var event = e || window.event;
					//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
					var touch = event.changedTouches; // touchend

					// 현재 이벤트의 기본 동작을 중단한다.
					if(event.preventDefault) { 
						event.preventDefault();
					}else {
						event.returnValue = false;
					}

					// 정지값
					if(touch) {
						that['action']['end']['left'] = touch[0].clientX;
						that['action']['end']['top'] = touch[0].clientY;
					}else {
						that['action']['end']['left'] = event.clientX;
						that['action']['end']['top'] = event.clientY;
					}
					that['action']['end']['time'] = new Date().getTime();

					var time = Number(that['action']['end']['time']) - Number(that['action']['start']['time']);
					var left = that['action']['end']['left'] - that['action']['start']['left'];
					var top = that['action']['end']['top'] - that['action']['start']['top'];
					var index = that['action']['index'];
					var duration = Number(that['action']['settings']['speed']) / 1000; /* 300 / 1000 */

					// 이동 가능한지 검사
					if(Math.abs(left) > Math.abs(top) && ((time <= 100 && 30 <= Math.abs(left))/*마우스를 빠르게 이동한 경우*/ || (that['action']['width'] / 6) < Math.abs(left)/*기준값 이상 이동한 경우*/)) {
						if(index < that['action']['total'] && left < 0) { // 다음
							index++;
						}else if(1 < index && left > 0) { // 이전
							index--;
						}
						// 슬라이드 속도
						duration = (time > 1000 || 6000 < time) ? duration : (time+100) / 1000;
					}

					/*
					// 로그
					console.log('[실행정보] 플로킹');
					console.log('index: ' + that['action']['index']);
					console.log('index: ' + index);
					console.log('duration: ' + duration);
					console.dir(that['action']['start']);
					console.dir(that['action']['end']);
					*/

					// 슬라이드 이동 (transitionend 이벤트 발생됨)
					that.setSlideMove({'key': key, 'index': index, 'duration': duration});

					// 이벤트 정지
					api.dom(window).off('.EVENT_MOUSEMOVE_flicking_grid');
					api.dom(window).off('.EVENT_MOUSEUP_flicking_grid');

					// init
					that['action'].init();
				});
			});
		},
		setOff: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var key = parameter['key'];

			api.dom(window).off('.EVENT_MOUSEMOVE_flicking_grid');
			api.dom(window).off('.EVENT_MOUSEUP_flicking_grid');

			if(!key || !that['instance'][key] || !that['instance'][key]['element']) {
				console.log('[오류]');
				return false;
			}

			api.dom(that['instance'][key]['element']).off('.EVENT_MOUSEDOWN_flicking_grid');
		},
		setRestart: function(parameter) {
			var that = this;

			that.setOff(parameter);
			that.setOn(parameter);
		},
		// 슬라이드 마우스 오버 콜백
		setSlideMouseoverOn : function(parameter) {

		},
		setSlideMouseoverOff : function(parameter) {

		},
		// 마우스 포인터 브라우저 밖으로 나갔는지 확인
		setBrowserMouseoutCheckOn: function(parameter) {
			var that = this;

			/*if(api['env']['check']['mobile'] === false) {
				api.dom(document).on('mouseout.EVENT_MOUSEOUT_flicking_grid', function(e) {
					var event = e || window.event;
					//var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]);
					var touch = event.touches || event.changedTouches;
					var target = event.relatedTarget || event.toElement;
					if(!target || target.nodeName === "HTML") {
						// 이동중에 있는 플리킹 정지
						that.setSlideStop();
					}
				});
			}*/
		},
		setBrowserMouseoutCheckOff: function(parameter) {
			var that = this;

			//api.dom(document).off('.EVENT_MOUSEOUT_flicking_grid');
		},
		// transitionend
		setTransitionendOn: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var key = parameter['key'];

			if(!key || !that['instance'][key] || !that['instance'][key]['element']) {
				console.log('[오류]');
				return false;
			}

			// 이벤트 키를 검사하여, 이미 이벤트가 설정되었는지 확인 (이벤트 중복 설정 방지)
			if(that['instance'][key]['element']['storage'] && that['instance'][key]['element']['storage']['EVENT_TRANSITION_flicking_grid']) {
				console.log('[오류] 중복 이벤트');
				return false;
			}

			// 트랜지션 (하위 자식 노드의 transition 전파에 따라 실행될 수 있다. 자식의 transition 전파를 막으려면 해당 자식 이벤트에 stopPropagation 실행)
			api.dom(that['instance'][key]['element']).on(api['env']['event']['transitionend'] + '.EVENT_TRANSITION_flicking_grid', function(e) {
				var event = e || window.event;

				console.log('[정보] transitionend');
				//console.log(event.target);
				//console.log(event.type);
				//console.log(event.bubbles);
				//console.log(event.cancelable);
				//console.log(event.propertyName);
				//console.log(event.elapsedTime);
				//console.log(event.pseudoElement);

				// grid에서 발생한 이벤트여부 확인
				if(that['instance'][key]['element'].isEqualNode(event.target) && typeof event.propertyName === 'string' && event.propertyName.toLowerCase() === 'transform') {
					console.log('grid transform');
				}
			});
		},
		setTransitionendOff: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var key = parameter['key'];

			if(!key || !that['instance'][key] || !that['instance'][key]['element']) {
				console.log('[오류]');
				return false;
			}

			api.dom(that['instance'][key]['element']).off('.EVENT_TRANSITION_flicking_grid');
		},
		// translate
		setTranslate: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var duration = parameter['duration'];
			var translateX = parameter['translateX'];
			var style = that['action']['element'] && that['action']['element'].style;

			if(!style) {
				console.log('[오류]');
				return false;
			}
			style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = duration + 's';
			style.webkitTransform = 'translate(' + translateX + 'px, 0)' + 'translateZ(0)';
			style.msTransform = style.MozTransform = style.OTransform = 'translateX(' + translateX + 'px)';
		},
		//
		setSlideMove: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var key = parameter['key'];
			var index = parameter['index'];
			var duration = parameter['duration'] ? parameter['duration'] : Number(that['action']['settings']['speed']) / 1000;
			var complete = parameter['complete'];

			if(typeof index === 'number' && (that['action']['index'] < index || that['action']['index'] > index)) { // 다음 || 이전
				that['action']['translate'] = (that['action']['width'] * (index - 1)) * -1;
				that['action']['index'] = index;
				if(typeof complete === 'function') {
					that['action']['complete'] = complete;
				}
			}
			
			// slide 이동
			that.setTranslate({'duration': duration, 'translateX': that['action']['translate']});
		},
		// 슬라이드 이동 정지
		setSlideStop: function() {
			var that = this;
			if(that['action']) {
				that.setSlideMove({'key': that['action'].key, 'index': that['action']['index']});
			}
		},
		// 슬라이드 index 또는 next, prev 값에 따른 이동
		setSlideIndex: function(parameter) {
			var that = this;
			var parameter = parameter || {};
			var key = parameter['key'];
			var value = parameter['value']; // value 숫자이면 해당 index로 이동, next || prev 이면 해당 모드에 따라 이동
			var complete = parameter['complete'];

			// ---------- ---------- ---------- ---------- ---------- ----------

			if(!key || !that['instance'][key] || !that['instance'][key]['element'] || !value || (typeof value !== 'number' && !(/^(next|prev)$/.test(value)))) {
				console.log('[오류]');
				return false;
			}

			// 해당 grid 의 module 인스턴스 값
			that['action'] = that['instance'][key];
			if(typeof complete === 'function') {
				that['action']['complete'] = complete;
			}

			// ---------- ---------- ---------- ---------- ---------- ----------

			// 해당 index 로 이동
			var index = that['action']['index'];
			var total = that['action']['total'];
			if(total > 1) {
				switch(value) {
					case 'next':
						// 다음 슬라이드 이동
						if(index < total) {
							index += 1;
							that.setSlideMove({'key': key, 'index': index});
						}/*else { // 처음으로 이동
							that.setSlideMove({'key': key, 'index': 0});
						}*/
						break;
					case 'prev':
						// 이전 슬라이드 이동
						if(1 < index) {
							index -= 1;
							that.setSlideMove({'key': key, 'index': index});
						}/*else { // 마지막으로 이동
							that.setSlideMove({'key': key, 'index': total});
						}*/
						break;
					default:
						// value 값에 해당하는 index 로 이동
						if(index != value && 1 <= value && value <= total) {
							that.setSlideMove({'key': key, 'index': value});
						}
				}
			}

		}
	};

	// public return
	return new Flicking();

}, this);