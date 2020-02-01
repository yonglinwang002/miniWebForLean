const AV = require('leanengine')

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

exports.fetchUCData = fetchUCData;