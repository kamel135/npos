<template>
	<div class="flex flex-col h-full">
		<!-- Customer Selection -->
		<div class="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
			<button
				@click="$emit('select-customer')"
				class="w-full h-14 px-4 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-between"
			>
				<div class="flex items-center gap-3">
					<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
					</svg>
					<div class="text-left rtl:text-right">
						<div class="text-sm font-semibold text-gray-900 dark:text-white">
							{{ customer?.name || __('Walk-in Customer') }}
						</div>
						<div v-if="customer?.phone" class="text-xs text-gray-500 dark:text-slate-400">
							{{ customer.phone }}
						</div>
					</div>
				</div>
				<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
				</svg>
			</button>
		</div>

		<!-- Cart Items -->
		<div class="flex-1 overflow-hidden">
			<CartList
				:items="items"
				@increase="$emit('increase-item', $event)"
				@decrease="$emit('decrease-item', $event)"
				@remove="$emit('remove-item', $event)"
				@edit="$emit('edit-item', $event)"
				@clear="$emit('clear-cart')"
			/>
		</div>

		<!-- Totals Panel -->
		<div class="border-t-2 border-gray-200 dark:border-slate-700 flex-shrink-0">
			<TotalsPanel
				:subtotal="subtotal"
				:discount="discount"
				:tax="tax"
				:tax-rate="taxRate"
				:total="total"
				:amount-paid="amountPaid"
				@edit-discount="$emit('edit-discount')"
				@hold="$emit('hold')"
				@add-note="$emit('add-note')"
			/>
		</div>

		<!-- Numeric Keypad (Optional) -->
		<div v-if="showKeypad" class="border-t border-gray-200 dark:border-slate-700 flex-shrink-0 p-4">
			<NumericKeypad
				v-model="keypadValue"
				:show-quick-amounts="true"
				@enter="handleKeypadEnter"
				@operation="handleKeypadOperation"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CartList from './CartList.vue'
import TotalsPanel from './TotalsPanel.vue'
import NumericKeypad from './NumericKeypad.vue'

const props = defineProps({
	items: {
		type: Array,
		default: () => []
	},
	customer: {
		type: Object,
		default: null
	},
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
	showKeypad: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits([
	'select-customer',
	'increase-item',
	'decrease-item',
	'remove-item',
	'edit-item',
	'clear-cart',
	'edit-discount',
	'hold',
	'add-note',
	'keypad-enter',
	'keypad-operation'
])

// State
const keypadValue = ref(0)

// Methods
const handleKeypadEnter = (value) => {
	emit('keypad-enter', value)
	keypadValue.value = 0
}

const handleKeypadOperation = (operation) => {
	emit('keypad-operation', operation)
}

const __ = (text) => text
</script>

