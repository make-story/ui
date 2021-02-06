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

const isNodeList = (value) => instanceOf(value, NodeList);
const isElement = (value) => value !== null && typeof value === 'object' && value.nodeType === 1 && typeof value.style === 'object' && typeof value.ownerDocument === 'object';
//const isElement = (node) => node && node.nodeType === Node.ELEMENT_NODE;
const isTextNode = (value) => getConstructor(value) === Text;
//const isTextNode = (node) => node && node.nodeType === Node.TEXT_NODE;

const isCue = (value) => instanceOf(value, window.TextTrackCue) || instanceOf(value, window.VTTCue);
const isTrack = (value) => instanceOf(value, TextTrack) || (!isNullOrUndefined(value) && isString(value.kind));
const isEmpty = (value) => isNullOrUndefined(value) || ((isString(value) || isArray(value) || isNodeList(value)) && !value.length) || (isObject(value) && !Object.keys(value).length);
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
	
	nodeList: isNodeList,
	element: isElement,
	textNode: isTextNode,
	
	cue: isCue,
	track: isTrack,
	empty: isEmpty,
	url: isUrl,	
};