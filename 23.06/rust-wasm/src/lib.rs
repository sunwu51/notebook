use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(left: usize, right: usize) -> usize {
    left + right
}
#[wasm_bindgen]
pub fn fib(n: u32) -> u32 {
    let res = if n < 2 
    { 1 } 
    else
    {fib(n-1) + fib(n-2)};
    return res;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
