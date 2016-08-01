app.controller('userCtrl', [
	'$scope', '$http', '$uibModal',
	function($scope, $http, $uibModal) {
		if (typeof user != 'undefined') $scope.user=user;

		$scope.showLogin = function() {
			$uibModal.open({
				templateUrl: 'loginForm.html',
				backdrop: true,
				windowClass: 'modal',
				size: 'lg',
				controller: function($scope, $uibModalInstance) {
					$scope.createAccount=function() {
						var data = JSON.stringify({
							username: $scope.newUsername,
							password: $scope.newPassword
						});
						$http.post('/users/add', data)
							.success(function(data) {
								$scope.accountCreated = data.message;
							})
							.error(function(data) {
								$scope.accountCreationError = data.message;
							});
					};

					$scope.login=function() {
						var data = JSON.stringify({
							username: $scope.username,
							password: $scope.password
						});
						$http.post('/login', data)
							.success(function(data) {
								location.reload();
							})
							.error(function(data) {
								$scope.loginError = data.message;
							});
					}
				}
			});
		};

		$scope.logout = function() {
			$http.get('/logout')
				.then(function(res) {
					location.reload();
				});
		}
	}
]);

app.directive('loginRequired', function() {
	return function(scope, element, attrs) {
		$(element).click(function() {
			if (typeof scope.user == 'undefined') {
				scope.showLogin();
				return false;
			}
			return true;
		});
	};
});