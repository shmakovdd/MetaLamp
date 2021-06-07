let parallax = (function () {
    let train = document.body.querySelector('.parallax2');
    let sky = document.body.querySelector('.parallax0');
    let mountains = document.body.querySelector('.parallax1')

    return {
        move: function(block, wScroll, ratio) {
            let style = block.style;
            let scrollSpeed = `${-(wScroll / ratio)}px`;
            let transformString = `translate3d(0, ${scrollSpeed}, 0)`;
            style.transform = transformString;

        },

        init: function (wScroll) {
            this.move(train, wScroll, 3),
            this.move(sky, wScroll, 100)
            this.move(mountains, wScroll, 10)
        }
    }
}())

window.onscroll = function () {
    let wScroll = window.pageYOffset;
    parallax.init(wScroll)
}