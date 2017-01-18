'use strict';

const path = require('path'),
      fs = require('fs'),
      glob = require('glob');

const Space = require('./lib/Space'),
      Listing = require('./lib/Listing');

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
    if(req == null)
      throw new Error(`'${req}' path must be defined`);

    for (let space of Namespace._spaces)
      if (space.test(req))
        return space.path(req);

    throw new Error(`'${req}' not found in namespace`);
  }

  /**
   * Resolve and require namespace
   * @param req {string} Namespaced path
   * @return {Object|*}
   */
  static require(req){

    if(glob.hasMagic(req)) {
      //Strip pesky glob
      let _all = req.replace(new RegExp(/\*\*$/), '');
      let _immediate = req.replace(new RegExp(/\*$/), '');

      if(_all !== req)
        return Namespace.listAll(_all).map((listing) => listing.require());
      else
        return Namespace.list(_immediate).map((listing) => listing.require());
    }

    return require(Namespace.resolve(req));
  }

  /**
   * Create space from name, relative path from root
   * @param name {string} Namespace
   * @param rel {string} Path to namespace
   * @param root {string} Path to root
   * @returns {Space}
   * @private
   */
  static _createSpace({ name, rel, root }){
    return new Space({ name, root, location: rel });
  }

  /**
   * List files in immediate namespace
   * @param req {string} Namespaced path
   * @param globStr {string} Glob to list files with
   */
  static list(req, globStr='!(_)*.js'){
    if(req == null)
      throw new Error('No namespace given');

    let space = Namespace.resolve(req);

    return glob.sync(`${space}/${globStr}`).map((path) => new Listing({path}));
  }

  /**
   * List all files in namespace
   * @param req {string} Namespaced path
   * @param globStr {string} Glob to list files with
   */
  static listAll(req, globStr='!(_)*.js'){
    if(req == null)
      throw new Error('No namespace given');

    let space = Namespace.resolve(req);

    return glob.sync(`${space}/**/${globStr}`).map((path) => new Listing({path}));
  }

  /**
   * Try to guess what path root we want
   * @private
   */
  static _getSpaceRoot(){
    return process.cwd(); //path.dirname(module.parent.paths[0])
  }

  /**
   * Get spaces file relative to including module
   * @param fp {string} Relative path to spaces file
   * @private
   * @return {string}
   */
  static _getSpaceRootFromIncludedModule(fp){
    return path.normalize(path.join(path.dirname(module.parent.filename), fp));
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

  /**
   * Load namespace from file
   * @param fp {string|null} Absolute or relative path
   */
  static addSpacesFromFile(fp=null){
    if(fp == null){
      //Find default files
      let js = path.normalize(path.join(Namespace._getSpaceRoot(), '.spaces.js'));
      let json = path.normalize(path.join(Namespace._getSpaceRoot(), '.spaces.json'));

      if(fs.existsSync(js))
        fp = js;
      else if (fs.existsSync(json))
        fp = json;
      else
        throw new Error('No spaces file could be found!');
    }

    if(path.isAbsolute(fp))
      Namespace.addSpacesFromObject(require(fp), path.dirname(fp));
    else {
      let absolute = Namespace._getSpaceRootFromIncludedModule(fp);
      Namespace.addSpacesFromObject(require(absolute), path.dirname(absolute));
    }
  }

  /**
   * Clear out namespaces
   * This destroys data
   * @private
   */
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
