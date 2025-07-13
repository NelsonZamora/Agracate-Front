import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { FormsModule } from '@angular/forms';
import informesData from '../data/informes-data.json';

// ✅ Registro de componentes de Chart.js
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

// Interfaces
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

interface InformesJson {
  [key: string]: ReporteDetalleData & { fecha_creacion: string };
}

@Component({
  selector: 'app-tendencias',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
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

  // ✅ Tipo literal para evitar error del template
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
        type: 'linear', // ✅ agregado para que funcione la escala
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

  constructor() { }

  ngOnInit(): void {
    this.loadHistoricalData();
  }

  loadHistoricalData(): void {
    this.isLoading = true;
    setTimeout(() => {
      const data: InformesJson = informesData;
      this.historicalData = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      })).sort((a, b) => new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime());

      this.updateChart();
      this.isLoading = false;
    }, 1500);
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
      values = this.historicalData.map(report => report.datos_ambiente[this.selectedMetric as keyof DatosAmbienteData] as number | null | string);
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
      this.lineChartOptions.scales['y'].title!.text = `${label} (${unit})`;
      this.lineChartOptions.scales['y'].display = (this.selectedMetric !== 'direccionViento');
    }

    // ✅ Ajustar beginAtZero
    const yScale = this.lineChartOptions.scales?.['y'];
    if (yScale && yScale.type === 'linear') {
      yScale.beginAtZero = this.selectedMetric !== 'phSuelo';
    }

    // Forzar actualización
    this.lineChartData = { ...this.lineChartData };
    this.lineChartOptions = { ...this.lineChartOptions };
  }
}
