/**
 * 기능 테스트
 */
import $ from '../../dom';
import flicking from '../index';

export default (target='#flicking', options={}) => {
	$(target).html(`
		<div style="border: 1px solid #000; width: 500px; height: 500px; overflow: hidden;">
			<section id="slide" style="">
				<div style="width: 500px; height: 500px; overflow-x: hidden; overflow-y: auto;">
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
					A<br />
					B<br />
				</div>
				<div style="width: 500px; height: 500px; overflow-x: hidden; overflow-y: auto;">
					B
				</div>
				<div style="width: 500px; height: 500px; overflow-x: hidden; overflow-y: auto;">
					<!-- 링크 테스트 //-->
					<a href="makestory.net/blog" target="_blank">C</a>
				</div>
				<div style="width: 500px; height: 500px; overflow: hidden;">
					<!-- 슬라이드 내부 슬라이드 //-->
					<div id="inner" style="width: 500px; height: 500px; overflow: hidden;">
						<div>
							a
						</div>
						<div>
							b
						</div>
					</div>
				</div>
			</section>
			<!--div style="clear: both;"></div-->
		</div>
	`);

	const instance = flicking.setup('#slide', {
		'key': 'ysm',
		//'auto': 1000,
		'width': 'auto',
		'height': 'auto',
		//'width': 500,
		//'height': 500,
		//'flow': 'vertical',
		'listeners': {
			'slidechange': function() {
				if(this.index == 4) {
					flicking.setup('#inner', {
						'key': 'inner',
						'width': 500,
						'height': 500,
						'wheel': true,
						'flow': 'vertical'
					});
				}
			}
		}
	});
	//instance.append({'html': '<div>a</div>'});
	//instance.append({'element': $('<div>').get(0)});
}