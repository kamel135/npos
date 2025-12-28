<template>
	<div class="flex flex-col h-full">
		<!-- Category Filters -->
		<div class="p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
			<CategoryChips
				v-model="selectedCategory"
				:categories="categories"
				:total-count="totalProductsCount"
				@change="handleCategoryChange"
			/>
		</div>

		<!-- Products Grid -->
		<div class="flex-1 overflow-y-auto pos-scrollbar bg-gray-50 dark:bg-slate-900">
			<div class="p-6">
				<!-- Loading State -->
				<div v-if="loading" class="grid-cols-responsive gap-6">
					<div
						v-for="i in 10"
						:key="i"
						class="pos-card aspect-square loading-skeleton"
					></div>
				</div>

				<!-- Empty State -->
				<div
					v-else-if="filteredProducts.length === 0"
					class="flex flex-col items-center justify-center py-20 text-center"
				>
					<div class="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
						<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
						</svg>
					</div>
					<p class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
						{{ __('No products found') }}
					</p>
					<p class="text-gray-500 dark:text-slate-400">
						{{ __('Try adjusting your filters or search') }}
					</p>
				</div>

				<!-- Products Grid -->
				<div
					v-else
					class="grid-cols-responsive gap-6"
				>
					<ProductCard
						v-for="product in filteredProducts"
						:key="product.id"
						:product="product"
						@click="handleProductClick"
						@long-press="handleProductLongPress"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProductCard from './ProductCard.vue'
import CategoryChips from './CategoryChips.vue'

const props = defineProps({
	products: {
		type: Array,
		required: true
	},
	categories: {
		type: Array,
		default: () => []
	},
	searchQuery: {
		type: String,
		default: ''
	},
	loading: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['product-click', 'product-long-press', 'category-change'])

// State
const selectedCategory = ref(null)

// Computed
const filteredProducts = computed(() => {
	let filtered = props.products

	// Filter by category
	if (selectedCategory.value) {
		filtered = filtered.filter(p => p.category === selectedCategory.value)
	}

	// Filter by search
	if (props.searchQuery) {
		const query = props.searchQuery.toLowerCase()
		filtered = filtered.filter(p =>
			p.name?.toLowerCase().includes(query) ||
			p.item_code?.toLowerCase().includes(query) ||
			p.category?.toLowerCase().includes(query)
		)
	}

	return filtered
})

const totalProductsCount = computed(() => props.products.length)

// Methods
const handleProductClick = (product) => {
	emit('product-click', product)
	
	// Haptic feedback
	if (navigator.vibrate) {
		navigator.vibrate(10)
	}
}

const handleProductLongPress = (product) => {
	emit('product-long-press', product)
}

const handleCategoryChange = (categoryId) => {
	emit('category-change', categoryId)
}

const __ = (text) => text
</script>

<style scoped>
/* Responsive Grid */
.grid-cols-responsive {
	display: grid;
	gap: 1.5rem;
}

/* Mobile/Tablet: 2 columns */
@media (min-width: 640px) {
	.grid-cols-responsive {
		grid-template-columns: repeat(2, 1fr);
	}
}

/* Small Desktop/Tablet Landscape: 3 columns */
@media (min-width: 1024px) {
	.grid-cols-responsive {
		grid-template-columns: repeat(3, 1fr);
	}
}

/* Medium Desktop: 4 columns */
@media (min-width: 1280px) {
	.grid-cols-responsive {
		grid-template-columns: repeat(4, 1fr);
	}
}

/* Large Desktop: 5 columns */
@media (min-width: 1440px) {
	.grid-cols-responsive {
		grid-template-columns: repeat(5, 1fr);
	}
}
</style>

