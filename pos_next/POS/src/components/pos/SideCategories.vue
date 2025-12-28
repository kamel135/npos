<template>
	<aside class="side-categories flex flex-col h-full bg-gray-100 border-l-2 border-gray-300 overflow-hidden relative">
		<!-- Up Arrow -->
		<button 
			@click.stop="scrollUp"
			@touchstart.stop.prevent="scrollUp"
			@mousedown.stop.prevent="scrollUp"
			@touchend.stop.prevent
			class="scroll-btn up"
			:disabled="!canScrollUp"
			type="button"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
			</svg>
		</button>

		<!-- Categories List -->
		<div ref="categoriesContainer" class="flex-1 overflow-y-auto scrollbar-hide p-2 flex flex-col gap-2" @scroll="handleScroll">
		<button
			v-for="category in categories"
			:key="category.name"
			@click="selectCategory(category)"
			:class="[
				'category-btn-intouch',
				{ 'active': selectedCategory === category.name }
			]"
			:title="category.name"
		>
				<span class="category-name text-sm font-bold">{{ category.name }}</span>
			</button>
		</div>

		<!-- Down Arrow -->
		<button 
			@click.stop="scrollDown"
			@touchstart.stop.prevent="scrollDown"
			@mousedown.stop.prevent="scrollDown"
			@touchend.stop.prevent
			class="scroll-btn down"
			:disabled="!canScrollDown"
			type="button"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
			</svg>
		</button>
	</aside>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
	itemGroups: {
		type: Array,
		default: () => []
	},
	modelValue: {
		type: String,
		default: null
	}
})

const emit = defineEmits(['update:modelValue', 'category-selected'])

const selectedCategory = ref(props.modelValue)
const categoriesContainer = ref(null)
const canScrollUp = ref(false)
const canScrollDown = ref(false) // Will be updated on mount

// Default categories - NO COLORS, just white/gray
const defaultCategories = [
	{ name: 'الكل', value: null },
	{ name: 'مشروبات', value: 'beverages' },
	{ name: 'حلويات', value: 'sweets' },
	{ name: 'سندوتشات', value: 'sandwiches' },
	{ name: 'وجبات', value: 'meals' },
	{ name: 'مقبلات', value: 'appetizers' },
]

// Merge item groups from props with default categories
const categories = computed(() => {
	if (props.itemGroups && props.itemGroups.length > 0) {
		return [
			{ name: 'الكل', value: null },
			...props.itemGroups.map((group) => ({
				name: group.item_group || group.name,
				value: group.item_group || group.name
			}))
		]
	}
	return defaultCategories
})

const selectCategory = (category) => {
	selectedCategory.value = category.name
	emit('update:modelValue', category.value)
	emit('category-selected', category)
}

// Scroll handlers - Fixed to work with touch without moving cursor
const scrollUp = (e) => {
	if (e) {
		e.preventDefault()
		e.stopPropagation()
		e.stopImmediatePropagation()
	}
	if (categoriesContainer.value) {
		// Always try to scroll, let handleScroll update the state
		categoriesContainer.value.scrollBy({ top: -100, behavior: 'smooth' })
		// Update state immediately
		setTimeout(() => handleScroll(), 100)
	}
	return false
}

const scrollDown = (e) => {
	if (e) {
		e.preventDefault()
		e.stopPropagation()
		e.stopImmediatePropagation()
	}
	if (categoriesContainer.value) {
		// Always try to scroll, let handleScroll update the state
		categoriesContainer.value.scrollBy({ top: 100, behavior: 'smooth' })
		// Update state immediately
		setTimeout(() => handleScroll(), 100)
	}
	return false
}

const handleScroll = () => {
	if (!categoriesContainer.value) return
	const { scrollTop, scrollHeight, clientHeight } = categoriesContainer.value
	canScrollUp.value = scrollTop > 0
	canScrollDown.value = scrollTop + clientHeight < scrollHeight - 1 // -1 for tolerance
}

onMounted(() => {
	nextTick(() => {
		// Check multiple times to ensure content is loaded
		setTimeout(() => {
			handleScroll()
		}, 100)
		setTimeout(() => {
			handleScroll()
		}, 500)
	})
})
</script>

<style scoped>
.side-categories {
	width: 100px; /* Slightly wider for readability */
	min-width: 100px;
	max-width: 100px;
}

[dir="rtl"] .side-categories {
	border-left: none;
	border-right: 2px solid #d1d5db;
}

/* Category Buttons - Plain White/Gray */
.category-btn-intouch {
	width: 100%;
	padding: 0.5rem 0.25rem;
	background-color: white;
	border: 1px solid #d1d5db;
	border-radius: 0.5rem;
	color: #374151;
	transition: all 0.2s;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 60px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    word-wrap: break-word;
    overflow-wrap: anywhere;
    white-space: normal;
    line-height: 1.1;
}

.category-btn-intouch:hover {
	background-color: #f3f4f6;
}

.category-btn-intouch.active {
	background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	color: white;
	border-color: #1d4ed8;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Scroll Buttons - Large Blue Arrows */
.scroll-btn {
	width: 100%;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(180deg, #e0f2fe 0%, #bfdbfe 100%);
	color: #2563eb;
	border: none;
	cursor: pointer;
	transition: all 0.2s;
    flex-shrink: 0;
    z-index: 10;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    pointer-events: auto;
    -webkit-tap-highlight-color: transparent;
}

.scroll-btn:hover:not(:disabled) {
	background: linear-gradient(180deg, #bfdbfe 0%, #93c5fd 100%);
}

.scroll-btn:active:not(:disabled) {
	background: #60a5fa;
    color: white;
}

.scroll-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
    color: #9ca3af;
    background: #f3f4f6;
}

.scroll-btn.up {
    border-bottom: 1px solid #bfdbfe;
}

.scroll-btn.down {
    border-top: 1px solid #bfdbfe;
}

/* Hide scrollbar */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
