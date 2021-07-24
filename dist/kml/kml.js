"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parseKML = require('parse-kml');
var turf = require('@turf/turf');
var KML = /** @class */ (function () {
    function KML() {
        this.matrizPoligonos = [];
        // MUNICIPIOS X SALA 
        // MUNICIPIOS DEL ESTADO 10 -> CON ID EN LA BASE DE DATOS 287 - 325
        this.C5DURANGO = [5, 1, 20, 8, 21, 28];
        this.C4GOMEZ = [12, 4, 13, 36, 10, 30, 7, 29, 15, 6, 27, 31];
        this.C4SANTIAGO = [2, 3, 9, 11, 17, 18, 19, 24, 25, 26, 32, 34, 35, 37, 39];
        this.C4ELSALTO = [23, 14, 33, 16, 22, 38];
        // NO MOVER EL ORDEN, TIENE RELACIÓN CON EL SWITCH DE ABAJO buscarMunicipio()
        this.salasMunicipios = [this.C5DURANGO, this.C4GOMEZ, this.C4SANTIAGO, this.C4ELSALTO];
        this.inicializar();
    }
    KML.prototype.inicializar = function () {
        var _this = this;
        var RUTA = './files/Mis_poligonos_centros.kml';
        if (process.env.RUTAFILES) {
            RUTA = process.env.RUTAFILES + 'Mis_poligonos_centros.kml';
        }
        parseKML
            .toJson(RUTA)
            .then(function (json) {
            console.log('********* ÉXITO AL PARSEAR ACHIVO KML');
            _this.geoJSON = json;
        })
            .catch(function (error) { return console.log('Error al parsear KML to JSON', error); });
    };
    Object.defineProperty(KML, "instance", {
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    KML.prototype.buscarSala = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (data.latitud) {
                _this.buscarPoligono(data).then(function (intersecciones) {
                    var _a;
                    var polig = {};
                    intersecciones.forEach(function (figura) {
                        var _a;
                        if ((_a = figura) === null || _a === void 0 ? void 0 : _a.geometry) {
                            return polig = figura;
                        }
                    });
                    if ((_a = polig) === null || _a === void 0 ? void 0 : _a.geometry) {
                        // REGRESAR EL NOMBRE DE LA SALA
                        resolve(polig.properties.name);
                    }
                    else {
                        // NO EXISTIÓ EN NINGUNA SALA
                        reject('');
                    }
                }).catch(function (error) {
                    // console.log('CATCH BUSCAR POLIGONO: ' + error);
                    reject(error);
                });
            }
            else if (data.clave_municipio) {
                _this.buscarMunicipio(data.id_municipio, data.clave_municipio).then(function (sala) {
                    resolve(sala);
                }).catch(function (error) {
                    // console.log('CATCH BUSCAR MUNICIPIO: ' + error);
                    reject(error);
                });
            }
            else {
                // No hay forma de determinar la sala
                reject('');
            }
        });
    };
    KML.prototype.buscarPoligono = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var punto = turf.points([[data.longitud, data.latitud]]);
            var intersecciones = _this.geoJSON.features.map(function (poligono) {
                if (turf.pointsWithinPolygon(punto, turf.polygon(poligono.geometry.coordinates)).features.length > 0) {
                    return poligono;
                }
            });
            resolve(intersecciones);
        });
    };
    KML.prototype.buscarMunicipio = function (id_municipio, clave_municipio) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (id_municipio >= 287 && id_municipio <= 325) {
                for (var i = 0; i < _this.salasMunicipios.length; i++) {
                    var sala = _this.salasMunicipios[i];
                    // console.log('...........');
                    for (var j = 0; j < sala.length; j++) {
                        // console.log(sala[j] === Number.parseInt(clave_municipio));
                        if (sala[j] === Number.parseInt(clave_municipio)) {
                            // console.log('SE ENCONTRO EN LA POSICIÓN: ' + i);
                            switch (i) {
                                case 0:
                                    // console.log('Durango');
                                    resolve('C5DURANGO');
                                    break;
                                case 1:
                                    // console.log('Gomez');
                                    resolve('C4GOMEZ');
                                    break;
                                case 2:
                                    // console.log('Santiago');
                                    resolve('C4SANTIAGO');
                                    break;
                                case 3:
                                    // console.log('Salto');
                                    resolve('C4ELSALTO');
                                    break;
                            }
                        }
                    }
                }
                reject('');
            }
            else {
                // Es de otro estado
                reject('');
            }
        });
    };
    return KML;
}());
exports.default = KML;
