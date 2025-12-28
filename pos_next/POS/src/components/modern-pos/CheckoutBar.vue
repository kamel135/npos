<template>
	<div class="p-4 flex items-center gap-4">
		<!-- Payment Methods (Quick Actions) -->
		<div class="hidden lg:flex items-center gap-2">
			<button
				v-for="method in paymentMethods"
				:key="method.id"
				@click="$emit('select-payment-method', method)"
				class="h-14 px-4 rounded-xl border transition-all"
				:class="selectedPaymentMethod === method.id 
					? 'bg-blue-500 text-white border-blue-500 shadow-md' 
					: 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'"
			>
				<div class="flex items-center gap-2">
					<component :is="method.icon" v-if="method.icon" class="w-5 h-5" />
					<span class="font-semibold text-sm">{{ method.name }}</span>
				</div>
			</button>
		</div>

		<!-- Total Display (Desktop) -->
		<div class="hidden lg:flex items-center gap-3 px-4 flex-1">
			<span class="text-sm font-medium text-gray-600 dark:text-slate-400">
				{{ __('Total:') }}
			</span>
			<span class="text-2xl font-bold text-gray-900 dark:text-white">
				{{ formatCurrency(total) }}
			</span>
		</div>

		<!-- Save Draft Button -->
		<button
			@click="$emit('save-draft')"
			:disabled="!canSaveDraft"
			class="btn-pos btn-pos-secondary h-14 px-6 text-base"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
			</svg>
			<span class="hidden xl:inline">{{ __('Save Draft') }}</span>
		</button>

		<!-- Primary Payment Button -->
		<button
			@click="handlePayment"
			:disabled="!canCheckout"
			class="btn-pos btn-pos-primary flex-1 lg:flex-initial h-14 px-8 text-lg font-bold shadow-lg"
			:class="{ 'animate-pulse': processing }"
		>
			<svg v-if="processing" class="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
			</svg>
			<svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
			</svg>
			<span>{{ checkoutLabel }}</span>
			<span v-if="!processing" class="hidden xl:inline text-xl font-black ml-2 rtl:mr-2 rtl:ml-0">
				{{ formatCurrency(total) }}
			</span>
		</button>
	</div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	total: {
		type: Number,
		required: true
	},
	subtotal: {
		type: Number,
		default: 0
	},
	discount: {
		type: Number,
		default: 0
	},
	canCheckout: {
		type: Boolean,
		default: false
	},
	canSaveDraft: {
		type: Boolean,
		default: false
	},
	processing: {
		type: Boolean,
		default: false
	},
	paymentMethods: {
		type: Array,
		default: () => []
	},
	selectedPaymentMethod: {
		type: String,
		default: null
	},
	checkoutLabel: {
		type: String,
		default: 'Pay'
	}
})

const emit = defineEmits(['checkout', 'save-draft', 'select-payment-method'])

// Methods
const handlePayment = () => {
	if (props.canCheckout && !props.processing) {
		// Haptic feedback
		if (navigator.vibrate) {
			navigator.vibrate([50, 50, 50])
		}
		emit('checkout')
	}
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

