/**
 * 기능 테스트
 */
import $ from '../../dom';
import player from '../index';

export default (target='#player', options={}) => {
	$(target).html(`
		<div id="video"></div>
	`);

	player.setup(document.querySelector('#video'), 'video', {
		'source': 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4'
		//'source': 'https://video.cjmall.net/public/confirm/assets/201908/20190827/A000650/308b294ee469f04d677d3ac826847a33a0d3aa67.mp4?px-time=1567578578&px-hash=02e7117bc8d4da627663efd6596a8726'
	});
}