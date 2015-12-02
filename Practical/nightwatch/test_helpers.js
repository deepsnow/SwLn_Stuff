

exports.createToDos = function(client, todoDescriptions) {
	for (i = 0; i < todoDescriptions.length; i++) {
		client.setValue('input.new-todo', [todoDescriptions[i], client.Keys.ENTER])
	}
}

exports.verifyNthToDoText = function(client, itemNum, desc) {
	var cssSelector = getNthToDoSelector(itemNum, 'label');
	client.assert.containsText(cssSelector, desc);
}

exports.getNthToDoSelector = getNthToDoSelector;

function getNthToDoSelector(itemNum, childName) {
	return 'ul.todo-list > li:nth-child(' + itemNum + ') > div > ' + childName;
}