/**
 * MKselect
 * @author ysm
 * @since 14.12.30
 */

(function() {
	
	//Select Box
	var MKselect = function(selector, callback) {
		//return new
		if(!(this instanceof MKselect)) {
			//return new arguments.callee;
			return new MKselect(selector, callback);
		}

		var that = this;

		//option
		that.selector = typeof selector != 'undefined' ? $('#' + selector) : null; 
		that.options = null; //selector의 ul element 값
		that.list = null; //li 리스트 element 값
		that.selected = null; //선택된 li element 값
		that.callback = (function() {
			if(typeof callback == 'function') {
				return callback;
			}else {
				return function() {};
			}
		})();
		
		//init
		if(that.selector != null && that.selector.size() > 0) {
			that.init();
			return this;
		}else {
			return false;
		}
	};
	
	//prototype
	var fn = MKselect.prototype;
	
	//init
	fn.init = function() { //li list 목록이 유동적으로 변경이 있을 경우 init() 함수 재실행필요
		var that = this;
		
		//element 설정
		var options = null;
		var list = null;
		var selected = null;

		//options 설정
		options = $('#' + that.selector.data('options'));
		if(options.size() > 0) {
			that.options = options; //options element
			list = that.options.find('li');
			if(list.size() > 0) {
				that.list = list; //option list element
				//selected 설정
				selected = that.options.find('[data-selected="selected"]');
				if(selected.size() > 0) {
					that.selected = selected.eq(0); //사용자 잘못으로 여러개의 selected 값을 설정할 수 있기 때문에 eq로 필터링 
				}else {
					that.selected = that.list.eq(0);
				}
				//css 설정
				that.list.removeClass('selected');
				that.selected.addClass('selected');
				//value 설정
				//that.selector.data('value', that.selected.data('value'));
				that.selector.attr('data-value', that.selected.data('value'));
				that.selector.text(that.selected.text());
			}
		}
	};
	
	//event on
	fn.on = function() {
		var that = this;
		
		//selected
		var setSelected = function() {
			//selected 속성 설정
			that.list.removeAttr('data-selected');
			that.selected.attr('data-selected', 'selected');
			//css 설정
			that.list.removeClass('selected');
			that.selected.addClass('selected');
			//value 설정
			that.selector.attr('data-value', that.selected.data('value'));
			that.selector.text(that.selected.text());
		};

		//키보드 제어
		that.selector.on('keydown.MKselect_keydown', function(event) {
			var event = event || window.event;
			var keyboard = getKeyboardCode(event);
			if(keyboard != false && keyboard.key) {
				switch(keyboard.key) {
					case 'enter':
						that.callback(that.selector.attr('data-value'));
						break;
					case 'up':
						var prev = that.selected.prev();
						if(prev.size() > 0) {
							that.selected = prev; 
						}else {
							//마지막으로 이동
							that.selected = that.list.last();
						}
						break;
					case 'down':
						var next = that.selected.next();
						if(next.size() > 0) {
							that.selected = next;
						}else {
							//처음으로 이동
							that.selected = that.list.first();
						}
						break;
				}
				//selected 관련 설정
				setSelected();
				
				//console.log(that.selected.data('value'));
			}
		});
		
		//마우스 제어
		that.list.hover(
			function() { //mouse on
				that.list.removeClass('selected');
				$(this).addClass('selected'); 
			}, 
			function() { //mouse off
				 
			}
		);
		that.selector.on('mousedown.MKselect_mousedown', function() {
			that.options.slideToggle('fast');
		});
		that.list.on('mousedown', function() {
			that.selected = $(this);
			//selected 관련 설정
			setSelected(); 
			//enter (callbank 실행)
			that.callback(that.selector.attr('data-value'));
			//slide
			that.options.slideUp('fast');
		});
	};
	
	//event off
	fn.off = function() {
		var that = this;
		
		that.selector.off('keydown.MKselect_keydown');
		that.selector.off('keydown.MKselect_mousedown');
	};
	
	window.MKselect = MKselect;
})();