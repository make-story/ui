/**
 * 기능 테스트
 */
import $ from '../../dom';
import { frameQueue, transitionQueue, animationQueue, transform, } from '../index';

export default (target='#animate', options={}) => {
	document.head.appendChild((() => {
		const style = document.createElement("style");
		style.innerText = `
			.animate-test {
				position: absolute;
				width: 50px;
				height: 50px;
				border: 1px double rgb(44, 45, 46);
			}
		`;
		return style;
	})());
	$(target).html(`
		<button class="button-normal" id="button_test1">#a</button>
		<button class="button-normal" id="button_test2">#b</button>
		<button class="button-normal" id="button_test3">.a</button>
		<button class="button-normal" id="button_test4">.b</button>
		<div style="position: relative; min-height: 350px; border: 1px solid #eee;">
			<div id="a" class="not-basics-transition animate-test" style="left: 0px; top: 0px;">id: a</div>
			<div id="b" class="not-basics-transition animate-test" style="left: 50px; top: 50px;">id: b</div>

			<div class="a not-basics-transition animate-test" style="left: 100px; top: 100px;">class: a</div>
			<div class="a not-basics-transition animate-test" style="left: 150px; top: 150px;">class: a</div>
			<div class="b not-basics-transition animate-test" style="left: 200px; top: 200px;">class: b</div>
			<div class="b not-basics-transition animate-test" style="left: 250px; top: 250px;">class: b</div>
		</div>
	`);
	
	// 실행중인 애니메이션 정지 기능 개발해야함!!
	// 해당 앨리먼트가 애니메이션 중인지 확인하는 기능 개발해야함!!
	$('#button_test1').off('click').on('click', function(event) {
		/*frameQueue([
			{
				'element': '#a',
				'style': {
					'left': '100px',
					'top': '100px'
				},
				'complete': function() {
					console.log(this);
				}
			},
			{
				'element': '#a',
				'style': {
					'left': '0px',
					'top': '0px'
				},
				'complete': function() {
					console.log(this);
				}
			}
		]);*/
		frameQueue({
			'element': '#a',
			'duration': 3,
			'style': {
				'left': '50px',
				'top': '50px'
			},
			'complete': function() {
				console.log(this);
			}
		});
	});

	$('#button_test2').off('click').on('click', function(event) {
		transitionQueue([
			{
				'element': '#b',
				'duration': 3,
				'style': {
					'left': '0px',
					'top': '0px'
				},
				'complete': function() {
					console.log(this);
				}
			},
			{
				'element': '#b',
				'duration': 1,
				'style': {
					'left': '50px',
					'top': '50px'
				},
				'complete': function() {
					console.log(this);
				}
			}
		]);
	});

	$('#button_test3').off('click').on('click', function(event) {
		frameQueue([
			{
				'element': '.a',
				'duration': 3,
				'style': {
					'left': '50px',
					'top': '50px'
				},
				'complete': function() {
					console.log(this);
				}
			},
			{
				'element': '.a',
				'duration': 1,
				'style': {
					'left': '0px',
					'top': '50px'
				},
				'complete': function() {
					console.log(this);
				}
			}
		]);
	});

	$('#button_test4').off('click').on('click', function(event) {
		frameQueue([
			{
				'element': '.b',
				'duration': 3,
				'style': {
					'left': '50px',
					'top': '50px'
				},
				'complete': function() {
					console.log(this);
				}
			},
			{
				'element': '.b',
				'duration': 1,
				'style': {
					'left': '0px',
					'top': '100px'
				},
				'complete': function() {
					console.log(this);
				}
			}
		]);
	});
}