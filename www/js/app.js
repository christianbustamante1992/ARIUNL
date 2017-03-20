// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllersmedicamentos','starter.servicesmedicamentos','starter.controllersbancos','starter.controllersfarmacia', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function ($ionicConfigProvider) {
    $ionicConfigProvider.views.maxCache(100);
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: ''
  })

    .state('app.inicio', {
    url: '/inicio',
    views: {
      'menuContent': {
        templateUrl: 'templates/inicio.html',
        controller: ''
      }
    }
  })

  .state('app.medicamentoscomerciales', {
    url: '/medicamentoscomerciales',
    views: {
      'menuContent': {
        templateUrl: 'templates/Medicamentos/Comerciales/medcom.html',
        controller: 'CrtlMedCom'
      }
    }
  })

  .state('app.medicamentoscomerciales-farmacias', {
      url: '/medicamentoscomerciales/detallemed/AllFarmacias/:idmed',
      views: {
        'menuContent': {
          templateUrl: 'templates/Medicamentos/Comerciales/farmacias.html',
          controller: 'CtrlListFarm'
        }
      }
    })

  .state('app.medicamentoscomerciales-mapa', {
      url: '/medicamentoscomerciales/detallemed/AllFarmacias/mapa/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/Medicamentos/Comerciales/mapa.html',
          controller: 'CtrlMapa'
        }
      }
    })

    .state('app.medicamentoscomerciales-detalle', {
      url: '/medicamentoscomerciales/detallemed/:idmed/:idpres',
      views: {
        'menuContent': {
          templateUrl: 'templates/Medicamentos/Comerciales/detallemed.html',
          controller: 'CtrlDetalle'
        }
      }
    })

    .state('app.medicamentosgenericos', {
      url: '/medicamentosgenericos',
      views: {
        'menuContent': {
          templateUrl: 'templates/Medicamentos/Genericos/medgen.html',
          controller: 'CrtlMedGen'
        }
      }
    })

    .state('app.medicamentosgenericos-farmacias', {
      url: '/medicamentosgenericos/detallemed/AllFarmacias/:idmed',
      views: {
        'menuContent': {
          templateUrl: 'templates/Medicamentos/Genericos/farmacias.html',
          controller: 'CtrlListFarm'
        }
      }
    })

  .state('app.medicamentosgenericos-mapa', {
      url: '/medicamentosgenericos/detallemed/AllFarmacias/mapa/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/Medicamentos/Genericos/mapa.html',
          controller: 'CtrlMapa'
        }
      }
    })

    .state('app.medicamentosgenericos-detalle', {
      url: '/medicamentosgenericos/detallemed/:idmed/:idpres',
      views: {
        'menuContent': {
          templateUrl: 'templates/Medicamentos/Genericos/detallemed.html',
          controller: 'CtrlDetalle'
        }
      }
    })

    .state('app.farmacia', {
                        url: '/FarmaciaMapa',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/Farmacias/mapaFarmacia.html',
                                controller: 'mapaFarmaciaCtrl'
                            }
                        }
                    })

     .state('app.gasolineras', {
      url: '/gasolineras',
      views: {
        'menuContent': {
          templateUrl: 'templates/Gasolineras/Gasolineras.html',
          controller: ''
        }
      }
    })

    .state('app.mapaBancos', {
                        url: '/scbMapa',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/Bancos/mapaScb.html',
                                controller: 'mapaCtrl'
                            }
                        }
                    })

                    .state('app.simuladorBancos', {
                        url: '/scbSimulador',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/Bancos/simuladorCreditoScb.html',
                                controller: 'simuladorCreditoCtrl'
                            }
                        }
                    })

                    .state('app.resultadoBancos', {
                        url: '/scbResultado',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/Bancos/resultadoScb.html',
                                controller: 'resultadoCtrl'
                            }
                        }
                    })

                    .state('app.tablaBancos', {
                        url: '/scbTabla',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/Bancos/tablaAmortizacion.html',
                                controller: 'tablaCtrl'
                            }
                        }
                    })

                    .state('app.rutaBancos', {
                        url: '/scbMapaRuta',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/Bancos/mapaRuta.html',
                                controller: 'mapaResultadoCtrl'
                            }
                        }
                    });

    // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/inicio');
});
