

class Test {
    constructor() {
        this.index = 1;
    }
    setA() {
        this.index += 1;
    }
    getB() {
        return this.index;
    }
}

const test = new Test();

export const getInstance = () => test;