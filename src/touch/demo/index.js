/**
 * 기능 테스트
 */
import $ from '../../dom';
import touch from '../index';

export default (target='#touch', options={}) => {
	$(target).html(`
		<button id="ysm">Touch</button>
	`);

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
	//touch.off('#ysm', 'one'); // one 해제
	//touch.off('#ysm'); // 전체 해제
}