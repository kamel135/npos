<template>
	<Dialog
		v-model="isOpen"
		:title="__('Scan Barcode')"
		:options="{
			width: 500,
			height: 500,
		}"
		@close="handleClose"
	>
		<div class="p-4">
			<!-- Scanner Area -->
			<div
				ref="scannerContainerRef"
				id="barcode-scanner-container"
				class="w-full bg-black rounded-lg overflow-hidden"
				style="min-height: 300px; position: relative;"
			></div>

			<!-- Error Message -->
			<div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
				<p class="text-sm text-red-700">{{ error }}</p>
			</div>

			<!-- Instructions -->
			<div class="mt-4 text-center">
				<p class="text-sm text-gray-600">{{ __('Position the barcode within the frame') }}</p>
			</div>
		</div>
	</Dialog>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue"
import { Dialog } from "frappe-ui"

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(["update:modelValue", "scan"])

const isOpen = ref(props.modelValue)
const scannerContainerRef = ref(null)
const error = ref("")
let scannerInstance = null
let Html5Qrcode = null

watch(
	() => props.modelValue,
	(newVal) => {
		isOpen.value = newVal
		if (newVal) {
			loadScanner()
		} else {
			stopScanner()
		}
	}
)

watch(isOpen, (newVal) => {
	emit("update:modelValue", newVal)
	if (newVal) {
		loadScanner()
	} else {
		stopScanner()
	}
})

async function loadScanner() {
	try {
		// Load html5-qrcode library
		if (!Html5Qrcode) {
			// Try to load from Frappe's assets first
			if (window.frappe && window.frappe.require) {
				try {
					await window.frappe.require("/assets/frappe/node_modules/html5-qrcode/html5-qrcode.min.js")
					Html5Qrcode = window.Html5Qrcode
				} catch (e) {
					console.warn("Could not load from Frappe assets, trying CDN:", e)
				}
			}

			// Fallback to CDN
			if (!Html5Qrcode) {
				await loadScript("https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js")
				Html5Qrcode = window.Html5Qrcode
			}
		}

		if (!Html5Qrcode) {
			throw new Error("Failed to load Html5Qrcode library")
		}

		// Wait for container to be ready
		await new Promise((resolve) => setTimeout(resolve, 100))

		if (!scannerContainerRef.value) {
			throw new Error("Scanner container not found")
		}

		// Create scanner instance
		const containerId = scannerContainerRef.value.id || "barcode-scanner-container"
		scannerInstance = new Html5Qrcode(containerId)

		// Start scanning
		await scannerInstance.start(
			{ facingMode: "environment" }, // Use back camera
			{
				fps: 10,
				qrbox: { width: 250, height: 250 },
				aspectRatio: 1.0,
			},
			(decodedText, decodedResult) => {
				// Barcode scanned successfully
				emit("scan", decodedText)
				stopScanner()
				isOpen.value = false
			},
			(errorMessage) => {
				// Ignore scan errors (they're frequent during scanning)
			}
		)

		error.value = ""
	} catch (err) {
		console.error("Scanner error:", err)
		error.value = err.message || __("Failed to start camera. Please check permissions.")
	}
}

function stopScanner() {
	if (scannerInstance) {
		scannerInstance
			.stop()
			.then(() => {
				scannerInstance.clear()
				scannerInstance = null
			})
			.catch((err) => {
				console.error("Error stopping scanner:", err)
			})
	}
}

function handleClose() {
	stopScanner()
	isOpen.value = false
}

function loadScript(src) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script")
		script.src = src
		script.onload = resolve
		script.onerror = reject
		document.head.appendChild(script)
	})
}

onUnmounted(() => {
	stopScanner()
})
</script>

<style scoped>
#barcode-scanner-container {
	position: relative;
}

#barcode-scanner-container video {
	width: 100%;
	height: auto;
}
</style>


