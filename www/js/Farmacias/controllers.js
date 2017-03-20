angular.module('starter.controllersfarmacia', [])

        .controller('mapaFarmaciaCtrl', function ($scope, $compile, $ionicLoading, $ionicPopup, $timeout, $ionicPopover, $cordovaNetwork) {

            ///VARIABLES GLOBALES
            var direccionServidor = "http://bancos.cis.unl.edu.ec/farmacia/getAll/";
            var datosTemporales = new Array(); // datos temporales que guarda todas las farmacias 
            var datosTemporalesTurno = new Array();
            var limites = new google.maps.LatLngBounds();
            var hoy = new Date();
            var dd = hoy.getDate();
            var mm = hoy.getMonth() + 1; //hoy es 0!
            var yyyy = hoy.getFullYear();
            var fechaCel = new Date().toJSON().slice(0, 10);
            var fecha = "";
            var infoWindow = new google.maps.InfoWindow();
            var radODis = 10;
            var record;
            var recordAux;
            var banderaBuscar = 0;
            var markerUsuario = 0;
            $scope.user = {};
            var prev_infowindow = false;
            var directionsDisplay = 0;
            var directionsService = 0;
            var banderaMarcador = true;



            function dibujarMarcadorMiPos(miUbi, mapa) {
                return new google.maps.Marker({
                    position: miUbi,
                    title: 'Mi ubicacion',
                    icon: 'img/usuario.png',
                    map: mapa
                });

            }

            function opcionesMap(myUbi) {
                return mapOptions = {
                    zoom: 6,
                    center: myUbi,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scaleControl: false,
                    streetViewControl: false,
                    zoomControl: false
                };
            }
            //Función para obtener la informacion del horario de la farmacia
            function formatoInformacionHorario(datosFarmacia) {
                return "<label id='horario' class='item item-icon-left'  style='display: none;background:none;'> " + "*   "
                        + datosFarmacia.descripcion + ": " + "</label>" +
                        "<label id='horaInicio' class='item item-icon-left'  style='display: none;background:none;'> "
                        + datosFarmacia.horaInicioHorario + "</label>" +
                        "<label id='horaFin' class='item item-icon-left'  style='display: none;background:none;'> "
                        + datosFarmacia.horaFinHorario + "</label></div>";
            }
            //Función para obtener la informacion de la farmacia
            function formatoInformacionFarmacia(datosFarmacia, datosHorario) {
                return '<div id="iw-container">' +
                        '<div class="iw-title">' +
                        "<label id='nombreFar' style='background:none; color:white;font-size: 12px; font-weight: bold; font-family: 'Times New Roman', Times, serif;'>"
                        + datosFarmacia.nombreSucursal + "</label>" +
                        "<label id='direccion'   style='display: none;background:none;'> "
                        + datosFarmacia.direccion + "</label>" +
                        "<label id='telefono'   style='display: none;background:none;'>"
                        + datosFarmacia.telefono + "</label>" + datosHorario +
                        "<label id='distancia'   style='display: none;background:none;'>" + ' Aproximadamente a ' +
                        +(parseFloat(datosFarmacia.distancia).toFixed(2)) + ' km ' + "</label>" + '</div>' +
                        '</div>' +
                        "<div id='origen' style='display: none;'>" + datosFarmacia.latitud + "=" + datosFarmacia.longitud + "</div>";

            }
            //Función para cargar los macadores en el mapa y añadir la informacion de la farmacia en contenedor del marcador
            function metodoCargarMarcodores(datosFarmacia, horarios) {
                var posicion = new google.maps.LatLng({lat: parseFloat(datosFarmacia.latitud), lng: parseFloat(datosFarmacia.longitud)});
                limites.extend(markerUsuario.position);
                if (banderaMarcador === true) {
                    var marker = new google.maps.Marker({
                        map: $scope.map,
                        animation: google.maps.Animation.DROP,
                        position: posicion,
                        icon: 'img/farmacia.png'
                    });
                } else {
                    var marker = new google.maps.Marker({
                        map: $scope.map,
                        animation: google.maps.Animation.DROP,
                        position: posicion,
                        icon: 'img/turno.png'
                    });
                }
                limites.extend(marker.position);
                $ionicLoading.hide();
                horarios += formatoInformacionHorario(datosFarmacia);
                var infoWindowContent = formatoInformacionFarmacia(datosFarmacia, horarios);
                addInfoWindow(marker, infoWindowContent);
                $scope.map.fitBounds(limites);
            }

            // Método que proporciona información sobre el la aplicacion de farmacias
            $scope.ayuda = function () {
                mensaje = "<label style='font-weight: bold;'>El módulo de farmacias permite:</label>" +
                        "</br></br><label style='font-weight: bold;'>a.</label> Geolocalizar todas las farmacias o soló las farmacias de turno a 10km de la posición del usuario" +
                        "</br><label style='font-weight: bold;'>b.</label> Buscar farmacia por nombre" +
                        "</br><label style='font-weight: bold;'>c.</label> Visualizar la información de cada una de las farmacias y ver su ruta." +
                        "</br></br><label style='font-weight: bold; color:coral;'>PASOS.</label>" +
                        "</br></br><center> <label style='font-weight: bold;'> BUSCAR POR NOMBRE </label> </center>" +
                        "1. Ingresar el nombre en la caja de texto." +
                        "</br> 2. Clic en el boton <label style='font-weight: bold;'>buscar</label>" +
                        "</br></br><center> <label style='font-weight: bold;'> VISUALIZAR FARMACIAS DE TURNO </label> </center>" +
                        "1. Ir al menu que esta en la parte superior derecha representada por tres puntos." +
                        "</br> 2. Elegir la opción <label style='font-weight: bold;'>Farmacias de Turno.</label>" +
                        "</br> 3. Además puede realizar la busqueda por nombre de las farmcias de turno." +
                        "</br></br><center> <label style='font-weight: bold;'> VISUALIZAR INFORMACIÓN DE LA FARMACIA</label> </center>" +
                        "1. Selecionar un marcador." +
                        "</br> 2. Hacer clic sobre el nombre de la farmacia." +
                        "</br></br><center> <label style='font-weight: bold;'> VISUALIZAR RUTA HACIA LA FARMACIA</label> </center>" +
                        "1. Visualizar la información de la farmacia" +
                        "</br> 2. Elegir la opción <label style='font-weight: bold;'>Ver Ruta</label>." +
                        "</br></br><center> <label style='font-weight: bold;'> CAMBIAR RADIO DE BÚSQUEDA</label> </center>" +
                        "1. En la parte derecha del mapa se observa <label style='font-weight: bold;'>Barra</label>." +
                        "</br> 2. La barra permite elgir un radio de búsqueda de  <label style='font-weight: bold;'>0 a 10 km</label>." +
                        "</br> 3. Soló tiene que elegir el radio";

                alerta(mensaje, "Entendido", "<div class='ion-help-circled' style='text-align: left;'> Ayuda</div>");
            };

            //Funcion refrescar: permite recargar la aplicaion
            $scope.refrescar = function () {
                radODis = 10;
                banderaMarcador = true;
                localizame();
            };

            //Funcion buscar
            $scope.buscadorText = function () {
                if ($scope.user.age == "")
                    alert("Ingrese texto");
                else {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        loadMarkersPorNombre(position.coords.latitude, position.coords.longitude, $scope.user.age);
                    });
                }
            };

            //Funcion que obtiene la ubicacion del usuario
            function localizame() {
                mensaje = 'Cargando farmacias cercanas a ' + radODis + ' KM de su ubicación';
                alertaCargando(mensaje);
                //if ($cordovaNetwork.isOnline() == true) {
                navigator.geolocation.getCurrentPosition(initialize, function (error) {
                    $ionicLoading.hide();
                    cordova.plugins.locationAccuracy.canRequest(function (canRequest) {
                        if (canRequest) {
                            cordova.plugins.locationAccuracy.request(function () {
                            }, function (error) {
                                if (error) {
                                    if (error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {
//                                            if (window.confirm("No se pudo establecer automáticamente el modo de ubicación. ¿Desea cambiar a la página Configuración de la ubicación y hacerlo manualmente?")) {
//                                                cordova.plugins.diagnostic.switchToLocationSettings();
//                                            }
                                    }
                                }
                            }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
                                    );
                        }
                        localizame();
                    });

                }, {maximumAge: 3000, timeout: 3000, enableHighAccuracy: true});
//                } else {
//                    mensaje = "Verifique que esté conectado a una red Wifi o sus datos móviles estén acivos, intente nuevamente más tarde.";
//                    alerta(mensaje, "Aceptar", "Compruebe su Conexión")
//                    $ionicLoading.hide();
//                }

            }

            //Funcion que dibuja la ubicacion del usuario en el mapa y llama al metodo cargar marcadores para visualizarlso en el mapa
            function initialize(position) {
                var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                var map = new google.maps.Map(document.getElementById("map3"), opcionesMap(myLatLng));
                $scope.map = map;
                markerUsuario = dibujarMarcadorMiPos(myLatLng, map);
                $scope.map.setCenter(myLatLng);
                //Carga los marcadores en el mapa recibe la posicion del usuario
                loadMarkers(position.coords.latitude, position.coords.longitude);
            }

            // Función  que obtiene las farmacias del webservice que se encuentran a 10 km del usuario 
            function loadMarkers(lat, lon) {
                $.getJSON(direccionServidor + lat + "/" + lon + "/" + radODis, function (records) {
                    directionsDisplay = new google.maps.DirectionsRenderer();
                    directionsService = new google.maps.DirectionsService();
                    datosTemporales = records;
                    datosTemporalesTurno = records;
                    var farmaciaHorario = "<div>";
                    for (var i = 0; i < records.result.length - 1; i++) {

                        record = records.result[i];
                        recordAux = records.result[i + 1];
                        if (record.nombreSucursal === recordAux.nombreSucursal) {
                            farmaciaHorario += formatoInformacionHorario(record);
                        } else {
                            metodoCargarMarcodores(record, farmaciaHorario, banderaMarcador);
                            farmaciaHorario = "";
                        }
                        if (records.result.length - 1 === (i + 1)) {
                            metodoCargarMarcodores(recordAux, farmaciaHorario, banderaMarcador);
                        }
                    }
                    if (records.result.length <= 1) {
                        mensaje = "No hay farmacias  a " + radODis + " KM de su ubicación";
                        alerta(mensaje, "Aceptar", "CARGANDO FARMACIAS")
                        $ionicLoading.hide();
                    }
                }).fail(function () {
                    //alerta("NO HAY CONEXION CON EL SERVIDOR ");
                    mensaje = "Lo sentimos, actualmente existen problemas con el servidor. Intente mas tarde";
                    alerta(mensaje, "Aceptar", "CARGANDO FARMACIAS")
                    $ionicLoading.hide();
                });

            }

            //Funcion que carga todos las farmacias de turno
            $scope.turnoFarmacia = function () {
                navigator.geolocation.getCurrentPosition(function (position) {
                    loadMarkersPorTurno(position.coords.latitude, position.coords.longitude);
                });

            };
            //Funcion que carga las farmacias que estan de turno a 10 km de la ubicacion del usuario
            function loadMarkersPorTurno(lat, lon) {
                banderaMarcador = false;

                var myLatLng = new google.maps.LatLng(lat, lon);
                var map = new google.maps.Map(document.getElementById("map3"), opcionesMap(myLatLng));
                $scope.map = map;
                markerUsuario = dibujarMarcadorMiPos(myLatLng, map);
                var farmaciaHorario = "<div>";
                var turnoFarmacia = new Array();
                for (var i = 0; i < datosTemporalesTurno.length - 1; i++) {

                    record = datosTemporalesTurno.result[i];
                    recordAux = datosTemporalesTurno.result[i + 1];
                    if ((fechaCel >= record.fechaInicio) && (fechaCel <= record.fechaFin)) {
                        turnoFarmacia.push(datosTemporalesTurno.result[i]);
                        if (record.nombreSucursal === recordAux.nombreSucursal) {
                            farmaciaHorario += formatoInformacionHorario(record);
                        } else {
                            metodoCargarMarcodores(record, farmaciaHorario);
                            farmaciaHorario = "";
                        }
                        if (datosTemporalesTurno.result.length - 1 === (i + 1)) {
                            turnoFarmacia.push(datosTemporalesTurno.result[i + 1]);
                            metodoCargarMarcodores(recordAux, farmaciaHorario);
                        }
                    }
                }

                if (turnoFarmacia.length <= 0) {
                    mensaje = "No hay farmacias en Turno a " + radODis + " KM de su ubicación";
                    alerta(mensaje, "Aceptar", "CARGANDO FARMACIAS")
                    $ionicLoading.hide();
                }
                banderaBuscar = 1;
                datosTemporales = turnoFarmacia;

            }

            //funcion que carga la farmacia que el usuario mando a buscar
            function loadMarkersPorNombre(lat, lon, nombre) {
                var myLatLng = new google.maps.LatLng(lat, lon);
                var map = new google.maps.Map(document.getElementById("map3"), opcionesMap(myLatLng));
                $scope.map = map;
                markerUsuario = dibujarMarcadorMiPos(myLatLng, map);
                var bandera = false;
                var farmaciaHorario = "<div>";
                if (banderaBuscar === 0) {
                    banderaMarcador = true;
                    for (var i = 0; i < datosTemporales.result.length - 1; i++) {
                        record = datosTemporales.result[i];
                        recordAux = datosTemporales.result[i + 1];
                        var rgxp = new RegExp(nombre, "gi");
                        //Buscador: g busqueda global (global match); i ignorar mayúsculas o minúsculas
                        if (record.nombreSucursal === recordAux.nombreSucursal) {
                            if (record.nombreSucursal.match(rgxp) !== null) {
                                farmaciaHorario += formatoInformacionHorario(record);
                                bandera = true;
                            }
                        } else {
                            if (record.nombreSucursal.match(rgxp) !== null) {
                                bandera = true;
                                metodoCargarMarcodores(record, farmaciaHorario);
                                farmaciaHorario = "";
                            }
                        }
                        if (datosTemporales.result.length - 1 === (i + 1)) {

                            if (recordAux.nombreSucursal.match(rgxp) !== null) {
                                bandera = true;
                                metodoCargarMarcodores(recordAux, farmaciaHorario);
                            }
                        }

                    }
                    if (bandera !== true) {
                        mensaje = "No se ha encontrado ninguna farmacia con las iniciales ingresadas. Por favor vuelva a intentarlo";
                        alerta(mensaje, "Aceptar", "BUSCANDO FARMACIAS")

                    }
                } else {
                    banderaMarcador = false;
                    for (var i = 0; i < datosTemporales.length - 1; i++) {
                        record = datosTemporales[i];
                        recordAux = datosTemporales[i + 1];
                        var rgxp = new RegExp(nombre, "gi");
                        //Buscador: g busqueda global (global match); i ignorar mayúsculas o minúsculas
                        if (record.nombreSucursal === recordAux.nombreSucursal) {
                            if (record.nombreSucursal.match(rgxp) !== null) {
                                bandera = true;
                                farmaciaHorario += formatoInformacionHorario(record);
                            }
                        } else {
                            if (record.nombreSucursal.match(rgxp) !== null) {
                                bandera = true;

                                metodoCargarMarcodores(record, farmaciaHorario);
                                farmaciaHorario = "";
                            }
                        }
                        if (datosTemporales.length - 1 === (i + 1)) {
                            if (recordAux.nombreSucursal.match(rgxp) !== null) {
                                bandera = true;

                                metodoCargarMarcodores(recordAux, farmaciaHorario);
                            }
                        }
                    }
                    if (bandera !== true) {
                        mensaje = "No se ha encontrado ninguna farmacia con las iniciales ingresadas. Por favor vuelva a intentarlo";
                        alerta(mensaje, "Aceptar", "BUSCANDO FARMACIAS")
                    }
                }
                $scope.user.age = "";
            }

            //Funcion radio para cargar las farmacias a esa distancia(RADIO)
            $scope.cambiardistancia = function (distancia) {
                radODis = parseInt(distancia);
                $scope.user.age = "";
                banderaMarcador = true;
                localizame();
            };

            $ionicPopover.fromTemplateUrl('popover.html', {
                scope: $scope,
                "backdropClickToClose": true
            }).then(function (popover) {
                $scope.popover = popover;
            });

            $scope.openPopover = function ($event) {
                $scope.popover.show($event);
            };

            function trazarRutasAuto(latOri, lonOri, latExt, lonExt, directionsService, directionsDisplay) {
                var origen = new google.maps.LatLng({lat: parseFloat(latOri), lng: parseFloat(lonOri)});
                var extremo = new google.maps.LatLng({lat: parseFloat(latExt), lng: parseFloat(lonExt)});
                var request = {
                    origin: origen,
                    destination: extremo,
                    travelMode: google.maps.DirectionsTravelMode.DRIVING,
                    provideRouteAlternatives: true
                };

                directionsService.route(request, function (result, status) {});
                directionsService.route(request, function (response, status) {

                    prev_infowindow.close();
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setMap($scope.map);
                        directionsDisplay.setPanel();
                        directionsDisplay.setDirections(response);
                        directionsDisplay.setOptions({suppressMarkers: true});
                    } else {
                        alert("No existen rutas entre ambos puntos");
                    }
                });
            }
            var prev_infowindow = false;
            function addInfoWindow(marker, message) {
                google.maps.event.addListener($scope.map, 'click', function () {
                    infoWindow.close();
                });
                google.maps.event.addListener(infoWindow, 'domready', function () {
                    var iwOuter = $('.gm-style-iw');
                    var iwBackground = iwOuter.prev();
                    iwBackground.children(':nth-child(2)').css({'display': 'none'});
                    iwBackground.children(':nth-child(4)').css({'display': 'none'});
                    iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index': '1'});
                    var iwCloseBtn = iwOuter.next();
                    // Apply the desired effect to the close button
                    iwCloseBtn.css({opacity: '1', right: '15px', top: '3px', border: '7px solid #48b5e9', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});
                    if ($('.iw-content').height() < 140) {
                        $('.iw-bottom-gradient').css({display: 'none'});
                    }
                    iwCloseBtn.mousedown(function () {
                        infoWindow.close();
                    });
                });
                google.maps.event.addListener(marker, 'click', function () {
                    if (prev_infowindow) {
                        prev_infowindow.close();
                    }

                    prev_infowindow = infoWindow;
                    infoWindow.open($scope.map, marker);
                    infoWindow.setContent(message);
                    $('#nombreFar').on('click', function () {
                        var tam = $('div #horario').length;
                        var datosHorario = "</div>";
                        for (var i = 0; i < tam; i++) {
                            datosHorario += $('div #horario').eq(i).text() + "    " +
                                    $('div #horaInicio').eq(i).text().split(":")[0] + ":" + $('div #horaInicio').eq(i).text().split(":")[1] + " a " +
                                    $('div #horaFin').eq(i).text().split(":")[0] + ":" + $('div #horaFin').eq(i).text().split(":")[1] + "<br/>";
                        }
                        var mensaje =
                                "<div  class='list' id='contenido-info' style='margin-top: 10%;'>" +
                                "<div style='padding-bottom:15px;'><i class='icon ion-location' style='font-size:25px; color: red'></i> " + $('#direccion').text() + "</div>" +
                                "<div style='padding-bottom:15px;'><i class='icon ion-ios-telephone' style='font-size:20px; color: red'></i>  " + $('#telefono').text() + "</div>" +
                                "<div style='padding-bottom:15px;'><i class='icon ion-map' style=' font-size:20px; color: red'></i>  " + $('#distancia').text() + "</div>" +
                                "<div style='padding-bottom:15px;'><i class='icon ion-clock' style='font-size:20px; color: red'></i> Horarios:" + datosHorario + "</div>"

                                + "</div> ";
                        informacionFarmacia(mensaje, "Aceptar", $('#nombreFar').text());
                    });
                });

            }

            //Mensaje cuando se carga los marcadores en el mapa
            function alertaCargando(mensaje) {
                $scope.loading = $ionicLoading.show({
                    content: 'gfg',
                    template: '<ion-spinner icon="bubbles"> </ion-spinner> </br>' + mensaje,
                    showBackdrop: true
                });
            }
            // Función que muestra los datos de los farmacias 
            function informacionFarmacia(mensaje, btnMensaje, cabecera) {
                var confirmPopup = $ionicPopup.confirm({
                    title: cabecera,
                    template: mensaje,
                    cancelText: 'Ver Ruta',
                    okText: 'Aceptar'

                });
                confirmPopup.then(function (res) {
                    if (!res) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            trazarRutasAuto(position.coords.latitude, position.coords.longitude, $('#origen').text().split("=")[0], $('#origen').text().split("=")[1], directionsService, directionsDisplay);
                        });
                    }
                });
            }
            //Mensaje de dialogo que muestar ak usuario
            function alerta(mensaje, btnMensaje, cabecera) {
                $scope.alertPopup = $ionicPopup.alert({
                    title: cabecera,
                    template: mensaje,
                    okText: btnMensaje
                });
                $scope.alertPopup.then(function (res) {
                    $scope.popover.hide();
                });
            }
        });
        







