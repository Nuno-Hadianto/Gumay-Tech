export enum ServiceStatus {
  DITERIMA = 'Diterima',
  PROSES_PERBAIKAN = 'Proses Perbaikan',
  MENUNGGU_SPAREPART = 'Menunggu Sparepart',
  SELESAI_BELUM_DIAMBIL = 'Selesai (Belum Diambil)',
  SELESAI_SUDAH_DIAMBIL = 'Selesai (Sudah Diambil)',
  BATAL = 'Batal',
  DIBATALKAN = 'Dibatalkan'
}

export enum PaymentStatus {
  BELUM_LUNAS = 'Belum Lunas',
  LUNAS = 'Lunas',
  DP = 'DP / Sebagian'
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SystemEvent {
  type: 'toast';
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface AbandonedService {
  id: number;
  ticket_number: string;
  customer_name: string;
  customer_phone?: string;
  service_status: string;
  days_pending: number;
}

export interface DashboardStats {
  todayServices: number;
  inProgress: number;
  completed: number;
  incomeMonth: number;
  labaBersih: number;
  chartData: { labels: string[], values: number[] };
  serviceStatusChart?: { labels: string[], values: number[] };
  topPartsChart?: { labels: string[], values: number[] };

  abandonedServices: AbandonedService[];
  todoItems: TodoItem[];
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface Part {
  id: number;
  part_code: string;
  name: string;
  category: string;
  buy_price: number;
  sell_price: number;
}

export interface Device {
  id: number;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  device_type: string;
  brand: string;
  model: string;
  serial_number: string;
  color: string;
  notes: string;
}

export interface ServiceOrder {
  id: number;
  ticket_number: string;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  device_id: number;
  device_type?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  customer_complaint: string;
  service_status: ServiceStatus | string;
  total_cost: number;
  payment_status: PaymentStatus | string;
  received_date: string;
  estimated_completion_date?: string;
  completed_date?: string;
  accessories: string;
  physical_condition: string;
  diagnosis_result?: string;
  actions_taken?: string;
  technician_notes?: string;
  warranty_end_date?: string;
  created_at?: string;
  customer_address?: string;
}

export interface ServiceHistory {
  id: number;
  service_order_id: number;
  status: string;
  notes: string;
  created_at: string;
}

export interface ServiceItem {
  id: number;
  service_order_id: number;
  item_type: string;
  spare_part_id?: number | null;
  description: string;
  quantity: number;
  price: number;
  cost_price?: number;
  total: number;
}

export interface Payment {
  id: number;
  service_order_id: number;
  payment_number: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  notes?: string;
}

export interface Settings {
  id?: number;
  business_name: string;
  phone: string;
  whatsapp?: string;
  address: string;
  receipt_footer?: string;
  auto_backup_path?: string;

  wa_template_status?: string;
  default_printer?: string;
  primary_color?: string;
  sound_notification?: boolean;
  popup_notification?: boolean;
}


export interface TodoItem {
  id: number;
  ticket_number: string;
  type: string; // e.g., 'deadline_today', 'overdue', 'waiting_part'
  description: string;
}

export interface RecycleBinItem {
  id: number;
  type: 'customer' | 'device' | 'service' | 'part';
  name: string;
  deleted_at: string;
}

