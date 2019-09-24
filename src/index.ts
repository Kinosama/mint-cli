// Imports
import Logit from 'alvarocabreradam-logit';
import inquirer, { QuestionCollection } from 'inquirer';
import fse from 'fs-extra';
import fs from 'fs';
import * as files from './asets/files';

// class
class MintCli {

    // Attributes
    public test: string = 'Test';
    public log: Logit;
    private config = {
        template: 'javascript',
        makefile: false,
        base: false,
        properties: {
            name: 'mint-app',
            author: 'Mint',
            version: '0.0.1',
            assets: 'assets',
            type: 0,
        }
    }

    // Inquirer questions
    private templateQuestions: QuestionCollection = {
        type: 'list',
        name: 'template',
        message: 'Que lenguaje deseas usar?',
        choices: ['JavaScript', 'TypeScript']
    }

    private configQuestions: QuestionCollection = [
        {
            name: 'name',
            message: 'Especifica el nombre del proyecto.',
            default: this.config.properties.name
        },
        {
            name: 'author',
            message: 'Especifica el autor del proyecto.',
            default: this.config.properties.author
        },
        {
            name: 'version',
            message: 'Especifica la version del proyecto.',
            default: this.config.properties.version
        },
        {
            name: 'assets',
            message: 'Especifica la carpeta de assets del proyecto.',
            default: this.config.properties.assets
        }
    ];

    // Constructor
    constructor() {
        this.log = new Logit('@mint/cli');
        this.log.activate();
    }

    // Methods
    mint(args: any): void {
        args = args.slice(2);
        this.choseCommand(args[0], args.slice(1));
    }

    choseCommand(command: string, args: string[]) {
        switch (command) {
            case 'init':
                this.init(args[0], args);
                break;
            default:
                this.log.error(`The specified command ("${command}") is invalid. For a list of available options, run "mint help".`);
                break;
        }
    }

    init(template: string, args: string[]): void {
        this.log.info('Creating Mint setup, please wait!');
        if (template) {
            this.choseTemplate(template);
        } else {
            inquirer.prompt(this.templateQuestions).then((answers => { this.choseTemplate(answers.template); }));
        }
        if (args.find((arg) => { return arg.toLowerCase() === '--makefile' || arg.toLowerCase() === '-m' })) {
            this.config.makefile = true;
        }
        if (args.find((arg) => { return arg.toLowerCase() === '--base' || arg.toLowerCase() === '-b' })) {
            this.config.base = true;
        }
        if (!args.find((arg) => { return arg.toLowerCase() === '--yes' || arg.toLowerCase() === '-y' })) {
            this.configProperties();
        }
    }

    private choseTemplate(template: string) {
        switch (template.toLowerCase()) {
            case 'javascript':
                this.choseJavaScript();
                break;
            case 'typescript':
                this.choseTypeScript();
                break;
            default:
                this.log.error(`The specified template ("${template}") is invalid. For a list of available options, run "mint templates".`);
                break;
        }
    }

    private choseTypeScript() {
        this.log.info('TypeScript chosed!');
        this.config.template = 'typescript';
        this.config.properties.type = 3;
    }

    private choseJavaScript() {
        this.log.info('JavaScript chosed!');
        this.config.template = 'javascript';
        this.config.properties.type = 1;
    }

    private configProperties() {
        inquirer.prompt(this.configQuestions).then((answers) => {
            this.config.properties.name = answers.name;
            this.config.properties.author = answers.author;
            this.config.properties.version = answers.version;
            this.config.properties.assets = answers.assets;
            this.createFiles();
        });
    }

    createFiles(): void {

        // Create project properties
        this.createProjectProperties();

        // Create assets folder
        this.createAssetsFolder();

        // Create image
        this.createIconFile();

        // Create Makefile
        this.createMakefile();

        // Create base code
        this.choseBaseCode();

    }

    private createProjectProperties() {
        this.log.info('Creating default Mint project!');
        fse.outputFile('Project.mint.json', files.composeProjectProperties(this.config.properties.name, this.config.properties.author, this.config.properties.version, this.config.properties.assets, this.config.properties.type), (err) => {
            if (err) {
                new Logit('@mint/cli').error(`The Project.mint.json can't be created. ${err}`);
            }
        });
    }

    private createAssetsFolder() {
        fse.emptyDir(this.config.properties.assets, (err) => {
            if (err) {
                new Logit('@mint/cli').error(`The assets dir can't be created. ${err}`);
            }
        });
    }

    private createIconFile() {
        fs.writeFile('icon.png', files.composeBase64(), { encoding: 'base64' }, (err) => {
            if (err) {
                new Logit('@mint/cli').error(`The image can't be created. ${err}`);
            }
        });
    }


    private createMakefile() {
        if (this.config.makefile) {
            this.log.info('Creating Makefile!');
            fse.outputFile('Makefile', files.composeMakefile(), (err) => {
                if (err) {
                    new Logit('@mint/cli').error(`The Makefile can't be created. ${err}`);
                }
            });
        }
    }

    private choseBaseCode() {
        if (this.config.base) {
            this.log.info('Creating default Mint project!');
            if (this.config.template === 'javascript') {
                this.createBaseCode('index.js');
            }
            if (this.config.template === 'typescript') {
                this.createBaseCode('index.ts');
            }
        }
    }

    private createBaseCode(filename: string) {
        fse.outputFile(`${this.config.properties.name}/${filename}`, files.composeBase(), (err) => {
            if (err) {
                new Logit('@mint/cli').error(`The Makefile can't be created. ${err}`);
            }
        });
    }

}

// Export
export = MintCli;