/**
 * 슬라이드
 */
import Flicking from './Flicking';

const flickings = {};
export default {
	search: function(key) {
		return key && flickings[key] || false;
	},
	setup: function(target=null, settings={}) {
		let instance;
		let { key='flicking', } = settings;

		if(key && this.search(key)) {
			// 중복생성 방지 key 검사
			instance = this.search(key);
		}else {
			instance = new Flicking(target, settings);
			if(key && instance) {
				flickings[key] = instance;
			}
		}

		return instance;
	},
	on: function(key) { // 전체 또는 해당 key
		if(key) {
			this.search(key) && this.search(key).on();
		}else {
			for(key in flickings) {
				if(flickings.hasOwnProperty(key)) {
					flickings[key].on();
				}
			}
		}
	},
	off: function(key) { // 전체 또는 해당 key
		if(key) {
			this.search(key) && this.search(key).off();
		}else {
			for(key in flickings) {
				if(flickings.hasOwnProperty(key)) {
					flickings[key].off();
				}
			}
		}
	}
}