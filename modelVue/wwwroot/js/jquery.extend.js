//jQuery扩展
jQuery.extend({
    "ajaxSyncGet": function (url, data) {
        var ret = $.ajax({
            type: "GET",
            url: url,
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            cache: false,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var e = JSON.parse(XMLHttpRequest.responseText);
                alert(e.Message, e.StackTrace);
            }
        });
        return JSON.parse(ret.responseText);
    },
    "ajaxSync": function (url, data) {
        var ret = $.ajax({
            type: "POST",
            url: url,
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            cache: false,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                var e = JSON.parse(XMLHttpRequest.responseText);
                alert(e.Message, e.StackTrace);
            }
        });
        return JSON.parse(ret.responseText);
    },
    "ajaxAsync": function (url, data, callBack) {
        var calbacks = $.Callbacks("unique");
        calbacks.add(callBack);
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            cache: false,
            beforeSend: function (XMLHttpRequest) {
                loading(true);
            },
            complete: function (XMLHttpRequest, textStatus) {
                loading(false);
                calbacks.fire(JSON.parse(XMLHttpRequest.responseText));
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                // 通常 textStatus 和 errorThrown 之中
                // 只有一个会包含信息
                //this; // 调用本次AJAX请求时传递的options参数
            }
        });
    },
    "ajaxAsyncForm": function (url, data, callBack) {
        var calbacks = $.Callbacks("unique");
        calbacks.add(callBack);
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            async: true,
            cache: false,
            beforeSend: function (XMLHttpRequest) {
                loading(true);
            },
            complete: function (XMLHttpRequest, textStatus) {
                loading(false);
                calbacks.fire(JSON.parse(XMLHttpRequest.responseText));
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                // 通常 textStatus 和 errorThrown 之中
                // 只有一个会包含信息
                //this; // 调用本次AJAX请求时传递的options参数
            }
        });
    },
    //$.QueryString["ppp"]
    //$.addQueryString({"key":"value"});
    'QueryString':
        window.location.search.length <= 1 ?
            new Object() : function (a) {
                var b = new Object();
                for (var i = 0; i < a.length; ++i) {
                    var p = a[i].split('=');
                    if (p[0] == "_") {
                        continue;
                    }
                    b[p[0]] = decodeURIComponent(p[1]);
                }
                return b;
            }(window.location.search.substr(1).split('&')),
    'getQueryString': function (name) {
        var result = window.location.search.match(new RegExp("[\?\&]" + name
            + "=([^\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    },
    'addQueryString': function (keyValues) {
        return this.param(this.extend({}, this.QueryString, keyValues));
    },
    //页面数据变量缓存
    //getVarFun 通常为获取对象的ajax方法
    'CacheVarSetting': function (varName, getVarFun) {
        var f = $(document).data("VarFun");
        if (!f) {
            f = new Object();
        }
        f[varName] = getVarFun;
        $(document).data("VarFun", f);
    },
    'GetCacheVar': function (varName, key1, key2, key3, key4) {
        var dataKey = varName;
        if (key1) {
            dataKey += "|" + key1;
        }
        if (key2) {
            dataKey += "|" + key2;
        }
        if (key3) {
            dataKey += "|" + key3;
        }
        if (key4) {
            dataKey += "|" + key4;
        }
        var v = $(document).data(dataKey);
        if (v) {
            return v;
        }
        else {
            var f = $(document).data("VarFun");
            if (!f) {
                return null;
            }
            if ($.isFunction(f[varName])) {
                return f[varName].call(window, key1, key2, key3, key4);
            }
            else {
                return null;
            }
        }
    },
    //将页面上指定区域的带name属性的控件的值组装成对象
    'serializeObject': function (area) {
        var model = new Object();
        var items = $((area || "") + " input[name],textarea[name],select[name]");
        for (var i = 0; i < items.size(); i++) {
            model[items.eq(i).attr('name')] = items.eq(i).val();
        }
        return model;
        //alert(JSON.stringify(model));
    },
    'getFormJson': function (frm) {
        var o = {};
        var a = $(frm).serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    },
    'setValueFromJson': function (jsonStr) {
        var o = JSON.parse(jsonStr);
        $("body").find("*").each(function () {
            if (o[this.id] != undefined) {
                $(this).html(o[this.id]);
            }
        });
    },
    //时间格式化处理
    'dateFtt': function (fmt, date) { //author: meizz
            var weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
            var o = {
                "M+": date.getMonth() + 1,                 //月份
                "d+": date.getDate(),                    //日
                "h+": date.getHours(),                   //小时
                "m+": date.getMinutes(),                 //分
                "s+": date.getSeconds(),                 //秒
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                "w": weekday[date.getDay()],             //毫秒
                "S": date.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        },
    //将字符串转换成日期格式
    'getStringDate': function (date, fmt) {
        fmt = typeof (fmt) === "string" ? fmt : '';
        return $.dateFtt(fmt || 'yyyy-MM-dd hh:mm:ss', date || new Date());
    },
    //将字符串转换成日期格式
    'getStrDate': function (strDate) {
        var date = eval('new Date(' + strDate.replace(/\d+(?=-[^-]+$)/,
            function (a) { return parseInt(a, 10) - 1; }).match(/\d+/g) + ')');
        return date;
    },
    //获取当天日期
    'getNowFormatDate': function () {
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
    },
    'stringToDate': function (fDate) {
        if (!fDate) return null;
        var fullDate = fDate.split("-");
        if (fullDate.length < 3) return null;
        return new Date(fullDate[0], fullDate[1] - 1, fullDate[2], 0, 0, 0);
    },
    //获取指定日期之前几天
    'getBeforeDate': function (d, n) {
        var year = d.getFullYear();
        var mon = d.getMonth() + 1;
        var day = d.getDate();
        if (day <= n) {
            if (mon > 1) {
                mon = mon - 1;
            }
            else {
                year = year - 1;
                mon = 12;
            }
        }
        d.setDate(d.getDate() - n);
        year = d.getFullYear();
        mon = d.getMonth() + 1;
        day = d.getDate();
        s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
        return s;
    },
    'getAfterDate': function (d, n) {
        var year = d.getFullYear();
        var mon = d.getMonth() + 1;
        var day = d.getDate();
        if (day <= n) {
            if (mon > 1) {
                mon = mon - 1;
            }
            else {
                year = year - 1;
                mon = 12;
            }
        }
        d.setDate(d.getDate() + n);
        year = d.getFullYear();
        mon = d.getMonth() + 1;
        day = d.getDate();
        s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
        return s;
    },
    /** 树节点取消选中，请添加到树容器的 click 事件中使用 */
    treeUnSelect: function (tree) {
        var s = $(tree).tree('getSelected');
        if (!s) return false;
        $(tree).find('.tree-node-selected').removeClass('tree-node-selected');
        return true;
    },
    /**
     * 设定起始时间的最小值
     * @param minDate 最小时间，默认是 new Date()
     */
    beginDateCalendar: function (minDate) {
        var _minDate = minDate ? new Date(minDate) : new Date();
        return {
            validator: function (date) {
                var defaultDate = new Date(_minDate.getFullYear(), _minDate.getMonth(), _minDate.getDate());
                return defaultDate >= date;
            }
        }
    },
    /**
     * 设定起始时间的选择事件
     * @param selector 截止时间控件
     */
    beginDateOnSelect: function (selector) {
        return function (date) {
            var $dtEnd = $(selector);
            var strEndDate = $dtEnd.datebox('getValue');
            if (strEndDate) {
                var endDate = new Date(strEndDate);
                if (date > endDate) {
                    $dtEnd.datebox('clear');
                    $dtEnd.next().tooltip('error', {
                        content: '由于改变了起始日期，请重新选择截至日期！'
                    });
                }
            }
        }
    },
    /**
     * 设定结束时间的最小值
     * @param selector 起始时间控件
     */
    endDateCalendar: function (selector) {
        return {
            validator: function (date) {
                var now = new Date();
                var defaultDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                var strBeginDate = $(selector).datebox('getValue');
                if (strBeginDate)
                    return new Date(strBeginDate) <= date;
                else
                    return defaultDate <= date;
            }
        }
    },
    /**
     * 初始化图片的预览功能
     * @param imgSelector 图片选择器
     */
    initImagePreview: function (imgSelector) {
        let x = 10, y = 20;//偏移量
        let css = {
            position: 'absolute',
            border: '1px solid #ccc',
            background: '#333',
            padding: '2px',
            color: '#fff',
            'z-index': 99999
        }
        $(imgSelector).mouseover(function (e) {
            var tooltip = '<div id="tooltip"><img src="' + this.src + '" /></div>';
            $('body').append(tooltip);

            css.top = (e.pageY + y) + 'px';
            css.left = (e.pageX + x) + 'px';
            $('#tooltip').css(css);

            $('#tooltip img').css({
                'max-height': ($(window).height() - e.pageY - y - 10) + 'px',
                'max-width': ($(window).width() - e.pageX - x - 10) + 'px',
            })
        }).mouseout(function () {
            $('#tooltip').remove();
        }).mousemove(function (e) {
            css.top = (e.pageY + y) + 'px';
            css.left = (e.pageX + x) + 'px';
            $('#tooltip').css(css);

            $('#tooltip img').css({
                'max-height': ($(window).height() - e.pageY - y - 10) + 'px',
                'max-width': ($(window).width() - e.pageX - x - 10) + 'px'
            })
        });
    }
});
// easyui messager扩展
$.extend($.messager, {
    /** 在屏幕上方中间显示一个提示框 */
    info: function () {
        if (arguments.length < 1) {
            throw "info method need least 1 argument";
        }
        var message = {
            title: null,
            msg: null,
            timeout: 1000,
            closable: false,
            showType: "side",
            style: {
                right: '',
                top: '',//document.body.scrollTop + document.documentElement.scrollTop,
                bottom: '10%'
            }
        };
        if (arguments.length == 1 && typeof (message) === "object") {
            var arg = arguments[0];
            for (var i in message) {
                if (arg.hasOwnProperty(i)) {
                    message[i] = arg[i];
                }
            }
            return $.messager.show(message);
        }
        if (arguments.length > 1) {
            message.title = arguments[0];
            message.msg = arguments[1];
        }
        if (arguments.length > 2) {
            message.timeout = arguments[2] * 1000;
        }
        if (arguments.length > 3) {
            message.showType = arguments[3];
        }
        return $.messager.show(message);
    }
});
$.extend($.fn.datagrid.defaults, {
    editCellIndex: -1,
    editCellField: undefined
});
var htmlInputType = ["button"
    , "checkbox"
    , "file"
    , "hidden"
    , "image"
    , "password"
    , "radio"
    , "reset"
    , "submit"
    , "auto"
    , "text"];

$.extend($.fn.datagrid.methods, {
    /** 获取指定行的数据 从0开始 */
    getIndexRow: function (jq, rowIndex) {
        //获取所有列
        var rows = $(jq).datagrid('getRows');
        if (rowIndex >= rows.length)
            return null;
        return rows[rowIndex];
    },
    /** 删除所有行 */
    deleteRows: function (jq) {
        for (var i = $(jq).datagrid('getRows').length - 1; i >= 0; i--) $(jq).datagrid('deleteRow', 0);
    },
    /** 编辑单元格 */
    editCell: function(jq, param) {
        return jq.each(function() {
            var dg = this;
            //判断当前列是否可编辑
            var editCol = $(dg).datagrid('getColumnOption', param.field);

            //获取所有列的编辑项的配置
            var opts = $(dg).datagrid('options');
            //结束正在编辑的列 如果点击的不是正在编辑的单元格
            if (opts.editCellIndex > -1 && opts.editCellField) {
                //同一个单元格
                if (opts.editCellIndex == param.index && opts.editCellField == param.field)
                    return;
                // 验证是否符合结束条件
                if (!$(dg).datagrid('validateRow', param.index)) return;
                $(dg).datagrid('endCellEdit', { field: opts.editCellField, index: opts.editCellIndex });

            }
            //当前列不可编辑
            if (!editCol.editor) return;

            opts.editCellIndex = param.index;
            opts.editCellField = param.field;

            //把除了指定列之外的列的编辑项置空
            var fields = $(this).datagrid('getColumnFields', true).concat($(this).datagrid('getColumnFields'));
            //var fields = $(dg).datagrid('getColumnFields');
            let editFields = [];
            for (var i = 0; i < fields.length; i++) {
                var col = $(dg).datagrid('getColumnOption', fields[i]);
                col.editor1 = col.editor;
                var editor = col.editor1 || col.editor;
                if (editor && typeof (editor) === 'object') {
                    editFields.push(fields[i]);
                }
                if (fields[i] != param.field) {
                    col.editor = null;
                }
            }
            let lastEditData = {};
            let nextEditData = {};
            for (var i = 0; i < editFields.length; i++) {
                if (editFields[i] === param.field) {
                    if (i === 0) {
                        lastEditData = {
                            field: editFields[editFields.length - 1],
                            idx: -1
                        };
                        nextEditData = {
                            field: editFields[i + 1],
                            idx: 0
                        };
                    } else if (i === editFields.length - 1) {
                        lastEditData = {
                            field: editFields[i - 1],
                            idx: 0
                        };
                        nextEditData = {
                            field: editFields[0],
                            idx: +1
                        };

                    } else {
                        lastEditData = {
                            field: editFields[i - 1],
                            idx: 0
                        };
                        nextEditData = {
                            field: editFields[i + 1],
                            idx: 0
                        };
                    }
                }
            }
            //编辑指定行
            $(dg).datagrid('beginEdit', param.index);
            //还原每列的编辑项
            for (var i = 0; i < fields.length; i++) {
                var col = $(dg).datagrid('getColumnOption', fields[i]);
                col.editor = col.editor1;
            }
            var ed = $(dg).datagrid('getEditor', param);//获取当前编辑器
            if (!ed) {
                $(dg).datagrid('endEdit', param.index);
                return;
            }

            //当前单元格编辑时触发
            if (param.OnCellEdit && typeof (param.OnCellEdit) === "function")
                param.OnCellEdit(ed, param);

            var edTarget;
            if (ed.target[0].tagName == "INPUT" && htmlInputType.indexOf(ed.type) > -1) {
                edTarget = ed.target;
                if (!ed.target[0].id)
                    ed.target[0].id = ed.type + "_" + (new Date().getTime());
            }
            else
                eval("edTarget = $(ed.target)." + ed.type + "('textbox')");
            if (!edTarget) return;
            if (ed.type !== 'auto') {
                edTarget.focus();//获取焦点
                edTarget.select();//获取焦点
            }
            //判断点击的元素的标位置 结束编辑
            //console.log("add click event %s", edTarget[0].id);
            var gridElement = $(this).parents(".datagrid");
            var body = gridElement.parents('body');
            if (ed && ed.type === 'auto' && ed.actions) {
                var combo = $(ed.target).data('combo');
                if (combo && combo.panel && false) {
                    combo.options.onHidePanel = () => {
                        setTimeout(() => {
                                $(dg).datagrid('endCellEdit')
                                    .datagrid('resetCellEditInfo');
                                body.off("mousedown." + edTarget[0].id);
                            },
                            50);
                    };//下拉框不显示时结束编辑
                }
                if (ed.actions.hasOwnProperty('getEl')) {
                    var _ipt = null;
                    if (typeof (ed.actions.getEl) === 'function') _ipt = ed.actions.getEl();
                    var rowCount = $(dg).datagrid('getRows').length;
                    if (_ipt) {
                        var allowBind = true;
                        //param.index + 1 === rowCount - 1 && 
                        //if (ed.actions.isCombo) allowBind = false;//最后一行的绑定莫名有bug
                        if (allowBind)
                        $(_ipt).keydown((e) => {
                            if (e.keyCode === 13 ||
                                (!e.shiftKey && !e.metaKey && e.ctrlKey && (e.keyCode === 86 || e.keyCode === 86))) {
                                if (param.index + 1 < rowCount) {
                                };
                                let data = {
                                    field: param.field,
                                    index: param.index,
                                    clickField: param.field,
                                    clickIndex: param.index + (e.shiftKey ? -1 : 1),
                                };
                                if (data.clickIndex < 0) {
                                    data.clickIndex = 0;
                                } else if (data.clickIndex === rowCount) {
                                    data.clickIndex = rowCount - 1;
                                }
                                setTimeout(() => {
                                        $(dg).datagrid('endCellEdit', data)
                                            .datagrid('resetCellEditInfo');
                                        body.off("mousedown." + edTarget[0].id);
                                    },
                                    50);
                            }
                            if (e.keyCode === 9) {
                                let data = {
                                    field: param.field,
                                    index: param.index
                                };
                                if (e.shiftKey) {
                                    data.clickField = lastEditData.field;
                                    data.clickIndex = param.index + lastEditData.idx;
                                } else {
                                    data.clickField = nextEditData.field;
                                    data.clickIndex = param.index + nextEditData.idx;
                                }
                                if (data.clickIndex < 0) data.clickIndex = 0;
                                else if (data.clickIndex > rowCount - 1) data.clickIndex = rowCount - 1;
                                setTimeout(() => {
                                        $(dg).datagrid('endCellEdit', data)
                                            .datagrid('resetCellEditInfo');
                                        body.off("mousedown." + edTarget[0].id);
                                    },
                                    50);
                                return false;
                            }
                        });
                    }
                }
            }
            body.on("mousedown." + edTarget[0].id, "", { cellInfo: param, targetId: edTarget[0].id, eventElement: body },
                function(e) {
                    //return true 防止会阻止事件冒泡
                    //增加代码使页面点击非grid部分都触发结束编辑
                    et = $(e.target);
                    var data = comFunc.clone(e.data.cellInfo);
                    var targetId = e.data.targetId;
                    if (et[0] !== gridElement[0] && et.parents('.datagrid')[0] !== gridElement[0]) { //不是点击grid及内部
                        try {
                            var combo = $(ed.target).data('combo');
                            var panel = null;
                            if (combo) {
                                panel = combo.panel;
                                if (!(et[0] !== panel[0] && et.parents('.combo-panel')[0] !== panel[0]))
                                    return false;
                            }
                        } catch (e) {
                            return false;
                        }
                    } else {
                        //是否是table内部的数据行
                        var isIntable = et.is("table.datagrid-btable") ||
                            et.parents("table.datagrid-btable").is("table.datagrid-btable");
                        //是否是同一列
                        var isSameField = et.closest("td[field=" + data.field + "]").length > 0;
                        if (isIntable) {
                            if (isSameField) {
                                //同一个单元格不会触发oncellclick 就不会结束编辑 所以要继续监听
                                //是否是同一个单元格
                                var index = et.parents("tr.datagrid-row-editing[datagrid-row-index]")
                                    .attr("datagrid-row-index");
                                if (index == data.index) return true;

                                // console.log("remove click event %s", targetId);
                                //不是同一个单元格会触发oncellclick 也可能禁用的oncellclick  还是要处理

                                //会在 oncellclick 中结束编辑 所以绑定的事件就没用了
                                //$("body").off("mousedown." + targetId);
                                //return true;
                            } else if (false) {
                                //原以为点击其他地方无法触发编辑 但是可以 故不使用这段代码
                                if (et.closest("td").attr('field')) {
                                    data.clickField = et.closest("td").attr('field'); //得到字段
                                    var tr = et.closest("td").parents('tr');
                                    data.clickIndex = tr.parents('tbody').children().index(tr); //得到索引
                                } else console.log('点击同行非同字段未匹配到字段！');
                            }
                        }
                        // 验证是否符合结束条件
                        if (!$(dg).datagrid('validateRow', data.index)) return true;
                        //console.log("remove click event %s", targetId);
                    }
                    //取消编辑并解绑
                    $(dg).datagrid('endCellEdit', data).datagrid('resetCellEditInfo');
                    e.data.eventElement.off("mousedown." + targetId);
                });

            return $(dg);
        });
    },
    /* 结束单元格编辑
     * @param data {index = 行（索引），field=列名}
     */
    endCellEdit: function (jq, data) {
        var opts = $(jq).datagrid('options');
        data = data || { field: opts.editCellField, index: opts.editCellIndex };
        // 获取当前编辑框的target
        var col = $(jq).datagrid('getEditor', data);
        if (col && col.target[0].classList.contains('combo-f')) {
            col.target.combo('hidePanel')
        }

        // 结束或取消编辑
        var isEnd = $(jq).datagrid('validateRow', data.index);
        if (isEnd) {
            $(jq).datagrid('endEdit', data.index);
            if (col && col.actions.editorData) {
                var textField = (data.field + '$Text');//配合渲染方法，使自动产生的下拉框编辑器，能得到text值
                var _row = {};
                _row[textField] = col.actions.editorData.text;
                $(jq).datagrid('updateRow', {
                    index: data.index,
                    row: _row
                });
            }
        } else {
            $(jq).datagrid('cancelEdit', data.index);
        }
        if (data.hasOwnProperty('clickField') && data.hasOwnProperty('clickIndex')) {//如果是点击的其他单元格
            setTimeout(() => $(jq).datagrid('editCell',
                    {
                        field: data.clickField,
                        index: data.clickIndex
                    }),
                50);
            ;
            //$(jq).datagrid('editCell',
            //    {
            //        field: data.clickField,
            //        index: data.clickIndex
            //    });
        }
        return jq;
    },
    /* 结束单元格编辑
     */
    resetCellEditInfo: function (jq, param) {
        var opts = $(jq).datagrid('options');
        opts.editCellIndex = -1;
        opts.editCellField = undefined;
    },
    /**
     * 展示tooltip提示信息
     * @param option position=出现方向，content=消息内容, index=出现的位置（索引）
     */
    showTip: function (jq, option) {
        if (!option) option = {};
        // 计算并找到滚动之后的第一条
        var scrollTop = jq.prevAll().find('.datagrid-body').scrollTop();
        var dgvRowHeight = $('.datagrid-row').height();
        var dfRow = Math.ceil(scrollTop / dgvRowHeight);

        var row = jq.prevAll().find('.datagrid-row').eq(option.index || dfRow);
        option.content = option.content || '请选择一行数据';
        row.tooltip('error', option);
    },
    fixRownumber: function (jq) {
        return jq.each(function () {
            var panel = $(this).datagrid("getPanel");
            //获取最后一行的number容器,并拷贝一份
            var clone = $(".datagrid-cell-rownumber", panel).last().clone();
            //由于在某些浏览器里面,是不支持获取隐藏元素的宽度,所以取巧一下
            clone.css({
                "position": "absolute",
                left: -1000
            }).appendTo("body");
            var width = clone.width("auto").width();
            //默认宽度是25,所以只有大于25的时候才进行fix
            if (width > 25) {
                //多加5个像素,保持一点边距
                $(".datagrid-header-rownumber,.datagrid-cell-rownumber", panel).width(width + 5);
                //修改了宽度之后,需要对容器进行重新计算,所以调用resize
                $(this).datagrid("resize");
                //一些清理工作
                clone.remove();
                clone = null;
            } else {
                //还原成默认状态
                $(".datagrid-header-rownumber,.datagrid-cell-rownumber", panel).removeAttr("style");
            }
        });
    },
    cellTip: function (jq) {
        function showTip(data, td, e) {
            if ($(td).text() == "" || $(td).hasClass('datagrid-td-rownumber'))
                return;
            data.tooltip.text($(td).text()).css({
                top: (e.pageY + 10) + 'px',
                left: (e.pageX + 20) + 'px',
                'z-index': $.fn.window.defaults.zIndex,
                display: 'block'
            });
        };
        return jq.each(function () {
            var grid = $(this);
            var options = $(this).data('datagrid');
            if (!options.tooltip) {
                var panel = grid.datagrid('getPanel').panel('panel');
                var defaultCls = {
                    'border': '1px solid #ccc',
                    'padding': '1px',
                    'color': '#333',
                    'background': '#f7f5d1',
                    'position': 'absolute',
                    'max-width': '500px',
                    'border-radius': '4px',
                    '-moz-border-radius': '4px',
                    '-webkit-border-radius': '4px',
                    'display': 'none'
                }
                var tooltip = $("<div id='celltip'></div>").appendTo('body');
                tooltip.css($.extend({}, defaultCls));
                options.tooltip = tooltip;
                panel.find('.datagrid-body').each(function () {
                    var delegateEle = $(this).find('> div.datagrid-body-inner').length
                        ? $(this).find('> div.datagrid-body-inner')[0]
                        : this;
                    $(delegateEle).undelegate('td', 'mouseover').undelegate(
                        'td', 'mouseout').undelegate('td', 'mousemove')
                        .delegate('td', {
                            'mouseover': function (e) {
                                if (options.tipDelayTime)
                                    clearTimeout(options.tipDelayTime);
                                var that = this;
                                options.tipDelayTime = setTimeout(
                                    function () {
                                        showTip(options, that, e);
                                    }, 1000);
                            },
                            'mouseout': function (e) {
                                if (options.tipDelayTime)
                                    clearTimeout(options.tipDelayTime);
                                options.tooltip.css({
                                    'display': 'none'
                                });
                            }
                        });
                });

            }

        });
    },
    /**
     * 关闭消息提示功能
     * @param {} jq
     * @return {}
     */
    cancelCellTip: function (jq) {
        return jq.each(function () {
            var data = $(this).data('datagrid');
            if (data.tooltip) {
                data.tooltip.remove();
                data.tooltip = null;
                var panel = $(this).datagrid('getPanel').panel('panel');
                panel.find('.datagrid-body').undelegate('td',
                    'mouseover').undelegate('td', 'mouseout')
                    .undelegate('td', 'mousemove')
            }
            if (data.tipDelayTime) {
                clearTimeout(data.tipDelayTime);
                data.tipDelayTime = null;
            }
        });
    }
});
//
$.extend($.fn.treegrid.methods, {
    /** 获取指定行的数据 从0开始 */
    getIndexRow: function (jq, rowIndex) {
        //获取所有列
        var rows = $(jq).treegrid('getRows');
        if (rowIndex >= rows.length)
            return null;
        return rows[rowIndex];
    },
    /** 编辑单元格 */
    editCell: function (jq, param) {
        return jq.each(function () {
            var dg = this;
            //判断当前列是否可编辑
            var editCol = $(dg).treegrid('getColumnOption', param.field);

            //获取所有列的编辑项的配置
            var opts = $(dg).treegrid('options');
            if (opts.editCellIndex > -1 && opts.editCellField) {
                //同一个单元格
                if (opts.editCellIndex == param.id && opts.editCellField == param.field)
                    return;

                // 验证是否符合结束条件
                if (!$(dg).treegrid('validateRow', param.id)) return;
                $(dg).treegrid('endCellEdit', { field: opts.editCellField, id: opts.editCellIndex });
            }

            opts.editCellIndex = param.id;
            opts.editCellField = param.field;

            //把除了指定列之外的列的编辑项置空
            var fields = $(this).treegrid('getColumnFields', true).concat($(this).treegrid('getColumnFields'));
            //var fields = $(dg).datagrid('getColumnFields');
            for (var i = 0; i < fields.length; i++) {
                var col = $(dg).treegrid('getColumnOption', fields[i]);
                col.editor1 = col.editor;
                if (fields[i] != param.field) {
                    col.editor = null;
                }
            }
            //编辑指定行
            $(dg).treegrid('beginEdit', param.id);

            //还原每列的编辑项
            for (var i = 0; i < fields.length; i++) {
                var col = $(dg).treegrid('getColumnOption', fields[i]);
                col.editor = col.editor1;
            }

            var ed = $(dg).treegrid('getEditor', param);//获取当前编辑器
            if (!ed) {
                $(dg).treegrid('endEdit', param.id);
                return;
            }

            //当前单元格编辑时触发
            if (param.OnCellEdit && typeof (param.OnCellEdit) == "function")
                param.OnCellEdit(ed, param);

            var edTarget;
            if (ed.target[0].tagName == "INPUT" && htmlInputType.indexOf(ed.type) > -1) {
                edTarget = ed.target;
                if (!ed.target[0].id)
                    ed.target[0].id = ed.type + "_" + (new Date().getTime());
            }
            else
                eval("edTarget = $(ed.target)." + ed.type + "('textbox')");

            if (!edTarget) return
            edTarget.focus()//获取焦点
            //判断点击的元素的标位置 结束编辑
            //console.log("add click event %s", edTarget[0].id);
            var gridElement = $(this).parents(".datagrid");
            gridElement.on("mousedown." + edTarget[0].id, "", { cellInfo: param, targetId: edTarget[0].id, eventElement: gridElement }, function (e) {
                //return true 防止会阻止事件冒泡
                et = $(e.target);
                var data = e.data.cellInfo;
                var targetId = e.data.targetId;
                //是否是table内部的数据行
                var isIntable = et.is("table.datagrid-btable") || et.parents("table.datagrid-btable").is("table.datagrid-btable");
                //是否是同一列
                var isSameField = et.closest("td[field=" + data.field + "]").length > 0;
                if (isIntable) {
                    if (isSameField) {
                        //同一个单元格不会触发oncellclick 就不会结束编辑 所以要继续监听
                        //是否是同一个单元格
                        var index = et.parents("tr.datagrid-row-editing").attr("node-id");
                        if (index == data.id) return true;

                        //不是同一个单元格会触发oncellclick
                        //会在 oncellclick 中结束编辑 所以绑定的事件就没用了
                        // $("body").off("mousedown." + targetId);
                        // return true;
                    }
                }
                // 验证是否符合结束条件
                if (!$(dg).treegrid('validateRow', data.id)) return true;
                $(dg).treegrid('endCellEdit', data).treegrid('resetCellEditInfo');
                e.data.eventElement.off("mousedown." + targetId);

            });

            return $(dg);
        });
    },
    /* 结束单元格编辑
     * @param data {id = 行（索引），field=列名}
     */
    endCellEdit: function (jq, data) {
        var col = $(jq).treegrid('getEditor', data);
        if (col && col.target[0].classList.contains('combo-f')) {
            col.target.combo('hidePanel')
        }

        // 结束或取消编辑
        if ($(jq).treegrid('validateRow', data.id)) {
            $(jq).treegrid('endEdit', data.id);
            console.log("end edit %s", data.field);
        } else {
            $(jq).treegrid('cancelEdit', data.id);
            console.log("cancel edit %s", data.field);
        }

        return jq;
    },
    /* 结束单元格编辑
     */
    resetCellEditInfo: function (jq, param) {
        var opts = $(jq).treegrid('options');
        opts.editCellIndex = -1;
        opts.editCellField = undefined;
    }
});
//自定义验证
$.extend($.fn.validatebox.defaults.rules, {
    idCard: {// 验证身份证
        validator: function (value) {
            return /^\d{15}(\d{2}[A-Za-z0-9])?$/i.test(value);
        },
        message: '身份证号码格式不正确'
    },
    range: {
        validator: function (value, param) {
            if (!Array.isArray(param)) param = [parseFloat(param) || 0];
            param.length = 2;
            param.forEach(el => el = parseFloat(el) || 0);
            value = parseFloat(value) || 0;
            return value >= param[0] && value <= param[1];
        },
        message: '必须是【{0}到{1}】的数字.'
    },
    minLength: {//validType:"minLength[100]"
        validator: function (value, param) {
            return value.length >= param[0];
        },
        message: '请输入至少{0}个字符.'
    },
    maxLength: {//validType:"maxLength[100]"
        validator: function (value, param) {
            return value.length <= param[0];
        },
        message: '不能超过{0}个字符.'
    },
    length: { //validType="length[0,1000]"
        validator: function (value, param) {
            var len = $.trim(value).length;
            return len >= param[0] && len <= param[1];
        },
        message: "输入内容长度必须介于{0}和{1}之间."
    },
    phone: {// 验证电话号码
        validator: function (value) {
            return /^((\d2,3)|(\d{3}\-))?(0\d2,3|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/i.test(value);
        },
        message: '格式不正确,请使用下面格式:020-88888888'
    },
    mobile: {// 验证手机号码
        validator: function (value) {
            //return /^1[3-8]+\d{9}$/i.test(value);
            return /^[1][3,4,5,7,8][0-9]{9}$/i.test(value);
        },
        message: '手机号码格式不正确'
    },
    intOrFloat: {// 验证整数或小数
        validator: function (value) {
            return /^\d+(\.\d+)?$/i.test(value);
        },
        message: '请输入数字，并确保格式正确'
    },
    currency: {// 验证货币
        validator: function (value) {
            return /^\d+(\.\d+)?$/i.test(value);
        },
        message: '货币格式不正确'
    },
    qq: {// 验证QQ,从10000开始
        validator: function (value) {
            return /^[1-9]\d{4,9}$/i.test(value);
        },
        message: 'QQ号码格式不正确'
    },
    integer: {// 验证整数 可正负数
        validator: function (value) {
            //return /^[+]?[1-9]+\d*$/i.test(value);
            return /^([+]?[0-9])|([-]?[0-9])+\d*$/i.test(value);
        },
        message: '请输入整数'
    },
    integerFloat: {// 验证正浮点数,可为0
        validator: function (value) {
            return /^([0-9]+(\.\d+)?|0\.\d+)$/i.test(value);
        },
        message: '请输入有效的正数'
    },
    integerFloatButZero: {// 验证正浮点数,大于0
        validator: function (value) {
            return /^([0-9]+(\.\d+)?|0\.\d+)$/i.test(value);
        },
        message: '请输入大于0的正数'
    },
    positiveInteger: {// 验证正整数,可为0
        validator: function (value) {
            return /^[+]{0,1}(\d+)$/i.test(value);
        },
        message: '请输入有效的正整数'
    },
    posIntegerButZero: {// 验证大于0的正整数
        validator: function (value) {
            return /^\+?[1-9]\d*$/i.test(value);
        },
        message: '请输入有效的正整数'
    },
    age: {// 验证年龄
        validator: function (value) {
            return /^(?:[1-9][0-9]?|1[01][0-9]|120)$/i.test(value);
        },
        message: '年龄必须是0到120之间的整数'
    },
    chinese: {// 验证中文
        validator: function (value) {
            return /^[\Α-\￥]+$/i.test(value);
        },
        message: '请输入中文'
    },
    english: {// 验证英语
        validator: function (value) {
            return /^[A-Za-z]+$/i.test(value);
        },
        message: '请输入英文'
    },
    unnormal: {// 验证是否包含空格和非法字符
        validator: function (value) {
            return /.+/i.test(value);
        },
        message: '输入值不能为空和包含其他非法字符'
    },
    //username: {// 验证用户名
    //    validator: function (value) {
    //        return /^[a-zA-Z][a-zA-Z0-9_]{5,15}$/i.test(value);
    //    },
    //    message: '用户名不合法（字母开头，允许6-16字节，允许字母数字下划线）'
    //},
    faxno: {// 验证传真
        validator: function (value) {
            return /^((\d2,3)|(\d{3}\-))?(0\d2,3|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/i.test(value);
        },
        message: '传真号码不正确'
    },
    zip: {// 验证邮政编码
        validator: function (value) {
            return /^[1-9]\d{5}$/i.test(value);
        },
        message: '邮政编码格式不正确'
    },
    email: {// 验证邮箱
        validator: function (value) {
            return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+$/i.test(value);
        },
        message: '邮箱格式不正确'
    },
    ip: {// 验证IP地址
        validator: function (value) {
            return /((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/i.test(value);
        },
        message: 'IP地址格式不正确'
    },
    name: {// 验证姓名，可以是中文或英文
        validator: function (value) {
            return /^[\Α-\￥]+$/i.test(value) | /^\w+[\w\s]+\w+$/i.test(value);
        },
        message: '请输入姓名'
    },
    date: {// 验证日期
        validator: function (value) {
            //格式yyyy-MM-dd或yyyy-M-d
            return /^(?:(?!0000)[0-9]{4}([-]?)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-]?)0?2\2(?:29))$/i.test(value);
        },
        message: '清输入合适的日期格式'
    },
    endTime: {
        validator: function (value, param) {
            return value >= $(param[0]).val();
        },
        message: '结束日期不能小于开始日期'
    },
    startTime: {
        validator: function (value, param) {
            return value <= $(param[0]).val();
        },
        message: '开始日期不能大于结束日期'
    },
    letterNum: {
        validator: function (value) {
            return /^[a-zA-Z][\d]+$/i.test(value);
        },
        message: '请输入字母加数字的组合，如：A10'
    },
    commonMaterialIdNo: {
        validator: function (value) {
            return /^[^]{3}-[^]{5}-[^]{3}-[^]{0,4}$/i.test(value);
        },
        message: '请输入正确的编码格式，如：SC1-10201-012-[...]'
    },
    productIdNo: {
        validator: function (value) {
            return /^[^]{3}-[^]{5}-[^]{0,4}$/i.test(value);
        },
        message: '请输入正确的编码格式，如：SC1-10201-[...]'
    },
    categoryTitle: {
        validator: function (value) {
            return /^([a-z]|[0-9])-.+$/i.test(value);
        },
        message: '请输入正确的分类名称，如：A-成品'
    },
    reg: {//by sxr 正则验证支持存放正则表达式验证
        //使用规则  validType="reg['^[0-9a-zA-Z.-]+$']" []里第一个参数是正则表达式 第二个是错误消息
        validator: function (value, param) {
            var myreg = new RegExp(param[0]);
            var result = myreg.test(value);
            if (!result) {
                if (param.length > 1 && typeof param[1] == "string")
                    $.fn.validatebox.defaults.rules.reg.message = param[1];
                else
                    $.fn.validatebox.defaults.rules.reg.message = "必须是字母 数字及英文 ' - '  '.'";
            }
            return result;
        },
        message: "必须是字母 数字及英文 ' - '  '.'"
    }
});
$.extend($.fn.tree.methods, {
    /**
     * 递归获取所有父节点
     * @param curNode 指定的结点(如果没有传入curNode，则取当前选中(getSelected)结点)
     */
    getParents: function (jq, curNode) {
        if (!curNode)
            curNode = jq.tree('getSelected');
        var arr = [];
        (function rec() {
            var pNode = jq.tree('getParent', curNode.target);
            if (pNode) {
                arr.push(curNode = pNode);
                rec();
            }
        })();
        return arr;
    },
    /**
     * 展示 tooltip 提示信息
     * @param option position=出现方向，content=消息内容, index=出现的位置（索引）
     */
    showTip: function (jq, option) {
        if (!option) option = {};
        var node = jq.find('.tree-node .tree-title').eq(option.index || 0);
        if (!option.content) {
            option.content = '请选择一个结点';
        }
        node.tooltip('error', option);
    },
    /**
     * 截取 tree 的 text 某一个字符并组成一个字符串
     * @param option lStart=起始层级，lEnd=截至层级，index=第几位字符，split=分隔符
     */
    getTextChar: function (jq, option) {
        var s = $(jq).tree('getSelected')
        if (!s) return [];
        var p = $(jq).tree('getParents', s)
        p.reverse();
        p.push(s);
        var p1 = p.map(i => i.text);
        var p2 = p1.slice(option.lStart || 0, option.lEnd || p1.length)
        var p3 = p2.map(i => i[option.index || 0])
        return p3.join(option.split || '')
    },
    /**
     * 获取树节点的层级（从 1 开始）
     * @param curNode 目标节点，如果不指定则默认为当前选中节点
     */
    getLevel: function (jq, curNode) {
        if (!curNode)
            curNode = $(jq).tree('getSelected')
        var parents = $(jq).tree('getParents', curNode);
        return parents.length + 1;
    },
    /** 判断是否是叶节点 */
    isLeafNode: function (jq, curNode) {
        if (!curNode)
            curNode = $(jq).tree('getSelected')
        let children = $(jq).tree('getChildren', curNode.target);
        return !(children.length > 0);
    },
    /** 判断是否是根节点 */
    isRootNode: function (jq, curNode) {
        if (!curNode)
            curNode = $(jq).tree('getSelected')
        let parent = $(jq).tree('getParent', curNode.target);
        return !parent;
    },
    unSelect: function (jq) {
        var selectedNode = $(jq).tree('getSelected');
        if (selectedNode) {
            $(jq).find('.tree-node-selected').removeClass('tree-node-selected');
        }
    }
});
$.extend($.fn.tooltip.methods, {
    /**
     * 验证错误时，提供手动提示功能（不适用于 EasyUI 控件）
     * @param option 基础设置参数
     */
    error: (jq, option) => {
        if (!option.onShow) {
            option.onShow = () => {
                jq.tooltip('tip')
                    .css({ backgroundColor: 'rgb(255,255,204)' })
                setTimeout(() => { jq.tooltip('hide') }, 1500);
            }
        }
        if (!option.onHide) {
            option.onHide = (e) => jq.tooltip('destroy')
        }
        jq.tooltip(option).tooltip('show');
    }
});
$.extend($.fn.combogrid.methods, {
    /** 获取选中项 */
    getSelected: function (jq) {
        return $(jq).combogrid('grid').datagrid('getSelected');
    },
    reload: function (jq) {
        return $(jq).combogrid('grid').datagrid('reload');
    }
})
$.extend($.fn.combotree.methods, {
    /** 获取选中项 */
    getSelected: function (jq) {
        return $(jq).combotree('tree').tree('getSelected');
    },
    /** 获取选中项的子节点 */
    getChildren: function (jq, curNode) {
        return $(jq).combotree('tree').tree('getChildren', curNode);
    },
    reload: function (jq) {
        return $(jq).combotree('tree').tree('reload');
    }
})

