StreamTTS-backend
====

## Run locally

```
$ npm start
```

## Deploy to Google App Engine

Create or select a Google Cloud project, enable the App Engine application for
that project, and install/authenticate the Google Cloud CLI. Then deploy from
the project root:

```
gcloud app deploy
```

The App Engine configuration uses the Node.js 22 standard runtime. Application
logs are written to the console and are available in Google Cloud Logging.