import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Employee {
  _id: string;
  name: string;
  employeeNumber: string;
  email: string;
  role: string;
  permissions: string[];
}

interface EmployeeState {
  list: Employee[];
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  list: [],
  loading: false,
  error: null,
};

export const fetchEmployees = createAsyncThunk('employee/fetchAll', async () => {
  const response = await axios.get('/api/employees');
  return response.data as Employee[];
});

export const updateEmployeePermissions = createAsyncThunk(
  'employee/updatePermissions',
  async ({ id, role, permissions }: { id: string; role: string; permissions: string[] }) => {
    const response = await axios.put(`/api/employees/${id}/permissions`, { role, permissions });
    return response.data.employee as Employee;
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching employees';
      })
      .addCase(updateEmployeePermissions.fulfilled, (state, action) => {
        const idx = state.list.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export default employeeSlice.reducer;
