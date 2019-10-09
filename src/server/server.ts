import express = require('express');
import path = require('path');
import socketIO from 'socket.io';
import http from 'http';
import * as socket from '../sockets/sockets';    

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

    static init(){
        return new Server();
    }

    private publicFolder(){
        const publicPath = path.resolve(__dirname, '../public');
        this.app.use( express.static( publicPath ));

        //Express HBS
        this.app.set('view engine', 'hbs');
    }

    private escucharSockets(){
        console.log('Escuchando conexiones - SOCKETS ');

        // Escuchas conexion con sockets
        this.io.on('connection', (cliente) =>{
            
            // Escuchar los mensajes que se reciben del servidor
            socket.mensaje(cliente);
            
            // Escuchar cuando un cliente se conecto
            socket.CONECTADO(cliente);
            
            // Escuchar cuando un cliente se desconecto 
            socket.DESCONECTADO(cliente);
            
        });
    }

    start(callback: any){
        this.httpServer.listen( this.port, callback);
        this.publicFolder();
    }

}
