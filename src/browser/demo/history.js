import {
  getNavigationType,
  setScrollRestoration,
  setHistoryWindowScroll,
  getHistoryWindowScroll,
  isPageShowCallbackCancel,
  isDOMReadyCallback,
  isDOMReadyCallbackCancel,
} from "../history";


// BFCache 경우 페이지 새로고침
/*isPageShowCallback((isBFCache: boolean) => {
  console.log('display > BFCache', isBFCache);
  isBFCache && window.location.reload();
});*/

// 브라우저 스크롤 제어 수동으로 설정
setScrollRestoration('manual');

// 브라우저 스크롤 이동
const setWindowScroll = (navigationType) => {
  let top = 0;
  if (navigationType === 'reload_bfcache') {
    top = getHistoryBFCacheScroll().top;
  } else if (navigationType === 'back_forward') {
    // ['reload', 'back_forward'].includes(navigationType)
    top = getHistoryWindowScroll().top;
  } else {
    return;
  }
  console.log('setWindowScroll', navigationType, top);
  window.scrollTo({ top: Number(top) || 0, behavior: 'auto' });
};

// BFCache 에 따른 새로고침 전 스크롤값 저장
const HISTORY_BFCACHE_SCROLL = 'HISTORY_BFCACHE_SCROLL';
const setHistoryBFCacheScroll = (key = HISTORY_BFCACHE_SCROLL) => {
  window.sessionStorage.setItem(key, JSON.stringify(getHistoryWindowScroll()));
};
const getHistoryBFCacheScroll = () => {
  return JSON.parse(window.sessionStorage.getItem(HISTORY_BFCACHE_SCROLL) || '{}');
};
const setPageShowCallback = (navigationType) => {
  console.log('setPageShowCallback', navigationType);
  if (navigationType === 'bfcache') {
    setHistoryBFCacheScroll();
    window.location.reload();
  } else {
    setWindowScroll(navigationType);
  }
};
// 사용자 터치가 발생하면, 히스토리 스크롤 이동 정지
const setUserTouchListener = (event) => {
  //console.log(event);
  isPageShowCallbackCancel(setPageShowCallback);
};
const setUserTouchWatch = (listener) => {
  window.document?.body?.removeEventListener('touchstart', listener);
  window.document?.body?.removeEventListener('touchmove', listener);
  window.document?.body?.addEventListener('touchstart', listener, { once: true });
  window.document?.body?.addEventListener('touchmove', listener, { once: true });
};

// 히스토리
const setHistoryPageListener = (() => {
  // 클로저 - node js 에서 메모리 누수에 주의!
  const browserName = 'safari';
  const isSafari = browserName && -1 < browserName.toLowerCase().indexOf('safari');
  let timeHistoryPageInterval = 0;
  return (event) => {
    // 브라우저 스크롤값 저장
    setHistoryWindowScroll();
    // 사파리에서는 BFCache 에 기존 JavaScript 코드가 실행되지 않는다.
    // 페이지 떠나기 전 인터벌 실행이 캐쉬되도록 한다.
    if (isSafari) {
      window.clearInterval(timeHistoryPageInterval);
      timeHistoryPageInterval = window.setInterval(() => {
        window.clearInterval(timeHistoryPageInterval);
        getNavigationType(setPageShowCallback);
        console.log('display history interval!!!!!');
      });
    }
  };
})();
const setHistoryPage = (listener) => {
  // 사용자가 페이지를 떠날 때
  window.removeEventListener('beforeunload', listener);
  window.removeEventListener('pagehide', listener);
  window.addEventListener('beforeunload', listener, { once: true });
  window.addEventListener('pagehide', listener), { once: true };
};
const setHistoryCheck = (browserName) => {
  console.log('setHistoryCheck', browserName);
  const isSafari = browserName && -1 < browserName.toLowerCase().indexOf('safari');

  if (isSafari) {
    // safari BFCache 확인 - 콜백
    getNavigationType(setPageShowCallback);
    setUserTouchWatch(setUserTouchListener);
  } else {
    // 일반 브라우저 확인
    isDOMReadyCallback(() => {
      setWindowScroll(getNavigationType());
    });
  }
};
const setHistoryRouter = (path) => {
    const browserName = 'safari';
    setHistoryCheck(browserName);
    setHistoryPage(setHistoryPageListener);
};
