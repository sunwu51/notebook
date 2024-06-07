import Image from "next/image";
import { Item, Tabs } from "./components/Tabs";
import { Card, Timeline } from 'antd';
import Details from "./components/Details";
import fs from "fs";

const path = require('path');
const POSTS_PATH = process.cwd();
var filenames = fs.readdirSync(POSTS_PATH);

const monthes = filenames.filter(item => item.match(/\d\d\.\d\d?/));

const posts = monthes.flatMap((month) => {
  const filenames = sortFilesByCreationTime(path.join(POSTS_PATH, month));
  const posts = filenames.filter(item => item.match(/\.mdx?$/))
    .map(item => {
      const slug = item.replace(/\.mdx?$/, '');
      return { slug, month };
    });
  return posts;
})
var year2Month = {}, month2Posts = {}, years = [];
posts.forEach(({ slug, month }) => {
  const year = '20' + month.substring(0, 2);
  year2Month[year] = year2Month[year] || []; year2Month[year].push(month);
  year2Month[year] = [...new Set(year2Month[year])].sort((a, b) => (a.split('.')[1] - b.split('.')[1]));
  month2Posts[month] = month2Posts[month] || []; month2Posts[month].push(slug);
});
years = Object.keys(year2Month).sort((a, b) => b - a)

// 获取目录下所有文件的详细信息
function getFilesWithStats(dir) {
  const files = fs.readdirSync(dir);
  return files.map(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    return { file, stats };
  });
}

// 按照创建时间排序文件
function sortFilesByCreationTime(dir) {
  const filesWithStats = getFilesWithStats(dir);
  filesWithStats.sort((a, b) => a.stats.birthtimeMs - b.stats.birthtimeMs);
  return filesWithStats.map(item => item.file);
}

export default function Home() {
  return (
    <main className="flex  flex-col items-center">
      <div className="flex flex-col items-center justify-center">
        <h1>
          hi, 欢迎来到我的博客(笔记)
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center w-full">
        <Tabs>
          {
            years.map(year => (
              <Item title={year}>
                {year2Month[year].map(month =>
                  <div key={month} className="p-4 my-2 wave">
                    <Details btnClassName="text-xl font-600" title={month} defaultSelected={true}>
                      {
                        month2Posts[month].map(it => (
                          <div key={it} className="my-2">
                            <a href={"/blog/" + month + "/" + it}>{it}</a>
                          </div>
                        ))
                      }
                    </Details>
                  </div>
                )}
              </Item>
            ))
          }
        </Tabs>
      </div>
    </main >
  );
}
