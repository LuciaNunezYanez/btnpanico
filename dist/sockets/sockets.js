"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mysql_1 = __importDefault(require("../mysql/mysql"));
var Usuarios = require('../server/classes/usuarios').Usuarios;
var usuarios = new Usuarios();
exports.CONECTADO = function (cliente) {
    console.log("-> CLIENTE CONECTADO");
    // ==================================
    // USUARIOS NIT
    // ==================================
    cliente.on('loginNIT', function (usuario, callback) {
        if (!usuario.sala) {
            return callback({
                ok: false,
                mensaje: 'La sala es necesaria'
            });
        }
        // EL USUARIO SE UNE A UNA SALA
        cliente.join(usuario.sala);
        console.log("(loginNIT) Usuario " + usuario.usuario + " conectado a la sala " + usuario.sala + ": ");
        // AGREGA EL USUARIO A LA LISTA DE PERSONAS CONECTADAS 
        var misUsuarios = usuarios.agregarPersona(cliente.id, usuario.usuario, usuario.nombre, usuario.apePat, usuario.apeMat, usuario.tipo, usuario.depend, usuario.sexo, usuario.sala);
        // console.log('GET PESONAS POR SALA: ', usuarios.getPersonasPorSala(usuario.sala));
        cliente.broadcast.to(usuario.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(usuario.sala));
        callback(usuarios.getPersonasPorSala(usuario.sala));
    });
    // ========================================
    // CLIENTE DESCONECTADO (NIT y comercios)
    // ========================================
    cliente.on('disconnect', function () {
        // let usuarioBorrado = usuarios.borrarPersona ( cliente.id );
        // if(usuarioBorrado === undefined){
        //     console.log('No se elimino nadie ');
        // } else {
        //     cliente.broadcast.to(usuarioBorrado.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(usuarioBorrado.sala));
        // }
        // const personaBorrada = usuarios.borrarPersona( cliente.id );
        // EMITE SOLO A SU SALA LA NUEVA LISTA DE LOS USUARIOS CONECTADOS
        // cliente.broadcast.to(personaBorrada.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(personaBorrada.sala));
        console.log('<--- CLIENTE DESCONECTADO -- ');
    });
    // ==================================
    // USUARIOS BOTON DE PANICO 
    // ==================================
    cliente.on('botonActivado', function (comercio) {
        var DATA_COMERCIO = comercio;
        console.log("Nueva alerta de p\u00E1nico del comercio: " + DATA_COMERCIO.codigo);
        // Información del comercio
        var codComercio = DATA_COMERCIO.codigo;
        var query = "CALL getComercioID(" + codComercio + ");";
        var dataComercio;
        mysql_1.default.ejecutarQuery(query, function (err, data) {
            if (err) {
                console.log('Ocurrió un error al traer datos del comercio: ', err);
            }
            else {
                dataComercio = data[0][0];
                if (dataComercio === undefined) {
                    console.log("El comercio con codigo " + codComercio + " no existe en la BD.");
                }
                else {
                    //VARIABLES DE INCERCIÓN 
                    var nit = 1;
                    var cod = DATA_COMERCIO.codigo;
                    var usuarioo = DATA_COMERCIO.usuario;
                    var unidad = 1;
                    var fechaDoc = mysql_1.default.instance.cnn.escape('2019-10-22');
                    var fechaAtaq = mysql_1.default.instance.cnn.escape('2019-10-23');
                    var incidente = 1;
                    var emergencia = mysql_1.default.instance.cnn.escape('Desconocida');
                    var clasificacion = 1;
                    var estatus = 1;
                    var conclusion = mysql_1.default.instance.cnn.escape('Pendiente');
                    var addReporte = "CALL addReporteRtID(" + nit + "," + cod + "," + usuarioo + "," + unidad + "," + fechaDoc + ",\n                        " + fechaAtaq + "," + incidente + "," + emergencia + "," + clasificacion + "," + estatus + "," + conclusion + ", @last_id);";
                    //DATA_COMERCIO.fhAtaque
                    mysql_1.default.ejecutarQuery(addReporte, function (err, id) {
                        if (err) {
                            console.log('Ocurrió un error al agregar un reporte: ', err);
                        }
                        else { // Se retornan los datos del reporte
                            console.log("Se agrego el reporte " + id[0][0].last_id);
                            cliente.emit('alertaRecibida', 'Se ha recibido tu alerta');
                            // Se debe enviar la alerta a todos los clientes de ANGULAR
                            // DATA REPORTE en vez de DATA_COMERCIO
                            cliente.broadcast.to('NIT').emit('nuevaAlerta', DATA_COMERCIO);
                        }
                    });
                }
                // console.log('La información del comercio es: ', data[0][0]);
            }
        });
    });
    cliente.on('datosComercio', function (comercio) {
        // Se recibe el codigo del comercio
        // Se genera alerta en el dashboard 
    });
    cliente.on('fotografias', Object);
};
// Escuchar mensaje de tipo socket ¿De quien? 
exports.mensaje = function (cliente) {
    cliente.on('mensaje', function (payload) {
        console.log('RECIBIENDO  MENSAJE');
        console.log(payload);
    });
};
