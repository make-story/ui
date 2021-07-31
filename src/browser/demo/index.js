/**
 * 기능 테스트
 */
import $ from '../../dom';
import browser, { browserLocation, browserStorage, } from '../index';

export default (target='#browser', options={}) => {
    $(target).html(`
	
	`);
	console.log(browserLocation.params.get());
}