"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Cross2Icon,
	DotsVerticalIcon,
	Pencil1Icon,
} from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import { deleteTask, doneTask, undoneTask } from "./actions";
import { TaskModal } from "./components";
import { capitalize } from "./utils";

export type Task = {
	id: string;
	name: string;
	doneDate: string;
	priority: "high" | "medium" | "low";
	dueDate?: string;
	createdAt: string;
	updatedAt: string;
};

export const taskColumns: ColumnDef<Task>[] = [
	{
		accessorKey: "doneDate",
		enableSorting: false,
		header: () => <Checkbox checked />,
		cell: (data) => {
			const isDone = Boolean(data.getValue());
			return (
				<Checkbox
					defaultChecked={isDone}
					onCheckedChange={async () => {
						if (isDone) {
							await undoneTask(data.row.original.id);
						} else {
							await doneTask(data.row.original.id);
						}
					}}
				/>
			);
		},
	},
	{
		accessorKey: "name",
		header: "Name",
		enableSorting: true,
	},
	{
		accessorKey: "priority",
		header: "Priority",
		sortDescFirst: true,
		enableSorting: true,
		// Return capitalize word
		cell: (data) => capitalize(data.getValue() as string),
	},
	{
		accessorKey: "dueDate",
		header: "Due Date",
		sortDescFirst: false,
		enableSorting: true,
		cell: (data) => data?.getValue() ?? "-",
	},
	{
		accessorKey: "actions",
		enableSorting: false,
		header: "\b",
		cell: (data) => {
			return (
				<DropdownMenu>
					<DropdownMenuTrigger className="outline-muted">
						<DotsVerticalIcon />
					</DropdownMenuTrigger>
					<DropdownMenuContent className="*:flex *:gap-2 ">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<TaskModal
							title="Edit task"
							description="Make changes into your task."
							taskData={data.row.original}
						>
							<div className=" flex gap-2 text-sm hover:bg-muted min-w-full min-h-8 select-none rounded-sm items-center">
								<Pencil1Icon />
								Edit
							</div>
						</TaskModal>

						<AlertDialog>
							<AlertDialogTrigger asChild>
								<div className="text-destructive flex gap-2 text-sm hover:bg-muted min-w-full min-h-8 select-none rounded-sm items-center">
									<Cross2Icon className="ml-2" />
									Delete
								</div>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete
										this task from our servers.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClickCapture={async () =>
											await deleteTask(data.row.original.id)
										}
									>
										Continue
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
