<template>
	<div class="control-buttons flex gap-2 p-3 bg-gray-50 border-b-2 border-gray-200">
		<!-- Hold Button -->
		<button
			@click="$emit('hold')"
			class="ctrl-btn-intouch flex-1 bg-green-600 hover:bg-green-700 text-white"
			:title="__('Hold - Save current order')"
		>
			<svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
			</svg>
			<span class="text-sm font-bold">HOLD</span>
		</button>
		
		<!-- Time/Clock Button -->
		<button
			class="ctrl-btn-intouch flex-1 bg-blue-600 hover:bg-blue-700 text-white"
			:title="__('Current Time')"
		>
			<svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
			</svg>
			<span class="text-xs font-semibold">{{ currentTime }}</span>
		</button>
		
		<!-- Add Button -->
		<button
			@click="$emit('add')"
			class="ctrl-btn-intouch w-14 bg-red-500 hover:bg-red-600 text-white justify-center"
			:title="__('Add Item')"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/>
			</svg>
		</button>
		
		<!-- Close/Cancel Button -->
		<button
			@click="$emit('close')"
			class="ctrl-btn-intouch w-14 bg-red-500 hover:bg-red-600 text-white justify-center"
			:title="__('Close/Cancel')"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
			</svg>
		</button>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['hold', 'add', 'close'])

const currentTime = ref('')

const updateTime = () => {
	const now = new Date()
	const hours = now.getHours().toString().padStart(2, '0')
	const minutes = now.getMinutes().toString().padStart(2, '0')
	currentTime.value = `${hours}:${minutes}`
}

let timeInterval = null

onMounted(() => {
	updateTime()
	timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
	if (timeInterval) {
		clearInterval(timeInterval)
	}
})
</script>

<style scoped>
.ctrl-btn-intouch {
	min-height: 60px;
}
</style>
