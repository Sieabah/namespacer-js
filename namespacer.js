'use strict';

const path = require('path');

const Space = require('./lib/Space');

class Namespace {
  /**
   * Create namespace instance with configuration
   * @param conf {Object} Object of namespaces and folder paths
   * @param root {string} Relative or absolute path to root
   */
  constructor(conf, root = null){
    if(!conf)
        throw new Error('No namespace config given');

    Namespace.addSpacesFromObject(conf, root);
  }

  /**
   * Resolve filepath
   * @param req {string} Namespaced path
   * @throws Error
   * @returns {string}
   */
  static resolve(req) {
    for (let space of Namespace._spaces)
      if (space.test(req))
        return space.path(req);

    throw new Error(`'${req}' not found in namespace`);
  }

  static require(req){
    return require(Namespace.resolve(req));
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

  static _stripLeadingSlash(str){
    return str.replace(new RegExp(`/^${path.sep}*/`, ''));
  }

  /**
   * Create space from name, relative path from root
   * @param name {string} Namespace
   * @param rel {string} Path to namespace
   * @param root {string} Path to root
   * @returns {{name: string, root: string, location: string, test: RegExp}}
   * @private
   */
  static _createSpace({ name, rel, root }){
    return new Space({
      name,
      root: Namespace._ensureEndSlash(root),
      location: Namespace._ensureEndSlash(rel),
      test: new RegExp(`^${name}`)
    });
  }

  /**
   * Try to guess what path root we want
   * @private
   */
  static _getSpaceRoot(){
    return process.cwd(); //path.dirname(module.parent.paths[0])
  }

  /**
   * Read from configuration
   * @param conf {Object} Namespace configuration object
   * @param root {string} Path to root
   * @returns {Array}
   * @private
   */
  static _readConf(conf, root){
    let _spaces = [];

    root = root || Namespace._getSpaceRoot();

    for(let space of Object.keys(conf))
      _spaces.push(Namespace._createSpace({ name: space, rel: conf[space], root }));

    //Sort by more specific namespace first
    _spaces.sort(Namespace._spaceSorter);

    return _spaces;
  }

  /**
   * Sort namespaces based on length (more specific first)
   * @param a {string}
   * @param b {string}
   * @returns {number}
   * @private
   */
  static _spaceSorter(a,b){
    return b.name().length - a.name().length
  }

  /**
   * Sort global namespaces
   * @private
   */
  static _sortSpaces(){
    Namespace._spaces.sort(Namespace._spaceSorter);
  }

  /**
   * Add namespaces from object
   * @param obj {Object} Configuration object
   * @param root {string} Path to root
   */
  static addSpacesFromObject(obj, root){
    let _spaces = Namespace._readConf(obj, root);

    if(Namespace._spaces.length > 0)
      Namespace._spaces.push(..._spaces);
    else
      Namespace._spaces = _spaces;

    Namespace._sortSpaces();
  }

  static _clearSpaces(){
    Namespace._spaces = []
  }

  /**
   * Get object of all spaces Returns mutated spaces
   * @returns {Object}
   */
  static getSpaces(){
    //Super efficient deep clone
    return JSON.parse(JSON.stringify(Namespace._spaces));
  }
}

if(!Namespace._spaces)
  /**
   * Static variable of all namespaces
   * @type {Array}
   * @static
   * @private
   */
  Namespace._clearSpaces();

module.exports = {
  /**
   * Static namespace reference
   */
  namespace: Namespace,

  /**
   * Create namespace instance that references
   * @param conf {Object} Configuration object to add to global namespaces
   * @param root {string} Path to root of namespace
   */
  instance: (conf, root = null) => new Namespace(conf, root)
};
