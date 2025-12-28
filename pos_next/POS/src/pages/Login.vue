<template>
  <div class="login-container min-h-screen flex flex-col items-center justify-center bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-lg w-full space-y-4">
      <div class="text-center">
        <h2 class="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
          {{ __('Sign in to INTouch POS') }}
        </h2>
        <p class="mt-2 text-sm sm:text-base text-gray-600">
          {{ __('Access your point of sale system') }}
        </p>
      </div>

      <div class="bg-white py-6 px-6 sm:px-8 shadow-xl rounded-xl">
        <form class="space-y-5" @submit.prevent="submit">
          <div v-if="session.login.error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ __('Login Failed') }}
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ session.login.error.messages.join('\n') }}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block">
              <span class="mb-2 block text-base sm:text-lg font-semibold leading-5 text-gray-700">{{ __('User ID / Email') }}</span>
              <div class="relative email-input-wrapper">
                <input
                  ref="emailInput"
                  v-model="loginForm.email"
                  required
                  name="email"
                  type="text"
                  :autocomplete="'email'"
                  :placeholder="__('Enter your username or email')"
                  :disabled="session.login.loading"
                  class="form-input w-full border-2 border-gray-300 placeholder-gray-400 text-base sm:text-lg py-3 px-4 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  style="font-size: 1rem; min-height: 48px;"
                  @focus="handleInputFocus($event, 'email')"
                  @blur="handleInputBlur"
                  @click="handleInputClick"
                  @touchstart="handleInputClick"
                />
              </div>
            </label>
          </div>

          <div>
            <label class="block">
              <span class="mb-2 block text-base sm:text-lg font-semibold leading-5 text-gray-700">{{ __('Password') }}</span>
              <div class="relative password-input-wrapper">
                <input
                  ref="passwordInput"
                  v-model="loginForm.password"
                  required
                  name="password"
                  :autocomplete="'current-password'"
                  :type="showPassword ? 'text' : 'password'"
                  :placeholder="__('Enter your password')"
                  :disabled="session.login.loading"
                  class="form-input w-full border-2 border-gray-300 placeholder-gray-400 text-base sm:text-lg py-3 px-4 pr-12 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  style="font-size: 1rem; min-height: 48px;"
                  @focus="handleInputFocus($event, 'password')"
                  @blur="handleInputBlur"
                  @click="handleInputClick"
                  @touchstart="handleInputClick"
                />
                <button
                  type="button"
                  @click.stop="showPassword = !showPassword"
                  class="absolute inset-y-0 end-0 flex items-center justify-center px-3 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                  :disabled="session.login.loading"
                  style="min-width: 40px;"
                  :title="showPassword ? __('Hide password') : __('Show password')"
                >
                  <FeatherIcon
                    :name="showPassword ? 'eye-off' : 'eye'"
                    class="h-5 w-5"
                    :stroke-width="2"
                  />
                </button>
              </div>
            </label>
          </div>

          <div>
            <Button
              :loading="session.login.loading"
              variant="solid"
              class="w-full py-3 px-4 border border-transparent rounded-lg shadow-md text-base sm:text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
              style="min-height: 48px; background-color: #1d4ed8;"
              type="submit"
            >
              {{ session.login.loading ? __('Signing in...') : __('Sign in') }}
            </Button>
          </div>
        </form>
      </div>
    </div>

    <!-- Shift Opening Dialog -->
    <ShiftOpeningDialog
      v-model="showShiftDialog"
      @shift-opened="handleShiftOpened"
      @dialog-closed="handleDialogClosed"
    />

    <!-- Virtual Keyboard Toggle Button -->
    <div class="fixed bottom-4 right-4 z-50">
      <button
        @click="showKeyboard = !showKeyboard"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        :title="showKeyboard ? __('Hide Keyboard') : __('Show Keyboard')"
      >
        {{ showKeyboard ? __('Hide KB') : __('Show KB') }}
      </button>
    </div>

    <!-- Virtual Keyboard (English Keyboard) -->
    <div v-if="showKeyboard" class="virtual-keyboard-fixed">
      <div class="keyboard-header">
        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ __('English Keyboard') }}</span>
        <button
          @click="hideKeyboard"
          class="keyboard-close-btn"
          :title="__('Hide Keyboard')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <VirtualKeyboard
        v-model="keyboardValue"
        :target-input="activeInput"
        @close="hideKeyboard"
      />
    </div>
  </div>
</template>

<script setup>
import { usePOSCartStore } from "@/stores/posCart"
import { usePOSUIStore } from "@/stores/posUI"
import { FeatherIcon } from "frappe-ui"
import { onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import ShiftOpeningDialog from "../components/ShiftOpeningDialog.vue"
import VirtualKeyboard from "../components/common/VirtualKeyboard.vue"
import { useShift } from "../composables/useShift"
import { session } from "../data/session"
import { ensureCSRFToken } from "../utils/csrf"
import { offlineWorker } from "../utils/offline/workerClient"

const router = useRouter()
const { shiftState } = useShift()
const cartStore = usePOSCartStore()
const uiStore = usePOSUIStore()

const loginForm = reactive({
	email: "",
	password: "",
})

const showShiftDialog = ref(false)
const showPassword = ref(false)
const emailInput = ref(null)
const passwordInput = ref(null)

// Virtual Keyboard state
const showKeyboard = ref(false)
const keyboardValue = ref('')
const activeInput = ref(null)
const currentInputType = ref(null) // 'email' or 'password'
const isTouchDevice = ref(false)


// Reset state when login page mounts
onMounted(() => {
	// Detect touch device - use multiple methods for better detection
	isTouchDevice.value = (
		'ontouchstart' in window ||
		navigator.maxTouchPoints > 0 ||
		navigator.msMaxTouchPoints > 0 ||
		window.matchMedia('(pointer: coarse)').matches ||
		window.matchMedia('(hover: none)').matches
	)

	// Clear login form
	loginForm.email = ""
	loginForm.password = ""
	showPassword.value = false

	// Clear any login errors
	if (session.login.error) {
		session.login.reset()
	}

	// Only clear state if user is NOT logged in
	// If user is already logged in (e.g., after successful login), don't clear their session
	if (!session.isLoggedIn) {
		showShiftDialog.value = false
		cartStore.clearCart()
		uiStore.resetAllDialogs()

		// Clear any stale shift state
		shiftState.value = {
			pos_opening_shift: null,
			pos_profile: null,
			company: null,
			isOpen: false,
		}
		localStorage.removeItem("pos_shift_data")
	}
})

function submit() {
	if (!loginForm.email || !loginForm.password) {
		return
	}

	session.login.submit({
		email: loginForm.email.trim(),
		password: loginForm.password,
	})
}

// Watch for successful login
watch(
	() => session.isLoggedIn,
	async (isLoggedIn) => {
		if (isLoggedIn) {
			// Initialize CSRF token after successful login
			try {
				console.log("User logged in, initializing CSRF token...")
				await ensureCSRFToken()

				// Sync CSRF token to worker for background API calls
				if (window.csrf_token) {
					await offlineWorker.setCSRFToken(window.csrf_token)
				}
			} catch (error) {
				console.error("Failed to initialize CSRF token after login:", error)
			}

			// Show shift opening dialog after successful login
			showShiftDialog.value = true
		}
	},
)

// Watch for dialog being closed via X button (v-model update)
// When user closes dialog without action, navigate to POSSale
watch(showShiftDialog, (isOpen, wasOpen) => {
	// Only navigate if dialog was open and is now closed, and user is logged in
	if (wasOpen === true && isOpen === false && session.isLoggedIn) {
		router.push({ name: "POSSale" })
	}
})

function handleShiftOpened() {
	// Navigate to POS sale after shift is opened
	router.push({ name: "POSSale" })
}

function handleDialogClosed({ reason }) {
	// Navigate to /pos when dialog is cancelled or resumed
	// "cancelled" means user closed dialog without action
	// "resumed" means user chose to resume existing shift
	// In both cases, navigate to POSSale (existing shift will be active)
	if (reason === "cancelled" || reason === "resumed") {
		router.push({ name: "POSSale" })
	}
}


// Clear error when user starts typing
watch([() => loginForm.email, () => loginForm.password], () => {
	if (session.login.error) {
		session.login.reset()
	}
})

// Virtual Keyboard handlers
function handleInputFocus(event, inputType) {
	// Show virtual keyboard for all devices
	currentInputType.value = inputType
	activeInput.value = event.target
	showKeyboard.value = true
	keyboardValue.value = inputType === 'email' ? loginForm.email : loginForm.password
	
	// For touch devices, prevent default keyboard
	if (isTouchDevice.value) {
		event.preventDefault()
		event.target.blur()
	}
}

function handleInputBlur(event) {
	// Small delay to allow keyboard button clicks
	setTimeout(() => {
		// Don't hide if clicking on keyboard
		const keyboardElement = document.querySelector('.virtual-keyboard-fixed')
		if (keyboardElement && keyboardElement.contains(document.activeElement)) {
			return
		}
	}, 200)
}

function handleInputClick(event) {
	// Determine input type from the input element
	const inputType = event.target.name === 'email' ? 'email' : 'password'
	
	// Show keyboard for all devices
	currentInputType.value = inputType
	activeInput.value = event.target
	showKeyboard.value = true
	keyboardValue.value = inputType === 'email' ? loginForm.email : loginForm.password
	
	// For touch devices, prevent default keyboard
	if (isTouchDevice.value) {
		event.preventDefault()
	}
}

function hideKeyboard() {
	showKeyboard.value = false
	activeInput.value = null
	currentInputType.value = null
}

// Watch keyboard value and update form
watch(keyboardValue, (newValue) => {
	if (currentInputType.value === 'email') {
		loginForm.email = newValue
	} else if (currentInputType.value === 'password') {
		loginForm.password = newValue
	}
})

// Also watch form values to sync with keyboard value
watch(() => loginForm.email, (newValue) => {
	if (currentInputType.value === 'email' && showKeyboard.value) {
		keyboardValue.value = newValue
	}
})

watch(() => loginForm.password, (newValue) => {
	if (currentInputType.value === 'password' && showKeyboard.value) {
		keyboardValue.value = newValue
	}
})
</script>

<style scoped>
/* Email and Password Input Wrappers */
.email-input-wrapper,
.password-input-wrapper {
	position: relative;
	z-index: 10;
}

/* Improve autocomplete dropdown positioning */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
	-webkit-box-shadow: 0 0 0 1000px white inset !important;
	box-shadow: 0 0 0 1000px white inset !important;
	-webkit-text-fill-color: #1f2937 !important;
	font-size: 1rem !important;
}

/* Touch screen optimizations */
@media (hover: none) and (pointer: coarse) {
	.login-container {
		padding: 1rem;
	}
	
	.form-input {
		font-size: 1.75rem !important;
		min-height: 72px !important;
		padding: 1rem 1.25rem !important;
	}
	
	label span {
		font-size: 1.5rem !important;
		margin-bottom: 0.75rem !important;
	}
	
	button[type="submit"] {
		font-size: 1.75rem !important;
		min-height: 72px !important;
		padding: 1.25rem 1.5rem !important;
	}
}

/* Style for better touch interaction */
input:focus {
	outline: none;
	border-color: #3b82f6;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Sign in button custom color */
button[type="submit"] {
	background-color: #1d4ed8 !important;
}

button[type="submit"]:hover:not(:disabled) {
	background-color: #1e40af !important;
}

/* Virtual Keyboard Styles */
.virtual-keyboard-fixed {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: white;
	border-top: 2px solid #e5e7eb;
	box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
	z-index: 1000;
	padding: 1rem;
	max-height: 50vh;
	overflow-y: auto;
	animation: slideUp 0.3s ease-out;
}

[data-theme="dark"] .virtual-keyboard-fixed {
	background: #1f2937;
	border-top-color: #374151;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(100%);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.keyboard-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.75rem;
	padding-bottom: 0.75rem;
	border-bottom: 1px solid #e5e7eb;
}

[data-theme="dark"] .keyboard-header {
	border-bottom-color: #374151;
}

.keyboard-close-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.5rem;
	border-radius: 0.5rem;
	background: #f3f4f6;
	border: 1px solid #d1d5db;
	color: #6b7280;
	transition: all 0.2s;
	cursor: pointer;
	touch-action: manipulation;
	-webkit-tap-highlight-color: transparent;
}

[data-theme="dark"] .keyboard-close-btn {
	background: #374151;
	border-color: #4b5563;
	color: #9ca3af;
}

.keyboard-close-btn:hover {
	background: #e5e7eb;
	border-color: #9ca3af;
	color: #374151;
}

[data-theme="dark"] .keyboard-close-btn:hover {
	background: #4b5563;
	color: #d1d5db;
}

.keyboard-close-btn:active {
	transform: scale(0.95);
}

/* Adjust login container when keyboard is visible */
.login-container:has(+ .virtual-keyboard-fixed),
.login-container:has(~ .virtual-keyboard-fixed) {
	padding-bottom: 20vh;
}

/* Safe area for devices with notches */
.virtual-keyboard-fixed {
	padding-bottom: env(safe-area-inset-bottom);
}
</style>
