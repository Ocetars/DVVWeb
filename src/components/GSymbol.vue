<template>
	<span :style="{
		color,
		fontStyle,
		position: alignText ? 'relative' : '',
		top: alignText ? '0.125em' : '',
		'--font-family': _family,
		'--font-fill': fill ? 1 : 0,
		'--font-wght': weight,
		'--font-grad': grade,
		'--font-opsz': size
	}" class="material-symbols">
		<slot></slot>
	</span>
</template>

<script>
function unsupportedWarning(prop, useValue, allowValues) {
	console.warn("[GSymbol] 可用的", prop, "值为", allowValues, "，填写的", JSON.stringify(useValue), "不受支持。");
}

export default {
	name: "GSymbol",
	props: {
		color: {
			type: String,
			default: ""
		},
		fontStyle: {
			type: String,
			enum: ["normal", "italic", "oblique"],
			default: "",
			validator: value => {
				if (["normal", "italic", "oblique", ""].includes(value)) {
					return true;
				}
				unsupportedWarning("fontStyle", value, ["normal", "italic", "oblique", ""]);
			}
		},
		family: {
			type: String,
			enum: ["outlined", "rounded", "sharp"],
			default: "rounded",
			validator: value => {
				if (["outlined", "rounded", "sharp"].includes(value?.toLowerCase())) {
					return true;
				}
				unsupportedWarning("family", value, ["outlined", "rounded", "sharp"]);
			}
		},
		alignText: {
			type: Boolean,
			default: false
		},
		fill: {
			type: Boolean,
			default: false
		},
		weight: {
			type: [Number, String],
			enum: [100, 200, 300, 400, 500, 600, 700],
			default: 400,
			validator: value => {
				if (typeof value === "string") {
					value = parseInt(value);
				}
				if ([100, 200, 300, 400, 500, 600, 700].includes(value)) {
					return true;
				}
				unsupportedWarning("weight", value, [100, 200, 300, 400, 500, 600, 700]);
			}
		},
		grade: {
			type: [Number, String],
			enum: [-25, 0, 200],
			default: 0,
			validator: value => {
				if (typeof value === "string") {
					value = parseInt(value);
				}
				if ([-25, 0, 200].includes(value)) {
					return true;
				}
				unsupportedWarning("grade", value, [-25, 0, 200]);
			}
		},
		size: {
			type: [Number, String],
			enum: [20, 24, 40, 48],
			default: 48,
			validator: (value) => {
				if (typeof value === "string") {
					value = parseInt(value);
				}
				if ([20, 24, 40, 48].includes(value)) {
					return true;
				}
				unsupportedWarning("size", value, [20, 24, 40, 48]);
			}
		}
	},
	computed: {
		_family() {
			return `material symbols ${this.family}`;
		}
	}
};
</script>

<style scoped>
@import "https://fonts.googleapis.cn/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
@import "https://fonts.googleapis.cn/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
@import "https://fonts.googleapis.cn/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";

.material-symbols {
	font-family: var(--font-family);
	font-weight: var(--font-wght);
	font-style: normal;
	font-size: 24px;
	line-height: 1;
	letter-spacing: normal;
	text-transform: none;
	display: inline-block;
	white-space: nowrap;
	word-wrap: normal;
	direction: ltr;
	font-variation-settings: 'FILL' var(--font-fill), 'wght' var(--font-wght), 'GRAD' var(--font-grad), 'opsz' var(--font-opsz);
	-webkit-font-smoothing: antialiased;
}
</style> 