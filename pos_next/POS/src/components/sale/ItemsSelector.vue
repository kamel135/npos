<template>
	<div class="flex flex-col h-full bg-white">
		<!-- Control Buttons Grid - Moved from InvoiceCart -->
		<div class="control-buttons-grid grid grid-cols-4 gap-2 p-2 bg-white flex-shrink-0">
			<!-- Row 1 -->
			<button class="pos-header-btn danger" @click="$emit('close-shift')">{{ __('إغلاق الورديه') }}</button>
			<button class="pos-header-btn danger" @click="$emit('logout')">{{ __('خروج') }}</button>
			<button class="pos-header-btn secondary" @click="$emit('show-today-orders')">{{ __('أوردارات اليوم') }}</button>
			<button class="pos-header-btn secondary" @click="$emit('add-comment')">{{ __('كومنت') }}</button>
			<button class="pos-header-btn secondary" @click="handleComingSoon('أدوات')">{{ __('أدوات') }}</button>
			
			<!-- Row 2 -->
			<button class="pos-header-btn light" @click="$emit('set-order-type', 'Takeaway')">{{ __('تيك أواي') }}</button>
			<button class="pos-header-btn primary" @click="handleComingSoon('صالة')">{{ __('صالة') }}</button>
			<button class="pos-header-btn primary" @click="handleComingSoon('ديلفري')">{{ __('ديلفري') }}</button>
			<button class="pos-header-btn secondary" @click="handleComingSoon('التربيزه')">{{ __('التربيزه') }}</button>
            
            <!-- Row 3 -->
            <button class="pos-header-btn secondary" @click="handleDiscountClick">{{ __('الخصم') }}</button>
            <button class="add-remove-btn remove" @click="handleComingSoon('بدون')">{{ __('بدون') }}</button>
			<button class="add-remove-btn add" @click="handleComingSoon('إضافة')">{{ __('إضافة') }}</button>
			<button
                class="add-remove-btn grouping" 
                :class="groupingEnabled ? 'active' : ''"
                @click="toggleGrouping"
            >
                {{ __('تجميع') }}
			</button>
			<!-- Row 4: Finish button spans 3 columns, positioned to fill from start -->
			<button class="finish-btn col-span-3" @click="$emit('finish-bill')">{{ __('انهاء البون') }}</button>
		</div>

		<!-- Item Groups Filter Tabs -->
		<!-- Item Groups Filter Tabs (Moved to SideCategories) -->
		<div class="hidden"></div>

		<!-- Cache Sync Indicator -->
		<div v-if="cacheSyncing" class="px-1.5 sm:px-3 py-1 bg-blue-50 border-b border-blue-200">
			<div class="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-blue-700">
				<div class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
				<span>{{ __('Syncing catalog in background... {0} items cached', [cacheStats.items]) }}</span>
			</div>
		</div>

		<!-- Search Bar with Barcode Scanner and View Controls -->
		<div class="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
			<div class="flex items-center gap-2">
				<!-- Search Input -->
				<div class="flex-1 relative">
					<input
						ref="searchInputRef"
						id="item-search"
						:value="searchTerm"
						@input="handleSearchInput"
						@keydown="handleKeyDown"
						type="text"
						:placeholder="__('Search by item code, name or scan barcode')"
						class="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm bg-gray-50 hover:bg-white transition-colors"
					/>
					<!-- Search Icon -->
					<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
						<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
				</div>
				
				<!-- View Control Buttons -->
				<div class="flex items-center gap-1 border border-gray-300 rounded-lg p-0.5 bg-gray-50">
					<!-- Scan Barcode Button -->
					<button
						@click="showBarcodeScanner = true"
						class="p-2 hover:bg-white rounded-md transition-colors touch-manipulation"
						:title="__('Scan Barcode')"
						:aria-label="__('Scan Barcode')"
					>
						<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
						</svg>
					</button>
					
					<div class="w-px h-6 bg-gray-300"></div>
					
					<!-- Add Image Button -->
					<button
						@click="handleAddImage"
						class="p-2 hover:bg-white rounded-md transition-colors touch-manipulation"
						:title="__('Add Image')"
						:aria-label="__('Add Image')"
					>
						<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
					</button>
					
					<div class="w-px h-6 bg-gray-300"></div>
					
					<!-- Grid View with Images Button -->
					<button
						@click="viewMode = 'grid'; showImages = true"
						:class="[
							'p-2 hover:bg-white rounded-md transition-colors touch-manipulation',
							viewMode === 'grid' && showImages ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
						]"
						:title="__('Grid View with Images')"
						:aria-label="__('Grid View with Images')"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
						</svg>
					</button>
					
					<div class="w-px h-6 bg-gray-300"></div>
					
					<!-- List View without Images Button -->
					<button
						@click="viewMode = 'list'; showImages = false"
						:class="[
							'p-2 hover:bg-white rounded-md transition-colors touch-manipulation',
							viewMode === 'list' && !showImages ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
						]"
						:title="__('List View without Images')"
						:aria-label="__('List View without Images')"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Barcode Scanner Dialog -->
		<BarcodeScanner
			v-model="showBarcodeScanner"
			@scan="handleBarcodeScanned"
		/>

		<!-- Customer Dialog -->
		<CustomerDialog
			v-model="showCustomerDialog"
			:pos-profile="posProfile"
			@customer-selected="handleCustomerSelected"
		/>

		<!-- Initial Loading State - Only for first load -->
		<div v-if="loading && !filteredItems" class="flex-1 flex items-center justify-center p-3">
			<div class="text-center py-8">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
				<p class="mt-3 text-xs text-gray-500">{{ __('Loading items...') }}</p>
			</div>
		</div>

		<!-- Empty State - Simple, no animation -->
		<div
			v-else-if="(!filteredItems || filteredItems.length === 0)"
			class="flex-1 flex items-center justify-center p-3"
		>
			<div class="text-center py-8">
				<svg
					class="mx-auto h-8 w-8 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
					/>
				</svg>
				<p v-if="searchTerm || selectedItemGroup" class="mt-2 text-xs font-medium text-gray-700">
					<span v-if="searchTerm && selectedItemGroup">{{ __('No results for {0} in {1}', [searchTerm, selectedItemGroup]) }}</span>
					<span v-else-if="selectedItemGroup">{{ __('No results in {0}', [selectedItemGroup]) }}</span>
					<span v-else>{{ __('No results for {0}', [searchTerm]) }}</span>
				</p>
				<p v-else class="mt-2 text-xs text-gray-500">{{ __('No items available') }}</p>
			</div>
		</div>

		<!-- Grid View -->
		<div v-if="viewMode === 'grid'" key="grid" class="flex-1 flex flex-col overflow-hidden min-h-0 relative">
			<!-- Up Arrow for Products -->
			<button 
				@click.stop="scrollProductsUp"
				@touchstart.stop.prevent="scrollProductsUp"
				@mousedown.stop.prevent="scrollProductsUp"
				@touchend.stop.prevent
				class="products-scroll-btn up"
				:disabled="!canScrollProductsUp"
				type="button"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
				</svg>
			</button>

			<div
				ref="gridScrollContainer"
				class="flex-1 overflow-y-auto p-1.5 sm:p-3"
				style="min-height: 0;"
				@scroll="handleProductsScroll"
			>
				<!-- Compact grid: more items visible on screen -->
				<div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5 sm:gap-2">
					<div
						v-for="item in paginatedItems"
						:key="item.item_code"
						@touchstart="getOptimizedClickHandler(item).touchstart"
						@touchmove="getOptimizedClickHandler(item).touchmove"
						@touchend="getOptimizedClickHandler(item).touchend"
						@click="getOptimizedClickHandler(item).click"
						:class="[
							'group relative cursor-pointer bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden flex flex-col',
							'min-h-[90px] sm:min-h-[100px] md:min-h-[110px]',
							'touch-manipulation',
						]"
						style="touch-action: manipulation; -webkit-tap-highlight-color: transparent; pointer-events: auto;"
					>
						<!-- Stock Badge - Removed per user request -->

						<!-- Item Image - Compact size with fixed height for Chrome compatibility -->
						<div v-if="showImages" class="relative bg-gray-50 border-b border-gray-100" style="width: 100%; padding-bottom: 75%; position: relative; overflow: hidden;">
							<!-- Image with conditional blur on hover -->
							<div :class="[
								'absolute inset-0 w-full h-full transition-all duration-300',
								(item.is_stock_item || item.is_bundle) && (item.actual_qty ?? item.stock_qty ?? 0) <= 0 ? 'group-hover:blur-sm group-hover:brightness-75' : ''
							]">
								<LazyImage
									v-if="item.image"
									:src="item.image"
									:alt="item.item_name"
									container-class="relative w-full h-full"
									img-class="w-full h-full object-cover"
									root-margin="100px"
								>
									<template #error>
										<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
											<svg class="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
										</div>
									</template>
								</LazyImage>
								<div v-else class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
									<svg class="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>
							</div>

							<!-- Warehouse Availability Info Icon - Removed per user request -->
						</div>

						<!-- Item Details - Compact padding -->
						<div class="p-1.5 sm:p-2 flex-1 flex flex-col justify-between min-w-0 bg-white" style="min-height: 0;">
							<h3 class="text-[11px] sm:text-xs font-semibold text-gray-800 mb-0.5 leading-tight line-clamp-2-compat" :title="item.item_name">
								{{ item.item_name }}
							</h3>
							<div class="flex items-center justify-between mt-auto gap-1">
								<p class="text-xs sm:text-sm font-bold text-blue-600 truncate">
									{{ formatCurrency(item.rate || item.price_list_rate || 0) }}
								</p>
								<span class="text-[9px] text-gray-500 font-medium bg-gray-100 px-1 py-0.5 rounded flex-shrink-0">
									{{ item.uom || item.stock_uom || __('Nos', null, 'UOM') }}
								</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Loading More Indicator for Grid View -->
				<div v-if="loadingMore" class="flex justify-center items-center py-4">
					<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
					<p class="ms-2 text-xs text-gray-500">{{ __('Loading more items...') }}</p>
				</div>

				<!-- End of Results Indicator - Only show on last page or when all items fit in one page -->
				<div v-else-if="!hasMore && filteredItems.length > 0 && !searchTerm && (currentPage === totalPages || totalPages === 1)" class="flex justify-center items-center py-3">
					<p class="text-xs text-gray-400">{{ __('All items loaded') }}</p>
				</div>

				<!-- Search Results Count -->
				<div v-else-if="searchTerm && filteredItems.length > 0" class="flex justify-center items-center py-3">
					<p class="text-xs text-gray-500">{{ __('{0} items found', [filteredItems.length]) }}</p>
				</div>
			</div>

			<!-- Down Arrow for Products -->
			<button 
				@click.stop="scrollProductsDown"
				@touchstart.stop.prevent="scrollProductsDown"
				@mousedown.stop.prevent="scrollProductsDown"
				@touchend.stop.prevent
				class="products-scroll-btn down"
				:disabled="!canScrollProductsDown"
				type="button"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
				</svg>
			</button>

			<!-- Pagination Controls for Grid View -->
			<div v-if="totalPages > 1" class="px-2 sm:px-3 py-2 bg-white border-t border-gray-200">
				<div class="flex flex-col sm:flex-row items-center justify-between gap-2">
					<div class="text-[10px] sm:text-xs text-gray-600 order-2 sm:order-1">
						{{ __('{0} - {1} of {2}', [
							(((currentPage - 1) * itemsPerPage) + 1),
							Math.min(currentPage * itemsPerPage, filteredItems.length),
							filteredItems.length
						]) }}
					</div>
					<div class="flex items-center gap-1 order-1 sm:order-2">
						<button
							@click="goToPage(1)"
							:disabled="currentPage === 1"
							:class="[
								'px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border transition-[background-color] duration-75 touch-manipulation',
								currentPage === 1
									? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
									: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
							]"
							:aria-label="__('Go to first page')"
						>
							<span class="hidden xs:inline">{{ __('First') }}</span>
							<span class="xs:hidden">«</span>
						</button>
						<button
							@click="previousPage"
							:disabled="currentPage === 1"
							:class="[
								'px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border transition-[background-color] duration-75 touch-manipulation',
								currentPage === 1
									? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
									: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
							]"
							:aria-label="__('Go to previous page')"
						>
							<span class="hidden xs:inline">{{ __('Previous') }}</span>
							<span class="xs:hidden">‹</span>
						</button>
						<div class="flex items-center gap-0.5 sm:gap-1">
							<button
								v-for="page in getPaginationRange()"
								:key="page"
								@click="goToPage(page)"
								:class="[
									'min-w-[28px] sm:min-w-[32px] px-1.5 sm:px-2.5 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border transition-[background-color,border-color] duration-75 touch-manipulation',
									currentPage === page
										? 'bg-blue-600 text-white border-blue-600'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
								]"
								:aria-label="__('Go to page {0}', [page])"
							>
								{{ page }}
							</button>
						</div>
						<button
							@click="nextPage"
							:disabled="currentPage === totalPages"
							:class="[
								'px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border transition-[background-color] duration-75 touch-manipulation',
								currentPage === totalPages
									? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
									: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
							]"
							:aria-label="__('Go to next page')"
						>
							<span class="hidden xs:inline">{{ __('Next') }}</span>
							<span class="xs:hidden">›</span>
						</button>
						<button
							@click="goToPage(totalPages)"
							:disabled="currentPage === totalPages"
							:class="[
								'px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border transition-[background-color] duration-75 touch-manipulation',
								currentPage === totalPages
									? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
									: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
							]"
							:aria-label="__('Go to last page')"
						>
							<span class="hidden xs:inline">{{ __('Last') }}</span>
							<span class="xs:hidden">»</span>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Table View -->
		<div v-if="viewMode === 'list'" key="list" class="flex-1 flex flex-col overflow-hidden min-h-0">
			<div
				ref="listScrollContainer"
				class="flex-1 overflow-x-auto overflow-y-auto"
				style="min-height: 0;"
			>
				<table v-if="paginatedItems.length > 0" class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50 sticky top-0 z-10">
						<tr>
							<th v-if="showImages" scope="col" class="px-2 sm:px-3 py-2 sm:py-2.5 text-start text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10 w-[50px] sm:w-[60px]">{{ __('Image') }}</th>
							<th scope="col" class="px-2 sm:px-3 py-2 sm:py-2.5 text-start text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10 max-w-[120px] sm:max-w-[180px] md:max-w-[200px]">{{ __('Name') }}</th>
							<th scope="col" class="hidden sm:table-cell px-2 sm:px-3 py-2 sm:py-2.5 text-start text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10 sm:max-w-[150px]">{{ __('Code') }}</th>
							<th scope="col" class="px-2 sm:px-3 py-2 sm:py-2.5 text-start text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10 w-[70px] sm:w-[100px]">{{ __('Rate') }}</th>
							<th scope="col" class="px-2 sm:px-3 py-2 sm:py-2.5 text-start text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10 w-[70px] sm:w-[100px]">{{ __('Qty') }}</th>
							<th scope="col" class="hidden md:table-cell px-2 sm:px-3 py-2 sm:py-2.5 text-start text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10 md:w-[80px]">{{ __('UOM') }}</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						<tr
							v-for="item in paginatedItems"
							:key="item.item_code"
							@touchstart="getOptimizedClickHandler(item).touchstart"
							@touchmove="getOptimizedClickHandler(item).touchmove"
							@touchend="getOptimizedClickHandler(item).touchend"
							@click="getOptimizedClickHandler(item).click"
							class="group cursor-pointer hover:bg-blue-50 hover:shadow-md transition-[background-color,box-shadow] duration-100 touch-manipulation active:bg-blue-100"
							style="touch-action: manipulation; -webkit-tap-highlight-color: transparent; pointer-events: auto;"
						>
							<td v-if="showImages" class="px-2 sm:px-3 py-2 whitespace-nowrap w-[50px] sm:w-[60px]">
								<div class="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
									<LazyImage
										v-if="item.image"
										:src="item.image"
										:alt="item.item_name"
										container-class="relative w-full h-full"
										img-class="w-full h-full object-cover"
										root-margin="100px"
									>
										<template #error>
											<svg class="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
										</template>
									</LazyImage>
									<svg v-else class="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>
							</td>
							<td class="px-2 sm:px-3 py-2 max-w-[120px] sm:max-w-[180px] md:max-w-[200px]">
								<div class="text-xs sm:text-sm font-medium text-gray-900 truncate" :title="item.item_name">
									{{ item.item_name }}
								</div>
							</td>
							<td class="hidden sm:table-cell px-2 sm:px-3 py-2 whitespace-nowrap sm:max-w-[150px]">
								<div class="text-xs sm:text-sm text-gray-500 truncate" :title="item.item_code">{{ item.item_code }}</div>
							</td>
							<td class="px-2 sm:px-3 py-2 whitespace-nowrap w-[70px] sm:w-[100px]">
								<div class="text-xs sm:text-sm font-semibold text-blue-600">{{ formatCurrency(item.rate || item.price_list_rate || 0) }}</div>
							</td>
							<td class="px-2 sm:px-3 py-2 whitespace-nowrap w-[70px] sm:w-[100px]">
								<div
									v-if="item.is_stock_item || item.is_bundle"
									class="relative inline-flex"
								>
									<!-- Stock Badge - Removed per user request -->
								</div>
								<span
									v-else
									class="text-xs sm:text-sm text-gray-400 italic"
								>
									{{ __('N/A') }}
								</span>
							</td>
							<td class="hidden md:table-cell px-2 sm:px-3 py-2 whitespace-nowrap md:w-[80px]">
								<div class="text-xs sm:text-sm text-gray-500">{{ item.uom || item.stock_uom || __('Nos', null, 'UOM') }}</div>
							</td>
						</tr>
						<!-- Loading More Indicator Row -->
						<tr v-if="loadingMore">
							<td colspan="6" class="px-2 sm:px-3 py-4 text-center bg-white">
								<div class="flex justify-center items-center">
									<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
									<p class="ms-2 text-xs text-gray-500">{{ __('Loading more items...') }}</p>
								</div>
							</td>
						</tr>

						<!-- End of Results Indicator Row - Only show on last page or when all items fit in one page -->
						<tr v-else-if="!hasMore && filteredItems.length > 0 && !searchTerm && (currentPage === totalPages || totalPages === 1)">
							<td colspan="6" class="px-2 sm:px-3 py-3 text-center bg-white">
								<p class="text-xs text-gray-400">{{ __('All items loaded') }}</p>
							</td>
						</tr>

						<!-- Search Results Count Row -->
						<tr v-else-if="searchTerm && filteredItems.length > 0">
							<td colspan="6" class="px-2 sm:px-3 py-3 text-center bg-white">
								<p class="text-xs text-gray-500">{{ __('{0} items found', [filteredItems.length]) }}</p>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- Pagination Controls for List View -->
			<div v-if="totalPages > 1" class="px-2 sm:px-3 py-2 bg-white border-t border-gray-200">
				<div class="flex flex-col sm:flex-row items-center justify-between gap-2">
					<div class="text-[10px] sm:text-xs text-gray-600 order-2 sm:order-1">
						{{ __('{0} - {1} of {2}', [
							(((currentPage - 1) * itemsPerPage) + 1),
							Math.min(currentPage * itemsPerPage, filteredItems.length),
							filteredItems.length
						]) }}
					</div>
					<div class="flex items-center gap-1 order-1 sm:order-2">
						<button
							@click="goToPage(1)"
							:disabled="currentPage === 1"
							:class="[
								'px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border transition-[background-color] duration-75 touch-manipulation',
								currentPage === 1
									? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
									: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
							]"
							:aria-label="__('Go to first page')"
						>
							<span class="hidden xs:inline">{{ __('First') }}</span>
							<span class="xs:hidden">«</span>
						</button>
						<button
							@click="previousPage"
							:disabled="currentPage === 1"
							:class="[
								'px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border transition-[background-color] duration-75 touch-manipulation',
								currentPage === 1
									? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
									: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
							]"
							:aria-label="__('Go to previous page')"
						>
							<span class="hidden xs:inline">{{ __('Previous') }}</span>
							<span class="xs:hidden">‹</span>
						</button>
						<div class="flex items-center gap-0.5 sm:gap-1">
							<button
								v-for="page in getPaginationRange()"
								:key="page"
								@click="goToPage(page)"
								:class="[
									'min-w-[28px] sm:min-w-[32px] px-1.5 sm:px-2.5 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border transition-[background-color,border-color] duration-75 touch-manipulation',
									currentPage === page
										? 'bg-blue-600 text-white border-blue-600'
										: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
								]"
								:aria-label="__('Go to page {0}', [page])"
							>
								{{ page }}
							</button>
						</div>
						<button
							@click="nextPage"
							:disabled="currentPage === totalPages"
							:class="[
								'px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border transition-[background-color] duration-75 touch-manipulation',
								currentPage === totalPages
									? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
									: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
							]"
							:aria-label="__('Go to next page')"
						>
							<span class="hidden xs:inline">{{ __('Next') }}</span>
							<span class="xs:hidden">›</span>
						</button>
						<button
							@click="goToPage(totalPages)"
							:disabled="currentPage === totalPages"
							:class="[
								'px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border transition-[background-color] duration-75 touch-manipulation',
								currentPage === totalPages
									? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
									: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
							]"
							:aria-label="__('Go to last page')"
						>
							<span class="hidden xs:inline">{{ __('Last') }}</span>
							<span class="xs:hidden">»</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Warehouse Availability Dialog -->
	<WarehouseAvailabilityDialog
		v-if="warehouseDialogItem"
		:show="showWarehouseDialog"
		:item-code="warehouseDialogItem.itemCode"
		:item-name="warehouseDialogItem.itemName"
		:uom="warehouseDialogItem.uom"
		:company="warehouseDialogItem.company"
		@close="showWarehouseDialog = false"
	/>
</template>

<script setup>
import LazyImage from "@/components/common/LazyImage.vue"
import WarehouseAvailabilityDialog from "@/components/sale/WarehouseAvailabilityDialog.vue"
import BarcodeScanner from "@/components/common/BarcodeScanner.vue"
import { useItemSearchStore } from "@/stores/itemSearch"
import { usePOSCartStore } from "@/stores/posCart"
import { usePOSSettingsStore } from "@/stores/posSettings"
import { useStock } from "@/composables/useStock"
import { formatCurrency as formatCurrencyUtil } from "@/utils/currency"
import { useToast } from "@/composables/useToast"
import { storeToRefs } from "pinia"
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import {
	createOptimizedClickHandler,
	throttleRAF,
	addPassiveListener,
	runWhenIdle
} from "@/utils/lowEndOptimizations"

const props = defineProps({
	posProfile: String,
	cartItems: {
		type: Array,
		default: () => [],
	},
	currency: {
		type: String,
		default: "USD",
	},
	customer: {
		type: Object,
		default: null,
	},
})

const emit = defineEmits([
    "item-selected", 
    "select-customer", 
    "show-history",
    "close-shift",
    "show-today-orders",
    "show-tools",
    "add-comment",
    "set-order-type",
    "select-table",
    "show-discount",
    "add-image",
    "trigger-remove-item",
    "trigger-add-item",
    "finish-bill"
])

// Use composables
const { getStockStatus } = useStock()
const settingsStore = usePOSSettingsStore()
const { showError, showWarning } = useToast()

// Use Pinia store
const itemStore = useItemSearchStore()
const cartStore = usePOSCartStore()
const { groupingEnabled } = storeToRefs(cartStore)
const { toggleGrouping } = cartStore

// Check if user has System Manager role
const isSystemManager = ref(false)
const rolesChecked = ref(false)

// Check user roles on mount - runs once when component mounts
const checkUserRoles = async () => {
	if (rolesChecked.value) return
	
		try {
		// Try multiple ways to check for System Manager role
		// Method 1: Check window.frappe.user.has_role (most reliable)
		if (window.frappe?.user?.has_role) {
			isSystemManager.value = window.frappe.user.has_role('System Manager')
			rolesChecked.value = true
			return
		}
		
		// Method 2: Check window.frappe.boot.user.roles
		if (window.frappe?.boot?.user?.roles) {
			isSystemManager.value = window.frappe.boot.user.roles.includes('System Manager')
			rolesChecked.value = true
			return
		}
		
		// Method 3: Check window.frappe.user_roles (legacy)
		if (window.frappe?.user_roles) {
			isSystemManager.value = window.frappe.user_roles.includes('System Manager')
			rolesChecked.value = true
			return
		}
		
		// Method 4: Call backend API to get user roles
		const { call } = await import('@/utils/apiWrapper')
		const result = await call('frappe.client.get_list', {
			doctype: 'Has Role',
			filters: {
				parent: window.frappe?.session?.user || '',
				role: 'System Manager'
			},
			limit_page_length: 1
		})
		
		isSystemManager.value = result && result.length > 0
		rolesChecked.value = true
	} catch (error) {
		console.error('Error checking user roles:', error)
		// Fallback: assume not System Manager for safety
		isSystemManager.value = false
		rolesChecked.value = true
	}
}

// Handle discount button click - allow for System Manager
function handleDiscountClick() {
	// Always emit - let parent handle permission check
	emit('show-discount')
}

// Handle coming soon buttons - do nothing
function handleComingSoon(buttonName) {
	// No action - button not yet implemented
}

const {
	filteredItems,
	searchTerm,
	selectedItemGroup,
	itemGroups,
	loading,
	loadingMore,
	hasMore,
	cacheSyncing,
	cacheStats,
	sortBy,
	sortOrder,
} = storeToRefs(itemStore)

	// Local state
const viewMode = ref("grid")
const showImages = ref(true)
const showCustomerDialog = ref(false)
const showBarcodeScanner = ref(false)
const itemThreshold = ref(50) // Threshold for auto-switching to list view
const userManuallySetView = ref(false) // Track if user manually changed view mode
const scannerInputDetected = ref(false) // Track if current input is from scanner
const autoSearchTimer = ref(null) // Timer for auto-search when typing stops
const lastAutoSwitchCount = ref(0)
const lastFilterSignature = ref("")
const showSortDropdown = ref(false) // Sort dropdown visibility

// Warehouse availability dialog state
const showWarehouseDialog = ref(false)
const warehouseDialogItem = ref(null)

// Infinite scroll refs
const gridScrollContainer = ref(null)
const listScrollContainer = ref(null)

// Store scroll listener cleanup functions
const scrollCleanupFns = ref([])

// Products scroll arrows state
const canScrollProductsUp = ref(false)
const canScrollProductsDown = ref(false)

// Pagination state (for client-side display)
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Computed paginated items
// filteredItems is already reactive and includes live stock from stockStore
const paginatedItems = computed(() => {
	if (!filteredItems.value) return []
	const start = (currentPage.value - 1) * itemsPerPage.value
	const end = start + itemsPerPage.value
	return filteredItems.value.slice(start, end)
})

const totalPages = computed(() => {
	if (!filteredItems.value) return 0
	return Math.ceil(filteredItems.value.length / itemsPerPage.value)
})

const SEARCH_PLACEHOLDERS = Object.freeze({
	auto: __("Auto-Add ON - Type or scan barcode"),
	scanner: __("Scanner ON - Enable Auto for automatic addition"),
	default: __("Search by item code, name or scan barcode"),
})

// Sort configuration
const SORT_OPTIONS = Object.freeze([
	{
		field: 'name',
		label: __('Name'),
		icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
	},
	{
		field: 'quantity',
		label: __('Quantity'),
		icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
	},
	{
		field: 'item_group',
		label: __('Item Group'),
		icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
	},
	{
		field: 'price',
		label: __('Price'),
		icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
	},
	{
		field: 'item_code',
		label: __('Item Code'),
		icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14'
	}
])

const SORT_ICONS = Object.freeze({
	ascending: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12',
	descending: 'M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4',
	inactive: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
})

const searchMode = computed(() => {
	if (autoAddEnabled.value) {
		return "auto"
	}

	if (scannerEnabled.value) {
		return "scanner"
	}

	return "default"
})

const searchPlaceholder = computed(() => SEARCH_PLACEHOLDERS[searchMode.value])

// Watch for cart items and pos profile changes (optimized - uses length + hash instead of deep watch)
// Tracks: length, item_code, quantity, and amount to detect all cart changes including array replacements
watch(
	() =>
		`${props.cartItems.length}-${props.cartItems.map((i) => `${i.item_code}:${i.quantity || 0}:${i.amount || 0}`).join("|")}`,
	() => {
		itemStore.setCartItems(props.cartItems)
	},
	{ immediate: true, flush: 'sync' }, // Synchronous to ensure immediate stock updates
)

watch(
	() => props.posProfile,
	(newProfile) => {
		if (newProfile) {
			itemStore.setPosProfile(newProfile)
		}
	},
	{ immediate: true },
)

// Reset to page 1 when filtered items meaningfully change
watch(
	filteredItems,
	(newItems) => {
		if (!newItems) return

		const itemCount = newItems.length
		const firstCode = itemCount > 0 ? newItems[0]?.item_code || "" : ""
		const lastCode =
			itemCount > 0 ? newItems[itemCount - 1]?.item_code || "" : ""
		const middleIndex = itemCount > 2 ? Math.floor(itemCount / 2) : -1
		const middleCode =
			middleIndex >= 0 ? newItems[middleIndex]?.item_code || "" : ""
		const signature = `${itemCount}|${firstCode}|${middleCode}|${lastCode}`

		if (signature !== lastFilterSignature.value) {
			currentPage.value = 1
			lastFilterSignature.value = signature
		}

		// Only auto-switch if user hasn't manually set a preference
		// and we're in grid view with many items
		if (
			!userManuallySetView.value &&
			viewMode.value === "grid" &&
			itemCount > itemThreshold.value
		) {
			if (lastAutoSwitchCount.value !== itemCount) {
				viewMode.value = "list"
				lastAutoSwitchCount.value = itemCount
			}
		} else if (itemCount <= itemThreshold.value) {
			lastAutoSwitchCount.value = 0
		}
	},
	{ immediate: false },
)

// Throttle scroll handler for better performance
let scrollTimeout = null

// Optimized scroll handler using RAF throttling
const handleScrollRAF = throttleRAF((event) => {
	const container = event.target
	const scrollPosition = container.scrollTop + container.clientHeight
	const scrollHeight = container.scrollHeight
	const threshold = 200

	const isSearching = searchTerm.value && searchTerm.value.trim().length > 0

	if (
		!isSearching &&
		scrollHeight - scrollPosition < threshold &&
		hasMore.value &&
		!loadingMore.value &&
		!loading.value
	) {
		// Use runWhenIdle to load more items without blocking scroll
		runWhenIdle(() => {
			itemStore.loadMoreItems()
		}, { timeout: 1000 })
	}
})

function handleScroll(event) {
	handleScrollRAF(event)
}

// Products scroll handlers
const handleProductsScroll = () => {
	if (!gridScrollContainer.value) return
	const { scrollTop, scrollHeight, clientHeight } = gridScrollContainer.value
	canScrollProductsUp.value = scrollTop > 0
	canScrollProductsDown.value = scrollTop + clientHeight < scrollHeight - 1 // -1 for tolerance
}

const scrollProductsUp = (e) => {
	if (e) {
		e.preventDefault()
		e.stopPropagation()
		e.stopImmediatePropagation()
	}
	if (gridScrollContainer.value) {
		// Always try to scroll, let handleProductsScroll update the state
		gridScrollContainer.value.scrollBy({ top: -200, behavior: 'smooth' })
		// Update state immediately
		setTimeout(() => handleProductsScroll(), 100)
	}
	return false
}

const scrollProductsDown = (e) => {
	if (e) {
		e.preventDefault()
		e.stopPropagation()
		e.stopImmediatePropagation()
	}
	if (gridScrollContainer.value) {
		// Always try to scroll, let handleProductsScroll update the state
		gridScrollContainer.value.scrollBy({ top: 200, behavior: 'smooth' })
		// Update state immediately
		setTimeout(() => handleProductsScroll(), 100)
	}
	return false
}

onMounted(() => {
	// Items are now loaded automatically by setPosProfile() in the watcher
	// This ensures item group filters are loaded BEFORE fetching items

	// Add passive scroll listeners for better performance
	// Only bind to the currently active view
	if (viewMode.value === 'grid' && gridScrollContainer.value) {
		const cleanup = addPassiveListener(
			gridScrollContainer.value,
			'scroll',
			handleScroll,
			{ passive: true }
		)
		scrollCleanupFns.value.push(cleanup)
		
		// Also add handler for products scroll arrows
		const productsScrollCleanup = addPassiveListener(
			gridScrollContainer.value,
			'scroll',
			handleProductsScroll,
			{ passive: true }
		)
		scrollCleanupFns.value.push(productsScrollCleanup)
		
		// Initial check - wait for content to load
		nextTick(() => {
			// Check multiple times to ensure content is loaded
			setTimeout(() => {
				handleProductsScroll()
			}, 100)
			setTimeout(() => {
				handleProductsScroll()
			}, 500)
		})
	} else if (viewMode.value === 'list' && listScrollContainer.value) {
		const cleanup = addPassiveListener(
			listScrollContainer.value,
			'scroll',
			handleScroll,
			{ passive: true }
		)
		scrollCleanupFns.value.push(cleanup)
	}

	// Add click outside listener for sort dropdown
	document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
	// Cleanup background sync when component unmounts
	itemStore.cleanup()

	// Clear scroll timeout
	if (scrollTimeout) {
		clearTimeout(scrollTimeout)
		scrollTimeout = null
	}

	// Cleanup passive listeners
	scrollCleanupFns.value.forEach(cleanup => cleanup())
	scrollCleanupFns.value = []

	// Clear optimized click handlers
	optimizedClickHandlers.clear()

	// Remove click outside listener for sort dropdown
	document.removeEventListener('click', handleClickOutside)
})

// Handle keydown for barcode scanner detection
function handleKeyDown(event) {
	const currentTime = Date.now()
	const timeDiff = currentTime - lastKeyTime.value

	// If Enter/newline is pressed, trigger barcode search
	if (event.key === "Enter") {
		event.preventDefault()

		// Auto-add if Auto-Add mode is enabled (regardless of manual typing vs scanner)
		if (autoAddEnabled.value) {
			// Auto-add enabled - add item directly to cart
			handleBarcodeSearch(true) // Pass true to indicate auto-add
		} else {
			// Auto-add disabled - normal search behavior
			handleBarcodeSearch(false)
		}

		// Reset detection
		barcodeBuffer.value = ""
		scannerInputDetected.value = false

		// Clear auto-search timer since Enter was pressed
		if (autoSearchTimer.value) {
			clearTimeout(autoSearchTimer.value)
			autoSearchTimer.value = null
		}

		return
	}

	// Barcode scanners typically input very fast (< 50ms between characters)
	// If time between keystrokes is very short, it's likely a barcode scanner
	if (
		timeDiff < 50 &&
		event.key.length === 1 &&
		barcodeBuffer.value.length > 0
	) {
		barcodeBuffer.value += event.key
		scannerInputDetected.value = true // Mark as scanner input
	} else if (event.key.length === 1) {
		// Manual typing - reset buffer
		barcodeBuffer.value = event.key
		scannerInputDetected.value = false // Mark as manual input
	}

	lastKeyTime.value = currentTime
}

// Handle search input with instant reactivity
function handleSearchInput(event) {
	const value = event.target.value
	itemStore.setSearchTerm(value)

	// Clear any existing timer
	if (autoSearchTimer.value) {
		clearTimeout(autoSearchTimer.value)
		autoSearchTimer.value = null
	}

	// If Auto-Add is enabled and user is typing, automatically trigger search after they stop
	if (autoAddEnabled.value && value.trim().length > 0) {
		// Wait 500ms after user stops typing, then auto-search and add
		autoSearchTimer.value = setTimeout(() => {
			handleBarcodeSearch(true) // Auto-add mode
		}, 500) // 500ms delay after typing stops
	}
}

// Create optimized click handlers for better touch response
const optimizedClickHandlers = new Map()

function getOptimizedClickHandler(item) {
	const key = item.item_code
	if (!optimizedClickHandlers.has(key)) {
		// Pass item_code instead of item reference to avoid closure issues
		const handler = createOptimizedClickHandler(() => {
			handleItemClick(item.item_code)
		}, {
			feedback: true
		})
		optimizedClickHandlers.set(key, handler)
	}
	return optimizedClickHandlers.get(key)
}

function handleItemClick(itemCode) {
	// Find the current item by code to get latest stock values
	const item = filteredItems.value.find(i => i.item_code === itemCode)
	if (!item) return

	// Stock validation removed per user request - allow adding items regardless of stock

	emit("item-selected", item)
}

async function handleBarcodeSearch(forceAutoAdd = false) {
	const barcode = searchTerm.value.trim()

	if (!barcode) {
		return
	}

	// Auto-add if explicitly requested (from scanner newline detection)
	// OR if both scanner and auto-add modes are enabled
	const shouldAutoAdd =
		forceAutoAdd || (scannerEnabled.value && autoAddEnabled.value)

	try {
		// First try exact barcode lookup via API
		const item = await itemStore.searchByBarcode(barcode)

		if (item) {
			// Item found by barcode - add to cart immediately with auto-add flag
			emit("item-selected", item, shouldAutoAdd)
			itemStore.clearSearch()
			return
		}
	} catch (error) {
		console.error("Barcode API error:", error)
	}

	// Fallback: If only one item matches in filtered results, auto-select it
	if (filteredItems.value.length === 1) {
		emit("item-selected", filteredItems.value[0], shouldAutoAdd)
		itemStore.clearSearch()
	} else if (filteredItems.value.length === 0) {
		showWarning(__('Item Not Found: No item found with barcode: {0}', [barcode]))

		// If scanner mode is enabled, clear search immediately for next scan
		if (shouldAutoAdd) {
			itemStore.clearSearch()
		}
	} else {
		if (shouldAutoAdd) {
			// In scanner mode, don't show manual selection - just notify
			showWarning(__('Multiple Items Found: {0} items match barcode. Please refine search.', [filteredItems.value.length]))
		} else {
			showWarning(__('Multiple Items Found: {0} items match. Please select one.', [filteredItems.value.length]))
		}
	}
}

// Handle barcode scanned from camera
function handleBarcodeScanned(barcode) {
	// Set search term to scanned barcode
	itemStore.setSearchTerm(barcode)
	// Trigger barcode search immediately
	handleBarcodeSearch(true) // Auto-add mode
}

// Handle add image click
function handleAddImage() {
	// Create file input element
	const input = document.createElement('input')
	input.type = 'file'
	input.accept = 'image/*'
	input.style.display = 'none'
	
	input.onchange = async (event) => {
		const file = event.target.files[0]
		if (!file) return
		
		// Emit event to parent component with the selected file
		emit("add-image", file)
		
		// Clean up
		document.body.removeChild(input)
	}
	
	// Add to body and trigger click
	document.body.appendChild(input)
	input.click()
}

function toggleBarcodeScanner() {
	scannerEnabled.value = !scannerEnabled.value

	// Disable auto-add when scanner is disabled
	if (!scannerEnabled.value) {
		autoAddEnabled.value = false
	}

	// Focus on search input when enabling scanner
	if (scannerEnabled.value) {
		const input = searchInputRef.value || document.getElementById("item-search")
		if (input) {
			input.focus()
		}
	}
}

function toggleAutoAdd() {
	// Auto-add works independently - no need for scanner mode
	autoAddEnabled.value = !autoAddEnabled.value

	// Auto-enable scanner mode when auto-add is enabled
	if (autoAddEnabled.value && !scannerEnabled.value) {
		scannerEnabled.value = true
	}

	// Clear any pending timer when toggling off
	if (!autoAddEnabled.value && autoSearchTimer.value) {
		clearTimeout(autoSearchTimer.value)
		autoSearchTimer.value = null
	}

	if (autoAddEnabled.value) {
		// Focus on search input
		const input = searchInputRef.value || document.getElementById("item-search")
		if (input) {
			input.focus()
		}
	}
}

function formatCurrency(amount) {
	return formatCurrencyUtil(Number.parseFloat(amount || 0), props.currency)
}

// Show warehouse availability dialog
function showWarehouseAvailability(item) {
	warehouseDialogItem.value = {
		itemCode: item.item_code,
		itemName: item.item_name,
		uom: item.uom || item.stock_uom || 'Nos',
		company: settingsStore.company
	}
	showWarehouseDialog.value = true
}

// Expose methods for parent component
defineExpose({
	loadItems: () => itemStore.loadAllItems(props.posProfile),
	loadItemGroups: () => itemStore.loadItemGroups(),
	loadMoreItems: () => itemStore.loadMoreItems(),
})

// Watch for view mode changes and rebind scroll listeners
watch(viewMode, async () => {
	// Wait for DOM to update
	await nextTick()

	// Clean up existing listeners
	scrollCleanupFns.value.forEach(cleanup => cleanup())
	scrollCleanupFns.value = []

	// Rebind listeners to the new active container
	if (viewMode.value === 'grid' && gridScrollContainer.value) {
		const cleanup = addPassiveListener(
			gridScrollContainer.value,
			'scroll',
			handleScroll,
			{ passive: true }
		)
		scrollCleanupFns.value.push(cleanup)
		
		// Also add handler for products scroll arrows
		const productsScrollCleanup = addPassiveListener(
			gridScrollContainer.value,
			'scroll',
			handleProductsScroll,
			{ passive: true }
		)
		scrollCleanupFns.value.push(productsScrollCleanup)
		
		// Initial check - wait for content to load
		nextTick(() => {
			// Check multiple times to ensure content is loaded
			setTimeout(() => {
				handleProductsScroll()
			}, 100)
			setTimeout(() => {
				handleProductsScroll()
			}, 500)
		})
	} else if (viewMode.value === 'list' && listScrollContainer.value) {
		const cleanup = addPassiveListener(
			listScrollContainer.value,
			'scroll',
			handleScroll,
			{ passive: true }
		)
		scrollCleanupFns.value.push(cleanup)
	}
})

// View mode functions
function setViewMode(mode) {
	viewMode.value = mode
	userManuallySetView.value = true
}

// Pagination functions
function goToPage(page) {
	if (page >= 1 && page <= totalPages.value) {
		currentPage.value = page
	}
}

function nextPage() {
	if (currentPage.value < totalPages.value) {
		currentPage.value++
	}
}

function previousPage() {
	if (currentPage.value > 1) {
		currentPage.value--
	}
}

function getPaginationRange() {
	const range = []
	const total = totalPages.value
	const current = currentPage.value
	const delta = 2 // Number of pages to show on each side of current page

	if (total <= 7) {
		// Show all pages if total is small
		for (let i = 1; i <= total; i++) {
			range.push(i)
		}
	} else {
		// Show smart range with ellipsis
		if (current <= 3) {
			for (let i = 1; i <= 5; i++) {
				range.push(i)
			}
		} else if (current >= total - 2) {
			for (let i = total - 4; i <= total; i++) {
				range.push(i)
			}
		} else {
			for (let i = current - delta; i <= current + delta; i++) {
				range.push(i)
			}
		}
	}

	return range
}

// Sort dropdown functions
function toggleSortDropdown() {
	showSortDropdown.value = !showSortDropdown.value
}

function handleSortToggle(field) {
	if (!field) {
		// Clear sorting
		itemStore.clearSortFilter()
		showSortDropdown.value = false
		return
	}

	// If clicking the same field, toggle between asc/desc
	if (sortBy.value === field) {
		const newOrder = sortOrder.value === 'asc' ? 'desc' : 'asc'
		itemStore.setSortFilter(field, newOrder)
	} else {
		// New field - start with ascending
		itemStore.setSortFilter(field, 'asc')
	}
}

function getSortLabel(sortByValue) {
	const option = SORT_OPTIONS.find(opt => opt.field === sortByValue)
	return option?.label || sortByValue
}

function getSortIconState(field) {
	if (sortBy.value !== field) return 'inactive'
	return sortOrder.value === 'asc' ? 'ascending' : 'descending'
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
	if (showSortDropdown.value) {
		const dropdown = event.target.closest('.relative')
		if (!dropdown || !dropdown.querySelector('button[data-sort-button]')?.contains(event.target)) {
			showSortDropdown.value = false
		}
	}
}

// Check if an item can be added to cart based on stock
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
}

/* Performance optimizations for low-end devices */
[class*="grid-cols-"] > div {
	/* Tell browser which properties will change */
	will-change: opacity;
	/* Use GPU acceleration for transforms */
	transform: translateZ(0);
	/* Optimize for speed over quality */
	backface-visibility: hidden;
	/* Ensure proper layout in Chrome */
	display: flex;
	flex-direction: column;
	position: relative;
	overflow: hidden;
}

/* Line clamp utility for Chrome compatibility */
.line-clamp-2-compat {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	word-break: break-word;
	line-height: 1.3;
}

/* Optimize scroll containers */
.overflow-y-auto, .overflow-x-auto {
	/* Enable smooth scrolling with GPU acceleration */
	-webkit-overflow-scrolling: touch;
	/* Create stacking context for better compositing */
	transform: translateZ(0);
	will-change: scroll-position;
}

/* Reduce paint areas */
.relative {
	/* Isolate paint regions */
	isolation: isolate;
}

/* Optimize images */
img {
	/* Use browser's image optimization */
	image-rendering: -webkit-optimize-contrast;
	image-rendering: crisp-edges;
}

/* Minimal transitions for performance */

/* Performance hints for list rows */
tbody tr {
	/* Optimize for compositing */
	will-change: opacity, background-color;
	/* Create rendering layer */
	contain: layout style paint;
}

/* Remove will-change when not hovering to save resources */
tbody tr:not(:hover):not(:active) {
	will-change: auto;
}

/* Header Buttons - Light blue background with white text */
.pos-header-btn {
	padding: 0.625rem 0.5rem;
	border-radius: 0.375rem;
	font-weight: 600;
	font-size: 0.8rem;
	transition: all 0.2s;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	border: 2px solid #60a5fa;
	background: #60a5fa;
	color: white;
}

.pos-header-btn.primary {
	background: #60a5fa;
	color: white;
	border-color: #3b82f6;
}

.pos-header-btn.primary:hover {
	background: #3b82f6;
	color: white;
	border-color: #2563eb;
}

.pos-header-btn.secondary {
	background: #60a5fa;
	color: white;
	border-color: #3b82f6;
}

.pos-header-btn.secondary:hover {
	background: #3b82f6;
	color: white;
	border-color: #2563eb;
}

.pos-header-btn.light {
	background: #60a5fa;
	color: white;
	border-color: #3b82f6;
}

.pos-header-btn.light:hover {
	background: #3b82f6;
	color: white;
	border-color: #2563eb;
}

.pos-header-btn.danger {
	background: #60a5fa !important;
	color: white !important;
	border-color: #3b82f6 !important;
	display: inline-block !important;
	visibility: visible !important;
	opacity: 1 !important;
}

.pos-header-btn.danger:hover {
	background: #3b82f6 !important;
	color: white !important;
	border-color: #2563eb !important;
}

.pos-header-btn:active {
	transform: scale(0.97);
}

/* Add/Remove Buttons - Light blue background with white text */
.add-remove-btn {
	padding: 0.75rem;
	border-radius: 0.5rem;
	font-weight: bold;
	font-size: 0.95rem;
	transition: all 0.2s;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
	border: 2px solid #60a5fa;
	background: #60a5fa;
	color: white;
}

.add-remove-btn.remove {
	background: #60a5fa;
	color: white;
	border-color: #3b82f6;
}

.add-remove-btn.remove:hover {
	background: #3b82f6;
	color: white;
	border-color: #2563eb;
}

.add-remove-btn.add {
	background: #60a5fa;
	color: white;
	border-color: #3b82f6;
}

.add-remove-btn.add:hover {
	background: #3b82f6;
	color: white;
	border-color: #2563eb;
}

.add-remove-btn:active {
	transform: scale(0.97);
}

/* Finish Bill Button - Light blue background with white text - Larger than grouping button */
.finish-btn {
    padding: 0.875rem 1rem;
    border-radius: 0.5rem;
    font-weight: bold;
    font-size: 1.05rem;
    transition: all 0.2s;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    border: 2px solid #60a5fa;
    background: #60a5fa;
    color: white;
}

.finish-btn:hover {
    background: #3b82f6;
    color: white;
    border-color: #2563eb;
}

.finish-btn:active {
    transform: scale(0.97);
}


/* Grouping Button - White (default), blue #60a5fa when active */
.add-remove-btn.grouping {
    background: white !important;
    color: #60a5fa !important;
    border-color: #60a5fa !important;
}

.add-remove-btn.grouping:not(.active) {
    background: white !important;
    color: #60a5fa !important;
    border-color: #60a5fa !important;
}

.add-remove-btn.grouping.active {
    background: #60a5fa !important;
    color: white !important;
    border-color: #60a5fa !important;
}

.add-remove-btn.grouping:hover:not(.active) {
    background: #f0f9ff !important;
    color: #3b82f6 !important;
    border-color: #3b82f6 !important;
}

.add-remove-btn.grouping.active:hover {
    background: #3b82f6 !important;
    color: white !important;
    border-color: #3b82f6 !important;
}

/* Products Scroll Buttons - Large Blue Arrows */
.products-scroll-btn {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	width: 50px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(180deg, #e0f2fe 0%, #bfdbfe 100%);
	color: #2563eb;
	border: 2px solid #93c5fd;
	border-radius: 50%;
	cursor: pointer;
	transition: all 0.2s;
	z-index: 50;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	touch-action: manipulation;
	user-select: none;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	pointer-events: auto;
	-webkit-tap-highlight-color: transparent;
}

.products-scroll-btn:hover:not(:disabled) {
	background: linear-gradient(180deg, #bfdbfe 0%, #93c5fd 100%);
	transform: translateX(-50%) scale(1.1);
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.products-scroll-btn:active:not(:disabled) {
	background: #60a5fa;
	color: white;
	transform: translateX(-50%) scale(0.95);
}

.products-scroll-btn:disabled {
	opacity: 0.3;
	cursor: not-allowed;
	color: #9ca3af;
	background: #f3f4f6;
	border-color: #d1d5db;
}

.products-scroll-btn.up {
	top: 10px;
}

.products-scroll-btn.down {
	bottom: 10px;
}

</style>
