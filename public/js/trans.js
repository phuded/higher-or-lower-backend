//Custom function for closing the form
$.openForm = function(){

    //Get player list
    $.getPlayerList();
    $.getGamePlayerList();

	//Clear Search
	$("div#playerList input").val("");
	$('div#playerList ul li').removeClass('ui-screen-hidden'); 
	//Reset to top panel
	$('.formPanel .ui-collapsible-contain:eq(0)').trigger('expand');

	// Show form
    $("#game-contents").hide();
    $("#form").fadeIn();

    // History
    history.replaceState({}, "", "/");
};

//Custom function for closing menu
$.closeForm = function(){

	// New
	$("#form").hide();
	$("#game-contents").fadeIn();

    // Show cancel
    $("#cancel").show();

    // History
    history.replaceState({}, "", "/" + GAME_ID + "/" + LOGGED_IN_PLAYER + "/");

    // Show the page (if loading from a URL)
    $("body").show();

};

//Custom function for opening Lee dialogue
$.openDialog = function(){
	$.mobile.changePage( "#drink", {
		transition: "pop",
		changeHash: false
	});
};

//Custom function for closing Lee dialogue
$.closeDialog = function(){
	$.mobile.changePage( "#game", {
		transition: "pop",
		reverse:true,
		changeHash: false
	});
};


//Slide
$.slideTab = function(rev, tab){
	$.mobile.changePage("#" + tab, {
		transition: "slide",
		reverse: rev,
		changeHash: false
	});
	
	var navBar = $('#'+tab+'_navbar');
	navBar.find('a').removeClass('ui-btn-active');
	navBar.find('a[href="#'+tab+'"]').addClass('ui-btn-active');

};
