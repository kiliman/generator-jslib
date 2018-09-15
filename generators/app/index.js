const Generator = require('yeoman-generator')
const mkdirp = require('mkdirp')
const _s = require('underscore.string')

class JslibGenerator extends Generator {
  async prompting() {
    const libname = this.appname.replace(/\s/g, '-')
    const username = await this.user.github.username()

    this.answers = await this.prompt([
      {
        name: 'libname',
        message: 'What is the name of your library?',
        default: libname,
        filter: x => _s.slugify(x)
      },
      {
        name: 'description',
        message: 'A description for your library',
        default: 'The awesome javascript library'
      },
      {
        name: 'authorName',
        message: 'Author name ?',
        store: true,
        default: this.user.git.name() || ''
      },
      {
        name: 'authorEmail',
        message: 'Author email ?',
        store: true,
        default: this.user.git.email() || ''
      },
      {
        name: 'license',
        message: 'License',
        default: 'MIT'
      },
      {
        name: 'username',
        message: 'Git username',
        store: true,
        default: username || ''
      },
      {
        name: 'repositoryUrl',
        message: 'repository url',
        default: `https://github.com/${username}/${libname}.git`
      },
      {
        name: 'repositoryType',
        message: 'repository type',
        default: 'git'
      }
    ])
  }

  writing() {
    const name = _s.slugify(this.answers.libname)

    const tpl = {
      libname: name,
      name: name.replace(/-js$/g, ''),
      description: this.answers.description,
      authorName: this.answers.authorName,
      authorEmail: this.answers.authorEmail,
      license: _s.trim(this.answers.license),
      username: _s.trim(this.answers.username),
      repositoryUrl: _s.trim(this.answers.repositoryUrl),
      repositoryType: _s.trim(this.answers.repositoryType)
    }

    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath('package.json'),
      tpl
    )
    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'),
      tpl
    )
    this.fs.copyTpl(
      this.templatePath('index.js'),
      this.destinationPath('src/index.js'),
      tpl
    )
    // setup test folder
    this.fs.write('test/.gitkeep', '')

    // copy template files directly and rename to leading .
    ;['_editorconfig', '_eslintrc.json', '_gitignore', '_prettierrc'].forEach(
      f => {
        this.fs.copy(
          this.templatePath(f),
          this.destinationPath(f.replace(/^_/, '.'))
        )
      }
    )
  }

  git() {
    this.spawnCommandSync('git', ['init'])
  }

  install() {
    this.installDependencies({ npm: true, bower: false })
  }
}

module.exports = JslibGenerator
