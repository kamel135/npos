import { call } from "@/utils/apiWrapper"
import { logger } from "@/utils/logger"

const log = logger.create('PrintInvoice')

/**
 * Print invoice using Frappe's print format system
 * @param {Object} invoiceData - The invoice document data
 * @param {string} printFormat - The print format name (optional)
 * @param {string} letterhead - The letterhead name (optional)
 * @note Use "POS Next Receipt" format for thermal printer (80mm) or configure via POS Profile
 */
export async function printInvoice(
	invoiceData,
	printFormat = null,
	letterhead = null,
) {
	try {
		if (!invoiceData || !invoiceData.name) {
			throw new Error("Invalid invoice data")
		}

		const doctype = invoiceData.doctype || "Sales Invoice"
		const format = printFormat || "POS Next Receipt"

		// Build PDF print URL
		// Note: Don't use trigger_print=1 because it causes automatic printing
		// which can interfere with cancel button and cause duplicate print dialogs
		const params = new URLSearchParams({
			doctype: doctype,
			name: invoiceData.name,
			format: format,
			no_letterhead: letterhead ? 0 : 1,
			_lang: "en",
			// trigger_print: 1, // Removed to prevent automatic printing
			_t: Date.now(), // Cache buster to force fresh print format
		})

		if (letterhead) {
			params.append("letterhead", letterhead)
		}

		// Open PDF in hidden iframe for printing (more reliable in Chrome than window.open)
		const printUrl = `/printview?${params.toString()}`
		
		// Create hidden iframe for printing - iframe works better than window.open() in Chrome
		const iframe = document.createElement('iframe')
		iframe.style.position = 'fixed'
		iframe.style.right = '0'
		iframe.style.bottom = '0'
		iframe.style.width = '0'
		iframe.style.height = '0'
		iframe.style.border = 'none'
		iframe.style.opacity = '0'
		iframe.style.pointerEvents = 'none'
		iframe.src = printUrl
		
		document.body.appendChild(iframe)

		// More robust print function that works reliably in Chrome and Firefox
		let printed = false
		let printDialogShown = false
		let attempts = 0
		const maxAttempts = 20
		let pollInterval = null
		let fallbackTimeout = null
		
		// Cleanup function to stop all timers and remove iframe
		const cleanup = () => {
			if (pollInterval) {
				clearInterval(pollInterval)
				pollInterval = null
			}
			if (fallbackTimeout) {
				clearTimeout(fallbackTimeout)
				fallbackTimeout = null
			}
			// Remove iframe after a delay to ensure print dialog is closed
			setTimeout(() => {
				if (iframe.parentNode) {
					document.body.removeChild(iframe)
				}
			}, 500)
		}
		
		const attemptPrint = () => {
			if (printed || printDialogShown || !iframe.parentNode) return
			
			try {
				// Check if iframe content is accessible and ready
				const contentWindow = iframe.contentWindow
				const contentDoc = iframe.contentDocument || (contentWindow && contentWindow.document)
				
				if (contentDoc) {
					const isReady = contentDoc.readyState === 'complete' || 
					                contentDoc.readyState === 'interactive' ||
					                attempts >= 5 // Force attempt after 5 tries
					
					if (isReady && contentWindow) {
						// Add afterprint listener to detect when dialog is closed (either print or cancel)
						// This prevents duplicate print dialogs
						contentWindow.addEventListener('afterprint', () => {
							printed = true
							printDialogShown = true
							cleanup()
						}, { once: true })
						
						// Try to print - this will show the dialog
						contentWindow.print()
						printDialogShown = true
						printed = true
						
						// Stop all timers immediately
						cleanup()
						return true
					}
				} else if (attempts >= 10) {
					// After many attempts, try to print anyway (Chrome may block document access)
					if (contentWindow) {
						try {
							// Add afterprint listener
							contentWindow.addEventListener('afterprint', () => {
								printed = true
								printDialogShown = true
								cleanup()
							}, { once: true })
							
							contentWindow.print()
							printDialogShown = true
							printed = true
							cleanup()
							return true
						} catch (printErr) {
							// Continue trying
						}
					}
				}
			} catch (error) {
				// If we can't access the iframe content yet, that's ok - we'll retry
				if (error.name === 'SecurityError' || error.message.includes('Blocked')) {
					// Expected - will retry
					if (attempts >= 10 && iframe.contentWindow) {
						// After many attempts, try to print anyway
						try {
							iframe.contentWindow.addEventListener('afterprint', () => {
								printed = true
								printDialogShown = true
								cleanup()
							}, { once: true })
							
							iframe.contentWindow.print()
							printDialogShown = true
							printed = true
							cleanup()
							return true
						} catch (finalErr) {
							// Continue trying
						}
					}
				} else {
					log.error("Error checking iframe readiness:", error)
				}
			}
			
			attempts++
			return false
		}

		// Multiple strategies to ensure print dialog appears in Chrome and Firefox
		
		// Strategy 1: Listen for load event (works well in Firefox and Chrome)
		iframe.onload = () => {
			setTimeout(() => {
				if (!printed && !printDialogShown) {
					attemptPrint()
				}
			}, 500)
		}
		
		// Strategy 2: Poll for iframe readiness (more reliable in Chrome)
		pollInterval = setInterval(() => {
			if (printed || printDialogShown || !iframe.parentNode) {
				clearInterval(pollInterval)
				pollInterval = null
				return
			}
			
			if (attempts >= maxAttempts) {
				clearInterval(pollInterval)
				pollInterval = null
				// Final attempt - force print
				try {
					if (iframe.parentNode && iframe.contentWindow) {
						iframe.contentWindow.addEventListener('afterprint', () => {
							printed = true
							printDialogShown = true
							cleanup()
						}, { once: true })
						
						iframe.contentWindow.print()
						printDialogShown = true
						printed = true
						cleanup()
					}
				} catch (error) {
					log.error("Final print attempt failed:", error)
					cleanup()
				}
				return
			}
			
			if (attemptPrint()) {
				if (pollInterval) {
					clearInterval(pollInterval)
					pollInterval = null
				}
			}
		}, 300) // Check every 300ms

		// Strategy 3: Fallback timeout (safety net)
		fallbackTimeout = setTimeout(() => {
			if (pollInterval) {
				clearInterval(pollInterval)
				pollInterval = null
			}
			if (!printed && !printDialogShown && iframe.parentNode) {
				try {
					if (iframe.contentWindow) {
						iframe.contentWindow.addEventListener('afterprint', () => {
							printed = true
							printDialogShown = true
							cleanup()
						}, { once: true })
						
						iframe.contentWindow.print()
						printDialogShown = true
						printed = true
						cleanup()
					}
				} catch (error) {
					log.error("Error in fallback print:", error)
					cleanup()
				}
			} else {
				cleanup()
			}
		}, 6000) // Extended timeout for Chrome (6 seconds)

		return true
	} catch (error) {
		log.error("Error printing with Frappe print format:", error)
		// Fallback to custom print format
		return printInvoiceCustom(invoiceData)
	}
}

/**
 * Generates and prints a custom POS receipt using a thermal printer layout.
 *
 * This fallback printer is used when Frappe's standard print format is unavailable.
 * The receipt is optimized for 80mm thermal printers with clean, readable formatting.
 *
 * Receipt Structure:
 * - Header: Company name and invoice type
 * - Info: Invoice number, date, customer, payment status
 * - Items: Each item shows quantity × original price = subtotal
 * - Discounts: Displayed as separate line items with negative amounts
 * - Totals: Subtotal, tax, and grand total
 * - Payments: Payment methods and amounts, change, outstanding balance
 * - Footer: Thank you message and branding
 *
 * @param {Object} invoiceData - The invoice document data from ERPNext
 * @param {string} invoiceData.name - Invoice number
 * @param {string} invoiceData.company - Company name
 * @param {Array} invoiceData.items - Invoice line items
 * @param {Array} invoiceData.payments - Payment records
 * @param {number} invoiceData.grand_total - Invoice total amount
 */
function printInvoiceCustom(invoiceData) {
	// Open print window with receipt size dimensions (80mm ≈ 302px at 96 DPI)
	const printWindow = window.open("", "_blank", "width=350,height=600")

	const printContent = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<title>${__('Invoice - {0}', [invoiceData.name])}</title>
			<style>
				* {
					margin: 0;
					padding: 0;
					box-sizing: border-box;
				}

				body {
					font-family: 'Courier New', monospace;
					padding: 10px;
					width: 80mm;
					margin: 0;
					max-width: 80mm;
				}

				.receipt {
					width: 100%;
				}

				.header {
					text-align: center;
					margin-bottom: 20px;
					border-bottom: 2px dashed #000;
					padding-bottom: 10px;
				}

				.company-name {
					font-size: 18px;
					font-weight: bold;
					margin-bottom: 5px;
				}

				.invoice-info {
					margin-bottom: 15px;
					font-size: 12px;
				}

				.invoice-info div {
					display: flex;
					justify-content: space-between;
					margin-bottom: 3px;
				}

				.partial-status {
					color: #dc3545;
					font-weight: bold;
					margin-bottom: 5px;
				}

				.items-table {
					width: 100%;
					margin-bottom: 15px;
					border-top: 1px dashed #000;
					border-bottom: 1px dashed #000;
					padding: 10px 0;
				}

				.item-row {
					margin-bottom: 10px;
					font-size: 12px;
				}

				.item-name {
					font-weight: bold;
					margin-bottom: 3px;
				}

				.item-comment {
					font-size: 10px;
					color: #e65100;
					font-style: italic;
					margin-bottom: 3px;
					padding: 2px 5px;
					background-color: #fff3e0;
					border-radius: 2px;
					border-left: 2px solid #ff9800;
				}

				.item-details {
					display: flex;
					justify-content: space-between;
					font-size: 11px;
					color: #333;
				}

				.item-discount {
					display: flex;
					justify-content: space-between;
					font-size: 10px;
					color: #28a745;
					margin-top: 2px;
				}

				.item-serials {
					font-size: 9px;
					color: #666;
					margin-top: 3px;
					padding: 3px 5px;
					background-color: #f5f5f5;
					border-radius: 2px;
				}

				.item-serials-label {
					font-weight: bold;
					margin-bottom: 2px;
				}

				.item-serials-list {
					word-break: break-all;
				}

				.totals {
					margin-top: 15px;
					border-top: 1px dashed #000;
					padding-top: 10px;
				}

				.total-row {
					display: flex;
					justify-content: space-between;
					margin-bottom: 5px;
					font-size: 12px;
				}

				.grand-total {
					font-size: 16px;
					font-weight: bold;
					border-top: 2px solid #000;
					padding-top: 10px;
					margin-top: 10px;
				}

				.payments {
					margin-top: 15px;
					border-top: 1px dashed #000;
					padding-top: 10px;
				}

				.payment-row {
					display: flex;
					justify-content: space-between;
					margin-bottom: 3px;
					font-size: 11px;
				}

				.total-paid {
					font-weight: bold;
					border-top: 1px solid #ccc;
					padding-top: 5px;
					margin-top: 5px;
				}

				.outstanding-row {
					display: flex;
					justify-content: space-between;
					font-size: 13px;
					font-weight: bold;
					color: #dc3545;
					background-color: #fff3cd;
					padding: 8px;
					margin-top: 8px;
					border-radius: 4px;
				}

				.footer {
					text-align: center;
					margin-top: 20px;
					padding-top: 10px;
					border-top: 2px dashed #000;
					font-size: 11px;
				}

				@media print {
					@page {
						size: 80mm auto;
						margin: 0;
					}

					body {
						width: 80mm;
						padding: 5mm;
						margin: 0;
					}

					.no-print {
						display: none;
					}
				}
			</style>
		</head>
		<body>
			<div class="receipt">
				<!-- Header -->
				<div class="header">
					<div class="company-name">${invoiceData.company || "INTouch"}</div>
					<div style="font-size: 12px;">${__('TAX INVOICE')}</div>
				</div>

				<!-- Invoice Info -->
				<div class="invoice-info">
					<div>
						<span>${__('Invoice #:')}</span>
						<span><strong>${invoiceData.name}</strong></span>
					</div>
					<div>
						<span>${__('Date:')}</span>
						<span>${new Date(invoiceData.posting_date || Date.now()).toLocaleString()}</span>
					</div>
					${
						invoiceData.customer_name
							? `
					<div>
						<span>${__('Customer:')}</span>
						<span>${invoiceData.customer_name}</span>
					</div>
					`
							: ""
					}
					${
						(invoiceData.status === "Partly Paid" || (invoiceData.outstanding_amount && invoiceData.outstanding_amount > 0 && invoiceData.outstanding_amount < invoiceData.grand_total))
							? `
					<div class="partial-status">
						<span>${__('Status:')}</span>
						<span>${__('PARTIAL PAYMENT')}</span>
					</div>
					`
							: ""
					}
				</div>

				<!-- Items -->
				<div class="items-table">
					${invoiceData.items
						.map((item) => {
							// Determine if item has promotional pricing
							const hasItemDiscount =
								(item.discount_percentage &&
									Number.parseFloat(item.discount_percentage) > 0) ||
								(item.discount_amount &&
									Number.parseFloat(item.discount_amount) > 0)
							const isFree = item.is_free_item
							const qty = item.quantity || item.qty

							// Display original list price for transparency
							const displayRate = item.price_list_rate || item.rate
							// Calculate subtotal before any price reductions
							const subtotal = qty * displayRate

							// Check if description contains a comment (has 📝 emoji)
						const hasComment = item.description && item.description.includes('📝')
						let displayName = item.item_name || item.item_code
						let commentText = ''
						
						if (hasComment) {
							const parts = item.description.split('\n📝 ')
							if (parts.length > 1) {
								commentText = parts[1]
							}
						} else if (item.comment) {
							commentText = item.comment
						}

							return `
						<div class="item-row">
							<div class="item-name">
								${displayName} ${isFree ? __('(FREE)') : ""}
							</div>
							${
								commentText
									? `
							<div class="item-comment">
								${commentText}
							</div>
							`
									: ""
							}
							<div class="item-details">
								<span>${qty} × ${formatCurrency(displayRate)}</span>
								<span><strong>${formatCurrency(subtotal)}</strong></span>
							</div>
							${
								hasItemDiscount
									? `
							<div class="item-discount">
								<span>Discount ${item.discount_percentage ? `(${Number(item.discount_percentage).toFixed(2)}%)` : ""}</span>
								<span>-${formatCurrency(item.discount_amount || 0)}</span>
							</div>
							`
									: ""
							}
							${
								item.serial_no
									? `
							<div class="item-serials">
								<div class="item-serials-label">${__('Serial No:')}</div>
								<div class="item-serials-list">${item.serial_no.replace(/\n/g, ', ')}</div>
							</div>
							`
									: ""
							}
						</div>
						`
						})
						.join("")}
				</div>

				<!-- Totals -->
				<div class="totals">
					${
						invoiceData.total_taxes_and_charges &&
						invoiceData.total_taxes_and_charges > 0
							? `
					<div class="total-row">
						<span>${__('Subtotal:')}</span>
						<span>${formatCurrency((invoiceData.grand_total || 0) - (invoiceData.total_taxes_and_charges || 0))}</span>
					</div>
					<div class="total-row">
						<span>${__('Tax:')}</span>
						<span>${formatCurrency(invoiceData.total_taxes_and_charges)}</span>
					</div>
					`
							: ""
					}
					${
						invoiceData.discount_amount
							? `
					<div class="total-row" style="color: #28a745;">
						<span>Additional Discount${invoiceData.additional_discount_percentage ? ` (${Number(invoiceData.additional_discount_percentage).toFixed(1)}%)` : ""}:</span>
						<span>-${formatCurrency(Math.abs(invoiceData.discount_amount))}</span>
					</div>
					`
							: ""
					}
					<div class="total-row grand-total">
						<span>${__('TOTAL:')}</span>
						<span>${formatCurrency(invoiceData.grand_total)}</span>
					</div>
				</div>

				<!-- Payments -->
				${
					invoiceData.payments && invoiceData.payments.length > 0
						? `
				<div class="payments">
					<div style="font-weight: bold; margin-bottom: 5px; font-size: 12px;">Payments:</div>
					${invoiceData.payments
						.map(
							(payment) => `
						<div class="payment-row">
							<span>${payment.mode_of_payment}:</span>
							<span>${formatCurrency(payment.amount)}</span>
						</div>
					`,
						)
						.join("")}
					<div class="payment-row total-paid">
						<span>${__('Total Paid:')}</span>
						<span>${formatCurrency(invoiceData.paid_amount || 0)}</span>
					</div>
					${
						invoiceData.change_amount && invoiceData.change_amount > 0
							? `
					<div class="payment-row" style="font-weight: bold; margin-top: 5px;">
						<span>${__('Change:')}</span>
						<span>${formatCurrency(invoiceData.change_amount)}</span>
					</div>
					`
							: ""
					}
					${
						invoiceData.outstanding_amount && invoiceData.outstanding_amount > 0
							? `
					<div class="outstanding-row">
						<span>${__('BALANCE DUE:')}</span>
						<span>${formatCurrency(invoiceData.outstanding_amount)}</span>
					</div>
					`
							: ""
					}
				</div>
				`
						: ""
				}

				<!-- Footer -->
				<div class="footer">
					<div style="margin-bottom: 5px;">${__('Thank you for your business!')}</div>
					<div style="font-size: 10px;">Powered by <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">INTouch</a></div>
				</div>
			</div>

			<div class="no-print" style="text-align: center; margin-top: 20px;">
				<button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">
					${__('Print Receipt')}
				</button>
				<button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; margin-left: 10px;">
					${__('Close')}
				</button>
			</div>
		</body>
		</html>
	`

	printWindow.document.write(printContent)
	printWindow.document.close()

	// Auto print after load
	printWindow.onload = () => {
		setTimeout(() => {
			printWindow.print()
		}, 250)
	}
}

function formatCurrency(amount) {
	return Number.parseFloat(amount || 0).toFixed(2)
}

/**
 * Fast silent print function - uses direct window.print() with minimal delay
 * This is the fastest method for printing, but may show dialog in some browsers
 * 
 * For true silent printing without dialog, use Network Printing (CUPS) instead
 */
async function printSilently(printUrl) {
	return new Promise((resolve, reject) => {
		try {
			// Use iframe for more reliable printing in Chrome
			const iframe = document.createElement('iframe')
			iframe.style.position = 'fixed'
			iframe.style.right = '0'
			iframe.style.bottom = '0'
			iframe.style.width = '0'
			iframe.style.height = '0'
			iframe.style.border = 'none'
			iframe.style.opacity = '0'
			iframe.style.pointerEvents = 'none'
			iframe.src = printUrl
			
			document.body.appendChild(iframe)
			
			let printed = false
			let attempts = 0
			const maxAttempts = 15
			
			const attemptPrint = () => {
				if (printed || !iframe.parentNode) return
				
				try {
					const contentWindow = iframe.contentWindow
					const contentDoc = iframe.contentDocument || (contentWindow && contentWindow.document)
					
					if (contentDoc && (contentDoc.readyState === 'complete' || contentDoc.readyState === 'interactive' || attempts >= 5)) {
						if (contentWindow) {
							contentWindow.print()
							printed = true
							
							setTimeout(() => {
								if (iframe.parentNode) {
									document.body.removeChild(iframe)
								}
								resolve(true)
							}, 1000)
							return true
						}
					} else if (attempts >= 10 && contentWindow) {
						// Force attempt after many tries
						try {
							contentWindow.print()
							printed = true
							setTimeout(() => {
								if (iframe.parentNode) {
									document.body.removeChild(iframe)
								}
								resolve(true)
							}, 1000)
							return true
						} catch (e) {
							// Continue
						}
					}
				} catch (err) {
					if (err.name === 'SecurityError' || err.message.includes('Blocked')) {
						// Expected - will retry
						if (attempts >= 10 && iframe.contentWindow) {
							try {
								iframe.contentWindow.print()
								printed = true
								setTimeout(() => {
									if (iframe.parentNode) {
										document.body.removeChild(iframe)
									}
									resolve(true)
								}, 1000)
								return true
							} catch (e) {
								// Continue
							}
						}
					} else {
						log.error("Print error:", err)
						if (iframe.parentNode) {
							document.body.removeChild(iframe)
						}
						reject(err)
						return false
					}
				}
				
				attempts++
				return false
			}
			
			// Wait for iframe to load, then print
			iframe.onload = () => {
				setTimeout(() => {
					if (!printed) {
						attemptPrint()
					}
				}, 300)
			}
			
			// Poll for readiness
			const pollInterval = setInterval(() => {
				if (printed || !iframe.parentNode) {
					clearInterval(pollInterval)
					return
				}
				
				if (attempts >= maxAttempts) {
					clearInterval(pollInterval)
					try {
						if (iframe.parentNode && iframe.contentWindow) {
							iframe.contentWindow.print()
							printed = true
							setTimeout(() => {
								if (iframe.parentNode) {
									document.body.removeChild(iframe)
								}
								resolve(true)
							}, 1000)
						}
					} catch (err) {
						if (iframe.parentNode) {
							document.body.removeChild(iframe)
						}
						reject(err)
					}
					return
				}
				
				if (attemptPrint()) {
					clearInterval(pollInterval)
				}
			}, 300)
			
			// Fallback timeout
			setTimeout(() => {
				clearInterval(pollInterval)
				if (!printed && iframe.parentNode) {
					try {
						if (iframe.contentWindow) {
							iframe.contentWindow.print()
							printed = true
							setTimeout(() => {
								if (iframe.parentNode) {
									document.body.removeChild(iframe)
								}
								resolve(true)
							}, 1000)
						}
					} catch (err) {
						if (iframe.parentNode) {
							document.body.removeChild(iframe)
						}
						reject(err)
					}
				}
			}, 5000)
			
		} catch (error) {
			log.error("Silent print setup error:", error)
			reject(error)
		}
	})
}

/**
 * Fast network printing using CUPS - tries network printing first, falls back to browser printing
 * @param {string} invoiceName - The name of the invoice to print
 * @returns {Promise<boolean>} - Returns true if printed successfully via network
 */
async function tryFastNetworkPrint(invoiceName) {
	try {
		const result = await call("pos_next.api.invoices.fast_print_invoice", {
			invoice_name: invoiceName,
		})
		
		if (result.success) {
			log.info("Invoice printed successfully via network printer")
			return true
		} else if (result.fallback) {
			// Network printing not available, use fallback
			return false
		} else {
			log.warn("Network printing failed:", result.error)
			return false
		}
	} catch (error) {
		log.warn("Fast network print not available:", error)
		return false
	}
}

/**
 * Print invoice by name, fetching print format from POS Profile
 * @param {string} invoiceName - The name of the invoice to print
 * @param {string} printFormat - Optional print format override
 * @param {string} letterhead - Optional letterhead override
 * @param {boolean} silentPrint - If true, tries fast network printing first (CUPS), then uses browser printing with minimal delay
 */
export async function printInvoiceByName(
	invoiceName,
	printFormat = null,
	letterhead = null,
	silentPrint = false,
) {
	try {
		// For faster printing, use direct print URL without fetching full invoice
		// This avoids waiting for API calls and makes printing instant
		const doctype = "Sales Invoice"
		const format = printFormat || "POS Next Receipt"

		// Build PDF print URL directly - NO trigger_print to prevent automatic printing
		// which can interfere with cancel button and cause duplicate print dialogs
		const params = new URLSearchParams({
			doctype: doctype,
			name: invoiceName,
			format: format,
			no_letterhead: letterhead ? 0 : 1,
			_lang: "en",
			_t: Date.now(), // Cache buster
		})

		// Don't use trigger_print=1 - we'll call print() manually to prevent duplicate dialogs
		// params.append("trigger_print", "1") // Removed

		if (letterhead) {
			params.append("letterhead", letterhead)
		}

		// Build print URL
		const printUrl = `/printview?${params.toString()}`

		// For silent printing, try fast network printing first (CUPS - no dialog, instant)
		if (silentPrint) {
			const networkPrinted = await tryFastNetworkPrint(invoiceName)
			if (networkPrinted) {
				return true // Successfully printed via network printer
			}
			// Fallback to browser printing if network printing not available
			return await printSilently(printUrl)
		}

		// Normal printing with dialog
		
		// Create hidden iframe for printing
		const iframe = document.createElement('iframe')
		iframe.style.position = 'fixed'
		iframe.style.right = '0'
		iframe.style.bottom = '0'
		iframe.style.width = '0'
		iframe.style.height = '0'
		iframe.style.border = 'none'
		iframe.style.opacity = '0'
		iframe.style.pointerEvents = 'none'
		iframe.src = printUrl
		
		document.body.appendChild(iframe)
		
		let printed = false
		let printDialogShown = false
		let attempts = 0
		const maxAttempts = 15
		let pollInterval = null
		let fallbackTimeout = null
		
		// Cleanup function to stop all timers and remove iframe
		const cleanup = () => {
			if (pollInterval) {
				clearInterval(pollInterval)
				pollInterval = null
			}
			if (fallbackTimeout) {
				clearTimeout(fallbackTimeout)
				fallbackTimeout = null
			}
			// Remove iframe after a delay to ensure print dialog is closed
			setTimeout(() => {
				if (iframe.parentNode) {
					document.body.removeChild(iframe)
				}
			}, 500)
		}
		
		const attemptPrint = () => {
			if (printed || printDialogShown || !iframe.parentNode) return
			
			try {
				// Check if iframe content is accessible and ready
				const contentWindow = iframe.contentWindow
				const contentDoc = iframe.contentDocument || (contentWindow && contentWindow.document)
				
				if (contentDoc) {
					const isReady = contentDoc.readyState === 'complete' || 
					                contentDoc.readyState === 'interactive' ||
					                attempts >= 5 // Force attempt after 5 tries
					
					if (isReady && contentWindow) {
						// Add afterprint listener to detect when dialog is closed (either print or cancel)
						// This prevents duplicate print dialogs
						contentWindow.addEventListener('afterprint', () => {
							printed = true
							printDialogShown = true
							cleanup()
						}, { once: true })
						
						// Try to print
						contentWindow.print()
						printDialogShown = true
						printed = true
						
						// Stop all timers immediately
						cleanup()
						return true
					}
				} else if (attempts >= 10) {
					// After many attempts, try to print anyway
					try {
						if (iframe.contentWindow) {
							iframe.contentWindow.addEventListener('afterprint', () => {
								printed = true
								printDialogShown = true
								cleanup()
							}, { once: true })
							
							iframe.contentWindow.print()
							printDialogShown = true
							printed = true
							cleanup()
							return true
						}
					} catch (finalError) {
						log.error("Error triggering print after retries:", finalError)
						cleanup()
						return false
					}
				}
			} catch (error) {
				// If we can't access the iframe content yet, that's ok - we'll retry
				if (error.name === 'SecurityError' || error.message.includes('Blocked')) {
					// Expected - will retry
				} else if (attempts >= 5) {
					// After several attempts, try anyway
					try {
						if (iframe.contentWindow) {
							iframe.contentWindow.addEventListener('afterprint', () => {
								printed = true
								printDialogShown = true
								cleanup()
							}, { once: true })
							
							iframe.contentWindow.print()
							printDialogShown = true
							printed = true
							cleanup()
							return true
						}
					} catch (finalError) {
						log.error("Error triggering print after retries:", finalError)
						cleanup()
						return false
					}
				}
			}
			
			attempts++
			return false
		}

		// Multiple strategies to ensure print dialog appears in Chrome and Firefox
		
		// Strategy 1: Listen for load event (works well in Firefox)
		iframe.onload = () => {
			setTimeout(() => {
				if (!printed && !printDialogShown) {
					attemptPrint()
				}
			}, 500)
		}
		
		// Strategy 2: Poll for iframe readiness (more reliable in Chrome)
		pollInterval = setInterval(() => {
			if (printed || printDialogShown || !iframe.parentNode) {
				clearInterval(pollInterval)
				pollInterval = null
				return
			}
			
			if (attempts >= maxAttempts) {
				clearInterval(pollInterval)
				pollInterval = null
				// Final attempt
				try {
					if (iframe.parentNode && iframe.contentWindow) {
						iframe.contentWindow.addEventListener('afterprint', () => {
							printed = true
							printDialogShown = true
							cleanup()
						}, { once: true })
						
						iframe.contentWindow.print()
						printDialogShown = true
						printed = true
						cleanup()
					}
				} catch (error) {
					log.error("Final print attempt failed:", error)
					cleanup()
				}
				return
			}
			
			if (attemptPrint()) {
				if (pollInterval) {
					clearInterval(pollInterval)
					pollInterval = null
				}
			}
		}, 300) // Check every 300ms
		
		// Strategy 3: Fallback timeout (safety net)
		fallbackTimeout = setTimeout(() => {
			if (pollInterval) {
				clearInterval(pollInterval)
				pollInterval = null
			}
			if (!printed && !printDialogShown && iframe.parentNode) {
				try {
					if (iframe.contentWindow) {
						iframe.contentWindow.addEventListener('afterprint', () => {
							printed = true
							printDialogShown = true
							cleanup()
						}, { once: true })
						
						iframe.contentWindow.print()
						printDialogShown = true
						printed = true
						cleanup()
					}
				} catch (error) {
					log.error("Error in fallback print:", error)
					cleanup()
				}
			} else {
				cleanup()
			}
		}, 5000) // Extended timeout for Chrome (5 seconds)
		
		return true
	} catch (error) {
		log.error("Error printing invoice:", error)
		// Fallback to full fetch method if direct print fails
		try {
			const invoiceDoc = await call("pos_next.api.invoices.get_invoice", {
				invoice_name: invoiceName,
			})

			if (!invoiceDoc) {
				throw new Error("Invoice not found")
			}

			// If no print format specified and invoice has a POS Profile, fetch its print settings
			if (!printFormat && invoiceDoc.pos_profile) {
				try {
					const posProfileDoc = await call("frappe.client.get", {
						doctype: "POS Profile",
						name: invoiceDoc.pos_profile,
					})

					if (posProfileDoc) {
						printFormat = posProfileDoc.print_format
						letterhead = letterhead || posProfileDoc.letter_head
					}
				} catch (error) {
					log.warn("Could not fetch POS Profile print settings:", error)
					// Continue with default print format
				}
			}

			// Print the invoice
			return await printInvoice(invoiceDoc, printFormat, letterhead)
		} catch (fallbackError) {
			log.error("Error fetching invoice for print:", fallbackError)
			throw fallbackError
		}
	}
}
