import { Component, NgZone } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { OrderService } from '../../../services/Orders/order-service';
import * as pdfjsLib from 'pdfjs-dist';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.14.305/pdf.worker.min.js';

@Component({
  selector: 'app-make-order-page',
  templateUrl: './make-order-page.html',
  styleUrls: ['./make-order-page.css']
})
export class MakeOrderPage {

  orderForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = 'Selecciona un archivo';
  pageCount: number | null = null;
  imageWidth: number | null = null;
  imageHeight: number | null = null;

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

    if (fileType === 'application/pdf') {
      this.countPdfPages(this.selectedFile);
    } else if (fileType === 'text/plain') {
      console.log('Archivo TXT subido, tamaño:', this.selectedFile.size, 'bytes');
    } else if (fileType === 'image/jpeg' || fileType === 'image/png') {
      const img = new Image();
      img.onload = () => {
        this.zone.run(() => {
          this.imageWidth = img.width;
          this.imageHeight = img.height;
        });
      };
      img.src = URL.createObjectURL(this.selectedFile);
    } else {
      console.log('Tipo de archivo no soportado');
    }
  }

  async countPdfPages(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    this.zone.run(() => {
      this.pageCount = pdf.numPages;
      this.orderForm.get('pagesF')?.setValue(this.pageCount);
    });

    console.log('Número de páginas:', this.pageCount);
  }

  submitOrder() {
    if (!this.orderForm.valid) return;

    const formData = new FormData();
    formData.append('pages', this.orderForm.get('pagesF')?.value);
    formData.append('copies', this.orderForm.get('copiesF')?.value);
    formData.append('doubleSided', this.orderForm.get('doubleSidedF')?.value);
    formData.append('binding', this.orderForm.get('bindingF')?.value);
    formData.append('color', this.orderForm.get('colorF')?.value);
    formData.append('comments', this.orderForm.get('commentsF')?.value);
    formData.append('customerName', this.orderForm.get('customerNameF')?.value);
    formData.append('surname', this.orderForm.get('surnameF')?.value);
    formData.append('phone', this.orderForm.get('phoneF')?.value);
    formData.append('paymentMethod', this.orderForm.get('paymentMethodF')?.value);
    formData.append('sign', this.orderForm.get('signF')?.value);
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }
  }
}
