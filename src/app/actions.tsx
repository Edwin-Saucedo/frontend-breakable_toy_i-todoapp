"use server";
import http from "../http-common";

export async function taskAction(form: FormData) {
	const id = form.get("id");
	const name = form.get("name");
	const dueDate = form.get("dueDate");
	const priority = form.get("priorities");

	if (id) {
		const nonNullValues = Object.fromEntries(
			Object.entries({
				name,
				dueDate,
				priority,
				id,
				doneDate: form.get("doneDate"),
				updatedAt: form.get("updatedAt"),
				createdAt: form.get("createdAt"),
			}).filter(([_, value]) => Boolean(value) && value !== "null")
		);
		http.put(`/todos/${id}`, nonNullValues).catch((e) => {});
	} else {
		const json = JSON.stringify({
			name,
			dueDate,
			priority,
		});
		http.post("/todos", { name, dueDate, priority });
	}
}

export async function deleteTask(id: string) {
	http.delete(`/todos/${id}`);
}

export async function doneTask(id: string) {
	http.put(`/todos/${id}/done`);
}

export async function undoneTask(id: string) {
	http.put(`/todos/${id}/undone`);
}
