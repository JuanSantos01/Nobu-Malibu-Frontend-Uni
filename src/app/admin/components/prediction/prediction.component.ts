// prediction.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PredictionService } from '../../admin-services/prediction.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class PredictionComponent {

  form: FormGroup;
  loading = false;
  result: { prediction: string; probability?: number } | null = null;

  horas: string[] = [
    '12:00','13:00','14:00',
    '18:00','19:00','20:00','21:00'
  ];

  constructor(
    private fb: FormBuilder,
    private predictionService: PredictionService,
    private msg: NzMessageService
  ) {
    this.form = this.fb.group({
      anticipacionDias: [0, [Validators.required, Validators.min(0)]],
      diaSemana: ['', Validators.required],
      hora: ['', Validators.required],
      historialNoShow: ['', Validators.required],
      recordatorioEnviado: ['', Validators.required],
      festivo: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) {
      this.msg.warning('Please complete all required fields.');
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.result = null;

    const payload = this.form.value;

    this.predictionService.predecir(payload).subscribe({
      next: (res: any) => {
        const data = res?.data;

        if (data) {
          this.result = {
            prediction: data.prediction ?? data,
            probability: data.probability
          };
          this.msg.success('Analysis completed successfully.');
        } else {
          this.msg.error(res?.message ?? 'Invalid server response');
        }

        this.loading = false;
      },

      error: (err) => {
        console.error(err);
        this.msg.error('Error connecting to the server. Please try again.');
        this.loading = false;
      }
    });
  }

  getRecommendation(): string {
    if (!this.result || this.result.probability === undefined) return '';

    const probability = this.result.probability;
    const isHoliday = this.form.get('festivo')?.value === 'yes';
    const reminderSent = this.form.get('recordatorioEnviado')?.value === 'yes';
    const hasNoShowHistory = this.form.get('historialNoShow')?.value === 'yes';

    if (probability < 0.7) {
      let recommendations = `
        <p><strong>Low attendance probability detected.</strong> Proactive measures recommended:</p>
        <ul>
          <li>Send personalized reminder 24-48 hours before reservation</li>
          <li>Offer complimentary welcome drink or appetizer</li>
          <li>Confirm reservation via phone call for personal touch</li>
      `;

      if (!reminderSent) {
        recommendations += `<li><strong>Priority:</strong> Send reminder immediately</li>`;
      }

      if (hasNoShowHistory) {
        recommendations += `<li><strong>Special attention:</strong> Client has previous no-shows</li>`;
      }

      if (isHoliday) {
        recommendations += `<li><strong>Holiday note:</strong> Consider higher demand period</li>`;
      }

      recommendations += `</ul>`;
      return recommendations;
    } else {
      let recommendations = `
        <p><strong>High attendance probability confirmed.</strong> Standard protocols sufficient:</p>
        <ul>
          <li>Standard reminder already sent and confirmed</li>
          <li>Client maintains good attendance record</li>
          <li>Prepare table according to standard preferences</li>
      `;

      if (isHoliday) {
        recommendations += `<li><strong>Holiday preparation:</strong> Ensure premium service for special occasion</li>`;
      }

      if (!hasNoShowHistory) {
        recommendations += `<li>Client is reliable - no previous no-shows</li>`;
      }

      recommendations += `</ul>`;
      return recommendations;
    }
  }

  opcionesSiNo() {
    return ['yes', 'no'];
  }

  dias() {
    return [
      'Monday','Tuesday','Wednesday',
      'Thursday','Friday','Saturday','Sunday'
    ];
  }
}