<template>
	<div 
		class="pos-app" 
		:dir="direction"
		:data-theme="theme"
	>
		<!-- Header -->
		<header class="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
			<div class="h-16 px-4 flex items-center justify-between gap-4">
				<!-- Logo/Brand -->
				<div class="flex items-center gap-3 flex-shrink-0">
					<button
						@click="$emit('toggle-menu')"
						class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors lg:hidden"
						aria-label="Toggle menu"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
						</svg>
					</button>
					<h1 class="text-xl font-bold text-gray-900 dark:text-white">
						<slot name="brand">POS</slot>
					</h1>
				</div>

				<!-- Search Bar -->
				<div class="flex-1 max-w-2xl">
					<div class="relative">
						<input
							v-model="searchQuery"
							@input="handleSearch"
							type="text"
							:placeholder="__('Search products...')"
							class="w-full h-12 pl-12 pr-4 rtl:pr-12 rtl:pl-4 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
						/>
						<div class="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-4 rtl:pr-4 rtl:pl-0 flex items-center pointer-events-none">
							<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
							</svg>
						</div>
					</div>
				</div>

				<!-- Right Actions -->
				<div class="flex items-center gap-2 flex-shrink-0">
					<!-- Status Badges -->
					<slot name="status-badges"></slot>

					<!-- Theme Toggle -->
					<button
						@click="toggleTheme"
						class="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
						:aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
					>
						<svg v-if="theme === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
						</svg>
						<svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
						</svg>
					</button>

					<!-- RTL Toggle -->
					<button
						@click="toggleDirection"
						class="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
						:aria-label="direction === 'rtl' ? 'Switch to LTR' : 'Switch to RTL'"
					>
						<span class="text-sm font-semibold">{{ direction === 'rtl' ? 'ع' : 'EN' }}</span>
					</button>

					<!-- User Menu -->
					<button
						@click="$emit('toggle-user-menu')"
						class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
					>
						<div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
							<slot name="user-avatar">U</slot>
						</div>
					</button>
				</div>
			</div>
		</header>

		<!-- Main Content - 3 Columns Layout -->
		<div class="flex h-[calc(100vh-4rem-4rem)]">
			<!-- Middle: Product Catalog (Main Area) -->
			<main class="flex-1 overflow-hidden">
				<slot name="catalog"></slot>
			</main>

			<!-- Right: Cart/Invoice Sidebar -->
			<aside class="w-96 border-l rtl:border-r rtl:border-l-0 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col overflow-hidden">
				<slot name="cart"></slot>
			</aside>
		</div>

		<!-- Bottom: Checkout Bar (Sticky) -->
		<div class="sticky bottom-0 z-40 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
			<slot name="checkout-bar"></slot>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
	initialTheme: {
		type: String,
		default: 'light'
	},
	initialDirection: {
		type: String,
		default: 'rtl'
	}
})

const emit = defineEmits(['toggle-menu', 'toggle-user-menu', 'search', 'theme-change', 'direction-change'])

// State
const theme = ref(props.initialTheme)
const direction = ref(props.initialDirection)
const searchQuery = ref('')
const searchTimeout = ref(null)

// Methods
const toggleTheme = () => {
	theme.value = theme.value === 'dark' ? 'light' : 'dark'
	emit('theme-change', theme.value)
	localStorage.setItem('pos-theme', theme.value)
}

const toggleDirection = () => {
	direction.value = direction.value === 'rtl' ? 'ltr' : 'rtl'
	emit('direction-change', direction.value)
	localStorage.setItem('pos-direction', direction.value)
}

const handleSearch = () => {
	// Debounced search - 150ms
	if (searchTimeout.value) {
		clearTimeout(searchTimeout.value)
	}
	searchTimeout.value = setTimeout(() => {
		emit('search', searchQuery.value)
	}, 150)
}

// i18n helper
const __ = (text) => text

// Load saved preferences
if (typeof window !== 'undefined') {
	const savedTheme = localStorage.getItem('pos-theme')
	const savedDirection = localStorage.getItem('pos-direction')
	if (savedTheme) theme.value = savedTheme
	if (savedDirection) direction.value = savedDirection
}
</script>

<style scoped>
/* RTL specific adjustments */
[dir="rtl"] .rtl\:right-0 {
	right: 0;
	left: auto;
}

[dir="rtl"] .rtl\:left-auto {
	left: auto;
}

[dir="rtl"] .rtl\:pr-12 {
	padding-right: 3rem;
	padding-left: 0;
}

[dir="rtl"] .rtl\:pl-4 {
	padding-left: 1rem;
	padding-right: 0;
}

[dir="rtl"] .rtl\:pr-4 {
	padding-right: 1rem;
	padding-left: 0;
}

[dir="rtl"] .rtl\:border-r {
	border-right-width: 1px;
}

[dir="rtl"] .rtl\:border-l-0 {
	border-left-width: 0;
}
</style>

