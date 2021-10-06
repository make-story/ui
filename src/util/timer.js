/**
 * 단일 타이머
 */
 import * as store from './store';
 import { EVENT_TYPE, addCustomEventListener, removeCustomEventListener, dispatchCustomEvent } from './event';
 
 // 단일 실행
 const current = {
    intervalCode: 0, // setInterval 고유값
    parentCode,
    childCode: '', // 현재 실행 고유값 
 };
 
 // setInterval
 const setInterval = () => {
     const data = store.getListItem(current.parentCode, current.childCode);
 
     // 정지
     if(!data || data.timer !== true || data.done !== false) {
         setTimerStop();
         return;
     }
     let { minute, second, timer, done } = data;
 
     // updtae
     if(0 < minute && second <= 0) {
         minute = minute - 1;
         second = 60
     }
     second = second - 1;
     if(minute < 0) {
         minute = 0;
     }
     if(second < 0) {
         second = 0;
     }
     store.setUpdateListItem(current.parentCode, current.childCode, { minute, second });
 
     // 종료
     if(minute <= 0 && second <= 0) {
         setTimerDone();
     }
 
     // 이벤트 디스패치
     dispatchCustomEvent(EVENT_TYPE.TIMER_VIEW, current.parentCode, current.childCode, `${('0' + Number(minute)).slice(-2)}:${('0' + Number(second)).slice(-2)}`);
 };
 
 // setInterval 실행
 const setIntervalStart = () => {
     // store 의 timer, done 유효성 확인 필요
     current.intervalCode = window.setInterval(setInterval, 1000);
 };
 
 // setInterval 정지
 const setIntervalStop = () => {
     window.clearInterval(current.intervalCode);
     current.intervalCode = 0;
 };
 
 // 타이머 시작
 const setTimerStart = () => {
     console.log('timer > setTimerStart', current);
     const { parentCode, childCode } = current;
     const data = store.getListItem(parentCode, childCode);
 
     // 유효성 검사
     if(current.intervalCode) {
         throw 'intervalCode error';
     }else if(!data) {
         return;
     }
 
     // 타이머 상태 변경
     data.timer = true;
     store.setUpdateListItem(parentCode, childCode, data);
 
     // 시작
     setIntervalStart();
 };
 
 // 타이머 일시정지
 const setTimerPause = () => {
     console.log('timer > setTimerPause', current);
     const { parentCode, childCode } = current;
     const data = store.getListItem(parentCode, childCode);
 
     // 정지
     setIntervalStop();
 
     // 유효성 검사
     if(!data) {
         return;
     }
 
     // 타이머 상태 변경
     data.timer = false;
     store.setUpdateListItem(parentCode, childCode, data);
 };
 
 // 타이머 정지
 const setTimerStop = () => {
     console.log('timer > setTimerStop', current);
     const { parentCode, childCode } = current;
     const data = store.getListItem(parentCode, childCode);
 
     // 정지
     setIntervalStop();
 
     // 유효성 검사
     if(!data) {
         return;
     }
 
     // list 아이템 시간 정보 초기화
     data.minute = data.time;
     data.second = 0;
     store.setUpdateListItem(parentCode, childCode, data);
 };
 const setTimerDone = () => {
     console.log('timer > setTimerDone', current);
     // 상태값 변경
     const { parentCode, childCode } = current;
     const data = store.getListItem(parentCode, childCode);
 
     // 정지
     setIntervalStop();
 
     // 유효성 검사
     if(!data) {
         return;
     }
 
     // 포모도로 +1 증가
     data.pomodoro = data.pomodoro + 1;
     store.setUpdateListItem(parentCode, childCode, data);
 
     // 이벤트 디스패치
     dispatchCustomEvent(EVENT_TYPE.DONE, true, parentCode, childCode); // 타이머 종료
 };
 
 /**
  * 이벤트
  */
 addCustomEventListener(EVENT_TYPE.TIMER_START, ({ detail }={}) => {
     console.log(EVENT_TYPE.TIMER_START, detail, current);
     const [ parentCode, childCode ] = detail;
 
     // 유효성 검사
     if(!parentCode || !childCode) {
         throw 'parentCode or childCode error';
     }else if(current.parentCode === parentCode && current.childCode === childCode && current.intervalCode) {
         return;
     }else if(current.parentCode || current.childCode) {
         setTimerStop();
         dispatchCustomEvent(EVENT_TYPE.TIMER_STOP, current.parentCode, current.childCode);
     }
 
     current.parentCode = parentCode;
     current.childCode = childCode;
     setTimerStart();
 });
 addCustomEventListener(EVENT_TYPE.TIMER_STOP, ({ detail }={}) => {
     console.log(EVENT_TYPE.TIMER_STOP, detail, current);
     const [ parentCode, childCode ] = detail;
 
     // 유효성 검사
     if(!parentCode || !childCode) {
         throw 'parentCode or childCode error';
     }else if(current.parentCode !== parentCode || current.childCode !== childCode || !current.intervalCode) {
         return;
     }
 
     setTimerStop();
 });
 addCustomEventListener(EVENT_TYPE.TIMER_PAUSE, ({ detail }={}) => {
     console.log(EVENT_TYPE.TIMER_PAUSE, detail, current);
     const [ parentCode, childCode ] = detail;
 
     // 유효성 검사
     if(!parentCode || !childCode) {
         throw 'parentCode or childCode error';
     }else if(current.parentCode !== parentCode || current.childCode !== childCode || !current.intervalCode) {
         return;
     }
 
     setTimerPause();
 });
 addCustomEventListener(EVENT_TYPE.TIMER_RESTART, ({ detail }={}) => {
     console.log(EVENT_TYPE.TIMER_START, detail, current);
     const [ parentCode, childCode ] = detail;
 
     // 유효성 검사
     if(!parentCode || !childCode) {
         throw 'parentCode or childCode error';
     }else if(current.parentCode === parentCode && current.childCode === childCode && current.intervalCode) {
         return;
     }
 
     setTimerStart();
 });