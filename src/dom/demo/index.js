/**
 * 기능 테스트
 */
import $ from '../index';

export default (target='#animate', options={}) => {
	console.log($('body'));
	$('body').append($('<div />'));

	$().ready(() => {
		console.log('ready!');
	});

	// svg 생성 테스트!
	const $div = $('<div />');
	$('body').append($div);
	console.log('eq', $div.eq(0));
	console.log('get', $div.get(0));
	//console.log('index', $div.index(0));

	$div.html('<p>TEST</p><p>-</p>');
	console.log('find', $div.find('p'));
	//console.log('closest', $div.closest('body'));
	console.log('children', $div.children());

	$div.addClass('test');
	console.log('getClass', $div.getClass());
	console.log('hasClass', $div.hasClass('test'));

	console.log('is', $div.is('#test'));
	$div.attr({'id': 'test'});
	console.log('is', $div.is('#test'));
	console.log('arrt', $div.attr('id'));

	console.log('isEqualNode', $div.isEqualNode($('#test')));
	console.log('focusElement', $().focusElement())

	$div.css({'border': '1px solid'});

	console.log('isVisible', $div.isVisible());
	console.log('offset', $div.offset());
	console.log('offsetParent', $div.offsetParent());
	console.log('position', $div.position());
	//$div.scrollIntoView();

	console.log('width', $div.width());
	console.log('innerWidth', $div.innerWidth());
	console.log('outerWidth', $div.outerWidth());
	console.log('height', $div.height());
	console.log('innerHeight', $div.innerHeight());
	console.log('outerHeight', $div.outerHeight());

	const copy = $div.clone(true);
	copy.css({'position': 'fixed', 'top': 0, 'left': 0});
	copy.width(100);
	copy.height(100);
	copy.empty();
	$('body').append(copy);
	copy.on('click', (e) => {
		console.log(e);
	});
	copy.off('click');
	setTimeout(() => {
		copy.remove();
		$div.hide();
	}, 3000);
	setTimeout(() => {
		$div.show();
	}, 6000);
}