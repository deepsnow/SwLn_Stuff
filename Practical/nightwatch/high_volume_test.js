var th = require('./test_helpers.js');

module.exports = {

	'create first todo' : function (client) {
		client
			.url('http://todomvc.com/examples/angular2/')
			.waitForElementVisible('input.new-todo', 4000) // I've been able to get away with a wait time of 1000 ms for most of my Chrome testing. But, I just did a test run where that interval proved too short.
															// Firefox should have a 4000 ms timeout as it seems slower to launch. Can I detect test settings from within this test code?
			.assert.visible('input.new-todo');
		th.createToDos(client, [ 'task 0' ]);
		client.assert.visible('ul.todo-list');
		th.verifyNthToDoText(client, '2', 'task 0');
	},
	
	'create many todos' : function (client) {
		for (var i = 1; i <= 1000; i++) {
			var istr = i.toString();
			th.createToDos(client, [ 'task ' + istr ]);
		}
		
		client.pause(5000);
			
		for (var i = 1; i <= 1000; i++) {
			var istr = i.toString();
			var itemNumStr = (i + 2).toString();
			th.verifyNthToDoText(client, itemNumStr, 'task ' + istr);
		}
		
		client.pause(5000).end();
	},
	
}