exports.resJson = function(options) {
    var temp = new Object();
    temp.IsSuccess = options && options.IsSuccess || false;
    temp.Data = options && options.Data || [];
    return temp;
};