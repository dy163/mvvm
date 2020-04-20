class MVVM{
    constructor(options) {
        // 一上来先把课用得东西挂载到实例上
        this.$el = options.el
        this.$data = options.data
        // 如果有要编译得模板 就要编译当前得编译
        if(this.$el) {
            // 用数据和元素进行编译
            new Compile(this.$el, this);
        }
    }
}