<template>
	<AppShell
		:initial-theme="theme"
		:initial-direction="direction"
		@search="handleSearch"
		@theme-change="handleThemeChange"
		@direction-change="handleDirectionChange"
		@toggle-user-menu="showUserMenu = true"
	>
		<!-- Brand Slot -->
		<template #brand>
			<div class="flex items-center gap-2">
				<div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
					POS
				</div>
				<span class="font-bold text-xl">{{ posProfile }}</span>
			</div>
		</template>

		<!-- Status Badges -->
		<template #status-badges>
			<StatusBadges
				:is-online="!isOffline"
				:is-syncing="isSyncing"
				:pending-count="pendingInvoicesCount"
				:printer-connected="printerConnected"
				@show-pending="showPendingInvoices"
				@printer-click="showPrinterDialog = true"
			/>
		</template>

		<!-- Catalog -->
		<template #catalog>
			<Catalog
				:products="products"
				:categories="categories"
				:search-query="searchQuery"
				:loading="loadingProducts"
				@product-click="handleProductClick"
				@product-long-press="handleProductLongPress"
				@category-change="handleCategoryChange"
			/>
		</template>

		<!-- Cart -->
		<template #cart>
			<Cart
				:items="cartItems"
				:customer="selectedCustomer"
				:subtotal="calculations.subtotal"
				:discount="calculations.discount"
				:tax="calculations.tax"
				:tax-rate="taxRate"
				:total="calculations.total"
				:amount-paid="amountPaid"
				:show-keypad="showKeypad"
				@select-customer="showCustomerDialog = true"
				@increase-item="increaseItemQuantity"
				@decrease-item="decreaseItemQuantity"
				@remove-item="removeCartItem"
				@edit-item="editCartItem"
				@clear-cart="clearCart"
				@edit-discount="showDiscountDialog = true"
				@hold="holdOrder"
				@add-note="showNoteDialog = true"
				@keypad-enter="handleKeypadEnter"
				@keypad-operation="handleKeypadOperation"
			/>
		</template>

		<!-- Checkout Bar -->
		<template #checkout-bar>
			<CheckoutBar
				:total="calculations.total"
				:subtotal="calculations.subtotal"
				:discount="calculations.discount"
				:can-checkout="canCheckout"
				:can-save-draft="canSaveDraft"
				:processing="processingPayment"
				:payment-methods="paymentMethods"
				:selected-payment-method="selectedPaymentMethod"
				:checkout-label="checkoutLabel"
				@checkout="handleCheckout"
				@save-draft="saveDraft"
				@select-payment-method="selectPaymentMethod"
			/>
		</template>
	</AppShell>

	<!-- Modals -->
	
	<!-- Product Modifiers Dialog -->
	<Dialog
		v-model="showModifiersDialog"
		:title="__('Customize Item')"
		@confirm="confirmModifiers"
		@close="showModifiersDialog = false"
	>
		<div class="space-y-4">
			<div v-if="selectedProduct">
				<h3 class="font-semibold text-lg mb-2">{{ selectedProduct.name }}</h3>
				
				<!-- Quantity -->
				<div class="mb-4">
					<label class="block text-sm font-medium mb-2">{{ __('Quantity') }}</label>
					<div class="flex items-center gap-3">
						<button @click="modifierQuantity--" class="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700">-</button>
						<input v-model.number="modifierQuantity" type="number" class="w-20 h-12 text-center border border-gray-300 rounded-lg"/>
						<button @click="modifierQuantity++" class="w-12 h-12 rounded-full bg-blue-500 text-white">+</button>
					</div>
				</div>

				<!-- Notes -->
				<div>
					<label class="block text-sm font-medium mb-2">{{ __('Notes') }}</label>
					<textarea
						v-model="modifierNotes"
						class="w-full h-24 p-3 border border-gray-300 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
						:placeholder="__('Add special instructions...')"
					></textarea>
				</div>
			</div>
		</div>
	</Dialog>

	<!-- Discount Dialog -->
	<Dialog
		v-model="showDiscountDialog"
		:title="__('Apply Discount')"
		@confirm="applyDiscount"
		@close="showDiscountDialog = false"
	>
		<div class="space-y-4">
			<!-- Discount Type -->
			<div class="flex gap-2">
				<button
					@click="discountType = 'percentage'"
					class="flex-1 h-12 rounded-lg transition-all"
					:class="discountType === 'percentage' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-slate-700'"
				>
					{{ __('Percentage') }}
				</button>
				<button
					@click="discountType = 'amount'"
					class="flex-1 h-12 rounded-lg transition-all"
					:class="discountType === 'amount' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-slate-700'"
				>
					{{ __('Amount') }}
				</button>
			</div>

			<!-- Discount Value -->
			<div>
				<label class="block text-sm font-medium mb-2">
					{{ discountType === 'percentage' ? __('Discount %') : __('Discount Amount') }}
				</label>
				<input
					v-model.number="discountValue"
					type="number"
					class="w-full h-14 px-4 text-2xl font-bold text-center border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
					:max="discountType === 'percentage' ? 100 : calculations.subtotal"
					min="0"
				/>
			</div>
		</div>
	</Dialog>

	<!-- Customer Dialog -->
	<Dialog
		v-model="showCustomerDialog"
		:title="__('Select Customer')"
		@close="showCustomerDialog = false"
	>
		<div class="space-y-2">
			<input
				v-model="customerSearch"
				type="text"
				:placeholder="__('Search customer...')"
				class="w-full h-12 px-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
			<div class="max-h-96 overflow-y-auto space-y-1">
				<button
					v-for="customer in filteredCustomers"
					:key="customer.id"
					@click="selectCustomer(customer)"
					class="w-full p-4 text-left rtl:text-right rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
				>
					<div class="font-semibold">{{ customer.name }}</div>
					<div class="text-sm text-gray-500">{{ customer.phone }}</div>
				</button>
			</div>
		</div>
	</Dialog>

	<!-- Note Dialog -->
	<Dialog
		v-model="showNoteDialog"
		:title="__('Add Note')"
		@confirm="saveNote"
		@close="showNoteDialog = false"
	>
		<textarea
			v-model="orderNote"
			class="w-full h-32 p-4 border border-gray-300 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
			:placeholder="__('Enter order notes...')"
		></textarea>
	</Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppShell from './AppShell.vue'
import Catalog from './Catalog.vue'
import Cart from './Cart.vue'
import CartList from './CartList.vue'
import TotalsPanel from './TotalsPanel.vue'
import NumericKeypad from './NumericKeypad.vue'
import CheckoutBar from './CheckoutBar.vue'
import StatusBadges from './StatusBadges.vue'
import Dialog from './Dialog.vue'

const props = defineProps({
	posProfile: {
		type: String,
		default: 'Main POS'
	},
	products: {
		type: Array,
		default: () => []
	},
	categories: {
		type: Array,
		default: () => []
	},
	customers: {
		type: Array,
		default: () => []
	},
	paymentMethods: {
		type: Array,
		default: () => []
	},
	taxRate: {
		type: Number,
		default: 0
	},
	isOffline: {
		type: Boolean,
		default: false
	},
	isSyncing: {
		type: Boolean,
		default: false
	},
	pendingInvoicesCount: {
		type: Number,
		default: 0
	},
	printerConnected: {
		type: Boolean,
		default: false
	}
})

// State
const theme = ref('light')
const direction = ref('rtl')
const searchQuery = ref('')
const cartItems = ref([])
const selectedCustomer = ref(null)
const selectedProduct = ref(null)
const selectedPaymentMethod = ref(null)
const amountPaid = ref(0)
const loadingProducts = ref(false)
const processingPayment = ref(false)
const showKeypad = ref(true)
const keypadValue = ref(0)

// Modals
const showUserMenu = ref(false)
const showModifiersDialog = ref(false)
const showDiscountDialog = ref(false)
const showCustomerDialog = ref(false)
const showNoteDialog = ref(false)
const showPrinterDialog = ref(false)

// Discount
const discountType = ref('percentage')
const discountValue = ref(0)
const orderNote = ref('')

// Modifiers
const modifierQuantity = ref(1)
const modifierNotes = ref('')

// Customer Search
const customerSearch = ref('')

// Computed
const calculations = computed(() => {
	const subtotal = cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
	const discount = discountType.value === 'percentage'
		? (subtotal * discountValue.value / 100)
		: discountValue.value
	const afterDiscount = subtotal - discount
	const tax = afterDiscount * (props.taxRate / 100)
	const total = afterDiscount + tax

	return { subtotal, discount, tax, total }
})

const canCheckout = computed(() => {
	return cartItems.value.length > 0 && !processingPayment.value
})

const canSaveDraft = computed(() => {
	return cartItems.value.length > 0
})

const checkoutLabel = computed(() => {
	return processingPayment.value ? __('Processing...') : __('Pay')
})

const filteredCustomers = computed(() => {
	if (!customerSearch.value) return props.customers
	const query = customerSearch.value.toLowerCase()
	return props.customers.filter(c =>
		c.name?.toLowerCase().includes(query) ||
		c.phone?.toLowerCase().includes(query)
	)
})

// Methods
const handleSearch = (query) => {
	searchQuery.value = query
}

const handleThemeChange = (newTheme) => {
	theme.value = newTheme
}

const handleDirectionChange = (newDirection) => {
	direction.value = newDirection
}

const handleProductClick = (product) => {
	addToCart(product)
}

const handleProductLongPress = (product) => {
	selectedProduct.value = product
	modifierQuantity.value = 1
	modifierNotes.value = ''
	showModifiersDialog.value = true
}

const handleCategoryChange = (categoryId) => {
	// Filter logic handled in Catalog component
}

const addToCart = (product, quantity = 1, notes = '') => {
	const existingItem = cartItems.value.find(item => 
		item.id === product.id && item.notes === notes
	)

	if (existingItem) {
		existingItem.quantity += quantity
	} else {
		cartItems.value.push({
			...product,
			quantity,
			notes,
			uniqueId: Date.now() + Math.random()
		})
	}
}

const increaseItemQuantity = (item) => {
	item.quantity++
}

const decreaseItemQuantity = (item) => {
	if (item.quantity > 1) {
		item.quantity--
	} else {
		removeCartItem(item)
	}
}

const removeCartItem = (item) => {
	const index = cartItems.value.findIndex(i => i.uniqueId === item.uniqueId)
	if (index > -1) {
		cartItems.value.splice(index, 1)
	}
}

const editCartItem = (item) => {
	selectedProduct.value = item
	modifierQuantity.value = item.quantity
	modifierNotes.value = item.notes || ''
	showModifiersDialog.value = true
}

const clearCart = () => {
	if (confirm(__('Clear all items from cart?'))) {
		cartItems.value = []
		discountValue.value = 0
		orderNote.value = ''
	}
}

const confirmModifiers = () => {
	if (selectedProduct.value) {
		addToCart(selectedProduct.value, modifierQuantity.value, modifierNotes.value)
		showModifiersDialog.value = false
		selectedProduct.value = null
	}
}

const applyDiscount = () => {
	showDiscountDialog.value = false
}

const selectCustomer = (customer) => {
	selectedCustomer.value = customer
	showCustomerDialog.value = false
}

const selectPaymentMethod = (method) => {
	selectedPaymentMethod.value = method.id
}

const handleCheckout = async () => {
	processingPayment.value = true
	
	try {
		// TODO: Integrate with actual API
		await new Promise(resolve => setTimeout(resolve, 1500))
		
		// Success - clear cart
		cartItems.value = []
		discountValue.value = 0
		orderNote.value = ''
		amountPaid.value = 0
		
		alert(__('Payment completed successfully!'))
	} catch (error) {
		alert(__('Payment failed. Please try again.'))
	} finally {
		processingPayment.value = false
	}
}

const saveDraft = () => {
	// TODO: Integrate with draft API
	alert(__('Draft saved!'))
}

const holdOrder = () => {
	saveDraft()
	clearCart()
}

const saveNote = () => {
	showNoteDialog.value = false
}

const handleKeypadEnter = (value) => {
	// Use keypad value for quantity or payment
	console.log('Keypad enter:', value)
}

const handleKeypadOperation = (operation) => {
	console.log('Keypad operation:', operation)
}

const showPendingInvoices = () => {
	alert(__('Show pending invoices'))
}

const __ = (text) => text
</script>

