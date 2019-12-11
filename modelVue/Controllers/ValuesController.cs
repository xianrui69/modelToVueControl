using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using modelToList;

namespace modelVue.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        [Route("/[controller]/[action]/{tn}")]
        [Route("/[controller]/[action]")]
        public ActionResult<object> Get(string tn)
        {
            var url = Request.Path.ToString();
            url = url.Substring(url.LastIndexOf("/") + 1);
            var keyVal = new Dictionary<string, List<Type>>();
            keyVal.Add("getSearchDto", new List<Type> { typeof(GetProductionPlanDetailsInput) });
            keyVal.Add("getSearchDto1", new List<Type> { typeof(GetProductionPlanDetailsInput) });
            return (GetPageTagOptionsByDto(tn, keyVal));
        }

        protected object GetPageTagOptionsByDto(string tn, Dictionary<string, List<Type>> keyValuePairs)
        {
            if (keyValuePairs == null) throw new Exception("调用错误");
            for (int i = 0, j = keyValuePairs.Keys.Count; i < j; i++)
            {
                if (keyValuePairs.Keys.ToArray()[i].ToLower() != keyValuePairs.Keys.ToArray()[i])
                {
                    keyValuePairs.Add(keyValuePairs.Keys.ToArray()[i].ToLower(), keyValuePairs.Values.ToArray()[i]);
                }
            }
            if (tn.IsNullEmpty())
            {
                var stackTrace = new System.Diagnostics.StackTrace();
                var pFunc = stackTrace.GetFrame(1).GetMethod();//上一级方法（调用当前方法的方法）
                                                               //前缀
                var str = "/" + new System.Text.RegularExpressions.Regex("Controller$").Replace(pFunc.DeclaringType.Name, "") +
                    "/" + pFunc.Name + "/";
                var urls = (keyValuePairs.Keys.ToArray().Clone() as string[]);
                Dictionary<string, object> allUrlReturns = new Dictionary<string, object> { };
                for (int i = 0; i < urls.Length; i++)
                {
                    var url = urls[i].ToLower();
                    if (allUrlReturns.ContainsKey((str + url).ToLower())) continue;
                    var list = ModelToControlPropsHelper.DtoToDialogOb(keyValuePairs[url]);
                    url = str + url;
                    allUrlReturns.Add(url.ToLower(), list);
                }
                return allUrlReturns;
            }
            if (keyValuePairs.ContainsKey(tn.ToLower()))
            {
                return ModelToControlPropsHelper.DtoToDialogOb(keyValuePairs[tn]);
            }
            else return new { Message = "未匹配到对应dto" };
        }

        #region
        private static object getProListObj = null;

        [HttpPost]
        [Route("/api/Product/GetListByPage")]
        public ActionResult<object> getProList()
        {
            #region 伪数据源
            if (getProListObj == null)
            {
                var rows = new List<object> { };
                for (int i = 0; i < 20; i++)
                {
                    rows.Add(new
                    {
                        id = Guid.NewGuid(),
                        idNo = "产品编号" + i,
                        title = "产品名称" + i,
                        useageName = i % 3,
                    });
                }
                return getProListObj = new { rows, total = 42 };
            }
            return getProListObj;
            #endregion 伪数据源
        }

        #endregion
    }

    public class GetProductionPlanDetailsInput
    {
        [Description("查询内容")]
        [ControlType(ControlTypeEnum.搜索框)]
        [ControlOption(@"{prompt: '工单号/工程单号/产品名称'}")]
        public new string Filter { get; set; }

        [Description("我是一个普通的字符串")]
        public string String { get; set; }

        [Required]//借助这个属性就可以必填
        [Description("我是一个普通的字符串，但我不能为空")]
        public string String1 { get; set; }

        [Description("我是日期类型")]
        public DateTime? Time { get; set; }

        [Description("我也是日期类型，但我不能为空")]
        public DateTime Time1 { get; set; }

        [Description("我是一个下拉框")]
        [ControlType(ControlTypeEnum.数据表格下拉框)]
        [ControlOption(EasyUIOptionConsts.Product_combogrid)]
        //选项的某个属性值可以被下面的选项覆盖
        //所以上面用了通用的、下面使用个性
        [ControlOption(@"queryParams: {
                    UseageList: [0, 1]
                }")]
        public Guid? Comboxgrid字段 { get; set; }

        [Description("我是一个下拉框(多选)")]
        [ControlType(ControlTypeEnum.数据表格下拉框)]
        [ControlOption(EasyUIOptionConsts.Product_combogrid)]
        //选项的某个属性值可以被下面的选项覆盖
        //所以上面用了通用的、下面使用个性
        [ControlOption(@"queryParams: {
                    UseageList: [0, 1]
                }")]
        public List<Guid> Comboxgrid字段1 { get; set; }

        [Display(Name = "我是一个隐藏字段，在页面是隐藏域")]
        [IsShow(false)]
        public Guid? 隐藏的字段 { get; set; }

        [Display(Name = "我是一个【可以为空的】有描述的枚举")]
        public 有描述的枚举? Enum1_1 { get; set; }

        [Display(Name = "我是一个【可以为空的】枚举，我没有有描述")]
        public 无描述的枚举? Enum1_2 { get; set; }

        [Display(Name = "我是一个【不可以为空的】有描述的枚举")]
        public 有描述的枚举 Enum2_1 { get; set; }

        [Display(Name = "我是一个【不可以为空的】枚举，我没有有描述")]
        public 无描述的枚举 Enum2_2 { get; set; }

        public enum 有描述的枚举
        {
            [Description("描述1")]
            option1 = -1,

            [Description("描述2")]
            option2 = 0,

            [Description("描述3")]
            option3 = 10,
        }

        public enum 无描述的枚举
        {
            option1 = -1,
            option2 = 0,
            option3 = 10,
        }
    }
}
