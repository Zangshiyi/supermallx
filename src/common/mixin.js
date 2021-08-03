import {debounce} from "./utils";
import BackTop from "../components/content/backTop/BackTop";

export const itemListenerMixin = {
  data(){
    return{
      itemImgListener: null,
    }
  },
  mounted() {
    // 1.监听item中图片加载完成
    const refresh = debounce(this.$refs.scroll.refresh, 500);
    // 对监听的事件进行保存
    this.itemImgListener = () => {
      refresh()
    }
    this.$bus.$on('itemImageLoad',this.itemImgListener)
  }
}

export const backTopMixin = {
  components:{
    BackTop,
  },
  data: function () {
    return {
      isShowBackTop: false
    }
  },
  methods: {
    backClick() {
      this.$refs.scroll.scrollTo(0, 0, 500);
    },
    listenShowBackTop(position){
      // 1.判断Backtop是否显示
      if (-position.y > 1000) {
        this.isShowBackTop = true;
      } else {
        this.isShowBackTop = false;
      }
    }
  }
}
