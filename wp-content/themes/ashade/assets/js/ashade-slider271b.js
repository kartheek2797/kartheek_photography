/** 
 * Author: Shadow Themes
 * Author URL: http://shadow-themes.com
 */
"use strict";

let ashade_slider = {
	isDown: false,
	isAnimate: false,
	$el: jQuery('.ashade-albums-slider'),
	type: 'simple',
	indexPrev: 0,
	indexActive: 1,
	indexNext: 2,
	target: 0,
	direction: 'init',
	isTouch: false,
	drag: {
		start : 0,
		start_pos : 0,
		current : 0,
		path: 0,
		imgPrev : 0,
		imgActive : 0,
		imgNext : 0,
		percent: 0
	},
	vimeoPlayer: Array(),
	youtubePlayer: Array(),
	init_YT: function() {
		// Init Youtube videos
		ashade_slider.$el.find('.ashade-album-item__embed--youtube').each(function() {
			let $this = jQuery(this),
				video_id = $this.data('video-id'),
				array_id = video_id,
				$player = jQuery('<div class="ashade-slide-player"/>').appendTo($this);
			
			if ( $this.parent().hasClass('is-copy') )
				array_id = array_id + '-copy';
			
			ashade_slider.youtubePlayer[array_id] = new YT.Player($player[0], {
				width   : '1920',
				height  : '1080',
				videoId : video_id,
				events  : {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				},
				playerVars : {
					autoplay    : 0,
					controls    : 0,
					disablekb   : 1,
					enablejsapi : 1,
					fs          : 0,
					loop        : 1,
					origin      : window.location.href,
					rel         : 0,
					showinfo    : 0,
					modestbranding : 0,
					mute : 1
				}
			});
			
			ashade_slider.youtubePlayer[array_id].inView = false;
			
			function onPlayerReady(event) {
				if ( $this.parent().hasClass('is-active') ) {
					ashade_slider.youtubePlayer[array_id].inView = true;
					ashade_slider.youtubePlayer[array_id].playVideo();
				} else {
					ashade_slider.youtubePlayer[array_id].pauseVideo();
				}
			}
			function onPlayerStateChange(event) {
				if (event.data !== YT.PlayerState.PLAYING && ashade_slider.youtubePlayer[array_id].inView) {
					if ( typeof ashade_slider.youtubePlayer[array_id] !== 'undefined' && ashade_slider.youtubePlayer[array_id].playVideo instanceof Function ) {
						ashade_slider.youtubePlayer[array_id].playVideo();
					}
				}
				if (event.data == YT.PlayerState.PLAYING && !ashade_slider.youtubePlayer[array_id].inView) {
					if ( typeof ashade_slider.youtubePlayer[array_id] !== 'undefined' && ashade_slider.youtubePlayer[array_id].pauseVideo instanceof Function ) {
						ashade_slider.youtubePlayer[array_id].pauseVideo();
					}
				}
			}
		});
	},
	init_Vimeo: function() {
		// Init Vimeo videos
		ashade_slider.$el.find('.ashade-album-item__embed--vimeo').each(function() {
			let $this = jQuery(this),
				video_id = $this.data('video-id'),
				array_id = video_id,
				$player = jQuery('<div class="ashade-slide-player"/>').appendTo($this);
			
			if ( $this.parent().hasClass('is-copy') )
				array_id = array_id + '-copy';
			
			ashade_slider.vimeoPlayer[array_id] = new Vimeo.Player( $player[0], {
				id       : video_id,
				width    : 1920,
				height   : 1080,
				autoplay : false,
				controls : false,
				loop     : true,
				muted    : true,
				portrait : false,
				title    : false,
				byline   : false,
				playsinline : true,
				autopause   : false
			});
			
			if ( $this.parent().hasClass('is-active') ) {
				ashade_slider.vimeoPlayer[array_id].play();
			}
		});
	},
	init: function() {
		// Update Options
		if (ashade_slider.$el.hasClass('is-parallax')) 
			ashade_slider.type = 'parallax';
		if (ashade_slider.$el.hasClass('is-fade'))  {
			ashade_slider.type = 'fade';
			ashade_slider.itemsCount = (ashade_slider.$el.find('.ashade-album-item').length - 1);
			ashade_slider.indexPrev = ashade_slider.itemsCount;
			ashade_slider.indexActive = 0;
			ashade_slider.indexNext = 1;
		} else {
			ashade_slider.itemsCount = (ashade_slider.$el.find('.ashade-album-item').length + 1);
		}
		
		if ( ashade_slider.$el.find('.ashade-album-item').length == 1 ) {
			ashade_slider.is_single = true;
			ashade_slider.$el.parent().addClass('is-single');
			ashade_slider.$el.find('.ashade-album-item').removeClass('is-prev').removeClass('is-next').addClass('is-active');
		} else {
			ashade_slider.is_single = false;
		}

		// Set Images
		ashade_slider.$el.find('[data-src]').each(function() {
			jQuery(this).css('background-image', 'url('+ jQuery(this).data('src') +')');
		});

		// Append Last slide as First
		if ( ! ashade_slider.is_single ) {
			if (ashade_slider.type !== 'fade') {
				var $first_slide = ashade_slider.$el.find('.ashade-album-item:first-child').clone(),
					$last_slide = ashade_slider.$el.find('.ashade-album-item:last-child').clone();
				$first_slide.addClass('is-copy').appendTo(ashade_slider.$el);
				$last_slide.addClass('is-copy').prependTo(ashade_slider.$el);
				ashade_slider.$el.css('transform', 'translate(-'+ $ashade_window.width()+'px, 0px)');
			} else {
				ashade_slider.$el.find('.ashade-album-item__image').css('transform', 'scale(1.05)');
				ashade_slider.$el.find('.ashade-album-item').css('opacity', '0');
			}

			// Bind Mouse Actions
			ashade_slider.$el.on('mousedown', function(e) {
				e.preventDefault();
				if (ashade_slider.isTouch) {
					ashade_slider.isTouch = false;
				}
				if (!ashade_slider.isAnimate) {
					ashade_slider.isDown = true;
					ashade_slider.drag.start = e.clientX;
					if (ashade_slider.type !== 'fade') {
						let posMatrix = ashade_slider.$el.css('transform').split(',');
						ashade_slider.drag.start_pos = parseInt(posMatrix[4], 10);
					}
				}
			}).on('mouseup', function() {
				ashade_slider.isDown = false;
				ashade_slider.action.dragBreak();
			}).on('mouseleave', function() {
				ashade_slider.isDown = false;
				ashade_slider.action.dragBreak();
			}).on('mousemove', function(e) {
				e.preventDefault();
				if (ashade_slider.isDown) {
					if (ashade_slider.type == 'fade') {
						// Fade Movement
						ashade_slider.drag.current = ashade_slider.drag.start - e.clientX;
						ashade_slider.drag.percent = parseFloat(ashade_slider.drag.current/$ashade_window.width()).toFixed(2);
						if (ashade_slider.drag.percent < 0) {
							ashade_slider.drag.path = 'prev';
							ashade_slider.drag.percent = -1*ashade_slider.drag.percent;
							let zoom_prev = 1.05 - (ashade_slider.drag.percent*0.05);
							ashade_slider.$el_prev.css('opacity', ashade_slider.drag.percent);
							ashade_slider.$prevImage.css('transform', 'scale('+ zoom_prev +')');
						} else {
							ashade_slider.drag.path = 'next';
							let zoom_next = 1.05 - (ashade_slider.drag.percent*0.05);
							ashade_slider.$el_next.css('opacity', ashade_slider.drag.percent);
							ashade_slider.$nextImage.css('transform', 'scale('+ zoom_next +')');
						}
						let zoom_active = 1+(ashade_slider.drag.percent*0.05);
						ashade_slider.$el_active.css('opacity', 1-ashade_slider.drag.percent);
						ashade_slider.$activeImage.css('transform', 'scale('+ zoom_active +')');
					} else {
						// Slide Movement
						ashade_slider.drag.current = ashade_slider.drag.start - e.clientX;
						ashade_slider.drag.path = ashade_slider.drag.start_pos - ashade_slider.drag.current;

						if (ashade_slider.type == 'parallax') {
							ashade_slider.drag.imgPrev = $ashade_window.width()/2 + ashade_slider.drag.current/2,
							ashade_slider.drag.imgActive = ashade_slider.drag.current/2,
							ashade_slider.drag.imgNext = -1*($ashade_window.width()/2 - ashade_slider.drag.current/2);

							ashade_slider.$prevImage.css('transform', 'translateX(' + ashade_slider.drag.imgPrev + 'px)');
							ashade_slider.$activeImage.css('transform', 'translateX(' + ashade_slider.drag.imgActive + 'px)');
							ashade_slider.$nextImage.css('transform', 'translateX(' + ashade_slider.drag.imgNext + 'px)');
						}

						ashade_slider.$el.css('transform', 'translate('+ ashade_slider.drag.path +'px, 0px)');
					}
				}
			});

			// Bind Touch Events
			ashade_slider.$el[0].addEventListener('touchstart', function(e) {
				if (!ashade_slider.isTouch) {
					ashade_slider.isTouch = true;
				}
				if (!ashade_slider.isAnimate) {
					ashade_slider.isDown = true;
					ashade_slider.drag.start = e.touches[0].clientX;
					if (ashade_slider.type !== 'fade') {
						let posMatrix = ashade_slider.$el.css('transform').split(',');
						ashade_slider.drag.start_pos = parseInt(posMatrix[4], 10);
					}
				}
			}, false);
			ashade_slider.$el[0].addEventListener('touchmove', function(e) {
				e.preventDefault();
				if (ashade_slider.isDown) {
					if (ashade_slider.type == 'fade') {
						// Fade Movement
						ashade_slider.drag.current = ashade_slider.drag.start - e.touches[0].clientX;
						ashade_slider.drag.percent = parseFloat(ashade_slider.drag.current/$ashade_window.width()).toFixed(2);
						if (ashade_slider.drag.percent < 0) {
							ashade_slider.drag.path = 'prev';
							ashade_slider.drag.percent = -1*ashade_slider.drag.percent;
							let zoom_prev = 1.05 - (ashade_slider.drag.percent*0.05);
							ashade_slider.$el_prev.css('opacity', ashade_slider.drag.percent);
							ashade_slider.$prevImage.css('transform', 'scale('+ zoom_prev +')');
						} else {
							ashade_slider.drag.path = 'next';
							let zoom_next = 1.05 - (ashade_slider.drag.percent*0.05);
							ashade_slider.$el_next.css('opacity', ashade_slider.drag.percent);
							ashade_slider.$nextImage.css('transform', 'scale('+ zoom_next +')');
						}
						let zoom_active = 1+(ashade_slider.drag.percent*0.05);
						ashade_slider.$el_active.css('opacity', 1-ashade_slider.drag.percent);
						ashade_slider.$activeImage.css('transform', 'scale('+ zoom_active +')');
					} else {
						// Slide Movement
						ashade_slider.drag.current = ashade_slider.drag.start - e.touches[0].clientX;
						ashade_slider.drag.path = ashade_slider.drag.start_pos - ashade_slider.drag.current;

						if (ashade_slider.type == 'parallax') {
							ashade_slider.drag.imgPrev = $ashade_window.width()/2 + ashade_slider.drag.current/2,
							ashade_slider.drag.imgActive = ashade_slider.drag.current/2,
							ashade_slider.drag.imgNext = -1*($ashade_window.width()/2 - ashade_slider.drag.current/2);

							ashade_slider.$prevImage.css('transform', 'translateX(' + ashade_slider.drag.imgPrev + 'px)');
							ashade_slider.$activeImage.css('transform', 'translateX(' + ashade_slider.drag.imgActive + 'px)');
							ashade_slider.$nextImage.css('transform', 'translateX(' + ashade_slider.drag.imgNext + 'px)');
						}

						ashade_slider.$el.css('transform', 'translate('+ ashade_slider.drag.path +'px, 0px)');
					}
				}			
			}, false);
			ashade_slider.$el[0].addEventListener('touchend', function(e) {
				ashade_slider.isDown = false;
				ashade_slider.action.dragBreak();			
			}, false);

			// Bind Button Events
			ashade_slider.$el.parent().find('a.ashade-slider-prev').on('click', function() {
				if (!ashade_slider.isAnimate) {
					ashade_slider.action.from = 'button';
					ashade_slider.action.prev();
				}
			});
			ashade_slider.$el.parent().find('a.ashade-slider-next').on('click', function() {
				if (!ashade_slider.isAnimate) {
					ashade_slider.action.from = 'button';
					ashade_slider.action.next();
				}
			});
			// Bind Keyboard Controls
			jQuery(document).on('keyup', function(e) {
				switch(e.keyCode) {
					  case 39:  // 'Right Arrow' Key
						if (!ashade_slider.isAnimate) {
							ashade_slider.action.from = 'button';
							ashade_slider.action.next();
						}
					break;
					  case 37:  // 'Left Arrow' Key
						if (!ashade_slider.isAnimate) {
							ashade_slider.action.from = 'button';
							ashade_slider.action.prev();
						}
					break;

					  default:
					break;
				}
			});

			// Bind Mouse Wheel Control
			ashade_slider.$el[0].addEventListener('wheel', ashadeMouseWheel);
			function ashadeMouseWheel(e) {
				if (!ashade_slider.isAnimate) {
					if (e.deltaY > 0) {
						ashade_slider.action.from = 'button';
						ashade_slider.action.next();
					}		
					if (e.deltaY < 0) {
						ashade_slider.action.from = 'button';
						ashade_slider.action.prev();
					}		
				}
			}
		}

		// Layout
		ashade_slider.layout();

		jQuery(window).on('load', function(){
			ashade_slider.layout();
		}).on('resize', function(){
			ashade_slider.layout();
		});		
	},
	layout: function() {
		if (ashade_slider.type !== 'fade') {
			let setWidth = $ashade_window.width()*ashade_slider.itemsCount;
			ashade_slider.$el.width(setWidth);
		}
		if ( ! ashade_slider.is_single ) {
			ashade_slider.action.from = 'layout';
			ashade_slider.action.set();
		}
	},
	action: {
		from: '',
		dragBreak: function() {
			if (ashade_slider.type == 'fade') {
				if (ashade_slider.drag.percent > 0.25) {
					ashade_slider.action.from = 'slide';
					if (ashade_slider.drag.path == 'prev') {
						ashade_slider.action.prev();
					} else {
						ashade_slider.action.next();
					}
				} else if(ashade_slider.drag.percent !== 0) {
					ashade_slider.action.from = 'layout';
					ashade_slider.action.set();
				}
				ashade_slider.drag.percent = 0;
			} else {
				if (ashade_slider.drag.current > 100) {
					ashade_slider.action.from = 'slide';
					ashade_slider.action.next();
				} else if (ashade_slider.drag.current < -100) {
					ashade_slider.action.from = 'slide';
					ashade_slider.action.prev();
				} else if (ashade_slider.drag.current !== 0) {
					ashade_slider.action.from = 'layout';
					ashade_slider.action.set();
				}
			}
			ashade_slider.drag.percent = ashade_slider.drag.current = 0;

		},
		next : function() {
			ashade_slider.indexPrev++,
			ashade_slider.indexActive++,
			ashade_slider.indexNext++;
			ashade_slider.direction = 'next';

			if (ashade_slider.indexPrev > ashade_slider.itemsCount) {
				ashade_slider.indexPrev = 0;
			}
			if (ashade_slider.indexActive > ashade_slider.itemsCount) {
				ashade_slider.indexActive = 0;
			}
			if (ashade_slider.indexNext > ashade_slider.itemsCount) {
				ashade_slider.indexNext = 0;
			}
			ashade_slider.action.set();
		},
		prev : function() {
			ashade_slider.indexPrev--,
			ashade_slider.indexActive--,
			ashade_slider.indexNext--;
			ashade_slider.direction = 'prev';

			if (ashade_slider.indexPrev < 0 ) {
				ashade_slider.indexPrev = ashade_slider.itemsCount;
			}
			if (ashade_slider.indexActive < 0) {
				ashade_slider.indexActive = ashade_slider.itemsCount;
			}
			if (ashade_slider.indexNext < 0) {
				ashade_slider.indexNext = ashade_slider.itemsCount;
			}		
			ashade_slider.action.set();
		},
		set : function() {
			ashade_slider.isAnimate = true;

			if (ashade_slider.type == 'fade') {
				// Fading Layout Set
				ashade_slider.$el_prev = ashade_slider.$el.find('.ashade-album-item').eq(ashade_slider.indexPrev);
				ashade_slider.$el_active = ashade_slider.$el.find('.ashade-album-item').eq(ashade_slider.indexActive);
				ashade_slider.$el_next = ashade_slider.$el.find('.ashade-album-item').eq(ashade_slider.indexNext);

				ashade_slider.$prevImage = ashade_slider.$el_prev.find('.ashade-album-item__image');
				ashade_slider.$activeImage = ashade_slider.$el_active.find('.ashade-album-item__image');
				ashade_slider.$nextImage = ashade_slider.$el_next.find('.ashade-album-item__image');

				ashade_slider.$el.find('.is-prev').removeClass('is-prev');
				ashade_slider.$el.find('.is-active').removeClass('is-active');
				ashade_slider.$el.find('.is-next').removeClass('is-next');

				ashade_slider.$el_prev.addClass('is-prev');
				ashade_slider.$el_active.addClass('is-active');
				ashade_slider.$el_next.addClass('is-next');

				let slideEasing = Power1.easeInOut,
					startOpacity = 0,
					startOpacityInactive = 1,
					startScale = 1.05,
					startScaleInactive = 1,
					$inActive = (ashade_slider.direction == 'next' ? ashade_slider.$el_prev : ashade_slider.$el_next),
					$inActiveImage = (ashade_slider.direction == 'next' ? ashade_slider.$prevImage : ashade_slider.$nextImage);

				if (ashade_slider.action.from == 'slide') {
					slideEasing = Power1.easeOut;
					startOpacity = parseFloat(ashade_slider.$el_active.css('opacity'));
					startOpacityInactive = parseFloat($inActive.css('opacity'));
					let scaleMatrix = ashade_slider.$activeImage.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
					startScale = parseFloat(scaleMatrix[0]);
					scaleMatrix = $inActiveImage.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
					startScaleInactive = parseFloat(scaleMatrix[0]);
				}
				if (ashade_slider.action.from == 'layout') {
					$inActive = (ashade_slider.drag.path == 'next' ? ashade_slider.$el_next : ashade_slider.$el_prev),
					$inActiveImage = (ashade_slider.drag.path == 'next' ? ashade_slider.$nextImage : ashade_slider.$prevImage);
					startOpacity = parseFloat(ashade_slider.$el_active.css('opacity'));
					startOpacityInactive = parseFloat($inActive.css('opacity'));
					let scaleMatrix = ashade_slider.$activeImage.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
					startScale = parseFloat(scaleMatrix[0]);
					scaleMatrix = $inActiveImage.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
					startScaleInactive = parseFloat(scaleMatrix[0]);
				}

				gsap.fromTo(ashade_slider.$el_active, 
				{
					css: {
						opacity: startOpacity
					}
				},
				{
					css: {
						opacity: 1
					},
					duration: 1,
					ease: slideEasing,
					onComplete: function() {
						ashade_slider.action.from = '';
						ashade_slider.isAnimate = false;
					}
				});
				gsap.fromTo(ashade_slider.$activeImage, 
				{
					scale: startScale
				},
				{
					scale: 1,
					duration: 1,
					ease: slideEasing,
				});
				gsap.fromTo($inActive, {
					css: {
						opacity: startOpacityInactive
					}
				},
				{
					css: {
						opacity: 0,
					},
					duration: 1,
					ease: slideEasing
				});
				gsap.fromTo($inActiveImage,{
					scale: startScaleInactive
				},
				{
					scale: 1.05,
					duration: 1,
					ease: slideEasing
				});
			} else {
				// Sliding Layout Set
				if (ashade_slider.action.from == 'button') {
					if (ashade_slider.direction == 'next' && ashade_slider.indexActive == ashade_slider.itemsCount) {
						ashade_slider.indexPrev = 0;
						ashade_slider.indexActive = 1;
						ashade_slider.indexNext = 2;
						ashade_slider.$el.css('transform', 'translate(0px, 0px)');
					}
					if (ashade_slider.direction == 'prev' && ashade_slider.indexActive == 0) {
						ashade_slider.indexPrev = ashade_slider.itemsCount - 2;
						ashade_slider.indexActive = ashade_slider.itemsCount - 1;
						ashade_slider.indexNext = ashade_slider.itemsCount;
						ashade_slider.$el.css('transform', 'translate(-'+ $ashade_window.width()*ashade_slider.itemsCount +'px, 0px)');
					}
				}

				ashade_slider.target = $ashade_window.width()*ashade_slider.indexActive;

				ashade_slider.$el_prev = ashade_slider.$el.find('.ashade-album-item').eq(ashade_slider.indexPrev);
				ashade_slider.$el_active = ashade_slider.$el.find('.ashade-album-item').eq(ashade_slider.indexActive);
				ashade_slider.$el_next = ashade_slider.$el.find('.ashade-album-item').eq(ashade_slider.indexNext);

				if (ashade_slider.type == 'parallax') {
					ashade_slider.$prevImage = ashade_slider.$el_prev.find('.ashade-album-item__image');
					ashade_slider.$activeImage = ashade_slider.$el_active.find('.ashade-album-item__image');
					ashade_slider.$nextImage = ashade_slider.$el_next.find('.ashade-album-item__image');
				}

				let posMatrix = ashade_slider.$el.css('transform').split(',');

				let slideEasing = Power2.easeInOut;
				if (ashade_slider.action.from == 'slide') {
					slideEasing = Power2.easeOut
				}
				if (ashade_slider.type == 'parallax') {
					// Images Parallax Effect
					if (ashade_slider.direction == 'next' && ashade_slider.action.from !== 'layout') {
						if (ashade_slider.drag.imgNext !== 0) {
							var active_from = ashade_slider.drag.imgNext;
						} else {
							var active_from = -1*$ashade_window.width()/2;
						}
						if (ashade_slider.drag.imgActive !== 0) {
							var prev_from = ashade_slider.drag.imgActive;
						} else {
							var prev_from = 0;
						}
						gsap.fromTo(ashade_slider.$activeImage, {
							x: active_from,
							duration: 1,
							ease: slideEasing
						},{
							x: 0,
							duration: 1,
							ease: slideEasing,
						});
						gsap.fromTo(ashade_slider.$prevImage, {
							x: prev_from,
							duration: 1,
							ease: slideEasing,
						},{
							x: $ashade_window.width()/2,
							duration: 1,
							ease: slideEasing
						});
					}
					if (ashade_slider.direction == 'prev' && ashade_slider.action.from !== 'layout') {
						if (ashade_slider.drag.imgNext !== 0) {
							var active_from = ashade_slider.drag.imgPrev;
						} else {
							var active_from = $ashade_window.width()/2;
						}
						if (ashade_slider.drag.imgActive !== 0) {
							var next_from = ashade_slider.drag.imgActive;
						} else {
							var next_from = 0;
						}
						gsap.fromTo(ashade_slider.$activeImage, {
							x: active_from,
							duration: 1,
							ease: slideEasing
						},{
							x: 0,
							duration: 1,
							ease: slideEasing,
						});
						gsap.fromTo(ashade_slider.$nextImage, {
							x: next_from,
							duration: 1,
							ease: slideEasing
						},{
							x: -$ashade_window.width()/2,
							duration: 1,
							ease: slideEasing,
						});
					}
					if (ashade_slider.action.from == 'layout') {
						gsap.to(ashade_slider.$prevImage, {
							x: $ashade_window.width()/2,
							duration: 1,
							ease: slideEasing,
						});
						gsap.to(ashade_slider.$activeImage, {
							x: 0,
							duration: 1,
							ease: slideEasing,
						});
						gsap.to(ashade_slider.$nextImage, {
							x: -$ashade_window.width()/2,
							duration: 1,
							ease: slideEasing,
						});
					}
				}
				gsap.fromTo(ashade_slider.$el, 
				{
					x: parseInt(posMatrix[4], 10)
				},
				{
					x: -ashade_slider.target,
					duration: 1,
					ease: slideEasing,
					onComplete: function() {
						if (ashade_slider.action.from == 'slide') {
							if (ashade_slider.direction == 'next' && ashade_slider.indexActive == ashade_slider.itemsCount) {
								ashade_slider.indexPrev = 0;
								ashade_slider.indexActive = 1;
								ashade_slider.indexNext = 2;
								ashade_slider.$el.css('transform', 'translate(-'+ $ashade_window.width() +'px, 0px)');
								ashade_slider.isAnimate = false;
							}
							if (ashade_slider.direction == 'prev' && ashade_slider.indexActive == 0) {
								ashade_slider.indexPrev = ashade_slider.itemsCount - 2;
								ashade_slider.indexActive = ashade_slider.itemsCount - 1;
								ashade_slider.indexNext = ashade_slider.itemsCount;
								ashade_slider.$el.css('transform', 'translate(-'+ $ashade_window.width()*(ashade_slider.itemsCount-1) +'px, 0px)');
							}
						}

						ashade_slider.$el_prev = ashade_slider.$el.find('.ashade-album-item').eq(ashade_slider.indexPrev);
						ashade_slider.$el_active = ashade_slider.$el.find('.ashade-album-item').eq(ashade_slider.indexActive);
						ashade_slider.$el_next = ashade_slider.$el.find('.ashade-album-item').eq(ashade_slider.indexNext);

						if (ashade_slider.type == 'parallax') {
							ashade_slider.$prevImage = ashade_slider.$el_prev.find('.ashade-album-item__image');
							ashade_slider.$activeImage = ashade_slider.$el_active.find('.ashade-album-item__image');
							ashade_slider.$nextImage = ashade_slider.$el_next.find('.ashade-album-item__image');

							ashade_slider.$prevImage.css('transform', 'translateX(0)');
							ashade_slider.$activeImage.css('transform', 'translateX(0)');
							ashade_slider.$nextImage.css('transform', 'translateX(0)');
						}

						ashade_slider.$el.find('.is-prev').removeClass('is-prev');
						ashade_slider.$el.find('.is-active').removeClass('is-active');
						ashade_slider.$el.find('.is-next').removeClass('is-next');

						ashade_slider.$el_prev.addClass('is-prev');
						ashade_slider.$el_active.addClass('is-active');
						ashade_slider.$el_next.addClass('is-next');

						ashade_slider.action.from = '';
						ashade_slider.isAnimate = false;
					}
				});

				if (ashade_slider.type == 'parallax') {
					ashade_slider.drag.imgPrev = 0,
					ashade_slider.drag.imgActive = 0,
					ashade_slider.drag.imgNext = 0;
				}
			}
			
			// Video Play and Pause
			if ( ashade_slider.$el_active.children('.ashade-album-item__video').length ) {
				ashade_slider.$el_active.children('.ashade-album-item__video').children('video')[0].play();
			}
			if ( ashade_slider.$el_prev.children('.ashade-album-item__video').length ) {
				ashade_slider.$el_prev.children('.ashade-album-item__video').children('video')[0].pause();
			}
			if ( ashade_slider.$el_next.children('.ashade-album-item__video').length ) {
				ashade_slider.$el_next.children('.ashade-album-item__video').children('video')[0].pause();
			}
			
			if (ashade_slider.$el_active.hasClass('is-copy')) {
				ashade_slider.$el.find('.ashade-album-item.is-active').find('video')[0].play();
			}
			
			// Embed Videos
			let active_embed = {
				type: 'empty'
			};
			if ( ashade_slider.$el_active.children('.ashade-album-item__embed--youtube').length ) {
				active_embed.type = 'youtube';
				active_embed.id   = ashade_slider.$el_active.children('.ashade-album-item__embed--youtube').data('video-id');
			}
			if ( ashade_slider.$el_active.children('.ashade-album-item__embed--vimeo').length ) {
				active_embed.type = 'vimeo';
				active_embed.id   = ashade_slider.$el_active.children('.ashade-album-item__embed--vimeo').data('video-id');
			}
			if ( ashade_slider.$el.find('.ashade-album-item__embed--youtube').length ) {
				ashade_slider.$el.find('.ashade-album-item__embed--youtube').each(function() {
					let $this = jQuery(this),
						this_id = $this.data('video-id');
					if ( ashade_slider.youtubePlayer[this_id] && ashade_slider.youtubePlayer[this_id].playVideo instanceof Function ) {
						if ( 'youtube' == active_embed.type && this_id == active_embed.id ) {
							ashade_slider.youtubePlayer[this_id].inView = true;
							ashade_slider.youtubePlayer[this_id].playVideo();
						} else {
							ashade_slider.youtubePlayer[this_id].inView = false;
							ashade_slider.youtubePlayer[this_id].pauseVideo();
						}
					}
				});
			}
			if ( ashade_slider.$el.find('.ashade-album-item__embed--vimeo').length ) {
				ashade_slider.$el.find('.ashade-album-item__embed--vimeo').each(function() {
					let $this = jQuery(this),
						this_id = $this.data('video-id');
					if ( ashade_slider.vimeoPlayer[this_id] && ashade_slider.vimeoPlayer[this_id].play instanceof Function ) {
						if ( 'vimeo' == active_embed.type && this_id == active_embed.id ) {
							ashade_slider.vimeoPlayer[this_id].play();
						} else {
							ashade_slider.vimeoPlayer[this_id].pause();
						}
					}
				});
			}
		}
	},
};

// Init YouTube API
function onYouTubeIframeAPIReady() {
	if ( ashade_slider.$el.find('.ashade-album-item__embed--youtube').length ) {
		ashade_slider.init_YT();
	}
}

// Init Vimeo API
jQuery(document).ready(function() {
	if ( ashade_slider.$el.find('.ashade-album-item__embed--vimeo').length ) {
		if ( typeof Vimeo !== 'undefined' && Vimeo.Player instanceof Function ) {
			ashade_slider.init_Vimeo();
		}
	}
});

jQuery(document).on('click', '.ashade-video-unmute', function() {
    let $this = jQuery(this),
        $slide = $this.parent('div'),
        $wrap = $this.parents('div.ashade-albums-slider');
    if ( $this.hasClass('is-mutted') ) {
        $wrap.find('video').prop('muted', true);
        $wrap.find('.ashade-video-unmute').addClass('is-mutted');
        $slide.children('video').prop('muted', false);
        $this.removeClass('is-mutted');
    } else {
        $slide.children('video').prop('muted', true);
        $this.addClass('is-mutted');
    }
});