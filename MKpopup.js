/**
 * MKpopup
 * @author ysm
 * @since 14.04.08
 * 
 * @update 14.08.06 : open() 함수에 옵션추가
 * @update 14.11.18 : bnak 전용 header margin 여백적용 안되는 현상
 */

(function() {
	
	var activeObj; //document.activeElement;
	
	//DIV Popup
	var MKpopup = function(options) {
		//return new
		if(!(this instanceof MKpopup)) {
			//return new arguments.callee;
			return new MKpopup(options);
		}

		var that = this, init;
		
		//option
		that.settings = $.extend({
			selector : null, //#id
			open : null, //.class
			close : 'close', //.class
			header : 'Y',
			title : '',
			mask : 'Y',
			css_selector : 'popup_selector',
			css_header : 'popup_header',
			css_title : 'popup_title',
			css_close : 'popup_close',
			css_mask : 'popup_mask',
			img_close : '',
			callback_close : null
		}, options);
		
		//init
		init = that.init();
		that.container = init[0];
		that.popup = init[1];
		that.mask = init[2];

		//event
		if(that.settings.open != null) {
			$(document).find(that.popup).on('click', '.'+that.settings.open, function(event) {
				setStopCapture(event);
				setStopBubbling(event);
				that.open();
			});
		}
		$(document).find(that.popup).on('click', '.'+that.settings.close, function(event) {
			setStopCapture(event);
			setStopBubbling(event);
			that.close({'callback':that.settings.callback_close});
		});
		/*
		that.container.on('click', $.proxy(function(){
			that.close();
		}, this));
		*/
		$(document).on('keyup', function(event){
			if(event.keyCode == 27){
				that.close();
			}
		});
	};

	//prototype
	var fn = MKpopup.prototype;

	//init
	fn.init = function() {
		//position(fixed) : IE 7 부터 지원
		var 
			that = this,
			browser = navigator.userAgent.toLowerCase(), //브라우저 정보
			selector = $('#'+that.settings.selector),
			//element create
			create = {
				header : function() { //popup header
					var html = [];
					html.push('<div class="'+that.settings.css_header+'">');
					if(that.settings.title != '') {
						html.push('<div class="'+that.settings.css_title+'">'+that.settings.title+'</div>');
					}
					if(that.settings.img_close != '') {
						html.push('<div class="'+that.settings.css_close+'"><img src="'+that.settings.img_close+'" class="'+that.settings.close+'" style="cursor: pointer;" /></div>');
					}else {
						html.push('<div class="'+that.settings.css_close+'"><a href="#none" class="'+that.settings.close+'">닫기</a></div>');
					}
					html.push('</div>');
					return $(html.join(''));
				},
				content : function() { //popup 에 넣을 대상(내용)
					return selector.css({'display':'block'}).clone();
				},
				popup : function() { //실제 popup div
					return $('<div />', {'class':that.settings.css_selector}).css({'position':'relative', 'z-index':'10000', 'width': selector.outerWidth(true)}).addClass('MKpopup').hide();
				},
				container : function() { //popup 을 감싸는 container
					return $('<div />').css({'position':'fixed', 'left':'0', 'top':'0', 'width':'100%', 'height':'100%', 'z-index':'100000', 'overflow':'auto'}).hide();
				},
				mask : function() { //popup 뒷배경
					//IE 판단하여, IE 는 PNG 배경 이미지로 하자
					return $('<div />', {'id':'MKmask', 'class':that.settings.css_mask}).css({'position':'fixed', 'left':'0', 'top':'0', 'width':'100%', 'height':'100%', 'z-index':'90000'}).hide();
				}
			},
			container = create.container(),
			popup = create.popup(),
			mask;
	
		//container
		container.append(popup);
		selector.replaceWith(container);
		
		//popup
		if(that.settings.header == 'Y') {
			popup.append(create.header());
		}
		popup.append(create.content());

		//mask
		if(that.settings.mask == 'Y' && browser.indexOf('msie') == -1) { //IE에서는 mask 작동하지 않도록함.
		//if(that.settings.mask == 'Y') {
			//mask 생성/확인
			if($('body').find('#MKmask').size() > 0) {
				mask = $('body').find('#MKmask');
			}else {
				mask = create.mask();
				//$('body').append(mask);
				$('body').prepend(mask);
			}
		}
		
		//스크롤바 크기
		if(window.scrollbarSize === undefined) {
			var 
				scrollDiv = document.createElement("div"),
				scrollbarSize;
			
			scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
			document.body.appendChild(scrollDiv);
			scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
			document.body.removeChild(scrollDiv);
			
			window.scrollbarSize = scrollbarSize;
		}

		return [container, popup, mask];
	};
	/*
	//스크롤바 관련
	fn.scroll = {
		size : null,
		getScrollbarSize : function() {
			var 
				scrollDiv = document.createElement("div"),
				scrollbarSize;
			if(this.size === null) {
				scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
				document.body.appendChild(scrollDiv);
				scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
				document.body.removeChild(scrollDiv);
				
				return this.size = scrollbarSize;
			}else {
				return this.size;
			}
		},
		on : function() {
			//스크롤바 사이즈만큼 여백
			$('html').css({'margin-right':scrollbarSize+'px', 'overflow':'hidden'});
		}	,
		off : function() {
			$('html').css({'margin-right':'', 'overflow':''});
		}
	};
	*/
	//open
	fn.open = function(options) {
		var 
			that = this,
			options = options || {},
			title = options['title'] || '',
			callback = options['callback'] || '',
			info_popup,
			setPopup = function() { //popup 실행
				//title 유동적 변경
				if(title) {
					that.popup.find('.'+that.settings.css_title).html(title);
				}else {
					that.popup.find('.'+that.settings.css_title).html(that.settings.title);
				}
				//스크롤바 사이즈만큼 여백
				if(document.documentElement.clientHeight < document.body.offsetHeight) {
					$('.JS_popup_scroll_fix').css({'margin-right':scrollbarSize+'px'}); //bank header 스크롤바 숨김에 따른 흔들림 수정
					$('html').css({'margin-right':scrollbarSize+'px', 'overflow':'hidden'});
				}
				//container
				that.container.css('display', 'block');
				//size
				info_popup = size.getElement(that.popup);
				//popup
				that.popup.css({'left':info_popup.left, 'top':(info_popup.top-10)});
				that.popup.stop();
				that.popup.animate({'top':'+=10','opacity':'show'}, 'fast', function() {
					//콜백
					if(typeof callback === 'function') { 
						callback.call(that.popup);
					}
				});
				//focus (접근성)
				activeObj = document.activeElement;
				//console.log(activeObj);
				that.popup.attr('tabindex', -1).focus();
			};

		//mask 에 따른 실행
		if(that.mask) {
			//mask 실행
			that.mask.fadeIn('fast', function() {
				setPopup();
			});
		}else {
			setPopup();
		}

		//resize on
		var time = null;
		$(window).on('resize.MKpopup', function() {
			that.close();
			if(time != null) window.clearTimeout(time);
			time = window.setTimeout(function(){ 
				that.open();
			}, 500);
		});
	};

	//close
	fn.close = function(options) {
		var that = this,
			options = options || {},
			callback = options['callback'] || '';
		
		//popup
		that.popup.stop();
		that.popup.animate({'top':'-=10','opacity':'hide'}, 'fast', function() {
			//container
			that.container.css('display', 'none');
			//mask
			if(that.mask) {
				that.mask.fadeOut('fast', function() {
					$('.JS_popup_scroll_fix').css({'margin-right':''}); //bank header 스크롤바 숨김에 따른 흔들림 수정
					$('html').css({'margin-right':'', 'overflow':''});
				});
			}else {
				$('.JS_popup_scroll_fix').css({'margin-right':''}); //bank header 스크롤바 숨김에 따른 흔들림 수정
				$('html').css({'margin-right':'', 'overflow':''});
			}
			//focus (접근성)
			if(activeObj) {
				activeObj.focus();
			}
			//콜백
			if(typeof callback === 'function') { 
				callback.call(that.popup);
			}
		});

		//resize off
		$(window).off('resize.MKpopup');
	};

	window.MKpopup = MKpopup;
})();