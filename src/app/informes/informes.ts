import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngFor, *ngIf, etc.
import informesData from '../data/informes-data.json'; // Importa el JSON de ejemplo

// --- Interfaces para la estructura de los datos (las mismas que en MonitoreoComponent) ---
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

// Interfaz para la estructura de un reporte de detalle (lo que se muestra en el modal)
interface ReporteDetalleData {
  datos_suelos: DatosSuelosData;
  datos_ambiente: DatosAmbienteData;
  estadoGeneral: string;
  alertaActiva: boolean;
  mensajeAlerta: string;
}

// Interfaz para un elemento de informe en la lista (incluye el ID y la fecha de creación)
interface InformeReporte extends ReporteDetalleData {
  id: string; // Usamos string porque las claves del JSON son strings ("1", "2")
  fecha_creacion: string; // Formato "YYYY-MM-DD" o "DD-MM-YYYY" como en tu ejemplo
}

// Interfaz para la estructura del JSON importado
interface InformesJson {
  [key: string]: ReporteDetalleData & { fecha_creacion: string };
}

@Component({
  selector: 'app-informes',
  imports: [CommonModule],
  templateUrl: './informes.html',
  styleUrl: './informes.css'
})
export class Informes implements OnInit {

  informes: InformeReporte[] = []; // Lista de informes para mostrar en la tabla
  selectedReport: InformeReporte | null = null; // El informe seleccionado para el modal
  isModalOpen: boolean = false; // Controla la visibilidad del modal

  isLoading: boolean = false; // Para mostrar un estado de carga en la lista

  constructor() { }

  ngOnInit(): void {
    this.cargarInformes();
  }

  cargarInformes(): void {
    this.isLoading = true;
    // Simular una llamada a API
    setTimeout(() => {
      const data: InformesJson = informesData; // Acceder a los datos importados

      // Convertir el objeto JSON en un array de InformeReporte
      this.informes = Object.keys(data).map(key => ({
        id: key, // Asignar la clave como el ID del informe
        ...data[key] // Copiar todas las propiedades del objeto de informe
      }));

      this.isLoading = false;
      console.log('Informes cargados:', this.informes);
    }, 1500); // Simula 1.5 segundos de carga
  }

  verDetalles(informe: InformeReporte): void {
    this.selectedReport = informe;
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.selectedReport = null; // Limpiar el informe seleccionado al cerrar
  }

  // Método de ayuda para clasificar el pH
  // ¡CORRECCIÓN AQUÍ! Ahora acepta 'undefined' como posible valor.
  getPhClasificacion(ph: number | null | undefined): string {
    if (ph === null || ph === undefined) return 'N/A'; // Maneja tanto null como undefined
    if (ph < 5.5) return 'Muy Ácido';
    if (ph >= 5.5 && ph <= 6.5) return 'Ligeramente Ácido a Neutro (Ideal para Aguacate)';
    if (ph > 6.5 && ph <= 7.5) return 'Neutro a Ligeramente Alcalino';
    return 'Alcalino';
  }
}