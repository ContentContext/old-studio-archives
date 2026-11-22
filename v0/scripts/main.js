/*
  Vos Brenner
  Copyright (C) 2009 by Systemantics, Bureau for Informatics

  Lutz Issler
  Am Lavenstein 3
  52064 Aachen
  GERMANY

  Web:    www.systemantics.net
  Email:  mail@systemantics.net

  Permission granted to use the files associated with this
  website only on your webserver.

  Changes to these files are PROHIBITED due to license restrictions.
*/

$(function() {
	$("#newsletter-form").ajaxForm({
		target: "#newsletter"
	});

	$(".slideshow").each(function() {
		var images = $(this);
		var control = $('<div class="slide-control"></div>');
		var prevButton = $('<span>&gt; <span class="counter">1</span></span>')
			.click(function() {
				var c = $(".image:visible", images);
				$(".image", images).hide();
				if (c.prev(".image").length) {
					c.prev(".image").show();
				} else {
					$(".image:last", images).show();
				}
				$(".counter", control).text($(".image", images).index($(".image:visible", images))+1);
			});
		var nextButton = $("<span>"+$(".image", images).length+"</span>")
			.click(function() {
				var c = $(".image:visible", images);
				$(".image", images).hide();
				if (c.next(".image").length) {
					c.next(".image").show();
				} else {
					$(".image:first", images).show();
				}
				$(".counter", control).text($(".image", images).index($(".image:visible", images))+1);
			});
		control
			.append(prevButton)
			.append('–')
			.append(nextButton)
			.insertAfter($(this).closest(".project").find(".details").children("h4"));
		$(".image", images).click(function() {
			nextButton.click();
		})
		$(".image", images).hide();
		$(".image:first", images).show();
	});

	$("a[href^=http://]").click(function() {
		this.blur();
		window.open(this.href);
		return false;
	});

	$("#intro-window").click(function() {
		$(".close", this).click();
		return false;
	});

	$(".backtotop").click(function() {
		$("html, body").animate({scrollTop:0}, "slow");
	});
});
