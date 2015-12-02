var th = require('./test_helpers.js');

module.exports = {

	'create todos' : function (client) {
		client
			.url('http://todomvc.com/examples/angular2/')
			.waitForElementVisible('input.new-todo', 4000) // I've been able to get away with a wait time of 1000 ms for most of my Chrome testing. But, I just did a test run where that interval proved too short.
															// Firefox should have a 4000 ms timeout as it seems slower to launch. Can I detect test settings from within this test code?
			.assert.visible('input.new-todo');
		th.createToDos(client, [ 'task A', 'task B' ]);
		client.assert.visible('ul.todo-list');
		th.verifyNthToDoText(client, '2', 'task A');
		th.verifyNthToDoText(client, '3', 'task B');
	},

	'complete todo' : function (client) {
		var cssSelector = th.getNthToDoSelector('3', 'input');
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
		th.createToDos(client, [ 'task C', 'task D' ]);
		th.verifyNthToDoText(client, '2', 'task C');
		th.verifyNthToDoText(client, '3', 'task D');
		markNthToDoCompleted(client, '2');
		editNthToDo(client, '3', 'task D edited');
		th.verifyNthToDoText(client, '3', 'task D edited');
		editNthToDo(client, '2', 'task C edited');
		th.verifyNthToDoText(client, '2', 'task C edited');
		var itemNums = [ '2' ];
		verifyUniformCompletedState(client, itemNums, 'completed');
	},
	
	'toggle completion state for all todos' : function (client) {
		th.createToDos(client, [ 'task E' ]);
		var itemNums = [ '2' ];
		verifyUniformCompletedState(client, itemNums, 'completed');
		var itemNums = [ '3', '4' ];
		verifyUniformCompletedState(client, itemNums, 'not completed');
		toggleAllToDosCompleted(client);
		itemNums = [ '2', '3', '4' ];
		verifyUniformCompletedState(client, itemNums, 'completed');
		toggleAllToDosCompleted(client);
		verifyUniformCompletedState(client, itemNums, 'not completed');
	},
	
	'delete all completed todos one click' : function (client) {
		toggleAllToDosCompleted(client);
		var itemNums = [ '2', '3', '4' ];
		verifyUniformCompletedState(client, itemNums, 'completed');
		deleteAllCompletedToDosOneClick(client);
		client.expect.element('ul.todo-list').to.not.be.present;
	},
	
	'create todo with non-english text' : function (client) {
		var filePaths = ['./rune_poem_anglo_saxon.txt', './i_can_eat_glass_arabic.txt'];
		var itemNums = ['2', '3'];
		createToDoFromTextInFile(client, filePaths[0], itemNums[0]);
		createToDoFromTextInFile(client, filePaths[1], itemNums[1]);
		client.pause(3000); // needed to obviate a timing problem
	},
	
	'create todo with long english description' : function (client) {
		// This is a paragraph from the US Constitution, Section 2. It contains 164 words.
		var desc = 'Representatives and direct Taxes shall be apportioned among the several States which may be included within this Union, according to their respective Numbers, which shall be determined by adding to the whole Number of free Persons, including those bound to Service for a Term of Years, and excluding Indians not taxed, three fifths of all other Persons. The actual Enumeration shall be made within three Years after the first Meeting of the Congress of the United States, and within every subsequent Term of ten Years, in such Manner as they shall by Law direct. The Number of Representatives shall not exceed one for every thirty Thousand, but each State shall have at Least one Representative; and until such enumeration shall be made, the State of New Hampshire shall be entitled to choose three, Massachusetts eight, Rhode-Island and Providence Plantations one, Connecticut five, New-York six, New Jersey four, Pennsylvania eight, Delaware one, Maryland six, Virginia ten, North Carolina five, South Carolina five, and Georgia three.';
		th.createToDos(client, [desc]);
		th.verifyNthToDoText(client, '4', desc);
		//client.pause(5000); // for visual inspection
		client.end();
		
		// This test is incomplete because it doesn't programmatically verify that all 164 words are properly wrapped and contained with the todo label's display area.
	},

};

function createToDoFromTextInFile(client, filePath, itemNum) {
	var fs = require('fs');
	//for (var i = 0; i < filePaths.length; i++) { // Doing a loop here would result in fewer invocations from the caller, but it causes an async timing problem.
		fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
			if (!err){
				th.createToDos(client, [ data ]);
				th.verifyNthToDoText(client, itemNum, data);
			}else{
				// how to report the error and exit?
			}
		});
	//}
}

function verifyUniformCompletedState(client, itemNums, desiredState) {
	for (var i = 0; i < itemNums.length; i++) {
		var cssSelector = th.getNthToDoSelector(itemNums[i], 'input');
		if (desiredState == 'completed') {
			client.expect.element(cssSelector).to.be.selected;
		}
		else {
			client.expect.element(cssSelector).to.not.be.selected;
		}
	}
}

function deleteNthToDo(client, itemNum) {
	var cssSelector = th.getNthToDoSelector(itemNum, 'input');
	client.moveToElement(cssSelector, 10, 10, function (result) {
		verifyCallSucceeded(client, result);
	});
	cssSelector = th.getNthToDoSelector(itemNum, 'button');
	clickOnSelector(client, cssSelector);
}

function editNthToDo(client, itemNum, newDesc) {
	var cssSelector = th.getNthToDoSelector(itemNum, 'label');
	client.moveToElement(cssSelector, 30, 30, function (result) {
		verifyCallSucceeded(client, result);
	});
	client.doubleClick( function (result) {
		verifyCallSucceeded(client, result);
	});
	client.clearValue('input.edit', function (result) {
		verifyCallSucceeded(client, result);
	});
	client.setValue('input.edit', [newDesc, client.Keys.ENTER], function (result) {
		verifyCallSucceeded(client, result);
	});
}

function verifyCallSucceeded(client, result) {
	client.assert.equal(typeof result, "object");
	client.assert.equal(result.status, 0);	
}

function markNthToDoCompleted(client, itemNum) {
	var cssSelector = th.getNthToDoSelector(itemNum, 'input');
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

function deleteAllCompletedToDosOneClick(client) {
	var cssSelector = 'button.clear-completed';
	client.assert.visible(cssSelector);
	clickOnSelector(client, cssSelector);
}