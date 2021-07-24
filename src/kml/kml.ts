const parseKML = require('parse-kml');
var turf = require('@turf/turf');

export default class KML {
  
  private static _instance: KML;
  geoJSON: any;
  matrizPoligonos: any = [];

  // MUNICIPIOS X SALA 
  // MUNICIPIOS DEL ESTADO 10 -> CON ID EN LA BASE DE DATOS 287 - 325
  C5DURANGO = [5, 1, 20, 8, 21, 28];
  C4GOMEZ = [12, 4, 13, 36, 10, 30, 7, 29, 15, 6, 27, 31];
  C4SANTIAGO = [2, 3, 9, 11, 17, 18, 19, 24, 25, 26, 32, 34, 35, 37, 39];
  C4ELSALTO = [23, 14, 33, 16, 22, 38];
  // NO MOVER EL ORDEN, TIENE RELACIÓN CON EL SWITCH DE ABAJO buscarMunicipio()
  salasMunicipios = [this.C5DURANGO, this.C4GOMEZ, this.C4SANTIAGO, this.C4ELSALTO];

  constructor(){
    this.inicializar();
  }

  private inicializar(){

    let RUTA = './files/Mis_poligonos_centros.kml';
    if(process.env.RUTAFILES){
      RUTA = process.env.RUTAFILES + 'Mis_poligonos_centros.kml';
    }

    parseKML
      .toJson(RUTA)
      .then((json: any) => {
        console.log('********* ÉXITO AL PARSEAR ACHIVO KML');
          this.geoJSON = json;
        })
      .catch( (error: any) => console.log('Error al parsear KML to JSON', error));
  }

  public static get instance(){
    return this._instance || (this._instance = new this());
  }

  buscarSala(data: any){
    return new Promise( (resolve, reject) => {
      if(data.latitud){
        this.buscarPoligono(data).then( (intersecciones: any) => {
          let polig:any = {};
          intersecciones.forEach((figura: any) => {
            if(figura?.geometry){
              return polig = figura; 
            }
          });
          
          if(polig?.geometry){
            // REGRESAR EL NOMBRE DE LA SALA
            resolve(polig.properties.name);
          } else {
            // NO EXISTIÓ EN NINGUNA SALA
            reject('');
          }
        }).catch((error: any) => {
          // console.log('CATCH BUSCAR POLIGONO: ' + error);
          reject(error);
        });
      } else if (data.clave_municipio){
        this.buscarMunicipio(data.id_municipio, data.clave_municipio).then( (sala: any) => {
          resolve(sala);
        }).catch(( error: any) => {
          // console.log('CATCH BUSCAR MUNICIPIO: ' + error);
          reject(error);
        });
      } else {
        // No hay forma de determinar la sala
        reject('');
      }
    });
  }


  buscarPoligono(data: any){
    return new Promise( (resolve, reject) => {
      var punto = turf.points([[data.longitud, data.latitud]]);
      var intersecciones = this.geoJSON.features.map(function(poligono: any) {
        if (turf.pointsWithinPolygon(punto, turf.polygon(poligono.geometry.coordinates)).features.length > 0) {
            return poligono;
        }
      });
      resolve(intersecciones);
    });
  }

  buscarMunicipio(id_municipio: number, clave_municipio: any){
    return new Promise( (resolve, reject) => {

      if(id_municipio>= 287 && id_municipio <= 325){

        for (let i = 0; i < this.salasMunicipios.length; i++) {
          const sala: any = this.salasMunicipios[i];
          // console.log('...........');
          for (let j = 0; j < sala.length; j++) {
            // console.log(sala[j] === Number.parseInt(clave_municipio));
            if(sala[j] === Number.parseInt(clave_municipio)){
              // console.log('SE ENCONTRO EN LA POSICIÓN: ' + i);
              switch (i) {
                case 0:
                  // console.log('Durango');
                  resolve('C5DURANGO');
                  break;
                case 1:
                  // console.log('Gomez');
                  resolve('C4GOMEZ');
                  break;
                case 2:
                  // console.log('Santiago');
                  resolve('C4SANTIAGO');
                  break;
                case 3:
                  // console.log('Salto');
                  resolve('C4ELSALTO');
                  break;
              }
            }
          }
        }
        reject('');
      } else {
        // Es de otro estado
        reject('');
      }
    });
  }

}
