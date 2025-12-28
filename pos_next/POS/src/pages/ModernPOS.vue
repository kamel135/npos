<template>
	<ModernPOSPage
		pos-profile="Main POS"
		:products="products"
		:categories="categories"
		:customers="customers"
		:payment-methods="paymentMethods"
		:tax-rate="14"
		:is-offline="false"
		:is-syncing="false"
		:pending-invoices-count="0"
		:printer-connected="true"
	/>
</template>

<script setup>
import { ref } from 'vue'
import { ModernPOSPage } from '@/components/modern-pos'

// بيانات تجريبية للعرض
const products = ref([
	{
		id: '1',
		item_code: 'ITEM-001',
		name: 'كابتشينو',
		price: 25,
		image: null,
		category: 'مشروبات ساخنة',
		stock_qty: 50,
		is_stock_item: true
	},
	{
		id: '2',
		item_code: 'ITEM-002',
		name: 'إسبريسو',
		price: 20,
		image: null,
		category: 'مشروبات ساخنة',
		stock_qty: 30,
		is_stock_item: true
	},
	{
		id: '3',
		item_code: 'ITEM-003',
		name: 'لاتيه',
		price: 30,
		image: null,
		category: 'مشروبات ساخنة',
		stock_qty: 40,
		is_stock_item: true
	},
	{
		id: '4',
		item_code: 'ITEM-004',
		name: 'عصير برتقال',
		price: 15,
		image: null,
		category: 'عصائر',
		stock_qty: 25,
		is_stock_item: true
	},
	{
		id: '5',
		item_code: 'ITEM-005',
		name: 'كرواسون',
		price: 12,
		image: null,
		category: 'معجنات',
		stock_qty: 20,
		is_stock_item: true,
		discount_percentage: 10,
		original_price: 13.33
	}
])

const categories = ref([
	{ id: 'hot-drinks', name: 'مشروبات ساخنة', icon: '☕', count: 3 },
	{ id: 'juices', name: 'عصائر', icon: '🥤', count: 1 },
	{ id: 'pastries', name: 'معجنات', icon: '🥐', count: 1 }
])

const customers = ref([
	{ id: '1', name: 'عميل عادي', phone: null },
	{ id: '2', name: 'أحمد محمد', phone: '01234567890' },
	{ id: '3', name: 'فاطمة علي', phone: '01098765432' }
])

const paymentMethods = ref([
	{ id: 'cash', name: 'نقدي', icon: null },
	{ id: 'card', name: 'بطاقة', icon: null },
	{ id: 'digital', name: 'محفظة إلكترونية', icon: null }
])
</script>

