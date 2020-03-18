if (!top['euiModelCache_WebLog'])
    $.ajax({
        url: '/Values/Get',
        async: false,
        success: function (data) {
            top['euiModelCache_WebLog'] = top['euiModelCache_WebLog'] || {};
            for (let i in data) {
                top['euiModelCache_WebLog'][i.toLowerCase()] = data[i];
            }
        }
    });
//js公用方法
var comFunc = {
    changeStrToBack: function (str) {
        let m = str.match(/^[A-Z]+/);
        if (!m) return str;
        if (m[0].length === str.length) return str.toLowerCase(); //直接返回

        let len = m[0].length - 1;
        if (len < 1) len = 1; //单个连续大写转小写 多个连续时留最后一个大写
        return m[0].substring(0, len).toLowerCase() + str.substring(len);
    },
    changeListData: function (dt, typeName) {
        if ((dt.hasOwnProperty('Total') && dt.hasOwnProperty('PageData')) ||
            dt.hasOwnProperty('total') && dt.hasOwnProperty('pageData')) {
            if (typeName === 'datagrid') {
                if (dt.hasOwnProperty('Total'))
                    dt = {
                        rows: dt.PageData || dt.Rows,
                        total: dt.Total
                    };
                else dt = {
                    rows: dt.pageData || dt.rows,
                    total: dt.total
                };
            } else
                dt = dt.PageData || dt.pageData || dt.Rows || dt.rows;
        } else if ((dt.hasOwnProperty('TotalCount') && dt.hasOwnProperty('Items')) ||
            dt.hasOwnProperty('totalCount') && dt.hasOwnProperty('items')) {
            if (typeName === 'datagrid') {
                if (dt.hasOwnProperty('TotalCount'))
                    dt = {
                        rows: dt.Items,
                        total: dt.TotalCount
                    };
                else dt = {
                    rows: dt.items,
                    total: dt.totalCount
                };
            } else
                dt = dt.Items || dt.items;
        }
        return dt;
    },
    getLoader: function (type) {
        if (!type) type = 'datagrid';
        return function () {
            var arr = arguments;
            var param = arguments[0]; //传递给后台的参数
            var success = arguments[1]; //成功的回调
            var error = arguments[2]; //失败的回调
            var typeName = type;
            (() => {
                var oldSuccess = typeof (success) === "function" ? success : null;
                if (!oldSuccess) return;
                success = arguments[1] = function (data) {
                    var props = ['Data', 'Success', 'Message', 'data', 'success', 'message'];
                    if (props.filter(p => data.hasOwnProperty(p)).length === 3) {
                        var dt = data.Data || data.data || [];
                        dt = comFunc.changeListData(dt, typeName);
                        arguments[0] = dt || [];
                    } else {
                        arguments[0] = comFunc.changeListData(data, typeName) || [];
                    }
                    //失败则进入公共代码处理片段
                    if (!comFunc.handelError(data)) oldSuccess.apply(this, arguments);
                    else error.apply(el, arguments);
                };
            })(); //注入成功的回调

            var load = () => {
                let op = null;
                try {
                    op = $(this)[type]('options');
                } catch (e) {
                    type = type === 'combotree' ? 'tree' : 'datagrid';
                    op = $(this)[type]('options');
                }

                if (typeName &&
                    $.fn &&
                    $.fn[typeName] &&
                    $.fn[typeName].defaults &&
                    $.fn[typeName].defaults.loader) {
                    var oldLoader = $.fn[typeName].defaults.loader;
                    if (typeName === 'datagrid') {
                        if (typeof (arr[0]) === 'object') {
                            if (arr[0].hasOwnProperty('page') && arr[0].hasOwnProperty('rows')) {
                                arr[0]['currentPageIndex'] = parseFloat(arr[0]['page']) - 1;
                                arr[0]['pageSize'] = parseFloat(arr[0]['rows']);
                            }
                        }
                    }
                    if (typeName === 'panel')
                        oldLoader.apply(el, arr);
                    else {
                        if (!op.url) {
                            if (typeName === 'treegrid' || typeName === 'datagrid')
                                $(this)[type]('loaded');
                            return false;
                        }
                        let loading = () => {
                            try {
                                $(this)[type]('loading');
                            } catch (e) {
                                ;
                            }
                        }
                        let loaded = () => {
                            try {
                                $(this)[type]('loaded');
                            } catch (e) {
                                ;
                            }
                        }
                        let p = comFunc.clone(param);
                        for (let i in p) {
                            if (typeof (p[i]) === 'function')
                                try {
                                    p[i] = p[i]();
                                } catch (e) {
                                    ;
                                }
                        }
                        $.ajax({
                            type: op.method,
                            url: op.url,
                            notShowlayer: true,
                            data: p,
                            dataType: "json",
                            contentType: op.contentType,
                            success: function (data) {
                                loaded();
                                success.apply(this, arguments);
                            },
                            error: function () {
                                loaded();
                                error.apply(this, arguments);
                            },
                            beforeSend: function () {
                                loading();
                            }
                        });
                    }
                }
            };
            load();
        };
    },
    alert: (function () {
        if (!top.layer && !layer) {
            window.alert.apply(this, arguments);
            return;
        }
        var l = parent.layer || layer;
        return typeof (l) === 'object' ? (str) => l.msg(str, {
                icon: 0
            }) :
            (str) => (parent.$ || $).messager.info('温馨提示', str);
    })(),
    getElFunc: (el) => {
        if (!el) el = this;
        return (el instanceof $ ? el : $(el)).data('getHasObjFunc');
    },
    clone: function (o, lv, changeO) { //changeO 对o 返回非undefined时 克隆直接返回其值
        try {
            if (typeof (changeO) !== 'function') changeO = undefined;
            else {
                let _r = changeO(o);
                if (_r !== undefined) return _r;
            }
            if (typeof (lv) !== "number") lv = 0;
            else if (lv > 10) {
                console.log('为防止无限递归克隆，暂不支持10级以上的克隆');
                throw '';
            }
            var cloneArrFunc = (arr) => {
                if (!Array.isArray(arr)) return false;
                else {
                    let newArr = [];
                    arr.forEach(el => newArr.push(comFunc.clone(el, lv, changeO)));
                    return newArr;
                }
            };
            if (typeof (o) === "object" && o !== null) {
                let cloneArr = cloneArrFunc(o);
                if (cloneArr !== false) return cloneArr;
                let newObj = {};
                for (var i in o) {
                    switch (typeof (o[i])) {
                        case 'object':
                            if (o[i] === null || o[i] === undefined) continue;
                            if (o[i].__proto__.__proto__ === HTMLElement.prototype) continue;
                            let _cloneArr = cloneArrFunc(o[i]);
                            if (_cloneArr !== false) newObj[i] = _cloneArr;
                            else newObj[i] = comFunc.clone(o[i], lv, changeO);
                            break;
                        default:
                            newObj[i] = o[i];
                            break;
                    }
                }
                return newObj;
            } else return o;
        } catch (e) {
            return null;
        }
    },
    handelError: function (data) {
        var props = ['Data', 'Success', 'Message', 'data', 'success', 'message'];
        var hasError = false;
        if (props.filter(p => data.hasOwnProperty(p)).length === 3) {
            if (data.success === false || data.Success === false) {
                comFunc.alert(data.message || data.Message);
                console.log(data.data);
                hasError = true;
            }
        } else if (data['success'] == false || data['Success'] == false) {
            hasError = true;
        } else {
            hasError = data.hasOwnProperty('errMsg');
            if (hasError) {
                comFunc.alert(data.errMsg);
                console.log(data.stackTrace);
            }
        }
        return hasError;
    },
    onLoadSuccess: function (data) {
        $('.easyui-tooltip').each((a, b, c) => {
            try {
                $(b).tooltip('options'); //暴力给未绑定tooltip的渲染出来 在加载完成之时
            } catch (e) {
                var title = $(b).attr('title');
                if (title)
                    $(b).tooltip({
                        position: 'right',
                        content: '<span style="color:#fff">' + title + '</span>',
                        onShow: function () {
                            $(b).tooltip('tip').css({
                                backgroundColor: '#666',
                                borderColor: '#666'
                            });
                        }
                    });
            }
        });
        var loadCall = () => {
            var el_func = comFunc.getElFunc(this);
            if (!el_func) return setTimeout(loadCall, 100);
            var op = el_func('options');
            if (comFunc.handelError(data)) {
                let func = op['onLoadError'];
                typeof (func) === "function" && func.call(this, data.errMsg);
            } else {
                let func = op['_onLoadSuccess'];
                typeof (func) === "function" && func.apply(this, arguments);
            }
        };
        setTimeout(loadCall, 100);
    },
    getHasObjFunc: (obj, func, _methods) => {
        _methods = _methods || {};
        for (let m in _methods)
            if (typeof (_methods[m]) !== "function") delete _methods[m];
        _methods['getobj'] = _methods['getobj'] || (() => obj);
        let _func = null;
        let myType = '';
        _func = function () {
            var a0 = arguments[0];
            var _newArr = [];
            for (var i = 1; i < arguments.length; i++) _newArr.push(arguments[i]);
            try {
                if (typeof (a0) === "string" && _methods.hasOwnProperty(a0)) return _methods[a0].apply(_func, _newArr); //如果在methods里面 则调用它
                else {
                    if (a0[0] === '$') arguments[0] = arguments[0].substring(1); //方便覆盖原始方法 并且能调用初始方法
                    return func.apply(obj, arguments);
                }
            } catch (e) {
                debugger
                $.messager.info('提示', a0 + '方法发生代码了错误：' + e);
                throw e;
            }
        };
        let setEls = [(obj instanceof $ ? obj : $(obj))];
        try {
            myType = _func('$getTypeName');
            let gridTypes = ['combogrid', 'treegrid'];
            if (gridTypes.indexOf(myType) !== -1) {
                if (myType === 'treegrid') {} else {
                    var inner_grid = _func('grid');
                    inner_grid && setEls.push(inner_grid);
                }
            }
        } catch (e) {}
        setEls.forEach(__el => __el.data('getHasObjFunc', _func));
        return _func;
    },
    nullFunc: () => {},
    //根据字符串获取一个方法
    getFunc: function (funcStr) {
        var nullFunc = this.nullFunc;
        if (typeof (funcStr) !== "string" || !funcStr) return nullFunc;
        var func = eval(funcStr);
        return typeof (func) === "function" ? func : nullFunc;
    },
    getCurController: function () {
        let _url = location.href.replace(location.host + '/', '').replace('http://', '').replace('https://', '');
        _url = _url.substring(0, _url.indexOf('/'));
        return _url;
    },
    getModelByWindowAndUrl_IsAddGet: false,
    //获得模型 根据window对象和url
    getModelByWindowAndUrl: function (window, url) {
        var result = null;
        if (typeof (url) !== "string" || !url) return result;
        top['euiModelCache_WebLog'] = top['euiModelCache_WebLog'] || {}; //缓存相同请求 因为url一致
        let px = '';
        if (this.getModelByWindowAndUrl_IsAddGet) {
            let _url = location.href.replace(location.host + '/', '').replace('http://', '').replace('https://', '');
            if (/^\/?(\w+?)\/?$/.test(url)) {
                _url = _url.substring(0, _url.indexOf('/'));
                px = '/' + _url.substring(0, _url.indexOf('/')) + '/get/';
            } else { //匹配其他规则的
                let m = url.match(/^\/?(\w+?)\/(\w+?)\/?$/);
                if (m !== null) {
                    _url = m[1];
                    url = m[2];
                }
            }
            px = '/' + _url + '/get/';
        }
        let euiModelCache_WebLogKey = (px + url).toLowerCase();
        if (top['euiModelCache_WebLog'][euiModelCache_WebLogKey] && Array.isArray(top['euiModelCache_WebLog'][euiModelCache_WebLogKey])) {
            result = top['euiModelCache_WebLog'][euiModelCache_WebLogKey].filter(el => el !== null);
        } else
            $.ajax({
                url: euiModelCache_WebLogKey,
                async: false,
                success: function (data) {
                    result = data.filter(el => el !== null);
                    top['euiModelCache_WebLog'][euiModelCache_WebLogKey] = result;
                },
                error: function () {}
            });

        return comFunc.clone(result);
    },
    //根据vue控件 获取一个随机且页面当前没有的id
    getRandomStr: function (num, strCall) {
        var returnStr = "",
            charStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < num; i++) {
            var index = Math.round(Math.random() * (charStr.length - 1));
            returnStr += charStr.substring(index, index + 1);
        }
        if (typeof (strCall) === "function") {
            var str = strCall(returnStr);
            if (typeof (str) === "string" && str) {
                while ($('#' + str).length !== 0)
                    str = strCall(comFunc.getRandomStr(num));
            }
            return str;
        }
        return returnStr;
    },
    getDomId: function (vueCon) {
        if (!(vueCon instanceof Vue)) return;
        if (vueCon.$attrs.id) return vueCon.$attrs.id;
        var num = 3,
            prefix = vueCon.$options._componentTag + '_';
        var getRandomStr = () => {
            comFunc.getRandomStr(num);
        };
        if (typeof (prefix) === "string" && prefix) {
            var id = comFunc.getRandomStr(num, (str) => prefix + str);
            return id;
        } else return getRandomStr();
    },
    //创建loadControls方法的方法
    get_loadControls: function (getControlFunc, _controls) {
        var nullFunc = this.nullFunc;
        if (typeof (getControlFunc) !== "function") return nullFunc;
        var getControl = getControlFunc;
        return function (controls) {
            if (typeof (controls) !== "object") return;
            if (controls.hasOwnProperty('$comOption') && _controls) {
                let _option = {};
                let _funcs = {};
                for (let on in controls.$comOption) {
                    if (typeof (controls.$comOption[on]) !== 'function') _option[on] = controls.$comOption[on];
                    else _funcs[on] = controls.$comOption[on];
                }
                _controls.forEach(el => easyuis.setOption(el, _option));
                _controls.forEach(el => easyuis.setOption(el, _funcs));
            }
            for (var con in controls) {
                var option = controls[con];
                if (con === '$comOption') continue;
                else if (con) {
                    var cons = con.match(/^\$(.+?)s$/);
                    if (cons === null) {
                        var el = getControl(con) || [];
                        if (el.length > 0)
                            el[0].classList.forEach(_el => {
                                var type = _el.replace('easyui-', '');
                                if (type !== _el && easyuis.getControl(type)) {
                                    controls[con] = new euiControl({
                                        el: el,
                                        option: option,
                                        typeName: type
                                    }); //设置选项
                                }
                            });
                    } else {
                        var curCon = easyuis.getControl(cons[1]); //拿到easyui对应控件
                        if (curCon && curCon.hasOwnProperty('enName')) {
                            var conArrs = option;
                            for (var _con in conArrs) {
                                option = conArrs[_con];
                                //拿得到控件 设置选项
                                curCon = getControl(_con); //拿到页面元素
                                controls[con] = new euiControl({
                                    el: curCon,
                                    option: option,
                                    typeName: cons[1]
                                }); //设置选项
                            }
                        }
                    }
                }
            }
        };
    },
    //根据Url获得
    getColumnsByUrl: function (window, url, option, fields, sortList) {
        var arrs = this.getModelByWindowAndUrl(window, url);
        if (!arrs || arrs.length === 0) return null;
        option = option || {};
        fields = (typeof (fields) === "object" ? fields : {}) || {};
        var typeFormatter = {
            Boolean: function (value, row, index) {
                return value ? '是' : '否';
            },
            DateTime: function (value, row, index) {
                return value ? $.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(value)) : '';
            },
        };
        var getOneColumn = (col) => {
            var result = {
                field: col.controlName || '',
                title: col.lableName,
                $cdata: col
            };
            if (result.field)
                result.field = comFunc.changeStrToBack(result.field); //小驼峰命名
            var setOption = (pName, val) => result[pName] = option[pName] || val;
            [
                ['width', 150],
                ['align', 'center'],
                ['hidden', !col.isShow],
                ['formatter', typeFormatter[col.typeName.replace('?', '')]]
            ].forEach(el => el.length >= 2 && setOption(el[0], el[1]));
            for (let on in option) setOption(on, undefined);
            result['_editor'] = createEditor(col); //得到编辑器
            var otherOption = fields[result.field] || fields[result.title] || {};
            for (let on in otherOption) result[on] = otherOption[on];
            if (!result.formatter && col.controlTypeName === '枚举下拉框') {
                try {
                    var data = JSON.parse(col.option).data;
                    result.formatter = function (value, row, index) {
                        let el = data.filter(el => el.id === value || el.id + '' === value + '');
                        let result = el.length === 0 ? '' : el[0].text;
                        if (this['field'])
                            row[this['field'] + 'Name'] = result;
                        return result;
                    }
                } catch (e) {
                    ;
                }
            } else if ([9].indexOf(col.controlType) !== -1) {
                if (result.formatter) {
                    console.log('提示，自动渲染的下拉框编辑器，使用formatter，需要获取字段值时应该获取字段名 field + ‘$Text’');
                } else {
                    result.formatter = function (value, row, index) {
                        try {
                            return row[this.field + '$Text']; //配合endCellEdit 使页面能正常显示下拉框的text
                        } catch (e) {
                            return value;
                        }
                    }
                }
            }
            if (result['edit'] === true || typeof (result['edit']) === 'object') {
                var oldE = result['editor'];
                result['editor'] = result['_editor'];
                result['_editor'] = oldE;
                if (result['editor']['options']) {
                    for (let i in result['edit']) {
                        if (!result['editor']['options'].hasOwnProperty(i))
                            result['editor']['options'][i] = result['edit'][i];
                    }
                }
            } //如果编辑为true 则使用默认编辑器
            return result;
        };
        var createEditor = (col) => {
            let _Editor = {
                type: 'auto',
                options: col
            };
            col.notlable = true;
            return _Editor;
        };
        var cols = [];
        arrs.forEach(col => cols.push(getOneColumn(col)));
        cols = cols.filter(el => el);
        if (sortList && Array.isArray(sortList) && sortList.length > 0) {
            sortList &&
                sortList.reverse().forEach(el => { //使顺序为传递过来的顺序
                    var findEl = cols.filter(_el => _el.field === el || _el.title === el);
                    if (findEl.length === 0) findEl = [{
                        hidden: true,
                        title: el,
                        field: el,
                        width: 150
                    }];
                    if (findEl.length === 1) {
                        var idx = cols.indexOf(findEl[0]);
                        cols.splice(idx, 1); //删除该元素
                        cols = [findEl[0]].concat(cols);
                    }
                });
        }
        return cols;
    },
    loadJS: (() => { //必须与easyUIByVueExten.js在同一目录下
        var notNeedLoadJSArr = [];
        var PATH = __CreateJSPath("easyUIByVueExten.js");

        function __CreateJSPath(js) {
            var scripts = document.getElementsByTagName("script");
            var path = "";
            var jsSrcs = [];
            for (var i = 0, l = scripts.length; i < l; i++) {
                var src = scripts[i].src;
                jsSrcs.push(src);
                if (src.indexOf(js) != -1) {
                    let ss = src.split(js);
                    path = ss[0];
                    break;
                }
            }
            var href = location.href;
            href = href.split("#")[0];
            href = href.split("?")[0];
            let ss = href.split("/");
            ss.length = ss.length - 1;
            href = ss.join("/");
            if (path.indexOf("https:") == -1 && path.indexOf("http:") == -1 && path.indexOf("file:") == -1 && path.indexOf("\/") != 0) {
                path = href + "/" + path;
            }
            notNeedLoadJSArr = jsSrcs;
            return path;
        }
        return (jsName, isAbbreviation) => {
            if (typeof (isAbbreviation) !== 'boolean') isAbbreviation = true;
            var url = (isAbbreviation ? PATH : '') //如果是简写则与easyUIByVueExten.js在同一目录下
                +
                jsName;
            if (notNeedLoadJSArr.indexOf(url) !== -1) return; //已经加载的
            if (/.+?\.js$/.test(jsName)) //满足正则则加载
                document.write('<script src="' + url + '" type="text/javascript"></sc' + 'ript>');
            return PATH;
        };
    })(),
    lytOpen: function (title, url, closeCall, fun, w, h) { //para关闭叉叉触发的事件
        if (!top.layer && !layer) return;
        var width = document.body.offsetWidth - 100; //js document.body.offsetWidth网页可见区域的宽
        var height = document.body.offsetHeight - 50; //js document.body.offsetHeight网页可见区域的高
        if (typeof (w) != 'undefined') {
            width = w;
        }
        if (typeof (h) != 'undefined') {
            height = h;
        }
        var _closeCall = (action, win) => {
            typeof (closeCall) === 'function' && closeCall(action, win);
        };
        var successCall = () => {};
        var options = {
            shade: [0.5, '#000'],
            shadeClose: false,
            type: 2,
            area: [width + 'px', height + 'px'],
            maxmin: false,
            title: title,
            content: url,
            end: fun,
            success: function (layero, index) {
                var body = layer.getChildFrame('body', index);
                var iframeWin = window[layero.find('iframe')[0]['name']]; //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
                iframeWin.$isLytOpen = true; //标识页面是layer打开的
                iframeWin.lytClose = (action) => {
                    layer.close(index);
                    _closeCall(action, iframeWin); //关闭页面之前的回调
                };
                typeof (successCall) === "function" && successCall.apply(this, [layero, index, iframeWin]); //成功之后的回调
            },
            cancel: function () {}
        };
        if (typeof (arguments[0]) === 'object') { //可以覆盖初始的属性
            const obj = comFunc.clone(arguments[0]);
            delete obj['success'];
            _closeCall = typeof (obj['closeCall']) === 'function' ? obj['closeCall'] : _closeCall;
            successCall = typeof (obj['successCall']) === 'function' ? obj['successCall'] : successCall;
            if (obj.hasOwnProperty('width') && obj.hasOwnProperty('height')) {
                var handleNum = (num) => typeof (num) === 'number' ? num + 'px' : num + '';
                obj.area = [handleNum(obj['width']), handleNum(obj['height'])];
            }
            if (obj['url'] && !obj['content']) obj['content'] = obj['url'];
            if (obj.hasOwnProperty('w') && obj.hasOwnProperty('h')) obj.area = [obj.w + 'px', obj.h + 'px'];
            for (var i in obj) {
                options[i] = obj[i];
            }
        }
        var index = layer.open(options);
    },
    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
};

//***************************** easyui 的二次封装 ********************************************/
var euiControlType = function (_obj) {
    if (typeof (_obj) !== "object" || !_obj) return null;
    var euiControlType = this;
    var get_objVal = (propName, typeName, defaulVal) => {
        return typeof (_obj[propName]) === typeName ? _obj[propName] : defaulVal;
    };
    euiControlType.cnName = get_objVal('cnName', 'string', '');
    euiControlType.isHtmlTag = get_objVal('isHtmlTag', 'boolean', true);
    euiControlType.options = get_objVal('options', 'object', undefined);
    euiControlType.enName = get_objVal('enName', 'string', '');
    euiControlType.setVal = get_objVal('setVal', 'function', undefined);
    euiControlType.getVal = get_objVal('getVal', 'function', undefined);
    euiControlType.beforeCreate = get_objVal('beforeCreate', 'function', undefined);
    if (euiControlType.isHtmlTag === true) {
        euiControlType.className = 'easyui-' + euiControlType.enName;
    } else euiControlType.className = get_objVal('className', 'string', '');
    return euiControlType;
};
var euiControl = function (_obj) {
    const openTips = false;
    if (typeof (_obj) !== "object" || !_obj) return _obj;
    var eCon = this;
    var get_objVal = (propName, typeName, defaulVal) => {
        return typeof (_obj[propName]) === typeName ? _obj[propName] : defaulVal;
    };
    eCon.el = get_objVal('el', 'object', null);
    if (eCon.el.length === 0) return _obj;
    eCon.option = get_objVal('option', 'object', null);
    eCon.typeName = get_objVal('typeName', 'string', '');
    eCon.beforeCreate = get_objVal('beforeCreate', 'function', undefined);
    var con = easyuis.getControl(eCon.typeName);
    if (!eCon.el || !eCon.option || !eCon.typeName || !con) return _obj;
    eCon.setOption = () => easyuis.setOption(eCon.el, eCon.option, eCon.typeName);
    //执行创建前方法
    typeof (con.beforeCreate) === "function" && con.beforeCreate(eCon.el, eCon.option);
    typeof (eCon.beforeCreate) === "function" && eCon.beforeCreate(eCon.el, eCon.option);
    (() => {
        //on和 functions 、methods、Columns 允许外置是基于查阅代码美观，可以清楚的回溯监听事件、方法、单纯属性，自定义属性、列
        //重要属性提高层次 有利于查看单组件
        let onEvents = get_objVal('on', 'object', null);
        if (onEvents) {
            //不规则的事件名
            var noRuleEventNames = ['success'];
            for (let en in onEvents) { //给on对象绑定到option上
                let event = onEvents[en];
                if (typeof (event) === 'function') {
                    if (noRuleEventNames.indexOf(en) === -1) {
                        en = 'on' + en[0].toUpperCase() + en.substr(1);
                    }
                    eCon.option[en] = event;
                }
            }
        } else if (openTips) {
            console.log('建议new euiControl(obj)时,传递的obj把事件单独放在 obj.on 而不是 obj.option上：放在on里可简化option，方法名不用写on开头');
        }
        let functions = get_objVal('functions', 'object', null);
        if (functions) {
            for (let en in functions) { //给functions对象绑定到option上
                let func = functions[en];
                if (typeof (func) === 'function') {
                    eCon.option[en] = func;
                }
            }
        } else if (openTips) {
            console.log('建议new euiControl(obj)时,传递的obj把属性里的方法单独放在 obj.functions 而不是 obj.option上：放在functions里可简化option');
        }
        let methods = get_objVal('methods', 'object', null);
        if (methods) {
            eCon.option['methods'] = methods;
        } else if (openTips) {
            console.log('建议new euiControl(obj)时,传递的obj把自定义方法（methods）单独放在 obj.methods 而不是 obj.option上：放在methods 里可简化option');
        }
        let Columns = get_objVal('Columns', 'object', null);
        if (Columns) {
            eCon.option['$Columns'] = Columns;
        }
    })(); //处理option
    (() => {
        let columnsTypes = ['datagrid', 'treegrid', 'combogrid', 'combogrid', 'combotreegrid']; //包含列的控件类型集合
        if (columnsTypes.indexOf(eCon.typeName) === -1) return;
        //当处于这些控件类型时，可以智能设置列
        let columns = []; //不冻结列
        let frozenColumns = []; //冻结列
        let $Columns = typeof (eCon.option.$Columns) === 'object' && Array.isArray(eCon.option.$Columns) ? eCon.option.$Columns : null;
        if ($Columns) {
            let getIsFrozen = (col) => col && col['isFrozen'] === true;
            $Columns.forEach(el => {
                let curArr = [];
                if (Array.isArray(el)) { //只支持一层嵌套
                    curArr = curArr.concat(el);
                } else if (typeof (el) === 'object') {
                    curArr.push(el);
                } else if (typeof (el) === 'function') {
                    try {
                        let elFuncResult = el();
                        if (Array.isArray(elFuncResult)) curArr = curArr.concat(elFuncResult);
                    } catch (e) {
                        console.log('初始化时$Columns属性里的方法调用异常', eCon.el);
                    }
                }
                columns = columns.concat(curArr.filter(_el => !getIsFrozen(_el)));
                frozenColumns = frozenColumns.concat(curArr.filter(_el => getIsFrozen(_el)));
            });
            (eCon.option.frozenColumns || [
                []
            ])[0].forEach(el => {
                if (typeof (el) === 'object')
                    frozenColumns.push(el);
            });
            if (eCon.option['columns']) console.log('当同时使用$Columns/columns属性时，columns会被覆盖，使用frozenColumns不会');
            eCon.option.columns = [columns];
            eCon.option.frozenColumns = [frozenColumns];
        }
        if (typeof (eCon.option.$EditOptions) === 'object') {
            let cols = columns.concat(frozenColumns).filter(el => el.hidden !== true);
            for (let en in eCon.option.$EditOptions) {
                let _col = cols.find(el => el.title === en || el.field === en);
                if (_col && typeof (_col) === 'object' &&
                    typeof (_col['editor']) === 'object' && typeof (_col['editor']['options']) === 'object') {
                    let _colEditOptions = _col['editor']['options'];
                    if (_col['editor']['type'] === 'auto') {
                        _colEditOptions = _col['editor']['options']['initOption'] = {};
                    }
                    for (let _o in eCon.option.$EditOptions[en]) { //使用直接覆盖属性模式 给编辑器直接绑定属性方法等
                        _colEditOptions[_o] = eCon.option.$EditOptions[en][_o];
                    }
                }
            }
        }
    })(); //处理列对象
    eCon.setOption();
    eCon.option['methods'] = typeof (eCon.option['methods']) === "object" ? eCon.option['methods'] : {};
    if (!eCon.option['methods'].hasOwnProperty('$getTypeName')) eCon.option['methods']['$getTypeName'] = () => eCon.typeName;
    if (!eCon.option['methods'].hasOwnProperty('validate')) eCon.option['methods']['validate'] = () => eCon.el.form('validate');
    if (!eCon.option['methods'].hasOwnProperty('create')) eCon.option['methods']['create'] = (el, beforeCreate, option, typeName) => {
        var old$el = eCon.option.$el;
        var oldmethods = eCon.option.methods;
        delete eCon.option.$el;
        delete eCon.option.methods;
        var eFunc = new euiControl({
            el: el || eCon.el,
            option: option || comFunc.clone(eCon.option),
            typeName: typeName || eCon.typeName,
            beforeCreate: beforeCreate || eCon.beforeCreate
        });
        eCon.option.$el = old$el;
        eCon.option.methods = oldmethods;
        return eFunc;
    };
    if (eCon.typeName === 'datagrid') {
        eCon.option['methods']['validate'] = (callFunc) => {
            var rows = eCon.el.datagrid('getRows');
            for (var i = 0; i < rows.length; i++) {
                var result = false;
                if (typeof (callFunc) === "function") {
                    result = callFunc(rows[i], i);
                } else result = eCon.el.datagrid('validateRow', i);
                if (!result) {
                    return false;
                }
            }
            return rows;
        };
        eCon.option['methods']['cloneCols'] = function (arr) {
            if (!Array.isArray(arr) || arr.length === 0) return null;
            var cols = [];
            var pageCols = this('options').columns[0];
            cols.length = pageCols.length;
            pageCols.forEach(el => {
                var idx = arr.indexOf(el.title);
                if (idx !== -1) cols[idx] = comFunc.clone(el);
            });
            return cols.filter(el => el);
        };
    }
    let _func = comFunc.getHasObjFunc(eCon.el, eCon.el[eCon.typeName], eCon.option['methods']);
    return _func;
};
var easyuis = {
    AllOptions: {
        loader: function () {
            //注入初始loader方法
            var el = this;
            var el_func = comFunc.getElFunc(this);
            var arr = arguments;
            var param = arguments[0]; //传递给后台的参数
            var success = arguments[1]; //成功的回调
            var error = arguments[2]; //失败的回调
            var typeName = '';
            (() => {
                var oldSuccess = typeof (success) === "function" ? success : null;
                if (!oldSuccess) return;
                success = arguments[1] = function (data) {
                    var props = ['Data', 'Success', 'Message', 'data', 'success', 'message'];
                    if (props.filter(p => data.hasOwnProperty(p)).length === 3) {
                        var dt = data.Data || data.data || [];
                        dt = comFunc.changeListData(dt, typeName);
                        arguments[0] = dt || [];
                    } else {
                        arguments[0] = comFunc.changeListData(data, typeName) || [];
                    }
                    //失败则进入公共代码处理片段
                    if (!comFunc.handelError(data)) oldSuccess.apply(this, arguments);
                    else error.apply(el, arguments);
                };
            })(); //注入成功的回调
            if (!comFunc.getElFunc(el)) {
                let innerTypeNames = ['datagrid', 'tree']; //当控件是这些内部控件的时候 不进入嵌套load控制
                for (let i = 0; i < innerTypeNames.length; i++) {
                    let dg = $(el).data(innerTypeNames[i]);
                    if (dg && dg.options.$el[0] !== el) {
                        $.fn[dg.options.$typeName].defaults.loader.apply(el, arr);
                        return;
                    }
                }
            }
            var load = () => {
                el_func = comFunc.getElFunc(el);
                if (!el_func) return setTimeout(load, 100);
                var op = el_func('options');
                if (op['$typeName'] &&
                    $.fn &&
                    $.fn[op.$typeName] &&
                    $.fn[op.$typeName].defaults &&
                    $.fn[op.$typeName].defaults.loader) {
                    var oldLoader = $.fn[op.$typeName].defaults.loader;
                    typeName = op.$typeName;
                    if (typeName === 'datagrid') {
                        if (typeof (arr[0]) === 'object') {
                            if (arr[0].hasOwnProperty('page') && arr[0].hasOwnProperty('rows')) {
                                arr[0]['currentPageIndex'] = parseFloat(arr[0]['page']) - 1;
                                arr[0]['pageSize'] = parseFloat(arr[0]['rows']);
                            }
                        }
                    }
                    if (op.$typeName === 'panel')
                        oldLoader.apply(el, arr);
                    else {
                        if (!op.url) {
                            if (op.$typeName === 'treegrid')
                                el_func('loaded');
                            return false;
                        }
                        let loading = () => {
                            try {
                                $(this)[typeName]('loading');
                            } catch (e) {
                                ;
                            }
                        }
                        let loaded = () => {
                            try {
                                $(this)[typeName]('loaded');
                            } catch (e) {
                                ;
                            }
                        }
                        let p = comFunc.clone(param);
                        for (let i in p) {
                            if (typeof (p[i]) === 'function')
                                try {
                                    p[i] = p[i]();
                                } catch (e) {
                                    ;
                                }
                        }
                        $.ajax({
                            type: op.method,
                            url: op.url,
                            notShowlayer: true,
                            data: p,
                            dataType: "json",
                            contentType: op.contentType,
                            success: function (data) {
                                loaded();
                                success.apply(this, arguments);
                            },
                            error: function () {
                                loaded();
                                error.apply(this, arguments);
                            },
                            beforeSend: function () {
                                loading();
                            }
                        });
                    }
                }
            };
            load();
        },
        onLoadSuccess: function (data) {
            if (!comFunc.onLoadSuccess.apply(this, arguments)) return;
        },
        onShowPanel: function () {}
    },
    controls: {
        Base: {
            pagination: new euiControlType({
                cnName: '分页控件',
            }),
            searchbox: new euiControlType({
                cnName: '搜索框',
            }),
            tooltip: new euiControlType({
                cnName: '提示框',
            })
        },
        Form: {
            validatebox: new euiControlType({
                cnName: '验证框',
            }),
            textbox: new euiControlType({
                cnName: '文本框',
            }),
            passwordbox: new euiControlType({
                cnName: '密码框',
            }),
            combobox: new euiControlType({
                cnName: '下拉列表框',
                options: {
                    onLoadSuccess: function (data) {
                        setTimeout(() => {
                                var el_func = comFunc.getElFunc(this);
                                var op = el_func ? el_func('options') : $(this).data('combobox').options;
                                if (op.hasAllSelect) {
                                    var _datdItem = {};
                                    _datdItem[op.valueField] = '';
                                    _datdItem[op.textField] = '全部';
                                    data = [_datdItem].concat(data);
                                    delete op.hasAllSelect;
                                    if (el_func)
                                        el_func({
                                            data: data
                                        });
                                    else $(this).combobox({
                                        data: data
                                    });
                                    return;
                                }
                            },
                            1);
                        if (!comFunc.onLoadSuccess.apply(this, arguments)) return;
                    },
                }
            }),
            combotree: new euiControlType({
                cnName: '树形下拉框',
            }),
            combogrid: new euiControlType({
                cnName: '数据表格下拉框',
                options: {
                    mode: 'remote',
                    delay: 500,
                    fitColumns: true,
                    onChange: function (newVal) {
                        if (!newVal) {
                            var el_func = comFunc.getElFunc(this);
                            if (!el_func) return;
                            var op = el_func('options');
                            if (op.hasAllSelect) {
                                try {
                                    op['onSelect'] && op['onSelect']('');
                                } catch (e) {
                                    ;
                                }
                            }
                        }
                    }
                },
            }),
            combotreegrid: new euiControlType({
                cnName: '树形表格下拉框',
            }),
            numberbox: new euiControlType({
                cnName: '数值输入框',
            }),
            datebox: new euiControlType({
                cnName: '日期输入框',
            }),
            datetimebox: new euiControlType({
                cnName: '日期时间输入框',
            }),
            datetimespinner: new euiControlType({
                cnName: '日期时间微调框',
            }),
            calendar: new euiControlType({
                cnName: '日历',
            }),
            numberspinner: new euiControlType({
                cnName: '数字微调',
            }),
            timespinner: new euiControlType({
                cnName: '时间微调',
            }),
            slider: new euiControlType({
                cnName: '滑动条',
            }),
            filebox: new euiControlType({
                cnName: '文件框',
            }),
        },
        Window: {
            window: new euiControlType({
                cnName: '窗口',
            }),
            dialog: new euiControlType({
                cnName: '对话框窗口',
                options: {
                    closed: true,
                    modal: true,
                    onClose: function () {
                        $(this).dialog('center');
                    }
                },
                beforeCreate: function (el, options) {
                    if (options.hasOwnProperty('autoCreateBtn') &&
                        options.autoCreateBtn === true &&
                        options.hasOwnProperty('saveFuncStr') &&
                        options.hasOwnProperty('closeFuncStr')) {
                        var id = comFunc.getRandomStr(3, str => 'autoBtnDiv' + str);
                        $('body').append($(`<div id="${id}">
                            <span style="float: right">
                                <a onclick="${options.saveFuncStr
                            }()" id="subbtnSave" class="btn btn-success"><i class="fa fa-check"></i>保存</a>
                                <a onclick="${options.closeFuncStr
                            }()" class="btn btn-primary"><i class="fa fa-close"></i>关闭</a>
                            </span>
                        </div>`));
                        el.height(el.height() + 50);
                        options.footer = "#" + id;
                    }
                }
            }),
            messager: new euiControlType({
                cnName: '消息窗口',
            }),
        },
        DataGridAndTree: {
            datagrid: new euiControlType({
                cnName: '数据表格',
                options: {
                    idField: 'id',
                    fit: true,
                    rownumbers: true,
                    singleSelect: true,
                    autoRowHeight: false,
                    pagination: true,
                    pageSize: 20,
                    pageList: [10, 20, 30, 40, 50],
                    loaderAddRow: false,
                    onBeforeLoad: function () {
                        var options = $(this).datagrid('options');
                        var loaderAddRow = options['loaderAddRow'] || false;
                        if (loaderAddRow)
                            $(this).datagrid('appendRow', {
                                lastDate: new Date()
                            });
                        var hasUrl = Boolean(options.hasOwnProperty('url') && options.url);
                        return hasUrl;
                    },
                    onSelectAll: function (rows) {
                        var options = $(this).datagrid('options');
                        for (var i = 0; i < rows.length; i++) {
                            options.onSelect.call(this, i, rows[i]);
                        }
                    },
                    onUnselectAll: function (rows) {
                        var options = $(this).datagrid('options');
                        for (var i = 0; i < rows.length; i++) {
                            options.onUnselect.call(this, i, rows[i]);
                        }
                    },
                    onClickCell: function (index, field, value) {
                        $(this).datagrid('endCellEdit');
                        $(this).datagrid('editCell', {
                            index: index,
                            field: field
                        });
                    }
                },
                beforeCreate: function (el, options) {
                    try {
                        if (options.tools && $(options.tools).length > 0) {
                            el.attr('toolbar', options.tools);
                        }
                    } catch (e) {}
                }
            }),
            datalist: new euiControlType({
                cnName: '数据列表',
            }),
            propertygrid: new euiControlType({
                cnName: '属性表格',
            }),
            tree: new euiControlType({
                cnName: '树',
            }),
            treegrid: new euiControlType({
                cnName: '树形表格',
                options: {
                    onLoadSuccess: function (row, data) {
                        if (!comFunc.onLoadSuccess.call(this, data)) return;
                    }
                }
            }),
        }
    },
    getControls: function () {
        easyuis._controls = {
            cns: {},
            ens: {}
        };
        for (var type in easyuis.controls) {
            if (typeof (easyuis.controls[type]) === "object")
                for (var con in easyuis.controls[type]) {
                    var curCon = easyuis.controls[type][con];
                    if (curCon instanceof euiControlType) {
                        curCon.enName = curCon['enName'] || con;
                        easyuis._controls.ens[con] = curCon;
                        easyuis._controls.cns[curCon.cnName] = curCon;
                        if (curCon.isHtmlTag === true) {
                            curCon.className = 'easyui-' + curCon.enName;
                        }
                        curCon['options'] = curCon['options'] || {};
                        for (var on in easyuis.AllOptions) //不覆盖模式 去填充通用属性
                            if (!curCon.options.hasOwnProperty(on)) curCon.options[on] = easyuis.AllOptions[on];
                    }
                }
        }
    },
    getControl: function (name) {
        if (!easyuis._controls) easyuis.getControls();
        return easyuis._controls.ens[name] || easyuis._controls.cns[name] || null;
    },
    getOption: function (el, option, controlName) {
        option['$typeName'] = controlName;
        option['$el'] = el;
        var con = easyuis.getControl(controlName);
        if (!con) return null;
        if (con.hasOwnProperty('options')) { //附加默认值
            for (let on in con.options) {
                if (!option.hasOwnProperty(on))
                    option[on] = con.options[on];
            }
        }
        if (el.attr('data-options')) {
            var oldOption = JSON.parse('{' + el.attr('data-options') + '}');
            for (let on in oldOption) {
                if (!option.hasOwnProperty(on))
                    option[on] = oldOption[on];
            }
            if (!option.validType) option.validType = [];
            if (oldOption.hasOwnProperty('min') && oldOption.hasOwnProperty('max')) {
                //处理数值类型时给设置的小一些
                option.validType.push(`range([${new Number(oldOption['min']) / 10},${new Number(oldOption['max']) / 10}])`);
                option['min'] = new Number(oldOption['min']) / 10;
                option['max'] = new Number(oldOption['max']) / 10;
            }
            //else if (oldOption.hasOwnProperty('min')) {
            //    _option.validType.push(`range([${oldOption['min']},${oldOption['max']}])`);
            //    debugger
            //}
            //else if (oldOption.hasOwnProperty('max')) {
            //    debugger
            //}
            el.attr('data-options', '');
        }
        if (option.hasOwnProperty('columns') && Array.isArray(option['columns'])) {
            option['columns'].forEach(arr => Array.isArray(arr) &&
                arr.forEach(col => { //解决bug宽度为string时的问题
                    if (typeof (col.width) === "string" && /^(\d|.).+$/.test(col.width))
                        col.width = parseInt(col.width);
                }));
        }
        if (option.multiple == true) {
            el.attr('multiple', 'true');
        }
        if (option['_url']) {
            let __url = option['_url'];
            delete option['_url'];
            $(() => el[controlName]({
                url: __url
            }));
        }
        return option;
    },
    setOption: function (el, option, controlName) {
        if (!(el instanceof $ && typeof (option) === "object")) return false;
        option['$el'] = el; //追加当前元素到option上
        if (typeof (controlName) === "string" && controlName) {
            el[controlName](easyuis.getOption(el, option, controlName));
            return el;
        } else
            el.length > 0 &&
            el[0].classList.forEach(_el => {
                var type = _el.replace('easyui-', '');
                if (type !== _el) {
                    el[type](easyuis.getOption(el, option, type));
                    return el;
                }
            });
        return null;
    },
    getValue: function (el, typeName) {
        let val = '';
        let isMultiple = el.attr('multiple') === 'multiple'; //多选的处理 多选的标签是通过自定义方式创建控件才有的
        try {
            try {
                val = $(el)[typeName](isMultiple ? 'getValues' : 'getValue');
            } catch (e) {
                val = $(el)[typeName]('options')['value'];
            }
        } catch (e) {
            throw '获取值失败！';
        }
        return val;
    },
    setValue: function (el, typeName, val) {
        try {
            try {
                $(el)[typeName]('setValue', val);
            } catch (e) {
                var obj = $(el)[typeName]('options');
                obj['value'] = val;
                $(el)[typeName](obj);
            }
        } catch (e) {
            throw '设置值失败！';
        }
    },
};
//自定义验证
$.extend($.fn.validatebox.defaults.rules, {
    reg: { //by sxr 正则验证支持存放正则表达式验证
        //使用规则  validType="reg['^[0-9a-zA-Z.-]+$']" []里第一个参数是正则表达式 第二个是错误消息
        validator: function (value, param) {
            var myreg = new RegExp(param[0]);
            var result = myreg.test(value);
            if (!result) {
                if (param.length > 1 && typeof param[1] === "string")
                    $.fn.validatebox.defaults.rules.reg.message = param[1];
                else
                    $.fn.validatebox.defaults.rules.reg.message = "必须是字母 数字及英文 ' - '  '.'";
            }
            return result;
        },
        message: "必须是字母 数字及英文 ' - '  '.'"
    }
});
//自定义编辑器
$.extend($.fn.datagrid.defaults.editors, {
    auto: {
        init: function (container, options) {
            let id = comFunc.getRandomStr(4, (str) => 'autoId' + str);
            options = comFunc.clone(options);
            options.controlName = id;
            let input = $(`<e_autoform_control id='${id}' :cdata='${JSON.stringify(options)}'></e_autoform_control>`).appendTo(container);
            let vue = new Vue({
                el: '#' + id,
            });
            input = container.find('input');
            $.parser.parse('#' + id);
            let mLen = 5;
            let op = {
                width: container.parents('td:eq(0)').width() - mLen,
                height: input.parents('td:eq(0)').height() + 2 - mLen,
                hasAllSelect: false,
                editIdx: container.parents('tr[datagrid-row-index]').attr('datagrid-row-index'),
                editField: container.parents('td[field]').attr('field')
            };
            if (typeof (options.initOption) === 'object') {
                for (let i in options.initOption) {
                    op[i] = options.initOption[i];
                }
            }
            easyuis.setOption(input, op);
            let e_func = new euiControl({
                el: input,
                option: op,
                typeName: op.$typeName
            });
            this.getValue = (target) => {
                try {
                    if (op.multiple) {
                        return e_func('getValues');
                    }
                    return easyuis.getValue(input, op.$typeName);
                } catch (e) {
                    return '';
                }
            };
            this.$typeName = op.$typeName;
            var isCombo = ['combo', 'combobox', 'combotree', 'combogrid'].indexOf(op.$typeName) !== -1;
            this.isCombo = isCombo;
            let combo = $(input).data('combo');
            let firstSetValCall = () => {
                if (combo) {
                    clearTimeout(window.__editShowPanel);
                    window.__editShowPanel =
                        setTimeout(() => input['combo']('showPanel'), 5);
                }
                this.getEl().focus();
                this.getEl().select();
            };
            this.setValue = (target, val) => {
                let fun = () => {
                    if (!e_func) return;
                    let fn = op.multiple && val ? 'setValues' : 'setValue';
                    if (op.$typeName === 'combobox') {
                        clearTimeout(window.__editSetVal);
                        window.__editSetVal =
                            setTimeout(() => {
                                try {
                                    easyuis.setValue(target, 'combobox', val); //可能会不支持多选
                                    //e_func(fn, val);
                                } catch (e) {}
                            }, 1);
                    } else e_func(fn, val);
                    if (firstSetValCall) {
                        firstSetValCall();
                        firstSetValCall = undefined;
                    }
                    this.getEl().focus();
                    this.getEl().select();
                }
                //fun();
                try {
                    fun();
                } catch (e) {}
            };
            this.destroy = (target) => {
                try {
                    if (isCombo) {
                        this.editorData = {
                            text: input['combo']('getText'),
                            val: this.getValue()
                        };
                    }
                    input[op.$typeName]('destroy');
                } catch (e) {
                    input['validatebox']('destroy');
                }
            };
            let ipt = $(input).next('span').find('input:not(:hidden)');
            if (ipt.length > 0) {
                ipt.focus();
                ipt.select();
                if (isCombo);
                //ipt[0].oninput = (e) => {
                //    //input[op.$typeName]('setText', e.target.value);
                //    //var url = input[op.$typeName]('options')['url'] || undefined;
                //    //input[op.$typeName]('reload', url);
                //    debugger
                //    input[op.$typeName]('grid').datagrid('load', {
                //        q: e.target.value,
                //        filter: e.target.value,
                //    });
                //};
            }
            this.getEl = () => ipt;
            return input;
        },
        resize: function (target, width) {
            var input = this.getEl();
            if ($.boxModel === true) {
                input.width(width - (input.outerWidth() - input.width()));
            } else {
                input.width(width);
            }
        }
    }
});
//combotree
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
});
(() => {
    window.lytClose = () => false;
    Date.prototype.AddDay = function (days) {
        days = typeof (days) === 'number' ? days : 0;
        var date1 = this,
            time1 = date1.getFullYear() + "-" + (date1.getMonth() + 1) + "-" + date1.getDate(); //time1表示当前时间
        var date2 = new Date(date1);
        date2.setDate(date1.getDate() + days);
        var time2 = date2.getFullYear() + "-" + (date2.getMonth() + 1) + "-" + date2.getDate();
        return time2;
    };
    Array.prototype.removeAt = function (Index) {
        if (isNaN(Index) || Index > this.length) {
            return false;
        }
        for (var i = 0, n = 0; i < this.length; i++) {
            if (this[i] != this[Index]) {
                this[n++] = this[i]
            }
        }
        /*//方案二
            let idx = 0;
                                if ((idx = rows.indexOf(row)) !== -1) {
                                    rows.splice(idx).splice(1).forEach(el => {
                                        rows.push(el);
                                    });
                                    rows.push(row);
                                    debugger
                                }
            */
        this.length -= 1
    }
})(); //一些类型的方法扩展
(() => { //装载layer 使页面必定有layer
    return;
    document.write('<link href="/Content/layer/theme/default/layer.css" rel="stylesheet" type="text/css" />');
    comFunc.loadJS('/Content/layer/layer.js', false);
})();

/***************************** vue 的扩展 ********************************************/

if (window['Vue'] === undefined) window['Vue'] = () => {};
if (window['Vue']['component'] === undefined) window['Vue']['component'] = () => {
    console.log('请先给页面引入Vue.js');
    window['Vue']['component'] = () => {};
};
let components = {
    gridsearchdiv: { //对该标签内的DOM进行监听 每当dom改变 就获取初始化时得到的一级元素id集合 遍历取这个集合的 值 放入load中
        template: '<div v-on:DOMSubtreeModified="DOMSubtreeModified"><slot></slot></div>',
        methods: {
            DOMSubtreeModified: function (e) {
                //当dom元素发生改变时触发
                var dgTableID = e.currentTarget.getAttribute('dgTableID');
                if (!dgTableID) return; //如果没有关联的TableID就不执行
                var _SearchForm = $(e.currentTarget).data('SearchForm');
                var loadSearchForm = function (el) {
                    var obj = {
                        ids: [],
                        names: [],
                        valObj: {}
                    };
                    $(el.innerHTML).each(function () {
                        obj.ids.push(this.id);
                        obj.names.push($(this).attr('name'));
                    });
                    obj.ids = obj.ids.filter(el => typeof (el) === "string" && el);
                    obj.names = obj.names.filter(el => typeof (el) === "string" && el);
                    $(el).data('SearchForm', obj);
                }; //初始化SearchForm
                var currentTarget = e.currentTarget;
                var __SearchFunc = () => {
                    var hasVal = false;
                    _SearchForm.ids.forEach(el => {
                        _SearchForm.valObj[el] = $('#' + el).val();
                        if ($('#' + el).val() + "") {
                            hasVal = true;
                        }
                        $(el).change(__SearchFunc);
                    });
                    var curVal = JSON.stringify(_SearchForm.valObj);
                    var oldVa = $(currentTarget).data('_SearchFormValObj');
                    if (oldVa === curVal) return;
                    $(currentTarget).data('_SearchFormValObj', curVal);
                    if (!hasVal) return;
                    if ($(dgTableID).datagrid) {
                        $(dgTableID).datagrid('load', _SearchForm.valObj);
                    }
                };
                if (!_SearchForm) {
                    loadSearchForm(e.currentTarget);
                    $(e.currentTarget).data('loadSearchForm', loadSearchForm); //如果后续有动态绑定 可以通过这个方式拿到loadSearchForm方法
                    _SearchForm = $(e.currentTarget).data('SearchForm');
                    return;
                } else {
                    if (typeof (__SearchFunc) !== "function") return;
                    $(e.currentTarget).data('SearchFuncID') + '' && clearTimeout($(e.currentTarget).data('SearchFuncID')); //清除前一次绑定的值
                    $(e.currentTarget).data('SearchFuncID', setTimeout(__SearchFunc, 500)); //500毫秒后执行查询方法
                }
            }
        }
    },
    gridtable: {
        template: '<table><slot></slot></table>'
    },
    //自动的控件
    e_autoform_control: {
        props: {
            notautoallownulltoall: String, //允许空控件自动变成全部选项
            cdata: Object,
        },
        data: function () {
            return {
                autoId: comFunc.getDomId(this)
            };
        },
        created: function () {
            delete this.cdata['vue'];
            var cdataJson = JSON.stringify(this.cdata);
            this.cdata['vue'] = this;
            top['euiControlTypeCache'] = top['euiControlTypeCache'] || {}; //缓存控件 根据cdataJson
            if (top['euiControlTypeCache'][cdataJson] && false) //如果缓存里面有 则不走运算分支 直接得到改变过的cdata
            { //缓存的data有问题 暂时注释 todo 时间2019年4月24日16:12:59
                for (var key in top['euiControlTypeCache'][cdataJson]) {
                    this.cdata[key] = top['euiControlTypeCache'][cdataJson][key];
                }
                this.cdata['vue'] = this;
                return;
            }
            //创建之前
            (() => {
                //构造控件的基础选项
                var cdata = this.cdata;
                if (cdata['controlName'] && typeof (cdata['controlName']) === "string" && cdata['controlName'].length >= 1)
                    cdata['controlName'] = comFunc.changeStrToBack(cdata['controlName']); //小驼峰命名
                cdata['vue'] = this;
                cdata['data-options'] = '"disabled":false';
                if (!cdata.allowNull) cdata['data-options'] += ',"required":true';
                if (!cdata.classStr) cdata.classStr = '';
                cdata.classStr += ' form-box';
                var getOption = (con) => {
                    if (!cdata.option) return '';
                    if (con instanceof euiControlType && con.options) {
                        try {
                            var optionObj = JSON.parse(cdata.option);
                            for (var on in con.options) {
                                if (!optionObj.hasOwnProperty(on)) optionObj[on.toLowerCase()] = con.options[on];
                            }
                            if (optionObj.hasOwnProperty('url')) {
                                optionObj['_url'] = optionObj['url'];
                                delete optionObj['url'];
                            }
                            cdata.option = JSON.stringify(optionObj);
                        } catch (e) {}
                    }
                    return "," + cdata.option.replace(/^(\s)?{(\s)?/, '').replace(/(\s)?}(\s)?$/, '');
                };
                //样式处理
                if (cdata.controlTypeName !== "无") {
                    switch (cdata.controlTypeName) {
                        case "复选框":
                            cdata['type'] = 'checkbox';
                            cdata.classStr = cdata.classStr.replace(/ form-box/gi, '');
                            break;
                        case "枚举下拉框":
                            cdata.classStr += ' auto easyui-combobox';
                            cdata['data-options'] += `,"valueField": "id","textField": "text"`;
                            cdata['data-options'] += getOption();
                            break;
                        case "多行文本框":
                            cdata.classStr += ' auto easyui-textbox';
                            cdata['data-options'] += ',"multiline":true';
                            break;
                        default:
                            var con = easyuis.getControl(cdata.controlTypeName);
                            if (con) {
                                cdata.classStr += ' ' + con.className;
                                if (con.isHtmlTag)
                                    cdata['data-options'] += getOption(con);
                            }
                            break;
                    }
                } else if (cdata.typeName === "String") {
                    cdata.classStr += ' auto easyui-textbox';
                } else if (["DateTime", "DateTime?"].indexOf(cdata.typeName) !== -1) {
                    cdata.classStr += ' auto easyui-datetimebox';
                } else if (["Boolean", "Boolean?"].indexOf(cdata.typeName) !== -1) {
                    cdata.classStr += ' auto easyui-combobox';
                    cdata['data-options'] += `,"valueField": "id","textField": "text"
                        ,"data":[{"id":"true","text":"是"},{"id":"false","text":"否"}]`;
                }
                if (cdata.defaultVal)
                    cdata['data-options'] += `,"value": "${cdata.defaultVal}"`;
                if (!Boolean(this.notautoallownulltoall) && cdata.allowNull)
                    cdata['data-options'] += `,"hasAllSelect": "true"`;
                if (cdata.classStr && cdata.classStr.indexOf('easyui-') !== -1) {
                    var mc = cdata.classStr.match(/ easyui-(.+?)$/);
                    if (mc.length > 0)
                        cdata.easyuiType = mc[1];
                }
                if (!cdata.hasOwnProperty('notlable')) cdata.notlable = false; //默认值
                //reg['^[0-9a-zA-Z.-]+$']
            })(); //改变选项
            top['euiControlTypeCache'][cdataJson] = this.cdata;
        },
        template: `
                    <img  v-if="cdata.controlTypeName==='图片'"
                        :alt="cdata.lableName" :id="cdata.controlName" :name="cdata.controlName"/>
                    <span v-else-if="cdata.isShow" :id="autoId">
                            <span v-if="cdata.notlable !== true" class="form-lb">{{cdata.controlTypeName==='图片'?'':cdata.lableName}}</span>
                            <input :validType="cdata.regExp" :type="cdata.type" :id="cdata.controlName" :name="cdata.controlName" :class="cdata.classStr"
                                :data-options="cdata['data-options']"/>
                            <slot></slot>
                    </span>
                    <input type="hidden" :name="cdata.controlName" v-else/>`
    },
    //自动的表单
    e_autoform: {
        liWidth: 280,
        rowShowCount: 2,
        rowWidth: function () {
            return (components.e_autoform.liWidth + 15) * components.e_autoform.rowShowCount;
        },
        classArr: ['', '', 'bigli'], //一行显示多个时对应的li的class 请忽视
        beforeCreate: function () {
            //准备工作
            let i = 'e_autoform_control';
            if ($(i).length === 0) {
                Vue.component(i, components[i]);
            }
        },
        props: {
            notautoallownulltoall: String, //允许空控件自动变成全部选项
            formurl: String,
            formfieldsort: Array,
            formfieldsortstr: String,
            showlist: String, //eg:[['模具分类','模具名称'],['模具编号','类型'],['使用状态','厂商 ','良品率']] 当页面每一行要显示的li个数不一样时可以使用它而放弃formfieldsort
        },
        data: function () {
            var _formfieldsort = [];
            try {
                if (!this.formfieldsort && this.formfieldsortstr) _formfieldsort = eval(this.formfieldsortstr);
                else _formfieldsort = this.formfieldsort;
            } catch (e) {
                ;
            }
            var url = this.formurl;
            if (!this.$attrs.rowshowcount) this.$attrs.rowshowcount = '';
            let controlsArr = [];
            var result = {
                autoId: comFunc.getDomId(this),
                fields: [],
                hideFields: [],
                rowShowCount: this.$attrs.rowshowcount + '', //设置一列显示几个
                classArr: components.e_autoform.classArr,
                controlsArr: controlsArr,
                rowSpacingStyle: 'height:5px;'
            };
            result.rowShowCount = parseInt(result.rowShowCount || components.e_autoform.rowShowCount);
            if (typeof (url) !== "string" || !url) return result;
            result.fields = comFunc.getModelByWindowAndUrl(window, url); //获取当前页面的模型
            _formfieldsort &&
                _formfieldsort.reverse().forEach(el => { //使顺序为传递过来的顺序
                    var findEl = result.fields.filter(_el => _el.lableName === el);
                    if (findEl.length === 1) {
                        var idx = result.fields.indexOf(findEl[0]);
                        result.fields.splice(idx, 1); //删除该元素
                        result.fields = [findEl[0]].concat(result.fields);
                    }
                });
            try {
                var c_arr = this.$slots.default[0].text.split('\n').filter(el => el.trim());
                var getFields = (txt) => result.fields.filter(el =>
                    txt === el.lableName || txt === el.controlName);
                let showFields = [];
                var hasField = false;
                for (let n = 0; n < c_arr.length; n++) {
                    let arr = [];
                    let matchArr = c_arr[n].trim().match((/\$.+?\$/gi));
                    for (let m = 0; m < matchArr.length; m++) {
                        let txt = matchArr[m].substring(1, matchArr[m].length - 1);
                        let getField = getFields(txt).filter(el => el.isShow === true);
                        if (getField.length === 1) {
                            getField[0].isShow = true;
                            arr.push(getField[0]);
                            showFields.push(getField[0]);
                            hasField = true;
                        } else {
                            comFunc.alert('请修改dto或使用字段名,匹配到了多个————' + txt);
                        }
                    }
                    if (arr.length > 0)
                        controlsArr.push(arr);
                }
                if (!hasField) throw '未匹配到可用内插值';
                result.hideFields = result.fields.filter(el => showFields.indexOf(el) === -1); //隐藏的控件组
                result.hideFields.forEach(el => el.isShow = false);
                result.fields = showFields; //显示的控件组
                result.ulClassStr = '';
                this.$slots.default[0].text = '';
            } catch (e) {
                result.hideFields = result.fields.filter(el => !el.isShow); //隐藏的控件组
                result.fields = result.fields.filter(el => el.isShow); //显示的控件组
                let showCount = result.fields.length;
                let rowCount = Math.ceil(showCount / result.rowShowCount);
                for (let n = 0; n < rowCount; n++) {
                    let arr = [];
                    for (let m = 0; m < result.rowShowCount
                        //在显示数量范围内
                        &&
                        m + n * result.rowShowCount < showCount; m++) {
                        arr.push(result.fields[m + n * result.rowShowCount]);
                    }
                    controlsArr.push(arr);
                }
                result.ulClassStr = result.rowShowCount - 1 < result.classArr.length ? 'list-unstyled' : '';
            }
            return result;
        },
        computed: {
            curModel: function () {
                var _obj = {};
                this.fields.concat(this.hideFields).forEach(el => {
                    if (el['controlName'] && el['lableName']) _obj[el['controlName']] = el['lableName'];
                });
                window['curModel'] = _obj;
                return _obj;
            }
        },
        template: `<div :id="autoId" class='e_autoform'>
                    <ul :class="ulClassStr">
                        <li :class="classArr[rowShowCount-1]" v-for="n in controlsArr.length" :key="n" style="">
                            <e_autoform_control :notautoallownulltoall=notautoallownulltoall v-for="m in controlsArr[n-1].length"  :key="m" :cdata="controlsArr[n-1][m-1]"></e_autoform_control>
                            <div v-if="n !== controlsArr.length" :style="rowSpacingStyle"></div>
                        </li>
                    </ul>
                    <div class="autoform-hides">
                        <e_autoform_control v-for="hideField in hideFields" :key="hideField.controlName" :cdata="hideField"></e_autoform_control>
                    </div>
                    <slot></slot>
                    </div>`,
        created: function () {
            this.$nextTick(function () {
                let needData = { //用非vue的时候 得把this转换成别的东西
                    $el: this.$el,
                    hasDefaultClass: Boolean(this.ulClassStr),
                    fields: this.fields,
                    hideFields: this.hideFields,
                    autoId: this.autoId,
                };
                let hasDefaultClass = needData.hasDefaultClass;
                let result = {
                    fields: needData.fields,
                    hideFields: needData.hideFields
                };
                let getControl, loadControls;
                let curId = needData.autoId;
                let _controls = {
                    cns: [],
                    ens: [],
                    els: [],
                    eui_funcs: []
                };
                let _ENControls = {};
                let _CNControls = {};
                //表单控件初始化
                $(() => {
                    needData.fields.concat(needData.hideFields).forEach(el => { //表单控件初始化
                        var _control = $('#' + curId + ' #' + el.controlName);
                        var func = undefined;
                        _controls.cns.push(el.lableName);
                        _controls.ens.push(el.controlName);
                        _controls.els.push(_control);
                        if (_control.length > 0 && _control[0].id !== curId && el.easyuiType) {
                            try {
                                func = new euiControl({
                                    el: _control,
                                    option: {},
                                    typeName: el.easyuiType
                                });
                                el.ControlFunc = func;
                                _ENControls[el.controlName] =
                                    _CNControls[el.lableName] = func;
                            } catch (e) {
                                console.log(e);
                            }
                            if (typeof (func) !== "function") {
                                console.log(`自动表单初始化控件失败`, $('#' + curId), _control);
                            } else {
                                el.created && el.created(func);
                            }
                        }
                        _controls.eui_funcs.push(func);
                    });
                });
                this.CNControls = _CNControls;
                this.ENControls = _ENControls;
                $(needData.$el).data('vue', this);
                let getIdxByName = (name) => {
                    let idx = _controls.ens.indexOf(name);
                    if (idx === -1)
                        idx = _controls.cns.indexOf(name);
                    return idx;
                };
                $(needData.$el).data('getControl', getControl = function (name, isShow) { //根据控件名或字段名获取对应元素
                    if (typeof (isShow) !== "boolean") isShow = true;
                    var idx = getIdxByName(name);
                    if (idx !== -1) {
                        return _controls.els[idx];
                    }
                });
                $(needData.$el).data('getControlFunc', function (name, isShow) { //根据控件名或字段名获取对应easyui方法
                    if (typeof (isShow) !== "boolean") isShow = true;
                    var idx = getIdxByName(name);
                    if (idx !== -1) {
                        var func = _controls.eui_funcs[idx];
                        if (typeof (func) !== "function") alert('警告：请注意您获取的方法未正确初始化！');
                        return func;
                    }
                });
                $(needData.$el).data('getControls', () => {
                    var cArr = [];
                    result.fields.forEach(el => el && el.controlName && cArr.push($('#' + curId + ' #' + el.controlName)));
                    return cArr;
                });
                loadControls = comFunc.get_loadControls(getControl, $(needData.$el).data('getControls')());
                $(needData.$el).data('loadControls', loadControls);

                if (!hasDefaultClass) { //没有默认样式时
                    //var liH = 30;
                    //$(needData.$el).find('ul').css({ 'height': '20px' });
                    //$(needData.$el).find('li').css({
                    //    'height': liH + 'px'
                    //});
                    $(needData.$el).find('li').find('span').css({
                        'margin-right': '10px'
                    });
                    //$(needData.$el).css({ 'height': (this.controlsArr.length * liH - 4) + 'px' });
                }
                //辅助翻译自动生成的控件变成与Vue无关的代码
                {
                    let fields = []; //克隆处理过的所有控件
                    let oNameArr = ['data-options', 'controlType', 'classStr', 'vue', 'regExp']; //不需要的属性
                    needData.fields.concat(needData.hideFields).forEach(_el => { //把option暴露在外层直接 用于初始化控件
                        let el = comFunc.clone(_el, undefined, (o) => {
                            if (o instanceof Vue) return null;
                        });
                        el['option'] = (new Function("return " + '{' + el['data-options'] + '}'))();
                        oNameArr.forEach(on => delete el[on]);
                        fields.push(el);
                    });

                    let isUseCN = false; //是否使用控件名作为属性名
                    let isUseHide = false; //是否保留隐藏域的内容
                    let needDataByClone = {
                        win: window, //保留window对象 用来认亲
                        shows: {},
                        hides: {},
                        formId: needData['autoId'],
                        isUseCN: isUseCN,
                        hasDefaultClass: needData['hasDefaultClass'],
                        outerHTMLTxt: needData.$el.outerHTML.replace(/ data\-options\=\"(.+?)\"/gi, ''),
                    };
                    let _pn = isUseCN ? 'lableName' : 'controlName';
                    fields.forEach(el => {
                        if (!isUseHide && !el['isShow']) {
                            needDataByClone[el['isShow'] ? 'shows' : 'hides'][el[_pn]] = {
                                __prop: {
                                    typeName: el['typeName'],
                                    controlName: el['controlName'],
                                    lableName: el['lableName']
                                }
                            };
                            return;
                        }
                        needDataByClone[el['isShow'] ? 'shows' : 'hides'][el[_pn]] = el['option'];
                        delete el['isShow'];
                        delete el['ControlFunc'];
                        delete el['notlable'];
                        let easyuiType;
                        if (el['easyuiType'])
                            el['easyuiType'] = el['easyuiType'].replace(' auto', '');
                        easyuiType = el['easyuiType'];
                        el['option']['__prop'] = el; //后台属性
                        if ($.fn[easyuiType])
                            for (let on in el['option']) {
                                if ((el['option']['__prop']['controlTypeName'] === '无' && on !== '__prop') ||
                                    $.fn[easyuiType].defaults[on] === el['option'][on]) {
                                    delete el['option'][on];
                                }
                            }
                        delete el['option'];
                    });
                    let cloneFunc = (obj) => { //克隆数据，同时有方法在里面则处理方法
                        let _funcs = [];
                        let addFuncProp = (func) => {
                            _funcs.push(func.toLocaleString());
                            return '$Func$' + (_funcs.length - 1) + '$Func$';
                        };
                        let findFunc = (obj) => { //遍历取得方法属性
                            if (typeof (obj) === 'object') {
                                for (let _i in obj) {
                                    if (typeof (obj[_i]) === 'function') obj[_i] = addFuncProp(obj[_i]);
                                    else findFunc(obj[_i]);
                                }
                            }
                        };
                        findFunc(obj);
                        let str = JSON.stringify(obj, null, "\t");
                        _funcs.forEach((e, idx) => {
                            str = str.replace('"$Func$' + idx + '$Func$"', e);
                        });
                        str = str.replace(/\\r\\n/gi, '\n');
                        return str;
                    };
                    let codeObj = {
                        dataArr: [needDataByClone],
                        comScriptTxt: `<html>
<head>
</head>
<body>
        <link href="/Content/bootstrap.min.css" rel="stylesheet" />
        <link href="/Content/EasyUI/themes/insdep/easyui.css" rel="stylesheet" />
        <link href="/Content/global/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
        <link href="~/Content/layer/theme/default/layer.css" rel="stylesheet" />
        <link href="/Content/layoutPlugin.css" rel="stylesheet" />
$$outerHTMLTxt$$
        <script src="/Content/global/plugins/jquery.min.js" type="text/javascript"></script>
        <script src="/Content/global/plugins/bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
        <script src="~/Content/layer/layer.js"></script>
        <script src="/Content/EasyUI/jquery.easyui.min.up.js"></script>
        <script src="~/Content/EasyUI/locale/easyui-lang-zh_CN.js"></script>
        <script src="~/Content/global/scripts/init.js"></script>
        <script src="/Content/global/scripts/jquery.extend.js"></script>
        <script src="/Content/global/scripts/Public.js"></script>
        <script src="~/Scripts/vue.js"></script>
        <script src="~/Scripts/easyUIByVueExten.js"></script>
        <script>
            window.load = function (data) {
                $(function () {
                    let selector = '#' + data.formId + ' ';
                    let els = [], fucs = [], cns = {}, ens = {};
                    for (let i in data.shows) {
                        let curEl = data.shows[i];
                        let _el = $(selector + '#' + i), _option = curEl, _tn = curEl['__prop']['easyuiType'];
                        _tn && _el[_tn](easyuis.getOption(_el, _option, _tn));//设置属性进行初始化
                        els.push(_el);//lableName
                        let _fc = function (op) {
                            if (!_el[_tn]) console.log(_el, _tn);
                            return _el[_tn] && _el[_tn].apply(_el, arguments);
                        };
                        fucs.push(_fc);
                        cns[curEl['__prop']['lableName']] = els.length - 1;
                        ens[curEl['__prop']['controlName']] = els.length - 1;
                        _el.data('getHasObjFunc', _fc);
                    }
                    let getControl, getControls;
                    $(selector).data('getControl', getControl = (field, isShow, formId, formName) => {
                        let idx = undefined;
                        if (cns.hasOwnProperty(field)) idx = cns[field];
                        if (ens.hasOwnProperty(field)) idx = ens[field];
                        return idx != undefined && els[idx];
                    });
                    $(selector).data('getControls', getControls = () => {
                        return els;
                    });
                    $(selector).data('loadControls', comFunc.get_loadControls(getControl, getControls()));
                    $(selector).data('vue', {
                        getVals: function () {
                            let validateResult = $(selector).form('validate');//验证
                            if (!validateResult) return null;
                            let _data = $.serializeObject(selector);
                            let idx = 0;
                            for (let i in data.shows) {
                                let el = data.shows[i]['__prop'];
                                if (el.controlTypeName === "复选框") {
                                    _data[el.controlName] = els[idx].prop("checked")
                                }
                                if (["Boolean", "Boolean?"].indexOf(el.typeName) !== -1) {
                                    _data[el.controlName] = eval(_data[el.controlName].toLowerCase());
                                }
                                idx++;
                            }
                            ['maxResultCount', 'skipCount'].forEach(el => delete _data[el]);//黑名单字段不返回
                            for (let i in data.hides) {
                                let el = data.hides[i]['__prop'];
                                !_data[el.controlName] && delete _data[el.controlName];//隐藏域不存在的值不提交
                            }
                            return _data;
                        },
                        setVals: function (obj) {
                            if (!obj) return $(selector).form('clear');
                            let idx = 0;
                            for (let i in data.shows) {
                                let el = data.shows[i]['__prop'];
                                if (el.controlTypeName === "复选框") {
                                    els[idx].prop("checked", data[el.controlName]);
                                }
                                if (["Boolean", "Boolean?"].indexOf(el.typeName) !== -1) {
                                    obj[el.controlName] = obj[el.controlName] + ''
                                }
                                if (el.easyuiType) fucs[idx]('setValue', obj[el.controlName]);
                                idx++;
                            }
                            $(selector).form('load', obj);
                        },
                    });
                });
            };
            let datas = {
$$dataScriptTxt$$
            };
            for (let id in datas) load(datas[id]);
        </script>
</body>
</html>`,
                        getHtml: function (isObj = false, _dataArr = null) { //如果需要返回一个对象 则isObj = true
                            let outerHTMLTxts = '',
                                dataScriptTxts = ''; //排版及输出代码
                            let arr = Array.isArray(_dataArr) && _dataArr.length > 0 ? _dataArr : this.dataArr;
                            Array.isArray(arr) && arr.forEach((el, idx) => {
                                outerHTMLTxts += `\n---------------------------------------------------------------【DIV：${el.formId}】------------------------------------------------------------------------------\n\t${el.outerHTMLTxt}\n`;
                                let _html = el.outerHTMLTxt;
                                delete el.outerHTMLTxt;
                                let ew = el.win;
                                delete el.win;
                                let rStr = cloneFunc(el).replace(/\n/gi, '\n\t\t\t\t\t');
                                el.win = ew;
                                if (idx !== 0) dataScriptTxts += `\n`;
                                dataScriptTxts += `//\t\t\t\t------------【Begin-DIV：${el.formId}】-------------\n\t\t\t\t${el.formId}:${rStr},\n//\t\t\t\t------------【End-DIV：${el.formId}】-------------`;
                                if (idx !== arr.length - 1) dataScriptTxts += `\n`;
                                el.outerHTMLTxt = _html;
                            });
                            console.log('如果需要进一步格式化，请打开链接 \n\t\t（不过这个格式化会把=> 变成 = > 使方法无法识别,以及科学计数法的e会增加空格而产生语法错误 请注意）\n\t\t https://tool.oschina.net/codeformat/js');
                            if (isObj) {
                                console.log(dataScriptTxts);
                                let _returnobj = {
                                    comScriptTxt: this.comScriptTxt,
                                    outerHTMLTxts: outerHTMLTxts,
                                    dataScriptTxts: dataScriptTxts,
                                };
                                return _returnobj;
                            }
                            return this.comScriptTxt.replace(/\$\$outerHTMLTxt\$\$/gi, outerHTMLTxts)
                                .replace(/\$\$dataScriptTxt\$\$/gi, dataScriptTxts);
                        },
                        changeHtml: (win) => { //win就是调用的window 不传递不能确认哪些对象是当前替换需要的
                            if (!win) return comFunc.alert('win就是调用的window 不传递不能确认哪些对象是当前替换需要的');
                            let ly = top['layer'] || layer || null;
                            if (!ly) return comFunc.alert('请先引用layer');
                            top.changeVal = (val) => {
                                let m = val.match(/\<\s?e_autoform.+?\>(\s?([^\<]+?)\s?)?\<\/\s?e_autoform\s?\>/g)
                                if (!m) return val;
                                let arrs = [];
                                debugger
                                for (let i = 0; i < m.length; i++) {
                                    let curTag = m[i];
                                    let _curid = eval(curTag.match(/\<\s?e_autoform.+?id=(.+?) /)[1]);
                                    let da = top["__codeObj"].dataArr.find(el => arrs.indexOf(el) === -1 &&
                                        el.win === win && el.formId === _curid);
                                    if (da) {
                                        arrs.push(da);
                                        val = val.replace(curTag, da.outerHTMLTxt);
                                    }
                                }
                                let htmlObj = top["__codeObj"].getHtml(true, arrs);
                                let htmM = htmlObj.comScriptTxt.match(/(\<script\>(.|\s)+\s?\<\/script\>)\s\<\/body\>/);
                                if (!htmM) return;
                                htmM = htmM[1].replace(/\$\$dataScriptTxt\$\$/gi, htmlObj.dataScriptTxts);
                                val = val.replace('<script src="~/Scripts/easyUIByVueExten.js"></script>', '<script src="~/Scripts/easyUIByVueExten.js"></script>\n\t\t\t\t\t' + htmM);
                                return val;
                            };
                            ly.open({
                                title: '模板代码转换',
                                area: ['1100px', '700px'],
                                content: `源代码：<textarea id="source"   cols="140"   rows="15"   style="OVERFLOW:   hidden"></textarea>
<br/><br/>
<a onclick="change()">转换</a>
<br/>
转换后：<textarea readonly id="code"   cols="140"   rows="15"   style="OVERFLOW:   hidden"></textarea>
<script>
function change(){
let val = document.getElementById('source').value;
if(top.changeVal) val = top.changeVal(val);
document.getElementById('code').value=val;
}
</script>
`
                            });
                        }
                    };
                    //组织个公共js，都调用它 然后尽量把html的属性挪到js来
                    top['__codeObj'] = top['__codeObj'] || {};
                    top['__codeObj']['dataArr'] = top['__codeObj']['dataArr'] || [];
                    let _dataArr = top['__codeObj']['dataArr'];
                    top['__codeObj'] = codeObj;
                    _dataArr = _dataArr.concat(codeObj.dataArr);
                    top['__codeObj']['dataArr'] = _dataArr;
                    if (_dataArr.length > 0)
                        console.warn("如果您需要，请使用\n\t\t top['__codeObj'].changeHtml(window) \n输入您的源码，即可自动变更成无vue模板版本\n注意，window必须是对应的window，如果您不懂怎么操作，\n建议不用主页面打开，改用路由的方式打开页面，再执行此方法");
                }
            });
        },
        methods: {
            getVals: function () {
                var validateResult = $('#' + this.autoId).form('validate'); //验证
                if (!validateResult) return null;
                var data = $.serializeObject('#' + this.autoId);
                this.fields.filter(el => el.controlTypeName === "复选框").forEach(el => data[el.controlName] = $(el.vue.$el).find('#' + el.controlName).prop("checked"));
                ['maxResultCount', 'skipCount'].forEach(el => delete data[el]); //黑名单字段不返回
                this.hideFields.forEach(el => !data[el.controlName] && delete data[el.controlName]); //隐藏域不存在的值不提交
                this.fields.filter(el => ["Boolean", "Boolean?"].indexOf(el.typeName) !== -1).forEach(el =>
                    data[el.controlName] = eval(data[el.controlName].toLowerCase())
                );
                return data;
            },
            setVals: function (obj) {
                this.fields.filter(el => ["Boolean", "Boolean?"].indexOf(el.typeName) !== -1).forEach(el =>
                    obj[el.controlName] = obj[el.controlName] + ''
                );
                if (obj) $('#' + this.autoId).form('load', obj);
                else $('#' + this.autoId).form('clear');
            }
        }
    },
    //自动的模态框
    e_dialog: {
        beforeCreate: function () {
            let i = 'e_autoform';
            if ($(i).length === 0) {
                Vue.component(i, components[i]);
            }
        },
        props: {
            title: String,
            formurl: String,
            formfieldsort: String,
            savefunc: String
        },
        data: function () {
            return {
                autoId: comFunc.getDomId(this),
                formfieldsortArr: eval(this.formfieldsort),
                eDialog: {},
                hasE_autoform: true,
                e_autoFormName: (this.$attrs['id'] || '') + '_autoForm'
            };
        },
        template: `<div :id="autoId">
                    <e_autoform :name=e_autoFormName :formurl='formurl' :formfieldsort='formfieldsortArr'></e_autoform>
                    <slot></slot>
                    <div class="dlg-mould-btns">
                        <span style="float: right">
                            <a v-on:click="btnSave" class="btn btn-success"><i class="fa fa-check"></i>保存</a>
                            <a v-on:click="btnClose" class="btn btn-primary"><i class="fa fa-close"></i>关闭</a>
                        </span>
                    </div>
                   </div>`,
        created: function () {
            this.$nextTick(function () { //此时模板已经被渲染上去
                var attrOption = this.$attrs["data-option"] || this.$attrs["dataoption"];
                try {
                    attrOption = JSON.parse(attrOption.replace(/'/gi, '"'));
                } catch (e) {
                    attrOption = undefined;
                }
                var id = '#' + this.autoId;
                var option = {
                    title: this.title || '新增/编辑',
                    width: this.$attrs.width || this.$el.style.width || components.e_autoform.rowWidth(),
                    height: this.$attrs.height || this.$el.style.height || undefined,
                    buttons: id + ' .dlg-mould-btns',
                    modal: true,
                    cache: false,
                };
                var el = $(id);
                var eCon = new euiControl({
                    el: el,
                    option: option,
                    typeName: 'dialog'
                });
                this.eDialog = el;
                eCon('close');
                el.data('vue', this);
                if (this.hasE_autoform) { //如果包含e_autoform
                    var children = this.$children;
                    var getControl, loadControls;
                    $(id).data('getControl', getControl = function (field, isShow, formId, formName) {
                        var e_autoforms = children.filter(el => el.$options._componentTag === "e_autoform" &&
                            ((!formId && !formName) || (el.$attrs.id === formId || el.$attrs.name === formName))
                        );
                        var results = [];
                        e_autoforms.forEach(el => {
                            if (typeof ($(el.$el).data('getControl')) === "function")
                                results.push($(el.$el).data('getControl')(field, isShow));
                        });
                        results = results.filter(el => el !== null && el !== undefined);
                        if (results.length === 0) return null;
                        else return results[0];
                    });
                    $(id).data('getControls', (formId, formName) => {
                        var e_autoforms = children.filter(el => el.$options._componentTag === "e_autoform" &&
                            ((!formId && !formName) || (el.$attrs.id === formId || el.$attrs.name === formName))
                        );
                        var results = [];
                        e_autoforms.forEach(el => {
                            if (typeof ($(el.$el).data('getControls')) === "function")
                                results.concat($(el.$el).data('getControls')());
                        });
                        results = results.filter(el => el !== null && el !== undefined);
                        if (results.length === 0) return null;
                        else return results;
                    });
                    loadControls = comFunc.get_loadControls(getControl, $(id).data('getControls')());
                    $(id).data('loadControls', loadControls);
                }
            });
        },
        methods: {
            btnSave: function () {
                if (this.hasE_autoform) { //如果包含e_autoform
                    var data = {},
                        hasNoValidate = false;
                    this.$children.forEach(el => {
                        if (el.$options._componentTag !== "e_autoform") return;
                        var _data = el.getVals();
                        if (!_data) hasNoValidate = true;
                        for (var i in _data) {
                            if (!data.hasOwnProperty(i)) data[i] = _data[i];
                        }
                    });
                    if (hasNoValidate) data = null;
                    comFunc.getFunc(this.savefunc)(data);
                }
            },
            btnClose: function () {
                this.eDialog.dialog('close');
            }
        }
    },
    init: function () {
        let componentVue = (i, obj) => {
            if ($(i).length === 0) return;
            else { //存在则注册并实例化组件
                Vue.component(i, obj);
                var ids = [];
                for (let j = 0; j < $(i).length; j++) {
                    var sel = $(i)[j].id;
                    if (!sel) { //不存在 则产生自动id来注册组件
                        sel = $(i)[j].id = comFunc.getRandomStr(4, (str) => 'autoId' + str);
                    }
                    ids.push("#" + sel);
                }
                ids.forEach(id => new Vue({
                    el: id
                }));
            }
        };
        this.init = () => {};
        for (let i in this) componentVue(i, this[i]);
    }
};
let vueHelps = {
    getColumns: (tag) => { //翻译vue用到的
        var cols = $(tag).datagrid('options').columns;
        var props = ['field', 'title', 'width', 'hidden', 'formatter', 'align', 'editor']
        var returnCols = [];
        cols.forEach(arr => {
            if (Array.isArray(arr) && arr.length > 0) {
                var _arr = [];
                returnCols.push(_arr);
                arr.forEach(a => {
                    if (typeof (a) != 'object') return;
                    var _obj = {};
                    _arr.push(_obj);
                    props.forEach(pn => {
                        if (pn == 'formatter' && typeof (a[pn]) != 'function') return;
                        if (a.hasOwnProperty(pn)) _obj[pn] = a[pn];
                        if (typeof (a[pn]) == 'function') {
                            //console.log(pn + '存在方法', a);
                        }
                        if (pn == 'editor');
                        //console.log('复制了编辑器，请检查是否包含方法！', a);
                    });
                });
            }
        });
        let cloneFunc = (obj) => { //克隆数据，同时有方法在里面则处理方法
            let _funcs = [];
            let addFuncProp = (func) => {
                _funcs.push(func.toLocaleString());
                return '$Func$' + (_funcs.length - 1) + '$Func$';
            };
            let findFunc = (obj) => { //遍历取得方法属性
                if (typeof (obj) === 'object') {
                    for (let _i in obj) {
                        if (typeof (obj[_i]) === 'function') obj[_i] = addFuncProp(obj[_i]);
                        else findFunc(obj[_i]);
                    }
                }
            };
            findFunc(obj);
            let str = JSON.stringify(obj); //, null, -1);
            _funcs.forEach((e, idx) => {
                str = str.replace('"$Func$' + idx + '$Func$"', e);
            });
            str = str.replace(/\\r\\n/gi, '\n');
            return str;
        };
        console.log(cloneFunc(returnCols));
    }
}
components.init();
console.log('代码github：   https://github.com/xianrui69/modelToVueControl/');
