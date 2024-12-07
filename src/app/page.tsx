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
import {
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import http from "../http-common";
import { TaskModal } from "./components";
import {
	Metrics,
	PRIORITY_PLACEHOLDER,
	PRIORITY_TASKS,
	STATUS_PLACEHOLDER,
	STATUS_TASKS,
} from "./constants";
import { taskColumns } from "./tasks-columns";
import { TasksDataTable } from "./tasks-data-table";

export default function Home() {
	const [data, setData] = useState({ tasks: [], total: 0 });
	const [page, setPage] = useState<number>(Math.ceil(data.total / 10) + 1);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [metrics, setMetrics] = useState<Metrics>({
		highAverage: 0,
		mediumAverage: 0,
		lowAverage: 0,
		totalAverage: 0,
	});
	const searchParams = useSearchParams();
	const { replace } = useRouter();
	const pathname = usePathname();
	const table = useReactTable({
		data: data.tasks,
		columns: taskColumns,
		meta: {
			a: 1,
		},
		state: {
			sorting,
		},
		getSortedRowModel: getSortedRowModel(),
		enableSorting: true,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		initialState: {
			sorting: [
				{
					id: "name",
					desc: false,
				},
			],
		},
	});
	const [activity, setActivity] = useState(false);

	const handleActivity = () => {
		setActivity(!activity);
	};

	const search = (e: FormEvent<HTMLFormElement>) => {
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
	}, [searchParams, pathname, page]);

	useEffect(() => {
		const sortedBy = sorting.at(0)?.id;
		let getAllFetchURL = "/todos";
		if (searchParams.toString()) {
			getAllFetchURL = getAllFetchURL.concat("?", searchParams.toString());
			if (sortedBy) {
				getAllFetchURL = getAllFetchURL.concat("&", "sort=", sortedBy);
			}
		} else if (sortedBy) {
			getAllFetchURL = getAllFetchURL.concat("?", "sort=", sortedBy);
		}
		http.get(getAllFetchURL).then((res) => {
			setData(res.data);
		});

		http.get("/todos/metrics").then((res) => {
			setMetrics(res.data);
		});
	}, [searchParams, activity, sorting]);

	return (
		<main
			className="flex flex-col gap-8 row-start-2 sm:items-start  font-[family-name:var(--font-geist-sans)]"
			onClick={handleActivity}
			onChange={handleActivity}
			onSubmit={handleActivity}
			onBlur={handleActivity}
		>
			{/* Using a responsive container for limiting to expand on large screens */}
			<ResponsiveContainer className="max-w-maximum-screens p-4  space-y-4 *:px-8">
				{/* Top container for search */}
				<form
					className="flex flex-wrap justify-between  w-full sm:[&_:is(input,button,div)]:w-full border py-8 rounded-lg "
					onSubmit={search}
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
				{/* Metrics section */}
				{metrics && (
					<div className="w-full h-32 border rounded-lg flex *:grow">
						<div className="flex flex-col *:grow">
							<div className="flex gap-4">
								<p className="font-bold">High priority</p>
								<p>{metrics.highAverage?.toFixed(2)}&nbsp;days</p>
							</div>
							<div className="flex gap-4">
								<p className="font-bold">Medium priority</p>
								<p>{metrics.mediumAverage?.toFixed(2)}&nbsp;days</p>
							</div>
							<div className="flex gap-4">
								<p className="font-bold">Low priority</p>
								<p>{metrics.lowAverage?.toFixed(2)}&nbsp;days</p>
							</div>
						</div>
						<div className="flex flex-col *:grow">
							<div className="flex gap-4">
								<p className="font-bold">Total tasks</p>
								<p>{metrics.totalAverage?.toFixed(2)}&nbsp;days</p>
							</div>
						</div>
					</div>
				)}
			</ResponsiveContainer>
		</main>
	);
}
