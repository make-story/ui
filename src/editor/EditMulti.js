/**
 * 텍스트를 제외한 여러 기능 (이미지, 동영상, 코드 등)
 * 공통적으로 선언되는 속성: data-edit="에디터 종류" data-value="{에디터 설정에 필요한 값들}"
 * 
 * [주의!]
 * super 키워드는 부모 constructor 호출과 부모 메소드 호출할 경우 사용
 * super 키워드는 화살표함수 활용
 */
import browser from '../browser';
import $ from '../dom';
import {
	setSettings,
	getDisplay,
	getParent,
	getNodeInfo,
	isNodeCheck,
} from './util';
import {
	getKey,
} from '../util';
import EditState from './EditState';

export default class EditMulti extends EditState {
	constructor(target=null, settings={}) {
		super();
		this.settings = {
			'key': 'editor', 
			// 각각의 에디터 (추후 비동기 import 형태로 변경)
			'image': true, // 이미지 사용여부
			'swipe': true, // 이미지 스와이프 사용여부 (외부 api.flicking.js 라이브러리 연동) - 뷰페이지에서 스와이프 적용은 따로 코드를 실행시켜줘야 한다.
			'video': false, // 비디오 사용여부 (외부 api.player.js 라이브러리 연동)
			'code': true, // 코드 사용여부
			'line': true, // 구분선 사용여부
			// 추가 툴팁 
			'tooltip': {
				'image': { // 이미지 선택했을 때 툴팁 (이미지 수정 에디터 관련)
					'put': true, // 이미지 넣기 툴팁 보이기 / 숨기기
					'location': true // 이미지 위치 수정 툴팁 보이기 / 숨기기
				}
			},
			// 크기 제한 
			'size': {
				'image': {
					'min': {
						'width': 0,
						'height': 0
					},
					'max': {
						'width': 0,
						'height': 0
					}
				},
				'video': {
					'min': {
						'width': 0,
						'height': 0
					},
					'max': {
						'width': 0,
						'height': 0
					}
				}
			},
			// file type
			'file': {
				'image': 'base64',
				'swipe': 'url'
			},
			// 서버 전송 정보
			'submit': {
				'image': '//makestory.net/files/editor', 
				'swipe': '//makestory.net/files/editor/000'
			},
			// element 에 설정할 class 속성값
			'classes': {
				'image': {
					'wrap': 'editor-image-wrap', // 이미지 감싸는 element
					'figure': 'editor-image-figure', // img 태그 감싸는 element
					'img': 'editor-image-img', // img 태그 
					'figcaption': 'editor-image-figcaption',
					'wide': 'editor-image-wide', // 이미지 와이드 (이미지 수정 에디터에서 실행)
					'left': 'editor-image-wrap-left', // 이미지 왼쪽 글자 오른쪽 (이미지 수정 에디터에서 실행)
					'right': 'editor-image-wrap-right' // 이미지 오른쪽 글자 왼쪽 (이미지 수정 에디터에서 실행)
				},
				'swipe': {
					'wrap': 'editor-swipe-wrap',
					'slide': 'editor-swipe-slide',
					'layer': 'editor-swipe-lqyer',
					'list': 'editor-swipe-list',
					'item': 'editor-swipe-item',
					'url': 'editor-swipe-url',
					'sortTop': 'editor-swipe-top',
					'sortDown': 'editor-swipe-down',
					'file': 'editor-swipe-file',
					'add': 'editor-swipe-add',
					'delete': 'editor-swipe-delete',
					'submit': 'editor-swipe-submit',
					'close': 'editor-swipe-close'
				},
				'video': {
					'wrap': 'editor-video-wrap'
				},
				'code': {
					'wrap': 'editor-code-wrap'
				},
				'line': {
					'wrap': 'editor-line-wrap',
					'hr': 'editor-line-hr'
				}
			},
			// 상태에 따른 콜백
			'listeners': {
				'initialize': null
			}
		};
		this.elements = {
			'target': null,
			//'tooltip': null,
			'tooltip': {
				'default': null,
				'image': null,
				'swipe': null,
				'video': null
			},
			'command': { // 에디터 명령
				'wrap': null,
				'insertImage': null,
				'insertSwipe': null,
				'insertVideo': null,
				'insertCode': null,
				'insertLine': null
			}
		};

		// settings
		this.setSettings(target, settings);

		// render
		this.setRender();
	}

	setSettings(target=null, settings={}) {
		// settings
		this.settings = setSettings(this.settings, settings);
		//if(this.settings.video && !api.player) { // 비디오 라이브러리 연동 필수
			this.settings.video = false;
		//}
		//if(this.settings.swipe && !api.flicking) { // 스와이프 라이브러리 연동 필수 
			this.settings.swipe = false;
		//}
		if(!window.FileReader) { // IE10 이상 (base64 불가능)
			this.settings.file.image = 'url';
			this.settings.file.swipe = 'url';
		}

		// target
		target = (typeof target === 'string' && /^[a-z]+/i.test(target) ? `#${target}` : target);
		this.elements.target = (typeof target === 'object' && target.nodeType ? target : $(target).get(0));
	}

	setRender() {
		// element 생성
		let fragment = document.createDocumentFragment();
		let label;

		// 툴바
		this.elements.tooltip.default = document.createElement("div");
		this.elements.tooltip.default.style.cssText = 'transition: all .05s ease-out; position: absolute; color: rgb(44, 45, 46); border-radius: 3px; display: none;';
		this.elements.tooltip.default.appendChild(this.elements.command.wrap = document.createElement("div"));
		fragment.appendChild(this.elements.tooltip.default);

		// 에디터 버튼
		label = document.createElement('label'); // input file 을 실행하기 위해 label tag 사용
		label.style.cssText = 'display: block; margin: 2px 4px; background: none; border: 0px; outline: none; cursor: pointer; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;';
		if(this.settings.image === true) {
			// default
			this.elements.command.wrap.appendChild(this.elements.command.insertImage = ((label) => {
				label['storage'] = {
					'command': 'insertImage'
				};
				label.onmousedown = (e) => this.setImageFileTooltipMousedown(e);
				//label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 368 368" style="fill: rgb(44, 45, 46);"><path d="M328,32H40C18,32,0,50,0,72v224c0,22,18,40,40,40h288c22,0,40-18,40-40V72C368,50,350,32,328,32z M352,185.6l-38-38 c-6.4-6.4-16-6.4-22.4,0L200,238.8l-0.4-0.4L153.2,192c-6-6-16.4-6-22.4,0l-39.2,39.2c-3.2,3.2-3.2,8,0,11.2 c3.2,3.2,8,3.2,11.2,0l39.2-39.2l46.4,46.4l0.4,0.4l-32.4,32.4c-3.2,3.2-3.2,8,0,11.2c1.6,1.6,3.6,2.4,5.6,2.4s4-0.8,5.6-2.4 l135.2-134.8l47.6,47.6c0.4,0.4,1.2,0.8,1.6,1.2V296c0,13.2-10.8,24-24,24H40c-13.2,0-24-10.8-24-24V72c0-13.2,10.8-24,24-24h288 c13.2,0,24,10.8,24,24V185.6z" /><path d="M72.4,250.4l-8,8c-3.2,3.2-3.2,8,0,11.2C66,271.2,68,272,70,272s4-0.8,5.6-2.4l8-8c3.2-3.2,3.2-8,0-11.2 C80.4,247.2,75.6,247.2,72.4,250.4z" /><path d="M88,80c-22,0-40,18-40,40s18,40,40,40s40-18,40-40S110,80,88,80z M88,144c-13.2,0-24-10.8-24-24s10.8-24,24-24 s24,10.8,24,24S101.2,144,88,144z" /></svg>';
				label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 64 64" style="fill: rgb(44, 45, 46);"><path d="M0,3.26315v57.4737015h64V3.26315H0z M62,5.2631502V34.480751L47.1523018,20.5346508 c-0.1992035-0.1875-0.4580002-0.2890015-0.7422028-0.2695007c-0.2733994,0.0156002-0.5282974,0.1425991-0.7059975,0.352499 L28.4267006,41.04245L15.4111004,30.3715496c-0.3984003-0.3270988-0.9863005-0.2967987-1.3496008,0.075201L2,42.8066483V5.2631502 H62z M2,58.7368507V45.6702499l12.8525-13.1707001l13.0684004,10.7137985 c0.4228001,0.347702,1.044899,0.2901001,1.3973999-0.1278992l17.2325001-20.3720989L62,37.2237511v21.5130997H2z" /><path d="M26,26.2631493c3.8593006,0,7-3.1406002,7-7c0-3.8592997-3.1406994-6.999999-7-6.999999 c-3.8593998,0-7,3.1406994-7,6.999999C19,23.1225491,22.1406002,26.2631493,26,26.2631493z M26,14.2631502 c2.7567997,0,5,2.2431993,5,4.999999c0,2.7569008-2.2432003,5-5,5c-2.7569008,0-5-2.2430992-5-5 C21,16.5063496,23.2430992,14.2631502,26,14.2631502z" /></svg>';
				//label.textContent = '/#/';
				return label;
			})(label.cloneNode()));
			// 수정 버튼 
			this.elements.tooltip.image = document.createElement("div");
			this.elements.tooltip.image.style.cssText = 'transition: all .05s ease-out; position: absolute; color: rgb(44, 45, 46); border-radius: 3px; display: none;';
			fragment.appendChild(this.elements.tooltip.image);
		}
		if(this.settings.swipe === true) {
			// default
			this.elements.command.wrap.appendChild(this.elements.command.insertSwipe = ((label) => {
				label['storage'] = {
					'command': 'insertSwipe'
				};
				label.onmousedown = (e) => this.setSwipeTooltipMousedown(e);
				label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="22" height="22" viewBox="0 0 443.284 443.284" style="fill: rgb(44, 45, 46);" xml:space="preserve"><path d="M439.623,166.017c-4.867-11.751-13.981-20.888-25.662-25.726L386.75,129.02c-3.823-1.587-8.214,0.23-9.799,4.059c-1.586,3.827,0.231,8.214,4.059,9.799l27.211,11.271c7.979,3.306,14.21,9.559,17.544,17.607c3.334,8.05,3.35,16.877,0.045,24.856L356.926,362.91c-6.858,16.557-25.906,24.445-42.464,17.59l-41.145-17.043c-3.823-1.587-8.214,0.233-9.799,4.059c-1.586,3.827,0.231,8.214,4.059,9.799l41.145,17.043c5.822,2.412,11.947,3.617,18.084,3.617c6.174,0,12.359-1.221,18.253-3.662c11.75-4.867,20.887-13.981,25.725-25.662l68.883-166.298C444.506,190.672,444.49,177.767,439.623,166.017z"/><path d="M381.009,219.843c0.938,0.39,1.91,0.573,2.867,0.573c2.943,0,5.735-1.744,6.932-4.632l11.904-28.739c0.762-1.838,0.762-3.902,0-5.74c-0.761-1.838-2.221-3.298-4.059-4.059l-11.904-4.931c-3.823-1.589-8.215,0.232-9.799,4.059c-1.586,3.827,0.231,8.214,4.059,9.799l4.976,2.062l-9.034,21.81C375.365,213.871,377.182,218.258,381.009,219.843z"/><path d="M269.345,347.886h44.534c26.191,0,47.5-21.309,47.5-47.5v-180c0-26.191-21.309-47.5-47.5-47.5h-29.452c-4.143,0-7.5,3.357-7.5,7.5s3.357,7.5,7.5,7.5h29.452c17.921,0,32.5,14.579,32.5,32.5v180c0,17.921-14.579,32.5-32.5,32.5h-44.534c-4.143,0-7.5,3.357-7.5,7.5S265.203,347.886,269.345,347.886z"/><path d="M313.881,158.99c4.143,0,7.5-3.357,7.5-7.5v-31.105c0-4.143-3.357-7.5-7.5-7.5h-12.885c-4.143,0-7.5,3.357-7.5,7.5s3.357,7.5,7.5,7.5h5.385v23.605C306.381,155.633,309.738,158.99,313.881,158.99z"/><path d="M326.567,240.915L257.683,74.617c-7.374-17.804-24.643-29.308-43.993-29.308c-6.222,0-12.301,1.212-18.067,3.601L29.324,117.794c-11.681,4.838-20.795,13.974-25.662,25.725s-4.883,24.655-0.044,36.336l68.883,166.299c7.374,17.803,24.643,29.307,43.994,29.307c6.222,0,12.3-1.211,18.067-3.601l166.298-68.883C325.058,292.954,336.59,265.113,326.567,240.915z M128.822,358.002c-3.938,1.631-8.086,2.458-12.327,2.458c-13.263,0-25.092-7.869-30.137-20.047L17.475,174.114c-3.305-7.979-3.289-16.807,0.045-24.855s9.564-14.302,17.544-17.607l166.299-68.884c3.938-1.631,8.085-2.458,12.327-2.458c13.262,0,25.091,7.869,30.136,20.048l68.884,166.298c3.305,7.979,3.289,16.807-0.046,24.855c-3.334,8.05-9.564,14.303-17.544,17.608L128.822,358.002z"/><path d="M220.729,89.924c-0.761-1.838-2.221-3.298-4.059-4.059c-1.838-0.762-3.902-0.762-5.74,0L44.632,154.748c-1.838,0.761-3.298,2.221-4.059,4.059c-0.762,1.838-0.762,3.902,0,5.74l49.749,120.104c1.196,2.889,3.988,4.632,6.932,4.632c0.956,0,1.929-0.185,2.867-0.573l166.298-68.883c3.827-1.585,5.645-5.972,4.059-9.799L220.729,89.924z M101.309,271.983L57.3,165.736l152.441-63.143L253.75,208.84L101.309,271.983z"/></svg>';
				//label.textContent = '[S]';
				return label;
			})(label.cloneNode()));
			// 수정 버튼 
			this.elements.tooltip.swipe = document.createElement("div");
			this.elements.tooltip.swipe.style.cssText = 'transition: all .05s ease-out; position: absolute; color: rgb(44, 45, 46); border-radius: 3px; display: none;';
			fragment.appendChild(this.elements.tooltip.swipe);
			this.elements.tooltip.swipe.appendChild(this.elements.command.modifySwipe = ((label) => {
				label['storage'] = {
					'command': 'modifySwipe'
				};
				//label.onmousedown = (e) => this.setImageFileTooltipMousedown(e);
				//label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 368 368" style="fill: rgb(44, 45, 46);"><path d="M328,32H40C18,32,0,50,0,72v224c0,22,18,40,40,40h288c22,0,40-18,40-40V72C368,50,350,32,328,32z M352,185.6l-38-38 c-6.4-6.4-16-6.4-22.4,0L200,238.8l-0.4-0.4L153.2,192c-6-6-16.4-6-22.4,0l-39.2,39.2c-3.2,3.2-3.2,8,0,11.2 c3.2,3.2,8,3.2,11.2,0l39.2-39.2l46.4,46.4l0.4,0.4l-32.4,32.4c-3.2,3.2-3.2,8,0,11.2c1.6,1.6,3.6,2.4,5.6,2.4s4-0.8,5.6-2.4 l135.2-134.8l47.6,47.6c0.4,0.4,1.2,0.8,1.6,1.2V296c0,13.2-10.8,24-24,24H40c-13.2,0-24-10.8-24-24V72c0-13.2,10.8-24,24-24h288 c13.2,0,24,10.8,24,24V185.6z" /><path d="M72.4,250.4l-8,8c-3.2,3.2-3.2,8,0,11.2C66,271.2,68,272,70,272s4-0.8,5.6-2.4l8-8c3.2-3.2,3.2-8,0-11.2 C80.4,247.2,75.6,247.2,72.4,250.4z" /><path d="M88,80c-22,0-40,18-40,40s18,40,40,40s40-18,40-40S110,80,88,80z M88,144c-13.2,0-24-10.8-24-24s10.8-24,24-24 s24,10.8,24,24S101.2,144,88,144z" /></svg>';
				label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="1 1 511.99999 511.99999" style="fill: rgb(44, 45, 46);"><path d="m469.332031 0h-426.664062c-23.554688.0273438-42.6406252 19.113281-42.667969 42.667969v426.664062c.0273438 23.554688 19.113281 42.640625 42.667969 42.667969h426.664062c23.554688-.027344 42.640625-19.113281 42.667969-42.667969v-426.664062c-.027344-23.554688-19.113281-42.6406252-42.667969-42.667969zm-426.664062 17.066406h426.664062c14.140625 0 25.601563 11.460938 25.601563 25.601563v25.597656h-477.867188v-25.597656c0-14.140625 11.460938-25.601563 25.601563-25.601563zm426.664062 477.867188h-426.664062c-14.140625 0-25.601563-11.460938-25.601563-25.601563v-384h477.867188v384c0 14.140625-11.460938 25.601563-25.601563 25.601563zm0 0"/><path d="m42.667969 34.132812h17.066406v17.066407h-17.066406zm0 0"/><path d="m76.800781 34.132812h17.066407v17.066407h-17.066407zm0 0"/><path d="m110.933594 34.132812h17.066406v17.066407h-17.066406zm0 0"/><path d="m170.667969 290.132812c-28.277344 0-51.203125 22.921876-51.203125 51.199219 0 28.277344 22.925781 51.203125 51.203125 51.203125 28.277343 0 51.199219-22.925781 51.199219-51.203125-.027344-28.261719-22.933594-51.171875-51.199219-51.199219zm0 85.332032c-18.851563 0-34.132813-15.28125-34.132813-34.132813 0-18.851562 15.28125-34.132812 34.132813-34.132812 18.851562 0 34.132812 15.28125 34.132812 34.132812 0 18.851563-15.28125 34.132813-34.132812 34.132813zm0 0"/><path d="m281.601562 307.199219h-28.527343l20.171875-20.171875c3.332031-3.332032 3.332031-8.734375 0-12.066406l-36.207032-36.207032c-3.332031-3.332031-8.734374-3.332031-12.066406 0l-20.171875 20.171875v-28.523437c0-4.714844-3.820312-8.535156-8.535156-8.535156h-51.199219c-4.710937 0-8.53125 3.820312-8.53125 8.535156v28.523437l-20.175781-20.171875c-3.332031-3.332031-8.734375-3.332031-12.066406 0l-36.207031 36.207032c-3.328126 3.332031-3.328126 8.734374 0 12.066406l20.175781 20.171875h-28.527344c-4.714844 0-8.535156 3.820312-8.535156 8.535156v51.199219c0 4.710937 3.820312 8.53125 8.535156 8.53125h28.527344l-20.175781 20.175781c-3.328126 3.332031-3.328126 8.734375 0 12.066406l36.207031 36.207031c3.332031 3.328126 8.734375 3.328126 12.066406 0l20.175781-20.175781v28.527344c0 4.714844 3.820313 8.535156 8.53125 8.535156h51.199219c4.714844 0 8.535156-3.820312 8.535156-8.535156v-28.527344l20.171875 20.175781c3.332032 3.328126 8.734375 3.328126 12.066406 0l36.207032-36.207031c3.332031-3.332031 3.332031-8.734375 0-12.066406l-20.171875-20.171875h28.527343c4.710938 0 8.53125-3.824219 8.53125-8.535156v-51.199219c0-4.714844-3.820312-8.535156-8.53125-8.535156zm-8.535156 51.199219h-30.054687c-3.613281 0-6.835938 2.273437-8.046875 5.675781-.800782 2.257812-1.722656 4.46875-2.753906 6.628906-1.546876 3.269531-.863282 7.160156 1.703124 9.703125l21.234376 21.265625-24.144532 24.140625-21.253906-21.265625c-2.546875-2.570313-6.441406-3.253906-9.710938-1.707031-2.15625 1.035156-4.367187 1.953125-6.621093 2.75-3.40625 1.207031-5.683594 4.425781-5.683594 8.039062v30.105469h-34.132813v-30.054687c0-3.613282-2.269531-6.835938-5.675781-8.046876-2.257812-.800781-4.46875-1.722656-6.628906-2.757812-3.269531-1.542969-7.15625-.859375-9.703125 1.707031l-21.265625 21.230469-24.140625-24.140625 21.257812-21.253906c2.570313-2.550781 3.253907-6.441407 1.703126-9.714844-1.03125-2.15625-1.949219-4.367187-2.746094-6.621094-1.210938-3.414062-4.441406-5.691406-8.0625-5.683593h-30.074219v-34.132813h30.054687c3.613282.003906 6.835938-2.269531 8.046876-5.671875.804687-2.257812 1.722656-4.472656 2.757812-6.632812 1.542969-3.269532.859375-7.15625-1.707031-9.699219l-21.230469-21.265625 24.140625-24.140625 21.257813 21.253906c2.546874 2.570313 6.4375 3.253906 9.710937 1.707031 2.15625-1.03125 4.367187-1.949218 6.621094-2.746094 3.414062-1.210937 5.691406-4.445312 5.683593-8.066406v-30.070312h34.132813v30.054687c-.003906 3.613281 2.269531 6.835938 5.671875 8.046875 2.257812.800782 4.472656 1.722656 6.632812 2.757813 3.269532 1.542969 7.15625.859375 9.703126-1.707031l21.261718-21.230469 24.144532 24.140625-21.265626 21.253906c-2.570312 2.550781-3.253906 6.441406-1.707031 9.710938 1.03125 2.160156 1.949219 4.367187 2.746094 6.625 1.207031 3.402343 4.425781 5.679687 8.039063 5.679687h30.105468zm0 0"/><path d="m452.265625 187.734375h-22.050781l-.433594-1.050781 15.589844-15.589844c3.332031-3.332031 3.332031-8.734375 0-12.066406l-24.132813-24.132813c-3.382812-3.199219-8.679687-3.199219-12.066406 0l-15.589844 15.589844-1.050781-.433594v-22.050781c0-4.714844-3.820312-8.535156-8.53125-8.535156h-34.132812c-4.714844 0-8.535157 3.824218-8.535157 8.535156v22.050781l-1.046875.433594-15.59375-15.589844c-3.332031-3.332031-8.730468-3.332031-12.066406 0l-24.128906 24.132813c-3.332032 3.332031-3.332032 8.734375 0 12.066406l15.589844 15.589844-.4375 1.050781h-22.050782c-4.710937 0-8.53125 3.820313-8.53125 8.53125v34.132813c0 4.714843 3.820313 8.535156 8.53125 8.535156h22.050782l.4375 1.050781-15.589844 15.589844c-3.332032 3.332031-3.332032 8.734375 0 12.066406l24.128906 24.132813c3.386719 3.199218 8.683594 3.199218 12.066406 0l15.59375-15.59375 1.046875.4375v22.050781c0 4.710937 3.820313 8.53125 8.535157 8.53125h34.132812c4.710938 0 8.53125-3.820313 8.53125-8.53125v-22.050781l1.050781-.4375 15.589844 15.59375c3.332031 3.328124 8.734375 3.328124 12.066406 0l24.132813-24.132813c3.332031-3.332031 3.332031-8.734375 0-12.066406l-15.589844-15.589844.433594-1.050781h22.050781c4.714844 0 8.535156-3.820313 8.535156-8.535156v-34.132813c0-4.710937-3.820312-8.53125-8.535156-8.53125zm-8.53125 34.132813h-19.578125c-3.773438 0-7.097656 2.484374-8.171875 6.101562-.996094 3.367188-2.339844 6.625-4.003906 9.71875-1.796875 3.320312-1.199219 7.425781 1.46875 10.09375l13.824219 13.824219-12.066407 12.066406-13.824219-13.824219c-2.671874-2.667968-6.777343-3.261718-10.09375-1.464844-3.09375 1.664063-6.351562 3.003907-9.722656 4-3.617187 1.078126-6.097656 4.402344-6.101562 8.175782v19.574218h-17.066406v-19.574218c0-3.773438-2.484376-7.097656-6.101563-8.175782-3.367187-.996093-6.625-2.335937-9.71875-4-3.320313-1.796874-7.425781-1.203124-10.09375 1.464844l-13.824219 13.824219-12.066406-12.066406 13.824219-13.824219c2.667969-2.667969 3.261719-6.773438 1.464843-10.09375-1.664062-3.09375-3.003906-6.351562-4-9.71875-1.078124-3.617188-4.402343-6.101562-8.175781-6.101562h-19.574219v-17.066407h19.574219c3.773438-.003906 7.097657-2.484375 8.175781-6.101562.996094-3.371094 2.335938-6.625 4-9.71875 1.796876-3.320313 1.203126-7.425781-1.464843-10.097657l-13.824219-13.824218 12.066406-12.066406 13.824219 13.824218c2.667969 2.667969 6.773437 3.265625 10.09375 1.46875 3.09375-1.664062 6.351563-3.003906 9.71875-4.003906 3.617187-1.074219 6.101563-4.398438 6.101563-8.171875v-19.578125h17.066406v19.578125c.003906 3.773437 2.484375 7.097656 6.101562 8.171875 3.371094 1 6.625 2.339844 9.722656 4.003906 3.316407 1.796875 7.421876 1.199219 10.09375-1.46875l13.824219-13.824218 12.066407 12.066406-13.824219 13.824218c-2.667969 2.671876-3.265625 6.777344-1.46875 10.097657 1.664062 3.089843 3.007812 6.347656 4.003906 9.71875 1.074219 3.617187 4.398437 6.097656 8.171875 6.101562h19.578125zm0 0"/><path d="m366.933594 179.199219c-18.851563 0-34.132813 15.28125-34.132813 34.132812 0 18.851563 15.28125 34.132813 34.132813 34.132813 18.851562 0 34.132812-15.28125 34.132812-34.132813 0-18.851562-15.28125-34.132812-34.132812-34.132812zm0 51.199219c-9.425782 0-17.066406-7.640626-17.066406-17.066407s7.640624-17.066406 17.066406-17.066406c9.425781 0 17.066406 7.640625 17.066406 17.066406s-7.640625 17.066407-17.066406 17.066407zm0 0"/></svg>';
				//label.textContent = '{M}';
				return label;
			})(label.cloneNode()));
		}
		if(this.settings.video === true) {
			// default
			this.elements.command.wrap.appendChild(this.elements.command.insertVideo = ((label) => {
				label['storage'] = {
					'command': 'insertVideo'
				};
				label.onmousedown = (e) => this.setVideoTooltipMousedown(e);
				label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 64 64" style="fill: rgb(44, 45, 46);"><path d="M42.4472008,36.1054993l-16-8c-0.3105011-0.1542988-0.6787014-0.1396999-0.9726009,0.0439014 C25.1795998,28.3320007,25,28.6532993,25,29v16c0,0.3466988,0.1795998,0.6679993,0.4745998,0.8506012 C25.6347008,45.9501991,25.8173008,46,26,46c0.1532993,0,0.3055992-0.0351982,0.4472008-0.1054993l16-8 C42.7860985,37.7246017,43,37.3788986,43,37S42.7860985,36.2753983,42.4472008,36.1054993z M27,43.3818016V30.6182003 L39.7635994,37L27,43.3818016z" /><path d="M60,5h-56C1.7909007,5,0.0000008,6.7908001,0.0000008,9v46c0,2.2092018,1.7908999,4,3.9999998,4h56 c2.2090988,0,4-1.7907982,4-4V9C64,6.7908001,62.2090988,5,60,5z M62,9v8h-8.3283005l2.6790009-10H60 C61.1026993,7,62,7.8972001,62,9z M21.2804241,7l-2.6790009,10H9.6508007l2.6788998-10H21.2804241z M23.3507004,7h8.9297218 l-2.6789989,10h-8.9297237L23.3507004,7z M34.3507004,7h8.9297218l-2.678997,10h-8.9297256L34.3507004,7z M45.3507004,7h8.9297218 l-2.678997,10h-8.9297256L45.3507004,7z M4.0000005,7h6.2594237L7.5805006,17H2.0000007V9 C2.0000007,7.8972001,2.8972008,7,4.0000005,7z M60,57h-56c-1.1027997,0-1.9999998-0.8972015-1.9999998-2V19h60v36 C62,56.1027985,61.1026993,57,60,57z" /></svg>';
				//label.textContent = '[V]';
				return label;
			})(label.cloneNode()));
			// 수정 버튼 
			this.elements.tooltip.video = document.createElement("div");
			this.elements.tooltip.video.style.cssText = 'transition: all .05s ease-out; position: absolute; color: rgb(44, 45, 46); border-radius: 3px; display: none;';
			fragment.appendChild(this.elements.tooltip.video);
		}
		if(this.settings.code === true) {
			this.elements.command.wrap.appendChild(this.elements.command.insertCode = ((label) => {
				label['storage'] = {
					'command': 'insertCode'
				};
				label.onmousedown = (e) => this.setCodeTooltipMousedown(e);
				//label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 511 511" style="fill: rgb(44, 45, 46);"><path d="M455.5,40h-400C24.897,40,0,64.897,0,95.5v320C0,446.103,24.897,471,55.5,471h400c30.603,0,55.5-24.897,55.5-55.5v-320 C511,64.897,486.103,40,455.5,40z M496,415.5c0,22.332-18.168,40.5-40.5,40.5h-400C33.168,456,15,437.832,15,415.5v-320 C15,73.168,33.168,55,55.5,55h400c22.332,0,40.5,18.168,40.5,40.5V415.5z" /><path d="M471.5,120h-432c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5h432c4.142,0,7.5-3.357,7.5-7.5S475.642,120,471.5,120z" /><path d="M55.5,95c1.98,0,3.91-0.8,5.3-2.2c1.4-1.39,2.2-3.32,2.2-5.3c0-1.971-0.8-3.91-2.2-5.3c-1.39-1.4-3.32-2.2-5.3-2.2 s-3.91,0.8-5.3,2.2c-1.4,1.39-2.2,3.329-2.2,5.3c0,1.979,0.8,3.91,2.2,5.3C51.59,94.2,53.52,95,55.5,95z" /><path d="M119.5,95c1.97,0,3.91-0.8,5.3-2.2c1.4-1.39,2.2-3.32,2.2-5.3c0-1.971-0.8-3.91-2.2-5.3c-1.39-1.4-3.33-2.2-5.3-2.2 c-1.98,0-3.91,0.8-5.3,2.2c-1.4,1.39-2.2,3.329-2.2,5.3c0,1.979,0.8,3.91,2.2,5.3C115.59,94.2,117.52,95,119.5,95z" /><path d="M87.5,95c1.98,0,3.91-0.8,5.3-2.2c1.4-1.39,2.2-3.32,2.2-5.3c0-1.971-0.8-3.91-2.2-5.3c-1.39-1.4-3.32-2.2-5.3-2.2 c-1.97,0-3.91,0.8-5.3,2.2c-1.4,1.39-2.2,3.329-2.2,5.3c0,1.979,0.8,3.91,2.2,5.3C83.59,94.2,85.53,95,87.5,95z" /><path d="M188.803,210.196c-2.929-2.928-7.678-2.928-10.606,0l-80,80c-2.929,2.93-2.929,7.678,0,10.607l80,80 c1.464,1.464,3.384,2.196,5.303,2.196s3.839-0.732,5.303-2.196c2.929-2.93,2.929-7.678,0-10.607L114.106,295.5l74.697-74.696 C191.732,217.874,191.732,213.126,188.803,210.196z" /><path d="M332.803,210.196c-2.929-2.928-7.678-2.928-10.606,0c-2.929,2.93-2.929,7.678,0,10.607l74.697,74.696l-74.697,74.696 c-2.929,2.93-2.929,7.678,0,10.607c1.464,1.464,3.384,2.196,5.303,2.196s3.839-0.732,5.303-2.196l80-80 c2.929-2.93,2.929-7.678,0-10.607L332.803,210.196z" /><path d="M290.063,200.451c-3.892-1.412-8.195,0.594-9.611,4.485l-64,176c-1.416,3.894,0.592,8.196,4.485,9.612 c0.846,0.308,1.711,0.453,2.563,0.453c3.064,0,5.941-1.893,7.049-4.938l64-176C295.964,206.17,293.956,201.867,290.063,200.451z" /></svg>';
				label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" x="0px" y="0px" width="22" height="22" viewBox="0 0 64 64" style="fill: rgb(44, 45, 46);"><path d="M39.0732994,41.3769989C39.2314987,41.7645988,39.6054993,42,40,42c0.1259995,0,0.2528992-0.0233994,0.3769989-0.0732002 l12-4.8790016C52.7509995,36.8955002,52.9960976,36.5331993,53,36.1299019 c0.0038986-0.4043007-0.2362785-0.7705002-0.607399-0.9287033l-12-5.1210995 c-0.5038795-0.2148991-1.0956993,0.0185013-1.3125,0.5273018c-0.2168007,0.5077991,0.0194969,1.0956993,0.527298,1.3125 l9.7919998,4.1786976l-9.7762985,3.9746017C39.1113014,40.2812004,38.8652,40.8652,39.0732994,41.3769989z" /><path d="M13.6231003,37.0477982l12,4.8790016C25.7471008,41.9766006,25.8740005,42,26,42 c0.3945007,0,0.7686005-0.2354012,0.9267998-0.6230011c0.2080002-0.5117989-0.0380783-1.0957985-0.549799-1.3037987 l-9.7763996-3.9746017l9.7919998-4.1786976c0.5077991-0.2168007,0.7441196-0.8047009,0.5272999-1.3125 c-0.217701-0.5088005-0.8095016-0.7431011-1.3125-0.5273018l-12,5.1210995 c-0.3711004,0.1582031-0.6113005,0.5244026-0.6073999,0.9287033 C13.0039005,36.5331993,13.2490005,36.8955002,13.6231003,37.0477982z" /><path d="M28.5937996,45.9141006C28.7255993,45.9726982,28.8633003,46,28.9990005,46 c0.3837986,0,0.7490997-0.2216988,0.9151001-0.5937996l8-18c0.2236214-0.5048008-0.0030022-1.0957012-0.5078011-1.3203011 c-0.5038986-0.2235985-1.094799,0.0049-1.3204002,0.5078011l-8,18 C27.8623009,45.0985985,28.0888996,45.6894989,28.5937996,45.9141006z" /><path d="M60,5h-56C1.7908008,5,0.0000008,6.7908001,0.0000008,9v5v2v39c0,2.2090988,1.7908,4,3.9999998,4h56 c2.209198,0,4-1.7909012,4-4V16v-2V9C64,6.7908001,62.209198,5,60,5z M62,55c0,1.1027985-0.8972015,2-2,2h-56 c-1.1027997,0-1.9999998-0.8972015-1.9999998-2V16h60V55z M62,14h-60V9c0-1.1027999,0.8972001-2,1.9999998-2h56 c1.1027985,0,2,0.8972001,2,2V14z" /><path d="M6.0000005,9c-0.9649997,0-1.75,0.7849998-1.75,1.75c0,0.9649,0.7850003,1.75,1.75,1.75s1.75-0.7851,1.75-1.75 C7.7500005,9.7849998,6.9650006,9,6.0000005,9z M6.0000005,11.5c-0.4141998,0-0.75-0.3358002-0.75-0.75s0.3358002-0.75,0.75-0.75 c0.4142003,0,0.75,0.3358002,0.75,0.75S6.4142008,11.5,6.0000005,11.5z" /><path d="M16,9c-0.9649992,0-1.75,0.7849998-1.75,1.75c0,0.9649,0.7850008,1.75,1.75,1.75s1.75-0.7851,1.75-1.75 C17.75,9.7849998,16.9650002,9,16,9z M16,11.5c-0.4141998,0-0.75-0.3358002-0.75-0.75S15.5858002,10,16,10 s0.75,0.3358002,0.75,0.75S16.4141998,11.5,16,11.5z" /><path d="M11.000001,9c-0.9650002,0-1.75,0.7849998-1.75,1.75c0,0.9649,0.7849998,1.75,1.75,1.75s1.75-0.7851,1.75-1.75 C12.750001,9.7849998,11.9650002,9,11.000001,9z M11.000001,11.5c-0.4142008,0-0.75-0.3358002-0.75-0.75s0.3357992-0.75,0.75-0.75 c0.4141998,0,0.75,0.3358002,0.75,0.75S11.4142008,11.5,11.000001,11.5z" /></svg>';
				//label.textContent = '</>';
				return label;
			})(label.cloneNode()));
		}
		if(this.settings.line === true) {
			this.elements.command.wrap.appendChild(this.elements.command.insertLine = ((label) => {
				label['storage'] = {
					'command': 'insertLine'
				};
				label.onmousedown = (e) => this.setLineTooltipMousedown(e);
				label.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="22" height="22" viewBox="0 0 32 32" style="fill: rgb(44, 45, 46);" enable-background="new 0 0 32 32"><path d="m9,17c-2.4,0-4.6,1-7,1-1.1,0-2-0.9-2-2s0.9-2 2-2c2.4,0 4.6,1 7,1h12c2.7,0 5.3-2 8-2 1.7,0 3,1.3 3,3s-1.3,3-3,3c-2.7,0-5.3-2-8-2h-12z" /></svg>';
				//label.textContent = '--';
				return label;
			})(label.cloneNode()));
		}

		// body 삽입
		document.body.appendChild(fragment);
	}

	/*
	 * 인스턴스 생성시 메모리 관리를 위해 
	 * this 내부 함수로 두지 않고 스코프체이닝을 이용한 별도 함수로 
	 * 외부에 선언했음
	 */
	// 이미지 파일 선택 - <input type="file" /> 이미지 선택됨
	setImageFileBase64(event, form, input, id, wrap, edit) { // html5 FileReader
		let self = event && event.currentTarget; // event listener element
		let target = event && (event.target || event.srcElement); // event 가 발생한 element
		let files = self.files;

		// 생성된 tag 삭제
		form.parentNode.removeChild(form);

		// 선택 파일 리스트 
		for(let i=0, max=files.length; i<max; i++) {
			let reader;
			/*if(/^image\//.test(file.type)) {
				return false;
			}*/
			reader = new FileReader();
			reader.readAsDataURL(files[i]); // base64
			reader.onload = (e) => {
				this.put({'edit': edit ? edit : 'image', 'id': id, 'data': e.target.result});
			};
		}
	}
	
	// 이미지 파일 선택 - <input type="file" /> 이미지 선택됨
	setImageFileSubmit = (() => {
		// Server Submit
		/*if(window.FormData && api.xhr) { // IE10 이상
			return (event, form, input, id, edit) => {
				api.xhr({
					'type': 'POST', 
					'url': this.settings.submit[edit], 
					'async': true, 
					'data': new FormData(form), // 서버에 보낼 문자열 값이나 자바스크립트 데이터 객체
					'dataType': 'json',
					'progressUpload': (loaded) => {
						console.log('loaded', loaded);
					},
					'success': (data) => {
						console.log('success', data);
						this.put(data);
					},
					'error': (event) => {
						console.error(event);
					}
				});
				// 생성된 tag 삭제
				form.parentNode.removeChild(form);
			};
		}else {*/
			return (event, form, input, id, edit) => {
				let self = event && event.currentTarget; // event listener element
				let target = event && (event.target || event.srcElement); // event 가 발생한 element
				let name = getKey();
				let iframe = document.createElement('iframe');

				// iframe 생성
				iframe.style.cssText = '';
				iframe.setAttribute('name', name);
				iframe.setAttribute('width', '0');
				iframe.setAttribute('height', '0');
				document.body.appendChild(iframe);

				// submit
				form.setAttribute('target', name); // 전송하는 타겟 설정 - iframe
				form.submit();
				iframe.onload = () => {
					try {
						// 이미지 파일 서버 전송
						// 서버 응답 값으로, JavaScript 코드를 반환(실행)한다. - put
						//this.put({'edit': 'image 또는 swipe', 'id': 'id 속성값', 'data': ''});
						/*
						'\
							<script type="text/javascript">\
							try {\
								if(window.top && window.top.api && window.top.api.editor && window.top.api.editor.put) {\
									window.top.api.editor.put("' + key + '", {"edit": "image 또는 swipe", "id": "' + id + '", "data": ["' + result.join(", ") + '"]});\
								}\
							}catch(e) {};\
							</script>\
						';
						*/

						// 생성된 tag 삭제
						form.parentNode.removeChild(form);
						iframe.parentNode.removeChild(iframe);
					}catch(e) {}
				};
			};
		//}
	})()

	// 이미지 전송 준비 
	setImageFileSetup({ edit='image'/*툴팁 종류: image, swipe*/, id=getKey(), }={}) {
		let fragment = document.createDocumentFragment();
		let form = document.createElement('form'); // 서버로 이미지파일 전송을 위한 form - FileReader 를 지원하지 않는 브라우저
		let file = document.createElement('input'); // <input type="file" />
		let hidden = document.createElement('input'); // <input type="hidden" name="output" value="" /> 결과값 출력 형태
		let hidden1 = document.createElement('input'); // <input type="hidden" name="key" value="" /> 에디터 key (key에 해당하는 에디터)
		let hidden2 = document.createElement('input'); // <input type="hidden" name="id" value="" /> file 넣을 위치 id
		let hidden3 = document.createElement('input'); // <input type="hidden" name="edit" value="" /> 툴팁종류 (image, swipe)
		
		// FileReader 를 지원하지 않는 브라우저를 위해 iframe 기반 파일 전송
		// 또는 무조건 파일을 서버로 전송하는 형태를 사용할 경우(옵션)
		form.appendChild(hidden3);
		form.appendChild(hidden2);
		form.appendChild(hidden1);
		form.appendChild(hidden);
		form.appendChild(file);
		fragment.appendChild(form);

		form.style.cssText = 'position: absolute; left: -9999px; top: -9999px;';
		form.setAttribute('action', this.settings.submit[edit]); 
		form.setAttribute('method', 'post');
		form.setAttribute('enctype', 'multipart/form-data');

		hidden3.style.cssText = '';
		hidden3.setAttribute('type', 'hidden');
		hidden3.setAttribute('name', 'edit');
		hidden3.setAttribute('value', edit); 

		hidden2.style.cssText = '';
		hidden2.setAttribute('type', 'hidden');
		hidden2.setAttribute('name', 'id');
		hidden2.setAttribute('value', id); 

		hidden1.style.cssText = '';
		hidden1.setAttribute('type', 'hidden');
		hidden1.setAttribute('name', 'key');
		hidden1.setAttribute('value', this.settings.key);

		hidden.style.cssText = '';
		hidden.setAttribute('type', 'hidden');
		hidden.setAttribute('name', 'output');
		hidden.setAttribute('value', /*window.FormData && api.xhr ? 'json' : */'iframe');

		file.style.cssText = '';
		file.setAttribute('type', 'file');
		file.setAttribute('name', 'apiEditorImages[]');
		file.setAttribute('accept', 'image/*');
		file.setAttribute('multiple', 'multiple');

		// 이미지 선택 
		file.onchange = (event) => {
			// 이미지 첨부 (이미지를 선택했을 경우 실행된다.)
			if(this.settings.file[edit] === 'base64') {
				this.setImageFileBase64(event, form, file, id, edit);
			}else {
				this.setImageFileSubmit(event, form, file, id, edit);
			}
		};
		file.click(); // 실행

		document.body.appendChild(fragment);
	}

	// 파일을 넣을(감싸는) div
	setAppendWrapElement({ edit='image'/*툴팁 종류: image, swipe*/, id=getKey(), data={}, html='', }={}) {
		let wrap;
		let setInsertBeforeWrap = (position) => { // position 기준 이전에 삽입
			let div = document.createElement("div");
			position.parentNode.insertBefore(div, position);
			return div;
		};
		let setInsertAfterWrap = (position) => { // position 기준 다음에 삽입
			let div = document.createElement("div");
			position.parentNode.insertBefore(div, position.nextSibling);
			return div;
		};
		let setAppendWrap = (position) => { // position 기준 마지막에 삽입
			let div = document.createElement("div");
			position.appendChild(div);
			// div 다음 라인에 p 태그 삽입
			// document.execCommand("formatBlock", false, "p") 방식으로 넣어야 하지만, 포커스를 옮겨서 넣는 방식을 몰라, 우선 아래와 같이 작업
			(() => {
				let p = document.createElement("p");
				p.innerHTML = '<br />';
				div.parentNode.insertBefore(p, div.nextSibling);
			})();
			return div;
		};

		// wrap 찾기 또는 생성
		if(id) {
			wrap = document.getElementById(id);
		}
		if(!wrap) {		
			if(super.isSelection()) {
				wrap = getParent(
					this.selection.anchorNode,
					null,
					(node) => { // condition (검사)
						/*
						console.log('node');
						console.log(node);
						console.log(node.parentNode);
						*/
						let nodeInfo = getNodeInfo(node);
						if(!this.elements.target.contains(node) || this.elements.target.isEqualNode(node)) {
							//console.log('setAppendWrap(this.elements.target)');
							return setAppendWrap(this.elements.target);
						}else if(node.parentNode && (node.parentNode.isEqualNode(this.elements.target) || (node.parentNode.nodeType === 1 && node.parentNode.nodeName.toLowerCase() !== 'p' && /block|inline-block/i.test(getDisplay(node.parentNode))))) {
							//console.log('setInsertBeforeWrap(node)');
							return setInsertBeforeWrap(node);
						}/*else if(nodeInfo.edit) {
							//console.log('setInsertAfterWrap(node)');
							return setInsertAfterWrap(node);
						}*/
					}, 
					(node, result) => { // callback (검사결과가 true의 경우)
						if(node) {
							return result;
						}
					}
				);
			}else {
				wrap = setAppendWrap(this.elements.target);
			}
		}
		if(!wrap || typeof wrap !== 'object' || !wrap.nodeName) {
			return false;
		}
		/*
		console.log('wrap');
		console.log(wrap);
		console.log(this.selection.anchorNode);
		console.log(this.selection.focusNode);
		return;
		*/

		// data
		if(data && typeof data === 'object') {
			data.id = id;
			data.edit = edit;
		}

		// 속성값 설정
		if(typeof this.settings.classes[edit] === 'object') {
			wrap.className = this.settings.classes[edit].wrap || '';
		}
		wrap.setAttribute("id", id);
		wrap.setAttribute("data-edit", edit);
		wrap.setAttribute("data-value", JSON.stringify(data));
		if(wrap.storage) {
			wrap.storage.edit = edit;
		}else{
			wrap.storage = {
				'edit': edit
			};
		}
		wrap.innerHTML = html;

		return wrap;
	}

	// 이미지 업로드 (파일찾기실행)
	setImageFileTooltipMousedown(e) { 
		let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
		let self = event && event.currentTarget; // event listener element
		let target = event && (event.target || event.srcElement); // event 가 발생한 element
		let id = getKey();

		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		this.setAppendWrapElement({
			'edit': 'image', 
			'id': id
		});
		this.setImageFileSetup({
			'edit': 'image', 
			'id': id
		});
	}

	// 스와이프 설정 레이어 내부 정보 기반 스와이프 생성 
	setSwipeSubmit({ id/*수정 또는 생성 */, }={}) {
		let wrap;
		let data = {
			'url': []
		};
		let html = [];

		if(!api || !api.flicking) {
			return;
		}

		// 슬라이드 리스트 생성
		$(editor.swipe.selectors.url).each((index) => {
			let $input = $(this);
			let url = $input.val();

			if(!url) {
				// continue
				return true;
			}

			// data
			data.url.push(url);

			// 템플릿 생성 
			html.push(`
				<div class="${this.settings.classes.swipe.slide}" style="text-align: center;">
					<div style="display: inline-block;"><img src="${url}" style="max-width: 100%;"></div>
				</div>
			`);
		});
		if(!html.length) {
			return;
		}

		// wrap 찾기 또는 생성
		wrap = this.setAppendWrapElement({
			'edit': 'swipe', 
			'id': id, 
			'data': data, 
			'html': html.join('')
		});
		
		// 스와이프 적용 실행 
		if(api.flicking.search(id)) {
			api.flicking.search(id).wrap();
			api.flicking.search(id).view();
		}else {
			api.flicking.setup({
				'key': id,
				'target': wrap,
				//'auto': 1000,
				//'centered': 'margin',
				'width': 'auto',
				'height': 'auto',
				'listeners': {
					'slidechange': function() {
						console.log(this);
					}
				}
			});
		}
	}

	// 이미지 업로드 (파일찾기실행)
	setSwipeFileMousedown(e) {
		let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
		let self = event && event.currentTarget; // event listener element
		let target = event && (event.target || event.srcElement); // event 가 발생한 element
		
		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		this.setImageFileSetup({
			'edit': 'swipe', 
			'id': $(target).closest(editor.swipe.selectors.item).attr('id'),
		});
	}

	// 스와이프 설정 레이어 
	setSwipeSetupLayer(data) {
		let fragment = document.createDocumentFragment();
		let first;
		let div = document.createElement('div');
		let setClose = () => {
			$(editor.swipe.selectors.layer).remove();
		};
		let setDeleteList = (e) => {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			let self = event && event.currentTarget; // event listener element
			let target = event && (event.target || event.srcElement); // event 가 발생한 element
	
			$(target).closest(editor.swipe.selectors.item).remove();
		};
		let setAddList = ({ url='', }={}) => {
			let id = getKey();
			let fragment = document.createDocumentFragment();
			let first;
			let div = document.createElement('div');
			
			// html
			fragment.appendChild(div);
			div.innerHTML = `
				<div style="float: left;">
					<input type="radio" name="draggable" value="" />
				</div>
				<div style="float: left;">
					<!-- 이미지 파일이 첨부되면 하단 type="text" input 에 URL이 들어가고 readonly 된다 //-->
					<input type="text" name="" value="${url}" placeholder="image file url" class="${this.settings.classes.swipe.url}" data-edit-swipe="${editor.swipe.attribute.url}" ${(url ? 'readonly="readonly"' : '')} />
					<button class="${this.settings.classes.swipe.file}" data-edit-swipe="${editor.swipe.attribute.file}">File</button>
				</div>
				<div style="float: right;">
					<button class="${this.settings.classes.swipe.delete}" data-edit-swipe="${editor.swipe.attribute.delete}">Delete</button>
				</div>
				<div style="clear: both;"></div>
			`;

			// fragment 를 리턴해서 append 하는 것이 아닌, fragment 내부 element (또는 element 리스트)를 리턴해줘야 한다.
			// fragment 는 document 로 append 되는 순간 없어지기 때문
			// fragment 내부 div (또는 element) 에 이벤트를 주입해도 fragment 를 document 에 append 후 안먹는다.
			// 즉, fragment를 바로 append 하면 안된다.
			// jQuery domManip 참고
			first = fragment.firstChild;
			//if(fragment.childNodes.length === 1) {
				//fragment = first;
			//}

			// 속성
			$(first).attr({'id': id, 'draggable': 'true', 'class': this.settings.classes.swipe.item, 'data-edit-swipe': editor.swipe.attribute.item});

			// event
			$(first).find(editor.swipe.selectors.file).on('click', (e) => this.setSwipeFileMousedown(e));
			$(first).find(editor.swipe.selectors.delete).on('click', (e) => setDeleteList(e));
			
			return first;
		};
		// 버튼으로 상/하 이동
		let setItemMove = (target, type) => {
			// type: top, down
			// 라디오 버튼 element 상위 [draggable="true"] 속성 검색
			// 검색된 element 의 type(top, down) 위치의 element 기준 이동
			//let $target = $('[data-edit-swipe="list"]');
			let $list = $(target).find(editor.swipe.selectors.list);
			let $draggable = $list.find('[draggable="true"]');
			let $radio = $list.find('[name="draggable"]');
			let $checked = $list.find('input:checked');
			let index = $radio.index($checked);
			let count = $radio.length;
			let item;
	
			//console.log('index/count', [index, count].join('/'));
			if(index === -1) {
				return;
			}
			if(type === 'top' && 0 < index) {
				item = $draggable.eq(index-1).get(0);
				// brfore
				item.parentNode.insertBefore($draggable.eq(index).get(0), item); 
			}else if(type === 'down' && index < (count-1)) {
				item = $draggable.eq(index+1).get(0);
				// after
				item.parentNode.insertBefore($draggable.eq(index).get(0), item.nextSibling); 
			}
		};
		let setDraggable = (target) => {
			// 드래그 대상 
			let $draggable = $(target).find('[draggable="true"]');
			// 드래그 시작
			$draggable.off('dragstart').on('dragstart', function(e) {
				e = e.originalEvent || e;
				console.log('dragstart : 드래그하기 시작했을 때 발생', e);
				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.dropEffect = "move";
				e.dataTransfer.setData("text/plain", e.target.id);
			});
			// 드래그가 진행될 때
			$draggable.off('drag').on('drag', function(e) {
				e = e.originalEvent || e;
				console.log('drag : 드래그 할 때 발생', e);
				e.preventDefault();
			});
			$draggable.off('dragenter').on('dragenter', function(e) {
				e = e.originalEvent || e;
				console.log('dragenter : 드롭 대상위에 올라갔을 때 발생', e);
				e.preventDefault();
			});
			$draggable.off('dragover').on('dragover', function(e) {
				e = e.originalEvent || e;
				console.log('dragover : 드롭 대상 위로 지나갈 때 발생 (매 수백 밀리초마다 발생한다.)', e);
				e.preventDefault();
				e.dataTransfer.dropEffect = 'move';  // none, copy, link, move
				return false;
			});
			$draggable.off('dragleave').on('dragleave', function(e) {
				e = e.originalEvent || e;
				console.log('dragleave : 적합한 드롭 대상에서 벗어났을 때 발생', e);
			});
			// 드롭(drop)의 처리
			$draggable.off('drop').on('drop', function(e) {
				e = e.originalEvent || e;
				console.log('drop : 드롭 대상에 드롭했을 때 발생', e);

				let target = e.target;
				let currentTarget = e.currentTarget;
				let id;
				let element;
				let indexCurrentTarget, indexDragTarget;
				let $sort = $('[data-edit-swipe="list"]').find('[draggable="true"]');
				
				// 정상적인 실행을 위해서는 handleDragOver 함수에서 preventDefault() 기본 기능 정지를 해줘야 한다.
				e.preventDefault();
	
				// 대상의 id를 가져와 대상 DOM에 움직인 요소를 추가합니다.
				id = e.dataTransfer.getData("text");
				element = document.getElementById(id);
				//e.target.appendChild(element);
	
				// 값(상태)에 따라 드래그엔드롭 또는 이동 등 작업을 진행한다.
				console.log('effectAllowed', e.dataTransfer.effectAllowed);
	
				// 위치에 따라 앞/뒤로 이동
				indexCurrentTarget = $sort.index(currentTarget);
				indexDragTarget = $sort.index(element);
				if(indexCurrentTarget < indexDragTarget) {
					// brfore
					currentTarget.parentNode.insertBefore(element, currentTarget); 
				}else if(indexDragTarget < indexCurrentTarget) {
					// after
					currentTarget.parentNode.insertBefore(element, currentTarget.nextSibling); 
				}
				
				return false;
			});
			$draggable.off('dragend').on('dragend', function(e) {
				e = e.originalEvent || e;
				console.log('dragend : 드래그를 끝냈을 때 발생한다. (마우스 버튼을 떼거나 ESC 키를 누를 때)', e);
			});
			$draggable.off('dragexit').on('dragexit', function(e) {
				e = e.originalEvent || e;
				console.log('dragexit : 더 이상 드래그의 직접적인 대상이 아닐 때 발생', e);
			});
		};
		let id = '', url = [];

		// data
		console.log('data', data);
		if(data && typeof data === 'object') {
			id = data.id || '';
			url = Array.isArray(data.url) ? data.url : [];
		}
	
		// html
		fragment.appendChild(div);
		div.innerHTML = `
			<div style="float: left;">
				<button class="${this.settings.classes.swipe.sortTop}" data-edit-swipe="${editor.swipe.attribute.sortTop}">Top</button>
				<button class="${this.settings.classes.swipe.sortDown}" data-edit-swipe="${editor.swipe.attribute.sortDown}">Down</button>
			</div>
			<div style="float: right;">
				<button class="${this.settings.classes.swipe.close}" data-edit-swipe="${editor.swipe.attribute.close}">Close</button>
			</div>
			<div style="clear: both;"></div>
			<div class="${this.settings.classes.swipe.list}" data-edit-swipe="${editor.swipe.attribute.list}"></div>
			<div style="float: left;">
				<button class="${this.settings.classes.swipe.add}" data-edit-swipe="${editor.swipe.attribute.add}">Add</button>
			</div>
			<div style="float: right;">
				<button class="${this.settings.classes.swipe.submit}" data-edit-swipe="${editor.swipe.attribute.submit}">Submit</button>
			</div>
			<div style="clear: both;"></div>
		`;

		// fragment 를 리턴해서 append 하는 것이 아닌, fragment 내부 element (또는 element 리스트)를 리턴해줘야 한다.
		// fragment 는 document 로 append 되는 순간 없어지기 때문
		// fragment 내부 div (또는 element) 에 이벤트를 주입해도 fragment 를 document 에 append 후 안먹는다.
		// 즉, fragment를 바로 append 하면 안된다.
		// jQuery domManip 참고
		first = fragment.firstChild;
		//if(fragment.childNodes.length === 1) {
			//fragment = first;
		//}

		// 속성
		$(first).attr({'contenteditable': 'false', 'class': this.settings.classes.swipe.layer, 'data-edit-swipe': editor.swipe.attribute.layer});
		//$(first).css({'position': 'fixed', 'left': 0, 'bottom': 0, 'padding': '10px', 'width': '300px', 'height': '300px', 'background-color': 'rgba(255, 255, 255, .8)', 'border': '1px solid', 'box-sizing': 'border-box', 'overflow-y': 'auto'});
		
		// 항목
		if(Array.isArray(url) && url.length) {
			(() => {
				let i, max;
				for(i=0, max=url.length; i<max; i++) {
					$(first).find(editor.swipe.selectors.list).append(setAddList({'url': url[i]}));
				}
			})();
		}else {
			// 기본 1개 항목 추가 
			$(first).find(editor.swipe.selectors.list).append(setAddList());
		}
		
		// event 
		setDraggable(first);
		$(first).find(editor.swipe.selectors.sortTop).on('click', (e) => {
			setItemMove(first, 'top')
		});
		$(first).find(editor.swipe.selectors.sortDown).on('click', (e) => {
			setItemMove(first, 'down')
		});
		$(first).find(editor.swipe.selectors.close).on('click', (e) => {
			setClose();
		});
		$(first).find(editor.swipe.selectors.add).on('click', (e) => {
			$(first).find(editor.swipe.selectors.list).append(setAddList());
			setDraggable(first);
		});
		$(first).find(editor.swipe.selectors.submit).on('click', (e) => {
			this.setSwipeSubmit({'id': id});
			setClose();
		});
	
		// 삽입
		setClose();
		$('body').append(first);
	
		return first;
	}

	// 스와이프 넣기를 위한 클릭
	setSwipeTooltipMousedown(e) {
		let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
		let self = event && event.currentTarget; // event listener element
		let target = event && (event.target || event.srcElement); // event 가 발생한 element
		
		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		this.setSwipeSetupLayer();
	};

	// 비디오 설정 레이어 
	setVideoSetupLayer() {

	}

	// 비디오 넣기
	setVideoTooltipMousedown(e) {
		let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
		let self = event && event.currentTarget; // event listener element
		let target = event && (event.target || event.srcElement); // event 가 발생한 element
		let fragment = document.createDocumentFragment();
		let div = document.createElement("div"); // 비디오를 감싸는 div

		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		// 정보 구성
		div.className = this.settings.classes.video.wrap;
		div.setAttribute("data-edit", "video");
		div.setAttribute("data-value", JSON.stringify({}));
		div.storage = {
			'edit': 'video'
		};
	}

	// 코드 입력 가능한 영역 넣기
	setCodeTooltipMousedown(e) {
		let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
		let self = event && event.currentTarget; // event listener element
		let target = event && (event.target || event.srcElement); // event 가 발생한 element
		let fragment = document.createDocumentFragment();
		let div = document.createElement("div"); // 코드를 감싸는 div
		let pre = document.createElement("pre");
		let code = document.createElement("code");
		let p = document.createElement("p");

		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		// 정보 구성
		div.className = this.settings.classes.code.wrap;
		div.setAttribute("data-edit", "code");
		div.setAttribute("data-value", JSON.stringify({}));
		div.storage = {
			'edit': 'code'
		};

		// element 삽입
		fragment.appendChild(div);
		fragment.appendChild(p);
		div.appendChild(pre);
		pre.appendChild(code);
		code.innerHTML = '<br />';
		p.innerHTML = '<br />';
		getParent(
			this.selection.anchorNode,
			null,
			(node) => { // condition (검사)
				if(!this.elements.target.contains(node) || this.elements.target.isEqualNode(node)) {
					return this.elements.target.appendChild(fragment);
				}else if(node.parentNode && (node.parentNode.isEqualNode(this.elements.target) || (node.parentNode.nodeType === 1 && node.parentNode.nodeName.toLowerCase() !== 'p' && /block|inline-block/i.test(getDisplay(node.parentNode))))) {
					return node.parentNode.insertBefore(fragment, node);
				}
			}, 
			(node, result) => { // callback (검사결과가 true의 경우)
				if(node) {
					return result;
				}
			}
		);

		// 포커스(커서) 이동
		super.setCusor(code);
	}

	// 라인(선) 넣기
	setLineTooltipMousedown(e) {
		let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
		let self = event && event.currentTarget; // event listener element
		let target = event && (event.target || event.srcElement); // event 가 발생한 element
		let fragment = document.createDocumentFragment();
		let div = document.createElement("div");
		let hr = document.createElement("hr");
		let p = document.createElement("p");

		event.preventDefault(); // 현재 이벤트의 기본 동작을 중단한다.
		event.stopPropagation(); // 현재 이벤트가 상위로 전파되지 않도록 중단한다.

		// 정보 구성
		div.className = this.settings.classes.line.wrap;
		div.setAttribute("data-edit", "line");
		div.setAttribute("data-value", JSON.stringify({}));
		div.storage = {
			'edit': 'line'
		};
		hr.className = this.settings.classes.line.hr;

		// element 삽입
		div.appendChild(hr);
		fragment.appendChild(div);
		fragment.appendChild(p);
		p.innerHTML = '<br />';
		getParent(
			this.selection.anchorNode,
			null,
			(node) => { // condition (검사)
				if(!this.elements.target.contains(node) || this.elements.target.isEqualNode(node)) {
					return this.elements.target.appendChild(fragment);
				}else if(node.parentNode && (node.parentNode.isEqualNode(this.elements.target) || (node.parentNode.nodeType === 1 && node.parentNode.nodeName.toLowerCase() !== 'p' && /block|inline-block/i.test(getDisplay(node.parentNode))))) {
					return node.parentNode.insertBefore(fragment, node);
				}
			}, 
			(node, result) => { // callback (검사결과가 true의 경우)
				if(node) {
					return result;
				}
			}
		);

		// 포커스(커서) 이동
		super.setCusor(p);
	}

	// 멀티미디어 에디터 툴바 위치 설정 (보이기/숨기기)
	setMultiTooltipMenuPostion({ toggle, }={}) {
		let rect = {
			'node': {},
			'editor': {}
		};
		let tooltip = {
			'width': 0,
			'height': 0
		};
		let top = 0, left = 0;
		let height = 0;
		let gap = 10; // 커서가 위치한 라인과의 거리

		if(!super.isCollapsed() || typeof this.selection !== 'object' || toggle === 'hide') {
			// 숨기기
			this.elements.tooltip.default.style.display = "none";
		}else if(super.isSelection()) {
			this.elements.tooltip.default.style.display = "block"; // 렌더링 상태에서 offsetWidth, offsetHeight 측정
			// 툴팁 크기
			tooltip.width = this.elements.tooltip.default.offsetWidth;
			tooltip.height = this.elements.tooltip.default.offsetHeight;
			// left
			rect.editor = this.elements.target.getBoundingClientRect();
			left = (rect.editor.left - tooltip.width) - gap;
			if(left < 0) {
				left = rect.editor.left + gap; // 툴팁 에디터 안쪽에 출력되도록 변경
			}
			left += window.pageXOffset; // scroll
			// top
			// #text node 는 getBoundingClientRect 없음
			if(this.selection.anchorNode && 'getBoundingClientRect' in this.selection.anchorNode) {
				rect.node = this.selection.anchorNode.getBoundingClientRect();
			}else if(this.selection.focusNode && 'getBoundingClientRect' in this.selection.focusNode) {
				rect.node = this.selection.focusNode.getBoundingClientRect();
			}else {
				rect.node = this.selection.getRangeAt(0).getBoundingClientRect();
			}
			if(rect.node.top > 0) {
				height = rect.node.height || rect.node.bottom - rect.node.top;
				if(tooltip.height > height) {
					top = rect.node.top - (tooltip.height - height);
				}else {
					top = rect.node.top + (height - tooltip.height);
				}
			}
			top += window.pageYOffset; // scroll
			//
			this.elements.tooltip.default.style.top = top + "px";
			this.elements.tooltip.default.style.left = left + "px";
		}
	}

	// 이미지 수정 에디터 툴바 위치 설정 (이미지를 선택했을 때)
	setImageModifyTooltipMenuPostion({ toggle, nodeInfo, }={}) {
		// 선택된 이미지 위쪽에 위치 

	}

	// 스와이프 수정 에디터 툴바 위치 설정 (스와이프를 선택했을 때)
	setSwipeModifyTooltipMenuPostion({ toggle, nodeInfo, }={}) {
		let rect = {
			'target': {},
			'editor': {}
		};
		let tooltip = {
			'width': 0,
			'height': 0
		};
		let top = 0, left = 0;
		let gap = 10;

		// 선택된 스와이프 위쪽에 위치 
		if(!super.isCollapsed() || toggle === 'hide') {
			// 숨기기
			this.elements.tooltip.swipe.style.display = "none";
		}else if(super.isSelection()) {
			this.elements.tooltip.swipe.style.display = "block"; // 렌더링 상태에서 offsetWidth, offsetHeight 측정
			// 툴팁 크기
			tooltip.width = this.elements.tooltip.swipe.offsetWidth;
			tooltip.height = this.elements.tooltip.swipe.offsetHeight;
			// left / top
			rect.target = nodeInfo.node.getBoundingClientRect();
			top = rect.target.top + window.pageYOffset; // scroll
			rect.editor = this.elements.target.getBoundingClientRect();
			left = (rect.editor.left - tooltip.width) - gap;
			if(left < 0) {
				left = rect.editor.left + gap; // 툴팁 에디터 안쪽에 출력되도록 변경
			}
			left += window.pageXOffset; // scroll
			//
			this.elements.tooltip.swipe.style.top = `${top}px`;
			this.elements.tooltip.swipe.style.left = `${left}px`;
			//
			this.elements.command.modifySwipe.onmousedown = (e) => this.setSwipeSetupLayer(JSON.parse(nodeInfo.value));
		}
	}

	// 비디오 수정 에디터 툴바 위치 설정 (비디오를 선택했을 때)
	setVideoModifyTooltipMenuPostion({ toggle, nodeInfo, }={}) {
		// 선택된 비디오 위쪽에 위치 

	}

	// 툴팁 보이기
	setTooltipToggle({ node, nodeInfo, }={}) {
		let setAllHide = () => {
			this.settings.image && this.setImageModifyTooltipMenuPostion({'toggle': 'hide'}); // 이미지 수정 관련 툴바
			this.settings.swipe && this.setSwipeModifyTooltipMenuPostion({'toggle': 'hide'}); // 스와이프 수정 관련 툴바
			this.settings.video && this.setVideoModifyTooltipMenuPostion({'toggle': 'hide'}); // 비디오 수정 관련 툴바
			this.setMultiTooltipMenuPostion({'toggle': 'hide'}); // 다양한 에디터 넣을 수 있는 기본 툴바 
		};

		// 텍스트 / 멀티미디어 툴팁 중 하나만 보여야 한다.
		super.setSelection();
		if(!node || typeof node !== 'object' || !node.nodeType) {
			if(nodeInfo && typeof nodeInfo === 'object' && nodeInfo.node) {
				node = nodeInfo.node;
			}else {
				node = this.selection.anchorNode; // 선택된 글자의 시작노드
				//node = this.selection.focusNode; // 현재 포커스가 위치한 끝노드
			}
		}
		if(node && (!nodeInfo || typeof nodeInfo !== 'object')) {
			nodeInfo = getNodeInfo(node);
		}
		setAllHide();
		if(super.isSelection() && this.elements.target.contains(node)/* && node.nodeType === 1*/) {
			console.log('node', node);
			console.log('nodeInfo', nodeInfo);

			/*console.log('----------');
			console.dir(this.selection);
			// 시작노드
			console.log('anchorNode', this.selection.anchorNode);
			console.log('anchorNode.nodeName: ' + this.selection.anchorNode.nodeName);
			console.log('anchorNode.nodeValue: ' + this.selection.anchorNode.nodeValue);
			console.log('anchorNode.nodeType: ' + this.selection.anchorNode.nodeType);
			// 끝노드
			console.log('focusNode', this.selection.focusNode);
			console.log('focusNode.nodeName: ' + this.selection.focusNode.nodeName);
			console.log('focusNode.nodeValue: ' + this.selection.focusNode.nodeValue);
			console.log('focusNode.nodeType: ' + this.selection.focusNode.nodeType);*/
			
			// 현재노드 상위 검색
			if(getParent( 
				node,
				this.elements.target,
				(node) => {
					// 툴팁이 보이지 않아야하는 부분 설정
					if(nodeInfo.edit || /code|pre|figcaption|figure/.test(nodeInfo.name)) {
						return true;
					}
				},
				(node, result) => {
					return result;
				}
			) === true) {
				// 전문 에디터 (이미지/스와이프/비디오 등 노출)
				if(nodeInfo.edit === 'image' || /img/.test(nodeInfo.name) || /img/.test(this.selection.anchorNode.nodeName.toLowerCase()) || /img/.test(this.selection.focusNode.nodeName.toLowerCase())) {
					// 이미지 수정
					this.setImageModifyTooltipMenuPostion({'toggle': 'show', 'nodeInfo': nodeInfo});
				}else {
					switch(nodeInfo.edit) {
						case 'swipe':
							console.log('swipe 에디터 열기!!!');
							this.setSwipeModifyTooltipMenuPostion({'toggle': 'show', 'nodeInfo': nodeInfo});
							break;
						case 'video':
							this.setVideoModifyTooltipMenuPostion({'toggle': 'show', 'nodeInfo': nodeInfo});
							break;
					}
				}
			}else {
				// 기본 툴팁
				this.setMultiTooltipMenuPostion();
			}
		}
	}

	// 에디터에 데이터 넣기
	put({ edit/*호출 구분 (image, swipe 등)*/, id/*데이터를 넣을 위치 등에 사용*/, data, }={}) {
		id = id && document.getElementById(id);

		// 이미지 정보
		let setPutImage = () => {
			//let rect = id.getBoundingClientRect();
			let min_width = this.settings.size.image.min.width;
			let min_height = this.settings.size.image.min.height;
			let max_width = this.settings.size.image.max.width;
			let max_height = this.settings.size.image.max.height;
			let i, max;
			let setImage = (result) => {
				// 이미지 사이즈 확인
				let img = new Image();
				img.src = result; // base64 또는 이미지 URL
				img.className = this.settings.classes.image.img;
				//img.setAttribute("class", this.settings.classes.image.img);
				img.onload = () => { // img.src 를 변경할 경우 onload 이벤트가 실행된다.
					let canvas, canvas_context;
					let figure, figcaption;
					/*
					console.log(min_width, min_height);
					console.log(max_width, max_height);
					console.log(img.width, img.height);
					*/
					img.onload = null; // 이미지 resize 후 img.src 변경시 onload 가 중복 실행되지 않도록 초기화
					if((0 < min_width && img.width < min_width) || (0 < min_height && img.height < min_height) || (0 < max_width && max_width < img.width) || (0 < max_height && max_height < img.height)) {
						// 리사이즈를 위해 캔버스 객체 생성
						canvas = document.createElement('canvas');
						canvas_context = canvas.getContext("2d");
						canvas.width = img.width;
						canvas.height = img.height;

						// 캔버스 크기 설정
						// 대응점 = 현재위치 * 대응너비 / 현재너비
						if(0 < max_width && max_width < img.width) {
							canvas.width = max_width; // 가로
							canvas.height = Math.round(max_width * img.height/img.width); // 가로에 따른 비율계산
							//canvas.height = max_height; // 세로
							//canvas.width = Math.round(max_height * img.width/img.height); // 세로에 따른 비율계산
						}
						//console.log(canvas.width, canvas.height);

						// 이미지를 캔버스에 그리기
						canvas_context.drawImage(img, 0, 0, canvas.width, canvas.height);

						// 캔버스에 그린 이미지를 다시 data-uri 형태로 변환
						img.src = canvas.toDataURL("image/png"); // 주의! src 변경에 따른 onload 콜백 중복실행 가능성
					}

					// 반응형 가로크기 제어
					img.style.maxWidth = '100%';

					// figure, figcaption
					// http://html5doctor.com/the-figure-figcaption-this.elements/
					figure = document.createElement("figure");
					figure.className = this.settings.classes.image.figure;
					figcaption = document.createElement("figcaption");
					figcaption.className = this.settings.classes.image.figcaption;
					//figcaption.innerHTML = '<br />';
					figure.appendChild(img);
					figure.appendChild(figcaption);
					id.appendChild(figure);

					// 포커스(커서) 이동
					super.setCusor(figcaption);
				};
			};

			// 이미지 데이터 삽입
			if(Array.isArray(data)) { 
				for(i=0, max=data.length; i<max; i++) {
					setImage(data[i]);
				}
			}else {
				setImage(data);
			}
		};

		// 스와이프 설정 레이어
		let setPutSwipeFile = () => {
			// 현재 설정중인 스와이프 설정 레이어에 파일 정보를 넣는다.
			let $input = $(id).find(editor.swipe.selectors.url);
			$input.val(data[0]);
			$input.prop('readonly', true);
		};

		// 각 타입별로 작업
		switch(edit) {
			// 이미지 삽입
			case 'image': 
				if(!id) {
					if(super.isSelection()) {
						id = this.selection.anchorNode; // 현재 커서 위치
					}else {
						id = this.elements.target; // 에디터가 적용되는 부분
					}
					if(!id) {
						return false;
					}
				}
				// data 의 종류 구분: url(이미지 URL), base64, element node(img 이미지 태그 등)
				setPutImage();
				break;

			// 스와이프(swipe)
			case 'swipe':
				// 스와이프를 삽입할 element 찾는다. (없으면 작업을 취소한다.)
				if(!id) {
					return false;
				}
				setPutSwipeFile();
				break;

			// 비디오
			case 'video':

				break;
		}
	}

	on() {
		let setMouseEvent = (e) => {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			let self = event && event.currentTarget; // event listener element
			let target = event && (event.target || event.srcElement); // event 가 발생한 element

			let nodeInfo = {};
			console.log('event.type', event.type);

			super.setSelection();
			if(this.elements.target.contains(target)) {
				// 현재노드 상위 검색
				nodeInfo = getParent( 
					target,
					this.elements.target,
					(node) => {
						let result = false;

						//console.log('up', node);
						nodeInfo = getNodeInfo(node);

						// 해당노드 확인 (line, img, figure 등)
						switch(nodeInfo.edit) {
							case 'opengraph':

								break;
							case 'image':

								break;
							case 'code':

								break;
							case 'swipe':
								console.log('swipe!', node);
								node.focus({preventScroll: true});
								result = nodeInfo;
								break;
							case 'video':

								break;
							case 'line':
								// 기본 이벤트 중지
								event.preventDefault();
								// 포커스(커서) 이동
								super.setCusor(node.nextSibling);
								result = getNodeInfo(node.nextSibling);
								break;
						}

						return result;
					},
					(node, result) => {
						return result;
					}
				);
			}
			this.setTooltipToggle({
				'nodeInfo': nodeInfo
			});
		};
		let setKeyboardEvent = (e) => {
			let event = (typeof e === 'object' && e.originalEvent || e) || window.event; // originalEvent: jQuery Event
			let self = event && event.currentTarget; // event listener element
			let target = event && (event.target || event.srcElement); // event 가 발생한 element

			console.log('event.type', event.type);
			//console.log(this.selection.anchorNode);

			// getSelection 선택된 node
			super.setSelection();
			if(super.isSelection()) {
				switch(event.keyCode) {
					// keyCode 13: enter
					case 13: 
						if(event.type === 'keydown') {
							// 현재노드 상위 검색
							getParent( 
								this.selection.anchorNode,
								this.elements.target,
								(node) => {
									let nodeInfo = getNodeInfo(node);
									switch(nodeInfo.name) {
										case 'figure':
											// 기본 이벤트 중지
											event.preventDefault();
											break;
										// 한개의 실행코드에 case 문을 2개 이상 여러개 줄 경우 여러번 중복 실행될 수 있다. (node 상위검색 반복문 때문)
										case 'code':
										//case 'pre':
											// 기본 이벤트 중지
											event.preventDefault();
											(() => {
												let fragment, line;
												let range;

												// 1. add a new line
												// 개행문자: \r(캐럿이 그 줄 맨 앞으로), \n(캐럿이 다음 줄)
												fragment = document.createDocumentFragment();
												fragment.appendChild(document.createTextNode('\r'));
												line = document.createTextNode('\n');
												fragment.appendChild(line);

												// 2. make the br replace selection
												range = this.selection.getRangeAt(0);
												range.deleteContents();
												range.insertNode(fragment);
												
												// 3. create a new range
												range = document.createRange(); // 크로스 브라우저 대응 작업해야 한다.
												//range.setStart(line, 0);
												//range.setEnd(line, 0);
												range.setStartAfter(line);
												range.collapse(true);

												// 4. make the cursor there
												this.selection.removeAllRanges();
												this.selection.addRange(range);
											})();
											break;
										default:
											
											break;
									}
								},
								(node, result) => {
									return node;
								}
							);
						}else if(event.type === 'keyup') {
							// 현재노드 상위 검색
							getParent( 
								this.selection.anchorNode,
								this.elements.target,
								(node) => {
									let nodeInfo = getNodeInfo(node);
									switch(nodeInfo.name) {
										case 'figure':
											// 기본 이벤트 중지
											//event.preventDefault();

											break;
										default:
											
											break;
									}
								},
								(node, result) => {
									return node;
								}
							);
						}
						break;

					// keyCode 9: tab
					case 9:
						if(event.type === 'keydown') {
							// 현재노드 상위 검색
							getParent( 
								this.selection.anchorNode,
								this.elements.target,
								(node) => {
									let nodeInfo = getNodeInfo(node);
									switch(nodeInfo.name) {
										// 한개의 실행코드에 case 문을 2개 이상 여러개 줄 경우 여러번 중복 실행될 수 있다. (node 상위검색 반복문 때문)
										case 'code':
										//case 'pre':
											// 기본 이벤트 중지
											event.preventDefault();
											//document.execCommand('indent', false, null); // 들여쓰기
											(() => {
												let tab;
												var	range;									

												tab = document.createTextNode("\u0009"); // \u0009: tap
												//tab = document.createTextNode("\u00a0\u00a0\u00a0\u00a0"); // \u00a0: space
												
												// 선택위치에 삽입
												range = this.selection.getRangeAt(0);
												range.insertNode(tab);
												range.setStartAfter(tab);
												range.setEndAfter(tab); 

												this.selection.removeAllRanges();
												this.selection.addRange(range);
											})();
											break;
										default:
											
											break;
									}
								},
								(node, result) => {
									return node;
								}
							);
						}else if(event.type === 'keyup') {
							
						}
						break;

					// keyCode 8: backspace
					case 8:
						if(event.type === 'keydown') {
							// 현재노드 상위 검색
							getParent( 
								this.selection.anchorNode,
								this.elements.target,
								(node) => {
									let nodeInfo = getNodeInfo(node);
									/*switch(nodeInfo.edit) {
											
									}*/
									switch(nodeInfo.name) {
										case 'code':
										case 'figcaption':
											(() => {
												let text = node.textContent || node.innerText;
												if(text && text.length <= 1) {
													// 기본 이벤트 중지
													event.preventDefault();
													node.innerHTML = '<br />';
												}
											})();
											break;
										case 'img':
										case 'figure':
											// 상위로 전파 중지
											//event.preventDefault();
											/*
											console.log(this.selection.focusNode);
											console.log(this.selection.focusNode.parentNode);
											*/
											// 삭제
											//this.selection.focusNode.parentNode.removeChild(this.selection.focusNode);
											break;
										default:
											
											break;
									}
								},
								(node, result) => {
									return node;
								}
							);
						}else if(event.type === 'keyup') {
							// 현재노드 상위 검색
							getParent( 
								this.selection.anchorNode,
								this.elements.target,
								(node) => {
									let nodeInfo = getNodeInfo(node);
									// 해당노드 확인 (line, img, figure 등)
									switch(nodeInfo.edit) {
										case 'code':
											(() => {
												let pre = node.querySelector('pre');
												let code = node.querySelector('code');
												if(!pre || !code || !(code.textContent || code.innerText)) {
													// 포커스(커서) 이동
													super.setCusor(node.previousSibling || node.nextSibling);
													// 삭제
													node.parentNode.removeChild(node);
												}
											})();
											break;
									}
								},
								(node, result) => {
									return node;
								}
							);
						}
						break;

					// keyCode: 37(left), 38(up)
					case 37:
					case 38:
					// keyCode: 39(right), 40(down)
					case 39:
					case 40:
						if(event.type === 'keyup') {
							// 현재노드 상위 검색
							getParent( 
								this.selection.anchorNode,
								this.elements.target,
								(node) => {
									let nodeInfo = getNodeInfo(node);
									// 해당노드 확인 (line, img, figure 등)
									switch(nodeInfo.edit) {
										case 'line':
											// 포커스(커서) 이동
											if(event.keyCode === 37 || event.keyCode === 38) {
												super.setCusor(node.previousSibling || node.nextSibling);
											}else if(event.keyCode === 39 || event.keyCode === 40) {
												super.setCusor(node.nextSibling || node.previousSibling);
											}
											break;
									}
								},
								(node, result) => {
									return node;
								}
							);
						}
						break;
				}
				this.setTooltipToggle();
			}
		};

		// reset
		this.off();
		
		// contentEditable
		//console.log(this.elements.target);
		//console.log(this.elements.target.contentEditable);
		//console.log(this.elements.target.isContentEditable);
		if(!this.elements.target.isContentEditable) {
			this.elements.target.contentEditable = true; // 해당 element 내부 수정가능하도록 설정
		}

		// 마우스 이벤트
		$(document).on(`${browser.event.down}.EVENT_MOUSEDOWN_MULTIEDIT`, (e) => setMouseEvent(e));
		$(document).on(`${browser.event.up}.EVENT_MOUSEUP_MULTIEDIT`, (e) => setMouseEvent(e));
		
		// 키보드 이벤트
		$(this.elements.target).on('keydown.EVENT_KEYDOWN_MULTIEDIT', (e) => setKeyboardEvent(e));
		$(this.elements.target).on('keyup.EVENT_KEYUP_MULTIEDIT', (e) => setKeyboardEvent(e));

		// 커서 (focus)
		$(this.elements.target).on('blur.EVENT_BLUR_MULTIEDIT', (e) => this.setTooltipToggle());
	}

	off() {
		// tooltip
		this.setImageModifyTooltipMenuPostion({'toggle': 'hide'});
		this.setMultiTooltipMenuPostion({'toggle': 'hide'});

		// 마우스 이벤트
		$(document).off('.EVENT_MOUSEDOWN_MULTIEDIT');
		$(document).off('.EVENT_MOUSEUP_MULTIEDIT');

		// 키보드 이벤트
		$(this.elements.target).off('.EVENT_KEYDOWN_MULTIEDIT');
		$(this.elements.target).off('.EVENT_KEYUP_MULTIEDIT');
		$(this.elements.target).off('.EVENT_BLUR_MULTIEDIT');
	}
}