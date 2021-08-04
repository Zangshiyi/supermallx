<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"></detail-nav-bar>
    <scroll class="content" ref="scroll"
            :data="[topImage, goods, shop, detailInfo, paramInfo, commentInfo, recommendList]"
            :probe-type="3"
            @scroll="contentScroll">
      <detail-swiper :top-images="topImage"></detail-swiper>
      <detail-base-info :goods="goods"></detail-base-info>
      <detail-shop-info :shop="shop"></detail-shop-info>
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"></detail-goods-info>
      <detail-param-info :param-info="paramInfo" ref="params"></detail-param-info>
      <detail-comment-info ref="comment" :comment-info="commentInfo"></detail-comment-info>
      <detail-recommend-info ref="recommend" :recommend-list="recommendList"></detail-recommend-info>
    </scroll>
    <detail-bottom-bar @addToCart="addToCart"></detail-bottom-bar>
    <back-top @click.native="backClick" v-show="isShowBackTop"></back-top>
<!--    <toast :message="message" :show="show"></toast>-->
  </div>
</template>

<script>

  import DetailNavBar from "./childComps/DetailNavBar";
  import DetailSwiper from "./childComps/DetailSwiper";
  import DetailBaseInfo from "./childComps/DetailBaseInfo";
  import DetailShopInfo from "./childComps/DetailShopInfo";
  import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
  import DetailParamInfo from "./childComps/DetailParamInfo";
  import DetailCommentInfo from "./childComps/DetailCommentInfo";
  import DetailRecommendInfo from './childComps/DetailRecommendInfo';
  import DetailBottomBar from "./childComps/DetailBottomBar";
  import BackTop from "../../components/content/backTop/BackTop";

  import Scroll from "../../components/common/scroll/Scroll";

  import {getDetail, Goods, Shop, GoodsParam, getRecommend} from "../../network/detail";
  import {debounce} from "../../common/utils";
  import {itemListenerMixin, backTopMixin} from "../../common/mixin";

  import {mapActions} from 'vuex';

  // import Toast from "../../components/common/toast/Toast";


  export default {
    name: "Detail",
    components: {
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      Scroll,
      DetailGoodsInfo,
      DetailParamInfo,
      DetailCommentInfo,
      DetailRecommendInfo,
      DetailBottomBar,
      BackTop,
      // Toast,
    },
    mixins: [itemListenerMixin, backTopMixin],
    data() {
      return {
        iid: null,
        topImage: [],
        goods: {},
        shop: {},
        detailInfo: {},
        paramInfo: {},
        commentInfo: {},
        recommendList: [],
        themeTopYs: [],
        // getThemeTopY:null,
        currentIndex: 0,
        // message:'',
        // show:false,

      }
    },
    created() {
      // 1.保存传入的iid
      this.iid = this.$route.params.iid
      // 2.根据iid请求详情数据
      getDetail(this.iid).then(res => {
        // 1.获取顶部图片轮播数据
        const data = res.result;
        this.topImage = data.itemInfo.topImages;
        // 2.获取商品信息
        this.goods = new Goods(data.itemInfo, data.columns, data.shopInfo.services);
        // 3.创建店铺信息的对象
        this.shop = new Shop(data.shopInfo);
        // 4.保存商品的详情数据
        this.detailInfo = data.detailInfo;
        // 5.获取参数信息
        this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule);
        // 6.保存评论信息
        if (data.rate.list) {
          this.commentInfo = data.rate.list[0];
        }
        // 7.保存推荐信息
        this._getRecommend();
        // this.$nextTick(()=>{
        //   //根据最新的数据，对应的DOM已经被渲染出来了，但是图片依然没有加载完，（目前获取到的offsetTop不完全包含其中的图片）
        //   this.themeTopYs = [];
        //   this.themeTopYs.push(0);
        //   this.themeTopYs.push(this.$refs.params.$el.offsetTop);
        //   this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
        //   this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
        // })

        // 给getThemeTopY赋值（对给this.themeTopYs赋值的操作进行防抖）
        // this.getThemeTopY = debounce(()=>{
        //   this.themeTopYs = [];
        //   this.themeTopYs.push(0);
        //   this.themeTopYs.push(this.$refs.params.$el.offsetTop);
        //   this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
        //   this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
        // }，200)
      })
    },
    mounted() {

    },
    destroyed() {
      // 1.取消全局事件监听
      this.$bus.$off('itemImageLoad', this.itemImgListener)
    },
    methods: {
      ...mapActions(['addCart']),
      imageLoad() {
        this.$refs.scroll.refresh();
        //根据最新的数据，对应的DOM已经被渲染出来了，但是图片依然没有加载完，（目前获取到的offsetTop不完全包含其中的图片）
        this.themeTopYs = [];
        this.themeTopYs.push(0);
        this.themeTopYs.push(this.$refs.params.$el.offsetTop);
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);
        // console.log(this.themeTopYs);
      },
      _getRecommend() {
        getRecommend().then((res, error) => {
          if (error) return
          this.recommendList = res.data.list
        })
      },
      titleClick(index) {
        this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 200);
      },
      contentScroll(position) {
        // 1.获取Y值
        let length = this.themeTopYs.length;
        const positionY = -position.y;
        // 2.position值与主题中值对比
        for (let i = 0; i < length; i++) {
          if (this.currentIndex !== i && ((i < length - 1 && positionY >= this.themeTopYs[i] && positionY < this.themeTopYs[i + 1]) || (i === length - 1
            && positionY >= this.themeTopYs[i]))) {
            this.currentIndex = i;
            this.$refs.nav.currentIndex = this.currentIndex;
          }
        }
        // 2.是否显示回到顶部
        this.listenShowBackTop(position)
      },
      addToCart() {
        // 1.获取到购物车需要展示的信息添加
        const product = {};
        product.image = this.topImage[0];
        product.title = this.goods.title;
        product.desc = this.goods.desc;
        product.price = this.goods.realPrice;
        product.iid = this.iid;
        // 2.将商品添加到购物车里面
        // this.$store.commit('addCart',product)
        // this.addCart(product).then(res=>{
        //   console.log(res);
        // })
        this.$store.dispatch('addCart',product).then(res=>{
          // this.show = true;
          // this.message = res;
          // setTimeout(()=>{
          //   this.show = false;
          //   this.message = '';
          // },1500)
          this.$toast.show(res,2000);
        })

      },
    },

  }
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 9;
    background-color: #fff;
    height: 100vh;
  }

  /*.content {*/
  /*  height: calc(100% - 44px);*/
  /*}*/
  .content {
    position: absolute;
    top: 44px;
    bottom: 60px;
    overflow: hidden;
  }

  .detail-nav {
    position: relative;
    z-index: 9;
    background-color: #fff;
  }
</style>
