<template>
	<div class="flex flex-col h-full bg-gradient-to-b from-gray-200 to-gray-300">
		<!-- 1. Circular Control Buttons Row -->
		<div class="flex justify-around items-center px-3 py-3 bg-gray-200 gap-3 flex-shrink-0">
			<button 
				@click="$emit('save-draft')" 
				class="circular-btn hold"
			>
				<span class="text-sm font-bold">HOLD</span>
			</button>
			<button 
				@click="quickDecrement" 
				class="circular-btn danger"
			>
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/>
				</svg>
			</button>
			<button 
				@click="quickIncrement" 
				class="circular-btn danger"
			>
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
				</svg>
			</button>
			<button 
				@click="removeSelectedItem" 
				class="circular-btn danger"
			>
				<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>
		</div>

		<!-- 2. Customer Selection Bar (replaces search) -->
		<div class="px-2 py-2 bg-gray-200 flex-shrink-0">
			<button
				@click="$emit('select-customer')"
				class="w-full px-4 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-400 rounded-lg transition-colors flex items-center justify-between touch-manipulation"
			>
				<div class="flex items-center gap-3">
					<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
					<div class="text-left flex-1">
						<div class="text-base font-bold text-gray-900">
							{{ customerName }}
						</div>
						<div v-if="customerMobile" class="text-xs text-gray-500">
							{{ customerMobile }}
						</div>
					</div>
				</div>
				<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		</div>

		<!-- 3. Header: Total and Table Number -->
		<div class="bg-gradient-to-r from-blue-500 to-blue-600 p-2 flex items-center justify-between border-y-4 border-blue-700 flex-shrink-0">
			<div class="text-white">
				<div class="text-3xl font-bold">{{ formatCurrency(grandTotal) }}</div>
			</div>
			<div class="text-white text-right">
				<div class="text-3xl font-bold">NO {{ currentTableNumber }}</div>
			</div>
		</div>

		<!-- 4. Cart Items List -->
		<div class="flex-1 overflow-y-auto bg-white min-h-0 border-b-2 border-gray-300">
			<table class="w-full text-sm border-collapse">
				<thead class="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10">
					<tr>
						<th class="p-2 text-center w-14 border-r border-blue-400">{{ __('الكمية') }}</th>
						<th class="p-2 text-right border-r border-blue-400">{{ __('اسم الصنف') }}</th>
						<th class="p-2 text-center w-20 border-r border-blue-400">{{ __('السعر') }}</th>
						<th class="p-2 text-center w-20 border-r border-blue-400">{{ __('الإجمالي') }}</th>
						<th class="p-2 text-center w-10">
							<input type="checkbox" class="w-4 h-4" disabled />
						</th>
					</tr>
				</thead>
				<tbody>
					<tr 
						v-for="(item, index) in items" 
						:key="item.row_id || index"
						@click="selectCartItem(index)"
						:class="[
							'border-b-2 border-gray-200 cursor-pointer transition-all',
							selectedItemIndex === index ? 'bg-blue-100 border-blue-300' : 'hover:bg-blue-50'
						]"
					>
						<!-- Quantity -->
						<td class="p-2 text-center border-r border-gray-200 align-middle">
							<div class="text-xl font-bold text-blue-600">{{ item.quantity }}</div>
						</td>

						<!-- Item Name & Comment -->
						<td class="p-2 text-right border-r border-gray-200 align-middle">
							<div :class="[
								'font-bold text-sm',
								item.discount_percentage > 0 ? 'text-red-600' : 'text-blue-600'
							]">
								{{ item.item_name }}
							</div>
							<div v-if="item.comment && item.display_comment_in_ui !== false" class="text-xs text-red-500 font-bold mt-1">
								{{ item.comment }}
							</div>
						</td>

						<!-- Unit Price (السعر) -->
						<td class="p-2 text-center border-r border-gray-200 align-middle">
							<div :class="[
								'font-bold text-sm',
								item.discount_percentage > 0 ? 'text-red-600' : 'text-blue-600'
							]">
								{{ formatCurrency(item.rate || item.price_list_rate || 0) }}
							</div>
						</td>

						<!-- Total Amount (الإجمالي) -->
						<td class="p-2 text-center border-r border-gray-200 align-middle">
							<div :class="[
								'font-bold text-base',
								item.discount_percentage > 0 ? 'text-red-600' : 'text-blue-600'
							]">
								{{ formatCurrency(item.amount) }}
							</div>
						</td>

						<!-- Checkbox -->
						<td class="p-2 text-center align-middle">
							<input 
								type="checkbox" 
								:checked="selectedItemIndex === index"
								@change.stop="selectCartItem(index)"
								class="custom-checkbox"
								:class="item.discount_percentage > 0 ? 'checkbox-red' : 'checkbox-green'"
							/>
						</td>
					</tr>
					<tr v-if="items.length === 0">
						<td colspan="5" class="p-10 text-center text-gray-400">
							{{ __('لا توجد أصناف') }}
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- 5. Totals Section -->
		<div class="bg-white border-t-2 border-gray-300 px-2 py-1 flex-shrink-0">
			<div class="grid grid-cols-3 gap-1 text-[10px] sm:text-xs">
				<div class="text-center">
					<div class="text-gray-600">{{ __('الاجمالي') }}</div>
					<div class="text-blue-600 font-bold">{{ formatCurrency(subtotal) }}</div>
				</div>
				<div class="text-center">
					<div class="text-gray-600">{{ __('الضريبة') }}</div>
					<div class="text-blue-600 font-bold">{{ formatCurrency(taxAmount) }}</div>
				</div>
				<div class="text-center">
					<div class="text-gray-600">{{ __('الخصم') }}</div>
					<div class="text-blue-600 font-bold">{{ formatCurrency(discountAmount) }}</div>
				</div>
			</div>
		</div>

		<!-- 6. Numpad Container - Fixed Height to Prevent Hugeness -->
		<div class="flex-shrink-0 h-64 border-t border-gray-400">
			<POSNumpad 
				v-model="keypadValue" 
				@enter="handleKeypadEnter"
				@number-click="handleNumberClick"
			/>
		</div>

		<!-- Dialogs -->
		<Dialog v-model="showCommentDialog" :options="{ title: __('Comment'), size: 'lg' }">
			<template #body-content>
				<div class="p-4">
					<!-- Header -->
					<p class="text-sm text-gray-600 mb-3 text-center">{{ __('اضغط انتر لحفظ التعليق') }}</p>
					
					<!-- Input Field -->
					<input 
						ref="commentInputRef"
						v-model="commentText" 
						type="text" 
						class="w-full border-2 border-gray-300 rounded-lg p-3 text-lg mb-4 focus:border-blue-500 focus:outline-none" 
						:placeholder="__('اكتب التعليق هنا...')"
						@keydown.enter="saveComment" 
					/>
					
					<!-- Quick Comments Grid -->
					<div v-if="savedComments.length > 0" class="mb-4">
						<p class="text-xs text-gray-500 mb-2">{{ __('التعليقات المحفوظة:') }}</p>
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
							<button
								v-for="(comment, idx) in savedComments"
								:key="idx"
								@click="selectQuickComment(comment)"
								class="quick-comment-btn"
							>
								{{ comment }}
							</button>
						</div>
					</div>
					
					<!-- Empty State for Quick Comments -->
					<div v-else class="text-center text-gray-400 text-sm py-4 border-2 border-dashed border-gray-200 rounded-lg mb-4">
						{{ __('لا توجد تعليقات محفوظة بعد') }}
					</div>
				</div>
			</template>
			<template #actions>
				<div class="flex gap-2 w-full">
					<Button variant="subtle" theme="red" class="flex-1" @click="showCommentDialog = false">{{ __('خروج') }}</Button>
					<Button variant="solid" class="flex-1" @click="saveComment">{{ __('حفظ') }}</Button>
					<Button variant="solid" theme="blue" class="flex-1" @click="saveCommentToInvoiceOnly">{{ __('حفظ في الفاتورة فقط') }}</Button>
				</div>
			</template>
		</Dialog>

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
import { useItemSearchStore } from "@/stores/itemSearch"
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency"
import { createResource, Dialog, Button } from "frappe-ui"
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from "vue"
import { storeToRefs } from "pinia"
import EditItemDialog from "./EditItemDialog.vue"
import POSNumpad from "@/components/pos/POSNumpad.vue"
import { useToast } from "@/composables/useToast"

// Use Pinia store
const cartStore = usePOSCartStore()
const itemStore = useItemSearchStore()
const { searchTerm } = storeToRefs(itemStore)
const { showWarning, showSuccess } = useToast()

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
const currentTableNumber = ref(1)

// Saved Quick Comments - Load from localStorage
const COMMENTS_STORAGE_KEY = 'pos_quick_comments'
const savedComments = ref([])

// Load saved comments on mount
onMounted(() => {
	// Clear old default comments and start fresh
	const VERSION_KEY = 'pos_comments_version'
	const CURRENT_VERSION = '2'
	
	if (localStorage.getItem(VERSION_KEY) !== CURRENT_VERSION) {
		// Clear old comments and set new version
		localStorage.removeItem(COMMENTS_STORAGE_KEY)
		localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
	}
	
	loadSavedComments()
})

function loadSavedComments() {
	try {
		const stored = localStorage.getItem(COMMENTS_STORAGE_KEY)
		if (stored) {
			savedComments.value = JSON.parse(stored)
		} else {
			// Start with empty list - user will add their own comments
			savedComments.value = []
		}
	} catch (e) {
		console.error('Error loading saved comments:', e)
		savedComments.value = []
	}
}

function saveSavedComments() {
	try {
		localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(savedComments.value))
	} catch (e) {
		console.error('Error saving comments:', e)
	}
}

function addToSavedComments(comment) {
	if (comment && !savedComments.value.includes(comment)) {
		savedComments.value.unshift(comment)
		// Keep max 20 comments
		if (savedComments.value.length > 20) {
			savedComments.value = savedComments.value.slice(0, 20)
		}
		saveSavedComments()
	}
}

function selectQuickComment(comment) {
	commentText.value = comment
}

// Computed
const selectedCartItem = computed(() => {
	if (selectedItemIndex.value < 0 || selectedItemIndex.value >= props.items.length) {
		return null
	}
	return props.items[selectedItemIndex.value]
})

const customerName = computed(() => {
	if (!props.customer) {
		return __('Walk-In Customer')
	}
	// Try different possible field names
	return props.customer.customer_name || props.customer.name || props.customer.customer || __('Walk-In Customer')
})

const customerMobile = computed(() => {
	if (!props.customer) {
		return null
	}
	return props.customer.mobile_no || props.customer.mobile || props.customer.phone || null
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
	// Don't clear keypad value when selecting item
	// keypadValue.value = ""
})

// Methods
function formatCurrency(amount) {
	return formatCurrencyUtil(Number.parseFloat(amount || 0), props.currency)
}

function handleSearchInput(event) {
	itemStore.setSearchTerm(event.target.value)
}

function selectCartItem(index) {
	selectedItemIndex.value = index
}

function ensureSelection() {
	if (!selectedCartItem.value) {
		showWarning(__('الرجاء اختيار صنف من القائمة أولاً'))
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
	emit("update-quantity", item.row_id || item.item_code, newQty)
}

function quickDecrement() {
	if (!ensureSelection()) return
	const item = selectedCartItem.value
	const step = getSmartStep(item.quantity)
	const newQty = Math.round((item.quantity - step) * 10000) / 10000

	if (newQty <= 0) {
		emit("remove-item", item.row_id || item.item_code)
	} else {
		emit("update-quantity", item.row_id || item.item_code, newQty)
	}
}

function removeSelectedItem() {
	if (!ensureSelection()) return
	emit("remove-item", selectedCartItem.value.row_id || selectedCartItem.value.item_code)
}

function handleNumberClick(number) {
	// This is called when user clicks a number button
	// The keypadValue is already updated by v-model
}

function handleKeypadEnter() {
	if (!selectedCartItem.value) {
		showWarning(__('الرجاء اختيار صنف من القائمة أولاً'))
		return
	}

	const numValue = Number.parseFloat(keypadValue.value)
	if (!Number.isNaN(numValue) && numValue > 0) {
		emit("update-quantity", selectedCartItem.value.row_id || selectedCartItem.value.item_code, numValue)
		keypadValue.value = ""
		showSuccess(__('تم تحديث الكمية إلى {0}', [numValue]))
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
	
	const trimmedComment = commentText.value.trim()
	
	// Save to quick comments list for future use
	if (trimmedComment) {
		addToSavedComments(trimmedComment)
	}
	
	const updatedItem = {
		...selectedCartItem.value,
		comment: trimmedComment,
		display_comment_in_ui: true
	}
	
	emit("edit-item", updatedItem)
	showCommentDialog.value = false
	commentText.value = ""
	showSuccess(__('تم حفظ التعليق'))
}

function saveCommentToInvoiceOnly() {
	if (!selectedCartItem.value) return
	
	const trimmedComment = commentText.value.trim()
	
	// Don't save to quick comments list - only apply to this invoice
	const updatedItem = {
		...selectedCartItem.value,
		comment: trimmedComment,
		display_comment_in_ui: false
	}
	
	emit("edit-item", updatedItem)
	showCommentDialog.value = false
	commentText.value = ""
	showSuccess(__('تم حفظ التعليق في الفاتورة فقط'))
}

function handleUpdateItem(updatedItem) {
	emit("edit-item", updatedItem)
	showEditDialog.value = false
}

// Expose keypadValue to parent for item selection
defineExpose({
	keypadValue,
	clearKeypad: () => { keypadValue.value = "" },
    removeSelectedItem,
    handleKeypadEnter,
    openCommentDialog,
    triggerAdd: () => {
        // Trigger add from search bar if text exists, or manual add
        const searchInput = document.getElementById('invoice-item-search')
        if (searchInput && searchInput.value) {
            // Let handleSearchInput and watchers handle it? 
            // Or if enter was pressed.
            // We need to simulate search/barcode scan if there is text
        }
    }
})
</script>

<style scoped>
/* Header Buttons */
.pos-header-btn {
	padding: 0.625rem 0.5rem;
	border-radius: 0.375rem;
	font-weight: 600;
	font-size: 0.8rem;
	transition: all 0.2s;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	border: 2px solid transparent;
}

.pos-header-btn.primary {
	background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
	color: white;
	border-color: #0369a1;
}

.pos-header-btn.primary:hover {
	background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
}

.pos-header-btn.secondary {
	background: linear-gradient(135deg, #64748b 0%, #475569 100%);
	color: white;
	border-color: #334155;
}

.pos-header-btn.secondary:hover {
	background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.pos-header-btn.light {
	background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
	color: #1f2937;
	border-color: #9ca3af;
}

.pos-header-btn.light:hover {
	background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
}

.pos-header-btn.danger {
	background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	color: white;
	border-color: #b91c1c;
}

.pos-header-btn.danger:hover {
	background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.pos-header-btn:active {
	transform: scale(0.97);
}

/* Add/Remove Buttons */
.add-remove-btn {
	padding: 0.75rem;
	border-radius: 0.5rem;
	font-weight: bold;
	font-size: 0.95rem;
	transition: all 0.2s;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
	border: 2px solid transparent;
}

.add-remove-btn.remove {
	background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	color: white;
	border-color: #b91c1c;
}

.add-remove-btn.remove:hover {
	background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

.add-remove-btn.add {
	background: linear-gradient(135deg, #10b981 0%, #059669 100%);
	color: white;
	border-color: #047857;
}

.add-remove-btn.add:hover {
	background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

.add-remove-btn:active {
	transform: scale(0.97);
}

/* Circular Buttons */
.circular-btn {
	width: 4.5rem;
	height: 4.5rem;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
	transition: all 0.2s;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
	border: 3px solid transparent;
	cursor: pointer;
}

.circular-btn.hold {
	background: linear-gradient(135deg, #10b981 0%, #059669 100%);
	color: white;
	border-color: #047857;
}

.circular-btn.hold:hover {
	background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
	transform: scale(1.05);
}

.circular-btn.danger {
	background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	color: white;
	border-color: #b91c1c;
}

.circular-btn.danger:hover {
	background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
	transform: scale(1.05);
}

.circular-btn:active {
	transform: scale(0.95);
}

/* Custom Checkboxes */
.custom-checkbox {
	width: 1.5rem;
	height: 1.5rem;
	border-radius: 0.25rem;
	cursor: pointer;
	appearance: none;
	-webkit-appearance: none;
	position: relative;
	transition: all 0.2s;
}

.checkbox-green {
	border: 3px solid #10b981;
}

.checkbox-green:checked {
	background: #10b981;
}

.checkbox-red {
	border: 3px solid #ef4444;
}

.checkbox-red:checked {
	background: #ef4444;
}

.custom-checkbox:checked::after {
	content: '✓';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: white;
	font-size: 1rem;
	font-weight: bold;
}

/* Keypad Container with Dark Background - EXTRA LARGE FIXED HEIGHT */
.keypad-container-large {
	background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
	padding: 0.5rem;
	flex-shrink: 0;
	min-height: 480px;
	max-height: 480px;
	border-top: 3px solid #334155;
}

/* Table Styling */
table {
	border-collapse: separate;
	border-spacing: 0;
}

tbody tr:nth-child(even):not(:hover):not(.bg-blue-100) {
	background-color: #f9fafb;
}

.overflow-y-auto {
	-webkit-overflow-scrolling: touch;
	scroll-behavior: smooth;
}

/* Quick Comment Buttons */
.quick-comment-btn {
	background: white;
	border: 2px solid #e5e7eb;
	border-radius: 0.5rem;
	padding: 0.75rem 1rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: #374151;
	cursor: pointer;
	transition: all 0.2s;
	text-align: center;
	min-height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.quick-comment-btn:hover {
	background: #f3f4f6;
	border-color: #3b82f6;
	color: #3b82f6;
}

.quick-comment-btn:active {
	background: #3b82f6;
	color: white;
	transform: scale(0.98);
}

/* Scrollbar Styling */
.overflow-y-auto::-webkit-scrollbar {
	width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
	background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
	background: #94a3b8;
	border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
	background: #64748b;
}
</style>
