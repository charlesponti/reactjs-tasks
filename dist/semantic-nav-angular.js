/* global angular: true */

angular.module('semantic-nav', [])
  .directive({
    semanticNav: function($templateCache) {

      return {

        restrict: 'E',

        replace: true,

        // Change the links to be what you want of course
        template: [
          '<header>',
            '<nav>',
              '<button class="toggle"> Menu </button>',
              '<ul>',
                '<li>',
                  '<a class="brand" href="#">Semantic Nav</a>',
                '</li>',
                '<li>',
                  '<a href="#">Link 1</a>',
                '</li>',
                '<li>',
                  '<a href="#">Link 2</a>',
                '</li>',
              '</ul>',
            '</nav>',
          '</header>'
        ].join(''),

        link: function(scope, element, attrs) {
          var list = element.find('ul');
          var links = element.find('li, a');
          var toggle = element.find('button');

          function toggleList() {
              return list.toggleClass('open');
          }

          // Toggle 'open' class when mouse leaves <nav>
          element.on('mouseleave', function() {
            // Only toggle class if list has class
            if (list.hasClass('open')) {
              return list.removeClass('open');
            }
            return;
          });

          // Toggle 'open' class when link is clicked
          links.on('click', toggleList);

          // Toggle 'open' class when mouse leaves list
          list.on('mouseleave', toggleList);

          // Toggle 'open' class when Menu button is clicked
          return toggle.on('click', toggleList);
        }

      };

    }

  });
