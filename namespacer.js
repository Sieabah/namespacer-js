'use strict';

const path = require('path');

class Namespace {
    constructor(conf, root){
        if(!conf)
            throw new Error('No namespace config given');

        Namespace.addSpacesFromObject(conf, root);
    }

    static resolve(req) {
        for (let space of Namespace._spaces)
            if (space.test.exec(req))
                return space.root + space.location + req.replace(space.test, '').replace(`/^${path.sep}*/`, '');

        throw new Error(`'${req}' not found in namespace`);
    }

    static _ensureEndSlash(str){
        return str.replace(`/${path.sep}*$/`, '')+path.sep;
    }

    static _createSpace({ name, rel, root }){
        return {
            name,
            root: Namespace._ensureEndSlash(root),
            location: rel.replace(`/${path.sep}*$/`, '')+path.sep,
            test: new RegExp(`^${name}`)
        };
    }

    static _readConf(conf, root){
        let _spaces = [];

        root = root || path.dirname(module.parent.paths[0]);

        for(let space of Object.keys(conf))
            _spaces.push(Namespace._createSpace({ name: space, rel: conf[space], root }));

        //Sort by more specific namespace first
        _spaces.sort(Namespace._spaceSorter);

        return _spaces;
    }

    static _spaceSorter(a,b){
        return b.name.length - a.name.length
    }

    static _sortSpaces(){
        Namespace._spaces.sort(Namespace._spaceSorter);
    }

    static addSpacesFromObject(obj, root){
        let _spaces = Namespace._readConf(obj, root);

        if(Namespace._spaces.length > 0)
            Namespace._spaces.push(..._spaces);
        else
            Namespace._spaces = _spaces;

        Namespace._sortSpaces();
    }

    static getSpaces(){
        //Super efficient deep clone
        return JSON.parse(JSON.stringify(Namespace._spaces));
    }
}

if(!Namespace._spaces)
    Namespace._spaces = [];

module.exports = {
    namespace: Namespace,
    instance: (conf, root) => new Namespace(conf, root)
};
