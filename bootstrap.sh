#!/bin/bash
arr=$(ls -F|grep '/$')

trans(){
  echo $1..........
  cd $1
  mdfiles=$(ls|grep 'md$')
  htfiles=$(ls|grep 'html$')
  for j in $mdfiles
  do
    tmp=${j%.*}".html"
    if [[ "${htfiles[@]}" =~ $tmp ]]
    then
      echo "include ${j%.*}.html"
    else
      echo "shangwei trans ${j%.*}.md"
      ghmd ${j%.*}.md
    fi
  done
  cd ..
}



for i in $arr
do
  trans $i
done
h=`find . -name '*.html' | xargs ls -tr`
node ./a.js $h