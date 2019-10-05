"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
var MySQL = /** @class */ (function () {
    function MySQL() {
        this.conectado = false;
        console.log('Clase inicializada de MYSQL');
        // Configuración de la conexion de la DB 
        this.cnn = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'M7750la?',
            database: 'db_btn_panico'
        });
        this.conectarDB();
    }
    Object.defineProperty(MySQL, "instance", {
        // Evita que se creen varias instancias de la clase 
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    MySQL.ejecutarQuery = function (query, callback) {
        this.instance.cnn.query(query, function (err, results, fields) {
            if (err) {
                console.log('==== Error en Query');
                return callback(err);
            }
            if (results.length === 0) {
                callback('El registro solicitado no existe');
            }
            else {
                callback(null, results);
            }
        });
    };
    MySQL.prototype.conectarDB = function () {
        var _this = this;
        this.cnn.connect(function (err) {
            if (err) {
                console.log(err.message);
                return;
            }
            _this.conectado = true;
            console.log('Base de datos conectada con éxito');
        });
    };
    return MySQL;
}());
exports.default = MySQL;
