import { MenuItem, Order, OrderItem, OrderStatus, PickupSlot, SystemSettings, User, StaffActivityLog, SystemLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    user_id: 'usr_customer_1',
    name: 'Alex Morgan',
    email: 'student@canteen.edu',
    role: 'customer',
    account_status: 'active',
    student_or_emp_id: 'STU-9842',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    user_id: 'usr_staff_1',
    name: 'Chef Marco Bellini',
    email: 'kitchen@canteen.edu',
    role: 'staff',
    account_status: 'active',
    student_or_emp_id: 'STAFF-104',
    phone: '+1 (555) 876-5432',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=256&q=80',
  },
  {
    user_id: 'usr_manager_1',
    name: 'Sarah Jenkins',
    email: 'manager@canteen.edu',
    role: 'manager',
    account_status: 'active',
    student_or_emp_id: 'MGR-201',
    phone: '+1 (555) 901-2345',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  },
  {
    user_id: 'usr_admin_1',
    name: 'Devin Vance',
    email: 'admin@canteen.edu',
    role: 'admin',
    account_status: 'active',
    student_or_emp_id: 'ADM-001',
    phone: '+1 (555) 111-2233',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    user_id: 'usr_customer_2',
    name: 'Priya Sharma',
    email: 'priya@canteen.edu',
    role: 'customer',
    account_status: 'active',
    student_or_emp_id: 'STU-9843',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  },
  {
    user_id: 'usr_customer_suspended',
    name: 'Liam Scott',
    email: 'liam.suspended@canteen.edu',
    role: 'customer',
    account_status: 'suspended',
    student_or_emp_id: 'STU-7721',
    phone: '+1 (555) 444-5555',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Burgers
  {
    item_id: 'item_b1',
    item_name: 'Classic Smash Cheeseburger',
    category: 'Burgers',
    price: 6.99,
    available_quantity: 42,
    preparation_time: 7,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    description: 'Crispy-edged beef patty, melted cheddar, house pickle relish & secret spread on brioche.',
    is_popular: true,
    calories: 590,
    is_veg: false,
  },
  {
    item_id: 'item_b2',
    item_name: 'Crispy Buttermilk Chicken Burger',
    category: 'Burgers',
    price: 7.49,
    available_quantity: 28,
    preparation_time: 8,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
    description: 'Golden fried chicken breast, tangy jalapeño slaw and spicy honey mayo.',
    is_popular: true,
    calories: 640,
    is_veg: false,
  },
  {
    item_id: 'item_b3',
    item_name: 'Garden Harvest Veggie Burger',
    category: 'Burgers',
    price: 6.49,
    available_quantity: 19,
    preparation_time: 6,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80',
    description: 'Black bean and quinoa patty, smashed avocado, crisp arugula and tomato jam.',
    is_popular: false,
    calories: 450,
    is_veg: true,
  },
  {
    item_id: 'item_b4',
    item_name: 'Truffle Mushroom Swiss Burger',
    category: 'Burgers',
    price: 8.99,
    available_quantity: 5,
    preparation_time: 9,
    status: 'Limited',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    description: 'Sautéed cremini mushrooms, Swiss cheese, roasted garlic aioli & truffle glaze.',
    is_popular: true,
    calories: 680,
    is_veg: false,
  },

  // Meals
  {
    item_id: 'item_m1',
    item_name: 'Teriyaki Chicken Rice Bowl',
    category: 'Meals',
    price: 8.49,
    available_quantity: 35,
    preparation_time: 6,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    description: 'Glazed chicken thighs, steamed jasmine rice, broccoli florets and toasted sesame seeds.',
    is_popular: true,
    calories: 520,
    is_veg: false,
  },
  {
    item_id: 'item_m2',
    item_name: 'Mediterranean Falafel Hummus Platter',
    category: 'Meals',
    price: 7.99,
    available_quantity: 24,
    preparation_time: 5,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    description: 'Herb falafels, garlic tahini hummus, kalamata olives, diced cucumber salad & pita.',
    is_popular: false,
    calories: 490,
    is_veg: true,
  },
  {
    item_id: 'item_m3',
    item_name: 'Creamy Tuscan Penne Pasta',
    category: 'Meals',
    price: 7.29,
    available_quantity: 22,
    preparation_time: 8,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281788?auto=format&fit=crop&w=600&q=80',
    description: 'Al dente penne in roasted garlic parmesan cream, sun-dried tomatoes and baby spinach.',
    is_popular: false,
    calories: 610,
    is_veg: true,
  },
  {
    item_id: 'item_m4',
    item_name: 'Grilled Salmon Quinoa Power Bowl',
    category: 'Meals',
    price: 10.99,
    available_quantity: 0,
    preparation_time: 10,
    status: 'Sold Out',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
    description: 'Wild salmon fillet, tricolor quinoa, roasted sweet potatoes, kale and citrus dressing.',
    is_popular: true,
    calories: 560,
    is_veg: false,
  },
  {
    item_id: 'item_m5',
    item_name: 'Korean Spicy BBQ Pork Rice',
    category: 'Meals',
    price: 8.79,
    available_quantity: 18,
    preparation_time: 7,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=600&q=80',
    description: 'Thinly sliced marinated pork, spicy gochujang sauce, kimchi, scallions & sunny fried egg.',
    is_popular: true,
    calories: 630,
    is_veg: false,
  },

  // Snacks
  {
    item_id: 'item_s1',
    item_name: 'Crispy Seasoned French Fries',
    category: 'Snacks',
    price: 3.29,
    available_quantity: 50,
    preparation_time: 4,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    description: 'Double-cooked golden russet potato fries tossed in smoked sea salt and paprika.',
    is_popular: true,
    calories: 320,
    is_veg: true,
  },
  {
    item_id: 'item_s2',
    item_name: 'Parmesan Truffle Potato Wedges',
    category: 'Snacks',
    price: 4.49,
    available_quantity: 30,
    preparation_time: 5,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1605493725745-f09b307ecaa2?auto=format&fit=crop&w=600&q=80',
    description: 'Thick cut wedges coated in aged parmesan, fresh parsley, and white truffle oil.',
    is_popular: false,
    calories: 390,
    is_veg: true,
  },
  {
    item_id: 'item_s3',
    item_name: 'Buffalo Chicken Tenders (4 pcs)',
    category: 'Snacks',
    price: 5.99,
    available_quantity: 26,
    preparation_time: 6,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    description: 'Buttermilk fried chicken strips glazed with tangy cayenne pepper buffalo sauce & blue cheese dip.',
    is_popular: true,
    calories: 480,
    is_veg: false,
  },
  {
    item_id: 'item_s4',
    item_name: 'Loaded Nachos Supreme',
    category: 'Snacks',
    price: 5.49,
    available_quantity: 20,
    preparation_time: 5,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
    description: 'Tortilla chips drenched in warm queso, black beans, pico de gallo, and sour cream.',
    is_popular: false,
    calories: 520,
    is_veg: true,
  },
  {
    item_id: 'item_s5',
    item_name: 'Vegetable Spring Rolls (3 pcs)',
    category: 'Snacks',
    price: 3.99,
    available_quantity: 4,
    preparation_time: 4,
    status: 'Limited',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    description: 'Crispy pastry rolls filled with shredded cabbage, carrots, shiitake, sweet plum dip.',
    is_popular: false,
    calories: 260,
    is_veg: true,
  },

  // Drinks
  {
    item_id: 'item_d1',
    item_name: 'Cold Brew Vanilla Latte',
    category: 'Drinks',
    price: 3.99,
    available_quantity: 45,
    preparation_time: 2,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    description: '18-hour steeped single-origin cold brew, oat milk, and Madagascar vanilla syrup.',
    is_popular: true,
    calories: 140,
    is_veg: true,
  },
  {
    item_id: 'item_d2',
    item_name: 'Fresh Mango Passionfruit Cooler',
    category: 'Drinks',
    price: 3.49,
    available_quantity: 36,
    preparation_time: 2,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80',
    description: 'Real Alfonso mango purée with sparkling passionfruit soda and fresh mint leaves.',
    is_popular: true,
    calories: 120,
    is_veg: true,
  },
  {
    item_id: 'item_d3',
    item_name: 'Iced Matcha Green Tea',
    category: 'Drinks',
    price: 4.29,
    available_quantity: 25,
    preparation_time: 3,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    description: 'Ceremonial Uji matcha whisked with filtered ice and almond milk.',
    is_popular: false,
    calories: 110,
    is_veg: true,
  },
  {
    item_id: 'item_d4',
    item_name: 'Lemon Mint Sparkler',
    category: 'Drinks',
    price: 2.79,
    available_quantity: 40,
    preparation_time: 2,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    description: 'Zesty freshly squeezed lemon juice, organic cane sugar, crushed mint and sparkling water.',
    is_popular: false,
    calories: 90,
    is_veg: true,
  },
  {
    item_id: 'item_d5',
    item_name: 'Organic Strawberry Milkshake',
    category: 'Drinks',
    price: 4.59,
    available_quantity: 16,
    preparation_time: 3,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    description: 'Whole milk churned with fresh strawberries and vanilla bean gelato, whipped cream on top.',
    is_popular: true,
    calories: 380,
    is_veg: true,
  },

  // Desserts
  {
    item_id: 'item_e1',
    item_name: 'Warm Chocolate Fudge Brownie',
    category: 'Desserts',
    price: 3.49,
    available_quantity: 28,
    preparation_time: 2,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    description: 'Rich dark chocolate cake served warm with Belgian chocolate chips and caramel drizzle.',
    is_popular: true,
    calories: 360,
    is_veg: true,
  },
  {
    item_id: 'item_e2',
    item_name: 'New York Style Berry Cheesecake',
    category: 'Desserts',
    price: 4.29,
    available_quantity: 14,
    preparation_time: 2,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
    description: 'Classic creamy baked cheesecake on graham cracker crust with mixed berry compote.',
    is_popular: false,
    calories: 420,
    is_veg: true,
  },
  {
    item_id: 'item_e3',
    item_name: 'Belgian Waffle with Ice Cream',
    category: 'Desserts',
    price: 4.99,
    available_quantity: 0,
    preparation_time: 5,
    status: 'Temporarily Unavailable',
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80',
    description: 'Crispy pearl sugar waffle crowned with vanilla scoop and maple butter.',
    is_popular: true,
    calories: 490,
    is_veg: true,
  },
  {
    item_id: 'item_e4',
    item_name: 'Glazed Cinnamon Roll',
    category: 'Desserts',
    price: 3.29,
    available_quantity: 22,
    preparation_time: 1,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    description: 'Swirled bakery dough packed with Korintje cinnamon and drenched in cream cheese frosting.',
    is_popular: false,
    calories: 340,
    is_veg: true,
  },
];

export const INITIAL_PICKUP_SLOTS: PickupSlot[] = [
  { slot_id: 'slot_asap', label: 'ASAP (~10 - 15 mins)', start_time: '11:00', end_time: '11:15', max_capacity: 40, booked_count: 14, is_full: false },
  { slot_id: 'slot_1', label: '11:30 AM - 11:45 AM', start_time: '11:30', end_time: '11:45', max_capacity: 15, booked_count: 11, is_full: false },
  { slot_id: 'slot_2', label: '11:45 AM - 12:00 PM', start_time: '11:45', end_time: '12:00', max_capacity: 15, booked_count: 15, is_full: true },
  { slot_id: 'slot_3', label: '12:00 PM - 12:15 PM', start_time: '12:00', end_time: '12:15', max_capacity: 20, booked_count: 20, is_full: true },
  { slot_id: 'slot_4', label: '12:15 PM - 12:30 PM', start_time: '12:15', end_time: '12:30', max_capacity: 20, booked_count: 18, is_full: false },
  { slot_id: 'slot_5', label: '12:30 PM - 12:45 PM', start_time: '12:30', end_time: '12:45', max_capacity: 20, booked_count: 14, is_full: false },
  { slot_id: 'slot_6', label: '12:45 PM - 01:00 PM', start_time: '12:45', end_time: '13:00', max_capacity: 20, booked_count: 9, is_full: false },
  { slot_id: 'slot_7', label: '01:00 PM - 01:15 PM', start_time: '13:00', end_time: '13:15', max_capacity: 20, booked_count: 19, is_full: false },
  { slot_id: 'slot_8', label: '01:15 PM - 01:30 PM', start_time: '13:15', end_time: '13:30', max_capacity: 15, booked_count: 8, is_full: false },
  { slot_id: 'slot_9', label: '01:30 PM - 01:45 PM', start_time: '13:30', end_time: '13:45', max_capacity: 15, booked_count: 5, is_full: false },
  { slot_id: 'slot_10', label: '01:45 PM - 02:00 PM', start_time: '13:45', end_time: '14:00', max_capacity: 15, booked_count: 3, is_full: false },
];

export const INITIAL_SETTINGS: SystemSettings = {
  max_orders_per_15min: 25,
  max_items_per_customer: 8,
  max_pickups_per_slot: 20,
  canteen_is_open: true,
  avg_prep_multiplier: 1.0,
  canteen_name: 'Campus Central Smart Canteen',
};

// Generates ~150 historical orders over the past 30 days
export function generateSeedOrders(): Order[] {
  const orders: Order[] = [];
  const cancellationReasons = [
    'Lecture schedule changed',
    'Ordered by mistake',
    'Wait time longer than expected',
    'Selected incorrect pickup slot',
    'Dietary adjustment needed',
  ];

  const now = new Date();

  // Create active live orders for the demo right now
  const liveDemoOrders: Partial<Order>[] = [
    {
      order_id: 'ord_live_1',
      customer_id: 'usr_customer_1',
      customer_name: 'Alex Morgan',
      customer_email: 'student@canteen.edu',
      token_number: 'C-101',
      total_amount: 14.47,
      order_time: new Date(now.getTime() - 8 * 60 * 1000).toISOString(),
      pickup_time: '12:15 PM - 12:30 PM',
      estimated_ready_time: new Date(now.getTime() + 4 * 60 * 1000).toISOString(),
      order_status: 'Preparing',
      payment_status: 'Paid',
      payment_method: 'campus_card',
      items: [
        {
          order_item_id: 'oi_live_1',
          order_id: 'ord_live_1',
          item_id: 'item_b1',
          item_name: 'Classic Smash Cheeseburger',
          unit_price: 6.99,
          quantity: 1,
          subtotal: 6.99,
          special_instruction: 'Extra pickles, no onion please',
          image: INITIAL_MENU_ITEMS[0].image,
          prep_time_mins: 7,
        },
        {
          order_item_id: 'oi_live_2',
          order_id: 'ord_live_1',
          item_id: 'item_s1',
          item_name: 'Crispy Seasoned French Fries',
          unit_price: 3.29,
          quantity: 1,
          subtotal: 3.29,
          image: INITIAL_MENU_ITEMS[8].image,
          prep_time_mins: 4,
        },
        {
          order_item_id: 'oi_live_3',
          order_id: 'ord_live_1',
          item_id: 'item_d1',
          item_name: 'Cold Brew Vanilla Latte',
          unit_price: 3.99,
          quantity: 1,
          subtotal: 3.99,
          image: INITIAL_MENU_ITEMS[13].image,
          prep_time_mins: 2,
        },
      ],
      priority_score: 88,
      kitchen_notes: 'Priority lunch order',
    },
    {
      order_id: 'ord_live_2',
      customer_id: 'usr_customer_2',
      customer_name: 'Priya Sharma',
      customer_email: 'priya@canteen.edu',
      token_number: 'C-102',
      total_amount: 11.48,
      order_time: new Date(now.getTime() - 14 * 60 * 1000).toISOString(),
      pickup_time: '12:00 PM - 12:15 PM',
      estimated_ready_time: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      actual_ready_time: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      order_status: 'Ready',
      payment_status: 'Paid',
      payment_method: 'online_demo',
      items: [
        {
          order_item_id: 'oi_live_4',
          order_id: 'ord_live_2',
          item_id: 'item_b2',
          item_name: 'Crispy Buttermilk Chicken Burger',
          unit_price: 7.49,
          quantity: 1,
          subtotal: 7.49,
          special_instruction: 'Mild sauce on side',
          image: INITIAL_MENU_ITEMS[1].image,
          prep_time_mins: 8,
        },
        {
          order_item_id: 'oi_live_5',
          order_id: 'ord_live_2',
          item_id: 'item_d2',
          item_name: 'Fresh Mango Passionfruit Cooler',
          unit_price: 3.49,
          quantity: 1,
          subtotal: 3.49,
          image: INITIAL_MENU_ITEMS[14].image,
          prep_time_mins: 2,
        },
      ],
      priority_score: 95,
    },
    {
      order_id: 'ord_live_3',
      customer_id: 'usr_cust_3',
      customer_name: 'Jordan Lee',
      customer_email: 'jordan@canteen.edu',
      token_number: 'C-103',
      total_amount: 8.49,
      order_time: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
      pickup_time: '12:30 PM - 12:45 PM',
      estimated_ready_time: new Date(now.getTime() + 9 * 60 * 1000).toISOString(),
      order_status: 'Accepted',
      payment_status: 'Paid',
      payment_method: 'counter',
      items: [
        {
          order_item_id: 'oi_live_6',
          order_id: 'ord_live_3',
          item_id: 'item_m1',
          item_name: 'Teriyaki Chicken Rice Bowl',
          unit_price: 8.49,
          quantity: 1,
          subtotal: 8.49,
          image: INITIAL_MENU_ITEMS[4].image,
          prep_time_mins: 6,
        },
      ],
      priority_score: 72,
    },
    {
      order_id: 'ord_live_4',
      customer_id: 'usr_cust_4',
      customer_name: 'Hannah Brooks',
      customer_email: 'hannah@canteen.edu',
      token_number: 'C-104',
      total_amount: 14.47,
      order_time: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      pickup_time: '11:45 AM - 12:00 PM',
      estimated_ready_time: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      order_status: 'Preparing',
      is_delayed: true,
      delay_minutes: 6,
      payment_status: 'Paid',
      payment_method: 'campus_card',
      items: [
        {
          order_item_id: 'oi_live_7',
          order_id: 'ord_live_4',
          item_id: 'item_b4',
          item_name: 'Truffle Mushroom Swiss Burger',
          unit_price: 8.99,
          quantity: 1,
          subtotal: 8.99,
          image: INITIAL_MENU_ITEMS[3].image,
          prep_time_mins: 9,
        },
        {
          order_item_id: 'oi_live_8',
          order_id: 'ord_live_4',
          item_id: 'item_s4',
          item_name: 'Loaded Nachos Supreme',
          unit_price: 5.49,
          quantity: 1,
          subtotal: 5.49,
          image: INITIAL_MENU_ITEMS[11].image,
          prep_time_mins: 5,
        },
      ],
      priority_score: 99,
    },
    {
      order_id: 'ord_live_5',
      customer_id: 'usr_cust_5',
      customer_name: 'David Kim',
      customer_email: 'david@canteen.edu',
      token_number: 'C-105',
      total_amount: 7.99,
      order_time: new Date(now.getTime() - 1 * 60 * 1000).toISOString(),
      pickup_time: '12:45 PM - 01:00 PM',
      estimated_ready_time: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
      order_status: 'Placed',
      payment_status: 'Pending',
      payment_method: 'counter',
      items: [
        {
          order_item_id: 'oi_live_9',
          order_id: 'ord_live_5',
          item_id: 'item_m2',
          item_name: 'Mediterranean Falafel Hummus Platter',
          unit_price: 7.99,
          quantity: 1,
          subtotal: 7.99,
          image: INITIAL_MENU_ITEMS[5].image,
          prep_time_mins: 5,
        },
      ],
      priority_score: 65,
    },
  ];

  orders.push(...(liveDemoOrders as Order[]));

  // Generate 145 past historical orders spread across past 30 days
  const customerNames = [
    'Sam Wilson', 'Chloe Evans', 'Ethan Wright', 'Maya Patel', 'Lucas Garcia',
    'Olivia Taylor', 'Noah Johnson', 'Sophia Brown', 'Benjamin Davis', 'Emma Wilson'
  ];

  let tokenCounter = 106;

  for (let i = 1; i <= 145; i++) {
    // Spread evenly across 30 days
    const daysAgo = Math.floor((i / 145) * 29);
    // Peak hours around 12:00 - 14:00 (lunch), second peak around 8:30 - 9:30, 15:30 - 16:30
    const hourWeight = Math.random();
    let hour = 12;
    if (hourWeight < 0.55) {
      hour = 12 + Math.floor(Math.random() * 2); // 12 or 13 (Lunch peak)
    } else if (hourWeight < 0.75) {
      hour = 11 + Math.floor(Math.random() * 2); // 11 or 12
    } else if (hourWeight < 0.90) {
      hour = 14 + Math.floor(Math.random() * 3); // 14 to 16
    } else {
      hour = 8 + Math.floor(Math.random() * 3); // Breakfast 8-10
    }

    const minute = Math.floor(Math.random() * 60);
    const orderDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    orderDate.setHours(hour, minute, 0, 0);

    // Pick 1 to 3 items
    const itemCount = Math.random() < 0.6 ? 2 : (Math.random() < 0.8 ? 1 : 3);
    const selectedItems: OrderItem[] = [];
    let orderTotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const menuIdx = Math.floor(Math.random() * INITIAL_MENU_ITEMS.length);
      const menuItem = INITIAL_MENU_ITEMS[menuIdx];
      const qty = Math.random() < 0.85 ? 1 : 2;
      const subtotal = Number((menuItem.price * qty).toFixed(2));
      orderTotal += subtotal;

      selectedItems.push({
        order_item_id: `oi_hist_${i}_${j}`,
        order_id: `ord_hist_${i}`,
        item_id: menuItem.item_id,
        item_name: menuItem.item_name,
        unit_price: menuItem.price,
        quantity: qty,
        subtotal: subtotal,
        image: menuItem.image,
        prep_time_mins: menuItem.preparation_time,
      });
    }

    // Determine status (mostly Completed, 6% Cancelled, 3% Delayed then collected, 1% Not Collected)
    const statusRoll = Math.random();
    let status: OrderStatus = 'Completed';
    let cancelReason: string | undefined = undefined;
    let isDelayed = false;
    let delayMins = 0;

    if (statusRoll < 0.08) {
      status = 'Cancelled';
      cancelReason = cancellationReasons[Math.floor(Math.random() * cancellationReasons.length)];
    } else if (statusRoll < 0.11) {
      status = 'Not Collected';
    } else if (statusRoll < 0.22) {
      status = 'Completed';
      isDelayed = true;
      delayMins = Math.floor(Math.random() * 7) + 3;
    }

    const customerIdx = Math.floor(Math.random() * customerNames.length);
    const cName = customerNames[customerIdx];
    const cEmail = `${cName.toLowerCase().replace(' ', '.')}@canteen.edu`;

    const prepMins = selectedItems.reduce((acc, it) => acc + it.prep_time_mins, 0) + (isDelayed ? delayMins : 0);
    const estReady = new Date(orderDate.getTime() + prepMins * 60 * 1000).toISOString();
    const actualReady = status === 'Completed' ? new Date(orderDate.getTime() + (prepMins + (Math.random() * 2 - 1)) * 60 * 1000).toISOString() : undefined;
    const collected = status === 'Completed' ? new Date(orderDate.getTime() + (prepMins + 5) * 60 * 1000).toISOString() : undefined;

    orders.push({
      order_id: `ord_hist_${i}`,
      customer_id: `usr_cust_${customerIdx}`,
      customer_name: cName,
      customer_email: cEmail,
      token_number: `C-${tokenCounter++}`,
      total_amount: Number(orderTotal.toFixed(2)),
      order_time: orderDate.toISOString(),
      pickup_time: `${hour % 12 || 12}:${minute < 30 ? '30' : '45'} ${hour >= 12 ? 'PM' : 'AM'}`,
      estimated_ready_time: estReady,
      actual_ready_time: actualReady,
      collected_time: collected,
      order_status: status,
      payment_status: status === 'Cancelled' ? 'Refunded' : 'Paid',
      payment_method: Math.random() < 0.5 ? 'campus_card' : (Math.random() < 0.8 ? 'online_demo' : 'counter'),
      items: selectedItems,
      cancellation_reason: cancelReason,
      is_delayed: isDelayed,
      delay_minutes: delayMins,
    });
  }

  return orders;
}

export const INITIAL_STAFF_LOGS: StaffActivityLog[] = [
  {
    id: 'log_1',
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    staff_id: 'usr_staff_1',
    staff_name: 'Chef Marco Bellini',
    action: 'ACCEPTED_ORDER',
    details: 'Accepted order C-101 (Classic Smash Burger combo)',
    order_id: 'ord_live_1',
    token_number: 'C-101',
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    staff_id: 'usr_staff_1',
    staff_name: 'Chef Marco Bellini',
    action: 'STARTED_PREPARATION',
    details: 'Order C-101 shifted to preparation station',
    order_id: 'ord_live_1',
    token_number: 'C-101',
  },
  {
    id: 'log_3',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    staff_id: 'usr_staff_1',
    staff_name: 'Chef Marco Bellini',
    action: 'MARKED_READY',
    details: 'Token C-102 marked Ready for pickup. Customer notified.',
    order_id: 'ord_live_2',
    token_number: 'C-102',
  },
];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'slog_1',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    level: 'info',
    module: 'STOCK_ENGINE',
    message: 'Auto-updated Grilled Salmon Quinoa Bowl to Sold Out (stock reached 0).',
  },
  {
    id: 'slog_2',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    level: 'warn',
    module: 'QUEUE_MONITOR',
    message: 'Detected preparation bottleneck for token C-104 (high ticket load). Order flagged Delayed.',
  },
  {
    id: 'slog_3',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    level: 'info',
    module: 'SLOT_MANAGER',
    message: 'Slot 12:00 PM - 12:15 PM reached capacity (20/20). Shifted subsequent bookings to next slot.',
  },
];
