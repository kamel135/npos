<template>
	<div class="flex flex-col h-screen overflow-hidden bg-gray-900">
		<!-- Loading State -->
		<LoadingSpinner v-if="uiStore.isLoading" />

		<!-- Main App -->
		<template v-else>
			<!-- Main Content Container -->
			<div v-if="shiftStore.hasOpenShift" class="flex-1 flex overflow-hidden">
				<!-- Left Side: Product Grid (70%) -->
				<div class="flex-1 flex flex-col overflow-hidden">
					<ItemsSelectorInTouch
						ref="itemsSelectorRef"
						:pos-profile="shiftStore.profileName"
						:cart-items="cartStore.invoiceItems"
						:currency="shiftStore.profileCurrency"
						:show-search="false"
						@item-selected="handleItemSelected"
					/>
				</div>

				<!-- Right Side: Cart & Numpad (30%) - Fixed Width -->
				<div class="w-[450px] flex-shrink-0 border-l-4 border-gray-900">
					<InvoiceCartInTouch
						:items="cartStore.invoiceItems"
						:customer="cartStore.customer"
						:subtotal="cartStore.subtotal"
						:tax-amount="cartStore.totalTax"
						:discount-amount="cartStore.totalDiscount"
						:grand-total="cartStore.grandTotal"
						:pos-profile="shiftStore.profileName"
						:currency="shiftStore.profileCurrency"
						:applied-offers="cartStore.appliedOffers"
						:warehouses="profileWarehouses"
						:table-number="currentTableNumber"
						@update-quantity="cartStore.updateItemQuantity"
						@remove-item="cartStore.removeItem"
						@select-customer="handleCustomerSelected"
						@create-customer="handleCreateCustomer"
						@proceed-to-payment="handleProceedToPayment"
						@clear-cart="handleClearCart"
						@save-draft="handleSaveDraft"
						@apply-coupon="uiStore.showCouponDialog = true"
						@show-offers="uiStore.showOffersDialog = true"
						@remove-offer="offer => cartStore.removeOffer(offer, shiftStore.currentProfile, offersDialogRef.value)"
						@update-uom="cartStore.changeItemUOM"
						@edit-item="handleEditItem"
						@view-shift="uiStore.showOpenShiftDialog = true"
						@show-drafts="uiStore.showDraftDialog = true"
						@show-history="uiStore.showHistoryDialog = true"
						@show-return="uiStore.showReturnDialog = true"
						@close-shift="handleCloseShift()"
						@logout="confirmLogout"
					/>
				</div>
			</div>

			<!-- No Shift Placeholder -->
			<div v-else class="flex-1 flex items-center justify-center bg-gray-100">
				<div class="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
					<div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-6">
						<svg class="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
						</svg>
					</div>
					<h3 class="text-2xl font-bold text-gray-900 mb-3">{{ __('Welcome to INTouch POS') }}</h3>
					<p class="text-gray-600 mb-6">{{ __('Please open a shift to start making sales') }}</p>
					<Button
						variant="solid"
						theme="blue"
						size="lg"
						@click="uiStore.showOpenShiftDialog = true"
						class="w-full"
					>
						{{ __('Open Shift') }}
					</Button>
				</div>
			</div>

			<!-- All Dialogs -->
			<!-- Payment Dialog -->
			<PaymentDialog
				v-model="uiStore.showPaymentDialog"
				:grand-total="cartStore.grandTotal"
				:subtotal="cartStore.subtotal"
				:pos-profile="shiftStore.profileName"
				:currency="shiftStore.profileCurrency"
				:is-offline="offlineStore.isOffline"
				:allow-partial-payment="posSettingsStore.allowPartialPayment"
				:allow-credit-sale="posSettingsStore.allowCreditSale"
				:customer="cartStore.customer"
				:company="shiftStore.profileCompany"
				:additional-discount="cartStore.additionalDiscount"
				@payment-completed="handlePaymentCompleted"
				@update-additional-discount="handleAdditionalDiscountUpdate"
			/>

			<!-- Customer Selection Dialog -->
			<CustomerDialog
				v-model="uiStore.showCustomerDialog"
				:pos-profile="shiftStore.profileName"
				@customer-selected="handleCustomerSelected"
			/>

			<!-- Shift Opening Dialog -->
			<ShiftOpeningDialog
				v-model="uiStore.showOpenShiftDialog"
				@shift-opened="handleShiftOpened"
			/>

			<!-- Shift Closing Dialog -->
			<ShiftClosingDialog
				v-model="uiStore.showCloseShiftDialog"
				:opening-shift="shiftStore.currentShift?.name"
				@shift-closed="handleShiftClosed"
			/>

			<!-- Draft Invoices Dialog -->
			<DraftInvoicesDialog
				v-model="uiStore.showDraftDialog"
				:currency="shiftStore.profileCurrency"
				@load-draft="handleLoadDraft"
				@drafts-updated="draftsStore.updateDraftsCount"
			/>

			<!-- Return Invoice Dialog -->
			<ReturnInvoiceDialog
				v-model="uiStore.showReturnDialog"
				:pos-profile="shiftStore.profileName"
				:currency="shiftStore.profileCurrency"
				@return-created="handleReturnCreated"
			/>

			<!-- Coupon Dialog -->
			<CouponDialog
				v-model="uiStore.showCouponDialog"
				:subtotal="cartStore.subtotal"
				:items="cartStore.invoiceItems"
				:pos-profile="shiftStore.profileName"
				:customer="cartStore.customer?.name || cartStore.customer"
				:company="shiftStore.profileCompany"
				:currency="shiftStore.profileCurrency"
				:applied-coupon="cartStore.appliedCoupon"
				@discount-applied="handleDiscountApplied"
				@discount-removed="handleDiscountRemoved"
			/>

			<!-- Offers Dialog -->
			<OffersDialog
				ref="offersDialogRef"
				v-model="uiStore.showOffersDialog"
				:subtotal="cartStore.subtotal"
				:items="cartStore.invoiceItems"
				:pos-profile="shiftStore.profileName"
				:customer="cartStore.customer?.name || cartStore.customer"
				:company="shiftStore.profileCompany"
				:currency="shiftStore.profileCurrency"
				:applied-offers="cartStore.appliedOffers"
				@apply-offer="handleApplyOffer"
				@remove-offer="offer => cartStore.removeOffer(offer, shiftStore.currentProfile, offersDialogRef.value)"
			/>

			<!-- Batch/Serial Dialog -->
			<BatchSerialDialog
				v-model="uiStore.showBatchSerialDialog"
				:item="cartStore.pendingItem"
				:quantity="cartStore.pendingItemQty"
				:warehouse="shiftStore.profileWarehouse"
				@batch-serial-selected="handleBatchSerialSelected"
			/>

			<!-- Generic Item Selection Dialog -->
			<ItemSelectionDialog
				v-model="uiStore.showItemSelectionDialog"
				:item="cartStore.pendingItem"
				:mode="cartStore.selectionMode"
				:pos-profile="shiftStore.profileName"
				:currency="shiftStore.profileCurrency"
				@option-selected="handleOptionSelected"
			/>

			<!-- Invoice History Dialog -->
			<InvoiceHistoryDialog
				v-model="uiStore.showHistoryDialog"
				:pos-profile="shiftStore.profileName"
				:currency="shiftStore.profileCurrency"
				@create-return="handleCreateReturnFromHistory"
				@view-invoice="handleViewInvoice"
				@print-invoice="handlePrintInvoice"
			/>

			<!-- Offline Invoices Dialog -->
			<OfflineInvoicesDialog
				v-model="uiStore.showOfflineInvoicesDialog"
				:is-offline="offlineStore.isOffline"
				:pending-invoices="offlineStore.pendingInvoicesList"
				:is-syncing="offlineStore.isSyncing"
				:currency="shiftStore.profileCurrency"
				@sync-all="handleSyncAll"
				@delete-invoice="handleDeleteOfflineInvoice"
				@edit-invoice="handleEditOfflineInvoice"
				@refresh="offlineStore.loadPendingInvoices"
			/>

			<!-- Create Customer Dialog -->
			<CreateCustomerDialog
				v-model="uiStore.showCreateCustomerDialog"
				:pos-profile="shiftStore.profileName"
				:initial-name="uiStore.initialCustomerName"
				@customer-created="handleCustomerCreated"
			/>

			<!-- Success Dialog -->
			<Dialog
				v-model="uiStore.showSuccessDialog"
				:options="{ title: __('Invoice Created Successfully'), size: 'md' }"
			>
				<template #body-content>
					<div class="text-center py-6">
						<div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
							<svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
							</svg>
						</div>
						<h3 class="text-xl font-bold text-gray-900 mb-2">
							{{ __('Invoice {0} created successfully!', [uiStore.lastInvoiceName]) }}
						</h3>
						<p class="text-lg text-gray-600">
							{{ __('Total: {0}', [formatCurrency(uiStore.lastInvoiceTotal)]) }}
						</p>
					</div>
				</template>
				<template #actions>
					<div class="flex gap-3 w-full">
						<Button variant="subtle" class="flex-1" @click="uiStore.showSuccessDialog = false">
							{{ __('Close') }}
						</Button>
						<Button variant="solid" theme="blue" class="flex-1" @click="() => { handlePrintInvoice({ name: uiStore.lastInvoiceName }); uiStore.showSuccessDialog = false }">
							{{ __('Print Invoice') }}
						</Button>
					</div>
				</template>
			</Dialog>

			<!-- Error Dialog -->
			<Dialog
				v-model="uiStore.showErrorDialog"
				:options="{ title: uiStore.errorDialogTitle || __('Error'), size: 'md' }"
			>
				<template #body-content>
					<div class="py-4">
						<p class="text-sm text-gray-700 whitespace-pre-line">
							{{ uiStore.errorDialogMessage || __('An unexpected error occurred.') }}
						</p>
						<div v-if="uiStore.errorDetails" class="mt-3 pt-3 border-t border-gray-200">
							<p class="text-xs text-gray-500">{{ uiStore.errorDetails }}</p>
						</div>
					</div>
				</template>
				<template #actions>
					<div class="flex justify-between items-center w-full">
						<Button variant="subtle" @click="uiStore.clearError()">
							{{ __('Close') }}
						</Button>
						<Button
							v-if="uiStore.errorRetryAction"
							variant="solid"
							@click="handleErrorRetry"
						>
							{{ __('Try Again') }}
						</Button>
					</div>
				</template>
			</Dialog>
		</template>

		<!-- Footer -->
		<POSFooter />
	</div>
</template>

<script setup>
import ShiftClosingDialog from "@/components/ShiftClosingDialog.vue"
import ShiftOpeningDialog from "@/components/ShiftOpeningDialog.vue"
import LoadingSpinner from "@/components/common/LoadingSpinner.vue"
import POSFooter from "@/components/common/POSFooter.vue"
import BatchSerialDialog from "@/components/sale/BatchSerialDialog.vue"
import CouponDialog from "@/components/sale/CouponDialog.vue"
import CreateCustomerDialog from "@/components/sale/CreateCustomerDialog.vue"
import CustomerDialog from "@/components/sale/CustomerDialog.vue"
import DraftInvoicesDialog from "@/components/sale/DraftInvoicesDialog.vue"
import InvoiceCartInTouch from "@/components/sale/InvoiceCartInTouch.vue"
import InvoiceHistoryDialog from "@/components/sale/InvoiceHistoryDialog.vue"
import ItemSelectionDialog from "@/components/sale/ItemSelectionDialog.vue"
import ItemsSelectorInTouch from "@/components/sale/ItemsSelectorInTouch.vue"
import OffersDialog from "@/components/sale/OffersDialog.vue"
import OfflineInvoicesDialog from "@/components/sale/OfflineInvoicesDialog.vue"
import PaymentDialog from "@/components/sale/PaymentDialog.vue"
import ReturnInvoiceDialog from "@/components/sale/ReturnInvoiceDialog.vue"
import { session } from "@/data/session"
import { useUserData } from "@/data/user"
import { parseError } from "@/utils/errorHandler"
import { offlineWorker } from "@/utils/offline/workerClient"
import { printInvoice, printInvoiceByName } from "@/utils/printInvoice"
import { Button, Dialog, createResource } from "frappe-ui"
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { useToast } from "@/composables/useToast"

import { useItemSearchStore } from "@/stores/itemSearch"
import { useStockStore } from "@/stores/stock"
import { usePOSCartStore } from "@/stores/posCart"
import { usePOSDraftsStore } from "@/stores/posDrafts"
import { usePOSSettingsStore } from "@/stores/posSettings"
import { usePOSShiftStore } from "@/stores/posShift"
import { usePOSSyncStore } from "@/stores/posSync"
import { usePOSUIStore } from "@/stores/posUI"
import { logger } from "@/utils/logger"

// Initialize stores
const cartStore = usePOSCartStore()
const shiftStore = usePOSShiftStore()
const uiStore = usePOSUIStore()
const offlineStore = usePOSSyncStore()
const draftsStore = usePOSDraftsStore()
const posSettingsStore = usePOSSettingsStore()
const itemStore = useItemSearchStore()
const stockStore = useStockStore()

// Initialize toast
const { showSuccess, showError, showWarning } = useToast()

// Initialize logger
const log = logger.create('POSSaleInTouch')

// User data composable
const { userName, userImage } = useUserData()

// Component refs
const itemsSelectorRef = ref(null)
const offersDialogRef = ref(null)

// State
const currentTableNumber = ref(1)
const warehousesList = ref([])

// Warehouses resource
const warehousesResource = createResource({
	url: "pos_next.api.pos_profile.get_warehouses",
	makeParams() {
		return {
			pos_profile: shiftStore.profileName,
		}
	},
	auto: false,
	onSuccess(data) {
		const warehouses = data?.message || data || []
		warehousesList.value = warehouses
	},
	onError(error) {
		log.error("Error loading warehouses:", error)
		warehousesList.value = []
	},
})

// Watch for profile changes to load warehouses
watch(
	() => shiftStore.profileName,
	(newProfile) => {
		if (newProfile) {
			warehousesResource.reload()
		}
	},
	{ immediate: true },
)

// Computed for warehouses
const profileWarehouses = computed(() => {
	if (warehousesList.value.length > 0) {
		return warehousesList.value.map((w) => ({
			name: w.name,
			warehouse: w.warehouse_name || w.name,
		}))
	}
	if (shiftStore.profileWarehouse) {
		return [
			{
				name: shiftStore.profileWarehouse,
				warehouse: shiftStore.profileWarehouse,
			},
		]
	}
	return []
})

onMounted(async () => {
	try {
		// Start timers for current time and shift duration
		shiftStore.startTimers()

		// Check for existing open shift
		const hasShift = await shiftStore.checkShift()

		if (!hasShift) {
			uiStore.showOpenShiftDialog = true
		} else {
			// Set POS profile and load tax rules
			if (shiftStore.currentProfile) {
				cartStore.posProfile = shiftStore.profileName
				cartStore.posOpeningShift = shiftStore.currentShift?.name

				// Load POS Settings
				await posSettingsStore.loadSettings(shiftStore.profileName)
				
				// Load tax rules
				await cartStore.loadTaxRules(shiftStore.profileName, posSettingsStore.settings)

				// Set default customer
				await cartStore.setDefaultCustomer()

				// Set warehouse context in stock store
				if (shiftStore.profileWarehouse) {
					stockStore.setWarehouse(shiftStore.profileWarehouse)
				}

				// Pre-load data for offline use
				if (!offlineStore.isOffline) {
					await offlineStore.preloadDataForOffline(shiftStore.currentProfile)
				} else {
					await offlineStore.checkOfflineCacheAvailability()
				}
			}
		}

		await draftsStore.updateDraftsCount()
	} catch (error) {
		log.error("Error checking shift:", error)
	} finally {
		uiStore.setLoading(false)
	}
})

onUnmounted(() => {
	// Stop periodic stock sync on unmount
	offlineWorker.stopStockSync().catch(() => {})
})

// Handlers
async function handleShiftOpened() {
	uiStore.showOpenShiftDialog = false
	if (shiftStore.currentProfile) {
		cartStore.posProfile = shiftStore.profileName
		cartStore.posOpeningShift = shiftStore.currentShift?.name
		await posSettingsStore.loadSettings(shiftStore.profileName)
		await cartStore.loadTaxRules(shiftStore.profileName, posSettingsStore.settings)
	}
	showSuccess(__("You can now start making sales"))
}

function handleShiftClosed() {
	uiStore.showCloseShiftDialog = false
	showSuccess(__("Shift closed successfully"))
	setTimeout(() => {
		uiStore.showOpenShiftDialog = true
	}, 500)
}

function handleItemSelected(item, autoAdd = false) {
	// Check for variants
	if (item.has_variants) {
		cartStore.setPendingItem(item, 1, "variant")
		uiStore.showItemSelectionDialog = true
		return
	}

	// Check for UOMs
	if (item.item_uoms && item.item_uoms.length > 0) {
		cartStore.setPendingItem(item, 1, "uom")
		uiStore.showItemSelectionDialog = true
		return
	}

	// Check for batch/serial
	if (item.has_batch_no || item.has_serial_no) {
		cartStore.setPendingItem(item, 1)
		uiStore.showBatchSerialDialog = true
		return
	}

	// Add to cart
	try {
		cartStore.addItem(item, 1, autoAdd, shiftStore.currentProfile)
	} catch (error) {
		uiStore.showError(
			__("Insufficient Stock"),
			error.message,
			__("Item: {0}", [item.item_code]),
		)
	}
}

async function handleEditItem(updatedItem) {
	await cartStore.updateItemDetails(updatedItem.item_code, updatedItem)
}

function handleAdditionalDiscountUpdate(discountAmount) {
	cartStore.additionalDiscount = discountAmount
	cartStore.rebuildIncrementalCache()
}

function handleCustomerSelected(selectedCustomer) {
	if (selectedCustomer) {
		cartStore.setCustomer(selectedCustomer)
		uiStore.showCustomerDialog = false
		showSuccess(__('{0} selected', [selectedCustomer.customer_name]))
	} else {
		cartStore.setCustomer(null)
	}
}

function handleCreateCustomer(searchValue) {
	uiStore.setInitialCustomerName(searchValue || "")
	uiStore.showCreateCustomerDialog = true
}

async function handleProceedToPayment() {
	if (cartStore.isEmpty) {
		showWarning(__("Please add items to cart before proceeding to payment"))
		return
	}

	// Check if there's only one payment method - auto-complete payment
	try {
		const { call } = await import('@/utils/apiWrapper')
		const paymentMethods = await call('pos_next.api.pos_profile.get_payment_methods', {
			pos_profile: shiftStore.profileName
		})
		
		// If only one payment method, auto-complete payment
		if (paymentMethods && paymentMethods.length === 1) {
			const method = paymentMethods[0]
			const paymentData = {
				payments: [{
					mode_of_payment: method.mode_of_payment,
					amount: cartStore.grandTotal,
					type: method.type || 'Cash'
				}],
				change_amount: 0,
				is_partial_payment: false,
				paid_amount: cartStore.grandTotal,
				outstanding_amount: 0,
				autoPrint: true, // Flag to auto-print when single payment method
				silentPrint: true // Flag to print without showing dialog
			}
			
			// Auto-complete payment without opening dialog
			await handlePaymentCompleted(paymentData)
			return
		}
	} catch (error) {
		console.error('Error checking payment methods:', error)
		// Fallback to opening dialog if check fails
	}

	// Customer selection is now optional - proceed to payment without requiring customer
	uiStore.showPaymentDialog = true
}

async function handlePaymentCompleted(paymentData) {
	try {
		const customerValue = cartStore.customer?.name || cartStore.customer

		cartStore.payments = []
		if (paymentData.payments && Array.isArray(paymentData.payments)) {
			paymentData.payments.forEach((p) => {
				cartStore.payments.push({
					mode_of_payment: p.mode_of_payment,
					amount: p.amount,
					type: p.type,
				})
			})
		}

		if (paymentData.sales_team && Array.isArray(paymentData.sales_team)) {
			cartStore.salesTeam = paymentData.sales_team
		} else {
			cartStore.salesTeam = []
		}

		if (offlineStore.isOffline) {
			const invoiceData = {
				pos_profile: cartStore.posProfile,
				posa_pos_opening_shift: cartStore.posOpeningShift,
				customer: customerValue || shiftStore.profileCustomer,
				items: JSON.parse(JSON.stringify(cartStore.invoiceItems)),
				payments: JSON.parse(JSON.stringify(cartStore.payments)),
				sales_team: JSON.parse(JSON.stringify(cartStore.salesTeam || [])),
				grand_total: cartStore.grandTotal,
				total_tax: cartStore.totalTax,
				total_discount: cartStore.totalDiscount,
			}

			await offlineStore.saveInvoiceOffline(invoiceData)
			uiStore.showSuccess(`OFFLINE-${Date.now()}`, cartStore.grandTotal)
			uiStore.showPaymentDialog = false
			cartStore.clearCart()
			showSuccess(__("Invoice saved offline. Will sync when online"))
		} else {
			const soldItemCodes = cartStore.invoiceItems.map(item => item.item_code)
			const result = await cartStore.submitInvoice()

			if (result) {
				const invoiceName = result.name || result.message?.name || __('Unknown')
				const invoiceTotal = result.grand_total || result.total || 0

				uiStore.showPaymentDialog = false
				cartStore.clearCart()

				// Show success dialog immediately (don't wait for stock refresh)
				// Auto-print if enabled OR if this was an auto Cash payment
				const shouldAutoPrint = shiftStore.autoPrintEnabled || paymentData.autoPrint
				if (paymentData.autoPrint) {
					// For auto payment with single payment method, print immediately without showing dialog
					// Use silent print (minimizes dialog interaction) if silentPrint flag is set
					const printOptions = paymentData.silentPrint ? { silentPrint: true } : {}
					handlePrintInvoice({ name: invoiceName, ...printOptions }).catch(error => {
						log.error("Auto-print error:", error)
						// Don't show error to user - print happens in background
					})
					// No success message - just print silently
				} else if (shouldAutoPrint) {
					// For auto-print (when enabled in settings), show dialog after print attempt
					try {
						await handlePrintInvoice({ name: invoiceName })
						showSuccess(__('Invoice {0} created and sent to printer', [invoiceName]))
					} catch (error) {
						log.error("Auto-print error:", error)
						showWarning(__('Invoice {0} created but print failed', [invoiceName]))
					}
				} else {
					// Show success dialog immediately
					uiStore.showSuccess(invoiceName, invoiceTotal)
					showSuccess(__('Invoice {0} created successfully', [invoiceName]))
				}

				// Refresh stock in background (non-blocking)
				stockStore.refresh(soldItemCodes, shiftStore.profileWarehouse).catch(error => {
					log.error("Background stock refresh failed:", error)
					// Don't show error to user - stock will sync eventually
				})
			}
		}
	} catch (error) {
		log.error("Error submitting invoice:", error)
		uiStore.showPaymentDialog = false

		const errorContext = parseError(error)
		uiStore.showError(
			errorContext.title || __('Error'),
			errorContext.message || __("An unexpected error occurred"),
			errorContext.technicalDetails || null,
			errorContext.retryable ? "payment" : null,
		)

		if (errorContext.type === "error") {
			showError(errorContext.message)
		} else {
			showWarning(errorContext.message)
		}
	}
}

function handleClearCart() {
	if (cartStore.isEmpty) return
	cartStore.clearCart()
	showSuccess(__("All items removed from cart"))
}

async function handleOptionSelected(option) {
	if (!cartStore.pendingItem) return

	try {
		if (option.type === "variant") {
			const variant = option.data

			if (variant.item_uoms && variant.item_uoms.length > 0) {
				cartStore.setPendingItem(variant, cartStore.pendingItemQty, "uom")
				return
			}

			if (variant.has_batch_no || variant.has_serial_no) {
				cartStore.setPendingItem(variant, cartStore.pendingItemQty)
				uiStore.showItemSelectionDialog = false
				uiStore.showBatchSerialDialog = true
			} else {
				try {
					cartStore.addItem(variant, cartStore.pendingItemQty, false, shiftStore.currentProfile)
					uiStore.showItemSelectionDialog = false
					cartStore.clearPendingItem()
					showSuccess(__('{0} added to cart', [variant.item_name]))
				} catch (error) {
					showError(error.message)
				}
			}
		} else if (option.type === "uom") {
			const itemDetails = await cartStore.getItemDetailsResource.submit({
				item_code: cartStore.pendingItem.item_code,
				pos_profile: cartStore.posProfile,
				customer: cartStore.customer?.name || cartStore.customer,
				qty: cartStore.pendingItemQty,
				uom: option.uom,
			})

			const itemToAdd = {
				...cartStore.pendingItem,
				uom: option.uom,
				conversion_factor: option.conversion_factor,
				rate: itemDetails.price_list_rate || itemDetails.rate,
				price_list_rate: itemDetails.price_list_rate,
			}

			if (itemToAdd.has_batch_no || itemToAdd.has_serial_no) {
				cartStore.setPendingItem(itemToAdd, cartStore.pendingItemQty)
				uiStore.showItemSelectionDialog = false
				uiStore.showBatchSerialDialog = true
			} else {
				try {
					cartStore.addItem(itemToAdd, cartStore.pendingItemQty, false, shiftStore.currentProfile)
					uiStore.showItemSelectionDialog = false
					cartStore.clearPendingItem()
					showSuccess(__('{0} ({1}) added to cart', [itemToAdd.item_name, option.uom]))
				} catch (error) {
					showError(error.message)
				}
			}
		}
	} catch (error) {
		log.error("Error handling option selection:", error)
		showError(__("Failed to process selection. Please try again."))
	}
}

function handleCloseShift() {
	uiStore.showCloseShiftDialog = true
}

function confirmLogout() {
	// Clear cart to prevent stale items on next login
	cartStore.clearCart()
	// Clear all dialog states to prevent stale state on next login
	uiStore.resetAllDialogs()
	session.logout.submit()
}

function formatCurrency(amount) {
	return Number.parseFloat(amount || 0).toFixed(2)
}

async function handleSaveDraft() {
	// If cart is empty, show drafts dialog instead
	if (cartStore.itemCount === 0 || cartStore.invoiceItems.length === 0) {
		uiStore.showDraftDialog = true
		return
	}
	const success = await draftsStore.saveDraftInvoice(
		cartStore.invoiceItems,
		cartStore.customer,
		cartStore.posProfile,
		cartStore.appliedOffers,
	)
	if (success) {
		cartStore.clearCart()
	}
}

async function handleLoadDraft(draft) {
	try {
		const draftData = await draftsStore.loadDraft(draft)
		cartStore.invoiceItems = draftData.items
		cartStore.setCustomer(draftData.customer)

		cartStore.rebuildIncrementalCache()

		if (draftData.applied_offers && draftData.applied_offers.length > 0) {
			cartStore.appliedOffers = draftData.applied_offers
			await cartStore.reapplyOffer(shiftStore.currentProfile)
		}

		uiStore.showDraftDialog = false
	} catch (error) {
		log.error("Error loading draft:", error)
	}
}

function handleReturnCreated(returnInvoice) {
	showSuccess(__('Return invoice {0} created successfully', [returnInvoice.name]))
}

function handleDiscountApplied(discount) {
	cartStore.applyDiscountToCart(discount)
	uiStore.showCouponDialog = false
}

function handleDiscountRemoved() {
	cartStore.removeDiscountFromCart()
}

async function handleApplyOffer(offer) {
	const success = await cartStore.applyOffer(
		offer,
		shiftStore.currentProfile,
		offersDialogRef.value,
	)
	if (success) {
		uiStore.showOffersDialog = false
	}
}

function handleBatchSerialSelected(batchSerial) {
	if (cartStore.pendingItem) {
		const qty = batchSerial.quantity || cartStore.pendingItemQty
		const itemToAdd = {
			...cartStore.pendingItem,
			quantity: qty,
			...batchSerial,
		}
		try {
			cartStore.addItem(itemToAdd, qty, false, shiftStore.currentProfile)
			cartStore.clearPendingItem()
		} catch (error) {
			showError(error.message)
		}
	}
}

function handleCreateReturnFromHistory(invoice) {
	uiStore.showReturnDialog = true
	showWarning(__('Creating return for invoice {0}', [invoice.name]))
}

function handleCustomerCreated(newCustomer) {
	cartStore.setCustomer(newCustomer)
	uiStore.showCreateCustomerDialog = false
	showSuccess(__('{0} created and selected', [newCustomer.customer_name]))
}

async function handleEditOfflineInvoice(invoice) {
	try {
		cartStore.clearCart()

		const invoiceData = invoice.data

		if (invoiceData.customer) {
			cartStore.setCustomer(invoiceData.customer)
		}

		if (invoiceData.items && invoiceData.items.length > 0) {
			for (const item of invoiceData.items) {
				cartStore.addItem(item, item.quantity || item.qty || 1, true, shiftStore.currentProfile)
			}
		}

		await offlineStore.deleteOfflineInvoice(invoice.id)

		showSuccess(__("Invoice loaded to cart for editing"))
	} catch (error) {
		log.error("Error editing offline invoice:", error)
	}
}

async function handleDeleteOfflineInvoice(invoiceId) {
	try {
		await offlineStore.deleteOfflineInvoice(invoiceId)
	} catch (error) {
		log.error("Error deleting offline invoice:", error)
	}
}

async function handleSyncAll() {
	if (offlineStore.isOffline) {
		showWarning(__("Cannot sync while offline"))
		return
	}

	try {
		const result = await offlineStore.syncAllPending()

		if (result.success > 0 && itemsSelectorRef.value) {
			await itemsSelectorRef.value.loadItems()
		}

		if (result.failed > 0 && result.errors && result.errors.length > 0) {
			const firstError = result.errors[0]
			const errorContext = parseError(firstError.error)

			uiStore.showError(
				errorContext.title,
				__("Failed to sync invoice for {0}\n\n${1}\n\nYou can delete this invoice from the offline queue if you don't need it.", [firstError.customer, errorContext.message]),
				errorContext.technicalDetails || __('Invoice ID: {0}', [firstError.invoiceId]),
				"sync",
				{ failedInvoiceId: firstError.invoiceId },
			)
		} else if (result.failed > 0) {
			showWarning(__('{0} invoice(s) failed to sync', [result.failed]))
		}
	} catch (error) {
		log.error("Sync error:", error)
		const errorContext = parseError(error)
		uiStore.showError(
			errorContext.title,
			errorContext.message,
			errorContext.technicalDetails,
			"sync",
		)
	}
}

async function handlePrintInvoice(invoiceData) {
	try {
		const silentPrint = invoiceData.silentPrint === true
		
		if (invoiceData.items && Array.isArray(invoiceData.items)) {
			await printInvoice(invoiceData)
		} else {
			await printInvoiceByName(invoiceData.name, null, null, silentPrint)
		}
	} catch (error) {
		log.error("Error printing invoice:", error)
		showError(__("Failed to print invoice"))
	}
}

function handleViewInvoice(invoice) {
	// View invoice implementation
}

function handleErrorRetry() {
	uiStore.clearError()
	if (uiStore.errorRetryAction === "payment") {
		setTimeout(() => {
			uiStore.showPaymentDialog = true
		}, 300)
	}
}
</script>

<style scoped>
/* Ensure no overflow scrolling on main container */
.overflow-hidden {
	overflow: hidden;
}
</style>

