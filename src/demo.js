/**
 * 전체 demo
 */
import $ from './dom';

import demoAnimate from './animate/demo';
import demoBrowser from './browser/demo';
import demoDOM from './dom/demo';
import demoEditor from './editor/demo';
import demoFlicking from './flicking/demo';
import demoModal from './modal/demo';
import demoPlayer from './player/demo';
import demoTouch from './touch/demo';
import demoUtil from './util/demo';
import demoWebSocket from './websocket/demo';
import demoWebWorker from './webworker/demo';
import demoXHR from './xhr/demo';

import demoEvent from './event/demo';

// 테스트 (임시)
import './test/index';
import './browser/device';

//demoAnimate();
//demoBrowser();
//demoDOM();
demoEditor();
//demoFlicking();
demoModal();
//demoPlayer();
//demoTouch();
demoUtil();
//demoWebSocket();
//demoWebWorker();
//demoXHR();
//demoEvent();