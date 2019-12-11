using System;

namespace modelToList
{
    [AttributeUsage(AttributeTargets.Property, Inherited = true, AllowMultiple = true)]
    public class ControlOptionAttribute : Base.BaseAttribute, Base.IBaseAttribute
    {
        /// <summary>
        /// 控件选项
        /// </summary>
        public string Option { get; set; }
        /// <summary>
        /// option选项值字符串 请不要使用function，function请到前台绑定
        /// </summary>
        /// <param name="Option"></param>
        public ControlOptionAttribute(string Option)
        {
            this.Option = Option;
        }

        public void SetControlProp(IControlProp IControlProp)
        {
            throw new NotImplementedException();
        }
    }
}

