import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { AdminService } from '../../admin-services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-view-products',
  templateUrl: './view-products.component.html',
  styleUrls: ['./view-products.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ViewProductsComponent implements OnInit {

  categoryId: any = this.activatedroute.snapshot.params['categoryId'];
  Products: any = [];
  validateForm!: FormGroup;
  size: NzButtonSize = 'large';
  isSpinning: boolean;

  // New properties for modals and animations
  isDeleteModalVisible = false;
  isImageModalVisible = false;
  selectedProduct: any = null;
  productToDelete: any = null;

  constructor(private adminService: AdminService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private activatedroute: ActivatedRoute) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      title: [null, [Validators.required]],
    });
    this.getProductsByCategory();
  }

  getProductsByCategory() {
    this.isSpinning = true;
    this.Products = [];
    this.adminService.getProductsByCategory(this.categoryId).subscribe((res) => {
      res.forEach(element => {
        element.processedImg = 'data:image/jpeg;base64,' + element.returnedImg;
        this.Products.push(element);
      });
      this.isSpinning = false;
    }, error => {
      this.isSpinning = false;
      this.message.error('Error loading products', { nzDuration: 5000 });
    });
  }

  submitForm() {
    if (this.validateForm.valid) {
      this.isSpinning = true;
      this.Products = [];
      this.adminService.searchProductByTitle(this.categoryId, this.validateForm.get(['title'])!.value).subscribe((res) => {
        console.log(res);
        res.forEach(element => {
          element.processedImg = 'data:image/jpeg;base64,' + element.returnedImg;
          this.Products.push(element);
        });
        this.isSpinning = false;
      }, error => {
        this.isSpinning = false;
        this.message.error('Error searching products', { nzDuration: 5000 });
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  // New method to confirm delete
  confirmDelete(product: any) {
    this.productToDelete = product;
    this.isDeleteModalVisible = true;
  }

  // Handle delete confirmation
  handleDelete() {
    if (this.productToDelete) {
      this.deleteProduct(this.productToDelete.id);
    }
    this.isDeleteModalVisible = false;
    this.productToDelete = null;
  }

  // Handle cancel delete
  handleCancel() {
    this.isDeleteModalVisible = false;
    this.productToDelete = null;
  }

  // Original delete method (now called from handleDelete)
  deleteProduct(productId: any) {
    this.adminService.deleteProduct(productId).subscribe((res) => {
      if (res == null) {
        this.getProductsByCategory();
        this.message.success(
          `Product Deleted Successfully.`,
          { nzDuration: 5000 }
        );
      } else {
        this.message.error(
          `${res.message}`,
          { nzDuration: 5000 }
        );
      }
    }, error => {
      this.message.error(
        'Error deleting product',
        { nzDuration: 5000 }
      );
    });
  }

  // Image zoom functionality
  zoomImage(product: any) {
    this.selectedProduct = product;
    this.isImageModalVisible = true;
  }

  closeImageModal() {
    this.isImageModalVisible = false;
    this.selectedProduct = null;
  }

  // View product details (you can expand this functionality)
  viewProductDetails(product: any) {
    // You can implement navigation to product details page
    // or show a detailed modal here
    console.log('View product details:', product);
    // Example: this.router.navigate(['/admin/product-details', product.id]);
  }

  // Clear search and show all products
  clearSearch() {
    this.validateForm.reset();
    this.getProductsByCategory();
  }
}