angular.module('starter.servicesmedicamentos', [])

.factory('ServiceMedicamentos', function() {
  
  var farmaciasmedicamento = [];
  

  return {
    setfarmacias: function(data) {
      farmaciasmedicamento = data;
      
    },
    getxdistancia: function(distancia) {
      var farmacias = [];
     for (var i = 0; i < farmaciasmedicamento.length; i++) {
        if (Number(farmaciasmedicamento[i].distancia) < distancia) {
          farmacias[i] = farmaciasmedicamento[i];
        }
      }
      return farmacias;
    },
    get: function (id) {
    	for (var i = 0; i < farmaciasmedicamento.length; i++) {
        if (Number(farmaciasmedicamento[i].idSucursal) === Number(id)) {
          return farmaciasmedicamento[i];
        }
      }
      return null;
    },
    getall: function () {
      return farmaciasmedicamento;
    }
  };
});
