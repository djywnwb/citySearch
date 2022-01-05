// 1. 获取数据库引用
const db = wx.cloud.database()
Page({
    data: {
        // 遮罩层是否显示
        maskstate: false,
        // 当前选择步骤 0 省份 1城市 2区县
        choose: 0,
        //准备数据
        // 省份
        province: [],
        // 省份缓存备份
        provincebackup: [],
        //城市
        cities: [],
        //区县
        county: [],
        // 表单内容
        value: '',
        // 分页器
        page: 0,
        // 省份数据请求完毕 以后不再获取 节流阀
        provinceflag: false,
        // 城市数据请求完毕 以后不再获取 节流阀
        citiesflag: false,
        // 上拉刷新事件 节流阀  避免重复触发
        pull: false,
        clickSearch: '',
        // 搜索关键字
        query: '',
        // 控制搜索按钮状态
        onquery: true,
        end: false,
        inputval: '',
        // 按钮时间节流阀
        btntimer: null

    },
    // 点击按钮请求数据 并弹出mask 
    popupmask() {
        // 弹出遮罩层 
        this.setData({
            maskstate: true,
            pull: true
        })
        // 获取数据
       this.getData()

    },
    // 获取数据
    getData(callback) {
         // 判断省份数据书否请求完毕  没有则继续获取数据 
        if (!this.data.provinceflag) {
            let that = this
            // 请求15条省会数据（总共34条数据）
            db.collection('citys').skip(15 * this.data.page).limit(15).get({
                success: function (res) {
                    that.setData({
                        // 请求完毕后保存数据
                        province: [...that.data.province, ...res.data],
                        provincebackup: [...that.data.province, ...res.data],
                        // 修改分页器
                        page: that.data.page + 1,
                        // 返回的数据如果小于15个 证明已经获取完全部数据 打开节流阀 不再发起请求
                        provinceflag: res.data.length < 15 ? true : false,
                        // 显示结束
                        end: res.data.length < 15 ? true : false,
                        // 上拉刷新
                        pull: false
                    })
                    callback()
                }
            })
        }

    },
    // 获取下页数据
    lodingData() {
        // 数据获取完毕上拉刷新阀门就不再打开
        if (!this.data.pull) {
            // 判断获取什么数据
            if (this.data.choose === 0) {
                this.getData()
            } 

        }
    },
    // 用户选择省份 并跳转到下一页
    getprovince(e) {
        // 接收传参
        const provinces = e.target.dataset.province.areaList
        const val = e.target.dataset.province.name
        console.log(val);
        this.setData({
            choose: 1,
            value: val,
            cities: provinces,
            query: '',
            inputval: ''
        })
    },
    // 用户选择地市 并跳转到下一页
    getcities(e) {
        const cities = e.target.dataset.cities.areaList
        const val = e.target.dataset.cities.name
        console.log(val);
        this.setData({
            choose: 2,
            value: this.data.value + val,
            county: cities,
            query: '',
            inputval: ''
        })
    },
    // 用户选择区县 关闭弹出层
    getcounty(e) {
        const val = e.target.dataset.county.name
        console.log(val);
        this.setData({
            value: this.data.value + val,
            maskstate: false,
            // 重置选择框顺序
            choose: 0,
            query: '',
            inputval: ''
        })
    },
    // 关闭按钮
    shutDown() {
        this.setData({
            value: '',
            maskstate: false,
            // 重置选择框顺序
            choose: 0,
            inputval: '',
            query: '',
            province: this.data.provincebackup
        })
    },
    // 点击搜索
    clickSearch() {
        if (!this.data.btntimer) {
            console.log(2);
            // 用户第一次直接点击搜索 需要先获取剩余数据
            if (this.data.choose === 0) { //搜索省份时执行的操作
                if (!this.data.provinceflag) {
                    // 还未获取完毕数据
                    this.getData(() => {
                        // 再次调用搜索事件，直到数据获取完毕，执行搜索逻辑
                        this.clickSearch()
                    })
                } else {
                    // 数据获取完毕后可搜索，并打开时间节流阀，限制一秒内点击次数
                    this.setData({
                        // 一秒后打开时间节流阀
                        btntimer: setTimeout(() => {
                            this.setData({
                                btntimer: null
                            })
                        }, 1000),
                        // 获得搜索关键字
                        query: this.data.clickSearch
                    })
                    // 搜索逻辑
                    // 遍历数组 过滤关键字
                    let arr = []
                    let province = this.data.provincebackup
                    province.forEach(item => {
                        let str = item.name
                        if (str.indexOf(this.data.query) !== -1) {
                            arr.push(item)
                        }
                    });
                    this.setData({
                        province: arr
                    })
                    // console.log('搜索关键字：', this.data.query);
                    // console.log('搜索结果：', arr);
                }
            }
        }


    },
    // 按钮禁用控制
    isquery(e) {
        // 用户触发键盘事件
        this.setData({
            clickSearch: e.detail.value,
            onquery: e.detail.value === '' ? true : false,
        })
        if (this.data.choose === 0) {
            this.setData({
                // 如果表单为空还原备份（得要搜索过，query里有值）
                province: e.detail.value === '' && this.data.query !== '' ? this.data.provincebackup : this.data.province,
            })
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {},

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})