(function(){"use strict";})();

// initialize the app :D
var app = angular.module('app', []);

// root url to make database requests against
// set to '_rewrite/root' if not using a virtualhost
app.constant('root', '_rewrite/api');

// markdown converter
app.value('md', new Showdown.converter());

// get posts from a given view
app.factory('getPosts', function($http, root){
  return function(viewname, opts){
    var posts = $http({
      url: [root, "_design/chaiseblog/_view", viewname].join('/')
    , method: 'GET'
    , params: {
        include_docs: true
      }
    });
    if(opts.success){
      posts.success(function(data, status){
        var docs = [];
        for(var i in data.rows){
          docs.push(data.rows[i].doc);
        }
        opts.success(docs);
      });
    }
    posts.error(function(){
      console.log(arguments);
    });
    return posts;
  };
});

// list all posts
function PostsCtrl($scope, getPosts){
  getPosts('published', {
    success: function(docs){
      $scope.posts = docs;
    }
  });
}

// list a single post, draft or otherwise
function PostCtrl($scope, $http, $routeParams, root){
  var doc_url = [root, $routeParams.id].join('/')
    , post = $http.get(doc_url);
  post.success(function(data, status){
    $scope.posts = [data];
  });
}

// url router
app.config(function($routeProvider, $locationProvider){
  $routeProvider
  .when('/', {
    templateUrl: 'posts.html',
    controller: PostsCtrl
  })
  .when('/post/:id', {
    templateUrl: 'posts.html',
    controller: PostCtrl
  })
  .otherwise({
    redirectTo: '/'
  });
});

// markdown filter for dynamic content
app.filter('markdown', function(md){
  return function(input){
    if(input) return md.makeHtml(input);
  };
});