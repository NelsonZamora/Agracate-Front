import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http'; 
import { Observable, forkJoin } from 'rxjs'; 
import { map, catchError } from 'rxjs/operators'; 
import { of } from 'rxjs';

interface ApiInformeRaw {
  id: number;
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
  created_at: string;
  updated_at: string;
}


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


interface ReporteDetalleData {
  datos_suelos: DatosSuelosData;
  datos_ambiente: DatosAmbienteData;
  estadoGeneral: string;
  alertaActiva: boolean;
  mensajeAlerta: string;
}


interface InformeReporte extends ReporteDetalleData {
  id: string; 
  fecha_creacion: string;
}

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './informes.html',
  styleUrl: './informes.css'
})
export class Informes implements OnInit {

  informes: InformeReporte[] = [];
  selectedReport: InformeReporte | null = null; 
  isModalOpen: boolean = false; 
  isLoading: boolean = false; 
  private apiUrl = 'http://127.0.0.1:8000/api/informe'; 

  constructor(private http: HttpClient) { } 

  ngOnInit(): void {
    this.cargarInformes();
  }

  
  private mapEstado(estadoApi: string): { estadoGeneral: string, alertaActiva: boolean, mensajeAlerta: string } {
    switch (estadoApi) {
      case '1': return { estadoGeneral: 'Óptimo', alertaActiva: false, mensajeAlerta: 'No se han detectado alertas significativas.' };
      case '2': return { estadoGeneral: 'Alerta', alertaActiva: true, mensajeAlerta: '¡Alerta: Revisa los parámetros del cultivo!' };
      case '3': return { estadoGeneral: 'Advertencia', alertaActiva: true, mensajeAlerta: 'Advertencia: Parámetros fuera del rango ideal.' };
      case '4': return { estadoGeneral: 'Crítico', alertaActiva: true, mensajeAlerta: '¡Crítico: Requiere atención inmediata!' };
      default: return { estadoGeneral: 'Desconocido', alertaActiva: false, mensajeAlerta: 'Estado desconocido.' };
    }
  }

  cargarInformes(): void {
    this.isLoading = true;
    this.http.get<ApiInformeRaw[]>(this.apiUrl).pipe(
      map(data => data.map(apiReport => {
        const estadoInfo = this.mapEstado(apiReport.ESTADO);
        
        return {
          id: apiReport.id.toString(), 
          fecha_creacion: apiReport.FECHA_CREACION.split(' ')[0], 
          datos_suelos: {
            humedadSuelo: parseFloat(apiReport.HUMEDAD_SUELO),
            phSuelo: parseFloat(apiReport.PH_SUELO),
            salinidadSuelo: parseFloat(apiReport.SALINIDAD_SUELO),
            temperaturaSuelo: parseFloat(apiReport.TEMPERATURA_SUELO),
            nutrientes: {
              nitrogeno: parseFloat(apiReport.NITROGENO),
              fosforo: parseFloat(apiReport.FOSFORO),
              potasio: parseFloat(apiReport.POTASIO),
              calcio: parseFloat(apiReport.CALCIO),
              magnesio: parseFloat(apiReport.MAGNESIO)
            }
          },
          datos_ambiente: {
            temperaturaAire: parseFloat(apiReport.TEMPERATURA_AIRE),
            humedadAire: parseFloat(apiReport.HUMEDAD_RELATIVA), 
            presionAtmosferica: parseFloat(apiReport.PRESION_ATMOSFERICA),
            velocidadViento: parseFloat(apiReport.VELOCIDAD_VIENTO),
            direccionViento: apiReport.DIRECCION_VIENTO, 
            precipitacionHoy: parseFloat(apiReport.PRECIPITACION),
            radiacionSolar: null 
          },
          estadoGeneral: estadoInfo.estadoGeneral,
          alertaActiva: estadoInfo.alertaActiva,
          mensajeAlerta: estadoInfo.mensajeAlerta
        } as InformeReporte; 
      })),
      catchError(error => {
        console.error('Error al cargar informes:', error);
        this.isLoading = false;
        
        return of([]); 
      })
    ).subscribe(informes => {
      this.informes = informes;
      this.isLoading = false;
      console.log('Informes cargados desde API:', this.informes);
    });
  }

  verDetalles(informe: InformeReporte): void {
    this.selectedReport = informe;
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.selectedReport = null;
  }

  getPhClasificacion(ph: number | null | undefined): string {
    if (ph === null || ph === undefined) return 'N/A';
    if (ph < 5.5) return 'Muy Ácido';
    if (ph >= 5.5 && ph <= 6.5) return 'Ligeramente Ácido a Neutro (Ideal para Aguacate)';
    if (ph > 6.5 && ph <= 7.5) return 'Neutro a Ligeramente Alcalino';
    return 'Alcalino';
  }
}