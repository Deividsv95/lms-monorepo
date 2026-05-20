import "@testing-library/jest-dom";

const storage = new Map();

Object.defineProperty(globalThis, "localStorage", {
	value: {
		getItem: (key) => (storage.has(key) ? storage.get(key) : null),
		setItem: (key, value) => {
			storage.set(key, String(value));
		},
		removeItem: (key) => {
			storage.delete(key);
		},
		clear: () => {
			storage.clear();
		},
		key: (index) => Array.from(storage.keys())[index] || null,
		get length() {
			return storage.size;
		},
	},
	configurable: true,
});
