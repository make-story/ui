/**
 * Map, Set
 */

// Map 
const store = new Map();

/**
 * parent 제어
 */
export const initalItem = { // 인터페이스
    code: '', // 고유값
    text: '', // 그룹명
    list: [], // child 데이터 리스트
};
export const getItem = (code='') => {
    if(!code) {
        return;
    }
    return store.get(code);
};
export const setAppendItem = (code='', item={}) => {
    if(!code) {
        return;
    }
    !store.has(code) && store.set(code, { ...initalItem, ...item });
    console.log('store > setAppendItem', store.get(code));
};
export const setUpdateItem = (code='', item={}) => {
    if(!code) {
        return;
    }
    store.has(code) && store.set(code, { ...store.get(code), ...item }); 
    console.log('store > setUpdateItem', store.get(code));
};
export const setRemoveItem = (code='') => {
    if(!code) {
        return;
    }
    store.has(code) && store.delete(code);
    console.log('store > setRemoveItem', store.get(code));
};

/**
 * child list 제어
 */
export const initalListItem = { // 인터페이스
    code: '',  // 고유값
    text: '',  // 텍스트
    minute: 0, // 타이머 작동시 사용 : 분
    second: 0, // 타이머 작동시 사용 : 초
    timer: false, // 타이머 작동여부
    done: false, // 타이머 종료 여부
};
export const getListItem = (parentCode='', code='') => {
    if(!parentCode || !code) {
        return;
    }
    const parentData = getItem(parentCode);
    if(!parentData) {
        return;
    }
    const [ todoData ] = parentData.list.filter(value => value.code === code);
    return todoData;
};
export const setAppendListItem = (parentCode='', code='', item={}) => {
    if(!parentCode || !code) {
        return;
    }
    const parentData = getItem(parentCode);
    if(!parentData) {
        return;
    }
    parentData.list = [ ...parentData.list, { ...initalListItem, ...item } ];
    console.log('store > setAppendListItem', store.get(parentCode));
};
export const setUpdateListItem = (parentCode='', code='', item={}) => {
    if(!parentCode || !code) {
        return;
    }
    const todoData = getListItem(parentCode, code);
    if(!todoData) {
        return;
    }
    for(const key in item) {
        todoData[key] = item[key];
    }
    console.log('store > setUpdateListItem', store.get(parentCode));
};
export const setRemoveListItem = (parentCode='', code='') => {
    if(!parentCode || !code) {
        return;
    }
    const parentData = getItem(parentCode);
    if(!parentData) {
        return;
    }
    const index = parentData.list.findIndex(value => value.code === code);
    parentData.list.splice(index, 0 <= index ? 1 : 0);
    console.log('store > setRemoveListItem', store.get(parentCode));
};