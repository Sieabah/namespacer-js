'use strict';

const _path = require('path');

class Listing {

  /**
   * Create path listing
   * @param path {string} Filepath
   */
  constructor({path}){
    let stat = _path.parse(path);

    /**
     * @type {string}
     */
    this._name = stat.name;

    /**
     * @type {string}
     */
    this._base = stat.base;

    /**
     * @type {string}
     */
    this._path = path;
  }

  /**
   * Get name of file (Without extension)
   * @return {string}
   */
  name(){ return this._name; }

  /**
   * Get base file name (With extension)
   * @return {string}
   */
  base(){ return this._base; }

  /**
   * Get full file path
   * @return {string}
   */
  path(){ return this._path; }

  /**
   * Require listing
   * @return {*|Object}
   */
  require(){
    return require(this.path());
  }
}

module.exports = Listing;
