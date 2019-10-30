// Identificador unico 
// Nombre de la persona 
// Sala a la que pertenece (Comercios u Operadores)


class Usuarios {

    usuarios:Object[] = [];

    constructor() {
        this.usuarios = [];

    }

    agregarUsuario(id:any, 
        usuario: string, 
        nombre: string,
        sala: string, 
        apePat?: string, 
        apeMat?: string, 
        tipo?: string, 
        depend?: string, 
        sexo?: string) {

        let persona = { 
            id, // ID DEL SOCKET 
            usuario,
            nombre,
            sala,
            apePat, 
            apeMat,
            tipo, 
            depend, 
            sexo};
        this.usuarios.push(persona);
        return this.usuarios;
    }

    getPersona(id: any) {
        let persona = this.usuarios.filter((persona: any) => {
            return persona.id === id;
        })[0];

        return persona;
    }

    getPersonas() {
        return this.usuarios;
    }

    getPersonasPorSala(sala: string ) {
        let usuariosEnSala = this.usuarios.filter( (persona: any) => {
            return persona.sala  === sala;
        });
        return usuariosEnSala;
    }

    borrarPersona(id: string) {
        let personaBorrada = this.getPersona(id);

        this.usuarios = this.usuarios.filter((persona: any) => {
            return persona.id != id
        })

        return personaBorrada;
    }
}

module.exports = {
    Usuarios
}