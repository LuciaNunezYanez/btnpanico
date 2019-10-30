"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mysql_1 = __importDefault(require("../mysql/mysql"));
var Usuarios = require('../server/classes/usuarios').Usuarios;
var usuarios = new Usuarios();
exports.CONECTADO = function (cliente) {
    console.log("-> CLIENTE CONECTADO - DESCONOCIDO");
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
        var usuariosNITConectados = usuarios.agregarUsuario(cliente.id, usuario.usuario, usuario.nombre, usuario.sala, usuario.apePat, usuario.apeMat, usuario.tipo, usuario.depend, usuario.sexo);
        // SE NOTIFICA NUEVO CLIENTE EN LA SALA NIT
        cliente.broadcast.to(usuario.sala).emit('listaUsuariosNIT', usuarios.getPersonasPorSala(usuario.sala));
        callback(usuarios.getPersonasPorSala(usuario.sala));
    });
    // ========================================
    // CLIENTE DESCONECTADO
    // ========================================
    cliente.on('disconnect', function () {
        // let misSalas = usuarios.getPersonas();
        // console.log('Mis salas: ', misSalas);
        var usuarioEliminado = usuarios.borrarPersona(cliente.id);
        if (usuarioEliminado === undefined) {
            console.log('S<- CLIENTE DESCONECTADO - COMERCIO INACTIVO');
        }
        else {
            if (usuarioEliminado.sala === 'NIT') {
                console.log('<- CLIENTE DESCONECTADO - NIT');
            }
            else if (usuarioEliminado.sala === 'Comercios') {
                console.log('<- CLIENTE DESCONECTADO - COMERCIO ACTIVO');
            }
        }
    });
    // ==================================
    // USUARIOS BOTON DE PANICO 
    // ==================================
    cliente.on('botonActivado', function (comercio) {
        var idComercio = comercio.idComercio, idUsuario = comercio.idUsuario, sala = comercio.sala, fecha = comercio.fecha;
        console.log("Nueva alerta de p\u00E1nico del comercio: " + idComercio + "," + idUsuario + "," + sala + "," + fecha + " ");
        // AGREGAR USUARIO COMERCIO A LA SALA COMERCIOS 
        usuarios.agregarUsuario(cliente.id, idUsuario, idComercio, sala);
        // UNIR EL USUARIO A LA SALA 
        cliente.join(sala);
        //VARIABLES DE INSERCIÓN 
        var nit = 1;
        var cod = idComercio;
        var usuarioo = idUsuario;
        var unidad = 1;
        var fechaDoc = mysql_1.default.instance.cnn.escape('2019-10-28 15:24:55'); // TOMAR MI FECHA Y HORA DEL SISTEMA
        var fechaAtaq = mysql_1.default.instance.cnn.escape(fecha);
        var incidente = 1;
        var emergencia = mysql_1.default.instance.cnn.escape('Desconocida');
        var clasificacion = 1;
        var estatus = 1;
        var conclusion = mysql_1.default.instance.cnn.escape('Pendiente');
        // console.log(`CALL addReporteRtID(${ nit },${ cod },${ usuarioo },${ unidad },${ fechaDoc },
        //     ${ fechaAtaq },${ incidente },${ emergencia },${ clasificacion },${ estatus },${ conclusion }, @last_id);`);
        //     return;
        var addReporte = "CALL addReporteRtID(" + nit + "," + cod + "," + usuarioo + "," + unidad + "," + fechaDoc + ",\n            " + fechaAtaq + "," + incidente + "," + emergencia + "," + clasificacion + "," + estatus + "," + conclusion + ", @last_id);";
        mysql_1.default.ejecutarQuery(addReporte, function (err, id) {
            if (err) {
                console.log('No se pudo agregar reporte: ', err, '--------------------------------------------------');
            }
            else {
                // Se retornan los datos del reporte
                var reporteAgregado = id[0][0].last_id;
                console.log("Se agrego el reporte " + reporteAgregado);
                // Emitir a cliente android que la alerta se recibio 
                cliente.emit('alertaRecibida', 'ALERTA RECIBIDA');
                // Emitir alerta a todos los usuarios NIT
                cliente.broadcast.to('NIT').emit('nuevaAlerta', reporteAgregado);
            }
        });
    });
    cliente.on('datosComercio', function (comercio) {
        // Se recibe el codigo del comercio
        // Se genera alerta en el dashboard 
    });
    cliente.on('fotografias', Object);
};
// Escuchar mensaje de tipo socket ¿De quien? // No se utiliza por el momento
exports.mensaje = function (cliente) {
    cliente.on('mensaje', function (payload) {
        console.log('RECIBIENDO  MENSAJE');
        console.log(payload);
    });
};
