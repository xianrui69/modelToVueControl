using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;

namespace modelToList
{
    public static class Extensions
    {
        /// <summary>
        /// 返回当前对象的类型的描述
        /// 取DescriptionAttribute的Description 和 DisplayAttribute的Name
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static string GetDescription(this object obj)
        {
            if (obj == null) return "";
            var type = obj.GetType();
            if (type == null) return "";
            var attrs = new List<Type> { typeof(DescriptionAttribute), typeof(System.ComponentModel.DataAnnotations.DisplayAttribute) };
            var result = type.GetCustomAttributes(typeof(DescriptionAttribute), true);
            if (result.Count() > 0) return (result.Last() as DescriptionAttribute).Description;
            result = type.GetCustomAttributes(typeof(System.ComponentModel.DataAnnotations.DisplayAttribute), true);
            if (result.Count() > 0) return (result.Last() as System.ComponentModel.DataAnnotations.DisplayAttribute).Name;
            return "";
            
        }
        public static object[] GetEnumData(this Type enumType)
        {
            if (enumType.IsEnum)//枚举类型
            {
                var names = Enum.GetNames(enumType);
                dynamic[] datas = new dynamic[names.Length];
                var enumerator = Enum.GetValues(enumType).GetEnumerator();
                var values = new List<object> { };
                while (enumerator.MoveNext())
                    values.Add(enumerator.Current);
                Type type = enumType;   //获取类型
                for (int i = 0; i < names.Length; i++)
                {
                    var memberInfos = type.GetMember(names[i].ToString());
                    if (memberInfos != null && memberInfos.Length > 0)
                    {
                        DescriptionAttribute[] attrs = memberInfos[0].GetCustomAttributes(typeof(DescriptionAttribute), false) as DescriptionAttribute[];   //获取描述特性
                        if (attrs != null && attrs.Length > 0 && !attrs[0].Description.IsNullEmpty())
                            names[i] = attrs[0].Description;//使用枚举描述
                    }
                    datas[i] = new { id = values[i], text = names[i] };
                }
                datas = datas.ToList().OrderBy(el => el.id).ToArray();
                return datas;
            }
            return null;
        }


        /// <summary>
        /// 判断对象是否为null, string.Empty 或空白字符
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static bool IsNullEmpty(this object value)
        {
            if ((value != null) && !(value.ToString() == string.Empty))
            {
                return (value.ToString().Trim().Length == 0);
            }
            return true;
        }
    }
}

