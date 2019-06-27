# Continuous Integration/Deployment via Jenkins

> This will only work in case you have the setup which I will soon blog about.

The [following Jenkins Jobs](https://my.jenkins.corp/job/UI5/view/Templates/) can be used as templates for your own Jenkins jobs:

1. ui5-seed-freestyle-validate
    * **Triggered on Gerrit Event**
        * `Patchset Created`

1. ui5-seed-freestyle-deploy
    * **Triggered on Gerrit Event**
        * `Change Merged`

1. ui5-seed-pipeline-aio
    * **Triggered on Gerrit Events**
        * `Patchset Created`
        * `Change Merged`
    * Build + deployment are only executed in case of **Change Merged**
    * **aoi** stands for "All-In-One"

1. ui5-seed-pipeline-validate
    * **Triggered on Gerrit Event**
        * `Patchset Created`

1. ui5-seed-pipeline-deploy
    * **Triggered on Gerrit Event**
        * `Change Merged`

1. ui5-seed-pipeline-deploy-quiet
    * **Triggered on Gerrit Event**
        * `Change Merged`
    * Waits 300 seconds to collect commits before deploying

1. ui5-seed-pipeline-deploy-pollscm
    * **Triggered via Poll SCM**
        * Every 15 minutes
        * Checks the git master for changes and deploys if code has changed

**HINT:** Be aware that these jobs are only triggered if the code has changed, or in other words: if for example only the commit messaeg has changed the jobs are not triggered.

The suggestion is to use `ui5-seed-pipeline-validate` together with one of the `pipline-deploy` job templates (i.e. `ui5-seed-pipeline-deploy-pollscm`) because these are pipelines based on the somewhat new Declarative Syntax. Feel free to create your own jobs and your own Jenkinsfile in case the suggested Jenkinsfiles and jobs do not fit your use case. The deploy jobs execute everything the validate jobs execute, and then the deployment is triggered afterwards. Please understand the difference of the template jobs mentioned above.

The `deploy` jobs require adding a task for the user `ZSJENKINS` to the transport declared inside `.sapdeploy.json`. Of course, the task/transport must be open.

**ATTENTION:** The `aio` job and all `deploy` jobs use locks for the deployment task itself to avoid parallel SAP deployments of the same project. The lock is based on the gerrit project name. However, for deployments triggered by gerrit this does not guarantee the order of **Change Merged** to be the order in which the project is deployed to SAP. To solve this issue you could simply use `ui5-seed-pipeline-deploy-pollscm` for deployment of your projects.
