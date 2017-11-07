angular.module('MyApp')
  .controller('pricetrendCtrl', function($scope, $rootScope, $location, $window, $auth, averageprice, averagepricepredict) {
		$rootScope.siteTitle = 'Price Trends';
		$scope.data = [[],[]];
		$scope.labels =[];

		function GetSortOrder(prop) {  
			return function(a, b) {  
					if (a[prop] > b[prop]) {  
							return 1;  
					} else if (a[prop] < b[prop]) {  
							return -1;  
					}  
					return 0;  
			}  
		} 

		Chart.defaults.global.defaultFontColor = '#fff';

		$scope.colors = [
            {
              backgroundColor: "rgba(159,204,0, 0.2)",
              pointBackgroundColor: "rgba(159,204,0, 1)",
              pointHoverBackgroundColor: "rgba(159,204,0, 0.8)",
              borderColor: "rgba(159,204,0, 1)",
              pointBorderColor: '#fff',
              pointHoverBorderColor: "rgba(159,204,0, 1)"
			}, 
			{
				backgroundColor: "rgba(30,0,290, 0.2)",
				pointBackgroundColor: "rgba(30,0,290, 1)",
				pointHoverBackgroundColor: "rgba(30,0,290, 0.8)",
				borderColor: "rgba(30,0,290, 1)",
				pointBorderColor: '#fff',
				pointHoverBorderColor: "rgba(30,0,290, 1)"
			}
          ];
		var numelems = {
            numdays : 25
        }
		averageprice.send(numelems).then(function(response) {
			
			$scope.averageprice = response.data;
			var i = 0;
			var dt = new Date();

			$scope.averageprice.sort(GetSortOrder("dayofyear"));
			var cycle_day = 10
			$scope.averageprice.forEach(function(element) {
				$scope.data[0][i] = element.price;
				$scope.data[1][i] = null;
				dt = new Date(element.dayofyear);
				var str = (dt.getMonth() + 1) + "/" + dt.getDate();
				$scope.labels[i] = str;
				if(element.cycleday){
					cycle_day = element.cycleday
				}
				
				i ++;
			})
			//set the overlap so it is right	
			$scope.data[1][i-1] = $scope.data[0][i-1]
			//initiate the predict elems
			var predictelems={
				prevprevprice : $scope.data[0][i-2],
				prevprice : $scope.data[0][i-1],
				cycle_day: cycle_day,
				brand : "Caltex",
				fueltype: "E10"
			}

			var predictor = function(predictelems, predictionstogo){
				averagepricepredict.send(predictelems).then(function(response){
					$scope.data[0][i] = null
					$scope.data[1][i] = response.data.prediction[0]
					dt.setDate(dt.getDate() + 1);
					$scope.labels[i] = (dt.getMonth() + 1) + "/" + dt.getDate();
					
					i ++;
					predictionstogo --;
					if(predictionstogo > 0){
						predictelems.prevprevprice = predictelems.prevprice;
						predictelems.cycle_day ++;
						predictelems.prevprice = response.data.prediction[0]
						predictor(predictelems, predictionstogo)
					}
						
	
				}).catch(function(response) {
					console.log("error in fetching the average prices")
				});
			}
			predictor(predictelems, 3);
			
			
		}).catch(function(response) {
			console.log("error in fetching the average prices")
		});
		
		

		$scope.onClick = function (points, evt) {
			console.log(points, evt);
		};
		$scope.options = {
			scales: {
			  yAxes: [{
				scaleLabel: {
				  display: true,
				  labelString: 'Price'
				}
			  }],
			  xAxes: [{
				scaleLabel: {
				  display: true,
				  labelString: 'Day'
				}
			  }]
			}     
		  }
  });
