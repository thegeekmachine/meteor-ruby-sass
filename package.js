Package.describe({
  summary: 'Style with attitude.',
  git: "https://github.com/grigio/meteor-ruby-sass.git",
  version: "0.0.8"
});

Package._transitional_registerBuildPlugin({
  name: 'meteor-ruby-sass',
  use: [],
  sources: [
    'plugin/compile-sass.js'
  ],
  npmDependencies: {
    // 'fibers': '1.0.1',
    'minimatch': '0.4.0'
  }
});
