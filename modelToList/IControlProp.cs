using System;
using System.Collections.Generic;
using System.Reflection;

namespace modelToList
{
    public interface IControlProp
    {
        string defaultVal { get; set; }
        string typeName { get; set; }
        string controlTypeName { get; set; }

        /// <summary>
        /// 控件类型
        /// </summary>
        ControlTypeEnum? controlType { get; set; }

        /// <summary>
        /// 允许空
        /// </summary>
        bool allowNull { get; set; }

        /// <summary>
        /// 左侧lable名
        /// </summary>
        string lableName { get; set; }

        /// <summary>
        /// 控件名
        /// </summary>
        string controlName { get; set; }

        /// <summary>
        /// class字符串
        /// </summary>
        string classStr { get; set; }

        /// <summary>
        /// 是否显示
        /// </summary>
        bool isShow { get; set; }

        /// <summary>
        /// 验证正则表达式
        /// </summary>
        string regExp { get; set; }

        /// <summary>
        /// 控件选项
        /// </summary>
        string option { get; set; }

        /// <summary>
        /// 在js里的 OptionName 解析时直接使用这个对象来构造控件
        /// </summary>
        string jsOptionName { get; set; }
    }
}
