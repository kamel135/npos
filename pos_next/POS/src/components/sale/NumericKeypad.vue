<template>
	<div class="numeric-keypad bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 space-y-4">
		<!-- Display -->
		<div class="display bg-gray-900 dark:bg-black text-green-400 p-4 rounded-xl text-right min-h-[72px] flex items-center justify-end shadow-inner">
			<input
				ref="displayInput"
				v-model="displayValue"
				type="text"
				readonly
				class="w-full bg-transparent text-4xl font-mono font-bold outline-none text-right"
				:placeholder="placeholder"
			/>
		</div>

		<!-- Keypad Grid (4×4) -->
		<div class="grid grid-cols-4 gap-2">
			<!-- Numbers 7-9, C -->
			<button v-for="key in ['7', '8', '9', 'C']" :key="key" @click="handleKey(key)" class="touch-key" :class="key === 'C' ? 'key-danger' : 'key-number'">
				<span v-if="key === 'C'" class="text-xl font-bold">{{ __('Clear') }}</span>
				<span v-else class="text-2xl font-bold">{{ key }}</span>
			</button>

			<!-- Numbers 4-6, ← -->
			<button v-for="key in ['4', '5', '6']" :key="key" @click="handleKey(key)" class="touch-key key-number">
				<span class="text-2xl font-bold">{{ key }}</span>
			</button>
			<button @click="handleKey('←')" class="touch-key key-special">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"/>
				</svg>
			</button>

			<!-- Numbers 1-3, × -->
			<button v-for="key in ['1', '2', '3']" :key="key" @click="handleKey(key)" class="touch-key key-number">
				<span class="text-2xl font-bold">{{ key }}</span>
			</button>
			<button @click="handleKey('×')" class="touch-key key-special">
				<span class="text-2xl font-bold">×</span>
			</button>

			<!-- 0, 00, ., Enter -->
			<button @click="handleKey('0')" class="touch-key key-number">
				<span class="text-2xl font-bold">0</span>
			</button>
			<button @click="handleKey('00')" class="touch-key key-number">
				<span class="text-xl font-bold">00</span>
			</button>
			<button v-if="allowDecimal" @click="handleKey('.')" class="touch-key key-number">
				<span class="text-2xl font-bold">.</span>
			</button>
			<button v-else @click="handleKey('0')" class="touch-key key-number">
				<span class="text-2xl font-bold">0</span>
			</button>
			<button @click="handleKey('↵')" class="touch-key key-primary">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
				</svg>
			</button>
		</div>

		<!-- Quick Amount Buttons -->
		<div v-if="quickAmounts.length > 0" class="grid grid-cols-4 gap-2">
			<button
				v-for="amount in quickAmounts"
				:key="amount"
				@click="setQuickAmount(amount)"
				class="quick-amount-btn"
			>
				{{ formatCurrency(amount) }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency"

const props = defineProps({
	modelValue: {
		type: [String, Number],
		default: '',
	},
	placeholder: {
		type: String,
		default: '0.00',
	},
	maxValue: {
		type: Number,
		default: null,
	},
	allowDecimal: {
		type: Boolean,
		default: true,
	},
	quickAmounts: {
		type: Array,
		default: () => [10, 20, 50, 100],
	},
	currency: {
		type: String,
		default: 'SAR',
	},
})

const emit = defineEmits(['update:modelValue', 'enter', 'multiply'])

const displayValue = ref(props.modelValue.toString())
const displayInput = ref(null)

watch(() => props.modelValue, (newVal) => {
	displayValue.value = newVal.toString()
})

const handleKey = (key) => {
	switch (key) {
		case 'C':
			displayValue.value = ''
			break
		case '←':
			displayValue.value = displayValue.value.slice(0, -1)
			break
		case '×':
			emit('multiply', displayValue.value)
			return
		case '↵':
			emit('enter', displayValue.value)
			return
		case '.':
			if (props.allowDecimal && !displayValue.value.includes('.')) {
				displayValue.value += '.'
			}
			break
		default:
			const newValue = displayValue.value + key
			if (props.maxValue && parseFloat(newValue) > props.maxValue) {
				return
			}
			displayValue.value = newValue
	}
	
	emit('update:modelValue', displayValue.value)
}

const setQuickAmount = (amount) => {
	displayValue.value = amount.toString()
	emit('update:modelValue', displayValue.value)
}

const formatCurrency = (amount) => {
	return formatCurrencyUtil(amount, props.currency)
}
</script>

<style scoped>
/* Keypad Keys */
.touch-key {
	min-width: 64px;
	min-height: 64px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-center;
	font-weight: bold;
	transition: all 0.15s;
	touch-action: manipulation;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.key-number {
	background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
	color: #1f2937;
	border: 2px solid #e5e7eb;
}

[data-theme="dark"] .key-number {
	background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
	color: #f3f4f6;
	border-color: #4b5563;
}

.key-number:hover {
	background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
	border-color: #d1d5db;
}

[data-theme="dark"] .key-number:hover {
	background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
}

.key-number:active {
	transform: scale(0.95);
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.key-special {
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	color: white;
	border: 2px solid #b45309;
}

.key-special:hover {
	background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
}

.key-special:active {
	transform: scale(0.95);
}

.key-danger {
	background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	color: white;
	border: 2px solid #b91c1c;
}

.key-danger:hover {
	background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.key-danger:active {
	transform: scale(0.95);
}

.key-primary {
	background: linear-gradient(135deg, #10b981 0%, #059669 100%);
	color: white;
	border: 2px solid #047857;
}

.key-primary:hover {
	background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

.key-primary:active {
	transform: scale(0.95);
}

/* Quick Amount Buttons */
.quick-amount-btn {
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	color: white;
	min-height: 40px;
	border-radius: 0.5rem;
	font-weight: 600;
	font-size: 0.875rem;
	transition: all 0.15s;
	touch-action: manipulation;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
	box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.quick-amount-btn:hover {
	background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
	transform: translateY(-1px);
	box-shadow: 0 4px 6px rgba(59, 130, 246, 0.4);
}

.quick-amount-btn:active {
	transform: scale(0.97);
}

/* Display */
.display {
	border: 2px solid #1f2937;
}

[data-theme="dark"] .display {
	border-color: #000;
}
</style>

