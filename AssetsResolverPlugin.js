/**
 * Created by tdzl2003 on 10/3/16.
 */

const Tapable = require('tapable');
const path = require('path');
const Module = require('webpack/lib/Module');
const ModuleParseError = require('webpack/lib/ModuleParseError');
const fs = require('fs');
const imageSize = require('image-size');

class AssetsModule extends Module {
  constructor({context, request, userRequest, resource}){
    super();

    this.path = path.resolve(context, resource);
    this.request = request;
    this.userRequest = userRequest;
    this.type = 'commonjs2';

    this.error = null;
  }
  identifier() {
    return this.request;
  }
  readableIdentifier(requestShortener) {
    return requestShortener.shorten(this.userRequest);
  };
  needRebuild(fileTimestamps, contextTimestamps) {
    return true;
  }
  get httpServerLocation() {
    const loc = path.relative(process.cwd(), path.dirname(this.path));
    return loc;
  }
  build(options, compilation, resolver, fs, callback) {
    this.buildTimestamp = new Date().getTime();
    this.built = true;
    callback();
  }
  source() {
    try {
      return this.nativeSource();
    } catch (e) {
      return `throw new Error(${JSON.stringify(e.message)})`;
    }
  }
  nativeSource() {
    const dir = path.dirname(this.path);
    const ext = path.extname(this.path);
    const basename = path.basename(this.path, ext);
    const extWithPlatform = `.${__PLATFORM__}${ext}`;
    const files = fs.readdirSync(dir).map(file => {
      // check start point.
      if (file.substr(0, basename.length) !== basename) {
        return false;
      }
      if (file[basename.length] !== '@') {
        const fileExt = file.substr(basename.length);
        if (fileExt !== ext && fileExt !== extWithPlatform) {
          return false;
        }
        return [1, path.join(dir, file)];
      }
      const pos = file.indexOf('x.', basename.length);
      if (pos < 0) {
        // not found
        return false;
      }
      // check extension.
      const fileExt = file.substr(pos+1);
      if (fileExt !== ext && fileExt !== extWithPlatform) {
        return false;
      }
      // get and check scale
      const scale = file.substr(basename.length+1, pos - basename.length -1);
      if (scale === '1') {
        // console.warn(`@1x should be omitted, skiping ${file}`);
        return false;
      }
      const fscale = +scale;
      if ( `${fscale}` !== scale) {
        return false;
      }

      return [fscale, path.join(dir, file)];
    }).filter(v=>v);

    if (files.length <= 0) {
      return "throw new Error('Assets not found.');";
    }

    files.sort((a,b)=>a[0] - b[0]);
    const scales = files.map(v=>v[0]);

    const dimensions = imageSize(files[0][1]);
    const width = Math.round(dimensions.width / files[0][0]);
    const height = Math.round(dimensions.height / files[0][0]);

    return `
  module.exports = 
    global.AssetRegistry.registerAsset({
      "__packager_asset":true,
      "httpServerLocation": ${JSON.stringify(this.httpServerLocation)},
      "width": ${width},
      "height": ${height},
      "scales":${JSON.stringify(scales)},
      "name": ${JSON.stringify(path.basename(this.path, path.extname(this.path)))},
    "type":"png"});
  `;
  }
  size() {
    return this.source().length;
  }
}

module.exports = class AssetsResolver extends Tapable {
  apply(compiler) {
    compiler.resolvers.normal.plugin('file', function(request, callback) {
      if (/\.png$|\.jpg$|\.gif$/.test(request.request)) {
        const filePath = request.request;

        callback(null, {
          path: filePath,
          file: true,
        });
        return;
      }
      callback();
    });

    compiler.plugin('normal-module-factory', function (nmf) {
      nmf.plugin('factory', function(factory) {
        return (data, callback) => {
          if (/\.png$|\.jpg$|\.gif$/.test(data.request)) {
            var resolver = this.applyPluginsWaterfall("resolver", null);
            if(!resolver) return callback();
            resolver(data, function onDoneResolving(err, data) {
              if (err) return callback(err);
              callback(null, new AssetsModule(data));
            });
            return;
          }
          return factory(data, callback);
        }
      })
    });
  }
};
