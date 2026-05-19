import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../customer-services/customer.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as dayjs from 'dayjs';

export interface TableOption {
  type: string;
  maxGuests: number;
  imageUrl: string;
  recommendation: string;
}

@Component({
  selector: 'app-post-reservation-request',
  templateUrl: './post-reservation-request.component.html',
  styleUrls: ['./post-reservation-request.component.scss']
})
export class PostReservationRequestComponent implements OnInit {
  validateForm!: FormGroup;
  isSpinning = false;
  selectedTable: TableOption | null = null;
  hoverTable: TableOption | null = null;
  isHovering = false;
  showTableOptions = false;

  defaultTime = dayjs().hour(12).minute(0).toDate();

  TableOptions: TableOption[] = [
    {
      type: 'Standard Table',
      maxGuests: 5,
      imageUrl: 'assets/MesaEstandar.jpg',
      recommendation: 'Ideal for small groups or couples.'
    },
    {
      type: 'Premium Table',
      maxGuests: 6,
      imageUrl: 'assets/mesapremiun.webp',
      recommendation: 'Perfect for cozy conversations and privacy.'
    },
    {
      type: 'Outdoor Table',
      maxGuests: 12,
      imageUrl: 'assets/mesaexterior.jpg',
      recommendation: 'Enjoy fresh air and great ambiance.'
    },
    {
      type: 'High-top Table',
      maxGuests: 2,
      imageUrl: 'assets/MesaBar.avif',
      recommendation: 'Great for drinks and small bites.'
    },
    {
      type: 'Chef\'s Table',
      maxGuests: 5,
      imageUrl: 'assets/mesachef.jpg',
      recommendation: 'Exclusive experience near the kitchen.'
    },
    {
      type: 'Family-Style Table',
      maxGuests: 4,
      imageUrl: 'assets/mesaestilofamiliar.jpg',
      recommendation: 'Designed for larger gatherings and sharing.'
    }
  ];

  get displayTable(): TableOption | null {
    return this.isHovering && this.hoverTable ? this.hoverTable : this.selectedTable;
  }

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      tableType: [null, [Validators.required]],
      dateTime: [null, Validators.required],
      guests: [null, [Validators.required, Validators.min(1)]],
      description: [null, [Validators.required]],
      paymentMethod: [null, [Validators.required]],
      cardProvider: [null],
      cardNumber: [null]
    });

    this.validateForm.get('tableType')?.valueChanges.subscribe(value => {
      if (value) {
        this.selectedTable = this.TableOptions.find(t => t.type === value) || null;
        this.isHovering = false;
        this.validateGuestLimit();
      }
    });

    this.validateForm.get('guests')?.valueChanges.subscribe(() => {
      this.validateGuestLimit();
    });

    this.validateForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      if (method === 'cash') {
        this.validateForm.patchValue({ cardProvider: null, cardNumber: null });
      }
    });
  }

  onTableInputFocus() {
    this.showTableOptions = true;
  }

  onTableInputBlur() {
    setTimeout(() => {
      this.showTableOptions = false;
      this.isHovering = false;
    }, 200);
  }

  onTableHover(table: TableOption): void {
    this.hoverTable = table;
    this.isHovering = true;
  }

  selectTable(table: TableOption): void {
    this.validateForm.patchValue({ tableType: table.type });
    this.selectedTable = table;
    this.isHovering = false;
    this.showTableOptions = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.table-options-container') && !target.closest('.table-input')) {
      this.showTableOptions = false;
      this.isHovering = false;
    }
  }

  disablePastDates = (current: Date): boolean => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return current < now;
  };

  validateGuestLimit(): void {
    const guestsControl = this.validateForm.get('guests');
    const guestCount = guestsControl?.value;

    if (this.selectedTable && guestCount > this.selectedTable.maxGuests) {
      guestsControl?.setErrors({ maxExceeded: true });
    } else {
      const errors = guestsControl?.errors;
      if (errors) {
        delete errors['maxExceeded'];
        if (Object.keys(errors).length === 0) {
          guestsControl?.setErrors(null);
        } else {
          guestsControl?.setErrors(errors);
        }
      }
    }
  }

  submitForm(): void {
    if (this.validateForm.invalid) return;

    this.isSpinning = true;
    this.customerService.postReservationRequest(this.validateForm.value).subscribe(res => {
      this.isSpinning = false;
      if (res.id != null) {
        this.message.success('Reservation Requested Successfully.', { nzDuration: 5000 });
        this.router.navigateByUrl('/customer/dashboard');
      } else {
        this.message.error(`${res.message}`, { nzDuration: 5000 });
      }
    });
  }
}