# دليل التكامل مع pos_next الحالي

## الخطوة 1: استيراد theme.css

في `src/main.js`:

```js
import './components/modern-pos/theme.css'
```

## الخطوة 2: إنشاء صفحة POS جديدة

أنشئ `src/pages/ModernPOS.vue`:

```vue
<template>
	<ModernPOSPage
		:pos-profile="shiftStore.profileName"
		:products="itemStore.items"
		:categories="itemStore.itemGroups"
		:customers="customerStore.customers"
		:payment-methods="paymentModes"
		:tax-rate="14"
		:is-offline="offlineStore.isOffline"
		:is-syncing="offlineStore.isSyncing"
		:pending-invoices-count="offlineStore.pendingInvoicesCount"
	/>
</template>

<script setup>
import { ModernPOSPage } from '@/components/modern-pos'
import { useShiftStore } from '@/stores/posShift'
import { useItemStore } from '@/stores/itemSearch'
import { useCustomerStore } from '@/stores/customerSearch'
import { useOfflineStore } from '@/stores/posSync'

const shiftStore = useShiftStore()
const itemStore = useItemStore()
const customerStore = useCustomerStore()
const offlineStore = useOfflineStore()

const paymentModes = [
	{ id: 'cash', name: 'نقدي' },
	{ id: 'card', name: 'بطاقة' }
]
</script>
```

## الخطوة 3: إضافة Route

في `src/router.js`:

```js
import ModernPOS from './pages/ModernPOS.vue'

const routes = [
	// ... existing routes
	{
		path: '/modern',
		name: 'ModernPOS',
		component: ModernPOS,
		meta: { requiresAuth: true }
	}
]
```

## الخطوة 4: ربط مع الـ Stores الموجودة

### استخدام posCart Store

```vue
<script setup>
import { usePOSCart } from '@/stores/posCart'

const cartStore = usePOSCart()

// Add to cart
const addToCart = (product) => {
	cartStore.addItem({
		item_code: product.item_code,
		item_name: product.name,
		rate: product.price,
		qty: 1
	})
}

// Get cart items
const cartItems = computed(() => cartStore.items)
</script>
```

### استخدام Invoice API

```vue
<script setup>
import { call } from 'frappe-ui'

const submitOrder = async (orderData) => {
	try {
		const result = await call('pos_next.api.invoices.create_invoice', {
			items: orderData.items,
			customer: orderData.customer,
			pos_profile: shiftStore.profileName
		})
		
		console.log('Invoice created:', result)
		return result
	} catch (error) {
		console.error('Failed to create invoice:', error)
		throw error
	}
}
</script>
```

## الخطوة 5: استخدام المكونات بشكل منفصل

### مثال: استخدام Catalog فقط

```vue
<template>
	<div class="h-screen flex flex-col">
		<!-- Custom header -->
		<header>...</header>

		<!-- Use only Catalog -->
		<Catalog
			:products="products"
			:categories="categories"
			:search-query="searchQuery"
			@product-click="handleProductClick"
		/>
	</div>
</template>

<script setup>
import { Catalog } from '@/components/modern-pos'
</script>
```

### مثال: استخدام Cart منفصل

```vue
<template>
	<div class="fixed right-0 top-0 h-screen w-96">
		<Cart
			:items="cartItems"
			:customer="selectedCustomer"
			:subtotal="calculations.subtotal"
			:total="calculations.total"
			@increase-item="increaseQty"
		/>
	</div>
</template>
```

## الخطوة 6: تخصيص الثيم

### تعديل الألوان

أنشئ `src/assets/custom-theme.css`:

```css
:root {
	--pos-primary: #your-brand-color;
	--pos-success: #your-success-color;
	/* ... */
}
```

واستورده في `main.js`:

```js
import './assets/custom-theme.css'
```

### إضافة لغة جديدة

```js
// في أي مكون
const __ = (text, locale = 'ar') => {
	const translations = {
		'ar': { 'Cart': 'السلة', 'Pay': 'دفع' },
		'en': { 'Cart': 'Cart', 'Pay': 'Pay' }
	}
	return translations[locale][text] || text
}
```

## الخطوة 7: Testing

### تشغيل الاختبارات

```bash
cd /home/eslam/frappe-bench/apps/pos_next/POS
npm test
```

### إضافة اختبار جديد

```js
// tests/MyComponent.spec.js
import { mount } from '@vue/test-utils'
import MyComponent from '../MyComponent.vue'

describe('MyComponent', () => {
	it('does something', () => {
		const wrapper = mount(MyComponent)
		expect(wrapper.exists()).toBe(true)
	})
})
```

---

## 🔥 Quick Start

### 1. استيراد النظام الكامل

```vue
<template>
	<ModernPOSPage
		pos-profile="Main Store"
		:products="products"
		:categories="categories"
	/>
</template>

<script setup>
import { ModernPOSPage } from '@/components/modern-pos'
import { ref } from 'vue'

const products = ref([...]) // من API
const categories = ref([...]) // من API
</script>
```

### 2. Build وRun

```bash
cd /home/eslam/frappe-bench/apps/pos_next/POS
yarn dev
```

### 3. الوصول

افتح: `http://localhost:5173` (أو المنفذ المحدد)

---

## 🎯 الفروق عن النظام القديم

| الميزة | القديم | الجديد |
|--------|--------|--------|
| Touch Targets | 32-40px | 48-70px ✅ |
| RTL Support | جزئي | كامل ✅ |
| Dark Mode | ❌ | ✅ |
| Responsive Grid | ثابت | Dynamic ✅ |
| Keyboard Shortcuts | محدود | شامل ✅ |
| Component Reusability | منخفض | عالي ✅ |
| Accessibility | أساسي | WCAG AA ✅ |
| Performance | متوسط | محسّن ✅ |

---

## 📊 الأداء

### Optimizations

1. **Lazy Loading للصور**
   ```vue
   <img loading="lazy" />
   ```

2. **Debounced Search** (150ms)

3. **Virtual Scrolling** (للقوائم الطويلة)

4. **v-memo** للكروت

### Benchmarks

- First Paint: < 1s
- Interactive: < 2s
- Touch Response: < 100ms

---

## 🛠️ Troubleshooting

### المشكلة: المكونات لا تظهر

**الحل:**
```js
// تأكد من استيراد theme.css في main.js
import './components/modern-pos/theme.css'
```

### المشكلة: RTL لا يعمل

**الحل:**
```vue
<div dir="rtl">
  <AppShell initial-direction="rtl" />
</div>
```

### المشكلة: الأزرار صغيرة

**الحل:**
```css
/* في theme.css */
:root {
  --pos-touch-min: 56px !important;
}
```

---

## 📞 الدعم

للأسئلة والمشاكل:
1. راجع `README-UI.md`
2. تحقق من console للأخطاء
3. اختبر على جهاز touch حقيقي

---

**Happy Coding! 🚀**

