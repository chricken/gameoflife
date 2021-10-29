'use strict';

const dom = {
    $(sel) {
        return document.querySelector(sel);
    },
    $$(sel) {
        return [...document.querySelectorAll(sel)];
    },
}

export default dom;
export let $ = dom.$;
export let $$ = dom.$$;