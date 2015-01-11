(function() {
  /**
   * @desc <header> element
   * @type {HTMLElement}
   */
  var element = document.querySelectorAll('header')[0];

  /**
   * @desc Find elements within <header>
   * @param {String} selector
   * @return {HTMLElement[]}
   */
  element.find = function(selector) {
    return [].slice.call(element.querySelectorAll.call(element, selector));
  };

  /**
   * @desc Attach function to event on HTMLElement
   * @param {HTMLElement[]} nodes
   * @param {String} event Event to attach function to
   * @param {Function} fn Function to exectue when event occurs
   * @return {HTMLElement[]} nodes
   */
  var on = function(nodes, event, fn) {
    return nodes.forEach(function(node) {
      node[event] = fn;
    });
  };

  var list = element.find('ul')[0];
  // var listItems = element.find('li');
  var links = element.find('a');
  var toggle = element.find('button');

  /**
   * @desc Toggle .open class on <ul> within <header>
   */
  function toggleList() {
      return list.classList.toggle('open');
  }

  // Toggle 'open' class when mouse leaves <nav>
  on([element], 'onmouseleave', function() {
    // Only toggle class if list has class
    if (list.classList.contains('open')) {
      return list.classList.remove('open');
    }
    return;
  });

  // Toggle 'open' class when link is clicked
  on(links, 'onclick', toggleList);

  // Toggle 'open' class when mouse leaves list
  on([list], 'onmouseleave', toggleList);

  // Toggle 'open' class when Menu button is clicked
  on(toggle, 'onclick', toggleList);

  return;
})();
