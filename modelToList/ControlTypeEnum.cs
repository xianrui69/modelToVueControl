using System;

namespace modelToList
{
    public enum ControlTypeEnum
    {
        无,
        #region easyui 类型
        #region 基础
        搜索框,
        分页控件,
        提示框,
        #endregion
        #region 表单
        验证框,
        文本框,
        密码框,
        下拉列表框,
        树形下拉框,
        数据表格下拉框,
        树形表格下拉框,
        数值输入框,
        日期输入框,
        日期时间输入框,
        日期时间微调框,
        日历,
        数字微调,
        时间微调,
        滑动条,
        文件框,
        #endregion
        #endregion
        #region 非easyui 类型
        枚举下拉框,
        多行文本框,
        图片,
        复选框,
        #endregion
    }
}

