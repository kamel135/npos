<template>
	<div class="flex flex-col h-full bg-white border-r border-gray-200 w-[100px] flex-shrink-0">
		<!-- Up Arrow -->
		<button
			@click="scrollUp"
			class="h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
			</svg>
		</button>

		<!-- Categories List -->
		<div
			ref="scrollContainer"
			class="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-1 p-1"
		>
			<button
				@click="selectGroup(null)"
				:class="[
					'flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold text-center transition-all min-h-[80px]',
					!selectedGroup
						? 'bg-blue-600 text-white shadow-md'
						: 'bg-gray-50 text-gray-700 hover:bg-gray-100'
				]"
			>
				<span>{{ __('All Items') }}</span>
			</button>

			<button
				v-for="group in itemGroups"
				:key="group.item_group"
				@click="selectGroup(group.item_group)"
				:class="[
					'flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold text-center transition-all min-h-[80px]',
					selectedGroup === group.item_group
						? 'bg-blue-600 text-white shadow-md'
						: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
				]"
			>
				<span>{{ __(group.item_group) }}</span>
			</button>
		</div>

		<!-- Down Arrow -->
		<button
			@click="scrollDown"
			class="h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
	</div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
	itemGroups: {
		type: Array,
		default: () => []
	},
	selectedGroup: {
		type: String,
		default: null
	}
})

const emit = defineEmits(['select-group'])
const scrollContainer = ref(null)

function selectGroup(group) {
	emit('select-group', group)
}

function scrollUp() {
	if (scrollContainer.value) {
		scrollContainer.value.scrollBy({ top: -100, behavior: 'smooth' })
	}
}

function scrollDown() {
	if (scrollContainer.value) {
		scrollContainer.value.scrollBy({ top: 100, behavior: 'smooth' })
	}
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
