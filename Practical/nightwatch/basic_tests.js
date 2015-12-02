module.exports = {
  
	'create todos' : function (client) {
		client
			.url('http://todomvc.com/examples/angular2/')
			.waitForElementVisible('input.new-todo', 1000)
			.assert.visible('input.new-todo');
		createToDos(client, [ 'task A', 'task B' ]);
		client
			.assert.visible('ul.todo-list')
			.assert.containsText('ul.todo-list > li:nth-child(2) > div > label', 'task A')
			.assert.containsText('ul.todo-list > li:nth-child(3) > div > label', 'task B')
	},
  
	'complete todo' : function (client) {
		client.expect.element('ul.todo-list > li:nth-child(3) > div > input').to.not.be.selected;
		client
			.click('ul.todo-list > li:nth-child(3) > div > input', function (result) {
				client.assert.equal(typeof result, "object");
				client.assert.equal(result.status, 0);
			})
		.expect.element('ul.todo-list > li:nth-child(3) > div > input').to.be.selected;
	},
  
	'delete todos' : function (client) {
		deleteNthListItem(client, '3'); // this one is already marked as completed
		client.assert.elementNotPresent('ul.todo-list > li:nth-child(3)')
		deleteNthListItem(client, '2'); // this one is not yet completed
		client.assert.elementNotPresent('ul.todo-list > li:nth-child(2)')
			.end();
  },
  
  // 'edit todos' : function (client) {
	// createToDos(client, [ 'task C', 'task D' ]);  
    // client
	  // .assert.containsText('ul.todo-list > li:nth-child(2) > div > label', 'task D')
      // .end();
  // },
  
};

function createToDos (client, todoDescriptions) {
	for (i = 0; i < todoDescriptions.length; i++) {
		client
		  .setValue('input.new-todo', todoDescriptions[i] + '\r\n')
	}
}

function deleteNthListItem (client, itemNum) {
	var cssSelector = 'ul.todo-list > li:nth-child(' + itemNum + ') > div > input';
	client.moveToElement(cssSelector, 10, 10, function (result) {
		this.assert.equal(typeof result, "object");
		this.assert.equal(result.status, 0);
	});
	cssSelector = 'ul.todo-list > li:nth-child(' + itemNum + ') > div > button';
	client.click(cssSelector, function (result) {
		client.assert.equal(typeof result, "object");
		client.assert.equal(result.status, 0);
	});
}