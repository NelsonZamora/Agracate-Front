import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http'; 
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ScaleOptionsByType } from 'chart.js';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';


import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);


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
  selector: 'app-tendencias',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, HttpClientModule], 
  templateUrl: './tendencias.html',
  styleUrl: './tendencias.css'
})
export class Tendencias implements OnInit {
  historicalData: InformeReporte[] = [];
  isLoading: boolean = false;
  selectedMetric: string = 'humedadSuelo';

  metricsOptions = [
    { value: 'humedadSuelo', label: 'Humedad del Suelo', unit: '%', category: 'suelo' },
    { value: 'phSuelo', label: 'pH del Suelo', unit: '', category: 'suelo' },
    { value: 'salinidadSuelo', label: 'Salinidad del Suelo', unit: 'dS/m', category: 'suelo' },
    { value: 'temperaturaSuelo', label: 'Temperatura del Suelo', unit: '°C', category: 'suelo' },
    { value: 'nitrogeno', label: 'Nitrógeno (Suelo)', unit: 'ppm', category: 'nutrientes' },
    { value: 'fosforo', label: 'Fósforo (Suelo)', unit: 'ppm', category: 'nutrientes' },
    { value: 'potasio', label: 'Potasio (Suelo)', unit: 'ppm', category: 'nutrientes' },
    { value: 'calcio', label: 'Calcio (Suelo)', unit: 'ppm', category: 'nutrientes' },
    { value: 'magnesio', label: 'Magnesio (Suelo)', unit: 'ppm', category: 'nutrientes' },
    { value: 'temperaturaAire', label: 'Temperatura del Aire', unit: '°C', category: 'ambiente' },
    { value: 'humedadAire', label: 'Humedad del Aire', unit: '%', category: 'ambiente' },
    { value: 'presionAtmosferica', label: 'Presión Atmosférica', unit: 'hPa', category: 'ambiente' },
    { value: 'velocidadViento', label: 'Velocidad del Viento', unit: 'km/h', category: 'ambiente' },
    { value: 'direccionViento', label: 'Dirección del Viento', unit: '', category: 'ambiente' },
    { value: 'precipitacionHoy', label: 'Precipitación Hoy', unit: 'mm', category: 'ambiente' },
    { value: 'radiacionSolar', label: 'Radiación Solar', unit: 'W/m²', category: 'ambiente' }
  ];

  public lineChartType: 'line' = 'line';

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: '',
      fill: true,
      tension: 0.3,
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
    }]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const unit = this.metricsOptions.find(m => m.value === this.selectedMetric)?.unit || '';
            return `${label}: ${value} ${unit}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: false,
        title: {
          display: true,
          text: ''
        }
      },
      x: {
        title: {
          display: true,
          text: 'Fecha'
        }
      }
    }
  };

  private apiUrl = 'http://127.0.0.1:8000/api/informe';

  constructor(private http: HttpClient) { } 

  ngOnInit(): void {
    this.loadHistoricalData();
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

  loadHistoricalData(): void {
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
      }).sort((a, b) => new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime())), 
      catchError(error => {
        console.error('Error al cargar datos históricos:', error);
        this.isLoading = false;
        return of([]);
      })
    ).subscribe(reports => {
      this.historicalData = reports;
      this.updateChart(); 
      this.isLoading = false;
      console.log('Datos históricos cargados desde API:', this.historicalData);
    });
  }

  onMetricChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedMetric = target.value;
    this.updateChart();
  }

  updateChart(): void {
    if (this.historicalData.length === 0) return;

    const dates = this.historicalData.map(report => report.fecha_creacion);
    let values: (number | null | string)[] = [];
    let label = '';
    let unit = '';
    let category = '';

    const selectedMetricDef = this.metricsOptions.find(m => m.value === this.selectedMetric);
    if (selectedMetricDef) {
      label = selectedMetricDef.label;
      unit = selectedMetricDef.unit;
      category = selectedMetricDef.category;
    }

    if (category === 'suelo') {
      values = this.historicalData.map(report => report.datos_suelos[this.selectedMetric as keyof DatosSuelosData] as number | null);
    } else if (category === 'ambiente') {
      
      values = this.historicalData.map(report => {
        const value = report.datos_ambiente[this.selectedMetric as keyof DatosAmbienteData];
        return typeof value === 'string' ? value : (value as number | null);
      });
    } else if (category === 'nutrientes') {
      values = this.historicalData.map(report => report.datos_suelos.nutrientes[this.selectedMetric as keyof NutrientesData] as number | null);
    }

    const filteredValues = values.filter(val => typeof val === 'number' && val !== null) as number[];
    const filteredDates = dates.filter((_, index) => typeof values[index] === 'number' && values[index] !== null);

    this.lineChartData = {
      labels: filteredDates,
      datasets: [{
        data: filteredValues,
        label: label,
        fill: true,
        tension: 0.3,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
      }]
    };

    if (this.lineChartOptions.scales && this.lineChartOptions.scales['y']) {
      
      const yTitle = this.lineChartOptions.scales['y'].title;
      if (yTitle) {
        yTitle.text = `${label} (${unit})`;
      }
      this.lineChartOptions.scales['y'].display = (this.selectedMetric !== 'direccionViento');
    }

    const yScale = this.lineChartOptions.scales?.['y'] as ScaleOptionsByType<'linear'>;
    if (yScale) {
        yScale.beginAtZero = this.selectedMetric !== 'phSuelo';
    }

    this.lineChartData = { ...this.lineChartData };
    this.lineChartOptions = { ...this.lineChartOptions };
  }
}