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
  const filenames = fs.readdirSync(path.join(POSTS_PATH, month));
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
  year2Month[year] = [...new Set(year2Month[year])];
  month2Posts[month] = month2Posts[month] || []; month2Posts[month].push(slug);
});
years = Object.keys(year2Month).sort((a, b) => b - a)

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex flex-col items-center justify-center">
        <h1>
          hi, 欢迎来到我的博客
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Tabs>
          {
            years.map(year => (
              <Item title={year}>
                {year2Month[year].map(month =>
                  <Details title={month} isSelected={true}>
                    <Timeline
                      items={month2Posts[month].map(it => ({
                        children:
                          <a href={"/blog/" + month + "/" + it}>{it}</a>
                      }))}
                    ></Timeline>
                  </Details>
                )}
              </Item>
            ))
          }
        </Tabs>
      </div>
    </main >
  );
}
