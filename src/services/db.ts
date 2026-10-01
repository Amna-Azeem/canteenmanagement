import {
  AccountStatus,
  InAppNotification,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  PickupSlot,
  StaffActivityLog,
  SystemLog,
  SystemSettings,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_PICKUP_SLOTS,
  INITIAL_SETTINGS,
  INITIAL_STAFF_LOGS,
  INITIAL_SYSTEM_LOGS,
  INITIAL_USERS,
  generateSeedOrders,
} from './seedData';

const STORAGE_KEYS = {
  USERS: 'canteen_users_v1',
  MENU: 'canteen_menu_v1',
  ORDERS: 'canteen_orders_v1',
  SLOTS: 'canteen_slots_v1',
  SETTINGS: 'canteen_settings_v1',
  STAFF_LOGS: 'canteen_staff_logs_v1',
  SYSTEM_LOGS: 'canteen_sys_logs_v1',
  NOTIFICATIONS: 'canteen_notifs_v1',
  CURRENT_USER: 'canteen_cur_user_v1',
  TOKEN_SEQ: 'canteen_token_seq_v1',
  IDEMPOTENCY: 'canteen_idempotency_v1',
};

// Simple event bus for reactive updates
type DbListener = () => void;
const listeners: Set<DbListener> = new Set();

export function subscribeDb(callback: DbListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifySubscribers() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error('Error in DB subscriber:', err);
    }
  });
}

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    notifySubscribers();
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// Initialize default storage if empty
export function initDatabase(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MENU_ITEMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    const seedOrders = generateSeedOrders();
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(seedOrders));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SLOTS)) {
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(INITIAL_PICKUP_SLOTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STAFF_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.STAFF_LOGS, JSON.stringify(INITIAL_STAFF_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SYSTEM_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_LOGS, JSON.stringify(INITIAL_SYSTEM_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TOKEN_SEQ)) {
    localStorage.setItem(STORAGE_KEYS.TOKEN_SEQ, '300');
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    const initialNotifs: InAppNotification[] = [
      {
        id: 'notif_init_1',
        user_id: 'usr_customer_1',
        title: 'Order Preparing (C-101)',
        message: 'Your Classic Smash Burger combo is now sizzling in the kitchen!',
        type: 'order',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        order_id: 'ord_live_1',
        token_number: 'C-101',
      },
      {
        id: 'notif_init_2',
        user_id: 'usr_customer_2',
        title: 'Order Ready (C-102)',
        message: 'Your Chicken Burger & Mango Cooler are packaged and ready at Counter 2!',
        type: 'ready',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        read: false,
        order_id: 'ord_live_2',
        token_number: 'C-102',
      },
      {
        id: 'notif_init_3',
        user_id: 'usr_cust_4',
        title: 'Preparation Delay (C-104)',
        message: 'Kitchen peak has extended your prep by ~6 minutes. We are expediting it!',
        type: 'delay',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        read: false,
        order_id: 'ord_live_4',
        token_number: 'C-104',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));
  }
}

// ----------------- USERS -----------------
export function getUsers(): User[] {
  return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.user_id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function updateUser(updated: User): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.user_id === updated.user_id);
  if (idx >= 0) {
    users[idx] = updated;
    setStored(STORAGE_KEYS.USERS, users);
  }
}

export function setUserStatus(userId: string, status: AccountStatus): void {
  const users = getUsers();
  const user = users.find((u) => u.user_id === userId);
  if (user) {
    user.account_status = status;
    setStored(STORAGE_KEYS.USERS, users);
    addSystemLog('warn', 'USER_MANAGER', `User ${user.name} (${user.email}) status changed to ${status}.`, userId);
  }
}

export function setUserRole(userId: string, role: UserRole): void {
  const users = getUsers();
  const user = users.find((u) => u.user_id === userId);
  if (user) {
    user.role = role;
    setStored(STORAGE_KEYS.USERS, users);
    addSystemLog('info', 'USER_MANAGER', `User ${user.name} role changed to ${role}.`, userId);
  }
}

export function registerUser(newUser: User): { success: boolean; error?: string } {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase())) {
    return { success: false, error: 'An account with this email address already exists.' };
  }
  users.push(newUser);
  setStored(STORAGE_KEYS.USERS, users);
  addSystemLog('info', 'AUTH', `New user registered: ${newUser.name} (${newUser.email})`);
  return { success: true };
}

// ----------------- CURRENT USER SESSION -----------------
export function getSavedSession(): User | null {
  return getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function saveSession(user: User | null): void {
  setStored(STORAGE_KEYS.CURRENT_USER, user);
}

// ----------------- MENU ITEMS -----------------
export function getMenuItems(): MenuItem[] {
  return getStored<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return getMenuItems().find((m) => m.item_id === id);
}

export function saveMenuItem(item: MenuItem): void {
  const items = getMenuItems();
  const idx = items.findIndex((i) => i.item_id === item.item_id);
  // Re-compute status if quantity modified
  if (item.available_quantity <= 0) {
    item.status = 'Sold Out';
  } else if (item.available_quantity <= 5 && item.status !== 'Temporarily Unavailable') {
    item.status = 'Limited';
  } else if (item.status === 'Sold Out' && item.available_quantity > 0) {
    item.status = 'Available';
  }

  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.push(item);
  }
  setStored(STORAGE_KEYS.MENU, items);
  addSystemLog('info', 'MENU_MANAGER', `Menu item updated/added: ${item.item_name} ($${item.price.toFixed(2)}, stock: ${item.available_quantity})`);
}

export function deleteMenuItem(itemId: string): void {
  const items = getMenuItems().filter((i) => i.item_id !== itemId);
  setStored(STORAGE_KEYS.MENU, items);
  addSystemLog('warn', 'MENU_MANAGER', `Menu item deleted: ${itemId}`);
}

export function setMenuItemAvailability(itemId: string, status: MenuItem['status']): void {
  const items = getMenuItems();
  const item = items.find((i) => i.item_id === itemId);
  if (item) {
    item.status = status;
    setStored(STORAGE_KEYS.MENU, items);
    addSystemLog('info', 'KITCHEN_STOCK', `Item ${item.item_name} marked as ${status}.`);
  }
}

// ----------------- ORDERS & SMART QUEUE -----------------
export function getOrders(): Order[] {
  return getStored<Order[]>(STORAGE_KEYS.ORDERS, []);
}

export function getOrderById(orderId: string): Order | undefined {
  return getOrders().find((o) => o.order_id === orderId);
}

export function getOrderByToken(token: string): Order | undefined {
  const norm = token.trim().toUpperCase();
  return getOrders().find(
    (o) => o.token_number.toUpperCase() === norm || o.order_id.toUpperCase() === norm
  );
}

// Token generator: C-301, C-302, etc.
function getNextToken(): string {
  const curSeq = Number(localStorage.getItem(STORAGE_KEYS.TOKEN_SEQ) || '300');
  const nextSeq = curSeq + 1;
  localStorage.setItem(STORAGE_KEYS.TOKEN_SEQ, String(nextSeq));
  return `C-${nextSeq}`;
}

export interface PlaceOrderParams {
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: {
    menuItem: MenuItem;
    quantity: number;
    special_instruction?: string;
  }[];
  pickupSlotLabel: string;
  paymentMethod: Order['payment_method'];
  idempotencyKey: string;
}

export interface PlaceOrderResult {
  success: boolean;
  order?: Order;
  error?: string;
}

export function placeOrder(params: PlaceOrderParams): PlaceOrderResult {
  // Idempotency check: prevent duplicate submissions
  const idempotencyMap = getStored<Record<string, string>>(STORAGE_KEYS.IDEMPOTENCY, {});
  if (params.idempotencyKey && idempotencyMap[params.idempotencyKey]) {
    const existingOrderId = idempotencyMap[params.idempotencyKey];
    const existing = getOrderById(existingOrderId);
    if (existing) {
      return { success: true, order: existing };
    }
  }

  // 1. Stock validation & deduction
  const menu = getMenuItems();
  for (const requested of params.items) {
    const found = menu.find((m) => m.item_id === requested.menuItem.item_id);
    if (!found) {
      return { success: false, error: `Item "${requested.menuItem.item_name}" not found.` };
    }
    if (found.status === 'Sold Out' || found.status === 'Temporarily Unavailable') {
      return { success: false, error: `Item "${found.item_name}" is currently ${found.status.toLowerCase()}.` };
    }
    if (found.available_quantity < requested.quantity) {
      return {
        success: false,
        error: `Only ${found.available_quantity} portion(s) of "${found.item_name}" available.`,
      };
    }
  }

  // Deduct stock
  for (const requested of params.items) {
    const found = menu.find((m) => m.item_id === requested.menuItem.item_id)!;
    found.available_quantity -= requested.quantity;
    if (found.available_quantity <= 0) {
      found.available_quantity = 0;
      found.status = 'Sold Out';
      addSystemLog('warn', 'STOCK_AUTO', `${found.item_name} reached 0 stock, auto-marked Sold Out.`);
    } else if (found.available_quantity <= 5) {
      found.status = 'Limited';
    }
  }
  setStored(STORAGE_KEYS.MENU, menu);

  // 2. Pickup Slot capacity increment (if not ASAP)
  const slots = getPickupSlots();
  const matchedSlot = slots.find((s) => s.label === params.pickupSlotLabel);
  if (matchedSlot && matchedSlot.slot_id !== 'slot_asap') {
    matchedSlot.booked_count += 1;
    if (matchedSlot.booked_count >= matchedSlot.max_capacity) {
      matchedSlot.is_full = true;
    }
    setStored(STORAGE_KEYS.SLOTS, slots);
  }

  // 3. Compute estimated ready time
  const activeOrdersInKitchen = getOrders().filter(
    (o) => o.order_status === 'Accepted' || o.order_status === 'Preparing'
  ).length;

  const basePrep = params.items.reduce(
    (acc, it) => acc + it.menuItem.preparation_time * it.quantity,
    0
  );
  // Smart dynamic prep: base prep + concurrent kitchen workload buffer
  const totalPrepMins = Math.max(8, Math.round(basePrep * 0.7 + activeOrdersInKitchen * 1.5));
  const estimatedReadyIso = new Date(Date.now() + totalPrepMins * 60 * 1000).toISOString();

  // 4. Construct Order & Items
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const token = getNextToken();
  let total = 0;

  const orderItems: OrderItem[] = params.items.map((it, idx) => {
    const subtotal = Number((it.menuItem.price * it.quantity).toFixed(2));
    total += subtotal;
    return {
      order_item_id: `oi_${orderId}_${idx}`,
      order_id: orderId,
      item_id: it.menuItem.item_id,
      item_name: it.menuItem.item_name,
      unit_price: it.menuItem.price,
      quantity: it.quantity,
      subtotal: subtotal,
      special_instruction: it.special_instruction,
      image: it.menuItem.image,
      prep_time_mins: it.menuItem.preparation_time,
    };
  });

  const newOrder: Order = {
    order_id: orderId,
    customer_id: params.customerId,
    customer_name: params.customerName,
    customer_email: params.customerEmail,
    token_number: token,
    total_amount: Number(total.toFixed(2)),
    order_time: new Date().toISOString(),
    pickup_time: params.pickupSlotLabel,
    estimated_ready_time: estimatedReadyIso,
    order_status: 'Placed',
    payment_status: params.paymentMethod === 'counter' ? 'Pending' : 'Paid',
    payment_method: params.paymentMethod,
    items: orderItems,
    priority_score: 50,
    idempotency_key: params.idempotencyKey,
  };

  const allOrders = getOrders();
  allOrders.unshift(newOrder);
  setStored(STORAGE_KEYS.ORDERS, allOrders);

  // Store idempotency token
  if (params.idempotencyKey) {
    idempotencyMap[params.idempotencyKey] = orderId;
    setStored(STORAGE_KEYS.IDEMPOTENCY, idempotencyMap);
  }

  // Create notifications
  addNotification({
    user_id: params.customerId,
    title: `Order Placed (${token})`,
    message: `Your pre-order has been received. Token: ${token}. Est. Ready: ~${totalPrepMins} mins.`,
    type: 'order',
    order_id: orderId,
    token_number: token,
  });

  addStaffActivityLog({
    staff_id: 'SYSTEM',
    staff_name: 'Smart System',
    action: 'NEW_ORDER_PLACED',
    details: `New pre-order #${token} placed by ${params.customerName} ($${total.toFixed(2)})`,
    order_id: orderId,
    token_number: token,
  });

  return { success: true, order: newOrder };
}

// ----------------- CANCEL ORDER (Only allowed before preparation starts) -----------------
export function cancelOrder(
  orderId: string,
  reason: string,
  userId: string
): { success: boolean; error?: string } {
  const orders = getOrders();
  const order = orders.find((o) => o.order_id === orderId);

  if (!order) {
    return { success: false, error: 'Order not found.' };
  }

  if (order.order_status !== 'Placed' && order.order_status !== 'Accepted') {
    return {
      success: false,
      error: `Cancellation is prohibited once food preparation begins (Current status: ${order.order_status}). Please contact kitchen staff directly.`,
    };
  }

  order.order_status = 'Cancelled';
  order.cancellation_reason = reason;
  if (order.payment_status === 'Paid') {
    order.payment_status = 'Refunded';
  }

  // 1. Restore Stock
  const menu = getMenuItems();
  for (const item of order.items) {
    const found = menu.find((m) => m.item_id === item.item_id);
    if (found) {
      found.available_quantity += item.quantity;
      if (found.status === 'Sold Out' && found.available_quantity > 0) {
        found.status = found.available_quantity <= 5 ? 'Limited' : 'Available';
      }
    }
  }
  setStored(STORAGE_KEYS.MENU, menu);

  // 2. Free Pickup Slot
  const slots = getPickupSlots();
  const matchedSlot = slots.find((s) => s.label === order.pickup_time);
  if (matchedSlot && matchedSlot.booked_count > 0) {
    matchedSlot.booked_count -= 1;
    matchedSlot.is_full = false;
    setStored(STORAGE_KEYS.SLOTS, slots);
  }

  setStored(STORAGE_KEYS.ORDERS, orders);

  // Notify customer and kitchen
  addNotification({
    user_id: order.customer_id,
    title: `Order Cancelled (${order.token_number})`,
    message: `Order ${order.token_number} cancelled. Reason: ${reason}. Refund processed.`,
    type: 'system',
    order_id: order.order_id,
    token_number: order.token_number,
  });

  addStaffActivityLog({
    staff_id: userId,
    staff_name: 'Customer / System',
    action: 'ORDER_CANCELLED',
    details: `Order ${order.token_number} cancelled. Reason: ${reason}. Stock restored.`,
    order_id: order.order_id,
    token_number: order.token_number,
  });

  return { success: true };
}

// ----------------- UPDATE ORDER STATUS (Kitchen Staff / Manager) -----------------
export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  staffUser: User,
  extra?: { rejectionReason?: string; delayMins?: number; notes?: string }
): { success: boolean; error?: string } {
  const orders = getOrders();
  const order = orders.find((o) => o.order_id === orderId);

  if (!order) {
    return { success: false, error: 'Order not found.' };
  }

  const prevStatus = order.order_status;

  if (newStatus === 'Ready') {
    order.actual_ready_time = new Date().toISOString();
    addNotification({
      user_id: order.customer_id,
      title: `Order Ready for Pickup! (${order.token_number})`,
      message: `Token ${order.token_number} — Your food is freshly prepared & ready at Counter 1!`,
      type: 'ready',
      order_id: order.order_id,
      token_number: order.token_number,
    });
  } else if (newStatus === 'Preparing') {
    addNotification({
      user_id: order.customer_id,
      title: `Preparation Underway (${order.token_number})`,
      message: `Chef ${staffUser.name} has started preparing your order!`,
      type: 'order',
      order_id: order.order_id,
      token_number: order.token_number,
    });
  } else if (newStatus === 'Delayed') {
    order.is_delayed = true;
    order.delay_minutes = extra?.delayMins || 8;
    addNotification({
      user_id: order.customer_id,
      title: `Order Delayed (${order.token_number})`,
      message: `Kitchen is experiencing high traffic. Token ${order.token_number} delayed by ~${order.delay_minutes} mins. We appreciate your patience!`,
      type: 'delay',
      order_id: order.order_id,
      token_number: order.token_number,
    });
  } else if (newStatus === 'Rejected') {
    order.rejection_reason = extra?.rejectionReason || 'Kitchen temporarily overloaded';
    if (order.payment_status === 'Paid') {
      order.payment_status = 'Refunded';
    }
    // Restore stock
    const menu = getMenuItems();
    for (const item of order.items) {
      const found = menu.find((m) => m.item_id === item.item_id);
      if (found) {
        found.available_quantity += item.quantity;
      }
    }
    setStored(STORAGE_KEYS.MENU, menu);
  }

  order.order_status = newStatus;
  if (extra?.notes) {
    order.kitchen_notes = extra.notes;
  }

  setStored(STORAGE_KEYS.ORDERS, orders);

  addStaffActivityLog({
    staff_id: staffUser.user_id,
    staff_name: staffUser.name,
    action: `STATUS_${newStatus.toUpperCase()}`,
    details: `Order ${order.token_number} changed from ${prevStatus} to ${newStatus}`,
    order_id: order.order_id,
    token_number: order.token_number,
  });

  return { success: true };
}

// ----------------- TOKEN VERIFICATION & COLLECTION (No Double Collection) -----------------
export interface CollectionVerificationResult {
  success: boolean;
  order?: Order;
  error?: string;
  alreadyCollected?: boolean;
  collectedAt?: string;
}

export function verifyAndCollectOrder(
  tokenOrOrderId: string,
  staffUser: User
): CollectionVerificationResult {
  const norm = tokenOrOrderId.trim().toUpperCase();
  const orders = getOrders();
  const order = orders.find(
    (o) => o.token_number.toUpperCase() === norm || o.order_id.toUpperCase() === norm
  );

  if (!order) {
    return {
      success: false,
      error: `No order found with Token / ID "${tokenOrOrderId}". Please recheck ticket.`,
    };
  }

  // STRICT DOUBLE COLLECTION GUARD
  if (order.order_status === 'Collected' || order.order_status === 'Completed') {
    return {
      success: false,
      alreadyCollected: true,
      collectedAt: order.collected_time,
      order: order,
      error: `SECURITY ALERT: Token ${order.token_number} was ALREADY COLLECTED at ${
        order.collected_time ? new Date(order.collected_time).toLocaleTimeString() : 'an earlier time'
      }. Double collection prevented!`,
    };
  }

  if (order.order_status === 'Cancelled' || order.order_status === 'Rejected') {
    return {
      success: false,
      error: `This order is ${order.order_status.toUpperCase()} and cannot be collected.`,
      order: order,
    };
  }

  // Update order to Collected
  order.order_status = 'Collected';
  order.collected_time = new Date().toISOString();
  order.payment_status = 'Paid'; // mark settled at counter if pending

  setStored(STORAGE_KEYS.ORDERS, orders);

  addStaffActivityLog({
    staff_id: staffUser.user_id,
    staff_name: staffUser.name,
    action: 'ORDER_COLLECTED_VERIFIED',
    details: `Token ${order.token_number} verified and released to customer.`,
    order_id: order.order_id,
    token_number: order.token_number,
  });

  addNotification({
    user_id: order.customer_id,
    title: `Order Collected (${order.token_number})`,
    message: `Thank you for picking up your meal! Enjoy your food!`,
    type: 'order',
    order_id: order.order_id,
    token_number: order.token_number,
  });

  return { success: true, order: order };
}

// ----------------- PICKUP SLOTS -----------------
export function getPickupSlots(): PickupSlot[] {
  return getStored<PickupSlot[]>(STORAGE_KEYS.SLOTS, INITIAL_PICKUP_SLOTS);
}

export function savePickupSlots(slots: PickupSlot[]): void {
  setStored(STORAGE_KEYS.SLOTS, slots);
}

// ----------------- SYSTEM SETTINGS -----------------
export function getSystemSettings(): SystemSettings {
  return getStored<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export function saveSystemSettings(settings: SystemSettings): void {
  setStored(STORAGE_KEYS.SETTINGS, settings);
  addSystemLog('info', 'SETTINGS', `System operational settings updated.`);
}

// ----------------- STAFF & SYSTEM LOGS -----------------
export function getStaffActivityLogs(): StaffActivityLog[] {
  return getStored<StaffActivityLog[]>(STORAGE_KEYS.STAFF_LOGS, INITIAL_STAFF_LOGS);
}

export function addStaffActivityLog(log: Omit<StaffActivityLog, 'id' | 'timestamp'>): void {
  const logs = getStaffActivityLogs();
  const newLog: StaffActivityLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  // Keep last 300 logs
  if (logs.length > 300) logs.pop();
  setStored(STORAGE_KEYS.STAFF_LOGS, logs);
}

export function getSystemLogs(): SystemLog[] {
  return getStored<SystemLog[]>(STORAGE_KEYS.SYSTEM_LOGS, INITIAL_SYSTEM_LOGS);
}

export function addSystemLog(
  level: SystemLog['level'],
  module: string,
  message: string,
  userId?: string
): void {
  const logs = getSystemLogs();
  const newLog: SystemLog = {
    id: `slog_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    user_id: userId,
  };
  logs.unshift(newLog);
  if (logs.length > 300) logs.pop();
  setStored(STORAGE_KEYS.SYSTEM_LOGS, logs);
}

// ----------------- NOTIFICATIONS -----------------
export function getNotifications(userId?: string): InAppNotification[] {
  const all = getStored<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  if (!userId) return all;
  return all.filter((n) => n.user_id === userId || n.user_id === 'all');
}

export function addNotification(
  notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>
): void {
  const all = getStored<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  const created: InAppNotification = {
    ...notif,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  all.unshift(created);
  setStored(STORAGE_KEYS.NOTIFICATIONS, all);
}

export function markNotificationAsRead(notifId: string): void {
  const all = getStored<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  const found = all.find((n) => n.id === notifId);
  if (found) {
    found.read = true;
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
  }
}

export function markAllNotificationsAsRead(userId: string): void {
  const all = getStored<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  all.forEach((n) => {
    if (n.user_id === userId || n.user_id === 'all') {
      n.read = true;
    }
  });
  setStored(STORAGE_KEYS.NOTIFICATIONS, all);
}

// ----------------- REORDER VALIDATION HELPER -----------------
export function checkReorderAvailability(order: Order): {
  availableItems: { item: MenuItem; quantity: number; special_instruction?: string }[];
  unavailableItems: { name: string; reason: string }[];
} {
  const menu = getMenuItems();
  const availableItems: { item: MenuItem; quantity: number; special_instruction?: string }[] = [];
  const unavailableItems: { name: string; reason: string }[] = [];

  for (const oi of order.items) {
    const menuItem = menu.find((m) => m.item_id === oi.item_id);
    if (!menuItem) {
      unavailableItems.push({ name: oi.item_name, reason: 'Discontinued or no longer on menu' });
    } else if (menuItem.status === 'Sold Out' || menuItem.available_quantity <= 0) {
      unavailableItems.push({ name: oi.item_name, reason: 'Sold Out' });
    } else if (menuItem.status === 'Temporarily Unavailable') {
      unavailableItems.push({ name: oi.item_name, reason: 'Temporarily Unavailable' });
    } else {
      const safeQty = Math.min(oi.quantity, menuItem.available_quantity);
      availableItems.push({
        item: menuItem,
        quantity: safeQty,
        special_instruction: oi.special_instruction,
      });
      if (safeQty < oi.quantity) {
        unavailableItems.push({
          name: oi.item_name,
          reason: `Reduced quantity from ${oi.quantity} to ${safeQty} (limited stock remaining)`,
        });
      }
    }
  }

  return { availableItems, unavailableItems };
}
