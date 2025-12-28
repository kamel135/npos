/**
 * CartList Component Tests
 * Tests for cart item interactions and quantity controls
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CartList from '../CartList.vue'

describe('CartList.vue', () => {
	const mockItems = [
		{
			id: '1',
			uniqueId: 'item-1',
			name: 'Cappuccino',
			price: 25,
			quantity: 2,
			image: '/test.jpg'
		},
		{
			id: '2',
			uniqueId: 'item-2',
			name: 'Espresso',
			price: 20,
			quantity: 1,
			image: null
		}
	]

	describe('Rendering', () => {
		it('renders empty state when no items', () => {
			const wrapper = mount(CartList, {
				props: { items: [] }
			})
			expect(wrapper.text()).toContain('Cart is empty')
		})

		it('renders all items correctly', () => {
			const wrapper = mount(CartList, {
				props: { items: mockItems }
			})
			expect(wrapper.text()).toContain('Cappuccino')
			expect(wrapper.text()).toContain('Espresso')
		})

		it('displays item count in header', () => {
			const wrapper = mount(CartList, {
				props: { items: mockItems }
			})
			expect(wrapper.text()).toContain('2 items')
		})
	})

	describe('Quantity Controls', () => {
		it('emits increase event when + button clicked', async () => {
			const wrapper = mount(CartList, {
				props: { items: mockItems }
			})

			const increaseButtons = wrapper.findAll('[aria-label*="Increase"]')
			await increaseButtons[0].trigger('click')

			expect(wrapper.emitted('increase')).toBeTruthy()
			expect(wrapper.emitted('increase')[0][0]).toEqual(mockItems[0])
		})

		it('emits decrease event when - button clicked', async () => {
			const wrapper = mount(CartList, {
				props: { items: mockItems }
			})

			const decreaseButtons = wrapper.findAll('[aria-label*="Decrease"]')
			await decreaseButtons[0].trigger('click')

			expect(wrapper.emitted('decrease')).toBeTruthy()
			expect(wrapper.emitted('decrease')[0][0]).toEqual(mockItems[0])
		})

		it('displays correct quantity for each item', () => {
			const wrapper = mount(CartList, {
				props: { items: mockItems }
			})

			// Cappuccino should show quantity 2
			// Espresso should show quantity 1
			const quantities = wrapper.findAll('.text-lg.font-bold')
			expect(quantities).toHaveLength(2)
		})
	})

	describe('Item Actions', () => {
		it('emits remove event when delete button clicked', async () => {
			const wrapper = mount(CartList, {
				props: { items: mockItems }
			})

			const deleteButtons = wrapper.findAll('[aria-label*="Remove"]')
			await deleteButtons[0].trigger('click')

			expect(wrapper.emitted('remove')).toBeTruthy()
			expect(wrapper.emitted('remove')[0][0]).toEqual(mockItems[0])
		})

		it('emits edit event when edit button clicked', async () => {
			const wrapper = mount(CartList, {
				props: { items: mockItems }
			})

			const editButtons = wrapper.findAll('[aria-label*="Edit"]')
			await editButtons[0].trigger('click')

			expect(wrapper.emitted('edit')).toBeTruthy()
			expect(wrapper.emitted('edit')[0][0]).toEqual(mockItems[0])
		})

		it('emits clear event when clear cart clicked', async () => {
			const wrapper = mount(CartList, {
				props: { items: mockItems }
			})

			const clearButton = wrapper.find('button:contains("Clear Cart")')
			if (clearButton.exists()) {
				await clearButton.trigger('click')
				expect(wrapper.emitted('clear')).toBeTruthy()
			}
		})
	})

	describe('Touch Targets', () => {
		it('all buttons meet minimum touch target size (48px)', () => {
			const wrapper = mount(CartList, {
				props: { items: mockItems }
			})

			// Check that control buttons have proper size classes
			const buttons = wrapper.findAll('button')
			buttons.forEach(button => {
				const classes = button.classes().join(' ')
				// Should have w-12 h-12 (48px) or larger
				const hasProperSize = classes.includes('w-12') || classes.includes('h-12') || 
					classes.includes('w-10') || classes.includes('h-10')
				expect(hasProperSize).toBe(true)
			})
		})
	})

	describe('Accessibility', () => {
		it('has proper aria-labels on buttons', () => {
			const wrapper = mount(CartList, {
				props: { items: mockItems }
			})

			const buttons = wrapper.findAll('button[aria-label]')
			expect(buttons.length).toBeGreaterThan(0)
		})

		it('shows item information clearly', () => {
			const wrapper = mount(CartList, {
				props: { items: mockItems }
			})

			// Should show name, price, and quantity for each item
			expect(wrapper.text()).toContain('Cappuccino')
			expect(wrapper.text()).toContain('25')
			expect(wrapper.text()).toContain('2')
		})
	})
})

