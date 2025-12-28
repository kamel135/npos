<template>
	<Teleport to="body">
		<Transition name="dialog-fade">
			<div
				v-if="modelValue"
				class="fixed inset-0 z-50 flex items-center justify-center p-4"
				@click.self="handleClose"
			>
				<!-- Overlay -->
				<div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

				<!-- Dialog Content -->
				<div
					class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
					role="dialog"
					:aria-labelledby="titleId"
					:aria-modal="true"
				>
					<!-- Header -->
					<div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
						<h2
							:id="titleId"
							class="text-xl font-bold text-gray-900 dark:text-white"
						>
							<slot name="title">{{ title }}</slot>
						</h2>
						<button
							@click="handleClose"
							class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
							:aria-label="__('Close')"
						>
							<svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
							</svg>
						</button>
					</div>

					<!-- Body -->
					<div class="flex-1 overflow-y-auto pos-scrollbar px-6 py-4">
						<slot></slot>
					</div>

					<!-- Footer -->
					<div
						v-if="$slots.footer || showDefaultFooter"
						class="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-end gap-3 flex-shrink-0"
					>
						<slot name="footer">
							<button
								v-if="showCancel"
								@click="handleCancel"
								class="btn-pos btn-pos-secondary px-6"
							>
								{{ cancelLabel }}
							</button>
							<button
								v-if="showConfirm"
								@click="handleConfirm"
								:disabled="!canConfirm"
								class="btn-pos btn-pos-primary px-8"
							>
								{{ confirmLabel }}
							</button>
						</slot>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false
	},
	title: {
		type: String,
		default: ''
	},
	showDefaultFooter: {
		type: Boolean,
		default: true
	},
	showCancel: {
		type: Boolean,
		default: true
	},
	showConfirm: {
		type: Boolean,
		default: true
	},
	cancelLabel: {
		type: String,
		default: 'Cancel'
	},
	confirmLabel: {
		type: String,
		default: 'Confirm'
	},
	canConfirm: {
		type: Boolean,
		default: true
	},
	closeOnEscape: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits(['update:modelValue', 'close', 'cancel', 'confirm'])

// Computed
const titleId = computed(() => `dialog-title-${Math.random().toString(36).substr(2, 9)}`)

// Methods
const handleClose = () => {
	emit('update:modelValue', false)
	emit('close')
}

const handleCancel = () => {
	emit('cancel')
	handleClose()
}

const handleConfirm = () => {
	if (props.canConfirm) {
		emit('confirm')
	}
}

const handleEscape = (e) => {
	if (e.key === 'Escape' && props.closeOnEscape && props.modelValue) {
		handleClose()
	}
}

const __ = (text) => text

// Lifecycle
onMounted(() => {
	document.addEventListener('keydown', handleEscape)
	// Prevent body scroll when dialog is open
	if (props.modelValue) {
		document.body.style.overflow = 'hidden'
	}
})

onUnmounted(() => {
	document.removeEventListener('keydown', handleEscape)
	document.body.style.overflow = ''
})
</script>

<style scoped>
/* Dialog Transitions */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
	transition: opacity 200ms ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
	opacity: 0;
}

.dialog-fade-enter-active .relative,
.dialog-fade-leave-active .relative {
	transition: transform 200ms ease, opacity 200ms ease;
}

.dialog-fade-enter-from .relative,
.dialog-fade-leave-to .relative {
	transform: scale(0.95);
	opacity: 0;
}
</style>

