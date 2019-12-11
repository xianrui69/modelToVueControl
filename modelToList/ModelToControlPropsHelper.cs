using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;

namespace modelToList
{
    public class ModelToControlPropsHelper
    {
        static ModelToControlPropsHelper()
        {
        }

        /// <summary>
        /// 针对不同类型 转换成不同控件
        /// </summary>
        private static Dictionary<Type, ControlProp> defaultPropKeyValue = new Dictionary<Type, ControlProp>();

        #region 多类型获取

        #region 多属性转化成一个IDialogProp

        //可能要往这方面重构 方便单独看代码
        private static void setOtion(IControlProp controlProp, List<PropertyInfo> propertyInfos)
        {
        }

        /// <summary>
        /// 将多个属性 转化成页面需要的一个对象
        /// 汇总所有属性 取其Attributes集合的最后一个作为基准值
        /// eg：（<span class="form-lb">名称</span><input id = "txtTitle" name="title" class="easyui-textbox form-box" required>）
        /// </summary>
        /// <param name="propertyInfo"></param>
        /// <returns></returns>
        private static IControlProp byPropertieTo_prop(List<PropertyInfo> propertyInfos)
        {
            if (propertyInfos == null || propertyInfos.Count == 0) return null;
            propertyInfos.RemoveAll(el => el == null);
            if (propertyInfos.Count == 0) return null;
            IControlProp prop = null;
            Func<Type, List<object>> GetCustomAttributes = (type) =>
            {
                List<object> result = new List<object>();
                foreach (var _propertyInfo in propertyInfos)
                    result.AddRange(_propertyInfo.GetCustomAttributes(type, true));
                return result;
            };
            var objs = GetCustomAttributes(typeof(ControlPropAttribute));
            bool hasControlPropAttribute = objs.Count > 0;
            if (hasControlPropAttribute)
                prop = (objs.Last() as IControlProp);//如果属性有DialogObjAttribute 则直接取这个作为初始值
            else prop = new ControlProp();
            var PropertyType = propertyInfos.Last().PropertyType;
            //非值类型 字符串时隐藏 可以做其他扩展
            if (!(PropertyType.IsValueType || PropertyType == typeof(string)) && prop.typeName != "List`1")
            {
                prop = new ControlProp
                {
                    isShow = false,
                    controlName = propertyInfos.Last().Name,
                    typeName = PropertyType.Name
                };
            }
            ControlProp defaultProp = new ControlProp();//类型的预设
            bool hasDefaultProp = defaultPropKeyValue.ContainsKey(PropertyType);
            if (hasDefaultProp) defaultProp = defaultPropKeyValue[PropertyType];
            var nulltype = Nullable.GetUnderlyingType(PropertyType);
            prop.typeName = nulltype == null ? PropertyType.Name : nulltype.Name + "?";
            if (prop.typeName == "List`1")
            {
                PropertyType = PropertyType.GetGenericArguments()[0];
                prop.typeName = string.Format("List<{0}>", PropertyType.Name);
            }
            //控件名
            if (prop.controlName.IsNullEmpty()) prop.controlName = propertyInfos.Last().Name;

            #region 左侧lable名

            objs = GetCustomAttributes(typeof(DescriptionAttribute));
            if (prop.lableName.IsNullEmpty())
            {
                if (objs.Count > 0)
                    prop.lableName = (objs.Last() as DescriptionAttribute).Description;
                else
                {
                    objs = GetCustomAttributes(typeof(DisplayAttribute));
                    if (objs.Count > 0)
                        prop.lableName = (objs.Last() as DisplayAttribute).Name;
                }
                if (prop.lableName.IsNullEmpty()) prop.lableName = prop.controlName;
            }

            #endregion 左侧lable名

            //不存在ControlPropAttribute特性时
            if (!hasControlPropAttribute)
            {
                //                                  默认值                     类型包含问号
                prop.allowNull = hasDefaultProp ? defaultProp.allowNull : PropertyType.Name.IndexOf("Nullable") != -1;//允许空
                prop.isShow = hasDefaultProp ? defaultProp.isShow : true;//显示
                prop.classStr = hasDefaultProp ? defaultProp.classStr : "";//样式
                prop.regExp = hasDefaultProp ? defaultProp.regExp : "";//正则
                prop.option = hasDefaultProp ? defaultProp.option : null;//数据源
                if (PropertyType.Name.IndexOf("Nullable") != -1)
                {
                    try
                    {
                        PropertyType = PropertyType.GetGenericArguments()[0];
                    }
                    catch (Exception)
                    {
                    }
                }
                if (PropertyType.IsEnum)//枚举类型
                {
                    prop.option = Newtonsoft.Json.JsonConvert.SerializeObject(new { data = PropertyType.GetEnumData() });
                    prop.controlType = ControlTypeEnum.枚举下拉框;
                }
            }

            #region 即使存在ControlPropAttribute特性也会被覆盖的值

            #region 得到是否必填

            objs = GetCustomAttributes(typeof(RequiredAttribute));
            prop.allowNull = objs.Count == 0;

            #endregion 得到是否必填

            #region 是否显示

            if (prop.lableName == prop.controlName) prop.isShow = false;
            objs = GetCustomAttributes(typeof(IsShowAttribute));
            if (objs.Count > 0)
                prop.isShow = (objs.Last() as IsShowAttribute).IsShow;

            #endregion 是否显示

            #region 获取默认值

            objs = GetCustomAttributes(typeof(DefaultValueAttribute));
            if (objs.Count > 0)
                prop.defaultVal = (objs.Last() as DefaultValueAttribute).Value + "";

            #endregion 获取默认值

            Dictionary<string, object> optionDiv = null;
            Action<string, object> optionDivAdd = (key, val) =>
            {
                if (!optionDiv.ContainsKey(key)) optionDiv.Add(key, "");
                optionDiv[key] = val;
            };

            #region 获取控件Option

            objs = GetCustomAttributes(typeof(ControlOptionAttribute));
            foreach (var option in objs)
            {
                var objStr = (option as ControlOptionAttribute).Option.Trim();
                try
                {
                    if (objStr[0] != '{') objStr = "{" + objStr + "}";
                    var new_obj = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(objStr);
                    if (optionDiv != null)
                        foreach (var key in new_obj.Keys) optionDivAdd(key, new_obj[key]);
                    else optionDiv = new_obj;
                }
                catch (Exception)
                {
                    prop.option = objStr;
                }
            }
            if (optionDiv != null &&
                prop.typeName.IndexOf("List<") == 0) optionDivAdd("multiple", true);

            #endregion 获取控件Option

            #region 控件类型

            objs = GetCustomAttributes(typeof(ControlTypeAttribute));
            if (objs.Count > 0)
                prop.controlType = (objs.Last() as ControlTypeAttribute).ControlType;

            #endregion 控件类型

            Dictionary<string, string> regRule = new Dictionary<string, string>();
            Action<string, string> AddRule = (key, val) =>
            {
                if (!regRule.ContainsKey(key)) regRule.Add(key, "");
                regRule[key] = val;
            };

            #region 处理数值型

            var integers = new[] { typeof(sbyte), typeof(short), typeof(int), typeof(long)
                                    , typeof(byte), typeof(ushort), typeof(uint), typeof(ulong),
                                    typeof(sbyte?), typeof(short?), typeof(int?), typeof(long?)
                                    , typeof(byte?), typeof(ushort?), typeof(uint?), typeof(ulong?) };
            var floats = new[] { typeof(decimal), typeof(float), typeof(double),
                                typeof(decimal?), typeof(float?), typeof(double?)};
            var isInt = false;
            if (isInt = integers.Contains(PropertyType) || floats.Contains(PropertyType))
            {
                if (prop.controlType == null || prop.controlType == ControlTypeEnum.无)
                    prop.controlType = isInt ? ControlTypeEnum.数字微调 : ControlTypeEnum.数值输入框;
                var type = integers.FirstOrDefault(el => el == PropertyType) ?? floats.FirstOrDefault(el => el == PropertyType);
                //optionDivAdd("min", "");
                //optionDivAdd("max", "");
            }

            #endregion 处理数值型

            #region 获取正则验证等

            if (prop.regExp == null) prop.regExp = "";
            int? maxLen = null, minLen = null;
            objs = GetCustomAttributes(typeof(ColumnAttribute));
            if (objs.Count > 0)
            {
                var nm = (objs.Last() as ColumnAttribute).TypeName;
                var lenRegRule = new Regex("^(\\s)?(nvarchar|varchar|char|nchar)\\((\\d.+?)\\)(\\s)?$");
                var lenMatches = lenRegRule.Match(nm.ToLower());
                if (lenMatches.Success)
                    maxLen = int.Parse(lenMatches.Groups[3].Value);
            }
            objs = GetCustomAttributes(typeof(StringLengthAttribute));
            if (objs.Count > 0)
            {
                var num = (objs.Last() as StringLengthAttribute).MaximumLength;
                if (num > 0) maxLen = num;
                num = (objs.Last() as StringLengthAttribute).MinimumLength;
                if (num > 0) minLen = num;
            }
            if (maxLen != null && minLen != null) prop.regExp = $"length[{minLen.Value},{maxLen.Value}]";
            else if (minLen != null) prop.regExp = $"minLength[{minLen.Value}]";
            else if (maxLen != null) prop.regExp = $"maxLength[{maxLen.Value}]";

            #endregion 获取正则验证等

            if (optionDiv != null) prop.option = Newtonsoft.Json.JsonConvert.SerializeObject(optionDiv);

            #endregion 即使存在ControlPropAttribute特性也会被覆盖的值

            return prop;
        }

        #endregion 多属性转化成一个IDialogProp

        /// <summary>
        /// 从T1获取T拥有的各种属性的Attribute 转换成IDialogProp
        /// 如果T也有各种属性，会覆盖从T1获取到的Attribute
        /// DialogObj标签存在时 直接运用DialogObj的各项值
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <typeparam name="T1"></typeparam>
        /// <returns></returns>
        public static List<IControlProp> DtoToDialogOb<T, T1>()
        {
            return DtoToDialogOb(new List<Type> { typeof(T), typeof(T1) });
        }

        //覆盖顺序为由后往前
        public static List<IControlProp> DtoToDialogOb(List<Type> types)
        {
            List<IControlProp> obj = new List<IControlProp>();
            var tOne = types[0];
            types.RemoveAt(0);
            //得到T的所有属性 Main
            var mainProperties = tOne.GetProperties();
            //得到其他的所有属性
            var otherProperties = new List<PropertyInfo>();
            if (types == null) types = new List<Type>();
            types.ForEach(el => otherProperties.AddRange(el.GetProperties()));
            //PagedInputDto
            //转化成对应的prop
            mainProperties.ToList().ForEach(el =>
            {
                var _p = otherProperties.FindAll(t1El => t1El.Name == el.Name);
                _p.Reverse();
                var list = new List<PropertyInfo>();
                if (_p != null) _p.ForEach(_el => list.Add(_el));
                if (el != null) list.Add(el);
                var prop = byPropertieTo_prop(list);//再取一遍t的属性标签
                obj.Add(prop);
            });
            return obj;
        }

        #endregion 多类型获取

        #region 单T获取

        public static List<IControlProp> DtoToDialogOb<T>()
        {
            return DtoToDialogOb(new List<Type> { typeof(T) });
        }

        #endregion 单T获取
    }
}
