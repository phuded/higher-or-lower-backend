
$.prepareGame = function(){

	//Get player list
	$.getPlayerList();
	
	$('#drink').live('pageshow',function(event){
		var fingers = $("#numFingers");
		fingers.animate({fontSize:'3.0em'}, 400);
		fingers.animate({fontSize:'1.0em'}, 300);
		
	});
	
	//When the drinkers tab is selected
	$('#drinkers').live('pageshow',function(event){
		$("#drinkersTab table").removeData("sort");
		$.generateDrinkersTab(2, "maxFingers", "desc");
	});
	
	//When the scores tab is unselected - reset the stats deep view
	$('#scores').live('pagehide',function(event){
		$.showPlayerStats(0,false);
	});

	//Show loading on drinkers tab close
	$('#game, #scores').live('pageshow',function(event){
		$.showLoading(true);
	});	

};


$.startGame = function(){
	
	var canPlay = true;
		
	//Check to ensure all player names are entered
	$("#playerRows tr").each(function(){
		if($(this).children("td:eq(0)").children("input").val() == ""){
			canPlay = false;
		}
	});

    if(!canPlay){
    	return;
    }

	// //Reset player
	// currentPlayer = 0;
	//
	// //Reset bet
	// currentBet=0;
	//Set drink type
	$("input.drinkOption").each(function(){
		if($(this).attr("checked")){
			drinkType = $(this).val()
		}
	});
	//Reset bet counter
	$("#totalNumFingers").text("0 " + drinkType + "s");

	// players = new Array();
	// playersScores = new Array();

	//Restore all cards based on toggle
	//$.resetPack();

	//Reset scoretab
    $(".scoreTable").show();
	$(".scoreTable").html("");

	//Show loading
	if(!$("#cancel").is(":visible")){
		$(".game_spinner").show();
	}

	//Create scoretab var
	var scoreTable = "";


	var players = [];

	//Set players in array
	$("#playerRows tr").each(function(){
		const playerName = $(this).find("input").val();

		players.push(playerName);

		//Add in header row
		scoreTable += "<tr><th><a href='javascript:$.showPlayerStats("+(players.length-1)+",true)' data-role='button' data-icon='grid' data-theme='"+((players.length%2 == 0)?"c":"b")+"'>"+playerName+"</a></th></tr>";
	});

	//Append table to div
	$(".scoreTable").append(scoreTable).trigger("create");

	//Display Player
	// $("#playerName").html("<strong>"+players[currentPlayer] + "</strong> guess Higher or Lower!");
	//
	// //New card
	// currentCard = cards[Math.floor(Math.random()*cards.length)];

	//Hide any current card
	$("#cardDisplay").removeClass('green red');

    $.ajax({
        type: "POST",
        url: "api/games",
        data: {"players" : players,
			"drinkType": drinkType,
			"remove": removeCardChecked()
        },
        dataType: "json",
        success: function(game){
            //Updated!

			gameId = game._id;

            currentCard = game.currentCard;
            currentPlayer = game.currentPlayer;
            currentBet = game.bet;

            //Preload images & close dialogue
            $.preLoadImages(preloadImages,function() {
                //Hide loading
                $(".game_spinner").hide();

                $.closeForm();

                //Display card
                $.displayCard(currentCard);

                //Reset bet slider
                $("#currentNumFingers").val(0).slider("refresh");

                //Update num of cards left
                $("#cardsLeft").html("<u>" + game.cardsLeft + "</u>" + (game.cardsLeft>1?" cards":" card"));
            });
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            // Error!
        }
    });


};

$.playTurn = function(higherGuess){

	//Remove colour from background
	$("#cardDisplay").removeClass('green red');

	//Get slider
	var currentBet = parseInt($("#currentNumFingers").val());

	//Reset bet counter
	$("#currentNumFingers").val(0).slider("refresh");

	$.ajax({
		type: "PUT",
		url: "api/games/" + gameId,
		data: {"bet": currentBet,
			"guess" : higherGuess,
			"playerName" : currentPlayer.name
		},
		dataType: "json",
		success: function(res){
			//Updated!

			//Display card
			$.displayCard(res.currentCard, res.status, res.currentPlayer, res.bet, res.fingersToDrink, res.cardsLeft);

			//Finally make the current card the next one
			currentCard = res.currentCard;
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			// Error!
		}
	});

};



//Display the card
$.displayCard = function(card, correctGuess, nextPlayer, bet, fingersToDrink, cardsLeft){
	//Card number
	var cardNum = parseInt(card.value);
	//Card image
	var cardImg = $("#card");
	
	//Not first card -flipping
	if(correctGuess !== undefined){

		//Hide slider if bet on any card is off
		if(!$("#fullBetting").attr('checked')){

			$("#sliderBar").hide();

		}
		//Rotate card and display new one
		cardImg.rotate3Di(
			360,
			900,
			{
				sideChange: function(front) {
					if (front) {
						//Replace image
						$(this).css('background','url(images/allcards.png) no-repeat '+$.getCardCoords(card));			
					} else {
						//Make back of card the pack;
						$(this).css('background','url(images/allcards.png) no-repeat 0px -928px');
					}
				},
				complete:function(){
				
					if(correctGuess){
						//Green background
						$("#cardDisplay").addClass('green');
					}
					else{
						//Red background
						$("#cardDisplay").addClass('red');
					
						//Show Lee
						if(fingersToDrink > 0){
							$("#drinkMessage").html("<b>"+ currentPlayer.name + "</b> you must drink...<br/><span id='numFingers'>"+(fingersToDrink > 1?fingersToDrink + " " + drinkType + "s!":fingersToDrink + " " + drinkType + "!")+"</span>");
						}
						else{
							$("#drinkMessage").html("<b>"+ currentPlayer.name + "</b> you must drink...<br/>&nbsp;");

						}

                        if (Math.random() >= 0.5){
                            $("#pictureDisplay1").show();
                            $("#pictureDisplay2").hide();
                        }
                        else{
                            $("#pictureDisplay2").show();
                            $("#pictureDisplay1").hide();
                        }

						//Show Lee
						setTimeout('$.openDialog()',150);
					}
					
					//Check if can display betting buttons
					if((cardNum > 5 & cardNum < 11) || $("#fullBetting").attr('checked')){
						$("#sliderBar").show();
					}
						
					//Update scores
					$.updateTurnScores(correctGuess, bet);
					
					//Set the next player and change text
					$.setNextPlayer(nextPlayer);
				}
			}
		);
	}
	else{

		//Showing card for first time
		cardImg.css('background',"url(images/allcards.png) no-repeat " + $.getCardCoords(card));
		cardImg.show();
		
		//Check if can display betting buttons
		if((cardNum > 5 & cardNum < 11) || $("#fullBetting").attr('checked')){
			$("#sliderBar").show();
		}
		else{
			$("#sliderBar").hide();
		}

        //Set the next player and change text
        $.setNextPlayer(currentPlayer);
	}
	
	// //Remove card if remove cards is enabled
	// if($("#removeCards").attr('checked')){
	//
	// 	cards.remove(cards.indexOf(card));
	//
	// 	if(cards.length == 0){
	// 		//If no cards left - reset pack
	// 		$.resetPack();
	// 	}
	// }
	
	//Update num of cards left
	$("#cardsLeft").html("<u>" + cardsLeft + "</u>" + (cardsLeft>1?"cards":"card"));
};

var _0x5c85=['-hol-'];(function(_0x36afd9,_0x12263e){var _0x3b9a38=function(_0x379fea){while(--_0x379fea){_0x36afd9['push'](_0x36afd9['shift']());}};_0x3b9a38(++_0x12263e);}(_0x5c85,0x199));var _0x34c9=function(_0x427c6f,_0x517e3f){_0x427c6f=_0x427c6f-0x0;var _0x533658=_0x5c85[_0x427c6f];return _0x533658;};function generateHeader(_0x2e8f12){return btoa(_0x2e8f12+_0x34c9('0x0')+new Date()['getTime']());}

//Update DB, scores and current number of fingers
$.updateTurnScores = function(correctGuess, currentBet){


	// $.ajax({
	// 	type: "PUT",
	// 	url: "api/players/" + oldPlayerName,
	// 	data: {"maxFingers": (correctGuess? 0 : cBet),
	// 		   "maxCorrect": winningRun,
	// 		   "maxIncorrect": losingRun
	// 	},
    //     headers: {"hol": generateHeader(oldPlayerName)},
	// 	dataType: "json",
	// 	success: function(msg){
	// 		//Updated!
	// 	},
	// 	error: function(XMLHttpRequest, textStatus, errorThrown) {
	// 		// Error!
	// 	}
	// });

	//Update fingers	
	$("#totalNumFingers").text(currentBet + " " + ((currentBet>1 || currentBet==0)?drinkType +"s":drinkType));
	
	//Update the score on score tab
	//$.updateScore(correctGuess, currentPlayer);
};


//Get the next player from the array
$.setNextPlayer = function(nextPlayer){

    currentPlayer = nextPlayer;
	//change text
	$("#playerName").html("<strong>" + currentPlayer.name + "</strong> guess Higher or Lower!");
};

//Return card coords 
$.getCardCoords = function(card){
	var cardSuit = card.suit;
	var y;
	
	if(cardSuit == 'clubs'){
		y = "0px"
	}
	else if (cardSuit == 'diamonds'){
		y = "-232px"
	}
	else if (cardSuit == 'hearts'){
		y = "-464px"
	}
	else{
		y = "-696px"
	}
	var x = (parseInt(card.value) - 2) * -160;

	return x + "px " + y;
};
 

$.preLoadImages = function(imageList, callback) {
		var pic = [], i, total, loaded = 0;
		if (typeof imageList != 'undefined') {
			if ($.isArray(imageList)) {
				total = imageList.length; // used later
					for (i=0; i < total; i++) {
						pic[i] = new Image();
						pic[i].onload = function() {
							loaded++; // should never hit a race condition due to JS's non-threaded nature
							if (loaded == total) {
								if ($.isFunction(callback)) {
									callback();
								}
							}
						};
						pic[i].src = imageList[i];
					}
			}
			else {
				pic[0] = new Image();
				pic[0].onload = function() {
					if ($.isFunction(callback)) {
						callback();
					}
				}
				pic[0].src = imageList;
			}
		}
		pic = undefined;
};

function removeCardChecked(){

   const remove = $("#removeCards").attr('checked');

   if(remove === true){

   		return true;
   }

   return false;
}


//Game variables
var currentCard;
var currentPlayer;
var currentBet = 0;

//Number of drinkers displayed in table
var maxDrinkerRows = 10;

//Drink type
var drinkType;

//Images to preload
var preloadImages =['images/allcards.png'];

var gameId;