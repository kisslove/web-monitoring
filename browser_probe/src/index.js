import _ from 'lodash';
import { uploadUserData } from './sendData';
// import {ah} from 'ajax-hook';
const ah = require('ajax-hook');
document.onload = function () {
    uploadUserData(1);
}

ah.hookAjax({
    //hook callbacks
    onreadystatechange: function (xhr) {
        console.log("onreadystatechange called: %O", xhr)
    },
    onload: function (xhr) {
        console.log("onload called: %O", xhr)
    },
    //hook function
    open: function (arg, xhr) {
        console.log("open called: method:%s,url:%s,async:%s", arg[0], arg[1], arg[2])
    }
});
