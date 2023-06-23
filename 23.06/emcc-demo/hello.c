#include <emscripten/emscripten.h>

EMSCRIPTEN_KEEPALIVE 
int fib(int n) {
  if (n <= 1) return 1;
  return fib(n - 1) + fib(n - 2);
}
