package top.microfrank.promtest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Frank
 * @date 2020/5/5 13:03
 */
@RestController
@RequestMapping("/")
public class PromController {
    @GetMapping("/p1")
    public String p1(){
        return "p1";
    }

    @GetMapping("/p2")
    public String p2(){
        return "p2";
    }
}
