/*
Div Flicking

The MIT License (MIT)
Copyright (c) Sung-min Yu
*/

(function(factory, global) {

	'use strict'; // ES5
	if(typeof global === 'undefined' || global !== window) return false;	
	var $, core;

	// jQuery || api.dom 구분
	if(typeof global.jQuery !== 'undefined') {
		$ = global.jQuery;
		core = {
			"check": { // true, false 
				"mobile": (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent||navigator.vendor||window.opera)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).substr(0,4)))
			},
			"event": {
				// 마우스 또는 터치
				"resize": 'onorientationchange' in window ? 'orientationchange' : 'resize',
				"down": 'mousedown',
				"move": 'mousemove',
				"up": 'mouseup'
			}
		}
		if(core.check.mobile === true) {
			core.event.down = 'touchstart';
			core.event.move = 'touchmove';
			core.event.up = 'touchend';
		}
	}else if(global.api && typeof global.api.dom !== 'undefined') {
		$ = global.api.$;
		core = api.core;
	}else {
		return false;
	}

	return factory($, core, global);

})(function($, core, global, undefined) {

	// translate (jQuery css 가 아닌 style property 로 설정하는 것이 좋음)
	var setTranslate = function(element, duration, translateX) {
		var style = element && element.style;
		style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = duration + 's';
		style.webkitTransform = 'translate(' + translateX + 'px, 0)' + 'translateZ(0)';
		style.msTransform = style.MozTransform = style.OTransform = 'translateX(' + translateX + 'px)';
	};

	// flicking
	var Flicking = function(parameter) {
		//return new
		if(!(this instanceof Flicking)) {
			return new Flicking(parameter);
		}

		var that = this;
		var parameter = parameter || {}; // 사용자 설정값

		// settings
		that.settings = { // 기본 설정값
			// selector
			'selector': null, // #id
			'speed': 300, /* 300 / 1000 = 0.3s */
			'auto': true,
			'second': 3, // 초
			'callback': null
		};
		var setSettings = function(settings, options) {
			var key;
			for(key in options) {
				if(options[key].constructor === Object) {
					settings[key] = setSettings(settings[key], options[key]);
				}else {
					settings[key] = options[key];
				}
			}
			return settings;
		};
		that.settings = setSettings(that.settings, parameter);

		// element
		that.element = {
			'container': $('#' + that.settings.selector),
			'flicking': null
		};
		if(!that.element.container) return false;

		// info
		that.info = {
			"total": 0, // 전체 슬라이드 개수
			"index": 0, // 현재 출력되고 있는 슬라이드
			"translate": 0, // container 의 현재 translateX 값
			"width": 0,
			"time": {
				'resize': null, 
				'auto': null
			}
		};

		// setup
		that.setup();
		
		// width
		that.size();

		// init
		that.init();

		// event
		that.on();

		// resize
		$(window).on(core.event.resize, function(){
			window.clearTimeout(that.info.time.resize);
			that.info.time.resize = window.setTimeout(function(){ 
				that.size();
			}, 500);
		});

		// auto slide
		if(that.settings.auto === true) {
			that.auto();
		}
	};
	Flicking.prototype = {
		// 초기값
		init: function() {
			var that = this;
			that.start = {
				"left": 0,
				"top": 0,
				"time": 0
			};
			that.end = {
				"left": 0,
				"top": 0,
				"time": 0
			};
		},
		// element 조립
		setup: function() {
			var that = this;
			var container = that.element.container;
			var children = container.children(); 
			var slide;
			var total = children.length;
			var fragment = $(document.createDocumentFragment());

			// 조립
			container.css({'overflow-x': 'hidden'});
			//that.element.flicking = $(document.createElement('div')).css(css3).attr('data-type', 'flicking');
			that.element.flicking = $(document.createElement('div')).attr('data-type', 'flicking');
			setTranslate(that.element.flicking[0], 0, 0);
			fragment.append(that.element.flicking);
			while(total--) {
				slide = $(document.createElement('div')).css({'float': 'left', 'display': 'block'}).attr({'data-type': 'slide', 'data-index': total}).append(children[total]);
				that.element.flicking.prepend(slide);
			}
			container.append(fragment);
		},
		// width 설정
		size: function() {
			var that = this;
			var container = that.element.container;
			var slide = container.find('[data-type="slide"]');
			that.info.total = slide.length;
			that.info.width = container.width();

			that.element.flicking.css({'width': (that.info.width * that.info.total) + 'px'});
			slide.css({'width': that.info.width + 'px'});

			setTranslate(that.element.flicking[0], 0, (that.info.width * that.info.index) * -1);
		},
		//
		on: function() {
			var that = this;

			// 마우스 이탈 체크
			if(core.check.mobile === false) {
				$(document).on('mouseout.out_' + that.settings.selector, function(e) {
					var event = e || window.event;
					var target = event.relatedTarget || event.toElement;
					if(!target || target.nodeName === "HTML") {
						$(/*that.element.container*/window).off('.move_' + that.settings.selector);
						$(/*that.element.container*/window).off('.up_' + that.settings.selector);
						that.slide();
					}
				});
			}
			
			// down 이벤트
			$(that.element.container).on(core.event.down + '.down_' + that.settings.selector, function(e) {
				var event = e || window.event;
				var event_mobile;

				$(/*that.element.container*/window).off('.move_' + that.settings.selector);
				$(/*that.element.container*/window).off('.up_' + that.settings.selector);
				
				// init
				that.init();
				
				// 시작값
				if(core.check.mobile === true) {
					event_mobile = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
					that.start.left = event_mobile.clientX;
					that.start.top = event_mobile.clientY;
				}else {
					that.start.left = event.clientX;
					that.start.top = event.clientY;
				}
				that.start.time = new Date().getTime();

				// auto 중지
				if(that.settings.auto === true) {
					window.clearTimeout(that.info.time.auto);
					//window.clearInterval(that.info.time.auto);
				}

				// move 이벤트
				$(/*that.element.container*/window).on(core.event.move + '.move_' + that.settings.selector, function(e) {
					var event = e || window.event;
					var event_mobile;
					var left, top, translate;
					var css3 = {};
					var i, max;

					// 이동값
					if(core.check.mobile === true) {
						event_mobile = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
						left = event_mobile.clientX;
						top = event_mobile.clientY;
					}else {
						left = event.clientX;
						top = event.clientY;
					}

					// 사용자 터치가 스크롤인지 슬라이드인지 확인하여 안정화함
					if(Math.abs(left - that.start.left) > Math.abs(top - that.start.top)) { 
						// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
						if(event.stopPropagation) { 
							event.stopPropagation();
						}else {
							event.cancelBubble = true;
						}
						// 현재 이벤트의 기본 동작을 중단한다.
						if(event.preventDefault) { 
							event.preventDefault();
						}else {
							event.returnValue = false;
						}

						// slide 이동
						translate = (left - that.start.left) + that.info.translate;
						setTranslate(that.element.flicking[0], 0, translate);
					}
				});
				// up 이벤트
				$(/*that.element.container*/window).on(core.event.up + '.up_' + that.settings.selector, function(e) {
					var event = e || window.event;
					var event_mobile;
					
					// 정지값
					if(core.check.mobile === true) {
						event_mobile = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
						that.end.left = event_mobile.clientX;
						that.end.top = event_mobile.clientY;
					}else {
						that.end.left = event.clientX;
						that.end.top = event.clientY;
					}
					that.end.time = new Date().getTime();

					var time = Number(that.end.time) - Number(that.start.time);
					var left = that.end.left - that.start.left;
					var top = that.end.top - that.start.top;
					var index = that.info.index;
					var duration = Number(that.settings.speed) / 1000; /* 300 / 1000 */

					// 이동 가능한지 검사
					if(Math.abs(left) > Math.abs(top) && ((time <= 100 && 30 <= Math.abs(left))/*마우스를 빠르게 이동한 경우*/ || (that.info.width / 6) < Math.abs(left)/*기준값 이상 이동한 경우*/)) {
						if((index+1) < that.info.total && left < 0) { // 다음
							index++;
						}else if(0 < index && left > 0) { // 이전
							index--;
						}
						// 슬라이드 속도
						duration = (time > 1000 || 6000 < time) ? duration : (time+100) / 1000;
					}

					/*
					console.log('that.info.index: ' + that.info.index);
					console.log('index: ' + index);
					console.log('duration: ' + duration);
					console.dir(that.start);
					console.dir(that.end);
					*/

					// 슬라이드 이동
					that.slide(index, duration);

					// init
					that.init();

					$(/*that.element.container*/window).off('.move_' + that.settings.selector);
					$(/*that.element.container*/window).off('.up_' + that.settings.selector);
				});
			});
		},
		off: function() {
			var that = this;
			
			// 이벤트 정지
			$(document).off('.out_' + that.settings.selector);
			$(that.element.container).off('.down_' + that.settings.selector);
			$(/*that.element.container*/window).off('.move_' + that.settings.selector);
			$(/*that.element.container*/window).off('.up_' + that.settings.selector);
			// auto 정지
			window.clearInterval(that.info.time.auto);
		},
		//
		slide: function(index, duration) {
			// 해당 슬라이드로 이동
			var that = this;
			var duration = typeof duration !== 'undefined' ? duration : Number(that.settings.speed) / 1000;
			var css3 = {};
			var i, max;
			if(typeof index === 'number' && (that.info.index < index || that.info.index > index)) { // 다음 || 이전
				that.info.translate = (that.info.width * index) * -1;
				that.info.index = index;
			}
			// slide 이동
			setTranslate(that.element.flicking[0], duration, that.info.translate);
			// callback
			if(typeof that.settings.callback === 'function') {
				that.settings.callback.call(null, that.info.index, that.info.total);
			}
			// auto 실행
			if(that.settings.auto === true) {
				that.auto();
			}
		},
		// value 숫자이면 해당 index로 이동, next || prev 이면 해당 모드에 따라 이동
		index: function(value) { 
			var that = this;

			// 유효성 검사
			if(typeof value === 'undefined' || (typeof value !== 'number' && !(/^(next|prev)$/.test(value)))) {
				return false;
			}

			// 해당 index 로 이동
			var index = that.info.index;
			var total = that.info.total;
			switch(value) {
				case 'next':
					// 다음 슬라이드 이동
					if((index+1) < total) {
						index += 1;
						that.slide(index);
					}else { // 처음으로 이동
						that.slide(0);
					}
					break;
				case 'prev':
					// 이전 슬라이드 이동
					if(0 < index) {
						index -= 1;
						that.slide(index);
					}else { // 마지막으로 이동
						that.slide(total-1);
					}
					break;
				default:
					// value 값에 해당하는 index 로 이동
					if(index != value && 0 <= value && value <= total) {
						that.slide(value);
					}
			}
		},
		next: function() {
			// 다음 슬라이드 이동
			this.index('next');
		},
		prev: function() {
			// 이전 슬라이드 이동
			this.index('prev');
		},
		//
		auto: function() {
			var that = this;
			
			window.clearTimeout(that.info.time.auto);
			that.info.time.auto = window.setTimeout(function(){ 
				that.next();
			}, that.settings.second * 1000);
			/*
			window.clearInterval(that.info.time.auto);
			that.info.time.auto = window.setInterval(function() {
				that.next();
			}, that.settings.second * 1000);
			*/
		},
		//
		add: function(index) {

		},
		del: function(index) {

		}
	};
	
	if(!global.api) global.api = {};
	global.api.flicking = Flicking;

}, this);