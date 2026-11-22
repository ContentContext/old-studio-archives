

$(function()
{
	window.console && console.info("%i website", "VosBrenner");
	
	var $root = $("#root");
	var $data_container = $("#data_container");
	
	var year_iso_opts = {
		filter: "*",
		sortBy: "pfyear",
		sortAscending: false,
		meta_slug: null
	};
	var all_iso_opts = {
		filter: "*",
		sortBy: "pfcat",
		sortAscending: true,
		meta_slug: null
	};
	
	/*var vbmetapos = new VbMetaPos({
		$root: $root
	});*/
	var vbadmintools = new VbAdminTools({
		$root: $root
	});
	
	if ($root.hasClass("colorpick")) {
		var $accent_color_items = $(".accent-color", $root);
		var $cpicker_input = $(".cpicker-outer input.cpickval", $root);
		var $cpicker_form = $(".cpicker-outer form", $root);
		var current_color = window.config.ms_accent_color;
		$cpicker_input.val("#"+window.config.ms_accent_color);
		$cpicker_input.ColorPicker({
			color: window.config.ms_accent_color,
			onChange: update_color
		});
		$(".quote a").attr("href", null);
		$cpicker_form.click(function()
		{
			$.ajax({
				type: "POST",
				url: window.config.site_url+"/colorpicker/",
				data: {new_color: current_color},
				success: function(data)
				{
					window.console && console.info("Successfully saved new color: %i", current_color);
				},
				dataType: "json"
			});
			return false;
		});
	}
	
	var categoryFirst = {};
	
	/* Custom sorting option for Isotope. */
	$.extend($.Isotope.prototype, {
		_categoryRowsReset: function()
		{
			this.categoryRows = {
				x: 0,
				y: 0,
				height: 0,
				currentCategory: null
			};
		},
		_categoryRowsLayout: function($elems)
		{
			var instance = this;
			var containerWidth = this.element.width();
			var sortBy = this.options.sortBy;
			var props = this.categoryRows;
			
			/* Save the first item of each category. */
			categoryFirst = {};
			
			var byCat = {};
			$elems.each(function()
			{
				var $this = $(this);
				var category = $.data(this, 'isotope-sort-data')[sortBy];
				if (byCat[category] == null) {
					byCat[category] = [];
				}
				byCat[category].push($this);
			});
			var catItems;
			var category, a, z;
			for (category in byCat) {
				catItems = byCat[category];
				for (a = 0, z = catItems.length; a < z; ++a) {
					var $this = catItems[a];
					var atomW = $this.outerWidth(true);
					var atomH = $this.outerHeight(true);
					var x, y;
					
					if (this.options.meta_slug) {
						category = this.options.meta_slug;
					}
					//window.console && console.info("Layout: current category: %i", category);
					
					if (categoryFirst[category] == null) {
						categoryFirst[category] = $this;
					}
					
					if (category !== props.currentCategory) {
						// new category, new row
						props.x = 0;
						props.height += props.currentCategory ? instance.options.categoryRows.gutter : 0;
						props.y = props.height;
						props.currentCategory = category;
					}
					else
					if (props.x !== 0 && atomW + props.x > containerWidth) {
						// if this element cannot fit in the current row
						props.x = 0;
						props.y = props.height;
					}
					// position the atom
					instance._pushPosition($this, props.x, props.y);
					
					props.height = Math.max(props.y + atomH, props.height);
					props.x += atomW;
				}
			}
		},
		
		_categoryRowsGetContainerSize: function()
		{
			return {height: this.categoryRows.height};
		},
		
		_categoryRowsResizeChanged: function()
		{
			return true;
		}
	});
	
	/* Sorting options. */
	var $post_wrapper = $(".post-wrapper.overview", $root);
	var selector_class = ".sortable";
	var $sortable_items = $(selector_class, $post_wrapper);
	var is_sortable = !$post_wrapper.hasClass("single");
	var std_anim = {
		animationEngine: "jquery",
		animationOptions: {
			duration: 750,
			easing: "easeInOutSine",
			queue: false
		}
	};
	var instant_anim = {
		animationEngine: "css"
	};
	var $sort_pftag = $("#arrange_by .pftag", $root);
	if ($post_wrapper[0] && is_sortable) {
		var iso_opts = {
			itemSelector: selector_class,
			filter: "*",
			transformsEnabled: false,
			animationEngine: "jquery",
			categoryRows: {
				gutter: 24
			},
			getSortData: {
				pfyear: function($elem)
				{
					if ($elem.hasClass("has-year")) {
						return $elem.attr("class").match(/year-(\S+)/)[1];
					}
					else {
						return 'zzzzzzzzz';
					}
				},
				pfcat: function($elem)
				{
					if ($elem.hasClass("has-cat")) {
						return $elem.attr("class").match(/cat-(\S+)/)[1];
					}
					else {
						return 'zzzzzzzzz';
					}
				}
			},
			sortBy: "pfcat",
			meta_slug: null,
			sortAscending: true
		};
		var override_cats = {
			layoutMode: "categoryRows"
		};
		var override_regular = {
			layoutMode: "masonry",
			sortBy: ""
		};
		var $sort_pfcat = $("#sort_pfcat", $root);
		var $sort_pfcat_links = $("a.dynlink-sort");
		
		var has_hash = location.hash.substr(0, 1) == "#";
		var hash = location.hash.slice(1);
		var hash_meta = false;
		var sort_type, meta_slug;
		var $hash_obj;
		if (has_hash) {
			$hash_obj = $("a[href$='#"+hash+"']", $sort_pfcat);
			if ($hash_obj[0] == null) {
				if (hash.indexOf("tag-") == 0) {
					hash = hash.substring(4);
				}
				$hash_obj = $("option[data-meta-slug='"+hash+"']", $sort_pftag);
			}
			if ($hash_obj) {
				sort_type = $hash_obj.attr("data-sort-type");
				meta_info = $hash_obj.attr("data-meta-info");
				meta_slug = $hash_obj.attr("data-meta-slug");
				iso_opts.filter = sort_type;
				iso_opts.meta_slug = meta_slug;
				iso_opts.sortBy = null;
				hash_meta = {sort_type: sort_type, meta_info: meta_info, meta_slug: meta_slug};
			}
			$post_wrapper.isotope($.extend({}, iso_opts, override_cats));
		}
		else {
			$post_wrapper.isotope($.extend({}, iso_opts, override_regular));
		}
		
		$sort_pfcat_links.click(function()
		{
			if (!is_sortable) {
				return true;
			}
			var $a = $(this);
			var sort_type = $a.attr("data-sort-type");
			var meta_type = $a.attr("data-meta-type");
			var meta_slug = $a.attr("data-meta-slug");
			var meta_info = $a.attr("data-meta-info");
			if (meta_type == "year") {
				iso_opts = year_iso_opts;
			}
			else
			if (meta_type == "all-cats") {
				iso_opts = all_iso_opts;
			}
			else {
				iso_opts = {
					filter: sort_type,
					sortBy: null,
					meta_slug: meta_slug
				};
			}
			var a, z;
			var item_dict = {};
			for (a = 0, z = $sortable_items.length; a < z; ++a) {
				item_dict[a] = {
					top: $sortable_items[a].style.top,
					left: $sortable_items[a].style.left
				};
			}
			$post_wrapper.isotope($.extend({}, iso_opts, override_cats, instant_anim));
			check_meta(meta_type, meta_slug, meta_info, sort_type);
			for (a = 0, z = $sortable_items.length; a < z; ++a) {
				$sortable_items[a].style.top = item_dict[a].top;
				$sortable_items[a].style.left = item_dict[a].left;
			}
			$post_wrapper.isotope($.extend({}, iso_opts, override_cats, std_anim));
			return false;
		});
		$sort_pftag.change(function()
		{
			var $this = $(this);
			var $selected = $(":selected", this);
			var sort_type = $this.val();
			var meta_type = $selected.attr("data-meta-type");
			var meta_slug = $selected.attr("data-meta-slug");
			var meta_info = $selected.attr("data-meta-info");
			var iso_opts_copy = iso_opts;
			iso_opts = {
				filter: sort_type,
				sortBy: null
			};
			if (sort_type == "_default_") {
				sort_type = "*";
				meta_type = "all-cats";
				iso_opts = {
					filter: "*",
					sortBy: "pfcat",
					sortAscending: true,
					meta_slug: null
				};
			}
			var a, z;
			var item_dict = {};
			for (a = 0, z = $sortable_items.length; a < z; ++a) {
				item_dict[a] = {
					top: $sortable_items[a].style.top,
					left: $sortable_items[a].style.left
				};
			}
			$post_wrapper.isotope($.extend({}, iso_opts, override_cats, instant_anim));
			check_meta(meta_type, meta_slug, meta_info, sort_type);
			for (a = 0, z = $sortable_items.length; a < z; ++a) {
				$sortable_items[a].style.top = item_dict[a].top;
				$sortable_items[a].style.left = item_dict[a].left;
			}
			$post_wrapper.isotope($.extend({}, iso_opts, override_cats, std_anim));
			return false;
		});
	}
	
	if ($post_wrapper[0] && !is_sortable) {
		$sort_pftag.change(function()
		{
			var $this = $(this);
			var $selected = $(":selected", this);
			var sort_type = $this.val();
			var meta_type = $selected.attr("data-meta-type");
			var meta_slug = $selected.attr("data-meta-slug");
			var meta_info = $selected.attr("data-meta-info");
			window.location = window.config.site_url+"/portfolio/#tag-"+meta_slug;
			return false;
		});
	}
	
	/* Meta texts. */
	var $meta_prototype;
	var $post_meta;
	var meta_html;
	var is_index = $root.hasClass("page-index");
	
	var year_meta_info = window.vb_year_meta_info;
	var cat_meta_info = window.vb_cat_meta_info;
	if ($post_wrapper[0] && is_sortable) {
		init_meta(true);
		if (hash_meta == false) {
			//set_meta(cat_meta_info);
		}
		else {
			var $dyn = $("a.dynlink-sort[data-sort-type='"+hash_meta.sort_type+"']");
			if ($dyn[0]) {
				$dyn.click();
			}
			else {
				set_meta([{title: hash_meta.meta_info, selector: "top", slug: hash_meta[meta_slug]}]);
			}
		}
	}
	
	function init_meta(no_remove)
	{
		if (no_remove == null) no_remove = false;
		$post_meta = $(".post-meta", $data_container);
		$meta_prototype = $(".example", $post_meta);
		$meta_prototype.removeClass("example");
		if ($meta_prototype[0] == null) {
			return;
		}
		meta_html = $meta_prototype[0].outerHTML;
		if (no_remove) {
			return;
		}
		$meta_prototype.remove();
	}
	
	function set_meta(items)
	{
		var a, z;
		var item, title, slug, selector, item_pos;
		var $meta_item, $first_relevant_item;
		
		/* Delete all current items first. */
		fade_out_meta($(".meta-item", $post_meta));
		
		/* Create the new items. */
		for (a = 0, z = items.length; a < z; ++a) {
			item = items[a];
			title = item.title;
			slug = item.slug;
			selector = item.selector;
			$meta_item = $(meta_html).appendTo($post_meta);
			$meta_item.text(title);
			fade_in_meta($meta_item);
			
			/* Show at the top? */
			if (selector == "top") {
				$meta_item.css("top", "3px");
			}
			else {
				/* Get the first item this label refers to. */
				$first_relevant_item = get_first_relevant_item(slug);
				if ($first_relevant_item == null) {
					$meta_item.remove();
				}
				else {
					item_pos = $first_relevant_item.position();
					$meta_item.css("top", item_pos.top);
				}
			}
		}
	}
	
	function fade_in_meta($meta_item)
	{
		$meta_item.fadeTo(0, 0);
		$meta_item.fadeTo(500, 1);
	}
	
	function fade_out_meta($meta_item)
	{
		$meta_item.stop().fadeOut(500, function()
		{
			$(this).remove();
		});
	}
	
	function get_first_relevant_item(slug)
	{
		var a, z;
		var $items;
		var $active_item;
		if (slug == null) {
			$active_item = $($sortable_items[0]);
			return $active_item;
		}
		$active_item = categoryFirst[slug];
		if ($active_item == null) {
			return null;
		}
		/*
		if (selector == "top") {
			$items = $(".isotope-item:not(.isotope-hidden)", $post_wrapper);
		}
		else {
			$items = $(".sortable"+selector, $post_wrapper);
		}
		
		var item_offset;
		var lowest_top;
		var $item;
		var $active_item = $($items[0]);
		for (a = 0, z = $items.length; a < z; ++a) {
			$item = $($items[a]);
			item_offset = $item.offset();
			if (lowest_top == null || lowest_top > item_offset.top) {
				lowest_top = item_offset.top;
				$active_item = $item;
			}
		}*/
		return $active_item;
	}
	
	function check_meta(meta_type, meta_slug, meta_info, sort_type)
	{
		window.console && console.log(meta_type);
		if (meta_type == "this-cat"
		||  meta_type == "this-tag") {
			/* Display only the tag/cat at the top of the page. */
			set_meta([{title: meta_info, selector: "top", slug: meta_slug}]);
		}
		if (meta_type == "all-cats") {
			/* Show all categories. */
			set_meta(cat_meta_info);
		}
		if (meta_type == "chrono") {
			/* Chronological; index page. */
			//fade_out_meta($(".meta-item", $post_meta));
			set_meta([{title: "Index"}]);
		}
		if (meta_type == "year") {
			/* Show all available years. */
			set_meta(year_meta_info);
		}
	}
	
	function update_color(hsb, hex)
	{
		var front;
		if (hsb != null && hsb.b < 75) {
			front = "ffffff";
		}
		else {
			front = "000000";
		}
		$cpicker_input.css({backgroundColor: "#"+hex, color: "#"+front});
		$cpicker_input.val("#"+hex);
		$accent_color_items.css({color: "#"+hex});
		current_color = hex;
	}
	update_color({h: 0, s: 100, b: 100}, window.config.ms_accent_color);
});

