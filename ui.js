'use strict';

const ui = {
    connect(range, input, setter) {
        const changeHandler = val => {
            val = val.replace(',', '.');
            range.value = val;
            input.value = val;
            setter(val);
        }

        range.addEventListener('input', evt => changeHandler(evt.target.value));
        input.addEventListener('input', evt => changeHandler(evt.target.value));
    },


}



export default ui;