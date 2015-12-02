module.exports = {

	'create todos' : function (client) {
		client
			.url('http://todomvc.com/examples/angular2/')
			.waitForElementVisible('input.new-todo', 2000) // I've been able to get away with a wait time of 1000 ms for most of my Chrome testing. But, I just did a test run where that interval proved too short.
															// Firefox should have a 4000 ms timeout as it seems slower to launch. Can I detect test settings from within this test code?
			.assert.visible('input.new-todo');
		createToDos(client, [ 'task A', 'task B' ]);
		client.assert.visible('ul.todo-list');
		verifyNthToDoText(client, '2', 'task A');
		verifyNthToDoText(client, '3', 'task B');
	},

	'complete todo' : function (client) {
		var cssSelector = getNthToDoSelector('3', 'input');
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
		//editNthToDo(client, '3', 'task D edited');
		// client
			// .pause(3000)
			// .end();
	},
	
	'toggle completion state for all todos' : function (client) {
		createToDos(client, [ 'task E' ]);
		var cssSelector = getNthToDoSelector('2', 'input');
		client.expect.element(cssSelector).to.be.selected;
		cssSelector = getNthToDoSelector('3', 'input');
		client.expect.element(cssSelector).to.not.be.selected;
		cssSelector = getNthToDoSelector('4', 'input');
		client.expect.element(cssSelector).to.not.be.selected;
		toggleAllToDosCompleted(client);
		var itemNums = [ '2', '3', '4' ];
		verifyUniformCompletedState(client, itemNums, 'completed');
		toggleAllToDosCompleted(client);
		verifyUniformCompletedState(client, itemNums, 'not completed');
		client.end();
	},

};

function verifyUniformCompletedState(client, itemNums, desiredState) {
	for (i = 0; i < itemNums.length; i++) {
		var cssSelector = getNthToDoSelector(itemNums[i], 'input');
		if (desiredState == 'completed') {
			client.expect.element(cssSelector).to.be.selected;
		}
		else {
			client.expect.element(cssSelector).to.not.be.selected;
		}
	}
}

function getNthToDoSelector(itemNum, childName) {
	return 'ul.todo-list > li:nth-child(' + itemNum + ') > div > ' + childName;
}

function createToDos(client, todoDescriptions) {
	for (i = 0; i < todoDescriptions.length; i++) {
		client.setValue('input.new-todo', [todoDescriptions[i], client.Keys.ENTER])
	}
}

function deleteNthToDo(client, itemNum) {
	var cssSelector = getNthToDoSelector(itemNum, 'input');
	client.moveToElement(cssSelector, 10, 10, function (result) {
		verifyCallSucceeded(client, result);
	});
	cssSelector = getNthToDoSelector(itemNum, 'button');
	clickOnSelector(client, cssSelector);
}

function editNthToDo(client, itemNum, newDesc) {
	var cssSelector = getNthToDoSelector(itemNum, 'label');
	client.moveToElement(cssSelector, 30, 30, function (result) {
		verifyCallSucceeded(client, result);
	});
	client.doubleClick( function (result) {
		verifyCallSucceeded(client, result);
	});
	client.pause(3000);
	// client.click(cssSelector, function (result) {
		// verifyCallSucceeded(client, result);
	// });
	//client.pause(3000);
	client.clearValue(cssSelector, function (result) {
		verifyCallSucceeded(client, result);
	});
	client.setValue(cssSelector, [newDesc, client.Keys.ENTER], function (result) {
		verifyCallSucceeded(client, result);
	});
	client.pause(4000);
}

function verifyCallSucceeded(client, result) {
	client.assert.equal(typeof result, "object");
	client.assert.equal(result.status, 0);	
}

function verifyNthToDoText(client, itemNum, desc) {
	var cssSelector = getNthToDoSelector(itemNum, 'label');
	client.assert.containsText(cssSelector, desc);
}

function markNthToDoCompleted(client, itemNum) {
	var cssSelector = getNthToDoSelector(itemNum, 'input');
	clickOnSelector(client, cssSelector);
}

function toggleAllToDosCompleted(client) {
	var cssSelector = 'input.toggle-all';
	clickOnSelector(client, cssSelector);
}

function clickOnSelector(client, cssSelector) {
	client.click(cssSelector, function (result) {
		verifyCallSucceeded(client, result);
	});	
}