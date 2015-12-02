module.exports = {

	'create todos' : function (client) {
		client
			.url('http://todomvc.com/examples/angular2/')
			.waitForElementVisible('input.new-todo', 2000) // I've been able to get away with a wait time of 1000 ms for most of my testing. But, I just did a test run where that interval proved too short.
			.assert.visible('input.new-todo');
		createToDos(client, [ 'task A', 'task B' ]);
		client.assert.visible('ul.todo-list');
		verifyNthToDoText(client, '2', 'task A');
		verifyNthToDoText(client, '3', 'task B');
	},

	'complete todo' : function (client) {
		var cssSelector = 'ul.todo-list > li:nth-child(3) > div > input';
		client.expect.element(cssSelector).to.not.be.selected;
		markNthToDoCompleted(client, '3');
		client.expect.element(cssSelector).to.be.selected;
	},

	'delete todos' : function (client) {
		deleteNthToDo(client, '3'); // this one is already marked as completed
		client.assert.elementNotPresent('ul.todo-list > li:nth-child(3)')
		deleteNthToDo(client, '2'); // this one is not yet completed
		client.assert.elementNotPresent('ul.todo-list > li:nth-child(2)')
	},

	'edit todos' : function (client) {
		createToDos(client, [ 'task C', 'task D' ]);
		verifyNthToDoText(client, '2', 'task C');
		verifyNthToDoText(client, '3', 'task D');
		markNthToDoCompleted(client, '2');
		client
			.pause(4000)
			.end();
	},

};

function createToDos (client, todoDescriptions) {
	for (i = 0; i < todoDescriptions.length; i++) {
		client.setValue('input.new-todo', todoDescriptions[i] + '\r\n')
	}
}

function deleteNthToDo (client, itemNum) {
	var cssSelector = 'ul.todo-list > li:nth-child(' + itemNum + ') > div > input';
	client.moveToElement(cssSelector, 10, 10, function (result) {
		client.assert.equal(typeof result, "object");
		client.assert.equal(result.status, 0);
	});
	cssSelector = 'ul.todo-list > li:nth-child(' + itemNum + ') > div > button';
	client.click(cssSelector, function (result) {
		client.assert.equal(typeof result, "object");
		client.assert.equal(result.status, 0);
	});
}

function verifyNthToDoText(client, itemNum, desc) {
	var cssSelector = 'ul.todo-list > li:nth-child(' + itemNum + ') > div > label';
	client.assert.containsText(cssSelector, desc);
}

function markNthToDoCompleted(client, itemNum) {
	var cssSelector = 'ul.todo-list > li:nth-child(' + itemNum + ') > div > input';
	client
		.click(cssSelector, function (result) {
			client.assert.equal(typeof result, "object");
			client.assert.equal(result.status, 0);
		});
}