//index.js
const app = getApp()

const AV = require('../../libs/av-weapp-min');

const calendar = require('../../libs/calendar');

const utils = require('../../utils/util');

const holiday = require('../../utils/holidays')

const imgRoot = 'https://lg-rvf1ejrg-1252320429.cos.ap-shanghai.myqcloud.com'

// Global Veriables 
var touchDot = 0;
var time = 0;
var interval = "";
var pickMap = {};

Page({
  data: {
    today: calendar.Calendar.solar2lunar(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    ),
    poetry: {
      id: null,
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
      cover: "../assets/weapp-logo.jpg"
    },
    uu: false,
    loading: false,
    touching: false,
    progress: 0,
    calendar: [],
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  render (day, pid) {
    var day = new Date(day.getTime());
    
    var today = calendar.Calendar.solar2lunar(
      day.getFullYear(),
      day.getMonth() + 1,
      day.getDate()
    )

    var progress = utils.getProgress(today)

    if (Object.keys(app.globalData.poetrys).length > 0) {
      var item = this.pick(pid, today, app.globalData.poetrys)
      this.setPoetry(item)
    } else {
      app.poetrysCallback = poetrys => {
        var item = this.pick(pid, today, poetrys);
        this.setPoetry(item)
      }
    }
    
    // Holiday
    if (today.IMonthCn + today.IDayCn in holiday.lunarMap) {
      today.lunarDay = holiday.lunarMap[today.IMonthCn + today.IDayCn]
    }

    if (today.cMonth + '.' + today.cDay in holiday.solarMap) {
      today.solarDay = holiday.solarMap[today.cMonth + '.' + today.cDay]
    }

    this.setData({
      today: today,
      progress: progress
    })
  },

  setPoetry: function (item) {
    this.setData({
      'poetry.title': item.title,
      'poetry.cover': imgRoot + '/' + item.cover,
      'poetry.paragraphs': item.paragraphs,
      'poetry.author': item.author,
      'poetry.id': item.id
    })
  },

  pick: function (pid, today, poetrys) {
    var key = today.IMonthCn + today.IDayCn

    if (pid) {
      pickMap[key] = pid
      return poetrys[pid]
    }

    if (key in pickMap) {
      return poetrys[pickMap[key]]
    }

    var ids = Object.keys(poetrys)
    var id = ids[Math.floor(Math.random() * ids.length)]
    pickMap[key] = id

    return this.pick(pid, today, poetrys)
  },

  onLoad: function (options) {
    var day = new Date();
    var pid = null;
  
    if ('d' in options) {
      day = new Date(options.d);
    }

    if ('p' in options) {
      pid = options.p
    }

    app.globalData.current = day;
    this.render(day, pid)
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
    var d = utils.formatDate(app.globalData.current)
    var p = this.data.poetry.id;
    return {
      title: this.data.poetry.title + '·' + this.data.poetry.author,
      desc: this.data.poetry.paragraphs.slice(0, 4).join(''),
      path: '/pages/index/index?d=' + d + '&p=' + p,
      imageUrl: this.data.poetry.cover,
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
    this.setData({
      touching: true
    })
  
    // console.log("touchMove:" + touchMove + " touchDot:" + touchDot + " diff:" + (touchMove - touchDot));
    // 向上滑动  
    if (touchMove - touchDot <= -200 && time < 1000) {
      touchDot = touchMove;
      app.globalData.current.setDate(app.globalData.current.getDate() - 1)
      this.render(app.globalData.current)
    }
    // 向下滑动
    if (touchMove - touchDot >= 200 && time < 1000) {
      touchDot = touchMove;
      app.globalData.current.setDate(app.globalData.current.getDate() + 1)
      this.render(app.globalData.current)
    }
  },
  // 触摸结束事件
  touchEnd: function (e) {
    clearInterval(interval); // 清除setInterval
    time = 0;

    this.setData({
      touching: false
    })
  }
})
