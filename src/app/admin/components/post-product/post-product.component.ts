import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../admin-services/admin.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-post-product',
  templateUrl: './post-product.component.html',
  styleUrls: ['./post-product.component.scss']
})
export class PostProductComponent implements OnInit {

  categoryId: any = this.activatedroute.snapshot.params['categoryId'];
  validateForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isSpinning = false;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private adminService: AdminService,
    private activatedroute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      price: [null, [Validators.required, Validators.min(0)]],
      description: [null, [Validators.required, Validators.minLength(10)]],
    });
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      this.markFormGroupTouched();
      this.message.error('Please fill all required fields correctly', { nzDuration: 5000 });
      return;
    }

    if (!this.selectedFile) {
      this.message.error('Please select a product image', { nzDuration: 5000 });
      return;
    }

    this.isSpinning = true;
    const formData: FormData = new FormData();
    formData.append('img', this.selectedFile);
    formData.append('name', this.validateForm.get('name')?.value);
    formData.append('price', this.validateForm.get('price')?.value);
    formData.append('description', this.validateForm.get('description')?.value);
    
    this.adminService.addProduct(this.categoryId, formData).subscribe({
      next: (res) => {
        this.isSpinning = false;
        if (res.id != null) {
          this.message.success(`Product Posted Successfully!`, { nzDuration: 5000 });
          this.router.navigateByUrl('/admin/dashboard');
        } else {
          this.message.error(`Something went wrong`, { nzDuration: 5000 });
        }
      },
      error: (error) => {
        this.isSpinning = false;
        this.message.error(`Error posting product: ${error.message}`, { nzDuration: 5000 });
        console.error('Error posting product:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        this.message.error('Please select a valid image (JPEG, PNG, GIF)', { nzDuration: 5000 });
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.message.error('Image size must be less than 5MB', { nzDuration: 5000 });
        return;
      }

      this.selectedFile = file;
      this.previewImage();
    }
  }

  previewImage(): void {
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.onerror = (error) => {
      console.error('Error previewing image:', error);
      this.message.error('Error loading image preview', { nzDuration: 5000 });
    };
    reader.readAsDataURL(this.selectedFile);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.validateForm.controls).forEach(key => {
      const control = this.validateForm.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }
}

