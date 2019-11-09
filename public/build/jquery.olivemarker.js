/**
 * jQuery plugin / oliveMarker
 */
(function() {
	'use strict';

	// 기존 마커 위치를 설정
	function setMarkerDisplay(options) {
		var $target = $(options.target);
		var $image = $(options.target).find(options.selectors.image);
		var imageWidth = 0, imageHeight = 0; // px
		var targetWidth = 0, targetHeight = 0; // px
		var changeWidth = 0, changeHeight = 0; // %

		// 이미지가 있다면 이미지 정보를 확인하여 위치를 조정한다.
		if($image.length) {
			// 화면에 그려진 이미지 크기
			targetWidth = Number($image.width());
			targetHeight = Number($image.height());
			console.log('노출 이미지 사이즈 (targetWidth/targetHeight)', [targetWidth, targetHeight].join('/'));
			
			// 이미지 원본 크기
			imageWidth = Number($image.prop('naturalWidth')); 
			imageHeight = Number($image.prop('naturalHeight'));
			console.log('원본 이미지 사이즈 (imageWidth/imageHeight)', [imageWidth, imageHeight].join('/'));

			// 원본대비 화면 그려진 크기 %
			changeWidth = ((targetWidth - imageWidth) / imageWidth) * 100; 
			changeHeight = ((targetHeight - imageHeight) / imageHeight) * 100;
			changeWidth = parseFloat(changeWidth.toFixed(2));
			changeHeight = parseFloat(changeHeight.toFixed(2));
			console.log('원본과 노출 이미지 사이즈 차이 (changeWidth/changeHeight)', [changeWidth + '%', changeHeight + '%'].join('/'));
		}else {
			// 화면에 그려진 target 크기
			targetWidth = Number($target.width());
			targetHeight = Number($target.height());
			console.log('노출 타겟 사이즈 (targetWidth/targetHeight)', [targetWidth, targetHeight].join('/'));
		}
		
		// marker 세팅 
		$(options.target).find(options.selectors.marker).each(function() {
			var position = {};
			var $marker = $(this);

			// 좌표정보 
			position.x = $marker.attr('data-x');
			position.y = $marker.attr('data-y');
			position.left = $marker.attr('data-left');
			position.top = $marker.attr('data-top');

			// 마커 생성 당시의 영역 크기 
			position.width = $marker.attr('data-width');
			position.height = $marker.attr('data-height');

			// 좌표적용 
			if((!options.prior || options.prior === 'percent') && position.x && position.y) { // %
				console.log('적용 좌표 (x/y)', [position.x + '%', position.y + '%'].join('/'));
				$marker.css({
					'top': position.y + '%',
					'left': position.x + '%'
				});
			}else if((!options.prior || options.prior === 'pixel') && position.left && position.top) { // px
				// 이미지 마커 설정 당시의 이미지 크기와 현재 이미지 크기 비교
				if(position.width && position.height) {
					console.log('마커 설정 당시 영역 크기 (width/height)', [position.width + 'px', position.height + 'px'].join('/'));
					(function() {
						// 설정 당시 영역 크기 대비 현재 영역 크기 비교 (현재 target 대비 설정당시 값은 몇 % 차이인가)
						var changeWidth = ((targetWidth - position.width) / position.width) * 100;
						var changeHeight = ((targetHeight - position.height) / position.height) * 100;
						// 현재 픽셀 값에서 % 증가 또는 % 감소된 값은 얼마인가
						if(changeWidth < 0) {
							position.correctLeft = position.left * (1 - Math.abs(changeWidth) / 100);
						}else {
							position.correctLeft = position.left * (1 + Math.abs(changeWidth) / 100);
						}
						console.log([position.left, '값', changeWidth + '%', (changeWidth < 0 ? '감소' : '증가')].join(' '), position.correctLeft);
						if(changeHeight < 0) {
							position.correctTop = position.top * (1 - Math.abs(changeHeight) / 100); 	
						}else {
							position.correctTop = position.top * (1 + Math.abs(changeHeight) / 100);
						}
						console.log([position.top, '값', changeHeight + '%', (changeHeight < 0 ? '감소' : '증가')].join(' '), position.correctTop);
					})();
					position.left = position.correctLeft;
					position.top = position.correctTop;
				}else if(imageWidth && imageHeight) {
					// 이미지 원본 대비로 좌표를 설정한 값 (원본이미지 크기대비로 설정한 좌표 픽셀 값을 현재 영역대비 값으로 변경)
					position.left = Number(position.left / imageWidth * targetWidth);
					position.top = Number(position.top / imageHeight * targetHeight);
				}
				console.log('적용 좌표 (left/top)', [position.left + 'px', position.top + 'px'].join('/'));
				$marker.css({
					'top': position.top + 'px',
					'left': position.left + 'px'
				});
			}else {
				$marker.css({'display': 'none'});
				// continue
				return true;
			}
			$marker.css({
				'display': 'block', 
				'width': (options.markerWidth || 0) + 'px', 
				'height': (options.markerHeight || 0) + 'px'
			});

			// 툴팁 
			setTooltipToggle($marker, options);
			/*$marker.children(options.selectors.tooltip).css({
				'margin-left': - ($marker.children(options.selectors.tooltip).width() / 2)
			});*/
		});
	}

	// 마커 그리기 (Admin)
	function setMarkerRender(position, options) {
		var fragment = document.createDocumentFragment();
		var div = document.createElement('div');
		var $marker, $mark, $tooltip;

		// template
		div.innerHTML = options.template;
		while(div.firstChild) { // firstChild: IE9 이상 
			fragment.appendChild(div.firstChild);
		}

		// 셀렉터 
		$marker = $(fragment).find(options.selectors.marker);
		$mark = $marker.find(options.selectors.mark);
		$tooltip = $marker.find(options.selectors.tooltip);
		
		// style class
		$marker.addClass(options.classes.marker);
		$mark.addClass(options.classes.mark);
		$tooltip.addClass(options.classes.tooltip);

		// 속성 설정
		$marker.attr({
			'data-x': position.x, 
			'data-y': position.y, 
			'data-left': position.left, 
			'data-top': position.top,
			'data-width': position.width,
			'data-height': position.height
		});
		$marker.css({
			'width': (options.markerWidth || 0) + 'px',
			'height': (options.markerHeight || 0) + 'px',
			'left': position.x + '%', 
			'top': position.y + '%'
		});

		return fragment;
	};

	// 마커 위치정보 (Admin)
	function getMarkerPosition(event, options) {
		// 위치정보 
		var offset = {};
		var position = {};
		var relative = {};
		var $target = $(options.target); 
		var $image = $target.find(options.selectors.image);

		// offset: HTML 문서(document)를 기준으로 선택한 요소의 오프셋 좌표를 반환
		// pageX/pageY: <html> element in CSS pixels. (html 기준 스크롤값 포함 위치)
		if($image.length) {
			offset.target = $image.offset(); // 이미지 위치 정보
			offset.parent = $image.parent().offset(); 
			position.width = $image.width();
			position.height = $image.height();
		}else {
			offset.target = $target.offset(); // 타겟 위치 정보
			offset.parent = $target.parent().offset();
			position.width = $target.width();
			position.height = $target.height();
		}
		relative.left = (event.pageX - offset.target.left); // 클릭 위치 값
		relative.top = (event.pageY - offset.target.top); // 클릭 위치 값

		console.log('이벤트 pageX/pageY', [event.pageX, event.pageY].join('/'));
		console.log('영역 left/top', [offset.target.left, offset.target.top].join('/'));
		console.log('영역 parent left/parent top', [offset.parent.left, offset.parent.top].join('/'));
		console.log('선택 left/top', [relative.left, relative.top].join('/'));

		// 마우스 클릭위치 보정 값 (mark 의 가운데 위치 점)
		relative.left = relative.left - (options.markerWidth / 2); 
		relative.top = relative.top - (options.markerHeight / 2);
		/*if(relative.left < 0) {
			relative.left = 0;
		}else if(position.width < relative.left) {
			relative.left = position.width;
		}
		if(relative.top < 0) {
			relative.top = 0;
		}else if(position.height < relative.top) {
			relative.top = position.height;
		}*/
		
		// 이미지의 몇 % 해당되는 위치 포인트인지 값 
		position.x = relative.left / position.width * 100; // %
		position.y = relative.top / position.height * 100; // %
		position.left = relative.left;
		position.top = relative.top;

		// 이미지의 픽셀 위치 (% -> px)
		//position.left = (position.x * position.width / 100) + (offset.target.left - offset.parent.left); // px
		//position.left = (position.x * position.width / 100) + offset.target.left; // px
		//position.top = (position.y * position.height / 100) + (offset.target.top - offset.parent.top); // px
		//position.top = (position.y * position.height / 100) + offset.target.top; // px

		// 소수점
		position.x = position.x.toFixed(2);
		position.y = position.y.toFixed(2);
		position.left = position.left.toFixed(2);
		position.top = position.top.toFixed(2);
		console.log('position', position);
		
		return position;
	};

	// 마커 툴팁 보이기/숨기기
	function setTooltipToggle($marker, options) {
		var $target = $(options.target);
		var $image = $target.find(options.selectors.image);
		var $tooltip = $marker.find(options.selectors.tooltip);
		var tooltip = {};
		var target = {};

		if(options.isTooltipToggle === false || !$image.length || !$tooltip.length) {
			return;
		}

		if(options.isTooltipVisibility !== true && $tooltip.is(':visible')) {
			$tooltip.css('display', 'none');
		}else if(options.isTooltipVisibility !== false && $tooltip.is(':hidden')) {
			// 영역 크기 / 위치 
			if($image.length) {
				target.offset = $image.offset();
				target.position = $image.position();
				target.width = Number($image.width());
				target.height = Number($image.height());
			}else {
				target.offset = $target.offset();
				target.position = $target.position();
				target.width = Number($target.width());
				target.height = Number($target.height());
			}
			console.log('target', target);
			
			// 모든 툴팁 숨기기 
			$(options.target).find(options.selectors.tooltip).css('display', 'none');

			// 해당 툴팀 보이기 
			$tooltip.css('display', 'block');

			// 툴팁 크기 / 위치 
			// position: 부모(offsetParent)엘리먼트를 기준, offset: Documet를 기준
			tooltip.offset = $tooltip.offset();
			tooltip.position = $tooltip.position();
			tooltip.width = $tooltip.attr('data-width');
			tooltip.height = $tooltip.attr('data-height');
			if(!tooltip.width) {
				tooltip.width = $tooltip.outerWidth();
				$tooltip.attr('data-width', tooltip.width);
			}
			if(!tooltip.height) {
				tooltip.height = $tooltip.outerHeight();
				$tooltip.attr('data-height', tooltip.height);
			}
			tooltip.width = Number(tooltip.width);
			tooltip.height = Number(tooltip.height);
			console.log('tooltip', tooltip);

			// 이미지 크기보다 툴팁 크기가 더 큰지 확인
			/*if(target.width < tooltip.width) {
				$tooltip.width(target.width + 'px');
			}
			if(target.height < tooltip.height) {
				$tooltip.height(target.height + 'px');
			}*/

			// 툴팁이 이미지 밖으로 나가는지 확인
			console.log('image / tooltip 범위 가로비교', [Number(target.offset.left)+target.width, Number(tooltip.offset.left)+tooltip.width].join(' / '));
			if(Number(target.offset.left)+target.width < Number(tooltip.offset.left)+tooltip.width) {
				$tooltip.css({'left': Number(tooltip.position.left) + ((Number(target.offset.left)+target.width)-(Number(tooltip.offset.left)+tooltip.width)) + 'px', 'right': 'auto'});
			}
			console.log('image / tooltip 범위 세로비교', [Number(target.offset.top)+target.height, Number(tooltip.offset.top)+tooltip.height].join(' / '));
			if(Number(target.offset.top)+target.height < Number(tooltip.offset.top)+tooltip.height) {
				$tooltip.css({'bottom': (Number(options.markerHeight) + 10) + 'px', 'top': 'auto'});
			}
		}

		if(typeof options.listeners.tooltip === 'function') {
			options.listeners.tooltip($tooltip.is(':visible'), $tooltip);
		}
	};

	// 마커 제거 (Admin)
	function setMarkerRemove($marker, options) {
		if(typeof $marker !== 'object' || !$marker.length) {
			return false;
		}
		$marker.remove();
		if(typeof options.listeners.remove === 'function') {
			options.listeners.remove($(options.target));
		}
	};

	// submit (Admin)
	function setSubmit(options) {
		var $target = $(options.target);
		var data = {
			'key': '',
			'list': []
		};
		
		// data 조립 
		data.key = $target.attr('id') || $target.attr('data-key');
		$(options.target).find(options.selectors.marker).each(function(index) {
			var json = {};
			json.element = this;
			json.x = $(this).attr('data-x');
			json.y = $(this).attr('data-y');
			json.left = $(this).attr('data-left');
			json.top = $(this).attr('data-top');
			json.width = $(this).attr('data-width');
			json.height = $(this).attr('data-height');
			data.list.push(json);
		});

		// 서버에 정보 전송 
		if(options.submit.action) {
			
		}

		// 콜백 실행 
		if(typeof options.listeners.submit === 'function') {
			options.listeners.submit(data);
		}
	}
	
	$.fn.oliveMarker = function(options) {
		var that = this;

		// options
		options = $.extend({}, $.fn.oliveMarker.defaults, options);
		console.log('options', options);
		if(!options.target/* || !options.selectors.image*/) {
			return;
		}

		// image class 
		if(options.classes.image) {
			$(options.target).find(options.selectors.image).addClass(options.classes.image);
		}

		// 기존 마커 위치 설정 
		this.each(function() {
			setMarkerDisplay.call($(that), options);
		});

		// 이벤트 
		(function() {
			var timeResize;
			$(window).resize(function() {
				window.clearTimeout(timeResize);
				timeResize = window.setTimeout(function() {
					setMarkerDisplay.call($(that), options);	
				}, 500);
			});
		})();

		// display mode 전용 툴팁 보이기/숨기기 
		$(options.target).find(options.selectors.tooltipShowButton).off('click.EVENT_CLICK_TOOLTIPSHOW').on('click.EVENT_CLICK_TOOLTIPSHOW', function(event) {
			var $marker = $(event.currentTarget).closest(options.selectors.marker);
			options.isTooltipVisibility = true;
			setTooltipToggle($marker, options);
		});
		$(options.target).find(options.selectors.tooltipHideButton).off('click.EVENT_CLICK_TOOLTIPHIDE').on('click.EVENT_CLICK_TOOLTIPHIDE', function(event) {
			var $marker = $(event.currentTarget).closest(options.selectors.marker);
			options.isTooltipVisibility = false;
			setTooltipToggle($marker, options);
		});
		if(options.mode !== 'admin') {
			/*$(options.target).find(options.selectors.mark).off('click.EVENT_CLICK_MARK').on('click.EVENT_CLICK_MARK', function(event) {
				var $marker = $(event.currentTarget).closest(options.selectors.marker);
				options.isTooltipVisibility = null;
				setTooltipToggle($marker, options);
			});*/
			(function() {
				var $marker = null;
				var is = false;
				var start = {
					left: 0,
					top: 0
				};
				var end = {
					left: 0,
					top: 0
				};
				$(options.target).find(options.selectors.mark).on('mousedown mousemove mouseup touchstart touchmove touchend touchcancel', function(event) {
					var touch;

					event.preventDefault();
					event.stopPropagation();

					// jQuery 이벤트가 아닌 originalEvent 내부를 사용할 경우, options.target 이 event.currentTarget 으로 잡힌다.
					//event = event.originalEvent || event; // originalEvent: jQuery Event
					touch = event.originalEvent ? event.originalEvent.touches || event.originalEvent.changedTouches : event.touches || event.changedTouches;
					switch(event.type) {
						case 'mousedown':
						case 'touchstart':
							// 마커 element
							$marker = $(event.currentTarget).closest(options.selectors.marker);
							if(!$marker.length) {
								return;
							}
							// 터치좌표
							if(touch) {
								start.left = touch[0].screenX;
								start.top = touch[0].screenY;
								end.left = touch[0].screenX;
								end.top = touch[0].screenY;
							}else if(event) {
								start.left = event.screenX;
								start.top = event.screenY;
								end.left = event.screenX;
								end.top = event.screenY;
							}
							is = true;
							break;
						case 'mousemove':
						case 'touchmove':
							// 터치좌표 
							if(touch) {
								end.left = touch[0].screenX;
								end.top = touch[0].screenY;
							}else if(event) {
								end.left = event.screenX;
								end.top = event.screenY;
							}
							// 이동이 발생하면 초기화 
							if(Math.abs(start.left - end.left) > 6 || Math.abs(start.top - end.top) > 6) {
								is = false;
							}
							break;
						case 'mouseup':
						case 'touchend':
						//case 'touchcancel':
							// 설정 화면 보이기/숨기기 
							if(is === true) {
								options.isTooltipVisibility = null;
								setTooltipToggle($marker, options);
							}
							is = false;
							$marker = null;
							break;
					}
				});
			})();
		}else {
			// admin
			(function() {
				var $marker = null;
				var timeTouchDelay = null;
				var start = {
					left: 0,
					top: 0
				};
				var end = {
					left: 0,
					top: 0
				};
				$(options.target).on('mousedown mousemove mouseup touchstart touchmove touchend touchcancel', options.selectors.mark, function(event) {
					var touch;

					event.preventDefault();
					event.stopPropagation();

					// jQuery 이벤트가 아닌 originalEvent 내부를 사용할 경우, options.target 이 event.currentTarget 으로 잡힌다.
					//event = event.originalEvent || event; // originalEvent: jQuery Event
					touch = event.originalEvent ? event.originalEvent.touches || event.originalEvent.changedTouches : event.touches || event.changedTouches;
					console.log('marker', event.type);
					switch(event.type) {
						case 'mousedown':
						case 'touchstart':
							// 마커 element
							$marker = $(event.currentTarget).closest(options.selectors.marker);
							if(!$marker.length) {
								return;
							}
							// 터치좌표
							if(touch) {
								start.left = touch[0].screenX;
								start.top = touch[0].screenY;
								end.left = touch[0].screenX;
								end.top = touch[0].screenY;
							}else if(event) {
								start.left = event.screenX;
								start.top = event.screenY;
								end.left = event.screenX;
								end.top = event.screenY;
							}
							// 삭제 여부 판단 
							window.clearTimeout(timeTouchDelay);
							timeTouchDelay = window.setTimeout(function() {
								window.clearTimeout(timeTouchDelay);
								if(!confirm('마커를 삭제하시겠습니까?')) {
									return;
								}
								setMarkerRemove($marker, options);
							}, 1200);
							break;
						case 'mousemove':
						case 'touchmove':
							// 터치좌표 
							if(touch) {
								end.left = touch[0].screenX;
								end.top = touch[0].screenY;
							}else if(event) {
								end.left = event.screenX;
								end.top = event.screenY;
							}
							// 이동이 발생하면 초기화 
							if(Math.abs(start.left - end.left) > 6 || Math.abs(start.top - end.top) > 6) {
								window.clearTimeout(timeTouchDelay);
								$marker = null;
							}
							break;
						case 'mouseup':
						case 'touchend':
						//case 'touchcancel':
							// 설정 화면 보이기/숨기기 
							if(timeTouchDelay && $marker && $marker.length) {
								options.isTooltipVisibility = null;
								setTooltipToggle($marker, options);
							}
							// 초기화 
							window.clearTimeout(timeTouchDelay);
							$marker = null;
							break;
					}
				});
			})();
			
			// 마커 그리기 
			$(options.target).find(options.selectors.image).off('click.EVENT_CLICK_IMAGE').on('click.EVENT_CLICK_IMAGE', function(event) {
				var position = {};
				var fragment;
				var $marker;

				console.log('image', event.type);

				event.preventDefault();
				event.stopPropagation();

				position = getMarkerPosition(event, options);
				fragment = setMarkerRender(position, options);
				$marker = $(fragment.children[0]); // text node 제외 첫번째 
				$(options.target).append(fragment);
				setTooltipToggle($marker, options);
				if(typeof options.listeners.append === 'function') {
					options.listeners.append($marker);
				}
			});

			// submit
			$(options.target).find(options.selectors.submit).off('click.EVENT_CLICK_SUBMIT').on('click.EVENT_CLICK_SUBMIT', function() {
				setSubmit(options);
			});
		}
		
		return this;
	};
	
	// Plugin defaults
	$.fn.oliveMarker.defaults = {
		mode: 'display', // admin, display
		target: '',
		prior: '', // percent, pixel
		markerWidth: 10,
		markerHeight: 10,
		isTooltipVisibility: false, // 툴팁을 처음부터 보이도록 할 것인가 설정 
		isTooltipToggle: true, // toggle 이벤트 사용여부 
		isResizeEvent: false,
		submit: {
			action: '', // url
			method: 'get' // form method
		},
		// 마커 템플릿 (Admin 사용)
		template: '\
			<div data-marker="marker">\
				<div data-marker="mark"></div>\
				<div data-marker="tooltip">\
					\
				</div>\
			</div>\
		',
		// target 내부 설정된 값으로 element 를 찾는다. 
		selectors: {
			image: '[data-marker="image"]',
			marker: '[data-marker="marker"]',
			mark: '[data-marker="mark"]',
			tooltip: '[data-marker="tooltip"]',
			tooltipShowButton: '[data-marker="tooltipShow"]',
			tooltipHideButton: '[data-marker="tooltipHide"]',
			submit: '[data-marker="submit"]'
		},
		// style class
		classes: {
			image: 'marker-image',
			marker: 'marker-marker',
			mark: 'marker-mark',
			tooltip: 'marker-tooltip'
		},
		// 콜백 
		listeners: {
			initialize: null,
			append: null,
			remove: null,
			tooltip: null, // show / hide 
			submit: null
		}
	};
}(jQuery));