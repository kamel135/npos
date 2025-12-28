import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TotalsPanel from '../TotalsPanel.vue'

describe('TotalsPanel', () => {
	it('renders all totals correctly', () => {
		const wrapper = mount(TotalsPanel, {
			props: {
				subtotal: 100,
				discount: 10,
				tax: 15,
				grandTotal: 105,
				currency: 'SAR',
			},
		})

		expect(wrapper.text()).toContain('100')
		expect(wrapper.text()).toContain('10')
		expect(wrapper.text()).toContain('15')
		expect(wrapper.text()).toContain('105')
	})

	it('does not show discount row when discount is 0', () => {
		const wrapper = mount(TotalsPanel, {
			props: {
				subtotal: 100,
				discount: 0,
				tax: 15,
				grandTotal: 115,
			},
		})

		expect(wrapper.text()).not.toContain('Discount')
	})

	it('calculates and displays change correctly', () => {
		const wrapper = mount(TotalsPanel, {
			props: {
				subtotal: 100,
				tax: 15,
				grandTotal: 115,
				amountPaid: 150,
			},
		})

		// Change = 150 - 115 = 35
		expect(wrapper.text()).toContain('35')
		expect(wrapper.text()).toContain('Change')
	})

	it('displays remaining amount when payment is insufficient', () => {
		const wrapper = mount(TotalsPanel, {
			props: {
				subtotal: 100,
				tax: 15,
				grandTotal: 115,
				amountPaid: 100,
			},
		})

		// Remaining = 115 - 100 = 15
		expect(wrapper.text()).toContain('15')
		expect(wrapper.text()).toContain('Remaining')
	})

	it('displays tax rate correctly', () => {
		const wrapper = mount(TotalsPanel, {
			props: {
				subtotal: 100,
				tax: 15,
				grandTotal: 115,
				taxRate: 15,
			},
		})

		expect(wrapper.text()).toContain('15%')
	})

	it('handles decimal numbers correctly', () => {
		const wrapper = mount(TotalsPanel, {
			props: {
				subtotal: 99.99,
				discount: 9.99,
				tax: 13.50,
				grandTotal: 103.50,
			},
		})

		expect(wrapper.text()).toMatch(/99\.99/)
		expect(wrapper.text()).toMatch(/9\.99/)
		expect(wrapper.text()).toMatch(/13\.50/)
		expect(wrapper.text()).toMatch(/103\.50/)
	})
})

