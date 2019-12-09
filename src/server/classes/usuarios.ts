// Identificador unico 
// Nombre de la persona 
// Sala a la que pertenece (Comercios u Operadores)


class Usuarios {

    usuarios:Object[] = [];

    constructor() {
        this.usuarios = [];

    }
    // id = folio del socket
    // usuario = correo
    // 

    agregarUsuario(id_socket:any, 
        id_usuario: number,
        usuario_correo: string, 
        sala: string, 
        nombres: string,
        apePat?: string, 
        apeMat?: string, 
        tipo?: string, 
        depend?: string, 
        sexo?: string, 
        estatus?: number) {

        let persona = { 
            id_socket, // ID DEL SOCKET 
            id_usuario,
            usuario_correo,
            sala,
            nombres,
            apePat, 
            apeMat,
            tipo, 
            depend, 
            sexo,
            estatus };
        this.usuarios.push(persona);
        return this.usuarios;
    }

    getPersona(id_socket: any) {
        let persona = this.usuarios.filter((persona: any) => {
            return persona.id_socket === id_socket;
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

    borrarPersona(id_socket: string) {
        let personaBorrada = this.getPersona(id_socket);

        this.usuarios = this.usuarios.filter((persona: any) => {
            return persona.id_socket != id_socket
        })

        return personaBorrada;
    }
}

module.exports = {
    Usuarios
}