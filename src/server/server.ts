import express = require('express');
import path = require('path');
import socketIO from 'socket.io';
import http from 'http';
import * as socket from '../sockets/sockets'; 
import { Alerta } from '../sockets/sockets';
const { obtenerAlertasPendientes, abrirPeticion } = require('../mysql/mysql-alertas.nit');



export default class Server{
    private static _instance: Server;
    
    public app: express.Application;
    public port: any;
    public io: socketIO.Server;
    public httpServer: http.Server;

    private constructor(){
        this.port = process.env.PORT || 3000;
        this.app = express();
        
        // Inicializar configuración de sockets 
        this.httpServer = new http.Server( this.app );
        this.io = socketIO(this.httpServer);
        
        this.escucharSockets();
    }

    // Evita la declaración de varias instancias 
    public static get instance() {
        return this._instance || (this._instance = new this());
    }

    public emitirNuevaImagen(id_rep: number, data: Object){
        this.io.emit(`nuevaImagen${id_rep}`, data);
    }
    public emitirNuevoAudio(id_rep: number, data: Object){
        this.io.emit(`nuevoAudio${id_rep}`, data);
    }

    static init(){
        return new Server();
    }

    private publicFolder(){
        const publicPath = path.resolve(__dirname, '../public');
        const publicPathArchivos = path.resolve(__dirname, '../public/archivos');
        this.app.use( express.static( publicPath ));
        this.app.use( express.static( publicPathArchivos ));

        //Express HBS
        this.app.set('view engine', 'hbs');
    }

    private escucharSockets(){
        console.log('Escuchando conexiones - SOCKETS ');

        // Escuchar conexion con sockets
        this.io.on('connection', (cliente) =>{
            
            // Escuchar cuando un cliente se conecto
            socket.CONECTADO(cliente);

            // Escuchar si tengo una alerta abierta 
            // ( Moverla a un archivo donde no estorbe. ) 
            cliente.on('alertaAbierta', (data: Alerta, callback: Function) => {

                if(!data.id_reporte || !Number.isInteger(data.id_reporte)){
                    return callback({
                        ok: false, 
                        resp: 'El folio del reporte es inválido.'
                    });
                } else if(!data.id_user_cc || !Number.isInteger(data.id_user_cc)){
                    return callback({
                        ok: false, 
                        resp: 'El usuario es inválido.'
                    });
                }
        
                abrirPeticion(data, ( err: any, resp: any) => {
                    if (err){
                        // Deberia de mostrar una pantalla de alerta de error al abrir petición 
                        return callback({
                            ok: false, 
                            resp: err
                        });
                    } else {
                        // Mandar lista actualizada a todos los usuarios 
                        obtenerAlertasPendientes( (err: any, alertas: Object) => {
                            if(err){
                                // Deberia de mostrar una pantalla de alerta de error al traer la nueva lista
                                return callback({
                                    ok: false, 
                                    resp: err
                                });
                
                            } else {
                                this.io.emit('alertasActualizadas', alertas);
                                callback(null, {
                                    ok: true,     
                                    resp: 'Petición abierta con éxito.'
                                })
                            }
                        });
                    }
                });
            });
        });
    }

    start(callback: any){
        this.httpServer.listen( this.port, callback);
        this.publicFolder();
    }

    

}
