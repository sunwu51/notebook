# emotion
emotion是一个前端框架，来实现css-in-js，就是在js中写css，主要是配合react来使用的。官方给出了两种使用方式，一种是直接使用`@emotion/css`，如下，className指定一个css写法，后面会渲染成一个class的名字(乱码)，其实这种用法直接用style就好了，也不会专门使用emotion，所以重点是第二种用法。
```
npm i @emotion/css
```
```jsx
import { css, cx } from '@emotion/css'

const color = 'white'

render(
  <div
    className={css`
      padding: 32px;
      background-color: hotpink;
      font-size: 24px;
      border-radius: 4px;
      &:hover {
        color: ${color};
      }
    `}
  >
    Hover to change color.
  </div>
)
```
第二种用法是结合react和styled来使用。下面是个简单的例子，注意`styled`的作用，他其实是创建一个组件，该组件的dom标签是button，然后css样式是后面定义的部分。比如我们可以定义一些容器div之类的。此外也可对已有的组件添加css样式。
```
npm i @emotion/styled @emotion/react
```
```jsx
import styled from '@emotion/styled'
import  {Card} from 'antd'

const Button = styled.button`
  padding: 32px;
  background-color: hotpink;
  font-size: 24px;
  border-radius: 4px;
  color: black;
  font-weight: bold;
  &:hover {
    color: white;
  }
`

// Card 是antd已存在的组件，对已有的react组件添加css样式，并命名为新的组件
// 新组建所有的属性和功能与原来一致
const ShadowCard = styled(Card)`
    width: 40rem;
    min-height: 56rem;
    padding: 3.2rem 4rem;
    border-radius: 0.3rem;
    box-sizing: border-box;
    box-shadow: rgba(0, 0, 0, 0.1) 0 0 10px;
    text-align: center;
`;

```
# 小结
emotion可以和react很好的结合，将css写在jsx中进行组件化管理。他会生成一个随机的css类名，有很好的scope隔离，和module.css类似。 因为是在js中写的，所以可以加一定的判断逻辑，在之前写Lit的时候就发现了这种优点。