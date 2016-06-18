var angularApp = angular.module('dashboard', ['ngMaterial', 'ngMessages']);

angularApp.controller('date', ['$rootScope', '$scope', function ($rootScope, $scope) {
    var date = new Date();
    $rootScope.date = {
        currentDate: ''
    };
    $rootScope.date.currentDate = date;
    $rootScope.heading = {
        title: ''
    }
    $rootScope.heading.title = "DASHBOARD";
}]);

// DashboardAPI is a angularjs service that lets the other controllers in the application to use generic functions such as get, post...
angularApp.factory('DashboardAPI', ['$http', function ($http) {
    var dashboard = {};

    dashboard.get = function (url, success, failure) {
        $http({
            method: 'GET'
            , url: url
        , }).then(success, failure);
    };

    dashboard.post = function (url, data, success, failure) {
        $http({
            method: 'POST'
            , url: url
            , data: data
        , }).then(success, failure);
    };

    return dashboard;
}]);

angularApp.controller('developers', ['$http', '$rootScope', '$scope', 'DashboardAPI', function ($http, $scope, $rootScope, DashboardAPI) {

    var emailId = "karun.krishna.p@gmail.com";
    var saveScheduleUrl = "http://developerdashboard.previewourapp.com/Schedule/SaveSchedule" + "?" + "email=" + emailId;


    function Schedule(userId, date, task) {
        this.UserId = userId;
        this.Date = date;
        this.Tasks = task;
    }

    function getDevelopers() {
        var developersUrl = "http://developerdashboard.previewourapp.com/User/GetAllUsers";
        DashboardAPI.get(developersUrl, showDevelopers, showError);
    }

    function showDevelopers(data) {
        $scope.developers = data.data;
        $scope.schedule = [];
        $scope.developers.forEach(function (developer) {
            getSchedule(developer.Id, convertDatetoString($rootScope.date.currentDate));
        });
    }

    function showError(data) {
        console.log("Error:" + data);
    }

    function getSchedule(developerId, date) {
        var scheduleUrl = "http://developerdashboard.previewourapp.com/Schedule/GetScheduleByUserAndDate?userID=" + developerId + "&" + "date=" + date + "&" + "email=" + emailId;
        DashboardAPI.get(scheduleUrl, displaySchedule, showError);
    }

    function displaySchedule(data) {
        $scope.schedule[data.data.UserId] = data.data.Tasks;
        console.log($scope.schedule[data.data.UserId]);
    }

    function convertDatetoString(date) {
        if (date instanceof Date) {
            var dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
            console.log(dateString);
            return dateString;
        }
    }

    function showSingleView(developer) {
        $scope.IsCurrentViewGrid = false;
        $scope.IsCurrentViewList = true;
        $scope.currentUserId = developer.Id;
        $rootScope.heading.title = developer.Name;
    }

    function showGridView() {
        if ($scope.addingState || $scope.editingState) $scope.cancelTask();
        $scope.IsCurrentViewGrid = true;
        $scope.IsCurrentViewList = false;
        $scope.currentUserId = null;
        $rootScope.heading.title = "DASHBOARD";
    }

    function addTask() {
        $scope.addingState = true;
    }

    function endAddTask() {
        $scope.addingState = false;
    }

    function resetTask() {
        $scope.newTask = {};
    }

    function cancelTask() {
        $scope.newTask = {};
        if ($scope.addingState) {
            $scope.endAddTask();
        } else {
            $scope.endEditTask();
        }
    }

    function submitTask(task) {
        if (task.Billable == 1) {
            task.Billable = true;
        } else {
            task.Billable = false;
        }
        if ($scope.addingState) {
            $scope.schedule[$scope.currentUserId].push(task);
            saveUserSchedule();
            $scope.endAddTask();
        } else {
            $scope.schedule[$scope.currentUserId][$scope.editedIndex] = task;
            saveUserSchedule();
            $scope.endEditTask();
        }
    }

    function saveUserSchedule() {
        var schedule = new Schedule($scope.currentUserId, convertDatetoString($rootScope.date.currentDate), $scope.schedule[$scope.currentUserId]);
        DashboardAPI.post(saveScheduleUrl, schedule, submitReply, showError);
    }

    function submitReply(data) {
        getSchedule($scope.currentUserId, convertDatetoString($rootScope.date.currentDate));
    }

    function editTask(task, index) {
        $scope.editingState = true;
        $scope.editedIndex = index;
        $scope.newTask.Description = task.Description;
        $scope.newTask.Status = task.Status;
        $scope.newTask.Billable = task.Billable;
        $scope.newTask.CompanyId = task.CompanyId;
    }

    function endEditTask() {
        $scope.editingState = false;
    }

    function removeTask(index) {
        $scope.schedule[$scope.currentUserId].splice(index, 1);
        saveUserSchedule();
    }

    // This function moves the task up or down the schedule depending upon the icon that is clicked, it uses simple array manipulation to change the indexes of the tasks.
    function moveTask(index, task, value) {
        $scope.schedule[$scope.currentUserId].splice(index, 1);
        if (value == 1) {
            $scope.schedule[$scope.currentUserId].splice(index - 1, 0, task);
        } else {
            $scope.schedule[$scope.currentUserId].splice(index + 1, 0, task);
        }
        saveUserSchedule();
    }

    // Checking if the value of $rootScope.date has changed, if it changed then get the schedules of users corresponding to that date.
    $rootScope.$watch(function () {
        return $rootScope.date.currentDate;
    }, function (newValue, oldvalue) {
        if (newValue !== oldvalue) {
            $scope.developers.forEach(function (developer) {
                getSchedule(developer.Id, convertDatetoString($rootScope.date.currentDate));
            });
        }
    }, true);

    $scope.addButtonClicked = false;
    $scope.currentUserId = null;
    $scope.IsCurrentViewGrid = true;
    $scope.IsCurrentViewList = false;
    $scope.newTask = {};
    $scope.successAddTask = true;
    $scope.editingState = false;
    $scope.addingState = false;
    $scope.editedIndex = null;

    $scope.showSingleView = showSingleView;
    $scope.addTask = addTask;
    $scope.showGridView = showGridView;
    $scope.endAddTask = endAddTask;
    $scope.submitTask = submitTask;
    $scope.editTask = editTask;
    $scope.endEditTask = endEditTask;
    $scope.resetTask = resetTask;
    $scope.cancelTask = cancelTask;
    $scope.removeTask = removeTask;
    $scope.moveTask = moveTask;

    getDevelopers();
}]);