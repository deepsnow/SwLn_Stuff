exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['todomvc_angular_simple_ops_tests.js'],
  //framework: 'jasmine2',
  
/*   onPrepare: function() {
	browser.ignoreSynchronization = true
    browser.driver.get('http://todomvc.com/examples/angular2/')  
  }, */
};