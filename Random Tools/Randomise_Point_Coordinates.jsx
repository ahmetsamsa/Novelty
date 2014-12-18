﻿/*    Randomise_Point_Coordinates.jsx    Version 1.0    Bruno Herfst 2014    This script randomises the coordinates of all points of a given object*/#target InDesignvar Settings = {    randomisePoints   : true,  //	onlyStraightLines : true,  // This will remove all curves	subDevisions      : 2,     // It would be nice if we could set a min-width to balance out short and long distances.	maxmovement       : 0.5    // movement in current measure unit}//Make certain that user interaction (display of dialogs, etc.) is turned on.app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;//Check if we have what we need to run the script.if (app.documents.length == 0){	alert("Open a document before running this script.");	exit();} else if (app.selection.length == 0){	alert("Select an object before running this script");	exit();}var myPathList = new Array;for(var i = 0;i < app.selection.length; i++){	switch (app.selection[i].constructor.name){		case "Rectangle":		case "TextFrame":		case "Oval":		case "Polygon":		case "GraphicLine":		case "Group":		case "PageItem":		myPathList.push(app.selection[i]);		break;	}}if (myPathList.length == 0){	alert ("Select a rectangle or text frame and try again.");	exit;}randomisePaths(myPathList);function randomisePaths(myPathList){	for(var objCount = 0;objCount < myPathList.length; objCount++){		for(var pathCount = 0;pathCount < myPathList[objCount].paths.length; pathCount++){			var myPath = myPathList[objCount].paths[pathCount];			if(Settings.subDevisions > 0){				var counter = 0;				do {				   counter += 1;				   addPoints(myPath);				} while (counter < Settings.subDevisions);			}			if(Settings.randomisePoints){				randomisePathPoints(myPath);			}			if(Settings.onlyStraightLines){				removeCurves(myPath);			}		}	}}function addPoints(myPath){	if(myPath.pathType == PathType.CLOSED_PATH){		var doLastVector = true;	} else if (myPath.pathType == PathType.OPEN_PATH) {		var doLastVector = false;	} else {		alert("Can’t determine path type");		return;	}	var oldPath = handlePath(myPath.entirePath);	var newPath = new Array();	if(oldPath.length > 1){		//add first point to newPath		newPath.push(oldPath[0]);		for(var point = 0;point < oldPath.length-1; point++){ //we process last point later for closed paths only			// Add new interpolated path point with the next			var newSegment = getInterpolatedPoint([ oldPath[point],oldPath[point+1] ]);			// New Segment contains 3 points			// Update last previous handle first			newPath[newPath.length-1][2] = newSegment[0][2];			// Add the other two			newPath.push(newSegment[1]); // New point			newPath.push(newSegment[2]); // Adjusted old point right handle updated next in loop		}		// deal with last point		if(doLastVector){			// Add new interpolated path point with the first			var newSegment = getInterpolatedPoint([ oldPath[oldPath.length-1], oldPath[0] ]);			// Update last handle first			newPath[newPath.length-1][2] = newSegment[0][2];			// Add the mid point			newPath.push(newSegment[1]); // New point			// Update first point			newPath[0][0] = newSegment[2][0];		}		myPath.entirePath = newPath;	}}function getInterpolatedPoint(segment){	// param:  segment: Array of two   points [p1, p2]	// [[leftHandle,actualPoint,rightHandle],[leftHandle,actualPoint,rightHandle]]	// return: segment: Array of three points [p1, p0, p2] where p0 is interpolated	var p1 = segment[0];	var p2 = segment[1];	var p0 = [0,0,0];	try{		if(p1.length == 3 && p2.length == 3){			/*			given  midpoint  midpoint  midpoint			(0, 0)				  \				   (1/2, 0)				  /        \			(1, 0)          (3/4, 1/4)				  \        /          \				   (1, 1/2)            (3/4, 1/2)				  /        \          /			(1, 1)          (3/4, 3/4)				  \        /				   (1/2, 1)				  /			(0, 1)			*/			var p1actualPoint = p1[1];			var p1rightHandle = p1[2];			var p2leftHandle  = p2[0];			var p2actualPoint = p2[1];			//MIDPOINT 3			var p1mid = getHalfwayPoint(p1actualPoint,p1rightHandle);			var p0mid = getHalfwayPoint(p1rightHandle,p2leftHandle);			var p2mid = getHalfwayPoint(p2leftHandle,p2actualPoint);			//MIDPOINT 2			var p1midpoint = getHalfwayPoint(p1mid,p0mid);			var p2midpoint = getHalfwayPoint(p0mid,p2mid);			//MIDPOINT 1			var p0midpoint = getHalfwayPoint(p1midpoint,p2midpoint);			return [ [p2[0],p1actualPoint,p1mid] , [p1midpoint,p0midpoint,p2midpoint], [p2mid,p2actualPoint,p2[2]] ];		}	}catch(E){		alert("Ooops: " + E);	}	alert("Something went wrong");	exit();}function getHalfwayPoint(p1,p2){	if(p2.length > 2 || p2.length > 2){		alert("getHalfwayPoint: Invalid arguments.");		exit();	}	// param array [x,y] * 2	var p1X = p1[0];	var p1Y = p1[1];	var p2X = p2[0];	var p2Y = p2[1];	var p0X = (p2X-p1X)*0.5 +p1X;	var p0Y = (p2Y-p1Y)*0.5 +p1Y;	//var p0X = (p1X + p2X)*0.5;	//var p0Y = (p1Y + p2Y)*0.5;	return [p0X, p0Y];}function handlePath(myEntirePath){	// Return array of path points with control handles	var newPath = new Array;	for(var point = 0;point < myEntirePath.length; point++){ //we process last point later for closed paths only		if(myEntirePath[point].length == 2){			var actualPoint = myEntirePath[point];			var leftHandle  = myEntirePath[point];			var rightHandle = myEntirePath[point];		} else {			var leftHandle  = myEntirePath[point][0];			var actualPoint = myEntirePath[point][1];			var rightHandle = myEntirePath[point][2];		}		newPath.push([leftHandle,actualPoint,rightHandle]);	}	return newPath;}function removeCurves(myPath){	var oldPath = handlePath(myPath.entirePath);	var newPath = new Array();	if(oldPath.length > 1){		for(var point = 0;point < oldPath.length; point++){ //we process last point later for closed paths only			newPath.push(oldPath[point][1]);		}		myPath.entirePath = newPath;	}}function randomisePathPoints(myPath){	try{		for(var point = 0;point < myPath.pathPoints.length; point++){			var current_X = myPath.pathPoints[point].anchor[0];			var current_Y = myPath.pathPoints[point].anchor[1];			var min_X = current_X - Settings.maxmovement;			var max_X = current_X + Settings.maxmovement;			var min_Y = current_Y - Settings.maxmovement;			var max_Y = current_Y + Settings.maxmovement;			myPath.pathPoints[point].anchor = [randomInRange(min_X,max_X), randomInRange(min_Y,max_Y)];		}	} catch(err){		alert(err);	}}function randomInRange(start,end){	return Math.random() * (end - start) + start;}