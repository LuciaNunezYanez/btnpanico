"use strict";
// Identificador unico 
// Nombre de la persona 
// Sala a la que pertenece (Comercios u Operadores)
var Usuarios = /** @class */ (function () {
    function Usuarios() {
        this.personas = [];
        this.personas = [];
    }
    Usuarios.prototype.agregarPersona = function (id, usuario, nombre, apePat, apeMat, tipo, depend, sexo, sala) {
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
        this.personas.push(persona);
        // Retorna todas las personas en el arreglo
        return this.personas;
    };
    Usuarios.prototype.getPersona = function (id) {
        var persona = this.personas.filter(function (persona) {
            return persona.id === id;
        })[0];
        return persona;
    };
    Usuarios.prototype.getPersonas = function () {
        return this.personas;
    };
    Usuarios.prototype.getPersonasPorSala = function (sala) {
        var usuariosEnSala = this.personas.filter(function (persona) {
            return persona.sala === sala;
        });
        return usuariosEnSala;
    };
    Usuarios.prototype.borrarPersona = function (id) {
        var personaBorrada = this.getPersona(id);
        this.personas = this.personas.filter(function (persona) {
            return persona.id != id;
        });
        return personaBorrada;
    };
    return Usuarios;
}());
module.exports = {
    Usuarios: Usuarios
};
