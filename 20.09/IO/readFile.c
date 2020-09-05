#include <stdio.h>

int main()
{
   FILE *fp = NULL;
   char buff[255];

   fp = fopen("pom.xml", "r");

   fgets(buff, 255, (FILE*)fp);  //scanf遇到空格就会断开，gets会读取空格，遇到换行就结束
   printf("%s\n", buff );     //255是限制最大读取内容长度

   fclose(fp);

}
