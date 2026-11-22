

$(function()
{
	window.console && console.info("%s website", "VosBrenner");
	
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
	
	var $cpicker_input = null;
	if ($root.hasClass("colorpick")) {
		var $accent_color_items = $(".accent-color", $root);
		$cpicker_input = $(".cpicker-outer input.cpickval", $root);
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
	
	var $quoteRefresher = $("#refresh_quote");
	var $quoteContainer = $("#quote_container .quote");
	$quoteRefresher.click(function() {
	    var quote = window.vb_quotes[Math.floor(Math.random() * window.vb_quotes.length)];
	    $quoteContainer.html(quote);
	});
	
	var $postPortfolio = $(".post.portfolio", $root);
	var post_id = parseInt($postPortfolio.attr("data-post-id"), 10);
	var $itemContainer = $(".data-items", $postPortfolio);
	function update_container_height() {
	    var $items = $(".data-item", $itemContainer);
	    var maxBottom = 0;
	    $items.each(function(n, el) {
	        var $el = $(el);
	        var position = $el.position();
	        var height = $el.height();
	        var bottom = position.top + height;
	        maxBottom = maxBottom < bottom ? bottom : maxBottom;
	    });
	    console.info('Lowest bottom point of this post: %d', maxBottom);
	    
	    $.getJSON(window.vb_base_url, {
	        post_id: post_id,
	        content_height: parseInt(maxBottom, 10),
	        request: 'cache_post_height'
	    }, function(data) {
	        console.log(data);
	    });
	    $itemContainer.css('height', maxBottom + 'px');
	}
	$itemContainer.waitForImages(function() {
	    update_container_height();
	});
	
	function update_color(hsb, hex)
	{
	    if (!$cpicker_input) {
	        return;
	    }
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

