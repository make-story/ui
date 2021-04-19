/**
 * 조건 검사
 */

const getConstructor = (value) => (value !== null && typeof value !== 'undefined' ? value.constructor : null);
const instanceOf = (value, constructor) => Boolean(value && constructor && value instanceof constructor);
const type = value => Object.prototype.toString.call(value).replace(/^\[object (.+)\]$/, '$1').toLowerCase();

const isNull = (value) => value === null;
const isUndefined = (value) => typeof value === 'undefined';
const isNullOrUndefined = (value) => isNull(value) || isUndefined(value);
const isArray = (value) => Array.isArray(value);
const isNumber = (value) => getConstructor(value) === Number && !Number.isNaN(value);
const isString = (value) => getConstructor(value) === String;
const isBoolean = (value) => getConstructor(value) === Boolean;
const isFunction = (value) => getConstructor(value) === Function;
const isWeakMap = (value) => instanceOf(value, WeakMap);
const isPromise = (value) => instanceOf(value, Promise) && isFunction(value.then);

const isEvent = (value) => instanceOf(value, Event);
const isKeyboardEvent = (value) => instanceOf(value, KeyboardEvent);
const isObject = (value) => getConstructor(value) === Object || (!isNull(value) && typeof value === 'object');
const isJSON = (value) => isObject(value) && (isArray(value) || /^{.*}$|^\[.*\]$/.test(JSON.stringify(value)));

/*
nodeType
1 : Element 노드를 의미
2 : Attribute 노드를 의미
3 : Text 노드를 의미
4 : CDATASection 노드를 의미
5 : EntityReference 노드를 의미
6 : Entity 노드를 의미
7 : ProcessingInstruction 노드를 의미
8 : Comment 노드를 의미
9 : Document 노드를 의미
10 : DocumentType 노드를 의미
11 : DocumentFragment 노드를 의미
12 : Notation 노드를 의미
*/
const isWindow = (value) => value !== null && typeof value === 'object' && value === window;
const isDocument = (value) => value !== null && typeof value === 'object' && value.nodeType === 9;
const isElementList = (value) => instanceOf(value, NodeList) || instanceOf(value, HTMLCollection);
const isElement = (value) => value !== null && typeof value === 'object' && value.nodeType === 1 && typeof value.style === 'object' && typeof value.ownerDocument === 'object';
//const isElement = (node) => node && node.nodeType === Node.ELEMENT_NODE;
const isTextNode = (value) => getConstructor(value) === Text;
//const isTextNode = (node) => node && node.nodeType === Node.TEXT_NODE;

const isCue = (value) => instanceOf(value, window.TextTrackCue) || instanceOf(value, window.VTTCue);
const isTrack = (value) => instanceOf(value, TextTrack) || (!isNullOrUndefined(value) && isString(value.kind));
const isEmpty = (value) => isNullOrUndefined(value) || ((isString(value) || isArray(value) || isElementList(value)) && !value.length) || (isObject(value) && !Object.keys(value).length);
const isUrl = (value) => {
	// Accept a URL object
	if(instanceOf(value, window.URL)) {
		return true;
	}

	// Must be string from here
	if(!isString(value)) {
		return false;
	}

	// Add the protocol if required
	let string = value;
	if(!value.startsWith('http://') || !value.startsWith('https://')) {
		string = `http://${value}`;
	}

	try {
		return !isEmpty(new URL(string).hostname);
	}catch (e) {
		return false;
	}
};

const isEmail = (value) => {
	const pattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
	return pattern.test(value);
};
const isPhone = (value) => { 
	const pattern = /^\d{2,3}-\d{3,4}-\d{4}$/;
	return pattern.test(value);
};
const isBase64 = (value) => { // base64 확인 
	try {
		return btoa(atob(value)) === value;
	}catch(error) {
		return false;
	}
};

const isTextDate = (value) => {
	const pattern = /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/;
	return pattern.test(value);
};
const isTextNumber = (value) => {
	const pattern = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
	return pattern.test(value);
};
const isTextMinLength = (value, number) => { // 최소글자
	const value1 = value.replace(/<br>|\s/g, "");
	const value2 = parseInt(number); 
	return value1.length >= value2;
};
const isTextMaxLength = (value, number) => { // 최대글자
	const value1 = value.replace(/<br>|\s/g,"");
	const value2 = parseInt(number); 
	return value1.length <= value2;
};
const isNumberMin = (value, number) => { // 최소값
	if(isNumber(value) && isNumber(number)) {
		return value >= number;
	}
	return false;
};
const isNumberMax = (value, number) => { // 최대값
	if(isNumber(value) && isNumber(number)) {
		return value <= number;
	}
	return false;
};

export default {
	type,

	null: isNull,
	undefined: isUndefined,
	nullOrUndefined: isNullOrUndefined,
	array: isArray,
	number: isNumber,
	string: isString,
	boolean: isBoolean,
	function: isFunction,
	weakMap: isWeakMap,
	promise: isPromise,

	event: isEvent,
	keyboardEvent: isKeyboardEvent,
	object: isObject,
	json: isJSON,

	window: isWindow,
	document: isDocument,
	elementList: isElementList,
	element: isElement,
	textNode: isTextNode,
	
	cue: isCue,
	track: isTrack,
	empty: isEmpty,
	url: isUrl,	

	email: isEmail,
	phone: isPhone,
	extension: isExtension,
	base64: isBase64,

	textDate: isTextDate,
	textNumber: isTextNumber,
	textMinLength: isTextMinLength,
	textMaxLength: isTextMaxLength,
	numberMin: isNumberMin,
	numberMax: isNumberMax,
};