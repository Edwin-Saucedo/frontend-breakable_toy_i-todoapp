import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import http from '@/http-common';

// 1. Define your types
export interface Todo {
    id: string;
    name: string;
    doneDate: string;
    priority: "high" | "medium" | "low";
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
};


interface TodosState {
  items: Todo[];
  loading: boolean;
  error: string | null;
  deleteLoading: boolean;
  deleteError: string | null;
  updateLoading: boolean;
  updateError: string | null;
}

// 2. Define the error type you expect
type RejectValue = string;

// 3. Async thunk with correct types
const fetchTodos = createAsyncThunk<Todo[], void, { rejectValue: RejectValue }>(
  'todos/fetchTodos',
  async (_, thunkAPI) => {
    try {
      const response = await http.get<Todo[]>('/todos');
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message || 'Unknown error');
    }
  }
);

// Delete Todo
const deleteTodo = createAsyncThunk<string, string, { rejectValue: RejectValue }>(
  'todos/deleteTodo',
  async (id, thunkAPI) => {
    try {
      await http.delete(`/todos/${id}`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message || 'Failed to delete todo');
    }
  }
);

// Update Todo
const updateTodo = createAsyncThunk<Todo, Todo, { rejectValue: RejectValue }>(
  'todos/updateTodo',
  async (todo, thunkAPI) => {
    try {
      const response = await http.put<Todo>(`/todos/${todo.id}`, todo);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message || 'Failed to update todo');
    }
  }
);

// 4. Initial state
const initialState: TodosState = {
  items: [],
  loading: false,
  error: null,
  deleteLoading: false,
  deleteError: null,
  updateLoading: false,
  updateError: null,
};

// 5. Slice
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // Fetch
    builder
      .addCase(fetchTodos.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction<Todo[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch todos';
      });

    // Delete
    builder
      .addCase(deleteTodo.pending, state => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteTodo.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleteLoading = false;
        state.items = state.items.filter(todo => todo.id !== action.payload);
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload ?? 'Failed to delete todo';
      });

    // Update
    builder
      .addCase(updateTodo.pending, state => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        state.updateLoading = false;
        state.items = state.items.map(todo =>
          todo.id === action.payload.id ? action.payload : todo
        );
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload ?? 'Failed to update todo';
      });
  },
});

export default todosSlice.reducer;
export { fetchTodos, deleteTodo, updateTodo };