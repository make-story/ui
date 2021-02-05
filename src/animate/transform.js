/**
 * transform
 * https://developer.mozilla.org/en-US/docs/Web/CSS/transform
 */
import browser from '../browser';
import $ from '../dom';
import { 
	regexp,
	numberUnit,
} from '../util';

export default ({ element, transform, box/*transform-box*/, origin/*transform-origin*/, style/*transform-style*/, duration=0/*transform: translate 경우 */, complete }) => {
	try {
		//element.style.webkitTransitionDuration = element.style.MozTransitionDuration = element.style.msTransitionDuration = element.style.OTransitionDuration = element.style.transitionDuration = `${duration}s`;
		element.style.webkitTransform = element.style.msTransform = element.style.MozTransform = element.style.OTransform = transform;
	}catch(e) {
		console.log(e);
	}
};