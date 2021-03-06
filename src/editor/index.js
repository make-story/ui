/**
 * 에디터
 */
import EditText from './EditText';
import EditMulti from './EditMulti';
import OpenGraph from './OpenGraph';

const editors = {};
export default {
	search: function(key='') {
		return key && editors[key] || false;
	},
	setup: function(target=null, type='', settings={}) {
		let instance;
		let { key=type, } = settings;

		if(key && this.search(key)) {
			// 중복생성 방지 key 검사
			instance = this.search(key);
			if(instance.setSettings/* && JSON.stringify(instance.settings) !== JSON.stringify(settings)*/) {
				instance.setSettings(target, settings);
			}
		}else if(type) {	
			switch(type) {
				case 'text':
					instance = new EditText(target, settings);
					break;
				case 'multi':
					instance = new EditMulti(target, settings);
					break;
				case 'opengraph':
					instance = new OpenGraph(target, settings);
					break;
			}
			if(key && instance) {
				editors[key] = instance;
			}
		};

		return instance;
	},
	put: function(key='', data) { // image 서버 전송 후 iframe 에서 JavaScript 에 의해 실행되거나, 외부에서 리소스를 도큐먼트에 삽입하고자 할 때 사용
		if(this.search(key)) {
			this.search(key).put(data);
		}
	},
};