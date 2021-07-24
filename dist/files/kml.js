"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parseKML = require('parse-kml');
var KML_Operations = /** @class */ (function () {
    function KML_Operations() {
        this.parse();
    }
    KML_Operations.prototype.parse = function () {
        parseKML
            .toJson('./Duranyork.kml')
            .then(function (json) { return console.log("Éxito al parsear", json); })
            .catch(console.log('error al parsear'));
    };
    return KML_Operations;
}());
exports.default = KML_Operations;
