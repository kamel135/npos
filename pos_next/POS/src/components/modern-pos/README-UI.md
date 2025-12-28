# Modern POS UI System

## نظرة عامة

نظام POS حديث، محسّن للمس، يدعم RTL/LTR، ومبني على Vue 3 + Tailwind CSS. مصمم خصيصاً لشاشات Touch الكبيرة والصغيرة.

---

## 📐 البنية المعمارية

### التقسيم الأساسي (3 Columns)

```
┌────────────────────────────────────────────────────┐
│              Header (Search + Status)              │
├──────────────────┬─────────────────────────────────┤
│                  │                                 │
│                  │      Right: Cart/Invoice        │
│   Middle:        │   ┌───────────────────────┐   │
│   Product        │   │ Customer Selection    │   │
│   Catalog        │   │ Cart Items List       │   │
│   (Grid)         │   │ Totals Panel          │   │
│                  │   │ Numeric Keypad        │   │
│                  │   └───────────────────────┘   │
│                  │                                 │
├──────────────────┴─────────────────────────────────┤
│       Bottom: Checkout Bar (Payment + Actions)     │
└────────────────────────────────────────────────────┘
```

---

## 🎨 نظام الألوان والثيمات

### CSS Variables

جميع الألوان معرّفة في `theme.css`:

```css
:root {
  --pos-primary: #3b82f6;        /* Primary actions */
  --pos-success: #10b981;        /* Success states */
  --pos-danger: #ef4444;         /* Destructive actions */
  --pos-bg-base: #f8fafc;        /* App background */
  --pos-bg-elevated: #ffffff;    /* Card background */
  --pos-text-primary: #0f172a;   /* Main text */
  /* ... المزيد */
}
```

### Dark Mode

تفعيل الوضع الداكن:

```vue
<div data-theme="dark">
  <!-- Your content -->
</div>
```

**أو** استخدام الزر في AppShell مباشرة.

---

## 📱 Touch Optimization

### الحد الأدنى للأهداف القابلة للمس

| العنصر | الحجم |
|--------|-------|
| أزرار عادية | 48×48px |
| أزرار رئيسية | 56×56px |
| Keypad buttons | 70×70px |
| Cart +/− buttons | 48×48px (circular) |

### المسافات الداخلية

- بين الأزرار: **8–12px** (gap-2 to gap-3)
- بين الأعمدة: **0px** (ملتصقة)
- Padding الحاويات: **16px** (p-4)

---

## 🧩 المكونات الرئيسية

### 1. `AppShell.vue`

البنية الأساسية للتطبيق.

#### Props

```ts
{
  initialTheme: 'light' | 'dark',
  initialDirection: 'rtl' | 'ltr'
}
```

#### Slots

- `brand`: شعار/اسم التطبيق
- `status-badges`: مؤشرات الحالة
- `catalog`: محتوى الكتالوج
- `cart`: السلة
- `checkout-bar`: شريط الدفع

#### Events

- `@search`: البحث (debounced 150ms)
- `@theme-change`: تغيير الثيم
- `@direction-change`: تغيير الاتجاه

---

### 2. `ProductCard.vue`

كارت منتج واحد محسّن للمس.

#### Props

```ts
{
  product: {
    id: string,
    name: string,
    price: number,
    image?: string,
    category?: string,
    stock_qty?: number,
    is_stock_item?: boolean,
    discount_percentage?: number
  },
  showStock: boolean
}
```

#### Events

- `@click`: إضافة للسلة مباشرة
- `@long-press`: فتح موديفايِرز (500ms hold)

#### ميزات

- عرض الصور مع Lazy Loading
- شارات المخزون والخصم
- Long Press للتخصيص
- Haptic Feedback

---

### 3. `CategoryChips.vue`

فلاتر الفئات قابلة للتمرير.

#### Props

```ts
{
  categories: Array<{id, name, icon?, count?}>,
  modelValue: string | number,
  showCount: boolean,
  totalCount: number
}
```

#### Features

- Horizontal scroll مع مؤشرات سهم
- Active state واضح
- Touch-friendly (48px min)

---

### 4. `CartList.vue`

قائمة عناصر السلة.

#### Props

```ts
{
  items: Array<{
    id, name, price, quantity, image?, 
    modifiers?, notes?, discount?
  }>
}
```

#### Events

- `@increase`: زيادة الكمية
- `@decrease`: تقليل الكمية
- `@remove`: حذف العنصر
- `@edit`: تعديل الموديفايِرز
- `@clear`: مسح السلة

#### ميزات

- أزرار +/− دائرية 48×48px
- عرض الصور المصغرة
- Modifiers/Notes inline
- Swipe gestures (مستقبلاً)

---

### 5. `NumericKeypad.vue`

لوحة أرقام 4×4 للإدخال السريع.

#### Props

```ts
{
  modelValue: number | string,
  placeholder: string,
  showQuickAmounts: boolean,
  quickAmounts: number[]
}
```

#### Events

- `@update:modelValue`: القيمة الحالية
- `@enter`: تأكيد الإدخال
- `@operation`: عمليات حسابية (+, −, ×, ÷)

#### Grid Layout

```
7  8  9  ÷
4  5  6  ×
1  2  3  −
.  0  00 +
Clear    Enter
```

#### ميزات

- أزرار 70×70px للمس
- إدخال يدوي مباشر
- Quick Amount buttons
- Keyboard shortcuts
- Haptic feedback

---

### 6. `TotalsPanel.vue`

لوحة الإجماليات والحسابات.

#### Props

```ts
{
  subtotal: number,
  discount: number,
  tax: number,
  taxRate: number,
  total: number,
  amountPaid: number,
  allowEditDiscount: boolean,
  showActions: boolean
}
```

#### Events

- `@edit-discount`: تعديل الخصم
- `@hold`: تعليق الطلب
- `@add-note`: إضافة ملاحظة

#### العرض

- Subtotal → Discount → Tax → **Total** (bold, large)
- Amount Paid → Change/Remaining
- Quick Actions (Hold, Note)

---

### 7. `CheckoutBar.vue`

شريط الدفع السفلي الثابت.

#### Props

```ts
{
  total: number,
  canCheckout: boolean,
  canSaveDraft: boolean,
  processing: boolean,
  paymentMethods: Array,
  selectedPaymentMethod: string,
  checkoutLabel: string
}
```

#### Events

- `@checkout`: إتمام الدفع
- `@save-draft`: حفظ مسودة
- `@select-payment-method`: اختيار طريقة الدفع

#### Layout

```
[Payment Methods] | Total: EGP 150.00 | [Save Draft] | [Pay EGP 150]
```

---

### 8. `StatusBadges.vue`

مؤشرات حالة النظام.

#### Props

```ts
{
  isOnline: boolean,
  isSyncing: boolean,
  pendingCount: number,
  printerConnected: boolean,
  showPrinterStatus: boolean
}
```

---

### 9. `Dialog.vue`

مودال موحّد لجميع العمليات.

#### Props

```ts
{
  modelValue: boolean,
  title: string,
  showDefaultFooter: boolean,
  showCancel: boolean,
  showConfirm: boolean,
  cancelLabel: string,
  confirmLabel: string,
  canConfirm: boolean,
  closeOnEscape: boolean
}
```

#### Slots

- `default`: محتوى المودال
- `title`: العنوان المخصص
- `footer`: الإجراءات المخصصة

---

## 🎯 Responsive Grid Breakpoints

```css
/* Mobile/Tablet: 2 columns */
@media (min-width: 640px) { grid-cols-2 }

/* Small Desktop: 3 columns */
@media (min-width: 1024px) { grid-cols-3 }

/* Medium Desktop: 4 columns */
@media (min-width: 1280px) { grid-cols-4 }

/* Large Desktop: 5 columns */
@media (min-width: 1440px) { grid-cols-5 }
```

### تخصيص الشبكة

في `Catalog.vue`، يمكن تعديل الـ breakpoints:

```vue
<style scoped>
@media (min-width: 1024px) {
  .grid-cols-responsive {
    grid-template-columns: repeat(3, 1fr); /* غيّر إلى 4 أو 6 */
  }
}
</style>
```

---

## ⌨️ Keyboard Shortcuts (Desktop)

| الاختصار | الوظيفة |
|---------|----------|
| `Ctrl/Cmd + K` | فتح البحث |
| `F2` | التركيز على البحث |
| `+` | زيادة كمية العنصر المحدد |
| `-` | تقليل كمية العنصر المحدد |
| `Del` | حذف العنصر المحدد |
| `Esc` | إغلاق المودال |
| `Enter` | تأكيد/دفع |

---

## 🔧 التخصيص

### 1. تغيير الألوان الأساسية

في `theme.css`:

```css
:root {
  --pos-primary: #your-color;        /* Primary brand color */
  --pos-primary-hover: #darker;      /* Hover state */
}
```

### 2. تغيير حجم الأزرار

في `theme.css`:

```css
:root {
  --pos-touch-min: 56px;      /* غيّر إلى 64px للأزرار الأكبر */
  --pos-touch-primary: 64px;  /* زر الدفع الرئيسي */
}
```

### 3. تخصيص عرض الأعمدة

في `AppShell.vue`:

```vue
<!-- Right Sidebar Width -->
<aside class="w-96">  <!-- غيّر w-96 إلى w-80 أو w-[28rem] -->
```

### 4. إخفاء Numeric Keypad

في `Cart.vue`:

```vue
<Cart :show-keypad="false" />
```

---

## ♿ Accessibility

### Keyboard Navigation

- كل الأزرار قابلة للوصول عبر Tab
- Focus visible واضح (outline blue)
- ARIA labels على كل الأيقونات

### Screen Readers

- Semantic HTML (`<main>`, `<aside>`, `<nav>`)
- ARIA attributes (`role`, `aria-label`, `aria-modal`)
- Live regions للتحديثات

### Contrast Ratios

- Text: **4.5:1** (WCAG AA)
- Large Text: **3:1**
- Interactive Elements: **3:1**

### High Contrast Mode

يدعم `prefers-contrast: high` تلقائياً.

---

## 🧪 اختبارات

### مثال: اختبار أزرار الكمية

```js
// tests/CartList.spec.js
import { mount } from '@vue/test-utils'
import CartList from '@/components/modern-pos/CartList.vue'

describe('CartList', () => {
  it('increases quantity when + button is clicked', async () => {
    const wrapper = mount(CartList, {
      props: {
        items: [{ id: 1, name: 'Coffee', price: 10, quantity: 1 }]
      }
    })
    
    await wrapper.find('[aria-label*="Increase"]').trigger('click')
    expect(wrapper.emitted('increase')).toBeTruthy()
  })

  it('decreases quantity when - button is clicked', async () => {
    const wrapper = mount(CartList, {
      props: {
        items: [{ id: 1, name: 'Coffee', price: 10, quantity: 2 }]
      }
    })
    
    await wrapper.find('[aria-label*="Decrease"]').trigger('click')
    expect(wrapper.emitted('decrease')).toBeTruthy()
  })
})
```

### مثال: اختبار الحسابات

```js
// tests/calculations.spec.js
describe('POS Calculations', () => {
  it('calculates subtotal correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 15, quantity: 1 }
    ]
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    expect(subtotal).toBe(35)
  })

  it('applies percentage discount correctly', () => {
    const subtotal = 100
    const discountPercentage = 10
    const discount = subtotal * (discountPercentage / 100)
    expect(discount).toBe(10)
  })

  it('calculates tax correctly', () => {
    const afterDiscount = 90
    const taxRate = 14
    const tax = afterDiscount * (taxRate / 100)
    expect(tax).toBe(12.6)
  })
})
```

---

## 🚀 الاستخدام

### استيراد المكونات

```vue
<script setup>
import { ModernPOSPage } from '@/components/modern-pos'

// أو استيراد منفصل
import { AppShell, Catalog, Cart } from '@/components/modern-pos'
</script>
```

### مثال أساسي

```vue
<template>
  <ModernPOSPage
    pos-profile="Main Store"
    :products="products"
    :categories="categories"
    :customers="customers"
    :payment-methods="paymentMethods"
    :tax-rate="14"
    :is-offline="false"
    :is-syncing="false"
  />
</template>

<script setup>
import { ref } from 'vue'
import { ModernPOSPage } from '@/components/modern-pos'

const products = ref([
  {
    id: '1',
    name: 'كابتشينو',
    price: 25,
    image: '/images/cappuccino.jpg',
    category: 'مشروبات ساخنة',
    stock_qty: 50,
    is_stock_item: true
  }
  // ... المزيد
])

const categories = ref([
  { id: 'hot', name: 'مشروبات ساخنة', icon: '☕', count: 10 },
  { id: 'cold', name: 'مشروبات باردة', icon: '🥤', count: 8 }
])

const customers = ref([
  { id: '1', name: 'أحمد محمد', phone: '01234567890' }
])

const paymentMethods = ref([
  { id: 'cash', name: 'نقدي', icon: null },
  { id: 'card', name: 'بطاقة', icon: null }
])
</script>
```

### استخدام منفصل للمكونات

```vue
<template>
  <AppShell>
    <template #catalog>
      <Catalog
        :products="products"
        :categories="categories"
        @product-click="addToCart"
      />
    </template>

    <template #cart>
      <Cart
        :items="cartItems"
        :total="total"
        @increase-item="increaseQty"
        @decrease-item="decreaseQty"
      />
    </template>

    <template #checkout-bar>
      <CheckoutBar
        :total="total"
        :can-checkout="cartItems.length > 0"
        @checkout="processPayment"
      />
    </template>
  </AppShell>
</template>
```

---

## 🎨 تخصيص المظهر

### 1. تغيير شبكة المنتجات

```vue
<!-- من 5 أعمدة إلى 6 في الشاشات الكبيرة -->
<style scoped>
@media (min-width: 1440px) {
  .grid-cols-responsive {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
```

### 2. تخصيص حجم البطاقات

```vue
<!-- في ProductCard.vue -->
<div class="min-h-[200px]">  <!-- زيادة الارتفاع -->
```

### 3. تخصيص عرض السلة

```vue
<!-- في AppShell.vue -->
<aside class="w-[28rem]">  <!-- من w-96 إلى 28rem -->
```

### 4. إخفاء لوحة الأرقام على Desktop

```vue
<Cart :show-keypad="screenWidth < 1024" />
```

---

## 📊 حسابات المبيعات

### Logic الأساسي

```js
// الإجمالي الفرعي
const subtotal = items.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0
)

// الخصم
const discount = discountType === 'percentage'
  ? (subtotal * discountValue / 100)
  : discountValue

// بعد الخصم
const afterDiscount = subtotal - discount

// الضريبة
const tax = afterDiscount * (taxRate / 100)

// الإجمالي النهائي
const total = afterDiscount + tax

// الباقي/المرتجع
const change = amountPaid - total
```

---

## 🌐 RTL Support

### تبديل الاتجاه

```js
const direction = ref('rtl')

// Toggle
const toggleDirection = () => {
  direction.value = direction.value === 'rtl' ? 'ltr' : 'rtl'
}
```

### CSS Classes لـ RTL

```css
/* في theme.css */
.pos-app[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* Tailwind RTL utilities */
.pl-4 rtl:pr-4 rtl:pl-0
.left-0 rtl:right-0 rtl:left-auto
```

---

## 🔌 Integration مع APIs

### مثال: جلب المنتجات

```js
import { createResource } from 'frappe-ui'

const productsResource = createResource({
  url: 'pos_next.api.items.get_items',
  params: {
    pos_profile: 'Main Store'
  },
  auto: true
})

// استخدام
const products = computed(() => productsResource.data || [])
```

### مثال: إضافة طلب

```js
const submitOrder = async () => {
  const orderData = {
    items: cartItems.value.map(item => ({
      item_code: item.id,
      qty: item.quantity,
      rate: item.price,
      notes: item.notes
    })),
    customer: selectedCustomer.value?.id,
    payment_method: selectedPaymentMethod.value,
    total: calculations.value.total
  }

  await call('pos_next.api.invoices.create_invoice', orderData)
}
```

---

## 📏 الأحجام والمقاسات

### Breakpoints

| الحجم | العرض | الأعمدة |
|-------|-------|---------|
| Mobile | < 640px | 2 |
| Tablet | 640–1024px | 2-3 |
| Small Desktop | 1024–1280px | 3 |
| Medium Desktop | 1280–1440px | 4 |
| Large Desktop | ≥ 1440px | 5 |

### Touch Targets

| العنصر | Min Size | Recommended |
|--------|----------|-------------|
| Product Card | 120×120px | 160×160px |
| Category Chip | 48×auto | 52×auto |
| Cart Button | 48×48px | 56×56px |
| Keypad Key | 60×60px | 70×70px |
| Checkout Button | 56×auto | 64×auto |

---

## 🎭 الحالات المختلفة

### Loading State

```vue
<Catalog :loading="true" />
```

### Empty State

```vue
<!-- يُعرض تلقائياً عند products.length === 0 -->
```

### Offline State

```vue
<StatusBadges :is-online="false" :pending-count="5" />
```

### Disabled State

```vue
<button :disabled="!canCheckout" />
```

---

## 🐛 المشاكل الشائعة وحلولها

### المشكلة: الأزرار صغيرة جداً

**الحل:**
```css
.btn-pos {
  min-height: 64px !important; /* زيادة الحجم */
}
```

### المشكلة: RTL لا يعمل بشكل صحيح

**الحل:**
```vue
<div dir="rtl">  <!-- تأكد من وجود dir attribute -->
```

### المشكلة: الشبكة غير responsive

**الحل:**
تأكد من استخدام `.grid-cols-responsive` في `Catalog.vue`

### المشكلة: الـ Keypad لا يظهر

**الحل:**
```vue
<Cart :show-keypad="true" />
```

---

## 📦 الملفات المطلوبة

```
modern-pos/
├── AppShell.vue          # البنية الأساسية
├── ProductCard.vue       # كارت المنتج
├── CategoryChips.vue     # فلاتر الفئات
├── CartList.vue          # قائمة السلة
├── NumericKeypad.vue     # لوحة الأرقام
├── TotalsPanel.vue       # لوحة الإجماليات
├── CheckoutBar.vue       # شريط الدفع
├── StatusBadges.vue      # مؤشرات الحالة
├── Dialog.vue            # مودال موحد
├── Catalog.vue           # شبكة المنتجات
├── Cart.vue              # المكون الكامل للسلة
├── ModernPOSPage.vue     # الصفحة المتكاملة
├── theme.css             # نظام الألوان
├── index.js              # Exports
└── README-UI.md          # هذا الملف
```

---

## 🎓 Best Practices

### 1. الأداء

- استخدم `v-memo` للقوائم الطويلة
- Lazy load الصور
- Debounce للبحث (150ms)
- Virtual scrolling للكتالوجات الضخمة

### 2. Touch Experience

- Haptic feedback عند الإجراءات
- Visual feedback فوري
- لا تعتمد على hover (استخدم active)
- مسافات كافية بين الأهداف

### 3. RTL

- استخدم logical properties (`margin-inline`, `padding-inline`)
- اختبر في كلا الاتجاهين
- لا تستخدم `left`/`right` بدون RTL fallback

### 4. Dark Mode

- استخدم CSS variables دائماً
- اختبر التباين في الوضع الداكن
- لا تعتمد على ألوان ثابتة

---

## 📞 الدعم

لأي استفسارات أو مشاكل:

1. راجع هذا الملف أولاً
2. تأكد من `theme.css` محمّل
3. تحقق من console للأخطاء
4. اختبر على جهاز touch حقيقي

---

## 🔄 الإصدارات القادمة

- [ ] Swipe gestures للـ cart items
- [ ] Voice input للبحث
- [ ] Barcode scanner integration
- [ ] Multi-payment support
- [ ] Offline sync indicator
- [ ] Print preview
- [ ] Analytics dashboard

---

**تم البناء بـ ❤️ للتجربة المثالية على شاشات اللمس**

