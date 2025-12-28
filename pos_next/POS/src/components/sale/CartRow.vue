<template>
	<div
		@click="$emit('select', item)"
		:class="[
			'min-h-[64px] flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors',
			isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
		]"
	>
		<!-- Item Image (Optional) -->
		<div v-if="item.image" class="w-12 h-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
			<img :src="item.image" :alt="item.item_name" class="w-full h-full object-cover" />
		</div>

		<!-- Item Info -->
		<div class="flex-1 min-w-0">
			<h4 class="font-semibold text-sm text-contrast-high truncate">
				{{ item.item_name }}
			</h4>
			<div class="flex items-baseline gap-2 mt-0.5">
				<span class="text-sm font-medium text-primary-600">
					{{ formatCurrency(item.rate) }}
				</span>
				<span class="text-xs text-contrast-low">× {{ item.quantity }}</span>
			</div>
			<div v-if="item.comment" class="text-xs text-yellow-600 dark:text-yellow-400 italic mt-1 truncate">
				{{ item.comment }}
			</div>
		</div>

		<!-- Quantity Controls -->
		<div class="flex items-center gap-2 flex-shrink-0">
			<!-- Decrease Button -->
			<button
				@click.stop="$emit('decrease', item)"
				class="btn-control w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
				:disabled="item.quantity <= 1"
				:title="__('Decrease')"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/>
				</svg>
			</button>

			<!-- Quantity Display -->
			<div class="w-12 text-center">
				<span class="text-lg font-bold text-contrast-high">{{ item.quantity }}</span>
			</div>

			<!-- Increase Button -->
			<button
				@click.stop="$emit('increase', item)"
				class="btn-control w-12 h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-colors"
				:title="__('Increase')"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
				</svg>
			</button>

			<!-- Remove Button -->
			<button
				@click.stop="$emit('remove', item)"
				class="btn-control w-12 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
				:title="__('Remove')"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>
		</div>

		<!-- Total Price -->
		<div class="flex-shrink-0 text-right min-w-[80px]">
			<div class="text-base font-bold text-contrast-high">
				{{ formatCurrency(item.amount) }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency"

const props = defineProps({
	item: {
		type: Object,
		required: true,
	},
	currency: {
		type: String,
		default: "SAR",
	},
	isSelected: {
		type: Boolean,
		default: false,
	},
})

defineEmits(['select', 'increase', 'decrease', 'remove'])

const formatCurrency = (amount) => {
	return formatCurrencyUtil(amount, props.currency)
}
</script>

<style scoped>
/* Touch-friendly controls */
.btn-control {
	touch-action: manipulation;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
	min-width: 48px;
	min-height: 48px;
}

.btn-control:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.btn-control:active:not(:disabled) {
	transform: scale(0.95);
}
</style>

