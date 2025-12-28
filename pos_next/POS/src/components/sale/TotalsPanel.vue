<template>
	<div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 space-y-3 border-t-2 border-gray-200 dark:border-gray-700">
		<!-- Subtotal -->
		<div class="flex items-center justify-between text-sm">
			<span class="text-contrast-medium font-medium">{{ __('Subtotal') }}</span>
			<span class="font-semibold text-contrast-high">{{ formatCurrency(subtotal) }}</span>
		</div>

		<!-- Discount -->
		<div v-if="discount > 0" class="flex items-center justify-between text-sm">
			<span class="text-contrast-medium font-medium">{{ __('Discount') }}</span>
			<span class="font-semibold text-green-600 dark:text-green-400">
				- {{ formatCurrency(discount) }}
			</span>
		</div>

		<!-- Tax -->
		<div class="flex items-center justify-between text-sm">
			<span class="text-contrast-medium font-medium">{{ __('Tax') }} ({{ taxRate }}%)</span>
			<span class="font-semibold text-contrast-high">{{ formatCurrency(tax) }}</span>
		</div>

		<!-- Divider -->
		<div class="border-t-2 border-gray-300 dark:border-gray-600 my-3"></div>

		<!-- Grand Total -->
		<div class="flex items-center justify-between">
			<span class="text-lg font-bold text-contrast-high">{{ __('Total') }}</span>
			<div class="text-right">
				<div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
					{{ formatCurrency(grandTotal) }}
				</div>
				<div class="text-xs text-contrast-low">{{ currency }}</div>
			</div>
		</div>

		<!-- Amount Paid (if applicable) -->
		<div v-if="amountPaid > 0" class="pt-3 border-t border-gray-300 dark:border-gray-600">
			<div class="flex items-center justify-between text-sm mb-2">
				<span class="text-contrast-medium font-medium">{{ __('Amount Paid') }}</span>
				<span class="font-semibold text-contrast-high">{{ formatCurrency(amountPaid) }}</span>
			</div>
			<div v-if="change !== 0" class="flex items-center justify-between text-sm">
				<span class="text-contrast-medium font-medium">{{ change > 0 ? __('Change') : __('Remaining') }}</span>
				<span 
					class="font-bold"
					:class="change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
				>
					{{ formatCurrency(Math.abs(change)) }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency"

const props = defineProps({
	subtotal: {
		type: Number,
		default: 0,
	},
	discount: {
		type: Number,
		default: 0,
	},
	tax: {
		type: Number,
		default: 0,
	},
	grandTotal: {
		type: Number,
		default: 0,
	},
	taxRate: {
		type: Number,
		default: 15,
	},
	currency: {
		type: String,
		default: "SAR",
	},
	amountPaid: {
		type: Number,
		default: 0,
	},
})

const change = computed(() => props.amountPaid - props.grandTotal)

const formatCurrency = (amount) => {
	return formatCurrencyUtil(amount, props.currency)
}
</script>

