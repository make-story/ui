/**
 * 기능 테스트
 */
import $ from '../../dom';
import editor from '../index';

export default (target='#editor', options={}) => {
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
}