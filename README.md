# Namespacer-js
### The namespaces you always wanted but never asked for

[![Build Status](https://travis-ci.org/Sieabah/namespacer-js.svg?branch=master)](https://travis-ci.org/Sieabah/namespacer-js)
[![Coverage Status](https://coveralls.io/repos/github/Sieabah/namespacer-js/badge.svg?branch=feature%2Fadd_code_coverage)](https://coveralls.io/github/Sieabah/namespacer-js?branch=feature%2Fadd_code_coverage)

Namespacer is a simple library that aliases namespaces into filepaths without having to deal with including
folders into your NODE_PATH or anything like that. It also allows you to create namespaces programaitcally.

It's simple, when you load your spaces file it assumes it's based off of your current module root, at the same
level as your node_modules folder.

Currently it follows the [PSR-4](http://www.php-fig.org/psr/psr-4/) because I have yet to create a javascript spec
for loading namespaces neatly and include options for glob loading.
