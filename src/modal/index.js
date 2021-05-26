/**
 * 모달 팩토리
 */
 import ModalAlert from './ModalAlert';
 import ModalBunch from './ModalBunch';
 import ModalConfirm from './ModalConfirm';
 import ModalFolder from './ModalFolder';
 import ModalLayer from './ModalLayer';
 import ModalMarket from './ModalMarket';
 import ModalMessage from './ModalMessage';
 import ModalRect from './ModalRect';
 import ModalStory from './ModalStory';
 import ModalState, { modalState } from "./ModalState";
 
 export default {
	 search: function(key) {
		 return key && modalState.instance[key] || false;
	 },
	 setup: function(type='', settings={}) {
		 let instance;
		 let { key=type, } = settings;
 
		 if(key && this.search(key)) {
			 // 중복생성 방지 key 검사
			 instance = this.search(key);
			 if(instance.change/* && JSON.stringify(instance.settings) !== JSON.stringify(settings)*/) {
				 instance.change(settings);
			 }
		 }else if(type) {
			 switch(type) {
				 case 'alert':
					 instance = new ModalAlert({ ...settings, /*title, message,*/ });
					 break;
				 case 'bunch':
					 instance = new ModalBunch(settings);
					 break;
				 case 'confirm':
					 instance = new ModalConfirm({ ...settings, /*title, message,*/ });
					 break;
				 case 'folder':
					 if(settings.all) {
						 // 전체 폴더 제목 상태 변경
						 (() => {
							 let key;
							 for(key in modalState.instance) {
								 if(modalState.instance[key].settings && modalState.instance[key].settings.type === 'folder') {
									 modalState.instance[key].titleToggle({'mode': settings.all.mode});
								 }
							 }
						 })();
					 }else {
						 instance = new ModalFolder(settings);
					 }
					 break;
				 case 'layer':
					 instance = new ModalLayer({ ...settings, /*target,*/ });
					 break;
				 case 'market':
					 instance = new ModalMarket(settings);
					 break;
				 case 'message':
				 case 'push':
					 instance = new ModalMessage({ ...settings, /*message,*/ });
					 break;
				 case 'rect':
					 instance = new ModalRect({ ...settings, /*target, rect,*/ });
					 break;
				 case 'story':
					 instance = new ModalStory(settings);
					 break;
			 }
			 if(key && instance) {
				 modalState.instance[key] = instance;
			 }
		 }
		 console.log('instance', modalState.instance);
 
		 return instance;
	 },
	 on: function(key) { // 전체 또는 해당 key
		 if(key) {
			 this.search(key) && this.search(key).on();
		 }else {
			 for(key in modalState.instance) {
				 if(modalState.instance.hasOwnProperty(key)) {
					 modalState.instance[key].on();
				 }
			 }
		 }
	 },
	 off: function(key) { // 전체 또는 해당 key
		 if(key) {
			 this.search(key) && this.search(key).off();
		 }else {
			 for(key in modalState.instance) {
				 if(modalState.instance.hasOwnProperty(key)) {
					 modalState.instance[key].off();
				 }
			 }
		 }
	 }
 }