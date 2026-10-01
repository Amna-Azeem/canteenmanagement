import { Order, OrderStatus } from '../types';

export interface SmartQueueItem {
  order: Order;
  priorityScore: number;
  isUrgent: boolean;
  isQuickPrep: boolean;
  estimatedRemainingMins: number;
  minutesInQueue: number;
  timeUntilPickupMins: number | null;
  displayStatus: OrderStatus;
  urgencyReason?: string;
}

/**
 * Calculates priority score for an order.
 * Higher score = higher ranking in kitchen queue.
 * Considers:
 * 1. Scheduled pickup urgency (orders whose pickup is within 15 mins get big boost)
 * 2. Delay status (orders waiting past expected time get emergency boost)
 * 3. Total wait time in queue (FIFO baseline)
 * 4. Quick prep bonus (small orders with low prep time can be expedited)
 */
export function calculateOrderPriority(order: Order, now: Date = new Date()): {
  score: number;
  isUrgent: boolean;
  isQuickPrep: boolean;
  urgencyReason?: string;
  timeUntilPickupMins: number | null;
} {
  let score = 50; // base score
  let isUrgent = false;
  let urgencyReason: string | undefined = undefined;

  const orderCreated = new Date(order.order_time).getTime();
  const waitMinutes = (now.getTime() - orderCreated) / (60 * 1000);

  // 1. Time waited (1 point per minute in queue)
  score += Math.min(40, waitMinutes * 1.5);

  // 2. Delay penalty / emergency boost
  if (order.is_delayed) {
    score += 45;
    isUrgent = true;
    urgencyReason = `Delayed by ${order.delay_minutes || 5}m — expediting!`;
  }

  // 3. Estimated ready time check
  const estReadyTime = new Date(order.estimated_ready_time).getTime();
  const minutesPastEstReady = (now.getTime() - estReadyTime) / (60 * 1000);
  if (minutesPastEstReady > 0 && order.order_status !== 'Ready' && order.order_status !== 'Collected') {
    score += Math.min(50, minutesPastEstReady * 4);
    isUrgent = true;
    urgencyReason = 'Exceeded expected prep time!';
  }

  // 4. Pickup slot urgency parsing
  let timeUntilPickupMins: number | null = null;
  if (order.pickup_time && order.pickup_time !== 'ASAP (~10 - 15 mins)') {
    // parse time like "12:15 PM - 12:30 PM"
    const match = order.pickup_time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      let slotHours = parseInt(match[1], 10);
      const slotMins = parseInt(match[2], 10);
      const isPM = match[3].toUpperCase() === 'PM';
      if (isPM && slotHours < 12) slotHours += 12;
      if (!isPM && slotHours === 12) slotHours = 0;

      const pickupDate = new Date(now);
      pickupDate.setHours(slotHours, slotMins, 0, 0);

      timeUntilPickupMins = Math.round((pickupDate.getTime() - now.getTime()) / (60 * 1000));

      if (timeUntilPickupMins <= 15 && timeUntilPickupMins >= 0) {
        score += 35; // Pickup imminent!
        isUrgent = true;
        urgencyReason = `Pickup in ${timeUntilPickupMins} mins`;
      } else if (timeUntilPickupMins < 0) {
        score += 55; // Customer is likely already at counter
        isUrgent = true;
        urgencyReason = `Scheduled pickup passed (${Math.abs(timeUntilPickupMins)}m ago)`;
      } else if (timeUntilPickupMins > 45) {
        // Long scheduled advance order - should not hog active kitchen space yet
        score -= 25;
      }
    }
  }

  // 5. Quick prep bonus (< 5 min total prep)
  const totalItemPrep = order.items.reduce((acc, it) => acc + (it.prep_time_mins || 4) * it.quantity, 0);
  const isQuickPrep = totalItemPrep <= 4 && order.items.length <= 2;
  if (isQuickPrep) {
    score += 8; // Small quick ticket boost
  }

  return {
    score: Math.round(score),
    isUrgent,
    isQuickPrep,
    urgencyReason,
    timeUntilPickupMins,
  };
}

/**
 * Organizes and sorts active orders for the kitchen screen into prioritized categories.
 */
export function getPrioritizedKitchenQueue(orders: Order[]): {
  incomingOrders: SmartQueueItem[];
  preparingOrders: SmartQueueItem[];
  readyOrders: SmartQueueItem[];
  scheduledUpcoming: SmartQueueItem[];
} {
  const now = new Date();

  // Filter only active orders
  const activeStatuses: OrderStatus[] = ['Placed', 'Accepted', 'Preparing', 'Ready'];
  const activeOrders = orders.filter((o) => activeStatuses.includes(o.order_status));

  const items: SmartQueueItem[] = activeOrders.map((o) => {
    const { score, isUrgent, isQuickPrep, urgencyReason, timeUntilPickupMins } = calculateOrderPriority(o, now);
    const orderCreated = new Date(o.order_time).getTime();
    const minutesInQueue = Math.max(0, Math.round((now.getTime() - orderCreated) / (60 * 1000)));

    const estReady = new Date(o.estimated_ready_time).getTime();
    const estimatedRemainingMins = Math.max(0, Math.round((estReady - now.getTime()) / (60 * 1000)));

    return {
      order: o,
      priorityScore: score,
      isUrgent,
      isQuickPrep,
      estimatedRemainingMins,
      minutesInQueue,
      timeUntilPickupMins,
      displayStatus: o.order_status,
      urgencyReason,
    };
  });

  // Sort by priority score descending
  items.sort((a, b) => b.priorityScore - a.priorityScore);

  const incomingOrders = items.filter((i) => i.displayStatus === 'Placed' || i.displayStatus === 'Accepted');
  const preparingOrders = items.filter((i) => i.displayStatus === 'Preparing');
  const readyOrders = items.filter((i) => i.displayStatus === 'Ready');
  const scheduledUpcoming = items.filter(
    (i) => i.timeUntilPickupMins !== null && i.timeUntilPickupMins > 30 && i.displayStatus !== 'Preparing' && i.displayStatus !== 'Ready'
  );

  return {
    incomingOrders,
    preparingOrders,
    readyOrders,
    scheduledUpcoming,
  };
}
