<template>
  <div id="home">
    <nav-bar class="home-nav">
      <div slot="center">购物街</div>
    </nav-bar>
    <tab-control :titles="['流行','新款','精选']"
                 @tabClick="tabClick"
                 ref="tabControl1"
                 class="tab-control"
                 v-show="isTabFixed"></tab-control>
    <scroll class="content" ref="scroll"
            :probe-type="3"
            @scroll="contentscroll"
            :pull-up-load="true" @pullingUp="loadMore">
      <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad"></home-swiper>
      <recommend-view :recommends="recommends"></recommend-view>
      <feature-view></feature-view>
      <tab-control :titles="['流行','新款','精选']"
                   @tabClick="tabClick"
                   ref="tabControl2"></tab-control>
      <goods-list :goods="showGoods"></goods-list>
    </scroll>

    <back-top @click.native="backClick" v-show="isShowBackTop"></back-top>

  </div>

</template>

<script>

  import HomeSwiper from "./childComps/HomeSwiper";
  import RecommendView from "./childComps/RecommendView";
  import FeatureView from "./childComps/FeatureView";

  import NavBar from "../../components/common/navbar/NavBar";
  import TabControl from "../../components/content/tabControl/TabControl";
  import GoodsList from "../../components/content/goods/GoodsList";
  import Scroll from "../../components/common/scroll/Scroll";
  import BackTop from "../../components/content/backTop/BackTop";

  import {getHomeMultidata, getHomeData} from "network/home";
  import {debounce} from "../../common/utils";


  export default {
    name: "Home",
    components: {
      NavBar,
      HomeSwiper,
      RecommendView,
      FeatureView,
      TabControl,
      GoodsList,
      Scroll,
      BackTop,
    },
    data() {
      return {
        banners: [],
        recommends: [],
        goods: {
          'pop': {page: 0, list: []},
          'new': {page: 0, list: []},
          'sell': {page: 0, list: []}
        },
        currentType: 'pop',
        isShowBackTop: false,
        tabOffsetTop: 0,
        isTabFixed: false,
        saveY:0,
      }
    },
    computed: {
      showGoods() {
        return this.goods[this.currentType].list;
      }
    },
    activated() {
      this.$refs.scroll.refresh();
      this.$refs.scroll.scrollTo(0,this.saveY,0);

    }
    ,
    deactivated() {
      this.saveY = this.$refs.scroll.getScrollY();
    },
    created() {
      //1.请求多个数据
      this.getHomeMultidata()
      // 2.请求商品数据
      this.getHomeProducts('pop')
      this.getHomeProducts('new')
      this.getHomeProducts('sell')


    },
    mounted() {
      // 1.监听item中图片加载完成
      const refresh = debounce(this.$refs.scroll.refresh, 500);
      this.$bus.$on('itemImageLoad', () => {
        refresh()
      })
      // 2.获取tabControl的tabOffsetTop   所有组件都有一个$el 属性，用于获取组件中的元素
      // this.tabOffsetTop = this.$refs.tabControl.$el.offsetTop;
    },
    methods: {
      // 事件监听相关方法

      tabClick(index) {
        switch (index) {
          case 0 :
            this.currentType = 'pop';
            break;
          case 1:
            this.currentType = 'new';
            break;
          case 2:
            this.currentType = 'sell';
            break;
        }
        this.$refs.tabControl1.currentIndex = index;
        this.$refs.tabControl2.currentIndex = index;
      },
      backClick() {
        this.$refs.scroll.scrollTo(0, 0, 500);
      },
      contentscroll(position) {
        // 1.判断Backtop是否显示
        if (-position.y > 1000) {
          this.isShowBackTop = true;
        } else {
          this.isShowBackTop = false;
        }
        // 2.决定tabControl是否吸顶（position：fixed)
        this.isTabFixed = -position.y > this.tabOffsetTop
      },
      loadMore() {
        this.getHomeProducts(this.currentType)
      },
      swiperImageLoad() {
        this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop;
      },
      // 网络请求相关方法
      getHomeMultidata() {
        getHomeMultidata().then(res => {
          this.banners = res.data.banner.list;
          this.recommends = res.data.recommend.list;
        })
      },

      getHomeProducts(type) {
        getHomeData(type, this.goods[type].page + 1).then(res => {
          const goodsList = res.data.list;
          this.goods[type].list.push(...goodsList);
          this.goods[type].page += 1;

          this.$refs.scroll.finishpullUp();
        })
      }
    }
  }
</script>

<style scoped>
  #home {
    /*使用原生滚动时须加以下样式*/
    /*padding-top: 44px;*/
    height: 100vh;
    position: relative;
  }

  .home-nav {
    background-color: var(--color-tint);
    color: #ffffff;
    /*使用原生滚动时须加以下样式*/
    /*position: fixed;*/
    /*left: 0;*/
    /*right: 0;*/
    /*top: 0;*/
    /*z-index: 9;*/
  }


  .content {
    /*height: calc(100% - 93px);*/
    /*overflow: hidden;*/
    /*margin-top: 44px;*/
    position: absolute;
    top: 44px;
    bottom: 49px;
    left: 0;
    right: 0;
    overflow: hidden;

  }

  .tab-control {
    position: relative;
    z-index: 9;
  }
</style>
