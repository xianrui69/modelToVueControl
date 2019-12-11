using System;
using System.Collections.Generic;
using System.Reflection;

namespace modelToList
{
    public class ControlProp : IControlProp
    {
        public string defaultVal { get; set; }
        public string typeName { get; set; }

        public string controlTypeName
        {
            get
            {
                var val = "";
                var names = Enum.GetNames(typeof(ControlTypeEnum));
                if (controlType == null) controlType = ControlTypeEnum.无;
                try
                {
                    val = Enum.GetName(typeof(ControlTypeEnum), controlType.Value);
                }
                catch (Exception)
                {
                    val = Enum.GetName(typeof(ControlTypeEnum), ControlTypeEnum.无);
                }
                return val;
            }
            set { return; }
        }

        /// <summary>
        /// 控件类型
        /// </summary>
        public ControlTypeEnum? controlType { get; set; }

        /// <summary>
        /// 允许空
        /// </summary>
        public bool allowNull { get; set; }

        /// <summary>
        /// 左侧lable名
        /// </summary>
        public string lableName { get; set; }

        /// <summary>
        /// 控件名
        /// </summary>
        public string controlName { get; set; }

        /// <summary>
        /// class字符串
        /// </summary>
        public string classStr { get; set; }

        /// <summary>
        /// 是否显示
        /// </summary>
        public bool isShow { get; set; }

        /// <summary>
        /// 验证正则表达式
        /// </summary>
        public string regExp { get; set; }

        /// <summary>
        /// 控件选项
        /// </summary>
        public string option { get; set; }

        public string jsOptionName { get; set; }
    }
}
