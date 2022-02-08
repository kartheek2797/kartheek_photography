/** 
 * Author: Shadow Themes
 * Author URL: http://shadow-themes.com
 */
"use strict";

/* BrickWall Plugin by Shadow-Themes */
/* --------------------------------- */
class ShadowCore_BrickWall {
	constructor ( $el, options = false ) {
		let this_class = this;
		if ($el instanceof jQuery) {
			this.$el = $el;
			this.layoutDelay = 0;
			this.oldWidth = 0;
			this.options = {
				animSpeed : 'fast', // 'fast', 'slow', 'none'
				stagger : 0, // integer value (ex: 30) in milliseconds added to each item 'transition-delay' index * value
			}
			this.elemCount = this.$el.children().length;
			this.isActive = false;
			
			// Set Speed
			if ( 'fast' !== this.options.animSpeed ) {
				this.$el.addClass( 'animation--' + this.options.animSpeed );
			}

			// Init BrickWall
			if (this.elemCount) {
				this.isActive = true;
				this.$el.addClass('brickwall-grid');
				if ( this.options.stagger ) {
					this.$el.children().each(function() {
						jQuery(this).css('transition-delay', this_class.options.stagger * jQuery(this).index() + 'ms' );
					});
				}
				this.layout();
			} else {
				console.warn('BrickWall: No children items found');
			}
			
			// Events
			jQuery(window).on('resize', function() {
				clearTimeout(this_class.resizeTimer);
				this_class.resizeTimer = setTimeout(function() {
					if (this_class.oldWidth !== this_class.$el.width()) {
						this_class.layout();
					}
				}, 150, this_class);
			});
		} else {
			console.error('BrickWall Error: Element is not a jQuery Object.');
		}
	}

	getPaddings( $item ) {
		return Array( $item.css('paddingTop'), $item.css('paddingRight'), $item.css('paddingBottom'), $item.css('paddingLeft') );
	}
	
	placeItem( $item, fr = 0, ind = 0, ins = 0 ) {
		if ( ! ($item instanceof jQuery) ) {
			$item = jQuery($item);
		}
		
		// Get Item Paddings
		let itemPaddings = this.getPaddings( $item );
		
		if ( ins )
			$item.appendTo( this.$el );

		let colsX = this.colsX,
			colsY = this.colsY,
			setX = 0,
			setY = 0,
			iW = $item.width() + parseInt(itemPaddings[1], 10) + parseInt(itemPaddings[3], 10),
			iH = $item.height() + parseInt(itemPaddings[0], 10) + parseInt(itemPaddings[2], 10);

		if ( fr && ind ) {
			if ( ind ) {
				let posMatrix = this.$el.children().eq(ind - 1).css('transform').split(',');
				setX = iW * ind;
			}
			colsY[ind] = iH;
			colsX[ind] = setX;
		} else {
			let cc = colsY.indexOf( Math.min.apply( Math, colsY ) );
				setX = colsX[cc];
				setY = colsY[cc];
			colsY[cc] = colsY[cc] + iH;
		}

		$item.css({
			'transform' : 'scale('+ ($item.hasClass('brickwall-item') ? 1 : 0) +') translate3d(' + parseFloat(setX).toFixed(2) + 'px, '+ parseFloat(setY).toFixed(2) +'px, 0)',
			'transform-origin' : parseFloat(setX + 0.5 * iW).toFixed(2) + 'px ' + parseFloat(setY + 0.5 * iH).toFixed(2) + 'px',
			'z-index' : 3
		});

		if ( ! $item.hasClass('brickwall-item') ) {
			$item.setX = setX;
			$item.setY = setY;

			setTimeout(function() {
				$item.addClass('brickwall-item');
				$item.css({
					'transform' : 'scale(1) translate3d(' + parseFloat($item.setX).toFixed(2) + 'px, '+ parseFloat($item.setY).toFixed(2) +'px, 0)'
				});
			}, 30, $item);
		}
		
		this.colsX = colsX;
		this.colsY = colsY;		
	}

	layout( selector = ':not(.is-hidden)', callback = false ) {
		let this_class = this,
			ind = 0,
			cols = Math.round( 1 / ( this.$el.children().width() / this.$el.width() ) ),
			colsX, colsY;

		if ( selector && ':not(.is-hidden)' !== selector ) {
			ind = this.$el.children().length - 1;
			colsX = this.colsX;
			colsY = this.colsY;
		} else {
			selector = ':not(.is-hidden)';
			colsX = new Array(cols);
			colsY = new Array(cols);
			colsX.fill(0);
			colsY.fill(0);
			this.colsX = colsX;
			this.colsY = colsY;
		}

		if ( ! this.hasOwnProperty('colsX') ) {
			colsX.fill(0);
			this.colsX = colsX;
		}
		if ( ! this.hasOwnProperty('colsY') ) {
			colsY.fill(0);
			this.colsY = colsY;
		}

		this.$el.children(selector).each(function() {
			let $this = jQuery(this),
				posY = Math.floor((ind)/cols) + 1;

			if (posY == 1) {
				this_class.placeItem( this, 1, ind, 0 ); // $item, fr, ind, ins
			} else {
				this_class.placeItem( this ); // $item, fr, ind, ins
			}
			ind++;
		});

		this.$el.height( Math.max.apply( Math, colsY ) );
		this.oldWidth = this.$el.width();

		this.colsY = colsY;
		this.colsX = colsX;

		if ( callback && typeof callback === 'function' ) {
			callback( this_class );
		}
	}

	insert( $items ) {
		let this_class = this;

		if ( ! ($items instanceof jQuery) ) {
			$items = jQuery($items);
		}

		if ($items.length) {
			if ($items.length > 1) {
				$items.each(function() {			
					this_class.placeItem( this, 0, 0, 1 ); // $item, fr, ind, ins
				});
			} else {
				this.placeItem( $items, 0, 0, 1 ); // $item, fr, ind, ins
			}
			this_class.$el.height( Math.max.apply( Math, this_class.colsY ) );
		}
	}

	filter( selector ) {
		let this_class = this;
		if ( 'all' == selector ) {
			this.$el.children('.is-hidden').removeClass('is-hidden');
		} else {
			this.$el.children('[data-category="' + selector + '"]').removeClass('is-hidden');
			this.$el.children(':not([data-category="' + selector + '"])').addClass('is-hidden');
		}

		if (this.$el.children('.is-hidden').length) {
			this.$el.children('.is-hidden').each(function() {
				let $this = jQuery(this),
					posMatrix = $this.css('transform').split(','),
					posX = parseFloat(posMatrix[4]),
					posY = parseFloat(posMatrix[5].substring( 0, posMatrix[5].length - 1 )),
					itemPaddings = this_class.getPaddings( $this ),
					iW = $this.width() + parseInt(itemPaddings[1], 10) + parseInt(itemPaddings[3], 10),
					iH = $this.height() + parseInt(itemPaddings[0], 10) + parseInt(itemPaddings[2], 10);
				$this.css({
					'transform' : 'scale(0) translate3d(' + parseFloat(posX).toFixed(2) + 'px, '+ parseFloat(posY).toFixed(2) +'px, 0)',
					'transform-origin' : parseFloat(posX + 0.5 * iW ).toFixed(2) + 'px ' + parseFloat( posY + 0.5 * iH ).toFixed(2) + 'px',
					'z-index' : '1'
				});
			});
		}

		this.layout();
	}

	remove( $item ) {
		if ( ! ($item instanceof jQuery) ) {
			$item = jQuery($item);
		}
		let itemPaddings = this.getPaddings( $item ),
			iW = $item.width() + parseInt(itemPaddings[1], 10) + parseInt(itemPaddings[3], 10),
			iH = $item.height() + parseInt(itemPaddings[0], 10) + parseInt(itemPaddings[2], 10);
		
		$item.addClass('is-hidden');
		let posMatrix = $item.css('transform').split(','),
			posX = parseFloat(posMatrix[4]),
			posY = parseFloat(posMatrix[5].substring( 0, posMatrix[5].length - 1 ));

		$item.css({
			'transform' : 'scale(0) translate3d(' + parseFloat(posX).toFixed(2) + 'px, '+ parseFloat(posY).toFixed(2) +'px, 0)',
			'transform-origin' : parseFloat(posX + 0.5 * iW ).toFixed(2) + 'px ' + parseFloat( posY + 0.5 * iH ).toFixed(2) + 'px',
			'z-index' : '1'
		});

		this.layout();

		setTimeout(function(){
			$item.remove();
		}, (this.options.animSpeed == 'slow' ? 850 : 450) , $item);
	}

	destroy() {
		this.$el.removeClass('brickwall-grid');
		this.$el.attr('style', null);
		this.$el.children().each(function() {
			let $this = jQuery(this);
			$this.attr('style', null).removeClass('is-hidden', 'brickwall-item');
		});
		delete(this);
	}
}

/* Elementor Part */
/* -------------- */
jQuery(window).on('elementor/frontend/init', function () {
	/*  ----------------
        Frontend Scripts
        ----------------  */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-gallery-masonry.default', function ($scope) {
		// Masonry Gallery
		let $this = $scope.find('.shadowcore-is-masonry'),
			this_id = $this.attr('data-id');
		shadowcore_el.elements.masonry[ this_id ] = new ShadowCore_BrickWall( jQuery('.shadowcore-is-masonry[data-id="'+this_id+'"]') );
	});
	
	/* Testimonials Grid */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-testimonials-grid.default', function ($scope) {
		let this_id = $scope.attr('data-id');
		shadowcore_el.elements.masonry[ this_id ] = new ShadowCore_BrickWall( jQuery('.shadowcore-is-masonry[data-id="'+this_id+'"]') );
		
        $scope.find('.shadowcore-gallery-image').each(function() {
			let $this = jQuery(this),
				$img = jQuery(this).children('img');
			
			if ($this.css('border-radius') !== $img.css('border-radius')) {
				jQuery('head').append('<style id="shadow-element">.elementor-element-'+ $scope.attr('data-id') +' .shadowcore-gallery-image { border-radius: '+ $img.css('border-radius') +' }</style>');
			}
		});
    });
	
    /* 	------
		Editor
		------ */
    if (elementorFrontend.isEditMode()) {
		/* Gallery Masonry */
        elementor.hooks.addAction( 'panel/open_editor/widget/shadow-gallery-masonry', function( panel, model, view ) {
            let this_id = view.$el.data('id');

            panel.$el.on('mouseup', '.elementor-control-item_spacing', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mouseleave', '.elementor-control-item_spacing', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mousemove', '.elementor-control-item_spacing', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadowcore_el.elements.masonry[ this_id ].layout();
                }
            });
            panel.$el.on('change', '.elementor-control-item_spacing input', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });

            panel.$el.on('mouseup', '.elementor-control-caption_spacing--under', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mouseleave', '.elementor-control-caption_spacing--under', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mousemove', '.elementor-control-caption_spacing--under', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadowcore_el.elements.masonry[ this_id ].layout();
                }
            });
            panel.$el.on('change', '.elementor-control-caption_spacing--under input', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });

            panel.$el.on('change', '.elementor-control-grid_columns select', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
            panel.$el.on('change', '.elementor-control-captions select', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
        });

        /* Testimonials Grid */
        elementor.hooks.addAction( 'panel/open_editor/widget/shadow-testimonials-grid', function( panel, model, view ) {
            let this_id = view.$el.data('id');
            panel.$el.on('mouseup', '.elementor-control-item_spacing', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mouseleave', '.elementor-control-item_spacing', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mousemove', '.elementor-control-item_spacing', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
            
            panel.$el.on('mouseup', '.elementor-control-image_size', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mouseleave', '.elementor-control-image_size', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mousemove', '.elementor-control-image_size', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadowcore_el.elements.masonry[ this_id ].layout();
                }
            });
            panel.$el.on('change', '.elementor-control-image_size input', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });

            panel.$el.on('mouseup', '.elementor-control-oc_spacing', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mouseleave', '.elementor-control-oc_spacing', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mousemove', '.elementor-control-oc_spacing', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadowcore_el.elements.masonry[ this_id ].layout();
                }
            });
            panel.$el.on('change', '.elementor-control-oc_spacing', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
            
            panel.$el.on('mouseup', '.elementor-control-rating_spacing', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mouseleave', '.elementor-control-rating_spacing', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            }).on('mousemove', '.elementor-control-rating_spacing', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadowcore_el.elements.masonry[ this_id ].layout();
                }
            });
            panel.$el.on('change', '.elementor-control-rating_spacing', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
            
            panel.$el.on('click', '.elementor-control-head_layout .elementor-choices', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
            panel.$el.on('click', '.elementor-control-card_swap .elementor-switch', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
            panel.$el.on('change', '.elementor-control-heading_spacing input', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
            panel.$el.on('change', '.elementor-control-content_margin input', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
            panel.$el.on('change', '.elementor-control-content_padding input', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
			
            panel.$el.on('change', '.elementor-control-grid_columns select', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
			panel.$el.on('change', '.elementor-control-grid_columns_tablet select', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
			panel.$el.on('change', '.elementor-control-grid_columns_mobile select', function() {
                shadowcore_el.elements.masonry[ this_id ].layout();
            });
        });
	}
});