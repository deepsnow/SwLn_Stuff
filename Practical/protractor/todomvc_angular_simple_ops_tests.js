describe('todomvc angular2 tests', function() {
  it('add to-dos and verify that they are displayed', function() {

	browser.ignoreSynchronization = true; // The site/app under test uses AngularJS in what might be called a manually bootstrapped fashion, i.e. without use the ng-app directive.
    browser.get('http://todomvc.com/examples/angular2/');
	
	browser.driver.sleep(1000); // There's got to be a better way to wait for the custom <todo-app></todo-app> tag (which is a custom AngularJS directive) to load.
	
	var el = element(by.css('input.new-todo'));
	el.clear();
	el.sendKeys('task 1\r\n');
	el.sendKeys('task 2\r\n');
	
	browser.driver.sleep(2000); // aid in debugging
	
    var resultlist = element.all(by.repeater('todo in todoStore.todos')); // This doesn't work...
    expect(resultlist.count()).toEqual(2);
	
    //These don't work either
	// var liFisrt = element(by.css('ul.todo-list > li:nth-child(2) > div > label'));
    // expect(liFirst.getText().toMatch('task 1'));
    // var liSecond = element(by.css('ul.todo-list > li:nth-child(3) > div > label'));
    // expect(liSecond.getText().toMatch('task 2'));
	
  });
});