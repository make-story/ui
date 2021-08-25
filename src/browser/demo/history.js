import {
  getNavigationType,
  setScrollRestoration,
  setHistoryWindowScroll,
  getHistoryWindowScroll,
  setHistoryBFCache,
  isPageShowCallbackCancel,
  isDOMReadyCallback,
  isDOMReadyCallbackCancel,
} from "../history";


// BFCache 경우 페이지 새로고침
/*isPageShowCallback((isBFCache: boolean) => {
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
const setHistoryBFCacheScroll = (key = HISTORY_BFCACHE_SCROLL) => {
  window.sessionStorage.setItem(key, JSON.stringify(getHistoryWindowScroll()));
};
const getHistoryBFCacheScroll = () => {
  return JSON.parse(window.sessionStorage.getItem(HISTORY_BFCACHE_SCROLL) || '{}');
};

// 페이지정보 저장
const HISTORY_LOCATION = 'HISTORY_LOCATION';
const setHistoryLocation = (key = HISTORY_LOCATION) => {
  window.sessionStorage.setItem(key, window.location.href);
};
const getHistoryLocation = (key = HISTORY_LOCATION) => {
  return window.sessionStorage.getItem(key);
};

// 브라우저 스크롤 이동
const setWindowScroll = (navigationType) => {
  let top = 0;
  if (window.history.scrollRestoration && window.history.scrollRestoration !== 'manual') {
    // 브라우저 히스토리 스크롤 수동제어 모드가 아닌 경우
    return;
  } else if (navigationType === 'reload_bfcache') {
    top = Number(getHistoryBFCacheScroll().top) || 0;
  } else if (
    navigationType === 'back_forward' ||
    (navigationType === 'navigate' &&
      window.location.href === getHistoryLocation()) /* safari 에서 새로고침되는 이슈 때문에 조건삽입 */
  ) {
    top = Number(getHistoryWindowScroll().top) || 0;
  }
  if (0 < top) {
    console.log('setWindowScroll', navigationType, top);
    window.scrollTo({ top, behavior: 'auto' });
  }
};

// pageshow 콜백
const setPageShowCallback = ((browserName) => {
  const isSafari = browserName && -1 < browserName.toLowerCase().indexOf('safari');
  let timePageShowTimeout = 0;
  return (navigationType) => {
    console.log('setPageShowCallback', navigationType);
    window.clearTimeout(timePageShowTimeout);
    if (navigationType === 'bfcache') {
      setHistoryBFCache(true);
      setHistoryBFCacheScroll();
      window.location.reload();
    } else {
      timePageShowTimeout = window.setTimeout(
        () => {
          setWindowScroll(navigationType);
        },
        isSafari ? 350 : 0,
      ); // Next.js Route 실행으로 페이지 최상단 이동되는 것 이후 실행 (사파리 등에서 Next routeChangeStart, routeChangeComplete 등 실행됨)
    }
  };
})(getBrowserName());

// DOM Ready 콜백
const setDOMReadyCallback = () => {
  setWindowScroll(getNavigationType());
};

// 사용자 터치가 발생하면, 히스토리 스크롤 이동 정지
const setUserTouchListener = (event) => {
  //console.log(event);
  isPageShowCallbackCancel(setPageShowCallback);
  isDOMReadyCallbackCancel(setDOMReadyCallback);
};
const setUserTouchWatch = (listener) => {
  window.document?.body?.removeEventListener('touchstart', listener);
  window.document?.body?.removeEventListener('touchmove', listener);
  window.document?.body?.addEventListener('touchstart', listener, { once: true });
  window.document?.body?.addEventListener('touchmove', listener, { once: true });
};

// 히스토리
const setHistoryPageListener = ((browserName) => {
  // 클로저 - node js 에서 메모리 누수에 주의!
  const isSafari = browserName && -1 < browserName.toLowerCase().indexOf('safari');
  let timeHistoryPageInterval = 0;
  return (event) => {
    // 브라우저 스크롤값 저장
    setHistoryWindowScroll();
    // 사파리에서는 BFCache 에 기존 JavaScript 코드가 실행되지 않는다.
    // 페이지 떠나기 전 인터벌 실행이 캐쉬되도록 한다.
    if (isSafari) {
      setHistoryLocation();
      window.clearInterval(timeHistoryPageInterval);
      timeHistoryPageInterval = window.setInterval(() => {
        console.log('display history interval!!!!!');
        window.clearInterval(timeHistoryPageInterval);
        getNavigationType(setPageShowCallback);
      });
    }
  };
})(getBrowserName());
const setHistoryPage = (listener) => {
  // 사용자가 페이지를 떠날 때
  // unload (beforeunload 이벤트는 제외) 사용하지 않은 이유 : 브라우저는 페이지에 unload 이벤트 리스너가 추가되어 있는 경우, bfcache에 적합하지 않은 페이지로 판단하는 경우가 많다.
  window.removeEventListener('pagehide', listener);
  window.addEventListener('pagehide', listener), { once: true };
};
const setHistoryCheck = (browserName) => {
  console.log('setHistoryCheck', browserName);
  const isSafari = browserName && -1 < browserName.toLowerCase().indexOf('safari');
  if (isSafari) {
    // safari BFCache 확인 - 콜백
    getNavigationType(setPageShowCallback);
  } else {
    // 일반 브라우저 확인
    isDOMReadyCallback(setDOMReadyCallback);
  }
  // 사용자 터치 감시
  setUserTouchWatch(setUserTouchListener);
};
const setHistoryRouter = (path=window.location.href?.split('?')?.shift()?.split('/')?.pop() || '') => {
    setHistoryCheck(getBrowserName());
    setHistoryPage(setHistoryPageListener);
};

//
setHistoryRouter();