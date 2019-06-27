# UI5 Seed FLP Plugin

> A project UI5 template for Fiori Launchpad Plugins. You can copy this template and use it for your own UI5 projects.

## Version Info

* SAPUI5: 1.65.1
* OpenUI5: 1.65.1
* NodeJs: 10.16.0

## Getting started

1. Install [node.js](http://nodejs.org/) (**IMPORTANT:** choose latest LTS version, i.e. 10.16.0 LTS)

1. Install [git](https://git-scm.com/) if you haven't

1. Optional: Proxy Configuration in case you are working behind a proxy (see [Developing UI5](https://github.com/SAP/openui5/blob/master/docs/developing.md) for details)

    ```sh
    HTTP_PROXY=http://proxy:8080
    HTTPS_PROXY=http://proxy:8080
    FTP_PROXY=http://proxy:8080
    NO_PROXY=localhost,127.0.0.1,.mycompany.corp
    ```

    **Hint:** See [Proxy Settings](docs/ProxySettings.md) for additional details.

1. Configure your [Local Development Environment](docs/LocalDevEnvironment.md) as described

1. Install some tools globally one by one or at once
    * One by one
        * `npm install -g grunt-cli`
        * `npm install -g eslint`
        * `npm install -g napa`
    * or together at once
        * `npm install -g grunt-cli eslint napa`

1. Clone the repository and navigate into it

    ```sh
    git clone https://github.com/nzamani/ui5-seed-flp-plugin.git
    cd ui5-seed-flp-plugin
    ```

1. Install all npm dependencies + setup symlinks
    * Option 1 - separate commands
        * `npm install --ignore-scripts`
        * `napa`
        * `npm run setupSymlinks`
    * Option 2 - one command that runs `setupSymlinks` as well
        * `npm install`

    **Hint:** `npm install` will try to download a theme from git via ssh. Either setup your local ssh config correctly (you'll need to generate ssh key pairs + publish your public key to your remote git as well) or remove the corresponding dependency from the `package.json` file.

1. **Optional:**
    * Option 1: Automated installation of SAPUI5 SDK
        * create a file `.user.nabi.json` and override the section `sapui5`
        * `npm run installsapui5`

    * Option 2: Manually download [SAPUI5](https://tools.hana.ondemand.com/#sapui5)
        * [SAPUI5 SDK 1.65.1 zip file](https://tools.hana.ondemand.com/additional/sapui5-sdk-1.65.1.zip)
        * Extract the contents somewhere on your disk (you can reuse this download in other projects as well), i.e. `D:\sapui5-sdk\1.65.1\sapui5` or `~/dev/sapui5-sdk/1.65.1/sapui5` (assuming the folders exist)

        **IMPORTANT:** The content must be extracted into a folder called `sapui5`!

1. Run grunt to lint, build, run the app:
    * `grunt` : linting + run directly without build
    * `grunt serve` : same as serve:src
    * `grunt serve:src` : run directly without build
    * `grunt serve:dist` : run the content in `./dist/webapp`, which may include dev/test resources or ABAP build etc.
    * `grunt serve:tdd` : run in test driven development mode where tests are executed as soon as sources change
    * `grunt serve:babel` : run the app with babel (babel build triggered on file changes)
    * `grunt serve:edge` : run the app with all features turned on (babel, tdd)
    * `grunt lint` : linting
    * `grunt test` : execute OPA and QUnit tests, generate/print code coverage report under `build/reports`
    * `grunt test:ci` : same as `grunt test` but fail if code coverage rules are not fulfilled
    * `grunt build` : create distribution ready for ABAP upload (./dist/webapp.zip)
    * `grunt build:babel` : build a distribution with babel ready for ABAP upload (./dist/webapp.zip)
    * `grunt jsdoc` : generate jsdoc

1. Open the app in your browser: [http://localhost:8080](http://localhost:8080)

## SAP Deployment

1. Update the file `.sapdeploy.json` in the root of this project:

    * **conn.server**: The base url to the abap server used as target for deployment ([https://fldev.witglobal.net](https://fldev.witglobal.net))
    * **conn.useStrictSSL**: If true then the server must have a valid certificate
    * **ui5.package**: The SAP package in which the BSP is created, i.e. "ZUI5_APPS"
    * **ui5.bspcontainer**: The name of the BSP application containing the UI5 app, i.e. "ZUI5_SEED_APP"
    * **ui5.bspcontainer_text**: The description for the BSP application, i.e. "UI5 Seed App"
    * **ui5.transportno**: The existing an modifiable Transport Request (make sure you have a task in this request!), i.e. "NPLT123456" - change as required!
    * **ui5.language**: please always use "EN"
    * **ui5.calc_appindex**: If true then the UI5 app index get calculated

1. Lint + build + deploy to SAP via Grunt
    * `grunt sapdeploy` : build + deploy to SAP
    * `grunt sapdeploy:babel` : build with babel + deploy to SAP

1. **Appetizer:** Soon I'll blog about how my [Jenkins integration](docs/Jenkins.md) works

## Hints

1. Proxy Issues

    If you face any strange issues during `git clone` or `npm install` then check your proxy settings. Maybe you need the user/name  added explicitely to the proxy uri. Maybe you have a different proxy than the one mentioned above, or maybe you are using a wrong user/password combination. Sorry for the headache - but don't blame me, blame the proxy :-)

1. Executing with real OData Service on your backend

    Make sure to disable the same-origin policy in your browser (you might have to restart the browser) for dev. Then open your Server/FLP at least once to authenticate before you open the app in your browser via localhost.
