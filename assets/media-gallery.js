customElements.get("media-gallery")||customElements.define("media-gallery",class extends HTMLElement{constructor(){super(),this.elements={liveRegion:this.querySelector('[id^="GalleryStatus"]'),viewer:this.querySelector('[id^="GalleryViewer"]'),thumbnails:this.querySelector('[id^="GalleryThumbnails"]')},this.mql=window.matchMedia("(min-width: 750px)"),this.elements.thumbnails&&(this.elements.viewer.addEventListener("slideChanged",debounce(this.onSlideChanged.bind(this),500)),this.elements.thumbnails.querySelectorAll("[data-target]").forEach(mediaToSwitch=>{mediaToSwitch.querySelector("button").addEventListener("click",this.setActiveMedia.bind(this,mediaToSwitch.dataset.target,!1))}),this.dataset.desktopLayout.includes("thumbnail")&&this.mql.matches&&this.removeListSemantic())}onSlideChanged(event){const thumbnail=this.elements.thumbnails.querySelector(`[data-target="${event.detail.currentElement.dataset.mediaId}"]`);this.setActiveThumbnail(thumbnail)}setActiveMedia(mediaId,prepend){const activeMedia=this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`);if(this.elements.viewer.querySelectorAll("[data-media-id]").forEach(element=>{element.classList.remove("is-active")}),activeMedia.classList.add("is-active"),prepend){if(activeMedia.parentElement.prepend(activeMedia),this.elements.thumbnails){const activeThumbnail2=this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);activeThumbnail2.parentElement.prepend(activeThumbnail2)}this.elements.viewer.slider&&this.elements.viewer.resetPages()}if(this.preventStickyHeader(),window.setTimeout(()=>{this.elements.thumbnails&&activeMedia.parentElement.scrollTo({left:activeMedia.offsetLeft}),(!this.elements.thumbnails||this.dataset.desktopLayout==="stacked")&&activeMedia.scrollIntoView({behavior:"smooth"})}),this.playActiveMedia(activeMedia),!this.elements.thumbnails)return;const activeThumbnail=this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);this.setActiveThumbnail(activeThumbnail),this.announceLiveRegion(activeMedia,activeThumbnail.dataset.mediaPosition)}setActiveThumbnail(thumbnail){!this.elements.thumbnails||!thumbnail||(this.elements.thumbnails.querySelectorAll("button").forEach(element=>element.removeAttribute("aria-current")),thumbnail.querySelector("button").setAttribute("aria-current",!0),!this.elements.thumbnails.isSlideVisible(thumbnail,10)&&this.elements.thumbnails.slider.scrollTo({left:thumbnail.offsetLeft}))}announceLiveRegion(activeItem,position){const image=activeItem.querySelector(".product__modal-opener--image img");image&&(image.onload=()=>{this.elements.liveRegion.setAttribute("aria-hidden",!1),this.elements.liveRegion.innerHTML=window.accessibilityStrings.imageAvailable.replace("[index]",position),setTimeout(()=>{this.elements.liveRegion.setAttribute("aria-hidden",!0)},2e3)},image.src=image.src)}playActiveMedia(activeItem){window.pauseAllMedia();const deferredMedia=activeItem.querySelector(".deferred-media");deferredMedia&&deferredMedia.loadContent(!1)}preventStickyHeader(){this.stickyHeader=this.stickyHeader||document.querySelector("sticky-header"),this.stickyHeader&&this.stickyHeader.dispatchEvent(new Event("preventHeaderReveal"))}removeListSemantic(){this.elements.viewer.slider&&(this.elements.viewer.slider.setAttribute("role","presentation"),this.elements.viewer.sliderItems.forEach(slide=>slide.setAttribute("role","presentation")))}});
//# sourceMappingURL=/s/files/1/0558/6780/1757/t/19/assets/media-gallery.js.map?v=1725103455
