import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


interface NutrientesData {
  nitrogeno: number | null;
  fosforo: number | null;
  potasio: number | null;
  calcio: number | null;
  magnesio: number | null;
}

interface DatosSuelosData {
  humedadSuelo: number | null;
  phSuelo: number | null;
  salinidadSuelo: number | null;
  temperaturaSuelo: number | null;
  nutrientes: NutrientesData;
}

interface DatosAmbienteData {
  temperaturaAire: number | null;
  humedadAire: number | null;
  presionAtmosferica: number | null;
  velocidadViento: number | null;
  direccionViento: string | null;
  precipitacionHoy: number | null;
  radiacionSolar: number | null;
}

interface MonitoreoData {
  datos_suelos: DatosSuelosData;
  datos_ambiente: DatosAmbienteData;
  estadoGeneral: string;
  alertaActiva: boolean;
  mensajeAlerta: string;
}


interface ApiPostPayload {
  FECHA_CREACION: string;
  HUMEDAD_SUELO: string;
  PH_SUELO: string;
  SALINIDAD_SUELO: string;
  TEMPERATURA_SUELO: string;
  NITROGENO: string;
  FOSFORO: string;
  POTASIO: string;
  CALCIO: string;
  MAGNESIO: string;
  TEMPERATURA_AIRE: string;
  HUMEDAD_RELATIVA: string;
  PRESION_ATMOSFERICA: string;
  VELOCIDAD_VIENTO: string;
  DIRECCION_VIENTO: string;
  PRECIPITACION: string;
  ESTADO: string; 
  DETALLE: string;
  informeDetalleID: number; 
}

@Component({
  selector: 'app-monitoreo',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './monitoreo.html',
  styleUrl: './monitoreo.css'
})
export class Monitoreo implements OnInit {

  monitoreoData: MonitoreoData = {
    datos_suelos: {
      humedadSuelo: null,
      phSuelo: null,
      salinidadSuelo: null,
      temperaturaSuelo: null,
      nutrientes: {
        nitrogeno: null,
        fosforo: null,
        potasio: null,
        calcio: null,
        magnesio: null
      }
    },
    datos_ambiente: {
      temperaturaAire: null,
      humedadAire: null,
      presionAtmosferica: null,
      velocidadViento: null,
      direccionViento: null,
      precipitacionHoy: null,
      radiacionSolar: null
    },
    estadoGeneral: 'Sin datos',
    alertaActiva: false,
    mensajeAlerta: 'Presiona "Recolectar Datos" para ver la información más reciente.'
  };

  ultimaActualizacion: Date | null = null;
  isLoading: boolean = false;
  private apiUrl = 'http://127.0.0.1:8000/api/informe';

  constructor(private http: HttpClient) { }

  ngOnInit(): void { }

  private getRandomNumber(min: number, max: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round((Math.random() * (max - min) + min) * factor) / factor;
  }

  private determinarEstado(
    humedadSuelo: number,
    phSuelo: number,
    temperaturaAire: number
  ): { estado: string; detalle: string; estadoGeneralDisplay: string; alertaActiva: boolean; mensajeAlertaDisplay: string } {
    let estado = '1';
    let detalle = 'Condiciones óptimas.';
    let estadoGeneralDisplay = 'Óptimo';
    let alertaActiva = false;
    let mensajeAlertaDisplay = 'No se han detectado alertas significativas.';

    if (humedadSuelo < 50) {
      estado = '2';
      detalle = 'Humedad del suelo baja.';
      estadoGeneralDisplay = 'Alerta';
      alertaActiva = true;
      mensajeAlertaDisplay = '¡Alerta: Humedad del suelo baja! Requiere riego.';
    } else if (phSuelo < 5.5 || phSuelo > 7.0) {
      estado = '3';
      detalle = 'pH del suelo fuera de rango ideal.';
      estadoGeneralDisplay = 'Advertencia';
      alertaActiva = true;
      mensajeAlertaDisplay = 'Advertencia: El pH del suelo no es ideal. Considera ajustes.';
    } else if (temperaturaAire > 35) {
      estado = '4';
      detalle = 'Temperatura del aire elevada.';
      estadoGeneralDisplay = 'Crítico';
      alertaActiva = true;
      mensajeAlertaDisplay = '¡Crítico: Temperatura del aire muy alta! Posible estrés por calor.';
    }

    return { estado, detalle, estadoGeneralDisplay, alertaActiva, mensajeAlertaDisplay };
  }

  recolectarDatos(): void {
    this.isLoading = true;

    const humedadSuelo = this.getRandomNumber(40, 85, 2);
    const phSuelo = this.getRandomNumber(5.0, 7.5, 2);
    const salinidadSuelo = this.getRandomNumber(0.5, 2.0, 2);
    const temperaturaSuelo = this.getRandomNumber(20, 35, 2);

    const nitrogeno = this.getRandomNumber(50, 200, 2);
    const fosforo = this.getRandomNumber(20, 100, 2);
    const potasio = this.getRandomNumber(50, 250, 2);
    const calcio = this.getRandomNumber(10, 50, 2);
    const magnesio = this.getRandomNumber(5, 25, 2);

    const temperaturaAire = this.getRandomNumber(20, 40, 2);
    const humedadAire = this.getRandomNumber(50, 95, 2);
    const presionAtmosferica = this.getRandomNumber(980, 1030, 2);
    const velocidadViento = this.getRandomNumber(0, 20, 2);
    const direccionesViento = ["0", "45", "90", "135", "180", "225", "270", "315"];
    const direccionViento = direccionesViento[Math.floor(Math.random() * direccionesViento.length)];
    const precipitacionHoy = this.getRandomNumber(0, 15, 2);
    const radiacionSolar = this.getRandomNumber(500, 1000, 2);

    const { estado, detalle, estadoGeneralDisplay, alertaActiva, mensajeAlertaDisplay } =
      this.determinarEstado(humedadSuelo, phSuelo, temperaturaAire);

    const now = new Date();
    const fechaCreacion = now.getFullYear() + '-' +
                         String(now.getMonth() + 1).padStart(2, '0') + '-' +
                         String(now.getDate()).padStart(2, '0') + ' ' +
                         String(now.getHours()).padStart(2, '0') + ':' +
                         String(now.getMinutes()).padStart(2, '0') + ':' +
                         String(now.getSeconds()).padStart(2, '0');

    const informeDetalleID = Math.floor(this.getRandomNumber(100, 9999, 0)); 

    const payload: ApiPostPayload = {
      FECHA_CREACION: fechaCreacion,
      HUMEDAD_SUELO: humedadSuelo.toFixed(2),
      PH_SUELO: phSuelo.toFixed(2),
      SALINIDAD_SUELO: salinidadSuelo.toFixed(2),
      TEMPERATURA_SUELO: temperaturaSuelo.toFixed(2),
      NITROGENO: nitrogeno.toFixed(2),
      FOSFORO: fosforo.toFixed(2),
      POTASIO: potasio.toFixed(2),
      CALCIO: calcio.toFixed(2),
      MAGNESIO: magnesio.toFixed(2),
      TEMPERATURA_AIRE: temperaturaAire.toFixed(2),
      HUMEDAD_RELATIVA: humedadAire.toFixed(2),
      PRESION_ATMOSFERICA: presionAtmosferica.toFixed(2),
      VELOCIDAD_VIENTO: velocidadViento.toFixed(2),
      DIRECCION_VIENTO: direccionViento,
      PRECIPITACION: precipitacionHoy.toFixed(2),
      ESTADO: estado,
      DETALLE: detalle,
      informeDetalleID: informeDetalleID
    };

    console.log('Enviando datos a la API:', payload);

    this.http.post<any>(this.apiUrl, payload).pipe(
      catchError(error => {
        console.error('Error al enviar datos a la API:', error);
        this.isLoading = false;
        this.monitoreoData.estadoGeneral = 'Error de conexión';
        this.monitoreoData.alertaActiva = true;
        this.monitoreoData.mensajeAlerta = 'Error al conectar con la API o enviar datos.';
        return throwError(() => new Error('Error al enviar datos al servidor.'));
      })
    ).subscribe(response => {
      console.log('Respuesta de la API:', response);

      this.monitoreoData = {
        datos_suelos: {
          humedadSuelo: humedadSuelo,
          phSuelo: phSuelo,
          salinidadSuelo: salinidadSuelo,
          temperaturaSuelo: temperaturaSuelo,
          nutrientes: {
            nitrogeno: nitrogeno,
            fosforo: fosforo,
            potasio: potasio,
            calcio: calcio,
            magnesio: magnesio
          }
        },
        datos_ambiente: {
          temperaturaAire: temperaturaAire,
          humedadAire: humedadAire,
          presionAtmosferica: presionAtmosferica,
          velocidadViento: velocidadViento,
          direccionViento: direccionViento,
          precipitacionHoy: precipitacionHoy,
          radiacionSolar: radiacionSolar
        },
        estadoGeneral: estadoGeneralDisplay,
        alertaActiva: alertaActiva,
        mensajeAlerta: mensajeAlertaDisplay
      };

      this.ultimaActualizacion = now;
      this.isLoading = false;
      console.log('Datos de monitoreo actualizados localmente:', this.monitoreoData);
    });
  }

  getPhClasificacion(ph: number | null): string {
    if (ph === null) return 'N/A';
    if (ph < 5.5) return 'Muy Ácido';
    if (ph >= 5.5 && ph <= 6.5) return 'Ligeramente Ácido a Neutro (Ideal para Aguacate)';
    if (ph > 6.5 && ph <= 7.5) return 'Neutro a Ligeramente Alcalino';
    return 'Alcalino';
  }
}