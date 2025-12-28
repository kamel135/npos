<template>
	<div class="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl z-50 safe-area-bottom">
		<!-- Virtual Keyboard (shown above checkout bar) -->
		<div v-if="showKeyboard" class="keyboard-wrapper-container bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-semibold text-gray-600 dark:text-gray-400">{{ __('English Keyboard') }}</span>
				<button
					@click="toggleKeyboard"
					class="keyboard-toggle-btn"
					:title="__('Hide Keyboard')"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
				</button>
			</div>
			<VirtualKeyboard
				v-model="keyboardValue"
				:target-input="activeInput"
				@close="toggleKeyboard"
			/>
		</div>

		<div class="max-w-screen-2xl mx-auto p-4">
			<div class="flex items-center gap-3">
				<!-- Keyboard Toggle Button (Touch Screens) -->
				<button
					v-if="isTouchDevice"
					@click="toggleKeyboard"
					class="btn-keyboard-toggle flex-col gap-1 p-3 min-w-[72px]"
					:title="showKeyboard ? __('Hide Keyboard') : __('Show Keyboard')"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
					</svg>
					<span class="text-xs font-semibold">{{ __('Keyboard') }}</span>
				</button>

				<!-- Quick Payment Methods -->
				<div class="hidden md:flex gap-2">
					<!-- Cash Button -->
					<button
						@click="$emit('quick-payment', 'cash')"
						:disabled="!canCheckout"
						class="btn-payment flex-col gap-1 p-3 min-w-[72px]"
						:title="__('Cash Payment')"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
						</svg>
						<span class="text-xs font-semibold">{{ __('Cash') }}</span>
					</button>

					<!-- Card Button -->
					<button
						@click="$emit('quick-payment', 'card')"
						:disabled="!canCheckout"
						class="btn-payment flex-col gap-1 p-3 min-w-[72px]"
						:title="__('Card Payment')"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
						</svg>
						<span class="text-xs font-semibold">{{ __('Card') }}</span>
					</button>
				</div>

				<!-- Main Checkout Button -->
				<button
					@click="$emit('checkout')"
					:disabled="!canCheckout"
					class="btn-checkout flex-1 flex items-center justify-between px-6 py-4 min-h-[64px]"
				>
					<div class="flex items-center gap-3">
						<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
						<span class="text-xl font-bold">{{ __('Pay Now') }}</span>
					</div>
					<div class="text-right">
						<div class="text-2xl font-bold">{{ formatCurrency(grandTotal) }}</div>
						<div class="text-sm opacity-90">{{ currency }}</div>
					</div>
				</button>

				<!-- Save Draft Button -->
				<button
					@click="$emit('save-draft')"
					:disabled="!canSaveDraft"
					class="btn-secondary flex-col gap-1 p-3 min-w-[72px]"
					:title="__('Save Draft')"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
					</svg>
					<span class="text-xs font-semibold">{{ __('Save') }}</span>
				</button>
			</div>

			<!-- Additional Actions (Mobile) -->
			<div v-if="showMobileActions" class="flex gap-2 mt-3 md:hidden">
				<button
					@click="$emit('quick-payment', 'cash')"
					:disabled="!canCheckout"
					class="btn-secondary flex-1 h-12"
				>
					{{ __('Cash') }}
				</button>
				<button
					@click="$emit('quick-payment', 'card')"
					:disabled="!canCheckout"
					class="btn-secondary flex-1 h-12"
				>
					{{ __('Card') }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency"

const props = defineProps({
	grandTotal: {
		type: Number,
		default: 0,
	},
	itemCount: {
		type: Number,
		default: 0,
	},
	currency: {
		type: String,
		default: "SAR",
	},
	showMobileActions: {
		type: Boolean,
		default: true,
	},
})

defineEmits(['checkout', 'quick-payment', 'save-draft'])

const canCheckout = computed(() => props.itemCount > 0 && props.grandTotal > 0)
const canSaveDraft = computed(() => props.itemCount > 0)

const formatCurrency = (amount) => {
	return formatCurrencyUtil(amount, props.currency)
}

// Virtual Keyboard state
const showKeyboard = ref(false)
const keyboardValue = ref('')
const activeInput = ref(null)
const isTouchDevice = ref(false)

// Detect touch device
onMounted(() => {
	isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
})

// Toggle keyboard visibility
const toggleKeyboard = () => {
	showKeyboard.value = !showKeyboard.value
	if (!showKeyboard.value) {
		keyboardValue.value = ''
		activeInput.value = null
	}
}

// Set active input when an input field is focused (can be used by parent component)
const setActiveInput = (inputElement) => {
	activeInput.value = inputElement
	if (isTouchDevice.value) {
		showKeyboard.value = true
	}
}

// Expose method for parent components
defineExpose({
	setActiveInput,
	toggleKeyboard
})
</script>

<style scoped>
/* Main Checkout Button */
.btn-checkout {
	background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
	color: white;
	border-radius: 1rem;
	font-weight: bold;
	transition: all 0.2s;
	box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
	touch-action: manipulation;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
}

.btn-checkout:hover:not(:disabled) {
	background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
	box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
	transform: translateY(-1px);
}

.btn-checkout:active:not(:disabled) {
	transform: scale(0.98);
}

.btn-checkout:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	box-shadow: none;
}

/* Payment Method Buttons */
.btn-payment {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
	border: 2px solid #d1d5db;
	border-radius: 0.75rem;
	min-height: 64px;
	transition: all 0.2s;
	touch-action: manipulation;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
}

[data-theme="dark"] .btn-payment {
	background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
	border-color: #4b5563;
}

.btn-payment:hover:not(:disabled) {
	background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
	border-color: #9ca3af;
	transform: translateY(-1px);
}

[data-theme="dark"] .btn-payment:hover:not(:disabled) {
	background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
}

.btn-payment:active:not(:disabled) {
	transform: scale(0.97);
}

.btn-payment:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Secondary Buttons */
.btn-secondary {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f3f4f6;
	border: 2px solid #d1d5db;
	border-radius: 0.75rem;
	min-height: 64px;
	transition: all 0.2s;
	touch-action: manipulation;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
}

[data-theme="dark"] .btn-secondary {
	background: #374151;
	border-color: #4b5563;
}

.btn-secondary:hover:not(:disabled) {
	background: #e5e7eb;
	border-color: #9ca3af;
}

[data-theme="dark"] .btn-secondary:hover:not(:disabled) {
	background: #4b5563;
}

.btn-secondary:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Safe area for mobile devices */
.safe-area-bottom {
	padding-bottom: env(safe-area-inset-bottom);
}

/* Keyboard Wrapper Container */
.keyboard-wrapper-container {
	max-width: 100%;
	animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* Keyboard Toggle Button */
.btn-keyboard-toggle {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
	border: 2px solid #d1d5db;
	border-radius: 0.75rem;
	min-height: 64px;
	transition: all 0.2s;
	touch-action: manipulation;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
}

[data-theme="dark"] .btn-keyboard-toggle {
	background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
	border-color: #4b5563;
}

.btn-keyboard-toggle:hover:not(:disabled) {
	background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
	border-color: #9ca3af;
	transform: translateY(-1px);
}

[data-theme="dark"] .btn-keyboard-toggle:hover:not(:disabled) {
	background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
}

.btn-keyboard-toggle:active:not(:disabled) {
	transform: scale(0.97);
}

.btn-keyboard-toggle:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Keyboard Toggle Close Button */
.keyboard-toggle-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.5rem;
	border-radius: 0.5rem;
	background: #f3f4f6;
	border: 1px solid #d1d5db;
	color: #6b7280;
	transition: all 0.2s;
	cursor: pointer;
	touch-action: manipulation;
	-webkit-tap-highlight-color: transparent;
}

[data-theme="dark"] .keyboard-toggle-btn {
	background: #374151;
	border-color: #4b5563;
	color: #9ca3af;
}

.keyboard-toggle-btn:hover {
	background: #e5e7eb;
	border-color: #9ca3af;
	color: #374151;
}

[data-theme="dark"] .keyboard-toggle-btn:hover {
	background: #4b5563;
	color: #d1d5db;
}

.keyboard-toggle-btn:active {
	transform: scale(0.95);
}

/* Show keyboard toggle on touch devices only */
@media (hover: hover) and (pointer: fine) {
	.btn-keyboard-toggle {
		display: none;
	}
}
</style>

