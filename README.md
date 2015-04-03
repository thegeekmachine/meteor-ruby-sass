# Ruby sass compiler for meteor

The rationale behind forking grigio's plugin is to accommodate for larger SCSS source trees. The older approach wrote the entire output to STDOUT at one go. This implementation consumes the CSS data written to STDOUT as and when it is generated.

## Install

Package required `sass` gem.

    $ gem install sass
    # or check http://sass-lang.com/install

### Add package

    $ meteor add thegeekmachine:ruby-sass


## Configuration

Add a `ruby-sass.json` file to root directory of project.


### unixNewlines

type: `boolean`, default: `false`

Use Unix-style newlines in written files.


### scss

type: `boolean`, default: `false`

Use the CSS-superset SCSS syntax.


### style

type: `string`, default: `nested`

Output style. Can be `nested`, `compact`, `compressed`, or `expanded`.


### precision

type: `number`, default: `5`

How many digits of precision to use when outputting decimal numbers.


### compass

type: `boolean`, default: `false`

Make Compass imports available and load project configuration.


### comments

type: `boolean`, default: `false`

Emit comments in the generated CSS indicating the corresponding source line.


### import

type: `string`

Add a sass import path.


### require

type: `string`

Require a Ruby library before running Sass.


### cacheLocation

type: `string`

The path to put cached Sass files. Defaults to `.sass-cache`


### noCache

type: `boolean`, default: `true`

Don't cache sassc files.


### defaultEncoding

type: `string`

Specify the default encoding for Sass files.
