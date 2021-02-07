/**
 * 모달
 */
import ModalLayer from './ModalLayer';
import ModalRect from './ModalRect';
import ModalMessage from './ModalMessage';

const flickings = {};
export default {
	search: function(key) {
		return key && flickings[key] || false;
	},
	setup: function(target=null, type='', settings={}) {
		let instance;
		let { key=type, rect, } = settings;

		if(key && this.search(key)) {
			// 중복생성 방지 key 검사
			instance = this.search(key);
		}else if(type) {
			switch(type) {
				case 'layer':
					instance = new ModalLayer(target, settings);
					break;
				case 'rect':
					instance = new ModalRect(target, rect, settings);
					break;
				case 'message':
					instance = new ModalMessage({ message: target, ...settings});
					break;
			}
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