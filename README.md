# modelToVueControl
后台模型映射成前台表单的小架构

这是一个把dto映射成页面控件的小架构；

主要目的是，反复把需要的实体转译成页面控件，正则验证，这种重复性的工作交给机器处理

两个标准：标准化的后台属性，即：对一个表的字段的所有描述；通过标签，以及类型解析方法来获取这些信息

标准化的前台解析，借助了vue引擎，最小的单元是一个控件，这样可以把它们渲染成不同的控件，适应不同的框架

如何得到后台属性集合：通过ajax一类的请求，通过代码把url映射到一个类型，并返回，最终页面明白如何解析它


----------------------------------------------------2020-3-18 11:59:39---------------------------------------


短期内不是很想维护了，主要是调试这个架构方面比较麻烦，入坑的人不易于理解架构它的初衷等等。不过还是追加优化了翻译动态页面的代码

easyui列的方法上面转换出来成正常js比较恶心人
