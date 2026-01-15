import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface User {
    userID: string,
    firstName: string, 
    lastName: string,
    isAdministrator: boolean;
    password?: string
}

interface UserState {
    users: User[],
    isLoading: boolean
}

const initialState: UserState = {
    users: [],
    isLoading: false
}

// alle user laden 
export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async(_, thunkAPI) => {
        // token aus bereits existierendem state holen
        const state = thunkAPI.getState() as RootState;
        const token = state.auth.token;

        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        if(!response.ok) {
            return thunkAPI.rejectWithValue("Fetching users failed");
        }

        const data = await response.json();
        return data as User[];
    }
);

export const deleteUser = createAsyncThunk(
    'user/delete',
    async(userID: string, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const token = state.auth.token;

        const response = await fetch(`/api/users/${userID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        if(!response.ok) {
            return thunkAPI.rejectWithValue("Deleting user failed");
        }

        return userID;
    }
);

export const createUser = createAsyncThunk(
    'user/create',
    async(newUser: User, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const token = state.auth.token;

        const response = await fetch(`/api/users`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });

        if(!response.ok) {
            return thunkAPI.rejectWithValue("Deleting user failed");
        }

        return newUser;
    }
)

export const updateUser = createAsyncThunk(
    'user/update',
    async(updatedUser: User, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const token = state.auth.token;

        const userData: Partial<User> = {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            isAdministrator: updatedUser.isAdministrator,
        }

        if(updatedUser.password && updatedUser.password.trim() !== '') {
            userData.password = updatedUser.password;
        }


        const response = await fetch(`/api/users/${updatedUser.userID}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if(!response.ok) {
            return thunkAPI.rejectWithValue("Deleting user failed");
        }

        return updatedUser;
    }
)

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder 
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.users = action.payload; // liste im store speichern
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user.userID !== action.payload);
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.push(action.payload);
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(u => u.userID === action.payload.userID);
                if(index !== -1) {
                    state.users[index] = action.payload;
                }
            });
    }
});

export default userSlice.reducer;