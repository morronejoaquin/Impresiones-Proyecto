import { Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/Cart/cart-service';
import { PriceManagerService } from '../../../services/Prices/price-manager-service';
import { UserService } from '../../../services/Users/user-service';
import Cart from '../../../models/Cart/cart';
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
    private priceS: PriceManagerService,
    private orderService: OrderService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.orderForm = this.fb.group({
      pages: [1, [Validators.required, Validators.min(1)]],
      copies: [1, [Validators.required, Validators.min(1)]],
      isDoubleSided: [false],
      binding: ['unringed', [Validators.required]],
      isColor: [false],
      comments: [''],
      file: [null],
      amount: [0]
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
    this.calcularPrecio(); // Calcular el precio inicial al cargar
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
  if (!this.selectedFile || !this.orderForm.valid) {
    alert('Selecciona un archivo y completa todos los campos.');
    return;
  }

  const currentUser = this.userService.getDecodedUserPayload();
  if (!currentUser) {
    alert('Debes iniciar sesión para agregar productos al carrito.');
    // Optionally, redirect to login page
    return;
  }

  const userId = currentUser.userId;

  this.cartService.getCartByUserId(userId).subscribe({
    next: (carts) => {
      if (Array.isArray(carts) && carts.length > 0) {
        // Usuario ya tiene carrito → agregamos el item
        this.createOrderItem(carts[0].cartId);//aca es en la posicion cero pq siempre es un carrito por
      } else {
        // Usuario no tiene carrito → creamos uno
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


private createOrderItem(cartId: string) {
  const f = this.orderForm.value;
  const orderItem = {
    ...f, // Copia las propiedades del formulario (pages, copies, etc.)
    cartId: cartId, // 1. Agrega el cartId
    file: this.selectedFileName, // 2. Agrega el nombre del archivo
    amount: this.calculatedPrice // 3. Usa el precio calculado
  };

  // Elimina la propiedad 'pages' si el archivo no es un PDF, ya que no aplicaría
  if (!this.isPdf) {
    delete orderItem.pages;
  }

  this.orderService.postOrderToCart(orderItem).subscribe({
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