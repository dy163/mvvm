class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm
        if (this.el) {
            //  如果这个元素能获取到,我们才开始编译
            // 1.先把这些真实得dom 移入到内存中 fragment
            let fragment = this.node2fragment(this.el);
            // 2.编译=>提取想要元素节点 v-model 和 文本节点{{}}
            this.compile(fragment)
            // 3.把编译好得fragment 在赛回到页面里面去
            this.el.appendChild(fragment)
        }
    }
    /**
     * 专门写一些辅助得方法
     */
    isElementNode(node) { // 判断el得属性是不是dom节点
        return node.nodeType === 1
    }
    // 判断是不是指令
    isDirective(name) {
        return name.includes('v-')
    }


    /**
     * 核心得方法
     */
    // 元素
    compileElement(node) {
        // 带v-model
        // 取出当前节点得属性
        let attrs = node.attributes;
        // console.log(attrs) 对象
        Array.from(attrs).forEach(attr => {
            // 判断是不是指令
            // console.log(attr.name)
            // console.log(attr.value)
            let attrName = attr.name
            if (this.isDirective(attrName)) {
                // 取到对应得值放到节点上
                let expr = attr.value
                let [, type] = attrName.split('-')
                // node this.vm.$data 
                // todo.........
                CompileUtil[type](node, this.vm, expr)
                // console.log(CompileUtil[type])
            }
        })
    } expr
    // 文本
    compileText(node) {
        let expr = node.textContent
        let reg = /\{\{([^}]+)\}\}/g
        if (reg.test(expr)) {
            // node 节点  this.vm.$data
            // todo.........
            CompileUtil['text'](node, this.vm, expr)
        }
    }

    compile(fragment) {
        // 这个时候是需要递归
        /**
         *  let childNodes = fragment.childNodes
         *  console.log(childNodes)
         */
        let childNodes = fragment.childNodes
        Array.from(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                // 是元素节点,还需要继续深入检查
                // console.log('element',node) 这里编译元素
                this.compileElement(node)
                this.compile(node)
            } else {
                // 文本节点
                // console.log('text', node) 这里编译文本
                this.compileText(node)
            }
        })
    }

    node2fragment(el) { // 需要将el中元素放到内存中
        // 文档碎片  内存中dom节点
        let fragment = document.createDocumentFragment()
        let firstChild;
        // 循环文档碎片 拿到所有得文档碎片
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment;  // 内存中的节点
    }
}


// 编译得方法
CompileUtil = {
    // 获取实例上对应得数据
    getVal(vm, expr) {
        expr = expr.split('.')
        return expr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    },
    // 替换
    getTextVal(vm, expr) {
        return expr.replace(/{\{([^}]+)}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1])
        })
    },
    text(node, vm, expr) { // 文本处理
        let updateFn = this.updater['textUpdater']
        console.log(expr)
        let value = expr.replace(/\{\{([^}]+)\}\}/g,(...arguments) => {
            return this.getVal(vm, arguments[1])
        })
        console.log(value)
        updateFn && updateFn(node, value)
    },
    model(node, vm, expr) { // 输入框处理
        let updateFn = this.updater['modelUpdater']
        updateFn && updateFn(node, this.getVal(vm,expr))
    },
    updater: {
        // 文本更新
        textUpdater(node, value) {
            node.textContent = value
        },
        modelUpdater(node, value) {
            node.value = value
        }
    }
}