"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
var MySQL = /** @class */ (function () {
    function MySQL() {
        this.conectado = false;
        console.log('Clase inicializada de MYSQL');
        // Configuración de la conexion de la DB LOCAL 
        // this.cnn = mysql.createConnection({
        //     host: 'localhost',
        //     user: process.env.USERDB || 'usuario_final',
        //     password: process.env.PASSWORDB || 'usuario_final',
        //     database: process.env.NAMEDATABASE || 'db_btn_panico_lmp_prueba'
        // });
        // Configuración de la conexion de la DB SERVIDOR 
        // this.cnn = mysql.createConnection({
        //     host: '10.11.118.91',
        //     user: process.env.USERDB || 'root',
        //     password: process.env.PASSWORDB || 'M7750la?',
        //     database: process.env.NAMEDATABASE || 'db_btn_panico_prb'
        // }); 
        this.cnn = mysql.createPool({
            connectionLimit: 100,
            host: '10.11.118.91',
            user: process.env.USERDB || 'root',
            password: process.env.PASSWORDB || 'M7750la?',
            database: process.env.NAMEDATABASE || 'db_btn_panico_fnl',
            debug: false,
            waitForConnections: true
        });
        this.hasError();
        // IP opción 2 
        // host: '10.11.127.70',
        /*var pool = mysql.createPool({
            
            host: '10.11.118.91',
            user: process.env.USERDB || 'root',
            password: process.env.PASSWORDB || 'M7750la?',
            database: process.env.NAMEDATABASE || 'db_btn_panico'
        });
        */
        // Configuración de la conexion de la DB REMOTA EN HEROKU
        // this.cnn = mysql.createConnection({
        //     host: 'us-cdbr-iron-east-05.cleardb.net',
        //     user: 'b2426e4e5d830f',
        //     password: '60ccf3c4',
        //     database: 'heroku_063696d7f49647b'
        // });
        // this.conectarDB();
        // Prueba 02/03/2020
        // En caso de que ocurra un error, volver a realizar la conexión
        // this.cnn.on('error', this.conectarDB);
    }
    Object.defineProperty(MySQL, "instance", {
        // Evita que se creen varias instancias de la clase 
        get: function () {
            return this._instance || (this._instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    MySQL.ejecutarQueryPr = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.instance.cnn.query(query, function (err, results, fields) {
                var _a;
                if (err) {
                    console.log('======== Error al ejecutar query (promesa) ========');
                    // console.log(query);
                    // console.log(err);
                    // console.log('=========================================');
                    return reject(err);
                }
                if (((_a = results) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                    resolve('El registro solicitado no existe');
                }
                else {
                    resolve(results);
                }
            });
        });
    };
    MySQL.ejecutarQuery = function (query, callback) {
        this.instance.cnn.query(query, function (err, results, fields) {
            if (err) {
                console.log('======== Error en Query ========');
                console.log(query);
                console.log(err);
                console.log('================================');
                return callback(err);
            }
            if (results.length === 0) {
                callback(null, 'El registro solicitado no existe');
            }
            else {
                callback(null, results);
            }
        });
    };
    MySQL.prototype.hasError = function () {
        this.cnn.on('error', function (error) {
            console.log('OCURRIO UN ERROR');
            console.log(error.message);
            console.log('.............');
            console.log(error);
        });
        this.cnn.on('connection', function (con) {
            console.log('MySQL conectado... ');
        });
    };
    return MySQL;
}());
exports.default = MySQL;
