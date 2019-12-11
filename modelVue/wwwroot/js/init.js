/**
 * EasyUI 的控件默认配置
 */

// datagrid 数据网格
if ($.fn.datagrid) {
    // 开启行号
    $.fn.datagrid.defaults.rownumbers = true;
    // 开启隔行变色
    $.fn.datagrid.defaults.striped = true;
    // 行号自适应
    $.fn.datagrid.defaults.fixRownumber = true;
    // 单元格提示
    //$.fn.datagrid.defaults.cellTip = true;
}

if ($.fn.edatagrid) {
    // 开启行号
    $.fn.edatagrid.defaults.rownumbers = true;
    // 开启隔行变色
    $.fn.edatagrid.defaults.striped = true;
    // 行号自适应
    $.fn.edatagrid.defaults.fixRownumber = true;
    // 单元格提示
    //$.fn.edatagrid.defaults.cellTip = true;
}

// tree 树
if ($.fn.tree) {
    // 显示动画效果
    $.fn.tree.defaults.animate = true;
    // 显示树控件上的虚线
    // $.fn.tree.defaults.lines = true;
}

// dialog 弹出框
if ($.fn.dialog) {
    // 隐藏关闭按钮
    $.fn.dialog.defaults.closable = false;
    // 默认是模态窗
    // $.fn.dialog.defaults.modal = true;
}

if ($.fn.combobox) {
    // 设置为true时，输入的值只能是列表框中的内容。（该属性自1.5版开始可用）
    $.fn.combobox.defaults.limitToList = true;
}

if ($.fn.combogrid) {
    // 人工添加的
    $.fn.combogrid.defaults.limitToList = true;
}

if ($.fn.datebox) {
    $.fn.datebox.defaults.editable = false;
    // 为日期选择控件添加一个清空的按钮
    $.fn.datebox.defaults.buttons.splice(1, 0, {
        text: '清空',
        handler: (target) => {
            $(target).datebox('clear');
            $(target).combo('hidePanel');
        }
    })
}

