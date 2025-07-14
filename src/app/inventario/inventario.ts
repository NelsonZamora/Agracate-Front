import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngFor
import { HttpClientModule, HttpClient } from '@angular/common/http'; // Para hacer solicitudes HTTP
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs'; // Para retornar un observable en caso de error

// Interfaz para la estructura de un producto
interface Producto {
  id: number;
  NOMBRE: string;
  DESCRIPCION: string | null;
  URL_IMAGEN: string | null;
  CANTIDAD: number;
  PRECIO: number | null;
  created_at?: string; // Laravel añade estos automáticamente
  updated_at?: string; // Laravel añade estos automáticamente
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // Importa HttpClientModule
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class Inventario implements OnInit {

  productos: Producto[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private apiUrl = 'http://127.0.0.1:8000/api/productos'; // URL de tu API de productos

  constructor(private http: HttpClient) { } // Inyecta HttpClient

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.isLoading = true;
    this.errorMessage = null; // Limpia cualquier mensaje de error previo

    this.http.get<Producto[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error al cargar productos:', error);
        this.isLoading = false;
        this.errorMessage = 'No se pudieron cargar los productos. Asegúrate de que el backend esté funcionando.';
        return of([]); // Retorna un array vacío para que la aplicación no falle
      })
    ).subscribe(data => {
      this.productos = data;
      this.isLoading = false;
      console.log('Productos cargados:', this.productos);
    });
  }

  // Helper para una imagen por defecto si no hay URL_IMAGEN
  getImagenUrl(url: string | null): string {
    return url && url.trim() !== '' ? url : 'https://via.placeholder.com/150?text=No+Image';
  }
}