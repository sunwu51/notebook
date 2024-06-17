import {YearsTabs, Item} from './components/YearsTabs'
import Details from "./components/Details";
import fs from "fs";
import matter from 'gray-matter'
import Link from "next/link";
const path = require('path');
const POSTS_PATH = process.cwd();
var filenames = fs.readdirSync(POSTS_PATH);

const monthes = filenames.filter(item => item.match(/\d\d\.\d\d?/));

const posts = monthes.flatMap((month) => {
  // const filenames = sortFilesByCreationTime(path.join(POSTS_PATH, month));
  const filenames = fs.readdirSync(path.join(POSTS_PATH, month));
  const _posts = filenames.filter(item => item.match(/\.mdx?$/))
    .map(item => {
      // 
      const {data: frontmatter} = matter(fs.readFileSync(path.join(POSTS_PATH, month, item), 'utf8'));
      let tags = [];
      if (frontmatter.tags) {
        if (typeof(frontmatter.tags) === 'string') {
          tags = frontmatter.tags.split(',').map(it=>it.trim()).filter(it=>it.length)
        }
        if (Array.isArray(frontmatter.tags)) {
          tags = frontmatter.tags
        }
      }
      let createTime = fs.statSync(path.join(POSTS_PATH, month, item)).birthtimeMs;
      if (frontmatter.date) {
        createTime = frontmatter.date.getTime();
      }
      return {item, tags, createTime};
    })
    .sort((a,b)=> a.createTime - b.createTime)
    .map(({item, tags}) => {
      const slug = item.replace(/\.mdx?$/, '');
      return { slug, month, tags };
    });
  return _posts;
})
var year2Month = {}, month2Posts = {};
posts.forEach(({ slug, month, tags }) => {
  const year = '20' + month.substring(0, 2);
  year2Month[year] = year2Month[year] || []; year2Month[year].push(month);
  year2Month[year] = [...new Set(year2Month[year])].sort((a, b) => (a.split('.')[1] - b.split('.')[1]));
  month2Posts[month] = month2Posts[month] || []; month2Posts[month].push({slug, tags});
});
var years = Object.keys(year2Month).sort((a, b) => b - a)
// 最近的一年，月份反排序
year2Month[years[0]] = year2Month[years[0]].sort((a, b) => (b.split('.')[1] - a.split('.')[1]))

export default function Home() {
  return (
    <main className="flex  flex-col items-center">
      <div className="flex flex-col items-center justify-center">
        <h1>
          hi, 欢迎来到我的博客(笔记)
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center w-full">
        <YearsTabs>
          {
            years.map(year => (
              <Item key={year} title={year}>
                {year2Month[year].map(month =>
                  <div key={month} className="p-4 my-2 wave">
                    <Details btnClassName="text-xl font-600" title={month} defaultSelected={true}>
                      {
                        month2Posts[month].map(({slug, tags}) => (
                          <div key={slug} className="mb-2">
                            <Link style={{padding:0}} href={"/blog/" + month + "/" + slug}>{slug}</Link>
                            { tags && tags.length > 0 &&  <div className="mt-[-16px]">{
                              tags.map(tag => (                            
                                <span key={tag} className=" bg-gray-900 text-white px-2 py-1 rounded-md mr-1 text-[0.7rem]">
                                  {tag}
                                </span>
                              ))
                            }</div>}
                          </div>
                        ))
                      }
                    </Details>
                  </div>
                )}
              </Item>
            ))
          }
        </YearsTabs>
      </div>
    </main >
  );
}
