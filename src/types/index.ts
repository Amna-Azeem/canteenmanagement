export type UserRole = 'customer' | 'staff' | 'manager' | 'admin';

export type AccountStatus = 'active' | 'suspended';

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  account_status: AccountStatus;
  avatar?: string;
  phone?: string;
  student_or_emp_id?: string;
}

export type MenuItemCategory = 'Burgers' | 'Meals' | 'Drinks' | 'Snacks' | 'Desserts';

export type MenuItemStatus = 'Available' | 'Limited' | 'Sold Out' | 'Temporarily Unavailable';

export interface MenuItem {
  item_id: string;
  item_name: string;
  category: MenuItemCategory;
  price: number;
  available_quantity: number;
  preparation_time: number; // in minutes
  status: MenuItemStatus;
  image: string;
  description: string;
  is_popular?: boolean;
  calories?: number;
  is_veg?: boolean;
}

export type OrderStatus =
  | 'Placed'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Collected'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected'
  | 'Delayed'
  | 'Not Collected';

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';
export type PaymentMethod = 'counter' | 'campus_card' | 'online_demo';

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  special_instruction?: string;
  image?: string;
  prep_time_mins: number;
}

export interface Order {
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  token_number: string; // e.g. "C-101"
  total_amount: number;
  order_time: string; // ISO string
  pickup_time: string; // slot label or "ASAP"
  estimated_ready_time: string; // ISO string or time string
  actual_ready_time?: string;
  collected_time?: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  items: OrderItem[];
  cancellation_reason?: string;
  rejection_reason?: string;
  is_delayed?: boolean;
  delay_minutes?: number;
  priority_score?: number; // calculated for smart queue
  kitchen_notes?: string;
  idempotency_key?: string;
}

export interface PickupSlot {
  slot_id: string;
  label: string; // e.g., "12:00 PM - 12:15 PM"
  start_time: string; // "12:00"
  end_time: string; // "12:15"
  max_capacity: number;
  booked_count: number;
  is_full: boolean;
}

export interface SystemSettings {
  max_orders_per_15min: number;
  max_items_per_customer: number;
  max_pickups_per_slot: number;
  canteen_is_open: boolean;
  avg_prep_multiplier: number;
  canteen_name: string;
}

export interface StaffActivityLog {
  id: string;
  timestamp: string;
  staff_id: string;
  staff_name: string;
  action: string;
  details: string;
  order_id?: string;
  token_number?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  module: string;
  message: string;
  user_id?: string;
}

export interface InAppNotification {
  id: string;
  user_id: string; // or 'all_staff' or 'all'
  title: string;
  message: string;
  type: 'order' | 'system' | 'delay' | 'ready' | 'stock';
  timestamp: string;
  read: boolean;
  order_id?: string;
  token_number?: string;
}

export interface AIInsightsData {
  demandPredictions: {
    category: string;
    item_name: string;
    predicted_demand_next_day: number;
    trend: 'up' | 'down' | 'steady';
    confidence: number;
  }[];
  peakHourPrediction: {
    peak_start: string;
    peak_end: string;
    predicted_orders: number;
    congestion_risk: 'low' | 'moderate' | 'high';
  };
  prepForecast: {
    item_name: string;
    recommended_pre_cook_portions: number;
    batch_time: string;
    reason: string;
  }[];
  foodWasteRisk: {
    item_name: string;
    current_stock: number;
    predicted_unsold: number;
    risk_level: 'low' | 'medium' | 'high';
    suggested_action: string;
  }[];
  delayRiskScore: number; // 0 to 100 percentage
  salesNarrative: string[];
}
