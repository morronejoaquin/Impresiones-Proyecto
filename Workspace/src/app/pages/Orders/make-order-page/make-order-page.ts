import { Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../services/Cart/cart-service';
import { PriceManagerService } from '../../../services/Prices/price-manager-service';
import Cart from '../../../models/Cart/cart';
import OrderItem from '../../../models/Orders/order';
import { OrderService } from '../../../services/Orders/order-service';

GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs';

@Component({
  selector: 'app-make-order-page',
  templateUrl: './make-order-page.html',
  standalone: true,
  imports : [ReactiveFormsModule, CommonModule],
  styleUrls: ['./make-order-page.css']
})
export class MakeOrderPage implements OnInit{

  orderForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = 'Selecciona un archivo';
  pageCount: number | null = null;
  imageWidth: number | null = null;
  imageHeight: number | null = null;
  private currentObjectUrl: string | null = null;
  public calculatedPrice: number | null = null;
  orderItemService: any;

  constructor(
    private zone: NgZone,
    private cartService: CartService,
    private router: Router,
    private priceS: PriceManagerService,
    private fb: FormBuilder,
    private orderService: OrderService
  ) {
    this.orderForm = new FormGroup({
      pages: new FormControl(1, [Validators.required, Validators.min(1)]),
      copies: new FormControl(1, [Validators.required, Validators.min(1)]),
      isDoubleSided: new FormControl(false),
      binding: new FormControl(null, [Validators.required]),
      isColor: new FormControl(false),
      comments: new FormControl(''),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedFile = input.files[0];
    this.selectedFileName = this.selectedFile.name;
    this.pageCount = null;
    this.imageWidth = null;
    this.imageHeight = null;

    const fileType = this.selectedFile.type;

    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }

    if (fileType === 'application/pdf' || this.selectedFile.name.toLowerCase().endsWith('.pdf')) {
      this.countPdfPages(this.selectedFile);
   } else if (fileType === 'image/jpeg' || fileType === 'image/png' || this.selectedFile.type.startsWith('image/')) {
      const objUrl = URL.createObjectURL(this.selectedFile);
      this.currentObjectUrl = objUrl;
      const img = new Image();
      img.onload = () => {
        this.zone.run(() => {
          this.imageWidth = img.width;
          this.imageHeight = img.height;
          if (this.currentObjectUrl) {
            URL.revokeObjectURL(this.currentObjectUrl);
            this.currentObjectUrl = null;
          }
        });
      };
      img.src = objUrl;
    } else {
      console.log('Tipo de archivo no soportado');
    }
  }

  async countPdfPages(file: File) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const pdf = await getDocument({ data: uint8 }).promise;

      this.zone.run(() => {
        this.pageCount = pdf.numPages;
        this.orderForm.get('pages')?.setValue(this.pageCount);
      });

      console.log('Número de páginas:', this.pageCount);
    } catch (err) {
      console.error('Error leyendo PDF:', err);
      this.zone.run(() => {
        this.pageCount = null;
      });
    }
  }


  get isPdf(): boolean {
    return !!this.selectedFile && (
      this.selectedFile.type === 'application/pdf' ||
      this.selectedFile.name.toLowerCase().endsWith('.pdf')
    );
  }

  get isText(): boolean {
    return !!this.selectedFile && this.selectedFile.type === 'text/plain';
  }

  get isImage(): boolean {
    return !!this.selectedFile && this.selectedFile.type.startsWith('image/');
  }

  get fileSize(): number | null {
    return this.selectedFile ? this.selectedFile.size : null;
  }

  ngOnInit(): void {
    this.cargarPrecios();
    this.orderForm.valueChanges.subscribe(() => {
      this.calcularPrecio();
    });
  }
  cargarPrecios() {
    this.priceS.getPrices().subscribe({
      next: (data) => {
        this.priceS.Prices = data;
      },
      error: (error) => {
        console.error('Error al cargar los precios:', error);
      }
    });
  }

  calcularPrecio() {
    if (this.orderForm.valid) {
      const { pages, copies, isDoubleSided, binding, isColor } = this.orderForm.value;
      this.calculatedPrice = this.priceS.calculatePrice(pages, copies, isDoubleSided, binding, isColor);
    }
  }

  addToCart() {
  // 1️⃣ Validar que haya archivo y que el formulario sea válido
  if (!this.selectedFile || !this.orderForm.valid) {
    alert('Selecciona un archivo y completa todos los campos.');
    return;
  }

  // 2️⃣ Obtener el userId actual (ejemplo: desde login o localStorage)
  const userId = 1; // reemplazar con el userId real de tu auth/login

  // 3️⃣ Consultar si ya existe un carrito para este usuario
  this.cartService.getCartByUserId(userId).subscribe({
    next: (carts) => {
      if (Array.isArray(carts) && carts.length > 0) {
        // ✅ Usuario ya tiene carrito → agregamos el item
        this.createOrderItem(carts[0].cartId);//aca es en la posicion cero pq siempre es un carrito por
      } else {
        // 🆕 Usuario no tiene carrito → creamos uno
        const newCart: Partial<Cart> = {
          userId,
          total: 0,
          status: 'pending'
        };

        this.cartService.postCart(newCart as Cart).subscribe({//aca le agrega el carrito al usuario
          next: (createdCart) => {
            this.createOrderItem(createdCart.cartId);
          },
          error: (err) => console.error('Error creando carrito:', err)
        });
      }
    },
    error: (err) => console.error('Error obteniendo carrito:', err)
  });
}

private createOrderItem(cartId: number) {
  const f = this.orderForm.value;

  const newItem: OrderItem = {
    id: 0,// JSON Server asigna automáticamente el id
    cartId,
    isColor: f.isColor,
    isDoubleSided: f.isDoubleSided,
    binding: f.binding,
    pages: f.pages,
    copies: f.copies,
    comments: f.comments,
    file: this.selectedFileName,
    amount: this.calculatedPrice ?? 0
  };

  this.orderService.postOrderToCart(newItem).subscribe({
    next: () => {
      alert('Archivo agregado al carrito');
      // Limpiar formulario y selección de archivo
      this.selectedFile = null;
      this.selectedFileName = 'Selecciona un archivo';
      this.orderForm.reset({
        pages: 1,
        copies: 1,
        isDoubleSided: false,
        binding: null,
        isColor: false,
        comments: ''
      });
      this.calculatedPrice = null;
    },
    error: (err: any) => console.error('Error agregando item:', err)
  });
}
}