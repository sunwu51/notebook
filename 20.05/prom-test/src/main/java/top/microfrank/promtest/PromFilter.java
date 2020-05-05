package top.microfrank.promtest;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

/**
 * @author Frank
 * @date 2020/5/5 13:04
 */
@Component
public class PromFilter extends OncePerRequestFilter {
    @Autowired
    MeterRegistry registry;

    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException {
        Counter totalRequest = registry.counter("total_request","method", httpServletRequest.getMethod(),"path",httpServletRequest.getRequestURI());
        totalRequest.increment();

        doFilter(httpServletRequest,httpServletResponse,filterChain);
    }
}
