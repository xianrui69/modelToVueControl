using System;

namespace modelToList
{
    [AttributeUsage(AttributeTargets.Property, Inherited = true)]
    public class ControlPropAttribute : Base.BaseAttribute, Base.IBaseAttribute, IControlProp
    {
        public string defaultVal { get; set; }
        public string typeName { get; set; }
        public ControlTypeEnum? controlType { get; set; }

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

        public bool allowNull { get; set; }
        public string lableName { get; set; }
        public string controlName { get; set; }
        public string classStr { get; set; }
        public bool isShow { get; set; }
        public string regExp { get; set; }
        public string option { get; set; }

        public string jsOptionName
        {
            get
            {
                throw new NotImplementedException();
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public ControlPropAttribute(string LableName, string ControlName = "", bool AllowNull = true, string ClassStr = "", bool IsShow = true, string RegExp = "", ControlTypeEnum ControlType = ControlTypeEnum.无, string DefaultVal = null, string Option = null)
        {
            this.controlType = ControlType;
            this.allowNull = AllowNull;
            this.lableName = LableName;
            this.controlName = ControlName;
            this.classStr = ClassStr;
            this.isShow = IsShow;
            this.regExp = RegExp;
            this.defaultVal = DefaultVal;
            this.option = Option;
        }

        public void SetControlProp(IControlProp IControlProp)
        {
            throw new NotImplementedException();
        }
    }
}
