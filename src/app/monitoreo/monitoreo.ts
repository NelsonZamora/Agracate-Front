import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaz para la estructura de los datos del monitoreo
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

@Component({
  selector: 'app-monitoreo',
  imports: [CommonModule],
  templateUrl: './monitoreo.html',
  styleUrl: './monitoreo.css'
})
export class Monitoreo implements OnInit {

  // Objeto principal para almacenar todos los datos del monitoreo
  // Ahora se inicializa directamente en la declaración, garantizando que nunca sea null.
  monitoreoData: MonitoreoData = {
    datos_suelos: {
      humedadSuelo: null,
      phSuelo: null,
      salinidadSuelo: null,
      temperaturaSuelo: null,
      nutrientes: {
        nitrogeno: null,
        fosforo: null, // Corregido para consistencia con la interfaz
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

  constructor() { }

  ngOnInit(): void {
    // Ya no es necesario asignar monitoreoData aquí, ya está inicializado arriba.
  }

  recolectarDatos(): void {
    this.isLoading = true;

    // Simular una llamada a API que devuelve el objeto JSON completo
    setTimeout(() => {
      this.monitoreoData = {
        datos_suelos: {
          humedadSuelo: 68.5,
          phSuelo: 6.3,
          salinidadSuelo: 0.9,
          temperaturaSuelo: 27.8,
          nutrientes: {
            nitrogeno: 80,
            fosforo: 45,
            potasio: 95,
            calcio: 130,
            magnesio: 65
          }
        },
        datos_ambiente: {
          temperaturaAire: 29.5,
          humedadAire: 85,
          presionAtmosferica: 1010,
          velocidadViento: 12,
          direccionViento: "SE",
          precipitacionHoy: 3.5,
          radiacionSolar: 850
        },
        estadoGeneral: "Óptimo",
        alertaActiva: false,
        mensajeAlerta: "No se han detectado alertas significativas."
      };

      this.ultimaActualizacion = new Date();
      this.isLoading = false;
    }, 2000);
  }

  getPhClasificacion(ph: number | null): string {
    if (ph === null) return 'N/A';
    if (ph < 5.5) return 'Muy Ácido';
    if (ph >= 5.5 && ph <= 6.5) return 'Ligeramente Ácido a Neutro (Ideal para Aguacate)';
    if (ph > 6.5 && ph <= 7.5) return 'Neutro a Ligeramente Alcalino';
    return 'Alcalino';
  }
}