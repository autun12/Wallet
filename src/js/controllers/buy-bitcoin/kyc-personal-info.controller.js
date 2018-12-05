'use strict';

(function () {

angular
  .module('bitcoincom.controllers')
  .controller('buyBitcoinKycPersonalInfoController',
  buyBitcoinKycPersonalInfoController);

  function buyBitcoinKycPersonalInfoController(
    bitAnalyticsService
    , gettextCatalog
    , $ionicHistory
    , $log
    , kycFlowService
    , moonPayService
    , ongoingProcess
    , popupService
    , moment
    , $scope
  ) {
    var currentState = {};
    var vm = this;

    // Functions
    vm.goBack = goBack;
    vm.onNext = onNext;

    $scope.$on("$ionicView.beforeEnter", onBeforeEnter);
    $scope.$on("$ionicView.beforeLeave", onBeforeLeave);

    function _validateAllFields() {
      return _validateAge() 
      && vm.firstName
      && vm.lastName
      && vm.streetAddress1
      && vm.city
      && vm.postalCode
    }

    function _validateAge() {
      if (vm.dob) {
        var dob = moment(vm.dob, 'DD/MM/YYYY');
        if (moment().diff(dob, 'years') >= 18) {
          return true
        }
      }
      console.log('Age is: ', moment().diff(dob, 'years'));
      return false;
    }

    function _initVariables() {

      vm.submitted = false;

      currentState = kycFlowService.getCurrentStateClone();

      vm.firstName = currentState.firstName ? currentState.firstName : '';
      vm.lastName = currentState.lastName ? currentState.lastName : '';
      vm.dob = currentState.dob ? currentState.dob : '';
      vm.streetAddress = currentState.streetAddress ? currentState.streetAddress : '';
      vm.streetAddress2 = currentState.streetAddress ? currentState.streetAddress2 : '';
      vm.city = currentState.city ? currentState.city : ''; 
      vm.postalCode = currentState.postalCode ? currentState.postalCode : ''; ;
      vm.country = currentState.country ? currentState.country : '';

      vm.countries = [];
      vm.countriesAreLoading = true;

      // Fetch Countries and Documents
      console.log('Fetching Countries!');
      moonPayService.getAllCountries().then(
        function onGetAllCountriesSuccess(countries) {
          vm.countries = countries;
          vm.countriesAreLoading = false;
          console.log('Fetching Countries - SUCCESS!');
          console.log(countries);
        },
        function onGetAllCountriesError(err) {
          console.log('Failed to get countries.', err);
          vm.countriesAreLoading = false;
        }
      );
    }

    function onNext() {
      vm.submitted = true;
      if (!_validateAllFields()) {
        $log.debug('Form incomplete.');
        return;
      }
      // Save current state
      currentState.firstName = vm.firstName
      currentState.lastName = vm.lastName
      currentState.dob = vm.dob
      currentState.streetAddress1 = vm.streetAddress1
      currentState.streetAddress2 = vm.streetAddress2
      currentState.city = vm.city
      currentState.postalCode = vm.postalCode
      currentState.country = vm.country;

      kycFlowService.goNext(currentState);
    }

    function goBack() {
      kycFlowService.goBack();
    }

    function onBeforeEnter(event, data) {
      _initVariables();
      bitAnalyticsService.postEvent('buy_bitcoin_personal_info_screen_open' ,[], ['leanplum']);
    }

    function onBeforeLeave(event, data) {
      bitAnalyticsService.postEvent('buy_bitcoin_ersonal_info_screen_close' ,[], ['leanplum']);
    }
  }
})();
