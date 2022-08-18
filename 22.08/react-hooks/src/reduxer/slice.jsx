import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';

// 用createAsyncThunk来创建thunk
export const fetchTodos = createAsyncThunk("my_thunk", async ()=>{
    const res = await fetch('https://jsonplaceholder.typicode.com/todos');
    const json = await res.json();
    return json;
})


// createSlice可以创建action和对应的reducer，dispatch的action内容以payload字段传递进来
const slice = createSlice({
    name : "count_slice",
    initialState: {count: 0, loadState: "", todos: []},
    reducers: {
        addOne(state) {
            state.count = state.count + 1;
        },
        add(state, action) {
            state.count = state.count + action.payload;
        }
    },
    // thunk形式的reducer用extraReducer字段处理，thunk三种状态分别是加载中，完成和失败了。
    extraReducers: builder => {
        builder.addCase(fetchTodos.pending, (state, action) => {
            state.loadState = "loading"
        }).addCase(fetchTodos.fulfilled, (state, action)=>{
            state.loadState = "finish"
            state.todos = action.payload;
        }).addCase(fetchTodos.rejected, (state, action)=>{
            state.loadState = "failed"
        })
    }
});

export const {actions, reducer} = slice;