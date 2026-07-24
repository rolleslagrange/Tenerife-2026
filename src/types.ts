export interface DayPlan {
  day: number;
  date: string;
  title: string;
  icon: string;
  car: boolean;
  desc: string;
  route: string[];
  tip: string;
  food: string;
}

export interface Expense {
  id: string;
  desc: string;
  amount: number;
  date: string;
  payer: 'Sergio' | 'Nerea';
}

export interface PackingItem {
  id: string;
  label: string;
  checked: boolean;
  category: string;
}

export interface Checklist {
  id: string;
  name: string;
  items: PackingItem[];
}

export interface Note {
  id: string;
  text: string;
  date: string;
}

export interface SavedLink {
  id: string;
  url: string;
  title: string;
  category: 'Restaurante' | 'Ruta' | 'Actividad' | 'Vídeo' | 'Info' | 'Web';
}

export interface Reservation {
  id: string;
  title: string;
  subtitle: string;
  type: 'flight' | 'hotel' | 'car';
  code?: string;
  documentUrl?: string;
}
