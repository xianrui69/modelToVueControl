using System;
using System.Collections.Generic;
using System.Reflection;

namespace modelToList.Base
{
    public class BaseAttribute: Attribute
    {
        public void ChangeControlProp(IControlProp IControlProp)
        {
            var iba = (this as IBaseAttribute);
            if (iba == null) return;
            else iba.SetControlProp(IControlProp);
        }
    }
}

