# 如何封装自己的组件库
封装自己的组件库，主要是为了复用代码，提高开发效率。对个人而言就是想要一个属于自己风格的组件样式，来进行小工具的开发。有很多开源可用的框架但是都是`full styled`的，例如国内常见的`antd`，这种组件的样式定制化严重，在此基础上修改样式，比较trick，也很麻烦，但是如果对样式没有任何要求的，就想要能看、又能用的组件，那确实是个不错的选择。

backlight上的文章：你当然可以从头写一套组件库，但是那样的成本很高，而使用开源的库作为`core`核心是更明智的选择。

![image](https://i.imgur.com/SxRUie9.png)

其中还提到了[一篇文章](https://medium.com/@nirbenyair/headless-components-in-react-and-why-i-stopped-using-ui-libraries-a8208197c268),可以很好的作为`headless`或者`unstyle`组件定位和真正有用的解释，作者以自身的为例，从使用`MUI`到自定义功能，在其上改造，最终发现问题重重，复杂、难以维护等问题。并最终尝试自己封装满足功能需求的下拉列表，又遇到了多平台的可用性问题，难度也非常大。文章多次强调accessible的重要性，以及实现功能完整、多端可用的组件的难度，并给出了一个例子：radix的下拉菜单的开发时间超过2k小时，长达6个月的开发，这也侧面劝退着完全想从头开发（build from scratch）的人。

![image](https://i.imgur.com/dhAO0qb.png)

文章很好的解释了`full style`框架在某些场景下的缺点，对于不了解headless的人来说，是非常有用的入门文章。

# 1 关于组件的分类
查看各种组件库，封装的组件个数从几个到上百个不等，大概可以分为三类：
- 原子类组件：即将一个原生dom元素进行封装的组件，比如`button`、`card`、`textInput`、`badge`等，这类组件不太需要逻辑，基本就是将dom的属性与框架整合，比如属性和事件与react的state整合。有些框架甚至没有封装这一类组件，做了封装的大都是为了与整体框架的风格保持一致，封装了较多`css`样式。

- 表单类组件：表单中的各种输入框是非常重要的一类组件，单独作为一个分类，原生的input默认是text类型的，但对于`checkbox`、`radio`等类型，包括`select`标签，其样式都是无法修改的，这类组件又天然的有输入类型的一些属性，所以要想封装自定义的`checkbox`或者`select`等，是需要隐藏原始dom标签，利用css绘制一个新的span来李代桃僵，并且有这非常复杂的逻辑处理和属性桥接，自己实现的难度较大。

- 组合类组件：有些组件功能在原生dom中没有提供，但是对于用户体验又非常重要，需要组合多个dom，并自定义逻辑和样式来实现。实际逻辑不同，实现成本也不同。比如`tab`、`tooltip`、`popover`这种相对就简单一些，而`datepicker`、`pagination`这种就会比较复杂，不同的组件库组件个数的差异主要也就体现在这一部分。

# 2 core framework
借用文章中的概念，我们也称其为`core framework`，对于核心框架其实也分为不同的种类：
## 2.1 原语类API
仅提供一些API，比如react的hook，例如`react-aria api`的`useButton`、`useCheckbox`等，这种是最`low level`级别的封装。我们看个例子如何组织代码：

![image](https://i.imgur.com/qhMl2Qk.png)

可以看到上面例子中，仅从`react-aria`中引入了两个钩子函数，其中`useToggleState`的作用是将`props`中的`defaultChecked`和`checked`属性，转换成`state`。而`useCheckbox`是比较关键的，他接受了一些属性信息和dom的ref，返回一个dom的属性信息，包括`aria-checked`、`aria-disabled`等，这些属性信息是为了让屏幕阅读器更好的识别，让用户更好的使用。

初看上去，好像上面的代码没有什么作用，和直接使用`<input type="checkbox"/>`没什么区别，设想如果单纯靠一个`input`原生组件，我们如何去获取他的checked，然后与我们的`state`进行绑定呢？是不是需要将原生的dom的onchange事件指向组件内自定义的函数，然后将dom的属性变动桥接到我们state的变动上来。还有disabled等属性，这些事情都比较繁琐，`react aria`帮我们封装这些API，让他们更加容易使用。这样我们就可以以react的模式来进行组织代码。下面是添加一些样式后的一个checkbox。

![image](https://i.imgur.com/US3dogW.png)

disable也会被正常的处理：

![image](https://i.imgur.com/QBzNjiC.png)

他的代码很简单，如下`jsx`部分基本上抄官网代码即可，稍有不同的是，在`label`上添加了样式，并且很重要的一点是增加了一个`span`标签，因为原生的`checkbox`样式是无法修改的，我们只能将原生的`input`给隐藏，然后用`span` + `css` 绘制新的样式。
```jsx
import React from 'react';
import { useCheckbox } from '@react-aria/checkbox';
import { useToggleState } from '@react-stately/toggle';



function Checkbox(props: any) {
    let state = useToggleState(props);
    let ref = React.useRef(null);
    let { inputProps } = useCheckbox(props, state, ref);

    return (
        <label
            style={{
                display: 'flex',
                alignItems: 'center',
                opacity: props.isDisabled ? 0.4 : 1
            }}
            className='checkbox'
        >
            <input {...inputProps} type='checkbox' ref={ref} />
            <span className="checkmark"></span>
            {props.children}
        </label>
    );
}
```
css部分的代码如下，简单讲就是`checkbox`样式是修饰label，其里面`input`要被隐藏，`checkmark`样式是修改span，也就是个白色有阴影的框；`checkmark:after`伪类是绘制选中时的对号，默认是隐藏，选中时展示即可。

注意`var(--w-xxxx)`是自定义的颜色，您应该换成自己的颜色。
```css
/* label的样式，都是一些基本的 */
.checkbox {
  position: relative;
  padding-left: 25px;
  cursor: pointer;
  display: inline-block;
  user-select: none;
}

/* label里的input也就是原生checkbox，将其隐藏即可 */
.checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

/* checkmark也就是我们植入的span，用于绘制新的样式，也就是方形阴影的白框 */
.checkbox .checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #eee;
  border-radius: 4px;
  border: 1px solid;
  box-shadow: 1px 1px var(--w-green-dark), 2px 2px var(--w-black-dark), inset 0 0 0 1px var(--w-indigo-dark);
}

/* 鼠标悬停时，阴影的颜色变化 算是css的细节 */
.checkbox .checkmark:hover{
  box-shadow: 1px 1px var(--w-green-light), 2px 2px var(--w-black-dark), inset 0 0 0 1px var(--w-indigo-dark);
}

/* 选中时，阴影的颜色变为蓝色 */
.checkbox input[type="checkbox"]:checked ~ .checkmark {
  background-color: var(--w-blue-light);
}

/* 绘制选中时候的对号，默认是display:none看不到 */
.checkbox .checkmark:after {
  content: "";
  position: absolute;
  display: none;
  box-shadow: 3px 1px 1px;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 12px;
  border: solid var(--w-yellow);
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
}

/* 选中的时候就看到咯 */
.checkbox input[type="checkbox"]:checked ~ .checkmark:after {
  display: block;
}
```
原语类的框架除了上面介绍的adobe公司的[react-aria](https://react-spectrum.adobe.com/react-aria/)(只能用于react框架)，还有[zag](https://zagjs.com/)(支持react/vue/solid)等。也有一些开源的库专门对某一个或某几个组件类型进行封装，比如[downshift](https://www.downshift-js.com/)(只react)，封装了`autocomplete/combobox/select`三种原语，其他的比如react的话，也可以直接去搜索提供`useTable`、`useDatePicker`、`usePagination`等关键字，也能找到一些不错的单个的开源实现。
## 2.2 无样式unstyled components
不提供任何样式的组件，不了解headless真正“威力”的人，点进这种组件库，可能一看样式立马就劝退了，所以很多无样式的组件库，也会内置一个默认的不算难看的样式，但是可以随意修改。这类框架非常多，他比原语类的好处就是，他是提供了组件的标签，你在标签内部定义不同的组成部分的dom，然后可以在这些dom上添加style。

这类框架选择性就比较多了，对于`react/vue/svelte/webcomponents`等都有可选的。下面参考`backlight`简单列出一些比较出名的：

- react下可用的： 
    - radix：shadcn就基于这个，大概有20多个组件，14K star
    - react-aria components：adobe使用自己封装的原语自己又做了一套无样式的组件库，组件数40+。 11.8K star
    - reach ui：remix和react route作者写的，组件较少10+，但都是常用到的，5.9K star
    - headless ui：名字起的好，star少不了，24Kstar，组件10+不多，但是默认样式还挺好看。
    - reakit 7.6k 下面这俩没咋看过，感兴趣可以去了解下。
    - ariakit

- vue下可用的
    - headless ui: 提供了vue和react的支持。

- webcomponents
    - @microsoft/fast-foundation 默认有样式的组件，每个组件也都提供了改为自定义样式的方法。
    - lion 默认无样式的组件，文档虽然有点劝退，但是基本都是填充原生的dom组件，对二次开发非常友好。

还是以`checkbox`为例，看下radix是如何使用如下图，是引入了`Checkbox`下的多个子组件，`Root`表示整个复选框，对应了一个button元素，`Indicator`和`Icon`最终效果也就是那个对号是一个svg标签。从最终结果看也是将input给隐藏了，然后放了一个button在前面，和我们前面使用span李代桃僵也是类似的思路。

![image](https://i.imgur.com/gO2bdYV.png)

![image](https://i.imgur.com/JrRucIw.png)

与原语型的库相比，无样式的库，有一层组件标签的抽象，但是也提供了css调整的自由度，只不过相比原语的完全自定义的自由度要低一些，但是上手的难度较低。