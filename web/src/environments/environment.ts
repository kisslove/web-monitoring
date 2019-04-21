// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  // production: false,
  // apiUrl:'http://localhost:9000/',
  // uploadDataUrl:'http://localhost:9000/Up',
  // jsHackUrl:'http://localhost:9002/bundle.js'
  production: false,
  apiUrl:'http://hubing.online:8081/',
  uploadDataUrl:'http://hubing.online:8081/Up',
  jsHackUrl:'https://gitee.com/binging/web-monitoring/blob/master/browser_probe/dist/bundle.js'
};
