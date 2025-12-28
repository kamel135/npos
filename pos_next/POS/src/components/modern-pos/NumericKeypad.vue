<template>
	<div class="bg-white dark:bg-slate-800 rounded-2xl p-4 space-y-4">
		<!-- Display -->
		<div class="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 min-h-[70px] flex items-center justify-end">
			<input
				v-model="displayValue"
				@input="handleInput"
				@keydown="handleKeydown"
				type="text"
				inputmode="decimal"
				class="w-full text-right rtl:text-left bg-transparent text-3xl font-bold text-gray-900 dark:text-white focus:outline-none"
				:placeholder="placeholder"
			/>
		</div>

		<!-- Keypad Grid 4×4 -->
		<div class="grid grid-cols-4 gap-3">
			<!-- Number Keys -->
			<button
				v-for="num in [7, 8, 9, 4, 5, 6, 1, 2, 3]"
				:key="num"
				@click="appendNumber(num)"
				class="keypad-btn keypad-btn-number"
			>
				{{ num }}
			</button>

			<!-- Bottom Row -->
			<button
				@click="appendDecimal"
				class="keypad-btn keypad-btn-number"
			>
				.
			</button>

			<button
				@click="appendNumber(0)"
				class="keypad-btn keypad-btn-number"
			>
				0
			</button>

			<button
				@click="appendDoubleZero"
				class="keypad-btn keypad-btn-number"
			>
				00
			</button>

			<button
				@click="backspace"
				class="keypad-btn keypad-btn-action"
				:aria-label="__('Backspace')"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"/>
				</svg>
			</button>

			<!-- Function Keys (Right Column) -->
			<button
				@click="divide"
				class="keypad-btn keypad-btn-operator col-start-4 row-start-1"
			>
				÷
			</button>

			<button
				@click="multiply"
				class="keypad-btn keypad-btn-operator"
			>
				×
			</button>

			<button
				@click="subtract"
				class="keypad-btn keypad-btn-operator"
			>
				−
			</button>

			<button
				@click="add"
				class="keypad-btn keypad-btn-operator"
			>
				+
			</button>

			<!-- Clear and Enter -->
			<button
				@click="clear"
				class="keypad-btn keypad-btn-clear col-span-2"
			>
				{{ __('Clear') }}
			</button>

			<button
				@click="enter"
				class="keypad-btn keypad-btn-enter col-span-2"
			>
				{{ __('Enter') }}
			</button>
		</div>

		<!-- Quick Amount Buttons -->
		<div v-if="showQuickAmounts" class="grid grid-cols-4 gap-2">
			<button
				v-for="amount in quickAmounts"
				:key="amount"
				@click="setQuickAmount(amount)"
				class="h-12 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 font-semibold text-sm transition-colors"
			>
				{{ formatCurrency(amount) }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
	modelValue: {
		type: [Number, String],
		default: ''
	},
	placeholder: {
		type: String,
		default: '0.00'
	},
	showQuickAmounts: {
		type: Boolean,
		default: false
	},
	quickAmounts: {
		type: Array,
		default: () => [10, 20, 50, 100, 200, 500, 1000, 5000]
	},
	maxLength: {
		type: Number,
		default: 10
	}
})

const emit = defineEmits(['update:modelValue', 'enter', 'operation'])

// State
const displayValue = ref(String(props.modelValue || ''))

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
	displayValue.value = String(newVal || '')
})

// Methods
const appendNumber = (num) => {
	if (displayValue.value.length >= props.maxLength) return
	
	if (displayValue.value === '0') {
		displayValue.value = String(num)
	} else {
		displayValue.value += String(num)
	}
	updateValue()
	
	// Haptic feedback
	if (navigator.vibrate) {
		navigator.vibrate(10)
	}
}

const appendDoubleZero = () => {
	if (displayValue.value.length >= props.maxLength - 1) return
	displayValue.value += '00'
	updateValue()
}

const appendDecimal = () => {
	if (displayValue.value.includes('.')) return
	if (!displayValue.value) displayValue.value = '0'
	displayValue.value += '.'
	updateValue()
}

const backspace = () => {
	displayValue.value = displayValue.value.slice(0, -1)
	updateValue()
}

const clear = () => {
	displayValue.value = ''
	updateValue()
}

const enter = () => {
	emit('enter', parseFloat(displayValue.value) || 0)
}

// Math Operations
const add = () => {
	emit('operation', { type: 'add', value: parseFloat(displayValue.value) || 0 })
	displayValue.value = ''
}

const subtract = () => {
	emit('operation', { type: 'subtract', value: parseFloat(displayValue.value) || 0 })
	displayValue.value = ''
}

const multiply = () => {
	emit('operation', { type: 'multiply', value: parseFloat(displayValue.value) || 0 })
	displayValue.value = ''
}

const divide = () => {
	emit('operation', { type: 'divide', value: parseFloat(displayValue.value) || 0 })
	displayValue.value = ''
}

const setQuickAmount = (amount) => {
	displayValue.value = String(amount)
	updateValue()
	emit('enter', amount)
}

const handleInput = (e) => {
	// Only allow numbers and decimal point
	displayValue.value = e.target.value.replace(/[^0-9.]/g, '')
	// Prevent multiple decimal points
	const parts = displayValue.value.split('.')
	if (parts.length > 2) {
		displayValue.value = parts[0] + '.' + parts.slice(1).join('')
	}
	updateValue()
}

const handleKeydown = (e) => {
	if (e.key === 'Enter') {
		e.preventDefault()
		enter()
	} else if (e.key === 'Escape') {
		e.preventDefault()
		clear()
	}
}

const updateValue = () => {
	const numValue = parseFloat(displayValue.value) || 0
	emit('update:modelValue', numValue)
}

const formatCurrency = (amount) => {
	return new Intl.NumberFormat('ar-EG', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount)
}

const __ = (text) => text
</script>

<style scoped>
.keypad-btn {
	min-height: 70px;
	font-size: 26px;
	font-weight: 700;
	border-radius: 12px;
	transition: all 150ms ease;
	cursor: pointer;
	user-select: none;
	touch-action: manipulation;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
}

.keypad-btn:active {
	transform: scale(0.95);
}

.keypad-btn-number {
	background-color: #f1f5f9;
	color: #1e293b;
}

.keypad-btn-number:hover {
	background-color: #e2e8f0;
}

.keypad-btn-operator {
	background-color: #dbeafe;
	color: #1e40af;
}

.keypad-btn-operator:hover {
	background-color: #bfdbfe;
}

.keypad-btn-action {
	background-color: #e2e8f0;
	color: #475569;
}

.keypad-btn-action:hover {
	background-color: #cbd5e1;
}

.keypad-btn-clear {
	background-color: #fee2e2;
	color: #991b1b;
	font-size: 18px;
}

.keypad-btn-clear:hover {
	background-color: #fecaca;
}

.keypad-btn-enter {
	background-color: #3b82f6;
	color: white;
	font-size: 18px;
}

.keypad-btn-enter:hover {
	background-color: #2563eb;
}

/* Dark Mode */
[data-theme="dark"] .keypad-btn-number {
	background-color: #334155;
	color: #f1f5f9;
}

[data-theme="dark"] .keypad-btn-number:hover {
	background-color: #475569;
}

[data-theme="dark"] .keypad-btn-operator {
	background-color: #1e3a8a;
	color: #bfdbfe;
}

[data-theme="dark"] .keypad-btn-operator:hover {
	background-color: #1e40af;
}
</style>

