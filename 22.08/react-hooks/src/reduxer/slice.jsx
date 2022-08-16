import {createSlice} from '@reduxjs/toolkit';

const slice = createSlice({
    name : "count_slice",
    initialState: {count: 0},
    reducers: {
        addOne(state) {
            state.count = state.count + 1;
        },
        add(state, action) {
            state.count = state.count + action.payload;
        }
    }
});

export const {actions, reducer} = slice;