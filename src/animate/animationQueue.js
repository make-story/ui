/**
 * 애니메이션 순차 실행 (이미 실행되고 있는 element는 대기 후 실행)
 * element.style 로 애니메이션을 주는 것이 아닌, 애니메이션값이 있는 class 값을 toggle 하는 방식이다.
 * https://developer.mozilla.org/ko/docs/Web/CSS/CSS_Animations/Detecting_CSS_animation_support
 */
import browser from '../browser';
import $ from '../dom';
import { 
	regexp,
	numberUnit,
} from '../util';

export default (queue) => {
	if(typeof queue !== 'object') {
		return false;
	}else if(!Array.isArray(queue)) {
		queue = [queue];
	}

	(function call(queue) {
		let config = queue.shift(); // 현재 순서에 해당하는 정보
		let $element = $(config.element); // 대상 element
		let animation = config.class || config.animation; // animation 적용 class name
		let complete = config.complete; // 애니메이션 종료 후 콜백 (complete)
		let handler;
		let time;

		handler = function(event) {
			event = event || window.event;

			//console.log('[정보] 이벤트타입: ' + event.type);
			switch(event.type) {
				case "animationstart":
				case "animationiteration":
					break;
				case "animationend":
					$element.removeClass(animation);
					$element.off(`${browser.event.animationend}.EVENT_ANIMATIONEND_QUEUE`);
					$element.removeProp('animationState');

					// complete 실행
					if(typeof complete === 'function') {
						complete.call(this, event);
					}
					// 다음 실행할 queue 가 존재할 경우
					if(queue.length) {
						//console.log('[정보] next queue 실행');
						call(queue);
					}
					break;
			}
		};

		// element 에 이미 진행중인 애니메이션이 있다면, 대기 했다가 실행한다.
		time = window.setInterval(function() {
			if($element.prop('animationState') !== 'running') { 
				//console.log('[정보] 애니메이션 실행');
				window.clearInterval(time);
				$element.prop({'animationState': 'running'});
				$element.addClass(animation);
				//$element.one(`${browser.event.animationend}.EVENT_ANIMATIONEND_QUEUE`, handler);
				$element.on(`${browser.event.animationend}.EVENT_ANIMATIONEND_QUEUE`, handler);
			}else {
				// 현재 실행중인 애니메이션이 존재 (대기 후 이전 애니메이션이 종료되면 실행)
				//console.log('[정보] 애니메이션 대기');
				//console.log('animationState: ' + $element.prop('animationState'));
			}
		}, 1);
	})(queue);
};