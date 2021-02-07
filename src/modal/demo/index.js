/**
 * 기능 테스트
 */
import $ from '../../dom';
import modal from '../index';

export default (target='#modal', options={}) => {
	$(target).html(`
		<button id="layerButton">layer</button>
		<button id="rectButton" style="position: absolute; left: 200px; top: 50px;">rect</button>
		<button id="rectAutoButton" style="position: absolute; left: 100px; top: 100px;">rect auto</button>
		<button id="messageButton">message</button>

		<div id="layerTarget" style="margin: 20px 0; width: 200px; height: 600px; border: 1px solid #EEE; background-color: rgba(255, 255, 255, .97); display: none; overflow: auto;">
			레이어<button class="layerClose">닫기</button>
			<input type="text" value="aa">
			1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />
		</div>
		<div id="rectTarget" style="margin: 10px; width: 300px; height: 300px; border: 1px solid #EEE; background-color: rgba(255, 255, 255, .97); display: none;">
			말풍선
		</div>
		<div id="rectAutoTarget" style="margin: 10px; width: 300px; height: 300px; border: 1px solid #EEE; background-color: rgba(255, 255, 255, .97); display: none;">
			Auto
		</div>
	`);

	let i = 0;
	$('#layerButton').on('click', function() {
		modal.setup('#layerTarget', 'layer', {
			'key': 'layer',
			'mask': true,
			'close': 'layerClose'
		}).show();
	});
	$('#rectButton').on('click', function() {
		modal.setup('#rectTarget', 'rect', {
			'key': 'rect',
			'position': 'bottomcenter',
			'rect': '#rectButton' // 기준
		}).toggle();
	});
	$('#rectAutoButton').on('click', function() {
		modal.setup('#rectAutoTarget', 'rect', {
			'key': 'rect_auto',
			'position': 'auto',
			'rect': '#rectAutoButton' // 기준
		}).toggle();
	});
	$('#messageButton').on('click', function() {
		i += 1;
		modal.setup(`메시지${i}!`, 'message', {
			'key': `push${i}`,
			'position': 'topright',
			'mask': false,
			'callback': {
				'hide': function() {
					this.remove();
				}
			}
		}).show();
	});
}