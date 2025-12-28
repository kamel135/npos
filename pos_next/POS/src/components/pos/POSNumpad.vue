<template>
	<div class="pos-numpad-dark">
		<!-- Comment Display (if exists) -->
		<div v-if="comment" class="numpad-comment-display">
			<span class="comment-icon">💬</span>
			<span class="comment-text">{{ comment }}</span>
		</div>

		<!-- Display Value -->
		<div class="numpad-display-dark">
			{{ displayValue || '0' }}
		</div>

		<!-- Number Buttons Grid -->
		<div class="numpad-grid-dark">
			<!-- Row 1 -->
			<button
				v-for="num in ['1', '2', '3']"
				:key="num"
				@click="handleInput(num)"
				class="numpad-btn-dark"
			>
				{{ num }}
			</button>

			<!-- Row 2 -->
			<button
				v-for="num in ['4', '5', '6']"
				:key="num"
				@click="handleInput(num)"
				class="numpad-btn-dark"
			>
				{{ num }}
			</button>

			<!-- Row 3 -->
			<button
				v-for="num in ['7', '8', '9']"
				:key="num"
				@click="handleInput(num)"
				class="numpad-btn-dark"
			>
				{{ num }}
			</button>

			<!-- Row 4 -->
			<button
				@click="handleInput('0')"
				class="numpad-btn-dark"
			>
				0
			</button>
            <!-- Decimal Point? Image doesn't explicitly show one in the standard grid, but usually present. -->
            <!-- Image shows 3x4 grid:
                 1 2 3
                 4 5 6
                 7 8 9
                 . 0 C (or similar arrangement)
                 Actually, looking at standard numpads: usually 789 on top?
                 The image is:
                 1 2 3
                 4 5 6
                 7 8 9
                 . 0 C
                 Let's match that order (1-2-3 top).
            -->
			<button
				@click="handleInput('.')"
				class="numpad-btn-dark"
			>
				.
			</button>
			<button
				@click="handleClear"
				class="numpad-btn-dark clear"
			>
				C
			</button>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
	modelValue: {
		type: [String, Number],
		default: "",
	},
	comment: {
		type: String,
		default: "",
	},
})

const emit = defineEmits(["update:modelValue", "enter", "number-click"])

const displayValue = computed({
	get: () => props.modelValue?.toString() || "",
	set: (val) => emit("update:modelValue", val),
})

function handleInput(value) {
	if (value === "." && displayValue.value.includes(".")) {
		return
	}

	const newValue = displayValue.value === "0" && value !== "." ? value : displayValue.value + value
	displayValue.value = newValue
	emit("number-click", value)
}

function handleClear() {
	displayValue.value = ""
}
</script>

<style scoped>
.pos-numpad-dark {
	display: flex;
	flex-direction: column;
	height: 100%;
    width: 100%;
	padding: 0.25rem;
    background: #2d3748; /* Dark background like image */
}

/* Comment Display Area */
.numpad-comment-display {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.25rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    direction: rtl;
    text-align: right;
}

.numpad-comment-display .comment-icon {
    font-size: 1rem;
}

.numpad-comment-display .comment-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Display Area */
.numpad-display-dark {
    background-color: #1a202c;
    color: #fff;
    font-size: 1.25rem;
	font-weight: bold;
    padding: 0.5rem;
    margin-bottom: 0.25rem;
    border-radius: 0.25rem;
    text-align: right;
    min-height: 2.5rem;
	display: flex;
	align-items: center;
    justify-content: flex-end;
    border: 1px solid #4a5568;
}

/* Grid Layout */
.numpad-grid-dark {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 0.25rem; /* Tight gap like image */
	flex: 1;
}

/* Dark Numpad Buttons */
.numpad-btn-dark {
	background: linear-gradient(to bottom, #4a5568, #2d3748);
	color: white;
	font-size: 1.5rem; /* Smaller font */
	font-weight: bold;
	padding: 0;
	border: 1px solid #718096;
	cursor: pointer;
	transition: all 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.numpad-btn-dark:hover {
	background: linear-gradient(to bottom, #718096, #4a5568);
}

.numpad-btn-dark:active {
	background: #2d3748;
    transform: scale(0.98);
}

/* Clear Button */
.numpad-btn-dark.clear {
    /* Maybe standard color or red if preferred, but image looks uniform/dark usually */
    /* Keeping it slightly distinct but dark theme */
}
</style>
