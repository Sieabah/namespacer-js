# Namespacer-js
### The namespaces you always wanted but never asked for

[![Build Status](https://travis-ci.org/Sieabah/namespacer-js.svg?branch=master)](https://travis-ci.org/Sieabah/namespacer-js)
[![Coverage Status](https://coveralls.io/repos/github/Sieabah/namespacer-js/badge.svg?branch=master)](https://coveralls.io/github/Sieabah/namespacer-js?branch=master)

Namespacer is a simple library that aliases namespaces into filepaths without having to deal with including
folders into your NODE_PATH or anything like that. It also allows you to create namespaces programaitcally.

It's simple, when you load your spaces file it assumes it's based off of your current module root, at the same
level as your node_modules folder.

Currently it follows the [PSR-4](http://www.php-fig.org/psr/psr-4/) because I have yet to create a javascript spec
for loading namespaces neatly and include options for glob loading.

A namespace can be created from any object as long as it follows the format of the **key** being the namespace
where the **value** is the location on the file system relative to the *.spaces.js* file.

```
#.spaces.js
'use strict';

module.exports = {
    'NS/': 'Namespace/',
    'NS/Config': 'Namespace/Something/Config'
};
```

It is also possible to dynamically decide what folder your namespace leads to, for example if you wanted to have
specific configuration files given in an environment you can structure your spaces like so.

```
#.spaces.js
'use strict';

module.exports = {
    'ENV/': `config/${process.env.NODE_ENV}`
};
```

To load an environment you can give namespacer a relative or absolute path to your spaces file, or an object 
of namespaces. If passed a straight object it will guess at your root being the node execution root. If namespaces 
are passed from a file the all namespaces are relative to the location of the spaces file.

If your spaces file is in `<root>/config/.spaces.js` and it defines `'NS/foo' => 'foo'` the mapped 
path is `<root>/config/foo`. Simply define the namespace as `'NS/foo' => '../foo'` to resolve the issue or require
the namespace configuration as an object and set the root as the root of the application.

```
//Include namespace however you want, via an instance or static
//Instanced
const Namespace = require('namespacer-js');
//Static
const {namespace} = require('namespacer-js');

```

```
//Load namespace from object mapping the results to root
namespace.addSpacesFromObject({'NS/': 'config/'}, path.resolve('./'));
namespace.addSpacesFromObject(require('./.spaces.js'), path.resolve('./'));
```

```
//Load namespace from default spaces file, looks for .spaces.js before .spaces.json
namespace.addSpacesFromFile();
```

```
//Load namespace from relative path to spaces file
namespace.addSpacesFromFile('../.spaces.js');

//Load namespace from absolute path to spaces file
namespace.addSpacesFromFile(path.resolve('./.spaces.js'));
```
