import express = require('express');
import path = require('path');
import socketIO from 'socket.io';
import http from 'http';

export default class Server{
    private static _instance: Server;
    
    public app: express.Application;
    public port: number;
    public io: socketIO.Server;
    public httpServer: http.Server;

    private constructor(){
        this.port = Number(process.env.PORT) || 3000;
        this.app = express();
        
        // Inicializar conf de sockets 
        this.httpServer = new http.Server( this.app );
        this.io = socketIO(this.httpServer);
        
        this.escucharSockets();
    }

    public static get instance() {
        return this._instance || (this._instance = new this());
    }

    static init(){
        return new Server();
    }

    private publicFolder(){
        const publicPath = path.resolve(__dirname, '../public');
        this.app.use( express.static( publicPath ));
    }

    private escucharSockets(){
        console.log('Escuchando conexiones - SOCKETS ');

        this.io.on('connection', cliente =>{
            console.log('Nuevo cliente conectado a traves de sockets');
        });
    }

    start(callback: any){
        this.httpServer.listen( this.port, callback);
        this.publicFolder();
    }

}
