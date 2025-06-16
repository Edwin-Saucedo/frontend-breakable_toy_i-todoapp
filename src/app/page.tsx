"use client";
import AppSelect from "@/components/shared/app-select";
import ResponsiveContainer from "@/components/shared/responsive-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import http from "../http-common";
import { TaskModal } from "./components";
import {
	PRIORITY_PLACEHOLDER,
	PRIORITY_TASKS,
	STATUS_PLACEHOLDER,
	STATUS_TASKS,
} from "./constants";
import { taskColumns } from "./tasks-columns";
import { TasksDataTable } from "./tasks-data-table";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { deleteTodo, fetchTodos, Todo, updateTodo } from "../../redux/slices/toDosSlice";

export default function Home() {
	const [data, setData] = useState({ tasks: [], total: 0 });
	const [page, setPage] = useState<number>(Math.ceil(data.total / 10) + 1);

	const dispatch = useAppDispatch();
	  const { items, loading, error, deleteLoading, deleteError, updateLoading, updateError } = useAppSelector(state => state.todos);

	const [editingId, setEditingId] = useState<string | null>(null);
  	const [editForm, setEditForm] = useState<Partial<Todo>>({});
	
	const handleDelete = (id: string) => {
    	dispatch(deleteTodo(id));
	};

	const handleEditInit = (todo: Todo) => {
		setEditingId(todo.id);
		setEditForm({ ...todo });
	};

	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditForm({ ...editForm, [e.target.name]: e.target.value });
	};

	const handleEditSave = () => {
		if (editingId && editForm) {
		dispatch(updateTodo({ ...(editForm as Todo), id: editingId }));
		setEditingId(null);
		setEditForm({});
		}
	};

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

	useEffect(() => {
		dispatch(fetchTodos());
	}, [dispatch])


	const searchParams = useSearchParams();
	const { replace } = useRouter();
	const pathname = usePathname();
	const table = useReactTable({
		data: items ?? [],
		columns: taskColumns,
		meta: {
			a: 1,
		},
		getCoreRowModel: getCoreRowModel(),
	});

	const a = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const target: any | unknown = e.target;
		const name = target.name.value;
		const priority = target.priorities.value;
		const status = target.statuses.value;

		const filterParams = new URLSearchParams();

		if (name) {
			filterParams.append("name", name);
		}
		if (priority) {
			filterParams.append("priority", priority);
		}
		if (status) {
			filterParams.append("status", status);
		}
		replace(`${pathname}?${filterParams.toString().toLowerCase()}`);
	};

	const nextPageURL = useCallback(() => {
		const paginationSearchParams = new URLSearchParams();

		const status = searchParams.get("status");
		const name = searchParams.get("name");
		const priority = searchParams.get("priority");

		if (name) {
			paginationSearchParams.append("name", name);
		}
		if (priority) {
			paginationSearchParams.append("priority", priority);
		}
		if (status) {
			paginationSearchParams.append("status", status);
		}

		paginationSearchParams.append("page", `${page + 1}`);
		return `${pathname}?${paginationSearchParams.toString()}`;
	}, [page]);

	const prevPageURL = useCallback(() => {
		const paginationSearchParams = new URLSearchParams();

		const status = searchParams.get("status");
		const name = searchParams.get("name");
		const priority = searchParams.get("priority");

		if (name) {
			paginationSearchParams.append("name", name);
		}
		if (priority) {
			paginationSearchParams.append("priority", priority);
		}
		if (status) {
			paginationSearchParams.append("status", status);
		}

		paginationSearchParams.append("page", `${page + 1}`);
		return `${pathname}?${paginationSearchParams.toString()}`;
	}, [page]);

	const isNextPage = (page + 1) * 10 < data.total;

	useEffect(() => {
		let getAllFetchURL = "/todos";
		if (searchParams.toString()) {
			getAllFetchURL = getAllFetchURL.concat("?", searchParams.toString());
		}
		http.get(getAllFetchURL).then((res) => {
			setData(res.data);
		});
	}, [searchParams]);

	return (
		<main className="flex flex-col gap-8 row-start-2 sm:items-start  font-[family-name:var(--font-geist-sans)]">
			{/* Using a responsive container for limiting to expand on large screens */}
			<ResponsiveContainer className="max-w-maximum-screens p-4  space-y-4 *:px-8">
				{/* Top container for search */}
				<form
					className="flex flex-wrap justify-between  w-full sm:[&_:is(input,button,div)]:w-full border py-8 rounded-lg "
					onSubmit={a}
				>
					<div className="min-w-full flex place-items-center sm:flex-col sm:place-items-start sm:gap-2">
						<label htmlFor="name" className="max-w-[4rem] min-w-[4rem] px-2">
							Name
						</label>
						<Input
							name="name"
							placeholder="Task Name"
							className="ml-4 sm:ml-0"
						/>
					</div>
					<div className="*:flex *:gap-4 *:place-items-center flex flex-col gap-4 py-4 max-w-[32rem] w-1/2 sm:min-w-full">
						<AppSelect
							name="priorities"
							label="Priority"
							options={["All", ...PRIORITY_TASKS]}
							placeholder={PRIORITY_PLACEHOLDER}
							className="w-full"
						/>
						<AppSelect
							name="statuses"
							label="Status"
							options={["All", ...STATUS_TASKS]}
							placeholder={STATUS_PLACEHOLDER}
							className="w-full"
						/>
					</div>
					<Button className="m-8 w-32 self-end">Search</Button>
				</form>
				{/* Tasks table list section */}
				<div className="h-auto ">
					{/* Content Table */}
					<div className="h-[90%] ">
						<TaskModal />
						<TasksDataTable table={table} />
					</div>
					<Pagination className="h-auto py-8">
						<PaginationContent className="space-x-8">
							<PaginationItem>
								<PaginationPrevious
									href={prevPageURL()}
									onClick={() => setPage(page - 1)}
									replace
								/>
							</PaginationItem>
							<PaginationItem>
								<PaginationNext
									href={nextPageURL()}
									onClick={() => setPage(page + 1)}
									replace
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</ResponsiveContainer>
		</main>
	);
}
