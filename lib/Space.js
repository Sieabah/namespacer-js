'use strict';

const path = require('path');

class Space {
  constructor({name, location, root, test}){
    this._name = name;
    this._location = location;
    this._root = root;

    /**
     * @type RegExp
     */
    this._test = test;
  }

  test(req){
    return this._test.exec(req);
  }

  path(req){
    return path.normalize(path.join(this.root(), this.location(), req.replace(this.name(), '')));
  }

  root(){
    return this._root;
  }

  location(){
    return this._location;
  }

  name(){
    return this._name;
  }
}

module.exports = Space;
