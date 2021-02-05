import { frameQueue, transitionQueue, animationQueue, transform, } from './animate';
import browser, { browserHistory, browserLocation, browserStorage, } from './browser';
import $ from './dom';
import editor from './editor';
import touch from './touch';
import player from './player';

console.log(browser);
console.log($('.container'));

/**
 * animate
 */
export const testAnimate = (target='#animate') => {
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
};

/**
 * browser
 */
export const testBrowser = (target='#browser') => {
	$(target).html(`
	
	`);
	console.log(browserLocation.params.get());
};

/**
 * dom
 */
export const testDOM = (target='') => {
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
};


/**
 * editor
 */
export const testEditor = (target='#editor') => {
	document.head.appendChild((() => {
		const style = document.createElement("style");
		style.innerText = `
			/* swipe */
			.editor-swipe-wrap {
				overflow: auto;
			}
			.editor-swipe-wrap::after {
				content: "";
				display: block;
				clear: both;
			}
			
			.editor-swipe-lqyer {
				position: fixed; 
				left: 0;
				bottom: 0; 
				padding: 10px;
				width: 300px;
				height: 300px; 
				background-color: rgba(255, 255, 255, .8);
				border: 1px solid;
				box-sizing: border-box;
				overflow-y: auto;
			}
			.editor-swipe-lqyer .editor-swipe-list {
				padding: 10px 0;
			}
			.editor-swipe-lqyer .editor-swipe-list .editor-swipe-item {
			
			}
			.editor-swipe-lqyer .editor-swipe-list .editor-swipe-item .editor-swipe-url {
			
			}
			.editor-swipe-lqyer .editor-swipe-top {
			
			}
			.editor-swipe-lqyer .editor-swipe-down {
			
			}
			.editor-swipe-lqyer .editor-swipe-file {
			
			}
			.editor-swipe-lqyer .editor-swipe-add {
			
			}
			.editor-swipe-lqyer .editor-swipe-delete {
			
			}
			.editor-swipe-lqyer .editor-swipe-submit {
			
			}
			.editor-swipe-lqyer .editor-swipe-close {
			
			}
		`;
		return style;
	})());
	$(target).html(`
		<div id="texteditor" style="margin: 0 auto; padding: 10px; max-width: 600px; min-height: 800px; background-color: #fff; border: 1px solid #eee;" contenteditable="true">안녕하세요.</div>
		<div id="multieditor" style="margin: 0 auto; padding: 10px; max-width: 600px; min-height: 800px; background-color: #fff; border: 1px solid #eee;" contenteditable="true">안녕하세요.</div>
		<div id="opengrapheditor" style="margin: 0 auto; padding: 10px; max-width: 600px; min-height: 800px; background-color: #fff; border: 1px solid #eee;" contenteditable="true">안녕하세요.</div>
	`);

	editor.setup('#texteditor', 'text', { 'key': 'texteditor', }).on();
	editor.setup('#multieditor', 'multi', {
		'key': 'multieditor',
		'size': {
			'image': {
				'max': {
					'width': 700
				}
			}
		}
	}).on();
	editor.setup('#opengrapheditor', 'opengraph', {
		'key': 'opengrapheditor',
		'submit': '//makeapi.net/opengraph'
	}).on();
};


/**
 * flicking
 */
export const testFlicking = (target='#flicking') => {
	$(target).html(`
	
	`);
};


/**
 * modal
 */
export const testModal = (target='#modal') => {
	$(target).html(`
	
	`);
};


/**
 * player
 */
export const testPlayer = (target='#player') => {
	$(target).html(`
		<div id="player"></div>
	`);

	player.setup(document.querySelector('#player'), 'video', {
		'source': 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4'
		//'source': 'https://video.cjmall.net/public/confirm/assets/201908/20190827/A000650/308b294ee469f04d677d3ac826847a33a0d3aa67.mp4?px-time=1567578578&px-hash=02e7117bc8d4da627663efd6596a8726'
	});
};


/**
 * touch
 */
export const testTouch = (target='#touch') => {
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
};


/**
 * util
 */
export const testUtil = (target='#util') => {
	$(target).html(`
	
	`);
};


/**
 * validate
 */
export const testValidate = (target='#validate') => {
	$(target).html(`
	
	`);
};


/**
 * web socket
 */
export const testWebSocket = (target='#websocket') => {
	$(target).html(`
	
	`);
};


/**
 * web worker
 */
export const testWebWorker = (target='#webworker') => {
	$(target).html(`
	
	`);
};


/**
 * xhr
 */
export const testXHR = (target='#xhr') => {
	$(target).html(`
	
	`);
};

