import {
  getNavigationType,
  setScrollRestoration,
  setHistoryWindowScroll,
  getHistoryWindowScroll,
  isBFCacheCallbackCancel
} from "../history";

// 스크롤 수동 제어 설정
setScrollRestoration("manual");

// 스크롤 이동
const setWindowScroll = navigationType => {
  let top = 0;
  if (navigationType === "reload_bfcache") {
    top = getHistoryBFCacheScroll().top;
  //} else if (["reload", "back_forward"].includes(navigationType)) {
  } else if (navigationType === 'back_forward') {
    top = getHistoryWindowScroll().top;
  } else {
    return;
  }
  console.log("setWindowScroll", navigationType, top);
  window.scrollTo({ top: Number(top) || 0, behavior: "auto" });
};

// BFCache 새로고침 전 스크롤값 저장
const HISTORY_AMORE_BFCACHE_SCROLL = "HISTORY_AMORE_BFCACHE_SCROLL";
const setHistoryBFCacheScroll = (key = HISTORY_AMORE_BFCACHE_SCROLL) => {
  window.sessionStorage.setItem(key, JSON.stringify(getHistoryWindowScroll()));
};
const getHistoryBFCacheScroll = () => {
  return JSON.parse(
    window.sessionStorage.getItem(HISTORY_AMORE_BFCACHE_SCROLL) || "{}"
  );
};
const setBFCacheCallback = navigationType => {
  console.log("setBFCacheCallback", navigationType);
  if (navigationType === "bfcache") {
    setHistoryBFCacheScroll();
    window.location.reload();
  } else {
    setWindowScroll(navigationType);
  }
};
const setPageshowCallback = () => {
  // pageshow 콜백
  getNavigationType(setBFCacheCallback);

  // 사용자 터치가 발생하면, 히스토리 스크롤 이동 정지
  const setHistoryWindowScrollStop = event => {
    //console.log(event);
    isBFCacheCallbackCancel(setBFCacheCallback);
  };
  window.document?.body?.removeEventListener(
    "touchstart",
    setHistoryWindowScrollStop
  );
  window.document?.body?.removeEventListener(
    "touchmove",
    setHistoryWindowScrollStop
  );
  window.document?.body?.addEventListener(
    "touchstart",
    setHistoryWindowScrollStop,
    { once: true }
  );
  window.document?.body?.addEventListener(
    "touchmove",
    setHistoryWindowScrollStop,
    { once: true }
  );
};

// 히스토리
const setHistoryCheck = (browserName = "") => {
  console.log('setHistoryCheck', browserName);
  
  // 브라우저 단위 분기 처리 - 사파리(BFCache)
  const isSafari =
    browserName && -1 < browserName.toLowerCase().indexOf("safari");
  if (isSafari) {
    // safari BFCache 확인 - 콜백
    setPageshowCallback();
  } else {
    // 일반 브라우저 확인
    setWindowScroll(getNavigationType());
  }

  // 사용자가 페이지를 떠날 때
  let timeInterval = 0;
  const setHistoryPage = (event) => {
    // 브라우저 스크롤값 저장
    setHistoryWindowScroll();
    // 사파리에서는 BFCache 에 기존 JavaScript 코드가 실행되지 않는다.
    // 페이지 떠나기 전 인터벌 실행이 캐쉬되도록 한다.
    if (isSafari) {
      window.clearInterval(timeInterval);
      timeInterval = window.setInterval(() => {
        setPageshowCallback();
        window.clearInterval(timeInterval);
      });
    }
  };
  window.removeEventListener('beforeunload', setHistoryPage);
  window.removeEventListener('pagehide', setHistoryPage);
  window.addEventListener('beforeunload', setHistoryPage, { once: true });
  window.addEventListener('pagehide', setHistoryPage), { once: true };
};
const setHistoryRouter = () => {
  // path
  setHistoryCheck("safari");
};
