<template>
	<div class="virtual-keyboard-container">
		<!-- Keyboard Layout -->
		<div class="keyboard-wrapper">
			<!-- Row 1 -->
			<div class="keyboard-row">
				<button
					v-for="key in getCurrentRow(1)"
					:key="key"
					@click="insertChar(key)"
					class="keyboard-key keyboard-key-char"
				>
					<span class="keyboard-char">{{ key }}</span>
				</button>
			</div>

			<!-- Row 2 -->
			<div class="keyboard-row">
				<button
					v-for="key in getCurrentRow(2)"
					:key="key"
					@click="insertChar(key)"
					class="keyboard-key keyboard-key-char"
				>
					<span class="keyboard-char">{{ key }}</span>
				</button>
			</div>

			<!-- Row 3 -->
			<div class="keyboard-row">
				<button
					v-for="key in getCurrentRow(3)"
					:key="key"
					@click="insertChar(key)"
					class="keyboard-key keyboard-key-char"
				>
					<span class="keyboard-char">{{ key }}</span>
				</button>
			</div>

			<!-- Row 4 - Numbers and Special -->
			<div class="keyboard-row">
				<button
					v-for="key in getCurrentRow(4)"
					:key="key"
					@click="insertChar(key)"
					class="keyboard-key keyboard-key-char"
				>
					<span class="keyboard-char">{{ key }}</span>
				</button>
			</div>

			<!-- Row 5 - Space, Backspace, Done -->
			<div class="keyboard-row">
				<button
					@click="insertChar(' ')"
					class="keyboard-key keyboard-key-space"
				>
					<span class="keyboard-char">{{ __('Space') }}</span>
				</button>
				<button
					@click="backspace"
					class="keyboard-key keyboard-key-action keyboard-key-backspace"
					:title="__('Backspace')"
				>
					<svg class="backspace-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"/>
					</svg>
				</button>
				<button
					@click="closeKeyboard"
					class="keyboard-key keyboard-key-action keyboard-key-done"
				>
					<span class="keyboard-char">{{ __('Done') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
	modelValue: {
		type: String,
		default: ''
	},
	targetInput: {
		type: Object,
		default: null
	}
})

const emit = defineEmits(['update:modelValue', 'input', 'close'])

// Sync virtual keyboard with physical keyboard input
watch(() => props.modelValue, (newValue) => {
	if (props.targetInput) {
		const input = props.targetInput
		if (input && input.value !== newValue) {
			input.value = newValue || ''
			// Trigger input event to update v-model
			const inputEvent = new Event('input', { bubbles: true, cancelable: true })
			Object.defineProperty(inputEvent, 'target', { value: input, enumerable: true })
			input.dispatchEvent(inputEvent)
		}
	}
}, { immediate: true })

// English keyboard layout only
const englishLayout = {
	1: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
	2: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
	3: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
	4: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '@', '.']
}

function getCurrentRow(row) {
	return englishLayout[row] || []
}

function getCurrentValue() {
	if (props.targetInput && props.targetInput.value !== undefined) {
		return props.targetInput.value || ''
	}
	return props.modelValue || ''
}

function insertChar(char) {
	const currentValue = getCurrentValue()
	const newValue = currentValue + char
	
	// Emit the new value first to update parent component
	emit('update:modelValue', newValue)
	emit('input', newValue)
	
	// Then update the input field directly
	if (props.targetInput) {
		const input = props.targetInput
		if (input && input.value !== undefined) {
			// Set the value
			input.value = newValue
			
			// Create and dispatch input event for Vue reactivity
			const inputEvent = new Event('input', { bubbles: true, cancelable: true })
			Object.defineProperty(inputEvent, 'target', { value: input, enumerable: true })
			Object.defineProperty(inputEvent, 'currentTarget', { value: input, enumerable: true })
			input.dispatchEvent(inputEvent)
			
			// Also trigger change event
			const changeEvent = new Event('change', { bubbles: true, cancelable: true })
			Object.defineProperty(changeEvent, 'target', { value: input, enumerable: true })
			input.dispatchEvent(changeEvent)
		}
	}
}

function backspace() {
	const currentValue = getCurrentValue()
	const newValue = currentValue.slice(0, -1)
	
	// Emit the new value first to update parent component
	emit('update:modelValue', newValue)
	emit('input', newValue)
	
	// Then update the input field directly
	if (props.targetInput) {
		const input = props.targetInput
		if (input && input.value !== undefined) {
			// Set the value
			input.value = newValue
			
			// Create and dispatch input event for Vue reactivity
			const inputEvent = new Event('input', { bubbles: true, cancelable: true })
			Object.defineProperty(inputEvent, 'target', { value: input, enumerable: true })
			Object.defineProperty(inputEvent, 'currentTarget', { value: input, enumerable: true })
			input.dispatchEvent(inputEvent)
			
			// Also trigger change event
			const changeEvent = new Event('change', { bubbles: true, cancelable: true })
			Object.defineProperty(changeEvent, 'target', { value: input, enumerable: true })
			input.dispatchEvent(changeEvent)
		}
	}
}

function closeKeyboard() {
	emit('close')
}

function __(text) {
	return text
}
</script>

<style scoped>
/* Main Container */
.virtual-keyboard-container {
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	border-radius: 8px;
	padding: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	border: 1px solid #e2e8f0;
	width: 100%;
	max-width: 100%;
	display: block !important;
	visibility: visible !important;
	opacity: 1 !important;
	position: relative;
	z-index: 100;
	margin: 0 auto;
}

/* Keyboard Wrapper */
.keyboard-wrapper {
	display: flex;
	flex-direction: column;
	gap: 4px;
	width: 100%;
}

/* Keyboard Row */
.keyboard-row {
	display: flex;
	gap: 6px;
	justify-content: center;
	width: 100%;
	flex-wrap: nowrap;
}

/* Keyboard Keys */
.keyboard-key {
	min-height: 32px;
	height: 32px;
	min-width: 28px;
	flex: 1 1 auto;
	border-radius: 4px;
	border: 1px solid #cbd5e1;
	background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	color: #1e293b;
	cursor: pointer;
	transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
	display: flex;
	align-items: center;
	justify-content: center;
	touch-action: manipulation;
	-webkit-tap-highlight-color: transparent;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	position: relative;
	overflow: hidden;
	user-select: none;
	padding: 0 8px;
}

.keyboard-key::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%);
	opacity: 0;
	transition: opacity 0.2s;
}

.keyboard-key:active {
	background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
	transform: scale(0.95);
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	border-color: #94a3b8;
}

.keyboard-key:active::before {
	opacity: 1;
}

/* Keyboard Characters */
.keyboard-char {
	font-size: 14px;
	font-weight: 600;
	letter-spacing: 0.5px;
	position: relative;
	z-index: 1;
	text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
	font-family: 'Segoe UI', 'Arial', sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-rendering: optimizeLegibility;
	text-transform: uppercase;
}

.keyboard-key-char .keyboard-char {
	font-size: 14px;
}

/* Space Key */
.keyboard-key-space {
	flex: 1;
	font-weight: 600;
	max-width: 150px;
	min-width: 80px;
}

.keyboard-key-space .keyboard-char {
	font-size: 12px;
	text-transform: none;
}

/* Action Keys */
.keyboard-key-action {
	flex: 0 0 auto;
	min-width: 50px;
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	color: white;
	border-color: #1d4ed8;
	box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.keyboard-key-action .keyboard-char {
	font-size: 12px;
	font-weight: 600;
	text-transform: none;
}

.keyboard-key-action::before {
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%);
}

.keyboard-key-action:active {
	background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
	transform: scale(0.95);
	box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Backspace Icon */
.backspace-icon {
	width: 16px;
	height: 16px;
	stroke-width: 2;
}

/* Done Key */
.keyboard-key-done {
	background: linear-gradient(135deg, #10b981 0%, #059669 100%);
	border-color: #047857;
	box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.keyboard-key-done .keyboard-char {
	font-size: 12px;
}

.keyboard-key-done:active {
	background: linear-gradient(135deg, #047857 0%, #065f46 100%);
	transform: scale(0.95);
	box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Touch screen optimizations */
@media (hover: none) and (pointer: coarse) {
	.virtual-keyboard-container {
		padding: 16px;
		border-radius: 10px;
		max-width: 100%;
	}
	
	.keyboard-wrapper {
		gap: 10px;
	}
	
	.keyboard-row {
		gap: 10px;
	}
	
	.keyboard-key {
		min-height: 60px;
		height: 60px;
		min-width: 55px;
		flex: 1 1 auto;
		border-radius: 8px;
		padding: 0 12px;
		border: 2px solid #cbd5e1;
	}
	
	.keyboard-char {
		font-size: 24px;
		font-weight: 700;
	}
	
	.keyboard-key-char .keyboard-char {
		font-size: 24px;
	}
	
	.backspace-icon {
		width: 32px;
		height: 32px;
		stroke-width: 2.5;
	}
	
	.keyboard-key-space {
		min-width: 180px;
	}
	
	.keyboard-key-space .keyboard-char {
		font-size: 20px;
	}
	
	.keyboard-key-action {
		min-width: 90px;
	}
	
	.keyboard-key-action .keyboard-char {
		font-size: 20px;
		font-weight: 700;
	}
	
	.keyboard-key-done .keyboard-char {
		font-size: 20px;
		font-weight: 700;
	}
}

/* Responsive Design */
@media (max-width: 768px) {
	.virtual-keyboard-container {
		padding: 8px;
		border-radius: 6px;
	}
	
	.keyboard-wrapper {
		gap: 4px;
	}
	
	.keyboard-row {
		gap: 4px;
	}
	
	.keyboard-key {
		min-height: 34px;
		height: 34px;
		min-width: 30px;
		border-radius: 4px;
	}
	
	.keyboard-char {
		font-size: 14px;
	}
	
	.keyboard-key-char .keyboard-char {
		font-size: 14px;
	}
	
	.backspace-icon {
		width: 16px;
		height: 16px;
	}
}

@media (max-width: 640px) {
	.virtual-keyboard-container {
		padding: 6px;
		border-radius: 5px;
	}
	
	.keyboard-wrapper {
		gap: 3px;
	}
	
	.keyboard-row {
		gap: 3px;
	}
	
	.keyboard-key {
		min-height: 32px;
		height: 32px;
		min-width: 28px;
		border-radius: 4px;
	}
	
	.keyboard-char {
		font-size: 13px;
	}
	
	.keyboard-key-char .keyboard-char {
		font-size: 13px;
	}
	
	.backspace-icon {
		width: 14px;
		height: 14px;
	}
	
	.keyboard-key-space {
		min-width: 70px;
	}
	
	.keyboard-key-action {
		min-width: 45px;
	}
}
</style>
