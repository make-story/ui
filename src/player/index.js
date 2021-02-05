/**
 * 플레이어
 * 비디오, 오디오
 */
import Video from './Video';

// Default codecs for checking mimetype support
const defaultCodecs = {
	'audio/ogg': 'vorbis',
	'audio/wav': '1',
	'video/webm': 'vp8, vorbis',
	'video/mp4': 'avc1.42E01E, mp4a.40.2',
	'video/ogg': 'theora',
};

const players = {};
export default {
	// 현재 브라우저가 해당 미디어 mime 타입 지원여부 확인 
	support: function(player/*html element*/, mimeType) {
		//const audio = 'canPlayType' in document.createElement('audio');
		//const video = 'canPlayType' in document.createElement('video');

		// Check for mime type support against a player instance
		// Credits: http://diveintohtml5.info/everything.html
		// Related: http://www.leanbackplayer.com/test/h5mt.html
		if(player.type === 'video') {
			switch(mimeType) {
				case 'video/webm':
					return !!(player.canPlayType && player.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/no/, ''));
				case 'video/mp4':
					return !!(player.canPlayType && player.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, ''));
				case 'video/ogg':
					return !!(player.canPlayType && player.canPlayType('video/ogg; codecs="theora"').replace(/no/, ''));
			}
		}else if(player.type === 'audio') {
			switch(mimeType) {
				case 'audio/mpeg':
					return !!(player.canPlayType && player.canPlayType('audio/mpeg;').replace(/no/, ''));
				case 'audio/ogg':
					return !!(player.canPlayType && player.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
				case 'audio/wav':
					return !!(player.canPlayType && player.canPlayType('audio/wav; codecs="1"').replace(/no/, ''));
			}
		}

		return false;
	},
	search: function(key) {
		return key && players[key] || false;
	},
	setup: function(target=null, type='', settings={}) {
		var instance;
		let { key=type, } = settings;		
		
		if(key && this.search(key)) {
			// 중복생성 방지 key 검사
			instance = this.search(key);
		}else if(type) {
			switch(type) {
				case 'video':
					instance = new Video(target, settings);
					break;
				case 'audio':
					//instance = new Audio(target, settings);
					break;
			}
			if(key && instance) {
				players[key] = instance;
			}
		}

		return instance;
	},
}