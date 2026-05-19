import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CustomerService } from '../../customer-services/customer.service';
import { NzButtonSize } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  categories: any = [];
  allCategories: any = []; // Para almacenar todas las categorías
  validateForm!: FormGroup;
  size: NzButtonSize = 'large';
  isSpinning: boolean;

  constructor(private customerService: CustomerService,
    private notification: NzNotificationService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      title: [null, [Validators.required]],
    });
    this.getAllCategories();
    
    // Suscribirse a cambios en el campo de búsqueda
    this.validateForm.get('title')?.valueChanges.subscribe(value => {
      if (!value || value.trim() === '') {
        this.getAllCategories();
      }
    });
  }

  onSearchChange() {
    // Si el campo de búsqueda está vacío, mostrar todas las categorías
    const searchValue = this.validateForm.get('title')?.value;
    if (!searchValue || searchValue.trim() === '') {
      this.getAllCategories();
    }
  }

  submitForm() {
    this.isSpinning = true;
    this.categories = [];
    this.customerService.searchCategoryByTitle(this.validateForm.get(['title'])!.value).subscribe((res) => {
      res.forEach(element => {
        element.processedImg = 'data:image/jpeg;base64,' + element.returnedImg;
        this.categories.push(element);
        this.isSpinning = false;
      });
    });
  }

  getAllCategories() {
    this.categories = [];
    this.customerService.getAllCategories().subscribe((res) => {
      this.allCategories = []; // Limpiar el array
      res.forEach(element => {
        element.processedImg = 'data:image/jpeg;base64,' + element.returnedImg;
        this.allCategories.push(element);
        this.categories.push(element);
      });
    });
  }
}