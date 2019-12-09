"use strict";
// Identificador unico 
// Nombre de la persona 
// Sala a la que pertenece (Comercios u Operadores)
var Usuarios = /** @class */ (function () {
    function Usuarios() {
        this.usuarios = [];
        this.usuarios = [];
    }
    // id = folio del socket
    // usuario = correo
    // 
    Usuarios.prototype.agregarUsuario = function (id_socket, id_usuario, usuario_correo, sala, nombres, apePat, apeMat, tipo, depend, sexo, estatus) {
        var persona = {
            id_socket: id_socket,
            id_usuario: id_usuario,
            usuario_correo: usuario_correo,
            sala: sala,
            nombres: nombres,
            apePat: apePat,
            apeMat: apeMat,
            tipo: tipo,
            depend: depend,
            sexo: sexo,
            estatus: estatus
        };
        this.usuarios.push(persona);
        return this.usuarios;
    };
    Usuarios.prototype.getPersona = function (id_socket) {
        var persona = this.usuarios.filter(function (persona) {
            return persona.id_socket === id_socket;
        })[0];
        return persona;
    };
    Usuarios.prototype.getPersonas = function () {
        return this.usuarios;
    };
    Usuarios.prototype.getPersonasPorSala = function (sala) {
        var usuariosEnSala = this.usuarios.filter(function (persona) {
            return persona.sala === sala;
        });
        return usuariosEnSala;
    };
    Usuarios.prototype.borrarPersona = function (id_socket) {
        var personaBorrada = this.getPersona(id_socket);
        this.usuarios = this.usuarios.filter(function (persona) {
            return persona.id_socket != id_socket;
        });
        return personaBorrada;
    };
    return Usuarios;
}());
module.exports = {
    Usuarios: Usuarios
};
