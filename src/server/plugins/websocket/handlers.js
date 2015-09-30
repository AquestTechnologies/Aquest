exports.hello = function () {

    this.emit('Hi back at you');
};

exports.newMessage = function (newMessage) {

    console.log('___ Got message', newMessage);
};

exports.goodbye = function () {

    this.emit('Take it easy, pal');
};