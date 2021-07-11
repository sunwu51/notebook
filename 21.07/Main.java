package com.example.demo;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 论文查重demo
 *
 * @author Frank
 * @date 2021/7/11 15:06
 */
@Slf4j
public class Main {
    static final Set<Sentence> EMPTY_SET = new HashSet<>();

    private static List<Sentence> preload() throws IOException {
        File[] files = new File("C:\\Users\\sunwu\\Desktop\\code\\demo\\src\\main\\resources\\article").listFiles();
        Map<String, List<String>> filename2SubSentence = new HashMap<>();
        for(File file: files){
            List<String> sections = Files.readAllLines(file.toPath());
            sections = sections.stream().map(String::trim).collect(Collectors.toList());
            sections.removeIf(StringUtils::isEmpty);

            List<String> subSentence = new ArrayList<>();
            for (String section : sections) {
                subSentence.addAll(Arrays.asList(section.split("[，。；！？]")));
            }

            filename2SubSentence.put(file.getName().substring(0, file.getName().lastIndexOf('.')), subSentence);
        }
        log.info("preload finish");


        List<Sentence> result = new ArrayList<>();
        filename2SubSentence.forEach((n, ss)->{
            ss.forEach(s->{
                result.add(new Sentence(s,n));
            });
        });
        return result;
    }

    private static Map<String, List<Sentence>> buildInvertIndex(List<Sentence> sentences){
        Map<String, List<Sentence>> result = new HashMap<>();
        for (Sentence sentence : sentences) {
            if(sentence.text.length() < 4){
                continue;
            }
            for (int i=0; i<=sentence.text.length()-4; i++){
                result.computeIfAbsent(sentence.text.substring(i, i+4), k->new ArrayList<>())
                        .add(sentence);
            }
        }
        log.info("build invert index finish");
        return result;
    }
    private static List<String> readInput() throws IOException {
        List<String> subSentence = new ArrayList<>();
        List<String> sections = Files.readAllLines(new File("C:\\Users\\sunwu\\Desktop\\code\\demo\\src\\main\\resources\\input\\基层地质勘探工作管理对策研究.txt").toPath());
        sections = sections.stream().map(String::trim).collect(Collectors.toList());
        sections.removeIf(StringUtils::isEmpty);

        for (String section : sections) {
            subSentence.addAll(Arrays.asList(section.split("[，。；！？]")));
        }
        return subSentence;
    }


    private static List<Set<Sentence>> compare(List<String> subSentence, Map<String, List<Sentence>> invertIndex) throws IOException {
        List<Set<Sentence>> result = new ArrayList<>();
        for (String s : subSentence) {
            if(s.length() < 7){
                result.add(EMPTY_SET);
                continue;
            }

            Set<Sentence> set = new HashSet<>();
            for(int i=0; i<=s.length()-4;i++){
                for (Sentence sentence : invertIndex.getOrDefault(s.substring(i, i + 4), new ArrayList<>())) {
                    if(lcs(sentence.text, s)>=7){
                        set.add(sentence);
                    }
                }
            }
            result.add(set);
        }

        log.info("compare finish");
        return result;
    }

    private static int lcs(String s1, String s2){
        int[] pre = new int[s1.length()];
        int[] cur = new int[s1.length()];

        for(int i=0; i<s2.length(); i++){
            for(int j=0; j<s1.length(); j++){
                if(s2.charAt(i) == s1.charAt(j)){
                    cur[j] = j==0? 1 : pre[j-1] + 1;
                }else{
                    cur[j] = Math.max(pre[j], j==0? 0 : cur[j-1]);
                }
            }
            pre = cur;
            cur = new int[s1.length()];
        }
        return pre[pre.length - 1];
    }


    public static void main(String[] args) throws IOException {
        List<Sentence> sentences = preload();
        Map<String, List<Sentence>> invertIndex = buildInvertIndex(sentences);


        List<String> input = readInput();

        List<Set<Sentence>> result = compare(input, invertIndex);

        for (int i =0; i<result.size(); i++) {
            Set<Sentence> sentenceSet = result.get(i);
            if(!sentenceSet.isEmpty()){
                for (Sentence sentence : sentenceSet) {
                    log.info("文中【{}】与库中《{}》的【{}】相似", input.get(i), sentence.article, sentence.text);
                }
            }
        }


    }
    @AllArgsConstructor
    static class Sentence{
        String text;
        String article;
    }
}