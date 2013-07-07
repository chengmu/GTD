/**
 * GTD TODO
 * author : chengmu
 * Date : 2013-7-3
 * 按照GTD工作流来做的TODO APP，采用backbone作为MVC框架
 */

// $(function(){
/**
 * 输入： 收集箱(唯一输入点)
 * 然后进入Waiting List / 下一步行动 /Someday 【其中item只允许编辑，不允许添加】
 */

/***MODEL定义***/
//定义todo item Model
var Todo = Backbone.Model.extend({
    //代办事宜的默认值
    defaults: {
            title: 'no specific things to do yet....',
            place: 'office',
            priority: 3,
            done: false
    },
    url : '#',

    initialize: function() {
        //初始化
    },
    toggle: function() {
        this.save({
            done: !this.get("done")
        });
    }
});


//定义todo collection
var TodoLists = Backbone.Collection.extend({

    model: Todo,
    url : '#',
    localStorage: new Backbone.LocalStorage('todos-backbone'),
    done: function() {
        return this.where({
            "done": true
        });
    },

    remaining: function() {
        return this.without({
            "done": true
        });
    },
    nextOrder: function() {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
    },
    comparator: 'order'

});

//生成实例
var Todos = new TodoLists();


//单项的item View
var TodoView = Backbone.View.extend({

    tagName: "li",
    className : "todo-item",
    template: _.template($('#item-template').html()),

    events: {
        "click .toggle ": "toggleDown",
        "dblclick .view": "edit",
        "click .delete": "clear",
        "blur .edit": "close",
        'keypress .edit' : "updateOnEnter"
    },

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    },

    toggleDown: function() {
        this.model.toggle();
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.toggleClass('done', this.model.get('done'));
        this.input = this.$('.edit');
        return this;
    },
    edit: function() {
        window.$el=this.$el;
        this.$el.addClass('edit-mode');
        this.input.focus();
    },
    close: function() {
        var value = this.input.val();
        if (!value) {
            this.clear();
        } else {
            this.model.save({
                title: value
            });
            this.$el.removeClass('edit-mode');
        }
    },
    //回车
    updateOnEnter: function(e) {
        if (e.keyCode == 13) this.close();
    },

    clear: function() {
        this.model.destroy();
    }

});

var TodoListView = Backbone.View.extend({

    el: $("#inBoxPanel"),

    model : TodoLists,

    events: {
        "keypress #new-todo": "createOnEnter"
    },

    initialize: function() {

        this.input = this.$("#new-todo");
        this.listenTo(Todos, 'add', this.addOne);
        this.listenTo(Todos, 'reset', this.addAll);
        this.listenTo(Todos, 'all', this.render);

        this.main = $('#main');

        Todos.fetch();

    },

    render: function() {
        var done = Todos.done().length;
        var remaining = Todos.remaining().length;
    },

    addOne: function(todo) {
         var view = new TodoView({model: todo});
        this.$("#todo-list").append(view.render().el);
    },

    addAll: function() {
        Todos.each(this.addOne, this);
    },

    createOnEnter: function(e) {
        if (e.keyCode != 13) return;
        if (!this.input.val()) return;

        Todos.create({
            title: this.input.val()
        });
        this.input.val('');
    }


});

var gtd = new TodoListView();


// });