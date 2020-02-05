const AV = require('leanengine')
const moment=require('moment');
moment.locale('zh-cn');

function fetchUCData() {
  var request = require('sync-request');
  let url = "https://iflow-api.uc.cn/feiyan/list?trend=0&iflow=1";
  var res = request('GET', url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
      'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-encoding':'gzip, deflate, br'
    }
  });

  var user = JSON.parse(res.getBody('utf8'));
  let fetchData = {
    'sure_cnt': user.data.iflow.sure_cnt,
    'like_cnt': user.data.iflow.like_cnt,
    'die_cnt': user.data.iflow.die_cnt,
    'cure_cnt': user.data.iflow.cure_cnt,
    'statisEndTimeStr':user.data.iflow.statisEndTime,
  }
  // // console.log(res.getBody('utf8'));
  // console.log(JSON.stringify(fetchData));
  saveToLean(fetchData)
  return 'OK';
}

async function saveToLean(fetchData) {
  let query = new AV.Query('FeiyanData');
  query.equalTo('statisEndTimeStr', fetchData.statisEndTimeStr);
  let todos = await query.find();
  if( todos.length > 0) {
    console.log('已存在');
  } else {
    // 构建对象
    var Todo = AV.Object.extend('FeiyanData');
    var todo = new Todo();
    // todo = { ...todo,...fetchData}
    todo.set('sure_cnt', fetchData.sure_cnt);
    todo.set('like_cnt', fetchData.like_cnt);
    todo.set('die_cnt', fetchData.die_cnt);
    todo.set('cure_cnt', fetchData.cure_cnt);
    todo.set('statisEndTimeStr', fetchData.statisEndTimeStr);
    let fullDate = '2020-' +fetchData.statisEndTimeStr
    todo.set('statisEndTime', new Date(fullDate))
    console.log('新增');
    return await todo.save();
  }
}

// 将截止到今天的数据汇总
async function sumData() {
  // 得到最后统计日期
  let query = new AV.Query('FeiyanSumData');
  query.descending('statisEndDate');
  query.limit(1);
  let todos = await query.find();
  let lastDateStr = '2020-01-01' 
  if( todos.length > 0) {
    lastDateStr = todos[0].get('statisEndDate')
  }

  let startTime = '00:00:00'
  // let endTime = '23:59:59'

  let query2 = new AV.Query('FeiyanData');
  let lastDate = new Date(`${lastDateStr} ${startTime}`)
  let now = new Date()

  query2.greaterThanOrEqualTo('statisEndTime',lastDate)
  query2.lessThanOrEqualTo('statisEndTime',now)
  query2.descending('statisEndTime');
  let feiyanDataArray = await query2.find()

  let preDate = ''
  for (let index = 0; index < feiyanDataArray.length; index++) {
    const element = feiyanDataArray[index];
    let currentDate = element.get('statisEndTime')
    let t1=moment(currentDate).format('YYYY-MM-DD');
    if(t1 !== preDate) {
      preDate = t1;
      let query3 = new AV.Query('FeiyanSumData');
      query3.equalTo('statisEndDate',preDate)
      let result =  await query3.find()
      let newSumData 
      if (result.length>0) {
        newSumData = result[0]
        console.log('更新');
      } else {
        // 构建对象
        var Todo = AV.Object.extend('FeiyanSumData');
        newSumData = new Todo();
        console.log('新增');
      }

      newSumData.set('sure_cnt', element.get('sure_cnt'));
      newSumData.set('like_cnt', element.get('like_cnt'));
      newSumData.set('die_cnt', element.get('die_cnt'));
      newSumData.set('cure_cnt', element.get('cure_cnt'));
      newSumData.set('statisEndDate', preDate);
      await newSumData.save();
    }
  }
}

exports.fetchUCData = fetchUCData;
exports.sumData = sumData;