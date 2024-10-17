mod test;
use clap::{Arg, Command};
use deno_core::JsRuntime;
use deno_core::RuntimeOptions;
use std::fs::File;
use std::io::{self, BufRead, BufReader};

fn main() {
    // 定义参数形式为 flat [option] function [file]
    let matches = Command::new("Flat")
        .version("1.0")
        .author("Your Name <sunwu51@126.com>")
        .about("Processes lines of input with JavaScript")
        .arg(
            Arg::new("begin")
                .short('b')
                .long("begin")
                .help("JavaScript code to execute before processing any lines")
                .value_parser(clap::builder::ValueParser::string()),
        )
        .arg(
            Arg::new("end")
                .short('e')
                .long("end")
                .help("JavaScript code to execute after processing all lines")
                .value_parser(clap::builder::ValueParser::string()),
        )
        .arg(
            Arg::new("function")
                .help("JavaScript code to process each line, l is the origin string")
                .required(true)
                .index(1),
        )
        .arg(
            Arg::new("file")
                .help("Path to the input file. If not provided, reads from stdin.")
                .index(2),
        )
        .get_matches();

    let begin_code = matches.get_one::<String>("begin");
    let end_code = matches.get_one::<String>("end").cloned();
    let js_function = matches.get_one::<String>("function").unwrap();
    let file_path = matches.get_one::<String>("file");

    // 创建JavaScript 执行上下文
    let mut runtime = JsRuntime::new(RuntimeOptions::default());

    // 创建全局变量
    runtime
        .execute_script("<anon>", "var ctx = {}, n1=0, n2=0, n3=0, s='', arr=[];")
        .expect("Eval failed");
    // 执行begin的代码块，如果有的话
    if let Some(code) = begin_code {
        runtime
            .execute_script("<anon>", code.to_string())
            .expect("Eval failed");
    }

    // 逐行读取文件或者管道内容
    let input: Box<dyn BufRead> = if let Some(path) = file_path {
        Box::new(BufReader::new(
            File::open(path).expect("Failed to open file"),
        ))
    } else {
        Box::new(io::stdin().lock())
    };
    let mut vec = vec![];
    for line in input.lines() {
        let line = line.unwrap();
        let line = line.replace("'", "\\'");
        vec.push(line.to_string());
        // 先扔到数组里，每200行，处理一次
        if vec.len() == 200 {
            eval(&mut vec, &mut runtime, &js_function);
        }
    }
    if !vec.is_empty() {
        eval(&mut vec, &mut runtime, &js_function);
    }
    // Execute end code if provided
    if let Some(code) = end_code {
        runtime.execute_script("<anon>", code).expect("Eval failed");
    }
}

fn eval(vec: &mut Vec<String>, runtime: &mut JsRuntime, js_function: &str) {
    let mut func = "var ls = [".to_string();
    for ele in vec.iter() {
        func.push_str("'");
        func.push_str(ele);
        func.push_str("', ")
    }
    func.push_str("];");
    vec.clear();

    func.push_str(&format!("ls.forEach(l=>{{ {} }})", js_function));
    let func = format!("{{ {} }}", func);
    runtime.execute_script("<anon>", func).expect("Eval failed");
}
