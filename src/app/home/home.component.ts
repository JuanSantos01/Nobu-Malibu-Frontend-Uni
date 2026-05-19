import { Component, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  @ViewChild('restaurantDescription') restaurantDescription!: ElementRef;

  contactPhone: string = '+57301454545';
  contactEmail: string = 'juanpabloalvix@gmail.com';
  isScrolled: boolean = false;

  // ================= CHATBOT PRO MAX =================
  isOpen = false;
  showHint = false;
  isTyping = false;
  showQuick = true;

  input = '';

  messages: { text: string; role: 'user' | 'bot' }[] = [
    { text: 'Welcome to Nobu Malibu 🍣 How can I assist you today?', role: 'bot' }
  ];

  // ================= STATS =================
  animatedStats = {
    years: 0,
    awards: 0,
    dishes: 0
  };

  finalStats = {
    years: 25,
    awards: 15,
    dishes: 50
  };

  features = [
    {
      icon: '🍣',
      title: 'Signature Sushi',
      description: 'Unique creations by Chef Nobu Matsuhisa combining traditional techniques with innovative ingredients.',
      detail1: 'Daily fresh fish',
      detail2: 'Traditional techniques'
    },
    {
      icon: '🌊',
      title: 'Privileged Views',
      description: 'Exclusive oceanfront location with award-winning architectural design and sophisticated ambiance.',
      detail1: 'Ocean view terrace',
      detail2: 'Unique architecture'
    },
    {
      icon: '👨‍🍳',
      title: 'Culinary Mastery',
      description: 'Team led by Japan-trained chefs with over 20 years of experience in high-end cuisine.',
      detail1: 'Japan-trained chefs',
      detail2: '20+ years experience'
    },
    {
      icon: '🍷',
      title: 'Exceptional Pairing',
      description: 'Curated selection of premium sakes and international wines perfectly paired with each dish.',
      detail1: 'Premium sake collection',
      detail2: 'Expert guidance'
    },
    {
      icon: '⭐',
      title: 'Premium Experience',
      description: 'Impeccable service and personalized attention in a luxury and exclusive environment.',
      detail1: 'Personalized service',
      detail2: 'Luxury ambiance'
    },
    {
      icon: '🎨',
      title: 'Architectural Design',
      description: 'Space designed by renowned architects fusing Japanese aesthetics with modernity.',
      detail1: 'Minimalist design',
      detail2: 'Cultural fusion'
    }
  ];

  specialties = [
    {
      name: 'Black Cod Miso',
      description: 'Our signature dish, marinated for 72 hours in white miso.',
      price: '$45'
    },
    {
      name: 'Omakase Experience',
      description: 'Personalized tasting menu by the executive chef.',
      price: '$150'
    },
    {
      name: 'Wagyu Tataki',
      description: 'Premium wagyu cut with ponzu sauce and black truffle.',
      price: '$65'
    },
    {
      name: 'Premium Sashimi',
      description: 'Daily selection with deep-water fish.',
      price: '$55'
    }
  ];

  constructor() {}

  ngAfterViewInit(): void {
    this.setupScrollAnimation();

    setTimeout(() => {
      this.animateStats();
    }, 1000);

    // Mostrar hint automático
    setTimeout(() => {
      this.showHint = true;
    }, 2000);
  }

  // ================= CHATBOT =================

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    this.showHint = false;
  }

  openChat(): void {
    this.isOpen = true;
    this.showHint = false;
  }

  quick(type: string): void {
    if (type === 'menu') this.sendAuto('Show me the menu');
    if (type === 'reserve') this.sendAuto('I want to reserve');
    if (type === 'location') this.sendAuto('Where are you located?');
  }

  sendAuto(text: string): void {
    this.messages.push({ text, role: 'user' });
    this.handleAI(text);
  }

  send(): void {
    if (!this.input.trim()) return;

    const text = this.input;
    this.messages.push({ text, role: 'user' });

    this.input = '';
    this.showQuick = false;

    this.handleAI(text);
  }

  // ================= IA =================
  async handleAI(text: string): Promise<void> {
    this.isTyping = true;
    this.scrollToBottom();

    try {
  const response = await fetch('http://localhost:8080/api/chatbot/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: text })
});

const data = await response.json();
const reply = data.response || data.reply || "No response from server";

      this.messages.push({ text: reply, role: 'bot' });

    } catch (error) {
      this.messages.push({
        text: 'Connection error. Please try again later.',
        role: 'bot'
      });
    }

    this.isTyping = false;
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.chatbot-body');
      el?.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
    });
  }

  // ================= FUNCIONES ORIGINALES =================

  private setupScrollAnimation(): void {
    window.addEventListener('scroll', this.checkScroll.bind(this));
  }

  private animateStats(): void {
    this.animateNumber('years', 0, this.finalStats.years, 2000);
    this.animateNumber('awards', 0, this.finalStats.awards, 2000);
    this.animateNumber('dishes', 0, this.finalStats.dishes, 2000);
  }

  private animateNumber(
    stat: keyof typeof this.animatedStats,
    start: number,
    end: number,
    duration: number
  ): void {
    const startTime = performance.now();

    const update = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      this.animatedStats[stat] = Math.floor(start + (end - start) * progress);

      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }

  callPhone(): void {
    window.open(`tel:${this.contactPhone}`, '_self');
  }

  sendEmail(): void {
    window.open(`mailto:${this.contactEmail}`, '_self');
  }

  scrollToContent(): void {
    if (this.restaurantDescription) {
      this.restaurantDescription.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.checkScroll();
  }

  private checkScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollPosition > 300;
  }
}