using System;

namespace modelToList
{
    [AttributeUsage(AttributeTargets.Property, Inherited = true)]
    public class IsShowAttribute : Base.BaseAttribute, Base.IBaseAttribute
    {
        /// <summary>
        /// 是否显示
        /// </summary>
        public bool IsShow { get; set; }
        public IsShowAttribute(bool IsShow)
        {
            this.IsShow = IsShow;
        }

        public void SetControlProp(IControlProp IControlProp)
        {
            throw new NotImplementedException();
        }
    }
}

