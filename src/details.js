var app = angular.module("detailApp", []);



app.controller("detailController", function($scope) {
	$scope.showDetail = false;

	$scope.user = {
		"firstName": "Harry",
		"lastName": "Potter",
		"email": "harrypotter@hogwarts.edu"
	};
});

//should probably have this be a single-page application... That way passing info to the scope for display is easier.

//also, can just hide the map page.
//also, it should hold the results of any search the user just performed, correct?

