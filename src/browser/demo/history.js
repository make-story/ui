import {
  getNavigationType,
  setScrollRestoration,
  setHistoryWindowScroll,
  getHistoryWindowScroll,
  setPageHideEvent,
  setUserTouchEvent,
  setPageShowCallbackCancel,
} from "../history";


// BFCache 경우 페이지 새로고침
/*setPageShowCallback((isBFCache: boolean) => {
  console.log('display > BFCache', isBFCache);
  isBFCache && window.location.reload();
});*/

// 브라우저 정보
const getBrowserName = () => {
  return 'safari'.toLowerCase();
};

// 브라우저 스크롤 제어 수동으로 설정
setScrollRestoration('manual');

// BFCache 에 따른 새로고침 전 스크롤값 저장
const HISTORY_BFCACHE_SCROLL = 'HISTORY_BFCACHE_SCROLL';
const setHistoryBFCacheScroll = (key = HISTORY_BFCACHE_SCROLL) => { // 공통
  window.sessionStorage.setItem(key, JSON.stringify(getHistoryWindowScroll()));
};
const getHistoryBFCacheScroll = (key = HISTORY_BFCACHE_SCROLL) => { // 공통
  return JSON.parse(window.sessionStorage.getItem(key) || '{}');
};

// 페이지정보 저장 (IOS 14 버전이상에서 뒤로가기/앞으로가기 후 자동 새로고침 이슈 대응하기 위함)
const HISTORY_LOCATION = 'HISTORY_LOCATION';
const setHistoryLocation = (key = HISTORY_LOCATION) => { // 공통
  window.sessionStorage.setItem(key, window.location.href);
};
const getHistoryLocation = (key = HISTORY_LOCATION) => { // 공통
  return window.sessionStorage.getItem(key);
};
const HISTORY_RELOAD_SCROLL = 'HISTORY_RELOAD_SCROLL';
const setHistoryReloadScroll = (key = HISTORY_RELOAD_SCROLL) => { // 공통
  window.sessionStorage.setItem(key, JSON.stringify(getHistoryWindowScroll()));
};
const getHistoryReloadScroll = (key = HISTORY_RELOAD_SCROLL) => { // 공통
  return JSON.parse(window.sessionStorage.getItem(key) || '{}');
};

// 브라우저 스크롤 이동
const setNavigationTypeWindowScroll = (navigationType) => { // 공통
  let top = 0;
  if (window.history.scrollRestoration && window.history.scrollRestoration !== 'manual') {
    // 브라우저 히스토리 스크롤 수동제어 모드가 아닌 경우
    return;
  } else if (navigationType === 'back_forward') {
    top = Number(getHistoryWindowScroll().top) || 0;
  } else if (navigationType === 'reload_bfcache') {
    top = Number(getHistoryBFCacheScroll().top) || 0;
  } else if (navigationType === 'navigate' && window.location.href === getHistoryLocation()) {
    // safari 에서 새로고침되는 이슈 때문에 조건삽입
    top = Number(getHistoryReloadScroll().top) || 0;
  }
  if (0 < top) {
    console.log('setNavigationTypeWindowScroll', navigationType, top);
    window.scrollTo({ top, behavior: 'auto' });
  }
};

// pageshow 콜백
const setPageShowCallback = ((browserName) => { // 내부적 사용
  const isSafari = browserName && -1 < browserName.toLowerCase().indexOf('safari');
  let timePageShowTimeout = 0;
  return (navigationType) => {
    console.log('setPageShowCallback', navigationType);
    window.clearTimeout(timePageShowTimeout);
    if (navigationType === 'bfcache') {
      setHistoryBFCacheScroll(); // BFCache 상태의 스크롤값 (새로고침 전 이전 스크롤값 저장)
      window.location.reload();
    } else {
      timePageShowTimeout = window.setTimeout(
        () => {
          setNavigationTypeWindowScroll(navigationType);
        },
        isSafari ? 350 : 0,
      ); // Next.js Route 실행으로 페이지 최상단 이동되는 것 이후 실행 (사파리 등에서 Next routeChangeStart, routeChangeComplete 등 실행됨)
    }
  };
})(getBrowserName());

// DOM Ready 콜백
const setDOMReadyCallback = () => { // 내부적 사용
  setNavigationTypeWindowScroll(getNavigationType());
};

// 사용자 터치가 발생하면, 히스토리 스크롤 이동 정지
const setUserTouchHandler = (event) => { // 내부적 사용
  //console.log(event);
  setPageShowCallbackCancel(setPageShowCallback);
  setDOMReadyCallbackCancel(setDOMReadyCallback);
};

// 히스토리
const setPageHideHandler = ((browserName) => { // 내부적 사용
  const isSafari = browserName && -1 < browserName.toLowerCase().indexOf('safari');
  let timeHistoryPageInterval = 0;
  return (event) => {
    console.log('setPageHideHandler > pagehide');
    // 사파리에서는 BFCache 에 기존 JavaScript 코드가 실행되지 않는다.
    if (isSafari) {
      // 일부 브라우저 자동 새로고침 이슈 때문에 기존 스크롤 값 저장
      setHistoryReloadScroll();
      setHistoryLocation();
      // 페이지 떠나기 전 인터벌 실행이 캐쉬되도록 한다. (해당 페이지를 BFCache 작동상태로 돌아왔을 때, 히스토리 확인 코드가 작동되도록 하기위함)
      window.clearInterval(timeHistoryPageInterval);
      timeHistoryPageInterval = window.setInterval(() => {
        console.log('safari history interval!!!!!');
        window.clearInterval(timeHistoryPageInterval);
        getNavigationType(setPageShowCallback);
      });
    }
    // 브라우저 스크롤값 저장
    setHistoryWindowScroll();
  };
})(getBrowserName());
const setHistoryCheck = (browserName) => { // 내부적 사용
  console.log('setHistoryCheck', browserName);
  //const isSafari = browserName && -1 < browserName.toLowerCase().indexOf('safari');
  /*if (isSafari) {
    // safari BFCache 확인 - 콜백
    getNavigationType(setPageShowCallback);
  } else {
    // 일반 브라우저 확인
    setDOMReadyCallback(setDOMReadyCallback);
  }*/
  getNavigationType(setPageShowCallback);
  setUserTouchEvent(setUserTouchHandler); // 사용자 터치 감시
};
const setHistoryRouter = (path=window.location.href?.split('?')?.shift()?.split('/')?.pop() || '') => {
    setHistoryCheck(getBrowserName());
    setPageHideEvent(setPageHideHandler);
};

//
setHistoryRouter();