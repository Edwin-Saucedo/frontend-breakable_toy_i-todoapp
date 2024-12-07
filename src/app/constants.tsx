// Constant Definitions
export const STATUS_TASKS = ["Done", "Undone"];
export const STATUS_PLACEHOLDER = "All, Done, Undone";

export const PRIORITY_TASKS = ["High", "Medium", "Low"];
export const PRIORITY_PLACEHOLDER = "All, High, Medium, Low";

export const COLOR_ROWS = {
	empty: "",
	urgent: "bg-red-200",
	moderate: "bg-yellow-200",
	normal: "bg-green-200",
} as { [key: string]: string };

export interface Metrics {
	highAverage: number;
	mediumAverage: number;
	lowAverage: number;
	totalAverage: number;
}
