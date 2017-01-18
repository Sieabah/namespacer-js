'use strict';

const path = require('path');

class Space {

  /**
   * Create namespace
   * @param name {string} Namespace name
   * @param location {string} Relative path from root
   * @param root {string} Root path to use
   */
  constructor({name, location, root}){
    /**
     * @type {string}
     * @private
     */
    this._name = name;

    /**
     * @type {string}
     * @private
     */
    this._location = Space._ensureEndSlash(location);

    /**
     * @type {string}
     * @private
     */
    this._root = '';

    if(!path.isAbsolute(location))
      this._root = Space._ensureEndSlash(root);

    /**
     * @type RegExp
     * @private
     */
    this._test = new RegExp(`^${name}`);
  }

  /**
   * Ensure string ends with path separator
   * @param str {string} Path to ensure
   * @returns {string}
   * @private
   */
  static _ensureEndSlash(str){
    return str.replace(new RegExp(`${path.sep}*$`), '')+path.sep;
  }

  /**
   * Test request against space
   * @param req {string} Request string
   * @return {boolean}
   */
  test(req){
    return !!this._test.exec(req);
  }

  /**
   * Build filepath from namespace
   * @param req {string} Request path
   * @return {string}
   */
  path(req){
    return path.normalize(path.join(this.root(), this.location(), req.replace(this.name(), '')));
  }

  /**
   * Get root
   * @return {string}
   */
  root(){
    return this._root;
  }

  /**
   * Get relative location
   * @return {string}
   */
  location(){
    return this._location;
  }

  /**
   * Get namespace name
   * @return {string}
   */
  name(){
    return this._name;
  }
}

/**
 * @type {Space}
 */
module.exports = Space;
