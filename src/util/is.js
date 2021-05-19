/**
 * 조건 검사
 */

 const getConstructor = (value) => (value !== null && typeof value !== 'undefined' ? value.constructor : null);
 const instanceOf = (value, constructor) => Boolean(value && constructor && value instanceof constructor);
 export const type = value => Object.prototype.toString.call(value).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
 
 export const isNull = (value) => value === null;
 export const isUndefined = (value) => typeof value === 'undefined';
 export const isNullOrUndefined = (value) => isNull(value) || isUndefined(value);
 export const isArray = (value) => Array.isArray(value);
 export const isNumber = (value) => getConstructor(value) === Number && !Number.isNaN(value);
 export const isString = (value) => getConstructor(value) === String;
 export const isBoolean = (value) => getConstructor(value) === Boolean;
 export const isFunction = (value) => getConstructor(value) === Function;
 export const isWeakMap = (value) => instanceOf(value, WeakMap);
 export const isPromise = (value) => instanceOf(value, Promise) && isFunction(value.then);
 
 export const isEvent = (value) => instanceOf(value, Event);
 export const isKeyboardEvent = (value) => instanceOf(value, KeyboardEvent);
 export const isObject = (value) => getConstructor(value) === Object || (!isNull(value) && typeof value === 'object');
 export const isJSON = (value) => isObject(value) && (isArray(value) || /^{.*}$|^\[.*\]$/.test(JSON.stringify(value)));
 
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
 export const isWindow = (value) => value !== null && typeof value === 'object' && value === window;
 export const isDocument = (value) => value !== null && typeof value === 'object' && value.nodeType === 9;
 export const isElementList = (value) => instanceOf(value, NodeList) || instanceOf(value, HTMLCollection);
 export const isElement = (value) => value !== null && typeof value === 'object' && value.nodeType === 1 && typeof value.style === 'object' && typeof value.ownerDocument === 'object';
 //export const isElement = (node) => node && node.nodeType === Node.ELEMENT_NODE;
 export const isTextNode = (value) => getConstructor(value) === Text;
 //export const isTextNode = (node) => node && node.nodeType === Node.TEXT_NODE;
 
 export const isCue = (value) => instanceOf(value, window.TextTrackCue) || instanceOf(value, window.VTTCue);
 export const isTrack = (value) => instanceOf(value, TextTrack) || (!isNullOrUndefined(value) && isString(value.kind));
 export const isEmpty = (value) => isNullOrUndefined(value) || ((isString(value) || isArray(value) || isElementList(value)) && !value.length) || (isObject(value) && !Object.keys(value).length);
 export const isUrl = (value) => {
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
 
 export const isEmail = (value) => {
	 const pattern = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
	 return pattern.test(value);
 };
 export const isPhone = (value) => { 
	 const pattern = /^\d{2,3}-\d{3,4}-\d{4}$/;
	 return pattern.test(value);
 };
 export const isExtension = (value, extension) => { // 확장자
	 const extensionList = (isString(extension) && extension.replace(/(^\s*)|(\s*$)/g, "")) || 'jpg,jpeg,gif,png,pdf,hwp,exl'; // 관리자 지정 확장자
	 const index = value.lastIndexOf(".");
	 const extensionValue = value.substr(index + 1).toLowerCase(); // 첨부된 확장자
	 return extensionList.toLowerCase().indexOf(extensionValue) !== -1;
 };
 export const isBase64 = (value) => { // base64 확인 
	 try {
		 return btoa(atob(value)) === value;
	 }catch(error) {
		 return false;
	 }
 };
 
 export const isTextDate = (value) => {
	 const pattern = /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/;
	 return pattern.test(value);
 };
 export const isTextNumber = (value) => {
	 const pattern = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
	 return pattern.test(value);
 };
 export const isTextMinLength = (value, number) => { // 최소글자
	 const value1 = value.replace(/<br>|\s/g, "");
	 const value2 = parseInt(number); 
	 return value1.length >= value2;
 };
 export const isTextMaxLength = (value, number) => { // 최대글자
	 const value1 = value.replace(/<br>|\s/g,"");
	 const value2 = parseInt(number); 
	 return value1.length <= value2;
 };
 export const isNumberMin = (value, number) => { // 최소값
	 if(isNumber(value) && isNumber(number)) {
		 return value >= number;
	 }
	 return false;
 };
 export const isNumberMax = (value, number) => { // 최대값
	 if(isNumber(value) && isNumber(number)) {
		 return value <= number;
	 }
	 return false;
 };

 export const isTypeof = (type="string|object", value) => {
	if(isArray(type)) {
		type = type.join('|');
	}
	// /string|object/.test(typeof value)
 }
