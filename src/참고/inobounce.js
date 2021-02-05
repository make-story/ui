/**
 * https://github.com/lazd/iNoBounce/blob/master/inobounce.js
 * iNoBounce.enable(layer scroll element);
 * iNoBounce.disable();
 */

// Stores the Y position where the touch started
var startY = 0;

// Store enabled status
var enabled = false;

var supportsPassiveOption = false;
try {
	var opts = Object.defineProperty({}, 'passive', {
		get: function() {
			supportsPassiveOption = true;
		}
	});
	window.addEventListener('test', null, opts);
} catch (e) {}

//Enable by default if the browser supports -webkit-overflow-scrolling
//Test this by setting the property with JavaScript on an element that exists in the DOM
//Then, see if the property is reflected in the computed style
var testDiv = document.createElement('div');
document.documentElement.appendChild(testDiv);
testDiv.style.webkitOverflowScrolling = 'touch';
var scrollSupport = 'getComputedStyle' in window && window.getComputedStyle(testDiv)['-webkit-overflow-scrolling'] === 'touch'; // 크롬 개발자 도구가 아닌, IOS 기기에서 테스트 
document.documentElement.removeChild(testDiv);

var target = null;
var handleTouchstart = function(event) {
	// Store the first Y position of the touch
	startY = event.touches ? event.touches[0].screenY : event.screenY;
};
/*var handleTouchmove = function(event) {
	// Get the element that was scrolled upon
	var element = event.target;

	// Allow zooming
	var zoom = window.innerWidth / window.document.documentElement.clientWidth;
	if (event.touches.length > 1 || zoom !== 1) {
		return;
	}

	// Check all parent elements for scrollability
	while (element !== document.body && element !== document) {
		// Get some style properties
		var style = window.getComputedStyle(element);

		if (!style) {
			// If we've encountered an element we can't compute the style for, get out
			return;
		}

		// Ignore range input element
		if (element.nodeName === 'INPUT' && element.getAttribute('type') === 'range') {
			return;
		}

		var scrolling = style.getPropertyValue('-webkit-overflow-scrolling');
		var overflowY = style.getPropertyValue('overflow-y');
		var height = parseInt(style.getPropertyValue('height'), 10);

		// Determine if the element should scroll
		var isScrollable = scrolling === 'touch' && (overflowY === 'auto' || overflowY === 'scroll');
		var canScroll = element.scrollHeight > element.offsetHeight;

		if (isScrollable && canScroll) {
			// Get the current Y position of the touch
			var curY = event.touches ? event.touches[0].screenY : event.screenY;

			// Determine if the user is trying to scroll past the top or bottom
			// In this case, the window will bounce, so we have to prevent scrolling completely
			var isAtTop = (startY <= curY && element.scrollTop === 0);
			var isAtBottom = (startY >= curY && element.scrollHeight - element.scrollTop === height);

			// Stop a bounce bug when at the bottom or top of the scrollable element
			if (isAtTop || isAtBottom) {
				event.preventDefault();
			}

			// No need to continue up the DOM, we've done our job
			return;
		}

		// Test the next parent
		element = element.parentNode;
	}

	// Stop the bouncing -- no parents are scrollable
	event.preventDefault();
};*/
var handleTouchmove = function(event) {
	var zoom = window.innerWidth / window.document.documentElement.clientWidth;
	var style;
	var scrolling, overflowY, height;
	var isScrollable, canScroll;
	var curY, isAtTop, isAtBottom;
	
	if(!target) {
		return;
	}else if(event.touches.length > 1 || zoom !== 1) {
		return;
	}
	
	style = window.getComputedStyle(target);
	if(!style) {
		return;
	}
	if(target.nodeName === 'INPUT' && target.getAttribute('type') === 'range') {
		return;
	}

	scrolling = style.getPropertyValue('-webkit-overflow-scrolling');
	overflowY = style.getPropertyValue('overflow-y');
	height = parseInt(style.getPropertyValue('height'), 10);

	isScrollable = scrolling === 'touch' && (overflowY === 'auto' || overflowY === 'scroll');
	canScroll = target.scrollHeight > target.offsetHeight;

	if(isScrollable && canScroll) {
		curY = event.touches ? event.touches[0].screenY : event.screenY;
		isAtTop = (startY <= curY && target.scrollTop === 0);
		isAtBottom = (startY >= curY && target.scrollHeight - target.scrollTop === height);
		if(isAtTop || isAtBottom) {
			event.preventDefault();
		}
		return;
	}
	
	//event.preventDefault();
};

var enable = function(element) {
	if(!scrollSupport) {
		return;
	}
	target = element;
	// Listen to a couple key touch events
	window.addEventListener('touchstart', handleTouchstart, supportsPassiveOption ? { passive : false } : false);
	window.addEventListener('touchmove', handleTouchmove, supportsPassiveOption ? { passive : false } : false);
	enabled = true;
};

var disable = function() {
	target = null;
	// Stop listening
	window.removeEventListener('touchstart', handleTouchstart, false);
	window.removeEventListener('touchmove', handleTouchmove, false);
	enabled = false;
};

var isEnabled = function() {
	return enabled;
};

// A module to support enabling/disabling iNoBounce
var iNoBounce = {
	enable: enable,
	disable: disable,
	isEnabled: isEnabled
};

module.exports = iNoBounce;