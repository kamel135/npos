<template>
	<div class="flex flex-col h-full">
		<!-- Cart Header -->
		<div class="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-900 dark:text-white">
					{{ __('Cart') }}
				</h2>
				<span class="text-sm text-gray-500 dark:text-slate-400">
					{{ items.length }} {{ __('items') }}
				</span>
			</div>
			
			<!-- Clear Cart Button -->
			<button
				v-if="items.length > 0"
				@click="$emit('clear')"
				class="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
			>
				{{ __('Clear Cart') }}
			</button>
		</div>

		<!-- Cart Items List -->
		<div class="flex-1 overflow-y-auto pos-scrollbar">
			<!-- Empty State -->
			<div v-if="items.length === 0" class="flex flex-col items-center justify-center h-full p-8 text-center">
				<div class="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
					<svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
					</svg>
				</div>
				<p class="text-gray-500 dark:text-slate-400">{{ __('Cart is empty') }}</p>
				<p class="text-sm text-gray-400 dark:text-slate-500 mt-1">{{ __('Add items to get started') }}</p>
			</div>

			<!-- Cart Items -->
			<div v-else class="divide-y divide-gray-100 dark:divide-slate-700">
				<div
					v-for="item in items"
					:key="item.id"
					class="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
					:class="{ 'bg-blue-50 dark:bg-blue-900/20': item.selected }"
				>
					<!-- Item Info -->
					<div class="flex gap-3 mb-3">
						<!-- Image -->
						<div class="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden">
							<img
								v-if="item.image"
								:src="item.image"
								:alt="item.name"
								class="w-full h-full object-cover"
							/>
							<div v-else class="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
								{{ item.name?.substring(0, 2).toUpperCase() }}
							</div>
						</div>

						<!-- Details -->
						<div class="flex-1 min-w-0">
							<h3 class="font-semibold text-gray-900 dark:text-white text-sm truncate">
								{{ item.name }}
							</h3>
							<p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
								{{ formatCurrency(item.price) }} × {{ item.quantity }}
							</p>
							<!-- Modifiers/Notes -->
							<div v-if="item.modifiers || item.notes" class="mt-1 text-xs text-gray-500 dark:text-slate-400">
								<span v-if="item.modifiers" class="block">{{ item.modifiers }}</span>
								<span v-if="item.notes" class="block italic">{{ item.notes }}</span>
							</div>
						</div>

						<!-- Item Total -->
						<div class="text-right flex-shrink-0">
							<p class="font-bold text-gray-900 dark:text-white">
								{{ formatCurrency(item.price * item.quantity) }}
							</p>
							<!-- Discount Badge -->
							<span v-if="item.discount" class="inline-block mt-1 text-xs text-red-600 dark:text-red-400">
								-{{ item.discount }}%
							</span>
						</div>
					</div>

					<!-- Controls -->
					<div class="flex items-center justify-between gap-2">
						<!-- Quantity Controls -->
						<div class="flex items-center gap-2">
							<!-- Decrease Button -->
							<button
								@click="$emit('decrease', item)"
								class="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors touch-active"
								:aria-label="`Decrease quantity of ${item.name}`"
							>
								<svg class="w-5 h-5 text-gray-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"/>
								</svg>
							</button>

							<!-- Quantity Display -->
							<div class="w-12 text-center">
								<span class="text-lg font-bold text-gray-900 dark:text-white">
									{{ item.quantity }}
								</span>
							</div>

							<!-- Increase Button -->
							<button
								@click="$emit('increase', item)"
								class="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors touch-active"
								:aria-label="`Increase quantity of ${item.name}`"
							>
								<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/>
								</svg>
							</button>
						</div>

						<!-- Action Buttons -->
						<div class="flex items-center gap-2">
							<!-- Edit/Modifiers Button -->
							<button
								@click="$emit('edit', item)"
								class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
								:aria-label="`Edit ${item.name}`"
							>
								<svg class="w-4 h-4 text-gray-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
								</svg>
							</button>

							<!-- Delete Button -->
							<button
								@click="$emit('remove', item)"
								class="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors"
								:aria-label="`Remove ${item.name}`"
							>
								<svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
defineProps({
	items: {
		type: Array,
		required: true
	}
})

defineEmits(['increase', 'decrease', 'remove', 'edit', 'clear'])

const formatCurrency = (amount) => {
	return new Intl.NumberFormat('ar-EG', {
		style: 'currency',
		currency: 'EGP',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	}).format(amount || 0)
}

const __ = (text) => text
</script>

