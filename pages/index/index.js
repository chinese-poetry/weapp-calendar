//index.js
//获取应用实例
const app = getApp()

const promisify = require('../../utils/promisify');

const AV = require('../../libs/av-weapp-min');

const calendar = require('../../libs/calendar');


const utils = require('../../utils/util');
const holiday = require('../../utils/holidays')

var touchDot = 0;
var time = 0;
var interval = "";

Page({
  data: {
    today: calendar.Calendar.solar2lunar(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    ),
    poetry: {
      title: "破阵子",
      paragraphs: ["燕子来时新社，",
        "梨花落后清明。",
        "池上碧苔三四点，",
        "叶底黄鹂一两声，",
        "日长飞絮轻。",
        "巧笑东邻女伴，",
        "采桑径里逢迎。",
        "疑怪昨宵春梦好，",
        "元是今朝斗草赢，",
        "笑从双脸生。"
      ],
      author: "晏殊",
      cover: "https://shici.store/huajianji/assets/images/thumb.jpg"
    },
    uu: false,
    loading: false,
    progress: 0,
    poetrys: [],
    calendar: [],
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  fetchAll () {
    
  },

  render (day) {
    var day = new Date(day.getTime());
    var results = this.data.poetrys;
    
    var query = new AV.Query('poetry')

    var today = calendar.Calendar.solar2lunar(
      day.getFullYear(),
      day.getMonth() + 1,
      day.getDate()
    )

    var progress = utils.getProgress(today)

    var vm = this;
  
    vm.setData({
      loading: true,
      progress: progress
    })

    query.find().then(function (results) {
      vm.setData({
        poetrys: results
      })

      var item = results[Math.floor(Math.random() * results.length)];
      vm.setData({
        'poetry.author': item.attributes.author,
        'poetry.title': item.attributes.title,
        'poetry.paragraphs': item.attributes.paragraphs,
        'poetry.cover': item.attributes.cover,
        'loading': false
      })
    })

    // Holiday
    if (today.IMonthCn + today.IDayCn in holiday.lunarMap) {
      today.lunarDay = holiday.lunarMap[today.IMonthCn + today.IDayCn]
    }

    if (today.cMonth + '.' + today.cDay in holiday.solarMap) {
      today.solarDay = holiday.solarMap[today.cMonth + '.' + today.cDay]
    }

    this.setData({
      today: today
    })

    var wds = utils.weekDays(day)
    for (var i in wds) {
      var solar = wds[i];
      var lunar = calendar.Calendar.solar2lunar(
        solar.getFullYear(),
        solar.getMonth() + 1,
        solar.getDate()
      )

      if (lunar.IDayCn === today.IDayCn) {
        lunar.today = true
      } else {
        lunar.today = false
      }

      var key = "calendar[" + i + "]"
      this.setData({
        [key]: lunar
      })
    }
  },

  onLoad: function (options) {
    if ('d' in options) {
      app.globalData.current = new Date(options.d);
    } else {
      app.globalData.current = new Date();
    }  

    this.render(app.globalData.current)
  },

  changeDate: function (e) {
    app.globalData.current = new Date(e.detail.value);
    this.render(app.globalData.current)
  },

  changeLayout: function (e) {
    this.setData({
      uu: !this.data.uu
    })
  },

  onShareAppMessage: function () {
    return {
      title: this.data.poetry.title,
      desc: this.data.poetry.paragraphs.slice(0, 4).join(''),
      path: '/pages/index/index?d=' + utils.formatDate(app.globalData.current)
    }
  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.render(app.globalData.current)
    wx.stopPullDownRefresh()
    wx.hideNavigationBarLoading()
  },


  touchStart: function (e) {
    touchDot = e.touches[0].pageY; // 获取触摸时的原点
    // 使用js计时器记录时间  
    interval = setInterval(function () {
      time++;
    }, 1000);
  },
  // 触摸移动事件
  touchMove: function (e) {
    var touchMove = e.touches[0].pageY;
    // console.log("touchMove:" + touchMove + " touchDot:" + touchDot + " diff:" + (touchMove - touchDot));
    // 向左滑动  
    if (touchMove - touchDot <= -150 && time < 1000) {
      touchDot = touchMove;
      app.globalData.current.setDate(app.globalData.current.getDate() - 1)
      this.render(app.globalData.current)
    }
    // 向右滑动
    if (touchMove - touchDot >= 150 && time < 1000) {
      touchDot = touchMove;
      app.globalData.current.setDate(app.globalData.current.getDate() + 1)
      this.render(app.globalData.current)
    }
  },
  // 触摸结束事件
  touchEnd: function (e) {
    clearInterval(interval); // 清除setInterval
    time = 0;
  }
})
