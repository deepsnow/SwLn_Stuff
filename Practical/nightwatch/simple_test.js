module.exports = {
  'simple test todomvc with angular2' : function (client) {
    client
      .url('http://todomvc.com/examples/angular2/')
      .waitForElementVisible('input.new-todo', 1000)
      .assert.visible('input.new-todo')
      .setValue('input.new-todo', 'task A\r\n')
	  .setValue('input.new-todo', 'task B\r\n')
      //.pause(2000)
	  .assert.visible('ul.todo-list')
	  //.assert.visible('ul.todo-list > li:nth-child(2) > div > label')
	  .assert.containsText('ul.todo-list > li:nth-child(2) > div > label', 'task A')
	  .assert.containsText('ul.todo-list > li:nth-child(3) > div > label', 'task B')
      .end();
  }
};