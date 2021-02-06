/**
 * one, two, delay touch
 * 마우스 또는 터치 up 이 발생하고, 특정시간 이후까지 down이 발생하지 않았을 때, 클릭이 몇번발생했는지 카운트를 시작한다.
 */
/*
-
사용예

touch.on('#ysm',
	{
		'one': function(e) {
			console.log('one touch');
		},
		'two': function(e) {
			console.log('two touch');
		},
		'delay': function(e) {
			console.log('delay touch');
		}
	}
);
touch.off('#ysm', 'one'); // one 해제

또는

touch.on('#ysm', function() {
	...
});
touch.off('#ysm', 'all'); // 전체 해제
*/
import browser from '../browser';
import $ from '../dom';

const events = ['delay', 'one', 'two'];
const EVENT_DOM_TOUCH = `EVENT_DOM_TOUCH`;
const [ EVENT_DOM_TOUCH_DELAY, EVENT_DOM_TOUCH_ONE, EVENT_DOM_TOUCH_TWO ] = (() => {
	return events.map((event) => `${EVENT_DOM_TOUCH}_${event.toLocaleUpperCase()}`);
})();
const EVENT_MOUSEMOVE_DOM_TOUCH = `EVENT_MOUSEMOVE_DOM_TOUCH`;
const EVENT_MOUSEUP_DOM_TOUCH = `EVENT_MOUSEUP_DOM_TOUCH`;
const setTouchHandler = function(event, element) { // 내부 this 사용 (화살표함수 금지)
	let touch = event.touches; // touchstart
	let that = element || this;
	let radius = 0; // 유효한 터치영역
	let checkout = {
		'delay': 1000, // 길게누르고 있는지 여부 검사시작 시간
		'count': 250, // 몇번을 클릭했는지 검사시작 시간
		'interval': 180 // 터지 down, up 이 발생한 간격 검사에 사용되는 시간
	};

	// 기본 이벤트를 중단시키면 스크롤이 작동을 안한다.
	// 버블링(stopPropagation) 중지시키면, 상위 이벤트(예: document 에 적용된 이벤트)이 작동을 안한다.

	if(!that.storage) { // 유효성 검사
		return;
	}else if(touch && touch.length && 1 < touch.length) { // 멀티터치 방지
		return;
	}

	// 이벤트 종료
	$(document).off(`.${EVENT_MOUSEMOVE_DOM_TOUCH}`);
	$(document).off(`.${EVENT_MOUSEUP_DOM_TOUCH}`);

	// 필수 정보
	that.touchCount = that.touchCount || 0; // 터치 횟수
	that.touchMove = that.touchMove || {};
	that.touchTime = that.touchTime || {}; // 터치 위치, 시간 등 정보 
	that.timeoutDelay = that.timeoutDelay || null; // delay check 관련 setTimeout
	that.timeoutCount = that.timeoutCount || null; // 터치 횟수 카운트 시작 관련 setTimeout
	radius = (event.target !== undefined && event.target.offsetWidth !== undefined && event.target.offsetWidth !== 'undefined') ? Math.max(event.target.offsetWidth, event.target.offsetHeight) : 0; // IE문제: 7에서 offsetWidth null 오류
	radius = Math.max(radius, 30); // 이벤트 작동 타겟 영역
	if(touch) {
		that.touchMove[that.touchCount] = {
			'start': {
				'top': touch[0].screenY,
				'left': touch[0].screenX
			},
			'end': {
				'top': touch[0].screenY,
				'left':  touch[0].screenX,
			},
		};
	}else {
		that.touchMove[that.touchCount] = {
			'start': {
				'top': event.screenY,
				'left': event.screenX
			},
			'end': {
				'top': event.screenY,
				'left':  event.screenX,
			},
		};
	}
	that.touchTime = {
		'start': new Date().getTime(),
		'end': new Date().getTime(),
	};

	// delay check
	window.clearTimeout(that.timeoutCount);
	that.timeoutDelay = window.setTimeout(function() {
		if(that.storage[EVENT_DOM_TOUCH_DELAY] && typeof that.storage[EVENT_DOM_TOUCH_DELAY] === 'function') {
			that.storage[EVENT_DOM_TOUCH_DELAY].call(that, event);
		}
	}, checkout.delay);

	// move check
	$(document).on(`${browser.event.move}.${EVENT_MOUSEMOVE_DOM_TOUCH}`, function(event) {
		let touch = event.touches || event.changedTouches;
		let isCheck = !!(that.touchCount && typeof that.touchMove === 'object' && that.touchMove[that.touchCount]);

		if(isCheck) {
			if(touch) {
				that.touchMove[that.touchCount].end.top = touch[0].screenY;
				that.touchMove[that.touchCount].end.left = touch[0].screenX;
			}else {
				that.touchMove[that.touchCount].end.top = event.screenY;
				that.touchMove[that.touchCount].end.left = event.screenX;
			}
		}

		// delay 정지
		if(!isCheck || Math.abs(that.touchMove[0].start.top - that.touchMove[that.touchCount].end.top) > radius || Math.abs(that.touchMove[0].start.left - that.touchMove[that.touchCount].end.left) > radius) {
			window.clearTimeout(that.timeoutDelay);
		}
	});

	// up check
	$(document).on(`${browser.event.up}.${EVENT_MOUSEUP_DOM_TOUCH}`, function(event) { // IE7문제: window 가 아닌 document 에 할당해야 한다.
		let touch = event.changedTouches; // touchend

		// 현재 이벤트의 기본 동작을 중단한다. (모바일에서 스크롤 하단이동 기본기능)
		event.preventDefault();

		// 이벤트 종료
		$(document).off(`.${EVENT_MOUSEMOVE_DOM_TOUCH}`);
		$(document).off(`.${EVENT_MOUSEUP_DOM_TOUCH}`);

		//
		that.touchCount += 1;
		that.touchTime.end = new Date().getTime();

		// click check: 지정된 시간까지 다음 클릭이 발생하지 않는다면, count 값을 확인하여 해당 콜백을 실행한다.
		window.clearTimeout(that.timeoutDelay);
		if(typeof that.touchMove === 'object' && that.touchMove[that.touchCount-1]) {
			that.timeoutCount = window.setTimeout(function() {
				let start = that.touchMove[0].start;
				let end = that.touchMove[that.touchCount-1].end;
				let time = Number(that.touchTime.end) - Number(that.touchTime.start);

				// handler(callback) 실행
				if(time <= checkout.interval/* 클릭된 상태가 지속될 수 있으므로 시간검사 */ && Math.abs(start.top - end.top) <= radius && Math.abs(start.left - end.left) <= radius) {
					if(that.touchCount === 1 && that.storage[EVENT_DOM_TOUCH_ONE] && typeof that.storage[EVENT_DOM_TOUCH_ONE] === 'function') {
						that.storage[EVENT_DOM_TOUCH_ONE].call(that, event);
					}else if(that.touchCount === 2 && that.storage[EVENT_DOM_TOUCH_TWO] && typeof that.storage[EVENT_DOM_TOUCH_TWO] === 'function') {
						that.storage[EVENT_DOM_TOUCH_TWO].call(that, event);
					}
				}
				that.touchCount = 0;
				that.touchMove = {};
			}, checkout.count); // 검사 시작시간
		}
	});
};

export default {
	on: function(selector, handler) {
		if(!selector || !handler || (typeof handler !== 'object' && typeof handler !== 'function')) {
			return false;
		}
		$(selector).each(function(i, element) {
			let key;

			if(element && element.nodeType) {
				if(typeof element.storage !== 'object') {
					element.storage = {};
				}
				if(typeof handler === 'object') {
					for(key in handler) {
						if(typeof handler[key] === 'function' && handler.hasOwnProperty(key)/* && [EVENT_DOM_TOUCH_DELAY, EVENT_DOM_TOUCH_ONE, EVENT_DOM_TOUCH_TWO].includes(`${EVENT_DOM_TOUCH}_${key.toUpperCase()}`)*/) {
							element.storage[`${EVENT_DOM_TOUCH}_${key.toUpperCase()}`] = handler[key];
						}
					}
				}else {
					element.storage[EVENT_DOM_TOUCH_ONE] = handler;
				}
				if(!element.storage[EVENT_DOM_TOUCH]) {
					$(element).on(`${browser.event.down}.${EVENT_DOM_TOUCH}`, setTouchHandler);
				}
			}
		});
	},
	off: function(selector, eventkey='all') { // eventkey: one, two, delay, all
		if(!selector) {
			return false;
		}
		$(selector).each(function(i, element) {
			let key = (typeof eventkey === 'string' && eventkey) || 'all';

			if(element && element.nodeType && typeof element.storage === 'object') {
				switch(key.toLowerCase()) {
					case 'one':
					case 'two':
					case 'delay':
						delete element.storage[`${EVENT_DOM_TOUCH}_${key.toUpperCase()}`];
						break;
					case 'all':
						$(element).off(`.${EVENT_DOM_TOUCH}`);
						break;
				}
			}
		});
	}
};