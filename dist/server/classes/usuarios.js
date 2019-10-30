"use strict";
// Identificador unico 
// Nombre de la persona 
// Sala a la que pertenece (Comercios u Operadores)
var Usuarios = /** @class */ (function () {
    function Usuarios() {
        this.usuarios = [];
        this.usuarios = [];
    }
    Usuarios.prototype.agregarUsuario = function (id, usuario, nombre, sala, apePat, apeMat, tipo, depend, sexo) {
        var persona = {
            id: id,
            usuario: usuario,
            nombre: nombre,
            sala: sala,
            apePat: apePat,
            apeMat: apeMat,
            tipo: tipo,
            depend: depend,
            sexo: sexo
        };
        this.usuarios.push(persona);
        return this.usuarios;
    };
    Usuarios.prototype.getPersona = function (id) {
        var persona = this.usuarios.filter(function (persona) {
            return persona.id === id;
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
    Usuarios.prototype.borrarPersona = function (id) {
        var personaBorrada = this.getPersona(id);
        this.usuarios = this.usuarios.filter(function (persona) {
            return persona.id != id;
        });
        return personaBorrada;
    };
    return Usuarios;
}());
module.exports = {
    Usuarios: Usuarios
};
