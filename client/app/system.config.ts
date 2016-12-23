(function (global) {

    global.SYSTEM_CONFIG = () => {

        const config: any = {
            baseURL: '/',
            map: {
                app: 'app',
                // angular bundles
                '@angular/core': 'node_modules/@angular/core/bundles/core.umd.js',
                '@angular/common': 'node_modules/@angular/common/bundles/common.umd.js',
                '@angular/compiler': 'node_modules/@angular/compiler/bundles/compiler.umd.js',
                '@angular/platform-browser': 'node_modules/@angular/platform-browser/bundles/platform-browser.umd.js',
                '@angular/platform-browser-dynamic': 'node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
                '@angular/http': 'node_modules/@angular/http/bundles/http.umd.js',
                '@angular/forms': 'node_modules/@angular/forms/bundles/forms.umd.js',
            },

            packages: {
                app: { main: 'main', defaultExtension: 'js' }
            }
        };

        // libraries
        [
            'rxjs',
        ].forEach(it => {
            config.map[it] = 'node_modules/' + it;
            config.packages[it] = { defaultExtension: 'js' };
        });

        return config;
    };

})(this);
