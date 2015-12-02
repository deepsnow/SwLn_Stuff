module.exports = {
  
  'create todos' : function (client) {
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
  },
  
  'complete todo' : function (client) {
    client
	  .expect.element('ul.todo-list > li:nth-child(3) > div > input').to.not.be.selected;
	client
      .click('ul.todo-list > li:nth-child(3) > div > input', function (result) {
		client.assert.equal(typeof result, "object");
		client.assert.equal(result.status, 0);
	  })
	  .expect.element('ul.todo-list > li:nth-child(3) > div > input').to.be.selected;
  },
  
  'delete todo' : function (client) {
    client
	  .moveToElement('ul.todo-list > li:nth-child(3) > div > input', 10, 10, function (result) {
		this.assert.equal(typeof result, "object");
		this.assert.equal(result.status, 0);
	  })
      .click('ul.todo-list > li:nth-child(3) > div > button', function (result) {
		client.assert.equal(typeof result, "object");
		client.assert.equal(result.status, 0);
	  })
	  .assert.elementNotPresent('ul.todo-list > li:nth-child(3)')
      .end();
  },
  
  // 'edit todo' : function (client) {
    // client
      // .assert.visible('input.new-todo')
      // .setValue('input.new-todo', 'task C\r\n')
      // //.pause(2000)
	  // .assert.visible('ul.todo-list')
	  // //.assert.visible('ul.todo-list > li:nth-child(2) > div > label')
	  // .assert.containsText('ul.todo-list > li:nth-child(2) > div > label', 'task D')
      // .end();
  // };
  
  
};