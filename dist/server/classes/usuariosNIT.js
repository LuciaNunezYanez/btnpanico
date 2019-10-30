"use strict";
// Identificador unico 
// Nombre de la persona 
// Sala a la que pertenece (Comercios u Operadores)
var Usuarios = /** @class */ (function () {
    function Usuarios() {
        this.usuarios = [];
        this.usuarios = [];
    }
    Usuarios.prototype.agregarUsuario = function (id, usuario, nombre, apePat, apeMat, tipo, depend, sexo, sala) {
        var persona = {
            id: id,
            usuario: usuario,
            nombre: nombre,
            apePat: apePat,
            apeMat: apeMat,
            tipo: tipo,
            depend: depend,
            sexo: sexo,
            sala: sala
        };
        this.usuarios.push(persona);
        // Retorna todas las personas en el arreglo
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
