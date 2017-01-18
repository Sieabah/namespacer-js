'use strict';

const namespace = require('../namespacer'),
  Namespace = namespace.namespace,
  path = require('path'),
  fs = require('fs'),
  expect = require('expect.js');

describe('Namespace Tests', function(){
  describe('Basics', function(){
    const Space = require('../lib/Space');

    beforeEach(function(done){
      Namespace._clearSpaces();
      done();
    });

    it('Create instance', function(){
      let instance = namespace.instance({'NS/': 'Namespace/'}, path.resolve('./tests'));
      let spaces = Namespace._spaces;

      expect(instance).to.be.a('object');
      expect(spaces).to.have.length(1);

      expect(spaces[0]).to.be.a(Space);
    });

    it('Explode if given no actual config', function(){
      expect(namespace.instance).to.throwException();
    });

    it('Should clear spaces correctly', function(){
      namespace.instance({'NS/': 'Namespace/'}, path.resolve('./tests'));

      expect(Namespace.getSpaces().length > 0).to.eql(true);

      Namespace._clearSpaces();

      expect(Namespace.getSpaces().length).to.equal(0);
    });

    it('Should have correct root if passed', function(){
      namespace.instance({'NS/': 'Namespace/'}, path.resolve('./tests'));

      let space = Namespace._spaces[0];

      expect(space).to.be.a('object');
      expect(space.root()).to.be.a('string');
      expect(space.root()).to.eql(path.resolve('./tests')+'/');
    });

    it('Should have pull root with node_modules', function(){
      namespace.instance({'NS/': 'Namespace/'});

      let space = Namespace._spaces[0];

      expect(space).to.be.a('object');
      expect(space.root()).to.be.a('string');
      expect(space.root()).to.eql(path.resolve('./')+'/');
    });

    it('Can resolve from namespace', function(){
      namespace.instance({'NS/': 'Namespace/'}, path.resolve('./tests'));
      let filepath = Namespace.resolve('NS/Thing.js');

      expect(filepath).to.eql(path.resolve('./tests/Namespace/Thing.js'));
    });

    it('Explodes if name is not in namespace', function(){
      namespace.instance({'NS/': 'Namespace/'}, path.resolve('./tests'));
      expect(Namespace.resolve).withArgs('NOTHERE/Thing.js').to.throwException();
    });

    it('Can resolve more specific space first', function(){
      const Thing = require('./Namespace/Thing');

      namespace.instance({'NS/': 'Namespace/', 'NS/Specific': 'Namespace/Spec'}, path.resolve('./tests'));

      expect(Namespace.resolve('NS/Specific/Thing.js')).to.eql(path.resolve('./tests/Namespace/Spec/Thing.js'));

      let sorted = [];
      for(let space of Namespace._spaces)
        sorted.push(space.name());

      expect(sorted).to.eql(['NS/Specific', 'NS/']);
    });

    it('Can add more namespaces', function(){
      const Thing = require('./Namespace/Thing');

      Namespace.addSpacesFromObject({'NS/': 'Namespace/'}, path.resolve('./tests'));
      Namespace.addSpacesFromObject({'NS/Specific': 'Namespace/Spec'}, path.resolve('./tests'));

      let sorted = [];
      for(let space of Namespace._spaces)
        sorted.push(space.name());

      expect(sorted).to.eql(['NS/Specific', 'NS/']);
    });

    it('Can require from namespace', function(){
      const Thing = require('./Namespace/Thing');

      namespace.instance({'NS/': 'Namespace/'}, path.resolve('./tests'));
      let thing = new (Namespace.require('NS/Thing.js'));

      expect(thing).to.be.a(Thing);
    });
  });

  describe('File testing', function(){

    beforeEach(function(done){
      Namespace._clearSpaces();
      done();
    });

    describe('Absolute filepathing', function(){
      it('Can load namespaces', function(){
        Namespace.addSpacesFromFile(path.resolve('./tests/.spaces.js'));

        expect(Namespace.getSpaces()).to.have.length(1);
      });

      it('Can require from namespaces', function(){
        Namespace.addSpacesFromFile(path.resolve('./tests/.spaces.js'));

        const Thing = require('./Namespace/Thing');

        let thing = new (Namespace.require('NS/Thing.js'));

        expect(thing).to.be.a(Thing);
      });
    });

    describe('Relative filepathing', function(){
      it('Can load namespaces', function(){
        Namespace.addSpacesFromFile('./.spaces.js');

        expect(Namespace.getSpaces()).to.have.length(1);
      });

      it('Can require from namespaces', function(){
        Namespace.addSpacesFromFile('./.spaces.js');

        const Thing = require('./Namespace/Thing');

        let thing = new (Namespace.require('NS/Thing.js'));

        expect(thing).to.be.a(Thing);
      });
    });

    describe('Default filepathing', function(){
      it('Can load namespaces from default JSON', function(){
        Namespace.addSpacesFromFile();

        expect(Namespace.getSpaces()).to.have.length(2);

        const DevConfig = require('./ENV/dev/config');

        //This is to verify it's the JSON not JS file being loaded
        let config = Namespace.require('ENV/config.js');

        expect(config).to.eql(DevConfig);
      });

      it('Can load namespaces from default JS', function(done){
        try {
          process.chdir('./tests');

          Namespace.addSpacesFromFile();
          expect(Namespace.getSpaces()).to.have.length(1);

          done();
        } catch(e){
          done(e);
        } finally {
          process.chdir('../');
        }
      });

      it('Will explode if it can\'t find spaces file', function(done){
        try {
          fs.rename(path.resolve('./.spaces.json'), path.resolve('./.spaces-test.json'));

          expect(Namespace.addSpacesFromFile).to.throwException();

          done();
        } catch(e){
          done(e);
        } finally {
          fs.rename(path.resolve('./.spaces-test.json'), path.resolve('./.spaces.json'));
        }
      });

      it('Can require from namespaces', function(){
        Namespace.addSpacesFromFile();

        const Thing = require('./Namespace/Thing');

        let thing = new (Namespace.require('NS/Thing.js'));

        expect(thing).to.be.a(Thing);
      });
    });

    describe('Enviroment Namespace', function(){
      const DevConfig = require('./ENV/dev/config');
      const ProdConfig = require('./ENV/prod/config');

      it('Can load dev environment file', function(){
        Namespace.addSpacesFromObject(require('./.env.spaces')('dev'), path.resolve('./tests'));

        let config = Namespace.require('ENV/config.js');

        expect(config).to.eql(DevConfig);
        expect(config).not.to.equal(ProdConfig);
      });

      it('Can load prod environment file', function(){
        Namespace.addSpacesFromObject(require('./.env.spaces')('prod'), path.resolve('./tests'));

        let config = Namespace.require('ENV/config.js');

        expect(config).to.eql(ProdConfig);
        expect(config).not.to.equal(DevConfig);
      });
    });
  });
});
