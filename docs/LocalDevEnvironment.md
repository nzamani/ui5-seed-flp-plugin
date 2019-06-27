# Local Development Environment

1. Install an editor of your choice, for example:
    * [VS Code (suggested)](https://code.visualstudio.com/)
    * [Atom](https://atom.io/)
    * [Notepad++](https://notepad-plus-plus.org/)
    * [Eclipse](http://www.eclipse.org/downloads/eclipse-packages/)
    * [Sublime](https://www.sublimetext.com/)
    * [WebStorm](https://www.jetbrains.com/webstorm/)
    * [IntelliJ](https://www.jetbrains.com/idea/)
    * or whatever fits best for you

1. Install the EditorConfig plugin for your chosen IDE:
    * see [http://editorconfig.org/](http://editorconfig.org/) for details

1. Git configuration
    * Windows: set git core.autocrlf to false to avoid issues with EditorConfig (needed only once):
        * `git config --global core.autocrlf false`

    * Git user information (if not done already)
        * `git config --global user.name "John Doe"`
        * `git config --global user.email "john.doe@mycompany.com"`

1. Create one of the following 2 files in the root of this project: `.nabi.json` and/or `.user.nabi.json`, i.e. by copying the template + changing the content with vi:
    * `cp .nabi/defaults/.nabi.json .nabi.json` and then `vi .nabi.json`
    * `cp .nabi/defaults/.nabi.json .user.nabi.json` and then `vi .user.nabi.json`

    The content of the file describes where to find the files `.sapdeploy.json` and `.sapdeployuser.json`, which we will  create in the next steps. The app section allosw to specify a more fine grained configuration of the resources used by the app (appresources are bundled with the app):

    * `.nabi.json` (default):

        ```json
        {
            "_version": "0.3.0",
            "sapdeploy" : {
                "configFile" : ".sapdeploy.json",
                "credentialsFile" : "/path/to/my/.sapdeployuser.json"
            },
            "sapui5" : {
                "sdk" : "/path/to/my/local/sapui5-sdk/1.65.1/",
                "required" : {
                    "downloadUrl" : "https://tools.hana.ondemand.com/additional/sapui5-sdk-1.65.1.zip",
                    "downloadTo" : "/path/to/my/local/sapui5-sdk",
                    "deleteDownloadOnDone" : true
                }
            },
            "app" : {
                "resources" : [
                    "node_modules/@openui5/sap.ui.core/src",
                    "node_modules/@openui5/sap.m/src",
                    "node_modules/@openui5/sap.f/src",
                    "node_modules/@openui5/sap.ui.layout/src",
                    "node_modules/@openui5/sap.ui.unified/src",
                    "node_modules/@openui5/themelib_sap_belize/src"
                ],

                "testresources" : {
                    "symlinkParent" : "@nabiTestResources",
                    "symlinks" : [
                        {"name":"ui5-seed-customtheme", "path":"node_modules/ui5-seed-customtheme"}
                    ],
                    "dirs" : [
                        "myDir"
                    ]
                },

                "appresources" : {
                    "symlinkParent" : "@nabiAppResources",
                    "symlinks" : [
                        {"name":"moment", "path":"node_modules/moment", "target":"thirdparty"}
                    ],
                    "dirs" : [
                        "myDependencyDir"
                    ]
                }
            }
        }
        ```

    * `.user.nabi.json` (we only overwrite the path to the credentialsFile and the sapui5 section):

        ```json
        {
            "_version": "0.3.0",
            "sapdeploy" : {
                "credentialsFile" : "/home/myuser/.sapdeployuser.json"
            },
            "sapui5" : {
                "sdk" : "/home/myuser/dev/sapui5-sdk/1.65.1/",
                "required" : {
                    "downloadUrl" : "https://tools.hana.ondemand.com/additional/sapui5-sdk-1.65.1.zip",
                    "downloadTo" : "/home/myuser/dev/sapui5-sdk",
                    "deleteDownloadOnDone" : true
                }
            }
        }
        ```

    **Hint:** The file `.nabi.json` can contain global settings checked in into git so that everybody has these settings. Using `.user.nabi.json` allows to overwrite the project/global settings according to the needs of the current developer. Thus, `.user.nabi.json` is never checked in (see `.gitignore` file)! Having one of the 2 files with the correct configuration is enough for the deployment via sapdeploy. In the example above we keep the configFile at `.sapdeploy.json` (default) and we overwrite the credentialsFile with `/home/myuser/.sapdeployuser.json` assuming your user's home dir is in `/home/myuser/` (please change as needed). In this case we actually don't even need the file `.nabi.json` because its content is the default anyway. On Windows all paths separators must be double back slashes, i.e. for the SAPUI5 SDK `"D:\\sapui5-sdk\\1.65.1"`.

    **IMPORTANT:** It is suggested to put the credentials file (`.sapdeployuser.json`) into the user's home dir. For details see below.

1. Create a file `.sapdeploy.json` in the root of this project, i.e. by copying the template + changing the content with vi:
    * `cp .nabi/defaults/.sapdeploy.json .sapdeploy.json`
    * `vi .sapdeploy.json`:

        ```json
        {
            "NPL": {
                "options": {
                    "conn": {
                        "server": "https://vhcalnplci:44300",
                        "useStrictSSL" : false
                    },
                    "ui5": {
                        "package": "ZUI5_SEED",
                        "bspcontainer": "ZUI5_SEED_FLP",
                        "bspcontainer_text": "UI5 Seed FLP PLUGIN",
                        "transportno": "NPLT123456",
                        "language" : "EN",
                        "calc_appindex" : true
                    },
                    "resources": {
                        "cwd": "<%= dir.distWebapp %>",
                        "src": "**/*.*"
                    }
                }
            }
        }
        ```

    * The example content of the file deploys to a target system which we simply call `NPL`
    * This file can and should be checked in into your own git repo (maybe in an own branch)
    * The basic config for each target system looks like this:
        * **conn.server**: The base url to the abap server used as target for deployment
        * **conn.useStrictSSL**: If true then the server must have a valid certificate
        * **ui5.package**: The package in which the BSP is created
        * **ui5.bspcontainer**: The name of the BSP application containing the UI5 app (max 15 chars)
        * **ui5.bspcontainer_text**: The description for the BSP application
        * **ui5.transportno**: The existing and modifiable Transport Request (make sure you have a task in this request!)
        * **ui5.language**: please always use "EN"
        * **ui5.calc_appindex**: If true then the UI5 app index gets calculated
        * **resources:cwd**: Must point to the folder containing the lib manifest (in the build results folder)

    **Hint:** The ABAP deployment intertnally uses [grunt-nwabap-ui5uploader](https://github.com/pfefferf/grunt-nwabap-ui5uploader). Have a look at the documentation for config details. Basically, what you see in `.sapdeploy.json` comes from [grunt-nwabap-ui5uploader](https://github.com/pfefferf/grunt-nwabap-ui5uploader). However, the `auth` config is extracted into `.sapdeployuser.json` (see next step).

1. Create a file `.sapdeployuser.json` in you user's home dir (replace user/password with your real credentials), i.e. by copying the template + changing the content/credentials with vi:
    * `cp .nabi/defaults/.sapdeployuser.json ~/.sapdeployuser.json`
    * `vi ~/.sapdeployuser.json`:

        ```json
        {
            "NPL":{
                "options":{
                    "auth":{
                        "user": "myUser",
                        "pwd": "myPwd"
                    }
                }
            }
        }
        ```

    **Hint:** Make sure not to show this file to anyone. It's ouside of the project to avoid it gets checked in accidentally.
    The credentials in this file are used for the sap deployment task (sapdeploy), see [READEME](../README.md). `NPL` is a key/placeholder and that correspond to the configuration of the sapdeploy task (see file `.sapdeploy.json` in project root).
