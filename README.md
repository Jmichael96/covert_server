## Deployments
- Run `gcloud run deploy covertservertest --region us-central1 --source .` for testing deployments
- To Deploy secrets, run `gcloud run services update covertservertest --region us-central1 --set-secrets="GCP_ID=COVERT_SECRETS:3,GCP_SECRET=COVERT_SECRETS:4, TWILIO_ACCOUNT_SID=COVERT_SECRETS:5,TWILIO_AUTH_TOKEN=COVERT_SECRETS:6,TWILIO_NUMBER=COVERT_SECRETS:7,JWT_SECRET=COVERT_SECRETS:8,GCP_DATASET=COVERT_SECRETS:9,CRYPTR_SECRET=COVERT_SECRETS:10,CLIENT_ID=COVERT_SECRETS:11,CLIENT_SECRET=COVERT_SECRETS:12"`

## NODE VERSION
`v16.15.0`

## DB
- BigQuery
---
https://www.npmjs.com/package/@google-cloud/bigquery#using-the-client-library
- Create a service account and follow the steps [link](https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts/create?supportedpurview=project&_ga=2.54470700.568419352.1663260887-1083794692.1658953165&_gac=1.251665915.1663260930.Cj0KCQjwmouZBhDSARIsALYcouqZf44vyzqzoBXyn_3A8BqLF_QfSAhpWGbLA1crZrYy7C9QmpTiDnYaAlQSEALw_wcB)
- Navigate into the created service account and create a service key. Move it to the root directory of the project and change the file name.
- Then add this export inside your alias file `export GOOGLE_APPLICATION_CREDENTIALS="KEY_PATH"`
- Seed `(prod)npm run seeds -- prod || (dev) npm run seeds`
- Drop `(prod)npm run dropSeeds -- prod || (dev) npm run dropSeeds`

## CRON JOBS

0 1 2 3 4

0 = Minute
1 = Hour
2 = Day (month)
3 = Month
4 = Day (week)


## PACKAGE DOCS
- custom-uuid [link](https://www.npmjs.com/package/custom-uuid)
- @google-cloud/scheduler [link](https://github.com/googleapis/nodejs-scheduler)
- JSDOC [link](https://jsdoc.app/)