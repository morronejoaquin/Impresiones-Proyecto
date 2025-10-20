import { Component, NgZone } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../services/Orders/order-service';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import { CommonModule } from '@angular/common';

GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.14.305/pdf.worker.min.js';

@Component({
  selector: 'app-make-order-page',
  templateUrl: './make-order-page.html',
  standalone: true,
  imports : [ReactiveFormsModule, CommonModule],
  styleUrls: ['./make-order-page.css']
})
export class MakeOrderPage {

  orderForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = 'Selecciona un archivo';
  pageCount: number | null = null;
  imageWidth: number | null = null;
  imageHeight: number | null = null;
  private currentObjectUrl: string | null = null;

  pricePerSheetBW = 0.05;
  pricePerSheetColor = 0.15;

  constructor(private orderService: OrderService, private zone: NgZone) {
    this.orderForm = new FormGroup({
      pagesF: new FormControl(1),
      copiesF: new FormControl(1),
      doubleSidedF: new FormControl(false),
      bindingF: new FormControl(false),
      colorF: new FormControl(false),
      commentsF: new FormControl(''),
      customerNameF: new FormControl(''),
      surnameF: new FormControl(''),
      phoneF: new FormControl(''),
      paymentMethodF: new FormControl('cash'),
      signF: new FormControl(0)
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
    } else if (fileType === 'text/plain') {
      console.log('Archivo TXT subido, tamaño:', this.selectedFile.size, 'bytes');
    } else if (fileType === 'image/jpeg' || fileType === 'image/png' || this.selectedFile.type.startsWith('image/')) {
      const objUrl = URL.createObjectURL(this.selectedFile);
      this.currentObjectUrl = objUrl;
      const img = new Image();
      img.onload = () => {
        this.zone.run(() => {
          this.imageWidth = img.width;
          this.imageHeight = img.height;
          // revocar cuando ya no se necesite
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
        this.orderForm.get('pagesF')?.setValue(this.pageCount);
      });

      console.log('Número de páginas:', this.pageCount);
    } catch (err) {
      console.error('Error leyendo PDF:', err);
      this.zone.run(() => {
        this.pageCount = null;
      });
    }
  }

  get pagesToPrint(): number {
    const pages = Number(this.orderForm.get('pagesF')?.value) || 0;
    const copies = Number(this.orderForm.get('copiesF')?.value) || 1;
    const doubleSided = !!this.orderForm.get('doubleSidedF')?.value;
    const sheetsPerCopy = doubleSided ? Math.ceil(pages / 2) : pages;
    return sheetsPerCopy * copies;
  }

  get unitPrice(): number {
    return this.orderForm.get('colorF')?.value ? this.pricePerSheetColor : this.pricePerSheetBW;
  }

  get totalPrice(): number {
    return this.pagesToPrint * this.unitPrice;
  }

  submitOrder() {
    if (!this.orderForm.valid) return;

    const formData = new FormData();
    // convertir a string para evitar problemas
    formData.append('pages', String(this.orderForm.get('pagesF')?.value));
    formData.append('copies', String(this.orderForm.get('copiesF')?.value));
    formData.append('doubleSided', String(this.orderForm.get('doubleSidedF')?.value));
    formData.append('binding', String(this.orderForm.get('bindingF')?.value));
    formData.append('color', String(this.orderForm.get('colorF')?.value));
    formData.append('comments', String(this.orderForm.get('commentsF')?.value));
    formData.append('customerName', String(this.orderForm.get('customerNameF')?.value));
    formData.append('surname', String(this.orderForm.get('surnameF')?.value));
    formData.append('phone', String(this.orderForm.get('phoneF')?.value));
    formData.append('paymentMethod', String(this.orderForm.get('paymentMethodF')?.value));
    formData.append('sign', String(this.orderForm.get('signF')?.value));
    formData.append('totalPrice', String(this.totalPrice));
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }
    console.log('FormData preparada. totalPrice=', this.totalPrice);
  }

  // nuevo: getters para usar desde la plantilla y evitar optional chaining en el template
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
}