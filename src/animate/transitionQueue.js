/**
 * 트랜지션 순차실행 - IE10이상 사용가능 
 */
import browser from '../browser';
import $ from '../dom';
import { 
	regexp,
	numberUnit,
} from '../util';

const EVENT_TRANSITION_QUEUE = 'EVENT_TRANSITION_QUEUE';

export default (queue) => {
	if(typeof queue !== 'object') {
		return false;
	}else if(!Array.isArray(queue)) {
		queue = [queue];
	}

	const state = { // 트랜지션 종료 후 적용할 초기 style
		/*
		// 기본값 https://developer.mozilla.org/ko/docs/Web/CSS/transition
		transition: 
		transition-property: all
		transition-duration: 0s
		transition-timing-function: ease 또는 cubic-bezier(0.25, 0.1, 0.25, 1)
		transition-delay: 0s
		*/
		'msTransition': /^$/,
		'OTransition': /^$/,
		'MozTransition': /^$/,
		'WebkitTransition': /^$/,
		'transition': /^$/,

		'msTransitionProperty': /^(all)$/i,
		'OTransitionProperty': /^(all)$/i,
		'MozTransitionProperty': /^(all)$/i,
		'WebkitTransitionProperty': /^(all)$/i,
		'transitionProperty': /^(all)$/i,

		'msTransitionDuration': /^(0s)$/i,
		'OTransitionDuration': /^(0s)$/i,
		'MozTransitionDuration': /^(0s)$/i,
		'WebkitTransitionDuration': /^(0s)$/i,
		'transitionDuration': /^(0s)$/i,

		'msTransitionTimingFunction': /^(ease|cubic-bezier+)$/i,
		'OTtransitionTimingFunction': /^(ease|cubic-bezier+)$/i,
		'MozTransitionTimingFunction': /^(ease|cubic-bezier+)$/i,
		'WebkitTransitionTimingFunction': /^(ease|cubic-bezier+)$/i,
		'transitionTimingFunction': /^(ease|cubic-bezier+)$/i,

		'msTransitionDelay': /^(0s)$/i,
		'OTransitionDelay': /^(0s)$/i,
		'MozTransitionDelay': /^(0s)$/i,
		'WebkitTransitionDelay': /^(0s)$/i,
		'transitionDelay': /^(0s)$/i
	};

	(function call(queue) {
		let config = queue.shift(); // 현재 순서에 해당하는 정보
		let $element = $(config.element); // 대상 element
		let transition = config.style || config.transition; // 트랜지션을 적용할 CSS값 - {CSS 속성: 값}
		let duration = config.duration || 0; // 애니메이션 진행시간 (단위기준: 1s)
		let easing = config.easing || 'ease'; 
		let delay = config.delay || 0; // 효과가 시작할 때까지의 딜레이
		let complete = config.complete; // 애니메이션 종료 후 콜백 (complete)
		
		let element = $element.get();
		let properties = {}; // css 적용 프로퍼티 
		let transitionend = {}; // transitionend 이벤트 실행된 것 (true)
		let i, max, key, temp;

		// transition 값 확인
		for(key in transition) {
			if(!/^(animation*|transition*)/i.test(key)) { // animation, transition 관련작업은 제외됨
				properties[key] = transition[key];
			}
		}

		// 초기값 저장 / transition 설정
		for(i=0, max=element.length; i<max; i++) {
			if(typeof element[i] !== 'object' || !element[i].nodeType) {
				continue;
			}

			// 현재 상태값 저장
			if(typeof element[i].storage !== 'object') {
				element[i].storage = {};
			}
			if(typeof element[i].storage.transition !== 'object') {
				element[i].storage.transition = {};
				for(key in state) {
					//temp = element[i].style[key];
					temp = $(element[i]).css(key);
					if(temp && !state[key].test(temp)) { 
						// 현재 element에 설정된 style의 값이 state 목록에 지정된 기본값(style property default value)이 아니므로 
						// 현재 설정된 값을 저장(종료 후 현재값으로 재설정)
						element[i].storage.transition[key] = temp;
					}else { 
						// 현재 element에 설정된 style의 값이 state 목록에 지정된 기본값(style property default value)과 동일하거나 없으므로 
						// 작업 후 해당 property 초기화(삭제)
						element[i].storage.transition[key] = ''; // '' 또는 null
					}
				}
			}

			// transition 설정
			element[i].style.msTransitionProperty = element[i].style.OTransitionProperty = element[i].style.MozTransitionProperty = element[i].style.WebkitTransitionProperty = element[i].style.transitionProperty = Object.keys(properties).join(',');
			element[i].style.msTransitionDuration = element[i].style.OTransitionDuration = element[i].style.MozTransitionDuration = element[i].style.WebkitTransitionDuration = element[i].style.transitionDuration = `${Number(duration)}s`;
			element[i].style.msTransitionTimingFunction = element[i].style.OTtransitionTimingFunction = element[i].style.MozTransitionTimingFunction = element[i].style.WebkitTransitionTimingFunction = element[i].style.transitionTimingFunction = easing;
			//element[i].style.msTransitionDelay = element[i].style.OTransitionDelay = element[i].style.MozTransitionDelay = element[i].style.WebkitTransitionDelay = element[i].style.transitionDelay = `${Number(delay) / 1000}s`;
		}

		// 스타일 설정 
		$element.css(properties);

		// 트랜지션 (하위 자식 노드의 transition 전파에 따라 실행될 수 있다. 자식의 transition 전파를 막으려면 해당 자식 이벤트에 stopPropagation 실행)
		// 또는 addEventListener 를 사용하여, event.target 를 검사하여, 해당되는 element의 경우에만 콜백을 실행해야 한다.
		// transition 값이 여러개의 경우 각각의 프로퍼티별로 콜백이 실행된다. (left/top 두개 트랜지션이 설정되었을 경우, left/top 각각 콜백이 두번 실행된다.)
		$element.on(`${browser.event.transitionend}.${EVENT_TRANSITION_QUEUE}`, function(e) {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			let currentTarget = event.currentTarget;
			let target = event.target || event.srcElement;
			let propertyName = event.propertyName; // 트랜지션 실행된 프로퍼티명 
			let i, max, key;

			//console.log('[정보] 트랜지션 종료', event);
			/*console.log('event', event);
			console.log('currentTarget', currentTarget);
			console.log('target', target);
			console.log('transitionend', transitionend);
			console.log('propertyName', propertyName);*/
			if(currentTarget && target && currentTarget.isEqualNode(target) && transitionend[propertyName] !== true) { 
				// 해당 프로퍼티 실행상태로 변경 
				transitionend[propertyName] = true;

				// 모든 transitionend 실행되었는지 여부 확인
				if(Object.keys(properties).length === Object.keys(transitionend).length) {
					$element.off(`${browser.event.transitionend}.${EVENT_TRANSITION_QUEUE}`);

					// transition 설정 초기화
					for(i=0, max=element.length; i<max; i++) {
						if(typeof element[i] !== 'object' || !element[i].nodeType) {
							continue;
						}
						if(element[i].storage) {
							for(key in element[i].storage.transition) {
								element[i].style[key] = element[i].storage.transition[key];
							}
						}
					}

					// complete 실행
					if(typeof complete === 'function') {
						complete.call(element, event);
					}

					// 다음 실행할 queue 가 존재할 경우 (재귀호출)
					if(queue.length) {
						//console.log('[정보] next queue 실행');
						call(queue);
					}
				}
			}
		});
	})(queue);
};