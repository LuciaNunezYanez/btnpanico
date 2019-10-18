// Identificador unico 
// Nombre de la persona 
// Sala a la que pertenece (Comercios u Operadores)


class Usuarios {

    personas:Object[] = [];

    constructor() {
        this.personas = [];

    }

    agregarPersona(id:any, 
        usuario: string, 
        nombre: string, 
        apePat: string, 
        apeMat: string, 
        tipo: string, 
        depend: string, 
        sexo: string, 
        sala: string ) {

        let persona = { 
            id, // ID DEL SOCKET 
            usuario,
            nombre,
            apePat, 
            apeMat,
            tipo, 
            depend, 
            sexo, 
            sala };
        this.personas.push(persona);

        // Retorna todas las personas en el arreglo
        return this.personas;
    }

    getPersona(id: any) {
        let persona = this.personas.filter((persona: any) => {
            return persona.id === id;
        })[0];

        return persona;
    }

    getPersonas() {
        return this.personas;
    }

    getPersonasPorSala(sala: string ) {
        // ...
    }

    borrarPersona(id: string) {
        let personaBorrada = this.getPersona(id);

        this.personas = this.personas.filter((persona: any) => {
            return persona.id != id
        })

        return personaBorrada;
    }
}

module.exports = {
    Usuarios
}