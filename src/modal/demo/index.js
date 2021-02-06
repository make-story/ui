/**
 * 기능 테스트
 */
import $ from '../../dom';
import modal from '../index';

export default (target='#modal', options={}) => {
	$(target).html(`
		<button id="layerButton">layer</button>
		<div id="layerTarget" style="margin: 20px 0; width: 200px; height: 600px; border: 1px solid #EEE; background-color: rgba(255, 255, 255, .97); display: none; overflow: auto;">
			레이어<button class="layerClose">닫기</button>
			<input type="text" value="aa">
			1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />1<br />
		</div>
	`);
	$('#layerButton').on('click', function() {
		modal.setup('#layerTarget', 'layer', {
			'key': 'layer',
			'mask': true,
			'close': 'layerClose'
		}).show();
	});
}