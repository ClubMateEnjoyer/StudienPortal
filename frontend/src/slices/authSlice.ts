import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

// Hilfsfunktion zum Entschlüsseln des JWT (ohne extra Library)
function parseJwt (token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.log(e);
        return {};
    }
}

// der zustand als interface
interface AuthState {
    userID: string | null;
    isAdministrator: boolean;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    userID: null,
    isAdministrator: false,
    token:  null,
    isLoading: false,
    error:  null
};

// thunk middleware, um user login durchzuführen
export const loginUser = createAsyncThunk(
    'auth/login',
    async(loginData: { userID: string, password: string}, thunkAPI) => {
        try {
            // basic auth header bauen mit base64
            const base64credentials: string = btoa(loginData.userID + ":" + loginData.password);

            const response: Response = await fetch('/api/authenticate', {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + base64credentials,
                    'Content-Type': 'application/json'
                }
            });

            if(!response.ok) {
                return thunkAPI.rejectWithValue("Login failed");
            }

            const authHeader: string | null = response.headers.get('Authorization');

            if(!authHeader) {
                return thunkAPI.rejectWithValue("Couldn't get token from header");
            }


            const token = authHeader.split(' ')[1];

            if(!token) {
                return thunkAPI.rejectWithValue("Couldn't get token from header");
            }

            const decodedToken = parseJwt(token);
            console.log(decodedToken);

            const isAdmin = decodedToken.isAdministrator;

            return { userID: loginData.userID, token: token, isAdministrator: isAdmin};

        } catch (error) {
            console.log(error);
            return thunkAPI.rejectWithValue("Network error");
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.userID = null;
            state.token = null;
            state.error = null;
            state.isAdministrator = false;
        }
    },
    // für asynchrone zustände
    extraReducers: (builder) => {
        builder
            //pending beim spinner
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            // daten speicher, spinner aus
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<{userID: string, token: string, isAdministrator: boolean }>) => {
                state.isLoading = false;
                state.userID = action.payload.userID;
                state.token = action.payload.token;
                state.isAdministrator = action.payload.isAdministrator;
            })
            // im fall fehler speichern, spinner aus
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;