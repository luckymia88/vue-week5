import { createApp } from  "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

const site = "https://vue3-course-api.hexschool.io/v2";
const apiPath = 'luckymia';

Object.keys(VeeValidateRules).forEach(rule => { //加入全部規則
    if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
  });

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證(邊寫邊判斷)
});

const productModal = {
  //當id變動時，取得遠端資料，並呈現modal
    props:['id', 'addToCart','openModal'],
    data(){
        return{
            modal:{},
            tempProduct:{},
            qty: 1,
        };
    },
    template:'#userProductModal',
    watch: { 
        id (){
            if(this.id){
                axios.get(`${site}/api/${apiPath}/product/${this.id}`)
            .then((res)=>{
                this.tempProduct = res.data.product;
                this.modal.show();
            })
            .catch((err)=>{
                alert(err.data.message);
            })
            }
        }
    },
    methods:{
        hide(){ //關閉modal
            this.modal.hide();
        }
    },
    //綁定到前面的樣式
    mounted(){
        this.modal = new bootstrap.Modal(this.$refs.modal);
        //監聽DOM 當modal關閉時 要清空id
        this.$refs.modal.addEventListener('hidden.bs.modal', event => {
            // do something...
            this.openModal(''); //清空id
          })
    }
};

const app = createApp({
    data(){
        return{
            products:[],
            productId:'',
            cart:{},
            loadingItem:'',
            form: {
                user: {
                  name: '',
                  email: '',
                  tel: '',
                  address: '',
                },
                message: '',
              },
        }
    },
    methods: {
        //取得產品列表
        getProducts(){
            axios.get(`${site}/api/${apiPath}/products/all`)
            .then((res)=>{
                this.products = res.data.products;
            })
            .catch((err)=>{
                alert(err.data.message);
            })
        },
        //取得id
        openModal(id){
            this.productId = id;
        },
        //加入購物車
        addToCart(product_id, qty = 1 ){ //未傳入參數時，為預設值
            const data = {
                product_id,
                qty,
            };
            axios.post(`${site}/api/${apiPath}/cart`, { data })
            .then((res)=>{
                alert(res.data.message);
                this.$refs.productModal.hide();
                this.getCarts();
            })
            .catch((err)=>{
                alert(err.data.message);
            })
        },
        //取得購物車
        getCarts(){
            axios.get(`${site}/api/${apiPath}/cart`)
            .then((res)=>{
                this.cart = res.data.data;
            })
            .catch((err)=>{
                alert(err.data.message);
            })
        },
        //更新購物車
        updateCarts(item){ // 會需要2種id : 購物車&產品
            const data = {
                product_id: item.product.id, //產品id
                qty: item.qty,
            }
            this.loadingItem = item.id;
            axios.put(`${site}/api/${apiPath}/cart/${item.id}`,{ data }) //購物車id
            .then((res)=>{
                this.getCarts();
                this.loadingItem = '';
            })
            .catch((err)=>{
                alert(err.data.message);
            })
        },
        //刪除單一品項
        deleteItem(item){ 
            this.loadingItem = item.id;
            axios.delete(`${site}/api/${apiPath}/cart/${item.id}`) 
            .then((res)=>{
                this.getCarts();
                this.loadingItem = '';
            })
            .catch((err)=>{
                alert(err.data.message);
            })
        },
        //清空購物車
        deleteCarts(item){ 
            axios.delete(`${site}/api/${apiPath}/carts`) 
            .then((res)=>{
                this.getCarts();
            })
            .catch((err)=>{
                alert(err.data.message);
            })
        },
        //建立訂單
        createOrder(){
            const order = this.form;
            axios.post(`${site}/api/${apiPath}/order`, {data: order}) 
            .then((res)=>{
                alert(res.data.message);
                 // $refs可抓到，內層元件內的 ref="form"。(resetFrom()為js內建方法)
                this.$refs.form.resetForm();
                this.getCarts();
            })
            .catch((err)=>{
                alert(err.message);
            })
        },
    },
    components:{
        productModal,
    },
    mounted() {
        this.getProducts();
        this.getCarts();
        //loading插件
        let loader = this.$loading.show();
        // simulate AJAX
        setTimeout(() => {
            loader.hide()
        }, 1000);
    },
});
app.use(VueLoading.LoadingPlugin);// 插件

app.component('VForm', VeeValidate.Form); 
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');