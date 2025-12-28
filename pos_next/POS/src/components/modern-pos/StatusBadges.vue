<template>
	<div class="flex items-center gap-2">
		<!-- Online/Offline Status -->
		<div
			class="badge-pos"
			:class="isOnline ? 'badge-success' : 'badge-danger'"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path v-if="isOnline" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
				<path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
			</svg>
			<span>{{ isOnline ? __('Online') : __('Offline') }}</span>
		</div>

		<!-- Syncing Status -->
		<div
			v-if="isSyncing"
			class="badge-pos badge-warning"
		>
			<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
			</svg>
			<span>{{ __('Syncing...') }}</span>
		</div>

		<!-- Pending Count -->
		<div
			v-if="pendingCount > 0"
			class="badge-pos badge-warning cursor-pointer"
			@click="$emit('show-pending')"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
			</svg>
			<span>{{ pendingCount }} {{ __('pending') }}</span>
		</div>

		<!-- Printer Status -->
		<button
			v-if="showPrinterStatus"
			@click="$emit('printer-click')"
			class="badge-pos"
			:class="printerConnected ? 'badge-success' : 'bg-gray-100 text-gray-600'"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
			</svg>
		</button>
	</div>
</template>

<script setup>
defineProps({
	isOnline: {
		type: Boolean,
		default: true
	},
	isSyncing: {
		type: Boolean,
		default: false
	},
	pendingCount: {
		type: Number,
		default: 0
	},
	printerConnected: {
		type: Boolean,
		default: false
	},
	showPrinterStatus: {
		type: Boolean,
		default: true
	}
})

defineEmits(['show-pending', 'printer-click'])

const __ = (text) => text
</script>

