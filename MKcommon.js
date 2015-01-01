/**
 * MK Common JS
 * @author ysm
 * @since 13.02.18
 */

//document.domain = 'mk.co.kr';		//Cross Domain 방지

//로그인 확인
var isLogin = function(msg) {
	var login_check = document.cookie.indexOf('cUserID');
	if(login_check == -1) {
		alert(msg || '로그인 페이지로 이동합니다.');
		document.location.href='http://member.mk.co.kr/member_login.php?successUrl='+document.location;
		return false;
	}else {
		return true;
	}
};
//로그인 페이지 이동
var setLogin = function(msg) {
	alert(msg || '로그인 페이지로 이동합니다.');
	document.location.href='http://member.mk.co.kr/member_login.php?successUrl='+document.location;
};
//작업 후 화면처리
var setPageCallback = function(url) {
	var url = url || '';
	try {
		var checkPopup = window.opener.document;
		if(checkPopup) { //팝업으로 접속했을 때
			window.close();
		}
	}catch(e) { //현재창으로 접속했을 때
		//history.back();
		//window.location.replace(url);
		location.reload();
	}
};
//enter event
var setEnterEvent = function(target, callback) {
	$(target).on('keypress', function(event) {
		var code= (window.netscape) ? event.which: event.keyCode;
		if(code == 13) {
			event.keyCode = 0;
			callback();
		}
	});
};
//금액
var number_format = function(number){ //숫자 콤마
	if( String(number).length > 3 ) {
		var nArr = String(number).split('').join(',').split('');
		for( var i=nArr.length-1, j=1; i>=0; i--, j++)  if( j%6 != 0 && j%2 == 0) nArr[i] = '';
		return nArr.join('');
	}
	else return number;
};
//소수점 단위 금액
var float_format = function(number) {
	var number = String(number);
	var orgnum = number;
	var arrayOfStrings = [];
	
	if(number.length > 3) number = number + ".";
	arrayOfStrings = number.split('.');
	number = '' + arrayOfStrings[0];
	
	if(number.length > 3 ) {
		var mod = number.length % 3;
		var output = (mod > 0 ? (number.substring(0, mod)) : '');
		for (i=0; i<Math.floor(number.length / 3); i++) {
			if((mod == 0) && (i == 0)) {
				output += number.substring(mod + 3 * i, mod + 3 * i + 3);
			}else{
				output += ',' + number.substring(mod + 3 * i, mod + 3 * i + 3);
			}
		}
		
		if(orgnum.indexOf(".") > -1 ) output += '.' + arrayOfStrings[1];
		return (output);
	}else{
		return orgnum;
	}
};
//콤마 제거
var remove_comma = function(value){
	var comm_str = String(value);
	var uncomm_str = '';
	var substr = '';
	for(i=0; i<comm_str.length; i++) {
		substr = comm_str.substring(i, i+1);
		if(substr != ',') { uncomm_str += substr; }
	}
	return uncomm_str;
};
/*
//input 천단위 표기
$('.JS_number_input').filter(':enabled').on('keyup', function() {
	var num = $(this).val();
	num = String(num); //숫자를 문자열로 변환  
	num = num.replace(/,/gi,""); //기존 콤마 제거
	var reg = /(^[+-]?\d+)(\d{3})/; //정규식
	while (reg.test(num)){
		num = num.replace(reg, '$1' + ',' + '$2');  
	}
	$(this).val(num);
});
//콤마(,) 제거
function removeComma(val) {
	val = val.toString(); // 문자로 변환 
	val = val.replace(/[^0-9.]/g, '');
	return val;
}
// 천 단위 마다 콤마(,) 찍기
function setComma(val) {
	val = removeComma(val);
	var reg = /(^[+-]?\d+)(\d{3})/;	// 정규식
	while (reg.test(val)) {
		val = val.replace(reg, '$1' + ',' + '$2');
	}
	
	return val;
}
*/

//두 날짜사이 차이 (입력예: date_start(2014-03-29), date_end(2014-04-29))
var getBetweenDay = function(date_start, date_end) {
	if(!date_start || !date_end) return;
	var 
		arr_start = date_start.split('-'),
		arr_end = date_end.split('-'),
		obj_start = new Date(arr_start[0], Number(arr_start[1])-1, arr_start[2]),
		obj_end = new Date(arr_end[0], Number(arr_end[1])-1, arr_end[2]),
		between_day = (obj_end.getTime() - obj_start.getTime())/1000/60/60/24;
	/*
	getTime() 은 밀리세컨드 단위로 변환하는 함수이기 때문에 
	이 차이에다가
	1000을 나누면 초
	60을 또 나누면 분
	60을 또 나누면 시간
	24를 또 나누면 일 단위의 차이가 되는것
	*/

	return between_day;
};
//우편번호 검색
var getAddress = function(param1, param2, param3) { //우편번호 넣을 input ID, 주소 넣을 input ID, 다음 포커스 ID
	window.open('../ajax/zipcode_pop.php?result1_id='+param1+'&result2_id='+param2+'&next_focus_id='+param3,'zip','scrollbars=yes,location=no,resizable=no,menubar=no,width=500,height=440,top=300,left=400');
};
//윈도우 팝업
var setWinPopup = function(url, name, width, height, features) {
	/*
	//features
	- menubar : 메뉴바를 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
	- toolbar : 도구막대를 보여주거나 숨긴다. (옵션 : yes/no, 1/0) 
	- directories : 디렉토리바를 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
	- scrollbars : 스크롤바를 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
	- status : 상태표시줄을 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
	- location : 주소표시줄을 보여주거나 숨긴다. (옵션 : yes/no, 1/0)
	- width : 팝업 윈도우의 가로크기를 지정한다. (옵션 : 픽셀) 
	- height : 팝업 윈도우의 높이를 지정한다. (옵션 : 픽셀)
	- left : 팝업 윈도우의 x축 위치를 지정한다. (옵션 : 픽셀)
	- top : 팝업 윈도우의 y축 위치를 지정한다. (옵션 : 픽셀)
	- resizable : 팝업윈도우의 크기를 사용자가 임의로 수정할 수 있는지 여부를 지정한다. (옵션 : yes/no, 1/0)
	- fullscreen : 전체화면 모드로 열어준다.
	- channelmode : 채널모드 창으로 열어준다.
	 */
	var w;
	var name = name || 'popup';
	var width = width || 400;
	var height = height || 600;
	//var features = features || '';
	if(typeof features == 'undefined') {
		w = window.open(url,name,'width='+width+',height='+height+',menubar=no,status=no,location=no');
	}else {	
		w = window.open(url,name,'width='+width+',height='+height+','+features);
	}
	if(w != null) {
		w.focus();
	}
};
//필수 : 이벤트 전파 중지관련
/*
 * 캡쳐단계(capture phase) : 이벤트가 발생 대상까지 전달되는 단계(아래로)
 * - 설명1 : 이벤트가 다른 이벤트로 전파되기 전에 폼 전송과 같은 이벤트를 취소 (기본 동작을 중지한다)
 * - 설명2 : 처리를 완료하기 전에 이벤트(기본 또는 다른이벤트)를 취고하고 싶을 때
 * 대상단계(target phase) : 이벤트가 발생 대상에 도달한 단계
 * 버블링단계(bubbling phase) : 발생 대상에서 document까지 전달되는 단계(위로)
 * - 설명1 : 내부에 다른 요소를 포함한 어떤 요소(<div><div></div></div>)가 있습니다. 두요소 모두 클릭 이벤트를 캡쳐합니다. 안쪽요소에서 발생한 클릭 이벤트가 바깥쪽 요소로 전파되는 것을 막음
 * - 설명2 : 이벤트를 취소하고 싶지는 않지만 저저파하는 것을 막을 때
 */
var setStopCapture = function(event){
	if(event.preventDefault){
		event.preventDefault();
	}else {
		event.returnValue = false;
	}
};
var setStopBubbling = function(event){
	if(event.stopPropagation){
		event.stopPropagation();
	}else {
		event.cancelBubble = true;
	}
};
//필수 : 로그
var setLog = function(msg){
	if(typeof msg === 'undefined') return;
	try {
		console.log('msg: ', msg);
	}catch(e){};
};
//setTimeout (한번 실행)
var setStartCall = function(callback, seconds) { 
	if(typeof callback !== 'function') return;
	var seconds = seconds || 3000; //1000 -> 1초
	//시간 작동
	var time = window.setTimeout(function(){ callback(); }, seconds);
	return time;
};
//clearTimeout
var setCloseCall = function(time){
	if(!time || time == null) return;
	//시간 중지
	window.clearTimeout(time);
};
//setInterval (반복 실행)
var setStartTime = function(callback, seconds) { 
	if(typeof callback != 'function') return;
	var seconds = seconds || 3000; //1000 -> 1초
	//시간 작동
	var time = window.setInterval(callback, seconds);
	return time;
};
//clearInterval
var setCloseTime = function(time){
	if(!time || time == null) return;
	//시간 중지
	window.clearInterval(time);
};
//image hide/show
var setImageToggle = function(obj, index){
	if(typeof obj != 'object' || typeof index != 'number') return;
	var target = obj.eq(index);
	obj.not(target).hide();
	if(target.is(':hidden')) target.show();
};
//element class 반복실행
var setClassToggle = function(element, class1, class2, seconds) {
	if(typeof element != 'object') return;
	var 
		on_class = class1 || 'class_on', //On class
		off_class = class2 || 'class_off', //Off class
		seconds = seconds || 200, //시간
		count = 1,
		max = 3, //총 몇번 반복할 것인지 값
		setOn = function(obj) {
			obj.addClass(on_class);
			obj.removeClass(off_class);
			window.setTimeout(function(){ setOff(obj); }, seconds);
		},
		setOff = function(obj) {
			obj.addClass(off_class);
			obj.removeClass(on_class);
			if(count < max) {
				window.setTimeout(function(){ setOn(obj); }, seconds);
				count++;
			}else {
				setClear(obj);
			}
		},
		setClear = function(obj) {
			obj.removeClass(on_class);
			obj.removeClass(off_class);
		};
	setOn(element);
};

//키보드 코드값
var getKeyboardCode = function(event) {
	var event = event || window.event;
	var code = event.which || event.keyCode;
	var key = '';
    switch(code) {
		//0
		case 48:
		case 96:
			key = '0';
			break;
		//1
		case 49:
		case 97:
			key = '1';
			break;
		//2
		case 50:
		case 98:
			key = '2';
			break;
		//3
		case 51:
		case 99:
			key = '3';
			break;
		//4
		case 52:
		case 100:
			key = '4';
			break;
		//5
		case 53:
		case 101:
			key = '5';
			break;
		//6
		case 54:
		case 102:
			key = '6';
			break;
		//7
		case 55:
		case 103:
			key = '7';
			break;
		//8
		case 56:
		case 104:
			key = '8';
			break;
		//9
		case 57:
		case 105:
			key = '9';
			break;
		//backspace
		case 8:
			key = 'backspace';
			break;
		//+
		case 107:
			key = '+';
			break;
		//-
		case 109:
			key = '-';
			break;
		//*
		case 106:
			key = '*';
			break;
		// /
		case 111:
		case 191:
			key = '/';
			break;
		//.
		case 110:
		case 190:
			key = '.';
			break;
		//tab
		case 9:
			key = 'tab';
			break;	
		//end
		case 35:
			key = 'end';
			break;
		//end
		case 36:
			key = 'home';
			break;
		//esc
		case 27:
			key = 'esc';
			break;
		//delete
		case 46:
			key = 'delete';
			break;
		//enter
		case 13:
			key = 'enter';
			break;
  		//left
    	case 37:
    		key = 'left';
    		break;
    	//up
        case 38:
        	key = 'up';
        	break;
        //right
        case 39: 
        	key = 'right';
        	break;
        //down
        case 40: 
        	key = 'down';
        	break;
    }
    
    if(key != '') {
    	//기본 이벤트 중지
    	if(event.preventDefault){
			event.preventDefault();
		}else {
			event.returnValue = false;
		}
    	return {"code": code, "key": key};
    }else {
    	return false;
    }
};

//사이즈
var size = {
	//window
	getWindow : function(){
		var  
			width = Math.round($(window).innerWidth()),
			height = Math.round($(window).innerHeight());
			/*
			//win.outerWidth; //IE9 이상가능
			//window.innerWidth; //all browsers, except IE before
			//document.documentElement.clientWidth; //Internet Explorer before version 9
			width = window.innerWidth || document.documentElement.clientWidth,
			height = window.innerHeight || document.documentElement.clientHeight;
			*/
		return [width, height];
	},
	//document
	getDocument : function(){
		var 
			width = Math.round($('body').innerWidth()), //$(document)로 할경우 IE에서 스크롤 발생
			height = Math.round($('body').innerHeight());
			/*
			width = Math.max(
					document.body.scrollWidth, document.documentElement.scrollWidth,
					document.body.offsetWidth, document.documentElement.offsetWidth,
					document.documentElement.clientWidth
			),
			height = Math.max(
					document.body.scrollHeight, document.documentElement.scrollHeight,
					document.body.offsetHeight, document.documentElement.offsetHeight,
					document.documentElement.clientHeight
			);
			*/
		return [width, height];
	},
	//스크롤
	getScroll : function(){
		var 
			left = Math.round($(document).scrollLeft()),
			top = Math.round($(document).scrollTop());
		return [left, top];
	},
	//스크롤바
	/*
	getScrollbar : function() {
		var 
			scrollDiv = document.createElement("div"),
			scrollbarSize;
		
		scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
		document.body.appendChild(scrollDiv);
		scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
		document.body.removeChild(scrollDiv);
		
		return scrollbarSize;
	},
	*/
	//특정 DIV 사이즈 및 창 가운데 위치값
	getElement : function(obj){
		//object 검사
		if(!obj || typeof obj != 'object') {
			return;
		}
		var 
			that = this,
			//윈도우
			win = that.getWindow(),
			//도큐먼트
			doc = that.getDocument(),
			//스크린
			screen = (function() {
				return [Math.max(win[0], doc[0]), Math.max(win[1], doc[1])]; //width, height
			})(),
			//스크롤
			scroll = that.getScroll(),
			//element
			element = [Math.round($(obj).outerWidth(true)), Math.round($(obj).outerHeight(true))],
			left, top;

		//계산
		if(win[0] > element[0]) left = Math.round(win[0] / 2) - Math.round(element[0] / 2);
		else left = 0; //윈도우 사이즈(가로)보다 DIV 사이즈가 더 클경우
		if(win[1] > element[1]) top = Math.round(win[1] / 2) - Math.round(element[1] / 2);
		else top = 0; //윈도우 사이즈(세로)보다 DIV 사이즈가 더 클경우
		
		/*
		//스크롤값 추가
		left += scroll[0];
		top += scroll[1];
		*/
		//top값 + DIV높이 > body(window) 전체 높이보다 클경우(div가 페이지보다 더 아래로 내려가지 않도록함.)
		//var tmpHeight = doc[1] > win[1] ? doc[1] : win[1];
		//var tmpHeight = Math.max(win[1], doc[1]);
		var tmpHeight = screen[1];
		var tmpTop = Math.round(top + element[1]);
		if(tmpTop > tmpHeight) {
			top = top - Math.round(tmpTop-tmpHeight);
		}
		//위치값이 0보다 작지않도록 제어
		if(left < 0) left = 0;
		if(top < 0) top = 0;
		
		return {'left':left, 'top':top, 'width':element[0], 'height':element[1], 'screenWidth':screen[0], 'screenHeight':screen[1], 'scrollLeft':scroll[0], 'scrollTop':scroll[1]};
	}
};