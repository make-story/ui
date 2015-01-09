/**
 * core
 * 브라우저 정보, 해상도, 사용자 정보 등 확인
 */

void function(global) {
	'use strict'; // ES5
	if(typeof global === 'undefined' || typeof global.api !== 'undefined') return false;
	global.api = (function() {
		// JS정보: http://www.quirksmode.org/js/detect.html
		// 해상도, 이벤트, 모바일, 브라우저 환경

		var core = {
			"screen": {
				"width": screen.availWidth || Math.round(window.innerWidth), // 실제 해상도 값
				"height": screen.availHeight || Math.round(window.innerHeight)
			},
			"browser": {
				"agent": null
			},
			"touch": null, // true, false
			"event": {
				"resize": 'onorientationchange' in window ? 'orientationchange' : 'resize',
				"down": null,
				"move": null,
				"up": null,
				// 애니메이션
				"transitionend": [
					"webkitTransitionEnd", 
					"oTransitionEnd", 
					"otransitionend", 
					"transitionend", 
					"transitionEnd" 
				],
				"animationstart": [
					"webkitAnimationStart", // webkit
					"oanimationstart", // opera
					"MSAnimationStart", // ie10+
					"animationstart" // standard, firefox
				],
				"animationiteration": [
					"webkitAnimationIteration",
					"oanimationiteration",
					"MSAnimationIteration",
					"animationiteration"
				],
				"animationend": [
					"webkitAnimationEnd",
					"oanimationend",
					"MSAnimationEnd",
					"animationend"
				]
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

		// browser
		if(navigator.userAgent.indexOf("Chrome") > -1) {
			core.browser.agent = "Google Chrome";
		}else if(navigator.userAgent.indexOf("Safari") > -1) {
			core.browser.agent = "Apple Safari";
		}else if(navigator.userAgent.indexOf("Opera") > -1) {
			core.browser.agent = "Opera";
		}else if(navigator.userAgent.indexOf("Firefox") > -1) {
			core.browser.agent = "Mozilla Firefox";
		}else if(navigator.userAgent.indexOf("MSIE") > -1) {
			core.browser.agent = "Microsoft Internet Explorer";
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

		return {"core": core};
	})();

	// api.core 수정하지 못하도록 제어
	

}(window);