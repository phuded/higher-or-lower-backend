
//Generate drinkers tab
$.generateDrinkersTab = function(id, orderBy, dir){
	//Clear table
	var table = $("#drinkersTab table");
	
	//When clicking on headers - need to show loading again
	$.showLoading(true);
	
	//Get state
	var sDir = table.data("sort");
	
	//If a column has ever been stored
	if(sDir){
		//if same column - flip sort order
		if(sDir.col == id){
			table.data("sort", sDir.dir == "asc" ? {col:id, dir:"desc"} : {col:id, dir:"asc"});
		}
		//else set default column order (per HTML)
		else{
			table.data("sort", {col:id, dir:dir});
		}
	}
	//else set default column order (per HTML)
	else{
		table.data("sort", {col:id ,dir:dir});
	}
	
	//Set var as actual direction
	sDir = table.data("sort").dir;
	//Remove classes from other columns
	table.find("tr th a span.ui-icon").removeClass("ui-icon-arrow-u ui-icon-arrow-d").addClass("ui-icon-info");
	$('.drinkers_header').attr("data-theme","c").removeClass("ui-btn-up-b ui-btn-hover-b").addClass("ui-btn-up-c");
	//Add class to current columns
	table.find("tr th:eq("+id+") a span.ui-icon").removeClass("ui-icon-info").addClass(sDir=="asc"?"ui-icon-arrow-u":"ui-icon-arrow-d");
	table.find("tr th:eq("+id+") a").attr("data-theme", "b").removeClass("ui-btn-up-c ui-btn-hover-c").addClass("ui-btn-up-b");
	
	//Reset/store start position
	table.data("start", 0);
	
	$.generateDrinkersTable(table, orderBy, sDir, MAX_DRINKER_ROWS,0);
};

$.navDrinkersTab = function(direction){

	var table = $("#drinkersTab table");
	var start = table.data("start");
	
	//Depending on direction, add to or remove from start
	if(direction > 0){
		start += MAX_DRINKER_ROWS;
	}
	else if (direction < 0){
		start -= MAX_DRINKER_ROWS;
	}

	//Store start
	table.data("start", start);
	
	var dir = table.data("sort").dir;
	var col = table.data("sort").col;
	
	switch(col){
		case 1: col = 'name'; break;
		case 2:	col = 'maxFingers'; break;
		case 3: col = 'maxCorrect'; break;
        case 4: col = 'maxIncorrect'; break;
	}
	
	//Show loading
	$.showLoading(true);

	$.generateDrinkersTable(table, col, dir, MAX_DRINKER_ROWS, start);
};

$.generateDrinkersTable = function(table, orderBy, sDir, num, start){

	$.ajax({
		type: "GET",
		url: "api/players?order-by=" + orderBy + "&dir=" + sDir + "&num=" + num + "&start=" + start,
		success: function(json){

			//Remove again
			table.find("tr:gt(0)").remove();
			
			//Store max
			table.data("max", json.total);
			
			//Populate
			$.each(json.players, function(index, value){

				table.append("<tr><td>" + (index + start + 1) + "</td><td>" + value.name + "</td><td>" + value.maxFingers + "</td><td>" + value.maxCorrect + "</td><td>" + value.maxIncorrect + "</td></tr>");
			});
			
			//Show or hide nav buttons
			if(start == 0){
				$(".navButtons>a:eq(0)").hide();
			}
			else{
				$(".navButtons>a:eq(0)").show();
			}
			
			if((start + num) >= table.data("max")){
				$(".navButtons>a:eq(1)").hide();
			}
			else{
				$(".navButtons>a:eq(1)").show();
			}
			
			//Show table
			$.showLoading(false);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			table.find("tr:gt(0)").remove();
			$.showLoading(false,true);
		}
	});
};

//Show loading & nav buttons on drinkers tab
$.showLoading = function(show, error){

	if(show){
		var table = $("#drinkersTab table");
		table.find("tr:gt(0)").remove();
		$(".navButtons").hide();
		$(".reloadButton").hide();
		$(".spinner").show();

		return;
	}

    $(".spinner").hide();

    if (error){
        $(".navButtons").hide();
        $(".reloadButton").show();

        return
    }

    $(".navButtons").show();
    $(".reloadButton").hide();

};