<template>
	<div
		@click="handleClick"
		@touchstart.passive="handleTouchStart"
		@touchend.passive="handleTouchEnd"
		class="pos-card touch-active cursor-pointer relative overflow-hidden group"
		role="button"
		:aria-label="`Add ${product.name} to cart`"
	>
		<!-- Out of Stock Badge - Removed per user request -->

		<!-- Discount Badge -->
		<div
			v-if="product.discount_percentage > 0"
			class="absolute top-2 left-2 rtl:left-auto rtl:right-2 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold"
		>
			-{{ product.discount_percentage }}%
		</div>

		<!-- Product Image -->
		<div class="aspect-square bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden mb-3">
			<img
				v-if="product.image"
				:src="product.image"
				:alt="product.name"
				class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				loading="lazy"
			/>
			<div v-else class="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500 text-4xl font-bold">
				{{ product.name?.substring(0, 2).toUpperCase() }}
			</div>
		</div>

		<!-- Product Info -->
		<div class="space-y-1">
			<!-- Name (2 lines max) -->
			<h3 class="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[3rem]">
				{{ product.name }}
			</h3>

			<!-- Price Section -->
			<div class="flex items-center justify-between gap-2">
				<!-- Current Price -->
				<div class="flex-1">
					<span class="text-lg font-bold text-gray-900 dark:text-white">
						{{ formatCurrency(product.price) }}
					</span>
					<!-- Original Price (if discounted) -->
					<span
						v-if="product.discount_percentage > 0"
						class="text-sm text-gray-500 line-through ml-2 rtl:mr-2 rtl:ml-0"
					>
						{{ formatCurrency(product.original_price) }}
					</span>
				</div>

				<!-- Stock Indicator - Removed per user request -->
			</div>

			<!-- Category/Tags -->
			<div v-if="product.category" class="text-xs text-gray-500 dark:text-slate-400">
				{{ product.category }}
			</div>
		</div>

		<!-- Long Press Indicator -->
		<div
			v-if="showLongPressIndicator"
			class="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center rounded-lg"
		>
			<div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
				<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
				</svg>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
	product: {
		type: Object,
		required: true
	},
	showStock: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits(['click', 'long-press'])

// State
const touchTimer = ref(null)
const showLongPressIndicator = ref(false)

// Computed
const available = computed(() => {
	if (!props.product.is_stock_item) return true
	return (props.product.stock_qty || 0) > 0
})

const stockColorClass = computed(() => {
	const qty = props.product.stock_qty || 0
	if (qty <= 0) return 'text-red-600 dark:text-red-400'
	if (qty < 10) return 'text-yellow-600 dark:text-yellow-400'
	return 'text-green-600 dark:text-green-400'
})

// Methods
const handleClick = () => {
	emit('click', props.product)
}

const handleTouchStart = (e) => {
	
	// Long press detection (500ms)
	touchTimer.value = setTimeout(() => {
		showLongPressIndicator.value = true
		// Haptic feedback if available
		if (navigator.vibrate) {
			navigator.vibrate(50)
		}
		setTimeout(() => {
			showLongPressIndicator.value = false
			emit('long-press', props.product)
		}, 200)
	}, 500)
}

const handleTouchEnd = () => {
	if (touchTimer.value) {
		clearTimeout(touchTimer.value)
		touchTimer.value = null
	}
	showLongPressIndicator.value = false
}

const formatCurrency = (amount) => {
	return new Intl.NumberFormat('ar-EG', {
		style: 'currency',
		currency: 'EGP',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(amount || 0)
}

const __ = (text) => text
</script>

<style scoped>
.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>

