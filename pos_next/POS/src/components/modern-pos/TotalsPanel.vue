<template>
	<div class="p-6 bg-gray-50 dark:bg-slate-700/50 space-y-3">
		<!-- Subtotal -->
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium text-gray-600 dark:text-slate-400">
				{{ __('Subtotal') }}
			</span>
			<span class="text-base font-semibold text-gray-900 dark:text-white">
				{{ formatCurrency(subtotal) }}
			</span>
		</div>

		<!-- Discount -->
		<div v-if="discount > 0" class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium text-red-600 dark:text-red-400">
					{{ __('Discount') }}
				</span>
				<button
					v-if="allowEditDiscount"
					@click="$emit('edit-discount')"
					class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
				>
					<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
					</svg>
				</button>
			</div>
			<span class="text-base font-semibold text-red-600 dark:text-red-400">
				-{{ formatCurrency(discount) }}
			</span>
		</div>

		<!-- Add Discount Button -->
		<button
			v-else-if="allowEditDiscount"
			@click="$emit('edit-discount')"
			class="w-full h-12 flex items-center justify-center gap-2 bg-white dark:bg-slate-700 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors text-gray-600 dark:text-slate-300 font-medium"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
			</svg>
			{{ __('Add Discount') }}
		</button>

		<!-- Tax -->
		<div v-if="tax > 0" class="flex items-center justify-between">
			<span class="text-sm font-medium text-gray-600 dark:text-slate-400">
				{{ __('Tax') }} ({{ taxRate }}%)
			</span>
			<span class="text-base font-semibold text-gray-900 dark:text-white">
				{{ formatCurrency(tax) }}
			</span>
		</div>

		<!-- Divider -->
		<div class="border-t border-gray-300 dark:border-slate-600 my-3"></div>

		<!-- Total -->
		<div class="flex items-center justify-between">
			<span class="text-xl font-bold text-gray-900 dark:text-white">
				{{ __('Total') }}
			</span>
			<span class="text-3xl font-black text-gray-900 dark:text-white">
				{{ formatCurrency(total) }}
			</span>
		</div>

		<!-- Amount Paid (if in payment mode) -->
		<div v-if="amountPaid > 0" class="pt-3 border-t border-gray-300 dark:border-slate-600">
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-medium text-gray-600 dark:text-slate-400">
					{{ __('Amount Paid') }}
				</span>
				<span class="text-base font-semibold text-green-600 dark:text-green-400">
					{{ formatCurrency(amountPaid) }}
				</span>
			</div>

			<!-- Change/Remaining -->
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-gray-600 dark:text-slate-400">
					{{ change >= 0 ? __('Change') : __('Remaining') }}
				</span>
				<span 
					class="text-lg font-bold"
					:class="change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
				>
					{{ formatCurrency(Math.abs(change)) }}
				</span>
			</div>
		</div>

		<!-- Quick Actions -->
		<div v-if="showActions" class="flex gap-2 pt-2">
			<button
				@click="$emit('hold')"
				class="flex-1 h-12 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
				</svg>
				{{ __('Hold') }}
			</button>

			<button
				@click="$emit('add-note')"
				class="flex-1 h-12 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
				</svg>
				{{ __('Note') }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	subtotal: {
		type: Number,
		default: 0
	},
	discount: {
		type: Number,
		default: 0
	},
	tax: {
		type: Number,
		default: 0
	},
	taxRate: {
		type: Number,
		default: 0
	},
	total: {
		type: Number,
		default: 0
	},
	amountPaid: {
		type: Number,
		default: 0
	},
	allowEditDiscount: {
		type: Boolean,
		default: true
	},
	showActions: {
		type: Boolean,
		default: true
	}
})

defineEmits(['edit-discount', 'hold', 'add-note'])

// Computed
const change = computed(() => {
	return props.amountPaid - props.total
})

// Methods
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

