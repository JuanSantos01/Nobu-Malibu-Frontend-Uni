import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../admin-services/admin.service';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.5s ease', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {

  categories: any = [];
  filteredCategories: any = [];
  validateForm!: FormGroup;
  size: NzButtonSize = 'large';
  isSpinning: boolean = false;

  constructor(private adminService: AdminService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      title: [null, [Validators.required]],
    });
    this.getAllCategories();
    
    // Suscribirse a cambios en el campo de búsqueda
    this.validateForm.get('title')?.valueChanges.subscribe(value => {
      this.onSearchChange();
    });
  }

  submitForm() {
    if (this.validateForm.valid) {
      this.isSpinning = true;
      this.adminService.searchCategoryByTitle(this.validateForm.get(['title'])!.value).subscribe((res) => {
        this.categories = [];
        res.forEach((element: any) => {
          element.processedImg = 'data:image/jpeg;base64,' + element.returnedImg;
          this.categories.push(element);
        });
        this.filteredCategories = [...this.categories];
        this.isSpinning = false;
      }, error => {
        console.error('Error searching categories:', error);
        this.isSpinning = false;
      });
    }
  }

  onSearchChange() {
    const searchTerm = this.validateForm.get('title')?.value?.toLowerCase() || '';
    
    if (!searchTerm.trim()) {
      // Si no hay término de búsqueda, mostrar todas las categorías
      this.filteredCategories = [...this.categories];
    } else {
      // Filtrar categorías según el término de búsqueda
      this.filteredCategories = this.categories.filter((category: any) => 
        category.name.toLowerCase().includes(searchTerm) || 
        (category.description && category.description.toLowerCase().includes(searchTerm))
      );
    }
  }

  getAllCategories() {
    this.isSpinning = true;
    this.adminService.getAllCategories().subscribe((res) => {
      this.categories = [];
      res.forEach((element: any) => {
        element.processedImg = 'data:image/jpeg;base64,' + element.returnedImg;
        this.categories.push(element);
      });
      this.filteredCategories = [...this.categories];
      this.isSpinning = false;
    }, error => {
      console.error('Error fetching categories:', error);
      this.isSpinning = false;
    });
  }
}