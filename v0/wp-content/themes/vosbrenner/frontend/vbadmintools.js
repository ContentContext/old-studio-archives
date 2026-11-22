/**
 * VbAdminTools - VosBrenner Website Admin Tools
 * Copyright (C) 2013, Michiel Sikma <mike@letsdeliver.com>
 * Date: 2013/05/23
 *
 * @author Michiel Sikma
 *
// ==ClosureCompiler==
// @output_file_name vbadmintools.min.js
// @compilation_level ADVANCED_OPTIMIZATIONS
// ==/ClosureCompiler==
 *
 **/

window["VbAdminTools"] = function(overrides)
{
	var self			= this;
	
	var $body			= null;
	var $root			= null;
	var $tools			= null;
	var $edit_fb		= null;
	var $data_items		= null;
	var $_data_item		= null;
	var post_id			= null;
	var data_item_db	= {};
	var elements_init	= null;
	
	var grid_w			= 0;
	var grid_h			= 0;
	
	/* Default settings. */
	var defaults		= {
		$root			: null,			// #root element (required)
		debug			: true			// console debugging
	};
	/* Container for instance settings. */
	var settings		= {};
	
	var permit_debug	= null;
	
	/*
	 * Logs messages to the console. Used for tracking code activity.
	 */
	self.debug = function(str, vars, func)
	{
		if (permit_debug != true
		||  window.console == null) {
			return;
		}
		
		func = func == null ? "log" : func;
		vars = vars == null ? [] : vars;
		if (vars.constructor.toString().indexOf("Array") == -1) {
			vars = [vars];
		}
		vars.unshift(str);
		console[func].apply(console, vars);
	}
	
	self.get_positioning_html = function()
	{
		return '<div class="admin-overlay"></div><div class="admin"><a href="#" class="size w l">-</a><a href="#" class="size w m">+</a></div>';
	}
	
	self.check_edit_mode = function()
	{
		var can_drag = $root.hasClass("admin-mode");
		$_data_item.each(function(n, data_item)
		{
			var $data_item = $(data_item);
			$data_item.draggable({disabled: !can_drag});
		});
	}
	
	self.update_container_height = function()
	{
		var container_height = 0;
		$_data_item.each(function(n, data_item)
		{
			var $data_item = $(data_item);
			var item_bottom = $data_item.offset().top + $data_item.height();
			if (container_height < item_bottom) {
				container_height = item_bottom;
			}
		});
		$data_items.css("height", (container_height + 500)+"px");
	}
	
	self.set_feedback = function(str, style)
	{
		$edit_fb.removeClass("warning");
		$edit_fb.removeClass("success");
		if (style) {
			$edit_fb.addClass(style);
		}
		$edit_fb.text(str);
	}
	
	self.init_elements = function()
	{
		if (!settings.$root[0]) {
			self.debug("VbAdminTools::init_elements(): no #root element set", [], "error");
			return false;
		}
		$root = settings.$root;
		$body = $("body");
		$tools = $("#admin_tools");
		$edit_fb = $("#admin_tools .edit-feedback");
		
		var $save = $("a.save", $tools);
		$save.click(function()
		{
			self.debug("Saving...");
			self.set_feedback("Saving...");
			$save.addClass("saving");
			$.ajax({
				type: "POST",
				url: window.config.site_url+"/save-data-items/",
				data: {new_positions: data_item_db, post_id: post_id},
				success: function(data)
				{
					$save.removeClass("saving");
					self.set_feedback("Successfully saved post data for ID "+post_id+"!", "success");
					self.debug("Saved data for post ID %i", [post_id]);
				},
				dataType: "json"
			});
			return false;
		});
		
		var $editmode =  $("a.editmode", $tools);
		$editmode.click(function()
		{
			$editmode.toggleClass("editing");
			$body.toggleClass("debug-enabled");
			$root.toggleClass("admin-mode");
			if ($root.hasClass("admin-mode")) {
				self.set_feedback("Don't forget to save!", "warning");
			}
			self.check_edit_mode();
		});
		
		grid_w = window.config.grid.w + window.config.grid.m;
		grid_h = window.config.grid.h;
		
		$data_items = $(".data-items", $root);
		post_id = $data_items.attr("data-post-id");
		$_data_item = $(".data-item", $data_items);
		$_data_item.each(function(n, data_item)
		{
			var $data_item = $(data_item);
			
			var id = $data_item.attr("data-id");
			var w = parseInt($data_item.attr("data-width"), 10);
			var l = parseInt($data_item.attr("data-left"), 10);
			var t = parseInt($data_item.attr("data-top"), 10);
			data_item_db[id] = {w: w, l: l, t: t};
			
			$data_item.prepend(self.get_positioning_html());
			$data_item.draggable({
				grid: [
					grid_w,
					grid_h
				],
				stop: function(event, coords)
				{
					var gridded_l = parseInt(coords.position.left / grid_w, 10);
					var gridded_t = parseInt(coords.position.top / grid_h, 10);
					var new_l = grid_w * gridded_l;
					var new_t = grid_h * gridded_t;
					$data_item.attr("data-left", gridded_l);
					$data_item.attr("data-top", gridded_t);
					$data_item.css({left: new_l+"px"});
					$data_item.css({top: new_t+"px"});
					data_item_db[id].l = gridded_l;
					data_item_db[id].t = gridded_t;
					self.update_container_height();
				}
			});
			
			var $admin_buttons = $(".admin a", $data_item);
			$admin_buttons.click(function()
			{
				var $this = $(this);
				var dir = $this.hasClass("l") ? -1 : 1;
				if ($this.hasClass("w")) {
					w += 1 * dir;
					$data_item.attr("data-width", w);
					data_item.className = data_item.className.replace(/w-(\S+)/g, '');
					$data_item.addClass("w-"+w);
					data_item_db[id].w = w;
				}
				return false;
			});
			
			self.debug("Processed item %i (w=%i, l=%i, t=%i)", [id, w, l, t]);
		});
		self.update_container_height();
		
		self.check_edit_mode();
		
		self.debug("Post ID is %i", [post_id]);
		
		elements_init = true;
	}
	
	/*
	 * Toggles debugging on or off. Used at least once in constructor.
	 */
	self["toggle_debug"] = function(aux)
	{
		permit_debug = aux;
		self.debug("VbAdminTools::toggle_debug(): setting debugging to %o", [aux], "info");
	}
	
	
	self.__init__ = function(overrides)
	{
		/* Override default settings with user-supplied ones. */
		settings = defaults;
		for (var key in overrides) {
			settings[key] = overrides[key];
		}
		self["toggle_debug"](settings.debug);
		self.debug("VbAdminTools::__init__(): initializing new VbAdminTools instance", [], "info");
		self.init_elements();
		
		self.debug("Done initializing instance");
	}
	self.__init__(overrides);
}