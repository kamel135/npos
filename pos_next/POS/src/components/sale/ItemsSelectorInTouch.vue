<template>
	<div class="flex flex-col h-full bg-gray-100">
		<!-- Search Bar (Optional - Can be hidden for cleaner look) -->
		<div v-if="showSearch" class="p-2 bg-white border-b border-gray-200">
			<input
				ref="searchInputRef"
				v-model="searchTerm"
				type="text"
				:placeholder="__('Search items...')"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
			/>
		</div>

		<!-- Product Grid - Large Buttons -->
		<div class="flex-1 overflow-y-auto p-2">
			<div v-if="loading && !filteredItems.length" class="flex items-center justify-center h-full">
				<div class="text-center">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
					<p class="mt-3 text-sm text-gray-500">{{ __('Loading items...') }}</p>
				</div>
			</div>

			<div v-else-if="filteredItems.length === 0" class="flex items-center justify-center h-full">
				<div class="text-center text-gray-400">
					<svg class="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
					</svg>
					<p class="text-lg font-medium">{{ __('No items found') }}</p>
				</div>
			</div>

			<!-- Compact Responsive Grid: More items visible -->
			<div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2">
				<button
					v-for="item in displayedItems"
					:key="item.item_code"
					@click="handleItemClick(item)"
					class="product-btn-intouch group"
				>
					<!-- Item Image (if available) - Smaller -->
					<div v-if="item.image" class="w-full mb-1 relative">
						<img 
							:src="item.image" 
							:alt="item.item_name"
							class="w-14 h-14 sm:w-16 sm:h-16 mx-auto object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform"
						/>
						<!-- Stock Badge - Removed per user request -->
					</div>
					<div v-else class="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-1 bg-gray-200 rounded-lg flex items-center justify-center">
						<svg class="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
						</svg>
					</div>
					
					<!-- Item Name - 2 lines max - Smaller text -->
					<div class="text-[11px] sm:text-xs font-semibold text-center leading-tight px-1.5 line-clamp-2 min-h-[2rem]">
						{{ item.item_name }}
					</div>
					
					<!-- Item Price - Smaller -->
					<div class="text-xs sm:text-sm font-bold text-blue-600 mt-0.5">
						{{ formatCurrency(item.rate || item.price_list_rate || 0) }}
					</div>
				</button>
			</div>
		</div>

		<!-- Bottom Category Bar - Scrollable Pills -->
		<div class="bg-gray-800 p-3 border-t-2 border-gray-900">
			<div class="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
				<!-- All Categories Button -->
				<button
					@click="selectCategory({ name: 'All' })"
					:class="[
						'category-btn-intouch',
						selectedCategory === 'All' || !selectedCategory ? 'active ring-2 ring-white' : ''
					]"
					style="background: #64748b;"
				>
					{{ __('All') }}
				</button>
				<!-- Category Buttons -->
				<button
					v-for="(category, index) in categories"
					:key="index"
					@click="selectCategory(category)"
					:class="[
						'category-btn-intouch',
						selectedCategory === category.name ? 'active ring-2 ring-white' : ''
					]"
					:style="{ background: category.color }"
				>
					{{ category.name }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useItemSearchStore } from "@/stores/itemSearch"
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency"
import { storeToRefs } from "pinia"

const props = defineProps({
	posProfile: String,
	cartItems: {
		type: Array,
		default: () => [],
	},
	currency: {
		type: String,
		default: "USD",
	},
	showSearch: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(["item-selected"])

// Store
const itemStore = useItemSearchStore()
const { filteredItems, loading, itemGroups } = storeToRefs(itemStore)

// Local state
const searchInputRef = ref(null)
const searchTerm = ref("")
const selectedCategory = ref("All")

// Sample categories with colors (You can customize these based on your needs)
const categories = ref([
	{ name: "الزيادى", color: "#0ea5e9" },
	{ name: "الكوكتيلات", color: "#8b5cf6" },
	{ name: "السوف درسك", color: "#ec4899" },
	{ name: "دبورت", color: "#f59e0b" },
	{ name: "مبلبت سنكبك", color: "#10b981" },
	{ name: "سوطنات", color: "#06b6d4" },
	{ name: "الاطفال", color: "#f43f5e" },
	{ name: "ساخنه", color: "#ef4444" },
	{ name: "ساخنة", color: "#84cc16" },
	{ name: "فراسه", color: "#a855f7" },
	{ name: "سموری", color: "#6366f1" },
])

// Computed
const displayedItems = computed(() => {
	let items = filteredItems.value || []
	
	// Apply search filter
	if (searchTerm.value.trim()) {
		const search = searchTerm.value.toLowerCase().trim()
		items = items.filter(item => 
			item.item_name.toLowerCase().includes(search) ||
			item.item_code.toLowerCase().includes(search)
		)
	}
	
	// Apply category filter
	if (selectedCategory.value && selectedCategory.value !== "All") {
		items = items.filter(item => 
			item.item_group === selectedCategory.value
		)
	}
	
	return items
})

// Methods
function formatCurrency(amount) {
	return formatCurrencyUtil(Number.parseFloat(amount || 0), props.currency)
}

function handleItemClick(item) {
	emit("item-selected", item)
}

function selectCategory(category) {
	selectedCategory.value = category.name
}

// Watchers
watch(
	() => props.posProfile,
	(newProfile) => {
		if (newProfile) {
			itemStore.setPosProfile(newProfile)
		}
	},
	{ immediate: true }
)

watch(
	() => props.cartItems,
	(newItems) => {
		itemStore.setCartItems(newItems)
	},
	{ immediate: true, deep: true }
)

// Lifecycle
onMounted(() => {
	// Items are loaded automatically by the store when posProfile is set
})

// Expose methods
defineExpose({
	loadItems: () => itemStore.loadAllItems(props.posProfile),
})
</script>

<style scoped>
/* Custom scrollbar for category bar */
.overflow-x-auto::-webkit-scrollbar {
	height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
	background: #1f2937;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
	background: #4b5563;
	border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
	background: #6b7280;
}
</style>

