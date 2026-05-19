import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../customer-services/customer.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.scss'],
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
export class ViewProductComponent implements OnInit {

  categoryId: any = this.activatedroute.snapshot.params['categoryId'];
  Products: any = [];
  validateForm!: FormGroup;
  size: NzButtonSize = 'large';
  isSpinning: boolean = false;
  originalProducts: any = []; // To store all original products

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private activatedroute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getProductsByCategory();
  }

  /**
   * Initialize search form
   */
  initializeForm(): void {
    this.validateForm = this.fb.group({
      title: [null, [Validators.required]],
    });
  }

  /**
   * Handle form submission
   */
  submitForm(): void {
    if (this.validateForm.valid) {
      this.isSpinning = true;
      this.Products = [];
      
      this.customerService.searchProductByTitle(
        this.categoryId, 
        this.validateForm.get(['title'])!.value
      ).subscribe({
        next: (res) => {
          this.processProductResponse(res);
          this.isSpinning = false;
        },
        error: (error) => {
          console.error('Error searching products:', error);
          this.isSpinning = false;
          // In case of error, show all products
          this.getProductsByCategory();
        }
      });
    }
  }

  /**
   * Handle search input changes
   */
  onSearchChange(): void {
    const searchValue = this.validateForm.get('title')?.value;
    
    // If search field is empty, show all products
    if (!searchValue || searchValue.trim() === '') {
      this.restoreOriginalProducts();
    }
  }

  /**
   * Clear search and show all products
   */
  clearSearch(): void {
    this.validateForm.patchValue({ title: '' });
    this.restoreOriginalProducts();
  }

  /**
   * Restore original products
   */
  private restoreOriginalProducts(): void {
    if (this.originalProducts.length > 0) {
      this.Products = [...this.originalProducts];
    } else {
      this.getProductsByCategory();
    }
  }

  /**
   * Get all products by category
   */
  getProductsByCategory(): void {
    this.isSpinning = true;
    this.Products = [];
    
    this.customerService.getProductsByCategory(this.categoryId).subscribe({
      next: (res) => {
        this.processProductResponse(res);
        // Save a copy of original products
        this.originalProducts = [...this.Products];
        this.isSpinning = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isSpinning = false;
        this.Products = [];
      }
    });
  }

  /**
   * Process product response and prepare images
   */
  private processProductResponse(products: any[]): void {
    this.Products = products.map(product => ({
      ...product,
      processedImg: 'data:image/jpeg;base64,' + product.returnedImg
    }));
  }

  /**
   * Handle image loading errors
   */
  handleImageError(event: any): void {
    // Fallback image if product image fails to load
    event.target.src = 'assets/images/placeholder-product.jpg';
    
    // If fallback image doesn't exist, use SVG placeholder
    event.target.onerror = null; // Prevent infinite loops
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBNODAgODBIMTIwTTgwIDEwMEgxMjBNNjAgNjBWNzBNNjAgODBWNzBNNjAgMTAwVjcwTTE0MCA2MFY3ME0xNDAgODBWNzBNMTQwIDEwMFY3MCIgc3Ryb2tlPSIjQ0RDRENEIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+';
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  /**
   * Get brief description for tooltip
   */
  getBriefDescription(product: any): string {
    const description = product.description || '';
    
    // If description is too long, shorten it
    if (description.length > 100) {
      return description.substring(0, 100) + '...';
    }
    
    return description;
  }

  /**
   * Get current category name
   */
  getCategoryName(): string {
    // This is an example - you can get the real name from your service
    return 'Category ' + this.categoryId;
  }
}