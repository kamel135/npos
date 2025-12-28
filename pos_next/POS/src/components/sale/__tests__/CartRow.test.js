import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CartRow from '../CartRow.vue'

describe('CartRow', () => {
	const mockItem = {
		item_code: 'TEST001',
		item_name: 'Test Product',
		rate: 100,
		quantity: 2,
		amount: 200,
	}

	it('renders item information correctly', () => {
		const wrapper = mount(CartRow, {
			props: {
				item: mockItem,
				currency: 'SAR',
			},
		})

		expect(wrapper.text()).toContain('Test Product')
		expect(wrapper.text()).toContain('100')
		expect(wrapper.text()).toContain('2')
		expect(wrapper.text()).toContain('200')
	})

	it('emits increase event when + button is clicked', async () => {
		const wrapper = mount(CartRow, {
			props: {
				item: mockItem,
			},
		})

		const increaseBtn = wrapper.findAll('button')[2] // Third button is increase
		await increaseBtn.trigger('click')

		expect(wrapper.emitted('increase')).toBeTruthy()
		expect(wrapper.emitted('increase')[0]).toEqual([mockItem])
	})

	it('emits decrease event when - button is clicked', async () => {
		const wrapper = mount(CartRow, {
			props: {
				item: mockItem,
			},
		})

		const decreaseBtn = wrapper.findAll('button')[0] // First button is decrease
		await decreaseBtn.trigger('click')

		expect(wrapper.emitted('decrease')).toBeTruthy()
		expect(wrapper.emitted('decrease')[0]).toEqual([mockItem])
	})

	it('emits remove event when delete button is clicked', async () => {
		const wrapper = mount(CartRow, {
			props: {
				item: mockItem,
			},
		})

		const removeBtn = wrapper.findAll('button')[3] // Fourth button is remove
		await removeBtn.trigger('click')

		expect(wrapper.emitted('remove')).toBeTruthy()
		expect(wrapper.emitted('remove')[0]).toEqual([mockItem])
	})

	it('disables decrease button when quantity is 1', () => {
		const singleItem = { ...mockItem, quantity: 1 }
		const wrapper = mount(CartRow, {
			props: {
				item: singleItem,
			},
		})

		const decreaseBtn = wrapper.findAll('button')[0]
		expect(decreaseBtn.attributes('disabled')).toBeDefined()
	})

	it('applies selected styling when isSelected is true', () => {
		const wrapper = mount(CartRow, {
			props: {
				item: mockItem,
				isSelected: true,
			},
		})

		expect(wrapper.classes()).toContain('bg-blue-50')
	})
})

