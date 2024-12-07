"use client";

import { flexRender, Table as TableT } from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import { Task } from "./tasks-columns";
import { getStatusDate } from "./utils";

const DAYS_IN_A_WEEK = 7;

export function TasksDataTable({ table }: { table: TableT<Task> }) {
	const getRowColor = ({
		dueDate,
		status,
	}: {
		dueDate: Date | string | undefined;
		status: "done" | "undone";
	}) => {
		const weeksLeft = Math.ceil(
			dayjs(dueDate).diff(dayjs(), "days") / DAYS_IN_A_WEEK
		);
		const textDecoration = status === "done" ? "line-through" : "";
		return `${getStatusDate(weeksLeft)} ${textDecoration}`;
	};

	const columns = table.getAllColumns().length;

	return (
		<div className="rounded-md border h-auto">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead
										key={header.id}
										onClick={header.column.getToggleSortingHandler()}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
										{{
											asc: " 🔼",
											desc: " 🔽",
										}[header.column.getIsSorted() as string] ?? null}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => {
							const { dueDate, doneDate } = row.original as Task;
							return (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className={getRowColor({
										dueDate,
										status: doneDate ? "done" : "undone",
									})}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={columns} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
