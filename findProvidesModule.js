/**
 * Created by tdzl2003 on 10/3/16.
 */

const fs = require('fs');
const path = require('path');

const blacklist = {
  "__tests__": true,
  "react-packager": true,
  "androidTest": true,
}

function findProvidesModule(dirs){
  const ret = {};

  const walk = (dir) => {
    const stat = fs.statSync(dir);

    if (stat.isDirectory()){
      fs.readdirSync(dir).forEach(file => {
        if (!blacklist[file]) {
          walk(path.resolve(dir, file));
        }
      });
      return;
    } else if (stat.isFile()) {
      const mName = /^(.*)\.js$/.exec(dir);
      if (!mName) {
        return;
      }
      const mPlatform = /^(.*)\.\w+$/.exec(mName[1]);
      const module = mPlatform ? mPlatform[1] : mName[1];

      const content = fs.readFileSync(dir, 'utf-8');
      const m = /@providesModule ([\w\.]+)/.exec(content);
      if (m) {
        if (ret[m[1]] && ret[m[1]] !== module) {
          console.warn(`Duplicated module ${m[1]}: \n${ret[m[1]]}\n${module}`);
        }
        ret[m[1]] = module;
      }

    }

  };
  dirs.forEach(walk);

  return ret;
}

module.exports = findProvidesModule;
