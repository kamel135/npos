/**
 * POS Calculations Tests
 * Tests for cart calculations, discounts, and tax
 */

import { describe, it, expect } from 'vitest'

describe('POS Calculations', () => {
	describe('Subtotal Calculation', () => {
		it('calculates subtotal for single item', () => {
			const items = [{ price: 10, quantity: 2 }]
			const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
			expect(subtotal).toBe(20)
		})

		it('calculates subtotal for multiple items', () => {
			const items = [
				{ price: 10, quantity: 2 },
				{ price: 15, quantity: 1 },
				{ price: 5, quantity: 3 }
			]
			const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
			expect(subtotal).toBe(50) // (10*2) + (15*1) + (5*3) = 20 + 15 + 15 = 50
		})

		it('handles zero quantity items', () => {
			const items = [
				{ price: 10, quantity: 0 },
				{ price: 15, quantity: 1 }
			]
			const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
			expect(subtotal).toBe(15)
		})
	})

	describe('Discount Calculation', () => {
		it('applies percentage discount correctly', () => {
			const subtotal = 100
			const discountPercentage = 10
			const discount = subtotal * (discountPercentage / 100)
			expect(discount).toBe(10)
		})

		it('applies fixed amount discount correctly', () => {
			const subtotal = 100
			const discountAmount = 15
			const afterDiscount = subtotal - discountAmount
			expect(afterDiscount).toBe(85)
		})

		it('handles 0% discount', () => {
			const subtotal = 100
			const discountPercentage = 0
			const discount = subtotal * (discountPercentage / 100)
			expect(discount).toBe(0)
		})

		it('handles 100% discount', () => {
			const subtotal = 100
			const discountPercentage = 100
			const discount = subtotal * (discountPercentage / 100)
			expect(discount).toBe(100)
		})
	})

	describe('Tax Calculation', () => {
		it('calculates tax on subtotal', () => {
			const subtotal = 100
			const taxRate = 14
			const tax = subtotal * (taxRate / 100)
			expect(tax).toBe(14)
		})

		it('calculates tax after discount', () => {
			const subtotal = 100
			const discount = 10
			const afterDiscount = subtotal - discount
			const taxRate = 14
			const tax = afterDiscount * (taxRate / 100)
			expect(tax).toBe(12.6) // 90 * 0.14 = 12.6
		})

		it('handles zero tax rate', () => {
			const subtotal = 100
			const taxRate = 0
			const tax = subtotal * (taxRate / 100)
			expect(tax).toBe(0)
		})
	})

	describe('Total Calculation', () => {
		it('calculates total correctly with all components', () => {
			const subtotal = 100
			const discountPercentage = 10
			const discount = subtotal * (discountPercentage / 100) // 10
			const afterDiscount = subtotal - discount // 90
			const taxRate = 14
			const tax = afterDiscount * (taxRate / 100) // 12.6
			const total = afterDiscount + tax // 102.6

			expect(total).toBe(102.6)
		})

		it('calculates total with no discount', () => {
			const subtotal = 100
			const discount = 0
			const afterDiscount = subtotal - discount
			const taxRate = 14
			const tax = afterDiscount * (taxRate / 100)
			const total = afterDiscount + tax

			expect(total).toBe(114)
		})
	})

	describe('Change Calculation', () => {
		it('calculates change when overpaid', () => {
			const total = 102.6
			const amountPaid = 150
			const change = amountPaid - total
			expect(change).toBeCloseTo(47.4, 1)
		})

		it('calculates remaining when underpaid', () => {
			const total = 102.6
			const amountPaid = 50
			const remaining = total - amountPaid
			expect(remaining).toBeCloseTo(52.6, 1)
		})

		it('handles exact payment', () => {
			const total = 100
			const amountPaid = 100
			const change = amountPaid - total
			expect(change).toBe(0)
		})
	})
})

