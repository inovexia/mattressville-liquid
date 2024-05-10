let $lgSwiper = document.getElementById('lg-swiper');
var swiper = new Swiper('.mySwiperSmall', {
    spaceBetween: 10,
    freeMode: true,
    watchSlidesProgress: true,
});
var swiper2 = new Swiper('.mySwiperMain', {
    spaceBetween: 10,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    thumbs: {
        swiper: swiper,
    },
    // Init lightGallery ince swiper is initilized
    on: {
        init: function () {
            const lg = lightGallery($lgSwiper);

            // Before closing lightGallery, make sure swiper slide
            // is aligned with the lightGallery active slide
            $lgSwiper.addEventListener('lgBeforeClose', () => {
                swiper.slideTo(lg.index, 0);
            });
        },
    },
});
