describe('todomvc angular2 tests', function() {
  it('add one to-do', function() {
	browser.ignoreSynchronization = true
    browser.get('http://todomvc.com/examples/angular2/')

    var el = element(by.binding('newtodo'))
	el.clear()
	el.sendKeys('task 1\r')
	el.sendKeys('task 2\r')

    var resultList = element.all(by.repeater('todo of todoStore.todos'))
    expect(resultList.count()).toEqual(2)
	
  });
});