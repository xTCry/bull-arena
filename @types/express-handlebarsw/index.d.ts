declare module 'express-handlebars' {
    export = exphbs;

    namespace exphbs {
        function create (config: Config): ExpressHandlebars;
        function exphbs (config: Config): ExpressHandlebars['engine'];
    }

    interface Config {
        handlebars?: typeof import("handlebars"),
        extname?: string,
        encoding?: string,
        layoutsDir?: string,
        partialsDir?: string,
        defaultLayout?: string,
        helpers?: any,
        compilerOptions?: any,
        runtimeOptions?: any,
    }

    class ExpressHandlebars{
        constructor(config: Config);
        engine: (path: string, options: object, callback: (e: any, rendered?: string) => void) => void | Promise<string>;
    }
}
