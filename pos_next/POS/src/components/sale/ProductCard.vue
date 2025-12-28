<template>
	<button
		@click="handleClick"
		@contextmenu.prevent="handleLongPress"
		class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-2 touch-none cursor-pointer"
	>
		<!-- Product Image -->
		<div class="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
			<img
				v-if="product.image"
				:src="product.image"
				:alt="product.item_name"
				class="w-full h-full object-cover"
				loading="lazy"
			/>
			<div v-else class="w-full h-full flex items-center justify-center">
				<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
				</svg>
			</div>

			<!-- Stock Badge - Removed per user request -->

			<!-- Discount Badge -->
			<div v-if="product.discount_percentage" class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
				-{{ product.discount_percentage }}%
			</div>

			<!-- Out of Stock Badge - Removed per user request -->
		</div>

		<!-- Product Info -->
		<div class="text-right space-y-1 flex-1 flex flex-col justify-between">
			<!-- Product Name - 2 lines max -->
			<h3 class="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] text-gray-900 dark:text-gray-100">
				{{ product.item_name }}
			</h3>

			<!-- Price -->
			<div class="flex items-baseline justify-between gap-2 mt-auto">
				<div class="text-lg font-bold text-blue-600 dark:text-blue-400">
					{{ formatCurrency(product.rate || product.price_list_rate || 0) }}
				</div>
				<div v-if="product.discount_percentage" class="text-sm text-gray-500 dark:text-gray-400 line-through">
					{{ formatCurrency(product.standard_rate || 0) }}
				</div>
			</div>
		</div>
	</button>
</template>

<script setup>
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency"

const props = defineProps({
	product: {
		type: Object,
		required: true,
	},
	currency: {
		type: String,
		default: "SAR",
	},
})

const emit = defineEmits(['click', 'long-press'])

const handleClick = () => {
	emit('click', props.product)
}

const handleLongPress = () => {
	emit('long-press', props.product)
}

const formatCurrency = (amount) => {
	return formatCurrencyUtil(amount, props.currency)
}
</script>

<style scoped>
/* Line clamp utility */
.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

/* Touch optimization - Chrome compatibility */
.touch-none {
	touch-action: manipulation;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
	outline: none;
}

.touch-none:focus {
	outline: 2px solid #3b82f6;
	outline-offset: 2px;
}
</style>

