'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const myPackage = require(process.cwd() + '/package.json');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('yes');
  }

  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to classroomtechtools\' ' + chalk.red('generator-gaslocaldev') + ' generator!'
    ));

    if (!this.options.yes) {

      const prompts = [
        {
          type: 'input',
          name: 'appName',
          message: 'What is the name of your app?',
          default: myPackage.name || 'App'
        },
        {
          type: 'input',
          name: 'appNameSlug',
          message: 'What is your app\'s slug? (all lowercase, hyphens)',
          default: myPackage.name || 'app'
        },
        {
          type: 'input',
          name: 'description',
          message: 'Description',
          default: myPackage.description || ''
        },
        {
          type: 'input',
          name: 'version',
          message: 'Start at what version?',
          default: myPackage.version || '1.0.0'
        },
        {
          type: 'input',
          name: 'author',
          message: 'Author',
          default: myPackage.author || ''
        },
        {
          type: 'input',
          name: 'license',
          message: 'What license',
          default: myPackage.license || 'MIT'
        },
        {
          type: 'input',
          name: 'fileId',
          message: myPackage.fileId || 'Paste the file Id for gapps here'
        },
        {
          type:'list',
          name: 'appKind',
          message: 'Which kind of app are we making?',
          choices: ['SpreadsheetApp', 'DocumentApp'],
          default: myPackage.appKind || ''
        },
        {
          type: 'confirm',
          name: 'continue',
          message: 'We will copy files in both /dev and /src. Continue?',
          default: true
        },

      ];

      return this.prompt(prompts).then(props => {
        // To access props later use this.props.someAnswer;
        this.props = props;
      });

    }
  }

  writing() {

    var context = {
      'name': this.props.appName,
      'kind': {
          'SpreadsheetApp': {
              'mockClass': 'Spreadsheet',
              'service': 'SpreadsheetApp',
              'getActive': 'SpreadsheetApp.getActiveSpreadsheet()',
          },
          'DocumentApp': {
              'mockClass': 'Document',
              'service': 'DocumentApp',
              'getActive': 'DocumentApp.getActiveDocument()',
          }
        }[this.props.appKind],
    };

    ['dev', 'src', 'test'].forEach(subFolder => {
      this.fs.copyTpl(
        this.templatePath(subFolder),
        this.destinationPath(subFolder),
        context
      );
    });

    // Read in dependencies defined on our side, package them up 
    // along with other stuff already entered
    var dependencies = this.fs.readJSON(this.templatePath('dependencies.json'));
    this.props.dependencies = dependencies.dependencies;
    this.fs.writeJSON(this.templatePath('copyToRoot/package.json'), this.props);

    var rootDestination = process.cwd();
    ['copyToRoot'].forEach(subFolder => {
      this.fs.copy(
        this.templatePath(subFolder),
        rootDestination,
        context
      );
    });


  }

  install() {
    this.installDependencies({bower: false});   // do we need bower??
  }
};
