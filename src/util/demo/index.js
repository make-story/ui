/**
 * 기능 테스트
 */
import $ from '../../dom';
import { elementPosition, elementOverlap, elementPositionStandard, } from '../element';
//import {} from '../is';
import { preset, appEventType, appEventOn, appEventOff } from '../app';

export default (target='#util', options={}) => {
	$(target).html(`
		<div id="positionTest" style="position: fixed; width: 100px; height: 100px; margin: 10px; border: 3px solid;">
			위치 테스트
		</div>
		<div id="overlapTarget" style="position: fixed; width: 50px; height: 50px; left: 0px; bottom: 0px; border: 1px solid;">
			겹치는지 테스트 (target)
		</div>
		<div id="positionStandard" style="position: fixed; width: 50px; height: 50px; left: 0px; bottom: 0px; border: 1px solid;">
			기준 테스트
		</div>
		<div id="overlapTestListWrap"></div>
		<div id="positionStandardElement">standard</div>
		
		<div>
			<button id="appWebViewEvent">앱->웹뷰 호출 테스트</button>
		</div>
	`);

	const positionList = ['topleft', 'topcenter', 'topright', 'bottomleft', 'bottomcenter', 'bottomright', 'centerleft', 'center', 'centerright'];
	let time = window.setInterval(() => {
		if(positionList.length) {
			let position = positionList.shift();
			elementPosition(document.querySelector('#positionTest'), position);
		}else {
			window.clearInterval(time);
		}
	}, 3000);

	/*alert(`elementList div : ${is.elementList(document.querySelectorAll('div'))}`);
	alert(`elementList #positionTest : ${is.elementList(document.querySelector('#positionTest'))}`);
	alert(`elementList window : ${is.elementList(window)}`);
	alert(`elementList document : ${is.elementList(document)}`);
	alert(`element div : ${is.element(document.querySelectorAll('div'))}`);
	alert(`element #positionTest : ${is.element(document.querySelector('#positionTest'))}`);
	alert(`window window : ${is.window(window)}`);
	alert(`document document : ${is.document(document)}`);*/

	const overlapTestListWrap = document.querySelector('#overlapTestListWrap');
	const fragment = document.createDocumentFragment();
	for(let i=0; i<3; i++) {
		let div = document.createElement('div');
		div.setAttribute('data-overlap', `overlap${i}`);
		div.style.cssText = 'position: fixed; width: 50px; height: 50px; left: 0px; bottom: 0px; border: 1px solid;';
		div.innerHTML = `overlap${i}`;
		fragment.appendChild(div);
	}
	overlapTestListWrap.appendChild(fragment);
	elementOverlap(document.querySelector('#overlapTarget'), document.querySelectorAll('[data-overlap]'));
	/*window.setInterval(() => {
		console.log(overlapTestListWrap.getBoundingClientRect().top);
		elementOverlap(document.querySelector('#overlapTarget'), document.querySelectorAll('[data-overlap]'));
	}, 3000);*/

	elementPositionStandard(document.querySelector('#positionStandard'), document.querySelector('#positionStandardElement'));

	//
	const appTest = (data) => {
		console.log(appEventType.TEST, data);
		appEventOff(appEventType.TEST, appTest);
	};
	appEventOn(appEventType.TEST, appTest);
	document.querySelector('#appWebViewEvent').addEventListener('click', (event) => {
		// 앱에서 실행했다고 가정 
		window[preset].appTriggerMessage(appEventType.TEST, event);
	})
}