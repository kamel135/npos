<template>
	<div class="relative">
		<!-- Scroll Container -->
		<div
			ref="scrollContainer"
			class="flex gap-2 overflow-x-auto pos-scrollbar pb-2 scroll-smooth"
			@scroll="handleScroll"
		>
			<!-- All Items Chip -->
			<button
				@click="selectCategory(null)"
				class="chip-button flex-shrink-0"
				:class="{ 'chip-active': selectedCategory === null }"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
				</svg>
				<span>{{ __('All Items') }}</span>
				<span v-if="showCount" class="badge-count">{{ totalCount }}</span>
			</button>

			<!-- Category Chips -->
			<button
				v-for="category in categories"
				:key="category.id"
				@click="selectCategory(category.id)"
				class="chip-button flex-shrink-0"
				:class="{ 'chip-active': selectedCategory === category.id }"
			>
				<span v-if="category.icon" class="text-lg">{{ category.icon }}</span>
				<span>{{ category.name }}</span>
				<span v-if="showCount && category.count" class="badge-count">{{ category.count }}</span>
			</button>
		</div>

		<!-- Scroll Indicators -->
		<button
			v-if="showLeftArrow"
			@click="scrollLeft"
			class="absolute left-0 top-0 bottom-2 w-10 bg-gradient-to-r from-white dark:from-slate-800 to-transparent flex items-center justify-start pl-1"
			aria-label="Scroll left"
		>
			<div class="w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center">
				<svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
			</div>
		</button>

		<button
			v-if="showRightArrow"
			@click="scrollRight"
			class="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-white dark:from-slate-800 to-transparent flex items-center justify-end pr-1"
			aria-label="Scroll right"
		>
			<div class="w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center">
				<svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
				</svg>
			</div>
		</button>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
	categories: {
		type: Array,
		required: true
	},
	modelValue: {
		type: [String, Number],
		default: null
	},
	showCount: {
		type: Boolean,
		default: true
	},
	totalCount: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits(['update:modelValue', 'change'])

// State
const scrollContainer = ref(null)
const showLeftArrow = ref(false)
const showRightArrow = ref(false)

// Computed
const selectedCategory = computed(() => props.modelValue)

// Methods
const selectCategory = (categoryId) => {
	emit('update:modelValue', categoryId)
	emit('change', categoryId)
}

const handleScroll = () => {
	if (!scrollContainer.value) return
	
	const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
	
	showLeftArrow.value = scrollLeft > 10
	showRightArrow.value = scrollLeft < scrollWidth - clientWidth - 10
}

const scrollLeft = () => {
	if (!scrollContainer.value) return
	scrollContainer.value.scrollBy({
		left: -200,
		behavior: 'smooth'
	})
}

const scrollRight = () => {
	if (!scrollContainer.value) return
	scrollContainer.value.scrollBy({
		left: 200,
		behavior: 'smooth'
	})
}

const __ = (text) => text

// Lifecycle
onMounted(() => {
	handleScroll()
	window.addEventListener('resize', handleScroll)
})

onUnmounted(() => {
	window.removeEventListener('resize', handleScroll)
})
</script>

<style scoped>
.chip-button {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.625rem 1rem;
	min-height: 48px;
	background-color: var(--pos-bg-elevated);
	border: 1px solid var(--pos-border);
	border-radius: 9999px;
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--pos-text-primary);
	transition: all var(--pos-transition);
	cursor: pointer;
	user-select: none;
	touch-action: manipulation;
}

.chip-button:hover {
	background-color: var(--pos-bg-hover);
	border-color: var(--pos-border-hover);
	box-shadow: var(--pos-shadow-sm);
}

.chip-button:active {
	transform: scale(0.97);
}

.chip-active {
	background-color: var(--pos-primary);
	color: white;
	border-color: var(--pos-primary);
	box-shadow: var(--pos-shadow-md);
}

.chip-active:hover {
	background-color: var(--pos-primary-hover);
}

.badge-count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 1.5rem;
	height: 1.25rem;
	padding: 0 0.375rem;
	background-color: rgba(255, 255, 255, 0.3);
	border-radius: 9999px;
	font-size: 0.75rem;
	font-weight: 700;
}

.chip-active .badge-count {
	background-color: rgba(255, 255, 255, 0.3);
}
</style>

