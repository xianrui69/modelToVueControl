using System;

namespace modelToList
{
    [AttributeUsage(AttributeTargets.Property, Inherited = true)]
    public class ControlTypeAttribute : Base.BaseAttribute, Base.IBaseAttribute
    {
        /// <summary>
        /// 控件选项类型
        /// </summary>
        public ControlTypeEnum ControlType { get; set; }
        public ControlTypeAttribute(ControlTypeEnum ControlType)
        {
            this.ControlType = ControlType;
        }

        public void SetControlProp(IControlProp IControlProp)
        {
            throw new NotImplementedException();
        }
    }
}

