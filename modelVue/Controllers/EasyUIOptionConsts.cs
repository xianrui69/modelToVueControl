using System;
using System.Collections.Generic;
using System.Text;

namespace System
{
    public class EasyUIOptionConsts
    {
        /// <summary>
        /// 商品选择 暂时使用固定值搜索 如果有后台接口能响应搜索 则使用 mode: 'remote',
        /// </summary>
        public const string Product_combogrid = @"{
                panelWidth: 450,
                url: '/api/Product/GetListByPage',
                queryParams: {
                    UseageList: [0,1,2,3]
                },
                mode: 'local',
                idField: 'id',
                textField: 'title',
                columns: [[
                 { field: 'id', hidden: true },
                 { field: 'idNo', title: '商品编号', align: 'center', width: '180' },
                 { field: 'title', title: '商品名称', align: 'center', width: '150' },
                 { field: 'useageName', title: '产品属性', align: 'center', width: 150 }
                ]]
            }";
    }
}

