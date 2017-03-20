angular.module('starter.controllersbancos', [])

.controller('mapaCtrl', function ($scope, $ionicLoading, $http, $ionicPopup, Bancos_cercanos, $cordovaGeolocation, $cordovaNetwork, $timeout) {
                        var infowindow = new google.maps.InfoWindow();
            $scope.datos_creditos = []; // arreglo para almacenar los nombres de los creditos obtenidos del webservice
            $scope.datos_bancos = [] // arreglo para almacenar los bancos obtenidos del webservice que se encuentran a 10 km
            $scope.bancos_con_credito = []; // arreglo para almacenar lo bancos que tienen el credito seleccionado por el usuario
            $scope.creditos_cercanos_bancos = [];
            $scope.credito_seleccionado = {}; // credito seleccionado por el usuario
            var markers = []; // Almacena los marcadores cargados en el mapa
            var radio = 10; // inicializa el rango de busqueda.
            $scope.map = 0;
            var marker_usuario = 0;
            var latitud = 0;
            var longitud = 0;
            var directionsDisplay = 0;
            var directionsService = 0;
            var banderaUbicar = true;
            var banderaSimular = true;
            // Función que se ejecuta cuando la aplicacion se ha iniciado y cargar el mapa
            $scope.mapa = function () {
                var myLatlng = new google.maps.LatLng(-4.007891, -79.211277);
                var mapOptions = {
                    center: myLatlng,
                    zoom: 6,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true, // elimina todos los componentes anteriores mapa
                    mapTypeControl: true

                };
                var map = new google.maps.Map(document.getElementById("map"), mapOptions);
                $scope.map = map;
                mensaje = 'Cargando bancos a ' + radio + ' km de su ubicación';
                alertaCargando(mensaje);
                localizarUsuario();
                $("#target").mousemove(function (event) {
                    mensaje = "<center><i class='ion-arrow-up-a' style='font-size:20px;color: red;'></i><center>Para realizar la Simulación debe <br><b>SELECIONAR UN CREDITO  </b> ";
                    alertaBoton(mensaje);
                });
            }

            //Obtiene los creditos del webservice para cargarlos en el select
            function cargarCreditos() {
                if (banderaSimular) {
                    $("#target").mousemove(function (event) {
                        mensaje = "<center><i class='ion-arrow-up-a' style='font-size:20px;color: red;'></i><center>Para realizar la Simulación debe <br><b>SELECIONAR UN CREDITO  </b> ";
                        alertaBoton(mensaje);

                    });
                }
               
                    $http.get("http://bancos.cis.unl.edu.ec/banco/GetListaCreditos").then(function (response) {
                    $scope.datos_creditos = response.data.result;
                })
            }

            // Función que obtiene la ubicación del usuario y la dibuja en el marcador en
            function localizarUsuario() {
                // if ($cordovaNetwork.isOnline() == true) {
                navigator.geolocation.getCurrentPosition(function (pos) {
                    latitud = pos.coords.latitude;
                    longitud = pos.coords.longitude;
                    var myLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                    if (banderaUbicar) {
                        marker_usuario = new google.maps.Marker({
                            position: myLatLng,
                            icon: "img/usuario.png",
                            map: $scope.map
                        });
                        obtenerBancos(pos.coords.latitude, pos.coords.longitude); // Carga los marcadores en el mapa recive la posicion del usuario y el radio
                    }


                    $scope.map.panTo(marker_usuario.getPosition());


                    $scope.map.setCenter(myLatLng);
                }, function (error) {
                    $ionicLoading.hide();
                    activarGPS();
                }, {maximumAge: 3000, timeout: 5000, enableHighAccuracy: true});
                /* } else {
                 $ionicLoading.hide();
                 mensaje = "Verifique que esté conectado a una red Wifi o sus datos móviles estén acivos, intente nuevamente más tarde.";
                 alertaMensaje(mensaje, "Aceptar", "Compruebe su Conexión")
                 
                 }*/


            }


            // Función  que obtiene los bancos del webservice que se encuentran a 10 km del usuario y llama a la funcion crearMarcadores para visualizarlos en el mapa
            function obtenerBancos(latitud, longitud) {
              
                      $http.get('http://bancos.cis.unl.edu.ec/banco/GetBancosCercanos/' + latitud + '/' + longitud + '/' + radio).then(function (response) {
                    if (JSON.stringify(response.data.result).length === 2) {
                        $ionicLoading.hide();
                        var mensaje = 'No existe bancos a ' + radio + ' km de su ubicación';
                        alertaMensaje(mensaje, "Aceptar", "Mensaje");

                    } else {
                        $scope.datos_bancos = response.data.result;
                        cargarMarcadores(response.data.result);
                        cargarCreditos();
                    }
                }).catch(function (e) {
                    $ionicLoading.hide();
                    mensaje = "Lo sentimos, actualmente existen problemas con el servidor. Intente más tarde";
                    alertaMensaje(mensaje, "Aceptar", "Mensaje");
                });
            }

            // Función que recibe una lista de bancos  y crea los marcadores que se visualizaran en el banco
            function cargarMarcadores(bancos) {
                var limites = new google.maps.LatLngBounds();
                limites.extend(marker_usuario.position);
                directionsDisplay = new google.maps.DirectionsRenderer();
                directionsService = new google.maps.DirectionsService();
                for (var i = 0; i < bancos.length; i++) {
                    var extremo = new google.maps.LatLng({lat: parseFloat(bancos[i].latitud), lng: parseFloat(bancos[i].longitud)});
                    var marker = new google.maps.Marker({
                        map: $scope.map,
                        animation: google.maps.Animation.DROP,
                        icon: 'img/banco_op1.png',
                        position: extremo
                    });
                    limites.extend(marker.position);
                    markers.push(marker);
                    ventanaInformacion(marker, bancos, i);
                }
                $scope.map.fitBounds(limites);
                $ionicLoading.hide();
            }

            // Crea la ventana de informacion del marcador

            var prev_infowindow = false;
            function ventanaInformacion(marker, bancos, i) {

                google.maps.event.addListener(marker, 'click', function () {
                    if (prev_infowindow) {
                        prev_infowindow.close();
                    }

                    prev_infowindow = infowindow;

                    var infoWindowContent = '<div id="iw-container">' +
                            '<div class="iw-title">' +
                            "<label id='nombre' >"
                            + bancos[i].nombreSucursal + "</label>" +
                            "<label id='direccion' class='item item-icon-left'  style='display: none;background:none;'> "
                            + bancos[i].direccion + "</label>" +
                            "<label id='telefono' class='item item-icon-left'  style='display: none;background:none;'>"
                            + bancos[i].telefono + "</label>" +
                            "<label id='distancia' class='item item-icon-left'  style='display: none;background:none;'>"
                            + (parseFloat(bancos[i].distance).toFixed(2)) + "</label>" + '</div>' +
                            '</div>' +
                            "<div id='origen' style='display: none;'>" + bancos[i].latitud + "=" + bancos[i].longitud + "</div>";

                    infowindow.setContent(infoWindowContent);
                    infowindow.open($scope.map, marker);
                    $('#nombre').on('click', function () {
                        var mensaje = "<div id='contenido-infoB' style='margin-top: 4%;'><div style='padding-bottom:16px; ' ><i class='icon ion-location' style='font-size:20px;color: red;'>  </i> " + $('#direccion').text() + "</div>" + "<div style='padding-bottom:16px;'><i class='icon ion-ios-telephone' style='font-size:20px; color: red;'>  </i>  " + $('#telefono').text() + "</div>" + "<div><i class='icon ion-map' style=' font-size:20px; color: red;'>  </i> " + $('#distancia').text() + " km aproximadamente.</div> </div>";
                        alertaRuta(mensaje, "Aceptar", $('#nombre').text(), $('#origen').text().split("=")[0], $('#origen').text().split("=")[1]);

                    });

                });

                google.maps.event.addListener($scope.map, 'click', function () {
                    infowindow.close();
                });

                google.maps.event.addListener(infowindow, 'domready', function () {
                    var iwOuter = $('.gm-style-iw');
                    var iwBackground = iwOuter.prev();
                    iwBackground.children(':nth-child(2)').css({'display': 'none'});
                    iwBackground.children(':nth-child(4)').css({'display': 'none'});
                    iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index': '1'});
                    var iwCloseBtn = iwOuter.next();
                    iwCloseBtn.css({opacity: '1', right: '15px', top: '3px', border: '7px solid #48b5e9', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});
                    if ($('.iw-content').height() < 140) {
                        $('.iw-bottom-gradient').css({display: 'none'});
                    }
                    iwCloseBtn.mousedown(function () {
                        infowindow.close();
                    });
                });
            }

            // Muestra la ventana flotante con la informaciçón
            function alertaRuta(mensaje, btnMensaje, cabecera, latB, longB) {
                var confirmPopup = $ionicPopup.confirm({
                    title: cabecera,
                    template: mensaje,
                    cancelText: 'Ver Ruta',
                    okText: 'Aceptar'

                });
                confirmPopup.then(function (res) {
                    if (!res) {
                        var origen = new google.maps.LatLng({lat: parseFloat(latitud), lng: parseFloat(longitud)});
                        var extremo = new google.maps.LatLng({lat: parseFloat(latB), lng: parseFloat(longB)});
                        directionsDisplay.setMap($scope.map);
                        trazarRutasAuto(directionsDisplay, directionsService, origen, extremo);
                    }
                });
                //infowindow.close();
            }

            // Función que traza la ruta de los bancos
            function trazarRutasAuto(directionsDisplay, directionsService, origen, extremo) {
                var request = {
                    origin: origen,
                    destination: extremo,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                directionsService.route(request, function (response, status) {
                    $ionicLoading.hide();
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                        directionsDisplay.setOptions({suppressMarkers: true});
                    } else {
                        alertaMensaje("No existen rutas entre ambos puntos", "Aceptar", "Mensaje");
                    }
                });
            }

            //Función que consulta en el web service el credito seleccionado por el usuario
            $scope.seleccionarCredito = function (id, credito) {
                $scope.credito_seleccionado = credito;
                if (credito == undefined) {
                    $scope.credito_seleccionado = 4;
                } else {
                    mensaje = "Cargando bancos con el " + credito + ".";
                    alertaCargando(mensaje);
                }

                directionsDisplay.setMap(null);
                eliminarMarcadores();
                $scope.bancos_con_credito = []; // Almacena los bancos que tienen el credito seleccionado
                $scope.creditos_cercanos_bancos = []; // Almacena el credito seleccionado correspondiente a cada banco obtenido a 10 km.

                
                    $http.get("http://bancos.cis.unl.edu.ec/banco/GetCreditoCercanos/" + parseInt(id)).then(function (creditos) {
                    if ($scope.credito_seleccionado == credito) {
                        $ionicLoading.hide();
                        if (JSON.stringify(creditos.data.result).length == 2) {
                            mensajeCredito(credito);
                            $scope.n = 0;
                        } else {
                            for (var i = 0; i < $scope.datos_bancos.length; i++) {
                                for (var j = 0; j < creditos.data.result.length; j++) {
                                    if ($scope.datos_bancos[i].idEmpresa === creditos.data.result[j].idEmpresa) {
                                        $scope.bancos_con_credito.push($scope.datos_bancos[i]);
                                        $scope.creditos_cercanos_bancos.push(creditos.data.result[j]);
                                    }
                                }
                            }

                            if ($scope.bancos_con_credito.length == 0) {
                                mensajeCredito(credito);
                                $scope.n = 0;


                            } else {
                                cargarMarcadores($scope.bancos_con_credito);
                                $('#target').off('mousemove');
                                $scope.n = 1;
                            }
                        }
                    }
                });
            }

            // Cambia el rango de busqueda de los bancos
            $scope.cambiarDistancia = function (rango) {
                radio = parseInt(rango);
                banderaUbicar = true;
                if (radio == rango) {
                    $scope.datos_creditos = [];
                    $scope.mapa();
                    banderaSimular = false;
                    $('#target').unbind('mousemove');
                    $("#target").mousemove(function (event) {
                        mensaje = "<center><i class='ion-arrow-up-a' style='font-size:20px;color: red;'></i><center>Para realizar la Simulación debe <br><b>SELECIONAR UN CREDITO  </b> ";
                        //alertaMensaje(mensaje, "Entendido", "Mensaje");
                        alertaBoton(mensaje);
                    })
                }
            }

            // Método que proporciona información sobre la app
            $scope.ayuda = function () {
                mensaje = "El módulo simulador de crédito ofrece las opciones: <br><br>1. Visualizar la información y ruta de los bancos.</br>2. Simular el crédito de los bancos que se encuentren a 10 km del usuario." +
                        "<br>3. Visualizar el/los banco(os)que tiene mejor alternativa de crédito.</br></br>" +
                        "<b style='color: red'>PASOS:</b> </br>" +
                        "</br><b><center>VISUALIZAR INFORMACIÓN DEL BANCO</center></b>" +
                        "1. Presionar un marcador que represente un banco.</br>2. Presionar la ventana con el nombre del banco. </br>" +
                        "</br><b><center>CAMBIAR RADIO DE BÚSQUEDA </center></b>" +
                        "1. En la parte derecha del mapa se observa una Barra.</br>2. La barra permite elgir un radio de búsqueda de  0 a 10 km</br>3. Soló tiene que elegir el radio </br>" +
                        "<b><center></br> TRAZAR RUTA</i></center></b>" +
                        "1. Ver información. </br>2. Presionar el botón <b>Ver Ruta.</b><br>" +
                        "<br><b><center>SIMULAR CRÉDITO</center></b>" +
                        "1. Seleccionar un crédito.</br>2. Presionar en el botón <b>Simular crédito</b>.</br>3. Llenar los campos del formulario. </br>4. Presionar en el botón <b>Calcular</b>. </br>" +
                        "<b><center> </br>VISUALIZAR BANCO CON MEJOR CREDITO</center></b>" +
                        "1. Simular crédito. </br>2. En la pantalla Resultado colocarse en la <b>Tabla Bancos</b> y buscar la <b>fila</b> de color <b>azul</b>." +
                        " <b><span style='color: red'> </br></br>NOTA:</span></b></br>  <b>La información presentada en el simulador de crédito es referencial y puede ser modificada sin previo aviso.</b>";
                alertaMensaje(mensaje, "Entendido", " <div class='ion-help-circled' style='text-align: left;'> Ayuda</div> ");

            }
          

            // Centra la ubicacion del usuario en el mapa
            $scope.centerOnMe = function () {
                banderaUbicar = false;

                localizarUsuario(0);
            };

            // Función que envia la información obtenida del usuario a la siguiente pantalla
            $scope.calcular = function () {

                Bancos_cercanos.data.bancos = $scope.bancos_con_credito; // Se llama a la factory Bancos cercanos para almacenar los bancos que tienen el mismo credito
                Bancos_cercanos.data.creditos_bancos_cercanos = $scope.creditos_cercanos_bancos.unique(); // Se llama a la factory Bancos cercanos para almacenar los bancos que tienen el mismo credito
                Bancos_cercanos.data.credito_seleccionado = $scope.credito_seleccionado; // Se almacena en la factory Bancos_cercanos el crédito seleccionado
            }

            function activarGPS() {
                cordova.plugins.locationAccuracy.canRequest(function (canRequest) {
                    if (canRequest) {
                        cordova.plugins.locationAccuracy.request(function () {
                        }, function (error) {
                            if (error) {
                                if (error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {
                                    if (window.confirm("No se pudo establecer automáticamente el modo de ubicación. ¿Desea cambiar a la página Configuración de la ubicación y hacerlo manualmente?")) {
                                        cordova.plugins.diagnostic.switchToLocationSettings();
                                    }
                                }
                            }
                        }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
                                );
                    }
                    $scope.datos_creditos = []; // arreglo para almacenar los nombres de los creditos obtenidos del webservice
                    banderaUbicar = true;
                    localizarUsuario();
                });
            }
            // Adapta el mapa a la pantalla
            $scope.$on("$ionicView.enter", function (scopes, states) {
                google.maps.event.trigger($scope.map, 'resize');

            });


            // Función que almacena los marcadores que se encuentran en el mapa
            function agregarMarcadores(map) {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                }
            }
            // Función que elimina los marcadores del mapa
            function eliminarMarcadores() {
                agregarMarcadores(null);
                markers = [];
            }

            // Elimina los bancos repetidos
            Array.prototype.unique = function (a) {
                return function () {
                    return this.filter(a)
                }
            }(function (a, b, c) {
                return c.indexOf(a, b + 1) < 0
            });

            // Muestra un mensaje cuando no hay bancos con un tipo de credito
            function mensajeCredito(credito) {
                $('#target').unbind('mousemove');
                var mensaje = 'No existe bancos a ' + radio + ' km de su ubicación con el ' + credito + ".";
                alertaMensaje(mensaje, "Aceptar", "Mensaje");
                $scope.map.setCenter(marker_usuario.getPosition());


                $("#target").mousemove(function (event) {
                    mensaje = "No existen bancos para realizar la Simulación.";
                    // alertaMensaje(mensaje, "Entendido", "Mensaje");
                    alertaBoton(mensaje);
                });

            }

            // Método para mostrar las alertas
            function alertaMensaje(mensaje, btnMensaje, cabecera) {
                $scope.alertPopup = $ionicPopup.alert({
                    title: cabecera,
                    template: mensaje,
                    okText: btnMensaje
                });
            }

            // Método para mostrar los mensajes de cargando bancos
            function alertaCargando(mensaje) {
                $scope.loading = $ionicLoading.show({
                    content: 'gfg',
                    template: '<ion-spinner icon="bubbles"> </ion-spinner> </br>' + mensaje,
                    showBackdrop: true
                });
            }

            function alertaBoton(mensaje) {
                $ionicLoading.show({
                    template: mensaje,
                    duration: 3000
                })

            }

        })

        //Almacena los bancos a 10 km con el mismo credito
        .factory('Bancos_cercanos', function () {
            return{
                data: {}
            };
        })

.controller('mapaResultadoCtrl', function ($scope, $ionicLoading, $ionicPopup, Bancos_cercanos) {

           $scope.lista_bancos = Bancos_cercanos.data.lista_bancos; // Almacena los bancos con mejor crédito
            $scope.id_bancos_mejor = Bancos_cercanos.data.id_bancos; // almacena los ids de los bancos con mejor credito
            $scope.map1 = 0;
            var marker_usuario = 0;
            var infowindow = new google.maps.InfoWindow();
            var directionsDisplay = 0;
            var directionsService = 0;
            var latitud = 0;
            var longitud = 0;

            // Carga mapa en la pantalla
            $scope.initMapa = function () {

                var myLatlng = new google.maps.LatLng(-4.007891, -79.211277);
                var mapOptions = {
                    center: myLatlng,
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scaleControl: false,
                    streetViewControl: false,
                    zoomControl: false
                };
                var map1 = new google.maps.Map(document.getElementById("map2"), mapOptions);
                $scope.map1 = map1;
                mensaje = 'Cargando banco(os) con mejor crédito';
                alertaCargando(mensaje);
                localizarUsuario(1);
            }

            // Obtiene la ubicación del usuario
            function localizarUsuario(bandera) {
               navigator.geolocation.getCurrentPosition(function (pos) {
                   latitud = pos.coords.latitude;
                    longitud = pos.coords.longitude;
                    var myLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                    $scope.map1.setCenter(myLatLng);
                   if (bandera == 1) {
                        marker_usuario = new google.maps.Marker({
                            position: myLatLng,
                            title: "Mi ubicación",
                            icon: "img/usuario.png",
                            map: $scope.map1
                        });
                        cargarMarcadores();
                        $ionicLoading.hide();
                    }
                     
                }, function (error) {
                    $ionicLoading.hide();
                    mensaje = "La aplicación necesita de los servicios del dispositivo. Active su GPS";
                    alerta(mensaje, "Activar", "Alerta");
                }, {maximumAge: 3000, timeout: 5000, enableHighAccuracy: true});
            }

            // Carga los marcadores en el mapa
            function cargarMarcadores() {
                var limites = new google.maps.LatLngBounds();
                limites.extend(marker_usuario.position);
                directionsDisplay = new google.maps.DirectionsRenderer();
                directionsService = new google.maps.DirectionsService();
                for (var i = 0; i < $scope.lista_bancos.length; i++) {
                    var extremo = new google.maps.LatLng({lat: parseFloat($scope.lista_bancos[i].latitud), lng: parseFloat($scope.lista_bancos[i].longitud)});
                    if ($scope.lista_bancos[i].idEmpresa == $scope.id_bancos_mejor[0]) {
                        var marker = marcadorBanco('img/banco_op1.png', extremo);
                    } else if ($scope.lista_bancos[i].idEmpresa == $scope.id_bancos_mejor[1]) {
                        var marker = marcadorBanco('img/banco_op2.png', extremo);
                    } else {
                        var marker = marcadorBanco('img/banco_op3.png', extremo);
                    }
                    limites.extend(marker.position);
                    ventanaInformacion(marker, i);
                }
                $scope.map1.fitBounds(limites);
            }

            // Crea la ventana de información del marcador
            function ventanaInformacion(marker, i) {
                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        var infoWindowContent = '<div id="iw-container">' +
                                '<div class="iw-title">' +
                                "<label id='nombre' >"
                                + $scope.lista_bancos[i].nombreSucursal + "</label>" + '</div>' +
                                "<label id='direccion' class='item item-icon-left'  style='display: none;background:none;'> "
                                + $scope.lista_bancos[i].direccion + "</label>" + '</div>' +
                                "<label id='telefono' class='item item-icon-left'  style='display: none;background:none;'>"
                                + $scope.lista_bancos[i].telefono + "</label>" + '</div>' +
                                "<label id='distancia' class='item item-icon-left'  style='display: none;background:none;'>"
                                + (parseFloat($scope.lista_bancos[i].distance).toFixed(2)) + "</label>" + '</div>' +
                                '</div>' +
                                "<div id='origen' style='display: none;'>" + $scope.lista_bancos[i].latitud + "=" + $scope.lista_bancos[i].longitud + "</div>";
                        infowindow.setContent(infoWindowContent);
                        infowindow.open($scope.map, marker);
                        $('#nombre').on('click', function () {
                            var mensaje = "<div id='contenido-info'><div style='padding-top:4px; padding-bottom:15px; ' ><i class='icon ion-location' style='font-size:20px;color: red;'>  </i> " + $('#direccion').text() + "</div>" + "<div style='padding-bottom:15px;'><i class='icon ion-ios-telephone' style='font-size:20px; color: red;'>  </i>  " + $('#telefono').text() + "</div>" + "<div><i class='icon ion-map' style=' font-size:20px; color: red;'>  </i> " + $('#distancia').text() + " km aproximadamente.</div></div>";
                            alerta(mensaje, "Aceptar", $('#nombre').text(), $('#origen').text().split("=")[0], $('#origen').text().split("=")[1]);
                        });
                    }
                })(marker, i));

                google.maps.event.addListener(infowindow, 'domready', function () {
                    var iwOuter = $('.gm-style-iw');
                    var iwBackground = iwOuter.prev();
                    iwBackground.children(':nth-child(2)').css({'display': 'none'});
                    iwBackground.children(':nth-child(4)').css({'display': 'none'});
                    iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index': '1'});
                    var iwCloseBtn = iwOuter.next();
                    iwCloseBtn.css({opacity: '1', right: '15px', top: '3px', border: '7px solid #48b5e9', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});
                    if ($('.iw-content').height() < 140) {
                        $('.iw-bottom-gradient').css({display: 'none'});
                    }
                    iwCloseBtn.mousedown(function () {
                        infowindow.close();
                    });
                });

                google.maps.event.addListener($scope.map1, 'click', function () {
                    infowindow.close();
                });
            }

            // Función que muestra los datos de los bancos 
            function alerta(mensaje, btnMensaje, cabecera, latB, longB) {
                var confirmPopup = $ionicPopup.confirm({
                    title: cabecera,
                    template: mensaje,
                    cancelText: 'Ver Ruta',
                    okText: 'Aceptar'

                });
                confirmPopup.then(function (res) {
                    if (!res) {
                        var origen = new google.maps.LatLng({lat: parseFloat(latitud), lng: parseFloat(longitud)});
                        var extremo = new google.maps.LatLng({lat: parseFloat(latB), lng: parseFloat(longB)});
                        directionsDisplay.setMap($scope.map1);
                        trazarRutasAuto(directionsDisplay, directionsService, origen, extremo);
                    }
                });
                infowindow.close();
            }

            // Función que traza la ruta de los bancos
            function trazarRutasAuto(directionsDisplay, directionsService, origen, extremo) {
                var request = {
                    origin: origen,
                    destination: extremo,
                    travelMode: google.maps.TravelMode.DRIVING
                };
                directionsService.route(request, function (response, status) {
                    $ionicLoading.hide();
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                        directionsDisplay.setOptions({suppressMarkers: true});
                    } else {
                        alert("No existen rutas entre ambos puntos");
                    }
                });
            }

            // Función que centra el mapa en la ubicación del usuario
            $scope.centerOnMe = function () {
                                localizarUsuario(0);
                
            };

            // Crea el marcador de los bancos
            function marcadorBanco(imagen, extremo) {
                return new google.maps.Marker({
                    map: $scope.map1,
                    animation: google.maps.Animation.DROP,
                    position: extremo,
                    icon: imagen
                });
            }

            // Función que muestra el mensaje de cargando
            function alertaCargando(mensaje) {
                $scope.loading = $ionicLoading.show({
                    content: 'gfg',
                    template: '<ion-spinner icon="bubbles"></ion-spinner> </br> ' + mensaje,
                    showBackdrop: true
                });
            }
        })

.controller('resultadoCtrl', function ($scope, $ionicLoading, Datos_formulario, Bancos_cercanos) {

            $scope.bancos = Bancos_cercanos.data.bancos; // bancos cercanos a 10 km que tienen el credito
            $scope.bancos_credito = Bancos_cercanos.data.creditos_bancos_cercanos; // creditos
            $scope.datos_Ingresados = Datos_formulario.data.formulario; // Datos del obtenidos del formulario
            $scope.credito_seleccionado = Bancos_cercanos.data.credito_seleccionado; // Credito seleccionado por el  usuario
            $scope.id_bancos_mejor = []; // obtener los id de los bancos con mejor opcion
            $scope.bancos_mejor = []; // contiene la informacion bancos que tienen la mejor opcion

            // Función que obtiene los bancos con mejor alternativa de crédito
            listaBancosMejorCredito();
            function listaBancosMejorCredito() {
                 $scope.id_bancos_mejor = []; // obtener los id de los bancos con mejor opcion
            $scope.bancos_mejor = []; // contiene la informacion bancos que tienen la mejor opcion
               
                var c = 0;
                for (var i = 0; i < $scope.bancos_credito.length; i++) {
                    if (($scope.bancos_credito[i].opcion == 1) || ($scope.bancos_credito[i].opcion == 2)) {
                        $scope.id_bancos_mejor.push($scope.bancos_credito[i].idEmpresa); // bancos con mejor opcion
                    } else {
                        c++;
                    }
                }

                // busca los datos por id del banco con mejor opcion
                for (var i = 0; i < $scope.id_bancos_mejor.length; i++) {
                    for (var j = 0; j < $scope.bancos.length; j++) {
                        if ($scope.id_bancos_mejor[i] == $scope.bancos[j].idEmpresa) {
                            $scope.bancos_mejor.push($scope.bancos[j]);
                        }
                    }
                }

                if (($scope.id_bancos_mejor.length >= 1) && (c >= 1)) {
                    document.getElementById('nota').style.display = 'block';
                } else {
                    document.getElementById('mapa').style.display = 'block'
                }
            }

            // Esta función envia los datos al controlador MapaRutaController 
            $scope.verMapa = function () {
                listaBancosMejorCredito();
                Bancos_cercanos.data.lista_bancos = $scope.bancos_mejor;
                Bancos_cercanos.data.id_bancos = $scope.id_bancos_mejor;

            };

            // Esta función almacena la tabla de amortizacion de acuerdo a un tipo de banco.
            $scope.mostrarDatosTabla = function (banco) {
                $scope.loading = $ionicLoading.show({
                    showBackdrop: true
                });
                Bancos_cercanos.data.tabla = banco.TOTALES.tabla_amortizacion;
                $ionicLoading.hide();
            };

        })

.controller('simuladorCreditoCtrl', function ($scope, $ionicLoading, Datos_formulario, $http, Bancos_cercanos) {

            $scope.bancos_credito = Bancos_cercanos.data.creditos_bancos_cercanos; // Contiene los bancos con el credito seleccionado
            $scope.credito_seleccionado = Bancos_cercanos.data.credito_seleccionado; // Contiene el credito seleccionado
            $scope.tabla_SF = []; // Amacena el resultado de la simulacion sistema frances
            $scope.tabla_SA = []; // Amacena el resultado de la simulacion sistema aleman
            $scope.datos_sistemas = []; // Arreglo que almacena los sistemas de amortiación
            $scope.datos_credito = {}; //  Almacena los datos del formulario

            cargarSistemas();
            // Función que obtiene sistemas Amortizacion desde el webservice
           function cargarSistemas() {
                
                $http.get("http://bancos.cis.unl.edu.ec/banco/GetSistemaAmortizacion").then(function (sistemas) {
                    for (var i = 0; i < sistemas.data.result.length; i++) {
                        $scope.datos_sistemas[i] = sistemas.data.result[i].nombreTipoProducto;
                    }
                });
            }

            //Funcion que realiza los calculos dependiendo del sistema de amortizacion
            function calcularCreditos(sistema, monto, plazo) {
                for (var i = 0; i < $scope.bancos_credito.length; i++) {
                    if ($scope.credito_seleccionado === $scope.bancos_credito[i].nombreCategoria) {
                        if ($scope.datos_sistemas[0] === sistema) {
                            $scope.bancos_credito[i].TOTALES = calcularSistemaFrances(monto, plazo, $scope.bancos_credito[i].tasaInteres);
                        } else {
                            $scope.bancos_credito[i].TOTALES = calcularSistemaAleman(monto, plazo, $scope.bancos_credito[i].tasaInteres);
                        }
                    }
                }
                Bancos_cercanos.data.creditos_bancos_cercanos = $scope.bancos_credito;
                $scope.limpiar();
                $ionicLoading.hide();
            }

            // Función que devuelve el resultado de los datos ingresados mediante el sistema frances
            function calcularSistemaFrances(monto, plazo, tasa_interes) {
                var tasa_interes_meses = tasa_interes / (12 * 100);
                var cuota = monto * (tasa_interes_meses / (1 - Math.pow((1 + tasa_interes_meses), -plazo)));
                var saldo_inicial = monto;
                var interes = saldo_inicial * tasa_interes_meses;
                var amortizacion = cuota - interes;
                var saldo_final = saldo_inicial - amortizacion;
                $scope.valor_Total = 0;
                $scope.tabla_SF = [];
                for (var i = 0; i <= plazo; i++) {
                    var resultado = {};
                    if (i === 0) {
                        resultado.i = i;
                        resultado.amortizacion = 0;
                        resultado.interes = 0;
                        resultado.cuota = 0;
                        resultado.saldofinal = saldo_inicial;
                    } else {
                        resultado.i = i;
                        resultado.amortizacion = amortizacion.toFixed(2);
                        resultado.interes = interes.toFixed(2);
                        resultado.cuota = cuota.toFixed(2);
                        resultado.saldofinal = Math.abs(saldo_final.toFixed(2));

                        saldo_inicial = saldo_final;
                        interes = saldo_inicial * tasa_interes_meses;
                        amortizacion = cuota - interes;
                        saldo_final = saldo_inicial - amortizacion;

                        $scope.valor_Total += cuota;
                    }

                    $scope.tabla_SF.push(resultado);
                }
                var data = {};
                data = {
                    tasa_credito: tasa_interes,
                    total_cuota: $scope.valor_Total.toFixed(2),
                    tabla_amortizacion: $scope.tabla_SF
                }
                return data;
            }

            // Función que devuelve el resultado de los datos ingresados mediante el sistema alemán
            function calcularSistemaAleman(monto, plazo, tasa_interes1) {
                var tasa_interes_meses = tasa_interes1 / (12 * 100);
                var amortizacion = monto / plazo;
                var saldo_inicial = 0;
                var tasa_interes = tasa_interes_meses;
                var interes = 0;
                var cuota = 0;
                var saldo_final = monto;
                $scope.valor_total = 0;
                $scope.tabla_SA = [];

                for (var i = 0; i <= plazo; i++) {
                    var resultado = {};
                    if (i === 0) {
                        resultado.i = i;
                        resultado.amortizacion = 0;
                        resultado.interes = 0;
                        resultado.cuota = 0;
                        resultado.saldofinal = monto;
                    } else {
                        saldo_inicial = saldo_final;
                        interes = saldo_final * tasa_interes_meses;
                        cuota = interes + amortizacion;
                        saldo_final = saldo_inicial - amortizacion;

                        resultado.i = i;
                        resultado.amortizacion = amortizacion.toFixed(2);
                        resultado.interes = interes.toFixed(2);
                        resultado.cuota = cuota.toFixed(2);
                        resultado.saldofinal = Math.abs(saldo_final.toFixed(2));
                        $scope.valor_total += cuota;
                    }
                    $scope.tabla_SA.push(resultado);
                }
                var data = {};

                data = {
                    tasa_credito: tasa_interes1,
                    total_cuota: $scope.valor_total.toFixed(2),
                    tabla_amortizacion: $scope.tabla_SA
                }
                return data;
            }
            
            // Funcion que obtiene el banco con el credito menor
            function mejorOpcion() {
                $scope.mejor_credito = []; // mejor tasa de interes
                for (var i = 0; i < $scope.bancos_credito.length; i++) {
                    $scope.mejor_credito[i] = $scope.bancos_credito[i].tasaInteres;
                }
                $scope.mejor = Math.min.apply(null, $scope.mejor_credito);
                for (var i = 0; i < $scope.bancos_credito.length; i++) {
                    if ($scope.bancos_credito.length != 1) {
                        if ($scope.bancos_credito[i].tasaInteres == $scope.mejor) {
                            $scope.bancos_credito[i].opcion = 1;
                        } else {
                            $scope.bancos_credito[i].opcion = 0;
                        }
                    } else {
                        $scope.bancos_credito[i].opcion = 2;
                    }
                }
            }
            
            // Metodo que envia los datos a la otra pantalla
            $scope.guardar = function (datos) {
                $scope.loading = $ionicLoading.show({
                    showBackdrop: true
                });
                mejorOpcion();
                Datos_formulario.data.formulario = datos; // Obtiene los datos del formulario
                calcularCreditos(datos.datos_sistemas, parseInt(datos.monto), parseInt(datos.plazo));
            };

            // VALIDACIONES DE LOS CAMPOS
            validarCampos();
            function validarCampos() {
                $scope.monto_min = valores_minimos(1);
                $scope.monto_max = valores_maximos(1);
                $scope.plazo_min = valores_minimos(2);
                $scope.plazo_max = valores_maximos(2);
            }

            function valores_minimos(n) {
                $scope.mejor_credito = []; // mejor tasa de interes
                for (var i = 0; i < $scope.bancos_credito.length; i++) {
                    if (n == 1) {
                        $scope.mejor_credito[i] = $scope.bancos_credito[i].montoMinimo;
                    } else {
                        $scope.mejor_credito[i] = $scope.bancos_credito[i].plazoMinimo;
                    }
                }
                $scope.mejor = Math.min.apply(null, $scope.mejor_credito);
                return $scope.mejor;
            }

            function valores_maximos(n) {
                $scope.mejor_credito = []; // mejor tasa de interes
                for (var i = 0; i < $scope.bancos_credito.length; i++) {
                    if (n == 1) {
                        $scope.mejor_credito[i] = $scope.bancos_credito[i].montoMaximo;
                    } else {
                        $scope.mejor_credito[i] = $scope.bancos_credito[i].plazoMaximo;
                    }
                }
                $scope.mejor = Math.max.apply(null, $scope.mejor_credito);
                return $scope.mejor;
            }

            // Limpia el formulario
            $scope.form = {};
            $scope.limpiar = function () {
                $scope.datos_credito = {};
                $scope.form.simulador.$setUntouched();
                $scope.form.simulador.$setPristine();
            }
        })

        .factory('Datos_formulario', function () {
            return{
                data: {}
            };
        })

.controller('tablaCtrl', function ($scope,Bancos_cercanos) {
            $scope.tabla = Bancos_cercanos.data.tabla;
        })
