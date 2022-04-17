const TARGET_URL_GETCATEGORY = TARGET_URL + "?p1=getcat";
const TARGET_URL_GETLASTHISTORY = TARGET_URL + "?p1=gethis&p2=";

// ---------------------------------------------------------
// Vue
// ---------------------------------------------------------
var app = new Vue({
    el: '#app',
    vuetify: new Vuetify({
      theme: { dark: true },
    }),
    data: () => ({
      EncryptedActiveUser: '',
      activeUser: '',
      IsSignined: false,
      selected: [],
      stockerList: [],
      categoryList: [],
      loading: true,
      undoLoading: false,
      createDialog: false,
      addDialog: false,
      subDialog: false,
      deleteDialog: false,
      editDialog: false,
      undoDialog: false,
      historyText: '読み込み中…',
      operationText: '',
      lastBuyDateMenuCreate: false,
      lastBuyDateMenuAdd: false,
      lastBuyDateMenuEdit: false,
      lastUnsealDateMenuCreate: false,
      lastUnsealDateMenuSub: false,
      lastUnsealDateMenuEdit: false,
      snackbar: false,
      snackbarText: '',
      isUndoConfirmDisabled: true,
      timeout: 2000,
      overlay: false,
      search: '',
      drawer: false,
      headers: [
        { text: '品名', value: 'StockerName' , groupable: false},
        { text: '分類', value: 'Category' , groupable: true},
        { text: '個数', value: 'StockCount' , groupable: false},
        { text: '閾値', value: 'NotifyThreshold', sortable: false, groupable: false},
        { text: '操作', value: 'actions', sortable: false , groupable: false},
        { text: '', value: 'data-table-expand', sortable: false , groupable: false},
      ],
      editedIndex: -1,
      editedItem: {
        StockerID: '',
        TargetStockerName: '',
        StockerName: '',
        StockCount: 0,
        Category: '',
        LastBuyDate: (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10),
        LastBuyDateDisplay: (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10).replace(/-/g, '/'),
        LastUnsealDate: (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10),
        LastUnsealDateDisplay: (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10).replace(/-/g, '/'),
        NotifyThreshold: 0,
      },
      defaultItem: {
        StockerID: '',
        TargetStockerName: '',
        StockerName: '',
        StockCount: 0,
        Category: '',
        LastBuyDate: (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10),
        LastBuyDateDisplay: (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10).replace(/-/g, '/'),
        LastUnsealDate: (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10),
        LastUnsealDateDisplay: (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10).replace(/-/g, '/'),
        NotifyThreshold: 0,
      },
      historyItem: {
        StockerID: '',
        OperationID: ''
      },
      numberItems: [1,2,3,4,5],
      numberItemsInclZero: [0,1,2,3,4,5],
      operationConvert: {
        push:   '追加',
        pop:    '使用',
        edit:   '編集'
      }
    }),

    watch: {
      createDialog (val) {
        val || this.closeCreateDialog()
      },
      addDialog (val) {
        val || this.closeAddDialog()
      },
      subDialog (val) {
        val || this.closeSubDialog()
      },
      deleteDialog (val) {
        val || this.closeDeleteDialog()
      },
      editDialog (val) {
        val || this.closeEditDialog()
      },
      undoDialog (val) {
        val || this.closeUndoDialog()
      }
    },

    created: function(){
      this.initialize()
    },

    mounted: function(){
      google.accounts.id.initialize({
        client_id: '722523810740-kvfntbt85sa0lcmi069vt68255fb5bu2.apps.googleusercontent.com',
        callback: data => this.handleCredentialResponse(data),
        ux_mode: 'popup',
        context: 'signin'
      });
      google.accounts.id.prompt();
    },

    methods: {
      async initialize () {
        let vm = this
        vm.loading = true
        await axios.get(TARGET_URL_GETCATEGORY)
          .then(response => {
            vm.categoryList = response.data
          });
        await axios.get(TARGET_URL)
          .then(response => {
            vm.stockerList = response.data
          })
          .finally(() => vm.loading = false)
      },

      parseJwt(tk) {
        var base64Url = tk.split('.')[1];
         var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      },

      handleCredentialResponse(resp){
        var json = this.parseJwt(resp.credential);
        var email = json.email;
        this.activeUser = email;
        this.EncryptedActiveUser = window.btoa(this.activeUser);
        this.IsSignined = true;
        this.snackbarText = 'ログインしました';
        this.snackbar = true;
      },

      formatDate(date, mode) {
        if (!date) return null;
        const [year, month, day] = date.split("-");

        switch (mode) {
          case 'LastBuyDateCreate':
            this.editedItem.LastBuyDateDisplay = `${year}/${month}/${day}`;
            this.lastBuyDateMenuCreate = false;
            break;
          case 'LastUnsealDateCreate':
            this.editedItem.LastUnsealDateDisplay = `${year}/${month}/${day}`;
            this.lastUnsealDateMenuCreate = false;
            break;
          case 'LastBuyDateAdd':
            this.editedItem.LastBuyDateDisplay = `${year}/${month}/${day}`;
            this.lastBuyDateMenuAdd = false;
            break;
          case 'LastUnsealDateSub':
            this.editedItem.LastUnsealDateDisplay = `${year}/${month}/${day}`;
            this.lastUnsealDateMenuSub = false;
            break;
          case 'LastBuyDateEdit':
            this.editedItem.LastBuyDateDisplay = `${year}/${month}/${day}`;
            this.lastBuyDateMenuEdit = false;
            break;
          case 'LastUnsealDateEdit':
            this.editedItem.LastUnsealDateDisplay = `${year}/${month}/${day}`;
            this.lastUnsealDateMenuEdit = false;
            break;
        }
        return;
      },

      addStock (item) {
        this.editedIndex = this.stockerList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.editedItem.StockCount = 1
        this.editedItem.LastBuyDate = (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10)
        this.editedItem.LastBuyDateDisplay = (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10).replace(/-/g, '/')
        this.addDialog = true
      },

      closeAddDialog () {
        this.addDialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      async addStockConfirm (item) {
        var params = JSON.stringify({
          encryptedEmail: EncryptedActiveUser,
          method: 'push',
          stocker: {
            id: this.editedItem.StockerID,
            count: this.editedItem.StockCount,
            lastbuydate: this.editedItem.LastBuyDateDisplay
          }
        });
        this.closeAddDialog()
        await this.postRequest(params)
        this.initialize()
      },

      subStock (item) {
        this.editedIndex = this.stockerList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.editedItem.StockCount = 1
        this.editedItem.LastUnsealDate = (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10)
        this.editedItem.LastUnsealDateDisplay = (new Date().toLocaleString("sv-SE", { timeZone: 'Asia/Tokyo' })).substr(0, 10).replace(/-/g, '/')
        this.subDialog = true
      },

      closeSubDialog () {
        this.subDialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      async subStockConfirm (item) {
        var params = JSON.stringify({
          encryptedEmail: EncryptedActiveUser,
          method: 'pop',
          stocker: {
            id: this.editedItem.StockerID,
            count: this.editedItem.StockCount,
            lastunsealdate: this.editedItem.LastUnsealDateDisplay
          }
        });
        this.closeSubDialog()
        await this.postRequest(params)
        this.initialize()
      },

      deleteStock (item) {
        this.editedIndex = this.stockerList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.deleteDialog = true
      },

      async deleteItemConfirm () {
        var params = JSON.stringify({
          encryptedEmail: EncryptedActiveUser,
          method: 'delete',
          stocker: {
            id: this.editedItem.StockerID
          }
        });
        this.closeDeleteDialog()
        await this.postRequest(params)
        this.initialize()
      },

      async undoItemConfirm () {
        var params = JSON.stringify({
          encryptedEmail: EncryptedActiveUser,
          method: 'undo',
          stocker: {
            id: this.historyItem.StockerID,
            operationid: this.historyItem.OperationID
          }
        });
        this.closeUndoDialog()
        await this.postRequest(params)
        this.initialize()
      },

      closeCreateDialog () {
        this.createDialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      closeDeleteDialog () {
        this.deleteDialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      closeEditDialog () {
        this.editDialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      closeUndoDialog () {
        this.undoDialog = false
        this.historyText = '読み込み中…'
        this.operationText = ''
        this.isUndoConfirmDisabled = true
      },

      async create () {
        var params = JSON.stringify({
          encryptedEmail: EncryptedActiveUser,
          method: 'create',
          stocker: {
            name: this.editedItem.StockerName,
            category: this.editedItem.Category,
            count: this.editedItem.StockCount,
            lastbuydate: this.editedItem.LastBuyDateDisplay,
            lastunsealdate: this.editedItem.LastUnsealDateDisplay,
            notifythreshold: this.editedItem.NotifyThreshold
          }
        });
        this.closeCreateDialog()
        await this.postRequest(params)
        this.initialize()
      },

      async editStock (item) {
        this.editedIndex = this.stockerList.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.editedItem.TargetStockerName = this.editedItem.StockerName
      },

      async edit () {
        var params = JSON.stringify({
          encryptedEmail: EncryptedActiveUser,
          method: 'edit',
          stocker: {
            id: this.editedItem.StockerID,
            newname: this.editedItem.StockerName,
            newcount: this.editedItem.StockCount,
            newlastbuydate: this.editedItem.LastBuyDateDisplay,
            newlastunsealdate: this.editedItem.LastUnsealDateDisplay,
            newcategory: this.editedItem.Category,
            newnotifythreshold: this.editedItem.NotifyThreshold
          }
        });
        this.closeEditDialog()
        await this.postRequest(params)
        this.initialize()
      },

      async postRequest(params) {
        this.overlay = true
        const promise = axios.post(TARGET_URL, params)
        const response = await promise;
        this.snackbarText = response.data.message
        this.snackbar = true
        this.overlay = false
      },

      async undoOperation(item) {
        this.undoLoading = true;
        await axios.get(TARGET_URL_GETLASTHISTORY + item.StockerID)
          .then(response => {
            if (response.data == null) {
              this.historyText = '戻せる操作履歴がありませんでした。';
              this.operationText = '取り消す操作がありません。';
              this.isUndoConfirmDisabled = true;
            } else {
              this.historyText = 'ストック名：' + response.data.StockerName + '\nストック数：' + response.data.StockCount + '\n最終購入日：' + response.data.LastBuyDate
                + '\n最終開封日：' + response.data.LastUnsealDate + '\n通知閾値：' + response.data.NotifyThreshold
              this.operationText = '操作：' + this.operationConvert[response.data.OperationFunction]
                + '\n操作日時：' + response.data.OperationTimestamp + '\n操作ユーザ：' + response.data.OperationUser + '\nストック名(編集後)：' + response.data.OperationStockerName
                + '\n操作ストック数：' + response.data.OperationStockCount + '\n通知閾値(編集後)：' + response.data.OperationNotifyThreshold + '\nカテゴリ(編集後)：'
                + response.data.OperationCategory;
              this.historyItem.StockerID = response.data.StockerID;
              this.historyItem.OperationID = response.data.OperationID;
              this.isUndoConfirmDisabled = false;
            }
          })
          .finally(() => {this.undoLoading = false});
      },
    }
  })