<template>
	<div class="flex flex-col h-full" style="background: linear-gradient(180deg, #e5e7eb 0%, #d1d5db 100%);">
		<!-- Table Number Display -->
		<div class="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-3 text-center border-b-4 border-blue-700">
			<div class="flex items-center justify-between px-4">
				<div class="text-4xl font-bold">{{ grandTotal > 0 ? formatCurrency(grandTotal) : '0' }}</div>
				<div class="text-right">
					<div class="text-3xl font-bold">NO {{ tableNumber }}</div>
					<div class="text-xs opacity-90">{{ __('Table') }}</div>
				</div>
			</div>
		</div>

		<!-- Top Control Buttons Grid - 2 rows x 4 columns (Touch-Optimized) -->
		<div class="grid grid-cols-4 gap-2 p-2 bg-gray-800">
			<!-- First Row -->
			<button class="header-btn-intouch secondary text-sm py-3 min-h-[56px]">{{ __('Tables') }}</button>
			<button class="header-btn-intouch primary text-sm py-3 min-h-[56px]">{{ __('Delivery') }}</button>
			<button class="header-btn-intouch primary text-sm py-3 min-h-[56px]">{{ __('Hall') }}</button>
			<button class="header-btn-intouch light text-sm py-3 min-h-[56px]">{{ __('Take Away') }}</button>
			
			<!-- Second Row -->
			<button @click="$emit('show-history')" class="header-btn-intouch secondary text-sm py-3 min-h-[56px]">{{ __('Daily Orders') }}</button>
			<button class="header-btn-intouch secondary text-sm py-3 min-h-[56px]">{{ __('Tools') }}</button>
			<button @click="$emit('close-shift')" class="header-btn-intouch danger text-sm py-3 min-h-[56px]">{{ __('إغلاق الورديه') }}</button>
			<button @click="$emit('logout')" class="header-btn-intouch danger text-sm py-3 min-h-[56px]">{{ __('خروج') }}</button>
		</div>

		<!-- End Bill Button - Touch Optimized (56px height) -->
		<div class="px-2 pb-2 bg-gray-800">
			<button 
				@click="$emit('proceed-to-payment')" 
				:disabled="items.length === 0"
				class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg min-h-[56px]"
			>
				{{ __('End Bill') }}
			</button>
		</div>

		<!-- Circular Control Buttons - Touch Optimized (80px) -->
		<div class="flex justify-around px-3 py-4 bg-gray-700 border-y-2 border-gray-600 gap-2">
			<button 
				@click="$emit('save-draft')" 
				class="ctrl-btn-intouch hold" 
				:title="__('Hold Order')"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
				</svg>
				<span class="text-xs font-bold">HOLD</span>
			</button>
			<button 
				@click="quickDecrement" 
				class="ctrl-btn-intouch danger" 
				:title="__('Decrease Quantity')"
				:disabled="!selectedCartItem"
			>
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"/>
				</svg>
			</button>
			<button 
				@click="quickIncrement" 
				class="ctrl-btn-intouch danger" 
				:title="__('Increase Quantity')"
				:disabled="!selectedCartItem"
			>
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/>
				</svg>
			</button>
			<button 
				@click="removeSelectedItem" 
				class="ctrl-btn-intouch danger" 
				:title="__('Remove Item')"
				:disabled="!selectedCartItem"
			>
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>
		</div>

		<!-- Selected Item Display - Blue Background -->
		<div class="bg-gradient-to-r from-sky-500 to-blue-600 p-4 text-white border-b-2 border-blue-700">
			<div v-if="selectedCartItem" class="text-center">
				<div class="text-5xl font-bold mb-2">{{ selectedCartItem.quantity }}</div>
				<div class="text-xl font-bold mb-2 px-2 truncate">{{ selectedCartItem.item_name }}</div>
				<div class="flex justify-between px-8 text-lg font-semibold">
					<span>{{ formatCurrency(selectedCartItem.rate) }}</span>
					<span>{{ formatCurrency(selectedCartItem.amount) }}</span>
				</div>
				<div v-if="selectedCartItem.comment" class="text-sm text-yellow-200 mt-2 italic truncate px-4">
					{{ selectedCartItem.comment }}
				</div>
			</div>
			<div v-else class="text-center text-2xl font-bold py-4">
				{{ __('Select an Item') }}
			</div>
		</div>

		<!-- Cart Items List with Navigation -->
		<div class="flex-1 overflow-y-auto bg-white relative min-h-0">
			<!-- Navigation Arrows -->
			<div v-if="items.length > 0" class="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-center gap-3 z-10 pointer-events-none">
				<button 
					@click="navigatePrevious" 
					class="w-10 h-14 bg-blue-600/90 hover:bg-blue-700 text-white rounded-r-lg pointer-events-auto flex items-center justify-center shadow-lg active:bg-blue-800 transition-all"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"/>
					</svg>
				</button>
				<button 
					@click="navigateNext" 
					class="w-10 h-14 bg-blue-600/90 hover:bg-blue-700 text-white rounded-r-lg pointer-events-auto flex items-center justify-center shadow-lg active:bg-blue-800 transition-all"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/>
					</svg>
				</button>
			</div>

			<!-- Items Table -->
			<table class="w-full text-sm">
				<thead class="bg-gradient-to-r from-sky-500 to-blue-600 text-white sticky top-0 z-0">
					<tr>
						<th class="p-3 text-center font-bold text-base w-16">{{ __('#') }}</th>
						<th class="p-3 text-start font-bold text-base">{{ __('Item Name') }}</th>
						<th class="p-3 text-center font-bold text-base w-20">{{ __('Qty') }}</th>
						<th class="p-3 text-end font-bold text-base w-28">{{ __('Total') }}</th>
					</tr>
				</thead>
				<tbody>
					<tr 
						v-for="(item, index) in items" 
						:key="index" 
						@click="selectCartItem(index)"
						:class="[
							'border-b border-gray-200 cursor-pointer transition-colors',
							selectedItemIndex === index ? 'bg-blue-100' : 'hover:bg-gray-50'
						]"
					>
						<td class="p-3 text-center font-bold text-gray-600">{{ index + 1 }}</td>
						<td class="p-3">
							<div class="font-semibold text-gray-900">{{ item.item_name }}</div>
							<div v-if="item.comment" class="text-xs text-gray-500 italic mt-1">
								{{ item.comment }}
							</div>
						</td>
						<td class="p-3 text-center font-bold text-lg text-blue-600">{{ item.quantity }}</td>
						<td class="p-3 text-end font-bold text-lg text-gray-900">{{ formatCurrency(item.amount) }}</td>
					</tr>
					<tr v-if="items.length === 0">
						<td colspan="4" class="p-8 text-center text-gray-400 text-base">
							{{ __('No items in cart') }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Totals Section -->
		<div class="bg-white border-t-2 border-gray-200 p-3">
			<div class="grid grid-cols-3 gap-2 text-sm font-semibold mb-2">
				<div class="text-center">
					<div class="text-gray-500 text-xs mb-1">{{ __('Subtotal') }}</div>
					<div class="text-blue-600 font-bold">{{ formatCurrency(subtotal) }}</div>
				</div>
				<div class="text-center">
					<div class="text-gray-500 text-xs mb-1">{{ __('Tax') }}</div>
					<div class="text-blue-600 font-bold">{{ formatCurrency(taxAmount) }}</div>
				</div>
				<div class="text-center">
					<div class="text-gray-500 text-xs mb-1">{{ __('Discount') }}</div>
					<div class="text-blue-600 font-bold">{{ formatCurrency(discountAmount) }}</div>
				</div>
			</div>
			<div class="flex justify-between items-center font-bold text-xl text-blue-700 border-t border-gray-200 pt-2">
				<span>{{ __('Grand Total') }}</span>
				<span class="text-2xl">{{ formatCurrency(grandTotal) }}</span>
			</div>
		</div>

		<!-- Numpad -->
		<div class="bg-gray-800 p-3 pb-4">
			<POSNumpad v-model="keypadValue" @enter="handleKeypadEnter" />
		</div>

		<!-- Comment Dialog -->
		<Dialog v-model="showCommentDialog" :options="{ title: __('Add Comment'), size: 'sm' }">
			<template #body-content>
				<div class="p-4">
					<p class="text-sm text-gray-600 mb-3">{{ __('Add a note for the kitchen or customer.') }}</p>
					<input 
						ref="commentInputRef"
						v-model="commentText" 
						type="text" 
						class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-base" 
						:placeholder="__('Enter comment...')" 
						@keydown.enter="saveComment" 
					/>
				</div>
			</template>
			<template #actions>
				<div class="flex gap-2 w-full">
					<Button variant="subtle" class="flex-1" @click="showCommentDialog = false">{{ __('Cancel') }}</Button>
					<Button variant="solid" class="flex-1" @click="saveComment">{{ __('Save') }}</Button>
				</div>
			</template>
		</Dialog>

		<!-- Edit Item Dialog (Hidden but functional) -->
		<EditItemDialog
			v-model="showEditDialog"
			:item="selectedItem"
			:warehouses="warehouses"
			:currency="currency"
			@update-item="handleUpdateItem"
		/>
	</div>
</template>

<script setup>
import { usePOSCartStore } from "@/stores/posCart"
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency"
import { createResource, Dialog, Button } from "frappe-ui"
import { computed, ref, watch, nextTick } from "vue"
import EditItemDialog from "./EditItemDialog.vue"
import POSNumpad from "@/components/pos/POSNumpad.vue"
import { useToast } from "@/composables/useToast"

// Use Pinia store
const cartStore = usePOSCartStore()
const { showWarning } = useToast()

const props = defineProps({
	items: {
		type: Array,
		default: () => [],
	},
	customer: Object,
	subtotal: {
		type: Number,
		default: 0,
	},
	taxAmount: {
		type: Number,
		default: 0,
	},
	discountAmount: {
		type: Number,
		default: 0,
	},
	grandTotal: {
		type: Number,
		default: 0,
	},
	posProfile: String,
	currency: {
		type: String,
		default: "USD",
	},
	appliedOffers: {
		type: Array,
		default: () => [],
	},
	warehouses: {
		type: Array,
		default: () => [],
	},
	tableNumber: {
		type: [String, Number],
		default: 1,
	},
})

const emit = defineEmits([
	"update-quantity",
	"remove-item",
	"select-customer",
	"create-customer",
	"proceed-to-payment",
	"clear-cart",
	"save-draft",
	"apply-coupon",
	"show-coupons",
	"show-offers",
	"remove-offer",
	"update-uom",
	"edit-item",
	"view-shift",
	"show-drafts",
	"show-history",
	"show-return",
	"close-shift",
])

// State
const selectedItemIndex = ref(-1)
const keypadValue = ref("")
const showCommentDialog = ref(false)
const commentText = ref("")
const commentInputRef = ref(null)
const showEditDialog = ref(false)
const selectedItem = ref(null)

// Computed
const selectedCartItem = computed(() => {
	if (selectedItemIndex.value < 0 || selectedItemIndex.value >= props.items.length) {
		return null
	}
	return props.items[selectedItemIndex.value]
})

// Watchers
watch(
	() => props.items.length,
	(length) => {
		if (length === 0) {
			selectedItemIndex.value = -1
			keypadValue.value = ""
		} else if (selectedItemIndex.value >= length) {
			selectedItemIndex.value = length - 1
		} else if (length > 0 && selectedItemIndex.value === -1) {
			// Auto select last item when added
			selectedItemIndex.value = length - 1
		}
	},
)

watch(selectedItemIndex, () => {
	keypadValue.value = ""
})

// Methods
function formatCurrency(amount) {
	return formatCurrencyUtil(Number.parseFloat(amount || 0), props.currency)
}

function selectCartItem(index) {
	selectedItemIndex.value = index
}

function ensureSelection() {
	if (!selectedCartItem.value) {
		showWarning(__('Please select an item from the cart first'))
		return false
	}
	return true
}

function getSmartStep(quantity) {
	if (quantity === Math.floor(quantity)) return 1
	const rounded = Math.round(quantity * 10000) / 10000
	if (Math.abs((rounded % 0.5)) < 0.0001) return 0.5
	if (Math.abs((rounded % 0.25)) < 0.0001) return 0.25
	if (Math.abs((rounded % 0.1)) < 0.0001) return 0.1
	return 0.01
}

function quickIncrement() {
	if (!ensureSelection()) return
	const item = selectedCartItem.value
	const step = getSmartStep(item.quantity)
	const newQty = Math.round((item.quantity + step) * 10000) / 10000
	emit("update-quantity", item.item_code, newQty)
}

function quickDecrement() {
	if (!ensureSelection()) return
	const item = selectedCartItem.value
	const step = getSmartStep(item.quantity)
	const newQty = Math.round((item.quantity - step) * 10000) / 10000

	if (newQty <= 0) {
		emit("remove-item", item.item_code)
	} else {
		emit("update-quantity", item.item_code, newQty)
	}
}

function removeSelectedItem() {
	if (!ensureSelection()) return
	emit("remove-item", selectedCartItem.value.item_code)
}

function navigatePrevious() {
	if (selectedItemIndex.value > 0) {
		selectedItemIndex.value--
	}
}

function navigateNext() {
	if (selectedItemIndex.value < props.items.length - 1) {
		selectedItemIndex.value++
	}
}

function handleKeypadEnter() {
	if (!selectedCartItem.value) {
		showWarning(__('Please select an item first'))
		return
	}

	const numValue = Number.parseFloat(keypadValue.value)
	if (!Number.isNaN(numValue) && numValue > 0) {
		emit("update-quantity", selectedCartItem.value.item_code, numValue)
		keypadValue.value = ""
	}
}

function openCommentDialog() {
	if (!ensureSelection()) return
	commentText.value = selectedCartItem.value.comment || ""
	showCommentDialog.value = true
	nextTick(() => {
		commentInputRef.value?.focus()
	})
}

function saveComment() {
	if (!selectedCartItem.value) return
	
	const updatedItem = {
		...selectedCartItem.value,
		comment: commentText.value.trim()
	}
	
	emit("edit-item", updatedItem)
	showCommentDialog.value = false
	commentText.value = ""
}

function handleUpdateItem(updatedItem) {
	emit("edit-item", updatedItem)
	showEditDialog.value = false
}
</script>

<style scoped>
/* Ensure smooth scrolling for cart items */
.overflow-y-auto {
	-webkit-overflow-scrolling: touch;
	scroll-behavior: smooth;
}

/* Table styling */
table {
	border-collapse: separate;
	border-spacing: 0;
}

/* Zebra striping for better readability */
tbody tr:nth-child(even):not(:hover):not(.bg-blue-100) {
	background-color: #f9fafb;
}
</style>

