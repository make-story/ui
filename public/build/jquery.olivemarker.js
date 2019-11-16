/**
 * jQuery plugin / oliveMarker
 * 
 * IE9 이상 
 */
(function() {
	'use strict';

	// 기존 마커 위치를 설정
	function setMarkerDisplay(options) {
		var $target = $(this);
		var $image = $target.find(options.selectors.image);
		var imageWidth = 0, imageHeight = 0; // px
		var targetWidth = 0, targetHeight = 0; // px
		var changeWidth = 0, changeHeight = 0; // %
		var count = 0;

		// 이미지가 있다면 이미지 정보를 확인하여 위치를 조정한다.
		if($image.length) {
			// 화면에 그려진 이미지 크기
			targetWidth = Number($image.width());
			targetHeight = Number($image.height());
			//console.log('노출 이미지 사이즈 (targetWidth/targetHeight)', [targetWidth, targetHeight].join('/'));
			
			// 이미지 원본 크기
			imageWidth = Number($image.prop('naturalWidth')); 
			imageHeight = Number($image.prop('naturalHeight'));
			//console.log('원본 이미지 사이즈 (imageWidth/imageHeight)', [imageWidth, imageHeight].join('/'));

			// 원본대비 화면 그려진 크기 %
			changeWidth = ((targetWidth - imageWidth) / imageWidth) * 100; 
			changeHeight = ((targetHeight - imageHeight) / imageHeight) * 100;
			changeWidth = parseFloat(changeWidth.toFixed(2));
			changeHeight = parseFloat(changeHeight.toFixed(2));
			//console.log('원본과 노출 이미지 사이즈 차이 (changeWidth/changeHeight)', [changeWidth + '%', changeHeight + '%'].join('/'));
		}else {
			// 화면에 그려진 target 크기
			targetWidth = Number($target.width());
			targetHeight = Number($target.height());
			//console.log('노출 타겟 사이즈 (targetWidth/targetHeight)', [targetWidth, targetHeight].join('/'));
		}
		
		// marker 세팅 
		$target.find(options.selectors.marker).each(function(index) {
			var rect = {};
			var $marker = $(this);

			// 최대 출력 마커수 확인 
			if(0 < options.markerMax && options.markerMax <= count) {
				if(typeof options.listeners.markerMax === 'function') {
					options.listeners.markerMax.call($target, $marker, options);
				}
				$marker.css({'display': 'none'});
				return true; // continue
			}

			// 좌표정보 
			rect.x = $marker.attr('data-x');
			rect.y = $marker.attr('data-y');
			rect.left = $marker.attr('data-left');
			rect.top = $marker.attr('data-top');

			// 마커 생성 당시의 영역 크기 
			rect.width = $marker.attr('data-width');
			rect.height = $marker.attr('data-height');

			// 좌표적용 
			if((!options.prior || options.prior === 'percent') && rect.x && rect.y) { // %
				//console.log('적용 좌표 (x/y)', [rect.x + '%', rect.y + '%'].join('/'));
				$marker.css({
					'top': rect.y + '%',
					'left': rect.x + '%'
				});
			}else if((!options.prior || options.prior === 'pixel') && rect.left && rect.top) { // px
				// 이미지 마커 설정 당시의 이미지 크기와 현재 이미지 크기 비교
				if(rect.width && rect.height) {
					//console.log('마커 설정 당시 영역 크기 (width/height)', [rect.width + 'px', rect.height + 'px'].join('/'));
					(function() {
						// 설정 당시 영역 크기 대비 현재 영역 크기 비교 (현재 target 대비 설정당시 값은 몇 % 차이인가)
						var changeWidth = ((targetWidth - rect.width) / rect.width) * 100;
						var changeHeight = ((targetHeight - rect.height) / rect.height) * 100;
						// 현재 픽셀 값에서 % 증가 또는 % 감소된 값은 얼마인가
						if(changeWidth < 0) {
							rect.correctLeft = rect.left * (1 - Math.abs(changeWidth) / 100);
						}else {
							rect.correctLeft = rect.left * (1 + Math.abs(changeWidth) / 100);
						}
						//console.log([rect.left, '값', changeWidth + '%', (changeWidth < 0 ? '감소' : '증가')].join(' '), rect.correctLeft);
						if(changeHeight < 0) {
							rect.correctTop = rect.top * (1 - Math.abs(changeHeight) / 100); 	
						}else {
							rect.correctTop = rect.top * (1 + Math.abs(changeHeight) / 100);
						}
						//console.log([rect.top, '값', changeHeight + '%', (changeHeight < 0 ? '감소' : '증가')].join(' '), rect.correctTop);
					})();
					rect.left = rect.correctLeft;
					rect.top = rect.correctTop;
				}else if(imageWidth && imageHeight) {
					// 이미지 원본 대비로 좌표를 설정한 값 (원본이미지 크기대비로 설정한 좌표 픽셀 값을 현재 영역대비 값으로 변경)
					rect.left = Number(rect.left / imageWidth * targetWidth);
					rect.top = Number(rect.top / imageHeight * targetHeight);
				}
				//console.log('적용 좌표 (left/top)', [rect.left + 'px', rect.top + 'px'].join('/'));
				$marker.css({
					'top': rect.top + 'px',
					'left': rect.left + 'px'
				});
			}else {
				$marker.css({'display': 'none'});
				return true; // continue
			}

			// 공통 style
			$marker.css({'display': 'block'});
			if(0 < options.markerWidth) {
				$marker.css('width', options.markerWidth);
			}
			if(0 < options.markerHeight) {
				$marker.css('height', options.markerHeight);
			}

			// count
			count = count + 1;

			// 툴팁 
			setTooltipToggle.call($target, $marker, options);
			setTooltipRect.call($target, $marker, options);
		});
	}

	// 마커 그리기 (Admin)
	function setMarkerRender(rect, options) {
		var fragment = document.createDocumentFragment();
		var div = document.createElement('div');
		var $target = $(this);
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
		if(options.isTooltipVisibility === false) {
			$tooltip.css('display', 'none');
		}

		// 속성 설정
		$marker.attr({
			'data-x': rect.x, 
			'data-y': rect.y, 
			'data-left': rect.left, 
			'data-top': rect.top,
			'data-width': rect.width,
			'data-height': rect.height
		});
		if(0 < options.markerWidth) {
			$marker.css('width', options.markerWidth);
		}
		if(0 < options.markerHeight) {
			$marker.css('height', options.markerHeight);
		}
		$marker.css({
			'left': rect.x + '%', 
			'top': rect.y + '%'
		});

		return fragment;
	};

	// 마커 위치정보 (Admin)
	function getMarkerRect(event, options) {
		// 위치정보 
		var offsetTarget = {};
		var offsetParent = {};
		var rect = {};
		var relative = {};
		var $target = $(this); 
		var $image = $target.find(options.selectors.image);

		// offset: HTML 문서(document)를 기준으로 선택한 요소의 오프셋 좌표를 반환
		// pageX/pageY: <html> element in CSS pixels. (html 기준 스크롤값 포함 위치)
		if($image.length) {
			offsetTarget = $image.offset(); // 이미지 위치 정보
			offsetParent = $image.parent().offset(); 
			rect.width = $image.width(); // 또는 $image.prop('naturalWidth') 이미지 원본 크기 
			rect.height = $image.height(); // 또는 $image.prop('naturalWidth') 이미지 원본 크기 
		}else {
			offsetTarget = $target.offset(); // 타겟 위치 정보
			offsetParent = $target.parent().offset();
			rect.width = $target.width();
			rect.height = $target.height();
		}
		relative.left = (event.pageX - offsetTarget.left); // 클릭 위치 값
		relative.top = (event.pageY - offsetTarget.top); // 클릭 위치 값

		//console.log('event', event);
		//console.log('event pageX/pageY', [event.pageX, event.pageY].join('/'));
		//console.log('offsetTarget left/top', [offsetTarget.left, offsetTarget.top].join('/'));
		//console.log('offsetParent left/top', [offsetParent.left, offsetParent.top].join('/'));
		//console.log('relative left/top', [relative.left, relative.top].join('/'));
		//console.log('rect width/height', [rect.width, rect.height].join('/'));

		// 마우스 클릭위치 보정 값 (mark 의 가운데 위치 점)
		if(0 < options.markerWidth) {
			relative.left = relative.left - (options.markerWidth / 2); 
		}
		if(0 < options.markerHeight) {
			relative.top = relative.top - (options.markerHeight / 2);
		}

		// 영역 밖으로 나갔는지 확인 
		if(relative.left < 0 || rect.width < relative.left || relative.top < 0 || rect.height < relative.top) {
			return false;
		}
		
		// 이미지의 몇 % 해당되는 위치 포인트인지 값 
		rect.x = relative.left / rect.width * 100; // %
		rect.y = relative.top / rect.height * 100; // %
		rect.left = relative.left;
		rect.top = relative.top;

		// 이미지의 픽셀 위치 (% -> px)
		//rect.left = (rect.x * rect.width / 100) + (offsetTarget.left - offsetParent.left); // px
		//rect.top = (rect.y * rect.height / 100) + (offsetTarget.top - offsetParent.top); // px
		//rect.left = (rect.x * rect.width / 100) + offsetTarget.left; // px
		//rect.top = (rect.y * rect.height / 100) + offsetTarget.top; // px

		// 소수점
		rect.x = rect.x.toFixed(2);
		rect.y = rect.y.toFixed(2);
		rect.left = rect.left.toFixed(2);
		rect.top = rect.top.toFixed(2);
		//console.log('rect', rect);
		
		return rect;
	};

	function getElementPosition($element) {
		var position = {};
		position = $element.position();
		position.right = position.left + $element.width();
		position.bottom = position.top + $element.height();
		return position;
	}
	function getElementOffset($element) {
		var offset = {};
		offset = $element.offset();
		offset.right = offset.left + $element.width();
		offset.bottom = offset.top + $element.height();
		return offset;
	}

	// 마커 툴팁 위치 
	function setTooltipRect($marker, options) {
		var $target = $(this);
		var $image = $target.find(options.selectors.image);
		var $mark = $target.find(options.selectors.mark);
		var $tooltip = $marker.find(options.selectors.tooltip);
		var target = {};
		var mark = {};
		var tooltip = {};
		var left = 0, bottom = 0;

		if($tooltip.is(':hidden')) {
			return false;
		}

		mark.width = $mark.width();
		mark.height = $mark.height();
		mark.offset = getElementOffset($mark);
		mark.position = getElementPosition($mark);
		if($image.length) {
			target.width = Number($image.width());
			target.height = Number($image.height());
			target.offset = getElementOffset($image); 
			target.position = getElementPosition($image);
		}else {
			target.width = Number($target.width());
			target.height = Number($target.height());
			target.offset = getElementOffset($target);
			target.position = getElementPosition($target);
		}
		//console.log('target', target);

		// 툴팁
		// position: 부모(offsetParent)엘리먼트를 기준, offset: Documet를 기준
		tooltip.width = Number($tooltip.outerWidth());
		tooltip.height = Number($tooltip.outerHeight());
		if(target.width < tooltip.width) {
			tooltip.width = target.width;
			$tooltip.width(tooltip.width + 'px');
		}
		if(target.height < tooltip.height) {
			tooltip.height = target.height;
			$tooltip.height(tooltip.height + 'px');
		}
		
		// 툴팁 기본 위치 (가운데) - 위치 애니메이션이 있을 경우 오차가 발생한다.
		left = -((tooltip.width - (mark.width / 2)) / 2);
		$tooltip.css({'left': left, 'top': $mark.outerHeight()});
		tooltip.offset = getElementOffset($tooltip);
		tooltip.position = getElementPosition($tooltip);
		//console.log('tooltip', tooltip);

		// 툴팁이 이미지 밖으로 나가는지 확인	
		//console.log('right', [target.offset.right, tooltip.offset.right].join('/'));
		if(target.offset.right < tooltip.offset.right) {
			left = tooltip.position.left + (target.offset.right-tooltip.offset.right);
			$tooltip.css({'left': left, 'right': 'auto'});
		}
		//console.log('bottom', [target.offset.bottom, tooltip.offset.bottom].join('/'));
		if(target.offset.bottom < tooltip.offset.bottom) {
			$tooltip.css({'bottom': $mark.outerHeight(), 'top': 'auto'});
		}
	}

	// 마커 툴팁 보이기/숨기기
	function setTooltipToggle($marker, options) {
		var $target = $(this);
		var $tooltip = $marker.find(options.selectors.tooltip);

		if(options.isTooltipToggle === false || !$tooltip.length) {
			return;
		}

		if(options.isTooltipVisibility !== true && $tooltip.is(':visible')) {
			$tooltip.css('display', 'none');
		}else if(options.isTooltipVisibility !== false && $tooltip.is(':hidden')) {
			// 모든 툴팁 숨기기 
			$target.find(options.selectors.tooltip).css('display', 'none');

			// 해당 툴팀 보이기 
			$tooltip.css('display', 'block'); // 정확한 offset, position 계산을 위해 화면에 노출한다.
		}else {
			// 현재 상태 변경 없음
			return false; 
		}

		if(typeof options.listeners.tooltipToggle === 'function') {
			options.listeners.tooltipToggle.call($target, $tooltip, $tooltip.is(':visible'), options);
		}
	}

	// 마커 제거 (Admin)
	function setMarkerRemove($marker, options) {
		var $target = $(this);

		if(!$marker || typeof $marker !== 'object' || !$marker.length) {
			return false;
		}
		if(typeof options.listeners.removeBefore === 'function') {
			options.listeners.removeBefore.call($target, $marker, options);
		}
		$marker.remove();
		if(typeof options.listeners.removeAfter === 'function') {
			options.listeners.removeAfter.call($target, options);
		}
	};

	// submit (Admin)
	function setSubmit(options) {
		var $target = $(this);
		var data = {
			'key': '',
			'list': []
		};
		
		// data 조립 
		data.key = $target.attr('id') || $target.attr('data-key');
		$target.find(options.selectors.marker).each(function(index) {
			data.list.push({
				element: this,
				index: index,
				x: $(this).attr('data-x'),
				y: $(this).attr('data-y'),
				left: $(this).attr('data-left'),
				top: $(this).attr('data-top'),
				width: $(this).attr('data-width'),
				height: $(this).attr('data-height')
			});
		});

		// 서버에 정보 전송 
		/*if(options.submit.action) {
			
		}*/

		// 콜백 실행 
		if(typeof options.listeners.submit === 'function') {
			options.listeners.submit.call($target, data, options);
		}
	}
	
	$.fn.oliveMarker = function(options) {
		var that = this;
		var $target = $(this);

		// options
		options = $.extend({}, $.fn.oliveMarker.defaults, options);
		//console.log('options', options);

		// image class 
		if(options.classes.image) {
			$target.find(options.selectors.image).addClass(options.classes.image);
		}

		// 기존 마커 위치 설정 
		that.each(function() {
			setMarkerDisplay.call($target, options);
		});

		// 이벤트 
		if(options.isResizeEvent) {
			(function() {
				var timeResize;
				$(window).resize(function() {
					window.clearTimeout(timeResize);
					timeResize = window.setTimeout(function() {
						setMarkerDisplay.call($target, options);	
					}, 500);
				});
			})();
		}

		// display mode 전용 툴팁 보이기/숨기기 
		$target.find(options.selectors.tooltipShowButton).off('click.EVENT_CLICK_TOOLTIPSHOW').on('click.EVENT_CLICK_TOOLTIPSHOW', function(event) {
			var $marker = $(event.currentTarget).closest(options.selectors.marker);
			options.isTooltipVisibility = true;
			setTooltipToggle.call($target, $marker, options);
			setTooltipRect.call($target, $marker, options);
		});
		$target.find(options.selectors.tooltipHideButton).off('click.EVENT_CLICK_TOOLTIPHIDE').on('click.EVENT_CLICK_TOOLTIPHIDE', function(event) {
			var $marker = $(event.currentTarget).closest(options.selectors.marker);
			options.isTooltipVisibility = false;
			setTooltipToggle.call($target, $marker, options);
		});
		if(options.mode !== 'admin') {
			/*$target.find(options.selectors.mark).off('click.EVENT_CLICK_MARK').on('click.EVENT_CLICK_MARK', function(event) {
				var $marker = $(event.currentTarget).closest(options.selectors.marker);
				options.isTooltipVisibility = null;
				setTooltipToggle.call($target, $marker, options);
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
				$target.find(options.selectors.mark).on('mousedown mousemove mouseup touchstart touchmove touchend touchcancel', function(event) {
					var touch;

					//console.log('marker event', event.type);
					event.preventDefault();
					event.stopPropagation();

					// jQuery 이벤트가 아닌 originalEvent 내부를 사용할 경우, that 이 event.currentTarget 으로 잡힌다.
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
								// 툴팁
								options.isTooltipVisibility = null;
								setTooltipToggle.call($target, $marker, options);
								setTooltipRect.call($target, $marker, options);
								// 클릭 
								if(typeof options.listeners.marker === 'function') {
									options.listeners.marker.call($target, event, $marker, options);
								}
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
				$target.on('mousedown mousemove mouseup touchstart touchmove touchend touchcancel', options.selectors.mark, function(event) {
					var touch;

					//console.log('marker event', event.type);
					event.preventDefault();
					event.stopPropagation();

					// jQuery 이벤트가 아닌 originalEvent 내부를 사용할 경우, $target 이 event.currentTarget 으로 잡힌다.
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
							// 삭제 여부 판단 
							(function($marker) {
								window.clearTimeout(timeTouchDelay);
								timeTouchDelay = window.setTimeout(function() {
									window.clearTimeout(timeTouchDelay);
									if(!confirm('마커를 삭제하시겠습니까?')) {
										return;
									}
									setMarkerRemove.call($target, $marker, options);
								}, 1200);
							})($marker);
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
								// 툴팁
								options.isTooltipVisibility = null;
								setTooltipToggle.call($target, $marker, options);
								setTooltipRect.call($target, $marker, options);
								// 클릭 
								if(typeof options.listeners.marker === 'function') {
									options.listeners.marker.call($target, event, $marker, options);
								}
							}
							// 초기화 
							window.clearTimeout(timeTouchDelay);
							$marker = null;
							break;
					}
				});
			})();
			
			// 마커 그리기 
			$target.find(options.selectors.image).off('click.EVENT_CLICK_IMAGE').on('click.EVENT_CLICK_IMAGE', function(event) {
				var count = 0;
				var rect = {};
				var fragment;
				var $marker;

				//console.log('image', event.type);

				event.preventDefault();
				event.stopPropagation();

				rect = getMarkerRect.call($target, event, options); // 좌표 정보 구하기 
				if(!rect) {
					return;
				}
				fragment = setMarkerRender.call($target, rect, options);
				//$marker = $(fragment.children[0]); // text node 제외 첫번째 (IE 에러)
				$marker = $(fragment).children().first();
				count = $target.find(options.selectors.marker).length; 
				if(0 < options.markerMax && options.markerMax <= count) { // 최대 수 제한 
					if(typeof options.listeners.markerMax === 'function') {
						options.listeners.markerMax.call($target, $marker, options);
					}
					$marker = null;
					fragment = null;
					return;
				}
				$target.append(fragment);
				if(typeof options.listeners.append === 'function') {
					options.listeners.append.call($target, $marker, count, options);
				}
			});

			// submit
			$target.find(options.selectors.submit).off('click.EVENT_CLICK_SUBMIT').on('click.EVENT_CLICK_SUBMIT', function() {
				setSubmit.call($target, options);
			});
		}
		
		// initialize
		if(typeof options.listeners.initialize === 'function') {
			options.listeners.initialize.call($target, options);
		}

		return {
			display: function() {
				that.each(function() {
					setMarkerDisplay.call($target, options);
				});
			}
		};
	};
	
	// Plugin defaults
	$.fn.oliveMarker.defaults = {
		mode: 'display', // admin, display
		prior: '', // percent, pixel
		markerWidth: 0, // 마커 width
		markerHeight: 0, // 마커 height
		markerMax: 0, // 최대 마커 수
		isTooltipVisibility: false, // 툴팁을 처음부터 보이도록 할 것인가 설정 
		isTooltipToggle: true, // toggle 이벤트 사용여부 
		isResizeEvent: true,
		/*submit: {
			action: '', // url
			method: 'get' // form method
		},*/
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
			removeBefore: null,
			removeAfter: null,
			tooltipToggle: null, // show / hide 
			markerMax: null,
			marker: null, // marker mouseup 이벤트 발생 콜백 (click)
			submit: null,
			error: null
		}
	};
}(jQuery));