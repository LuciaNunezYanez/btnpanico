// Identificador unico 
// Nombre de la persona 
// Sala a la que pertenece (Comercios u Operadores)


class Usuarios {

    constructor() {
        this.personas = [];

    }

    agregarPersona(id, nombre) {
        let persona = { id, nombre };
        this.persona.push(persona);

        // Retorna todas las personas en el arreglo
        return this.personas;
    }

    getPersona(id) {
        let persona = this.personas.filter(persona => {
            return persona.id === id;
        })[0];

        return persona;
    }

    getPersonas() {
        return this.personas;
    }

    getPersonasPorSala(sala) {
        // ...
    }

    borrarPersona(id) {
        let personaBorrada = this.getPersona(id);

        this.personas = this.personas.filter(persona => {
            return persona.id != id
        })

        return personaBorrada;
    }
}

module.exports = {
    Usuarios
}