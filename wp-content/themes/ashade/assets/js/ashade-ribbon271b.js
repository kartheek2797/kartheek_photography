/** 
 * Author: Shadow Themes
 * Author URL: http://shadow-themes.com
 */
"use strict";
var ashade_ribbon = {};

ashade_ribbon = {
	$el: jQuery('.ashade-albums-carousel'),
	type: 'large',
	target: 0,
	current: 0,
	isDown: false,
	isDownLink: false,
	isLinkMoved: false,
	isTouch: false,
	isLocked: false,
	initTarget: 0,
	mozDelta: 33,
	currentStep: 0,
	maxStep: jQuery(window).width(),
	vimeoPlayer: Array(),
	youtubePlayer: Array(),
	
	// Scroll Speed Option for Touch Devices
	touchSpeed: {
		vertical: 2, // Speed factor for Vertical Ribbon
		horizontal: 2, // Speed factor for Horizontal Ribbon
	},
	
	tagetChanged: function() {
		if (ashade_ribbon.type == 'medium') {
			let percent = Math.ceil(ashade_ribbon.currentStep * 100 / (ashade_ribbon.maxStep));
			ashade_ribbon.barTarget = ashade_ribbon.$bar.width() * (percent/100);
		}
		if (ashade_ribbon.type == 'vertical') {
			if (ashade_ribbon.currentStep > $ashade_window.height()/2) {
				$ashade_body.addClass('has-to-top');
			} else {
				$ashade_body.removeClass('has-to-top');
			}
		}
	},

	init_YT: function() {
		// Init Youtube videos
		ashade_ribbon.$el.find('.ashade-slide-embed--youtube').each(function() {
			let $this = jQuery(this),
				$player = jQuery('<div class="ashade-slide-player"/>').appendTo($this),
				done = false;
			
			ashade_ribbon.youtubePlayer[$this.data('video-id')] = new YT.Player($player[0], {
				width   : '1920',
				height  : '1080',
				videoId : $this.data( 'video-id' ),
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
			
			ashade_ribbon.youtubePlayer[$this.data( 'video-id' )].inView = false;
			
			function onPlayerReady(event) {
				if ( $this.parent().hasClass('is-inview') ) {
					ashade_ribbon.youtubePlayer[$this.data( 'video-id' )].inView = true;
					event.target.playVideo();
				} else {
					event.target.pauseVideo();
				}
			}
			function onPlayerStateChange(event) {
				if (event.data !== YT.PlayerState.PLAYING && ashade_ribbon.youtubePlayer[$this.data( 'video-id' )].inView) {
					ashade_ribbon.youtubePlayer[$this.data( 'video-id' )].playVideo();
				}
				if (event.data == YT.PlayerState.PLAYING && !ashade_ribbon.youtubePlayer[$this.data( 'video-id' )].inView) {
					ashade_ribbon.youtubePlayer[$this.data( 'video-id' )].pauseVideo();
				}
			}
		});
	},
	
	init_Vimeo: function() {
		// Init Vimeo videos
		ashade_ribbon.$el.find('.ashade-slide-embed--vimeo').each(function() {
			let $this = jQuery(this),
				$player = jQuery('<div class="ashade-slide-player"/>').appendTo($this);
			
			ashade_ribbon.vimeoPlayer[$this.data('video-id')] = new Vimeo.Player( $player[0], {
				id       : $this.data('video-id'),
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
		});
	},
	
	init: function() {
		/* Determine Type */
		if (ashade_ribbon.$el.hasClass('is-medium')) {
			ashade_ribbon.$bar = ashade_ribbon.$el.parent().children('.ashade-albums-carousel-progress');
			ashade_ribbon.barTarget = 0;
			ashade_ribbon.barCurrent = 0;
			ashade_ribbon.type = 'medium';
		}		
		if (ashade_ribbon.$el.hasClass('is-vertical')) {
			ashade_ribbon.type = 'vertical';
		}

		/* Move Functions */
		// Mouse Events
		ashade_ribbon.$el.on('mousedown', function(e) {
			if (ashade_ribbon.isTouch) {
				ashade_ribbon.isTouch = false;
			}
			if (!ashade_ribbon.$el.hasClass('is-hovered')) {
				e.preventDefault();
				ashade_ribbon.isDown = true;
				ashade_ribbon.$el.addClass('is-grabbed');
				if (ashade_ribbon.type == 'vertical') {
					ashade_ribbon.old_pageX = e.clientY;
				} else {
					ashade_ribbon.old_pageX = e.clientX;
				}
			}
		}).on('mouseup', function() {
			ashade_ribbon.isDown = false;
			ashade_ribbon.$el.removeClass('is-grabbed');
			ashade_ribbon.isDownLink = false;
			setTimeout(function(){
				ashade_ribbon.$el.removeClass('is-moving');
			}, 30);
		}).on('mouseleave', function() {
			ashade_ribbon.isDown = false;
			ashade_ribbon.$el.removeClass('is-grabbed');
			ashade_ribbon.isDownLink = false;
			setTimeout(function(){
				ashade_ribbon.$el.removeClass('is-moving');
			}, 30);
		}).on('mousemove', function(e) {
			e.preventDefault();
			if (ashade_ribbon.isDown && ! ashade_ribbon.isCenter) {
				ashade_ribbon.$el.addClass('is-moving');
				if (ashade_ribbon.type == 'vertical') {
					let newX = (ashade_ribbon.old_pageX - e.clientY)*2,
						newTop = ashade_ribbon.currentStep + newX;
					ashade_ribbon.old_pageX = e.clientY;
					if (newTop > ashade_ribbon.maxStep) {
						newTop = ashade_ribbon.maxStep;
					}
					if (newTop < 0) {
						newTop = 0;
					}
					ashade_ribbon.currentStep = newTop;
					ashade_ribbon.target = newTop;
				} else {
					let newX = ashade_ribbon.old_pageX - e.clientX,
						newTop = ashade_ribbon.currentStep + newX;
					ashade_ribbon.old_pageX = e.clientX;
					if (newTop > ashade_ribbon.maxStep) {
						newTop = ashade_ribbon.maxStep;
					}
					if (newTop < 0) {
						newTop = 0;
					}
					ashade_ribbon.currentStep = newTop;
					ashade_ribbon.target = newTop;
				}
				ashade_ribbon.tagetChanged();
			}
			if (ashade_ribbon.isDownLink) {
				ashade_ribbon.isLinkMoved = true;
			} else {
				ashade_ribbon.isLinkMoved = false;
			}
		});
		
		ashade_ribbon.$el[0].addEventListener('wheel', function(e) {
			if (!ashade_ribbon.isCenter) {
				var this_delta = e.deltaY;
				if (e.mozInputSource) {
					this_delta = e.deltaY * ashade_ribbon.mozDelta;
				}
				let newTop = ashade_ribbon.currentStep + this_delta;
				if (newTop > ashade_ribbon.maxStep) {
					newTop = ashade_ribbon.maxStep;
				}
				if (newTop < 0) {
					newTop = 0;
				}
				ashade_ribbon.currentStep = newTop;
				ashade_ribbon.target = newTop;
				ashade_ribbon.tagetChanged();
			}
		});
		
		// Touch Events
		ashade_ribbon.$el[0].addEventListener('touchstart', function(e) {
			let $target = jQuery( e.target );
			ashade_ribbon.initTarget = ashade_ribbon.target;
			if (ashade_ribbon.type == 'vertical' && ashade_ribbon.target > 1 && ashade_ribbon.initTarget > 1  && !$target.is('a')) {
				e.preventDefault();
			}
			if (!ashade_ribbon.isTouch) {
				ashade_ribbon.isTouch = true;
			}
			ashade_ribbon.isDown = true;
			ashade_ribbon.$el.addClass('is-grabbed');
			if (ashade_ribbon.type == 'vertical') {
				ashade_ribbon.old_pageX = e.touches[0].clientY;
			} else {
				ashade_ribbon.old_pageX = e.touches[0].clientX;
			}
		}, false);
		ashade_ribbon.$el[0].addEventListener('touchmove', function(e) {
			if (!ashade_ribbon.isCenter) {
				if (ashade_ribbon.type == 'vertical' && ashade_ribbon.target > 1 && ashade_ribbon.initTarget > 1) {
					e.preventDefault();
				}
				if (ashade_ribbon.isDown) {
					ashade_ribbon.$el.addClass('is-moving');
					if (ashade_ribbon.type == 'vertical') {
						let newX = (ashade_ribbon.old_pageX - e.touches[0].clientY)*ashade_ribbon.touchSpeed.vertical,
							newTop = ashade_ribbon.currentStep + newX;
						ashade_ribbon.old_pageX = e.touches[0].clientY;
						if (newTop > ashade_ribbon.maxStep) {
							newTop = ashade_ribbon.maxStep;
						}
						if (newTop < 0) {
							newTop = 0;
						}
						ashade_ribbon.currentStep = newTop;
						ashade_ribbon.target = newTop;
					} else {
						let newX = (ashade_ribbon.old_pageX - e.touches[0].clientX)*ashade_ribbon.touchSpeed.horizontal,
							newTop = ashade_ribbon.currentStep + newX;

						ashade_ribbon.old_pageX = e.touches[0].clientX;
						if (newTop > ashade_ribbon.maxStep) {
							newTop = ashade_ribbon.maxStep;
						}
						if (newTop < 0) {
							newTop = 0;
						}
						ashade_ribbon.currentStep = newTop;
						ashade_ribbon.target = newTop;
					}
					ashade_ribbon.tagetChanged();
				}
				if (ashade_ribbon.isDownLink) {
					ashade_ribbon.isLinkMoved = true;
				} else {
					ashade_ribbon.isLinkMoved = false;
				}
			}
		}, false);
		ashade_ribbon.$el[0].addEventListener('touchend', function(e) {
			ashade_ribbon.isDown = false;
			ashade_ribbon.$el.removeClass('is-grabbed');
			ashade_ribbon.isDownLink = false;
			setTimeout(function(){
				ashade_ribbon.$el.removeClass('is-moving');
			}, 30);
		}, false);

		// Links and Buttons
		ashade_ribbon.$el.find('a.ashade-button').on('mouseover', function() {
			if (!ashade_ribbon.isTouch) {
				ashade_ribbon.$el.addClass('is-hovered');
			}
		}).on('mouseout', function(){
			ashade_ribbon.$el.removeClass('is-hovered');
		});
		
		ashade_ribbon.$el.find('a').on('mousedown', function() {
			ashade_ribbon.isDownLink = true;
		}).on('click', function(e) {
			if (ashade_ribbon.isLinkMoved) {
				e.preventDefault();
				return false;
			}
			ashade_ribbon.isDownLink = false;
			ashade_ribbon.isLinkMoved = false;
		});
		
		ashade_ribbon.$el.find('.ashade-album-item').each(function() {
			if ('IntersectionObserver' in window) {
				ashade_ribbon.observer.observe(this);
			} else {
				jQuery(this).children('.ashade-album-item__inner').addClass('is-inview');
			}
		});

		// Layout
		ashade_ribbon.layout();

		// Start Animation
		ashade_ribbon.animate();
		
		// Bind Window Actions
		jQuery(window).on('resize', function() {
			// Window Resize Actions
			ashade_ribbon.layout();
			setTimeout(ashade_ribbon.layout(), 500);
		}).on('load', function() {
			// Window Load Actions
			ashade_ribbon.layout();
		});
	},
	layout: function() {
		if ($ashade_body.hasClass('admin-bar')) {
			$ashade_body.height($ashade_window.height() - jQuery('#wpadminbar').height());
		} else {
			$ashade_body.height($ashade_window.height());
		}
		
		let $this = ashade_ribbon.$el,
			fullWidth = 0,
			setHeight;

		if (ashade_ribbon.type == 'large') {
			setHeight = $ashade_window.height() - $ashade_header.height() - $ashade_footer.height();
			if ($ashade_body.hasClass('admin-bar')) {
				setHeight = setHeight - jQuery('#wpadminbar').height();
			}
			$this.css('top', $ashade_header.height());
		}
		if (ashade_ribbon.type == 'medium') {
			setHeight = $ashade_window.height()/2;
		}

		if (ashade_ribbon.type == 'large' || ashade_ribbon.type == 'medium') {
			$this.height(setHeight).find('.ashade-album-item__title').width(setHeight);
			$this.find('.ashade-album-item').each(function() {
				let $this_slide = jQuery(this),
					$this_slide_img = $this_slide.find('img');

				if ($this_slide_img.attr('height') && $this_slide_img.attr('width')) {
					$this_slide.height(setHeight);
					let imgRatio = parseInt($this_slide_img.attr('width'), 10)/parseInt($this_slide_img.attr('height'), 10),
						setWidth = setHeight*imgRatio;

					$this_slide_img.height(setHeight).width(setWidth);
					fullWidth = fullWidth + $this_slide.width();
				} else {
					$this_slide.height(setHeight);
				}
			});
		}

		if (ashade_ribbon.type == 'vertical') {
			$this.find('.ashade-album-item').each(function() {
				let $this_slide = jQuery(this),
					$this_slide_img = $this_slide.find('img'),
					setHeight = $this_slide_img.height();

				$this_slide.find('.ashade-album-item__title').width(setHeight);

				fullWidth = fullWidth + $this_slide.height();
			});
			fullWidth = fullWidth + $ashade_header.height() + $ashade_footer.height();
			$this.css('padding', $ashade_header.height()+'px 0 ' + $ashade_footer.height() + 'px 0')
			$this.height(fullWidth);
		} else {
			$this.width(fullWidth);
		}

		if (ashade_ribbon.type == 'vertical') {
			let body_height = fullWidth;
			ashade_ribbon.maxStep = body_height - $ashade_window.height();
		} else {
			let spacingLeft = parseInt($this.find('.ashade-album-item__inner').css('margin-right'), 10),
				body_height = fullWidth - $ashade_window.width() + spacingLeft + $ashade_window.height();
			$this.css('padding-left', spacingLeft + 'px');
			ashade_ribbon.maxStep = body_height - $ashade_window.height();
		}
		
		let diff = 0;
		if (ashade_ribbon.type == 'vertical') {
			diff = ashade_ribbon.$el.parent().height() - ashade_ribbon.$el.height();
		} else {
			diff = ashade_ribbon.$el.parent().width() - ashade_ribbon.$el.width();
		}
		if ( diff > 0 ) {
			ashade_ribbon.isCenter = true;
			ashade_ribbon.$el.parent().addClass( 'is-centered' );
			ashade.cursor.$el.removeClass('int-grab-h int-grab-v');
			let tX = 0.5 * diff;
			ashade_ribbon.target = tX;
			ashade_ribbon.current = tX;
		} else {
			ashade_ribbon.isCenter = false;
			ashade_ribbon.$el.parent().removeClass( 'is-centered' );
			if (ashade_ribbon.currentStep > ashade_ribbon.maxStep) {
				ashade_ribbon.currentStep = ashade_ribbon.maxStep;
				ashade_ribbon.target = ashade_ribbon.currentStep;
			}
			if (ashade_ribbon.currentStep < 0) {
				ashade_ribbon.currentStep = 0;
				ashade_ribbon.target = ashade_ribbon.currentStep;
			}
		}
		ashade_ribbon.$el.find('.ashade-album-item__overlay').css('transform', 'translate3d(0, 0px, 0)');
		ashade_ribbon.$el.find('img').css('transform', 'translate3d(0, 0px, 0)');
	},
	animate: function() {
		let mover = (ashade_ribbon.target - ashade_ribbon.current) * 0.1,
				old = ashade_ribbon.current;
			
		if ( Math.floor(Math.abs(mover)) === 0 )
			mover = 0;
		
		ashade_ribbon.current += mover;
		
		if ( ashade_ribbon.current !== old ) {
			if (ashade_ribbon.type == 'vertical') {
				// Scroll Content
				if ( ashade_ribbon.isCenter ) {
					ashade_ribbon.$el.css('transform', 'translate3d(0, '+ ashade_ribbon.current +'px, 0)');
				} else {
					ashade_ribbon.$el.css('transform', 'translate3d(0, -'+ ashade_ribbon.current +'px, 0)');
				}
				// Img Motion Effect
				let img_current = mover;
				ashade_ribbon.$el.find('.ashade-album-item__overlay').css('transform', 'translate3d(0, '+ img_current +'px, 0)');
				ashade_ribbon.$el.find('img').css('transform', 'translate3d(0, '+ img_current +'px, 0)');
			} else {
				// Scroll Content
				if ( ashade_ribbon.isCenter ) {
					ashade_ribbon.$el.css('transform', 'translate3d('+ ashade_ribbon.current +'px, 0, 0)');
				} else {
					ashade_ribbon.$el.css('transform', 'translate3d(-'+ ashade_ribbon.current +'px, 0, 0)');
				}
				// Img Motion Effect
				let img_current = mover;
				ashade_ribbon.$el.find('.ashade-album-item__overlay').css('transform', 'translate3d('+ img_current +'px, 0, 0)');
				ashade_ribbon.$el.find('img').css('transform', 'translate3d('+ img_current +'px, 0, 0)');
				
				// Bar Update
				if (ashade_ribbon.type == 'medium') {
					ashade_ribbon.barCurrent += ((ashade_ribbon.barTarget - ashade_ribbon.barCurrent) * 0.1);
					ashade_ribbon.$bar.children('.ashade-albums-carousel-progress__bar').width(ashade_ribbon.barCurrent);
				}
			}
		}

		// Update Frame
		requestAnimationFrame( ashade_ribbon.animate );
	}
};

// Observer
if ('IntersectionObserver' in window) {
	ashade_ribbon.observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			let $entry = jQuery(entry.target);
			if(entry.isIntersecting) {
				// Add InView Class
				$entry.children('.ashade-album-item__inner').addClass('is-inview');
				if ($entry.data('type') == 'video') {
					// Play Video, if found
					if ( $entry.find('video').length ) {
						$entry.find('video')[0].play();
					}
					// Embed Videos Play
					if ($entry.find('.ashade-slide-embed').length) {
						let $embed = $entry.find('.ashade-slide-embed');
						// YouTube
						if ( $embed.hasClass('ashade-slide-embed--youtube')) {
							if ( ashade_ribbon.youtubePlayer[$embed.data('video-id')] ) {
								ashade_ribbon.youtubePlayer[$embed.data('video-id')].playVideo();
								ashade_ribbon.youtubePlayer[$embed.data('video-id')].inView = true;
							}
						}
						// Vimeo
						if ( $embed.hasClass('ashade-slide-embed--vimeo')) {
							if ( ashade_ribbon.vimeoPlayer[$embed.data('video-id')] ) {
								ashade_ribbon.vimeoPlayer[$embed.data('video-id')].play();
							}
						}
					}
				}
			} else {
				// Remove InView Class
				$entry.children('.ashade-album-item__inner').removeClass('is-inview');
				if ($entry.data('type') == 'video') {
					// Pause Video, if found
					if ( $entry.find('video').length ) {
						$entry.find('video')[0].pause();
					}
					// Embed Videos Play
					if ($entry.find('.ashade-slide-embed').length) {
						let $embed = $entry.find('.ashade-slide-embed');
						// YouTube
						if ( $embed.hasClass('ashade-slide-embed--youtube')) {
							if ( ashade_ribbon.youtubePlayer[$embed.data('video-id')] ) {
								ashade_ribbon.youtubePlayer[$embed.data('video-id')].inView = false;
								ashade_ribbon.youtubePlayer[$embed.data('video-id')].pauseVideo();
							}
						}
						// Vimeo
						if ( $embed.hasClass('ashade-slide-embed--vimeo')) {
							if ( ashade_ribbon.vimeoPlayer[$embed.data('video-id')] ) {
								ashade_ribbon.vimeoPlayer[$embed.data('video-id')].pause();
							}
						}
					}
				}
			}
		});
	});
}

// Init YouTube API
function onYouTubeIframeAPIReady() {
	if ( ashade_ribbon.$el.find('.ashade-slide-embed--youtube').length ) {
		ashade_ribbon.init_YT();
	}
}

jQuery(document).ready(function() {
    
    // Init Vimeo API
	if ( ashade_ribbon.$el.find('.ashade-slide-embed--vimeo').length ) {
		if ( typeof Vimeo !== 'undefined' && Vimeo.Player instanceof Function ) {
			ashade_ribbon.init_Vimeo();
		}
	}
});

jQuery(document).on('click', '.ashade-video-unmute', function() {
    let $this = jQuery(this),
        $slide = $this.parent('div'),
        $wrap = $this.parents('div.ashade-albums-carousel');
	
    if ( $this.hasClass('is-mutted') ) {
        $wrap.find('video').prop('muted', true);
        $wrap.find('.ashade-video-unmute').addClass('is-mutted');
        $slide.find('video').prop('muted', false);
        $this.removeClass('is-mutted');
    } else {
        $slide.find('video').prop('muted', true);
        $this.addClass('is-mutted');
    }
});